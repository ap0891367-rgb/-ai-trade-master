import { pgTable, text, serial, integer, timestamp, numeric, boolean, jsonb } from "drizzle-orm/pg-core";

// 1. Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("TRADER"), // SUPER_ADMIN, ADMIN, RISK_OFFICER, COMPLIANCE_MANAGER, SUPPORT_EXECUTIVE, TRADER
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, SUSPENDED, PENDING_VERIFICATION, LOCKED
  kycStatus: text("kyc_status").notNull().default("VERIFIED"), // VERIFIED, PENDING, REJECTED, NOT_SUBMITTED
  phoneNumber: text("phone_number"),
  walletBalance: numeric("wallet_balance", { precision: 14, scale: 2 }).notNull().default("500000.00"),
  currency: text("currency").notNull().default("INR"),
  autoTradingEnabled: boolean("auto_trading_enabled").notNull().default(false),
  riskLevel: text("risk_level").notNull().default("MODERATE"), // CONSERVATIVE, MODERATE, AGGRESSIVE
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  language: text("language").notNull().default("hi"), // hi, en, mr, gu, bn, ta, te, kn, ml, pa, or, as
  currentPlan: text("current_plan").notNull().default("FREE"), // FREE, STARTER, PRO, PREMIUM, ENTERPRISE
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. User Profiles
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  avatarUrl: text("avatar_url"),
  city: text("city"),
  state: text("state"),
  country: text("country").notNull().default("India"),
  experienceLevel: text("experience_level").notNull().default("INTERMEDIATE"), // BEGINNER, INTERMEDIATE, PRO
  preferredExchange: text("preferred_exchange").notNull().default("Angel One (NSE)"),
  theme: text("theme").notNull().default("dark"), // dark, light
  bio: text("bio"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. Admin Users
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  department: text("department").notNull().default("Risk & Automation"),
  permissionsList: jsonb("permissions_list").default([]),
  isActive: boolean("is_active").notNull().default(true),
  assignedBy: text("assigned_by").default("SUPER_ADMIN"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Admin Roles
export const adminRoles = pgTable("admin_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions").default([]),
  isSystem: boolean("is_system").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Permissions
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  category: text("category").notNull(), // USERS, BOTS, WALLET, RISK, SUBSCRIPTIONS, SYSTEM
  name: text("name").notNull(),
  description: text("description"),
});

// 6. AI Agents (10 Master Agents)
export const aiAgents = pgTable("ai_agents", {
  id: serial("id").primaryKey(),
  agentKey: text("agent_key").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(), // INTELLIGENCE, RESEARCH, TECHNICAL, NEWS, SENTIMENT, EVALUATION, BACKTEST, RISK, PORTFOLIO, SUPPORT
  model: text("model").notNull().default("GPT-4o-TradeQuant"),
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, IDLE, PROCESSING, ERROR
  accuracyScore: numeric("accuracy_score", { precision: 5, scale: 2 }).default("88.50"),
  totalInvocations: integer("total_invocations").notNull().default(0),
  descriptionHi: text("description_hi").notNull(),
  descriptionEn: text("description_en").notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
});

// 7. AI Tasks
export const aiTasks = pgTable("ai_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  agentKey: text("agent_key").notNull(),
  symbol: text("symbol").notNull(),
  taskType: text("task_type").notNull(), // SCAN, RESEARCH, TECHNICAL_AUDIT, NEWS_SENTIMENT, STRATEGY_EVAL, BACKTEST, RISK_AUDIT
  status: text("status").notNull().default("COMPLETED"), // PENDING, PROCESSING, COMPLETED, FAILED
  result: jsonb("result"),
  confidence: numeric("confidence", { precision: 5, scale: 2 }),
  verdict: text("verdict"), // BUY, SELL, HOLD, NEUTRAL
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8. AI Usage Logs
export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  agentKey: text("agent_key").notNull(),
  tokensUsed: integer("tokens_used").default(0),
  executionMs: integer("execution_ms").default(120),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 9. Trading Bots
export const tradingBots = pgTable("trading_bots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  strategy: text("strategy").notNull(), // 30-Agent Consensus, NSE 9:15 OI Surge, VWAP Institutional Scalper, Mean Reversion Keltner, Astro-Technical Confluence
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, PAUSED, STOPPED, ERROR
  symbol: text("symbol").notNull(),
  exchange: text("exchange").notNull().default("Angel One (NSE)"),
  allocation: numeric("allocation", { precision: 14, scale: 2 }).notNull().default("50000.00"),
  maxDailyLoss: numeric("max_daily_loss", { precision: 14, scale: 2 }).notNull().default("5000.00"),
  takeProfitPct: numeric("take_profit_pct", { precision: 6, scale: 2 }).notNull().default("3.50"),
  stopLossPct: numeric("stop_loss_pct", { precision: 6, scale: 2 }).notNull().default("1.50"),
  totalTrades: integer("total_trades").notNull().default(0),
  winRate: numeric("win_rate", { precision: 5, scale: 2 }).default("68.50"),
  totalPnl: numeric("total_pnl", { precision: 14, scale: 2 }).default("0.00"),
  emergencyStopped: boolean("emergency_stopped").notNull().default(false),
  lastExecutionAt: timestamp("last_execution_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 10. Strategies
export const strategies = pgTable("strategies", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // QUANT, MOMENTUM, F_AND_O, ASTRO, VOLATILITY
  winRate: numeric("win_rate", { precision: 5, scale: 2 }).default("74.50"),
  sharpeRatio: numeric("sharpe_ratio", { precision: 4, scale: 2 }).default("2.45"),
  timeframe: text("timeframe").notNull().default("5m / 15m"),
  isActive: boolean("is_active").notNull().default(true),
  parameters: jsonb("parameters").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 11. Strategy Versions
export const strategyVersions = pgTable("strategy_versions", {
  id: serial("id").primaryKey(),
  strategyId: integer("strategy_id").references(() => strategies.id).notNull(),
  versionTag: text("version_tag").notNull(), // v1.0, v2.1
  changelog: text("changelog").notNull(),
  parametersSnapshot: jsonb("parameters_snapshot").default({}),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

// 12. Virtual Wallets
export const virtualWallets = pgTable("virtual_wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  currency: text("currency").notNull().default("INR"),
  balance: numeric("balance", { precision: 14, scale: 2 }).notNull().default("500000.00"),
  lockedMargin: numeric("locked_margin", { precision: 14, scale: 2 }).notNull().default("0.00"),
  peakBalance: numeric("peak_balance", { precision: 14, scale: 2 }).notNull().default("500000.00"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 13. Virtual Transactions
export const virtualTransactions = pgTable("virtual_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // DEPOSIT, WITHDRAW, ORDER_BUY, ORDER_SELL, PNL_CREDIT, PNL_DEBIT, ADMIN_ADJUSTMENT, RESET
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  balanceAfter: numeric("balance_after", { precision: 14, scale: 2 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 14. Demo Orders
export const demoOrders = pgTable("demo_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  botId: integer("bot_id"),
  symbol: text("symbol").notNull(),
  orderType: text("order_type").notNull().default("MARKET"), // MARKET, LIMIT, STOP_LIMIT
  side: text("side").notNull(), // BUY, SELL
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  requestedPrice: numeric("requested_price", { precision: 12, scale: 2 }).notNull(),
  executedPrice: numeric("executed_price", { precision: 12, scale: 2 }),
  status: text("status").notNull().default("FILLED"), // PENDING, FILLED, CANCELLED, REJECTED
  exchange: text("exchange").notNull().default("Angel One (NSE)"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 15. Portfolios
export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  totalInvested: numeric("total_invested", { precision: 14, scale: 2 }).default("0.00"),
  currentValue: numeric("current_value", { precision: 14, scale: 2 }).default("0.00"),
  unrealizedPnl: numeric("unrealized_pnl", { precision: 14, scale: 2 }).default("0.00"),
  realizedPnl: numeric("realized_pnl", { precision: 14, scale: 2 }).default("0.00"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 16. Portfolio Positions
export const portfolioPositions = pgTable("portfolio_positions", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id).notNull(),
  symbol: text("symbol").notNull(),
  companyName: text("company_name").notNull(),
  side: text("side").notNull().default("BUY"),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  buyAveragePrice: numeric("buy_average_price", { precision: 12, scale: 2 }).notNull(),
  currentMarketPrice: numeric("current_market_price", { precision: 12, scale: 2 }).notNull(),
  stopLossPrice: numeric("stop_loss_price", { precision: 12, scale: 2 }),
  targetPrice: numeric("target_price", { precision: 12, scale: 2 }),
  unrealizedPnl: numeric("unrealized_pnl", { precision: 12, scale: 2 }).default("0.00"),
  pnlPercentage: numeric("pnl_percentage", { precision: 8, scale: 2 }).default("0.00"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 17. Market Data
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  exchange: text("exchange").notNull(), // Angel One (NSE), Delta Exchange, Forex / Commodities
  companyName: text("company_name").notNull(),
  lastPrice: numeric("last_price", { precision: 12, scale: 2 }).notNull(),
  change24h: numeric("change_24h", { precision: 12, scale: 2 }).default("0.00"),
  change24hPct: numeric("change_24h_pct", { precision: 6, scale: 2 }).default("0.00"),
  volume24h: text("volume_24h").default("1.2M"),
  high24h: numeric("high_24h", { precision: 12, scale: 2 }),
  low24h: numeric("low_24h", { precision: 12, scale: 2 }),
  openInterestPct: numeric("open_interest_pct", { precision: 6, scale: 2 }).default("0.00"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// 18. Watchlists
export const watchlists = pgTable("watchlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  symbols: jsonb("symbols").default([]), // array of symbols
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 19. Backtest Runs
export const backtestRuns = pgTable("backtest_runs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  strategyCode: text("strategy_code").notNull(),
  symbol: text("symbol").notNull(),
  timeframe: text("timeframe").notNull().default("15m"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  initialCapital: numeric("initial_capital", { precision: 14, scale: 2 }).notNull().default("500000.00"),
  finalCapital: numeric("final_capital", { precision: 14, scale: 2 }).notNull(),
  netProfit: numeric("net_profit", { precision: 14, scale: 2 }).notNull(),
  netProfitPct: numeric("net_profit_pct", { precision: 8, scale: 2 }).notNull(),
  winRate: numeric("win_rate", { precision: 5, scale: 2 }).notNull(),
  totalTrades: integer("total_trades").notNull(),
  sharpeRatio: numeric("sharpe_ratio", { precision: 4, scale: 2 }).default("2.35"),
  maxDrawdownPct: numeric("max_drawdown_pct", { precision: 5, scale: 2 }).default("5.80"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 20. Risk Profiles
export const riskProfiles = pgTable("risk_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  maxDailyLoss: numeric("max_daily_loss", { precision: 14, scale: 2 }).notNull().default("15000.00"),
  maxPositionSize: numeric("max_position_size", { precision: 14, scale: 2 }).notNull().default("100000.00"),
  maxOpenPositions: integer("max_open_positions").notNull().default(5),
  maxDrawdownHaltPct: numeric("max_drawdown_halt_pct", { precision: 5, scale: 2 }).notNull().default("10.00"),
  killSwitchActive: boolean("kill_switch_active").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 21. Risk Events
export const riskEvents = pgTable("risk_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  eventType: text("event_type").notNull(), // DAILY_LOSS_LIMIT, MAX_DRAWDOWN_TRIGGER, EMERGENCY_STOP, HIGH_VOLATILITY, MARGIN_CALL
  severity: text("severity").notNull().default("WARNING"), // INFO, WARNING, CRITICAL
  description: text("description").notNull(),
  actionTaken: text("action_taken").notNull(), // AUTO_PAUSE_BOTS, HALT_TRADING, NOTIFIED_USER
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 22. Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  planCode: text("plan_code").notNull().default("FREE"), // FREE, STARTER, PRO, PREMIUM, ENTERPRISE
  billingCycle: text("billing_cycle").notNull().default("MONTHLY"), // MONTHLY, ANNUAL
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, CANCELLED, EXPIRED, PAST_DUE
  currentPeriodStart: timestamp("current_period_start").defaultNow().notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 23. Subscription Plans (Configurable in Super Admin)
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // FREE, STARTER, PRO, PREMIUM, ENTERPRISE
  name: text("name").notNull(),
  priceMonthly: numeric("price_monthly", { precision: 10, scale: 2 }).notNull(),
  priceAnnual: numeric("price_annual", { precision: 10, scale: 2 }).notNull(),
  aiAnalysesPerMonth: integer("ai_analyses_per_month").notNull(),
  watchlistsLimit: integer("watchlists_limit").notNull(),
  demoBotsLimit: integer("demo_bots_limit").notNull(),
  backtestsPerMonth: integer("backtests_per_month").notNull(),
  features: jsonb("features").default([]),
  isPopular: boolean("is_popular").default(false),
  isActive: boolean("is_active").default(true),
});

// 24. Subscription Invoices
export const subscriptionInvoices = pgTable("subscription_invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planCode: text("plan_code").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("INR"),
  status: text("status").notNull().default("PAID"), // PAID, PENDING, FAILED, REFUNDED
  billingCycle: text("billing_cycle").notNull().default("MONTHLY"),
  paymentGateway: text("payment_gateway").notNull().default("RAZORPAY_SIMULATED"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 25. Subscription Payments
export const subscriptionPayments = pgTable("subscription_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  invoiceId: integer("invoice_id").references(() => subscriptionInvoices.id).notNull(),
  gatewayTransactionId: text("gateway_transaction_id").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("SUCCESS"), // SUCCESS, FAILED, REFUNDED
  method: text("method").notNull().default("UPI"), // UPI, NETBANKING, CARD
  signatureVerified: boolean("signature_verified").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 26. Subscription Coupons
export const subscriptionCoupons = pgTable("subscription_coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g. FESTIVE50, DIWALI2026, TRADERAI
  discountPct: numeric("discount_pct", { precision: 5, scale: 2 }).notNull(),
  validUntil: text("valid_until").notNull(),
  maxUses: integer("max_uses").default(1000),
  timesUsed: integer("times_used").default(0),
  isActive: boolean("is_active").default(true),
});

// 27. Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  symbol: text("symbol").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // BUY_ALERT, SELL_ALERT, HOLD_ALERT, ASTRO_ALERT, AUTO_TRADE, ADMIN_BROADCAST, RISK_ALERT
  read: boolean("read").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 28. Support Tickets
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  ticketNumber: text("ticket_number").notNull().unique(),
  subject: text("subject").notNull(),
  category: text("category").notNull().default("GENERAL"), // GENERAL, BOT_EXECUTION, WALLET_LEDGER, MARKET_DATA, KYC, SUBSCRIPTION
  priority: text("priority").notNull().default("MEDIUM"), // LOW, MEDIUM, HIGH, CRITICAL
  status: text("status").notNull().default("OPEN"), // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  userMessage: text("user_message").notNull(),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 29. Compliance Records
export const complianceRecords = pgTable("compliance_records", {
  id: serial("id").primaryKey(),
  recordType: text("record_type").notNull(), // SEBI_PAPER_TRADING_DISCLAIMER, RISK_CONSENT, DATA_PRIVACY_GDPR, AUDIT_SUMMARY
  title: text("title").notNull(),
  regulationRef: text("regulation_ref").notNull().default("SEBI/HO/MRD/2026/PAPER_TRADE_REG"),
  content: text("content").notNull(),
  enforcedAt: timestamp("enforced_at").defaultNow().notNull(),
  version: text("version").notNull().default("v3.2"),
});

// 30. Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id"),
  adminEmail: text("admin_email").notNull().default("admin@autotrading.ai"),
  action: text("action").notNull(), // USER_UPDATE, WALLET_ADJUSTMENT, BOT_EMERGENCY_STOP, STRATEGY_UPDATE, SYSTEM_CONFIG_CHANGE, KYC_REVIEW, TICKET_RESOLVE, PLAN_MODIFY, COUPON_CREATE
  targetEntity: text("target_entity").notNull(),
  targetId: text("target_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address").notNull().default("127.0.0.1"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 31. Branding Settings
export const brandingSettings = pgTable("branding_settings", {
  id: serial("id").primaryKey(),
  projectName: text("project_name").notNull().default("AI Trade Master"),
  tagline: text("tagline").notNull().default("Trade Smarter with AI."),
  primaryColor: text("primary_color").notNull().default("#101D35"),
  secondaryColor: text("secondary_color").notNull().default("#287BFF"),
  accentColor: text("accent_color").notNull().default("#38D9F5"),
  successColor: text("success_color").notNull().default("#16C784"),
  supportEmail: text("support_email").notNull().default("support@aitrademaster.com"),
  logoUrl: text("logo_url").default("/logo.svg"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 32. Language Settings
export const languageSettings = pgTable("language_settings", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // hi, en, mr, gu, bn, ta, te, kn, ml, pa, or, as
  nameEnglish: text("name_english").notNull(),
  nameNative: text("name_native").notNull(),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
});

// 33. System Settings
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  category: text("category").notNull().default("CORE"), // CORE, RISK, MARKET, BILLING
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Backward-compatible alias tables for existing modules
export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  symbol: text("symbol").notNull(),
  companyName: text("company_name").notNull(),
  side: text("side").notNull(), // BUY or SELL
  entryPrice: numeric("entry_price", { precision: 12, scale: 2 }).notNull(),
  currentPrice: numeric("current_price", { precision: 12, scale: 2 }).notNull(),
  exitPrice: numeric("exit_price", { precision: 12, scale: 2 }),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  investedAmount: numeric("invested_amount", { precision: 14, scale: 2 }).notNull(),
  stopLoss: numeric("stop_loss", { precision: 12, scale: 2 }),
  takeProfit: numeric("take_profit", { precision: 12, scale: 2 }),
  pnl: numeric("pnl", { precision: 12, scale: 2 }).default("0.00"),
  pnlPercent: numeric("pnl_percent", { precision: 8, scale: 2 }).default("0.00"),
  status: text("status").notNull().default("OPEN"), // OPEN, CLOSED
  mainAgentConfidence: numeric("main_agent_confidence", { precision: 5, scale: 2 }).default("0.00"),
  astroVerdict: text("astro_verdict"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // DEPOSIT, WITHDRAW, TRADE_BUY, TRADE_SELL_PROFIT, TRADE_SELL_LOSS, RESET, ADMIN_CREDIT, ADMIN_DEBIT
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  description: text("description").notNull(),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const kycRecords = pgTable("kyc_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  panNumber: text("pan_number"),
  aadhaarMasked: text("aadhaar_masked"),
  documentType: text("document_type").default("PAN_CARD"),
  status: text("status").notNull().default("VERIFIED"), // PENDING, VERIFIED, REJECTED
  riskConsentSigned: boolean("risk_consent_signed").notNull().default(true),
  paperTradingAgreementSigned: boolean("paper_trading_agreement_signed").notNull().default(true),
  reviewerNotes: text("reviewer_notes"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const platformConfig = pgTable("platform_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  category: text("category").notNull().default("TRADING"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketDataProviders = pgTable("market_data_providers", {
  id: serial("id").primaryKey(),
  providerName: text("provider_name").notNull(),
  exchange: text("exchange").notNull(),
  status: text("status").notNull().default("CONNECTED"),
  latencyMs: integer("latency_ms").notNull().default(14),
  feedMode: text("feed_mode").notNull().default("SIMULATED_AUTHORIZED_FEED"),
  lastTickAt: timestamp("last_tick_at").defaultNow().notNull(),
});

export const agentAnalysisLogs = pgTable("agent_analysis_logs", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  mainVerdict: text("main_verdict").notNull(),
  buyVotes: integer("buy_votes").notNull().default(0),
  sellVotes: integer("sell_votes").notNull().default(0),
  holdVotes: integer("hold_votes").notNull().default(0),
  confidence: numeric("confidence", { precision: 5, scale: 2 }).notNull(),
  astroVerdict: text("astro_verdict").notNull(),
  astroRashi: text("astro_rashi").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
