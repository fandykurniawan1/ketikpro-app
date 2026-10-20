import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, BookOpen, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { allLessons, levelOf, defaultPassCriteria } from '@/core/constants/curriculum';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useTypingSession } from '@/hooks/useTypingSession';
import { useSound } from '@/hooks/useSound';
import { HomeRowGuide } from '@/components/keyboard/HomeRowGuide';
import { VirtualKeyboard } from '@/components/keyboard/VirtualKeyboard';
import { MetricsBar } from '@/components/typing/MetricsBar';
import { TypingDisplay } from '@/components/typing/TypingDisplay';
import { ResultDialog } from '@/components/typing/ResultDialog';
import { LevelOneGuide } from '@/components/keyboard/LevelOneGuide';
import type { Stats } from '@/types/typing';

export const LessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { unlocked, saveSessionResult, stars, isPassed, criteria, results } = useUserProgress();
  const { triggerKeySound, triggerErrorSound, triggerSuccessSound } = useSound();

  const lesson = allLessons.find((l) => l.id === id);
  const lessonIndex = allLessons.findIndex((l) => l.id === id);
  const nextLesson = allLessons[lessonIndex + 1];

  const lessonResults = results.filter((r) => r.lessonId === id);
  const personalBestWpm = lessonResults.reduce((max, r) => Math.max(max, r.wpm), 0);

  const [finishedStats, setFinishedStats] = useState<Stats | null>(null);
  const [sessionWeakKeys, setSessionWeakKeys] = useState<Record<string, number>>({});
  const [showHints, setShowHints] = useState(!lesson?.blind);
  const [sessionKey, setSessionKey] = useState(0);
  const [showLevelOneReference, setShowLevelOneReference] = useState(false);

  const handleFinish = React.useCallback(
    (stats: Stats, weakKeys: Record<string, number>) => {
      if (!lesson) return;
      setFinishedStats(stats);
      setSessionWeakKeys(weakKeys);

      // Persist full result to storage
      saveSessionResult({
        lessonId: lesson.id,
        wpm: stats.wpm,
        cpm: stats.cpm,
        accuracy: stats.accuracy,
        errors: stats.errors,
        correctChars: stats.correctChars,
        keystrokes: stats.keystrokes,
        seconds: stats.seconds,
        date: Date.now(),
        weakKeys,
      });
    },
    [lesson, saveSessionResult]
  );

  const handleRetry = () => {
    setFinishedStats(null);
    setSessionWeakKeys({});
    setSessionKey((prev) => prev + 1);
  };

  const handleNext = () => {
    if (nextLesson) {
      setFinishedStats(null);
      setSessionWeakKeys({});
      setSessionKey(0);
      navigate(`/latihan/${nextLesson.id}`);
    }
  };

  // Typing session hook (called unconditionally)
  const {
    typed,
    firstWrong,
    wpm,
    cpm,
    accuracy,
    errors,
    correctCount,
    elapsedSeconds,
    progress,
    nextRequiredKey,
    hit,
    isStarted,
    isPaused,
    isDone,
    correction,
    inputRef,
    resetSession,
    togglePause,
    toggleCorrection,
  } = useTypingSession({
    text: lesson?.text ?? '',
    timeLimit: lesson?.timeLimit,
    initialCorrection: lesson?.correction ?? false,
    requireCompleteText: true, // Never finish lesson on timer expiry if text remains
    onFinish: handleFinish,
    triggerKeySound,
    triggerErrorSound,
    triggerSuccessSound,
  });

  if (!lesson) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-card max-w-lg mx-auto mt-12">
        <h2 className="text-2xl font-bold text-foreground">Pelajaran Tidak Ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">ID materi latihan yang Anda tuju tidak valid.</p>
        <Link
          to="/belajar"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <BookOpen className="h-4 w-4" />
          Kembali ke Kurikulum
        </Link>
      </div>
    );
  }

  const currentLevel = levelOf(lesson.id);
  const currentCriteria = criteria[currentLevel] ?? defaultPassCriteria[currentLevel]!;
  const isLevelLocked = !unlocked.has(currentLevel);

  const sessionStars = finishedStats ? stars(finishedStats.accuracy, finishedStats.wpm) : 0;
  const passedThisSession = finishedStats
    ? isPassed({ lessonId: lesson.id, ...finishedStats, date: 0 })
    : false;

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/belajar"
            className="rounded-xl border border-border bg-card p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-sm"
            title="Kembali ke Kurikulum"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="font-mono text-xs font-semibold text-primary uppercase">
              Pelajaran {lesson.id} · Level {currentLevel}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {lesson.title}
            </h1>
          </div>
        </div>

        <div className="hidden sm:block text-right">
          <div className="text-xs text-muted-foreground">Target Kelulusan:</div>
          <div className="text-xs font-semibold text-foreground">
            Akurasi ≥ {currentCriteria.minAccuracy}%{currentCriteria.minWpm > 0 ? ` · ≥ ${currentCriteria.minWpm} WPM` : ''}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground max-w-2xl">
          {lesson.desc}
        </p>

        {currentLevel === 1 && (
          <button
            onClick={() => setShowLevelOneReference((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors self-start shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{showLevelOneReference ? 'Tutup Panduan Ergonomi' : 'Buka Panduan Ergonomi'}</span>
            {showLevelOneReference ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* Level 1 Quick Reference Accordion if toggled */}
      {currentLevel === 1 && showLevelOneReference && (
        <div className="animate-in fade-in zoom-in-98 duration-200">
          <LevelOneGuide />
        </div>
      )}

      {/* Screen Content: Locked OR Finished OR Active Session */}
      {isLevelLocked ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-card">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-foreground">Level {currentLevel} Masih Terkunci</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Anda harus menyelesaikan dan lulus semua pelajaran pada Level {currentLevel - 1} sesuai kriteria kelulusan aktif untuk membuka level ini.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/belajar"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
            >
              <BookOpen className="h-4 w-4" />
              Buka Daftar Kurikulum
            </Link>
            <Link
              to="/pengaturan"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted"
            >
              Ubah Kriteria di Pengaturan
            </Link>
          </div>
        </div>
      ) : finishedStats ? (
        <ResultDialog
          stats={finishedStats}
          starsCount={sessionStars}
          isPassed={passedThisSession}
          minWpm={currentCriteria.minWpm}
          minAccuracy={currentCriteria.minAccuracy}
          personalBestWpm={personalBestWpm}
          weakKeys={sessionWeakKeys}
          onRetry={handleRetry}
          onNext={nextLesson ? handleNext : undefined}
          onBackToCurriculum={() => navigate('/belajar')}
        />
      ) : (
        <div key={sessionKey} className="space-y-6">
          {/* Home row guide if specified */}
          {lesson.guide && <HomeRowGuide activeChar={nextRequiredKey} />}

          {/* Real-time Metrics bar */}
          <MetricsBar
            wpm={wpm}
            cpm={cpm}
            accuracy={accuracy}
            errors={errors}
            correctCount={correctCount}
            totalChars={lesson.text.length}
            elapsedSeconds={elapsedSeconds}
            timeLimit={lesson.timeLimit}
            progress={progress}
            isPaused={isPaused}
            personalBestWpm={personalBestWpm}
          />

          {/* Typing Area Display with full controls: Mulai, Jeda, Ulangi, Keluar, dan Koreksi */}
          <TypingDisplay
            text={lesson.text}
            typed={typed}
            firstWrong={firstWrong}
            isStarted={isStarted}
            isPaused={isPaused}
            isDone={isDone}
            correction={correction}
            isBlind={lesson.blind}
            showHints={showHints}
            inputRef={inputRef}
            onToggleHints={() => setShowHints((prev) => !prev)}
            onReset={resetSession}
            onTogglePause={togglePause}
            onToggleCorrection={toggleCorrection}
            onExit={() => navigate('/belajar')}
          />

          {/* Virtual Keyboard */}
          {showHints && !lesson.blind ? (
            <VirtualKeyboard
              nextChar={nextRequiredKey}
              hit={hit}
              initialMode={lesson.blind ? 'blind' : 'full'}
            />
          ) : (
            <p className="text-center text-xs sm:text-sm text-muted-foreground py-4">
              {lesson.blind
                ? 'Mode Tanpa Petunjuk — Percaya sepenuhnya pada memori jari Anda tanpa melihat keyboard.'
                : 'Keyboard visual disembunyikan. Klik ikon mata untuk memunculkannya kembali.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
