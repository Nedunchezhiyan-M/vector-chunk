export interface Vector {
  values: number[];
  dimension: number;
  id?: string;
  metadata?: Record<string, any>;
}

export interface Chunk {
  id: string;
  content: string;
  vector: Vector;
  metadata: Record<string, any>;
  chunkIndex: number;
  startPosition: number;
  endPosition: number;
}

export interface ChunkingConfig {
  chunkSize: number;
  overlap: number;
  strategy: 'fixed' | 'semantic' | 'sliding' | 'adaptive';
  preserveParagraphs?: boolean;
  minChunkSize?: number;
  maxChunkSize?: number;
}

export interface VectorStoreConfig {
  similarityMetric: 'cosine' | 'euclidean' | 'manhattan' | 'dot';
  indexType: 'brute-force' | 'kd-tree' | 'ball-tree';
  maxResults?: number;
  threshold?: number;
}

export interface SearchResult {
  chunk: Chunk;
  score: number;
  distance: number;
}

export interface ElasticsearchDocument {
  _index: string;
  _type: string;
  _id: string;
  _source: {
    content: string;
    vector: number[];
    metadata: Record<string, any>;
    chunkIndex: number;
    startPosition: number;
    endPosition: number;
    timestamp: string;
  };
}

export interface ProcessingOptions {
  normalizeVectors?: boolean;
  validateInput?: boolean;
  batchSize?: number;
  timeout?: number;
}

export type DataType = 'text' | 'json' | 'xml' | 'html' | 'markdown' | 'csv' | 'binary';

