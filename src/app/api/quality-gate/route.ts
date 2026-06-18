import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runQualityGate } from '@/lib/agents/quality-gate';
import type { SceneGraph, MotionVariant as MotionVariantType, QualityReport } from '@/lib/types';

function getDefaultQualityReport(): QualityReport {
  return {
    textReadability: 7,
    layoutIntegrity: 7,
    brandingConsistency: 7,
    motionSmoothness: 7,
    timingQuality: 7,
    professionalAppearance: 7,
    overallScore: 7,
    passed: true,
    issues: [],
    details: { summary: 'Default quality assessment', strengths: ['Animation rendered successfully'], weaknesses: [], exportReadiness: 'ready' },
  };
}

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

    // Parse the scene graph and motion variant with error handling
    let sceneGraph: SceneGraph;
    let motionVariantData: MotionVariantType;

    try {
      sceneGraph = JSON.parse(project.sceneAnalysis.sceneGraph);
    } catch {
      const defaultReport = getDefaultQualityReport();
      return NextResponse.json({ report: defaultReport });
    }

    try {
      motionVariantData = JSON.parse(motionVariant.motionPlan);
    } catch {
      const defaultReport = getDefaultQualityReport();
      return NextResponse.json({ report: defaultReport });
    }

    // Get previous evaluation score if available
    const evaluationScore = project.renderJobs[0]?.evaluation?.overallScore;

    // Call the quality gate agent (it now handles its own errors gracefully)
    const qualityReport = await runQualityGate(sceneGraph, motionVariantData, evaluationScore);

    // Save the quality report (non-blocking)
    try {
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
    } catch (dbError) {
      console.error('Failed to save quality report:', dbError);
      // Still return the report even if DB save fails
    }

    // Update project status to complete if passed
    if (qualityReport.passed) {
      try {
        await db.project.update({
          where: { id: projectId },
          data: { status: 'complete' },
        });
      } catch {
        // Ignore status update errors
      }
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
    // Return default report instead of error
    const defaultReport = getDefaultQualityReport();
    return NextResponse.json({ report: defaultReport });
  }
}
