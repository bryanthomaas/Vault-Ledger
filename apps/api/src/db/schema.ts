import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  bigint,
  date,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==========================================
// Users & Refresh Tokens
// ==========================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  isDemo: boolean('is_demo').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    revoked: boolean('revoked').notNull().default(false),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('refresh_tokens_user_idx').on(table.userId)],
);

// ==========================================
// Accounts & Ledger Core
// ==========================================

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 128 }).notNull(),
    type: varchar('type', { length: 32 }).notNull(), // depository, credit, vault, counterparty
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    isArchived: boolean('is_archived').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('accounts_user_idx').on(table.userId)],
);

export const journalEntries = pgTable(
  'journal_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    merchant: varchar('merchant', { length: 128 }),
    category: varchar('category', { length: 64 }).notNull().default('General'),
    source: varchar('source', { length: 32 }).notNull().default('manual'), // provider, rule, manual, seed
    externalId: varchar('external_id', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('journal_entries_user_idx').on(table.userId),
    index('journal_entries_occurred_idx').on(table.userId, table.occurredAt),
    uniqueIndex('journal_entries_external_uniq').on(table.userId, table.externalId),
  ],
);

export const postings = pgTable(
  'postings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entryId: uuid('entry_id')
      .notNull()
      .references(() => journalEntries.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    amountCents: bigint('amount_cents', { mode: 'number' }).notNull(), // integer cents: positive = debit/increase, negative = credit/decrease
  },
  (table) => [
    index('postings_entry_idx').on(table.entryId),
    index('postings_account_idx').on(table.accountId),
  ],
);

// ==========================================
// Automation Rules & Executions
// ==========================================

export const rules = pgTable(
  'rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 128 }).notNull(),
    type: varchar('type', { length: 32 }).notNull(), // round_up, percent_of_income, sweep
    enabled: boolean('enabled').notNull().default(true),
    config: jsonb('config').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('rules_user_idx').on(table.userId)],
);

export const ruleExecutions = pgTable(
  'rule_executions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ruleId: uuid('rule_id')
      .notNull()
      .references(() => rules.id, { onDelete: 'cascade' }),
    sourceEntryId: uuid('source_entry_id')
      .notNull()
      .references(() => journalEntries.id, { onDelete: 'cascade' }),
    generatedEntryId: uuid('generated_entry_id').references(() => journalEntries.id, {
      onDelete: 'set null',
    }),
    amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
    status: varchar('status', { length: 32 }).notNull().default('executed'),
    executedAt: timestamp('executed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Strict idempotency: a rule can only ever execute once per source transaction
    uniqueIndex('rule_exec_idempotency_idx').on(table.ruleId, table.sourceEntryId),
  ],
);

// ==========================================
// Budgets & Savings Goals
// ==========================================

export const budgets = pgTable(
  'budgets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    category: varchar('category', { length: 64 }).notNull(),
    amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
    period: varchar('period', { length: 32 }).notNull().default('monthly'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('budgets_user_category_idx').on(table.userId, table.category)],
);

export const goals = pgTable(
  'goals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 128 }).notNull(),
    vaultAccountId: uuid('vault_account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    targetAmountCents: bigint('target_amount_cents', { mode: 'number' }).notNull(),
    targetDate: date('target_date'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('goals_user_idx').on(table.userId)],
);

// ==========================================
// Recurring Subscriptions & Income
// ==========================================

export const recurringSeries = pgTable(
  'recurring_series',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    merchant: varchar('merchant', { length: 128 }).notNull(),
    category: varchar('category', { length: 64 }).notNull(),
    frequency: varchar('frequency', { length: 32 }).notNull(), // weekly, biweekly, monthly, annual
    averageAmountCents: bigint('average_amount_cents', { mode: 'number' }).notNull(),
    isIncome: boolean('is_income').notNull().default(false),
    nextExpectedDate: date('next_expected_date').notNull(),
    active: boolean('active').notNull().default(true),
    lastOccurredAt: timestamp('last_occurred_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('recurring_user_merchant_idx').on(table.userId, table.merchant)],
);

// ==========================================
// Notifications & Activity Feed
// ==========================================

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 32 }).notNull(), // rule_fired, budget_alert, recurring_detected, system
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    read: boolean('read').notNull().default(false),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('notifications_user_idx').on(table.userId)],
);

// ==========================================
// Transactional Outbox Events
// ==========================================

export const outboxEvents = pgTable(
  'outbox_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    topic: varchar('topic', { length: 64 }).notNull(), // transaction.created, rule.triggered, etc.
    payload: jsonb('payload').notNull(),
    processed: boolean('processed').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('outbox_events_unprocessed_idx').on(table.processed, table.createdAt)],
);

// ==========================================
// Relations
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  journalEntries: many(journalEntries),
  rules: many(rules),
  budgets: many(budgets),
  goals: many(goals),
  recurringSeries: many(recurringSeries),
  notifications: many(notifications),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
  postings: many(postings),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one, many }) => ({
  user: one(users, { fields: [journalEntries.userId], references: [users.id] }),
  postings: many(postings),
}));

export const postingsRelations = relations(postings, ({ one }) => ({
  entry: one(journalEntries, { fields: [postings.entryId], references: [journalEntries.id] }),
  account: one(accounts, { fields: [postings.accountId], references: [accounts.id] }),
}));
