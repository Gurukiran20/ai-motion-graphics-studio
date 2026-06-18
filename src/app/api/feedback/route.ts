import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { interpretFeedback, applyFeedback } from '@/lib/agents/feedback';
import type { SceneGraph, MotionVariant as MotionVariantType } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, feedback, variantType } = body;

    if (!projectId || !feedback) {
      return NextResponse.json(
        { error: 'projectId and feedback are required' },
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
        { error: 'Scene analysis not found. Run analysis first.' },
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

    // Parse the scene graph and motion variant
    const sceneGraph: SceneGraph = JSON.parse(project.sceneAnalysis.sceneGraph);
    const motionVariantData: MotionVariantType = JSON.parse(motionVariant.motionPlan);

    // Step 1: Interpret the feedback
    const feedbackResult = await interpretFeedback(feedback, sceneGraph, motionVariantData);

    // Step 2: Apply the feedback
    const { updatedSceneGraph, updatedMotionVariant } = await applyFeedback(
      sceneGraph,
      motionVariantData,
      feedbackResult
    );

    // Step 3: Save the feedback entry
    await db.feedbackEntry.create({
      data: {
        projectId,
        feedback,
        interpretedIntent: feedbackResult.interpretedIntent.interpreted,
        sceneGraphUpdate: feedbackResult.sceneGraphUpdate
          ? JSON.stringify(feedbackResult.sceneGraphUpdate)
          : null,
        motionPlanUpdate: feedbackResult.motionPlanUpdate
          ? JSON.stringify(feedbackResult.motionPlanUpdate)
          : null,
        applied: feedbackResult.applied,
      },
    });

    // Step 4: Update the scene analysis with the updated scene graph
    await db.sceneAnalysis.update({
      where: { projectId },
      data: {
        sceneGraph: JSON.stringify(updatedSceneGraph),
        layers: JSON.stringify(updatedSceneGraph.layers),
        hierarchy: JSON.stringify(updatedSceneGraph.hierarchy),
        brandColors: JSON.stringify(updatedSceneGraph.brandColors),
        typography: JSON.stringify(updatedSceneGraph.typography),
        layout: JSON.stringify(updatedSceneGraph.layout),
        headline: updatedSceneGraph.headline?.text || null,
        subheadline: updatedSceneGraph.subheadline?.text || null,
        cta: updatedSceneGraph.cta?.text || null,
      },
    });

    // Step 5: Update the motion variant with the updated motion plan
    await db.motionVariant.update({
      where: { id: motionVariant.id },
      data: {
        motionPlan: JSON.stringify(updatedMotionVariant),
        timeline: JSON.stringify(updatedMotionVariant.timeline),
        animations: JSON.stringify(updatedMotionVariant.layerAnimations),
        cameraMovement: JSON.stringify(updatedMotionVariant.cameraMovement),
        transitions: JSON.stringify(updatedMotionVariant.transitions),
        rationale: updatedMotionVariant.rationale,
      },
    });

    return NextResponse.json({
      feedbackEntry: {
        interpretedIntent: feedbackResult.interpretedIntent,
        applied: feedbackResult.applied,
      },
      updatedSceneGraph,
      updatedMotionVariant,
    });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}
