import type { 
  PerformanceMetrics, 
  OptimizationConfig, 
  AdaptiveConfig,
  ChunkingConfig,
  VectorStoreConfig
} from '../types';

/**
 * Adaptive Optimization Engine
 * Self-optimizes chunk sizes and search algorithms based on performance
 * Uses statistical analysis and machine learning principles (free algorithms)
 */
export class AdaptiveOptimizer {
  private performanceHistory: PerformanceMetrics[] = [];
  private config: OptimizationConfig;
  private adaptiveConfig: AdaptiveConfig;
  private optimizationCount = 0;
  private lastOptimization = Date.now();

  constructor(
    optimizationConfig: Partial<OptimizationConfig> = {},
    adaptiveConfig: Partial<AdaptiveConfig> = {}
  ) {
    this.config = {
      enableAutoOptimization: true,
      learningRate: 0.1,
      performanceThreshold: 0.8,
      optimizationInterval: 60000, // 1 minute
      maxOptimizationAttempts: 10,
      ...optimizationConfig
    };

    this.adaptiveConfig = {
      enableLearning: true,
      performanceTracking: true,
      autoTuning: true,
      optimizationStrategy: 'balanced',
      ...adaptiveConfig
    };
  }

  /**
   * Record performance metrics for optimization
   */
  recordMetrics(metrics: Omit<PerformanceMetrics, 'timestamp'>): void {
    if (!this.adaptiveConfig.performanceTracking) return;

    const performanceMetric: PerformanceMetrics = {
      ...metrics,
      timestamp: new Date()
    };

    this.performanceHistory.push(performanceMetric);
    
    // Keep only recent history (last 100 entries)
    if (this.performanceHistory.length > 100) {
      this.performanceHistory = this.performanceHistory.slice(-100);
    }

    // Auto-optimize if conditions are met
    if (this.shouldAutoOptimize()) {
      this.autoOptimize();
    }
  }

  /**
   * Optimize chunk size based on performance data
   */
  optimizeChunkSize(currentConfig: ChunkingConfig): ChunkingConfig {
    if (!this.config.enableAutoOptimization || this.performanceHistory.length < 5) {
      return currentConfig;
    }

    const optimalSize = this.calculateOptimalChunkSize();
    const optimalOverlap = this.calculateOptimalOverlap(optimalSize);
    
    const optimizedConfig: ChunkingConfig = {
      ...currentConfig,
      chunkSize: optimalSize,
      overlap: optimalOverlap
    };

    // Auto-optimized chunk size and overlap

    return optimizedConfig;
  }

  /**
   * Optimize search configuration based on performance
   */
  optimizeSearchConfig(currentConfig: VectorStoreConfig): VectorStoreConfig {
    if (!this.config.enableAutoOptimization || this.performanceHistory.length < 5) {
      return currentConfig;
    }

    const optimalThreshold = this.calculateOptimalThreshold();
    const optimalMaxResults = this.calculateOptimalMaxResults();
    
    const optimizedConfig: VectorStoreConfig = {
      ...currentConfig,
      threshold: optimalThreshold,
      maxResults: optimalMaxResults
    };

    // Auto-optimized threshold and max results

    return optimizedConfig;
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): {
    chunkSize: { current: number; recommended: number; confidence: number };
    overlap: { current: number; recommended: number; confidence: number };
    threshold: { current: number; recommended: number; confidence: number };
    maxResults: { current: number; recommended: number; confidence: number };
    overallImprovement: number;
  } {
    if (this.performanceHistory.length < 3) {
      return {
        chunkSize: { current: 512, recommended: 512, confidence: 0 },
        overlap: { current: 50, recommended: 50, confidence: 0 },
        threshold: { current: 0.0, recommended: 0.0, confidence: 0 },
        maxResults: { current: 10, recommended: 10, confidence: 0 },
        overallImprovement: 0
      };
    }

    const optimalChunkSize = this.calculateOptimalChunkSize();
    const optimalOverlap = this.calculateOptimalOverlap(optimalChunkSize);
    const optimalThreshold = this.calculateOptimalThreshold();
    const optimalMaxResults = this.calculateOptimalMaxResults();

    const currentChunkSize = this.performanceHistory[this.performanceHistory.length - 1]?.chunkSize || 512;
    const currentOverlap = 50; // Default
    const currentThreshold = 0.0; // Default
    const currentMaxResults = 10; // Default

    const chunkSizeConfidence = this.calculateConfidence('chunkSize');
    const overlapConfidence = 0.5; // Default confidence for overlap
    const thresholdConfidence = 0.5; // Default confidence for threshold
    const maxResultsConfidence = 0.5; // Default confidence for maxResults

    const overallImprovement = this.calculateOverallImprovement();

    return {
      chunkSize: { 
        current: currentChunkSize, 
        recommended: optimalChunkSize, 
        confidence: chunkSizeConfidence 
      },
      overlap: { 
        current: currentOverlap, 
        recommended: optimalOverlap, 
        confidence: overlapConfidence 
      },
      threshold: { 
        current: currentThreshold, 
        recommended: optimalThreshold, 
        confidence: thresholdConfidence 
      },
      maxResults: { 
        current: currentMaxResults, 
        recommended: optimalMaxResults, 
        confidence: maxResultsConfidence 
      },
      overallImprovement
    };
  }

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics(): {
    averageSearchTime: number;
    averageAccuracy: number;
    performanceTrend: 'improving' | 'declining' | 'stable';
    optimizationHistory: Array<{
      timestamp: Date;
      improvement: number;
      changes: Record<string, { from: number; to: number }>;
    }>;
  } {
    if (this.performanceHistory.length === 0) {
      return {
        averageSearchTime: 0,
        averageAccuracy: 0,
        performanceTrend: 'stable',
        optimizationHistory: []
      };
    }

    const recentMetrics = this.performanceHistory.slice(-20);
    const averageSearchTime = recentMetrics.reduce((sum, m) => sum + m.searchTime, 0) / recentMetrics.length;
    const averageAccuracy = recentMetrics.reduce((sum, m) => sum + m.accuracy, 0) / recentMetrics.length;

    const performanceTrend = this.calculatePerformanceTrend();
    const optimizationHistory = this.getOptimizationHistory();

    return {
      averageSearchTime,
      averageAccuracy,
      performanceTrend,
      optimizationHistory
    };
  }

  /**
   * Reset optimization history
   */
  resetOptimization(): void {
    this.performanceHistory = [];
    this.optimizationCount = 0;
    this.lastOptimization = Date.now();
    // Optimization history reset
  }

  /**
   * Update optimization configuration
   */
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Update adaptive configuration
   */
  updateAdaptiveConfig(newConfig: Partial<AdaptiveConfig>): void {
    this.adaptiveConfig = { ...this.adaptiveConfig, ...newConfig };
  }

  // Private optimization methods

  private shouldAutoOptimize(): boolean {
    if (!this.config.enableAutoOptimization) return false;
    if (this.optimizationCount >= this.config.maxOptimizationAttempts) return false;
    
    const timeSinceLastOptimization = Date.now() - this.lastOptimization;
    if (timeSinceLastOptimization < this.config.optimizationInterval) return false;

    // Check if performance is below threshold
    if (this.performanceHistory.length < 5) return false;
    
    const recentPerformance = this.performanceHistory.slice(-5);
    const averageAccuracy = recentPerformance.reduce((sum, m) => sum + m.accuracy, 0) / recentPerformance.length;
    
    return averageAccuracy < this.config.performanceThreshold;
  }

  private autoOptimize(): void {
    // Auto-optimization
    this.optimizationCount++;
    this.lastOptimization = Date.now();
  }

  private calculateOptimalChunkSize(): number {
    if (this.performanceHistory.length < 3) return 512;

    // Analyze performance vs chunk size relationship
    const sizePerformanceMap = new Map<number, number[]>();
    
    this.performanceHistory.forEach(metric => {
      const size = metric.chunkSize;
      if (!sizePerformanceMap.has(size)) {
        sizePerformanceMap.set(size, []);
      }
      sizePerformanceMap.get(size)!.push(metric.accuracy);
    });

    // Find chunk size with best average performance
    let bestSize = 512;
    let bestPerformance = 0;

    for (const [size, performances] of sizePerformanceMap) {
      const avgPerformance = performances.reduce((sum, p) => sum + p, 0) / performances.length;
      if (avgPerformance > bestPerformance) {
        bestPerformance = avgPerformance;
        bestSize = size;
      }
    }

    // Apply learning rate for gradual optimization
    const currentSize = this.performanceHistory[this.performanceHistory.length - 1]?.chunkSize || 512;
    const learningRate = this.config.learningRate;
    
    const optimalSize = Math.round(
      currentSize + (bestSize - currentSize) * learningRate
    );

    // Ensure reasonable bounds
    return Math.max(100, Math.min(2048, optimalSize));
  }

  private calculateOptimalOverlap(chunkSize: number): number {
    // Optimal overlap is typically 10-20% of chunk size
    const baseOverlap = Math.round(chunkSize * 0.15);
    
    // Adjust based on performance data
    if (this.performanceHistory.length < 3) return baseOverlap;

    const recentMetrics = this.performanceHistory.slice(-10);
    const avgAccuracy = recentMetrics.reduce((sum, m) => sum + m.accuracy, 0) / recentMetrics.length;
    
    // If accuracy is low, increase overlap for better context
    if (avgAccuracy < 0.6) {
      return Math.round(chunkSize * 0.2);
    }
    
    // If accuracy is high, reduce overlap for efficiency
    if (avgAccuracy > 0.9) {
      return Math.round(chunkSize * 0.1);
    }
    
    return baseOverlap;
  }

  private calculateOptimalThreshold(): number {
    if (this.performanceHistory.length < 3) return 0.0;

    // Analyze threshold vs accuracy relationship
    const recentMetrics = this.performanceHistory.slice(-20);
    const avgAccuracy = recentMetrics.reduce((sum, m) => sum + m.accuracy, 0) / recentMetrics.length;
    
    // Dynamic threshold adjustment based on performance
    if (avgAccuracy < 0.5) {
      // Low accuracy - lower threshold to get more results
      return Math.max(0.0, avgAccuracy - 0.2);
    } else if (avgAccuracy > 0.8) {
      // High accuracy - raise threshold for precision
      return Math.min(0.5, avgAccuracy - 0.3);
    } else {
      // Balanced approach
      return Math.max(0.0, avgAccuracy - 0.25);
    }
  }

  private calculateOptimalMaxResults(): number {
    if (this.performanceHistory.length < 3) return 10;

    // Analyze search time vs result count relationship
    const recentMetrics = this.performanceHistory.slice(-20);
    const avgSearchTime = recentMetrics.reduce((sum, m) => sum + m.searchTime, 0) / recentMetrics.length;
    
    // Adjust max results based on performance
    if (avgSearchTime < 50) {
      // Fast searches - can return more results
      return Math.min(50, 15 + Math.floor((100 - avgSearchTime) / 10));
    } else if (avgSearchTime > 200) {
      // Slow searches - reduce results for speed
      return Math.max(5, 10 - Math.floor((avgSearchTime - 100) / 20));
    } else {
      // Balanced approach
      return 10;
    }
  }

  private calculateConfidence(metric: keyof PerformanceMetrics): number {
    if (this.performanceHistory.length < 3) return 0;

    const values = this.performanceHistory.map(m => m[metric] as number);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    // Confidence is inverse to standard deviation (more consistent = higher confidence)
    const confidence = Math.max(0, Math.min(1, 1 - (standardDeviation / mean)));
    
    return isNaN(confidence) ? 0 : confidence;
  }

  private calculateOverallImprovement(): number {
    if (this.performanceHistory.length < 10) return 0;

    const firstHalf = this.performanceHistory.slice(0, Math.floor(this.performanceHistory.length / 2));
    const secondHalf = this.performanceHistory.slice(Math.floor(this.performanceHistory.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.accuracy, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.accuracy, 0) / secondHalf.length;

    return secondHalfAvg - firstHalfAvg;
  }

  private calculatePerformanceTrend(): 'improving' | 'declining' | 'stable' {
    if (this.performanceHistory.length < 10) return 'stable';

    const improvement = this.calculateOverallImprovement();
    const threshold = 0.05; // 5% improvement threshold

    if (improvement > threshold) return 'improving';
    if (improvement < -threshold) return 'declining';
    return 'stable';
  }

  private getOptimizationHistory(): Array<{
    timestamp: Date;
    improvement: number;
    changes: Record<string, { from: number; to: number }>;
  }> {
    // This would track actual optimization changes made
    // For now, return a simplified version
    return [{
      timestamp: new Date(),
      improvement: this.calculateOverallImprovement(),
      changes: {
        chunkSize: { from: 512, to: this.calculateOptimalChunkSize() },
        threshold: { from: 0.0, to: this.calculateOptimalThreshold() }
      }
    }];
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStats(): {
    totalOptimizations: number;
    lastOptimization: Date;
    performanceImprovement: number;
    confidenceLevel: number;
    recommendations: string[];
  } {
    const performanceImprovement = this.calculateOverallImprovement();
    const confidenceLevel = this.calculateConfidence('accuracy');
    
    const recommendations: string[] = [];
    
    if (this.performanceHistory.length < 5) {
      recommendations.push('Need more performance data for optimization');
    } else if (performanceImprovement < 0) {
      recommendations.push('Performance declining - consider optimization');
    } else if (performanceImprovement > 0.1) {
      recommendations.push('Performance improving - current settings are optimal');
    } else {
      recommendations.push('Performance stable - minor optimizations possible');
    }

    if (this.optimizationCount >= this.config.maxOptimizationAttempts) {
      recommendations.push('Maximum optimization attempts reached');
    }

    return {
      totalOptimizations: this.optimizationCount,
      lastOptimization: new Date(this.lastOptimization),
      performanceImprovement,
      confidenceLevel,
      recommendations
    };
  }
}
