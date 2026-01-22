'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Folder, Clock, MoreVertical, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Board } from '@/types/canvas';

export default function BoardsPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteClick = (board: Board, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the board
    setBoardToDelete(board);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!boardToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/boards/${boardToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the deleted board from the list
        setBoards((prev) => prev.filter((b) => b.id !== boardToDelete.id));
        setDeleteDialogOpen(false);
        setBoardToDelete(null);
      } else {
        const error = await response.json();
        console.error('Failed to delete board:', error);
        alert('Failed to delete board. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting board:', error);
      alert('Failed to delete board. Please try again.');
    } finally {
      setDeleting(false);
    }
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
              <div
                key={board.id}
                className="group relative flex h-64 flex-col rounded-lg border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
              >
                {/* Dropdown Menu */}
                <div className="absolute right-4 top-4 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/boards/${board.id}`)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Board
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteClick(board, e)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Board
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Board Card - clickable area */}
                <button
                  onClick={() => router.push(`/boards/${board.id}`)}
                  className="flex h-full flex-col text-left"
                >
                  {/* Board Preview */}
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{boardToDelete?.title}&quot;?
              This action cannot be undone. All nodes, connections, and AI analysis
              will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete Board'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
