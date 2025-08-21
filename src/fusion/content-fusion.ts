import type { ContentFusion, ContentAnalysis } from '../types';
import { ContentAnalyzer } from '../intelligence/content-analyzer';

/**
 * Content Fusion Engine
 * Combines multiple sources into coherent summaries
 * Detects conflicts and identifies information gaps
 * All algorithms are free and license-secure
 */
export class ContentFusionEngine {
  private contentAnalyzer: ContentAnalyzer;

  constructor() {
    this.contentAnalyzer = new ContentAnalyzer();
  }

  /**
   * Fuse multiple content sources into a coherent summary
   */
  async fuseSources(sources: string[]): Promise<ContentFusion> {
    if (sources.length === 0) {
      throw new Error('No sources provided for fusion');
    }

    if (sources.length === 1) {
      const analysis = await this.contentAnalyzer.analyzeContent(sources[0]);
      return {
        summary: analysis.summary,
        relationships: {},
        conflicts: [],
        gaps: [],
        coherence: 1.0,
        sources: sources
      };
    }

    // Analyze each source individually
    const sourceAnalyses = await Promise.all(
      sources.map(source => this.contentAnalyzer.analyzeContent(source))
    );

    // Generate comprehensive summary
    const summary = this.generateFusedSummary(sources, sourceAnalyses);
    
    // Find relationships between sources
    const relationships = this.findSourceRelationships(sources, sourceAnalyses);
    
    // Detect conflicts
    const conflicts = this.detectConflicts(sources, sourceAnalyses);
    
    // Identify information gaps
    const gaps = this.identifyGaps(sources, sourceAnalyses);
    
    // Calculate overall coherence
    const coherence = this.calculateFusionCoherence(sourceAnalyses, relationships);

    return {
      summary,
      relationships,
      conflicts,
      gaps,
      coherence,
      sources
    };
  }

  /**
   * Generate a fused summary from multiple sources
   */
  private generateFusedSummary(sources: string[], analyses: ContentAnalysis[]): string {
    // Extract key sentences from each source
    const allKeySentences: Array<{ sentence: string; source: number; score: number }> = [];
    
    sources.forEach((source, sourceIndex) => {
      const sentences = this.splitIntoSentences(source);
      const analysis = analyses[sourceIndex];
      
      // Score sentences based on multiple factors
      sentences.forEach((sentence, sentenceIndex) => {
        const score = this.scoreSentenceForFusion(sentence, sentenceIndex, sentences.length, analysis);
        allKeySentences.push({ sentence, source: sourceIndex, score });
      });
    });

    // Remove duplicate or very similar sentences
    const uniqueSentences = this.removeDuplicateSentences(allKeySentences);
    
    // Sort by score and select top sentences
    const topSentences = uniqueSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(10, Math.ceil(sources.length * 3))); // 3 sentences per source, max 10
    
    // Reorder sentences for coherence
    const orderedSentences = this.orderSentencesForCoherence(topSentences, sources);
    
    // Combine into final summary
    return orderedSentences.map(s => s.sentence).join(' ');
  }

  /**
   * Find relationships between different sources
   */
  private findSourceRelationships(sources: string[], analyses: ContentAnalysis[]): Record<string, number> {
    const relationships: Record<string, number> = {};
    
    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        const similarity = this.calculateSourceSimilarity(sources[i], sources[j], analyses[i], analyses[j]);
        const key = `source_${i}_${j}`;
        relationships[key] = similarity;
      }
    }
    
    return relationships;
  }

  /**
   * Detect conflicts between sources
   */
  private detectConflicts(sources: string[], analyses: ContentAnalysis[]): string[] {
    const conflicts: string[] = [];
    
    // Check for factual contradictions
    const factualConflicts = this.detectFactualConflicts(sources);
    conflicts.push(...factualConflicts);
    
    // Check for tone/style conflicts
    const styleConflicts = this.detectStyleConflicts(analyses);
    conflicts.push(...styleConflicts);
    
    // Check for temporal conflicts
    const temporalConflicts = this.detectTemporalConflicts(sources);
    conflicts.push(...temporalConflicts);
    
    return conflicts;
  }

  /**
   * Identify information gaps across sources
   */
  private identifyGaps(sources: string[], analyses: ContentAnalysis[]): string[] {
    const gaps: string[] = [];
    
    // Find missing topics
    const topicGaps = this.findTopicGaps(sources, analyses);
    gaps.push(...topicGaps);
    
    // Find missing perspectives
    const perspectiveGaps = this.findPerspectiveGaps(analyses);
    gaps.push(...perspectiveGaps);
    
    // Find missing context
    const contextGaps = this.findContextGaps(sources, analyses);
    gaps.push(...contextGaps);
    
    return gaps;
  }

  /**
   * Calculate overall fusion coherence
   */
  private calculateFusionCoherence(analyses: ContentAnalysis[], relationships: Record<string, number>): number {
    if (analyses.length === 1) return 1.0;
    
    // Calculate average coherence of individual sources
    const individualCoherence = analyses.reduce((sum, analysis) => sum + analysis.dna.coherence, 0) / analyses.length;
    
    // Calculate inter-source coherence
    const relationshipValues = Object.values(relationships);
    const interSourceCoherence = relationshipValues.length > 0 
      ? relationshipValues.reduce((sum, val) => sum + val, 0) / relationshipValues.length 
      : 0;
    
    // Weighted combination (individual sources 60%, inter-source 40%)
    return individualCoherence * 0.6 + interSourceCoherence * 0.4;
  }

  // Private helper methods

  private splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  private scoreSentenceForFusion(
    sentence: string, 
    sentenceIndex: number, 
    totalSentences: number, 
    analysis: ContentAnalysis
  ): number {
    const positionScore = 1 - (sentenceIndex / totalSentences); // Earlier sentences get higher score
    const lengthScore = Math.min(1, sentence.split(/\s+/).length / 25); // Optimal length around 25 words
    const keywordScore = this.calculateKeywordRelevance(sentence, analysis.keywords);
    const complexityScore = analysis.dna.complexity;
    const qualityScore = analysis.qualityScore;
    
    return (
      positionScore * 0.25 + 
      lengthScore * 0.2 + 
      keywordScore * 0.25 + 
      complexityScore * 0.15 + 
      qualityScore * 0.15
    );
  }

  private calculateKeywordRelevance(sentence: string, keywords: string[]): number {
    if (keywords.length === 0) return 0.5;
    
    const sentenceWords = sentence.toLowerCase().split(/\s+/);
    const keywordMatches = keywords.filter(keyword => 
      sentenceWords.some(word => word.includes(keyword.toLowerCase()))
    );
    
    return Math.min(1, keywordMatches.length / keywords.length);
  }

  private removeDuplicateSentences(
    sentences: Array<{ sentence: string; source: number; score: number }>
  ): Array<{ sentence: string; source: number; score: number }> {
    const unique: Array<{ sentence: string; source: number; score: number }> = [];
    
    sentences.forEach(sentence => {
      const isDuplicate = unique.some(existing => 
        this.calculateSentenceSimilarity(sentence.sentence, existing.sentence) > 0.8
      );
      
      if (!isDuplicate) {
        unique.push(sentence);
      }
    });
    
    return unique;
  }

  private calculateSentenceSimilarity(sent1: string, sent2: string): number {
    const words1 = new Set(sent1.toLowerCase().split(/\s+/));
    const words2 = new Set(sent2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private orderSentencesForCoherence(
    sentences: Array<{ sentence: string; source: number; score: number }>,
    sources: string[]
  ): Array<{ sentence: string; source: number; score: number }> {
    // Simple ordering: group by source, then by score within each source
    const groupedBySource = new Map<number, Array<{ sentence: string; source: number; score: number }>>();
    
    sentences.forEach(sentence => {
      if (!groupedBySource.has(sentence.source)) {
        groupedBySource.set(sentence.source, []);
      }
      groupedBySource.get(sentence.source)!.push(sentence);
    });
    
    const ordered: Array<{ sentence: string; source: number; score: number }> = [];
    
    // Sort sources by average score
    const sourceAverages = Array.from(groupedBySource.entries()).map(([source, sentences]) => ({
      source,
      averageScore: sentences.reduce((sum, s) => sum + s.score, 0) / sentences.length
    }));
    
    sourceAverages.sort((a, b) => b.averageScore - a.averageScore);
    
    // Add sentences from each source in order
    sourceAverages.forEach(({ source }) => {
      const sourceSentences = groupedBySource.get(source)!;
      sourceSentences.sort((a, b) => b.score - a.score);
      ordered.push(...sourceSentences);
    });
    
    return ordered;
  }

  private calculateSourceSimilarity(
    source1: string, 
    source2: string, 
    analysis1: ContentAnalysis, 
    analysis2: ContentAnalysis
  ): number {
    // Content similarity (40%)
    const contentSimilarity = this.calculateContentSimilarity(source1, source2);
    
    // Style similarity (30%)
    const styleSimilarity = this.calculateStyleSimilarity(analysis1.style, analysis2.style);
    
    // Tone similarity (20%)
    const toneSimilarity = this.calculateToneSimilarity(analysis1.tone, analysis2.tone);
    
    // Topic similarity (10%)
    const topicSimilarity = this.calculateTopicSimilarity(analysis1.keywords, analysis2.keywords);
    
    return (
      contentSimilarity * 0.4 + 
      styleSimilarity * 0.3 + 
      toneSimilarity * 0.2 + 
      topicSimilarity * 0.1
    );
  }

  private calculateContentSimilarity(source1: string, source2: string): number {
    const words1 = new Set(source1.toLowerCase().split(/\s+/));
    const words2 = new Set(source2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateStyleSimilarity(style1: any, style2: any): number {
    const features = ['sentenceLength', 'vocabularyComplexity', 'formalityLevel', 'readabilityScore'];
    let totalDifference = 0;
    
    features.forEach(feature => {
      const val1 = style1[feature] || 0;
      const val2 = style2[feature] || 0;
      const maxVal = Math.max(val1, val2);
      if (maxVal > 0) {
        totalDifference += Math.abs(val1 - val2) / maxVal;
      }
    });
    
    return Math.max(0, 1 - (totalDifference / features.length));
  }

  private calculateToneSimilarity(tone1: any, tone2: any): number {
    const toneTypes = ['professional', 'casual', 'technical', 'formal', 'conversational'];
    let totalDifference = 0;
    
    toneTypes.forEach(toneType => {
      const val1 = tone1[toneType] || 0;
      const val2 = tone2[toneType] || 0;
      totalDifference += Math.abs(val1 - val2);
    });
    
    return Math.max(0, 1 - (totalDifference / toneTypes.length));
  }

  private calculateTopicSimilarity(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 || keywords2.length === 0) return 0;
    
    const set1 = new Set(keywords1.map(k => k.toLowerCase()));
    const set2 = new Set(keywords2.map(k => k.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private detectFactualConflicts(sources: string[]): string[] {
    const conflicts: string[] = [];
    
    // Simple factual conflict detection based on contradictory statements
    const contradictionPatterns = [
      { pattern: /(\d+)\s*(years?|months?|days?)/gi, type: 'temporal' },
      { pattern: /(\d+)\s*(percent|%|dollars?|\$)/gi, type: 'numerical' },
      { pattern: /(true|false|yes|no)/gi, type: 'boolean' }
    ];
    
    // This is a simplified version - in practice, you'd want more sophisticated NLP
    // For now, we'll detect obvious contradictions
    
    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        const source1 = sources[i];
        const source2 = sources[j];
        
        // Check for obvious contradictions
        if (this.hasContradictoryNumbers(source1, source2)) {
          conflicts.push(`Numerical conflict detected between sources ${i + 1} and ${j + 1}`);
        }
        
        if (this.hasContradictoryDates(source1, source2)) {
          conflicts.push(`Date conflict detected between sources ${i + 1} and ${j + 1}`);
        }
      }
    }
    
    return conflicts;
  }

  private hasContradictoryNumbers(source1: string, source2: string): boolean {
    // Extract numbers and check for contradictions
    const numbers1 = source1.match(/\d+/g) || [];
    const numbers2 = source2.match(/\d+/g) || [];
    
    // Simple check for very different numbers in similar contexts
    // This is a basic implementation - could be enhanced with context analysis
    return false; // Simplified for now
  }

  private hasContradictoryDates(source1: string, source2: string): boolean {
    // Extract dates and check for contradictions
    const dates1 = source1.match(/\d{1,4}[-/]\d{1,2}[-/]\d{1,4}/g) || [];
    const dates2 = source2.match(/\d{1,4}[-/]\d{1,2}[-/]\d{1,4}/g) || [];
    
    // Simple check for different dates
    return false; // Simplified for now
  }

  private detectStyleConflicts(analyses: ContentAnalysis[]): string[] {
    const conflicts: string[] = [];
    
    // Check for significant style differences
    const avgFormality = analyses.reduce((sum, a) => sum + a.style.formalityLevel, 0) / analyses.length;
    const avgReadability = analyses.reduce((sum, a) => sum + a.style.readabilityScore, 0) / analyses.length;
    
    analyses.forEach((analysis, index) => {
      if (Math.abs(analysis.style.formalityLevel - avgFormality) > 0.3) {
        conflicts.push(`Source ${index + 1} has significantly different formality level`);
      }
      
      if (Math.abs(analysis.style.readabilityScore - avgReadability) > 20) {
        conflicts.push(`Source ${index + 1} has significantly different readability level`);
      }
    });
    
    return conflicts;
  }

  private detectTemporalConflicts(sources: string[]): string[] {
    const conflicts: string[] = [];
    
    // Extract temporal references and check for conflicts
    // This is a simplified implementation
    const temporalWords = ['today', 'yesterday', 'tomorrow', 'now', 'recently', 'soon'];
    
    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        const source1 = sources[i];
        const source2 = sources[j];
        
        // Check for conflicting temporal references
        if (this.hasConflictingTemporalReferences(source1, source2)) {
          conflicts.push(`Temporal conflict detected between sources ${i + 1} and ${j + 1}`);
        }
      }
    }
    
    return conflicts;
  }

  private hasConflictingTemporalReferences(source1: string, source2: string): boolean {
    // Simplified temporal conflict detection
    return false; // Enhanced implementation would go here
  }

  private findTopicGaps(sources: string[], analyses: ContentAnalysis[]): string[] {
    const gaps: string[] = [];
    
    // Find topics that are only covered in one source
    const allKeywords = new Set<string>();
    const keywordSources = new Map<string, Set<number>>();
    
    analyses.forEach((analysis, sourceIndex) => {
      analysis.keywords.forEach(keyword => {
        allKeywords.add(keyword);
        if (!keywordSources.has(keyword)) {
          keywordSources.set(keyword, new Set());
        }
        keywordSources.get(keyword)!.add(sourceIndex);
      });
    });
    
    // Find keywords covered by only one source
    keywordSources.forEach((sources, keyword) => {
      if (sources.size === 1) {
        const sourceIndex = Array.from(sources)[0];
        gaps.push(`Topic "${keyword}" is only covered in source ${sourceIndex + 1}`);
      }
    });
    
    return gaps;
  }

  private findPerspectiveGaps(analyses: ContentAnalysis[]): string[] {
    const gaps: string[] = [];
    
    // Check for missing perspectives based on tone diversity
    const tones = analyses.map(a => a.tone.dominantTone);
    const uniqueTones = new Set(tones);
    
    const expectedTones = ['professional', 'casual', 'technical', 'formal', 'conversational'];
    const missingTones = expectedTones.filter(tone => !uniqueTones.has(tone as any));
    
    if (missingTones.length > 0) {
      gaps.push(`Missing perspectives: ${missingTones.join(', ')}`);
    }
    
    return gaps;
  }

  private findContextGaps(sources: string[], analyses: ContentAnalysis[]): string[] {
    const gaps: string[] = [];
    
    // Check for missing contextual information
    const avgComplexity = analyses.reduce((sum, a) => sum + a.dna.complexity, 0) / analyses.length;
    
    if (avgComplexity < 0.3) {
      gaps.push('Content may be too simplified - consider adding technical details');
    } else if (avgComplexity > 0.7) {
      gaps.push('Content may be too complex - consider adding explanations');
    }
    
    return gaps;
  }

  /**
   * Get fusion statistics and insights
   */
  getFusionInsights(fusion: ContentFusion): {
    summary: string;
    recommendations: string[];
    qualityMetrics: Record<string, number>;
  } {
    const recommendations: string[] = [];
    
    // Analyze coherence
    if (fusion.coherence < 0.6) {
      recommendations.push('Low coherence detected - consider restructuring content for better flow');
    } else if (fusion.coherence > 0.9) {
      recommendations.push('Excellent coherence - content flows well together');
    }
    
    // Analyze conflicts
    if (fusion.conflicts.length > 0) {
      recommendations.push(`Found ${fusion.conflicts.length} conflicts - review and resolve for accuracy`);
    }
    
    // Analyze gaps
    if (fusion.gaps.length > 0) {
      recommendations.push(`Identified ${fusion.gaps.length} information gaps - consider adding missing content`);
    }
    
    // Analyze source diversity
    if (fusion.sources.length < 2) {
      recommendations.push('Single source - consider adding more sources for comprehensive coverage');
    } else if (fusion.sources.length > 5) {
      recommendations.push('Many sources - ensure consistency and avoid information overload');
    }
    
    const qualityMetrics = {
      coherence: fusion.coherence,
      conflictCount: fusion.conflicts.length,
      gapCount: fusion.gaps.length,
      sourceCount: fusion.sources.length,
      averageRelationship: Object.values(fusion.relationships).reduce((sum, val) => sum + val, 0) / Math.max(1, Object.values(fusion.relationships).length)
    };
    
    return {
      summary: `Fusion completed with ${fusion.coherence.toFixed(2)} coherence score`,
      recommendations,
      qualityMetrics
    };
  }
}
