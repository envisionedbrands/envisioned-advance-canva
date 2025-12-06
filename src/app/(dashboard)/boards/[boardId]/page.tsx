'use client';

import { use, useEffect, useState } from 'react';
import { BoardCanvas } from '@/components/canvas/board-canvas';
import type { Board, CanvasNode, CanvasEdge } from '@/types/canvas';

export default function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = use(params);
  const [board, setBoard] = useState<Board | null>(null);
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      // Fetch board details
      const boardResponse = await fetch(`/api/boards/${boardId}`);

      if (!boardResponse.ok) {
        const errorData = await boardResponse.json();
        console.error('Board fetch error:', errorData);
        setError(errorData.error || `Failed to fetch board (${boardResponse.status})`);
        setLoading(false);
        return;
      }

      const boardData = await boardResponse.json();
      console.log('Board data received:', boardData);
      setBoard(boardData.board);

      // Fetch nodes
      const nodesResponse = await fetch(`/api/boards/${boardId}/nodes`);
      if (nodesResponse.ok) {
        const nodesData = await nodesResponse.json();
        setNodes(nodesData.nodes || []);
      }

      // Fetch edges (when we implement the API)
      // For now, start with empty edges
      setEdges([]);
    } catch (error) {
      console.error('Error fetching board:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Board not found</h2>
          <p className="mt-2 text-muted-foreground">
            The board you&apos;re looking for doesn&apos;t exist or you don&apos;t have access
            to it.
          </p>
          {error && (
            <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">{error}</p>
              <p className="mt-1 text-xs text-muted-foreground">Check browser console for details</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <BoardCanvas
      board={board}
      initialNodes={nodes}
      initialEdges={edges}
    />
  );
}
