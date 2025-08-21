import { Chunk, Vector, VectorStoreConfig, SearchResult, ProcessingOptions } from '../types';
import { VectorMath } from '../utils/vector-math';

export class VectorStore {
  private chunks: Chunk[] = [];
  private config: VectorStoreConfig;
  private index: Map<string, Chunk> = new Map();
  private vectorCache: Map<string, Vector> = new Map();

  constructor(config: Partial<VectorStoreConfig> = {}) {
    this.config = {
      similarityMetric: 'cosine',
      indexType: 'brute-force',
      maxResults: 10,
      threshold: 0.0,
      ...config
    };
  }

  /**
   * Add a single chunk to the store
   * Time complexity: O(1) for insertion, O(n) for indexing
   */
  addChunk(chunk: Chunk, options: ProcessingOptions = {}): void {
    if (options.validateInput !== false) {
      this.validateChunk(chunk);
    }

    this.chunks.push(chunk);
    this.index.set(chunk.id, chunk);
    this.vectorCache.set(chunk.id, chunk.vector);

    if (options.normalizeVectors) {
      chunk.vector = VectorMath.normalize(chunk.vector);
    }
  }

  /**
   * Add multiple chunks in batch for better performance
   * Time complexity: O(n) where n is number of chunks
   */
  addChunks(chunks: Chunk[], options: ProcessingOptions = {}): void {
    const batchSize = options.batchSize || 1000;
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      for (const chunk of batch) {
        this.addChunk(chunk, options);
      }
    }
  }

  /**
   * Search for similar vectors using configured similarity metric
   * Time complexity: O(n) for brute-force, O(log n) for tree-based
   */
  search(queryVector: Vector, topK?: number, options: ProcessingOptions = {}): SearchResult[] {
    const k = topK || this.config.maxResults!;
    const results: SearchResult[] = [];

    if (this.chunks.length === 0) {
      return results;
    }

    // Normalize query vector if requested
    const normalizedQuery = options.normalizeVectors ? 
      VectorMath.normalize(queryVector) : queryVector;

    // Calculate similarities/distances for all chunks
    for (const chunk of this.chunks) {
      const score = this.calculateSimilarity(normalizedQuery, chunk.vector);
      
      if (score >= this.config.threshold!) {
        results.push({
          chunk,
          score,
          distance: 1 - score // Convert similarity to distance
        });
      }
    }

    // Sort by score (descending) and take top k
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, k);
  }

  /**
   * Search by text content (converts to vector first)
   * Time complexity: O(n)
   */
  searchByText(text: string, topK?: number, options: ProcessingOptions = {}): SearchResult[] {
    const queryVector = this.textToVector(text);
    return this.search(queryVector, topK, options);
  }

  /**
   * Get chunk by ID
   * Time complexity: O(1)
   */
  getChunk(id: string): Chunk | undefined {
    return this.index.get(id);
  }

  /**
   * Remove chunk by ID
   * Time complexity: O(n) due to array removal
   */
  removeChunk(id: string): boolean {
    const chunk = this.index.get(id);
    if (!chunk) return false;

    this.index.delete(id);
    this.vectorCache.delete(id);
    
    const index = this.chunks.findIndex(c => c.id === id);
    if (index !== -1) {
      this.chunks.splice(index, 1);
      return true;
    }
    
    return false;
  }

  /**
   * Clear all chunks
   * Time complexity: O(1)
   */
  clear(): void {
    this.chunks = [];
    this.index.clear();
    this.vectorCache.clear();
  }

  /**
   * Get store statistics
   * Time complexity: O(1)
   */
  getStats(): {
    totalChunks: number;
    totalVectors: number;
    averageVectorDimension: number;
    memoryUsage: number;
  } {
    const totalChunks = this.chunks.length;
    const totalVectors = this.vectorCache.size;
    
    let totalDimension = 0;
    for (const chunk of this.chunks) {
      totalDimension += chunk.vector.dimension;
    }
    
    const averageVectorDimension = totalChunks > 0 ? totalDimension / totalChunks : 0;
    
    // Rough memory estimation (in bytes)
    const memoryUsage = totalChunks * 1024; // Approximate per chunk

    return {
      totalChunks,
      totalVectors,
      averageVectorDimension,
      memoryUsage
    };
  }

  /**
   * Export to Elasticsearch-compatible format
   * Time complexity: O(n)
   */
  exportToElasticsearch(indexName: string, typeName: string = '_doc'): any[] {
    return this.chunks.map(chunk => ({
      _index: indexName,
      _type: typeName,
      _id: chunk.id,
      _source: {
        content: chunk.content,
        vector: chunk.vector.values,
        metadata: chunk.metadata,
        chunkIndex: chunk.chunkIndex,
        startPosition: chunk.startPosition,
        endPosition: chunk.endPosition,
        timestamp: new Date().toISOString()
      }
    }));
  }

  /**
   * Import from Elasticsearch documents
   * Time complexity: O(n)
   */
  importFromElasticsearch(documents: any[], options: ProcessingOptions = {}): void {
    const chunks: Chunk[] = [];
    
    for (const doc of documents) {
      const source = doc._source;
      const chunk: Chunk = {
        id: doc._id,
        content: source.content,
        vector: {
          values: source.vector,
          dimension: source.vector.length
        },
        metadata: source.metadata || {},
        chunkIndex: source.chunkIndex || 0,
        startPosition: source.startPosition || 0,
        endPosition: source.endPosition || 0
      };
      
      chunks.push(chunk);
    }
    
    this.addChunks(chunks, options);
  }

  /**
   * Save store to JSON file
   * Time complexity: O(n)
   */
  saveToFile(filepath: string): void {
    const fs = require('fs');
    const data = {
      config: this.config,
      chunks: this.chunks,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  }

  /**
   * Load store from JSON file
   * Time complexity: O(n)
   */
  loadFromFile(filepath: string, options: ProcessingOptions = {}): void {
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    this.config = { ...this.config, ...data.config };
    this.clear();
    this.addChunks(data.chunks, options);
  }

  /**
   * Calculate similarity between two vectors using configured metric
   * Time complexity: O(n) where n is vector dimension
   */
  private calculateSimilarity(a: Vector, b: Vector): number {
    switch (this.config.similarityMetric) {
      case 'cosine':
        return VectorMath.cosineSimilarity(a, b);
      case 'euclidean':
        return 1 / (1 + VectorMath.euclideanDistance(a, b));
      case 'manhattan':
        return 1 / (1 + VectorMath.manhattanDistance(a, b));
      case 'dot':
        return VectorMath.dotProduct(a, b);
      default:
        return VectorMath.cosineSimilarity(a, b);
    }
  }

  /**
   * Convert text to vector (simple implementation)
   * Time complexity: O(n) where n is text length
   */
  private textToVector(text: string): Vector {
    const dimension = 128;
    const values = new Array(dimension).fill(0);
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = charCode % dimension;
      values[index] += 1;
    }
    
    // Normalize
    const norm = Math.sqrt(values.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < dimension; i++) {
        values[i] /= norm;
      }
    }
    
    return { values, dimension };
  }

  /**
   * Validate chunk before adding
   * Time complexity: O(1)
   */
  private validateChunk(chunk: Chunk): void {
    if (!chunk.id || !chunk.content || !chunk.vector) {
      throw new Error('Invalid chunk: missing required fields');
    }
    
    if (chunk.vector.values.length !== chunk.vector.dimension) {
      throw new Error('Invalid chunk: vector dimension mismatch');
    }
    
    if (chunk.content.trim().length === 0) {
      throw new Error('Invalid chunk: empty content');
    }
  }

  /**
   * Update store configuration
   */
  updateConfig(newConfig: Partial<VectorStoreConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): VectorStoreConfig {
    return { ...this.config };
  }
}

