'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Folder, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Board } from '@/types/canvas';

export default function BoardsPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/boards');
      if (response.ok) {
        const data = await response.json();
        setBoards(data.boards || []);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewBoard = async () => {
    router.push('/boards/new');
  };

  return (
    <div className="h-full overflow-auto bg-background p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Boards</h1>
            <p className="mt-1 text-muted-foreground">
              Visual workspaces for your content strategy
            </p>
          </div>
          <Button onClick={createNewBoard} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            New Board
          </Button>
        </div>

        {/* Boards Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-lg border bg-card"
              />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <Folder className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No boards yet</h3>
            <p className="mb-6 max-w-sm text-muted-foreground">
              Create your first board to start organizing your content strategy
            </p>
            <Button onClick={createNewBoard} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Board
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => router.push(`/boards/${board.id}`)}
                className="group relative flex h-64 flex-col rounded-lg border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg"
              >
                {/* Board Preview - could show miniature canvas preview */}
                <div className="mb-4 flex-1 rounded-md bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Folder className="h-4 w-4" />
                    <span>Canvas workspace</span>
                  </div>
                </div>

                {/* Board Info */}
                <div>
                  <h3 className="mb-1 text-lg font-semibold group-hover:text-primary">
                    {board.title}
                  </h3>
                  {board.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                      {board.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      Updated {formatDistanceToNow(new Date(board.updated_at))}{' '}
                      ago
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
