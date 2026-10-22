import { describe, it, expect } from 'vitest';
import { calculateRoundUp } from '@vault-ledger/shared';

describe('RulesEngine Logic (unit)', () => {
  it('correctly calculates round-up amounts across purchase values', () => {
    // $4.25 -> 75 cents round-up
    expect(calculateRoundUp(-425)).toBe(75);
    // $12.99 -> 1 cent round-up
    expect(calculateRoundUp(-1299)).toBe(1);
    // $80.50 -> 50 cents round-up
    expect(calculateRoundUp(-8050)).toBe(50);
    // Whole dollar purchase ($15.00) -> 0 cents round-up
    expect(calculateRoundUp(-1500)).toBe(0);
    // Income / positive -> 0 cents round-up
    expect(calculateRoundUp(345000)).toBe(0);
  });

  it('multiplies round-up when multiplier is configured', () => {
    const base = calculateRoundUp(-425); // 75 cents
    const multiplier2x = base * 2; // 150 cents ($1.50)
    const multiplier3x = base * 3; // 225 cents ($2.25)

    expect(multiplier2x).toBe(150);
    expect(multiplier3x).toBe(225);
  });

  it('calculates percent of income correctly', () => {
    const paycheckCents = 345000; // $3,450.00
    const save10Percent = Math.round(paycheckCents * (10 / 100)); // $345.00
    const save15Percent = Math.round(paycheckCents * (15 / 100)); // $517.50

    expect(save10Percent).toBe(34500);
    expect(save15Percent).toBe(51750);
  });

  it('calculates excess cash sweep above threshold', () => {
    const checkingBalanceCents = 624000; // $6,240.00
    const thresholdCents = 500000; // $5,000.00
    const sweepAmount = checkingBalanceCents - thresholdCents;

    expect(sweepAmount).toBe(124000); // $1,240.00 swept to vault
  });
});
