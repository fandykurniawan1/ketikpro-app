import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Keyboard,
  Anchor,
  Hand,
  Check,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '@/hooks/useSound';

interface NewKeyIntroGuideProps {
  lessonId?: string;
  lessonTitle: string;
  keys?: string[];
  isOpen?: boolean;
  onToggleOpen?: () => void;
  onWarmupComplete?: () => void;
}

export const NewKeyIntroGuide: React.FC<NewKeyIntroGuideProps> = ({
  lessonId,
  lessonTitle,
  keys = ['a', ';'],
  isOpen = true,
  onToggleOpen,
  onWarmupComplete,
}) => {
  const [warmupStep, setWarmupStep] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('Tekan tombol A menggunakan jari kelingking tangan kiri Anda.');

  const { triggerKeySound, triggerErrorSound, triggerSuccessSound } = useSound();

  // Reset interactive warmup
  const handleResetWarmup = useCallback(() => {
    setWarmupStep(0);
    setIsCompleted(false);
    setLastKeyPressed(null);
    setFeedbackMsg('Tekan tombol A menggunakan jari kelingking tangan kiri Anda.');
  }, []);

  // Keyboard listener specifically for the interactive warmup steps
  useEffect(() => {
    if (!isOpen || isCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting browser shortcuts
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.isComposing) return;

      const key = e.key.toLowerCase();
      setLastKeyPressed(key);

      if (warmupStep === 0) {
        // Step 1: Expect key 'a'
        if (key === 'a') {
          e.preventDefault();
          triggerKeySound();
          setWarmupStep(1);
          setFeedbackMsg('Bagus sekali! Kelingking kiri telah merasakan posisi tuts A. Sekarang tekan tuts titik koma (;) dengan kelingking kanan.');
        } else if (key === ';' || key === 's' || key === 'd' || key === 'f') {
          triggerErrorSound();
          setFeedbackMsg('Hampir tepat! Yang sedang dilatih adalah tombol A (paling kiri) menggunakan jari kelingking tangan kiri.');
        }
      } else if (warmupStep === 1) {
        // Step 2: Expect key ';'
        if (key === ';') {
          e.preventDefault();
          triggerKeySound();
          setWarmupStep(2);
          setFeedbackMsg('Hebat! Kelingking kanan telah mantap di tuts (;). Terakhir, tekan tombol Spasi menggunakan ibu jari.');
        } else if (key === 'a' || key === 'l' || key === 'k' || key === 'j') {
          triggerErrorSound();
          setFeedbackMsg('Gunakan jari kelingking tangan kanan untuk menekan tombol titik koma (;) di sebelah kanan tombol L.');
        }
      } else if (warmupStep === 2) {
        // Step 3: Expect key Space (' ')
        if (key === ' ' || key === 'spacebar') {
          e.preventDefault();
          triggerSuccessSound();
          setWarmupStep(3);
          setIsCompleted(true);
          setFeedbackMsg('Luar biasa! Seluruh 8 tombol utama Home Row (A S D F — J K L ;) kini telah lengkap dan memori otot Anda siap berlatih.');

          try {
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch {
            // Ignore if canvas is not available
          }

          if (onWarmupComplete) {
            onWarmupComplete();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, warmupStep, isCompleted, triggerKeySound, triggerErrorSound, triggerSuccessSound, onWarmupComplete]);

  return (
    <div className="rounded-3xl border border-primary/30 bg-gradient-to-b from-card via-card/95 to-primary/5 shadow-card overflow-hidden transition-all duration-300">
      {/* Header Bar with Accordion Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/30 px-2 py-0.2 text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Pengenalan Tuts Baru
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                {lessonId ? `Pelajaran ${lessonId} · ` : ''}{lessonTitle}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight mt-0.5">
              Alur Perkenalan Tombol {keys.map((k) => (k === ';' ? ';' : k.toUpperCase())).join(' & ')} (Kelingking Kiri & Kanan)
            </h3>
          </div>
        </div>

        {onToggleOpen && (
          <button
            onClick={onToggleOpen}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors self-start sm:self-center shadow-xs"
          >
            <span>{isOpen ? 'Sembunyikan Panduan' : 'Buka Panduan Tuts Baru'}</span>
            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Expandable Content Area */}
      {isOpen && (
        <div className="p-5 sm:p-6 space-y-6 animate-in fade-in duration-200">
          {/* Main Key Introductions: Left Pinky (A) and Right Pinky (;) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Pinky - Key A */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 rounded-bl-xl bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300 uppercase">
                Tangan Kiri · Jari 0
              </div>

              <div className="flex items-start gap-3.5">
                {/* Visual KeyCap A with Pinky Pillar */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div
                    className="finger-pillar w-8 h-12 rounded-t-full"
                    style={{ ['--finger' as string]: 'var(--finger-0)' }}
                  />
                  <div
                    data-active={warmupStep === 0 ? 'true' : undefined}
                    className="key-cap relative flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-xl font-black shadow-md border-2 border-rose-500/60 bg-card text-rose-600 dark:text-rose-400"
                    style={{ ['--finger' as string]: 'var(--finger-0)' }}
                  >
                    <span>A</span>
                    {warmupStep > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Kelingking
                  </span>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Hand className="h-3.5 w-3.5 text-rose-500" />
                    <span>Jari Kelingking Kiri</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-foreground">
                    Tombol Huruf A
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Terletak di ujung kiri baris beranda (Home Row). Bertumpu di tuts A, sementara jari telunjuk kiri Anda tetap merasakan <b>tonjolan taktil F</b> sebagai jangkar utama.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-background/60 p-2.5 text-left text-[11px] text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-rose-500 shrink-0" />
                <span>
                  <b>Tips Ergonomi:</b> Jaga pergelangan tangan lurus melayang, jangan memutar pergelangan ke luar (*ulnar deviation*).
                </span>
              </div>
            </div>

            {/* Right Pinky - Key ; */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 rounded-bl-xl bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300 uppercase">
                Tangan Kanan · Jari 8
              </div>

              <div className="flex items-start gap-3.5">
                {/* Visual KeyCap ; with Pinky Pillar */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div
                    className="finger-pillar w-8 h-12 rounded-t-full"
                    style={{ ['--finger' as string]: 'var(--finger-8)' }}
                  />
                  <div
                    data-active={warmupStep === 1 ? 'true' : undefined}
                    className="key-cap relative flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-xl font-black shadow-md border-2 border-rose-500/60 bg-card text-rose-600 dark:text-rose-400"
                    style={{ ['--finger' as string]: 'var(--finger-8)' }}
                  >
                    <span>;</span>
                    {warmupStep > 1 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Kelingking
                  </span>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Hand className="h-3.5 w-3.5 text-rose-500" />
                    <span>Jari Kelingking Kanan</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-foreground">
                    Tombol Titik Koma (;)
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Terletak di ujung kanan baris beranda (sebelah huruf L). Bertumpu di tuts titik koma (;), sementara telunjuk kanan tetap berlabuh di <b>tonjolan taktil J</b>.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-background/60 p-2.5 text-left text-[11px] text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-rose-500 shrink-0" />
                <span>
                  <b>Refleks Masa Depan:</b> Kelingking kanan ini nantinya juga mengontrol tuts Enter dan Shift Kanan.
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Guided Warmup Component */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 text-left space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <Keyboard className="h-4 w-4" />
                  <span>Uji Coba Sentuhan Interaktif (Muscle Memory Warm-up)</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Lakukan pemanasan 3 langkah sederhana di bawah ini menggunakan keyboard fisik Anda sebelum mengetik teks latihan:
                </p>
              </div>

              {isCompleted ? (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 self-start sm:self-auto">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Pemanasan Selesai!</span>
                </div>
              ) : (
                <span className="text-xs font-mono font-semibold text-muted-foreground self-start sm:self-auto">
                  Langkah {warmupStep + 1} dari 3
                </span>
              )}
            </div>

            {/* Step Pills Progression */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Step 1: Key A */}
              <div
                className={`rounded-xl border p-3 transition-all ${
                  warmupStep > 0
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : warmupStep === 0
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 text-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase">Langkah 1</span>
                  {warmupStep > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : warmupStep === 0 ? (
                    <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  ) : null}
                </div>
                <div className="mt-1 font-mono font-bold text-sm flex items-center gap-2">
                  <kbd className="rounded bg-card px-2 py-0.5 border border-border shadow-2xs">A</kbd>
                  <span className="text-xs font-sans font-semibold">Kelingking Kiri</span>
                </div>
              </div>

              {/* Step 2: Key ; */}
              <div
                className={`rounded-xl border p-3 transition-all ${
                  warmupStep > 1
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : warmupStep === 1
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 text-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase">Langkah 2</span>
                  {warmupStep > 1 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : warmupStep === 1 ? (
                    <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  ) : null}
                </div>
                <div className="mt-1 font-mono font-bold text-sm flex items-center gap-2">
                  <kbd className="rounded bg-card px-2 py-0.5 border border-border shadow-2xs">;</kbd>
                  <span className="text-xs font-sans font-semibold">Kelingking Kanan</span>
                </div>
              </div>

              {/* Step 3: Spacebar */}
              <div
                className={`rounded-xl border p-3 transition-all ${
                  warmupStep > 2
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : warmupStep === 2
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 text-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase">Langkah 3</span>
                  {warmupStep > 2 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : warmupStep === 2 ? (
                    <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  ) : null}
                </div>
                <div className="mt-1 font-mono font-bold text-sm flex items-center gap-2">
                  <kbd className="rounded bg-card px-2 py-0.5 border border-border shadow-2xs">Spasi</kbd>
                  <span className="text-xs font-sans font-semibold">Kedua Ibu Jari</span>
                </div>
              </div>
            </div>

            {/* Dynamic Instructional Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/40 p-3.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-foreground">
                  {feedbackMsg}
                </span>
                {lastKeyPressed && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground ml-1">
                    (Ditekan: <kbd className="rounded bg-background px-1.5 py-0.2 border border-border font-bold uppercase">{lastKeyPressed === ' ' ? 'Spasi' : lastKeyPressed}</kbd>)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  onClick={handleResetWarmup}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-2xs"
                  title="Ulangi pemanasan dari langkah 1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Ulangi</span>
                </button>

                {onWarmupComplete && (
                  <button
                    onClick={onWarmupComplete}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
                  >
                    <span>Mulai Mengetik Teks</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Anchor Row Reminder Callout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Anchor className="h-4 w-4 text-primary shrink-0" />
              <span>
                Dengan dikuasainya tuts <b>A</b> dan <b>;</b>, seluruh formasi 8 tuts utama Home Row (<b>A S D F — J K L ;</b>) kini telah lengkap!
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground italic sm:text-right shrink-0">
              Materi berikutnya: 13. Review: a & ; · 14. First 8 Keys
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
