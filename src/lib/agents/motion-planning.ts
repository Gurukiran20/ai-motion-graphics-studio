import ZAI from 'z-ai-web-dev-sdk';
import type { SceneGraph, MotionPlan, MotionVariant, LayerAnimation, CameraMovement, Transition, Timeline, TimelineEvent } from '@/lib/types';

let zaiInstance: InstanceType<typeof ZAI> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

const MOTION_PLANNING_PROMPT = `You are a world-class motion graphics designer who creates stunning, professional animation plans from static designs. Your animations should look like they were made in After Effects by a top agency.

## Design Philosophy
- Every animation must feel INTENTIONAL and POLISHED
- Use compound animations: combine opacity + transform + scale for depth
- Stagger elements based on visual hierarchy (most important first)
- Use the "reveal" pattern: elements should feel like they're being uncovered, not just appearing
- Create rhythm through varied timing — not all elements should have the same duration
- The background should have subtle life (Ken Burns zoom, gradient shift)
- Text reveals should be elegant: clipReveal for headlines, slideIn for subtext, scaleIn for CTAs
- Logo should appear early with a subtle, confident entrance

## Variant A: Professional / Premium / Corporate
- Smooth, cinematic transitions with subtle depth
- Ken Burns zoom (scale 1.0 → 1.05 over full duration)
- Elegant text reveals: clipReveal for headline (from left), slideIn-up for subheadline, scaleIn with spring for CTA
- Logo fades in early with slight scale (0.9 → 1.0)
- Background layers use parallax (subtle upward drift)
- Professional duration: 6-8 seconds
- Delays: headline at 0.3s, subheadline at 0.8s, CTA at 1.5s, logo at 0.1s
- Easing: easeInOut for most, spring(stiffness:120,damping:20) for CTA
- Intensity: 0.5-0.7 (subtle but noticeable)

## Variant B: Energetic / Social-first / Viral
- Dynamic, punchy, attention-grabbing
- Quick zoom (scale 1.1 → 1.0) - reverse Ken Burns
- Bold text reveals: bounce for headline, scaleIn from 0 for subheadline, scaleIn with high spring for CTA
- Logo scales in from 0 with spring bounce
- Background layers use stronger parallax and float
- Shorter duration: 3-5 seconds
- Delays: headline at 0.1s, subheadline at 0.4s, CTA at 0.8s, logo at 0.05s
- Easing: spring(stiffness:300,damping:12) for text, anticipate for CTA
- Intensity: 0.8-1.0 (dramatic and bold)

For each layer, create an animation that:
1. Creates a REVEAL effect — elements should feel uncovered, not just appearing
2. Preserves readability — text must be fully readable once animation completes
3. Respects visual hierarchy — more important elements animate first or more prominently
4. Uses COMPOUND animations — combine opacity + position + scale for depth
5. Creates rhythm through VARIED timing and durations
6. Guides the viewer's eye through the design intentionally

CRITICAL RULES:
- headline MUST use clipReveal (professional) or bounce (energetic) — not plain fadeIn
- subheadline MUST use slideIn (professional) or scaleIn (energetic)
- CTA MUST use scaleIn with spring — this is the most important interactive element
- logo MUST use fadeIn with slight scale — subtle but present
- background MUST use parallax — gives depth to the scene
- decorative/foreground layers use float or fadeIn
- Every animation should have opacity: 0 → 1 combined with the transform

Respond with a valid JSON object:
{
  "variants": [
    {
      "variantType": "professional",
      "name": "Premium Corporate",
      "description": "Cinematic, elegant animation with refined timing and depth",
      "timeline": {
        "totalDuration": 7,
        "fps": 30,
        "events": []
      },
      "layerAnimations": [
        {
          "layerId": "layer_id_from_scene_graph",
          "type": "clipReveal|slideIn|scaleIn|bounce|fadeIn|float|parallax|glow",
          "property": "opacity|x|y|scale",
          "keyframes": [{ "time": 0, "value": 0 }, { "time": 1, "value": 1 }],
          "duration": 0.8,
          "delay": 0.3,
          "easing": "easeInOut|spring|anticipate|backOut",
          "intensity": 0.6,
          "direction": "left|right|up|down"
        }
      ],
      "cameraMovement": [
        {
          "type": "zoom",
          "startPoint": { "x": 0, "y": 0, "scale": 1.0 },
          "endPoint": { "x": 0, "y": 0, "scale": 1.05 },
          "duration": 7,
          "easing": "easeInOut"
        }
      ],
      "transitions": [
        { "type": "fade", "duration": 0.5, "easing": "easeInOut" }
      ],
      "rationale": "Explanation of design choices"
    },
    {
      "variantType": "energetic",
      "name": "Dynamic Social",
      "description": "Punchy, viral-ready animation with bold timing",
      "timeline": { "totalDuration": 4, "fps": 30, "events": [] },
      "layerAnimations": [ ... ],
      "cameraMovement": [ ... ],
      "transitions": [ ... ],
      "rationale": "..."
    }
  ]
}

IMPORTANT: 
- Use the EXACT layerId values from the scene graph
- Output ONLY valid JSON, no markdown code blocks, no explanation text
- Every layer must have an animation — do not skip any layers
- Use compound animation types (clipReveal, bounce, scaleIn) — NOT plain fadeIn for text`;

export async function planMotion(sceneGraph: SceneGraph): Promise<MotionPlan> {
  const zai = await getZAI();

  try {
    // Compact the scene graph to reduce payload size and avoid OOM
    const compactSceneGraph = {
      headline: sceneGraph.headline,
      subheadline: sceneGraph.subheadline,
      cta: sceneGraph.cta,
      logo: sceneGraph.logo,
      layers: sceneGraph.layers?.map(l => ({
        id: l.id, type: l.type, label: l.label, content: l.content,
        position: l.position, zIndex: l.zIndex, color: l.color,
        fontSize: l.fontSize, fontWeight: l.fontWeight, opacity: l.opacity,
        borderRadius: l.borderRadius,
      })),
      hierarchy: sceneGraph.hierarchy,
      brandColors: sceneGraph.brandColors,
      layout: sceneGraph.layout,
      sceneGraph: sceneGraph.sceneGraph,
    };

    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a world-class motion graphics designer who creates stunning, professional animation plans. Always respond with valid JSON only. No markdown, no explanation.'
        },
        {
          role: 'user',
          content: `${MOTION_PLANNING_PROMPT}\n\n## Scene Graph to Animate:\n\`\`\`json\n${JSON.stringify(compactSceneGraph)}\n\`\`\``
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

      // Validate that each variant has layer animations
      plan.variants = plan.variants.map(variant => ({
        ...variant,
        layerAnimations: variant.layerAnimations || [],
        cameraMovement: variant.cameraMovement || [],
        transitions: variant.transitions || [],
      }));

      // Ensure all variants reference existing layer IDs
      const layerIds = new Set((sceneGraph.layers || []).map(l => l.id));
      plan.variants = plan.variants.map(variant => ({
        ...variant,
        layerAnimations: variant.layerAnimations.filter(anim =>
          layerIds.has(anim.layerId) || 
          Array.from(layerIds).some(id => anim.layerId.includes(id) || id.includes(anim.layerId))
        ),
      }));

      return plan;
    } catch (error) {
      console.error('Motion planning parse error:', error);
      return generateDefaultMotionPlan(sceneGraph);
    }
  } catch (error) {
    console.error('Motion planning API error:', error);
    return generateDefaultMotionPlan(sceneGraph);
  }
}

/**
 * Generate a high-quality default motion plan when LLM fails
 * This should still look impressive - not just basic fadeIn
 */
function generateDefaultMotionPlan(sceneGraph: SceneGraph): MotionPlan {
  const layers = sceneGraph.layers || [];
  const brandColors = sceneGraph.brandColors;

  // Categorize layers by type for appropriate animation assignment
  const backgroundLayers = layers.filter(l => l.type === 'background' || l.type === 'foreground');
  const headlineLayer = layers.find(l => l.type === 'headline');
  const subheadlineLayer = layers.find(l => l.type === 'subheadline');
  const ctaLayer = layers.find(l => l.type === 'cta');
  const logoLayer = layers.find(l => l.type === 'logo');
  const otherLayers = layers.filter(l =>
    !['background', 'foreground', 'headline', 'subheadline', 'cta', 'logo'].includes(l.type)
  );

  // =====================
  // PROFESSIONAL VARIANT
  // =====================
  const professionalAnimations: LayerAnimation[] = [];
  const proDuration = 7;

  // Logo: early, subtle entrance
  if (logoLayer) {
    professionalAnimations.push({
      layerId: logoLayer.id,
      type: 'fadeIn',
      property: 'opacity',
      keyframes: [{ time: 0, value: 0 }, { time: 1, value: 1 }],
      duration: 0.8,
      delay: 0.1,
      easing: 'easeInOut',
      intensity: 0.5,
    });
  }

  // Background layers: parallax drift
  backgroundLayers.forEach((layer, i) => {
    professionalAnimations.push({
      layerId: layer.id,
      type: 'parallax',
      property: 'y',
      keyframes: [{ time: 0, value: 0 }, { time: 1, value: -8 }],
      duration: proDuration,
      delay: 0,
      easing: 'easeInOut',
      intensity: 0.3,
    });
  });

  // Headline: clipReveal (the signature professional text animation)
  if (headlineLayer) {
    professionalAnimations.push({
      layerId: headlineLayer.id,
      type: 'clipReveal',
      property: 'opacity',
      keyframes: [{ time: 0, value: 0 }, { time: 1, value: 1 }],
      duration: 1.0,
      delay: 0.4,
      easing: 'easeInOut',
      intensity: 0.7,
      direction: 'left',
    });
  }

  // Subheadline: slideIn from below
  if (subheadlineLayer) {
    professionalAnimations.push({
      layerId: subheadlineLayer.id,
      type: 'slideIn',
      property: 'y',
      keyframes: [{ time: 0, value: 30 }, { time: 1, value: 0 }],
      duration: 0.9,
      delay: 0.9,
      easing: 'easeInOut',
      intensity: 0.6,
      direction: 'up',
    });
  }

  // CTA: scaleIn with spring
  if (ctaLayer) {
    professionalAnimations.push({
      layerId: ctaLayer.id,
      type: 'scaleIn',
      property: 'scale',
      keyframes: [{ time: 0, value: 0 }, { time: 1, value: 1 }],
      duration: 0.6,
      delay: 1.6,
      easing: 'spring',
      intensity: 0.7,
    });
  }

  // Other layers: fadeIn with stagger
  otherLayers.forEach((layer, i) => {
    professionalAnimations.push({
      layerId: layer.id,
      type: 'fadeIn',
      property: 'opacity',
      keyframes: [{ time: 0, value: 0 }, { time: 1, value: 1 }],
      duration: 0.8,
      delay: 0.5 + i * 0.2,
      easing: 'easeInOut',
      intensity: 0.5,
    });
  });

  // =====================
  // ENERGETIC VARIANT
  // =====================
  const energeticAnimations: LayerAnimation[] = [];
  const enerDuration = 4;

  // Logo: bold scaleIn
  if (logoLayer) {
    energeticAnimations.push({
      layerId: logoLayer.id,
      type: 'scaleIn',
      property: 'scale',
      keyframes: [{ time: 0, value: 0 }, { time: 1, value: 1 }],
      duration: 0.4,
      delay: 0.05,
      easing: 'spring',
      intensity: 0.9,
    });
  }

  // Background layers: stronger parallax
  backgroundLayers.forEach((layer, i) => {
    energeticAnimations.push({
      layerId: layer.id,
      type: 'parallax',
      property: 'y',
      keyframes: [{ time: 0, value: 0 }, { time: 1, value: -25 }],
      duration: enerDuration,
      delay: 0,
      easing: 'easeOut',
      intensity: 0.8,
    });
  });

  // Headline: bounce in
  if (headlineLayer) {
    energeticAnimations.push({
      layerId: headlineLayer.id,
      type: 'bounce',
      property: 'y',
      keyframes: [{ time: 0, value: -80 }, { time: 1, value: 0 }],
      duration: 0.7,
      delay: 0.1,
      easing: 'spring',
      intensity: 0.9,
    });
  }

  // Subheadline: scaleIn from 0
  if (subheadlineLayer) {
    energeticAnimations.push({
      layerId: subheadlineLayer.id,
      type: 'scaleIn',
      property: 'scale',
      keyframes: [{ time: 0, value: 0 }, { time: 1, value: 1 }],
      duration: 0.5,
      delay: 0.4,
      easing: 'spring',
      intensity: 0.9,
    });
  }

  // CTA: scaleIn with high spring
  if (ctaLayer) {
    energeticAnimations.push({
      layerId: ctaLayer.id,
      type: 'scaleIn',
      property: 'scale',
      keyframes: [{ time: 0, value: 0 }, { time: 1, value: 1 }],
      duration: 0.5,
      delay: 0.8,
      easing: 'spring',
      intensity: 1.0,
    });
  }

  // Other layers: bounce with stagger
  otherLayers.forEach((layer, i) => {
    energeticAnimations.push({
      layerId: layer.id,
      type: 'scaleIn',
      property: 'scale',
      keyframes: [{ time: 0, value: 0 }, { time: 1, value: 1 }],
      duration: 0.4,
      delay: 0.3 + i * 0.15,
      easing: 'spring',
      intensity: 0.8,
    });
  });

  return {
    variants: [
      {
        variantType: 'professional',
        name: 'Premium Corporate',
        description: 'Cinematic, elegant animation with refined timing and depth',
        timeline: {
          totalDuration: proDuration,
          fps: 30,
          events: professionalAnimations.map((anim) => ({
            time: anim.delay,
            type: 'layerAnimation' as const,
            layerId: anim.layerId,
            animation: anim,
          })),
        },
        layerAnimations: professionalAnimations,
        cameraMovement: [{
          type: 'zoom',
          startPoint: { x: 0, y: 0, scale: 1.0 },
          endPoint: { x: 0, y: 0, scale: 1.05 },
          duration: proDuration,
          easing: 'easeInOut',
        }],
        transitions: [{ type: 'fade', duration: 0.5, easing: 'easeInOut' }],
        rationale: 'Professional cinematic reveal: Ken Burns zoom with elegant clip-reveal headline, smooth slide-in subheadline, and spring-scaled CTA. Staggered timing creates a natural reading flow.',
      },
      {
        variantType: 'energetic',
        name: 'Dynamic Social',
        description: 'Punchy, viral-ready animation with bold spring physics',
        timeline: {
          totalDuration: enerDuration,
          fps: 30,
          events: energeticAnimations.map((anim) => ({
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
          endPoint: { x: 0, y: 0, scale: 1.0 },
          duration: enerDuration,
          easing: 'easeOut',
        }],
        transitions: [{ type: 'fade', duration: 0.3, easing: 'easeOut' }],
        rationale: 'Energetic social-first: reverse zoom pulls viewer in, bouncing headline grabs attention, spring-scaled elements create excitement. Fast timing optimized for social media engagement.',
      },
    ],
    sceneGraphVersion: '1.0',
  };
}
