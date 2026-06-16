import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runQualityGate } from '@/lib/agents/quality-gate';
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
      include: {
        sceneAnalysis: true,
        renderJobs: {
          include: { evaluation: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
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

    // Get previous evaluation score if available
    const evaluationScore = project.renderJobs[0]?.evaluation?.overallScore;

    // Call the quality gate agent
    const qualityReport = await runQualityGate(sceneGraph, motionVariantData, evaluationScore);

    // Save the quality report
    await db.qualityReport.create({
      data: {
        projectId,
        textReadability: qualityReport.textReadability,
        layoutIntegrity: qualityReport.layoutIntegrity,
        brandingConsistency: qualityReport.brandingConsistency,
        motionSmoothness: qualityReport.motionSmoothness,
        timingQuality: qualityReport.timingQuality,
        professionalAppearance: qualityReport.professionalAppearance,
        overallScore: qualityReport.overallScore,
        passed: qualityReport.passed,
        issues: JSON.stringify(qualityReport.issues),
        details: JSON.stringify(qualityReport.details),
      },
    });

    // Update project status to complete if passed
    if (qualityReport.passed) {
      await db.project.update({
        where: { id: projectId },
        data: { status: 'complete' },
      });
    }

    return NextResponse.json({
      report: {
        textReadability: qualityReport.textReadability,
        layoutIntegrity: qualityReport.layoutIntegrity,
        brandingConsistency: qualityReport.brandingConsistency,
        motionSmoothness: qualityReport.motionSmoothness,
        timingQuality: qualityReport.timingQuality,
        professionalAppearance: qualityReport.professionalAppearance,
        overallScore: qualityReport.overallScore,
        passed: qualityReport.passed,
        issues: qualityReport.issues,
        details: qualityReport.details,
      },
    });
  } catch (error) {
    console.error('Quality gate error:', error);
    return NextResponse.json(
      { error: 'Failed to run quality gate' },
      { status: 500 }
    );
  }
}
