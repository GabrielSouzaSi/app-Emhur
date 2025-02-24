CREATE TABLE `approachs` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text
);
--> statement-breakpoint
CREATE TABLE `autuacoes` (
	`id` integer PRIMARY KEY NOT NULL,
	`vehicle` text,
	`imagens` text DEFAULT (json_array()),
	`local` text,
	`latitude` text,
	`longitude` text,
	`data` text,
	`hora` text,
	`approach` integer,
	`idInfracao` integer,
	`obs` text,
	`status` text
);
--> statement-breakpoint
CREATE TABLE `infracoes` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text,
	`description` text
);
