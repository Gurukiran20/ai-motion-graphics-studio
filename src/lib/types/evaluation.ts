// Evaluation Types - Stage 4: Self-Evaluation

export interface EvaluationScores {
  readability: number;      // 0-10
  motionQuality: number;    // 0-10
  visualHierarchy: number;  // 0-10
  layoutQuality: number;    // 0-10
  timing: number;           // 0-10
  professionalAppearance: number; // 0-10
}

export interface EvaluationIssue {
  category: keyof EvaluationScores;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestedFix: string;
}

export interface EvaluationResult {
  scores: EvaluationScores;
  overallScore: number;
  issues: EvaluationIssue[];
  recommendations: string[];
  passed: boolean;
}

// Feedback Types - Stage 5: Feedback-to-Fix

export interface FeedbackIntent {
  original: string;
  interpreted: string;
  targetLayers: string[];
  action: 'move' | 'resize' | 'restyle' | 'retiming' | 'replace' | 'add' | 'remove' | 'adjust_animation' | 'change_style';
  parameters: Record<string, unknown>;
}

export interface FeedbackResult {
  feedback: string;
  interpretedIntent: FeedbackIntent;
  sceneGraphUpdate: Record<string, unknown> | null;
  motionPlanUpdate: Record<string, unknown> | null;
  applied: boolean;
}

// Quality Gate Types - Stage 7: Final Quality Gate

export interface QualityReport {
  textReadability: number;
  layoutIntegrity: number;
  brandingConsistency: number;
  motionSmoothness: number;
  timingQuality: number;
  professionalAppearance: number;
  overallScore: number;
  passed: boolean;
  issues: string[];
  details: Record<string, unknown>;
}

// Voice Editing Types - Stage 6

export interface VoiceEditCommand {
  transcription: string;
  intent: FeedbackIntent;
  sceneGraphUpdate: Record<string, unknown> | null;
  motionPlanUpdate: Record<string, unknown> | null;
}

// Pipeline Status Types

export type PipelineStage = 
  | 'idle'
  | 'uploading'
  | 'analyzing'
  | 'planning'
  | 'rendering'
  | 'evaluating'
  | 'feedback'
  | 'quality_gate'
  | 'complete';

export interface PipelineState {
  currentStage: PipelineStage;
  projectId: string | null;
  progress: number; // 0-100
  stageStatus: Record<PipelineStage, 'pending' | 'in_progress' | 'completed' | 'failed'>;
  error: string | null;
}
