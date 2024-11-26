CREATE TABLE `autuacoes` (
	`id` integer PRIMARY KEY NOT NULL,
	`imagens` text DEFAULT (json_array()),
	`local` text,
	`latitude` text,
	`longitude` text,
	`data` text,
	`hora` text,
	`idInfracao` integer,
	`obs` text
);
--> statement-breakpoint
CREATE TABLE `infracoes` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text,
	`description` text
);
