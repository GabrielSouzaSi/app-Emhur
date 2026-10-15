CREATE TABLE `__new_inspections` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`inspection` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_inspections` (`id`, `user_id`, `inspection`)
SELECT
	`id`,
	0,
	json_object(
		'permitHolderId', CAST(`permitHolderId` AS integer),
		'vehicle', `vehicle`,
		'newVehicle', `newVehicle`,
		'inspectionLocationId', CAST(`inspectionLocationId` AS integer),
		'inspectionReasonId', CAST(`inspectionReasonId` AS integer),
		'data', `data`,
		'hora', `hora`,
		'advertising', `advertising`,
		'obs', `obs`,
		'items', COALESCE(json(`items`), json_array()),
		'imagens', COALESCE(json(`imagens`), json_array()),
		'status', `status`
	)
FROM `inspections`;
--> statement-breakpoint
DROP TABLE `inspections`;
--> statement-breakpoint
ALTER TABLE `__new_inspections` RENAME TO `inspections`;
