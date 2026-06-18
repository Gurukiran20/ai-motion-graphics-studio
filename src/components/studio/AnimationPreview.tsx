'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RenderConfig, SceneGraph, AnimationLayerConfig, FramerMotionAnimation } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

interface AnimationPreviewProps {
  renderConfig: RenderConfig;
  sceneGraph: SceneGraph;
  imageUrl?: string | null;
}

// ============================
// Ambient Particle System
// ============================
function AmbientParticles({ color, count = 30 }: { color: string; count?: number }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 3 + Math.random() * 6,
      delay: Math.random() * 5,
      opacity: 0.1 + Math.random() * 0.3,
    })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: color,
          }}
          animate={{
            y: [0, -30, -60, -30, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity, p.opacity * 0.5, p.opacity],
            scale: [1, 1.2, 1, 0.8, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ============================
// Gradient Mesh Background
// ============================
function GradientMesh({ brandColors }: { brandColors: SceneGraph['brandColors'] }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[0]">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 20% 50%, ${brandColors.primary}15 0%, transparent 50%),
                       radial-gradient(ellipse at 80% 20%, ${brandColors.accent}10 0%, transparent 50%),
                       radial-gradient(ellipse at 50% 80%, ${brandColors.secondary}10 0%, transparent 50%)`,
        }}
      />
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-[60%] h-[60%] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${brandColors.primary}08, transparent 70%)`,
          left: '-10%',
          top: '-10%',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[50%] h-[50%] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${brandColors.accent}06, transparent 70%)`,
          right: '-10%',
          bottom: '-10%',
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// ============================
// Vignette Overlay
// ============================
function VignetteOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[5]"
      style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
      }}
    />
  );
}

// ============================
// Premium Text Layer
// ============================
function PremiumTextLayer({
  text,
  style,
  layerType,
  brandColors,
  position,
  isPlaying,
  framerMotion,
  animationKey,
}: {
  text: string;
  style: {
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    fontFamily?: string;
    backgroundColor?: string;
    borderRadius?: number;
  };
  layerType: string;
  brandColors: SceneGraph['brandColors'];
  position: { x: number; y: number; width: number; height: number };
  isPlaying: boolean;
  framerMotion: FramerMotionAnimation;
  animationKey: number;
}) {
  const { initial, animate, transition } = framerMotion;
  const isCTA = layerType === 'cta';
  const isHeadline = layerType === 'headline';

  // Calculate font size responsively
  const fontSizeVw = ((style.fontSize || 16) * 0.12);
  const clampedFontSize = Math.min(Math.max(fontSizeVw, 1.5), 6);

  return (
    <motion.div
      key={`text-${animationKey}`}
      className="absolute flex items-center justify-center"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${position.width}%`,
        height: `${position.height}%`,
        zIndex: 20,
      }}
      initial={initial}
      animate={isPlaying ? animate : initial}
      transition={transition}
    >
      {isCTA ? (
        <motion.div
          className="relative"
          animate={isPlaying ? { 
            boxShadow: [
              `0 0 0px ${style.backgroundColor || brandColors.primary}`,
              `0 0 20px ${style.backgroundColor || brandColors.primary}60`,
              `0 0 40px ${style.backgroundColor || brandColors.primary}30`,
              `0 0 20px ${style.backgroundColor || brandColors.primary}60`,
            ] 
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="px-8 py-3 text-center whitespace-nowrap"
            style={{
              fontSize: `${clampedFontSize}vw`,
              fontWeight: style.fontWeight || 'bold',
              color: style.color || '#ffffff',
              backgroundColor: style.backgroundColor || brandColors.primary,
              borderRadius: `${style.borderRadius || 50}px`,
              fontFamily: style.fontFamily || 'inherit',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              boxShadow: `0 4px 20px ${style.backgroundColor || brandColors.primary}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
              border: '1px solid rgba(255,255,255,0.15)',
              letterSpacing: '0.05em',
            }}
          >
            {text}
          </div>
        </motion.div>
      ) : (
        <div
          style={{
            fontSize: `${clampedFontSize}vw`,
            fontWeight: style.fontWeight || (isHeadline ? '800' : '400'),
            fontFamily: style.fontFamily || 'inherit',
            color: style.color || '#ffffff',
            textShadow: isHeadline
              ? `0 0 40px ${style.color || '#ffffff'}30, 0 4px 12px rgba(0,0,0,0.5)`
              : `0 2px 8px rgba(0,0,0,0.4)`,
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: isHeadline ? '-0.02em' : '0.01em',
            maxWidth: '100%',
            overflow: 'hidden',
            background: isHeadline
              ? `linear-gradient(180deg, ${style.color || '#ffffff'}, ${style.color || '#ffffff'}cc)`
              : undefined,
            WebkitBackgroundClip: isHeadline ? 'text' : undefined,
            WebkitTextFillColor: isHeadline ? 'transparent' : undefined,
          }}
        >
          {text}
        </div>
      )}
    </motion.div>
  );
}

// ============================
// Animated Layer Component
// ============================
function AnimatedLayer({
  layerConfig,
  layerIndex,
  sceneGraph,
  isPlaying,
  imageUrl,
  animationKey,
}: {
  layerConfig: AnimationLayerConfig;
  layerIndex: number;
  sceneGraph: SceneGraph;
  isPlaying: boolean;
  imageUrl?: string | null;
  animationKey: number;
}) {
  const { layerId, framerMotion } = layerConfig;
  const { initial, animate, transition } = framerMotion;

  // Find the layer in the scene graph
  const layer = sceneGraph.layers?.find(l => l.id === layerId) ||
    sceneGraph.layers?.find(l => layerId.includes(l.id) || l.id.includes(layerId));

  if (!layer) return null;

  const pos = layer.position;
  const isTextLayer = ['headline', 'subheadline', 'cta', 'text'].includes(layer.type);
  const brandColors = sceneGraph.brandColors || {
    primary: '#10b981', secondary: '#6366f1', accent: '#F59E0B',
    background: '#0f172a', text: '#FFFFFF', additional: [],
  };

  // For text layers, use PremiumTextLayer
  if (isTextLayer && layer.content) {
    const styleFromScene = layer.type === 'headline' ? sceneGraph.headline?.style :
      layer.type === 'subheadline' ? sceneGraph.subheadline?.style :
      layer.type === 'cta' ? sceneGraph.cta?.style : null;

    return (
      <PremiumTextLayer
        text={layer.content}
        style={{
          fontSize: styleFromScene?.fontSize || layer.fontSize,
          fontWeight: styleFromScene?.fontWeight || layer.fontWeight,
          color: styleFromScene?.color || layer.color,
          fontFamily: styleFromScene?.fontFamily || layer.fontFamily,
          backgroundColor: styleFromScene?.backgroundColor || (layer.type === 'cta' ? brandColors.primary : undefined),
          borderRadius: styleFromScene?.borderRadius || layer.borderRadius,
        }}
        layerType={layer.type}
        brandColors={brandColors}
        position={pos}
        isPlaying={isPlaying}
        framerMotion={framerMotion}
        animationKey={animationKey}
      />
    );
  }

  // For logo layer
  if (layer.type === 'logo') {
    return (
      <motion.div
        key={`${layerId}-${layerIndex}-${animationKey}`}
        className="absolute flex items-center justify-center"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          width: `${pos.width}%`,
          height: `${pos.height}%`,
          zIndex: layer.zIndex || 15,
        }}
        initial={initial}
        animate={isPlaying ? animate : initial}
        transition={transition}
      >
        <div className="relative">
          <div
            className="rounded-lg flex items-center justify-center"
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))`,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '8%',
            }}
          >
            <div className="w-[60%] h-[60%] rounded-md" style={{
              background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`,
              boxShadow: `0 4px 12px ${brandColors.primary}40`,
            }} />
          </div>
        </div>
      </motion.div>
    );
  }

  // For image/icon/decorative layers
  if (layer.type === 'image' || layer.type === 'icon' || layer.type === 'decorative') {
    return (
      <motion.div
        key={`${layerId}-${layerIndex}-${animationKey}`}
        className="absolute"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          width: `${pos.width}%`,
          height: `${pos.height}%`,
          zIndex: layer.zIndex || 5,
        }}
        initial={initial}
        animate={isPlaying ? animate : initial}
        transition={transition}
      >
        <div
          className="w-full h-full"
          style={{
            backgroundColor: layer.color || `${brandColors.primary}20`,
            opacity: layer.opacity || 0.8,
            borderRadius: layer.borderRadius || 12,
            border: `1px solid ${brandColors.primary}15`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)`,
          }}
        />
      </motion.div>
    );
  }

  // For background/foreground layers
  return (
    <motion.div
      key={`${layerId}-${animationKey}`}
      className="absolute"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        width: `${pos.width}%`,
        height: `${pos.height}%`,
        zIndex: layer.zIndex || 0,
      }}
      initial={initial}
      animate={isPlaying ? animate : initial}
      transition={transition}
    >
      <div
        className="w-full h-full"
        style={{
          backgroundColor: layer.color || 'transparent',
          opacity: layer.opacity || 1,
          borderRadius: layer.borderRadius || 0,
        }}
      />
    </motion.div>
  );
}

// ============================
// Main Animation Preview
// ============================
export function AnimationPreview({ renderConfig, sceneGraph, imageUrl }: AnimationPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalDuration = renderConfig.totalDuration || 6;
  const brandColors = sceneGraph.brandColors || {
    primary: '#10b981', secondary: '#6366f1', accent: '#F59E0B',
    background: '#0f172a', text: '#FFFFFF', additional: [],
  };

  const handlePlay = useCallback(() => {
    setAnimationKey(prev => prev + 1);
    setIsPlaying(true);
    setHasPlayedOnce(true);
    setCurrentTime(0);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setAnimationKey(prev => prev + 1);
    setCurrentTime(0);
    setHasPlayedOnce(false);
  }, []);

  // Auto-play on first render
  useEffect(() => {
    if (!hasPlayedOnce && renderConfig) {
      const timer = setTimeout(() => {
        handlePlay();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [renderConfig, hasPlayedOnce, handlePlay]);

  // Timer for progress tracking
  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now();
      const timer = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setCurrentTime(Math.min(elapsed, totalDuration));
        if (elapsed >= totalDuration) {
          setIsPlaying(false);
          clearInterval(timer);
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isPlaying, totalDuration]);

  const progressPercent = (currentTime / totalDuration) * 100;

  // Camera movement with proper pixel values
  const cameraInitial = renderConfig.camera.initial;
  const cameraAnimate = renderConfig.camera.animate;

  return (
    <div className="space-y-4">
      {/* Preview Canvas */}
      <Card className={`relative overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'rounded-xl'
      }`} style={{
        backgroundColor: renderConfig.backgroundColor || '#0a0a1a',
      }}>
        <div
          ref={containerRef}
          className={`relative overflow-hidden ${
            isFullscreen ? 'w-full h-screen flex items-center justify-center' : ''
          }`}
          style={{
            aspectRatio: isFullscreen ? undefined : `${renderConfig.dimensions.width} / ${renderConfig.dimensions.height}`,
            maxHeight: isFullscreen ? '100vh' : '600px',
          }}
        >
          {/* Background with Ken Burns / camera movement */}
          <motion.div
            key={`camera-${animationKey}`}
            className="absolute inset-0"
            style={{ transformOrigin: 'center center' }}
            initial={{
              scale: cameraInitial.scale || 1,
            }}
            animate={isPlaying ? {
              scale: cameraAnimate.scale || 1,
            } : {
              scale: cameraInitial.scale || 1,
            }}
            transition={{
              duration: renderConfig.camera.transition.duration,
              ease: renderConfig.camera.transition.ease || 'easeInOut',
            }}
          >
            {/* Background image or color */}
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Design background"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'brightness(0.4) saturate(1.2)' }}
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${renderConfig.backgroundColor || '#0a0a1a'}, ${brandColors.primary}30, ${renderConfig.backgroundColor || '#0a0a1a'})`,
                }}
              />
            )}

            {/* Gradient mesh overlay */}
            <GradientMesh brandColors={brandColors} />

            {/* Ambient particles */}
            <AmbientParticles color={brandColors.accent || '#F59E0B'} count={20} />
          </motion.div>

          {/* Animated layers */}
          <div className="absolute inset-0 z-10">
            {renderConfig.layers.map((layerConfig, index) => (
              <AnimatedLayer
                key={`${layerConfig.layerId}-${index}-${animationKey}`}
                layerConfig={layerConfig}
                layerIndex={index}
                sceneGraph={sceneGraph}
                isPlaying={isPlaying}
                imageUrl={imageUrl}
                animationKey={animationKey}
              />
            ))}
          </div>

          {/* Vignette overlay */}
          <VignetteOverlay />

          {/* Bottom gradient for readability */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none z-[6]"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
            }}
          />

          {/* Fullscreen toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-black/40 text-white hover:bg-black/60 z-20 backdrop-blur-sm rounded-full"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          {/* Variant badge */}
          <Badge className="absolute top-3 left-3 bg-black/40 text-white border-0 z-20 backdrop-blur-sm rounded-full px-3">
            {renderConfig.variantType === 'professional' ? '✨ Professional' : '⚡ Energetic'}
          </Badge>

          {/* Playback overlay when not playing */}
          <AnimatePresence>
            {!isPlaying && hasPlayedOnce && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer"
                style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                onClick={handlePlay}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <Play className="h-7 w-7 text-white ml-1" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-black/30 relative">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${brandColors.primary}, ${brandColors.accent})`,
            }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" size="icon" onClick={handleReset} className="rounded-full">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          size="lg"
          className="w-36 gap-2 rounded-full"
          onClick={isPlaying ? handlePause : handlePlay}
          style={{
            background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})`,
          }}
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Play
            </>
          )}
        </Button>
        <div className="text-sm text-muted-foreground font-mono">
          {currentTime.toFixed(1)}s / {totalDuration}s
        </div>
      </div>
    </div>
  );
}
