import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import {
  getBoardWithContent,
  updateBoard,
  deleteBoard,
} from '@/lib/supabase/canvas-queries';
import type { UpdateBoardInput } from '@/types/canvas';

/**
 * GET /api/boards/[boardId]
 * Get a specific board with its nodes and edges
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { boardId } = await params;
    const result = await getBoardWithContent(boardId);

    if (!result) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/boards/[boardId]
 * Update a board's title, description, or settings
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { boardId } = await params;
    const body = (await request.json()) as UpdateBoardInput;

    const board = await updateBoard(boardId, body);

    return NextResponse.json({ board });
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json(
      { error: 'Failed to update board' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/boards/[boardId]
 * Delete a board and all its related data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { boardId } = await params;
    await deleteBoard(boardId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    );
  }
}
