'use client';

import { motion } from 'framer-motion';
import type { QualityReport } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Shield, AlertTriangle } from 'lucide-react';

interface QualityGateViewerProps {
  report: QualityReport;
}

const CRITERIA_CONFIG = [
  { key: 'textReadability', label: 'Text Readability', icon: '📝' },
  { key: 'layoutIntegrity', label: 'Layout Integrity', icon: '📐' },
  { key: 'brandingConsistency', label: 'Branding Consistency', icon: '🎨' },
  { key: 'motionSmoothness', label: 'Motion Smoothness', icon: '✨' },
  { key: 'timingQuality', label: 'Timing Quality', icon: '⏱️' },
  { key: 'professionalAppearance', label: 'Professional Appearance', icon: '💎' },
] as const;

export function QualityGateViewer({ report }: QualityGateViewerProps) {
  const passed = report.passed;
  const overallScore = report.overallScore;
  const details = report.details as Record<string, unknown> | undefined;

  return (
    <div className="space-y-4">
      {/* Final Verdict */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <Card className={`p-6 text-center border-2 ${
          passed ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-rose-500/50 bg-rose-500/5'
        }`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className={`h-8 w-8 ${passed ? 'text-emerald-500' : 'text-rose-500'}`} />
            <h2 className="text-2xl font-bold">
              {passed ? 'Quality Gate Passed' : 'Quality Gate Failed'}
            </h2>
          </div>

          <div className="text-5xl font-bold mb-2">
            {overallScore.toFixed(1)}
          </div>
          <p className="text-muted-foreground">Overall Quality Score</p>

          <Badge className={`mt-3 ${passed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
            {passed ? (
              <><CheckCircle2 className="h-3 w-3 mr-1" /> Ready for Export</>
            ) : (
              <><XCircle className="h-3 w-3 mr-1" /> Needs Revision</>
            )}
          </Badge>
        </Card>
      </motion.div>

      {/* Criteria Scores */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Quality Criteria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CRITERIA_CONFIG.map((criteria, index) => {
            const score = report[criteria.key as keyof QualityReport] as number;
            const isPassing = score >= 7;

            return (
              <motion.div
                key={criteria.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border ${
                  isPassing ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{criteria.icon}</span>
                    <span className="text-sm font-medium">{criteria.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      isPassing ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {score.toFixed(1)}
                    </span>
                    {isPassing ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-500" />
                    )}
                  </div>
                </div>
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${isPassing ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score * 10}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Issues */}
      {report.issues && report.issues.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Issues to Address
          </h3>
          <div className="space-y-2">
            {report.issues.map((issue, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-2 p-2 rounded-lg bg-muted/50"
              >
                <XCircle className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{issue}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Details Summary */}
      {details && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-2">Assessment Summary</h3>
          <p className="text-sm text-muted-foreground">{details.summary as string}</p>
          
          {(details.strengths as string[])?.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-emerald-600 mb-1">Strengths</h4>
              {(details.strengths as string[]).map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
          
          {(details.weaknesses as string[])?.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-rose-600 mb-1">Weaknesses</h4>
              {(details.weaknesses as string[]).map((w, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-3 w-3 text-rose-500" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
