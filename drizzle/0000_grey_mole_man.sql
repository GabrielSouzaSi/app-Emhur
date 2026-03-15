CREATE TABLE `approachs` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text
);
--> statement-breakpoint
CREATE TABLE `driverTypes` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `fundiaryInspections` (
	`id` integer PRIMARY KEY NOT NULL,
	`service_order_number` text,
	`process_number` text,
	`process_year` text,
	`requester_name` text,
	`requester_contact` text,
	`address` text,
	`address_number` text,
	`lot_number` text,
	`block_number` text,
	`area_registration_owner` text,
	`observations` text,
	`occupation_type_id` integer,
	`use_type_id` integer,
	`environmental_influence_type_id` integer,
	`front_photos` text,
	`edification_photos` text,
	`extra_photos` text,
	`port_photos` text,
	`perspective_photos` text,
	`latitude` text,
	`longitude` text,
	`date` text,
	`time` text,
	`confrontation_right` text,
	`confrontation_left` text,
	`confrontation_back` text,
	`zone` text
);
--> statement-breakpoint
CREATE TABLE `fundiaryOccupationType` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `fundiaryUseType` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text
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
CREATE TABLE `permitTypes` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text
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
	`description` text,
	`permit_types` text DEFAULT (json_array())
);
--> statement-breakpoint
CREATE TABLE `violations` (
	`id` integer PRIMARY KEY NOT NULL,
	`vehicle` text,
	`imagens` text DEFAULT (json_array()),
	`local` text,
	`driverTypeId` numeric,
	`driverName` text,
	`driverCPF` text,
	`driverCNH` text,
	`signatureUri` text,
	`latitude` text,
	`longitude` text,
	`data` text,
	`hora` text,
	`approach` integer,
	`idInfracao` text DEFAULT (json_array()),
	`obs` text,
	`status` text
);
