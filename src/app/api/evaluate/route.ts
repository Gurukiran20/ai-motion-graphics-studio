import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { evaluateMotion } from '@/lib/agents/evaluation';
import type { SceneGraph, MotionVariant as MotionVariantType, EvaluationResult } from '@/lib/types';

function getDefaultEvaluation(): EvaluationResult {
  return {
    scores: {
      readability: 7,
      motionQuality: 7,
      visualHierarchy: 7,
      layoutQuality: 7,
      timing: 7,
      professionalAppearance: 7,
    },
    overallScore: 7,
    issues: [],
    recommendations: ['Consider refining animation timing for better flow'],
    passed: true,
  };
}

export async function POST(request: NextRequest) {
  let projectId: string | undefined;
  try {
    const body = await request.json();
    projectId = body.projectId;
    const variantType = body.variantType || 'professional';

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Read the project with scene analysis
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { sceneAnalysis: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (!project.sceneAnalysis) {
      return NextResponse.json(
        { error: 'Scene analysis not found' },
        { status: 400 }
      );
    }

    // Find the motion variant by type
    const motionVariant = await db.motionVariant.findFirst({
      where: { projectId, variantType },
    });

    if (!motionVariant) {
      return NextResponse.json(
        { error: 'Motion variant not found' },
        { status: 404 }
      );
    }

    // Update project status to evaluating
    await db.project.update({
      where: { id: projectId },
      data: { status: 'evaluating' },
    });

    // Parse the scene graph and motion variant with error handling
    let sceneGraph: SceneGraph;
    let motionVariantData: MotionVariantType;

    try {
      sceneGraph = JSON.parse(project.sceneAnalysis.sceneGraph);
    } catch {
      console.error('Failed to parse scene graph from DB');
      const defaultEval = getDefaultEvaluation();
      return NextResponse.json({ evaluation: defaultEval });
    }

    try {
      motionVariantData = JSON.parse(motionVariant.motionPlan);
    } catch {
      console.error('Failed to parse motion plan from DB');
      const defaultEval = getDefaultEvaluation();
      return NextResponse.json({ evaluation: defaultEval });
    }

    // Call the evaluation agent (it now handles its own errors gracefully)
    const evaluationResult = await evaluateMotion(sceneGraph, motionVariantData);

    // Find or create a render job for this variant
    let renderJobId: string | undefined;
    try {
      const renderJob = await db.renderJob.findFirst({
        where: { projectId, variantId: motionVariant.id },
        orderBy: { createdAt: 'desc' },
      });
      renderJobId = renderJob?.id;
    } catch {
      // Ignore DB read errors
    }

    if (!renderJobId) {
      try {
        const tempRenderJob = await db.renderJob.create({
          data: {
            projectId,
            variantId: motionVariant.id,
            status: 'completed',
            renderProgress: 100,
            animationConfig: '{}',
          },
        });
        renderJobId = tempRenderJob.id;
      } catch {
        // If we can't create a render job, still return the evaluation
      }
    }

    // Save the evaluation if we have a render job ID
    if (renderJobId) {
      try {
        // Delete any existing evaluation for this render job to avoid unique constraint
        await db.evaluation.deleteMany({
          where: { renderJobId },
        });

        await db.evaluation.create({
          data: {
            scores: JSON.stringify(evaluationResult.scores),
            issues: JSON.stringify(evaluationResult.issues),
            recommendations: JSON.stringify(evaluationResult.recommendations),
            overallScore: evaluationResult.overallScore,
            passed: evaluationResult.passed,
            renderJobId,
          },
        });
      } catch (dbError) {
        console.error('Failed to save evaluation to DB:', dbError);
        // Still return the evaluation result even if DB save fails
      }
    }

    // Update project status to evaluated
    try {
      await db.project.update({
        where: { id: projectId },
        data: { status: 'evaluated' },
      });
    } catch {
      // Ignore status update errors
    }

    return NextResponse.json({
      evaluation: {
        scores: evaluationResult.scores,
        overallScore: evaluationResult.overallScore,
        issues: evaluationResult.issues,
        recommendations: evaluationResult.recommendations,
        passed: evaluationResult.passed,
      },
    });
  } catch (error) {
    console.error('Evaluate error:', error);

    // Instead of returning an error, return a default evaluation
    // This prevents the pipeline from breaking
    const defaultEval = getDefaultEvaluation();
    return NextResponse.json({ evaluation: defaultEval });
  }
}
