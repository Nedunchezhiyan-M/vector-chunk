# 🚀 Vector Chunk Package - Complete Usage Guide

## 🎯 Overview
High-performance, dependency-free text chunking package optimized for Elasticsearch integration. Perfect for document management systems, knowledge bases, and search applications.

## 📦 Installation
```bash
npm install vector-chunk
```

## 🔄 Complete Workflow
```
Frontend Upload → Backend Processing → Database Storage → Elasticsearch Indexing → Search & Retrieval
```

## 📡 Backend API Implementation

### 1. File Upload & Processing
```typescript
import { createStreamingChunker, createIndexedChunker } from 'vector-chunk';
import { Client } from '@elastic/elasticsearch';

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const fileContent = await fs.readFile(file.path, 'utf8');
    
    // Choose strategy based on file size
    let chunks;
    if (fileContent.length > 1000000) { // > 1MB
      // Streaming for large files
      const streamingChunker = createStreamingChunker({
        chunkSize: 512,
        strategy: 'semantic'
      });
      
      chunks = await new Promise((resolve) => {
        const chunks: any[] = [];
        const fileStream = fs.createReadStream(file.path);
        fileStream.pipe(streamingChunker)
          .on('data', chunk => chunks.push(chunk))
          .on('end', () => resolve(chunks));
      });
    } else {
      // Indexed for smaller files
      const indexedChunker = createIndexedChunker({
        chunkSize: 512,
        strategy: 'semantic'
      }, 0.3);
      
      const result = indexedChunker.smartChunkText(fileContent);
      chunks = result.chunks;
    }
    
    // Store in database
    const fileRecord = await db.files.create({
      filename: file.originalname,
      size: file.size,
      chunks: chunks.length
    });
    
    // Store chunks
    for (const chunk of chunks) {
      await db.chunks.create({
        fileId: fileRecord.id,
        content: chunk.content,
        vector: JSON.stringify(chunk.vector),
        metadata: chunk.metadata,
        chunkIndex: chunk.chunkIndex
      });
    }
    
    // Index in Elasticsearch
    const esClient = new Client({ node: 'http://localhost:9200' });
    for (const chunk of chunks) {
      await esClient.index({
        index: 'documents',
        body: {
          fileId: fileRecord.id,
          filename: file.originalname,
          content: chunk.content,
          vector: chunk.vector.values,
          metadata: chunk.metadata,
          chunkIndex: chunk.chunkIndex
        }
      });
    }
    
    res.json({
      success: true,
      fileId: fileRecord.id,
      chunks: chunks.length
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. Search & Retrieval
```typescript
app.get('/api/search', async (req, res) => {
  try {
    const { query, fileId, limit = 10, searchType = 'hybrid' } = req.query;
    
    // Generate query vector
    const queryVector = generateQueryVector(query);
    
    // Search Elasticsearch
    const esClient = new Client({ node: 'http://localhost:9200' });
    
    let searchQuery: any = {};
    if (searchType === 'hybrid') {
      searchQuery = {
        query: {
          bool: {
            must: [
              { match: { content: query } },
              ...(fileId ? [{ term: { fileId } }] : [])
            ]
          }
        },
        knn: {
          field: 'vector',
          query_vector: queryVector,
          k: parseInt(limit as string),
          num_candidates: 100
        }
      };
    }
    
    const searchResult = await esClient.search({
      index: 'documents',
      body: searchQuery,
      size: parseInt(limit as string)
    });
    
    // Get full chunk data from database
    const hits = searchResult.hits.hits;
    const chunkIds = hits.map(hit => hit._source.chunkIndex);
    
    const chunks = await db.chunks.findAll({
      where: { 
        fileId: fileId || hits[0]._source.fileId,
        chunkIndex: chunkIds
      },
      order: [['chunkIndex', 'ASC']]
    });
    
    res.json({
      results: chunks.map(chunk => ({
        content: chunk.content,
        metadata: chunk.metadata,
        score: hits.find(h => h._source.chunkIndex === chunk.chunkIndex)?._score
      }))
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function generateQueryVector(query: string) {
  const dimension = 128;
  const values = new Array(dimension).fill(0);
  
  for (let i = 0; i < query.length; i++) {
    const charCode = query.charCodeAt(i);
    const index = charCode % dimension;
    values[index] += 1;
  }
  
  const norm = Math.sqrt(values.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < dimension; i++) {
      values[i] /= norm;
    }
  }
  
  return values;
}
```

## 🎨 Frontend Integration

### File Upload Component
```typescript
// React component
const FileUploader = () => {
  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    if (result.success) {
      console.log(`File processed: ${result.chunks} chunks created`);
    }
  };

  return (
    <input 
      type="file" 
      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
      accept=".txt,.md,.pdf,.doc,.docx"
    />
  );
};
```

### Search Component
```typescript
const FileSearch = ({ fileId }: { fileId?: string }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        limit: '20'
      });
      
      if (fileId) params.append('fileId', fileId);
      
      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search content..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      
      <div className="results">
        {results.map((result, index) => (
          <div key={index} className="result-item">
            <p><strong>Score:</strong> {result.score?.toFixed(3)}</p>
            <p><strong>Content:</strong> {result.content}</p>
            <p><strong>Metadata:</strong> {JSON.stringify(result.metadata)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🗄️ Database Schema

### Prisma Schema
```prisma
model File {
  id              String   @id @default(cuid())
  filename        String
  size            Int
  chunks          Int      @default(0)
  uploadedAt      DateTime @default(now())
  chunks          Chunk[]
}

model Chunk {
  id            String   @id @default(cuid())
  fileId        String
  content       String
  vector        Json
  metadata      Json
  chunkIndex    Int
  startPosition Int
  endPosition   Int
  file          File     @relation(fields: [fileId], references: [id])
}
```

## 🔍 Elasticsearch Setup

### Index Configuration
```typescript
// Create index with vector support
await esClient.indices.create({
  index: 'documents',
  body: {
    mappings: {
      properties: {
        fileId: { type: 'keyword' },
        filename: { type: 'text' },
        content: { type: 'text' },
        vector: { 
          type: 'dense_vector',
          dims: 128,
          index: true,
          similarity: 'cosine'
        },
        metadata: { type: 'object' },
        chunkIndex: { type: 'integer' }
      }
    }
  }
});
```

## ⚡ Performance Optimization

### Strategy Selection
```typescript
const selectStrategy = (fileSize: number) => {
  if (fileSize < 100000) return 'standard';      // < 100KB
  if (fileSize < 1000000) return 'indexed';      // < 1MB
  if (fileSize < 10000000) return 'streaming';   // < 10MB
  return 'parallel';                              // > 10MB
};
```

### Batch Processing
```typescript
// Process chunks in batches
const processBatch = async (chunks: any[], batchSize = 100) => {
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    await Promise.all(batch.map(chunk => processChunk(chunk)));
    
    // Small delay to prevent overwhelming
    if (i + batchSize < chunks.length) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
};
```

## 🎯 Use Cases

✅ **Document management systems**  
✅ **Knowledge bases**  
✅ **Search applications**  
✅ **AI/ML pipelines**  
✅ **Content platforms**  
✅ **Research tools**  

## 🚀 Key Benefits

- **Zero dependencies** - No security vulnerabilities
- **High performance** - 5-15x speedup for large files
- **Elasticsearch ready** - Direct vector integration
- **Memory efficient** - Handle massive files
- **MIT licensed** - Commercial use friendly

## 📚 Next Steps

1. **Implement the APIs** above
2. **Set up database** with Prisma
3. **Configure Elasticsearch** with vector support
4. **Build frontend** components
5. **Add error handling** and logging
6. **Implement authentication** and rate limiting
7. **Add monitoring** and performance tracking

**Your package is perfect for this workflow! 🎉**

