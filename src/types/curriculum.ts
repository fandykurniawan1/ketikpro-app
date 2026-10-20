export interface Lesson {
  id: string;
  title: string;
  desc: string;
  keys: string;
  text: string;
  guide?: boolean;       // tampilkan panduan home row
  timeLimit?: number;    // batas waktu dalam detik
  correction?: boolean;  // jika salah, wajib dihapus dengan Backspace
  blind?: boolean;       // petunjuk keyboard di layar disembunyikan
}

export interface Level {
  level: number;
  title: string;
  desc: string;
  lessons: Lesson[];
}

export interface PassCriteria {
  minAccuracy: number;
  minWpm: number;
}

export type CriteriaPreset = 'santai' | 'standar' | 'ketat' | 'kustom';
