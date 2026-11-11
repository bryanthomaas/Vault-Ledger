import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const PORT = parseInt(process.env.PORT || '8199', 10);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST = path.resolve(ROOT_DIR, 'apps/mobile/dist');
const DATA_DIR = path.resolve(ROOT_DIR, 'data');
const STORAGE_FILE = path.join(DATA_DIR, 'vault_storage.json');

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.log('Building web bundle into apps/mobile/dist...');
  execSync('npm run build:web -w @vault-ledger/mobile', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

// ==========================================
// Embedded Persistent Storage Engine
// ==========================================

export interface VaultUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VaultAccount {
  id: string;
  userId: string;
  name: string;
  type: 'depository' | 'vault' | 'investment' | 'credit' | 'counterparty';
  balanceCents: number;
  currency: string;
  mask?: string;
  isPrimary?: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VaultTransaction {
  id: string;
  userId: string;
  occurredAt: string;
  description: string;
  merchant?: string | null;
  category: string;
  amountCents: number;
  source: 'provider' | 'rule' | 'manual' | 'seed';
  accountId: string;
  accountName: string;
  isRoundUp: boolean;
  externalId?: string | null;
}

export interface VaultRule {
  id: string;
  userId: string;
  name: string;
  type: 'round_up' | 'percent_of_income' | 'sweep';
  enabled: boolean;
  config: any;
  createdAt: string;
  updatedAt: string;
}

export interface VaultBudget {
  id: string;
  userId: string;
  category: string;
  amountCents: number;
  spentCents?: number;
  period: 'monthly';
  createdAt: string;
}

export interface VaultGoal {
  id: string;
  userId: string;
  name: string;
  vaultAccountId: string;
  targetAmountCents: number;
  currentAmountCents: number;
  targetDate?: string | null;
  createdAt: string;
}

export interface VaultNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
}

export interface VaultStorageData {
  users: VaultUser[];
  accounts: VaultAccount[];
  transactions: VaultTransaction[];
  rules: VaultRule[];
  budgets: VaultBudget[];
  goals: VaultGoal[];
  notifications: VaultNotification[];
}

function createInitialSeedData(): VaultStorageData {
  const demoUserId = '00000000-0000-0000-0000-000000000001';
  const now = new Date().toISOString();
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

  const user: VaultUser = {
    id: demoUserId,
    email: 'demo@vaultledger.local',
    firstName: 'Bryan',
    lastName: 'Thomas',
    isDemo: true,
    createdAt: now,
    updatedAt: now,
  };

  const accounts: VaultAccount[] = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      userId: demoUserId,
      name: 'Primary Checking',
      type: 'depository',
      balanceCents: 485025, // $4,850.25
      currency: 'USD',
      mask: '4092',
      isPrimary: true,
      isArchived: false,
      createdAt: oneYearAgo,
      updatedAt: oneYearAgo,
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      userId: demoUserId,
      name: 'High-Yield Reserve Vault',
      type: 'vault',
      balanceCents: 1842050, // $18,420.50
      currency: 'USD',
      mask: '8821',
      isPrimary: false,
      isArchived: false,
      createdAt: oneYearAgo,
      updatedAt: oneYearAgo,
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      userId: demoUserId,
      name: 'Growth Index Portfolio',
      type: 'investment',
      balanceCents: 3215000, // $32,150.00
      currency: 'USD',
      mask: '9912',
      isPrimary: false,
      isArchived: false,
      createdAt: oneYearAgo,
      updatedAt: oneYearAgo,
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      userId: demoUserId,
      name: 'Sapphire Preferred Card',
      type: 'credit',
      balanceCents: -68040, // -$680.40
      currency: 'USD',
      mask: '3104',
      isPrimary: false,
      isArchived: false,
      createdAt: oneYearAgo,
      updatedAt: oneYearAgo,
    },
  ];

  const transactions: VaultTransaction[] = [
    {
      id: '20000000-0000-0000-0000-000000000001',
      userId: demoUserId,
      occurredAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      description: 'Morning Espresso at Blue Bottle Coffee',
      merchant: 'Blue Bottle Coffee',
      category: 'Coffee',
      amountCents: -525,
      source: 'provider',
      accountId: accounts[0].id,
      accountName: accounts[0].name,
      isRoundUp: false,
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      userId: demoUserId,
      occurredAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      description: 'Round-Up Transfer to High-Yield Reserve Vault',
      merchant: 'Reserve Round-Up',
      category: 'Savings Transfer',
      amountCents: -75,
      source: 'rule',
      accountId: accounts[0].id,
      accountName: accounts[0].name,
      isRoundUp: true,
    },
    {
      id: '20000000-0000-0000-0000-000000000003',
      userId: demoUserId,
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      description: "Weekly Produce & Groceries at Trader Joe's",
      merchant: "Trader Joe's",
      category: 'Groceries',
      amountCents: -9420,
      source: 'provider',
      accountId: accounts[0].id,
      accountName: accounts[0].name,
      isRoundUp: false,
    },
    {
      id: '20000000-0000-0000-0000-000000000004',
      userId: demoUserId,
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
      description: 'Direct Deposit - Tech Corp Payroll',
      merchant: 'Tech Corp Payroll',
      category: 'Salary',
      amountCents: 345000,
      source: 'provider',
      accountId: accounts[0].id,
      accountName: accounts[0].name,
      isRoundUp: false,
    },
    {
      id: '20000000-0000-0000-0000-000000000005',
      userId: demoUserId,
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
      description: 'Lunch Bowl at Sweetgreen',
      merchant: 'Sweetgreen',
      category: 'Dining',
      amountCents: -1845,
      source: 'provider',
      accountId: accounts[3].id,
      accountName: accounts[3].name,
      isRoundUp: false,
    },
    {
      id: '20000000-0000-0000-0000-000000000006',
      userId: demoUserId,
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 64).toISOString(),
      description: 'Monthly Apartment Lease - Avalon Properties',
      merchant: 'Avalon Properties',
      category: 'Housing',
      amountCents: -165000,
      source: 'provider',
      accountId: accounts[0].id,
      accountName: accounts[0].name,
      isRoundUp: false,
    },
    {
      id: '20000000-0000-0000-0000-000000000007',
      userId: demoUserId,
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 88).toISOString(),
      description: 'Electric & Gas Service - Con Edison',
      merchant: 'Con Edison',
      category: 'Utilities',
      amountCents: -11250,
      source: 'provider',
      accountId: accounts[0].id,
      accountName: accounts[0].name,
      isRoundUp: false,
    },
    {
      id: '20000000-0000-0000-0000-000000000008',
      userId: demoUserId,
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 110).toISOString(),
      description: 'Organic Market Haul at Whole Foods',
      merchant: 'Whole Foods Market',
      category: 'Groceries',
      amountCents: -12840,
      source: 'provider',
      accountId: accounts[3].id,
      accountName: accounts[3].name,
      isRoundUp: false,
    },
    {
      id: '20000000-0000-0000-0000-000000000009',
      userId: demoUserId,
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 132).toISOString(),
      description: 'Airport Ride - Uber Technologies',
      merchant: 'Uber Technologies',
      category: 'Transportation',
      amountCents: -4280,
      source: 'provider',
      accountId: accounts[3].id,
      accountName: accounts[3].name,
      isRoundUp: false,
    },
    {
      id: '20000000-0000-0000-0000-000000000010',
      userId: demoUserId,
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 156).toISOString(),
      description: 'Netflix Standard HD Plan',
      merchant: 'Netflix',
      category: 'Subscriptions',
      amountCents: -1599,
      source: 'provider',
      accountId: accounts[3].id,
      accountName: accounts[3].name,
      isRoundUp: false,
    },
    {
      id: '20000000-0000-0000-0000-000000000011',
      userId: demoUserId,
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 180).toISOString(),
      description: 'Spotify Premium Individual',
      merchant: 'Spotify',
      category: 'Subscriptions',
      amountCents: -1099,
      source: 'provider',
      accountId: accounts[3].id,
      accountName: accounts[3].name,
      isRoundUp: false,
    },
    {
      id: '20000000-0000-0000-0000-000000000012',
      userId: demoUserId,
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 204).toISOString(),
      description: 'Fiber Internet - Verizon Fios',
      merchant: 'Verizon Fios',
      category: 'Utilities',
      amountCents: -7999,
      source: 'provider',
      accountId: accounts[0].id,
      accountName: accounts[0].name,
      isRoundUp: false,
    },
    {
      id: '20000000-0000-0000-0000-000000000013',
      userId: demoUserId,
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 228).toISOString(),
      description: 'Automated Paycheck Allocation (15%)',
      merchant: 'High-Yield Reserve Vault',
      category: 'Savings Transfer',
      amountCents: -51750,
      source: 'rule',
      accountId: accounts[0].id,
      accountName: accounts[0].name,
      isRoundUp: false,
    },
    {
      id: '20000000-0000-0000-0000-000000000014',
      userId: demoUserId,
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 252).toISOString(),
      description: 'Dinner at Osteria Morini',
      merchant: 'Osteria Morini',
      category: 'Dining',
      amountCents: -8650,
      source: 'provider',
      accountId: accounts[3].id,
      accountName: accounts[3].name,
      isRoundUp: false,
    },
    {
      id: '20000000-0000-0000-0000-000000000015',
      userId: demoUserId,
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 276).toISOString(),
      description: 'Monthly Club Membership - Equinox',
      merchant: 'Equinox Fitness',
      category: 'Entertainment',
      amountCents: -21500,
      source: 'provider',
      accountId: accounts[3].id,
      accountName: accounts[3].name,
      isRoundUp: false,
    },
    {
      id: '20000000-0000-0000-0000-000000000016',
      userId: demoUserId,
      occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 300).toISOString(),
      description: 'Cold Brew at Stumptown Coffee',
      merchant: 'Stumptown Coffee',
      category: 'Coffee',
      amountCents: -475,
      source: 'provider',
      accountId: accounts[0].id,
      accountName: accounts[0].name,
      isRoundUp: false,
    },
  ];

  const rules: VaultRule[] = [
    {
      id: '30000000-0000-0000-0000-000000000001',
      userId: demoUserId,
      name: 'Coffee & Daily Round-Ups',
      type: 'round_up',
      enabled: true,
      config: {
        destinationAccountId: accounts[1].id,
        multiplier: 1,
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      userId: demoUserId,
      name: 'Paycheck Savings Allocation',
      type: 'percent_of_income',
      enabled: true,
      config: {
        destinationAccountId: accounts[1].id,
        percentage: 15,
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: '30000000-0000-0000-0000-000000000003',
      userId: demoUserId,
      name: 'Operating Cash Balance Sweep',
      type: 'sweep',
      enabled: true,
      config: {
        destinationAccountId: accounts[1].id,
        sourceAccountId: accounts[0].id,
        thresholdCents: 500000,
      },
      createdAt: now,
      updatedAt: now,
    },
  ];

  const budgets: VaultBudget[] = [
    {
      id: '40000000-0000-0000-0000-000000000001',
      userId: demoUserId,
      category: 'Housing',
      amountCents: 180000,
      spentCents: 165000,
      period: 'monthly',
      createdAt: now,
    },
    {
      id: '40000000-0000-0000-0000-000000000002',
      userId: demoUserId,
      category: 'Groceries',
      amountCents: 50000,
      spentCents: 22260,
      period: 'monthly',
      createdAt: now,
    },
    {
      id: '40000000-0000-0000-0000-000000000003',
      userId: demoUserId,
      category: 'Dining',
      amountCents: 30000,
      spentCents: 10495,
      period: 'monthly',
      createdAt: now,
    },
    {
      id: '40000000-0000-0000-0000-000000000004',
      userId: demoUserId,
      category: 'Entertainment',
      amountCents: 25000,
      spentCents: 21500,
      period: 'monthly',
      createdAt: now,
    },
    {
      id: '40000000-0000-0000-0000-000000000005',
      userId: demoUserId,
      category: 'Utilities',
      amountCents: 22000,
      spentCents: 19249,
      period: 'monthly',
      createdAt: now,
    },
  ];

  const goals: VaultGoal[] = [
    {
      id: '50000000-0000-0000-0000-000000000001',
      userId: demoUserId,
      name: 'Emergency Reserve (6 Mo)',
      vaultAccountId: accounts[1].id,
      targetAmountCents: 2500000,
      currentAmountCents: 1842050,
      createdAt: now,
    },
    {
      id: '50000000-0000-0000-0000-000000000002',
      userId: demoUserId,
      name: 'Travel Reserve',
      vaultAccountId: accounts[1].id,
      targetAmountCents: 800000,
      currentAmountCents: 520000,
      targetDate: '2027-04-15',
      createdAt: now,
    },
  ];

  const notifications: VaultNotification[] = [
    {
      id: '60000000-0000-0000-0000-000000000001',
      userId: demoUserId,
      type: 'rule_fired',
      title: 'Rule Executed: Coffee & Daily Round-Ups',
      message: 'Transferred $0.75 from Primary Checking to High-Yield Reserve Vault.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
      metadata: { ruleType: 'round_up', amountCents: 75 },
    },
    {
      id: '60000000-0000-0000-0000-000000000002',
      userId: demoUserId,
      type: 'recurring_detected',
      title: 'Subscription Confirmed: Netflix',
      message: 'Detected monthly recurring expense of $15.99. Next expected charge in 26 days.',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      metadata: { merchant: 'Netflix', frequency: 'monthly' },
    },
    {
      id: '60000000-0000-0000-0000-000000000003',
      userId: demoUserId,
      type: 'budget_alert',
      title: 'Budget Approaching Limit: Entertainment',
      message: 'Entertainment spending has reached 94% of your $150.00 monthly threshold.',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      metadata: { category: 'Entertainment', percent: 94 },
    },
  ];

  return {
    users: [user],
    accounts,
    transactions,
    rules,
    budgets,
    goals,
    notifications,
  };
}

function loadStorage(): VaultStorageData {
  if (fs.existsSync(STORAGE_FILE)) {
    try {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.accounts) && Array.isArray(data.transactions)) {
        return data;
      }
    } catch (err) {
      console.warn('Corrupted storage file detected, restoring initial demonstration data', err);
    }
  }

  const initial = createInitialSeedData();
  saveStorage(initial);
  return initial;
}

function saveStorage(data: VaultStorageData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const tmpFile = `${STORAGE_FILE}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');

  try {
    fs.renameSync(tmpFile, STORAGE_FILE);
  } catch (err: any) {
    if (err.code === 'EEXIST' || err.code === 'EPERM') {
      fs.copyFileSync(tmpFile, STORAGE_FILE);
      try {
        fs.unlinkSync(tmpFile);
      } catch {
        void 0;
      }
    } else {
      throw err;
    }
  }
}

// Active in-memory storage synced with disk
const storage = loadStorage();

// Helper to parse JSON body from request
function readBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve(data);
      }
    });
  });
}

function sendJson(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  });
  res.end(JSON.stringify(data));
}

// Compute dynamic insights
function computeNetWorth(): number {
  return storage.accounts.reduce((sum, a) => sum + (a.isArchived ? 0 : a.balanceCents), 0);
}

function computeForecast() {
  const currentNetWorthCents = computeNetWorth();
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

function computeSpending() {
  const expenses = storage.transactions.filter((t) => t.amountCents < 0);
  const totalSpentCents = expenses.reduce((sum, t) => sum + Math.abs(t.amountCents), 0);
  const incomes = storage.transactions.filter((t) => t.amountCents > 0);
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

function computeHistory() {
  const netWorth = computeNetWorth();
  const expenses = storage.transactions.filter((t) => t.amountCents < 0);
  const totalSpentCents = expenses.reduce((sum, t) => sum + Math.abs(t.amountCents), 0);
  const incomes = storage.transactions.filter((t) => t.amountCents > 0);
  const totalEarnedCents = incomes.reduce((sum, t) => sum + t.amountCents, 0) || 690000;

  return [
    { month: '2025-04', netWorthCents: Math.round(netWorth * 0.72), incomeCents: 690000, expenseCents: 245000 },
    { month: '2025-05', netWorthCents: Math.round(netWorth * 0.76), incomeCents: 690000, expenseCents: 215000 },
    { month: '2025-06', netWorthCents: Math.round(netWorth * 0.74), incomeCents: 690000, expenseCents: 295000 },
    { month: '2025-07', netWorthCents: Math.round(netWorth * 0.80), incomeCents: 720000, expenseCents: 205000 },
    { month: '2025-08', netWorthCents: Math.round(netWorth * 0.85), incomeCents: 690000, expenseCents: 190000 },
    { month: '2025-09', netWorthCents: Math.round(netWorth * 0.82), incomeCents: 690000, expenseCents: 265000 },
    { month: '2025-10', netWorthCents: Math.round(netWorth * 0.88), incomeCents: 750000, expenseCents: 198000 },
    { month: '2025-11', netWorthCents: Math.round(netWorth * 0.91), incomeCents: 690000, expenseCents: 210000 },
    { month: '2025-12', netWorthCents: Math.round(netWorth * 0.89), incomeCents: 740000, expenseCents: 280000 },
    { month: '2026-01', netWorthCents: Math.round(netWorth * 0.95), incomeCents: 690000, expenseCents: 195000 },
    { month: '2026-02', netWorthCents: Math.round(netWorth * 0.97), incomeCents: 690000, expenseCents: 180000 },
    { month: '2026-03', netWorthCents: netWorth, incomeCents: totalEarnedCents, expenseCents: totalSpentCents },
  ];
}

// ==========================================
// HTTP Server & Router
// ==========================================

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const reqPath = parsedUrl.pathname;
  const method = (req.method || 'GET').toUpperCase();

  // Handle /api/* requests with persistent storage
  if (reqPath.startsWith('/api/')) {
    // ----------------------------------------
    // Authentication Endpoints
    // ----------------------------------------
    if (reqPath === '/api/auth/register' && method === 'POST') {
      const body = await readBody(req);
      const newUser: VaultUser = {
        id: crypto.randomUUID(),
        email: body.email || 'user@vaultledger.local',
        firstName: body.firstName || 'User',
        lastName: body.lastName || '',
        isDemo: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.users.push(newUser);
      saveStorage(storage);
      const token = `token-${newUser.id}`;
      const refresh = `refresh-${newUser.id}`;
      sendJson(res, 200, {
        user: newUser,
        accessToken: token,
        refreshToken: refresh,
        tokens: { accessToken: token, refreshToken: refresh },
      });
      return;
    }

    if (reqPath === '/api/auth/login' && method === 'POST') {
      const body = await readBody(req);
      const user =
        storage.users.find(
          (u) => u.email.toLowerCase() === (body.email || '').toLowerCase()
        ) || storage.users[0];
      const token = `token-${user.id}`;
      const refresh = `refresh-${user.id}`;
      sendJson(res, 200, {
        user,
        accessToken: token,
        refreshToken: refresh,
        tokens: { accessToken: token, refreshToken: refresh },
      });
      return;
    }

    if (reqPath === '/api/auth/demo' && method === 'POST') {
      const user = storage.users.find((u) => u.isDemo) || storage.users[0];
      sendJson(res, 200, {
        user,
        accessToken: 'demo-token',
        refreshToken: 'demo-refresh',
        tokens: { accessToken: 'demo-token', refreshToken: 'demo-refresh' },
      });
      return;
    }

    if (reqPath === '/api/auth/me' && method === 'GET') {
      const user = storage.users[0];
      sendJson(res, 200, user);
      return;
    }

    // ----------------------------------------
    // Accounts Endpoints
    // ----------------------------------------
    if (reqPath === '/api/accounts') {
      if (method === 'GET') {
        sendJson(res, 200, storage.accounts.filter((a) => !a.isArchived));
        return;
      }
      if (method === 'POST') {
        const body = await readBody(req);
        const newAccount: VaultAccount = {
          id: crypto.randomUUID(),
          userId: storage.users[0].id,
          name: body.name || 'New Account',
          type: body.type || 'vault',
          balanceCents: Number(body.balanceCents) || 0,
          currency: body.currency || 'USD',
          mask: String(Math.floor(1000 + Math.random() * 9000)),
          isPrimary: false,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        storage.accounts.push(newAccount);
        saveStorage(storage);
        sendJson(res, 201, newAccount);
        return;
      }
    }

    const accountDeleteMatch = reqPath.match(/^\/api\/accounts\/([^/]+)$/);
    if (accountDeleteMatch && method === 'DELETE') {
      const id = accountDeleteMatch[1];
      const idx = storage.accounts.findIndex((a) => a.id === id);
      if (idx !== -1) {
        storage.accounts.splice(idx, 1);
        saveStorage(storage);
      }
      sendJson(res, 200, { success: true });
      return;
    }

    // ----------------------------------------
    // Transactions Endpoints
    // ----------------------------------------
    if (reqPath === '/api/transactions') {
      if (method === 'GET') {
        const category = parsedUrl.searchParams.get('category');
        const search = parsedUrl.searchParams.get('search');
        const limit = parseInt(parsedUrl.searchParams.get('limit') || '50', 10);
        const offset = parseInt(parsedUrl.searchParams.get('offset') || '0', 10);

        let filtered = [...storage.transactions];
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

        sendJson(res, 200, { transactions: paged, total });
        return;
      }

      if (method === 'POST') {
        const body = await readBody(req);
        let acc = storage.accounts.find((a) => a.id === body.accountId);
        if (!acc && storage.accounts.length > 0) {
          acc = storage.accounts[0];
        }

        const amountCents = Number(body.amountCents) || 0;
        if (acc) {
          acc.balanceCents += amountCents;
          acc.updatedAt = new Date().toISOString();
        }

        const newTx: VaultTransaction = {
          id: crypto.randomUUID(),
          userId: acc ? acc.userId : storage.users[0].id,
          occurredAt: body.occurredAt || new Date().toISOString(),
          description:
            body.description ||
            (body.merchant ? `Payment to ${body.merchant}` : 'Transaction'),
          merchant: body.merchant || null,
          category: body.category || 'General',
          amountCents,
          source: body.source || 'manual',
          accountId: acc ? acc.id : storage.accounts[0]?.id || '10000000-0000-0000-0000-000000000001',
          accountName: acc ? acc.name : 'Primary Checking',
          isRoundUp: Boolean(body.isRoundUp),
          externalId: body.externalId || null,
        };

        storage.transactions.unshift(newTx);
        saveStorage(storage);
        sendJson(res, 201, newTx);
        return;
      }
    }

    const txCategoryMatch = reqPath.match(/^\/api\/transactions\/([^/]+)\/category$/);
    if (txCategoryMatch && method === 'PATCH') {
      const id = txCategoryMatch[1];
      const body = await readBody(req);
      const tx = storage.transactions.find((t) => t.id === id);
      if (tx) {
        tx.category = body.category || tx.category;
        saveStorage(storage);
        sendJson(res, 200, { success: true, categoryId: tx.category, ...tx });
      } else {
        sendJson(res, 404, { error: 'Transaction not found' });
      }
      return;
    }

    const txDeleteMatch = reqPath.match(/^\/api\/transactions\/([^/]+)$/);
    if (txDeleteMatch && method === 'DELETE') {
      const id = txDeleteMatch[1];
      const idx = storage.transactions.findIndex((t) => t.id === id);
      if (idx !== -1) {
        const [tx] = storage.transactions.splice(idx, 1);
        const acc = storage.accounts.find((a) => a.id === tx.accountId);
        if (acc) {
          acc.balanceCents -= tx.amountCents; // Reversal of debit/credit
          acc.updatedAt = new Date().toISOString();
        }
        saveStorage(storage);
      }
      sendJson(res, 200, { success: true });
      return;
    }

    // ----------------------------------------
    // Rules Endpoints
    // ----------------------------------------
    if (reqPath === '/api/rules') {
      if (method === 'GET') {
        sendJson(res, 200, storage.rules);
        return;
      }
      if (method === 'POST') {
        const body = await readBody(req);
        const newRule: VaultRule = {
          id: crypto.randomUUID(),
          userId: storage.users[0].id,
          name: body.name || 'Automation Rule',
          type: body.type || 'round_up',
          enabled: body.enabled !== undefined ? Boolean(body.enabled) : true,
          config: body.config || {
            destinationAccountId: storage.accounts[1]?.id || storage.accounts[0]?.id,
            multiplier: 1,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        storage.rules.push(newRule);
        saveStorage(storage);
        sendJson(res, 201, newRule);
        return;
      }
    }

    const ruleToggleMatch = reqPath.match(/^\/api\/rules\/([^/]+)\/toggle$/);
    if (ruleToggleMatch && method === 'PATCH') {
      const id = ruleToggleMatch[1];
      const body = await readBody(req);
      const rule = storage.rules.find((r) => r.id === id);
      if (rule) {
        rule.enabled = body.enabled !== undefined ? Boolean(body.enabled) : !rule.enabled;
        rule.updatedAt = new Date().toISOString();
        saveStorage(storage);
        sendJson(res, 200, rule);
      } else {
        sendJson(res, 404, { error: 'Rule not found' });
      }
      return;
    }

    const ruleSingleMatch = reqPath.match(/^\/api\/rules\/([^/]+)$/);
    if (ruleSingleMatch) {
      const id = ruleSingleMatch[1];
      if (method === 'PATCH') {
        const body = await readBody(req);
        const rule = storage.rules.find((r) => r.id === id);
        if (rule) {
          if (body.name) rule.name = body.name;
          if (body.config) rule.config = { ...rule.config, ...body.config };
          if (body.enabled !== undefined) rule.enabled = Boolean(body.enabled);
          rule.updatedAt = new Date().toISOString();
          saveStorage(storage);
          sendJson(res, 200, rule);
        } else {
          sendJson(res, 404, { error: 'Rule not found' });
        }
        return;
      }
      if (method === 'DELETE') {
        const idx = storage.rules.findIndex((r) => r.id === id);
        if (idx !== -1) {
          storage.rules.splice(idx, 1);
          saveStorage(storage);
        }
        sendJson(res, 200, { success: true });
        return;
      }
    }

    // ----------------------------------------
    // Budgets Endpoints
    // ----------------------------------------
    if (reqPath === '/api/budgets') {
      if (method === 'GET') {
        // Dynamically compute spentCents from negative transactions in category
        const budgetsWithSpent = storage.budgets.map((b) => {
          const matchingTxs = storage.transactions.filter(
            (t) => t.category.toLowerCase() === b.category.toLowerCase() && t.amountCents < 0
          );
          const computedSpent = matchingTxs.reduce(
            (sum, t) => sum + Math.abs(t.amountCents),
            0
          );
          return {
            ...b,
            spentCents: computedSpent > 0 ? computedSpent : b.spentCents || 0,
          };
        });
        sendJson(res, 200, budgetsWithSpent);
        return;
      }

      if (method === 'PUT') {
        const body = await readBody(req);
        let budget = storage.budgets.find(
          (b) => b.category.toLowerCase() === (body.category || '').toLowerCase()
        );
        if (budget) {
          budget.amountCents = Number(body.amountCents) || budget.amountCents;
          if (body.period) budget.period = body.period;
        } else {
          budget = {
            id: crypto.randomUUID(),
            userId: storage.users[0].id,
            category: body.category || 'General',
            amountCents: Number(body.amountCents) || 50000,
            spentCents: 0,
            period: body.period || 'monthly',
            createdAt: new Date().toISOString(),
          };
          storage.budgets.push(budget);
        }
        saveStorage(storage);
        sendJson(res, 200, budget);
        return;
      }
    }

    const budgetDeleteMatch = reqPath.match(/^\/api\/budgets\/([^/]+)$/);
    if (budgetDeleteMatch && method === 'DELETE') {
      const id = budgetDeleteMatch[1];
      const idx = storage.budgets.findIndex((b) => b.id === id);
      if (idx !== -1) {
        storage.budgets.splice(idx, 1);
        saveStorage(storage);
      }
      sendJson(res, 200, { success: true });
      return;
    }

    // ----------------------------------------
    // Goals Endpoints
    // ----------------------------------------
    if (reqPath === '/api/goals') {
      if (method === 'GET') {
        sendJson(res, 200, storage.goals);
        return;
      }
      if (method === 'POST') {
        const body = await readBody(req);
        const newGoal: VaultGoal = {
          id: crypto.randomUUID(),
          userId: storage.users[0].id,
          name: body.name || 'New Goal',
          vaultAccountId:
            body.vaultAccountId || storage.accounts[1]?.id || storage.accounts[0]?.id,
          targetAmountCents: Number(body.targetAmountCents) || 100000,
          currentAmountCents: Number(body.currentAmountCents) || 0,
          targetDate: body.targetDate || null,
          createdAt: new Date().toISOString(),
        };
        storage.goals.push(newGoal);
        saveStorage(storage);
        sendJson(res, 201, newGoal);
        return;
      }
    }

    const goalSingleMatch = reqPath.match(/^\/api\/goals\/([^/]+)$/);
    if (goalSingleMatch) {
      const id = goalSingleMatch[1];
      if (method === 'PATCH') {
        const body = await readBody(req);
        const goal = storage.goals.find((g) => g.id === id);
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
          saveStorage(storage);
          sendJson(res, 200, goal);
        } else {
          sendJson(res, 404, { error: 'Goal not found' });
        }
        return;
      }

      if (method === 'DELETE') {
        const idx = storage.goals.findIndex((g) => g.id === id);
        if (idx !== -1) {
          storage.goals.splice(idx, 1);
          saveStorage(storage);
        }
        sendJson(res, 200, { success: true });
        return;
      }
    }

    // ----------------------------------------
    // Activity & Notifications Endpoints
    // ----------------------------------------
    if (reqPath === '/api/notifications') {
      if (method === 'GET') {
        const sorted = [...storage.notifications].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        sendJson(res, 200, sorted);
        return;
      }
      if (method === 'POST') {
        const body = await readBody(req);
        const newNotif: VaultNotification = {
          id: crypto.randomUUID(),
          userId: storage.users[0].id,
          type: body.type || 'system',
          title: body.title || 'Audit Log Event',
          message: body.message || 'System activity recorded.',
          read: false,
          metadata: body.metadata || {},
          createdAt: new Date().toISOString(),
        };
        storage.notifications.unshift(newNotif);
        saveStorage(storage);
        sendJson(res, 201, newNotif);
        return;
      }
    }

    if (reqPath === '/api/notifications/read-all' && method === 'POST') {
      storage.notifications.forEach((n) => {
        n.read = true;
      });
      saveStorage(storage);
      sendJson(res, 200, { success: true });
      return;
    }

    const notifReadMatch = reqPath.match(/^\/api\/notifications\/([^/]+)\/read$/);
    if (notifReadMatch && method === 'PATCH') {
      const id = notifReadMatch[1];
      const notif = storage.notifications.find((n) => n.id === id);
      if (notif) {
        notif.read = true;
        saveStorage(storage);
        sendJson(res, 200, { success: true, ...notif });
      } else {
        sendJson(res, 404, { error: 'Notification not found' });
      }
      return;
    }

    const notifDeleteMatch = reqPath.match(/^\/api\/notifications\/([^/]+)$/);
    if (notifDeleteMatch && method === 'DELETE') {
      const id = notifDeleteMatch[1];
      const idx = storage.notifications.findIndex((n) => n.id === id);
      if (idx !== -1) {
        storage.notifications.splice(idx, 1);
        saveStorage(storage);
      }
      sendJson(res, 200, { success: true });
      return;
    }

    // ----------------------------------------
    // Insights & Forecast Endpoints
    // ----------------------------------------
    if (reqPath === '/api/insights/forecast' && method === 'GET') {
      sendJson(res, 200, computeForecast());
      return;
    }

    if (reqPath === '/api/insights/spending' && method === 'GET') {
      sendJson(res, 200, computeSpending());
      return;
    }

    if (reqPath === '/api/insights/history' && method === 'GET') {
      sendJson(res, 200, computeHistory());
      return;
    }

    // ----------------------------------------
    // Sync Endpoint
    // ----------------------------------------
    if (reqPath === '/api/sync') {
      sendJson(res, 200, {
        status: 'synced',
        insertedCount: 128,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Fallback for any other /api/* route
    sendJson(res, 200, { success: true });
    return;
  }

  // ----------------------------------------
  // Static Web File Serving
  // ----------------------------------------
  let filePath = path.join(DIST, reqPath === '/' ? 'index.html' : reqPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Web preview server listening on http://localhost:${PORT}`);
  console.log(`Persistent local storage initialized at ${STORAGE_FILE}`);
});
