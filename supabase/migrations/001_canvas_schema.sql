-- Canvas Workspace Database Schema
-- Migration: 001_canvas_schema.sql
-- Description: Complete schema for boards, nodes, edges, assets, AI interactions, and analytics

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- BOARDS TABLE
-- Represents a canvas workspace/board
-- ============================================================================
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{
    "viewport": {"x": 0, "y": 0, "zoom": 1},
    "theme": "light",
    "gridEnabled": true,
    "snapToGrid": false
  }'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NODES TABLE
-- Represents individual nodes/cards on the canvas
-- ============================================================================
CREATE TABLE IF NOT EXISTS nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('source', 'insight', 'output', 'framework', 'campaign', 'text')),
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}'::JSONB,
  data JSONB NOT NULL DEFAULT '{}'::JSONB,
  metadata JSONB DEFAULT '{
    "color": null,
    "tags": [],
    "createdBy": null,
    "lastEditedBy": null
  }'::JSONB,
  width INTEGER DEFAULT 300,
  height INTEGER DEFAULT 200,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- EDGES TABLE
-- Represents connections between nodes
-- ============================================================================
CREATE TABLE IF NOT EXISTS edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'default',
  label TEXT,
  metadata JSONB DEFAULT '{
    "animated": false,
    "style": {}
  }'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure no self-loops
  CONSTRAINT no_self_loops CHECK (source_node_id != target_node_id),

  -- Ensure unique connections (no duplicate edges between same nodes)
  CONSTRAINT unique_edge UNIQUE (board_id, source_node_id, target_node_id)
);

-- ============================================================================
-- ASSETS TABLE
-- Stores uploaded media and processed content
-- ============================================================================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('video', 'audio', 'pdf', 'text', 'image', 'url')),

  -- Storage paths
  storage_path TEXT,
  url TEXT,

  -- File metadata
  filename TEXT,
  mime_type TEXT,
  file_size BIGINT,

  -- Processed data (transcriptions, extracted text, etc.)
  processed_data JSONB DEFAULT '{
    "transcription": null,
    "summary": null,
    "keyPoints": [],
    "entities": [],
    "topics": []
  }'::JSONB,

  -- Vector embedding for semantic search
  embedding VECTOR(1536),

  -- Processing status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'error')),
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AI_INTERACTIONS TABLE
-- Tracks all AI operations (chat, generation, analysis)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_ids UUID[] DEFAULT ARRAY[]::UUID[],

  -- AI operation details
  operation_type TEXT NOT NULL CHECK (operation_type IN ('chat', 'generate', 'analyze', 'summarize', 'extract', 'transform')),
  model_used TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('anthropic', 'openai', 'custom')),

  -- Input/output
  prompt TEXT NOT NULL,
  context JSONB DEFAULT '{}'::JSONB,
  response TEXT,

  -- Usage tracking
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),

  -- Performance metrics
  latency_ms INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONTENT_PERFORMANCE TABLE
-- Analytics for published content
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Platform and link
  platform TEXT CHECK (platform IN ('instagram', 'linkedin', 'twitter', 'facebook', 'email', 'landing_page', 'blog', 'other')),
  url TEXT,

  -- Performance metrics
  metrics JSONB DEFAULT '{
    "views": 0,
    "likes": 0,
    "shares": 0,
    "comments": 0,
    "clicks": 0,
    "conversions": 0,
    "revenue": 0
  }'::JSONB,

  -- Publishing info
  posted_at TIMESTAMPTZ,
  last_synced TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- BOARD_COLLABORATORS TABLE
-- Team collaboration and sharing
-- ============================================================================
CREATE TABLE IF NOT EXISTS board_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_board_collaborator UNIQUE (board_id, user_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Board indexes
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_boards_created_at ON boards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_boards_updated_at ON boards(updated_at DESC);

-- Node indexes
CREATE INDEX IF NOT EXISTS idx_nodes_board_id ON nodes(board_id);
CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type);
CREATE INDEX IF NOT EXISTS idx_nodes_board_type ON nodes(board_id, type);

-- Edge indexes
CREATE INDEX IF NOT EXISTS idx_edges_board_id ON edges(board_id);
CREATE INDEX IF NOT EXISTS idx_edges_source_node_id ON edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_target_node_id ON edges(target_node_id);

-- Asset indexes
CREATE INDEX IF NOT EXISTS idx_assets_node_id ON assets(node_id);
CREATE INDEX IF NOT EXISTS idx_assets_board_id ON assets(board_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);

-- Vector search index (using ivfflat for fast approximate search)
CREATE INDEX IF NOT EXISTS idx_assets_embedding ON assets
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- AI interaction indexes
CREATE INDEX IF NOT EXISTS idx_ai_interactions_board_id ON ai_interactions(board_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON ai_interactions(created_at DESC);

-- Content performance indexes
CREATE INDEX IF NOT EXISTS idx_content_performance_node_id ON content_performance(content_node_id);
CREATE INDEX IF NOT EXISTS idx_content_performance_board_id ON content_performance(board_id);
CREATE INDEX IF NOT EXISTS idx_content_performance_platform ON content_performance(platform);

-- Collaborator indexes
CREATE INDEX IF NOT EXISTS idx_board_collaborators_board_id ON board_collaborators(board_id);
CREATE INDEX IF NOT EXISTS idx_board_collaborators_user_id ON board_collaborators(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_collaborators ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- BOARDS POLICIES
-- ============================================================================

-- Users can view boards they own or are collaborators on
CREATE POLICY "Users can view own boards and collaborated boards" ON boards
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    id IN (
      SELECT board_id FROM board_collaborators
      WHERE user_id = auth.uid()
    )
  );

-- Users can create boards
CREATE POLICY "Users can create boards" ON boards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update boards they own or are editors on
CREATE POLICY "Users can update own boards or as editors" ON boards
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR
    id IN (
      SELECT board_id FROM board_collaborators
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Users can delete only boards they own
CREATE POLICY "Users can delete own boards" ON boards
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- NODES POLICIES
-- ============================================================================

CREATE POLICY "Users can view nodes in accessible boards" ON nodes
  FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE user_id = auth.uid()
      OR id IN (SELECT board_id FROM board_collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create nodes in accessible boards" ON nodes
  FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT id FROM boards
      WHERE user_id = auth.uid()
      OR id IN (SELECT board_id FROM board_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

CREATE POLICY "Users can update nodes in accessible boards" ON nodes
  FOR UPDATE
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE user_id = auth.uid()
      OR id IN (SELECT board_id FROM board_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

CREATE POLICY "Users can delete nodes in accessible boards" ON nodes
  FOR DELETE
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE user_id = auth.uid()
      OR id IN (SELECT board_id FROM board_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- ============================================================================
-- EDGES POLICIES
-- ============================================================================

CREATE POLICY "Users can view edges in accessible boards" ON edges
  FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE user_id = auth.uid()
      OR id IN (SELECT board_id FROM board_collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create edges in accessible boards" ON edges
  FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT id FROM boards
      WHERE user_id = auth.uid()
      OR id IN (SELECT board_id FROM board_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

CREATE POLICY "Users can update edges in accessible boards" ON edges
  FOR UPDATE
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE user_id = auth.uid()
      OR id IN (SELECT board_id FROM board_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

CREATE POLICY "Users can delete edges in accessible boards" ON edges
  FOR DELETE
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE user_id = auth.uid()
      OR id IN (SELECT board_id FROM board_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- ============================================================================
-- ASSETS POLICIES
-- ============================================================================

CREATE POLICY "Users can view assets in accessible boards" ON assets
  FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE user_id = auth.uid()
      OR id IN (SELECT board_id FROM board_collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create assets in accessible boards" ON assets
  FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT id FROM boards
      WHERE user_id = auth.uid()
      OR id IN (SELECT board_id FROM board_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
    AND auth.uid() = user_id
  );

CREATE POLICY "Users can update assets in accessible boards" ON assets
  FOR UPDATE
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE user_id = auth.uid()
      OR id IN (SELECT board_id FROM board_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

CREATE POLICY "Users can delete own assets" ON assets
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- AI_INTERACTIONS POLICIES
-- ============================================================================

CREATE POLICY "Users can view AI interactions in accessible boards" ON ai_interactions
  FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE user_id = auth.uid()
      OR id IN (SELECT board_id FROM board_collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create AI interactions" ON ai_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- CONTENT_PERFORMANCE POLICIES
-- ============================================================================

CREATE POLICY "Users can view content performance in accessible boards" ON content_performance
  FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE user_id = auth.uid()
      OR id IN (SELECT board_id FROM board_collaborators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage content performance" ON content_performance
  FOR ALL
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE user_id = auth.uid()
      OR id IN (SELECT board_id FROM board_collaborators WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
    )
  );

-- ============================================================================
-- BOARD_COLLABORATORS POLICIES
-- ============================================================================

CREATE POLICY "Users can view collaborators of accessible boards" ON board_collaborators
  FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM boards WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Board owners can manage collaborators" ON board_collaborators
  FOR ALL
  USING (
    board_id IN (
      SELECT id FROM boards WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_performance_updated_at BEFORE UPDATE ON content_performance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA (OPTIONAL)
-- ============================================================================

-- You can add seed data here if needed

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
