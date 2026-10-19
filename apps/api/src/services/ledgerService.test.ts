import { describe, it, expect, vi } from 'vitest';
import crypto from 'crypto';
import { LedgerService, UnbalancedJournalEntryError } from './ledgerService';

describe('LedgerService (unit)', () => {
  it('throws UnbalancedJournalEntryError when postings do not sum to 0', async () => {
    const mockDb: any = {
      transaction: vi.fn(),
    };
    const service = new LedgerService(mockDb);

    const accountId1 = crypto.randomUUID();
    const accountId2 = crypto.randomUUID();

    await expect(
      service.recordEntry({
        userId: crypto.randomUUID(),
        occurredAt: new Date(),
        description: 'Unbalanced purchase',
        postings: [
          { accountId: accountId1, amountCents: -500 }, // $5 spent
          { accountId: accountId2, amountCents: 400 },  // only $4 accounted for!
        ],
      }),
    ).rejects.toThrow(UnbalancedJournalEntryError);

    expect(mockDb.transaction).not.toHaveBeenCalled();
  });

  it('throws when less than two postings are provided', async () => {
    const mockDb: any = {
      transaction: vi.fn(),
    };
    const service = new LedgerService(mockDb);

    await expect(
      service.recordEntry({
        userId: crypto.randomUUID(),
        occurredAt: new Date(),
        description: 'Single leg entry',
        postings: [{ accountId: crypto.randomUUID(), amountCents: 0 }],
      }),
    ).rejects.toThrow(UnbalancedJournalEntryError);
  });

  it('executes transaction when postings are balanced (sum = 0)', async () => {
    const userId = crypto.randomUUID();
    const accountId1 = crypto.randomUUID();
    const accountId2 = crypto.randomUUID();

    const mockTx: any = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: accountId1, userId }]),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: crypto.randomUUID(),
              userId,
              occurredAt: new Date(),
              description: 'Balanced Coffee',
              category: 'Coffee',
              source: 'manual',
            },
          ]),
        }),
      }),
    };

    const mockDb: any = {
      transaction: vi.fn().mockImplementation(async (callback) => {
        return await callback(mockTx);
      }),
    };

    const service = new LedgerService(mockDb);

    const result = await service.recordEntry({
      userId,
      occurredAt: new Date(),
      description: 'Balanced Coffee',
      category: 'Coffee',
      postings: [
        { accountId: accountId1, amountCents: -450 }, // -4.50 from Checking
        { accountId: accountId2, amountCents: 450 },  // +4.50 to Merchant
      ],
    });

    expect(mockDb.transaction).toHaveBeenCalledTimes(1);
    expect(result.description).toBe('Balanced Coffee');
  });
});
