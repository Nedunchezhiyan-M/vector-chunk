import { Chunk, ChunkingConfig } from '../types';
import { TextChunker } from './text-chunker';

export interface LazyChunk {
  readonly id: string;
  readonly content: string;
  readonly vector: any;
  readonly metadata: Record<string, any>;
  readonly chunkIndex: number;
  readonly startPosition: number;
  readonly endPosition: number;
  readonly isProcessed: boolean;
}

export class LazyChunker {
  private config: ChunkingConfig;
  private chunker: TextChunker;
  private text: string;
  private metadata: Record<string, any>;
  private chunkPositions: Array<{ start: number; end: number }> = [];
  private processedChunks: Map<number, Chunk> = new Map();
  private isIndexed: boolean = false;

  constructor(
    text: string, 
    config: Partial<ChunkingConfig> = {}, 
    metadata: Record<string, any> = {}
  ) {
    this.text = text;
    this.config = {
      chunkSize: 512,
      overlap: 50,
      strategy: 'fixed',
      preserveParagraphs: true,
      minChunkSize: 100,
      maxChunkSize: 1024,
      ...config
    };
    this.chunker = new TextChunker(this.config);
    this.metadata = metadata;
  }

  /**
   * Get total number of chunks without processing them
   * Time complexity: O(1) after indexing
   */
  getTotalChunks(): number {
    if (!this.isIndexed) {
      this.createChunkIndex();
    }
    return this.chunkPositions.length;
  }

  /**
   * Get a specific chunk by index, processing it only when requested
   * Time complexity: O(1) for processed chunks, O(n) for new chunks
   */
  getChunk(index: number): LazyChunk | null {
    if (!this.isIndexed) {
      this.createChunkIndex();
    }

    if (index < 0 || index >= this.chunkPositions.length) {
      return null;
    }

    // Return cached chunk if already processed
    if (this.processedChunks.has(index)) {
      const chunk = this.processedChunks.get(index)!;
      return this.createLazyChunk(chunk, true);
    }

    // Create lazy chunk that will be processed when accessed
    return this.createLazyChunkProxy(index);
  }

  /**
   * Get multiple chunks efficiently
   * Time complexity: O(k) where k is number of requested chunks
   */
  getChunks(startIndex: number, endIndex: number): LazyChunk[] {
    if (!this.isIndexed) {
      this.createChunkIndex();
    }

    const chunks: LazyChunk[] = [];
    for (let i = startIndex; i < endIndex && i < this.chunkPositions.length; i++) {
      const chunk = this.getChunk(i);
      if (chunk) chunks.push(chunk);
    }
    return chunks;
  }

  /**
   * Get all chunks (forces processing of all)
   * Time complexity: O(n) where n is text length
   */
  getAllChunks(): Chunk[] {
    if (!this.isIndexed) {
      this.createChunkIndex();
    }

    const chunks: Chunk[] = [];
    for (let i = 0; i < this.chunkPositions.length; i++) {
      const chunk = this.getChunk(i);
      if (chunk && chunk.isProcessed) {
        chunks.push(this.processedChunks.get(i)!);
      }
    }
    return chunks;
  }

  /**
   * Process chunks in batches for memory efficiency
   * Time complexity: O(batchSize * average_chunk_size)
   */
  processBatch(startIndex: number, batchSize: number): void {
    if (!this.isIndexed) {
      this.createChunkIndex();
    }

    const endIndex = Math.min(startIndex + batchSize, this.chunkPositions.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      if (!this.processedChunks.has(i)) {
        this.processChunkAtIndex(i);
      }
    }
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): {
    totalChunks: number;
    processedChunks: number;
    memoryUsage: number;
    estimatedMemorySavings: number;
  } {
    const totalChunks = this.getTotalChunks();
    const processedChunks = this.processedChunks.size;
    
    // Estimate memory usage (rough calculation)
    const averageChunkSize = this.text.length / Math.max(1, totalChunks);
    const memoryUsage = processedChunks * averageChunkSize;
    const estimatedMemorySavings = (totalChunks - processedChunks) * averageChunkSize;
    
    return {
      totalChunks,
      processedChunks,
      memoryUsage: Math.round(memoryUsage),
      estimatedMemorySavings: Math.round(estimatedMemorySavings)
    };
  }

  /**
   * Clear processed chunks to free memory
   */
  clearCache(): void {
    this.processedChunks.clear();
  }

  /**
   * Preload specific chunks for better performance
   */
  preloadChunks(indices: number[]): void {
    indices.forEach(index => {
      if (index >= 0 && index < this.chunkPositions.length && !this.processedChunks.has(index)) {
        this.processChunkAtIndex(index);
      }
    });
  }

  /**
   * Create chunk index without processing content
   */
  private createChunkIndex(): void {
    if (this.isIndexed) return;

    const chunks = this.chunker.chunkText(this.text, this.metadata);
    
    // Extract only position information
    this.chunkPositions = chunks.map(chunk => ({
      start: chunk.startPosition,
      end: chunk.endPosition
    }));

    this.isIndexed = true;
  }

  /**
   * Process chunk at specific index
   */
  private processChunkAtIndex(index: number): void {
    if (this.processedChunks.has(index)) return;

    const position = this.chunkPositions[index];
    const chunkText = this.text.slice(position.start, position.end);
    
    // Create chunk with proper metadata
    const chunk: Chunk = {
      id: `chunk_${Date.now()}_${index}`,
      content: chunkText,
      vector: this.generateSimpleVector(chunkText),
      metadata: {
        ...this.metadata,
        chunkIndex: index,
        timestamp: new Date().toISOString(),
        length: chunkText.length,
        wordCount: chunkText.split(/\s+/).length,
        lazyProcessed: true
      },
      chunkIndex: index,
      startPosition: position.start,
      endPosition: position.end
    };

    this.processedChunks.set(index, chunk);
  }

  /**
   * Create lazy chunk proxy that processes on access
   */
  private createLazyChunkProxy(index: number): LazyChunk {
    const position = this.chunkPositions[index];
    
    return new Proxy({} as LazyChunk, {
      get: (target, prop) => {
        // Process chunk if not already processed
        if (!this.processedChunks.has(index)) {
          this.processChunkAtIndex(index);
        }

        const chunk = this.processedChunks.get(index)!;
        
        switch (prop) {
          case 'id':
          case 'content':
          case 'vector':
          case 'metadata':
          case 'chunkIndex':
          case 'startPosition':
          case 'endPosition':
            return chunk[prop as keyof Chunk];
          case 'isProcessed':
            return true;
          default:
            return undefined;
        }
      }
    });
  }

  /**
   * Create lazy chunk wrapper
   */
  private createLazyChunk(chunk: Chunk, isProcessed: boolean): LazyChunk {
    return {
      get id() { return chunk.id; },
      get content() { return chunk.content; },
      get vector() { return chunk.vector; },
      get metadata() { return chunk.metadata; },
      get chunkIndex() { return chunk.chunkIndex; },
      get startPosition() { return chunk.startPosition; },
      get endPosition() { return chunk.endPosition; },
      get isProcessed() { return isProcessed; }
    };
  }

  /**
   * Generate simple vector for chunk
   */
  private generateSimpleVector(content: string): any {
    const dimension = 64;
    const values = new Array(dimension).fill(0);
    
    for (let i = 0; i < content.length; i++) {
      const charCode = content.charCodeAt(i);
      const index = charCode % dimension;
      values[index] += 1;
    }
    
    const norm = Math.sqrt(values.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < dimension; i++) {
        values[i] /= norm;
      }
    }
    
    return { values, dimension };
  }
}

// Factory function for easy usage
export function createLazyChunker(
  text: string,
  config: Partial<ChunkingConfig> = {}, 
  metadata: Record<string, any> = {}
): LazyChunker {
  return new LazyChunker(text, config, metadata);
}
