'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react';
import type { PipelineStage } from '@/lib/types';

interface PipelineStatusProps {
  currentStage: PipelineStage;
  stageStatus: Record<PipelineStage, 'pending' | 'in_progress' | 'completed' | 'failed'>;
}

const STAGES: { id: PipelineStage; label: string; icon: string }[] = [
  { id: 'uploading', label: 'Upload', icon: '📤' },
  { id: 'analyzing', label: 'Scene Analysis', icon: '🔍' },
  { id: 'planning', label: 'Motion Planning', icon: '🎬' },
  { id: 'rendering', label: 'Rendering', icon: '🎨' },
  { id: 'evaluating', label: 'Evaluation', icon: '📊' },
  { id: 'feedback', label: 'Feedback', icon: '💬' },
  { id: 'quality_gate', label: 'Quality Gate', icon: '✅' },
  { id: 'complete', label: 'Complete', icon: '🎉' },
];

export function PipelineStatus({ currentStage, stageStatus }: PipelineStatusProps) {
  const activeIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
        
        {/* Progress line */}
        <motion.div
          className="absolute top-4 left-0 h-0.5 bg-primary"
          initial={{ width: '0%' }}
          animate={{
            width: `${Math.max(0, (activeIndex / (STAGES.length - 1)) * 100)}%`,
          }}
          transition={{ duration: 0.5 }}
        />

        {STAGES.map((stage, index) => {
          const status = stageStatus[stage.id];
          const isActive = stage.id === currentStage;
          const isCompleted = status === 'completed';
          const isFailed = status === 'failed';
          const isInProgress = status === 'in_progress';

          return (
            <div
              key={stage.id}
              className="flex flex-col items-center relative z-10"
            >
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground border-primary'
                    : isFailed
                    ? 'bg-destructive text-destructive-foreground border-destructive'
                    : isInProgress
                    ? 'bg-primary/10 text-primary border-primary animate-pulse'
                    : isActive
                    ? 'bg-muted text-muted-foreground border-muted-foreground'
                    : 'bg-background text-muted-foreground border-muted'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: isActive || isInProgress ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isFailed ? (
                  <AlertCircle className="h-4 w-4" />
                ) : isInProgress ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-xs">{stage.icon}</span>
                )}
              </motion.div>
              <span className={`text-[10px] mt-1.5 text-center max-w-[60px] leading-tight ${
                isActive || isInProgress ? 'text-primary font-semibold' : 'text-muted-foreground'
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
