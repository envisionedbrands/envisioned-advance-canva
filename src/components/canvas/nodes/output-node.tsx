'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Send, ExternalLink } from 'lucide-react';
import type { NodeData } from '@/types/canvas';

export const OutputNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as NodeData;
  return (
    <div
      className={`rounded-lg border-2 bg-green-50 p-4 shadow-md transition-all dark:bg-green-950 ${
        selected
          ? 'border-green-500 shadow-lg'
          : 'border-green-200 hover:border-green-400 dark:border-green-800'
      }`}
      style={{ minWidth: 280, minHeight: 160 }}
    >
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-green-500"
        style={{ width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500"
        style={{ width: 10, height: 10 }}
      />

      {/* Node header */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500 text-white">
          <Send className="h-4 w-4" />
        </div>
        <div className="text-xs font-medium uppercase tracking-wide text-green-700 dark:text-green-300">
          Output Content
        </div>
      </div>

      {/* Node content */}
      <div>
        <div className="mb-1 font-semibold text-foreground">
          {nodeData.label || 'Untitled Output'}
        </div>
        {nodeData.platform && (
          <div className="mb-2 text-xs text-green-700 dark:text-green-300">
            Platform: {nodeData.platform}
          </div>
        )}
        {nodeData.content && (
          <div className="line-clamp-3 text-sm text-muted-foreground">
            {nodeData.content}
          </div>
        )}
        {nodeData.publishedUrl && (
          <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <ExternalLink className="h-3 w-3" />
            <span className="truncate">Published</span>
          </div>
        )}
      </div>
    </div>
  );
});

OutputNode.displayName = 'OutputNode';
