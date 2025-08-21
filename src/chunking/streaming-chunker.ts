import { Chunk, ChunkingConfig } from '../types';
import { Readable, Transform } from 'stream';

export class StreamingChunker extends Transform {
  private config: ChunkingConfig;
  private buffer: string = '';
  private chunkIndex: number = 0;
  private metadata: Record<string, any>;

  constructor(config: Partial<ChunkingConfig> = {}, metadata: Record<string, any> = {}) {
    super({ objectMode: true });
    this.config = {
      chunkSize: 512,
      overlap: 50,
      strategy: 'fixed',
      preserveParagraphs: true,
      minChunkSize: 100,
      maxChunkSize: 1024,
      ...config
    };
    this.metadata = metadata;
  }

  _transform(chunk: Buffer, encoding: string, callback: Function): void {
    try {
      const text = chunk.toString(encoding);
      this.buffer += text;
      
      // Process buffer in chunks
      this.processBuffer();
      
      callback();
    } catch (error) {
      callback(error);
    }
  }

  _flush(callback: Function): void {
    try {
      // Process remaining buffer
      if (this.buffer.trim().length > 0) {
        this.processBuffer(true);
      }
      callback();
    } catch (error) {
      callback(error);
    }
  }

  private processBuffer(isFinal: boolean = false): void {
    while (this.buffer.length >= this.config.chunkSize || (isFinal && this.buffer.length > 0)) {
      const chunkText = this.extractChunk();
      
      if (chunkText && chunkText.length >= this.config.minChunkSize!) {
        const chunk = this.createChunk(chunkText, this.chunkIndex, this.metadata);
        this.push(chunk);
        this.chunkIndex++;
      }
    }
  }

  private extractChunk(): string {
    let chunkText = '';
    
    switch (this.config.strategy) {
      case 'fixed':
        chunkText = this.extractFixedChunk();
        break;
      case 'semantic':
        chunkText = this.extractSemanticChunk();
        break;
      case 'sliding':
        chunkText = this.extractSlidingChunk();
        break;
      default:
        chunkText = this.extractFixedChunk();
    }
    
    return chunkText;
  }

  private extractFixedChunk(): string {
    const words = this.buffer.split(/\s+/);
    let currentChunk: string[] = [];
    let i = 0;
    
    for (; i < words.length; i++) {
      currentChunk.push(words[i]);
      if (currentChunk.join(' ').length >= this.config.chunkSize) {
        break;
      }
    }
    
    const chunkText = currentChunk.join(' ').trim();
    
    // Handle overlap
    if (this.config.overlap > 0 && i < words.length - 1) {
      const overlapWordCount = Math.max(2, Math.ceil(this.config.overlap / 3));
      const overlapWords = currentChunk.slice(-overlapWordCount);
      this.buffer = overlapWords.join(' ') + ' ' + words.slice(i + 1).join(' ');
    } else {
      this.buffer = words.slice(i + 1).join(' ');
    }
    
    return chunkText;
  }

  private extractSemanticChunk(): string {
    const sentences = this.buffer.split(/[.!?]+/);
    let currentChunk = '';
    let i = 0;
    
    for (; i < sentences.length; i++) {
      const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + sentences[i];
      if (potentialChunk.length > this.config.chunkSize && currentChunk) {
        break;
      }
      currentChunk = potentialChunk;
    }
    
    const chunkText = currentChunk.trim();
    this.buffer = sentences.slice(i).join('.') + '.';
    
    return chunkText;
  }

  private extractSlidingChunk(): string {
    const chunkText = this.buffer.slice(0, this.config.chunkSize).trim();
    const step = this.config.chunkSize - this.config.overlap;
    this.buffer = this.buffer.slice(step);
    
    return chunkText;
  }

  private createChunk(content: string, chunkIndex: number, metadata: Record<string, any>): Chunk {
    const id = `chunk_${Date.now()}_${chunkIndex}`;
    
    // Simple vector generation for streaming
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
        wordCount: content.split(/\s+/).length,
        streaming: true
      },
      chunkIndex,
      startPosition: 0,
      endPosition: content.length
    };
  }

  private generateSimpleVector(content: string): any {
    const dimension = 64; // Smaller dimension for streaming
    const values = new Array(dimension).fill(0);
    
    for (let i = 0; i < content.length; i++) {
      const charCode = content.charCodeAt(i);
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
}

// Factory function for easy usage
export function createStreamingChunker(
  config: Partial<ChunkingConfig> = {}, 
  metadata: Record<string, any> = {}
): StreamingChunker {
  return new StreamingChunker(config, metadata);
}

// Utility function to process file streams
export function processFileStream(
  fileStream: Readable,
  config: Partial<ChunkingConfig> = {},
  metadata: Record<string, any> = {}
): StreamingChunker {
  const chunker = createStreamingChunker(config, metadata);
  return fileStream.pipe(chunker);
}
