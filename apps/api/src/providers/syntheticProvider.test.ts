import { describe, it, expect } from 'vitest';
import { SyntheticDataProvider } from './syntheticProvider';

describe('SyntheticDataProvider (unit)', () => {
  const provider = new SyntheticDataProvider();

  it('reports configured as true without needing third party API keys', () => {
    expect(provider.isConfigured()).toBe(true);
    expect(provider.name).toBe('synthetic');
  });

  it('generates 18 months of realistic financial transactions', async () => {
    const transactions = await provider.fetchTransactions('user-123');

    // Should generate several hundred realistic transactions over 18 months
    expect(transactions.length).toBeGreaterThan(250);

    // Verify external IDs are all strictly unique
    const idSet = new Set(transactions.map((t) => t.externalId));
    expect(idSet.size).toBe(transactions.length);

    // Verify recurring payroll entries exist
    const salaries = transactions.filter((t) => t.category === 'Salary');
    expect(salaries.length).toBeGreaterThan(30); // ~36 biweekly paychecks in 18 months
    expect(salaries.every((s) => s.amountCents === 345000)).toBe(true);

    // Verify monthly rent exists on the 1st
    const rent = transactions.filter((t) => t.category === 'Housing');
    expect(rent.length).toBeGreaterThan(15);
    expect(rent.every((r) => r.amountCents === -165000)).toBe(true);
    expect(rent.every((r) => r.occurredAt.getDate() === 1)).toBe(true);

    // Verify fixed subscriptions exist
    const netflix = transactions.filter((t) => t.merchant === 'Netflix');
    expect(netflix.length).toBeGreaterThan(12);
    expect(netflix.every((n) => n.amountCents === -1599)).toBe(true);

    const spotify = transactions.filter((t) => t.merchant === 'Spotify');
    expect(spotify.length).toBeGreaterThan(12);
    expect(spotify.every((s) => s.amountCents === -1099)).toBe(true);

    // Verify variable expenses have realistic categories and merchants
    const coffees = transactions.filter((t) => t.category === 'Coffee');
    expect(coffees.length).toBeGreaterThan(50);
    expect(coffees.every((c) => c.amountCents < 0)).toBe(true);
  });
});
