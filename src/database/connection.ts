import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import * as reasonsSchema from "@/database/schemas/reasonsSchema"
import * as violationsCodeSchema from "@/database/schemas/violationsCodeSchema";
import * as violationSchema from "@/database/schemas/violationsSchema"
import * as approachSchema from "@/database/schemas/approachSchema"
import * as inspectionSchema from "@/database/schemas/inspectionsSchema"
import * as inspectionLocationsSchema from "@/database/schemas/InspectionLocationsSchema";

// Abrir conexão com o banco de dados
export const DATABASE_NAME = "databese.db";

// Criar a instância do Drizzle
export const expoDb = SQLite.openDatabaseSync(DATABASE_NAME);
export const db = drizzle(expoDb);

export const tableReason = drizzle(expoDb, { schema: reasonsSchema });
export const tableViolationsCode = drizzle(expoDb, { schema: violationsCodeSchema });
export const tableViolation = drizzle(expoDb, {schema: violationSchema});
export const tableApproach = drizzle(expoDb, {schema: approachSchema});
export const tableInspections = drizzle(expoDb, {schema: inspectionSchema});
export const tableInspectionLocations = drizzle(expoDb, {schema: inspectionLocationsSchema});