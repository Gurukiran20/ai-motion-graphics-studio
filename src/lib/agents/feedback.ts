import ZAI from 'z-ai-web-dev-sdk';
import type { SceneGraph, MotionVariant, FeedbackIntent, FeedbackResult } from '@/lib/types';

let zaiInstance: InstanceType<typeof ZAI> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

const FEEDBACK_INTERPRETATION_PROMPT = `You are an expert motion graphics designer who interprets user feedback into structured edit commands.

Given the user's natural language feedback and the current scene graph / motion plan, interpret what the user wants and produce structured updates.

The feedback intent should identify:
- Which layers are affected
- What action to take
- What parameters to change

Available actions:
- move: Change position (x, y)
- resize: Change dimensions (width, height)
- restyle: Change visual style (color, fontSize, fontWeight)
- retiming: Change animation timing (duration, delay)
- replace: Replace content
- add: Add a new element
- remove: Remove an element
- adjust_animation: Change animation type or parameters
- change_style: Change overall style variant

Respond with valid JSON only:
{
  "interpretedIntent": {
    "original": "the original feedback",
    "interpreted": "clear interpretation of what the user wants",
    "targetLayers": ["layer_id_1", "layer_id_2"],
    "action": "move|resize|restyle|retiming|replace|add|remove|adjust_animation|change_style",
    "parameters": {
      // Action-specific parameters
    }
  },
  "sceneGraphUpdate": { ... } or null,
  "motionPlanUpdate": { ... } or null,
  "applied": true
}`;

export async function interpretFeedback(
  feedback: string,
  sceneGraph: SceneGraph,
  currentVariant: MotionVariant
): Promise<FeedbackResult> {
  const zai = await getZAI();

  const response = await zai.chat.completions.create({
    messages: [
      {
        role: 'assistant',
        content: 'You are an expert motion graphics designer who interprets feedback into structured JSON edits. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: `${FEEDBACK_INTERPRETATION_PROMPT}\n\n## User Feedback:\n"${feedback}"\n\n## Current Scene Graph:\n\`\`\`json\n${JSON.stringify(sceneGraph, null, 2)}\n\`\`\`\n\n## Current Motion Variant (${currentVariant.variantType}):\n\`\`\`json\n${JSON.stringify(currentVariant, null, 2)}\n\`\`\``
      }
    ],
    thinking: { type: 'disabled' }
  });

  const rawResponse = response.choices[0]?.message?.content || '';

  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in feedback response');
    const result = JSON.parse(jsonMatch[0]) as FeedbackResult;
    result.feedback = feedback;
    return result;
  } catch (error) {
    console.error('Feedback interpretation error:', error);
    return {
      feedback,
      interpretedIntent: {
        original: feedback,
        interpreted: feedback,
        targetLayers: [],
        action: 'adjust_animation',
        parameters: {},
      },
      sceneGraphUpdate: null,
      motionPlanUpdate: null,
      applied: false,
    };
  }
}

export async function applyFeedback(
  sceneGraph: SceneGraph,
  motionVariant: MotionVariant,
  feedbackResult: FeedbackResult
): Promise<{ updatedSceneGraph: SceneGraph; updatedMotionVariant: MotionVariant }> {
  const zai = await getZAI();

  const APPLY_PROMPT = `You are an expert motion graphics designer. Apply the following feedback edits to the scene graph and motion plan.

Return the COMPLETE updated scene graph and motion variant as valid JSON:
{
  "updatedSceneGraph": { ... complete scene graph ... },
  "updatedMotionVariant": { ... complete motion variant ... }
}`;

  const response = await zai.chat.completions.create({
    messages: [
      {
        role: 'assistant',
        content: 'You are an expert motion graphics designer. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: `${APPLY_PROMPT}\n\n## Scene Graph:\n\`\`\`json\n${JSON.stringify(sceneGraph, null, 2)}\n\`\`\`\n\n## Motion Variant:\n\`\`\`json\n${JSON.stringify(motionVariant, null, 2)}\n\`\`\`\n\n## Feedback to Apply:\n\`\`\`json\n${JSON.stringify(feedbackResult, null, 2)}\n\`\`\``
      }
    ],
    thinking: { type: 'disabled' }
  });

  const rawResponse = response.choices[0]?.message?.content || '';

  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in apply feedback response');
    const result = JSON.parse(jsonMatch[0]);
    return {
      updatedSceneGraph: result.updatedSceneGraph || sceneGraph,
      updatedMotionVariant: result.updatedMotionVariant || motionVariant,
    };
  } catch (error) {
    console.error('Apply feedback error:', error);
    return {
      updatedSceneGraph: sceneGraph,
      updatedMotionVariant: motionVariant,
    };
  }
}
