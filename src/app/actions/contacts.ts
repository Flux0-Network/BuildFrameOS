"use server";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getContacts() {
  return db.select().from(contacts).orderBy(contacts.name);
}

export async function createContact(data: {
  name: string;
  company?: string;
  role?: string;
  phone?: string;
  email?: string;
  notes?: string;
}) {
  await db.insert(contacts).values({ ...data, createdAt: new Date().toISOString() });
  revalidatePath("/kontakte");
}

export async function updateContact(
  id: number,
  data: Partial<{
    name: string;
    company: string;
    role: string;
    phone: string;
    email: string;
    notes: string;
  }>
) {
  await db.update(contacts).set(data).where(eq(contacts.id, id));
  revalidatePath("/kontakte");
}

export async function deleteContact(id: number) {
  await db.delete(contacts).where(eq(contacts.id, id));
  revalidatePath("/kontakte");
}
