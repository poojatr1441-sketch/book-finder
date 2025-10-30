import React, { createContext, useEffect, useState, ReactNode } from "react";
/**
 * App-level primitive types
 * - Mode controls broader UI intent; studentMode is a boolean toggle that can be persisted separately.
 * - Book shape mirrors the OpenLibrary docs used throughout the app.
 */
export type Mode = "normal" | "student";
export type Theme = "light" | "dark";

export interface Book {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  subject?: string[];
  isbn?: string[];
  publisher?: string[];
  edition_key?: string[];
  has_fulltext?: boolean;
}

interface StudyNote {
  text: string;
  updatedAt: string;
}

interface AppContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  favorites: Book[];
  setFavorites: (b: Book[]) => void;
  repository: Book[]; // repository for student mode
  setRepository: (b: Book[]) => void;
  studentMode: boolean;
  setStudentMode: (v: boolean) => void;
  studyList: Book[];
  setStudyList: (b: Book[]) => void;
  studyNotes: Record<string, StudyNote>;
  setStudyNotes: (n: Record<string, StudyNote>) => void;
}

/**
 * Create the context; consumers should handle the undefined case.
 */
export const AppContext = createContext<AppContextValue | undefined>(undefined);
/* -------------------------
   LocalStorage keys
   ------------------------- */
/* Use explicit versioned keys so you can migrate data later if the shape changes. */
export const FAVORITES_KEY = "bookfinder_favorites_v1";
export const REPOSITORY_KEY = "bookfinder_repository_v1";
export const STUDENT_MODE_KEY = "bookfinder_student_mode_v1";
export const STUDY_LIST_KEY = "bookfinder_study_list_v1";
export const STUDY_NOTES_KEY = "bookfinder_study_notes_v1";
/* -------------------------
   Provider
   ------------------------- */
/**
 * AppProvider
 * - Manages app-wide state and persists selected parts to localStorage.
 * - Keep side effects (localStorage, DOM theme class) contained here rather than leaking into components.
 */
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [mode, setMode] = useState<Mode>("normal");

  const [favorites, setFavorites] = useState<Book[]>(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [repository, setRepository] = useState<Book[]>(() => {
    try {
      const raw = localStorage.getItem(REPOSITORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [studentMode, setStudentMode] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(STUDENT_MODE_KEY);
      return raw ? JSON.parse(raw) : false;
    } catch {
      return false;
    }
  });

  const [studyList, setStudyList] = useState<Book[]>(() => {
    try {
      const raw = localStorage.getItem(STUDY_LIST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [studyNotes, setStudyNotes] = useState<Record<string, StudyNote>>(
    () => {
      try {
        const raw = localStorage.getItem(STUDY_NOTES_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    }
  );
/* -------------------------
     Effects: persist changes to localStorage
     - Each effect is scoped to a single piece of state for clarity.
     - Errors are ignored so localStorage failures don't break the UI.
     ------------------------- */
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(REPOSITORY_KEY, JSON.stringify(repository));
    } catch {}
  }, [repository]);

  useEffect(() => {
    try {
      localStorage.setItem(STUDENT_MODE_KEY, JSON.stringify(studentMode));
    } catch {}
    setMode(studentMode ? "student" : "normal");
  }, [studentMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STUDY_LIST_KEY, JSON.stringify(studyList));
    } catch {}
  }, [studyList]);

  useEffect(() => {
    try {
      localStorage.setItem(STUDY_NOTES_KEY, JSON.stringify(studyNotes));
    } catch {}
  }, [studyNotes]);
/* -------------------------
     Effect: apply theme class to document root
     - Adding/removing a single 'dark' class lets Tailwind's dark mode styles respond.
     - Keep this side effect in the provider rather than in many components.
     ------------------------- */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);
/* -------------------------
     Provide context value
     - Expose both state and setters so consumers can read/update with minimal helpers.
     ------------------------- */
  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        mode,
        setMode,
        favorites,
        setFavorites,
        repository,
        setRepository,
        studentMode,
        setStudentMode,
        studyList,
        setStudyList,
        studyNotes,
        setStudyNotes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
