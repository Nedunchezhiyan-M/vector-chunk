import { Vector } from '../types';

export class VectorMath {
  /**
   * Calculate cosine similarity between two vectors
   * Time complexity: O(n) where n is vector dimension
   */
  static cosineSimilarity(a: Vector, b: Vector): number {
    if (a.dimension !== b.dimension) {
      throw new Error('Vectors must have the same dimension');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.dimension; i++) {
      dotProduct += a.values[i] * b.values[i];
      normA += a.values[i] * a.values[i];
      normB += b.values[i] * b.values[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Calculate Euclidean distance between two vectors
   * Time complexity: O(n)
   */
  static euclideanDistance(a: Vector, b: Vector): number {
    if (a.dimension !== b.dimension) {
      throw new Error('Vectors must have the same dimension');
    }

    let sum = 0;
    for (let i = 0; i < a.dimension; i++) {
      const diff = a.values[i] - b.values[i];
      sum += diff * diff;
    }

    return Math.sqrt(sum);
  }

  /**
   * Calculate Manhattan distance between two vectors
   * Time complexity: O(n)
   */
  static manhattanDistance(a: Vector, b: Vector): number {
    if (a.dimension !== b.dimension) {
      throw new Error('Vectors must have the same dimension');
    }

    let sum = 0;
    for (let i = 0; i < a.dimension; i++) {
      sum += Math.abs(a.values[i] - b.values[i]);
    }

    return sum;
  }

  /**
   * Calculate dot product between two vectors
   * Time complexity: O(n)
   */
  static dotProduct(a: Vector, b: Vector): number {
    if (a.dimension !== b.dimension) {
      throw new Error('Vectors must have the same dimension');
    }

    let sum = 0;
    for (let i = 0; i < a.dimension; i++) {
      sum += a.values[i] * b.values[i];
    }

    return sum;
  }

  /**
   * Normalize a vector to unit length
   * Time complexity: O(n)
   */
  static normalize(vector: Vector): Vector {
    const norm = Math.sqrt(vector.values.reduce((sum, val) => sum + val * val, 0));
    
    if (norm === 0) {
      return { ...vector, values: new Array(vector.dimension).fill(0) };
    }

    const normalizedValues = vector.values.map(val => val / norm);
    return { ...vector, values: normalizedValues };
  }

  /**
   * Add two vectors
   * Time complexity: O(n)
   */
  static add(a: Vector, b: Vector): Vector {
    if (a.dimension !== b.dimension) {
      throw new Error('Vectors must have the same dimension');
    }

    const values = a.values.map((val, i) => val + b.values[i]);
    return { values, dimension: a.dimension };
  }

  /**
   * Subtract vector b from vector a
   * Time complexity: O(n)
   */
  static subtract(a: Vector, b: Vector): Vector {
    if (a.dimension !== b.dimension) {
      throw new Error('Vectors must have the same dimension');
    }

    const values = a.values.map((val, i) => val - b.values[i]);
    return { values, dimension: a.dimension };
  }

  /**
   * Scale vector by a scalar value
   * Time complexity: O(n)
   */
  static scale(vector: Vector, scalar: number): Vector {
    const values = vector.values.map(val => val * scalar);
    return { ...vector, values };
  }

  /**
   * Check if two vectors are equal
   * Time complexity: O(n)
   */
  static equals(a: Vector, b: Vector): boolean {
    if (a.dimension !== b.dimension) return false;
    
    for (let i = 0; i < a.dimension; i++) {
      if (Math.abs(a.values[i] - b.values[i]) > Number.EPSILON) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Create a zero vector of specified dimension
   * Time complexity: O(1)
   */
  static zero(dimension: number): Vector {
    return {
      values: new Array(dimension).fill(0),
      dimension
    };
  }

  /**
   * Create a random vector of specified dimension
   * Time complexity: O(n)
   */
  static random(dimension: number, min = -1, max = 1): Vector {
    const values = new Array(dimension).fill(0).map(() => 
      Math.random() * (max - min) + min
    );
    return { values, dimension };
  }
}

