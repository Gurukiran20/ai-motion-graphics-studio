import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processVoiceEdit } from '@/lib/agents/voice-editing';
import type { SceneGraph, MotionVariant as MotionVariantType } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const projectId = formData.get('projectId') as string | null;
    const variantType = (formData.get('variantType') as string) || 'professional';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

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

    // Convert audio to base64
    const audioBytes = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(audioBytes);
    const base64Audio = audioBuffer.toString('base64');

    // Parse the scene graph and motion variant
    const sceneGraph: SceneGraph = JSON.parse(project.sceneAnalysis.sceneGraph);
    const motionVariantData: MotionVariantType = JSON.parse(motionVariant.motionPlan);

    // Call the voice editing agent
    const voiceEditResult = await processVoiceEdit(base64Audio, sceneGraph, motionVariantData);

    // Save a feedback entry for the voice edit
    await db.feedbackEntry.create({
      data: {
        projectId,
        feedback: `[Voice] ${voiceEditResult.transcription}`,
        interpretedIntent: voiceEditResult.intent.interpreted,
        sceneGraphUpdate: voiceEditResult.sceneGraphUpdate
          ? JSON.stringify(voiceEditResult.sceneGraphUpdate)
          : null,
        motionPlanUpdate: voiceEditResult.motionPlanUpdate
          ? JSON.stringify(voiceEditResult.motionPlanUpdate)
          : null,
        applied: !!(voiceEditResult.sceneGraphUpdate || voiceEditResult.motionPlanUpdate),
      },
    });

    return NextResponse.json({
      updatedSceneGraph: voiceEditResult.sceneGraphUpdate ? { ...sceneGraph, ...voiceEditResult.sceneGraphUpdate } : null,
      updatedMotionVariant: voiceEditResult.motionPlanUpdate ? { ...motionVariantData, ...voiceEditResult.motionPlanUpdate } : null,
      transcription: voiceEditResult.transcription,
    });
  } catch (error) {
    console.error('Voice edit error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice edit' },
      { status: 500 }
    );
  }
}
