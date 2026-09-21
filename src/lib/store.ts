import { create } from "zustand";
import { supabase } from "./supabase";

export type Project = {
  id: string;
  name: string;
  address?: string;
  client?: string;
  status: "aktiv" | "pausiert" | "abgeschlossen";
  startDate?: string;
  endDate?: string;
  description?: string;
  createdAt: string;
};

export type Contact = {
  id: string;
  name: string;
  company?: string;
  role?: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
};

export type DiaryAttendee = {
  id: string;
  firmName: string;
  contactId?: string;
  personCount: number;
  activity: string;
  notes?: string;
};

export type DiaryEntry = {
  id: string;
  projectId: string;
  date: string;
  weather?: string;
  temperature?: number;
  workers?: number;
  activities?: string;
  notes?: string;
  chefNotes?: string;
  attendees?: DiaryAttendee[];
  createdAt: string;
};

// ── Mappers (snake_case → camelCase) ─────────────────────────────────────────

function mapProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    address: (row.address as string) ?? undefined,
    client: (row.client as string) ?? undefined,
    status: row.status as Project["status"],
    startDate: (row.start_date as string) ?? undefined,
    endDate: (row.end_date as string) ?? undefined,
    description: (row.description as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

function mapContact(row: Record<string, unknown>): Contact {
  return {
    id: row.id as string,
    name: row.name as string,
    company: (row.company as string) ?? undefined,
    role: (row.role as string) ?? undefined,
    phone: (row.phone as string) ?? undefined,
    email: (row.email as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

function mapDiaryEntry(row: Record<string, unknown>): DiaryEntry {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    date: row.date as string,
    weather: (row.weather as string) ?? undefined,
    temperature: row.temperature != null ? Number(row.temperature) : undefined,
    workers: row.workers != null ? Number(row.workers) : undefined,
    activities: (row.activities as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    chefNotes: (row.chef_notes as string) ?? undefined,
    attendees: (row.attendees as DiaryAttendee[]) ?? undefined,
    createdAt: row.created_at as string,
  };
}

// ── Store ────────────────────────────────────────────────────────────────────

type Store = {
  projects: Project[];
  contacts: Contact[];
  diary: DiaryEntry[];
  initialized: boolean;

  initializeFromSupabase: () => Promise<void>;
  clearData: () => void;

  addProject: (data: Omit<Project, "id" | "createdAt">) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  addContact: (data: Omit<Contact, "id" | "createdAt">) => Promise<void>;
  updateContact: (id: string, data: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;

  addDiaryEntry: (data: Omit<DiaryEntry, "id" | "createdAt">) => Promise<void>;
  updateDiaryEntry: (id: string, data: Partial<DiaryEntry>) => Promise<void>;
  deleteDiaryEntry: (id: string) => Promise<void>;
};

export const useStore = create<Store>()((set, get) => ({
  projects: [],
  contacts: [],
  diary: [],
  initialized: false,

  // ── Init / clear ────────────────────────────────────────────────────────────
  initializeFromSupabase: async () => {
    const [p, c, d] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("contacts").select("*").order("name"),
      supabase.from("diary_entries").select("*").order("date", { ascending: false }),
    ]);
    set({
      projects: (p.data ?? []).map(mapProject),
      contacts: (c.data ?? []).map(mapContact),
      diary: (d.data ?? []).map(mapDiaryEntry),
      initialized: true,
    });
  },

  clearData: () => set({ projects: [], contacts: [], diary: [], initialized: false }),

  // ── Projects ────────────────────────────────────────────────────────────────
  addProject: async (data) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const project: Project = { id, createdAt, ...data };
    set((s) => ({ projects: [project, ...s.projects] }));
    const { error } = await supabase.from("projects").insert({
      id, name: data.name, address: data.address ?? null,
      client: data.client ?? null, status: data.status,
      start_date: data.startDate ?? null, end_date: data.endDate ?? null,
      description: data.description ?? null, created_at: createdAt,
    });
    if (error) {
      set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
      console.error(error);
    }
  },

  updateProject: async (id, data) => {
    const prev = get().projects;
    set((s) => ({ projects: s.projects.map((p) => p.id === id ? { ...p, ...data } : p) }));
    const { error } = await supabase.from("projects").update({
      name: data.name, address: data.address ?? null,
      client: data.client ?? null, status: data.status,
      start_date: data.startDate ?? null, end_date: data.endDate ?? null,
      description: data.description ?? null,
    }).eq("id", id);
    if (error) { set(() => ({ projects: prev })); console.error(error); }
  },

  deleteProject: async (id) => {
    const prevProjects = get().projects;
    const prevDiary = get().diary;
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      diary: s.diary.filter((d) => d.projectId !== id),
    }));
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) { set(() => ({ projects: prevProjects, diary: prevDiary })); console.error(error); }
  },

  // ── Contacts ────────────────────────────────────────────────────────────────
  addContact: async (data) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const contact: Contact = { id, createdAt, ...data };
    set((s) => ({ contacts: [...s.contacts, contact] }));
    const { error } = await supabase.from("contacts").insert({
      id, name: data.name, company: data.company ?? null,
      role: data.role ?? null, phone: data.phone ?? null,
      email: data.email ?? null, notes: data.notes ?? null, created_at: createdAt,
    });
    if (error) {
      set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) }));
      console.error(error);
    }
  },

  updateContact: async (id, data) => {
    const prev = get().contacts;
    set((s) => ({ contacts: s.contacts.map((c) => c.id === id ? { ...c, ...data } : c) }));
    const { error } = await supabase.from("contacts").update({
      name: data.name, company: data.company ?? null, role: data.role ?? null,
      phone: data.phone ?? null, email: data.email ?? null, notes: data.notes ?? null,
    }).eq("id", id);
    if (error) { set(() => ({ contacts: prev })); console.error(error); }
  },

  deleteContact: async (id) => {
    const prev = get().contacts;
    set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) }));
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) { set(() => ({ contacts: prev })); console.error(error); }
  },

  // ── Diary ────────────────────────────────────────────────────────────────────
  addDiaryEntry: async (data) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const entry: DiaryEntry = { id, createdAt, ...data };
    set((s) => ({ diary: [entry, ...s.diary] }));
    const { error } = await supabase.from("diary_entries").insert({
      id, project_id: data.projectId, date: data.date,
      weather: data.weather ?? null, temperature: data.temperature ?? null,
      workers: data.workers ?? null, activities: data.activities ?? null,
      notes: data.notes ?? null, chef_notes: data.chefNotes ?? null,
      attendees: data.attendees ?? null, created_at: createdAt,
    });
    if (error) {
      set((s) => ({ diary: s.diary.filter((e) => e.id !== id) }));
      console.error(error);
    }
  },

  updateDiaryEntry: async (id, data) => {
    const prev = get().diary;
    set((s) => ({ diary: s.diary.map((e) => e.id === id ? { ...e, ...data } : e) }));
    const { error } = await supabase.from("diary_entries").update({
      date: data.date, weather: data.weather ?? null,
      temperature: data.temperature ?? null, workers: data.workers ?? null,
      activities: data.activities ?? null, notes: data.notes ?? null,
      chef_notes: data.chefNotes ?? null, attendees: data.attendees ?? null,
    }).eq("id", id);
    if (error) { set(() => ({ diary: prev })); console.error(error); }
  },

  deleteDiaryEntry: async (id) => {
    const prev = get().diary;
    set((s) => ({ diary: s.diary.filter((e) => e.id !== id) }));
    const { error } = await supabase.from("diary_entries").delete().eq("id", id);
    if (error) { set(() => ({ diary: prev })); console.error(error); }
  },
}));
