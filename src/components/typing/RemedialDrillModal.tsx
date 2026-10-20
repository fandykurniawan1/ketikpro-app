import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { generateRemedialDrill, type RemedialDrill } from '@/core/engine/evaluationEngine';
import { useTypingSession } from '@/hooks/useTypingSession';
import { useSound } from '@/hooks/useSound';
import { TypingDisplay } from '@/components/typing/TypingDisplay';
import { VirtualKeyboard } from '@/components/keyboard/VirtualKeyboard';
import { MetricsBar } from '@/components/typing/MetricsBar';
import type { Stats } from '@/types/typing';

interface RemedialDrillModalProps {
  keys: string[];
  isOpen: boolean;
  onClose: () => void;
  onDrillComplete?: (stats: Stats) => void;
}

export const RemedialDrillModal: React.FC<RemedialDrillModalProps> = ({
  keys,
  isOpen,
  onClose,
  onDrillComplete,
}) => {
  const [drillKey, setDrillKey] = useState(0);
  const [drill] = useState<RemedialDrill>(() => generateRemedialDrill(keys));
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedStats, setCompletedStats] = useState<Stats | null>(null);

  const { triggerKeySound, triggerErrorSound, triggerSuccessSound } = useSound();

  const handleFinish = React.useCallback(
    (stats: Stats) => {
      setIsCompleted(true);
      setCompletedStats(stats);
      if (onDrillComplete) {
        onDrillComplete(stats);
      }
    },
    [onDrillComplete]
  );

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
    text: drill.text,
    requireCompleteText: true,
    initialCorrection: true,
    onFinish: handleFinish,
    triggerKeySound,
    triggerErrorSound,
    triggerSuccessSound,
  });

  const handleRestart = () => {
    setIsCompleted(false);
    setCompletedStats(null);
    setDrillKey((prev) => prev + 1);
    resetSession();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl my-8 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/60 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Latihan Tambahan / Remedial Otomatis</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {drill.title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {drill.desc}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content: Completed Screen OR Active Typing Screen */}
        {isCompleted && completedStats ? (
          <div className="rounded-2xl border border-border bg-muted/20 p-8 text-center space-y-5 animate-in zoom-in-95">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-success/15 text-success">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-foreground">
                Latihan Remedial Selesai! 🎉
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Memori otot untuk tombol <b>{drill.targetKeys.map((k) => k.toUpperCase()).join(', ')}</b> kini semakin terasah dan terbiasa.
              </p>
            </div>

            {/* Results Grid */}
            <div className="mx-auto grid max-w-md grid-cols-3 gap-3 font-mono">
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="text-2xl font-bold text-primary">{completedStats.wpm}</div>
                <div className="text-[11px] font-sans text-muted-foreground uppercase font-medium">WPM</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="text-2xl font-bold text-foreground">{completedStats.accuracy}%</div>
                <div className="text-[11px] font-sans text-muted-foreground uppercase font-medium">Akurasi</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="text-2xl font-bold text-foreground">{completedStats.errors}</div>
                <div className="text-[11px] font-sans text-muted-foreground uppercase font-medium">Salah</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-semibold hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Ulangi Remedial</span>
              </button>
              <button
                onClick={onClose}
                className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 shadow-sm"
              >
                Tutup & Lanjutkan
              </button>
            </div>
          </div>
        ) : (
          <div key={drillKey} className="space-y-5">
            {/* Real-time Metrics */}
            <MetricsBar
              wpm={wpm}
              cpm={cpm}
              accuracy={accuracy}
              errors={errors}
              correctCount={correctCount}
              totalChars={drill.text.length}
              elapsedSeconds={elapsedSeconds}
              progress={progress}
              isPaused={isPaused}
            />

            {/* Typing Display */}
            <TypingDisplay
              text={drill.text}
              typed={typed}
              firstWrong={firstWrong}
              isStarted={isStarted}
              isPaused={isPaused}
              isDone={isDone}
              correction={correction}
              showHints={true}
              inputRef={inputRef}
              onToggleHints={() => {}}
              onReset={resetSession}
              onTogglePause={togglePause}
              onToggleCorrection={toggleCorrection}
              onExit={onClose}
            />

            {/* Keyboard Guide */}
            <VirtualKeyboard nextChar={nextRequiredKey} hit={hit} />
          </div>
        )}
      </div>
    </div>
  );
};
