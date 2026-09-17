"use server";
import { db, ensureDb } from "@/db";
import { diaryEntries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getDiaryEntries(projectId: number) {
  await ensureDb();
  return db
    .select()
    .from(diaryEntries)
    .where(eq(diaryEntries.projectId, projectId))
    .orderBy(diaryEntries.date);
}

export async function createDiaryEntry(data: {
  projectId: number;
  date: string;
  weather?: string;
  temperature?: number;
  workers?: number;
  activities?: string;
  notes?: string;
}) {
  await ensureDb();
  await db.insert(diaryEntries).values({ ...data, createdAt: new Date().toISOString() });
  revalidatePath(`/projekte/${data.projectId}`);
}

export async function updateDiaryEntry(
  id: number,
  projectId: number,
  data: Partial<{
    date: string;
    weather: string;
    temperature: number;
    workers: number;
    activities: string;
    notes: string;
  }>
) {
  await ensureDb();
  await db.update(diaryEntries).set(data).where(eq(diaryEntries.id, id));
  revalidatePath(`/projekte/${projectId}`);
}

export async function deleteDiaryEntry(id: number, projectId: number) {
  await ensureDb();
  await db.delete(diaryEntries).where(eq(diaryEntries.id, id));
  revalidatePath(`/projekte/${projectId}`);
}
