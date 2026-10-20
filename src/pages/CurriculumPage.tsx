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
} from 'lucide-react';
import { curriculum, defaultPassCriteria } from '@/core/constants/curriculum';
import { useUserProgress } from '@/hooks/useUserProgress';
import { LevelOneGuide } from '@/components/keyboard/LevelOneGuide';

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
            <span>Panduan Level 1: Pengenalan Keyboard, Postur, & Penanda F/J</span>
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
                className={`grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 ${
                  isOpen ? '' : 'pointer-events-none opacity-45'
                }`}
              >
                {lv.lessons.map((lesson) => {
                  const isDone = passed.has(lesson.id);
                  const stars = getBestStars(lesson.id);

                  return (
                    <Link
                      key={lesson.id}
                      to={`/latihan/${lesson.id}`}
                      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-card hover:-translate-y-1 hover:border-primary/60 transition-all duration-200"
                    >
                      <div>
                        {/* Top bar with Lesson ID and Stars */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                            <span>Pelajaran {lesson.id}</span>
                            {isDone && <Check className="h-4 w-4 text-success" />}
                          </span>

                          <div className="flex items-center gap-0.5">
                            {[0, 1, 2].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`h-3.5 w-3.5 ${
                                  starIdx < stars
                                    ? 'fill-primary text-primary'
                                    : 'text-border stroke-1'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Title and description */}
                        <h3 className="mt-2 text-base font-bold text-foreground group-hover:text-primary transition-colors">
                          {lesson.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {lesson.desc}
                        </p>
                      </div>

                      {/* Keys badges & special badges */}
                      <div className="mt-4 flex flex-wrap items-center gap-1 pt-2 border-t border-border/50">
                        {lesson.blind && (
                          <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-500 uppercase">
                            Tanpa Petunjuk
                          </span>
                        )}
                        {lesson.correction && (
                          <span className="rounded bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-500 uppercase">
                            Wajib Backspace
                          </span>
                        )}
                        {lesson.timeLimit && (
                          <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-500 uppercase">
                            Waktu {lesson.timeLimit / 60}m
                          </span>
                        )}
                        {lesson.keys &&
                          lesson.keys
                            .split('')
                            .slice(0, 8)
                            .map((k, idx) => (
                              <kbd
                                key={idx}
                                className="rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] uppercase font-semibold text-foreground"
                              >
                                {k === ' ' ? 'Spasi' : k}
                              </kbd>
                            ))}
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
