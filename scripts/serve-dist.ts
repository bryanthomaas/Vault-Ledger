import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = parseInt(process.env.PORT || '8080', 10);
const DIST = path.resolve('apps/mobile/dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

// Built-in responses for instant sandbox demo preview
const DEMO_RESPONSES: Record<string, any> = {
  '/api/auth/demo': {
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'demo@vaultledger.local',
      firstName: 'Bryan',
      lastName: 'Thomas',
      isDemo: true,
    },
    accessToken: 'demo-token',
    refreshToken: 'demo-refresh',
  },
  '/api/auth/me': {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'demo@vaultledger.local',
    firstName: 'Bryan',
    lastName: 'Thomas',
    isDemo: true,
  },
  '/api/accounts': [
    { id: '1', userId: 'demo', name: 'Primary Checking', type: 'depository', balanceCents: 485025, currency: 'USD', mask: '4092', isPrimary: true },
    { id: '2', userId: 'demo', name: 'High-Yield Reserve Vault', type: 'vault', balanceCents: 1842050, currency: 'USD', mask: '8821', isPrimary: false },
    { id: '3', userId: 'demo', name: 'Growth Index Portfolio', type: 'investment', balanceCents: 3215000, currency: 'USD', mask: '9912', isPrimary: false },
    { id: '4', userId: 'demo', name: 'Sapphire Preferred Card', type: 'credit', balanceCents: -68040, currency: 'USD', mask: '3104', isPrimary: false },
  ],
  '/api/transactions': {
    transactions: [
      { id: '101', occurredAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), description: 'Coffee at Blue Bottle Coffee', merchant: 'Blue Bottle Coffee', category: 'Coffee', amountCents: -525, source: 'provider_sync', accountId: '1', accountName: 'Primary Checking', isRoundUp: false },
      { id: '102', occurredAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), description: 'Round-Up Transfer to High-Yield Reserve Vault', merchant: null, category: 'Savings', amountCents: -75, source: 'rule_execution', accountId: '1', accountName: 'Primary Checking', isRoundUp: true },
      { id: '103', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), description: "Groceries at Trader Joe's", merchant: "Trader Joe's", category: 'Groceries', amountCents: -9420, source: 'provider_sync', accountId: '1', accountName: 'Primary Checking', isRoundUp: false },
      { id: '104', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), description: 'Direct Deposit - Tech Corp Payroll', merchant: 'Tech Corp', category: 'Salary', amountCents: 345000, source: 'provider_sync', accountId: '1', accountName: 'Primary Checking', isRoundUp: false },
      { id: '105', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), description: 'Rent Payment - Avalon Residences', merchant: 'Avalon Properties', category: 'Housing', amountCents: -165000, source: 'provider_sync', accountId: '1', accountName: 'Primary Checking', isRoundUp: false },
    ],
    total: 5,
  },
  '/api/rules': [
    { id: '201', userId: 'demo', name: 'Coffee & Daily Round-Ups', type: 'round_up', enabled: true, config: { destinationAccountId: '2', multiplier: 1 } },
    { id: '202', userId: 'demo', name: 'Paycheck Savings Allocation', type: 'percent_of_income', enabled: true, config: { destinationAccountId: '2', percentage: 15 } },
    { id: '203', userId: 'demo', name: 'Checking Liquidity Sweep', type: 'sweep', enabled: true, config: { destinationAccountId: '2', sourceAccountId: '1', thresholdCents: 500000 } },
  ],
  '/api/budgets': [
    { id: '301', userId: 'demo', category: 'Housing', amountCents: 165000, spentCents: 165000, period: 'monthly' },
    { id: '302', userId: 'demo', category: 'Groceries', amountCents: 50000, spentCents: 37850, period: 'monthly' },
    { id: '303', userId: 'demo', category: 'Coffee', amountCents: 8000, spentCents: 5200, period: 'monthly' },
    { id: '304', userId: 'demo', category: 'Entertainment', amountCents: 15000, spentCents: 14200, period: 'monthly' },
  ],
  '/api/goals': [
    { id: '401', userId: 'demo', name: 'Emergency Reserve Vault', vaultAccountId: '2', targetAmountCents: 2500000, currentAmountCents: 1842050 },
    { id: '402', userId: 'demo', name: 'Alpine Expedition Fund', vaultAccountId: '2', targetAmountCents: 800000, currentAmountCents: 520000, targetDate: '2027-04-15' },
  ],
  '/api/notifications': [
    { id: '501', userId: 'demo', type: 'rule_fired', title: 'Rule Executed: Coffee Round-Up', message: 'Transferred $0.75 spare change to High-Yield Reserve Vault.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: '502', userId: 'demo', type: 'recurring_detected', title: 'Subscription Confirmed: Netflix', message: 'Detected monthly recurring expense of $15.99.', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  ],
  '/api/insights/forecast': {
    currentNetWorthCents: 5474035,
    simulatedRuns: 1000,
    recurringSummary: { monthlyFixedExpensesCents: 178898, monthlyFixedIncomeCents: 690000, variableMonthlyVelocityCents: 165000 },
    points: [
      { date: 'Month 0', baselineNetWorth: 54740, p10NetWorth: 54740, p50NetWorth: 54740, p90NetWorth: 54740 },
      { date: 'Month 1', baselineNetWorth: 58200, p10NetWorth: 57400, p50NetWorth: 58200, p90NetWorth: 59100 },
      { date: 'Month 2', baselineNetWorth: 61650, p10NetWorth: 60100, p50NetWorth: 61650, p90NetWorth: 63500 },
      { date: 'Month 3', baselineNetWorth: 65100, p10NetWorth: 62800, p50NetWorth: 65100, p90NetWorth: 67900 },
      { date: 'Month 4', baselineNetWorth: 68560, p10NetWorth: 65500, p50NetWorth: 68560, p90NetWorth: 72400 },
      { date: 'Month 5', baselineNetWorth: 72020, p10NetWorth: 68100, p50NetWorth: 72020, p90NetWorth: 76900 },
      { date: 'Month 6', baselineNetWorth: 75480, p10NetWorth: 70800, p50NetWorth: 75480, p90NetWorth: 81500 },
    ],
  },
  '/api/insights/spending': {
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
    ],
  },
  '/api/insights/history': [
    { month: '2025-11', netWorthCents: 4120000, incomeCents: 690000, expenseCents: 210000 },
    { month: '2025-12', netWorthCents: 4580000, incomeCents: 740000, expenseCents: 240000 },
    { month: '2026-01', netWorthCents: 4890000, incomeCents: 690000, expenseCents: 195000 },
    { month: '2026-02', netWorthCents: 5180000, incomeCents: 690000, expenseCents: 180000 },
    { month: '2026-03', netWorthCents: 5474035, incomeCents: 690000, expenseCents: 182770 },
  ],
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = req.url || '/';
  const reqPath = reqUrl.split('?')[0];

  // Handle /api/* mock responses directly for self-contained preview
  if (reqPath.startsWith('/api/')) {
    const matchedKey = Object.keys(DEMO_RESPONSES).find((k) => reqPath.startsWith(k));
    const responseData = matchedKey ? DEMO_RESPONSES[matchedKey] : { success: true };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responseData));
    return;
  }

  let filePath = path.join(DIST, reqPath === '/' ? 'index.html' : reqPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Web preview server listening on http://localhost:${PORT}`);
});
