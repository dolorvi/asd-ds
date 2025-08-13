import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTestData } from './testData.ts';

test('returns no validation errors for canonical cases', () => {
  assert.deepStrictEqual(validateTestData(), []);
});
