'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { SceneGraph, LayerInfo } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, Type, Palette, Layout, Eye } from 'lucide-react';

interface SceneGraphViewerProps {
  sceneGraph: SceneGraph;
  rawAnalysis?: string | null;
}

const LAYER_COLORS: Record<string, string> = {
  headline: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
  subheadline: 'bg-sky-500/20 text-sky-700 border-sky-500/30',
  cta: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  logo: 'bg-violet-500/20 text-violet-700 border-violet-500/30',
  image: 'bg-rose-500/20 text-rose-700 border-rose-500/30',
  icon: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
  background: 'bg-slate-500/20 text-slate-700 border-slate-500/30',
  foreground: 'bg-teal-500/20 text-teal-700 border-teal-500/30',
  decorative: 'bg-pink-500/20 text-pink-700 border-pink-500/30',
  text: 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30',
};

export function SceneGraphViewer({ sceneGraph, rawAnalysis }: SceneGraphViewerProps) {
  const layers = sceneGraph.layers || [];
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="space-y-4">
      {/* Scene Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="p-3 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Layers</p>
              <p className="text-lg font-bold">{layers.length}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-3 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Type className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Text Elements</p>
              <p className="text-lg font-bold">{layers.filter(l => ['headline', 'subheadline', 'cta', 'text'].includes(l.type)).length}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-3 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Palette className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Brand Colors</p>
              <div className="flex gap-1 mt-1">
                {sceneGraph.brandColors && [sceneGraph.brandColors.primary, sceneGraph.brandColors.secondary, sceneGraph.brandColors.accent].map((color, i) => (
                  <div key={i} className="w-4 h-4 rounded-full border" style={{ backgroundColor: color || '#888' }} />
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-3 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Layout className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Layout</p>
              <p className="text-sm font-semibold capitalize">{sceneGraph.layout?.type || 'N/A'}</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Key Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sceneGraph.headline && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-3 border-l-4 border-l-amber-500">
              <p className="text-xs font-medium text-muted-foreground mb-1">Headline</p>
              <p className="text-sm font-bold truncate">{sceneGraph.headline.text}</p>
              {sceneGraph.headline.style && (
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{sceneGraph.headline.style.fontWeight}</span>
                  <div className="w-3 h-3 rounded-sm border" style={{ backgroundColor: sceneGraph.headline.style.color }} />
                </div>
              )}
            </Card>
          </motion.div>
        )}
        {sceneGraph.subheadline && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card className="p-3 border-l-4 border-l-sky-500">
              <p className="text-xs font-medium text-muted-foreground mb-1">Subheadline</p>
              <p className="text-sm truncate">{sceneGraph.subheadline.text}</p>
            </Card>
          </motion.div>
        )}
        {sceneGraph.cta && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card className="p-3 border-l-4 border-l-emerald-500">
              <p className="text-xs font-medium text-muted-foreground mb-1">CTA</p>
              <p className="text-sm font-semibold truncate">{sceneGraph.cta.text}</p>
              {sceneGraph.cta.style?.backgroundColor && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 rounded-sm border" style={{ backgroundColor: sceneGraph.cta.style.backgroundColor }} />
                  <span className="text-xs text-muted-foreground">BG</span>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>

      {/* Layers */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Visual Layers (z-index order)</h3>
        </div>
        <ScrollArea className="max-h-64">
          <div className="space-y-2">
            <AnimatePresence>
              {sortedLayers.map((layer, index) => (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Badge variant="outline" className={LAYER_COLORS[layer.type] || 'bg-gray-500/20 text-gray-700 border-gray-500/30'}>
                    {layer.type}
                  </Badge>
                  <span className="text-sm flex-1 truncate">{layer.label}{layer.content ? `: ${layer.content}` : ''}</span>
                  <span className="text-xs text-muted-foreground">z:{layer.zIndex}</span>
                  {layer.color && (
                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: layer.color }} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </Card>

      {/* Visual Hierarchy */}
      {sceneGraph.hierarchy?.levels && sceneGraph.hierarchy.levels.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Visual Hierarchy</h3>
          <div className="space-y-2">
            {sceneGraph.hierarchy.levels.map((level, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-amber-500/20 text-amber-700' :
                  i === 1 ? 'bg-sky-500/20 text-sky-700' :
                  'bg-slate-500/20 text-slate-700'
                }`}>
                  {level.level}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{level.description}</p>
                  <div className="flex gap-1 mt-1">
                    {level.layerIds.map((id) => (
                      <Badge key={id} variant="secondary" className="text-xs">{id}</Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
