/**
 * Deterministic shuffle utility
 * Uses a seeded random number generator to ensure consistent shuffling
 * based on a seed value (e.g., node ID)
 */

/**
 * Simple seeded random number generator (Linear Congruential Generator)
 */
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    // LCG parameters (used by many implementations)
    this.seed = (this.seed * 1664525 + 1013904223) % 2 ** 32
    return this.seed / 2 ** 32
  }
}

/**
 * Hash a string to a number (for creating seeds from node IDs)
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Deterministically shuffle an array based on a seed
 * Uses Fisher-Yates shuffle algorithm with seeded random
 */
export function deterministicShuffle<T>(array: T[], seed: number | string): T[] {
  const shuffled = [...array]
  const seedNum = typeof seed === 'string' ? hashString(seed) : seed
  const rng = new SeededRandom(seedNum)

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

/**
 * Shuffle an array with original indices preserved
 * Returns array of { item, originalIndex } pairs
 */
export function shuffleWithIndices<T>(
  array: T[],
  seed: number | string
): Array<{ item: T; originalIndex: number }> {
  const withIndices = array.map((item, idx) => ({ item, originalIndex: idx }))
  return deterministicShuffle(withIndices, seed)
}
