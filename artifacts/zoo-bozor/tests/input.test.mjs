import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decimalOnly, digitsOnly, displayPhone, formatBirthInput, normalizePhone, phoneHref, validBirthDate } from '../constants/input.ts';

test('numeric fields reject typed and pasted non-ASCII digits, letters, signs and spaces', () => {
  assert.equal(digitsOnly('a+998 (90) 123-45-67z'), '998901234567');
  assert.equal(digitsOnly('12e3-4.5😀'), '12345');
  assert.equal(digitsOnly('abc'), '');
});

test('phone numbers use one normalized format for storage and device dialing', () => {
  assert.equal(normalizePhone('901234567'), '998901234567');
  assert.equal(normalizePhone('+998 90 123 45 67'), '998901234567');
  assert.equal(phoneHref('901234567'), 'tel:+998901234567');
  assert.equal(displayPhone('998901234567'), '+998 90 123 45 67');
  for (const invalid of ['', '123', '99890123456', '9989012345678', '997901234567']) {
    assert.equal(normalizePhone(invalid), null);
    assert.equal(phoneHref(invalid), null);
  }
});

test('weight permits one decimal separator, never letters or exponent notation', () => {
  assert.equal(decimalOnly('15,5kg'), '15.5');
  assert.equal(decimalOnly('1.2.3'), '1.23');
  assert.equal(decimalOnly('abc'), '');
});

test('birthdays format numeric input and validate real calendar dates', () => {
  assert.equal(formatBirthInput('15091994'), '15.09.1994');
  assert.equal(formatBirthInput('15a.09b.1994'), '15.09.1994');
  assert.equal(validBirthDate('29.02.2000'), true);
  assert.equal(validBirthDate('29.02.2001'), false);
  assert.equal(validBirthDate('31.04.2000'), false);
  assert.equal(validBirthDate('01.01.1899'), false);
  assert.equal(validBirthDate('01.01.2999'), false);
});
