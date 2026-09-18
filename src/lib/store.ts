import { create } from "zustand";
import { persist } from "zustand/middleware";

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

type Store = {
  projects: Project[];
  contacts: Contact[];
  diary: DiaryEntry[];
  chefName: string;
  chefEmail: string;

  addProject: (data: Omit<Project, "id" | "createdAt">) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addContact: (data: Omit<Contact, "id" | "createdAt">) => void;
  updateContact: (id: string, data: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  addDiaryEntry: (data: Omit<DiaryEntry, "id" | "createdAt">) => void;
  updateDiaryEntry: (id: string, data: Partial<DiaryEntry>) => void;
  deleteDiaryEntry: (id: string) => void;

  setChefInfo: (info: { name?: string; email?: string }) => void;
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      projects: [],
      contacts: [],
      diary: [],
      chefName: "",
      chefEmail: "",

      addProject: (data) =>
        set((s) => ({
          projects: [
            ...s.projects,
            { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),
      updateProject: (id, data) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          diary: s.diary.filter((d) => d.projectId !== id),
        })),

      addContact: (data) =>
        set((s) => ({
          contacts: [
            ...s.contacts,
            { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),
      updateContact: (id, data) =>
        set((s) => ({
          contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      deleteContact: (id) =>
        set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),

      addDiaryEntry: (data) =>
        set((s) => ({
          diary: [
            ...s.diary,
            { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),
      updateDiaryEntry: (id, data) =>
        set((s) => ({
          diary: s.diary.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),
      deleteDiaryEntry: (id) =>
        set((s) => ({ diary: s.diary.filter((e) => e.id !== id) })),

      setChefInfo: (info) =>
        set((s) => ({
          chefName: info.name !== undefined ? info.name : s.chefName,
          chefEmail: info.email !== undefined ? info.email : s.chefEmail,
        })),
    }),
    { name: "buildframeos-data" }
  )
);
