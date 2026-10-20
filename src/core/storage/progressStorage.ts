import type { Result } from '@/types/typing';
import type { PassCriteria } from '@/types/curriculum';
import { curriculum, defaultPassCriteria, levelOf } from '../constants/curriculum';

const STORAGE_KEY = 'ketikpro-v2-results';
const THEME_KEY = 'ketikpro-v2-theme';
const SOUND_KEY = 'ketikpro-v2-sound';
const CRITERIA_KEY = 'ketikpro-v2-criteria';

const memoryStore: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  if (typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStore[key] ?? null;
    }
  }
  return memoryStore[key] ?? null;
}

function setStorageItem(key: string, value: string): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, value);
    } catch {
      memoryStore[key] = value;
    }
  } else {
    memoryStore[key] = value;
  }
}

function removeStorageItem(key: string): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch {
      delete memoryStore[key];
    }
  } else {
    delete memoryStore[key];
  }
}

function dispatchStorageEvent(name: string): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new Event(name));
  }
}

export function loadResults(): Result[] {
  try {
    const raw = getStorageItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveResult(r: Result): void {
  const all = loadResults();
  all.push(r);
  setStorageItem(STORAGE_KEY, JSON.stringify(all));
  dispatchStorageEvent('ketikpro-progress-update');
}

export function stars(acc: number, wpm: number): number {
  if (acc >= 97 && wpm >= 25) return 3;
  if (acc >= 92) return 2;
  if (acc >= 80) return 1;
  return 0;
}

/** Memuat kriteria kelulusan yang telah dikonfigurasi pengguna dari storage */
export function loadPassCriteria(): Record<number, PassCriteria> {
  try {
    const raw = getStorageItem(CRITERIA_KEY);
    if (!raw) return defaultPassCriteria;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const merged: Record<number, PassCriteria> = { ...defaultPassCriteria };
      for (const [lvl, crit] of Object.entries(parsed)) {
        const numLvl = Number(lvl);
        if (numLvl >= 1 && numLvl <= 10 && crit && typeof (crit as PassCriteria).minAccuracy === 'number') {
          merged[numLvl] = {
            minAccuracy: Math.min(100, Math.max(0, (crit as PassCriteria).minAccuracy)),
            minWpm: Math.min(120, Math.max(0, (crit as PassCriteria).minWpm || 0)),
          };
        }
      }
      return merged;
    }
    return defaultPassCriteria;
  } catch {
    return defaultPassCriteria;
  }
}

/** Menyimpan kriteria kelulusan baru ke storage dan menyiarkan perubahan */
export function savePassCriteria(criteria: Record<number, PassCriteria>): void {
  setStorageItem(CRITERIA_KEY, JSON.stringify(criteria));
  dispatchStorageEvent('ketikpro-criteria-update');
  dispatchStorageEvent('ketikpro-progress-update');
}

/** Mengembalikan kriteria kelulusan ke standar default */
export function resetPassCriteria(): void {
  removeStorageItem(CRITERIA_KEY);
  dispatchStorageEvent('ketikpro-criteria-update');
  dispatchStorageEvent('ketikpro-progress-update');
}

/** Cek apakah hasil latihan memenuhi kriteria kelulusan (menggunakan kriteria aktif / konfigurasi pengguna) */
export function isPassed(r: Result, criteriaMap?: Record<number, PassCriteria>): boolean {
  const activeCriteria = criteriaMap ?? loadPassCriteria();
  const criteria = activeCriteria[levelOf(r.lessonId)];
  if (!criteria) return false;
  return r.accuracy >= criteria.minAccuracy && r.wpm >= criteria.minWpm;
}

export function passedIds(results: Result[], criteriaMap?: Record<number, PassCriteria>): Set<string> {
  return new Set(results.filter((r) => isPassed(r, criteriaMap)).map((r) => r.lessonId));
}

/** Level terbuka jika semua pelajaran di level sebelumnya telah lulus berdasarkan kriteria kelulusan aktif */
export function unlockedLevels(results: Result[], criteriaMap?: Record<number, PassCriteria>): Set<number> {
  const done = passedIds(results, criteriaMap);
  const open = new Set<number>([1]);

  for (let i = 0; i < curriculum.length - 1; i++) {
    const lv = curriculum[i]!;
    if (open.has(lv.level) && lv.lessons.every((l) => done.has(l.id))) {
      open.add(curriculum[i + 1]!.level);
    }
  }

  return open;
}

/** Backup & Restore */
export function exportProgressAsJson(): string {
  const data = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    results: loadResults(),
    criteria: loadPassCriteria(),
  };
  return JSON.stringify(data, null, 2);
}

export function importProgressFromJson(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && Array.isArray(parsed.results)) {
      setStorageItem(STORAGE_KEY, JSON.stringify(parsed.results));
      if (parsed.criteria && typeof parsed.criteria === 'object') {
        setStorageItem(CRITERIA_KEY, JSON.stringify(parsed.criteria));
      }
      dispatchStorageEvent('ketikpro-progress-update');
      dispatchStorageEvent('ketikpro-criteria-update');
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function resetAllProgress(): void {
  removeStorageItem(STORAGE_KEY);
  dispatchStorageEvent('ketikpro-progress-update');
}

/** Theme Preference */
export function loadThemePreference(): 'dark' | 'light' {
  const saved = getStorageItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function saveThemePreference(theme: 'dark' | 'light'): void {
  setStorageItem(THEME_KEY, theme);
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}

/** Sound Preference: 'mechanical' | 'thock' | 'typewriter' | 'off' */
export type SoundTheme = 'mechanical' | 'thock' | 'typewriter' | 'off';

export function loadSoundPreference(): SoundTheme {
  const saved = getStorageItem(SOUND_KEY);
  if (saved === 'mechanical' || saved === 'thock' || saved === 'typewriter' || saved === 'off') {
    return saved as SoundTheme;
  }
  return 'mechanical';
}

export function saveSoundPreference(sound: SoundTheme): void {
  setStorageItem(SOUND_KEY, sound);
}
