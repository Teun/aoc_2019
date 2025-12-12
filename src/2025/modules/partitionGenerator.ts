/**
 * Generator that yields all ordered combinations (compositions) of `n` non-negative
 * integers (including 0) that sum to `x`.
 *
 * Each yielded value is an array of length `n`, containing integers >= 0
 * whose sum equals `x`.
 *
 * Example: n=3, x=2 -> yields [0,0,2], [0,1,1], [0,2,0], [1,0,1], [1,1,0], [2,0,0]
 */
export function* generateCompositions(n: number, sum: number): Generator<number[]> {
  if (!Number.isInteger(n) || !Number.isInteger(sum)) {
    throw new TypeError('`n` and `x` must be integers');
  }
  if (n < 0 || sum < 0) {
    throw new RangeError('`n` must be non-negative and `x` must be non-negative');
  }
  if (n === 0 || sum === 0) {
    return;
  }
  

  const arr: number[] = new Array(n).fill(0);

  function* helper(pos: number, remaining: number): Generator<number[]> {
    if (pos === n - 1) {
      // Last position gets all remaining sum
      arr[pos] = remaining;
      yield arr.slice();
      return;
    }

    const min = 0; // now allow zeros
    // with min 0 for remaining positions, max is simply the remaining sum
    const max = remaining;

    for (let v = min; v <= max; v++) {
      arr[pos] = v;
      yield* helper(pos + 1, remaining - v);
    }
  }

  yield* helper(0, sum);
}

export default generateCompositions;
