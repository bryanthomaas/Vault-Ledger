import { z } from 'zod';

// ==========================================
// User & Authentication Schemas
// ==========================================

export const RegisterInputSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  isDemo: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type User = z.infer<typeof UserSchema>;

export const AuthResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const RefreshTokenInputSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>;

// ==========================================
// Accounts & Ledger Core Schemas
// ==========================================

export const AccountTypeSchema = z.enum([
  'depository', // Checking, cash, liquid bank accounts
  'credit', // Credit card / revolving debt
  'vault', // Savings vault / goal sub-account
  'counterparty', // Merchant or employer external counterparties (for balancing double-entry)
]);
export type AccountType = z.infer<typeof AccountTypeSchema>;

export const AccountSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(128),
  type: AccountTypeSchema,
  currency: z.string().length(3).default('USD'),
  balanceCents: z.number().int(), // derived from journal postings
  isArchived: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Account = z.infer<typeof AccountSchema>;

export const CreateAccountInputSchema = z.object({
  name: z.string().min(1).max(128),
  type: AccountTypeSchema.exclude(['counterparty']),
  currency: z.string().length(3).default('USD'),
});
export type CreateAccountInput = z.infer<typeof CreateAccountInputSchema>;

export const PostingSchema = z.object({
  id: z.string().uuid().optional(),
  accountId: z.string().uuid(),
  amountCents: z.number().int(), // positive = debit/increase, negative = credit/decrease
});
export type Posting = z.infer<typeof PostingSchema>;

export const JournalEntrySourceSchema = z.enum(['provider', 'rule', 'manual', 'seed']);
export type JournalEntrySource = z.infer<typeof JournalEntrySourceSchema>;

export const JournalEntrySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  occurredAt: z.string().datetime(),
  description: z.string().min(1).max(255),
  merchant: z.string().max(128).nullable().optional(),
  category: z.string().max(64).default('General'),
  source: JournalEntrySourceSchema.default('manual'),
  externalId: z.string().max(255).nullable().optional(),
  postings: z.array(PostingSchema).min(2),
  createdAt: z.string().datetime(),
});
export type JournalEntry = z.infer<typeof JournalEntrySchema>;

// Flattened Transaction view for frontend display & querying
export const TransactionViewSchema = z.object({
  id: z.string().uuid(),
  occurredAt: z.string().datetime(),
  description: z.string(),
  merchant: z.string().nullable().optional(),
  category: z.string(),
  amountCents: z.number().int(), // Primary user account impact
  source: JournalEntrySourceSchema,
  accountId: z.string().uuid(),
  accountName: z.string(),
  isRoundUp: z.boolean().default(false),
  externalId: z.string().nullable().optional(),
});
export type TransactionView = z.infer<typeof TransactionViewSchema>;

export const UpdateTransactionCategoryInputSchema = z.object({
  category: z.string().min(1).max(64),
});
export type UpdateTransactionCategoryInput = z.infer<typeof UpdateTransactionCategoryInputSchema>;

// ==========================================
// Automation Rules Schemas
// ==========================================

export const RuleTypeSchema = z.enum(['round_up', 'percent_of_income', 'sweep']);
export type RuleType = z.infer<typeof RuleTypeSchema>;

export const RoundUpRuleConfigSchema = z.object({
  sourceAccountId: z.string().uuid().optional(),
  destinationAccountId: z.string().uuid(),
  multiplier: z.number().int().min(1).max(10).default(1),
});
export type RoundUpRuleConfig = z.infer<typeof RoundUpRuleConfigSchema>;

export const PercentOfIncomeRuleConfigSchema = z.object({
  sourceAccountId: z.string().uuid().optional(),
  destinationAccountId: z.string().uuid(),
  percentage: z.number().min(1).max(100),
});
export type PercentOfIncomeRuleConfig = z.infer<typeof PercentOfIncomeRuleConfigSchema>;

export const SweepRuleConfigSchema = z.object({
  sourceAccountId: z.string().uuid(),
  destinationAccountId: z.string().uuid(),
  thresholdCents: z.number().int().positive(),
});
export type SweepRuleConfig = z.infer<typeof SweepRuleConfigSchema>;

export const RuleConfigSchema = z.union([
  RoundUpRuleConfigSchema,
  PercentOfIncomeRuleConfigSchema,
  SweepRuleConfigSchema,
]);
export type RuleConfig = z.infer<typeof RuleConfigSchema>;

export const RoundUpRuleSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(128),
  type: z.literal('round_up'),
  enabled: z.boolean().default(true),
  config: RoundUpRuleConfigSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PercentOfIncomeRuleSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(128),
  type: z.literal('percent_of_income'),
  enabled: z.boolean().default(true),
  config: PercentOfIncomeRuleConfigSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const SweepRuleSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(128),
  type: z.literal('sweep'),
  enabled: z.boolean().default(true),
  config: SweepRuleConfigSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const RuleSchema = z.discriminatedUnion('type', [
  RoundUpRuleSchema,
  PercentOfIncomeRuleSchema,
  SweepRuleSchema,
]);
export type Rule = z.infer<typeof RuleSchema>;

export const CreateRuleInputSchema = z.discriminatedUnion('type', [
  z.object({
    name: z.string().min(1).max(128),
    type: z.literal('round_up'),
    enabled: z.boolean().default(true),
    config: RoundUpRuleConfigSchema,
  }),
  z.object({
    name: z.string().min(1).max(128),
    type: z.literal('percent_of_income'),
    enabled: z.boolean().default(true),
    config: PercentOfIncomeRuleConfigSchema,
  }),
  z.object({
    name: z.string().min(1).max(128),
    type: z.literal('sweep'),
    enabled: z.boolean().default(true),
    config: SweepRuleConfigSchema,
  }),
]);
export type CreateRuleInput = z.infer<typeof CreateRuleInputSchema>;

// ==========================================
// Budgets & Savings Goals Schemas
// ==========================================

export const BudgetSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  category: z.string().min(1).max(64),
  amountCents: z.number().int().positive(),
  period: z.enum(['monthly']).default('monthly'),
  createdAt: z.string().datetime(),
  spentCents: z.number().int().default(0), // computed field for current period
});
export type Budget = z.infer<typeof BudgetSchema>;

export const UpsertBudgetInputSchema = z.object({
  category: z.string().min(1).max(64),
  amountCents: z.number().int().positive(),
});
export type UpsertBudgetInput = z.infer<typeof UpsertBudgetInputSchema>;

export const GoalSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(128),
  vaultAccountId: z.string().uuid(),
  targetAmountCents: z.number().int().positive(),
  targetDate: z.string().date().nullable().optional(),
  createdAt: z.string().datetime(),
  currentAmountCents: z.number().int().default(0),
});
export type Goal = z.infer<typeof GoalSchema>;

export const CreateGoalInputSchema = z.object({
  name: z.string().min(1).max(128),
  vaultAccountId: z.string().uuid(),
  targetAmountCents: z.number().int().positive(),
  targetDate: z.string().date().nullable().optional(),
});
export type CreateGoalInput = z.infer<typeof CreateGoalInputSchema>;

// ==========================================
// Recurring Subscriptions & Income Schemas
// ==========================================

export const RecurringFrequencySchema = z.enum(['weekly', 'biweekly', 'monthly', 'annual']);
export type RecurringFrequency = z.infer<typeof RecurringFrequencySchema>;

export const RecurringSeriesSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  merchant: z.string().min(1),
  category: z.string(),
  frequency: RecurringFrequencySchema,
  averageAmountCents: z.number().int(),
  isIncome: z.boolean().default(false),
  nextExpectedDate: z.string().date(),
  active: z.boolean().default(true),
  lastOccurredAt: z.string().datetime(),
});
export type RecurringSeries = z.infer<typeof RecurringSeriesSchema>;

// ==========================================
// Notifications & Activity Feed Schemas
// ==========================================

export const NotificationTypeSchema = z.enum([
  'rule_fired',
  'budget_alert',
  'recurring_detected',
  'system',
]);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: NotificationTypeSchema,
  title: z.string(),
  message: z.string(),
  read: z.boolean().default(false),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.string().datetime(),
});
export type Notification = z.infer<typeof NotificationSchema>;

// ==========================================
// Forecasting & Insights Schemas
// ==========================================

export const ForecastPointSchema = z.object({
  date: z.string(), // ISO date or month key YYYY-MM-DD
  baselineNetWorth: z.number(),
  p10NetWorth: z.number(),
  p50NetWorth: z.number(),
  p90NetWorth: z.number(),
});
export type ForecastPoint = z.infer<typeof ForecastPointSchema>;

export const ForecastResponseSchema = z.object({
  currentNetWorthCents: z.number().int(),
  points: z.array(ForecastPointSchema),
  simulatedRuns: z.number().int(),
  recurringSummary: z.object({
    monthlyFixedExpensesCents: z.number().int(),
    monthlyFixedIncomeCents: z.number().int(),
    variableMonthlyVelocityCents: z.number().int(),
  }),
});
export type ForecastResponse = z.infer<typeof ForecastResponseSchema>;

export const SpendingInsightsSchema = z.object({
  period: z.string(),
  totalSpentCents: z.number().int(),
  totalEarnedCents: z.number().int(),
  netSavingsCents: z.number().int(),
  byCategory: z.array(
    z.object({
      category: z.string(),
      amountCents: z.number().int(),
      percentage: z.number(),
    }),
  ),
  monthOverMonthChangePercent: z.number().nullable(),
});
export type SpendingInsights = z.infer<typeof SpendingInsightsSchema>;
