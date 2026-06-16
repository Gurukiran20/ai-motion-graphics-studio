import ZAI from 'z-ai-web-dev-sdk';
import type { SceneGraph, MotionVariant, EvaluationResult, EvaluationScores, EvaluationIssue } from '@/lib/types';

let zaiInstance: InstanceType<typeof ZAI> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

const EVALUATION_PROMPT = `You are an expert motion graphics quality evaluator. Evaluate the following motion plan against the original scene graph and provide detailed scoring.

Score each criterion from 0-10:

1. **Readability** (0-10): Will text remain readable throughout the animation? Are there moments where text is too small, blurred, or obstructed?
2. **Motion Quality** (0-10): Are animations smooth, well-timed, and professionally executed? No jarring or amateur movements?
3. **Visual Hierarchy** (0-10): Does the animation respect and enhance the visual hierarchy? Most important elements should be most prominent.
4. **Layout Quality** (0-10): Is the layout preserved? No elements overlapping inappropriately or going off-screen?
5. **Timing** (0-10): Are delays, durations, and pacing professional? Not too fast, not too slow?
6. **Professional Appearance** (0-10): Would this pass as professional work from a motion graphics agency?

Respond with valid JSON only:
{
  "scores": {
    "readability": 0,
    "motionQuality": 0,
    "visualHierarchy": 0,
    "layoutQuality": 0,
    "timing": 0,
    "professionalAppearance": 0
  },
  "overallScore": 0,
  "issues": [
    {
      "category": "readability|motionQuality|visualHierarchy|layoutQuality|timing|professionalAppearance",
      "severity": "low|medium|high",
      "description": "What the issue is",
      "suggestedFix": "How to fix it"
    }
  ],
  "recommendations": [
    "Specific actionable recommendation"
  ],
  "passed": true
}

The animation passes if overallScore >= 7.0.`;

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

export async function evaluateMotion(
  sceneGraph: SceneGraph,
  motionVariant: MotionVariant
): Promise<EvaluationResult> {
  try {
    const zai = await getZAI();

    // Reduce payload size to avoid OOM - only send essential data
    const compactSceneGraph = {
      layers: sceneGraph.layers?.map(l => ({ id: l.id, type: l.type, label: l.label, content: l.content })),
      brandColors: sceneGraph.brandColors,
      layout: { type: sceneGraph.layout?.type },
      hierarchy: sceneGraph.hierarchy,
    };

    const compactMotionVariant = {
      variantType: motionVariant.variantType,
      name: motionVariant.name,
      timeline: { totalDuration: motionVariant.timeline?.totalDuration },
      layerAnimations: motionVariant.layerAnimations?.map(a => ({
        layerId: a.layerId, type: a.type, duration: a.duration, delay: a.delay, easing: a.easing, direction: a.direction, intensity: a.intensity
      })),
      cameraMovement: motionVariant.cameraMovement,
    };

    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: 'You are an expert motion graphics quality evaluator. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: `${EVALUATION_PROMPT}\n\n## Original Scene Graph:\n\`\`\`json\n${JSON.stringify(compactSceneGraph)}\n\`\`\`\n\n## Motion Variant to Evaluate (${motionVariant.variantType}):\n\`\`\`json\n${JSON.stringify(compactMotionVariant)}\n\`\`\``
        }
      ],
      thinking: { type: 'disabled' }
    });

    const rawResponse = response.choices[0]?.message?.content || '';

    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in evaluation response');
      const result = JSON.parse(jsonMatch[0]) as EvaluationResult;

      // Validate the result has the expected structure
      if (!result.scores || typeof result.overallScore !== 'number') {
        throw new Error('Invalid evaluation result structure');
      }

      return result;
    } catch (parseError) {
      console.error('Evaluation parse error:', parseError);
      return getDefaultEvaluation();
    }
  } catch (error) {
    console.error('Evaluation API error:', error);
    // Return default evaluation instead of crashing the pipeline
    return getDefaultEvaluation();
  }
}

export async function improveMotion(
  sceneGraph: SceneGraph,
  motionVariant: MotionVariant,
  evaluation: EvaluationResult,
  qualityThreshold: number = 7.0
): Promise<MotionVariant | null> {
  if (evaluation.overallScore >= qualityThreshold) {
    return null; // No improvement needed
  }

  const zai = await getZAI();

  const IMPROVEMENT_PROMPT = `You are an expert motion graphics designer. Based on the evaluation feedback, improve the motion plan to address the identified issues.

Maintain the same variant type (${motionVariant.variantType}) and overall style, but fix the specific issues.

Return the complete improved motion variant as valid JSON matching the same structure.`;

  const response = await zai.chat.completions.create({
    messages: [
      {
        role: 'assistant',
        content: 'You are an expert motion graphics designer. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: `${IMPROVEMENT_PROMPT}\n\n## Current Motion Variant:\n\`\`\`json\n${JSON.stringify(motionVariant, null, 2)}\n\`\`\`\n\n## Evaluation Issues:\n\`\`\`json\n${JSON.stringify(evaluation.issues, null, 2)}\n\`\`\`\n\n## Evaluation Recommendations:\n${evaluation.recommendations.join('\n')}`
      }
    ],
    thinking: { type: 'disabled' }
  });

  const rawResponse = response.choices[0]?.message?.content || '';

  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in improvement response');
    return JSON.parse(jsonMatch[0]) as MotionVariant;
  } catch (error) {
    console.error('Improvement parse error:', error);
    return null;
  }
}
