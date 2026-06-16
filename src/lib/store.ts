'use client';

import { create } from 'zustand';
import type { SceneGraph, MotionVariant, RenderConfig, EvaluationResult, QualityReport, PipelineStage, PipelineState } from '@/lib/types';

interface ProjectStore {
  // Pipeline state
  pipelineState: PipelineState;
  setPipelineState: (state: Partial<PipelineState>) => void;
  resetPipeline: () => void;

  // Project data
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  imageName: string | null;
  setImageName: (name: string | null) => void;

  // Stage results
  sceneGraph: SceneGraph | null;
  setSceneGraph: (graph: SceneGraph | null) => void;
  rawAnalysis: string | null;
  setRawAnalysis: (analysis: string | null) => void;
  motionVariants: MotionVariant[];
  setMotionVariants: (variants: MotionVariant[]) => void;
  selectedVariant: 'professional' | 'energetic';
  setSelectedVariant: (variant: 'professional' | 'energetic') => void;
  renderConfig: RenderConfig | null;
  setRenderConfig: (config: RenderConfig | null) => void;
  evaluation: EvaluationResult | null;
  setEvaluation: (evaluation: EvaluationResult | null) => void;
  qualityReport: QualityReport | null;
  setQualityReport: (report: QualityReport | null) => void;

  // UI state
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showAnimation: boolean;
  setShowAnimation: (show: boolean) => void;
}

const initialPipelineState: PipelineState = {
  currentStage: 'idle',
  projectId: null,
  progress: 0,
  stageStatus: {
    idle: 'pending',
    uploading: 'pending',
    analyzing: 'pending',
    planning: 'pending',
    rendering: 'pending',
    evaluating: 'pending',
    feedback: 'pending',
    quality_gate: 'pending',
    complete: 'pending',
  },
  error: null,
};

export const useProjectStore = create<ProjectStore>((set) => ({
  // Pipeline state
  pipelineState: initialPipelineState,
  setPipelineState: (state) =>
    set((prev) => ({
      pipelineState: { ...prev.pipelineState, ...state },
    })),
  resetPipeline: () => set({ pipelineState: initialPipelineState }),

  // Project data
  projectId: null,
  setProjectId: (id) => set({ projectId: id }),
  imageUrl: null,
  setImageUrl: (url) => set({ imageUrl: url }),
  imageName: null,
  setImageName: (name) => set({ imageName: name }),

  // Stage results
  sceneGraph: null,
  setSceneGraph: (graph) => set({ sceneGraph: graph }),
  rawAnalysis: null,
  setRawAnalysis: (analysis) => set({ rawAnalysis: analysis }),
  motionVariants: [],
  setMotionVariants: (variants) => set({ motionVariants: variants }),
  selectedVariant: 'professional',
  setSelectedVariant: (variant) => set({ selectedVariant: variant }),
  renderConfig: null,
  setRenderConfig: (config) => set({ renderConfig: config }),
  evaluation: null,
  setEvaluation: (evaluation) => set({ evaluation }),
  qualityReport: null,
  setQualityReport: (report) => set({ qualityReport: report }),

  // UI state
  isProcessing: false,
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  error: null,
  setError: (error) => set({ error }),
  activeTab: 'upload',
  setActiveTab: (tab) => set({ activeTab: tab }),
  showAnimation: false,
  setShowAnimation: (show) => set({ showAnimation: show }),
}));
