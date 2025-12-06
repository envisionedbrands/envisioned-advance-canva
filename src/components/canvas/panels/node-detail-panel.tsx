'use client';

import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Save, Sparkles, Loader2 } from 'lucide-react';
import type { NodeData } from '@/types/canvas';

interface NodeDetailPanelProps {
  node: Node | null;
  boardId: string;
  onClose: () => void;
  onUpdate: (nodeId: string, data: Partial<NodeData>) => void;
}

export function NodeDetailPanel({
  node,
  boardId,
  onClose,
  onUpdate,
}: NodeDetailPanelProps) {
  const [label, setLabel] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceType, setSourceType] = useState<string>('url');
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    summary?: string;
    keyPoints?: string[];
    topics?: string[];
    entities?: string[];
  } | null>(null);

  useEffect(() => {
    if (node) {
      const data = node.data as NodeData;
      setLabel(data.label || '');
      setContent(data.content || '');
      setSourceUrl(data.sourceUrl || '');
      setSourceType(data.sourceType || 'url');
    }
  }, [node]);

  if (!node) return null;

  const isSourceNode = node.type === 'source';

  const handleSave = async () => {
    setSaving(true);

    const updates: Partial<NodeData> = {
      label: label.trim(),
      content: content.trim(),
    };

    if (isSourceNode) {
      updates.sourceUrl = sourceUrl.trim();
      updates.sourceType = sourceType as 'video' | 'audio' | 'pdf' | 'text' | 'url';
    }

    await onUpdate(node.id, updates);
    setSaving(false);

    // Trigger AI processing for YouTube videos
    if (isSourceNode && sourceUrl.trim() && sourceUrl.includes('youtube')) {
      await processYouTubeVideo();
    }
  };

  const processYouTubeVideo = async () => {
    setProcessing(true);

    try {
      const response = await fetch('/api/ai/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: node!.id,
          boardId,
          videoUrl: sourceUrl.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Video processing started:', data);
        // Poll for results or use websockets in production
        pollForResults(data.assetId);
      } else {
        const error = await response.json();
        console.error('Failed to process video:', error);
      }
    } catch (error) {
      console.error('Error processing video:', error);
    } finally {
      setProcessing(false);
    }
  };

  const pollForResults = async (assetId: string) => {
    // Poll every 3 seconds for up to 2 minutes
    let attempts = 0;
    const maxAttempts = 40;

    const poll = setInterval(async () => {
      try {
        const response = await fetch(`/api/ai/asset/${assetId}`);
        if (response.ok) {
          const asset = await response.json();
          if (asset.status === 'ready') {
            setAiInsights(asset.processed_data);
            clearInterval(poll);
          } else if (asset.status === 'error') {
            console.error('Video processing failed');
            clearInterval(poll);
          }
        }
      } catch (error) {
        console.error('Error polling for results:', error);
      }

      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(poll);
      }
    }, 3000);
  };

  return (
    <div className="absolute right-0 top-0 z-20 flex h-full w-96 flex-col border-l bg-background shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h3 className="text-lg font-semibold">Edit Node</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Node Type Badge */}
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide">
            {node.type} Node
          </div>
        </div>

        {/* Label Field */}
        <div className="space-y-2">
          <Label htmlFor="label">Title</Label>
          <Input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter node title..."
          />
        </div>

        {/* Source Type (only for source nodes) */}
        {isSourceNode && (
          <div className="space-y-2">
            <Label htmlFor="sourceType">Source Type</Label>
            <Select value={sourceType} onValueChange={setSourceType}>
              <SelectTrigger id="sourceType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url">URL / YouTube</SelectItem>
                <SelectItem value="video">Video File</SelectItem>
                <SelectItem value="audio">Audio File</SelectItem>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="text">Text Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Source URL (only for source nodes) */}
        {isSourceNode && (
          <div className="space-y-2">
            <Label htmlFor="sourceUrl">
              {sourceType === 'url' ? 'YouTube Link or URL' : 'File URL'}
            </Label>
            <Input
              id="sourceUrl"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder={
                sourceType === 'url'
                  ? 'https://www.youtube.com/watch?v=...'
                  : 'https://...'
              }
            />
            {sourceUrl && sourceType === 'url' && sourceUrl.includes('youtube') && (
              <p className="text-xs text-muted-foreground">
                ✓ YouTube link detected
              </p>
            )}
          </div>
        )}

        {/* Content/Notes Field */}
        <div className="space-y-2">
          <Label htmlFor="content">
            {isSourceNode ? 'Notes / Description' : 'Content'}
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add notes or description..."
            rows={6}
          />
        </div>

        {/* AI Processing Status */}
        {processing && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="font-medium text-sm">Processing video...</p>
                <p className="text-xs text-muted-foreground">
                  Extracting transcript and analyzing content
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights */}
        {aiInsights && (
          <div className="space-y-4 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                AI Analysis
              </h4>
            </div>

            {/* Summary */}
            {aiInsights.summary && (
              <div className="space-y-1">
                <Label className="text-xs text-purple-700 dark:text-purple-300">
                  Summary
                </Label>
                <p className="text-sm text-purple-900 dark:text-purple-100">
                  {aiInsights.summary}
                </p>
              </div>
            )}

            {/* Key Points */}
            {aiInsights.keyPoints && aiInsights.keyPoints.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-purple-700 dark:text-purple-300">
                  Key Points
                </Label>
                <ul className="space-y-1">
                  {aiInsights.keyPoints.map((point: string, index: number) => (
                    <li
                      key={index}
                      className="text-sm text-purple-900 dark:text-purple-100"
                    >
                      • {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Topics */}
            {aiInsights.topics && aiInsights.topics.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-purple-700 dark:text-purple-300">
                  Topics
                </Label>
                <div className="flex flex-wrap gap-2">
                  {aiInsights.topics.map((topic: string, index: number) => (
                    <span
                      key={index}
                      className="rounded-full bg-purple-200 px-2 py-1 text-xs text-purple-800 dark:bg-purple-800 dark:text-purple-200"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Node ID (read-only) */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Node ID</Label>
          <code className="block rounded-md bg-muted px-3 py-2 text-xs">
            {node.id}
          </code>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-6 py-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
          size="lg"
        >
          {saving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
