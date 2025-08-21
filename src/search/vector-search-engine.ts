import type { 
  Chunk, 
  SearchResult, 
  SearchOptions,
  VectorStoreConfig 
} from '../types';

/**
 * Simplified vector search engine
 * Optimized for basic document search with cosine similarity
 */
export class VectorSearchEngine {
  private chunks: Chunk[] = [];
  private config: VectorStoreConfig;

  constructor(config: Partial<VectorStoreConfig> = {}) {
    this.config = {
      similarityMetric: 'cosine',
      indexType: 'brute-force',
      maxResults: 10,
      threshold: 0.0,
      ...config
    };
  }

  /**
   * Add chunks to the search index
   */
  addChunks(chunks: Chunk[]): void {
    this.chunks.push(...chunks);
    // Indexed chunks
  }

  /**
   * Search for similar content using vector similarity
   */
  async search(
    query: string, 
    options: Partial<SearchOptions> = {}
  ): Promise<SearchResult[]> {
    const startTime = Date.now();
    
    // Create query vector
    const queryVector = this.createQueryVector(query);
    
    // Perform similarity search
    const results = this.performSimilaritySearch(queryVector, options);
    
    const searchTime = Date.now() - startTime;
    // Search completed
    
    return results;
  }

  /**
   * Search for similar content using the exact function from user's request
   */
  async searchContent(
    content: string, 
    searchText: string
  ): Promise<Array<{
    content: string;
    similarity: number;
    position: string;
  }>> {
    // Processing content
    
    // Process content into chunks
    const chunks = this.createChunksFromContent(content);
    // Created chunks
    
    // Search
    // Searching for content
    const startTime = Date.now();
    
    const searchChunk = this.createChunksFromContent(searchText)[0];
    const results = chunks.map(chunk => ({
      content: chunk.content,
      similarity: this.cosineSimilarity(searchChunk.vector.values, chunk.vector.values),
      position: `${chunk.startPosition}-${chunk.endPosition}`
    }));
    
    const searchTime = Date.now() - startTime;
    
    // Sort by similarity and show top results
    const topResults = results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
    
    // Search completed
    
    return topResults;
  }

  /**
   * Get search index statistics
   */
  getIndexStats() {
    return {
      totalChunks: this.chunks.length,
      totalDocuments: new Set(this.chunks.map(c => c.documentId)).size,
      averageChunksPerDocument: this.chunks.length / Math.max(1, new Set(this.chunks.map(c => c.documentId)).size)
    };
  }

  /**
   * Clear the search index
   */
  clearIndex(): void {
    this.chunks = [];
    // Search index cleared
  }

  /**
   * Update search configuration
   */
  updateConfig(config: Partial<VectorStoreConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Private helper methods

  private createQueryVector(query: string): { values: number[]; dimension: number; id: string } {
    // Simple vector generation based on character frequencies
    const charFreq = new Map<string, number>();
    const chars = query.toLowerCase().split('');
    
    chars.forEach(char => {
      if (char.match(/[a-z0-9]/)) {
        charFreq.set(char, (charFreq.get(char) || 0) + 1);
      }
    });
    
    // Create 128-dimensional vector
    const dimension = 128;
    const values = new Array(dimension).fill(0);
    
    let index = 0;
    for (const [char, freq] of charFreq) {
      if (index >= dimension) break;
      values[index] = freq / query.length;
      index++;
    }
    
    return {
      values,
      dimension,
      id: `query_${query.length}_${Date.now()}`
    };
  }

  private createChunksFromContent(content: string): Chunk[] {
    // Simple chunking for search
    const chunkSize = 512;
    const chunks: Chunk[] = [];
    
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunkContent = content.slice(i, i + chunkSize);
      const vector = this.createQueryVector(chunkContent);
      
      chunks.push({
        id: `chunk_${i}_${Date.now()}`,
        content: chunkContent,
        vector,
        metadata: {},
        chunkIndex: chunks.length,
        startPosition: i,
        endPosition: Math.min(i + chunkSize, content.length),
        documentId: 'search_content',
        chunkType: 'text'
      });
    }
    
    return chunks;
  }

  private performSimilaritySearch(
    queryVector: { values: number[]; dimension: number; id: string },
    options: Partial<SearchOptions> & { chunks?: Chunk[] } = {}
  ): SearchResult[] {
    const chunks = options.chunks || this.chunks;
    const similarityThreshold = options.similarityThreshold ?? this.config.threshold ?? 0.0;
    const maxResults = options.maxResults ?? this.config.maxResults ?? 10;
    
    // Calculate similarities
    const results: SearchResult[] = [];
    
    for (const chunk of chunks) {
      const similarity = this.cosineSimilarity(queryVector.values, chunk.vector.values);
      
      if (similarity >= similarityThreshold) {
        results.push({
          chunk,
          score: similarity,
          distance: 1 - similarity,
          relevance: this.getRelevanceLevel(similarity)
        });
      }
    }
    
    // Sort by score and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dot / denominator;
  }

  private getRelevanceLevel(similarity: number): 'high' | 'medium' | 'low' {
    if (similarity >= 0.8) return 'high';
    if (similarity >= 0.5) return 'medium';
    return 'low';
  }
}
