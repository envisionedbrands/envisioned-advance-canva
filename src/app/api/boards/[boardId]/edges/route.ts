import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { getBoardEdges, createEdge } from '@/lib/supabase/canvas-queries';

/**
 * GET /api/boards/[boardId]/edges
 * Get all edges for a board
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
    const edges = await getBoardEdges(boardId);

    return NextResponse.json({ edges });
  } catch (error) {
    console.error('Error fetching edges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch edges' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/boards/[boardId]/edges
 * Create a new edge (connection between nodes)
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
    const body = await request.json();
    const { source, target } = body;

    if (!source || !target) {
      return NextResponse.json(
        { error: 'Source and target nodes are required' },
        { status: 400 }
      );
    }

    const edge = await createEdge({
      board_id: boardId,
      source_node_id: source,
      target_node_id: target,
      relationship_type: 'default',
    });

    return NextResponse.json({ edge }, { status: 201 });
  } catch (error) {
    console.error('Error creating edge:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create edge';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
