CREATE TABLE "footer_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_id" integer NOT NULL,
	"label" text NOT NULL,
	"href" text DEFAULT '#' NOT NULL,
	"nav_key" text,
	"is_external" boolean DEFAULT false NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "footer_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_key" text NOT NULL,
	"title" text NOT NULL,
	"section_type" text DEFAULT 'LINKS' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "footer_sections_section_key_unique" UNIQUE("section_key")
);
--> statement-breakpoint
CREATE TABLE "footer_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_name" text DEFAULT 'AI TRADE MASTER' NOT NULL,
	"brand_tagline" text DEFAULT 'Trade Smart • Grow Faster' NOT NULL,
	"brand_description" text DEFAULT 'AI-powered trading analysis, market insights and portfolio management for smarter investing.' NOT NULL,
	"brand_logo_url" text,
	"market_status_text" text DEFAULT 'Market Open' NOT NULL,
	"system_status_text" text DEFAULT 'All Systems Online' NOT NULL,
	"newsletter_title" text DEFAULT 'Get Updates' NOT NULL,
	"newsletter_description" text DEFAULT 'Subscribe for latest updates and market insights.' NOT NULL,
	"copyright_text" text DEFAULT '© 2026 AI Trade Master. All Rights Reserved.' NOT NULL,
	"risk_disclaimer" text DEFAULT 'Trading involves market risk' NOT NULL,
	"version" text DEFAULT 'Version 1.0.0' NOT NULL,
	"background_color" text DEFAULT '#030817' NOT NULL,
	"text_color" text DEFAULT '#94a3b8' NOT NULL,
	"border_color" text DEFAULT '#13233c' NOT NULL,
	"glow_enabled" boolean DEFAULT true NOT NULL,
	"footer_visible" boolean DEFAULT true NOT NULL,
	"live_data_label" text DEFAULT 'Live Data' NOT NULL,
	"connected_label" text DEFAULT 'Connected' NOT NULL,
	"updated_by" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"status" text DEFAULT 'SUBSCRIBED' NOT NULL,
	"source" text DEFAULT 'footer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" text DEFAULT 'website' NOT NULL,
	"label" text NOT NULL,
	"url" text DEFAULT '#' NOT NULL,
	"icon_key" text DEFAULT 'website' NOT NULL,
	"color" text DEFAULT '#22d3ee' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "footer_links" ADD CONSTRAINT "footer_links_section_id_footer_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."footer_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "footer_links_section_idx" ON "footer_links" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "footer_sections_order_idx" ON "footer_sections" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "newsletter_email_idx" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "social_links_order_idx" ON "social_links" USING btree ("sort_order");