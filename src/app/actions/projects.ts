"use server";
import { db, ensureDb } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  await ensureDb();
  return db.select().from(projects).orderBy(projects.createdAt);
}

export async function getProject(id: number) {
  await ensureDb();
  const rows = await db.select().from(projects).where(eq(projects.id, id));
  return rows[0] ?? null;
}

export async function createProject(data: {
  name: string;
  address?: string;
  client?: string;
  status: "aktiv" | "abgeschlossen" | "pausiert";
  startDate?: string;
  endDate?: string;
  description?: string;
}) {
  await ensureDb();
  await db.insert(projects).values({ ...data, createdAt: new Date().toISOString() });
  revalidatePath("/projekte");
}

export async function updateProject(
  id: number,
  data: Partial<{
    name: string;
    address: string;
    client: string;
    status: "aktiv" | "abgeschlossen" | "pausiert";
    startDate: string;
    endDate: string;
    description: string;
  }>
) {
  await ensureDb();
  await db.update(projects).set(data).where(eq(projects.id, id));
  revalidatePath("/projekte");
  revalidatePath(`/projekte/${id}`);
}

export async function deleteProject(id: number) {
  await ensureDb();
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/projekte");
}
