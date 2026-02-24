import * as approachSchema from "@/database/schemas/approachSchema";
import * as driverTypeSchema from "@/database/schemas/driverTypeSchema";
import * as fundiaryInspectionSchema from "@/database/schemas/fundiaryInspectionsSchema";
import * as fundiaryOccupationTypeSchema from "@/database/schemas/fundiaryOccupationTypeSchema";
import * as fundiaryUseTypeSchema from "@/database/schemas/fundiaryUseTypeSchema";
import * as inspectionLocationsSchema from "@/database/schemas/InspectionLocationsSchema";
import * as inspectionSchema from "@/database/schemas/inspectionsSchema";
import * as reasonsSchema from "@/database/schemas/reasonsSchema";
import * as violationsCodeSchema from "@/database/schemas/violationsCodeSchema";
import * as violationSchema from "@/database/schemas/violationsSchema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import * as permitType from "./schemas/permitTypeSchema";

// Abrir conexão com o banco de dados
export const DATABASE_NAME = "databese.db";

// Criar a instância do Drizzle
export const expoDb = SQLite.openDatabaseSync(DATABASE_NAME);
export const db = drizzle(expoDb);

export const tableReason = drizzle(expoDb, { schema: reasonsSchema });
export const tableViolationsCode = drizzle(expoDb, { schema: violationsCodeSchema });
export const tableViolation = drizzle(expoDb, { schema: violationSchema });
export const tableApproach = drizzle(expoDb, { schema: approachSchema });
export const tableDriverType = drizzle(expoDb, { schema: driverTypeSchema });
export const tableInspections = drizzle(expoDb, { schema: inspectionSchema });
export const tablePermitType = drizzle(expoDb, { schema: permitType });
export const tableInspectionLocations = drizzle(expoDb, { schema: inspectionLocationsSchema });
export const tableFundiaryOccupationType = drizzle(expoDb, { schema: fundiaryOccupationTypeSchema });
export const tableFundiaryUseType = drizzle(expoDb, { schema: fundiaryUseTypeSchema });
export const tableFundiaryInspection = drizzle(expoDb, { schema: fundiaryInspectionSchema });