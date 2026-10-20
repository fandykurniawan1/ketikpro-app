import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, RotateCcw, Zap } from 'lucide-react';
import { testTexts } from '@/core/constants/curriculum';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useTypingSession } from '@/hooks/useTypingSession';
import { useSound } from '@/hooks/useSound';
import { MetricsBar } from '@/components/typing/MetricsBar';
import { TypingDisplay } from '@/components/typing/TypingDisplay';
import { VirtualKeyboard } from '@/components/keyboard/VirtualKeyboard';
import type { Stats } from '@/types/typing';

export const SpeedTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [textIndex, setTextIndex] = useState(0);
  const [sessionRound, setSessionRound] = useState(0);
  const [testResult, setTestResult] = useState<Stats | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(true);

  const { saveSessionResult } = useUserProgress();
  const { triggerKeySound, triggerErrorSound, triggerSuccessSound } = useSound();

  const currentText = testTexts[textIndex % testTexts.length]!;

  const handleFinish = (stats: Stats, weakKeys: Record<string, number>) => {
    setTestResult(stats);
    saveSessionResult({
      lessonId: 'tes-kecepatan',
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
  };

  const handleRestart = () => {
    setTestResult(null);
    setTextIndex((prev) => prev + 1);
    setSessionRound((prev) => prev + 1);
  };

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
    text: currentText,
    timeLimit: 60,
    requireCompleteText: false, // In 60s sprint test, stops when 60s expires
    onFinish: handleFinish,
    triggerKeySound,
    triggerErrorSound,
    triggerSuccessSound,
  });

  const getSpeedTier = (speedWpm: number) => {
    if (speedWpm >= 70) return { title: 'Kecepatan Master / Pro 🚀', desc: 'Kecepatan mengetik luar biasa, jauh di atas rata-rata profesional digital.' };
    if (speedWpm >= 50) return { title: 'Cepat & Fasih ⚡', desc: 'Ritme mengetik Anda sangat produktif dan tangkas.' };
    if (speedWpm >= 30) return { title: 'Kecepatan Rata-rata 💡', desc: 'Kemampuan mengetik yang baik untuk kebutuhan harian dan perkantoran.' };
    return { title: 'Tahap Membangun Akurasi 🌱', desc: 'Teruslah berlatih secara konsisten setiap hari selama 15 menit.' };
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-300">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
          <Timer className="h-4 w-4" />
          <span>Tes Kecepatan Mengetik 60 Detik</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">
          Ukur WPM Anda
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Waktu berjalan 60 detik begitu Anda mengetik huruf pertama. Ketik setepat dan secepat mungkin!
        </p>
      </div>

      {testResult ? (
        /* Result Screen */
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center shadow-card animate-in zoom-in-95 duration-200">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-4">
            <Zap className="h-8 w-8" />
          </div>

          <div className="font-mono text-6xl sm:text-7xl font-extrabold text-primary tracking-tight">
            {testResult.wpm}
          </div>
          <div className="text-sm sm:text-base font-semibold text-foreground mt-2">
            Kata Per Menit (WPM)
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-6 font-mono text-sm text-muted-foreground">
            <div>Akurasi: <b className="text-foreground">{testResult.accuracy}%</b></div>
            <div>•</div>
            <div>Salah: <b className="text-destructive">{testResult.errors} karakter</b></div>
            <div>•</div>
            <div>Durasi: <b className="text-foreground">{testResult.seconds}s</b></div>
          </div>

          {/* Speed Tier Explanation */}
          <div className="mt-8 mx-auto max-w-md rounded-xl border border-border bg-muted/30 p-4">
            <div className="font-bold text-foreground text-base">
              {getSpeedTier(testResult.wpm).title}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getSpeedTier(testResult.wpm).desc}
            </p>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
            >
              <RotateCcw className="h-4 w-4" />
              Mulai Tes Ulang
            </button>
            <button
              onClick={() => navigate('/belajar')}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Ke Kurikulum
            </button>
          </div>
        </div>
      ) : (
        /* Active Test Session */
        <div key={sessionRound} className="space-y-6">
          <MetricsBar
            wpm={wpm}
            cpm={cpm}
            accuracy={accuracy}
            errors={errors}
            correctCount={correctCount}
            totalChars={currentText.length}
            elapsedSeconds={elapsedSeconds}
            timeLimit={60}
            progress={progress}
            isPaused={isPaused}
          />

          <TypingDisplay
            text={currentText}
            typed={typed}
            firstWrong={firstWrong}
            isStarted={isStarted}
            isPaused={isPaused}
            isDone={isDone}
            correction={correction}
            showHints={showKeyboard}
            inputRef={inputRef}
            onToggleHints={() => setShowKeyboard((prev) => !prev)}
            onReset={resetSession}
            onTogglePause={togglePause}
            onToggleCorrection={toggleCorrection}
            onExit={() => navigate('/belajar')}
          />

          {showKeyboard && (
            <VirtualKeyboard nextChar={nextRequiredKey} hit={hit} />
          )}
        </div>
      )}
    </div>
  );
};
