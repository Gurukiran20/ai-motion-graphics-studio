'use client';

import { useState } from 'react';
import { Send, Mic, MicOff, Loader2, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useProjectStore } from '@/lib/store';

interface FeedbackPanelProps {
  onSubmitFeedback: (feedback: string) => Promise<void>;
  onSubmitVoice: (audioBlob: Blob) => Promise<void>;
}

export function FeedbackPanel({ onSubmitFeedback, onSubmitVoice }: FeedbackPanelProps) {
  const [feedback, setFeedback] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const { error } = useProjectStore();

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmitFeedback(feedback.trim());
      setFeedback('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setIsSubmitting(true);
        try {
          await onSubmitVoice(blob);
        } finally {
          setIsSubmitting(false);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch {
      console.error('Microphone access denied');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const exampleFeedbacks = [
    'Move logo to top-right',
    'Make CTA larger and bolder',
    'Use faster animation timing',
    'Make it more premium feeling',
    'Smooth out the transitions',
    'Add more spacing between elements',
  ];

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Provide Feedback</h3>
        </div>

        {/* Text Feedback */}
        <div className="space-y-3">
          <Textarea
            placeholder="Describe what you'd like to change... e.g., 'Move the logo to the top right and make the CTA larger'"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[80px] resize-none"
            disabled={isSubmitting}
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!feedback.trim() || isSubmitting}
              className="flex-1 gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Apply Feedback
            </Button>
            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              size="icon"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isSubmitting}
              className="relative"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                </>
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Voice recording status */}
        {isRecording && (
          <div className="mt-3 p-3 bg-rose-500/10 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            <span className="text-sm text-rose-600 font-medium">Recording... Click stop when done</span>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </Card>

      {/* Example Feedbacks */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Quick Suggestions</h3>
        <div className="flex flex-wrap gap-2">
          {exampleFeedbacks.map((example) => (
            <Badge
              key={example}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 transition-colors py-1 px-3"
              onClick={() => setFeedback(example)}
            >
              {example}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
