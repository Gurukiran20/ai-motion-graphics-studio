import ZAI from 'z-ai-web-dev-sdk';
import type { SceneGraph, MotionVariant, VoiceEditCommand, FeedbackIntent } from '@/lib/types';

let zaiInstance: InstanceType<typeof ZAI> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function transcribeAudio(base64Audio: string): Promise<string> {
  try {
    const zai = await getZAI();

    const response = await zai.audio.asr.create({
      file_base64: base64Audio,
    });

    return response.text || '';
  } catch (error) {
    console.error('Audio transcription error:', error);
    return '';
  }
}

export async function processVoiceEdit(
  base64Audio: string,
  sceneGraph: SceneGraph,
  currentVariant: MotionVariant
): Promise<VoiceEditCommand> {
  try {
    // Step 1: Transcribe the audio
    const transcription = await transcribeAudio(base64Audio);

    if (!transcription || transcription.trim().length === 0) {
      return {
        transcription: '',
        intent: {
          original: '',
          interpreted: 'No speech detected',
          targetLayers: [],
          action: 'adjust_animation',
          parameters: {},
        },
        sceneGraphUpdate: null,
        motionPlanUpdate: null,
      };
    }

    // Step 2: Extract intent and create updates using LLM
    const zai = await getZAI();

    // Reduce payload size
    const compactSceneGraph = {
      layers: sceneGraph.layers?.map(l => ({ id: l.id, type: l.type, label: l.label, content: l.content, position: l.position })),
      brandColors: sceneGraph.brandColors,
    };

    const compactVariant = {
      variantType: currentVariant.variantType,
      timeline: { totalDuration: currentVariant.timeline?.totalDuration },
      layerAnimations: currentVariant.layerAnimations?.map(a => ({
        layerId: a.layerId, type: a.type, duration: a.duration, delay: a.delay, easing: a.easing
      })),
    };

    const VOICE_EDIT_PROMPT = `You are an expert motion graphics designer. The user has spoken a voice command to edit their motion graphics. 

Transcription: "${transcription}"

Interpret the voice command and determine what changes the user wants. Then generate the updated scene graph and motion plan.

Respond with valid JSON only:
{
  "intent": {
    "original": "${transcription}",
    "interpreted": "clear interpretation",
    "targetLayers": ["layer_ids"],
    "action": "move|resize|restyle|retiming|replace|add|remove|adjust_animation|change_style",
    "parameters": { }
  },
  "sceneGraphUpdate": { ... } or null,
  "motionPlanUpdate": { ... } or null
}`;

    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: 'You are an expert motion graphics designer who processes voice commands. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: `${VOICE_EDIT_PROMPT}\n\n## Current Scene Graph:\n\`\`\`json\n${JSON.stringify(compactSceneGraph)}\n\`\`\`\n\n## Current Motion Variant (${currentVariant.variantType}):\n\`\`\`json\n${JSON.stringify(compactVariant)}\n\`\`\``
        }
      ],
      thinking: { type: 'disabled' }
    });

    const rawResponse = response.choices[0]?.message?.content || '';

    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in voice edit response');
      const result = JSON.parse(jsonMatch[0]);
      return {
        transcription,
        intent: result.intent as FeedbackIntent,
        sceneGraphUpdate: result.sceneGraphUpdate,
        motionPlanUpdate: result.motionPlanUpdate,
      };
    } catch (parseError) {
      console.error('Voice edit parse error:', parseError);
      return {
        transcription,
        intent: {
          original: transcription,
          interpreted: transcription,
          targetLayers: [],
          action: 'adjust_animation',
          parameters: {},
        },
        sceneGraphUpdate: null,
        motionPlanUpdate: null,
      };
    }
  } catch (error) {
    console.error('Voice edit API error:', error);
    return {
      transcription: '',
      intent: {
        original: '',
        interpreted: 'Voice editing failed',
        targetLayers: [],
        action: 'adjust_animation',
        parameters: {},
      },
      sceneGraphUpdate: null,
      motionPlanUpdate: null,
    };
  }
}
