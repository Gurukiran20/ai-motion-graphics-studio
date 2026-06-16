// Scene Graph Types - Stage 1: Scene Understanding

export interface LayerInfo {
  id: string;
  type: 'headline' | 'subheadline' | 'cta' | 'logo' | 'image' | 'icon' | 'background' | 'foreground' | 'decorative' | 'text';
  label: string;
  content?: string; // Text content for text layers
  position: {
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    width: number; // percentage 0-100
    height: number; // percentage 0-100
  };
  zIndex: number;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  opacity?: number;
  borderRadius?: number;
  imageUrl?: string;
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  additional: string[];
}

export interface TypographyInfo {
  headlineFont: string;
  headlineWeight: string;
  headlineSize: string;
  bodyFont: string;
  bodyWeight: string;
  bodySize: string;
  ctaFont: string;
  ctaWeight: string;
  ctaSize: string;
}

export interface LayoutStructure {
  type: 'centered' | 'left-aligned' | 'right-aligned' | 'split' | 'grid' | 'asymmetric' | 'hero' | 'minimal';
  direction: 'horizontal' | 'vertical' | 'mixed';
  spacing: 'tight' | 'normal' | 'loose';
  alignment: 'left' | 'center' | 'right';
  sections: {
    id: string;
    type: string;
    position: { x: number; y: number; width: number; height: number };
  }[];
}

export interface VisualHierarchy {
  order: string[]; // Layer IDs in reading order
  levels: {
    level: number;
    layerIds: string[];
    description: string;
  }[];
}

export interface SceneGraph {
  headline: {
    text: string;
    position: { x: number; y: number; width: number; height: number };
    style: { fontSize: number; fontWeight: string; color: string; fontFamily: string };
  };
  subheadline: {
    text: string;
    position: { x: number; y: number; width: number; height: number };
    style: { fontSize: number; fontWeight: string; color: string; fontFamily: string };
  } | null;
  cta: {
    text: string;
    position: { x: number; y: number; width: number; height: number };
    style: { fontSize: number; fontWeight: string; color: string; backgroundColor: string; borderRadius: number };
  } | null;
  logo: {
    position: { x: number; y: number; width: number; height: number };
    imageUrl?: string;
  } | null;
  layers: LayerInfo[];
  hierarchy: VisualHierarchy;
  brandColors: BrandColors;
  typography: TypographyInfo;
  layout: LayoutStructure;
  sceneGraph: {
    width: number;
    height: number;
    aspectRatio: string;
    backgroundColor: string;
    globalOpacity: number;
  };
}

export interface SceneAnalysisResult {
  sceneGraph: SceneGraph;
  rawAnalysis: string;
}
