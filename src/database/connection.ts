// src/database/connection.ts
import * as approachSchema from "@/database/schemas/approachSchema"
import * as driverTypeSchema from "@/database/schemas/driverTypeSchema"
import * as inspectionLocationsSchema from "@/database/schemas/InspectionLocationsSchema"
import * as inspectionSchema from "@/database/schemas/inspectionsSchema"
import * as reasonsSchema from "@/database/schemas/reasonsSchema"
import * as violationsCodeSchema from "@/database/schemas/violationsCodeSchema"
import * as violationSchema from "@/database/schemas/violationsSchema"

import * as fundiaryEnvironmentalInfluenceTypeSchema from "@/database/schemas/fundiaryEnvironmentalInfluenceTypeSchema"
import * as fundiaryInspectionSchema from "@/database/schemas/fundiaryInspectionsSchema"
import * as fundiaryOccupationTypeSchema from "@/database/schemas/fundiaryOccupationTypeSchema"
import * as fundiaryUseTypeSchema from "@/database/schemas/fundiaryUseTypeSchema"
import * as landSchemaFormSchema from "@/database/schemas/landSchemaFormSchema"
import * as landTypeFormSchema from "@/database/schemas/landTypeFormSchema"

import * as formEntriesSchema from "@/database/schemas/formEntriesSchema"
import * as formMediaSchema from "@/database/schemas/formMediaSchema"

import * as neighborhoodSchema from "@/database/schemas/neighborhoodSchema"

import { drizzle } from "drizzle-orm/expo-sqlite"
import * as SQLite from "expo-sqlite"
import * as permitType from "./schemas/permitTypeSchema"

// Abrir conexão com o banco de dados
export const DATABASE_NAME = "databese.db"

// Criar a instância do Drizzle
export const expoDb = SQLite.openDatabaseSync(DATABASE_NAME)
export const db = drizzle(expoDb, {
	schema: {
		...reasonsSchema,
		...violationsCodeSchema,
		...violationSchema,
		...approachSchema,
		...driverTypeSchema,
		...inspectionSchema,
		...permitType,
		...inspectionLocationsSchema,

		...landTypeFormSchema,
		...landSchemaFormSchema,

		...fundiaryInspectionSchema,
		...fundiaryOccupationTypeSchema,
		...fundiaryUseTypeSchema,
		...fundiaryEnvironmentalInfluenceTypeSchema,

		...formEntriesSchema,
		...formMediaSchema,

		...neighborhoodSchema,
	},
})
