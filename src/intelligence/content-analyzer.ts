import type { 
  ContentTone, 
  WritingStyle, 
  ContentDNA, 
  ContentAnalysis 
} from '../types';

/**
 * Advanced Content Intelligence Engine
 * Analyzes content tone, style, and generates DNA fingerprints
 * All algorithms are free and license-secure
 */
export class ContentAnalyzer {
  private tonePatterns: Record<string, string[]> = {
    professional: [
      'therefore', 'consequently', 'furthermore', 'in conclusion',
      'based on', 'according to', 'research indicates', 'analysis shows',
      'it is evident', 'demonstrates', 'illustrates', 'consequently',
      'as a result', 'in addition', 'moreover', 'nevertheless',
      'however', 'although', 'despite', 'regarding'
    ],
    casual: [
      'hey', 'cool', 'awesome', 'you know', 'like', 'basically',
      'kind of', 'sort of', 'you see', 'right', 'okay', 'well',
      'actually', 'literally', 'totally', 'absolutely', 'definitely',
      'probably', 'maybe', 'i think', 'i guess', 'sorta', 'kinda'
    ],
    technical: [
      'algorithm', 'implementation', 'optimization', 'complexity',
      'architecture', 'framework', 'protocol', 'interface', 'methodology',
      'infrastructure', 'deployment', 'configuration', 'integration',
      'scalability', 'performance', 'efficiency', 'robustness',
      'reliability', 'maintainability', 'extensibility', 'modularity'
    ],
    formal: [
      'hereby', 'aforementioned', 'whereas', 'pursuant to',
      'in accordance with', 'be it resolved', 'herein', 'thereof',
      'whereby', 'notwithstanding', 'subject to', 'in compliance with',
      'as stipulated', 'per the agreement', 'in reference to'
    ],
    conversational: [
      'i believe', 'in my opinion', 'from my perspective', 'i feel',
      'i think', 'i understand', 'let me explain', 'you might wonder',
      'consider this', 'imagine if', 'suppose that', 'what if'
    ]
  };

  private complexityWords = new Set([
    'sophisticated', 'elaborate', 'intricate', 'comprehensive',
    'thorough', 'detailed', 'extensive', 'profound', 'nuanced',
    'sophisticated', 'elaborate', 'intricate', 'comprehensive'
  ]);

  /**
   * Analyze content comprehensively
   */
  async analyzeContent(content: string): Promise<ContentAnalysis> {
    const tone = this.analyzeTone(content);
    const style = this.analyzeStyle(content);
    const dna = this.generateContentDNA(content);
    const summary = this.generateSummary(content);
    const keywords = this.extractKeywords(content);
    const qualityScore = this.calculateQualityScore(content, tone, style, dna);
    const insights = this.generateInsights(tone, style, dna, qualityScore);

    return {
      tone,
      style,
      dna,
      summary,
      keywords,
      qualityScore,
      insights
    };
  }

  /**
   * Analyze content tone using linguistic patterns
   */
  private analyzeTone(content: string): ContentTone {
    const lowerContent = content.toLowerCase();
    const words = lowerContent.split(/\s+/);
    const totalWords = words.length;
    
    const scores: Record<string, number> = {};
    let totalMatches = 0;

    // Count pattern matches for each tone
    for (const [tone, patterns] of Object.entries(this.tonePatterns)) {
      let matches = 0;
      for (const pattern of patterns) {
        const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
        const found = (lowerContent.match(regex) || []).length;
        matches += found;
      }
      scores[tone] = matches;
      totalMatches += matches;
    }

    // Calculate percentages and normalize
    const normalizedScores: Record<string, number> = {};
    for (const [tone, count] of Object.entries(scores)) {
      normalizedScores[tone] = totalWords > 0 ? count / totalWords : 0;
    }

    // Find dominant tone
    const dominantTone = Object.entries(normalizedScores)
      .reduce((a, b) => normalizedScores[a[0]] > normalizedScores[b[0]] ? a : b)[0] as keyof typeof normalizedScores;

    // Calculate confidence based on clarity of tone
    const maxScore = Math.max(...Object.values(normalizedScores));
    const confidence = maxScore > 0.1 ? Math.min(maxScore * 10, 1) : 0.3;

    return {
      professional: normalizedScores.professional || 0,
      casual: normalizedScores.casual || 0,
      technical: normalizedScores.technical || 0,
      formal: normalizedScores.formal || 0,
      conversational: normalizedScores.conversational || 0,
      dominantTone,
      confidence
    };
  }

  /**
   * Analyze writing style characteristics
   */
  private analyzeStyle(content: string): WritingStyle {
    const sentences = this.splitIntoSentences(content);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 0);

    const sentenceLength = this.calculateAverageSentenceLength(sentences);
    const vocabularyComplexity = this.calculateVocabularyComplexity(words);
    const punctuationPatterns = this.analyzePunctuation(content);
    const paragraphStructure = this.analyzeParagraphStructure(paragraphs);
    const formalityLevel = this.calculateFormalityLevel(content);
    const readabilityScore = this.calculateReadabilityScore(content);
    const styleSignature = this.generateStyleSignature(content);

    return {
      sentenceLength,
      vocabularyComplexity,
      punctuationPatterns,
      paragraphStructure,
      formalityLevel,
      readabilityScore,
      styleSignature
    };
  }

  /**
   * Generate unique content DNA fingerprint
   */
  private generateContentDNA(content: string): ContentDNA {
    const semanticSignature = this.generateSemanticSignature(content);
    const structuralPattern = this.analyzeStructuralPattern(content);
    const contextualMarkers = this.extractContextualMarkers(content);
    const relationshipMap = this.buildRelationshipMap(content);
    const fingerprint = this.generateFingerprint(content);
    const complexity = this.calculateComplexity(content);
    const coherence = this.calculateCoherence(content);

    return {
      semanticSignature,
      structuralPattern,
      contextualMarkers,
      relationshipMap,
      fingerprint,
      complexity,
      coherence
    };
  }

  /**
   * Generate content summary using statistical methods
   */
  private generateSummary(content: string): string {
    const sentences = this.splitIntoSentences(content);
    if (sentences.length <= 3) return content;

    // Score sentences based on multiple factors
    const scoredSentences = sentences.map((sentence, index) => {
      const score = this.scoreSentence(sentence, index, sentences.length);
      return { sentence, score };
    });

    // Select top sentences for summary
    const summaryLength = Math.max(2, Math.ceil(sentences.length * 0.3));
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, summaryLength)
      .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence));

    return topSentences.map(s => s.sentence).join(' ');
  }

  /**
   * Extract keywords using TF-IDF approach
   */
  private extractKeywords(content: string): string[] {
    const words = content.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && /^[a-z]+$/.test(word));

    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Sort by frequency and return top keywords
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  // Private helper methods
  private splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  private calculateAverageSentenceLength(sentences: string[]): number {
    if (sentences.length === 0) return 0;
    const totalWords = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0);
    return totalWords / sentences.length;
  }

  private calculateVocabularyComplexity(words: string[]): number {
    if (words.length === 0) return 0;
    const uniqueWords = new Set(words);
    return uniqueWords.size / words.length; // Type-token ratio
  }

  private analyzePunctuation(text: string): Record<string, number> {
    const patterns = {
      periods: (text.match(/\./g) || []).length,
      commas: (text.match(/,/g) || []).length,
      exclamations: (text.match(/!/g) || []).length,
      questions: (text.match(/\?/g) || []).length,
      semicolons: (text.match(/;/g) || []).length,
      colons: (text.match(/:/g) || []).length
    };

    const total = Object.values(patterns).reduce((sum, count) => sum + count, 0);
    const normalized: Record<string, number> = {};
    
    for (const [key, count] of Object.entries(patterns)) {
      normalized[key] = total > 0 ? count / total : 0;
    }

    return normalized;
  }

  private analyzeParagraphStructure(paragraphs: string[]): Record<string, number> {
    const lengths = paragraphs.map(p => p.split(/\s+/).length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    
    return {
      averageLength: avgLength,
      totalParagraphs: paragraphs.length,
      shortParagraphs: lengths.filter(len => len < avgLength * 0.5).length,
      longParagraphs: lengths.filter(len => len > avgLength * 1.5).length
    };
  }

  private calculateFormalityLevel(content: string): number {
    const formalWords = this.tonePatterns.formal;
    const casualWords = this.tonePatterns.casual;
    
    const formalCount = formalWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return count + (content.match(regex) || []).length;
    }, 0);
    
    const casualCount = casualWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return count + (content.match(regex) || []).length;
    }, 0);
    
    const total = formalCount + casualCount;
    return total > 0 ? formalCount / total : 0.5;
  }

  private calculateReadabilityScore(content: string): number {
    const sentences = this.splitIntoSentences(content);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const syllables = this.countSyllables(content);
    
    // Flesch Reading Ease formula
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    return Math.max(0, Math.min(100, 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)));
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    return words.reduce((total, word) => {
      return total + this.countWordSyllables(word);
    }, 0);
  }

  private countWordSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? Math.max(1, matches.length) : 1;
  }

  private generateStyleSignature(content: string): number[] {
    const features = [
      content.length / 1000, // Normalized length
      this.calculateAverageSentenceLength(this.splitIntoSentences(content)) / 50,
      this.calculateFormalityLevel(content),
      this.calculateVocabularyComplexity(content.split(/\s+/)),
      (content.match(/[A-Z]/g) || []).length / content.length, // Capitalization ratio
      (content.match(/[0-9]/g) || []).length / content.length  // Number ratio
    ];
    
    return features.map(f => Math.min(1, Math.max(0, f))); // Normalize to 0-1
  }

  private generateSemanticSignature(content: string): number[] {
    const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const wordFreq: Record<string, number> = {};
    
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    // Create 128-dimensional vector based on word frequencies
    const dimension = 128;
    const signature = new Array(dimension).fill(0);
    
    let index = 0;
    for (const [word, freq] of Object.entries(wordFreq)) {
      if (index >= dimension) break;
      signature[index] = Math.min(1, freq / words.length);
      index++;
    }
    
    return signature;
  }

  private analyzeStructuralPattern(content: string): Record<string, number> {
    const sentences = this.splitIntoSentences(content);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    return {
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      avgSentencesPerParagraph: sentences.length / Math.max(1, paragraphs.length),
      contentLength: content.length,
      wordCount: content.split(/\s+/).length,
      lineBreaks: (content.match(/\n/g) || []).length
    };
  }

  private extractContextualMarkers(content: string): Record<string, number> {
    const markers = {
      questions: (content.match(/\?/g) || []).length,
      exclamations: (content.match(/!/g) || []).length,
      quotes: (content.match(/"/g) || []).length / 2,
      parentheses: (content.match(/[()]/g) || []).length / 2,
      numbers: (content.match(/\d+/g) || []).length,
      links: (content.match(/https?:\/\/[^\s]+/g) || []).length
    };
    
    const total = Object.values(markers).reduce((sum, count) => sum + count, 0);
    const normalized: Record<string, number> = {};
    
    for (const [key, count] of Object.entries(markers)) {
      normalized[key] = total > 0 ? count / total : 0;
    }
    
    return normalized;
  }

  private buildRelationshipMap(content: string): Record<string, number[]> {
    const sentences = this.splitIntoSentences(content);
    const relationships: Record<string, number[]> = {};
    
    // Simple relationship mapping based on sentence similarity
    for (let i = 0; i < sentences.length; i++) {
      const key = `sentence_${i}`;
      relationships[key] = [];
      
      for (let j = 0; j < sentences.length; j++) {
        if (i === j) {
          relationships[key].push(1.0); // Self-similarity
        } else {
          const similarity = this.calculateSentenceSimilarity(sentences[i], sentences[j]);
          relationships[key].push(similarity);
        }
      }
    }
    
    return relationships;
  }

  private calculateSentenceSimilarity(sent1: string, sent2: string): number {
    const words1 = new Set(sent1.toLowerCase().split(/\s+/));
    const words2 = new Set(sent2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private generateFingerprint(content: string): string {
    // Create a hash-like fingerprint based on content characteristics
    const features = [
      content.length,
      this.splitIntoSentences(content).length,
      content.split(/\s+/).length,
      this.calculateFormalityLevel(content) * 100,
      this.calculateVocabularyComplexity(content.split(/\s+/)) * 100
    ];
    
    const fingerprint = features.join('-');
    return Buffer.from(fingerprint).toString('base64').substring(0, 16);
  }

  private calculateComplexity(content: string): number {
    const sentences = this.splitIntoSentences(content);
    const words = content.split(/\s+/);
    const syllables = this.countSyllables(content);
    
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    const vocabularyDiversity = this.calculateVocabularyComplexity(words);
    
    // Normalize complexity score to 0-1
    const complexity = (avgSentenceLength / 50 + avgSyllablesPerWord / 3 + vocabularyDiversity) / 3;
    return Math.min(1, Math.max(0, complexity));
  }

  private calculateCoherence(content: string): number {
    const sentences = this.splitIntoSentences(content);
    if (sentences.length < 2) return 1.0;
    
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < sentences.length - 1; i++) {
      const similarity = this.calculateSentenceSimilarity(sentences[i], sentences[i + 1]);
      totalSimilarity += similarity;
      comparisons++;
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 1.0;
  }

  private scoreSentence(sentence: string, index: number, totalSentences: number): number {
    const positionScore = 1 - (index / totalSentences); // Earlier sentences get higher score
    const lengthScore = Math.min(1, sentence.split(/\s+/).length / 20); // Optimal length around 20 words
    const keywordScore = this.calculateKeywordDensity(sentence);
    const complexityScore = this.calculateSentenceComplexity(sentence);
    
    return (positionScore * 0.3 + lengthScore * 0.2 + keywordScore * 0.3 + complexityScore * 0.2);
  }

  private calculateKeywordDensity(sentence: string): number {
    const words = sentence.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    const contentWords = words.filter(word => !stopWords.has(word) && word.length > 2);
    return contentWords.length / Math.max(1, words.length);
  }

  private calculateSentenceComplexity(sentence: string): number {
    const words = sentence.split(/\s+/);
    const complexWords = words.filter(word => 
      word.length > 8 || this.complexityWords.has(word.toLowerCase())
    );
    
    return Math.min(1, complexWords.length / Math.max(1, words.length));
  }

  private calculateQualityScore(content: string, tone: ContentTone, style: WritingStyle, dna: ContentDNA): number {
    const toneScore = tone.confidence;
    const styleScore = style.readabilityScore / 100;
    const dnaScore = (dna.complexity + dna.coherence) / 2;
    const contentScore = Math.min(1, content.length / 1000); // Normalize content length
    
    return (toneScore * 0.3 + styleScore * 0.3 + dnaScore * 0.2 + contentScore * 0.2);
  }

  private generateInsights(tone: ContentTone, style: WritingStyle, dna: ContentDNA, qualityScore: number): string[] {
    const insights: string[] = [];
    
    // Tone insights
    if (tone.confidence > 0.7) {
      insights.push(`Content has a clear ${tone.dominantTone} tone (confidence: ${(tone.confidence * 100).toFixed(1)}%)`);
    } else {
      insights.push('Content tone is mixed - consider focusing on a specific tone for better clarity');
    }
    
    // Style insights
    if (style.readabilityScore > 70) {
      insights.push('Content is highly readable and accessible');
    } else if (style.readabilityScore < 30) {
      insights.push('Content may be too complex - consider simplifying language');
    }
    
    if (style.sentenceLength > 25) {
      insights.push('Sentences are quite long - shorter sentences may improve readability');
    }
    
    // DNA insights
    if (dna.coherence > 0.8) {
      insights.push('Content flows well with high coherence');
    } else {
      insights.push('Content structure could be improved for better flow');
    }
    
    if (dna.complexity > 0.7) {
      insights.push('Content is sophisticated and detailed');
    } else if (dna.complexity < 0.3) {
      insights.push('Content is simple and straightforward');
    }
    
    // Quality insights
    if (qualityScore > 0.8) {
      insights.push('Overall content quality is excellent');
    } else if (qualityScore < 0.5) {
      insights.push('Content quality has room for improvement');
    }
    
    return insights;
  }
}
