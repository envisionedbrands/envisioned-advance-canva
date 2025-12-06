import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { getUserBoards, createBoard } from '@/lib/supabase/canvas-queries';
import type { CreateBoardInput } from '@/types/canvas';

/**
 * GET /api/boards
 * List all boards for the authenticated user
 */
export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const boards = await getUserBoards(user.id);

    return NextResponse.json({ boards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/boards
 * Create a new board
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, settings } = body as CreateBoardInput;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const board = await createBoard(user.id, {
      title: title.trim(),
      description: description?.trim() || undefined,
      settings,
    });

    return NextResponse.json({ board }, { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    );
  }
}
