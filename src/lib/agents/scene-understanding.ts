import ZAI from 'z-ai-web-dev-sdk';
import type { SceneGraph, SceneAnalysisResult, LayerInfo, BrandColors, TypographyInfo, LayoutStructure, VisualHierarchy } from '@/lib/types';

let zaiInstance: InstanceType<typeof ZAI> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

const SCENE_ANALYSIS_PROMPT = `You are an expert motion graphics designer and visual analyst. Analyze the provided design image and extract a complete structured scene representation.

Your analysis must identify and describe:

1. **Headline**: Main headline text, its position (as percentage of image: x, y, width, height), font characteristics, color
2. **Subheadline**: Secondary text, position, style
3. **CTA (Call to Action)**: Button or CTA text, position, style including background color and border radius
4. **Logo**: Position and description of any logo
5. **Layers**: All visual layers in the design, from background to foreground, each with:
   - Type (headline, subheadline, cta, logo, image, icon, background, foreground, decorative, text)
   - Position as percentages (x, y, width, height where x,y is top-left corner)
   - z-index order
   - Color, font size, font weight where applicable
   - Content (text for text layers)
6. **Visual Hierarchy**: Reading order and importance levels
7. **Brand Colors**: Primary, secondary, accent, background, text colors (as hex)
8. **Typography**: Font families, weights, sizes used
9. **Layout Structure**: Layout type (centered, left-aligned, hero, split, etc.), direction, spacing, alignment

Position coordinates should be percentages (0-100) relative to the image dimensions.

Respond with a valid JSON object matching this exact structure:
{
  "headline": {
    "text": "string",
    "position": { "x": 0, "y": 0, "width": 0, "height": 0 },
    "style": { "fontSize": 0, "fontWeight": "string", "color": "hex", "fontFamily": "string" }
  },
  "subheadline": {
    "text": "string",
    "position": { "x": 0, "y": 0, "width": 0, "height": 0 },
    "style": { "fontSize": 0, "fontWeight": "string", "color": "hex", "fontFamily": "string" }
  } or null,
  "cta": {
    "text": "string",
    "position": { "x": 0, "y": 0, "width": 0, "height": 0 },
    "style": { "fontSize": 0, "fontWeight": "string", "color": "hex", "backgroundColor": "hex", "borderRadius": 0 }
  } or null,
  "logo": {
    "position": { "x": 0, "y": 0, "width": 0, "height": 0 }
  } or null,
  "layers": [
    {
      "id": "layer_N",
      "type": "background|foreground|headline|subheadline|cta|logo|image|icon|decorative|text",
      "label": "descriptive label",
      "content": "text content if any",
      "position": { "x": 0, "y": 0, "width": 0, "height": 0 },
      "zIndex": 0,
      "color": "hex",
      "fontSize": 0,
      "fontWeight": "string",
      "fontFamily": "string",
      "opacity": 1,
      "borderRadius": 0
    }
  ],
  "hierarchy": {
    "order": ["layer_id_1", "layer_id_2", "..."],
    "levels": [
      { "level": 1, "layerIds": ["id"], "description": "Primary focal point" }
    ]
  },
  "brandColors": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex",
    "additional": ["#hex"]
  },
  "typography": {
    "headlineFont": "string",
    "headlineWeight": "string",
    "headlineSize": "string",
    "bodyFont": "string",
    "bodyWeight": "string",
    "bodySize": "string",
    "ctaFont": "string",
    "ctaWeight": "string",
    "ctaSize": "string"
  },
  "layout": {
    "type": "centered|left-aligned|right-aligned|split|grid|asymmetric|hero|minimal",
    "direction": "horizontal|vertical|mixed",
    "spacing": "tight|normal|loose",
    "alignment": "left|center|right",
    "sections": [
      { "id": "section_1", "type": "string", "position": { "x": 0, "y": 0, "width": 0, "height": 0 } }
    ]
  },
  "sceneGraph": {
    "width": 1920,
    "height": 1080,
    "aspectRatio": "16:9",
    "backgroundColor": "#hex",
    "globalOpacity": 1
  }
}

Be thorough and precise. Every visual element must be captured. Positions must be realistic percentages.`;

export async function analyzeScene(imageDataUrl: string): Promise<SceneAnalysisResult> {
  const zai = await getZAI();

  // First pass: VLM analysis of the image
  const vlmResponse = await zai.chat.completions.createVision({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: SCENE_ANALYSIS_PROMPT },
          { type: 'image_url', image_url: { url: imageDataUrl } }
        ]
      }
    ],
    thinking: { type: 'disabled' }
  });

  const rawAnalysis = vlmResponse.choices[0]?.message?.content || '';

  // Parse the JSON from the response
  let sceneGraph: SceneGraph;
  try {
    // Try to extract JSON from the response
    const jsonMatch = rawAnalysis.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    sceneGraph = JSON.parse(jsonMatch[0]);
  } catch {
    // Fallback: Use LLM to structure the raw analysis
    console.log('First pass JSON parsing failed, using LLM to structure...');
    const structuringResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: 'You are a JSON structuring assistant. Convert the following analysis into valid JSON matching the scene graph schema. Output ONLY valid JSON, no markdown, no explanation.'
        },
        {
          role: 'user',
          content: `Convert this visual analysis into the scene graph JSON structure:\n\n${rawAnalysis}`
        }
      ],
      thinking: { type: 'disabled' }
    });

    const structuredText = structuringResponse.choices[0]?.message?.content || '';
    const jsonMatch2 = structuredText.match(/\{[\s\S]*\}/);
    if (!jsonMatch2) throw new Error('Failed to structure scene graph');
    sceneGraph = JSON.parse(jsonMatch2[0]);
  }

  // Ensure all layers have unique IDs
  if (sceneGraph.layers) {
    sceneGraph.layers = sceneGraph.layers.map((layer: LayerInfo, index: number) => ({
      id: layer.id || `layer_${index}`,
      ...layer,
    }));
  }

  return {
    sceneGraph,
    rawAnalysis,
  };
}
