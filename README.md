# Vector Chunk Package

A lightweight, dependency-free package for vectorized data processing, chunking, and storage optimized for Elasticsearch integration.

## Features

- **Zero External Dependencies**: Pure Python implementation
- **Vector Operations**: Custom vector math and similarity calculations
- **Chunking Strategies**: Multiple text/document chunking algorithms
- **Elasticsearch Ready**: JSON-based storage format
- **Memory Efficient**: Optimized for large datasets
- **Type Safe**: Full type hints and validation

## Installation

```bash
# Clone the repository
git clone <your-repo>
cd vector-chunk

# Install in development mode
pip install -e .
```

## Quick Start

```python
from vector_chunk import VectorChunker, VectorStore

# Initialize chunker
chunker = VectorChunker(chunk_size=512, overlap=50)

# Chunk your text
text = "Your long text content here..."
chunks = chunker.chunk_text(text)

# Create vector store
store = VectorStore()
store.add_documents(chunks)

# Search similar vectors
results = store.search(query_vector, top_k=5)
```

## Architecture

- `vector_chunk/` - Main package directory
- `vector_chunk/core/` - Core vector operations
- `vector_chunk/chunking/` - Chunking algorithms
- `vector_chunk/storage/` - Storage and serialization
- `vector_chunk/utils/` - Utility functions
- `tests/` - Test suite

## License

MIT License - Free for commercial and personal use

