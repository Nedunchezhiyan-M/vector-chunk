// Import types first
import type {
  Vector,
  Chunk,
  ChunkingConfig,
  VectorStoreConfig,
  SearchResult,
  SearchOptions,
  ContentAnalysis,
  ContentTone,
  WritingStyle,
  ContentDNA,
  PerformanceMetrics,
  OptimizationConfig,
  AdaptiveConfig,
  ContentFusion
} from './types';

// Import core classes
import { TextChunker } from './chunking/text-chunker';
import { VectorSearchEngine } from './search/vector-search-engine';
import { ContentAnalyzer } from './intelligence/content-analyzer';
import { AdaptiveOptimizer } from './optimization/adaptive-optimizer';
import { ContentFusionEngine } from './fusion/content-fusion';

// Re-export types
export type {
  Vector,
  Chunk,
  ChunkingConfig,
  VectorStoreConfig,
  SearchResult,
  SearchOptions,
  ContentAnalysis,
  ContentTone,
  WritingStyle,
  ContentDNA,
  PerformanceMetrics,
  OptimizationConfig,
  AdaptiveConfig,
  ContentFusion
};

// Re-export core classes
export { 
  TextChunker, 
  VectorSearchEngine,
  ContentAnalyzer,
  AdaptiveOptimizer,
  ContentFusionEngine
};

// Enhanced main search class with all intelligent features
export class VectorSearch {
  private searchEngine: VectorSearchEngine;
  private contentAnalyzer: ContentAnalyzer;
  private adaptiveOptimizer: AdaptiveOptimizer;
  private contentFusionEngine: ContentFusionEngine;

  constructor(
    searchConfig: Partial<VectorStoreConfig> = {},
    optimizationConfig: Partial<OptimizationConfig> = {},
    adaptiveConfig: Partial<AdaptiveConfig> = {}
  ) {
    this.searchEngine = new VectorSearchEngine(searchConfig);
    this.contentAnalyzer = new ContentAnalyzer();
    this.adaptiveOptimizer = new AdaptiveOptimizer(optimizationConfig, adaptiveConfig);
    this.contentFusionEngine = new ContentFusionEngine();
  }

  /**
   * Search content using the exact function from user's request
   */
  async searchContent(
    content: string, 
    searchText: string
  ): Promise<Array<{
    content: string;
    similarity: number;
    position: string;
  }>> {
    return this.searchEngine.searchContent(content, searchText);
  }

  /**
   * Add chunks to search index
   */
  addChunks(chunks: Chunk[]): void {
    this.searchEngine.addChunks(chunks);
  }

  /**
   * Search indexed chunks
   */
  async search(
    query: string, 
    options: Partial<SearchOptions> = {}
  ): Promise<SearchResult[]> {
    return this.searchEngine.search(query, options);
  }

  /**
   * Get search index statistics
   */
  getIndexStats() {
    return this.searchEngine.getIndexStats();
  }

  /**
   * Update search configuration
   */
  updateConfig(config: Partial<VectorStoreConfig>): void {
    this.searchEngine.updateConfig(config);
  }

  // New Content Intelligence Methods

  /**
   * Analyze content comprehensively (tone, style, DNA)
   */
  async analyzeContent(content: string): Promise<ContentAnalysis> {
    return this.contentAnalyzer.analyzeContent(content);
  }

  /**
   * Fuse multiple content sources into coherent summary
   */
  async fuseContent(sources: string[]): Promise<ContentFusion> {
    return this.contentFusionEngine.fuseSources(sources);
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations() {
    return this.adaptiveOptimizer.getOptimizationRecommendations();
  }

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics() {
    return this.adaptiveOptimizer.getPerformanceAnalytics();
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStats() {
    return this.adaptiveOptimizer.getOptimizationStats();
  }

  /**
   * Record performance metrics for optimization
   */
  recordPerformanceMetrics(metrics: Omit<PerformanceMetrics, 'timestamp'>): void {
    this.adaptiveOptimizer.recordMetrics(metrics);
  }

  /**
   * Get fusion insights and recommendations
   */
  getFusionInsights(fusion: ContentFusion) {
    return this.contentFusionEngine.getFusionInsights(fusion);
  }

  /**
   * Update optimization configuration
   */
  updateOptimizationConfig(config: Partial<OptimizationConfig>): void {
    this.adaptiveOptimizer.updateConfig(config);
  }

  /**
   * Update adaptive configuration
   */
  updateAdaptiveConfig(config: Partial<AdaptiveConfig>): void {
    this.adaptiveOptimizer.updateAdaptiveConfig(config);
  }

  /**
   * Reset optimization history
   */
  resetOptimization(): void {
    this.adaptiveOptimizer.resetOptimization();
  }
}

// Default configurations
export const defaultConfigs = {
  chunking: {
    chunkSize: 512,
    overlap: 50,
    strategy: 'fixed' as const,
    preserveParagraphs: true,
    minChunkSize: 100,
    maxChunkSize: 1024
  },
  vectorStore: {
    similarityMetric: 'cosine' as const,
    indexType: 'brute-force' as const,
    maxResults: 10,
    threshold: 0.0
  },
  optimization: {
    enableAutoOptimization: true,
    learningRate: 0.1,
    performanceThreshold: 0.8,
    optimizationInterval: 60000,
    maxOptimizationAttempts: 10
  },
  adaptive: {
    enableLearning: true,
    performanceTracking: true,
    autoTuning: true,
    optimizationStrategy: 'balanced' as const
  }
};

// Version information
export const VERSION = '3.0.0';
export const AUTHOR = 'Nedunchezhiyan M';
export const LICENSE = 'MIT';

