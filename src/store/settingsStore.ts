import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  isDarkMode: boolean;
  isSoundEnabled: boolean;
  showMistakes: boolean;
  errorLimitMode: boolean;
  toggleDarkMode: () => void;
  toggleSound: () => void;
  toggleShowMistakes: () => void;
  toggleErrorLimitMode: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      isSoundEnabled: true,
      showMistakes: true,
      errorLimitMode: true,
      toggleDarkMode: () => set((state) => {
        const newMode = !state.isDarkMode;
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDarkMode: newMode };
      }),
      toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
      toggleShowMistakes: () => set((state) => ({ showMistakes: !state.showMistakes })),
      toggleErrorLimitMode: () => set((state) => ({ errorLimitMode: !state.errorLimitMode })),
    }),
    {
      name: 'sudomaster-settings',
    }
  )
);
