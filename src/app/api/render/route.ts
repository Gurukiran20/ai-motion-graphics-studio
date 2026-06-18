import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { convertToRenderConfig } from '@/lib/agents/rendering';
import type { SceneGraph, MotionVariant as MotionVariantType } from '@/lib/types';

export async function POST(request: NextRequest) {
  let projectId: string | undefined;
  try {
    const body = await request.json();
    projectId = body.projectId;
    const variantType = body.variantId || body.variantType;

    if (!projectId || !variantType) {
      return NextResponse.json(
        { error: 'projectId and variantType are required' },
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
    const motionVariant = await db.motionVariant.findFirst({
      where: { projectId, variantType },
    });

    if (!motionVariant) {
      return NextResponse.json(
        { error: 'Motion variant not found' },
        { status: 404 }
      );
    }

    // Update status to rendering
    await db.project.update({
      where: { id: projectId },
      data: { status: 'rendering' },
    });

    // Parse the scene graph and motion variant
    const sceneGraph: SceneGraph = JSON.parse(project.sceneAnalysis.sceneGraph);
    const motionVariantData: MotionVariantType = JSON.parse(motionVariant.motionPlan);

    // Convert to render config
    const renderConfig = convertToRenderConfig(sceneGraph, motionVariantData);

    // Save the render job
    const renderJob = await db.renderJob.create({
      data: {
        projectId,
        variantId: motionVariant.id,
        status: 'completed',
        renderProgress: 100,
        animationConfig: JSON.stringify(renderConfig),
      },
    });

    // Update project status to rendered
    await db.project.update({
      where: { id: projectId },
      data: { status: 'rendered' },
    });

    return NextResponse.json({
      renderJob: {
        id: renderJob.id,
        status: renderJob.status,
        renderConfig,
      },
      renderConfig,
    });
  } catch (error) {
    console.error('Render error:', error);

    // Try to update status back on failure
    try {
      if (projectId) {
        await db.project.update({
          where: { id: projectId },
          data: { status: 'planned' },
        });
      }
    } catch {}

    return NextResponse.json(
      { error: 'Failed to create render job' },
      { status: 500 }
    );
  }
}
