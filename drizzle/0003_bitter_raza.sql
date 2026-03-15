ALTER TABLE `form_entries` ADD `schema_version` text;--> statement-breakpoint
ALTER TABLE `form_entries` DROP COLUMN `method`;--> statement-breakpoint
ALTER TABLE `form_entries` DROP COLUMN `status`;--> statement-breakpoint
ALTER TABLE `form_entries` DROP COLUMN `remote_id`;