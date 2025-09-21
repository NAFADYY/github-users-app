// __tests__/paginate.test.js
import { paginate } from '../src/utils/paginate.js';

describe('paginate (ESM)', () => {
  test('returns empty array for empty list', () => {
    expect(paginate([], 1, 5)).toEqual([]);
  });

  test('slices correctly', () => {
    const list = Array.from({ length: 12 }, (_, i) => i + 1);
    expect(paginate(list, 1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(paginate(list, 2, 5)).toEqual([6, 7, 8, 9, 10]);
    expect(paginate(list, 3, 5)).toEqual([11, 12]);
  });

  test('clamps page below 1 to 1', () => {
    const list = [1, 2, 3, 4, 5];
    expect(paginate(list, 0, 2)).toEqual([1, 2]); 
  });

  test('handles perPage <= 0', () => {
    const list = [1, 2, 3, 4, 5];
    expect(paginate(list, 1, 0)).toEqual([1]);
  });
});
