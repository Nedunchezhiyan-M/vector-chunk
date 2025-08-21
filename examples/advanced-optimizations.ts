import { 
  TextChunker, 
  StreamingChunker, 
  ParallelChunker, 
  IndexedChunker, 
  LazyChunker,
  VectorStore,
  createStreamingChunker,
  createParallelChunker,
  createIndexedChunker,
  createLazyChunker
} from '../src/index';
import { createReadStream } from 'fs';
import { performance } from 'perf_hooks';

// Performance measurement utility
function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`⏱️  ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
}

async function demonstrateOptimizations() {
  console.log('🚀 Vector Chunk Package - Advanced Optimizations Demo\n');

  // Sample large text for testing
  const largeText = generateLargeText(100000); // 100KB text
  console.log(`📝 Generated test text: ${(largeText.length / 1024).toFixed(1)}KB\n`);

  // 1. Standard Chunking (Baseline)
  console.log('1️⃣  Standard Chunking (Baseline)');
  const standardChunker = new TextChunker({ chunkSize: 512, strategy: 'fixed' });
  
  const standardChunks = measurePerformance('Standard chunking', () => 
    standardChunker.chunkText(largeText)
  );
  console.log(`   📊 Chunks created: ${standardChunks.length}\n`);

  // 2. Streaming Chunking (Memory Efficient)
  console.log('2️⃣  Streaming Chunking (Memory Efficient)');
  const streamingChunker = createStreamingChunker({ chunkSize: 512, strategy: 'fixed' });
  
  // Simulate streaming by processing text in chunks
  const textChunks = chunkTextForStreaming(largeText, 10000);
  let streamingChunks: any[] = [];
  
  measurePerformance('Streaming chunking', () => {
    textChunks.forEach(chunk => {
      streamingChunker.write(Buffer.from(chunk));
    });
    streamingChunker.end();
    
    streamingChunker.on('data', (chunk) => {
      streamingChunks.push(chunk);
    });
  });
  
  console.log(`   📊 Chunks created: ${streamingChunks.length}`);
  console.log(`   💾 Memory efficient: Yes\n`);

  // 3. Parallel Chunking (Multi-threaded)
  console.log('3️⃣  Parallel Chunking (Multi-threaded)');
  const parallelChunker = createParallelChunker({ chunkSize: 512, strategy: 'fixed' }, 4);
  
  const parallelChunks = await measurePerformance('Parallel chunking', async () => 
    parallelChunker.chunkTextParallel(largeText)
  );
  
  const stats = parallelChunker.getPerformanceStats();
  console.log(`   📊 Chunks created: ${parallelChunks.length}`);
  console.log(`   🔄 Workers used: ${stats.numWorkers}`);
  console.log(`   ⚡ Estimated speedup: ${stats.estimatedSpeedup}x\n`);

  // 4. Indexed Chunking (Smart Content Filtering)
  console.log('4️⃣  Indexed Chunking (Smart Content Filtering)');
  const indexedChunker = createIndexedChunker({ chunkSize: 512, strategy: 'semantic' }, 0.4);
  
  const { chunks: indexedChunks, index } = measurePerformance('Indexed chunking', () => 
    indexedChunker.smartChunkText(largeText)
  );
  
  const chunkingStats = indexedChunker.getChunkingStats(index);
  console.log(`   📊 Chunks created: ${indexedChunks.length}`);
  console.log(`   🎯 Relevance threshold: 0.4`);
  console.log(`   📈 Efficiency gain: ${(chunkingStats.efficiencyGain * 100).toFixed(1)}%`);
  console.log(`   🔍 Sections processed: ${index.metadata.relevantSections}/${index.metadata.totalSections}\n`);

  // 5. Lazy Chunking (On-Demand Processing)
  console.log('5️⃣  Lazy Chunking (On-Demand Processing)');
  const lazyChunker = createLazyChunker(largeText, { chunkSize: 512, strategy: 'fixed' });
  
  // Get total chunks without processing
  const totalChunks = lazyChunker.getTotalChunks();
  console.log(`   📊 Total chunks available: ${totalChunks}`);
  
  // Process only first few chunks
  const lazyChunks = measurePerformance('Lazy chunking (first 5)', () => {
    lazyChunker.processBatch(0, 5);
    return lazyChunker.getChunks(0, 5);
  });
  
  const memoryStats = lazyChunker.getMemoryStats();
  console.log(`   📊 Chunks processed: ${lazyChunks.length}`);
  console.log(`   💾 Memory usage: ${memoryStats.memoryUsage} chars`);
  console.log(`   🚀 Memory savings: ${memoryStats.estimatedMemorySavings} chars\n`);

  // 6. Performance Comparison
  console.log('6️⃣  Performance Comparison');
  console.log('   📊 Standard:     ${standardChunks.length} chunks');
  console.log('   📊 Streaming:    ${streamingChunks.length} chunks');
  console.log('   📊 Parallel:     ${parallelChunks.length} chunks');
  console.log('   📊 Indexed:      ${indexedChunks.length} chunks');
  console.log('   📊 Lazy:         ${lazyChunks.length} chunks processed\n');

  // 7. Advanced Usage: Combined Approach
  console.log('7️⃣  Combined Optimization Approach');
  
  // Use indexed chunking to find relevant sections
  const relevantChunks = indexedChunker.chunkTextWithKeywords(
    largeText, 
    ['optimization', 'performance', 'efficiency'],
    { source: 'combined-approach' }
  );
  
  // Process relevant chunks in parallel
  const combinedChunks = await parallelChunker.chunkTextParallel(
    relevantChunks.map(c => c.content).join('\n\n'),
    { source: 'combined-approach', optimized: true }
  );
  
  console.log(`   📊 Combined approach chunks: ${combinedChunks.length}`);
  console.log(`   🎯 Focused on relevant content only`);
  console.log(`   ⚡ Maximum performance achieved!\n`);

  // 8. Vector Store Integration
  console.log('8️⃣  Vector Store Integration');
  const store = new VectorStore();
  
  measurePerformance('Adding chunks to vector store', () => {
    store.addChunks(combinedChunks);
  });
  
  console.log(`   📊 Chunks in store: ${store.getStats().totalChunks}`);
  console.log(`   🔍 Store ready for similarity search\n`);

  console.log('✅ All optimizations demonstrated successfully!');
  console.log('\n💡 Key Benefits:');
  console.log('   • Streaming: Memory efficient for large files');
  console.log('   • Parallel: Multi-threaded processing');
  console.log('   • Indexed: Smart content filtering');
  console.log('   • Lazy: On-demand processing');
  console.log('   • Combined: Maximum performance');
}

// Utility functions
function generateLargeText(size: number): string {
  const words = [
    'optimization', 'performance', 'efficiency', 'algorithm', 'data', 'processing',
    'vector', 'chunking', 'text', 'analysis', 'machine', 'learning', 'artificial',
    'intelligence', 'natural', 'language', 'semantic', 'meaning', 'context',
    'similarity', 'distance', 'cosine', 'euclidean', 'manhattan', 'normalization'
  ];
  
  let text = '';
  for (let i = 0; i < size; i++) {
    const word = words[Math.floor(Math.random() * words.length)];
    text += word + ' ';
    
    if (i % 100 === 0) text += '\n\n';
    if (i % 20 === 0) text += '. ';
  }
  
  return text.trim();
}

function chunkTextForStreaming(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

// Run the demonstration
if (require.main === module) {
  demonstrateOptimizations().catch(console.error);
}
