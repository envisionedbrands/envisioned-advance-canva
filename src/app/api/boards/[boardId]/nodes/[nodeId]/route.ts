import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { updateNode, deleteNode } from '@/lib/supabase/canvas-queries';
import type { NodeData } from '@/types/canvas';

/**
 * PATCH /api/boards/[boardId]/nodes/[nodeId]
 * Update a specific node's data
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; nodeId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nodeId } = await params;
    const body = await request.json();

    // Extract data updates from body
    const { data, position, width, height } = body;

    const updates: {
      data?: NodeData;
      position?: { x: number; y: number };
      width?: number;
      height?: number;
    } = {};

    if (data) updates.data = data;
    if (position) updates.position = position;
    if (width) updates.width = width;
    if (height) updates.height = height;

    const node = await updateNode(nodeId, updates);

    return NextResponse.json({ node });
  } catch (error) {
    console.error('Error updating node:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update node';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE /api/boards/[boardId]/nodes/[nodeId]
 * Delete a specific node
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; nodeId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nodeId } = await params;

    await deleteNode(nodeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting node:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete node';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
