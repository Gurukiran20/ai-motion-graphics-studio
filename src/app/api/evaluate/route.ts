import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { evaluateMotion } from '@/lib/agents/evaluation';
import type { SceneGraph, MotionVariant as MotionVariantType } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, variantType } = body;

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
    const typeToFind = variantType || 'professional';
    const motionVariant = await db.motionVariant.findFirst({
      where: { projectId, variantType: typeToFind },
    });

    if (!motionVariant) {
      return NextResponse.json(
        { error: 'Motion variant not found' },
        { status: 404 }
      );
    }

    // Find the latest render job for this variant
    const renderJob = await db.renderJob.findFirst({
      where: { projectId, variantId: motionVariant.id },
      orderBy: { createdAt: 'desc' },
    });

    // Update project status to evaluating
    await db.project.update({
      where: { id: projectId },
      data: { status: 'evaluating' },
    });

    // Parse the scene graph and motion variant
    const sceneGraph: SceneGraph = JSON.parse(project.sceneAnalysis.sceneGraph);
    const motionVariantData: MotionVariantType = JSON.parse(motionVariant.motionPlan);

    // Call the evaluation agent
    const evaluationResult = await evaluateMotion(sceneGraph, motionVariantData);

    // Save the evaluation (linked to render job if exists)
    const evaluationData: {
      scores: string;
      issues: string;
      recommendations: string;
      overallScore: number;
      passed: boolean;
      renderJobId: string;
    } = {
      scores: JSON.stringify(evaluationResult.scores),
      issues: JSON.stringify(evaluationResult.issues),
      recommendations: JSON.stringify(evaluationResult.recommendations),
      overallScore: evaluationResult.overallScore,
      passed: evaluationResult.passed,
      renderJobId: renderJob?.id || '',
    };

    let evaluation;
    if (renderJob) {
      evaluation = await db.evaluation.create({
        data: evaluationData,
      });
    } else {
      // Create a temporary render job first
      const tempRenderJob = await db.renderJob.create({
        data: {
          projectId,
          variantId: motionVariant.id,
          status: 'completed',
          renderProgress: 100,
          animationConfig: '{}',
        },
      });
      evaluation = await db.evaluation.create({
        data: {
          ...evaluationData,
          renderJobId: tempRenderJob.id,
        },
      });
    }

    // Update project status to evaluated
    await db.project.update({
      where: { id: projectId },
      data: { status: 'evaluated' },
    });

    return NextResponse.json({
      evaluation: {
        id: evaluation.id,
        scores: evaluationResult.scores,
        overallScore: evaluationResult.overallScore,
        issues: evaluationResult.issues,
        recommendations: evaluationResult.recommendations,
        passed: evaluationResult.passed,
      },
    });
  } catch (error) {
    console.error('Evaluate error:', error);

    return NextResponse.json(
      { error: 'Failed to evaluate motion' },
      { status: 500 }
    );
  }
}
