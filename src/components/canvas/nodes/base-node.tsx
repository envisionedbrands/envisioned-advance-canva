'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileText } from 'lucide-react';
import type { NodeData } from '@/types/canvas';

export const BaseNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as NodeData;
  return (
    <div
      className={`rounded-lg border-2 bg-card p-4 shadow-md transition-all ${
        selected
          ? 'border-primary shadow-lg'
          : 'border-border hover:border-primary/50'
      }`}
      style={{ minWidth: 250, minHeight: 150 }}
    >
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary"
        style={{ width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary"
        style={{ width: 10, height: 10 }}
      />

      {/* Node content */}
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="mb-1 font-semibold text-foreground">
            {nodeData.label || 'Untitled'}
          </div>
          {nodeData.content && (
            <div className="line-clamp-3 text-sm text-muted-foreground">
              {nodeData.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

BaseNode.displayName = 'BaseNode';
