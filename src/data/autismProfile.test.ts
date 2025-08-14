import test from 'node:test';
import assert from 'node:assert/strict';
import { VERBAL_FLUENCY_OPTIONS, AGE_OF_FIRST_CONCERNS_OPTIONS } from './autismProfile.ts';

test('autism profile option lists are defined', () => {
  assert.ok(VERBAL_FLUENCY_OPTIONS.length > 0);
  assert.ok(AGE_OF_FIRST_CONCERNS_OPTIONS.includes('<3y'));
});
