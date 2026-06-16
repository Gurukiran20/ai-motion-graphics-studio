'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RenderConfig, SceneGraph, AnimationLayerConfig } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

interface AnimationPreviewProps {
  renderConfig: RenderConfig;
  sceneGraph: SceneGraph;
  imageUrl?: string | null;
}

export function AnimationPreview({ renderConfig, sceneGraph, imageUrl }: AnimationPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const totalDuration = renderConfig.totalDuration || 6;

  const handlePlay = useCallback(() => {
    setAnimationKey(prev => prev + 1);
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setAnimationKey(prev => prev + 1);
    setCurrentTime(0);
  }, []);

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

  return (
    <div className="space-y-4">
      {/* Preview Canvas */}
      <Card className={`relative overflow-hidden bg-black ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'rounded-xl'
      }`}>
        <div className={`relative overflow-hidden ${
          isFullscreen ? 'w-full h-full flex items-center justify-center' : ''
        }`} style={{
          aspectRatio: isFullscreen ? undefined : `${renderConfig.dimensions.width} / ${renderConfig.dimensions.height}`,
          maxHeight: isFullscreen ? '100vh' : '500px',
        }}>
          {/* Background with camera movement */}
          <motion.div
            key={`camera-${animationKey}`}
            className="absolute inset-0"
            initial={{
              x: `${renderConfig.camera.initial.x}%`,
              y: `${renderConfig.camera.initial.y}%`,
              scale: renderConfig.camera.initial.scale,
            }}
            animate={isPlaying ? {
              x: `${renderConfig.camera.animate.x}%`,
              y: `${renderConfig.camera.animate.y}%`,
              scale: renderConfig.camera.animate.scale,
            } : {}}
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
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: renderConfig.backgroundColor || '#1a1a2e' }}
              />
            )}

            {/* Animated layers */}
            <div className="absolute inset-0">
              {renderConfig.layers.map((layerConfig, index) => (
                <AnimatedLayer
                  key={`${layerConfig.layerId}-${animationKey}`}
                  layerConfig={layerConfig}
                  sceneGraph={sceneGraph}
                  isPlaying={isPlaying}
                  imageUrl={imageUrl}
                />
              ))}
            </div>
          </motion.div>

          {/* Fullscreen toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 z-10"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          {/* Variant badge */}
          <Badge className="absolute top-2 left-2 bg-black/50 text-white border-0 z-10">
            {renderConfig.variantType === 'professional' ? '✨ Professional' : '⚡ Energetic'}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted relative">
          <div
            className="h-full bg-primary transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" size="icon" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          size="lg"
          className="w-32 gap-2"
          onClick={isPlaying ? handlePause : handlePlay}
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
        <div className="text-sm text-muted-foreground">
          {currentTime.toFixed(1)}s / {totalDuration}s
        </div>
      </div>
    </div>
  );
}

function AnimatedLayer({
  layerConfig,
  sceneGraph,
  isPlaying,
  imageUrl,
}: {
  layerConfig: AnimationLayerConfig;
  sceneGraph: SceneGraph;
  isPlaying: boolean;
  imageUrl?: string | null;
}) {
  const { layerId, framerMotion } = layerConfig;
  const { initial, animate, transition } = framerMotion;

  // Find the layer in the scene graph
  const layer = sceneGraph.layers?.find(l => l.id === layerId);
  
  if (!layer) {
    // Try to match by partial ID
    const partialMatch = sceneGraph.layers?.find(l => 
      layerId.includes(l.id) || l.id.includes(layerId)
    );
    if (!partialMatch) return null;
  }

  const matchedLayer = layer || sceneGraph.layers?.find(l => 
    layerId.includes(l.id) || l.id.includes(layerId)
  );

  if (!matchedLayer) return null;

  const pos = matchedLayer.position;
  const isTextLayer = ['headline', 'subheadline', 'cta', 'text'].includes(matchedLayer.type);

  return (
    <motion.div
      key={layerId}
      className="absolute"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        width: `${pos.width}%`,
        height: `${pos.height}%`,
        zIndex: matchedLayer.zIndex || 1,
        display: 'flex',
        alignItems: matchedLayer.type === 'cta' ? 'center' : 
          ['headline', 'subheadline'].includes(matchedLayer.type) ? 'flex-start' : 'center',
        justifyContent: ['cta', 'headline', 'subheadline'].includes(matchedLayer.type) ? 'center' : 'center',
      }}
      initial={initial}
      animate={isPlaying ? animate : initial}
      transition={transition}
    >
      {isTextLayer && matchedLayer.content ? (
        <div
          style={{
            color: matchedLayer.color || sceneGraph.brandColors?.text || '#ffffff',
            fontSize: `${(matchedLayer.fontSize || 16) * 0.15}vw`,
            fontWeight: matchedLayer.fontWeight || 'bold',
            fontFamily: matchedLayer.fontFamily || 'inherit',
            textAlign: 'center',
            lineHeight: 1.2,
            padding: matchedLayer.type === 'cta' ? '0.5em 1.5em' : '0',
            backgroundColor: matchedLayer.type === 'cta' 
              ? (sceneGraph.cta?.style?.backgroundColor || matchedLayer.color || '#4F46E5')
              : 'transparent',
            borderRadius: matchedLayer.type === 'cta' 
              ? `${matchedLayer.borderRadius || 8}px` 
              : '0',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          {matchedLayer.content}
        </div>
      ) : matchedLayer.type === 'logo' ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 bg-white/80 rounded" />
        </div>
      ) : matchedLayer.type === 'image' ? (
        <div
          className="w-full h-full rounded-lg"
          style={{
            backgroundColor: matchedLayer.color || '#333',
            opacity: matchedLayer.opacity || 1,
            borderRadius: matchedLayer.borderRadius || 8,
          }}
        />
      ) : (
        <div
          className="w-full h-full"
          style={{
            backgroundColor: matchedLayer.color || 'transparent',
            opacity: matchedLayer.opacity || 1,
            borderRadius: matchedLayer.borderRadius || 0,
          }}
        />
      )}
    </motion.div>
  );
}
