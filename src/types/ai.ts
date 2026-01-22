/**
 * AI and LLM type definitions
 */

// ============================================================================
// AI PROVIDERS
// ============================================================================

export type AIProvider = 'anthropic' | 'openai' | 'custom';

export type AIModel =
  // Anthropic models
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-opus-20240229'
  // OpenAI models
  | 'gpt-4-turbo-preview'
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  // Custom
  | string;

// ============================================================================
// AI OPERATIONS
// ============================================================================

export type AIOperationType =
  | 'chat'
  | 'generate'
  | 'analyze'
  | 'summarize'
  | 'extract'
  | 'transform';

export interface AIInteraction {
  id: string;
  board_id: string;
  user_id: string;
  node_ids: string[];
  operation_type: AIOperationType;
  model_used: AIModel;
  provider: AIProvider;
  prompt: string;
  context: Record<string, unknown>;
  response: string | null;
  tokens_used: number | null;
  cost_usd: number | null;
  latency_ms: number | null;
  created_at: string;
}

// ============================================================================
// AI REQUEST/RESPONSE TYPES
// ============================================================================

export interface AIRequest {
  operation: AIOperationType;
  provider?: AIProvider;
  model?: AIModel;
  prompt: string;
  context?: {
    boardId?: string;
    nodeIds?: string[];
    nodeContent?: string[];
    previousMessages?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  };
}

export interface AIResponse {
  success: boolean;
  response?: string;
  error?: string;
  metadata?: {
    model: AIModel;
    provider: AIProvider;
    tokensUsed?: number;
    costUsd?: number;
    latencyMs?: number;
  };
}

// ============================================================================
// CHAT TYPES
// ============================================================================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  metadata?: {
    nodeIds?: string[];
    operation?: AIOperationType;
  };
}

export interface ChatConversation {
  id: string;
  board_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CONTENT GENERATION TYPES
// ============================================================================

export interface ContentGenerationRequest {
  type: 'social_post' | 'blog_article' | 'email' | 'landing_page' | 'video_script';
  platform?: 'instagram' | 'linkedin' | 'twitter' | 'facebook' | 'email';
  tone?: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful';
  length?: 'short' | 'medium' | 'long';
  sourceNodeIds?: string[];
  targetAudience?: string;
  keyMessages?: string[];
  callToAction?: string;
  additionalContext?: string;
}

export interface ContentGenerationResponse {
  content: string;
  variations?: string[];
  metadata?: {
    wordCount?: number;
    readingTime?: number;
    seoScore?: number;
    suggestions?: string[];
  };
}

// ============================================================================
// ANALYSIS TYPES
// ============================================================================

export interface ContentAnalysisRequest {
  content: string;
  analysisType: 'sentiment' | 'topics' | 'entities' | 'keywords' | 'structure' | 'comprehensive';
}

export interface ContentAnalysisResponse {
  sentiment?: {
    score: number; // -1 to 1
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  topics?: Array<{
    topic: string;
    relevance: number;
  }>;
  entities?: Array<{
    text: string;
    type: 'person' | 'organization' | 'location' | 'product' | 'other';
    confidence: number;
  }>;
  keywords?: Array<{
    keyword: string;
    frequency: number;
    importance: number;
  }>;
  structure?: {
    sections: number;
    paragraphs: number;
    sentences: number;
    words: number;
    readabilityScore: number;
  };
  summary?: string;
}

// ============================================================================
// EXTRACTION TYPES
// ============================================================================

export interface ExtractionRequest {
  content: string;
  extractionType: 'insights' | 'key_points' | 'quotes' | 'action_items' | 'questions';
  context?: string;
}

export interface ExtractionResponse {
  insights?: string[];
  keyPoints?: string[];
  quotes?: Array<{
    text: string;
    context?: string;
  }>;
  actionItems?: Array<{
    task: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
  questions?: string[];
}

// ============================================================================
// TRANSFORMATION TYPES
// ============================================================================

export interface TransformationRequest {
  content: string;
  transformationType: 'rewrite' | 'expand' | 'shorten' | 'simplify' | 'formalize' | 'translate';
  targetLength?: number;
  targetLanguage?: string;
  targetReadingLevel?: 'elementary' | 'middle_school' | 'high_school' | 'college' | 'professional';
  preserveStructure?: boolean;
}

export interface TransformationResponse {
  transformedContent: string;
  changes?: {
    original: {
      wordCount: number;
      sentences: number;
    };
    transformed: {
      wordCount: number;
      sentences: number;
    };
    changePercentage: number;
  };
}

// ============================================================================
// EMBEDDINGS TYPES
// ============================================================================

export interface EmbeddingRequest {
  text: string;
  model?: 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002';
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  tokensUsed: number;
}

export interface SemanticSearchRequest {
  query: string;
  boardId?: string;
  limit?: number;
  threshold?: number; // Similarity threshold (0-1)
}

export interface SemanticSearchResult {
  assetId: string;
  nodeId?: string;
  content: string;
  similarity: number;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// AI CONFIGURATION
// ============================================================================

export interface AIConfig {
  provider: AIProvider;
  model: AIModel;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
}

export interface AIProviderConfig {
  anthropic?: {
    apiKey: string;
    defaultModel: AIModel;
  };
  openai?: {
    apiKey: string;
    defaultModel: AIModel;
  };
}

// ============================================================================
// COST TRACKING
// ============================================================================

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CostEstimate {
  provider: AIProvider;
  model: AIModel;
  usage: TokenUsage;
  costUsd: number;
}

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCostUsd: number;
  byProvider: Record<AIProvider, {
    requests: number;
    tokens: number;
    costUsd: number;
  }>;
  byOperation: Record<AIOperationType, {
    requests: number;
    tokens: number;
    costUsd: number;
  }>;
}
