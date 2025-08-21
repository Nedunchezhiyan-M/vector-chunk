import { VectorMath } from '../src/utils/vector-math';
import { Vector } from '../src/types';

describe('VectorMath', () => {
  const vector1: Vector = { values: [1, 2, 3], dimension: 3 };
  const vector2: Vector = { values: [4, 5, 6], dimension: 3 };
  const zeroVector: Vector = { values: [0, 0, 0], dimension: 3 };

  describe('cosineSimilarity', () => {
    it('should calculate cosine similarity correctly', () => {
      const similarity = VectorMath.cosineSimilarity(vector1, vector2);
      expect(similarity).toBeCloseTo(0.9746, 4);
    });

    it('should return 0 for zero vectors', () => {
      const similarity = VectorMath.cosineSimilarity(zeroVector, vector1);
      expect(similarity).toBe(0);
    });

    it('should throw error for different dimensions', () => {
      const differentVector: Vector = { values: [1, 2], dimension: 2 };
      expect(() => VectorMath.cosineSimilarity(vector1, differentVector))
        .toThrow('Vectors must have the same dimension');
    });
  });

  describe('euclideanDistance', () => {
    it('should calculate Euclidean distance correctly', () => {
      const distance = VectorMath.euclideanDistance(vector1, vector2);
      expect(distance).toBeCloseTo(5.196, 3);
    });

    it('should return 0 for identical vectors', () => {
      const distance = VectorMath.euclideanDistance(vector1, vector1);
      expect(distance).toBe(0);
    });
  });

  describe('manhattanDistance', () => {
    it('should calculate Manhattan distance correctly', () => {
      const distance = VectorMath.manhattanDistance(vector1, vector2);
      expect(distance).toBe(9);
    });
  });

  describe('dotProduct', () => {
    it('should calculate dot product correctly', () => {
      const dotProduct = VectorMath.dotProduct(vector1, vector2);
      expect(dotProduct).toBe(32);
    });
  });

  describe('normalize', () => {
    it('should normalize vector to unit length', () => {
      const normalized = VectorMath.normalize(vector1);
      const norm = Math.sqrt(normalized.values.reduce((sum, val) => sum + val * val, 0));
      expect(norm).toBeCloseTo(1, 6);
    });

    it('should handle zero vector', () => {
      const normalized = VectorMath.normalize(zeroVector);
      expect(normalized.values).toEqual([0, 0, 0]);
    });
  });

  describe('add', () => {
    it('should add two vectors correctly', () => {
      const result = VectorMath.add(vector1, vector2);
      expect(result.values).toEqual([5, 7, 9]);
      expect(result.dimension).toBe(3);
    });
  });

  describe('subtract', () => {
    it('should subtract two vectors correctly', () => {
      const result = VectorMath.subtract(vector2, vector1);
      expect(result.values).toEqual([3, 3, 3]);
    });
  });

  describe('scale', () => {
    it('should scale vector correctly', () => {
      const result = VectorMath.scale(vector1, 2);
      expect(result.values).toEqual([2, 4, 6]);
    });
  });

  describe('equals', () => {
    it('should return true for identical vectors', () => {
      expect(VectorMath.equals(vector1, vector1)).toBe(true);
    });

    it('should return false for different vectors', () => {
      expect(VectorMath.equals(vector1, vector2)).toBe(false);
    });
  });

  describe('zero', () => {
    it('should create zero vector of specified dimension', () => {
      const zero = VectorMath.zero(5);
      expect(zero.dimension).toBe(5);
      expect(zero.values).toEqual([0, 0, 0, 0, 0]);
    });
  });

  describe('random', () => {
    it('should create random vector of specified dimension', () => {
      const random = VectorMath.random(4, 0, 1);
      expect(random.dimension).toBe(4);
      expect(random.values.length).toBe(4);
      
      // Check bounds
      random.values.forEach(val => {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      });
    });
  });
});

