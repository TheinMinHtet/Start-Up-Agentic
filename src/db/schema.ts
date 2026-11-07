import { pgTable, text, timestamp, jsonb, uuid, primaryKey, integer } from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';

// --- Auth & Users Tables (Compatible with NextAuth / Auth.js) ---

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  username: text('username').unique(),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);

// --- Application Agent Output Tables ---

const agentColumns = {
  id: uuid('id').defaultRandom().primaryKey(),
  idea_id: text('idea_id').notNull(),
  user_id: text('user_id').notNull(),
  thinking: text('thinking'),
  raw_output: jsonb('raw_output'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
};

export const agentRefinements = pgTable('agent_refinements', {
  ...agentColumns,
  concept: text('concept'),
  improved_summary: text('improved_summary'),
  target_audience: text('target_audience'),
  problem_solved: text('problem_solved'),
  core_value_prop: text('core_value_prop'),
});

export const agentMarketResearch = pgTable('agent_market_research', {
  ...agentColumns,
  tam: text('tam'),
  sam: text('sam'),
  som: text('som'),
  competitors: jsonb('competitors'),
  opportunities: jsonb('opportunities'),
});

export const agentFinanceModels = pgTable('agent_finance_models', {
  ...agentColumns,
  initial_budget: text('initial_budget'),
  monthly_burn: text('monthly_burn'),
  runway: text('runway'),
  breakeven_month: text('breakeven_month'),
  revenue_streams: jsonb('revenue_streams'),
});

export const agentBrandPackages = pgTable('agent_brand_packages', {
  ...agentColumns,
  brand_name: text('brand_name'),
  tagline: text('tagline'),
  color_palette: jsonb('color_palette'),
  typography: jsonb('typography'),
});

export const agentDigitalPresence = pgTable('agent_digital_presence', {
  ...agentColumns,
  domain_suggestions: jsonb('domain_suggestions'),
  channels: jsonb('channels'),
  stack: jsonb('stack'),
  markdown_deliverable: text('markdown_deliverable'),
});

export const agentGrowthPlans = pgTable('agent_growth_plans', {
  ...agentColumns,
  channels: jsonb('channels'),
  acquisition_strategy: text('acquisition_strategy'),
  retention_tactics: jsonb('retention_tactics'),
  kpis: jsonb('kpis'),
});

export const agentBusinessPlans = pgTable('agent_business_plans', {
  ...agentColumns,
  executive_summary: text('executive_summary'),
  business_model: text('business_model'),
  marketing_plan: text('marketing_plan'),
  financial_plan: text('financial_plan'),
});
