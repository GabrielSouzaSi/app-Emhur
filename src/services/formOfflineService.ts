import { db } from "@/database/connection"
import { formEntries } from "@/database/schemas/formEntriesSchema"
import { formMedia } from "@/database/schemas/formMediaSchema"
import { desc, eq } from "drizzle-orm"

export async function listOfflineEntries(schemaId?: string) {
    if (schemaId) {
        return db
            .select()
            .from(formEntries)
            .where(eq(formEntries.schemaId, schemaId))
            .orderBy(desc(formEntries.id))
    }

    return db.select().from(formEntries).orderBy(desc(formEntries.id))
}

export async function getOfflineEntryAll() {
    const entries = await db.select().from(formEntries).orderBy(desc(formEntries.id))

    if (!entries.length) return []

    return entries
}

export async function getOfflineEntryById(entryId: number) {
    const entries = await db.select().from(formEntries).where(eq(formEntries.id, entryId))
    const entry = entries[0]

    if (!entry) return null

    const media = await db.select().from(formMedia).where(eq(formMedia.formEntryId, entryId))

    return {
        ...entry,
        media,
    }
}