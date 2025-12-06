import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { deleteEdge } from '@/lib/supabase/canvas-queries';

/**
 * DELETE /api/boards/[boardId]/edges/[edgeId]
 * Delete a specific edge
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; edgeId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { edgeId } = await params;
    await deleteEdge(edgeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting edge:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete edge';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
