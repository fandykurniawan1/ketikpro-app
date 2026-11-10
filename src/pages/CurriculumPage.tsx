import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  Check,
  Star,
  BookOpen,
  Sliders,
  Sparkles,
  Trophy,
  ChevronDown,
  ChevronUp,
  Monitor,
  PackageOpen,
  Search,
  Timer,
  Gamepad2,
  Home,
  Hand,
  Keyboard,
} from 'lucide-react';
import { curriculum, defaultPassCriteria } from '@/core/constants/curriculum';
import { useUserProgress } from '@/hooks/useUserProgress';
import { LevelOneGuide } from '@/components/keyboard/LevelOneGuide';

function getLessonVisual(title: string, keys: string) {
  const lower = title.toLowerCase();
  if (lower.includes('intro') || lower.includes('qwerty') || lower.includes('posisi duduk')) {
    return { type: 'intro' as const };
  }
  if (lower.includes('space') || lower.includes('spasi')) {
    return { type: 'space' as const };
  }
  if (lower.includes('review') || lower.includes('ulasan') || lower.includes('uji')) {
    return { type: 'review' as const };
  }
  if (lower.includes('practice') || lower.includes('latihan') || lower.includes('tes')) {
    return { type: 'practice' as const };
  }
  if (lower.includes('play') || lower.includes('game') || lower.includes('tantangan')) {
    return { type: 'play' as const };
  }
  if (lower.includes('sweet home') || lower.includes('rumah')) {
    return { type: 'home' as const };
  }
  if (lower.includes('l hand') || lower.includes('tangan kiri')) {
    return { type: 'hand-left' as const };
  }
  if (lower.includes('r hand') || lower.includes('tangan kanan')) {
    return { type: 'hand-right' as const };
  }
  if (lower.startsWith('keys') || lower.includes('tombol') || keys) {
    const cleanKeys = (keys || '').replace(/\s+/g, '');
    const displayKeys = cleanKeys ? cleanKeys.slice(0, 4) : 'Abc';
    return { type: 'keys' as const, display: displayKeys };
  }
  return { type: 'default' as const };
}

function renderVisual(v: ReturnType<typeof getLessonVisual>) {
  switch (v.type) {
    case 'intro':
      return (
        <div className="relative flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 text-primary">
          <Monitor className="h-5 w-5 stroke-[1.8]" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-black text-primary-foreground shadow-xs">
            T
          </span>
        </div>
      );
    case 'space':
      return (
        <div className="flex flex-col items-center justify-center h-11">
          <div className="h-1.5 w-6 rounded-xs border-2 border-foreground/70 bg-muted/40 mb-1 shadow-xs" />
          <PackageOpen className="h-6 w-6 text-muted-foreground/60 stroke-[1.5]" />
        </div>
      );
    case 'keys':
      return (
        <div className="flex flex-col items-center justify-center h-11">
          <span className="font-mono text-xs font-black tracking-wide text-foreground -mb-0.5">
            {v.display}
          </span>
          <PackageOpen className="h-6 w-6 text-muted-foreground/60 stroke-[1.5]" />
        </div>
      );
    case 'review':
      return (
        <div className="flex items-center justify-center h-11 w-11 text-muted-foreground/70">
          <Search className="h-6 w-6 stroke-[1.8]" />
        </div>
      );
    case 'practice':
      return (
        <div className="flex items-center justify-center h-11 w-11 text-muted-foreground/70">
          <Timer className="h-6 w-6 stroke-[1.8]" />
        </div>
      );
    case 'play':
      return (
        <div className="flex items-center justify-center h-11 w-11 text-amber-500">
          <Gamepad2 className="h-6 w-6 stroke-[1.8]" />
        </div>
      );
    case 'home':
      return (
        <div className="flex items-center justify-center h-11 w-11 text-primary">
          <Home className="h-6 w-6 stroke-[1.8]" />
        </div>
      );
    case 'hand-left':
    case 'hand-right':
      return (
        <div className="flex items-center justify-center h-11 w-11 text-primary">
          <Hand className="h-6 w-6 stroke-[1.8]" />
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center h-11 w-11 text-muted-foreground/70">
          <Keyboard className="h-6 w-6 stroke-[1.8]" />
        </div>
      );
  }
}

export const CurriculumPage: React.FC = () => {
  const { unlocked, passed, getBestStars, criteria } = useUserProgress();
  const [showLevelOneGuide, setShowLevelOneGuide] = useState(true);

  // Check if Level 10 is completed
  const level10 = curriculum.find((l) => l.level === 10);
  const isMasterPassed = level10 ? level10.lessons.every((l) => passed.has(l.id)) : false;

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <BookOpen className="h-4 w-4" />
            <span>Kurikulum Lengkap 10 Jari</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-1">
            Tahapan Belajar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Selesaikan setiap pelajaran bertahap untuk membuka level tantangan berikutnya.
          </p>
        </div>

        {/* Link to Configurable Criteria */}
        <Link
          to="/pengaturan"
          className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary transition-all self-start sm:self-center shadow-xs"
        >
          <Sliders className="h-4 w-4" />
          <span>Atur Kriteria Kelulusan</span>
        </Link>
      </div>

      {/* Master Completion Celebration Banner */}
      {isMasterPassed && (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/15 p-6 shadow-card flex flex-col sm:flex-row items-center gap-5 animate-in zoom-in-95 duration-300">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/20 text-amber-500 shrink-0">
            <Trophy className="h-9 w-9" />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              Gelar Kehormatan
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">
              Selamat! Anda Adalah Master Touch Typing 🏆
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Anda telah menuntaskan seluruh 10 level kurikulum pengetikan sepuluh jari tanpa melihat keyboard. Pertahankan refleks memori otot Anda dengan tes kecepatan rutin!
            </p>
          </div>
        </div>
      )}

      {/* Level 1 Orientation Guide Accordion */}
      <div className="space-y-3">
        <button
          onClick={() => setShowLevelOneGuide((prev) => !prev)}
          className="w-full flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:bg-muted/40 transition-colors shadow-xs"
        >
          <span className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Panduan Level 1: Home Row, Postur, & Penanda F/J</span>
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-normal">
            {showLevelOneGuide ? 'Sembunyikan Panduan' : 'Tampilkan Panduan'}
            {showLevelOneGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </button>

        {showLevelOneGuide && <LevelOneGuide />}
      </div>

      {/* Levels List */}
      <div className="space-y-10">
        {curriculum.map((lv) => {
          const isOpen = unlocked.has(lv.level);
          const levelCriteria = criteria[lv.level] ?? defaultPassCriteria[lv.level]!;

          return (
            <section key={lv.level} className="space-y-4">
              {/* Level Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    {!isOpen && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                    <span>Level {lv.level}</span>
                    <span className="font-normal normal-case text-muted-foreground tracking-normal">
                      · Syarat lulus: Akurasi ≥ {levelCriteria.minAccuracy}%
                      {levelCriteria.minWpm > 0 ? `, Kecepatan ≥ ${levelCriteria.minWpm} WPM` : ''}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">
                    {lv.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">{lv.desc}</p>
                </div>

                {!isOpen && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground self-start sm:self-center">
                    <Lock className="h-3 w-3" />
                    <span>Terkunci (Selesaikan Level {lv.level - 1})</span>
                  </div>
                )}
              </div>

              {/* Lessons Grid */}
              <div
                className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 ${
                  isOpen ? '' : 'pointer-events-none opacity-45'
                }`}
              >
                {lv.lessons.map((lesson, idx) => {
                  const isDone = passed.has(lesson.id);
                  const stars = getBestStars(lesson.id);
                  const lessonNum = String(idx + 1).padStart(2, '0');
                  const visual = getLessonVisual(lesson.title, lesson.keys);

                  const isFirstUnfinished =
                    isOpen &&
                    !isDone &&
                    (idx === 0 || passed.has(lv.lessons[idx - 1]!.id));

                  return (
                    <Link
                      key={lesson.id}
                      to={`/latihan/${lesson.id}`}
                      title={`${lesson.title}\n${lesson.desc}`}
                      className={`group relative flex flex-col justify-between rounded-2xl border bg-card p-3.5 shadow-card hover:-translate-y-1 hover:border-primary/60 transition-all duration-200 min-h-[148px] ${
                        isFirstUnfinished
                          ? 'ring-2 ring-foreground/90 dark:ring-primary border-foreground/80 dark:border-primary/80 shadow-md'
                          : 'border-border'
                      }`}
                    >
                      {/* Top Bar: Number 01-23 and Lock if locked */}
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono text-xs font-black text-muted-foreground group-hover:text-primary transition-colors">
                          {lessonNum}
                        </span>
                        {!isOpen && (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                        )}
                      </div>

                      {/* Center Illustration */}
                      <div className="flex flex-col items-center justify-center my-1.5 flex-1">
                        {renderVisual(visual)}

                        {/* Status Checkmark or Stars */}
                        <div className="mt-1 flex items-center justify-center min-h-[18px]">
                          {isDone ? (
                            stars > 0 ? (
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`h-2.5 w-2.5 ${
                                      s <= (stars > 2 ? 5 : stars * 2)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-border stroke-1'
                                    }`}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="grid h-4.5 w-4.5 place-items-center rounded-full bg-emerald-500 text-white shadow-xs">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                            )
                          ) : null}
                        </div>
                      </div>

                      {/* Bottom Title */}
                      <div className="pt-2 border-t border-border/50 w-full text-center">
                        <h4
                          className="text-[11px] sm:text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate"
                          title={lesson.title}
                        >
                          {lesson.title}
                        </h4>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
