CREATE TABLE `nes_lead_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lead_id` text NOT NULL,
	`kind` text NOT NULL,
	`channel` text,
	`body` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `nes_leads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `nes_lead_events_lead_id_idx` ON `nes_lead_events` (`lead_id`);--> statement-breakpoint
CREATE TABLE `nes_leads` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text,
	`email` text,
	`phone` text,
	`source` text DEFAULT 'manual' NOT NULL,
	`status` text DEFAULT 'nuevo' NOT NULL,
	`amount_usd` real,
	`notes` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `nes_leads_project_id_idx` ON `nes_leads` (`project_id`);--> statement-breakpoint
CREATE INDEX `nes_leads_project_status_idx` ON `nes_leads` (`project_id`,`status`);--> statement-breakpoint
CREATE TABLE `nes_organization_plans` (
	`organization_id` text PRIMARY KEY NOT NULL,
	`plan` text DEFAULT 'basico' NOT NULL,
	`channel_limit` integer DEFAULT 1 NOT NULL,
	`monthly_credits` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
