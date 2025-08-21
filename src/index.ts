// Core exports
export { VectorMath } from './utils/vector-math';
export { TextChunker } from './chunking/text-chunker';
export { VectorStore } from './storage/vector-store';

// Type exports
export type {
  Vector,
  Chunk,
  ChunkingConfig,
  VectorStoreConfig,
  SearchResult,
  ElasticsearchDocument,
  ProcessingOptions,
  DataType
} from './types';

// Main classes for easy importing
export class VectorChunker {
  private textChunker: TextChunker;

  constructor(config: Partial<ChunkingConfig> = {}) {
    this.textChunker = new TextChunker(config);
  }

  /**
   * Chunk text using the configured strategy
   */
  chunkText(text: string, metadata: Record<string, any> = {}): Chunk[] {
    return this.textChunker.chunkText(text, metadata);
  }

  /**
   * Update chunking configuration
   */
  updateConfig(config: Partial<ChunkingConfig>): void {
    this.textChunker.updateConfig(config);
  }

  /**
   * Get current configuration
   */
  getConfig(): ChunkingConfig {
    return this.textChunker.getConfig();
  }
}

// Utility functions
export const utils = {
  /**
   * Create a random vector of specified dimension
   */
  createRandomVector: (dimension: number, min = -1, max = 1) => 
    VectorMath.random(dimension, min, max),

  /**
   * Create a zero vector of specified dimension
   */
  createZeroVector: (dimension: number) => 
    VectorMath.zero(dimension),

  /**
   * Normalize a vector to unit length
   */
  normalizeVector: (vector: Vector) => 
    VectorMath.normalize(vector),

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity: (a: Vector, b: Vector) => 
    VectorMath.cosineSimilarity(a, b),

  /**
   * Calculate Euclidean distance between two vectors
   */
  euclideanDistance: (a: Vector, b: Vector) => 
    VectorMath.euclideanDistance(a, b),

  /**
   * Calculate Manhattan distance between two vectors
   */
  manhattanDistance: (a: Vector, b: Vector) => 
    VectorMath.manhattanDistance(a, b),

  /**
   * Calculate dot product between two vectors
   */
  dotProduct: (a: Vector, b: Vector) => 
    VectorMath.dotProduct(a, b)
};

// Default configurations
export const defaultConfigs = {
  chunking: {
    chunkSize: 512,
    overlap: 50,
    strategy: 'fixed' as const,
    preserveParagraphs: true,
    minChunkSize: 100,
    maxChunkSize: 1024
  },
  vectorStore: {
    similarityMetric: 'cosine' as const,
    indexType: 'brute-force' as const,
    maxResults: 10,
    threshold: 0.0
  },
  processing: {
    normalizeVectors: false,
    validateInput: true,
    batchSize: 1000,
    timeout: 30000
  }
};

// Version information
export const VERSION = '1.0.0';
export const AUTHOR = 'Nedunchezhiyan M';
export const LICENSE = 'MIT';

