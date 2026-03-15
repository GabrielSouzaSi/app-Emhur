CREATE TABLE `form_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`schema_id` text NOT NULL,
	`title` text,
	`endpoint` text NOT NULL,
	`method` text DEFAULT 'POST' NOT NULL,
	`data` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`remote_id` text,
	`error_message` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `form_media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`form_entry_id` integer NOT NULL,
	`field_name` text NOT NULL,
	`uri` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`created_at` text NOT NULL
);
