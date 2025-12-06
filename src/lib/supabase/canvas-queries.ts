/**
 * Supabase queries for canvas operations
 * Handles boards, nodes, edges, and assets
 */

import { createClient } from '@/lib/supabase/server';
import type {
  Board,
  CanvasNode,
  CanvasEdge,
  CreateBoardInput,
  UpdateBoardInput,
  CreateNodeInput,
  UpdateNodeInput,
  CreateEdgeInput,
} from '@/types/canvas';

// ============================================================================
// BOARD QUERIES
// ============================================================================

/**
 * Get all boards for a user
 */
export async function getUserBoards(userId: string): Promise<Board[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching boards:', error);
    throw new Error('Failed to fetch boards');
  }

  return data || [];
}

/**
 * Get a single board by ID
 */
export async function getBoard(boardId: string): Promise<Board | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Board not found
    }
    console.error('Error fetching board:', error);
    throw new Error('Failed to fetch board');
  }

  return data;
}

/**
 * Create a new board
 */
export async function createBoard(
  userId: string,
  input: CreateBoardInput
): Promise<Board> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('boards')
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description || null,
      settings: input.settings || {
        viewport: { x: 0, y: 0, zoom: 1 },
        theme: 'light',
        gridEnabled: true,
        snapToGrid: false,
      },
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating board:', error);
    throw new Error('Failed to create board');
  }

  return data;
}

/**
 * Update a board
 */
export async function updateBoard(
  boardId: string,
  updates: UpdateBoardInput
): Promise<Board> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined)
    updateData.description = updates.description;
  if (updates.settings !== undefined) updateData.settings = updates.settings;

  const { data, error } = await supabase
    .from('boards')
    .update(updateData)
    .eq('id', boardId)
    .select()
    .single();

  if (error) {
    console.error('Error updating board:', error);
    throw new Error('Failed to update board');
  }

  return data;
}

/**
 * Delete a board
 */
export async function deleteBoard(boardId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('boards').delete().eq('id', boardId);

  if (error) {
    console.error('Error deleting board:', error);
    throw new Error('Failed to delete board');
  }
}

// ============================================================================
// NODE QUERIES
// ============================================================================

/**
 * Get all nodes for a board
 */
export async function getBoardNodes(boardId: string): Promise<CanvasNode[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('board_id', boardId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching nodes:', error);
    throw new Error('Failed to fetch nodes');
  }

  return data || [];
}

/**
 * Get a single node by ID
 */
export async function getNode(nodeId: string): Promise<CanvasNode | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('id', nodeId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching node:', error);
    throw new Error('Failed to fetch node');
  }

  return data;
}

/**
 * Create a new node
 */
export async function createNode(input: CreateNodeInput): Promise<CanvasNode> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('nodes')
    .insert({
      board_id: input.board_id,
      type: input.type,
      position: input.position,
      data: input.data,
      metadata: input.metadata || {
        color: null,
        tags: [],
        createdBy: null,
        lastEditedBy: null,
      },
      width: input.width || 300,
      height: input.height || 200,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating node:', error);
    throw new Error('Failed to create node');
  }

  return data;
}

/**
 * Update a node
 */
export async function updateNode(
  nodeId: string,
  updates: UpdateNodeInput
): Promise<CanvasNode> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};

  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.position !== undefined) updateData.position = updates.position;
  if (updates.data !== undefined) updateData.data = updates.data;
  if (updates.metadata !== undefined) updateData.metadata = updates.metadata;
  if (updates.width !== undefined) updateData.width = updates.width;
  if (updates.height !== undefined) updateData.height = updates.height;

  const { data, error } = await supabase
    .from('nodes')
    .update(updateData)
    .eq('id', nodeId)
    .select()
    .single();

  if (error) {
    console.error('Error updating node:', error);
    throw new Error('Failed to update node');
  }

  return data;
}

/**
 * Delete a node
 */
export async function deleteNode(nodeId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('nodes').delete().eq('id', nodeId);

  if (error) {
    console.error('Error deleting node:', error);
    throw new Error('Failed to delete node');
  }
}

/**
 * Bulk update node positions (for drag operations)
 */
export async function updateNodePositions(
  updates: Array<{ id: string; position: { x: number; y: number } }>
): Promise<void> {
  const supabase = await createClient();

  // Use Promise.all for parallel updates
  const promises = updates.map(({ id, position }) =>
    supabase.from('nodes').update({ position }).eq('id', id)
  );

  const results = await Promise.all(promises);

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    console.error('Error updating node positions:', errors);
    throw new Error('Failed to update some node positions');
  }
}

// ============================================================================
// EDGE QUERIES
// ============================================================================

/**
 * Get all edges for a board
 */
export async function getBoardEdges(boardId: string): Promise<CanvasEdge[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('edges')
    .select('*')
    .eq('board_id', boardId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching edges:', error);
    throw new Error('Failed to fetch edges');
  }

  return data || [];
}

/**
 * Create a new edge
 */
export async function createEdge(input: CreateEdgeInput): Promise<CanvasEdge> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('edges')
    .insert({
      board_id: input.board_id,
      source_node_id: input.source_node_id,
      target_node_id: input.target_node_id,
      relationship_type: input.relationship_type || 'default',
      label: input.label || null,
      metadata: input.metadata || {
        animated: false,
        style: {},
      },
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating edge:', error);
    throw new Error('Failed to create edge');
  }

  return data;
}

/**
 * Delete an edge
 */
export async function deleteEdge(edgeId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('edges').delete().eq('id', edgeId);

  if (error) {
    console.error('Error deleting edge:', error);
    throw new Error('Failed to delete edge');
  }
}

/**
 * Delete edges by source or target node ID
 * Used when deleting a node to clean up its connections
 */
export async function deleteNodeEdges(nodeId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('edges')
    .delete()
    .or(`source_node_id.eq.${nodeId},target_node_id.eq.${nodeId}`);

  if (error) {
    console.error('Error deleting node edges:', error);
    throw new Error('Failed to delete node edges');
  }
}

// ============================================================================
// BOARD WITH CONTENT
// ============================================================================

/**
 * Get board with all nodes and edges
 */
export async function getBoardWithContent(boardId: string) {
  const board = await getBoard(boardId);
  if (!board) {
    return null;
  }

  const [nodes, edges] = await Promise.all([
    getBoardNodes(boardId),
    getBoardEdges(boardId),
  ]);

  return {
    board,
    nodes,
    edges,
  };
}
