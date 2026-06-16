'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, Clapperboard, Palette, BarChart3, 
  MessageSquare, Mic, ShieldCheck, Sparkles,
  ArrowRight, Zap, Brain, Layers
} from 'lucide-react';

const PIPELINE_STAGES = [
  {
    icon: Eye,
    title: 'Scene Understanding',
    description: 'VLM analyzes your design to extract layers, hierarchy, colors, typography, and layout structure.',
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Clapperboard,
    title: 'Motion Planning',
    description: 'LLM generates two animation variants — Professional & Energetic — with timeline, camera, and transitions.',
    color: 'text-sky-600',
    bg: 'bg-sky-500/10',
  },
  {
    icon: Palette,
    title: 'Motion Rendering',
    description: 'Renders the motion plan as a live Framer Motion animation preview with camera movements and transitions.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: BarChart3,
    title: 'Self-Evaluation',
    description: 'AI evaluates readability, motion quality, hierarchy, timing, and professional appearance.',
    color: 'text-violet-600',
    bg: 'bg-violet-500/10',
  },
  {
    icon: MessageSquare,
    title: 'Feedback-to-Fix',
    description: 'Natural language feedback is interpreted and applied to update the scene graph and motion plan.',
    color: 'text-rose-600',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Mic,
    title: 'Voice Editing',
    description: 'Speak your edits: "Move logo to top-right" — speech-to-text + LLM interprets and applies changes.',
    color: 'text-orange-600',
    bg: 'bg-orange-500/10',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Gate',
    description: 'Final quality review verifies text readability, layout integrity, branding, and motion smoothness.',
    color: 'text-teal-600',
    bg: 'bg-teal-500/10',
  },
];

export function HeroSection() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-2"
        >
          <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Motion Design
          </Badge>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
        >
          Turn Static Designs into
          <br />
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Motion Graphics
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Upload a marketing creative, SaaS launch graphic, or social media ad — 
          our 7-stage AI pipeline analyzes, plans, renders, evaluates, and refines 
          professional motion graphics automatically.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center gap-3"
        >
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
            <Brain className="h-3.5 w-3.5" />
            VLM + LLM Agents
          </Badge>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
            <Layers className="h-3.5 w-3.5" />
            Scene Graph
          </Badge>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
            <Zap className="h-3.5 w-3.5" />
            Framer Motion
          </Badge>
        </motion.div>

        {/* Arrow down */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" />
          </motion.div>
        </motion.div>
      </div>

      {/* Pipeline Stages */}
      <div className="space-y-4">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider"
        >
          7-Stage AI Pipeline
        </motion.h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {PIPELINE_STAGES.map((stage, index) => (
            <motion.div
              key={stage.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.08 }}
            >
              <Card className="p-4 h-full hover:shadow-md transition-shadow duration-300 group cursor-default">
                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-2 ${stage.bg} group-hover:scale-110 transition-transform`}>
                    <stage.icon className={`h-4 w-4 ${stage.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{index + 1}</span>
                      <h4 className="text-sm font-semibold">{stage.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{stage.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
