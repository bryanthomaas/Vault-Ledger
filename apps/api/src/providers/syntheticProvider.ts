import type { DataProvider, BankTransaction } from './dataProvider';

export class SyntheticDataProvider implements DataProvider {
  readonly name = 'synthetic';

  isConfigured(): boolean {
    return true; // Always available, zero secrets required
  }

  async fetchTransactions(_userId: string): Promise<BankTransaction[]> {
    const transactions: BankTransaction[] = [];
    const now = new Date();
    // 18 months of history (~548 days)
    const startDate = new Date(now.getTime() - 548 * 24 * 60 * 60 * 1000);

    let seq = 1;
    const addTx = (date: Date, desc: string, merchant: string, cat: string, cents: number) => {
      const dateStr = date.toISOString().split('T')[0];
      transactions.push({
        externalId: `synth_${dateStr}_${seq++}`,
        occurredAt: new Date(date),
        description: desc,
        merchant,
        category: cat,
        amountCents: cents,
      });
    };

    // Step day by day through the 18 months
    const cursor = new Date(startDate);
    let dayCount = 0;

    while (cursor <= now) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const date = cursor.getDate();
      const dayOfWeek = cursor.getDay(); // 0 is Sunday, 5 is Friday

      // 1. Bi-weekly Payroll on Friday ($3,450.00 = +345000 cents)
      if (dayOfWeek === 5 && Math.floor(dayCount / 7) % 2 === 0) {
        addTx(new Date(cursor), 'Direct Deposit - Tech Corp Payroll', 'Tech Corp', 'Salary', 345000);
      }

      // 2. Monthly Rent on the 1st ($1,650.00 = -165000 cents)
      if (date === 1) {
        addTx(new Date(cursor), 'Rent Payment - Avalon Residences', 'Avalon Properties', 'Housing', -165000);
      }

      // 3. Monthly Utilities on the 5th (~$95 - $130)
      if (date === 5) {
        const utilAmount = 9500 + ((month * 17) % 3500); // seasonal variation
        addTx(new Date(cursor), 'Electric & Gas Utility Bill', 'Con Edison', 'Utilities', -utilAmount);
      }

      // 4. Fixed Subscriptions
      if (date === 12) {
        addTx(new Date(cursor), 'Netflix Subscription', 'Netflix', 'Entertainment', -1599);
      }
      if (date === 18) {
        addTx(new Date(cursor), 'Spotify Premium', 'Spotify', 'Entertainment', -1099);
      }
      if (date === 22) {
        addTx(new Date(cursor), 'Equinox Gym Membership', 'Equinox', 'Fitness', -4500);
      }
      if (date === 28) {
        addTx(new Date(cursor), 'Apple iCloud Storage', 'Apple', 'Subscriptions', -999);
      }

      // 5. Weekly Groceries (Saturdays or Sundays)
      if (dayOfWeek === 6) {
        const groceryAmount = 8500 + ((dayCount * 31) % 4500); // $85 - $130
        const store = dayCount % 2 === 0 ? "Trader Joe's" : 'Whole Foods Market';
        addTx(new Date(cursor), `Groceries at ${store}`, store, 'Groceries', -groceryAmount);
      }

      // 6. Routine weekday coffee ($3.75 - $5.50)
      if (dayOfWeek >= 1 && dayOfWeek <= 5 && dayCount % 3 !== 0) {
        const coffeeShop = dayCount % 2 === 0 ? 'Blue Bottle Coffee' : 'Starbucks';
        const cents = -(375 + ((dayCount * 25) % 175));
        addTx(new Date(cursor), `Coffee at ${coffeeShop}`, coffeeShop, 'Coffee', cents);
      }

      // 7. Weekend Dining Out ($32 - $75)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const diningAmount = -(3200 + ((dayCount * 73) % 4300));
        addTx(new Date(cursor), 'Dinner & Drinks', 'Local Bistro', 'Dining', diningAmount);
      }

      // 8. Occasional Uber rides ($14 - $34)
      if (dayCount % 6 === 0) {
        const rideAmount = -(1400 + ((dayCount * 47) % 2000));
        addTx(new Date(cursor), 'Uber Trip', 'Uber', 'Transportation', rideAmount);
      }

      // Advance one day
      cursor.setDate(cursor.getDate() + 1);
      dayCount++;
    }

    // Sort chronologically ascending
    return transactions.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
  }
}
