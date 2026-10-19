import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  RegisterInputSchema,
  CreateRuleInputSchema,
  UpsertBudgetInputSchema,
  AccountSchema,
} from './schemas';

describe('Zod shared schemas', () => {
  it('validates registration input', () => {
    const valid = {
      email: 'bryan@example.com',
      password: 'supersecretpassword123',
      firstName: 'Bryan',
      lastName: 'Thomas',
    };
    expect(RegisterInputSchema.parse(valid)).toEqual(valid);

    // Password too short
    expect(() =>
      RegisterInputSchema.parse({
        ...valid,
        password: 'short',
      }),
    ).toThrow();

    // Invalid email
    expect(() =>
      RegisterInputSchema.parse({
        ...valid,
        email: 'invalid-email',
      }),
    ).toThrow();
  });

  it('validates rule configs (round_up, percent_of_income, sweep)', () => {
    const acc1 = crypto.randomUUID();
    const acc2 = crypto.randomUUID();

    const roundUpRule = {
      name: 'Coffee Round-Ups',
      type: 'round_up' as const,
      enabled: true,
      config: {
        destinationAccountId: acc1,
        multiplier: 1,
      },
    };
    expect(CreateRuleInputSchema.parse(roundUpRule)).toEqual(roundUpRule);

    const sweepRule = {
      name: 'Excess Cash Sweep',
      type: 'sweep' as const,
      enabled: true,
      config: {
        sourceAccountId: acc1,
        destinationAccountId: acc2,
        thresholdCents: 500000, // $5,000 threshold
      },
    };
    expect(CreateRuleInputSchema.parse(sweepRule)).toEqual(sweepRule);
  });

  it('validates budget inputs', () => {
    const budget = {
      category: 'Dining Out',
      amountCents: 45000, // $450.00
    };
    expect(UpsertBudgetInputSchema.parse(budget)).toEqual(budget);

    // Rejects negative amounts
    expect(() =>
      UpsertBudgetInputSchema.parse({
        category: 'Dining Out',
        amountCents: -100,
      }),
    ).toThrow();
  });

  it('validates account entity', () => {
    const account = {
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      name: 'Vault Checking',
      type: 'depository' as const,
      currency: 'USD',
      balanceCents: 524050,
      isArchived: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    expect(AccountSchema.parse(account)).toEqual(account);
  });
});
