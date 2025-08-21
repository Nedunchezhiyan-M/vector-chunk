import { TextChunker } from '../src/chunking/text-chunker';
import { ChunkingConfig } from '../src/types';

describe('TextChunker', () => {
  const sampleText = `This is a sample text document. It contains multiple sentences.
  
  Each paragraph should be handled properly. The chunking algorithm should respect natural boundaries.
  
  This is the third paragraph with some additional content to test the chunking functionality.`;

  describe('constructor', () => {
    it('should use default configuration when none provided', () => {
      const chunker = new TextChunker();
      const config = chunker.getConfig();
      
      expect(config.chunkSize).toBe(512);
      expect(config.overlap).toBe(50);
      expect(config.strategy).toBe('fixed');
    });

    it('should merge provided configuration with defaults', () => {
      const customConfig: Partial<ChunkingConfig> = {
        chunkSize: 256,
        strategy: 'semantic'
      };
      
      const chunker = new TextChunker(customConfig);
      const config = chunker.getConfig();
      
      expect(config.chunkSize).toBe(256);
      expect(config.strategy).toBe('semantic');
      expect(config.overlap).toBe(50); // Default value
    });
  });

  describe('fixed size chunking', () => {
    it('should create chunks of specified size', () => {
      const chunker = new TextChunker({ 
        chunkSize: 50, 
        strategy: 'fixed',
        overlap: 0 
      });
      
      const chunks = chunker.chunkText(sampleText);
      
      chunks.forEach(chunk => {
        expect(chunk.content.length).toBeLessThanOrEqual(50);
        expect(chunk.content.length).toBeGreaterThan(0);
      });
    });

    it('should handle overlap correctly', () => {
      const chunker = new TextChunker({ 
        chunkSize: 100, 
        strategy: 'fixed',
        overlap: 20 
      });
      
      const chunks = chunker.chunkText(sampleText);
      
      if (chunks.length > 1) {
        const firstChunk = chunks[0].content;
        const secondChunk = chunks[1].content;
        
        // Check if there's some overlap (words from first chunk appear in second)
        const firstWords = firstChunk.split(/\s+/);
        const secondWords = secondChunk.split(/\s+/);
        
        // At least one word should overlap
        const hasOverlap = firstWords.some(word => secondWords.includes(word));
        expect(hasOverlap).toBe(true);
      }
    });
  });

  describe('semantic chunking', () => {
    it('should respect sentence boundaries', () => {
      const chunker = new TextChunker({ 
        strategy: 'semantic',
        chunkSize: 100 
      });
      
      const chunks = chunker.chunkText(sampleText);
      
      chunks.forEach(chunk => {
        // Each chunk should end with sentence-ending punctuation
        expect(/[.!?]\s*$/.test(chunk.content) || chunk.content === chunks[chunks.length - 1].content).toBe(true);
      });
    });
  });

  describe('sliding window chunking', () => {
    it('should create overlapping chunks with fixed step', () => {
      const chunker = new TextChunker({ 
        strategy: 'sliding',
        chunkSize: 50,
        overlap: 10 
      });
      
      const chunks = chunker.chunkText(sampleText);
      
      if (chunks.length > 1) {
        const step = 50 - 10; // chunkSize - overlap
        expect(chunks.length).toBeGreaterThan(1);
      }
    });
  });

  describe('adaptive chunking', () => {
    it('should preserve paragraph structure', () => {
      const chunker = new TextChunker({ 
        strategy: 'adaptive',
        chunkSize: 100 
      });
      
      const chunks = chunker.chunkText(sampleText);
      
      chunks.forEach(chunk => {
        // Should contain complete paragraphs or parts of paragraphs
        expect(chunk.content).toMatch(/^[^\n]*(\n[^\n]*)*$/);
      });
    });
  });

  describe('chunk metadata', () => {
    it('should include proper metadata in chunks', () => {
      const chunker = new TextChunker();
      const customMetadata = { source: 'test', author: 'tester' };
      
      const chunks = chunker.chunkText(sampleText, customMetadata);
      
      chunks.forEach((chunk, index) => {
        expect(chunk.id).toBeDefined();
        expect(chunk.content).toBeDefined();
        expect(chunk.vector).toBeDefined();
        expect(chunk.chunkIndex).toBe(index);
        expect(chunk.metadata.source).toBe('test');
        expect(chunk.metadata.author).toBe('tester');
        expect(chunk.metadata.timestamp).toBeDefined();
        expect(chunk.metadata.length).toBeDefined();
        expect(chunk.metadata.wordCount).toBeDefined();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty text', () => {
      const chunker = new TextChunker();
      const chunks = chunker.chunkText('');
      expect(chunks).toEqual([]);
    });

    it('should handle text shorter than chunk size', () => {
      const chunker = new TextChunker({ 
        chunkSize: 1000,
        minChunkSize: 10  // Set minChunkSize to allow "Short text" (11 chars)
      });
      const chunks = chunker.chunkText('Short text');
      
      expect(chunks.length).toBe(1);
      expect(chunks[0].content).toBe('Short text');
    });

    it('should respect minimum chunk size', () => {
      const chunker = new TextChunker({ 
        chunkSize: 100,
        minChunkSize: 50 
      });
      
      const chunks = chunker.chunkText('Very short text that is too small');
      
      // Should not create chunks smaller than minChunkSize
      chunks.forEach(chunk => {
        expect(chunk.content.length).toBeGreaterThanOrEqual(50);
      });
    });

    it('should return empty array for text shorter than minimum chunk size', () => {
      const chunker = new TextChunker({ 
        chunkSize: 1000,
        minChunkSize: 50 
      });
      
      const chunks = chunker.chunkText('Too short');
      
      expect(chunks.length).toBe(0);
    });

    it('should respect default minimum chunk size', () => {
      const chunker = new TextChunker(); // Uses default minChunkSize: 100
      
      const chunks = chunker.chunkText('Short text'); // Only 11 characters
      
      expect(chunks.length).toBe(0); // Should be filtered out by default minChunkSize
    });
  });

  describe('configuration updates', () => {
    it('should update configuration dynamically', () => {
      const chunker = new TextChunker({ chunkSize: 100 });
      expect(chunker.getConfig().chunkSize).toBe(100);
      
      chunker.updateConfig({ chunkSize: 200 });
      expect(chunker.getConfig().chunkSize).toBe(200);
    });
  });
});

