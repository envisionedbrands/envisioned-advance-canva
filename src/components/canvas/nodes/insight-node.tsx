'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Sparkles, Tag } from 'lucide-react';
import type { NodeData } from '@/types/canvas';

export const InsightNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as NodeData;
  return (
    <div
      className={`rounded-lg border-2 bg-purple-50 p-4 shadow-md transition-all dark:bg-purple-950 ${
        selected
          ? 'border-purple-500 shadow-lg'
          : 'border-purple-200 hover:border-purple-400 dark:border-purple-800'
      }`}
      style={{ minWidth: 280, minHeight: 160 }}
    >
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500"
        style={{ width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-500"
        style={{ width: 10, height: 10 }}
      />

      {/* Node header */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="text-xs font-medium uppercase tracking-wide text-purple-700 dark:text-purple-300">
          AI Insight
        </div>
      </div>

      {/* Node content */}
      <div>
        <div className="mb-1 font-semibold text-foreground">
          {nodeData.label || 'Untitled Insight'}
        </div>
        {nodeData.content && (
          <div className="line-clamp-3 text-sm text-muted-foreground">
            {nodeData.content}
          </div>
        )}
        {nodeData.insights && nodeData.insights.length > 0 && (
          <div className="mt-2">
            <ul className="space-y-1">
              {nodeData.insights.slice(0, 2).map((insight: string, i: number) => (
                <li key={i} className="text-xs text-purple-700 dark:text-purple-300">
                  • {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
        {nodeData.tags && nodeData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {nodeData.tags.slice(0, 3).map((tag: string, i: number) => (
              <span
                key={i}
                className="flex items-center gap-1 rounded-full bg-purple-200 px-2 py-0.5 text-xs text-purple-800 dark:bg-purple-800 dark:text-purple-200"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

InsightNode.displayName = 'InsightNode';
