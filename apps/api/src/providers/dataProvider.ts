export interface BankTransaction {
  externalId: string;
  occurredAt: Date;
  description: string;
  merchant?: string;
  category: string;
  amountCents: number; // positive for income, negative for expenses
}

export interface DataProvider {
  readonly name: string;
  isConfigured(): boolean;
  fetchTransactions(userId: string): Promise<BankTransaction[]>;
}
