ALTER TABLE `violations` RENAME COLUMN "assistenteName" TO "driverCPF";--> statement-breakpoint
ALTER TABLE `violations` RENAME COLUMN "assistenteCPF" TO "driverCNH";--> statement-breakpoint
ALTER TABLE `violations` ADD `driverTypeId` numeric;--> statement-breakpoint
ALTER TABLE `violations` ADD `driverName` text;--> statement-breakpoint
ALTER TABLE `violations` DROP COLUMN `assistenteCNH`;