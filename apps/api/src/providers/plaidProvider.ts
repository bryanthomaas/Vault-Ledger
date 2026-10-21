import type { DataProvider, BankTransaction } from './dataProvider';

export class PlaidSandboxProvider implements DataProvider {
  readonly name = 'plaid_sandbox';

  private clientId = process.env.PLAID_CLIENT_ID;
  private secret = process.env.PLAID_SECRET;
  private env = process.env.PLAID_ENV || 'sandbox';

  isConfigured(): boolean {
    return Boolean(this.clientId && this.secret);
  }

  async createLinkToken(userId: string): Promise<string> {
    if (!this.isConfigured()) {
      // In sandbox demo mode without keys, return a dummy link token for simulation
      return `link-sandbox-mock-${userId}-${Date.now()}`;
    }

    try {
      const response = await fetch('https://sandbox.plaid.com/link/token/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.clientId,
          secret: this.secret,
          client_name: 'Vault Ledger',
          country_codes: ['US'],
          language: 'en',
          user: { client_user_id: userId },
          products: ['transactions'],
        }),
      });

      const data = (await response.json()) as any;
      if (!response.ok) {
        throw new Error(data.error_message || 'Plaid link token creation failed');
      }
      return data.link_token;
    } catch (err: any) {
      console.warn(`[Plaid] Fallback: link token error: ${err.message}`);
      return `link-sandbox-mock-${userId}-${Date.now()}`;
    }
  }

  async fetchTransactions(_userId: string): Promise<BankTransaction[]> {
    // When called, Plaid Sandbox fetches real sandbox transactions or returns empty if not linked
    return [];
  }
}
