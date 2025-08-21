import { 
  VectorChunker, 
  VectorStore, 
  utils, 
  defaultConfigs 
} from '../src/index';

// Example 1: Basic Text Chunking
console.log('=== Basic Text Chunking ===');
const chunker = new VectorChunker({
  chunkSize: 200,
  overlap: 30,
  strategy: 'semantic'
});

const sampleText = `Machine learning is a subset of artificial intelligence that focuses on the development of computer programs that can access data and use it to learn for themselves. The process of learning begins with observations or data, such as examples, direct experience, or instruction, in order to look for patterns in data and make better decisions in the future based on the examples that we provide. The primary aim is to allow the computers learn automatically without human intervention or assistance and adjust actions accordingly.`;

const chunks = chunker.chunkText(sampleText, { 
  source: 'machine_learning_intro',
  category: 'technology'
});

console.log(`Created ${chunks.length} chunks:`);
chunks.forEach((chunk, index) => {
  console.log(`Chunk ${index + 1}: ${chunk.content.substring(0, 100)}...`);
  console.log(`Vector dimension: ${chunk.vector.dimension}`);
  console.log(`Metadata:`, chunk.metadata);
  console.log('---');
});

// Example 2: Vector Store Operations
console.log('\n=== Vector Store Operations ===');
const store = new VectorStore({
  similarityMetric: 'cosine',
  maxResults: 5,
  threshold: 0.1
});

// Add chunks to store
store.addChunks(chunks);

// Create a query vector
const queryText = "artificial intelligence and machine learning";
const queryVector = utils.createRandomVector(128); // In real usage, this would be an actual embedding

// Search for similar chunks
const searchResults = store.search(queryVector, 3);
console.log(`Found ${searchResults.length} similar chunks:`);
searchResults.forEach((result, index) => {
  console.log(`Result ${index + 1} (Score: ${result.score.toFixed(4)}):`);
  console.log(`Content: ${result.chunk.content.substring(0, 80)}...`);
  console.log('---');
});

// Example 3: Different Chunking Strategies
console.log('\n=== Different Chunking Strategies ===');

const strategies = ['fixed', 'semantic', 'sliding', 'adaptive'] as const;

strategies.forEach(strategy => {
  console.log(`\n--- ${strategy.toUpperCase()} Strategy ---`);
  
  const strategyChunker = new VectorChunker({
    chunkSize: 150,
    overlap: 20,
    strategy
  });
  
  const strategyChunks = strategyChunker.chunkText(sampleText);
  console.log(`Created ${strategyChunks.length} chunks`);
  
  strategyChunks.forEach((chunk, index) => {
    console.log(`Chunk ${index + 1} (${chunk.content.length} chars): ${chunk.content.substring(0, 60)}...`);
  });
});

// Example 4: Batch Processing
console.log('\n=== Batch Processing ===');
const largeText = sampleText.repeat(10); // Create larger text
const batchChunker = new VectorChunker({ chunkSize: 300, overlap: 50 });

console.time('Batch chunking');
const batchChunks = batchChunker.chunkText(largeText);
console.timeEnd('Batch chunking');

console.log(`Processed ${largeText.length} characters into ${batchChunks.length} chunks`);

// Add all chunks to store in batch
console.time('Batch store addition');
store.addChunks(batchChunks, { batchSize: 100 });
console.timeEnd('Batch store addition');

// Example 5: Vector Operations
console.log('\n=== Vector Operations ===');
const vector1 = utils.createRandomVector(64, -1, 1);
const vector2 = utils.createRandomVector(64, -1, 1);

console.log('Vector 1:', vector1.values.slice(0, 5), '...');
console.log('Vector 2:', vector2.values.slice(0, 5), '...');

const cosineSim = utils.cosineSimilarity(vector1, vector2);
const euclideanDist = utils.euclideanDistance(vector1, vector2);
const dotProd = utils.dotProduct(vector1, vector2);

console.log(`Cosine Similarity: ${cosineSim.toFixed(4)}`);
console.log(`Euclidean Distance: ${euclideanDist.toFixed(4)}`);
console.log(`Dot Product: ${dotProd.toFixed(4)}`);

// Example 6: Store Statistics and Export
console.log('\n=== Store Statistics ===');
const stats = store.getStats();
console.log('Store Statistics:', stats);

// Export to Elasticsearch format
const esDocuments = store.exportToElasticsearch('machine_learning_docs');
console.log(`Exported ${esDocuments.length} documents in Elasticsearch format`);

// Example 7: Configuration Management
console.log('\n=== Configuration Management ===');
console.log('Current chunker config:', chunker.getConfig());
console.log('Current store config:', store.getConfig());

// Update configurations
chunker.updateConfig({ chunkSize: 250, strategy: 'adaptive' });
store.updateConfig({ similarityMetric: 'euclidean', threshold: 0.2 });

console.log('Updated chunker config:', chunker.getConfig());
console.log('Updated store config:', store.getConfig());

// Example 8: Error Handling
console.log('\n=== Error Handling ===');
try {
  // Try to add invalid chunk
  store.addChunk({
    id: '',
    content: '',
    vector: { values: [], dimension: 0 },
    metadata: {},
    chunkIndex: 0,
    startPosition: 0,
    endPosition: 0
  });
} catch (error) {
  console.log('Caught expected error:', error.message);
}

// Example 9: Performance Testing
console.log('\n=== Performance Testing ===');
const performanceText = 'Performance test '.repeat(1000);
const perfChunker = new VectorChunker({ chunkSize: 100, overlap: 10 });

console.time('Performance chunking');
const perfChunks = perfChunker.chunkText(performanceText);
console.timeEnd('Performance chunking');

console.log(`Performance: ${perfChunks.length} chunks created from ${performanceText.length} characters`);

// Example 10: File Operations
console.log('\n=== File Operations ===');
try {
  // Save store to file
  store.saveToFile('./example_store.json');
  console.log('Store saved to file successfully');
  
  // Load store from file
  const newStore = new VectorStore();
  newStore.loadFromFile('./example_store.json');
  console.log('Store loaded from file successfully');
  console.log('Loaded store stats:', newStore.getStats());
} catch (error) {
  console.log('File operations not available in this environment:', error.message);
}

console.log('\n=== Example Complete ===');
console.log('Package version:', require('../package.json').version);
console.log('All examples executed successfully!');

