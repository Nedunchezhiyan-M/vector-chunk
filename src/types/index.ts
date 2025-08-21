export interface Vector {
  values: number[];
  dimension: number;
  id?: string;
  metadata?: Record<string, any>;
}

export interface Chunk {
  id: string;
  content: string;
  vector: Vector;
  metadata: Record<string, any>;
  chunkIndex: number;
  startPosition: number;
  endPosition: number;
  documentId: string;
  chunkType: 'text' | 'paragraph' | 'section';
}

export interface ChunkingConfig {
  chunkSize: number;
  overlap: number;
  strategy: 'fixed' | 'semantic' | 'sliding' | 'adaptive';
  preserveParagraphs?: boolean;
  minChunkSize?: number;
  maxChunkSize?: number;
}

export interface VectorStoreConfig {
  similarityMetric: 'cosine';
  indexType: 'brute-force';
  maxResults?: number;
  threshold?: number;
}

export interface SearchResult {
  chunk: Chunk;
  score: number;
  distance: number;
  relevance: 'high' | 'medium' | 'low';
}

export interface SearchOptions {
  query: string;
  similarityThreshold?: number;
  maxResults?: number;
}

// New Content Intelligence Types
export interface ContentTone {
  professional: number;
  casual: number;
  technical: number;
  formal: number;
  conversational: number;
  dominantTone: 'professional' | 'casual' | 'technical' | 'formal' | 'conversational';
  confidence: number;
}

export interface WritingStyle {
  sentenceLength: number;
  vocabularyComplexity: number;
  punctuationPatterns: Record<string, number>;
  paragraphStructure: Record<string, number>;
  formalityLevel: number;
  readabilityScore: number;
  styleSignature: number[];
}

export interface ContentDNA {
  semanticSignature: number[];
  structuralPattern: Record<string, number>;
  contextualMarkers: Record<string, number>;
  relationshipMap: Record<string, number[]>;
  fingerprint: string;
  complexity: number;
  coherence: number;
}

export interface ContentAnalysis {
  tone: ContentTone;
  style: WritingStyle;
  dna: ContentDNA;
  summary: string;
  keywords: string[];
  qualityScore: number;
  insights: string[];
}

export interface PerformanceMetrics {
  searchTime: number;
  chunkSize: number;
  memoryUsage: number;
  accuracy: number;
  timestamp: Date;
}

export interface OptimizationConfig {
  enableAutoOptimization: boolean;
  learningRate: number;
  performanceThreshold: number;
  optimizationInterval: number;
  maxOptimizationAttempts: number;
}

export interface ContentFusion {
  summary: string;
  relationships: Record<string, number>;
  conflicts: string[];
  gaps: string[];
  coherence: number;
  sources: string[];
}

export interface AdaptiveConfig {
  enableLearning: boolean;
  performanceTracking: boolean;
  autoTuning: boolean;
  optimizationStrategy: 'aggressive' | 'balanced' | 'conservative';
}

export type DataType = 'text' | 'json' | 'xml' | 'html' | 'markdown' | 'csv';

