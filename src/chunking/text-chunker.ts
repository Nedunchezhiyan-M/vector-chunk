import { Chunk, ChunkingConfig } from '../types';
import { VectorMath } from '../utils/vector-math';

export class TextChunker {
  private config: ChunkingConfig;

  constructor(config: Partial<ChunkingConfig> = {}) {
    this.config = {
      chunkSize: 512,
      overlap: 50,
      strategy: 'fixed',
      preserveParagraphs: true,
      minChunkSize: 100,
      maxChunkSize: 1024,
      ...config
    };
  }

  /**
   * Chunk text using the configured strategy
   * Time complexity: O(n) where n is text length
   */
  chunkText(text: string, metadata: Record<string, any> = {}): Chunk[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    // Handle text shorter than chunk size
    if (text.length <= this.config.chunkSize) {
      if (text.length >= this.config.minChunkSize!) {
        return [this.createChunk(text.trim(), 0, metadata)];
      }
      return [];
    }

    switch (this.config.strategy) {
      case 'fixed':
        return this.fixedSizeChunking(text, metadata);
      case 'semantic':
        return this.semanticChunking(text, metadata);
      case 'sliding':
        return this.slidingWindowChunking(text, metadata);
      case 'adaptive':
        return this.adaptiveChunking(text, metadata);
      default:
        return this.fixedSizeChunking(text, metadata);
    }
  }

  /**
   * Fixed-size chunking with overlap
   * Time complexity: O(n)
   */
  private fixedSizeChunking(text: string, metadata: Record<string, any>): Chunk[] {
    const chunks: Chunk[] = [];
    const words = text.split(/\s+/);
    let currentChunk: string[] = [];
    let chunkIndex = 0;

    for (let i = 0; i < words.length; i++) {
      currentChunk.push(words[i]);
      
      if (currentChunk.join(' ').length >= this.config.chunkSize || i === words.length - 1) {
        const chunkText = currentChunk.join(' ').trim();
        
        if (chunkText.length >= this.config.minChunkSize!) {
          chunks.push(this.createChunk(chunkText, chunkIndex, metadata));
          chunkIndex++;
        }

        // Handle overlap - keep last few words for overlap
        if (this.config.overlap > 0 && i < words.length - 1) {
          // Calculate how many words to keep for overlap
          // Use a more aggressive overlap to ensure it works
          const overlapWordCount = Math.max(2, Math.ceil(this.config.overlap / 3));
          currentChunk = currentChunk.slice(-overlapWordCount);
        } else {
          currentChunk = [];
        }
      }
    }

    return chunks;
  }

  /**
   * Semantic chunking based on natural boundaries
   * Time complexity: O(n)
   */
  private semanticChunking(text: string, metadata: Record<string, any>): Chunk[] {
    const chunks: Chunk[] = [];
    const sentences = this.splitIntoSentences(text);
    let currentChunk = '';
    let chunkIndex = 0;

    for (const sentence of sentences) {
      const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;
      
      if (potentialChunk.length > this.config.chunkSize && currentChunk) {
        if (currentChunk.length >= this.config.minChunkSize!) {
          chunks.push(this.createChunk(currentChunk.trim(), chunkIndex, metadata));
          chunkIndex++;
        }
        currentChunk = sentence;
      } else {
        currentChunk = potentialChunk;
      }
    }

    // Add the last chunk
    if (currentChunk && currentChunk.length >= this.config.minChunkSize!) {
      chunks.push(this.createChunk(currentChunk.trim(), chunkIndex, metadata));
    }

    return chunks;
  }

  /**
   * Sliding window chunking with overlap
   * Time complexity: O(n)
   */
  private slidingWindowChunking(text: string, metadata: Record<string, any>): Chunk[] {
    const chunks: Chunk[] = [];
    const step = this.config.chunkSize - this.config.overlap;
    let chunkIndex = 0;

    for (let i = 0; i < text.length; i += step) {
      const chunkText = text.slice(i, i + this.config.chunkSize).trim();
      
      if (chunkText.length >= this.config.minChunkSize!) {
        chunks.push(this.createChunk(chunkText, chunkIndex, metadata));
        chunkIndex++;
      }
    }

    return chunks;
  }

  /**
   * Adaptive chunking based on content structure
   * Time complexity: O(n)
   */
  private adaptiveChunking(text: string, metadata: Record<string, any>): Chunk[] {
    const chunks: Chunk[] = [];
    const paragraphs = text.split(/\n\s*\n/);
    let currentChunk = '';
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) continue;

      if (currentChunk.length + trimmedParagraph.length <= this.config.chunkSize) {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmedParagraph;
      } else {
        if (currentChunk && currentChunk.length >= this.config.minChunkSize!) {
          chunks.push(this.createChunk(currentChunk, chunkIndex, metadata));
          chunkIndex++;
        }
        currentChunk = trimmedParagraph;
      }
    }

    // Add the last chunk
    if (currentChunk && currentChunk.length >= this.config.minChunkSize!) {
      chunks.push(this.createChunk(currentChunk, chunkIndex, metadata));
    }

    return chunks;
  }

  /**
   * Split text into sentences using multiple delimiters
   * Time complexity: O(n)
   */
  private splitIntoSentences(text: string): string[] {
    const sentenceEndings = /[.!?]+/g;
    const sentences = text.split(sentenceEndings);
    return sentences
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map((s, i) => {
        const ending = text.match(sentenceEndings)?.[i] || '';
        return s + ending;
      });
  }

  /**
   * Create a chunk with proper metadata
   * Time complexity: O(1)
   */
  private createChunk(content: string, chunkIndex: number, metadata: Record<string, any>): Chunk {
    const id = `chunk_${Date.now()}_${chunkIndex}`;
    
    // Create a simple hash-based vector for demonstration
    // In real usage, this would be replaced with actual embedding generation
    const vector = this.generateSimpleVector(content);
    
    return {
      id,
      content,
      vector,
      metadata: {
        ...metadata,
        chunkIndex,
        timestamp: new Date().toISOString(),
        length: content.length,
        wordCount: content.split(/\s+/).length
      },
      chunkIndex,
      startPosition: 0, // Would be calculated in real implementation
      endPosition: content.length
    };
  }

  /**
   * Generate a simple vector representation for demonstration
   * In production, this would use actual embedding models
   * Time complexity: O(n) where n is content length
   */
  private generateSimpleVector(content: string): any {
    const dimension = 128; // Configurable dimension
    const values = new Array(dimension).fill(0);
    
    // Simple character frequency-based vector
    for (let i = 0; i < content.length; i++) {
      const charCode = content.charCodeAt(i);
      const index = charCode % dimension;
      values[index] += 1;
    }
    
    // Normalize the vector
    const norm = Math.sqrt(values.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < dimension; i++) {
        values[i] /= norm;
      }
    }
    
    return { values, dimension };
  }

  /**
   * Update chunking configuration
   */
  updateConfig(newConfig: Partial<ChunkingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ChunkingConfig {
    return { ...this.config };
  }
}

