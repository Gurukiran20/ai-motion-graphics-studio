import ZAI from 'z-ai-web-dev-sdk';
import type { SceneGraph, SceneAnalysisResult, LayerInfo } from '@/lib/types';

let zaiInstance: InstanceType<typeof ZAI> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

const SCENE_ANALYSIS_PROMPT = `You are an expert motion graphics designer and visual analyst specializing in decomposing static designs into animation-ready scene graphs. Your analysis will be used to create professional motion graphics animations.

CRITICAL: Be extremely precise about positions and sizes. These will be used to recreate the design as an animation.

Your analysis must identify and describe:

1. **Headline**: The MAIN, LARGEST text in the design. Its exact position as percentage of image (x, y, width, height where x,y is top-left corner), font size (estimate in px relative to 1920px width), weight, color
2. **Subheadline**: Secondary supporting text, position, style
3. **CTA (Call to Action)**: Any button, link, or call-to-action element. Include its background color and border radius for accurate recreation
4. **Logo**: Position of any logo or brand mark
5. **Layers**: ALL visual elements in the design, decomposed from background to foreground. Each layer must have:
   - A UNIQUE id (format: layer_0, layer_1, etc.)
   - Type: one of [headline, subheadline, cta, logo, image, icon, background, foreground, decorative, text]
   - Position as percentages (x, y, width, height where x,y is top-left corner, all 0-100)
   - z-index: 0 for background, incrementing by 1 for each layer going forward
   - Color as hex code
   - fontSize (in px, relative to 1920px width), fontWeight, fontFamily where applicable
   - content: the actual text for text layers
   - borderRadius: for buttons and rounded elements
   - opacity: 1.0 for fully visible, less for semi-transparent elements
6. **Visual Hierarchy**: Reading order and importance levels - this determines animation timing
7. **Brand Colors**: Extract ALL dominant colors as hex codes
8. **Typography**: Font families, weights, sizes used
9. **Layout Structure**: Layout type, direction, spacing, alignment

IMPORTANT POSITIONING RULES:
- Positions must be REALISTIC percentages that would recreate the layout
- Background layer should be at position (0,0) with (100,100) dimensions
- Text layers should be sized to fit their text content tightly
- Layer positions should NOT overlap significantly (unless they're overlapping in the design)

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

IMPORTANT: Output ONLY valid JSON. No markdown code blocks, no explanation text outside the JSON.
Be thorough and precise. Every visual element must be captured. Positions must be realistic percentages.`;

function buildFallbackSceneGraph(): SceneGraph {
  return {
    headline: {
      text: 'Your Design',
      position: { x: 15, y: 25, width: 70, height: 18 },
      style: { fontSize: 64, fontWeight: '800', color: '#ffffff', fontFamily: 'sans-serif' },
    },
    subheadline: {
      text: 'Transform static designs into stunning motion graphics',
      position: { x: 15, y: 48, width: 70, height: 10 },
      style: { fontSize: 28, fontWeight: '400', color: '#94a3b8', fontFamily: 'sans-serif' },
    },
    cta: {
      text: 'Get Started',
      position: { x: 35, y: 65, width: 30, height: 7 },
      style: { fontSize: 20, fontWeight: '600', color: '#ffffff', backgroundColor: '#10b981', borderRadius: 50 },
    },
    logo: {
      position: { x: 5, y: 5, width: 12, height: 6 },
    },
    layers: [
      { id: 'layer_0', type: 'background', label: 'Background', position: { x: 0, y: 0, width: 100, height: 100 }, zIndex: 0, color: '#0f172a', opacity: 1, borderRadius: 0 },
      { id: 'layer_1', type: 'foreground', label: 'Gradient Overlay', position: { x: 0, y: 0, width: 100, height: 100 }, zIndex: 1, color: '#1e293b', opacity: 0.3, borderRadius: 0 },
      { id: 'layer_2', type: 'decorative', label: 'Accent Shape', position: { x: 60, y: 10, width: 35, height: 80 }, zIndex: 2, color: '#10b981', opacity: 0.08, borderRadius: 24 },
      { id: 'layer_3', type: 'logo', label: 'Logo', position: { x: 5, y: 5, width: 12, height: 6 }, zIndex: 15, opacity: 1, borderRadius: 4 },
      { id: 'layer_4', type: 'headline', label: 'Headline', content: 'Your Design', position: { x: 15, y: 25, width: 70, height: 18 }, zIndex: 10, color: '#ffffff', fontSize: 64, fontWeight: '800', fontFamily: 'sans-serif', opacity: 1, borderRadius: 0 },
      { id: 'layer_5', type: 'subheadline', label: 'Subheadline', content: 'Transform static designs into stunning motion graphics', position: { x: 15, y: 48, width: 70, height: 10 }, zIndex: 9, color: '#94a3b8', fontSize: 28, fontWeight: '400', fontFamily: 'sans-serif', opacity: 1, borderRadius: 0 },
      { id: 'layer_6', type: 'cta', label: 'CTA Button', content: 'Get Started', position: { x: 35, y: 65, width: 30, height: 7 }, zIndex: 12, color: '#ffffff', fontSize: 20, fontWeight: '600', fontFamily: 'sans-serif', opacity: 1, borderRadius: 50 },
    ],
    hierarchy: {
      order: ['layer_4', 'layer_5', 'layer_6', 'layer_3', 'layer_2', 'layer_1', 'layer_0'],
      levels: [
        { level: 1, layerIds: ['layer_4'], description: 'Primary headline' },
        { level: 2, layerIds: ['layer_6'], description: 'Call to action' },
        { level: 3, layerIds: ['layer_5'], description: 'Supporting text' },
        { level: 4, layerIds: ['layer_3'], description: 'Logo' },
      ],
    },
    brandColors: {
      primary: '#10b981',
      secondary: '#6366f1',
      accent: '#f59e0b',
      background: '#0f172a',
      text: '#ffffff',
      additional: ['#1e293b', '#94a3b8'],
    },
    typography: {
      headlineFont: 'sans-serif',
      headlineWeight: '800',
      headlineSize: '64px',
      bodyFont: 'sans-serif',
      bodyWeight: '400',
      bodySize: '28px',
      ctaFont: 'sans-serif',
      ctaWeight: '600',
      ctaSize: '20px',
    },
    layout: {
      type: 'hero',
      direction: 'vertical',
      spacing: 'normal',
      alignment: 'center',
      sections: [
        { id: 'section_1', type: 'hero', position: { x: 0, y: 0, width: 100, height: 100 } },
      ],
    },
    sceneGraph: {
      width: 1920,
      height: 1080,
      aspectRatio: '16:9',
      backgroundColor: '#0f172a',
      globalOpacity: 1,
    },
  };
}

function safeParseJSON(text: string): SceneGraph | null {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code blocks or mixed content
    const patterns = [
      /```json\s*([\s\S]*?)```/,      // markdown code block
      /```\s*([\s\S]*?)```/,           // generic code block
      /(\{[\s\S]*\})/,                 // bare JSON object
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          return JSON.parse(match[1]);
        } catch {
          continue;
        }
      }
    }
    return null;
  }
}

export async function analyzeScene(imageDataUrl: string): Promise<SceneAnalysisResult> {
  try {
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

    if (!rawAnalysis || rawAnalysis.trim().length === 0) {
      console.warn('VLM returned empty response, using fallback scene graph');
      return { sceneGraph: buildFallbackSceneGraph(), rawAnalysis: 'Fallback: VLM returned empty response' };
    }

    // Parse the JSON from the response
    let sceneGraph = safeParseJSON(rawAnalysis);

    if (!sceneGraph) {
      // Fallback: Use LLM to structure the raw analysis
      console.log('First pass JSON parsing failed, using LLM to structure...');
      try {
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
        sceneGraph = safeParseJSON(structuredText);
      } catch (structError) {
        console.error('Structuring LLM call failed:', structError);
      }
    }

    if (!sceneGraph) {
      console.warn('All JSON parsing attempts failed, using fallback scene graph');
      return { sceneGraph: buildFallbackSceneGraph(), rawAnalysis };
    }

    // Ensure all layers have unique IDs
    if (sceneGraph.layers) {
      sceneGraph.layers = sceneGraph.layers.map((layer: LayerInfo, index: number) => ({
        id: layer.id || `layer_${index}`,
        ...layer,
      }));
    }

    // Ensure required fields exist with defaults
    if (!sceneGraph.hierarchy) {
      sceneGraph.hierarchy = { order: sceneGraph.layers?.map(l => l.id) || [], levels: [] };
    }
    if (!sceneGraph.brandColors) {
      sceneGraph.brandColors = { primary: '#4F46E5', secondary: '#7C3AED', accent: '#F59E0B', background: '#1A1A2E', text: '#FFFFFF', additional: [] };
    }
    if (!sceneGraph.typography) {
      sceneGraph.typography = { headlineFont: 'sans-serif', headlineWeight: 'bold', headlineSize: '48px', bodyFont: 'sans-serif', bodyWeight: 'normal', bodySize: '24px', ctaFont: 'sans-serif', ctaWeight: 'bold', ctaSize: '18px' };
    }
    if (!sceneGraph.layout) {
      sceneGraph.layout = { type: 'centered', direction: 'vertical', spacing: 'normal', alignment: 'center', sections: [] };
    }
    if (!sceneGraph.sceneGraph) {
      sceneGraph.sceneGraph = { width: 1920, height: 1080, aspectRatio: '16:9', backgroundColor: '#1a1a2e', globalOpacity: 1 };
    }

    return {
      sceneGraph,
      rawAnalysis,
    };
  } catch (error) {
    console.error('Scene analysis completely failed:', error);
    // Return a fallback scene graph instead of throwing
    return {
      sceneGraph: buildFallbackSceneGraph(),
      rawAnalysis: `Error during analysis: ${error instanceof Error ? error.message : 'Unknown error'}. Using default scene graph.`,
    };
  }
}
