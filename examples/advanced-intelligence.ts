import { VectorSearch, defaultConfigs } from '../src/index';

async function main() {
  console.log('🚀 Vector Search Pro - Demo\n');

  const searchEngine = new VectorSearch(
    defaultConfigs.vectorStore,
    defaultConfigs.optimization,
    defaultConfigs.adaptive
  );

  // Sample content
  const professionalContent = `Artificial Intelligence represents a paradigm shift in computational capabilities. Machine learning algorithms demonstrate significant improvements in predictive accuracy.`;
  const casualContent = `Hey! AI is super cool technology that's changing how computers work. It's like having a smart assistant that learns from examples.`;

  // Content Analysis
  console.log('🎯 Content Analysis');
  const analysis = await searchEngine.analyzeContent(professionalContent);
  console.log(`Tone: ${analysis.tone.dominantTone} (${(analysis.tone.confidence * 100).toFixed(1)}%)`);
  console.log(`Quality: ${(analysis.qualityScore * 100).toFixed(1)}%`);
  console.log(`Complexity: ${(analysis.dna.complexity * 100).toFixed(1)}%`);

  // Content Fusion
  console.log('\n🔗 Content Fusion');
  const fusion = await searchEngine.fuseContent([professionalContent, casualContent]);
  console.log(`Coherence: ${fusion.coherence.toFixed(2)}`);
  console.log(`Summary: ${fusion.summary.substring(0, 100)}...`);

  // Performance Tracking
  console.log('\n⚡ Performance Tracking');
  searchEngine.recordPerformanceMetrics({
    searchTime: 45,
    chunkSize: 512,
    memoryUsage: 2.5,
    accuracy: 0.85
  });

  const recommendations = searchEngine.getOptimizationRecommendations();
  console.log(`Recommended chunk size: ${recommendations.chunkSize.recommended}`);

  // Search Demo
  console.log('\n🔍 Search Demo');
  const searchResults = await searchEngine.searchContent(professionalContent, 'AI technology');
  console.log(`Found ${searchResults.length} results`);
  if (searchResults.length > 0) {
    console.log(`Best match: ${(searchResults[0].similarity * 100).toFixed(1)}% similarity`);
  }

  console.log('\n✅ Demo completed!');
}

main().catch(console.error);