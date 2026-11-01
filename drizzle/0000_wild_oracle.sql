CREATE TABLE "admin_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"is_system" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_roles_name_unique" UNIQUE("name"),
	CONSTRAINT "admin_roles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"department" text DEFAULT 'Risk & Automation' NOT NULL,
	"permissions_list" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"assigned_by" text DEFAULT 'SUPER_ADMIN',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_analysis_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"main_verdict" text NOT NULL,
	"buy_votes" integer DEFAULT 0 NOT NULL,
	"sell_votes" integer DEFAULT 0 NOT NULL,
	"hold_votes" integer DEFAULT 0 NOT NULL,
	"confidence" numeric(5, 2) NOT NULL,
	"astro_verdict" text NOT NULL,
	"astro_rashi" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_key" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"model" text DEFAULT 'GPT-4o-TradeQuant' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"accuracy_score" numeric(5, 2) DEFAULT '88.50',
	"total_invocations" integer DEFAULT 0 NOT NULL,
	"description_hi" text NOT NULL,
	"description_en" text NOT NULL,
	"last_active_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_agents_agent_key_unique" UNIQUE("agent_key")
);
--> statement-breakpoint
CREATE TABLE "ai_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"agent_key" text NOT NULL,
	"symbol" text NOT NULL,
	"task_type" text NOT NULL,
	"status" text DEFAULT 'COMPLETED' NOT NULL,
	"result" jsonb,
	"confidence" numeric(5, 2),
	"verdict" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"agent_key" text NOT NULL,
	"tokens_used" integer DEFAULT 0,
	"execution_ms" integer DEFAULT 120,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer,
	"admin_email" text DEFAULT 'admin@autotrading.ai' NOT NULL,
	"action" text NOT NULL,
	"target_entity" text NOT NULL,
	"target_id" text,
	"details" jsonb,
	"ip_address" text DEFAULT '127.0.0.1' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "backtest_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"strategy_code" text NOT NULL,
	"symbol" text NOT NULL,
	"timeframe" text DEFAULT '15m' NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"initial_capital" numeric(14, 2) DEFAULT '500000.00' NOT NULL,
	"final_capital" numeric(14, 2) NOT NULL,
	"net_profit" numeric(14, 2) NOT NULL,
	"net_profit_pct" numeric(8, 2) NOT NULL,
	"win_rate" numeric(5, 2) NOT NULL,
	"total_trades" integer NOT NULL,
	"sharpe_ratio" numeric(4, 2) DEFAULT '2.35',
	"max_drawdown_pct" numeric(5, 2) DEFAULT '5.80',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branding_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_name" text DEFAULT 'AI Trade Master' NOT NULL,
	"tagline" text DEFAULT 'Trade Smarter with AI.' NOT NULL,
	"primary_color" text DEFAULT '#101D35' NOT NULL,
	"secondary_color" text DEFAULT '#287BFF' NOT NULL,
	"accent_color" text DEFAULT '#38D9F5' NOT NULL,
	"success_color" text DEFAULT '#16C784' NOT NULL,
	"support_email" text DEFAULT 'support@aitrademaster.com' NOT NULL,
	"logo_url" text DEFAULT '/logo.svg',
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compliance_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"record_type" text NOT NULL,
	"title" text NOT NULL,
	"regulation_ref" text DEFAULT 'SEBI/HO/MRD/2026/PAPER_TRADE_REG' NOT NULL,
	"content" text NOT NULL,
	"enforced_at" timestamp DEFAULT now() NOT NULL,
	"version" text DEFAULT 'v3.2' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"bot_id" integer,
	"symbol" text NOT NULL,
	"order_type" text DEFAULT 'MARKET' NOT NULL,
	"side" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"requested_price" numeric(12, 2) NOT NULL,
	"executed_price" numeric(12, 2),
	"status" text DEFAULT 'FILLED' NOT NULL,
	"exchange" text DEFAULT 'Angel One (NSE)' NOT NULL,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kyc_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"pan_number" text,
	"aadhaar_masked" text,
	"document_type" text DEFAULT 'PAN_CARD',
	"status" text DEFAULT 'VERIFIED' NOT NULL,
	"risk_consent_signed" boolean DEFAULT true NOT NULL,
	"paper_trading_agreement_signed" boolean DEFAULT true NOT NULL,
	"reviewer_notes" text,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "language_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name_english" text NOT NULL,
	"name_native" text NOT NULL,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "language_settings_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "market_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"exchange" text NOT NULL,
	"company_name" text NOT NULL,
	"last_price" numeric(12, 2) NOT NULL,
	"change_24h" numeric(12, 2) DEFAULT '0.00',
	"change_24h_pct" numeric(6, 2) DEFAULT '0.00',
	"volume_24h" text DEFAULT '1.2M',
	"high_24h" numeric(12, 2),
	"low_24h" numeric(12, 2),
	"open_interest_pct" numeric(6, 2) DEFAULT '0.00',
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "market_data_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "market_data_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_name" text NOT NULL,
	"exchange" text NOT NULL,
	"status" text DEFAULT 'CONNECTED' NOT NULL,
	"latency_ms" integer DEFAULT 14 NOT NULL,
	"feed_mode" text DEFAULT 'SIMULATED_AUTHORIZED_FEED' NOT NULL,
	"last_tick_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"symbol" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "platform_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'TRADING' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platform_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "portfolio_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer NOT NULL,
	"symbol" text NOT NULL,
	"company_name" text NOT NULL,
	"side" text DEFAULT 'BUY' NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"buy_average_price" numeric(12, 2) NOT NULL,
	"current_market_price" numeric(12, 2) NOT NULL,
	"stop_loss_price" numeric(12, 2),
	"target_price" numeric(12, 2),
	"unrealized_pnl" numeric(12, 2) DEFAULT '0.00',
	"pnl_percentage" numeric(8, 2) DEFAULT '0.00',
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolios" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"total_invested" numeric(14, 2) DEFAULT '0.00',
	"current_value" numeric(14, 2) DEFAULT '0.00',
	"unrealized_pnl" numeric(14, 2) DEFAULT '0.00',
	"realized_pnl" numeric(14, 2) DEFAULT '0.00',
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "portfolios_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "risk_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"severity" text DEFAULT 'WARNING' NOT NULL,
	"description" text NOT NULL,
	"action_taken" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"max_daily_loss" numeric(14, 2) DEFAULT '15000.00' NOT NULL,
	"max_position_size" numeric(14, 2) DEFAULT '100000.00' NOT NULL,
	"max_open_positions" integer DEFAULT 5 NOT NULL,
	"max_drawdown_halt_pct" numeric(5, 2) DEFAULT '10.00' NOT NULL,
	"kill_switch_active" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "risk_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "strategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"win_rate" numeric(5, 2) DEFAULT '74.50',
	"sharpe_ratio" numeric(4, 2) DEFAULT '2.45',
	"timeframe" text DEFAULT '5m / 15m' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"parameters" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "strategies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "strategy_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"strategy_id" integer NOT NULL,
	"version_tag" text NOT NULL,
	"changelog" text NOT NULL,
	"parameters_snapshot" jsonb DEFAULT '{}'::jsonb,
	"published_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"discount_pct" numeric(5, 2) NOT NULL,
	"valid_until" text NOT NULL,
	"max_uses" integer DEFAULT 1000,
	"times_used" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "subscription_coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "subscription_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_number" text NOT NULL,
	"user_id" integer NOT NULL,
	"plan_code" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"status" text DEFAULT 'PAID' NOT NULL,
	"billing_cycle" text DEFAULT 'MONTHLY' NOT NULL,
	"payment_gateway" text DEFAULT 'RAZORPAY_SIMULATED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "subscription_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"invoice_id" integer NOT NULL,
	"gateway_transaction_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'SUCCESS' NOT NULL,
	"method" text DEFAULT 'UPI' NOT NULL,
	"signature_verified" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"price_monthly" numeric(10, 2) NOT NULL,
	"price_annual" numeric(10, 2) NOT NULL,
	"ai_analyses_per_month" integer NOT NULL,
	"watchlists_limit" integer NOT NULL,
	"demo_bots_limit" integer NOT NULL,
	"backtests_per_month" integer NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb,
	"is_popular" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "subscription_plans_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_code" text DEFAULT 'FREE' NOT NULL,
	"billing_cycle" text DEFAULT 'MONTHLY' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"current_period_start" timestamp DEFAULT now() NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"ticket_number" text NOT NULL,
	"subject" text NOT NULL,
	"category" text DEFAULT 'GENERAL' NOT NULL,
	"priority" text DEFAULT 'MEDIUM' NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"user_message" text NOT NULL,
	"admin_response" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "support_tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'CORE' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"symbol" text NOT NULL,
	"company_name" text NOT NULL,
	"side" text NOT NULL,
	"entry_price" numeric(12, 2) NOT NULL,
	"current_price" numeric(12, 2) NOT NULL,
	"exit_price" numeric(12, 2),
	"quantity" numeric(10, 2) NOT NULL,
	"invested_amount" numeric(14, 2) NOT NULL,
	"stop_loss" numeric(12, 2),
	"take_profit" numeric(12, 2),
	"pnl" numeric(12, 2) DEFAULT '0.00',
	"pnl_percent" numeric(8, 2) DEFAULT '0.00',
	"status" text DEFAULT 'OPEN' NOT NULL,
	"main_agent_confidence" numeric(5, 2) DEFAULT '0.00',
	"astro_verdict" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "trading_bots" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"strategy" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"symbol" text NOT NULL,
	"exchange" text DEFAULT 'Angel One (NSE)' NOT NULL,
	"allocation" numeric(14, 2) DEFAULT '50000.00' NOT NULL,
	"max_daily_loss" numeric(14, 2) DEFAULT '5000.00' NOT NULL,
	"take_profit_pct" numeric(6, 2) DEFAULT '3.50' NOT NULL,
	"stop_loss_pct" numeric(6, 2) DEFAULT '1.50' NOT NULL,
	"total_trades" integer DEFAULT 0 NOT NULL,
	"win_rate" numeric(5, 2) DEFAULT '68.50',
	"total_pnl" numeric(14, 2) DEFAULT '0.00',
	"emergency_stopped" boolean DEFAULT false NOT NULL,
	"last_execution_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"avatar_url" text,
	"city" text,
	"state" text,
	"country" text DEFAULT 'India' NOT NULL,
	"experience_level" text DEFAULT 'INTERMEDIATE' NOT NULL,
	"preferred_exchange" text DEFAULT 'Angel One (NSE)' NOT NULL,
	"theme" text DEFAULT 'dark' NOT NULL,
	"bio" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'TRADER' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"kyc_status" text DEFAULT 'VERIFIED' NOT NULL,
	"phone_number" text,
	"wallet_balance" numeric(14, 2) DEFAULT '500000.00' NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"auto_trading_enabled" boolean DEFAULT false NOT NULL,
	"risk_level" text DEFAULT 'MODERATE' NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"language" text DEFAULT 'hi' NOT NULL,
	"current_plan" text DEFAULT 'FREE' NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "virtual_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"balance_after" numeric(14, 2) NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virtual_wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"balance" numeric(14, 2) DEFAULT '500000.00' NOT NULL,
	"locked_margin" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"peak_balance" numeric(14, 2) DEFAULT '500000.00' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "virtual_wallets_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"description" text NOT NULL,
	"admin_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watchlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"symbols" jsonb DEFAULT '[]'::jsonb,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tasks" ADD CONSTRAINT "ai_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backtest_runs" ADD CONSTRAINT "backtest_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demo_orders" ADD CONSTRAINT "demo_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_records" ADD CONSTRAINT "kyc_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_positions" ADD CONSTRAINT "portfolio_positions_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_events" ADD CONSTRAINT "risk_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_profiles" ADD CONSTRAINT "risk_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_versions" ADD CONSTRAINT "strategy_versions_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_invoice_id_subscription_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."subscription_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trading_bots" ADD CONSTRAINT "trading_bots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtual_transactions" ADD CONSTRAINT "virtual_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtual_wallets" ADD CONSTRAINT "virtual_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;