# Vector Chunk Package - Usage Guide

## Quick Start

```typescript
import { VectorChunker, VectorStore, utils } from 'vector-chunk';

// 1. Create a chunker
const chunker = new VectorChunker({
  chunkSize: 512,
  overlap: 50,
  strategy: 'semantic'
});

// 2. Chunk your text
const text = "Your long text content here...";
const chunks = chunker.chunkText(text, { source: 'document1' });

// 3. Create a vector store
const store = new VectorStore({
  similarityMetric: 'cosine',
  maxResults: 10
});

// 4. Add chunks to store
store.addChunks(chunks);

// 5. Search for similar content
const queryVector = utils.createRandomVector(128); // Replace with actual embedding
const results = store.search(queryVector, 5);
```

## Chunking Strategies

### 1. Fixed Size Chunking
```typescript
const chunker = new VectorChunker({
  strategy: 'fixed',
  chunkSize: 500,
  overlap: 50
});
```
- **Best for**: Consistent chunk sizes, simple text processing
- **Use case**: When you need uniform chunk sizes for processing

### 2. Semantic Chunking
```typescript
const chunker = new VectorChunker({
  strategy: 'semantic',
  chunkSize: 600,
  preserveParagraphs: true
});
```
- **Best for**: Natural language processing, maintaining context
- **Use case**: When you want to preserve sentence and paragraph boundaries

### 3. Sliding Window Chunking
```typescript
const chunker = new VectorChunker({
  strategy: 'sliding',
  chunkSize: 400,
  overlap: 100
});
```
- **Best for**: Overlapping analysis, context preservation
- **Use case**: When you need high overlap between chunks

### 4. Adaptive Chunking
```typescript
const chunker = new VectorChunker({
  strategy: 'adaptive',
  chunkSize: 500,
  preserveParagraphs: true
});
```
- **Best for**: Mixed content types, flexible chunking
- **Use case**: When content has varying structure

## Vector Store Operations

### Basic Operations
```typescript
const store = new VectorStore({
  similarityMetric: 'cosine', // 'cosine', 'euclidean', 'manhattan', 'dot'
  indexType: 'brute-force',   // 'brute-force', 'kd-tree', 'ball-tree'
  maxResults: 20,
  threshold: 0.1
});

// Add single chunk
store.addChunk(chunk);

// Add multiple chunks
store.addChunks(chunks, { batchSize: 1000 });

// Search by vector
const results = store.search(queryVector, 10);

// Search by text (auto-converts to vector)
const textResults = store.searchByText("query text", 10);
```

### Similarity Metrics

1. **Cosine Similarity** (default)
   - Range: -1 to 1
   - Best for: Normalized vectors, direction similarity
   - Formula: `cos(θ) = (A·B) / (||A|| ||B||)`

2. **Euclidean Distance**
   - Range: 0 to ∞
   - Best for: Absolute distance measurements
   - Formula: `√(Σ(Ai - Bi)²)`

3. **Manhattan Distance**
   - Range: 0 to ∞
   - Best for: Grid-based distances, L1 norm
   - Formula: `Σ|Ai - Bi|`

4. **Dot Product**
   - Range: -∞ to ∞
   - Best for: Raw similarity scores
   - Formula: `Σ(Ai × Bi)`

## Performance Optimization

### Batch Processing
```typescript
// Process large datasets in batches
const options = {
  batchSize: 1000,
  normalizeVectors: false,
  validateInput: false
};

store.addChunks(largeChunkArray, options);
```

### Memory Management
```typescript
// Get store statistics
const stats = store.getStats();
console.log(`Memory usage: ${stats.memoryUsage} bytes`);

// Clear store when needed
store.clear();
```

### Configuration Tuning
```typescript
// Update configurations dynamically
chunker.updateConfig({ chunkSize: 300, overlap: 30 });
store.updateConfig({ similarityMetric: 'euclidean', threshold: 0.2 });
```

## Elasticsearch Integration

### Export Format
```typescript
// Export to Elasticsearch-compatible format
const esDocs = store.exportToElasticsearch('my_index', '_doc');

// Result format:
// {
//   _index: 'my_index',
//   _type: '_doc',
//   _id: 'chunk_id',
//   _source: {
//     content: 'chunk content',
//     vector: [0.1, 0.2, ...],
//     metadata: { ... },
//     chunkIndex: 0,
//     startPosition: 0,
//     endPosition: 100,
//     timestamp: '2024-01-01T00:00:00.000Z'
//   }
// }
```

### Import from Elasticsearch
```typescript
// Import existing Elasticsearch documents
const esDocuments = [/* your ES documents */];
store.importFromElasticsearch(esDocuments);
```

## File Operations

### Save/Load Store
```typescript
// Save store to file
store.saveToFile('./my_store.json');

// Load store from file
const newStore = new VectorStore();
newStore.loadFromFile('./my_store.json');
```

## Error Handling

### Input Validation
```typescript
try {
  store.addChunk(invalidChunk);
} catch (error) {
  if (error.message.includes('Invalid chunk')) {
    console.log('Chunk validation failed:', error.message);
  }
}
```

### Configuration Validation
```typescript
try {
  chunker.updateConfig({ chunkSize: -100 }); // Invalid
} catch (error) {
  console.log('Configuration error:', error.message);
}
```

## Best Practices

### 1. Chunk Size Selection
- **Small chunks (100-300 chars)**: High precision, good for short queries
- **Medium chunks (300-800 chars)**: Balanced precision and context
- **Large chunks (800+ chars)**: High context, good for long-form content

### 2. Overlap Configuration
- **Low overlap (10-20%)**: Minimal redundancy, faster processing
- **Medium overlap (20-40%)**: Good context preservation
- **High overlap (40%+)**: Maximum context, slower processing

### 3. Vector Normalization
```typescript
// Normalize vectors for better cosine similarity
const options = { normalizeVectors: true };
store.addChunks(chunks, options);
```

### 4. Batch Processing
```typescript
// Use appropriate batch sizes
const batchSize = Math.min(1000, Math.ceil(totalChunks / 10));
store.addChunks(chunks, { batchSize });
```

### 5. Memory Management
```typescript
// Monitor memory usage
setInterval(() => {
  const stats = store.getStats();
  if (stats.memoryUsage > MAX_MEMORY) {
    store.clear(); // Or implement LRU eviction
  }
}, 60000);
```

## Advanced Usage

### Custom Vector Generation
```typescript
// Replace simple vector generation with your embedding model
class CustomTextChunker extends TextChunker {
  private async generateVector(text: string): Promise<Vector> {
    // Call your embedding API here
    const embedding = await yourEmbeddingModel.embed(text);
    return {
      values: embedding,
      dimension: embedding.length
    };
  }
}
```

### Custom Similarity Metrics
```typescript
class CustomVectorStore extends VectorStore {
  protected calculateSimilarity(a: Vector, b: Vector): number {
    // Implement your custom similarity metric
    return yourCustomSimilarity(a, b);
  }
}
```

### Streaming Processing
```typescript
import { Readable } from 'stream';

async function* processStream(textStream: Readable) {
  for await (const chunk of textStream) {
    const chunks = chunker.chunkText(chunk.toString());
    yield chunks;
  }
}
```

## Troubleshooting

### Common Issues

1. **Memory Usage High**
   - Reduce batch size
   - Implement chunk eviction
   - Use streaming processing

2. **Slow Search Performance**
   - Reduce vector dimensions
   - Use more efficient similarity metrics
   - Implement indexing strategies

3. **Chunk Quality Issues**
   - Adjust chunk size and overlap
   - Change chunking strategy
   - Validate input text quality

### Performance Monitoring
```typescript
console.time('chunking');
const chunks = chunker.chunkText(text);
console.timeEnd('chunking');

console.time('search');
const results = store.search(queryVector);
console.timeEnd('search');
```

## Support and Contributing

- **Issues**: Report bugs and feature requests on GitHub
- **Contributions**: Pull requests welcome
- **Documentation**: Help improve this guide
- **Performance**: Share optimization tips

For more examples, see the `examples/` directory in the source code.

