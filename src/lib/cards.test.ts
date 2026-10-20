import { describe, expect, it } from 'vitest';
import { cardBrand, expiryValid, luhnValid } from './cards';

describe('cards', () => {
  it('validates card numbers with Luhn', () => {
    expect(luhnValid('4242424242424242')).toBe(true);
    expect(luhnValid('4242424242424241')).toBe(false);
    expect(luhnValid('42')).toBe(false);
  });

  it('detects brands', () => {
    expect(cardBrand('4242')).toBe('Visa');
    expect(cardBrand('5555')).toBe('Mastercard');
    expect(cardBrand('3782')).toBe('Amex');
  });

  it('rejects expired dates', () => {
    const now = new Date(2026, 9, 20);
    expect(expiryValid('10/26', now)).toBe(true);
    expect(expiryValid('09/26', now)).toBe(false);
    expect(expiryValid('13/30', now)).toBe(false);
  });
});
