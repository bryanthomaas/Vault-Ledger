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
    mask: '4092',
    isPrimary: true,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    userId: mockUser.id,
    name: 'High-Yield Reserve Vault',
    type: 'vault',
    balanceCents: 1842050, // $18,420.50
    currency: 'USD',
    mask: '8821',
    isPrimary: false,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    userId: mockUser.id,
    name: 'Growth Index Portfolio',
    type: 'investment',
    balanceCents: 3215000, // $32,150.00
    currency: 'USD',
    mask: '9912',
    isPrimary: false,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    userId: mockUser.id,
    name: 'Sapphire Preferred Card',
    type: 'credit',
    balanceCents: -68040, // -$680.40
    currency: 'USD',
    mask: '3104',
    isPrimary: false,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
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
    source: 'provider_sync',
    accountId: mockAccounts[0].id,
    accountName: mockAccounts[0].name,
    isRoundUp: false,
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    occurredAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    description: 'Round-Up Transfer to High-Yield Reserve Vault',
    merchant: null,
    category: 'Savings',
    amountCents: -75,
    source: 'rule_execution',
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
    source: 'provider_sync',
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
    source: 'provider_sync',
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
    source: 'provider_sync',
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
    source: 'provider_sync',
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
    source: 'provider_sync',
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
    source: 'provider_sync',
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
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    userId: mockUser.id,
    name: 'Checking Liquidity Sweep',
    type: 'sweep',
    enabled: true,
    config: {
      destinationAccountId: mockAccounts[1].id,
      sourceAccountId: mockAccounts[0].id,
      thresholdCents: 500000,
    },
    createdAt: new Date().toISOString(),
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
    name: 'Emergency Reserve Vault (6 Mo)',
    vaultAccountId: mockAccounts[1].id,
    targetAmountCents: 2500000,
    currentAmountCents: 1842050,
    createdAt: new Date().toISOString(),
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    userId: mockUser.id,
    name: 'Highland Alpine Expedition',
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
    message: 'Transferred $0.75 spare change from Primary Checking to High-Yield Reserve Vault.',
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

export function getMockResponse<T>(endpoint: string, options: RequestInit = {}): T {
  const method = (options.method || 'GET').toUpperCase();

  if (endpoint.includes('/api/auth/me')) {
    return mockUser as unknown as T;
  }

  if (endpoint.includes('/api/auth/demo') || endpoint.includes('/api/auth/login')) {
    return {
      user: mockUser,
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
    } as unknown as T;
  }

  if (endpoint.includes('/api/accounts')) {
    return mockAccounts as unknown as T;
  }

  if (endpoint.includes('/api/transactions')) {
    return {
      transactions: mockTransactions,
      total: mockTransactions.length,
    } as unknown as T;
  }

  if (endpoint.includes('/api/rules')) {
    return mockRules as unknown as T;
  }

  if (endpoint.includes('/api/budgets')) {
    return mockBudgets as unknown as T;
  }

  if (endpoint.includes('/api/goals')) {
    return mockGoals as unknown as T;
  }

  if (endpoint.includes('/api/notifications')) {
    return mockNotifications as unknown as T;
  }

  if (endpoint.includes('/api/insights/history')) {
    return mockHistory as unknown as T;
  }

  if (endpoint.includes('/api/insights/forecast')) {
    return mockForecast as unknown as T;
  }

  if (endpoint.includes('/api/insights/spending')) {
    return mockSpendingInsights as unknown as T;
  }

  if (endpoint.includes('/api/sync')) {
    return { status: 'synced', insertedCount: 128 } as unknown as T;
  }

  return { success: true } as unknown as T;
}
