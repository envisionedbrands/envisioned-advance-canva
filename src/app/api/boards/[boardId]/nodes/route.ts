import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import {
  getBoardNodes,
  createNode,
  updateNode,
  deleteNode,
} from '@/lib/supabase/canvas-queries';
import type { CreateNodeInput, UpdateNodeInput } from '@/types/canvas';

/**
 * GET /api/boards/[boardId]/nodes
 * Get all nodes for a board
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
    const nodes = await getBoardNodes(boardId);

    return NextResponse.json({ nodes });
  } catch (error) {
    console.error('Error fetching nodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nodes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/boards/[boardId]/nodes
 * Create a new node
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { boardId } = await params;
    const body = (await request.json()) as Omit<CreateNodeInput, 'board_id'>;

    const node = await createNode({
      ...body,
      board_id: boardId,
    });

    return NextResponse.json({ node }, { status: 201 });
  } catch (error) {
    console.error('Error creating node:', error);
    return NextResponse.json(
      { error: 'Failed to create node' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/boards/[boardId]/nodes
 * Update a node (or multiple nodes for batch updates)
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Support single node update
    if (body.id && body.updates) {
      const node = await updateNode(body.id, body.updates as UpdateNodeInput);
      return NextResponse.json({ node });
    }

    // Support batch updates (for drag operations)
    if (Array.isArray(body.nodes)) {
      const promises = body.nodes.map(
        (item: { id: string; updates: UpdateNodeInput }) =>
          updateNode(item.id, item.updates)
      );
      const nodes = await Promise.all(promises);
      return NextResponse.json({ nodes });
    }

    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating nodes:', error);
    return NextResponse.json(
      { error: 'Failed to update nodes' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/boards/[boardId]/nodes
 * Delete a node
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get('nodeId');

    if (!nodeId) {
      return NextResponse.json(
        { error: 'nodeId is required' },
        { status: 400 }
      );
    }

    await deleteNode(nodeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting node:', error);
    return NextResponse.json(
      { error: 'Failed to delete node' },
      { status: 500 }
    );
  }
}
