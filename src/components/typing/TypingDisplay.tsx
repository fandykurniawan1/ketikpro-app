import React, { useMemo, useState } from 'react';
import {
  RotateCcw,
  Play,
  Pause,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface TypingDisplayProps {
  text: string;
  typed: string;
  firstWrong: number;
  isStarted: boolean;
  isPaused: boolean;
  isDone: boolean;
  correction: boolean;
  isBlind?: boolean;
  showHints: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onToggleHints: () => void;
  onReset: () => void;
  onTogglePause: () => void;
  onToggleCorrection: () => void;
  onExit?: () => void;
}

export const TypingDisplay: React.FC<TypingDisplayProps> = ({
  text,
  typed,
  firstWrong,
  isStarted,
  isPaused,
  isDone,
  correction,
  isBlind = false,
  showHints,
  inputRef,
  onToggleHints,
  onReset,
  onTogglePause,
  onToggleCorrection,
  onExit,
}) => {
  const [isInputFocused, setIsInputFocused] = useState(true);

  // Keep input focused whenever window regains focus
  React.useEffect(() => {
    const handleWindowFocus = () => {
      if (inputRef.current) {
        inputRef.current.focus();
        setIsInputFocused(true);
      }
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [inputRef]);

  // Windowing for very long texts to avoid vertical scroll overflow while maintaining smooth typing
  const { visibleStart, visibleEnd, isLong } = useMemo(() => {
    const isLongText = text.length > 280;
    if (!isLongText) {
      return { visibleStart: 0, visibleEnd: text.length, isLong: false };
    }
    const start = Math.max(0, text.lastIndexOf(' ', Math.max(0, typed.length - 50)) + 1);
    const end = Math.min(text.length, start + 240);
    return { visibleStart: start, visibleEnd: end, isLong: true };
  }, [text, typed.length]);

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setIsInputFocused(true);
    }
    if (isPaused) {
      onTogglePause();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`relative rounded-3xl border-2 p-6 sm:p-8 shadow-card transition-all duration-200 cursor-text select-none ${
        isInputFocused
          ? 'border-primary/50 bg-card ring-2 ring-primary/10'
          : 'border-border bg-card/70 opacity-95'
      }`}
    >
      {/* Hidden Focus Trap Input for 100% Mobile & Accessibility Stability */}
      <input
        ref={inputRef}
        type="text"
        tabIndex={0}
        aria-label="Area Ketik Keyboard Fisik"
        className="sr-only opacity-0 pointer-events-none absolute"
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
        autoFocus
      />

      {/* Focus Alert if accidentally blurred */}
      {!isInputFocused && !isDone && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 animate-in fade-in">
          <span>⚠️ Fokus mengetik tidak aktif — klik di area ini atau tekan sembarang tombol untuk fokus kembali</span>
        </div>
      )}

      {/* Top Controls Toolbar: Mulai, Jeda, Ulangi, Keluar, dan Opsi Koreksi */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4 mb-5">
        {/* Left: Session Control Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mulai / Jeda / Lanjutkan Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePause();
            }}
            disabled={isDone}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isPaused
                ? 'bg-amber-500 text-white animate-pulse'
                : !isStarted
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'border border-border bg-muted/60 text-foreground hover:bg-muted'
            }`}
            title={!isStarted ? 'Mulai Sesi' : isPaused ? 'Lanjutkan Mengetik (Esc)' : 'Jeda Sesi (Esc)'}
          >
            {isPaused ? (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Lanjutkan</span>
                <kbd className="ml-0.5 rounded bg-black/25 px-1 py-0.2 text-[9px] font-mono font-bold uppercase text-white">Esc</kbd>
              </>
            ) : !isStarted ? (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Mulai</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 fill-current" />
                <span>Jeda</span>
                <kbd className="ml-0.5 rounded bg-muted-foreground/20 px-1 py-0.2 text-[9px] font-mono font-bold uppercase">Esc</kbd>
              </>
            )}
          </button>

          {/* Ulangi Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/40 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
            title="Ulangi latihan dari awal"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Ulangi</span>
          </button>

          {/* Keluar Button */}
          {onExit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExit();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/40 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
              title="Keluar ke daftar kurikulum"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          )}
        </div>

        {/* Right: Correction Mode Toggle & Hints Toggle */}
        <div className="flex items-center gap-2">
          {/* Toggle Koreksi Kesalahan */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCorrection();
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              correction
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
            }`}
            title="Klik untuk mengubah aturan koreksi kesalahan"
          >
            {correction ? (
              <>
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Koreksi: Wajib Backspace</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Koreksi: Bebas Lanjut</span>
              </>
            )}
          </button>

          {/* Toggle Sembunyikan/Tampilkan Keyboard Hints */}
          {!isBlind && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleHints();
              }}
              className="inline-flex items-center justify-center p-2 rounded-xl border border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={showHints ? 'Sembunyikan keyboard' : 'Tampilkan keyboard'}
              aria-label="Petunjuk Keyboard"
            >
              {showHints ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Typing Text Box Area */}
      <div className="relative">
        <p className="whitespace-pre-wrap font-mono text-2xl sm:text-3xl leading-relaxed tracking-wider select-none font-medium min-h-[90px]">
          {text.slice(visibleStart, visibleEnd).split('').map((char, index) => {
            const absoluteIndex = visibleStart + index;
            const isTyped = absoluteIndex < typed.length;
            const isCurrentCaret = absoluteIndex === typed.length;
            const isWrong = isTyped && typed[absoluteIndex] !== char;

            let charClassName = 'text-muted-foreground/40 transition-colors';
            if (isWrong) {
              charClassName =
                'rounded-md bg-destructive/25 text-destructive font-bold px-0.5 ring-1 ring-destructive/40';
            } else if (isTyped) {
              charClassName = 'text-success font-semibold';
            } else if (isCurrentCaret) {
              charClassName =
                'animated-caret rounded-md bg-primary/20 text-foreground font-bold px-0.5 shadow-xs';
            }

            // Special representations for whitespace and newline
            const displayChar =
              char === '\n'
                ? '↵\n'
                : char === ' ' && (isCurrentCaret || isWrong)
                ? '␣'
                : char;

            return (
              <span key={absoluteIndex} className={charClassName}>
                {displayChar}
              </span>
            );
          })}
          {isLong && visibleEnd < text.length && (
            <span className="text-muted-foreground/30"> …</span>
          )}
        </p>

        {/* Pause Translucent Blur Overlay */}
        {isPaused && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
              <Pause className="h-3.5 w-3.5" />
              <span>Sesi Latihan Sedang Dijeda</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Waktu latihan berhenti sementara. Tekan tombol <kbd className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border">Spasi</kbd> atau klik tombol di bawah untuk melanjutkan.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePause();
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Lanjutkan Mengetik
            </button>
          </div>
        )}
      </div>

      {/* Helpful Dynamic Alerts */}
      {firstWrong !== -1 && correction && (
        <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-destructive font-semibold animate-in fade-in duration-150">
          <span>⚠️ Ada salah ketik — tekan tombol</span>
          <kbd className="rounded border border-destructive/40 bg-destructive/15 px-2 py-0.5 font-mono text-xs font-bold uppercase shadow-xs">
            Backspace
          </kbd>
          <span>untuk menghapus sebelum melanjutkan.</span>
        </div>
      )}

      {!isStarted && (
        <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span>Letakkan 10 jari di posisi jangkar Home Row (A S D F — J K L ;), lalu mulai mengetik…</span>
        </div>
      )}
    </div>
  );
};
