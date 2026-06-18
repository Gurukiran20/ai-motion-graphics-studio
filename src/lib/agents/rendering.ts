import type { MotionVariant, LayerAnimation, SceneGraph, AnimationLayerConfig, RenderConfig, FramerMotionAnimation } from '@/lib/types';

/**
 * Convert a MotionVariant + SceneGraph into a Framer Motion render configuration
 * This is the bridge between the AI motion plan and the actual browser animation
 * 
 * Key principles:
 * - Only use Framer Motion first-class animatable properties (x, y, scale, opacity, rotate)
 * - Never use CSS properties like filter, clipPath, transformOrigin as animation values
 * - When easing is 'spring', do NOT set 'ease' property (they conflict)
 * - Use compound animations for depth (opacity + transform combined)
 */
export function convertToRenderConfig(
  sceneGraph: SceneGraph,
  motionVariant: MotionVariant
): RenderConfig {
  const layers = motionVariant.layerAnimations.map(anim =>
    convertLayerAnimation(anim, sceneGraph, motionVariant.variantType)
  );

  const camera = convertCameraMovement(motionVariant.cameraMovement, motionVariant.timeline.totalDuration);

  return {
    variantId: motionVariant.variantType,
    variantType: motionVariant.variantType as 'professional' | 'energetic',
    totalDuration: motionVariant.timeline.totalDuration,
    layers,
    camera,
    backgroundColor: sceneGraph.sceneGraph?.backgroundColor || sceneGraph.brandColors?.background || '#0a0a1a',
    dimensions: {
      width: sceneGraph.sceneGraph?.width || 1920,
      height: sceneGraph.sceneGraph?.height || 1080,
    },
  };
}

function convertLayerAnimation(
  animation: LayerAnimation,
  sceneGraph: SceneGraph,
  variantType: string
): AnimationLayerConfig {
  const framerMotion = convertToFramerMotion(animation, sceneGraph, variantType);

  return {
    layerId: animation.layerId,
    type: animation.type,
    framerMotion,
  };
}

/**
 * Convert animation to Framer Motion compatible config
 * 
 * CRITICAL: Framer Motion only animates these transform properties:
 * x, y, z, scale, scaleX, scaleY, rotate, rotateX, rotateY, rotateZ,
 * skewX, skewY, opacity, originX, originY, originZ
 * 
 * Do NOT use: filter, clipPath, transformOrigin (as animation values)
 * Do NOT mix 'ease' with type: 'spring' (they conflict)
 */
function convertToFramerMotion(
  animation: LayerAnimation,
  sceneGraph: SceneGraph,
  variantType: string
): FramerMotionAnimation {
  const { type, duration, delay, easing, direction, intensity } = animation;

  const intensityVal = intensity || 0.7;
  const isProfessional = variantType === 'professional';

  // Find the layer to get its type for smarter animation
  const layer = sceneGraph.layers?.find(l => l.id === animation.layerId);
  const isHeadline = layer?.type === 'headline';
  const isSubheadline = layer?.type === 'subheadline';
  const isCTA = layer?.type === 'cta';
  const isLogo = layer?.type === 'logo';
  const isBackground = layer?.type === 'background';

  let initial: Record<string, number | string> = {};
  let animate: Record<string, number | string> = {};
  let customTransition: FramerMotionAnimation['transition'];

  // Slide distances proportional and reasonable (in pixels, not percentages)
  const slideDistance = isProfessional ? 30 : 60;
  const scaleFrom = isProfessional ? 0.85 : 0;

  switch (type) {
    case 'fadeIn':
      // Compound: fade + subtle scale for premium feel
      initial = { opacity: 0, scale: isProfessional ? 0.96 : 0.9 };
      animate = { opacity: 1, scale: 1 };
      break;

    case 'fadeOut':
      initial = { opacity: 1, scale: 1 };
      animate = { opacity: 0, scale: 0.95 };
      break;

    case 'slideIn':
      // Compound: slide + fade + slight scale for depth
      switch (direction || 'up') {
        case 'left':
          initial = { opacity: 0, x: -slideDistance, scale: 0.95 };
          animate = { opacity: 1, x: 0, scale: 1 };
          break;
        case 'right':
          initial = { opacity: 0, x: slideDistance, scale: 0.95 };
          animate = { opacity: 1, x: 0, scale: 1 };
          break;
        case 'up':
          initial = { opacity: 0, y: slideDistance, scale: 0.95 };
          animate = { opacity: 1, y: 0, scale: 1 };
          break;
        case 'down':
          initial = { opacity: 0, y: -slideDistance, scale: 0.95 };
          animate = { opacity: 1, y: 0, scale: 1 };
          break;
      }
      break;

    case 'slideOut':
      switch (direction || 'down') {
        case 'left':
          initial = { x: 0, opacity: 1 };
          animate = { x: -slideDistance, opacity: 0 };
          break;
        case 'right':
          initial = { x: 0, opacity: 1 };
          animate = { x: slideDistance, opacity: 0 };
          break;
        case 'up':
          initial = { y: 0, opacity: 1 };
          animate = { y: -slideDistance, opacity: 0 };
          break;
        case 'down':
          initial = { y: 0, opacity: 1 };
          animate = { y: slideDistance, opacity: 0 };
          break;
      }
      break;

    case 'scaleIn':
      // Compound: scale + fade for dramatic entrance
      initial = { opacity: 0, scale: scaleFrom };
      animate = { opacity: 1, scale: 1 };
      break;

    case 'scaleOut':
      initial = { scale: 1, opacity: 1 };
      animate = { scale: 0, opacity: 0 };
      break;

    case 'rotate':
      initial = { rotate: -10, scale: 0.9, opacity: 0 };
      animate = { rotate: 0, scale: 1, opacity: 1 };
      break;

    case 'blur':
      // Framer Motion can't animate filter directly
      // Use opacity + scale as a blur-like effect
      initial = { opacity: 0, scale: isProfessional ? 0.97 : 0.93 };
      animate = { opacity: 1, scale: 1 };
      break;

    case 'typewriter':
      // Text reveal: fade + slide from left
      initial = { opacity: 0, x: -15 };
      animate = { opacity: 1, x: 0 };
      break;

    case 'bounce':
      initial = { opacity: 0, y: isProfessional ? -40 : -80, scale: isProfessional ? 0.8 : 0.3 };
      animate = { opacity: 1, y: 0, scale: 1 };
      break;

    case 'pulse':
      initial = { scale: 1 };
      animate = { scale: isProfessional ? 1.03 : 1.08 };
      break;

    case 'float':
      initial = { y: 0 };
      animate = { y: isProfessional ? -6 : -15 };
      break;

    case 'glow':
      // Framer Motion can't animate box-shadow directly
      // Use scale + opacity for glow-like effect
      initial = { opacity: 0, scale: 0.95 };
      animate = { opacity: 1, scale: 1 };
      break;

    case 'clipReveal':
      // clipPath is not animatable in Framer Motion
      // Use slide from left + fade (mimics clipReveal visually)
      initial = { opacity: 0, x: -25, skewX: isProfessional ? 0 : -3 };
      animate = { opacity: 1, x: 0, skewX: 0 };
      break;

    case 'maskReveal':
      // scaleY is supported by Framer Motion
      initial = { opacity: 0, scaleY: 0 };
      animate = { opacity: 1, scaleY: 1 };
      break;

    case 'parallax':
      initial = { y: 0 };
      animate = { y: isProfessional ? -8 : -25 };
      break;

    case 'colorShift':
      initial = { opacity: 0, scale: 0.98 };
      animate = { opacity: 1, scale: 1 };
      break;

    case 'shake':
      initial = { x: 0, rotate: 0 };
      animate = { x: 0, rotate: 0 };
      break;

    default:
      initial = { opacity: 0, scale: 0.95 };
      animate = { opacity: 1, scale: 1 };
  }

  // Build transition properly
  // CRITICAL: When using spring, do NOT set 'ease' - they conflict in Framer Motion
  const isSpring = easing === 'spring';

  // Professional uses longer, smoother durations; Energetic uses shorter, punchier
  const adjustedDuration = isProfessional
    ? duration * 1.2
    : duration * 0.85;

  if (isSpring) {
    customTransition = {
      duration: adjustedDuration,
      delay,
      type: 'spring' as const,
      stiffness: isProfessional ? 120 : 300,
      damping: isProfessional ? 20 : 15,
      mass: isProfessional ? 1 : 0.8,
    };
  } else {
    const easeMap: Record<string, string | number[]> = {
      linear: 'linear',
      easeIn: 'easeIn',
      easeOut: 'easeOut',
      easeInOut: 'easeInOut',
      anticipate: 'anticipate',
      backOut: [0.34, 1.56, 0.64, 1],
      circIn: 'circIn',
      circOut: 'circOut',
      circInOut: 'circInOut',
    };
    const easingValue = easeMap[easing] || 'easeInOut';

    customTransition = {
      duration: adjustedDuration,
      delay,
      ease: easingValue,
    };
  }

  // Special transition overrides for specific layer types
  if (isHeadline && type === 'clipReveal') {
    customTransition = {
      duration: adjustedDuration * 1.5,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom ease for text reveals
    };
  }

  if (isCTA && type === 'scaleIn') {
    customTransition = {
      type: 'spring' as const,
      stiffness: isProfessional ? 150 : 400,
      damping: isProfessional ? 18 : 12,
      delay,
    };
  }

  return { initial, animate, transition: customTransition };
}

/**
 * Convert camera movement to render config
 * Uses scale only (not x/y percentages which don't work with Framer Motion)
 */
function convertCameraMovement(
  cameraMovements: MotionVariant['cameraMovement'],
  totalDuration: number
): RenderConfig['camera'] {
  if (!cameraMovements || cameraMovements.length === 0) {
    return {
      initial: { x: 0, y: 0, scale: 1 },
      animate: { x: 0, y: 0, scale: 1.03 }, // Subtle Ken Burns zoom
      transition: { duration: totalDuration, ease: 'easeInOut' },
    };
  }

  const primary = cameraMovements[0];
  return {
    initial: { x: 0, y: 0, scale: primary.startPoint.scale || 1 },
    animate: { x: 0, y: 0, scale: primary.endPoint.scale || 1.05 },
    transition: { duration: primary.duration || totalDuration, ease: primary.easing || 'easeInOut' },
  };
}

/**
 * Generate CSS keyframes from a render config for export
 */
export function generateCSSKeyframes(config: RenderConfig): string {
  let css = '';

  config.layers.forEach((layer, index) => {
    const { initial, animate, transition } = layer.framerMotion;
    const name = `layer-${layer.layerId}-${index}`;

    css += `@keyframes ${name} {\n`;
    css += `  from {\n`;
    Object.entries(initial).forEach(([prop, val]) => {
      css += `    ${camelToKebab(prop)}: ${val};\n`;
    });
    css += `  }\n`;
    css += `  to {\n`;
    Object.entries(animate).forEach(([prop, val]) => {
      css += `    ${camelToKebab(prop)}: ${val};\n`;
    });
    css += `  }\n`;
    css += `}\n\n`;
  });

  return css;
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
