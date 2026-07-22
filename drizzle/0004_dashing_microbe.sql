CREATE TABLE `landSchemaForms` (
	`id` integer NOT NULL,
	`type_form_id` integer NOT NULL,
	`is_active` integer NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `landTypeForms` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`description` text
);
--> statement-breakpoint
DROP TABLE `fundiaryTypeForms`;