// Motion Plan Types - Stage 2: Motion Planning

export type EasingFunction =
  | 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  | 'spring' | 'anticipate' | 'backOut'
  | 'circIn' | 'circOut' | 'circInOut';

export interface Keyframe {
  time: number; // 0-1 normalized time
  value: number | string;
  easing?: EasingFunction;
}

export interface LayerAnimation {
  layerId: string;
  type: 'fadeIn' | 'fadeOut' | 'slideIn' | 'slideOut' | 'scaleIn' | 'scaleOut' | 'rotate' | 'blur' | 'colorShift' | 'typewriter' | 'bounce' | 'pulse' | 'float' | 'shake' | 'glow' | 'clipReveal' | 'maskReveal' | 'parallax';
  property: 'opacity' | 'x' | 'y' | 'scale' | 'rotation' | 'blur' | 'color';
  keyframes: Keyframe[];
  duration: number; // in seconds
  delay: number; // in seconds
  easing: EasingFunction;
  direction?: 'left' | 'right' | 'up' | 'down';
  intensity?: number; // 0-1
}

export interface CameraMovement {
  type: 'pan' | 'zoom' | 'tilt' | 'dolly' | 'orbit' | 'static';
  startPoint: { x: number; y: number; scale: number };
  endPoint: { x: number; y: number; scale: number };
  duration: number;
  easing: EasingFunction;
}

export interface Transition {
  type: 'cut' | 'dissolve' | 'fade' | 'wipe' | 'zoom' | 'slide';
  duration: number;
  easing: EasingFunction;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export interface TimelineEvent {
  time: number; // in seconds from start
  type: 'layerAnimation' | 'cameraMovement' | 'transition';
  layerId?: string;
  animation?: LayerAnimation;
  camera?: CameraMovement;
  transition?: Transition;
}

export interface Timeline {
  totalDuration: number; // in seconds
  events: TimelineEvent[];
  fps: number;
}

export interface MotionVariant {
  variantType: 'professional' | 'energetic';
  name: string;
  description: string;
  timeline: Timeline;
  layerAnimations: LayerAnimation[];
  cameraMovement: CameraMovement[];
  transitions: Transition[];
  rationale: string;
}

export interface MotionPlan {
  variants: MotionVariant[];
  sceneGraphVersion: string;
}

// Animation Config for Framer Motion rendering
export interface FramerMotionAnimation {
  initial: Record<string, number | string>;
  animate: Record<string, number | string>;
  transition: {
    duration: number;
    delay: number;
    ease: string | number[];
    type?: string;
    stiffness?: number;
    damping?: number;
  };
}

export interface AnimationLayerConfig {
  layerId: string;
  type: string;
  framerMotion: FramerMotionAnimation;
  children?: AnimationLayerConfig[];
}

export interface RenderConfig {
  variantId: string;
  variantType: 'professional' | 'energetic';
  totalDuration: number;
  layers: AnimationLayerConfig[];
  camera: {
    initial: { x: number; y: number; scale: number };
    animate: { x: number; y: number; scale: number };
    transition: { duration: number; ease: string };
  };
  backgroundColor: string;
  dimensions: { width: number; height: number };
}
