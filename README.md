# Vector Chunk Package

A lightweight, dependency-free npm package for vectorized data processing, chunking, and storage optimized for Elasticsearch integration.

## Features

- **Zero External Dependencies**: Pure Node.js implementation
- **Vector Operations**: Custom vector math and similarity calculations
- **Chunking Strategies**: Multiple text/document chunking algorithms
- **Elasticsearch Ready**: JSON-based storage format
- **Memory Efficient**: Optimized for large datasets
- **Type Safe**: Full TypeScript support

## Installation

```bash
npm install vector-chunk
```

## Quick Start

```typescript
import { TextChunker, VectorStore } from 'vector-chunk';

// Initialize chunker
const chunker = new TextChunker({ chunkSize: 512, overlap: 50 });

// Chunk your text
const text = "Your long text content here...";
const chunks = chunker.chunkText(text);

// Create vector store
const store = new VectorStore();
store.addChunks(chunks);

// Search similar vectors
const results = store.search(queryVector, { topK: 5 });
```

## Architecture

- `src/utils/` - Vector math operations
- `src/chunking/` - Chunking algorithms (Standard, Streaming, Parallel, Indexed, Lazy)
- `src/storage/` - Vector store and Elasticsearch integration
- `src/types/` - TypeScript type definitions

## License

MIT License - Free for commercial and personal use

