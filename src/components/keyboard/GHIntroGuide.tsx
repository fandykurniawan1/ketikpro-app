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
  Compass,
  Hand,
  Check,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '@/hooks/useSound';

interface GHIntroGuideProps {
  lessonId?: string;
  lessonTitle: string;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  onWarmupComplete?: () => void;
}

export const GHIntroGuide: React.FC<GHIntroGuideProps> = ({
  lessonId,
  lessonTitle,
  isOpen = true,
  onToggleOpen,
  onWarmupComplete,
}) => {
  // Step 0: Reach G with left index finger (from F)
  // Step 1: Reach H with right index finger (from J)
  // Step 2: Rhythmic alternating pattern: ['g', ' ', 'h', ' ', 'g', 'h', ' ']
  // Step 3: Completed
  const [warmupStep, setWarmupStep] = useState<number>(0);
  const [subStepIndex, setSubStepIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>(
    'Langkah 1: Rentangkan jari telunjuk kiri dari tuts F ke kanan untuk menekan tuts G.'
  );

  const { triggerKeySound, triggerErrorSound, triggerSuccessSound } = useSound();

  const handleResetWarmup = useCallback(() => {
    setWarmupStep(0);
    setSubStepIndex(0);
    setIsCompleted(false);
    setLastKeyPressed(null);
    setFeedbackMsg(
      'Langkah 1: Rentangkan jari telunjuk kiri dari tuts F ke kanan untuk menekan tuts G.'
    );
  }, []);

  // Keyboard listener specifically for the interactive G & H warmup
  useEffect(() => {
    if (!isOpen || isCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.isComposing) return;

      const key = e.key.toLowerCase();
      setLastKeyPressed(key);

      // Step 0: Expect 'g' (left index reach)
      if (warmupStep === 0) {
        if (key === 'g') {
          e.preventDefault();
          triggerKeySound();
          setWarmupStep(1);
          setSubStepIndex(0);
          setFeedbackMsg(
            'Sempurna! Telunjuk kiri telah merasakan tuts G dan siap kembali ke jangkar F. Langkah 2: Rentangkan telunjuk kanan dari tuts J ke kiri untuk menekan tuts H.'
          );
        } else if (key === 'f') {
          triggerErrorSound();
          setFeedbackMsg(
            'Itu adalah tuts jangkar F. Geser/rentangkan jari telunjuk kiri Anda satu kolom ke arah kanan untuk menekan tuts G.'
          );
        } else if (['a', 's', 'd'].includes(key)) {
          triggerErrorSound();
          setFeedbackMsg(
            'Pertahankan jari kelingking, manis, dan tengah di A-S-D. Hanya telunjuk kiri yang menjangkau tombol G.'
          );
        }
      }
      // Step 1: Expect 'h' (right index reach)
      else if (warmupStep === 1) {
        if (key === 'h') {
          e.preventDefault();
          triggerKeySound();
          setWarmupStep(2);
          setSubStepIndex(0);
          setFeedbackMsg(
            'Luar biasa! Telunjuk kanan mantap di tuts H. Langkah 3: Latih ritme jangkau & kembali dengan pola "g [spasi] h [spasi] g h [spasi]". Tekan tuts G.'
          );
        } else if (key === 'j') {
          triggerErrorSound();
          setFeedbackMsg(
            'Itu adalah tuts jangkar J. Geser/rentangkan jari telunjuk kanan Anda satu kolom ke arah kiri untuk menekan tuts H.'
          );
        } else if (['k', 'l', ';'].includes(key)) {
          triggerErrorSound();
          setFeedbackMsg(
            'Pertahankan jari tengah, manis, dan kelingking di K-L-;. Hanya telunjuk kanan yang menjangkau tombol H.'
          );
        }
      }
      // Step 2: Rhythmic reach & return combination: ['g', ' ', 'h', ' ', 'g', 'h', ' ']
      else if (warmupStep === 2) {
        const targetSequence = ['g', ' ', 'h', ' ', 'g', 'h', ' '];
        const currentExpected = targetSequence[subStepIndex];

        const isSpaceExpected = currentExpected === ' ';
        const isSpacePressed = key === ' ' || key === 'spacebar';
        const isMatch = isSpaceExpected ? isSpacePressed : key === currentExpected;

        if (isMatch) {
          e.preventDefault();
          triggerKeySound();
          const next = subStepIndex + 1;
          if (next >= targetSequence.length) {
            triggerSuccessSound();
            setWarmupStep(3);
            setIsCompleted(true);
            setFeedbackMsg(
              'Hebat sekali! Memori otot untuk tuts G dan H beserta refleks kembali ke jangkar F & J telah terbentuk sempurna. Anda siap mengetik teks latihan!'
            );

            try {
              confetti({
                particleCount: 70,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch {
              // Ignore if canvas is not available
            }

            if (onWarmupComplete) {
              onWarmupComplete();
            }
          } else {
            setSubStepIndex(next);
            const nextKey = targetSequence[next];
            const nextDisplay = nextKey === ' ' ? 'Spasi' : nextKey!.toUpperCase();
            const fingerHint =
              nextKey === 'g'
                ? 'telunjuk kiri (jangkau ke kanan)'
                : nextKey === 'h'
                ? 'telunjuk kanan (jangkau ke kiri)'
                : 'ibu jari (kembalikan telunjuk ke jangkar F/J)';
            setFeedbackMsg(`Bagus! Lanjut ketuk [${nextDisplay}] menggunakan ${fingerHint}.`);
          }
        } else {
          triggerErrorSound();
          const expectedDisplay = currentExpected === ' ' ? 'Spasi' : currentExpected!.toUpperCase();
          setFeedbackMsg(
            `Ketukan berikutnya adalah [${expectedDisplay}]. Perhatikan koordinasi jari telunjuk dan kembalikan ke posisi berlabuh.`
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, warmupStep, subStepIndex, isCompleted, triggerKeySound, triggerErrorSound, triggerSuccessSound, onWarmupComplete]);

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
              Alur Perkenalan Tombol G & H (Telunjuk Kiri & Kanan — Jangkau & Kembali)
            </h3>
          </div>
        </div>

        {onToggleOpen && (
          <button
            onClick={onToggleOpen}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors self-start sm:self-center shadow-xs"
          >
            <span>{isOpen ? 'Sembunyikan Panduan G & H' : 'Buka Panduan G & H'}</span>
            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Expandable Content Area */}
      {isOpen && (
        <div className="p-5 sm:p-6 space-y-6 animate-in fade-in duration-200">
          {/* Main Key Cards: Left Index (G) and Right Index (H) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Index - Key G */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 rounded-bl-xl bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300 uppercase">
                Tangan Kiri · Jari 3
              </div>

              <div className="flex items-start gap-3.5">
                {/* Visual KeyCap G with Pillar and Reach Arrow */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div
                    className="finger-pillar w-8 h-12 rounded-t-full"
                    style={{ ['--finger' as string]: 'var(--finger-3)' }}
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-muted-foreground">F ➔</span>
                    <div
                      data-active={warmupStep === 0 || (warmupStep === 2 && ['g', ' ', 'h', ' ', 'g', 'h', ' '][subStepIndex] === 'g') ? 'true' : undefined}
                      className="key-cap relative flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-xl font-black shadow-md border-2 border-rose-500/60 bg-card text-rose-600 dark:text-rose-400"
                      style={{ ['--finger' as string]: 'var(--finger-3)' }}
                    >
                      <span>G</span>
                      {warmupStep > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Telunjuk Kiri
                  </span>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Hand className="h-3.5 w-3.5 text-rose-500" />
                    <span>Jari Telunjuk Kiri (Jangkau ke Kanan)</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-foreground">
                    Tombol Huruf G
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Terletak tepat di sebelah kanan tuts jangkar <b>F</b>. Rentangkan jari telunjuk kiri satu kolom ke tengah untuk menekan G, lalu <b>segera kembalikan</b> bantalan jari ke tonjolan taktil <b>F</b>.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-background/60 p-2.5 text-left text-[11px] text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-rose-500 shrink-0" />
                <span>
                  <b>Tips Ergonomi:</b> Jaga pergelangan tangan kiri tetap diam. Gerakkan ruas jari telunjuk saja tanpa menggeser posisi jari A, S, dan D.
                </span>
              </div>
            </div>

            {/* Right Index - Key H */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 rounded-bl-xl bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300 uppercase">
                Tangan Kanan · Jari 5
              </div>

              <div className="flex items-start gap-3.5">
                {/* Visual KeyCap H with Pillar and Reach Arrow */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div
                    className="finger-pillar w-8 h-12 rounded-t-full"
                    style={{ ['--finger' as string]: 'var(--finger-5)' }}
                  />
                  <div className="flex items-center gap-1.5">
                    <div
                      data-active={warmupStep === 1 || (warmupStep === 2 && ['g', ' ', 'h', ' ', 'g', 'h', ' '][subStepIndex] === 'h') ? 'true' : undefined}
                      className="key-cap relative flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-xl font-black shadow-md border-2 border-rose-500/60 bg-card text-rose-600 dark:text-rose-400"
                      style={{ ['--finger' as string]: 'var(--finger-5)' }}
                    >
                      <span>H</span>
                      {warmupStep > 1 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold text-muted-foreground">🠔 J</span>
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Telunjuk Kanan
                  </span>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Hand className="h-3.5 w-3.5 text-rose-500" />
                    <span>Jari Telunjuk Kanan (Jangkau ke Kiri)</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-foreground">
                    Tombol Huruf H
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Terletak tepat di sebelah kiri tuts jangkar <b>J</b>. Rentangkan jari telunjuk kanan satu kolom ke tengah untuk menekan H, lalu <b>segera kembalikan</b> bantalan jari ke tonjolan taktil <b>J</b>.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-background/60 p-2.5 text-left text-[11px] text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-rose-500 shrink-0" />
                <span>
                  <b>Tips Ergonomi:</b> Pertahankan jari K, L, dan ; tetap di atas posisinya agar koordinasi tangan kanan tidak berantakan saat menjangkau H.
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
                  <span>Uji Coba Sentuhan Interaktif: Jangkau & Kembali (Reach & Return)</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Lakukan pemanasan 3 langkah berikut langsung di keyboard fisik Anda sebelum mengetik teks latihan:
                </p>
              </div>

              {isCompleted ? (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 self-start sm:self-auto">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Pemanasan G & H Selesai!</span>
                </div>
              ) : (
                <span className="text-xs font-mono font-semibold text-muted-foreground self-start sm:self-auto">
                  Langkah {warmupStep + 1} dari 3
                </span>
              )}
            </div>

            {/* Step Pills Progression */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Step 1: Key G */}
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
                  <kbd className="rounded bg-card px-2 py-0.5 border border-border shadow-2xs">G</kbd>
                  <span className="text-xs font-sans font-semibold">Telunjuk Kiri (F ➔ G)</span>
                </div>
              </div>

              {/* Step 2: Key H */}
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
                  <kbd className="rounded bg-card px-2 py-0.5 border border-border shadow-2xs">H</kbd>
                  <span className="text-xs font-sans font-semibold">Telunjuk Kanan (H 🠔 J)</span>
                </div>
              </div>

              {/* Step 3: Alternating & Space */}
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
                <div className="mt-1 font-mono font-bold text-xs flex items-center gap-1">
                  <span className="rounded bg-card px-1.5 py-0.5 border border-border">g</span>
                  <span className="text-muted-foreground">␣</span>
                  <span className="rounded bg-card px-1.5 py-0.5 border border-border">h</span>
                  <span className="text-muted-foreground">␣</span>
                  <span className="rounded bg-card px-1.5 py-0.5 border border-border">gh</span>
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
                  title="Ulangi pemanasan G & H"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Ulangi</span>
                </button>

                {onWarmupComplete && (
                  <button
                    onClick={onWarmupComplete}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
                  >
                    <span>Mulai Mengetik Teks G & H</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Golden Rules: Reach & Return Guidance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase">
                <Anchor className="h-4 w-4" />
                <span>Prinsip "Reach & Return" (Jangkau & Kembali)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tuts G dan H bukan tempat beristirahat jari (*resting position*). Setelah menekan G atau H, segera kembalikan jari telunjuk Anda ke tonjolan taktil tuts <b>F</b> atau <b>J</b> sebelum mengetik tombol berikutnya.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">
                <Compass className="h-4 w-4" />
                <span>Pusat Orientasi Keyboard 10 Jari</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Celah antara tuts G dan H membelah keyboard fisik menjadi dua wilayah: sisi kiri (tangan kiri) dan sisi kanan (tangan kanan). Menjaga batas ini adalah rahasia kecepatan mengetik tanpa melihat tuts.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
