import type { MotionVariant, LayerAnimation, SceneGraph, AnimationLayerConfig, RenderConfig, FramerMotionAnimation } from '@/lib/types';

/**
 * Convert a MotionVariant + SceneGraph into a Framer Motion render configuration
 * This is the bridge between the AI motion plan and the actual browser animation
 */
export function convertToRenderConfig(
  sceneGraph: SceneGraph,
  motionVariant: MotionVariant
): RenderConfig {
  const layers = motionVariant.layerAnimations.map(anim => 
    convertLayerAnimation(anim, sceneGraph)
  );

  const camera = convertCameraMovement(motionVariant.cameraMovement, motionVariant.timeline.totalDuration);

  return {
    variantId: motionVariant.variantType,
    variantType: motionVariant.variantType as 'professional' | 'energetic',
    totalDuration: motionVariant.timeline.totalDuration,
    layers,
    camera,
    backgroundColor: sceneGraph.sceneGraph?.backgroundColor || sceneGraph.brandColors?.background || '#000000',
    dimensions: {
      width: sceneGraph.sceneGraph?.width || 1920,
      height: sceneGraph.sceneGraph?.height || 1080,
    },
  };
}

function convertLayerAnimation(
  animation: LayerAnimation,
  sceneGraph: SceneGraph
): AnimationLayerConfig {
  const framerMotion = convertToFramerMotion(animation);

  return {
    layerId: animation.layerId,
    type: animation.type,
    framerMotion,
  };
}

function convertToFramerMotion(animation: LayerAnimation): FramerMotionAnimation {
  const { type, property, duration, delay, easing, direction, intensity } = animation;
  
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

  const intensityVal = intensity || 0.7;
  const distance = intensityVal * 100;
  const scaleAmount = 0.3 + intensityVal * 0.7;

  let initial: Record<string, number | string> = {};
  let animate: Record<string, number | string> = {};

  switch (type) {
    case 'fadeIn':
      initial = { opacity: 0 };
      animate = { opacity: 1 };
      break;
    case 'fadeOut':
      initial = { opacity: 1 };
      animate = { opacity: 0 };
      break;
    case 'slideIn':
      switch (direction || 'up') {
        case 'left':
          initial = { opacity: 0, x: -distance };
          animate = { opacity: 1, x: 0 };
          break;
        case 'right':
          initial = { opacity: 0, x: distance };
          animate = { opacity: 1, x: 0 };
          break;
        case 'up':
          initial = { opacity: 0, y: distance };
          animate = { opacity: 1, y: 0 };
          break;
        case 'down':
          initial = { opacity: 0, y: -distance };
          animate = { opacity: 1, y: 0 };
          break;
      }
      break;
    case 'slideOut':
      switch (direction || 'down') {
        case 'left':
          initial = { x: 0 };
          animate = { x: -distance };
          break;
        case 'right':
          initial = { x: 0 };
          animate = { x: distance };
          break;
        case 'up':
          initial = { y: 0 };
          animate = { y: -distance };
          break;
        case 'down':
          initial = { y: 0 };
          animate = { y: distance };
          break;
      }
      break;
    case 'scaleIn':
      initial = { opacity: 0, scale: 0 };
      animate = { opacity: 1, scale: 1 };
      break;
    case 'scaleOut':
      initial = { scale: 1 };
      animate = { scale: 0, opacity: 0 };
      break;
    case 'rotate':
      initial = { rotate: 0 };
      animate = { rotate: 360 };
      break;
    case 'blur':
      initial = { filter: `blur(${20 * intensityVal}px)`, opacity: 0 };
      animate = { filter: 'blur(0px)', opacity: 1 };
      break;
    case 'typewriter':
      initial = { opacity: 0 };
      animate = { opacity: 1 };
      break;
    case 'bounce':
      initial = { opacity: 0, y: -distance * 2, scale: scaleAmount };
      animate = { opacity: 1, y: 0, scale: 1 };
      break;
    case 'pulse':
      initial = { scale: 1 };
      animate = { scale: 1.05 };
      break;
    case 'float':
      initial = { y: 0 };
      animate = { y: -10 };
      break;
    case 'glow':
      initial = { boxShadow: '0 0 0px rgba(255,255,255,0)' };
      animate = { boxShadow: `0 0 ${30 * intensityVal}px rgba(255,255,255,0.5)` };
      break;
    case 'clipReveal':
      initial = { opacity: 0, clipPath: 'inset(0 100% 0 0)' };
      animate = { opacity: 1, clipPath: 'inset(0 0% 0 0)' };
      break;
    case 'maskReveal':
      initial = { opacity: 0, scaleY: 0, transformOrigin: 'top' };
      animate = { opacity: 1, scaleY: 1, transformOrigin: 'top' };
      break;
    case 'parallax':
      initial = { y: 0 };
      animate = { y: -20 * intensityVal };
      break;
    default:
      initial = { opacity: 0 };
      animate = { opacity: 1 };
  }

  const easingValue = easing === 'spring' 
    ? undefined 
    : (easeMap[easing] || 'easeInOut');

  const transition: FramerMotionAnimation['transition'] = {
    duration,
    delay,
    ease: easingValue || 'easeInOut',
    ...(easing === 'spring' ? { type: 'spring', stiffness: 200, damping: 15 } : {}),
  };

  return { initial, animate, transition };
}

function convertCameraMovement(
  cameraMovements: MotionVariant['cameraMovement'],
  totalDuration: number
): RenderConfig['camera'] {
  if (!cameraMovements || cameraMovements.length === 0) {
    return {
      initial: { x: 0, y: 0, scale: 1 },
      animate: { x: 0, y: 0, scale: 1 },
      transition: { duration: totalDuration, ease: 'easeInOut' },
    };
  }

  const primary = cameraMovements[0];
  return {
    initial: { x: primary.startPoint.x, y: primary.startPoint.y, scale: primary.startPoint.scale },
    animate: { x: primary.endPoint.x, y: primary.endPoint.y, scale: primary.endPoint.scale },
    transition: { duration: primary.duration, ease: primary.easing || 'easeInOut' },
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
