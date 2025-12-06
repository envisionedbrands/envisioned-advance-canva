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
import { X, Save } from 'lucide-react';
import type { NodeData } from '@/types/canvas';

interface NodeDetailPanelProps {
  node: Node | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: Partial<NodeData>) => void;
}

export function NodeDetailPanel({
  node,
  onClose,
  onUpdate,
}: NodeDetailPanelProps) {
  const [label, setLabel] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceType, setSourceType] = useState<string>('url');
  const [saving, setSaving] = useState(false);

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

  const nodeData = node.data as NodeData;
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
