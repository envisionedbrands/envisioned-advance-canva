'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Video, Mic, FileText, Image, Link } from 'lucide-react';
import type { NodeData } from '@/types/canvas';

const getSourceIcon = (sourceType?: string) => {
  switch (sourceType) {
    case 'video':
      return Video;
    case 'audio':
      return Mic;
    case 'pdf':
    case 'text':
      return FileText;
    case 'image':
      return Image;
    case 'url':
      return Link;
    default:
      return FileText;
  }
};

export const SourceNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as NodeData;
  const Icon = getSourceIcon(nodeData.sourceType);

  return (
    <div
      className={`rounded-lg border-2 bg-blue-50 p-4 shadow-md transition-all dark:bg-blue-950 ${
        selected
          ? 'border-blue-500 shadow-lg'
          : 'border-blue-200 hover:border-blue-400 dark:border-blue-800'
      }`}
      style={{ minWidth: 280, minHeight: 160 }}
    >
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500"
        style={{ width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500"
        style={{ width: 10, height: 10 }}
      />

      {/* Node header */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
          Source Content
        </div>
      </div>

      {/* Node content */}
      <div>
        <div className="mb-1 font-semibold text-foreground">
          {nodeData.label || 'Untitled Source'}
        </div>
        {nodeData.content && (
          <div className="line-clamp-2 text-sm text-muted-foreground">
            {nodeData.content}
          </div>
        )}
        {nodeData.sourceUrl && (
          <div className="mt-2 truncate text-xs text-blue-600 dark:text-blue-400">
            {nodeData.sourceUrl}
          </div>
        )}
      </div>
    </div>
  );
});

SourceNode.displayName = 'SourceNode';
