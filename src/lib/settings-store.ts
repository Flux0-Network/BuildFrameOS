import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsStore = {
  chefName: string;
  chefEmail: string;
  setChefInfo: (info: { name?: string; email?: string }) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      chefName: "",
      chefEmail: "",
      setChefInfo: (info) =>
        set((s) => ({
          chefName: info.name !== undefined ? info.name : s.chefName,
          chefEmail: info.email !== undefined ? info.email : s.chefEmail,
        })),
    }),
    { name: "buildframeos-settings" }
  )
);
