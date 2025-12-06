'use client';

import { Button } from '@/components/ui/button';
import {
  Plus,
  FileText,
  Video,
  Sparkles,
  Send,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { NodeType } from '@/types/canvas';

interface CanvasToolbarProps {
  onAddNode: (type: NodeType) => void;
  boardTitle: string;
}

export function CanvasToolbar({ onAddNode, boardTitle }: CanvasToolbarProps) {
  const router = useRouter();

  return (
    <div className="absolute left-0 right-0 top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section - Back button and title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/boards')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Boards
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-lg font-semibold">{boardTitle}</h1>
        </div>

        {/* Center section - Add node buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddNode('text')}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Note
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddNode('source')}
            className="gap-2"
          >
            <Video className="h-4 w-4" />
            Source
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddNode('insight')}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Insight
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddNode('output')}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Output
          </Button>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Save
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
