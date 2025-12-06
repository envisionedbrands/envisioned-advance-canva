/**
 * Media and Asset type definitions
 */

// ============================================================================
// ASSET TYPES
// ============================================================================

export type AssetType = 'video' | 'audio' | 'pdf' | 'text' | 'image' | 'url';

export type AssetStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface Asset {
  id: string;
  node_id: string | null;
  board_id: string;
  user_id: string;
  type: AssetType;

  // Storage
  storage_path: string | null;
  url: string | null;

  // File metadata
  filename: string | null;
  mime_type: string | null;
  file_size: number | null;

  // Processed data
  processed_data: ProcessedData;

  // Vector embedding for semantic search
  embedding: number[] | null;

  // Status
  status: AssetStatus;
  error_message: string | null;

  created_at: string;
  updated_at: string;
}

export interface ProcessedData {
  transcription?: string | null;
  summary?: string | null;
  keyPoints?: string[];
  entities?: EntityExtraction[];
  topics?: TopicExtraction[];

  // Video/Audio specific
  duration?: number;
  chapters?: Chapter[];
  speakers?: Speaker[];

  // PDF/Text specific
  pageCount?: number;
  wordCount?: number;

  // URL specific
  title?: string;
  description?: string;
  author?: string;
  publishedDate?: string;

  // Image specific
  width?: number;
  height?: number;
  altText?: string;
}

// ============================================================================
// UPLOAD TYPES
// ============================================================================

export interface UploadRequest {
  boardId: string;
  nodeId?: string;
  file?: File;
  url?: string;
  type: AssetType;
}

export interface UploadProgress {
  assetId: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'complete' | 'error';
  message?: string;
}

export interface UploadResponse {
  success: boolean;
  asset?: Asset;
  error?: string;
}

// ============================================================================
// TRANSCRIPTION TYPES
// ============================================================================

export interface TranscriptionRequest {
  assetId: string;
  language?: string;
  enableSpeakerDiarization?: boolean;
  enableChapterDetection?: boolean;
  enableEntityDetection?: boolean;
}

export interface TranscriptionResponse {
  success: boolean;
  transcription?: string;
  chapters?: Chapter[];
  speakers?: Speaker[];
  entities?: EntityExtraction[];
  error?: string;
}

export interface Chapter {
  start: number; // seconds
  end: number;
  title: string;
  summary?: string;
}

export interface Speaker {
  id: string;
  name?: string;
  segments: Array<{
    start: number;
    end: number;
    text: string;
    confidence: number;
  }>;
}

export interface Word {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

// ============================================================================
// ENTITY EXTRACTION
// ============================================================================

export interface EntityExtraction {
  text: string;
  type: 'person' | 'organization' | 'location' | 'product' | 'event' | 'date' | 'money' | 'other';
  startOffset?: number;
  endOffset?: number;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface TopicExtraction {
  topic: string;
  relevance: number;
  keywords: string[];
}

// ============================================================================
// PDF PROCESSING
// ============================================================================

export interface PDFProcessingRequest {
  assetId: string;
  extractImages?: boolean;
  extractTables?: boolean;
  ocrEnabled?: boolean;
}

export interface PDFProcessingResponse {
  success: boolean;
  text?: string;
  pages?: PDFPage[];
  images?: PDFImage[];
  tables?: PDFTable[];
  error?: string;
}

export interface PDFPage {
  pageNumber: number;
  text: string;
  width: number;
  height: number;
}

export interface PDFImage {
  pageNumber: number;
  imageData: string; // base64
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PDFTable {
  pageNumber: number;
  rows: string[][];
  headers?: string[];
}

// ============================================================================
// URL SCRAPING
// ============================================================================

export interface URLScrapingRequest {
  url: string;
  extractMetadata?: boolean;
  extractContent?: boolean;
  extractImages?: boolean;
}

export interface URLScrapingResponse {
  success: boolean;
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
    publishedDate?: string;
    keywords?: string[];
    ogImage?: string;
  };
  content?: {
    text: string;
    html?: string;
    markdown?: string;
  };
  images?: Array<{
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  error?: string;
}

// ============================================================================
// VIDEO PROCESSING
// ============================================================================

export interface VideoProcessingRequest {
  assetId: string;
  extractAudio?: boolean;
  generateThumbnails?: boolean;
  thumbnailInterval?: number; // seconds
  extractKeyFrames?: boolean;
}

export interface VideoProcessingResponse {
  success: boolean;
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  codec?: string;
  thumbnails?: string[]; // URLs or base64
  keyFrames?: number[]; // timestamps in seconds
  error?: string;
}

// ============================================================================
// AUDIO PROCESSING
// ============================================================================

export interface AudioProcessingRequest {
  assetId: string;
  normalizeAudio?: boolean;
  removeNoise?: boolean;
  extractWaveform?: boolean;
}

export interface AudioProcessingResponse {
  success: boolean;
  duration?: number;
  sampleRate?: number;
  channels?: number;
  bitrate?: number;
  waveform?: number[]; // Amplitude values for visualization
  error?: string;
}

// ============================================================================
// IMAGE PROCESSING
// ============================================================================

export interface ImageProcessingRequest {
  assetId: string;
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill';
  };
  generateThumbnail?: boolean;
  extractColors?: boolean;
  generateAltText?: boolean;
}

export interface ImageProcessingResponse {
  success: boolean;
  width?: number;
  height?: number;
  format?: string;
  thumbnail?: string; // URL or base64
  colors?: string[]; // Hex color codes
  altText?: string;
  error?: string;
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

export interface BatchProcessingRequest {
  assetIds: string[];
  operations: Array<{
    type: 'transcribe' | 'extract' | 'analyze' | 'transform';
    config?: Record<string, unknown>;
  }>;
}

export interface BatchProcessingResponse {
  success: boolean;
  results: Array<{
    assetId: string;
    success: boolean;
    result?: unknown;
    error?: string;
  }>;
  stats: {
    total: number;
    successful: number;
    failed: number;
  };
}

// ============================================================================
// STORAGE TYPES
// ============================================================================

export interface StorageConfig {
  provider: 'supabase' | 's3' | 'cloudinary' | 'local';
  bucket?: string;
  maxFileSize?: number; // bytes
  allowedTypes?: AssetType[];
}

export interface SignedUploadURL {
  url: string;
  fields: Record<string, string>;
  assetId: string;
  expiresAt: string;
}

// ============================================================================
// MEDIA LIBRARY
// ============================================================================

export interface MediaLibraryQuery {
  boardId?: string;
  types?: AssetType[];
  status?: AssetStatus[];
  searchQuery?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'updated_at' | 'filename' | 'file_size';
  orderDirection?: 'asc' | 'desc';
}

export interface MediaLibraryResponse {
  assets: Asset[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================================================
// DOWNLOAD TYPES
// ============================================================================

export interface DownloadRequest {
  assetId: string;
  format?: 'original' | 'processed';
}

export interface DownloadResponse {
  success: boolean;
  url?: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  error?: string;
}

// ============================================================================
// QUOTA AND LIMITS
// ============================================================================

export interface StorageQuota {
  used: number; // bytes
  limit: number; // bytes
  percentage: number;
  byType: Record<AssetType, number>;
}

export interface ProcessingLimits {
  maxFileSize: {
    video: number;
    audio: number;
    pdf: number;
    image: number;
  };
  maxDuration: {
    video: number; // seconds
    audio: number;
  };
  maxPages: {
    pdf: number;
  };
  concurrentProcessing: number;
}
