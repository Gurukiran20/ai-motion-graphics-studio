'use client';

import { motion } from 'framer-motion';
import type { EvaluationResult } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';

interface EvaluationViewerProps {
  evaluation: EvaluationResult;
}

const SCORE_COLORS: Record<string, string> = {
  readability: 'bg-amber-500',
  motionQuality: 'bg-sky-500',
  visualHierarchy: 'bg-emerald-500',
  layoutQuality: 'bg-violet-500',
  timing: 'bg-rose-500',
  professionalAppearance: 'bg-teal-500',
};

const SCORE_LABELS: Record<string, string> = {
  readability: 'Readability',
  motionQuality: 'Motion Quality',
  visualHierarchy: 'Visual Hierarchy',
  layoutQuality: 'Layout Quality',
  timing: 'Timing',
  professionalAppearance: 'Professional Appearance',
};

export function EvaluationViewer({ evaluation }: EvaluationViewerProps) {
  const scores = evaluation.scores;
  const overallScore = evaluation.overallScore;
  const passed = evaluation.passed;

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center"
      >
        <Card className="p-6 text-center w-full max-w-sm">
          <div className="relative w-24 h-24 mx-auto mb-3">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-muted" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={overallScore >= 7 ? '#22c55e' : overallScore >= 5 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeDasharray={`${overallScore * 28.27} 282.7`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{overallScore.toFixed(1)}</span>
            </div>
          </div>
          <Badge className={passed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}>
            {passed ? (
              <><CheckCircle2 className="h-3 w-3 mr-1" /> Passed</>
            ) : (
              <><XCircle className="h-3 w-3 mr-1" /> Needs Improvement</>
            )}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">Threshold: 7.0/10</p>
        </Card>
      </motion.div>

      {/* Individual Scores */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Score Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(scores).map(([key, value], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{SCORE_LABELS[key] || key}</span>
                <span className={`text-sm font-semibold ${
                  value >= 7 ? 'text-emerald-600' : value >= 5 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {value}/10
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${SCORE_COLORS[key] || 'bg-gray-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${value * 10}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Issues */}
      {evaluation.issues && evaluation.issues.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Issues Found
          </h3>
          <div className="space-y-2">
            {evaluation.issues.map((issue, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={
                    issue.severity === 'high' ? 'border-rose-500 text-rose-600' :
                    issue.severity === 'medium' ? 'border-amber-500 text-amber-600' :
                    'border-sky-500 text-sky-600'
                  }>
                    {issue.severity}
                  </Badge>
                  <Badge variant="outline">{SCORE_LABELS[issue.category] || issue.category}</Badge>
                </div>
                <p className="text-sm">{issue.description}</p>
                <p className="text-xs text-muted-foreground mt-1">💡 {issue.suggestedFix}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {evaluation.recommendations && evaluation.recommendations.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Recommendations
          </h3>
          <div className="space-y-2">
            {evaluation.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-sm">{rec}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
