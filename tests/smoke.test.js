import { test, expect } from 'vitest';
import { COURT_LENGTH, COURT_WIDTH } from '../src/constants.js';

test('court is twice as long as it is wide', () => {
  expect(COURT_LENGTH).toBe(2 * COURT_WIDTH);
});
