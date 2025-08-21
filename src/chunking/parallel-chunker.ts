import { Chunk, ChunkingConfig } from '../types';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { TextChunker } from './text-chunker';

export class ParallelChunker {
  private config: ChunkingConfig;
  private numWorkers: number;
  private chunker: TextChunker;

  constructor(config: Partial<ChunkingConfig> = {}, numWorkers: number = 4) {
    this.config = {
      chunkSize: 512,
      overlap: 50,
      strategy: 'fixed',
      preserveParagraphs: true,
      minChunkSize: 100,
      maxChunkSize: 1024,
      ...config
    };
    this.numWorkers = Math.min(numWorkers, require('os').cpus().length);
    this.chunker = new TextChunker(this.config);
  }

  /**
   * Process large text in parallel using worker threads
   * Time complexity: O(n/numWorkers) where n is text length
   */
  async chunkTextParallel(text: string, metadata: Record<string, any> = {}): Promise<Chunk[]> {
    if (!text || text.trim().length === 0) {
      return [];
    }

    // For small text, use single-threaded processing
    if (text.length < this.config.chunkSize * 2) {
      return this.chunker.chunkText(text, metadata);
    }

    // Split text into chunks for parallel processing
    const textChunks = this.splitTextForWorkers(text);
    
    // Process chunks in parallel
    const workerPromises = textChunks.map((textChunk, index) => 
      this.processChunkInWorker(textChunk, { ...metadata, workerIndex: index })
    );

    // Wait for all workers to complete
    const results = await Promise.all(workerPromises);
    
    // Merge and sort results
    return this.mergeChunkResults(results, metadata);
  }

  /**
   * Split text into chunks for parallel processing
   */
  private splitTextForWorkers(text: string): string[] {
    const chunks: string[] = [];
    const chunkSize = Math.ceil(text.length / this.numWorkers);
    
    for (let i = 0; i < this.numWorkers; i++) {
      const start = i * chunkSize;
      const end = i === this.numWorkers - 1 ? text.length : start + chunkSize;
      
      // Ensure we don't break in the middle of a word
      let actualEnd = end;
      if (end < text.length && text[end] !== ' ') {
        actualEnd = text.lastIndexOf(' ', end);
        if (actualEnd <= start) actualEnd = end;
      }
      
      chunks.push(text.slice(start, actualEnd));
    }
    
    return chunks.filter(chunk => chunk.trim().length > 0);
  }

  /**
   * Process a text chunk in a worker thread
   */
  private async processChunkInWorker(text: string, metadata: Record<string, any>): Promise<Chunk[]> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: { text, config: this.config, metadata }
      });

      worker.on('message', (chunks: Chunk[]) => {
        resolve(chunks);
        worker.terminate();
      });

      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  /**
   * Merge chunk results from multiple workers
   */
  private mergeChunkResults(workerResults: Chunk[][], metadata: Record<string, any>): Chunk[] {
    const allChunks: Chunk[] = [];
    let globalChunkIndex = 0;

    for (const workerChunks of workerResults) {
      for (const chunk of workerChunks) {
        // Update chunk index and metadata
        const updatedChunk: Chunk = {
          ...chunk,
          chunkIndex: globalChunkIndex,
          metadata: {
            ...chunk.metadata,
            ...metadata,
            workerIndex: chunk.metadata.workerIndex
          }
        };
        
        allChunks.push(updatedChunk);
        globalChunkIndex++;
      }
    }

    // Sort by chunk index to maintain order
    return allChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
  }

  /**
   * Process multiple files in parallel
   */
  async processFilesParallel(
    fileContents: string[], 
    metadata: Record<string, any> = {}
  ): Promise<Chunk[][]> {
    const workerPromises = fileContents.map((content, index) => 
      this.processChunkInWorker(content, { ...metadata, fileIndex: index })
    );

    return Promise.all(workerPromises);
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    numWorkers: number;
    maxConcurrency: number;
    estimatedSpeedup: number;
  } {
    const maxConcurrency = require('os').cpus().length;
    const estimatedSpeedup = Math.min(this.numWorkers, maxConcurrency);
    
    return {
      numWorkers: this.numWorkers,
      maxConcurrency,
      estimatedSpeedup
    };
  }
}

// Worker thread code
if (!isMainThread) {
  const { text, config, metadata } = workerData;
  
  try {
    const chunker = new TextChunker(config);
    const chunks = chunker.chunkText(text, metadata);
    
    parentPort!.postMessage(chunks);
  } catch (error) {
    parentPort!.postMessage([]);
  }
}

// Factory function for easy usage
export function createParallelChunker(
  config: Partial<ChunkingConfig> = {}, 
  numWorkers: number = 4
): ParallelChunker {
  return new ParallelChunker(config, numWorkers);
}
