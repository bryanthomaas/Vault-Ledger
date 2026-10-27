import { describe, it, expect } from 'vitest';
import {
  toCents,
  fromCents,
  formatCurrency,
  calculateRoundUp,
  verifyDoubleEntryBalance,
} from './money';

describe('money utilities', () => {
  describe('toCents', () => {
    it('converts numbers to integer cents safely', () => {
      expect(toCents(12.34)).toBe(1234);
      expect(toCents(0.99)).toBe(99);
      expect(toCents(100)).toBe(10000);
      expect(toCents(0.01)).toBe(1);
      expect(toCents(-45.67)).toBe(-4567);
      expect(toCents(0)).toBe(0);
    });

    it('parses currency and decimal strings correctly', () => {
      expect(toCents('$142,500.00')).toBe(14250000);
      expect(toCents('142500.00')).toBe(14250000);
      expect(toCents('3.5')).toBe(350);
      expect(toCents('-12.40')).toBe(-1240);
      expect(toCents('-$5.25')).toBe(-525);
    });

    it('throws on non-numeric or infinite inputs', () => {
      expect(() => toCents(Infinity)).toThrow(TypeError);
      expect(() => toCents('abc')).toThrow(TypeError);
      expect(() => toCents('')).toThrow(TypeError);
    });
  });

  describe('fromCents', () => {
    it('converts cents to 2-decimal floats', () => {
      expect(fromCents(1234)).toBe(12.34);
      expect(fromCents(99)).toBe(0.99);
      expect(fromCents(-4567)).toBe(-45.67);
      expect(fromCents(0)).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('formats positive and negative amounts in USD', () => {
      expect(formatCurrency(14250000)).toBe('$142,500.00');
      expect(formatCurrency(350)).toBe('$3.50');
      expect(formatCurrency(-1250)).toBe('-$12.50');
      expect(formatCurrency(1250, { showSign: true })).toBe('+$12.50');
    });
  });

  describe('calculateRoundUp', () => {
    it('calculates the spare change to the nearest dollar', () => {
      // $3.25 -> $0.75 round-up
      expect(calculateRoundUp(325)).toBe(75);
      // $45.20 -> $0.80 round-up
      expect(calculateRoundUp(4520)).toBe(80);
      // $0.01 -> $0.99 round-up
      expect(calculateRoundUp(1)).toBe(99);
      // Already a whole dollar: $4.00 -> $0.00 round-up
      expect(calculateRoundUp(400)).toBe(0);
      expect(calculateRoundUp(10000)).toBe(0);
      // Handles negative expense amounts (e.g. -325 cents)
      expect(calculateRoundUp(-325)).toBe(75);
      // Zero expense
      expect(calculateRoundUp(0)).toBe(0);
    });
  });

  describe('verifyDoubleEntryBalance', () => {
    it('returns true when debits and credits sum to zero', () => {
      expect(
        verifyDoubleEntryBalance([
          { amountCents: -350 }, // -3.50 from Checking
          { amountCents: 350 }, // +3.50 to Coffee Merchant counterparty
        ]),
      ).toBe(true);

      // Multi-leg split entry
      expect(
        verifyDoubleEntryBalance([
          { amountCents: -5000 },
          { amountCents: 4500 },
          { amountCents: 500 },
        ]),
      ).toBe(true);
    });

    it('returns false when postings do not sum to zero or has < 2 legs', () => {
      expect(
        verifyDoubleEntryBalance([
          { amountCents: -350 },
          { amountCents: 300 }, // out of balance by 50 cents
        ]),
      ).toBe(false);

      expect(verifyDoubleEntryBalance([{ amountCents: 0 }])).toBe(false);
      expect(verifyDoubleEntryBalance([])).toBe(false);
    });
  });
});
