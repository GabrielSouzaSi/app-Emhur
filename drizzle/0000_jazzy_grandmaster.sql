CREATE TABLE `approachs` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text
);
--> statement-breakpoint
CREATE TABLE `inspectionLocations` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `inspections` (
	`id` integer PRIMARY KEY NOT NULL,
	`permitHolderId` text,
	`vehicle` text,
	`inspectionLocationId` text,
	`inspectionReasonId` text,
	`data` text,
	`hora` text,
	`advertising` text,
	`obs` text,
	`items` text DEFAULT (json_array()),
	`imagens` text DEFAULT (json_array()),
	`status` text
);
--> statement-breakpoint
CREATE TABLE `reasons` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`items` text DEFAULT (json_array())
);
--> statement-breakpoint
CREATE TABLE `violationsCode` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `violations` (
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
