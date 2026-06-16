import ZAI from 'z-ai-web-dev-sdk';
import type { SceneGraph, MotionPlan, MotionVariant, LayerAnimation, CameraMovement, Transition, Timeline, TimelineEvent } from '@/lib/types';

let zaiInstance: InstanceType<typeof ZAI> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

const MOTION_PLANNING_PROMPT = `You are an expert motion graphics designer specializing in creating animation plans from static designs. Given a scene graph analysis, create two distinct motion plan variants.

## Variant A: Professional / Corporate / Premium
- Smooth, elegant transitions
- Subtle camera movements
- Refined timing with comfortable pacing
- Sophisticated easing curves (easeInOut, gentle spring)
- Colors shift subtly
- Text reveals with class (fade + slight slide, clip reveal)
- Professional duration: 5-8 seconds

## Variant B: Energetic / Social-first / High Engagement
- Dynamic, punchy animations
- Bold camera movements (zoom, quick pans)
- Fast timing with rhythmic pacing
- Sharp easing curves (anticipate, backOut, spring with high stiffness)
- Vibrant color transitions
- Text reveals with energy (bounce, scale from 0, typewriter)
- Shorter duration: 3-5 seconds

For each layer, create an animation that:
1. Preserves readability - text must be readable when it appears
2. Preserves visual hierarchy - more important elements animate first or more prominently
3. Preserves branding - don't distort logos or brand elements
4. Guides user attention intentionally
5. Avoids distracting animations

Respond with a valid JSON object:
{
  "variants": [
    {
      "variantType": "professional",
      "name": "Premium Corporate",
      "description": "Elegant, smooth animation with refined timing",
      "timeline": {
        "totalDuration": 6,
        "fps": 30,
        "events": [
          {
            "time": 0,
            "type": "layerAnimation",
            "layerId": "layer_id",
            "animation": {
              "layerId": "layer_id",
              "type": "fadeIn",
              "property": "opacity",
              "keyframes": [
                { "time": 0, "value": 0, "easing": "easeInOut" },
                { "time": 1, "value": 1 }
              ],
              "duration": 0.8,
              "delay": 0,
              "easing": "easeInOut",
              "intensity": 0.7
            }
          }
        ]
      },
      "layerAnimations": [
        {
          "layerId": "layer_id",
          "type": "fadeIn",
          "property": "opacity",
          "keyframes": [{ "time": 0, "value": 0 }, { "time": 1, "value": 1 }],
          "duration": 0.8,
          "delay": 0.2,
          "easing": "easeInOut",
          "intensity": 0.7
        }
      ],
      "cameraMovement": [
        {
          "type": "zoom",
          "startPoint": { "x": 0, "y": 0, "scale": 1 },
          "endPoint": { "x": 0, "y": 0, "scale": 1.05 },
          "duration": 6,
          "easing": "easeInOut"
        }
      ],
      "transitions": [
        {
          "type": "fade",
          "duration": 0.5,
          "easing": "easeInOut"
        }
      ],
      "rationale": "Explanation of design choices"
    },
    {
      "variantType": "energetic",
      "name": "Dynamic Social",
      "description": "Punchy, engaging animation with bold timing",
      "timeline": { ... same structure ... },
      "layerAnimations": [ ... ],
      "cameraMovement": [ ... ],
      "transitions": [ ... ],
      "rationale": "Explanation of design choices"
    }
  ]
}

Available animation types: fadeIn, fadeOut, slideIn, slideOut, scaleIn, scaleOut, rotate, blur, colorShift, typewriter, bounce, pulse, float, shake, glow, clipReveal, maskReveal, parallax
Available easing: linear, easeIn, easeOut, easeInOut, spring, anticipate, backOut, circIn, circOut, circInOut
Available camera types: pan, zoom, tilt, dolly, orbit, static

IMPORTANT: Output ONLY valid JSON. No markdown code blocks, no explanation text.`;

export async function planMotion(sceneGraph: SceneGraph): Promise<MotionPlan> {
  const zai = await getZAI();

  const response = await zai.chat.completions.create({
    messages: [
      {
        role: 'assistant',
        content: 'You are an expert motion graphics designer who creates detailed animation plans in JSON format. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: `${MOTION_PLANNING_PROMPT}\n\n## Scene Graph to Animate:\n\`\`\`json\n${JSON.stringify(sceneGraph, null, 2)}\n\`\`\``
      }
    ],
    thinking: { type: 'disabled' }
  });

  const rawResponse = response.choices[0]?.message?.content || '';

  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in motion planning response');
    const plan = JSON.parse(jsonMatch[0]) as MotionPlan;
    
    // Validate that we have two variants
    if (!plan.variants || plan.variants.length < 2) {
      throw new Error('Expected at least 2 motion variants');
    }
    
    return plan;
  } catch (error) {
    console.error('Motion planning parse error:', error);
    // Return a default plan
    return generateDefaultMotionPlan(sceneGraph);
  }
}

function generateDefaultMotionPlan(sceneGraph: SceneGraph): MotionPlan {
  const layers = sceneGraph.layers || [];
  const totalDuration = 6;
  
  const professionalAnimations: LayerAnimation[] = layers.map((layer, i) => ({
    layerId: layer.id,
    type: 'fadeIn' as const,
    property: 'opacity' as const,
    keyframes: [
      { time: 0, value: 0 },
      { time: 1, value: 1 }
    ],
    duration: 0.8,
    delay: i * 0.3,
    easing: 'easeInOut' as const,
    intensity: 0.7,
  }));

  const energeticAnimations: LayerAnimation[] = layers.map((layer, i) => ({
    layerId: layer.id,
    type: 'scaleIn' as const,
    property: 'scale' as const,
    keyframes: [
      { time: 0, value: 0 },
      { time: 1, value: 1 }
    ],
    duration: 0.5,
    delay: i * 0.15,
    easing: 'spring' as const,
    intensity: 0.9,
  }));

  return {
    variants: [
      {
        variantType: 'professional',
        name: 'Premium Corporate',
        description: 'Elegant, smooth animation with refined timing',
        timeline: {
          totalDuration,
          fps: 30,
          events: professionalAnimations.map((anim, i) => ({
            time: anim.delay,
            type: 'layerAnimation' as const,
            layerId: anim.layerId,
            animation: anim,
          })),
        },
        layerAnimations: professionalAnimations,
        cameraMovement: [{
          type: 'zoom',
          startPoint: { x: 0, y: 0, scale: 1 },
          endPoint: { x: 0, y: 0, scale: 1.05 },
          duration: totalDuration,
          easing: 'easeInOut',
        }],
        transitions: [{ type: 'fade', duration: 0.5, easing: 'easeInOut' }],
        rationale: 'Professional, smooth animations that preserve readability and guide attention through visual hierarchy.',
      },
      {
        variantType: 'energetic',
        name: 'Dynamic Social',
        description: 'Punchy, engaging animation with bold timing',
        timeline: {
          totalDuration: 4,
          fps: 30,
          events: energeticAnimations.map((anim, i) => ({
            time: anim.delay,
            type: 'layerAnimation' as const,
            layerId: anim.layerId,
            animation: anim,
          })),
        },
        layerAnimations: energeticAnimations,
        cameraMovement: [{
          type: 'zoom',
          startPoint: { x: 0, y: 0, scale: 1.1 },
          endPoint: { x: 0, y: 0, scale: 1 },
          duration: 4,
          easing: 'easeOut',
        }],
        transitions: [{ type: 'fade', duration: 0.3, easing: 'easeOut' }],
        rationale: 'Dynamic, punchy animations that grab attention and create excitement.',
      },
    ],
    sceneGraphVersion: '1.0',
  };
}
