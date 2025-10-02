PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_violations` (
	`id` integer PRIMARY KEY NOT NULL,
	`vehicle` text,
	`imagens` text DEFAULT (json_array()),
	`local` text,
	`latitude` text,
	`longitude` text,
	`data` text,
	`hora` text,
	`approach` integer,
	`idInfracao` text DEFAULT (json_array()),
	`obs` text,
	`status` text
);
--> statement-breakpoint
INSERT INTO `__new_violations`("id", "vehicle", "imagens", "local", "latitude", "longitude", "data", "hora", "approach", "idInfracao", "obs", "status") SELECT "id", "vehicle", "imagens", "local", "latitude", "longitude", "data", "hora", "approach", "idInfracao", "obs", "status" FROM `violations`;--> statement-breakpoint
DROP TABLE `violations`;--> statement-breakpoint
ALTER TABLE `__new_violations` RENAME TO `violations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;