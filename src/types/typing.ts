export interface Stats {
  wpm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  keystrokes: number;
  seconds: number;
}

export interface HitState {
  key: string;
  ok: boolean;
  timestamp: number;
  expected?: string;
}

export interface KeyDef {
  id: string;
  label: string;
  subLabel?: string;
  w?: string;
  finger: number;
  hand?: 'left' | 'right' | 'thumb';
  isAnchor?: boolean;
}

export interface Result {
  lessonId: string;
  wpm: number;
  cpm?: number;
  accuracy: number;
  errors: number;
  correctChars?: number;
  keystrokes?: number;
  seconds?: number;
  date: number;
  weakKeys?: Record<string, number>;
}
