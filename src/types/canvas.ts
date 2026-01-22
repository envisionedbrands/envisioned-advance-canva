/**
 * Canvas and Board type definitions
 */

import { Node as ReactFlowNode, Edge as ReactFlowEdge } from '@xyflow/react';

// ============================================================================
// BOARD TYPES
// ============================================================================

export interface Board {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  settings: BoardSettings;
  created_at: string;
  updated_at: string;
}

export interface BoardSettings {
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  theme: 'light' | 'dark';
  gridEnabled: boolean;
  snapToGrid: boolean;
}

export interface CreateBoardInput {
  title: string;
  description?: string;
  settings?: Partial<BoardSettings>;
}

export interface UpdateBoardInput {
  title?: string;
  description?: string;
  settings?: Partial<BoardSettings>;
}

// ============================================================================
// NODE TYPES
// ============================================================================

export type NodeType = 'source' | 'insight' | 'output' | 'framework' | 'campaign' | 'text';

export interface CanvasNode {
  id: string;
  board_id: string;
  type: NodeType;
  position: {
    x: number;
    y: number;
  };
  data: NodeData;
  metadata: NodeMetadata;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
}

export interface NodeData {
  label?: string;
  content?: string;
  assetId?: string;
  // Source node specific
  sourceType?: 'video' | 'audio' | 'pdf' | 'text' | 'url';
  sourceUrl?: string;
  // Insight node specific
  insights?: string[];
  tags?: string[];
  // Output node specific
  platform?: string;
  publishedUrl?: string;
  // Framework node specific
  frameworkType?: string;
  steps?: string[];
  // Campaign node specific
  campaignGoal?: string;
  targetAudience?: string;
  // Any custom data
  [key: string]: unknown;
}

export interface NodeMetadata {
  color?: string | null;
  tags?: string[];
  createdBy?: string | null;
  lastEditedBy?: string | null;
}

export interface CreateNodeInput {
  board_id: string;
  type: NodeType;
  position: {
    x: number;
    y: number;
  };
  data: NodeData;
  metadata?: Partial<NodeMetadata>;
  width?: number;
  height?: number;
}

export interface UpdateNodeInput {
  type?: NodeType;
  position?: {
    x: number;
    y: number;
  };
  data?: Partial<NodeData>;
  metadata?: Partial<NodeMetadata>;
  width?: number;
  height?: number;
}

// React Flow compatible types
export type FlowNode = ReactFlowNode<NodeData> & {
  type: NodeType;
};

// ============================================================================
// EDGE TYPES
// ============================================================================

export interface CanvasEdge {
  id: string;
  board_id: string;
  source_node_id: string;
  target_node_id: string;
  relationship_type: string;
  label: string | null;
  metadata: EdgeMetadata;
  created_at: string;
}

export interface EdgeMetadata {
  animated?: boolean;
  style?: Record<string, unknown>;
}

export interface CreateEdgeInput {
  board_id: string;
  source_node_id: string;
  target_node_id: string;
  relationship_type?: string;
  label?: string;
  metadata?: Partial<EdgeMetadata>;
}

// React Flow compatible types
export type FlowEdge = ReactFlowEdge & {
  data?: {
    relationship_type?: string;
    [key: string]: unknown;
  };
};

// ============================================================================
// BOARD WITH NODES AND EDGES
// ============================================================================

export interface BoardWithContent extends Board {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

// ============================================================================
// COLLABORATION TYPES
// ============================================================================

export type CollaboratorRole = 'owner' | 'editor' | 'viewer';

export interface BoardCollaborator {
  id: string;
  board_id: string;
  user_id: string;
  role: CollaboratorRole;
  invited_by: string | null;
  invited_at: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface InviteCollaboratorInput {
  board_id: string;
  user_email: string;
  role: CollaboratorRole;
}

// ============================================================================
// CANVAS VIEWPORT TYPES
// ============================================================================

export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasTransform {
  translate: {
    x: number;
    y: number;
  };
  scale: number;
}

// ============================================================================
// CANVAS ACTIONS
// ============================================================================

export type CanvasAction =
  | { type: 'ADD_NODE'; payload: CreateNodeInput }
  | { type: 'UPDATE_NODE'; payload: { id: string; updates: UpdateNodeInput } }
  | { type: 'DELETE_NODE'; payload: { id: string } }
  | { type: 'ADD_EDGE'; payload: CreateEdgeInput }
  | { type: 'DELETE_EDGE'; payload: { id: string } }
  | { type: 'UPDATE_VIEWPORT'; payload: ViewportState }
  | { type: 'SELECT_NODE'; payload: { id: string | null } }
  | { type: 'SELECT_MULTIPLE'; payload: { ids: string[] } };

// ============================================================================
// SELECTION STATE
// ============================================================================

export interface SelectionState {
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  activeNodeId: string | null;
}

// ============================================================================
// CANVAS CONTEXT
// ============================================================================

export interface CanvasContextType {
  board: Board | null;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  loading: boolean;
  error: string | null;

  // Actions
  createNode: (input: CreateNodeInput) => Promise<CanvasNode>;
  updateNode: (id: string, updates: UpdateNodeInput) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  createEdge: (input: CreateEdgeInput) => Promise<CanvasEdge>;
  deleteEdge: (id: string) => Promise<void>;
  updateViewport: (viewport: ViewportState) => Promise<void>;

  // Selection
  selection: SelectionState;
  setSelection: (selection: Partial<SelectionState>) => void;
}
