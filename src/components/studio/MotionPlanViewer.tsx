'use client';

import { motion } from 'framer-motion';
import type { MotionVariant } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Camera, Zap, ArrowRight, Sparkles, Briefcase } from 'lucide-react';

interface MotionPlanViewerProps {
  variants: MotionVariant[];
  selectedVariant: 'professional' | 'energetic';
  onSelectVariant: (variant: 'professional' | 'energetic') => void;
}

export function MotionPlanViewer({ variants, selectedVariant, onSelectVariant }: MotionPlanViewerProps) {
  const professional = variants.find(v => v.variantType === 'professional');
  const energetic = variants.find(v => v.variantType === 'energetic');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Professional Variant */}
        {professional && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              className={`p-5 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedVariant === 'professional'
                  ? 'ring-2 ring-primary shadow-lg scale-[1.02]'
                  : 'hover:scale-[1.01]'
              }`}
              onClick={() => onSelectVariant('professional')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-amber-500/10 p-2">
                    <Briefcase className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">{professional.name}</h3>
                    <Badge variant="outline" className="text-xs mt-1">Professional</Badge>
                  </div>
                </div>
                {selectedVariant === 'professional' && (
                  <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-4">{professional.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{professional.timeline?.totalDuration || 6}s duration</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{professional.cameraMovement?.length || 0} camera moves</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{professional.layerAnimations?.length || 0} animations</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{professional.transitions?.length || 0} transitions</span>
                </div>
              </div>

              {/* Animation Timeline Preview */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Animation Timeline</p>
                <div className="space-y-1.5">
                  {professional.layerAnimations?.slice(0, 5).map((anim, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-20 text-xs text-muted-foreground truncate">{anim.layerId}</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
                        <div
                          className="absolute h-full bg-amber-500/60 rounded-full"
                          style={{
                            left: `${(anim.delay / (professional.timeline?.totalDuration || 6)) * 100}%`,
                            width: `${(anim.duration / (professional.timeline?.totalDuration || 6)) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="w-10 text-xs text-muted-foreground">{anim.duration}s</div>
                    </div>
                  ))}
                  {professional.layerAnimations?.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">+{professional.layerAnimations.length - 5} more</p>
                  )}
                </div>
              </div>

              {professional.rationale && (
                <div className="mt-3 p-2 bg-amber-500/5 rounded-md border border-amber-500/10">
                  <p className="text-xs text-muted-foreground">{professional.rationale}</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Energetic Variant */}
        {energetic && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              className={`p-5 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedVariant === 'energetic'
                  ? 'ring-2 ring-primary shadow-lg scale-[1.02]'
                  : 'hover:scale-[1.01]'
              }`}
              onClick={() => onSelectVariant('energetic')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-rose-500/10 p-2">
                    <Zap className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">{energetic.name}</h3>
                    <Badge variant="outline" className="text-xs mt-1">Energetic</Badge>
                  </div>
                </div>
                {selectedVariant === 'energetic' && (
                  <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-4">{energetic.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{energetic.timeline?.totalDuration || 4}s duration</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{energetic.cameraMovement?.length || 0} camera moves</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{energetic.layerAnimations?.length || 0} animations</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{energetic.transitions?.length || 0} transitions</span>
                </div>
              </div>

              {/* Animation Timeline Preview */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Animation Timeline</p>
                <div className="space-y-1.5">
                  {energetic.layerAnimations?.slice(0, 5).map((anim, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-20 text-xs text-muted-foreground truncate">{anim.layerId}</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
                        <div
                          className="absolute h-full bg-rose-500/60 rounded-full"
                          style={{
                            left: `${(anim.delay / (energetic.timeline?.totalDuration || 4)) * 100}%`,
                            width: `${(anim.duration / (energetic.timeline?.totalDuration || 4)) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="w-10 text-xs text-muted-foreground">{anim.duration}s</div>
                    </div>
                  ))}
                  {energetic.layerAnimations?.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">+{energetic.layerAnimations.length - 5} more</p>
                  )}
                </div>
              </div>

              {energetic.rationale && (
                <div className="mt-3 p-2 bg-rose-500/5 rounded-md border border-rose-500/10">
                  <p className="text-xs text-muted-foreground">{energetic.rationale}</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          className="gap-2"
          onClick={() => onSelectVariant(selectedVariant)}
        >
          <Sparkles className="h-4 w-4" />
          Generate {selectedVariant === 'professional' ? 'Professional' : 'Energetic'} Animation
        </Button>
      </div>
    </div>
  );
}
