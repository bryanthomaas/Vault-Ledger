import type {
  Account,
  TransactionView,
  Rule,
  Budget,
  Goal,
  Notification,
  SpendingInsights,
  ForecastResponse,
  AuthResponse,
} from '@vault-ledger/shared';

export const mockUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'demo@vaultledger.local',
  firstName: 'Bryan',
  lastName: 'Thomas',
  isDemo: true,
  createdAt: new Date().toISOString(),
};

export const mockAccounts: Account[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    userId: mockUser.id,
    name: 'Primary Checking',
    type: 'depository',
    balanceCents: 485025, // $4,850.25
    currency: 'USD',
    isArchived: false,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    userId: mockUser.id,
    name: 'Reserve Savings Account',
    type: 'vault',
    balanceCents: 1842050, // $18,420.50
    currency: 'USD',
    isArchived: false,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    userId: mockUser.id,
    name: 'Growth Index Portfolio',
    type: 'vault',
    balanceCents: 3215000, // $32,150.00
    currency: 'USD',
    isArchived: false,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    userId: mockUser.id,
    name: 'Sapphire Preferred Card',
    type: 'credit',
    balanceCents: -68040, // -$680.40
    currency: 'USD',
    isArchived: false,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockTransactions: TransactionView[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    occurredAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    description: 'Coffee at Blue Bottle Coffee',
    merchant: 'Blue Bottle Coffee',
    category: 'Coffee',
    amountCents: -525,
    source: 'provider',
    accountId: mockAccounts[0].id,
    accountName: mockAccounts[0].name,
    isRoundUp: false,
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    occurredAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    description: 'Round-Up Transfer to Reserve Savings',
    merchant: null,
    category: 'Savings',
    amountCents: -75,
    source: 'rule',
    accountId: mockAccounts[0].id,
    accountName: mockAccounts[0].name,
    isRoundUp: true,
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    description: "Groceries at Trader Joe's",
    merchant: "Trader Joe's",
    category: 'Groceries',
    amountCents: -9420,
    source: 'provider',
    accountId: mockAccounts[0].id,
    accountName: mockAccounts[0].name,
    isRoundUp: false,
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    description: 'Direct Deposit - Tech Corp Payroll',
    merchant: 'Tech Corp',
    category: 'Salary',
    amountCents: 345000,
    source: 'provider',
    accountId: mockAccounts[0].id,
    accountName: mockAccounts[0].name,
    isRoundUp: false,
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    description: 'Rent Payment - Avalon Residences',
    merchant: 'Avalon Properties',
    category: 'Housing',
    amountCents: -165000,
    source: 'provider',
    accountId: mockAccounts[0].id,
    accountName: mockAccounts[0].name,
    isRoundUp: false,
  },
  {
    id: '20000000-0000-0000-0000-000000000006',
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    description: 'Electric & Gas Utility Bill',
    merchant: 'Con Edison',
    category: 'Utilities',
    amountCents: -11250,
    source: 'provider',
    accountId: mockAccounts[0].id,
    accountName: mockAccounts[0].name,
    isRoundUp: false,
  },
  {
    id: '20000000-0000-0000-0000-000000000007',
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    description: 'Netflix Monthly Subscription',
    merchant: 'Netflix',
    category: 'Entertainment',
    amountCents: -1599,
    source: 'provider',
    accountId: mockAccounts[0].id,
    accountName: mockAccounts[0].name,
    isRoundUp: false,
  },
  {
    id: '20000000-0000-0000-0000-000000000008',
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(),
    description: 'Spotify Premium Individual',
    merchant: 'Spotify',
    category: 'Entertainment',
    amountCents: -1099,
    source: 'provider',
    accountId: mockAccounts[0].id,
    accountName: mockAccounts[0].name,
    isRoundUp: false,
  },
];

export const mockRules: Rule[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    userId: mockUser.id,
    name: 'Coffee & Daily Round-Ups',
    type: 'round_up',
    enabled: true,
    config: {
      destinationAccountId: mockAccounts[1].id,
      multiplier: 1,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    userId: mockUser.id,
    name: 'Paycheck Savings Allocation',
    type: 'percent_of_income',
    enabled: true,
    config: {
      destinationAccountId: mockAccounts[1].id,
      percentage: 15,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    userId: mockUser.id,
    name: 'Operating Cash Balance Sweep',
    type: 'sweep',
    enabled: true,
    config: {
      destinationAccountId: mockAccounts[1].id,
      sourceAccountId: mockAccounts[0].id,
      thresholdCents: 500000,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockBudgets: Budget[] = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    userId: mockUser.id,
    category: 'Housing',
    amountCents: 165000,
    spentCents: 165000,
    period: 'monthly',
    createdAt: new Date().toISOString(),
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    userId: mockUser.id,
    category: 'Groceries',
    amountCents: 50000,
    spentCents: 37850,
    period: 'monthly',
    createdAt: new Date().toISOString(),
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    userId: mockUser.id,
    category: 'Coffee',
    amountCents: 8000,
    spentCents: 5200,
    period: 'monthly',
    createdAt: new Date().toISOString(),
  },
  {
    id: '40000000-0000-0000-0000-000000000004',
    userId: mockUser.id,
    category: 'Entertainment',
    amountCents: 15000,
    spentCents: 14200,
    period: 'monthly',
    createdAt: new Date().toISOString(),
  },
  {
    id: '40000000-0000-0000-0000-000000000005',
    userId: mockUser.id,
    category: 'Utilities',
    amountCents: 15000,
    spentCents: 11250,
    period: 'monthly',
    createdAt: new Date().toISOString(),
  },
];

export const mockGoals: Goal[] = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    userId: mockUser.id,
    name: 'Emergency Reserve (6 Mo)',
    vaultAccountId: mockAccounts[1].id,
    targetAmountCents: 2500000,
    currentAmountCents: 1842050,
    createdAt: new Date().toISOString(),
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    userId: mockUser.id,
    name: 'Travel Reserve',
    vaultAccountId: mockAccounts[1].id,
    targetAmountCents: 800000,
    currentAmountCents: 520000,
    targetDate: '2027-04-15',
    createdAt: new Date().toISOString(),
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '60000000-0000-0000-0000-000000000001',
    userId: mockUser.id,
    type: 'rule_fired',
    title: 'Rule Executed: Coffee & Daily Round-Ups',
    message: 'Transferred $0.75 from Primary Checking to Reserve Savings.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
    metadata: { ruleType: 'round_up', amountCents: 75 },
  },
  {
    id: '60000000-0000-0000-0000-000000000002',
    userId: mockUser.id,
    type: 'recurring_detected',
    title: 'Subscription Confirmed: Netflix',
    message: 'Detected monthly recurring expense of $15.99. Next expected charge in 26 days.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    metadata: { merchant: 'Netflix', frequency: 'monthly' },
  },
  {
    id: '60000000-0000-0000-0000-000000000003',
    userId: mockUser.id,
    type: 'budget_alert',
    title: 'Budget Approaching Limit: Entertainment',
    message: 'Entertainment spending has reached 94% of your $150.00 monthly threshold.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    metadata: { category: 'Entertainment', percent: 94 },
  },
];

export const mockForecast: ForecastResponse = {
  currentNetWorthCents: 5474035, // ~$54,740.35
  simulatedRuns: 1000,
  recurringSummary: {
    monthlyFixedExpensesCents: 178898,
    monthlyFixedIncomeCents: 690000,
    variableMonthlyVelocityCents: 165000,
  },
  points: [
    { date: 'Month 0', baselineNetWorth: 54740, p10NetWorth: 54740, p50NetWorth: 54740, p90NetWorth: 54740 },
    { date: 'Month 1', baselineNetWorth: 58200, p10NetWorth: 57400, p50NetWorth: 58200, p90NetWorth: 59100 },
    { date: 'Month 2', baselineNetWorth: 61650, p10NetWorth: 60100, p50NetWorth: 61650, p90NetWorth: 63500 },
    { date: 'Month 3', baselineNetWorth: 65100, p10NetWorth: 62800, p50NetWorth: 65100, p90NetWorth: 67900 },
    { date: 'Month 4', baselineNetWorth: 68560, p10NetWorth: 65500, p50NetWorth: 68560, p90NetWorth: 72400 },
    { date: 'Month 5', baselineNetWorth: 72020, p10NetWorth: 68100, p50NetWorth: 72020, p90NetWorth: 76900 },
    { date: 'Month 6', baselineNetWorth: 75480, p10NetWorth: 70800, p50NetWorth: 75480, p90NetWorth: 81500 },
  ],
};

export const mockSpendingInsights: SpendingInsights = {
  period: 'Current Month',
  totalSpentCents: 182770,
  totalEarnedCents: 690000,
  netSavingsCents: 507230,
  monthOverMonthChangePercent: -4.2,
  byCategory: [
    { category: 'Housing', amountCents: 165000, percentage: 55 },
    { category: 'Groceries', amountCents: 37850, percentage: 18 },
    { category: 'Utilities', amountCents: 11250, percentage: 8 },
    { category: 'Coffee', amountCents: 5200, percentage: 4 },
    { category: 'Entertainment', amountCents: 14200, percentage: 7 },
    { category: 'Other', amountCents: 12000, percentage: 8 },
  ],
};

export const mockHistory = [
  { month: '2025-11', netWorthCents: 4120000, incomeCents: 690000, expenseCents: 210000 },
  { month: '2025-12', netWorthCents: 4580000, incomeCents: 740000, expenseCents: 240000 },
  { month: '2026-01', netWorthCents: 4890000, incomeCents: 690000, expenseCents: 195000 },
  { month: '2026-02', netWorthCents: 5180000, incomeCents: 690000, expenseCents: 180000 },
  { month: '2026-03', netWorthCents: 5474035, incomeCents: 690000, expenseCents: 182770 },
];

// ==========================================
// Client-Side Persistent Storage (localStorage)
// ==========================================

const CLIENT_STORAGE_KEY = 'vault_ledger_client_store_v2';

export interface ClientStoreState {
  user: typeof mockUser;
  accounts: Account[];
  transactions: TransactionView[];
  rules: Rule[];
  budgets: Budget[];
  goals: Goal[];
  notifications: Notification[];
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getInitialStore(): ClientStoreState {
  return {
    user: { ...mockUser },
    accounts: JSON.parse(JSON.stringify(mockAccounts)),
    transactions: JSON.parse(JSON.stringify(mockTransactions)),
    rules: JSON.parse(JSON.stringify(mockRules)),
    budgets: JSON.parse(JSON.stringify(mockBudgets)),
    goals: JSON.parse(JSON.stringify(mockGoals)),
    notifications: JSON.parse(JSON.stringify(mockNotifications)),
  };
}

function loadClientStore(): ClientStoreState {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(CLIENT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.accounts) && Array.isArray(parsed.transactions)) {
          return parsed;
        }
      }
    } catch {
      void 0;
    }
  }
  const initial = getInitialStore();
  saveClientStore(initial);
  return initial;
}

function saveClientStore(data: ClientStoreState): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(data));
    } catch {
      void 0;
    }
  }
}

// In-memory active mirror for client-side queries
let clientState: ClientStoreState = loadClientStore();

export function getClientStore(): ClientStoreState {
  return clientState;
}

export function resetMockStorage(): void {
  clientState = getInitialStore();
  saveClientStore(clientState);
}

function parseBody(options: RequestInit): any {
  if (!options.body) return {};
  if (typeof options.body === 'string') {
    try {
      return JSON.parse(options.body);
    } catch {
      return {};
    }
  }
  return options.body;
}

function computeClientNetWorth(): number {
  return clientState.accounts.reduce(
    (sum, a) => sum + (a.isArchived ? 0 : a.balanceCents),
    0
  );
}

function computeClientForecast(): ForecastResponse {
  const currentNetWorthCents = computeClientNetWorth();
  const baselineK = Math.round(currentNetWorthCents / 100);
  const monthlyFixedExpensesCents = 178898;
  const monthlyFixedIncomeCents = 690000;
  const variableMonthlyVelocityCents = 165000;
  const netMonthlyGrowth = Math.round(
    (monthlyFixedIncomeCents - monthlyFixedExpensesCents - variableMonthlyVelocityCents) / 100
  );

  const points = [
    { date: 'Month 0', baselineNetWorth: baselineK, p10NetWorth: baselineK, p50NetWorth: baselineK, p90NetWorth: baselineK },
  ];

  for (let i = 1; i <= 6; i++) {
    const base = baselineK + i * netMonthlyGrowth;
    points.push({
      date: `Month ${i}`,
      baselineNetWorth: base,
      p10NetWorth: base - i * 800,
      p50NetWorth: base,
      p90NetWorth: base + i * 900,
    });
  }

  return {
    currentNetWorthCents,
    simulatedRuns: 1000,
    recurringSummary: {
      monthlyFixedExpensesCents,
      monthlyFixedIncomeCents,
      variableMonthlyVelocityCents,
    },
    points,
  };
}

function computeClientSpending(): SpendingInsights {
  const expenses = clientState.transactions.filter((t) => t.amountCents < 0);
  const totalSpentCents = expenses.reduce((sum, t) => sum + Math.abs(t.amountCents), 0);
  const incomes = clientState.transactions.filter((t) => t.amountCents > 0);
  const totalEarnedCents = incomes.reduce((sum, t) => sum + t.amountCents, 0) || 690000;
  const netSavingsCents = totalEarnedCents - totalSpentCents;

  const categoryMap = new Map<string, number>();
  for (const t of expenses) {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + Math.abs(t.amountCents));
  }

  const byCategory = Array.from(categoryMap.entries())
    .map(([category, amountCents]) => ({
      category,
      amountCents,
      percentage: totalSpentCents > 0 ? Math.round((amountCents / totalSpentCents) * 100) : 0,
    }))
    .sort((a, b) => b.amountCents - a.amountCents);

  return {
    period: 'Current Month',
    totalSpentCents,
    totalEarnedCents,
    netSavingsCents,
    monthOverMonthChangePercent: -4.2,
    byCategory:
      byCategory.length > 0
        ? byCategory
        : [
            { category: 'Housing', amountCents: 165000, percentage: 55 },
            { category: 'Groceries', amountCents: 37850, percentage: 18 },
            { category: 'Utilities', amountCents: 11250, percentage: 8 },
            { category: 'Coffee', amountCents: 5200, percentage: 4 },
            { category: 'Entertainment', amountCents: 14200, percentage: 7 },
          ],
  };
}

export function getMockResponse<T>(endpoint: string, options: RequestInit = {}): T {
  const method = (options.method || 'GET').toUpperCase();
  const [reqPath, queryString] = endpoint.split('?');
  const params = new URLSearchParams(queryString || '');
  const body = parseBody(options);

  // ----------------------------------------
  // Auth
  // ----------------------------------------
  if (reqPath.startsWith('/api/auth/register') && method === 'POST') {
    clientState.user = {
      id: generateUuid(),
      email: body.email || 'user@vaultledger.local',
      firstName: body.firstName || 'User',
      lastName: body.lastName || '',
      isDemo: false,
      createdAt: new Date().toISOString(),
    };
    saveClientStore(clientState);
    const token = `access-${clientState.user.id}`;
    const refresh = `refresh-${clientState.user.id}`;
    return {
      user: clientState.user,
      accessToken: token,
      refreshToken: refresh,
      tokens: { accessToken: token, refreshToken: refresh },
    } as unknown as T;
  }

  if (reqPath.startsWith('/api/auth/demo') || reqPath.startsWith('/api/auth/login')) {
    return {
      user: clientState.user,
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
      tokens: { accessToken: 'demo-access-token', refreshToken: 'demo-refresh-token' },
    } as unknown as T;
  }

  if (reqPath.startsWith('/api/auth/me')) {
    return clientState.user as unknown as T;
  }

  // ----------------------------------------
  // Accounts
  // ----------------------------------------
  if (reqPath === '/api/accounts') {
    if (method === 'GET') {
      return clientState.accounts.filter((a) => !a.isArchived) as unknown as T;
    }
    if (method === 'POST') {
      const newAcc: Account = {
        id: generateUuid(),
        userId: clientState.user.id,
        name: body.name || 'New Vault',
        type: body.type || 'vault',
        currency: body.currency || 'USD',
        balanceCents: Number(body.balanceCents) || 0,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      clientState.accounts.push(newAcc);
      saveClientStore(clientState);
      return newAcc as unknown as T;
    }
  }

  const accountDeleteMatch = reqPath.match(/^\/api\/accounts\/([^/]+)$/);
  if (accountDeleteMatch && method === 'DELETE') {
    const id = accountDeleteMatch[1];
    const idx = clientState.accounts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      clientState.accounts.splice(idx, 1);
      saveClientStore(clientState);
    }
    return { success: true } as unknown as T;
  }

  // ----------------------------------------
  // Transactions
  // ----------------------------------------
  if (reqPath === '/api/transactions') {
    if (method === 'GET') {
      const category = params.get('category');
      const search = params.get('search');
      const limit = parseInt(params.get('limit') || '50', 10);
      const offset = parseInt(params.get('offset') || '0', 10);

      let filtered = [...clientState.transactions];
      if (category && category !== 'All') {
        filtered = filtered.filter(
          (t) => t.category.toLowerCase() === category.toLowerCase()
        );
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.description.toLowerCase().includes(s) ||
            (t.merchant && t.merchant.toLowerCase().includes(s))
        );
      }

      filtered.sort(
        (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      );
      const total = filtered.length;
      const paged = filtered.slice(offset, offset + limit);

      return {
        transactions: paged,
        total,
      } as unknown as T;
    }

    if (method === 'POST') {
      let acc = clientState.accounts.find((a) => a.id === body.accountId);
      if (!acc && clientState.accounts.length > 0) acc = clientState.accounts[0];
      const amountCents = Number(body.amountCents) || 0;
      if (acc) {
        acc.balanceCents += amountCents;
        acc.updatedAt = new Date().toISOString();
      }

      const newTx: TransactionView = {
        id: generateUuid(),
        occurredAt: body.occurredAt || new Date().toISOString(),
        description:
          body.description ||
          (body.merchant ? `Payment to ${body.merchant}` : 'Transaction'),
        merchant: body.merchant || null,
        category: body.category || 'General',
        amountCents,
        source: body.source || 'manual',
        accountId: acc ? acc.id : clientState.accounts[0]?.id || generateUuid(),
        accountName: acc ? acc.name : 'Primary Checking',
        isRoundUp: Boolean(body.isRoundUp),
        externalId: body.externalId || null,
      };

      clientState.transactions.unshift(newTx);
      saveClientStore(clientState);
      return newTx as unknown as T;
    }
  }

  const txCategoryMatch = reqPath.match(/^\/api\/transactions\/([^/]+)\/category$/);
  if (txCategoryMatch && method === 'PATCH') {
    const id = txCategoryMatch[1];
    const tx = clientState.transactions.find((t) => t.id === id);
    if (tx) {
      tx.category = body.category || tx.category;
      saveClientStore(clientState);
      return { success: true, categoryId: tx.category, ...tx } as unknown as T;
    }
    return { success: false, error: 'Transaction not found' } as unknown as T;
  }

  const txDeleteMatch = reqPath.match(/^\/api\/transactions\/([^/]+)$/);
  if (txDeleteMatch && method === 'DELETE') {
    const id = txDeleteMatch[1];
    const idx = clientState.transactions.findIndex((t) => t.id === id);
    if (idx !== -1) {
      const [tx] = clientState.transactions.splice(idx, 1);
      const acc = clientState.accounts.find((a) => a.id === tx.accountId);
      if (acc) {
        acc.balanceCents -= tx.amountCents;
        acc.updatedAt = new Date().toISOString();
      }
      saveClientStore(clientState);
    }
    return { success: true } as unknown as T;
  }

  // ----------------------------------------
  // Rules
  // ----------------------------------------
  if (reqPath === '/api/rules') {
    if (method === 'GET') {
      return clientState.rules as unknown as T;
    }
    if (method === 'POST') {
      const newRule: Rule = {
        id: generateUuid(),
        userId: clientState.user.id,
        name: body.name || 'Automation Rule',
        type: body.type || 'round_up',
        enabled: body.enabled !== undefined ? Boolean(body.enabled) : true,
        config: body.config || {
          destinationAccountId: clientState.accounts[1]?.id || clientState.accounts[0]?.id,
          multiplier: 1,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any;
      clientState.rules.push(newRule);
      saveClientStore(clientState);
      return newRule as unknown as T;
    }
  }

  const ruleToggleMatch = reqPath.match(/^\/api\/rules\/([^/]+)\/toggle$/);
  if (ruleToggleMatch && method === 'PATCH') {
    const id = ruleToggleMatch[1];
    const rule = clientState.rules.find((r) => r.id === id);
    if (rule) {
      rule.enabled = body.enabled !== undefined ? Boolean(body.enabled) : !rule.enabled;
      rule.updatedAt = new Date().toISOString();
      saveClientStore(clientState);
      return rule as unknown as T;
    }
    return { error: 'Rule not found' } as unknown as T;
  }

  const ruleSingleMatch = reqPath.match(/^\/api\/rules\/([^/]+)$/);
  if (ruleSingleMatch) {
    const id = ruleSingleMatch[1];
    if (method === 'PATCH') {
      const rule = clientState.rules.find((r) => r.id === id);
      if (rule) {
        if (body.name) rule.name = body.name;
        if (body.config) rule.config = { ...rule.config, ...body.config };
        if (body.enabled !== undefined) rule.enabled = Boolean(body.enabled);
        rule.updatedAt = new Date().toISOString();
        saveClientStore(clientState);
        return rule as unknown as T;
      }
      return { error: 'Rule not found' } as unknown as T;
    }
    if (method === 'DELETE') {
      const idx = clientState.rules.findIndex((r) => r.id === id);
      if (idx !== -1) {
        clientState.rules.splice(idx, 1);
        saveClientStore(clientState);
      }
      return { success: true } as unknown as T;
    }
  }

  // ----------------------------------------
  // Budgets
  // ----------------------------------------
  if (reqPath === '/api/budgets') {
    if (method === 'GET') {
      const budgetsWithSpent = clientState.budgets.map((b) => {
        const matchingTxs = clientState.transactions.filter(
          (t) => t.category.toLowerCase() === b.category.toLowerCase() && t.amountCents < 0
        );
        const spent = matchingTxs.reduce((sum, t) => sum + Math.abs(t.amountCents), 0);
        return {
          ...b,
          spentCents: spent > 0 ? spent : b.spentCents || 0,
        };
      });
      return budgetsWithSpent as unknown as T;
    }

    if (method === 'PUT') {
      let budget = clientState.budgets.find(
        (b) => b.category.toLowerCase() === (body.category || '').toLowerCase()
      );
      if (budget) {
        budget.amountCents = Number(body.amountCents) || budget.amountCents;
        if (body.period) budget.period = body.period;
      } else {
        budget = {
          id: generateUuid(),
          userId: clientState.user.id,
          category: body.category || 'General',
          amountCents: Number(body.amountCents) || 50000,
          spentCents: 0,
          period: body.period || 'monthly',
          createdAt: new Date().toISOString(),
        };
        clientState.budgets.push(budget);
      }
      saveClientStore(clientState);
      return budget as unknown as T;
    }
  }

  const budgetDeleteMatch = reqPath.match(/^\/api\/budgets\/([^/]+)$/);
  if (budgetDeleteMatch && method === 'DELETE') {
    const id = budgetDeleteMatch[1];
    const idx = clientState.budgets.findIndex((b) => b.id === id);
    if (idx !== -1) {
      clientState.budgets.splice(idx, 1);
      saveClientStore(clientState);
    }
    return { success: true } as unknown as T;
  }

  // ----------------------------------------
  // Goals
  // ----------------------------------------
  if (reqPath === '/api/goals') {
    if (method === 'GET') {
      return clientState.goals as unknown as T;
    }
    if (method === 'POST') {
      const newGoal: Goal = {
        id: generateUuid(),
        userId: clientState.user.id,
        name: body.name || 'New Goal',
        vaultAccountId:
          body.vaultAccountId || clientState.accounts[1]?.id || clientState.accounts[0]?.id,
        targetAmountCents: Number(body.targetAmountCents) || 100000,
        currentAmountCents: Number(body.currentAmountCents) || 0,
        targetDate: body.targetDate || null,
        createdAt: new Date().toISOString(),
      };
      clientState.goals.push(newGoal);
      saveClientStore(clientState);
      return newGoal as unknown as T;
    }
  }

  const goalSingleMatch = reqPath.match(/^\/api\/goals\/([^/]+)$/);
  if (goalSingleMatch) {
    const id = goalSingleMatch[1];
    if (method === 'PATCH') {
      const goal = clientState.goals.find((g) => g.id === id);
      if (goal) {
        if (body.name) goal.name = body.name;
        if (body.targetAmountCents !== undefined) {
          goal.targetAmountCents = Number(body.targetAmountCents);
        }
        if (body.targetDate !== undefined) goal.targetDate = body.targetDate;
        if (body.currentAmountCents !== undefined) {
          goal.currentAmountCents = Number(body.currentAmountCents);
        }
        if (body.contributeAmountCents) {
          goal.currentAmountCents += Number(body.contributeAmountCents);
        }
        saveClientStore(clientState);
        return goal as unknown as T;
      }
      return { error: 'Goal not found' } as unknown as T;
    }
    if (method === 'DELETE') {
      const idx = clientState.goals.findIndex((g) => g.id === id);
      if (idx !== -1) {
        clientState.goals.splice(idx, 1);
        saveClientStore(clientState);
      }
      return { success: true } as unknown as T;
    }
  }

  // ----------------------------------------
  // Notifications
  // ----------------------------------------
  if (reqPath === '/api/notifications') {
    if (method === 'GET') {
      const sorted = [...clientState.notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return sorted as unknown as T;
    }
    if (method === 'POST') {
      const newNotif: Notification = {
        id: generateUuid(),
        userId: clientState.user.id,
        type: body.type || 'system',
        title: body.title || 'Audit Log Event',
        message: body.message || 'System activity recorded.',
        read: false,
        metadata: body.metadata,
        createdAt: new Date().toISOString(),
      };
      clientState.notifications.unshift(newNotif);
      saveClientStore(clientState);
      return newNotif as unknown as T;
    }
  }

  if (reqPath === '/api/notifications/read-all' && method === 'POST') {
    clientState.notifications.forEach((n) => {
      n.read = true;
    });
    saveClientStore(clientState);
    return { success: true } as unknown as T;
  }

  const notifReadMatch = reqPath.match(/^\/api\/notifications\/([^/]+)\/read$/);
  if (notifReadMatch && method === 'PATCH') {
    const id = notifReadMatch[1];
    const notif = clientState.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      saveClientStore(clientState);
      return { success: true, ...notif } as unknown as T;
    }
    return { error: 'Notification not found' } as unknown as T;
  }

  const notifDeleteMatch = reqPath.match(/^\/api\/notifications\/([^/]+)$/);
  if (notifDeleteMatch && method === 'DELETE') {
    const id = notifDeleteMatch[1];
    const idx = clientState.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      clientState.notifications.splice(idx, 1);
      saveClientStore(clientState);
    }
    return { success: true } as unknown as T;
  }

  // ----------------------------------------
  // Insights
  // ----------------------------------------
  if (reqPath.startsWith('/api/insights/history')) {
    return mockHistory as unknown as T;
  }

  if (reqPath.startsWith('/api/insights/forecast')) {
    return computeClientForecast() as unknown as T;
  }

  if (reqPath.startsWith('/api/insights/spending')) {
    return computeClientSpending() as unknown as T;
  }

  // ----------------------------------------
  // Sync
  // ----------------------------------------
  if (reqPath.startsWith('/api/sync')) {
    return { status: 'synced', insertedCount: 128 } as unknown as T;
  }

  return { success: true } as unknown as T;
}
