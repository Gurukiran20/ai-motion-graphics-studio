import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get a single project with all related data
      const project = await db.project.findUnique({
        where: { id },
        include: {
          sceneAnalysis: true,
          motionVariants: {
            include: {
              renderJobs: {
                include: {
                  evaluation: true,
                },
              },
            },
          },
          feedbackEntries: {
            orderBy: { createdAt: 'desc' },
          },
          qualityReports: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      // Parse JSON fields for the response
      const parsedProject = {
        ...project,
        sceneAnalysis: project.sceneAnalysis
          ? {
              ...project.sceneAnalysis,
              layers: JSON.parse(project.sceneAnalysis.layers),
              hierarchy: JSON.parse(project.sceneAnalysis.hierarchy),
              sceneGraph: JSON.parse(project.sceneAnalysis.sceneGraph),
              brandColors: JSON.parse(project.sceneAnalysis.brandColors),
              typography: JSON.parse(project.sceneAnalysis.typography),
              layout: JSON.parse(project.sceneAnalysis.layout),
              logo: project.sceneAnalysis.logo ? JSON.parse(project.sceneAnalysis.logo) : null,
            }
          : null,
        motionVariants: project.motionVariants.map((variant) => ({
          ...variant,
          timeline: JSON.parse(variant.timeline),
          animations: JSON.parse(variant.animations),
          cameraMovement: JSON.parse(variant.cameraMovement),
          transitions: JSON.parse(variant.transitions),
          motionPlan: JSON.parse(variant.motionPlan),
          renderJobs: variant.renderJobs.map((job) => ({
            ...job,
            animationConfig: JSON.parse(job.animationConfig),
            evaluation: job.evaluation
              ? {
                  ...job.evaluation,
                  scores: JSON.parse(job.evaluation.scores),
                  issues: JSON.parse(job.evaluation.issues),
                  recommendations: JSON.parse(job.evaluation.recommendations),
                }
              : null,
          })),
        })),
        feedbackEntries: project.feedbackEntries.map((entry) => ({
          ...entry,
          sceneGraphUpdate: entry.sceneGraphUpdate ? JSON.parse(entry.sceneGraphUpdate) : null,
          motionPlanUpdate: entry.motionPlanUpdate ? JSON.parse(entry.motionPlanUpdate) : null,
        })),
        qualityReports: project.qualityReports.map((report) => ({
          ...report,
          issues: JSON.parse(report.issues),
          details: JSON.parse(report.details),
        })),
      };

      return NextResponse.json({ project: parsedProject });
    }

    // List all projects with their status
    const projects = await db.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        sceneAnalysis: { select: { id: true } },
        motionVariants: { select: { id: true, variantType: true } },
        _count: {
          select: {
            renderJobs: true,
            feedbackEntries: true,
            qualityReports: true,
          },
        },
      },
    });

    return NextResponse.json({
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        hasAnalysis: !!p.sceneAnalysis,
        variantCount: p.motionVariants.length,
        variantTypes: p.motionVariants.map((v) => v.variantType),
        renderJobCount: p._count.renderJobs,
        feedbackCount: p._count.feedbackEntries,
        qualityReportCount: p._count.qualityReports,
      })),
    });
  } catch (error) {
    console.error('Projects API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
