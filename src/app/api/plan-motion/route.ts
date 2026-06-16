import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { planMotion } from '@/lib/agents/motion-planning';
import type { SceneGraph } from '@/lib/types';

export async function POST(request: NextRequest) {
  let projectId: string | undefined;
  try {
    const body = await request.json();
    projectId = body.projectId;

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
        { error: 'Scene analysis not found. Run analysis first.' },
        { status: 400 }
      );
    }

    // Update status to planning
    await db.project.update({
      where: { id: projectId },
      data: { status: 'planning' },
    });

    // Parse the scene graph
    const sceneGraph: SceneGraph = JSON.parse(project.sceneAnalysis.sceneGraph);

    // Call the motion planning agent
    const motionPlan = await planMotion(sceneGraph);

    // Save both variants to the database
    const savedVariants = await Promise.all(
      motionPlan.variants.map((variant) =>
        db.motionVariant.create({
          data: {
            projectId: projectId!,
            variantType: variant.variantType,
            timeline: JSON.stringify(variant.timeline),
            animations: JSON.stringify(variant.layerAnimations),
            cameraMovement: JSON.stringify(variant.cameraMovement),
            transitions: JSON.stringify(variant.transitions),
            rationale: variant.rationale,
            motionPlan: JSON.stringify(variant),
          },
        })
      )
    );

    // Update project status to planned
    await db.project.update({
      where: { id: projectId },
      data: { status: 'planned' },
    });

    return NextResponse.json({
      variants: savedVariants.map((sv, i) => ({
        id: sv.id,
        variantType: sv.variantType,
        motionPlan: motionPlan.variants[i],
      })),
    });
  } catch (error) {
    console.error('Plan motion error:', error);

    // Try to update status back on failure
    try {
      if (projectId) {
        await db.project.update({
          where: { id: projectId },
          data: { status: 'analyzed' },
        });
      }
    } catch {}

    return NextResponse.json(
      { error: 'Failed to plan motion' },
      { status: 500 }
    );
  }
}
