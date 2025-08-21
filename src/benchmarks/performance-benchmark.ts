import { 
  TextChunker, 
  StreamingChunker, 
  ParallelChunker, 
  IndexedChunker, 
  LazyChunker,
  createStreamingChunker,
  createParallelChunker,
  createIndexedChunker,
  createLazyChunker
} from '../index';
import { performance } from 'perf_hooks';

export interface BenchmarkResult {
  name: string;
  executionTime: number;
  memoryUsage: number;
  chunksCreated: number;
  throughput: number; // chunks per second
  efficiency: number; // memory per chunk
}

export interface BenchmarkConfig {
  textSize: number; // in characters
  chunkSize: number;
  overlap: number;
  strategy: 'fixed' | 'semantic' | 'sliding' | 'adaptive';
  numWorkers?: number;
  relevanceThreshold?: number;
  iterations?: number;
}

export class PerformanceBenchmark {
  private config: BenchmarkConfig;
  private results: BenchmarkResult[] = [];

  constructor(config: BenchmarkConfig) {
    this.config = {
      iterations: 3,
      numWorkers: 4,
      relevanceThreshold: 0.3,
      ...config
    };
  }

  /**
   * Run comprehensive benchmark of all chunking strategies
   */
  async runBenchmark(): Promise<BenchmarkResult[]> {
    console.log('🚀 Starting Performance Benchmark...\n');
    
    // Generate test text
    const testText = this.generateTestText(this.config.textSize);
    console.log(`📝 Test text size: ${(testText.length / 1024).toFixed(1)}KB\n`);

    // Run benchmarks
    this.results = [
      await this.benchmarkStandardChunker(testText),
      await this.benchmarkStreamingChunker(testText),
      await this.benchmarkParallelChunker(testText),
      await this.benchmarkIndexedChunker(testText),
      await this.benchmarkLazyChunker(testText)
    ];

    // Sort by performance (execution time)
    this.results.sort((a, b) => a.executionTime - b.executionTime);

    return this.results;
  }

  /**
   * Benchmark standard chunker
   */
  private async benchmarkStandardChunker(text: string): Promise<BenchmarkResult> {
    const chunker = new TextChunker({
      chunkSize: this.config.chunkSize,
      overlap: this.config.overlap,
      strategy: this.config.strategy
    });

    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    const chunks = chunker.chunkText(text);
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      name: 'Standard Chunker',
      executionTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      chunksCreated: chunks.length,
      throughput: chunks.length / ((endTime - startTime) / 1000),
      efficiency: (endMemory - startMemory) / chunks.length
    };
  }

  /**
   * Benchmark streaming chunker
   */
  private async benchmarkStreamingChunker(text: string): Promise<BenchmarkResult> {
    const chunker = createStreamingChunker({
      chunkSize: this.config.chunkSize,
      overlap: this.config.overlap,
      strategy: this.config.strategy
    });

    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    const chunks: any[] = [];
    chunker.on('data', (chunk) => chunks.push(chunk));
    
    // Process text in chunks to simulate streaming
    const textChunks = this.chunkTextForStreaming(text, 10000);
    textChunks.forEach(chunk => chunker.write(Buffer.from(chunk)));
    chunker.end();
    
    // Wait for processing to complete
    await new Promise(resolve => chunker.on('end', resolve));
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      name: 'Streaming Chunker',
      executionTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      chunksCreated: chunks.length,
      throughput: chunks.length / ((endTime - startTime) / 1000),
      efficiency: (endMemory - startMemory) / chunks.length
    };
  }

  /**
   * Benchmark parallel chunker
   */
  private async benchmarkParallelChunker(text: string): Promise<BenchmarkResult> {
    const chunker = createParallelChunker({
      chunkSize: this.config.chunkSize,
      overlap: this.config.overlap,
      strategy: this.config.strategy
    }, this.config.numWorkers!);

    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    const chunks = await chunker.chunkTextParallel(text);
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      name: 'Parallel Chunker',
      executionTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      chunksCreated: chunks.length,
      throughput: chunks.length / ((endTime - startTime) / 1000),
      efficiency: (endMemory - startMemory) / chunks.length
    };
  }

  /**
   * Benchmark indexed chunker
   */
  private async benchmarkIndexedChunker(text: string): Promise<BenchmarkResult> {
    const chunker = createIndexedChunker({
      chunkSize: this.config.chunkSize,
      overlap: this.config.overlap,
      strategy: this.config.strategy
    }, this.config.relevanceThreshold!);

    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    const { chunks, index } = chunker.smartChunkText(text);
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      name: 'Indexed Chunker',
      executionTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      chunksCreated: chunks.length,
      throughput: chunks.length / ((endTime - startTime) / 1000),
      efficiency: (endMemory - startMemory) / chunks.length
    };
  }

  /**
   * Benchmark lazy chunker
   */
  private async benchmarkLazyChunker(text: string): Promise<BenchmarkResult> {
    const chunker = createLazyChunker(text, {
      chunkSize: this.config.chunkSize,
      overlap: this.config.overlap,
      strategy: this.config.strategy
    });

    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    // Get total chunks without processing
    const totalChunks = chunker.getTotalChunks();
    
    // Process all chunks to measure full performance
    const chunks = chunker.getAllChunks();
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      name: 'Lazy Chunker',
      executionTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      chunksCreated: chunks.length,
      throughput: chunks.length / ((endTime - startTime) / 1000),
      efficiency: (endMemory - startMemory) / chunks.length
    };
  }

  /**
   * Generate test text with realistic content
   */
  private generateTestText(size: number): string {
    const words = [
      'optimization', 'performance', 'efficiency', 'algorithm', 'data', 'processing',
      'vector', 'chunking', 'text', 'analysis', 'machine', 'learning', 'artificial',
      'intelligence', 'natural', 'language', 'semantic', 'meaning', 'context',
      'similarity', 'distance', 'cosine', 'euclidean', 'manhattan', 'normalization',
      'document', 'paragraph', 'sentence', 'word', 'character', 'byte', 'memory',
      'storage', 'database', 'elasticsearch', 'search', 'query', 'index', 'metadata'
    ];
    
    let text = '';
    for (let i = 0; i < size; i++) {
      const word = words[Math.floor(Math.random() * words.length)];
      text += word + ' ';
      
      // Add structure
      if (i % 100 === 0) text += '\n\n';
      if (i % 20 === 0) text += '. ';
      if (i % 50 === 0) text += '\n';
    }
    
    return text.trim();
  }

  /**
   * Split text for streaming simulation
   */
  private chunkTextForStreaming(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Print benchmark results in a formatted table
   */
  printResults(): void {
    console.log('📊 Benchmark Results:\n');
    
    // Table header
    console.log('Strategy'.padEnd(20) + 'Time (ms)'.padEnd(12) + 'Memory (KB)'.padEnd(15) + 'Chunks'.padEnd(10) + 'Throughput'.padEnd(15) + 'Efficiency');
    console.log('-'.repeat(90));
    
    // Table rows
    this.results.forEach(result => {
      const name = result.name.padEnd(20);
      const time = result.executionTime.toFixed(2).padEnd(12);
      const memory = (result.memoryUsage / 1024).toFixed(2).padEnd(15);
      const chunks = result.chunksCreated.toString().padEnd(10);
      const throughput = result.throughput.toFixed(1).padEnd(15);
      const efficiency = (result.efficiency / 1024).toFixed(2);
      
      console.log(`${name}${time}${memory}${chunks}${throughput}${efficiency}`);
    });
    
    console.log('\n🏆 Performance Rankings:');
    this.results.forEach((result, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
      console.log(`${medal} ${result.name}: ${result.executionTime.toFixed(2)}ms`);
    });
  }

  /**
   * Export results to JSON
   */
  exportResults(): string {
    return JSON.stringify({
      config: this.config,
      results: this.results,
      timestamp: new Date().toISOString(),
      summary: {
        fastest: this.results[0],
        mostEfficient: this.results.reduce((a, b) => a.efficiency < b.efficiency ? a : b),
        highestThroughput: this.results.reduce((a, b) => a.throughput > b.throughput ? a : b)
      }
    }, null, 2);
  }
}

// Factory function
export function createPerformanceBenchmark(config: BenchmarkConfig): PerformanceBenchmark {
  return new PerformanceBenchmark(config);
}

// Example usage
if (require.main === module) {
  const benchmark = createPerformanceBenchmark({
    textSize: 50000, // 50KB
    chunkSize: 512,
    overlap: 50,
    strategy: 'fixed',
    numWorkers: 4,
    relevanceThreshold: 0.3
  });

  benchmark.runBenchmark().then(() => {
    benchmark.printResults();
    console.log('\n📁 Exporting results...');
    console.log(benchmark.exportResults());
  }).catch(console.error);
}
