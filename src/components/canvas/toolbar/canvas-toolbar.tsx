'use client';

import { Button } from '@/components/ui/button';
import {
  FileText,
  Video,
  Sparkles,
  Send,
  ArrowLeft,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/common/theme-toggle';
import Link from 'next/link';
import type { NodeType } from '@/types/canvas';

interface CanvasToolbarProps {
  onAddNode: (type: NodeType) => void;
  boardTitle: string;
}

export function CanvasToolbar({ onAddNode, boardTitle }: CanvasToolbarProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();

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

        {/* Right section - User menu and settings */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {user.fullName || user.email?.split('@')[0] || 'Account'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user.fullName || 'My Account'}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/boards" className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    My Boards
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
