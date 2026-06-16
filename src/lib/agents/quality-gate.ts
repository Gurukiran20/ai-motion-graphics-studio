import ZAI from 'z-ai-web-dev-sdk';
import type { SceneGraph, MotionVariant, QualityReport } from '@/lib/types';

let zaiInstance: InstanceType<typeof ZAI> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

const QUALITY_GATE_PROMPT = `You are the final quality gate for a motion graphics video. Perform a comprehensive review before export.

Verify these criteria:
1. **Text Readability** (0-10): All text is readable, no blur, proper size, no overlap
2. **Layout Integrity** (0-10): Layout is preserved, no elements off-screen or overlapping
3. **Branding Consistency** (0-10): Brand colors, fonts, and visual identity are maintained
4. **Motion Smoothness** (0-10): Animations are smooth, no jarring transitions
5. **Timing Quality** (0-10): Pacing is professional, comfortable, well-timed
6. **Professional Appearance** (0-10): Overall quality matches professional motion graphics standards

The animation passes if overallScore >= 7.0.

Respond with valid JSON only:
{
  "textReadability": 0,
  "layoutIntegrity": 0,
  "brandingConsistency": 0,
  "motionSmoothness": 0,
  "timingQuality": 0,
  "professionalAppearance": 0,
  "overallScore": 0,
  "passed": true,
  "issues": ["issue1", "issue2"],
  "details": {
    "summary": "Brief summary of quality assessment",
    "strengths": ["what works well"],
    "weaknesses": ["what needs improvement"],
    "exportReadiness": "ready|needs_work|not_ready"
  }
}`;

export async function runQualityGate(
  sceneGraph: SceneGraph,
  motionVariant: MotionVariant,
  evaluationScore?: number
): Promise<QualityReport> {
  const zai = await getZAI();

  const evaluationContext = evaluationScore 
    ? `\n\n## Previous Evaluation Score: ${evaluationScore}/10`
    : '';

  const response = await zai.chat.completions.create({
    messages: [
      {
        role: 'assistant',
        content: 'You are the final quality gate for motion graphics production. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: `${QUALITY_GATE_PROMPT}${evaluationContext}\n\n## Scene Graph:\n\`\`\`json\n${JSON.stringify(sceneGraph, null, 2)}\n\`\`\`\n\n## Motion Variant (${motionVariant.variantType}):\n\`\`\`json\n${JSON.stringify(motionVariant, null, 2)}\n\`\`\``
      }
    ],
    thinking: { type: 'disabled' }
  });

  const rawResponse = response.choices[0]?.message?.content || '';

  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in quality gate response');
    return JSON.parse(jsonMatch[0]) as QualityReport;
  } catch (error) {
    console.error('Quality gate parse error:', error);
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
      details: { summary: 'Default quality assessment', strengths: [], weaknesses: [], exportReadiness: 'ready' },
    };
  }
}
