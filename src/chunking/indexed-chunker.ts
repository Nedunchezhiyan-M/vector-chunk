import { Chunk, ChunkingConfig } from '../types';
import { TextChunker } from './text-chunker';

export interface ContentIndex {
  sections: Array<{
    start: number;
    end: number;
    type: 'paragraph' | 'heading' | 'list' | 'code' | 'table';
    relevance: number; // 0-1 score
    keywords: string[];
  }>;
  metadata: {
    totalSections: number;
    relevantSections: number;
    averageRelevance: number;
  };
}

export class IndexedChunker {
  private config: ChunkingConfig;
  private chunker: TextChunker;
  private relevanceThreshold: number;

  constructor(
    config: Partial<ChunkingConfig> = {}, 
    relevanceThreshold: number = 0.3
  ) {
    this.config = {
      chunkSize: 512,
      overlap: 50,
      strategy: 'semantic',
      preserveParagraphs: true,
      minChunkSize: 100,
      maxChunkSize: 1024,
      ...config
    };
    this.chunker = new TextChunker(this.config);
    this.relevanceThreshold = relevanceThreshold;
  }

  /**
   * Create content index for intelligent chunking
   * Time complexity: O(n) where n is text length
   */
  createContentIndex(text: string): ContentIndex {
    const sections: ContentIndex['sections'] = [];
    const paragraphs = text.split(/\n\s*\n/);
    
    let currentPosition = 0;
    
    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) {
        currentPosition += paragraph.length + 2; // +2 for \n\n
        continue;
      }

      const sectionType = this.detectSectionType(trimmedParagraph);
      const relevance = this.calculateRelevance(trimmedParagraph);
      const keywords = this.extractKeywords(trimmedParagraph);

      sections.push({
        start: currentPosition,
        end: currentPosition + trimmedParagraph.length,
        type: sectionType,
        relevance,
        keywords
      });

      currentPosition += paragraph.length + 2;
    }

    const relevantSections = sections.filter(s => s.relevance >= this.relevanceThreshold);
    const averageRelevance = sections.reduce((sum, s) => sum + s.relevance, 0) / sections.length;

    return {
      sections,
      metadata: {
        totalSections: sections.length,
        relevantSections: relevantSections.length,
        averageRelevance
      }
    };
  }

  /**
   * Chunk text based on content index, skipping irrelevant sections
   * Time complexity: O(n) where n is relevant text length
   */
  chunkTextWithIndex(text: string, index: ContentIndex, metadata: Record<string, any> = {}): Chunk[] {
    // Extract only relevant sections
    const relevantSections = index.sections.filter(s => s.relevance >= this.relevanceThreshold);
    
    if (relevantSections.length === 0) {
      return [];
    }

    // Combine relevant sections
    const relevantText = relevantSections
      .map(section => text.slice(section.start, section.end))
      .join('\n\n');

    // Use regular chunker on relevant text
    const chunks = this.chunker.chunkText(relevantText, {
      ...metadata,
      indexed: true,
      relevanceThreshold: this.relevanceThreshold,
      originalSections: relevantSections.length,
      totalSections: index.metadata.totalSections
    });

    return chunks;
  }

  /**
   * Smart chunking that automatically creates index and chunks
   * Time complexity: O(n) where n is text length
   */
  smartChunkText(text: string, metadata: Record<string, any> = {}): { chunks: Chunk[]; index: ContentIndex } {
    const index = this.createContentIndex(text);
    const chunks = this.chunkTextWithIndex(text, index, metadata);
    
    return { chunks, index };
  }

  /**
   * Chunk with focus on specific keywords
   * Time complexity: O(n) where n is text length
   */
  chunkTextWithKeywords(
    text: string, 
    targetKeywords: string[], 
    metadata: Record<string, any> = {}
  ): Chunk[] {
    const index = this.createContentIndex(text);
    
    // Boost relevance for sections with target keywords
    const boostedIndex = this.boostKeywordRelevance(index, targetKeywords);
    
    return this.chunkTextWithIndex(text, boostedIndex, {
      ...metadata,
      targetKeywords,
      keywordBoosted: true
    });
  }

  /**
   * Detect section type based on content patterns
   */
  private detectSectionType(text: string): ContentIndex['sections'][0]['type'] {
    // Heading detection
    if (/^#{1,6}\s/.test(text)) return 'heading';
    
    // List detection
    if (/^[\s]*[-*+]\s/.test(text) || /^[\s]*\d+\.\s/.test(text)) return 'list';
    
    // Code block detection
    if (/^```/.test(text) || /^\s{4,}/.test(text)) return 'code';
    
    // Table detection
    if (/\|.*\|/.test(text) && text.includes('---')) return 'table';
    
    // Default to paragraph
    return 'paragraph';
  }

  /**
   * Calculate relevance score for a text section
   */
  private calculateRelevance(text: string): number {
    let score = 0.5; // Base score
    
    // Boost for headings
    if (/^#{1,6}\s/.test(text)) score += 0.3;
    
    // Boost for longer content (more substantial)
    if (text.length > 100) score += 0.2;
    
    // Boost for content with numbers (likely factual)
    if (/\d/.test(text)) score += 0.1;
    
    // Boost for content with links (likely important)
    if (/\[.*\]\(.*\)/.test(text) || /https?:\/\//.test(text)) score += 0.1;
    
    // Penalty for very short content
    if (text.length < 20) score -= 0.2;
    
    // Penalty for content that's mostly punctuation
    const punctuationRatio = (text.match(/[^\w\s]/g) || []).length / text.length;
    if (punctuationRatio > 0.3) score -= 0.1;
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    // Simple keyword extraction (in production, use NLP libraries)
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3); // Filter out short words
    
    // Count word frequency
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Return top 5 most frequent words
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Boost relevance for sections containing target keywords
   */
  private boostKeywordRelevance(index: ContentIndex, targetKeywords: string[]): ContentIndex {
    const boostedSections = index.sections.map(section => {
      let boostedRelevance = section.relevance;
      
      // Boost relevance for sections with target keywords
      const keywordMatches = targetKeywords.filter(keyword => 
        section.keywords.includes(keyword.toLowerCase())
      );
      
      if (keywordMatches.length > 0) {
        boostedRelevance += 0.3 * keywordMatches.length;
        boostedRelevance = Math.min(1, boostedRelevance);
      }
      
      return { ...section, relevance: boostedRelevance };
    });
    
    return {
      ...index,
      sections: boostedSections
    };
  }

  /**
   * Get chunking statistics
   */
  getChunkingStats(index: ContentIndex): {
    totalTextLength: number;
    relevantTextLength: number;
    efficiencyGain: number;
    relevanceDistribution: Record<string, number>;
  } {
    const totalLength = index.sections.reduce((sum, s) => sum + (s.end - s.start), 0);
    const relevantLength = index.sections
      .filter(s => s.relevance >= this.relevanceThreshold)
      .reduce((sum, s) => sum + (s.end - s.start), 0);
    
    const efficiencyGain = totalLength > 0 ? (totalLength - relevantLength) / totalLength : 0;
    
    const relevanceDistribution = {
      high: index.sections.filter(s => s.relevance >= 0.7).length,
      medium: index.sections.filter(s => s.relevance >= 0.4 && s.relevance < 0.7).length,
      low: index.sections.filter(s => s.relevance < 0.4).length
    };
    
    return {
      totalTextLength: totalLength,
      relevantTextLength: relevantLength,
      efficiencyGain,
      relevanceDistribution
    };
  }
}

// Factory function for easy usage
export function createIndexedChunker(
  config: Partial<ChunkingConfig> = {}, 
  relevanceThreshold: number = 0.3
): IndexedChunker {
  return new IndexedChunker(config, relevanceThreshold);
}
