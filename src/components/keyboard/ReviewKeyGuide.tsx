import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Keyboard,
  Anchor,
  Hand,
  Check,
  Info,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '@/hooks/useSound';

interface ReviewKeyGuideProps {
  lessonId?: string;
  lessonTitle: string;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  onWarmupComplete?: () => void;
}

const leftHandKeys = [
  { key: 'a', finger: 0, fingerName: 'Kelingking', isFocal: true },
  { key: 's', finger: 1, fingerName: 'Manis', isFocal: false },
  { key: 'd', finger: 2, fingerName: 'Tengah', isFocal: false },
  { key: 'f', finger: 3, fingerName: 'Telunjuk', isFocal: false, hasBump: true },
];

const rightHandKeys = [
  { key: ';', finger: 8, fingerName: 'Kelingking', isFocal: true },
  { key: 'l', finger: 7, fingerName: 'Manis', isFocal: false },
  { key: 'k', finger: 6, fingerName: 'Tengah', isFocal: false },
  { key: 'j', finger: 5, fingerName: 'Telunjuk', isFocal: false, hasBump: true },
];

export const ReviewKeyGuide: React.FC<ReviewKeyGuideProps> = ({
  lessonId,
  lessonTitle,
  isOpen = true,
  onToggleOpen,
  onWarmupComplete,
}) => {
  // Phase 0: Left hand roll (a -> s -> d -> f)
  // Phase 1: Right hand roll (; -> l -> k -> j)
  // Phase 2: Symmetrical cross pairs (a -> ; -> space)
  // Phase 3: Completed
  const [phase, setPhase] = useState<number>(0);
  const [subStep, setSubStep] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>(
    'Tahap 1: Latih kelancaran tangan kiri. Tekan huruf A dengan jari kelingking kiri.'
  );

  const { triggerKeySound, triggerErrorSound, triggerSuccessSound } = useSound();

  const handleResetWarmup = useCallback(() => {
    setPhase(0);
    setSubStep(0);
    setIsCompleted(false);
    setLastKeyPressed(null);
    setFeedbackMsg('Tahap 1: Latih kelancaran tangan kiri. Tekan huruf A dengan jari kelingking kiri.');
  }, []);

  // Keyboard handler for interactive review warmup
  useEffect(() => {
    if (!isOpen || isCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.isComposing) return;

      const key = e.key.toLowerCase();
      setLastKeyPressed(key);

      // Phase 0: Left hand flow: ['a', 's', 'd', 'f']
      if (phase === 0) {
        const expectedSequence = ['a', 's', 'd', 'f'];
        const currentExpected = expectedSequence[subStep];

        if (key === currentExpected) {
          e.preventDefault();
          triggerKeySound();
          const nextSub = subStep + 1;
          if (nextSub >= expectedSequence.length) {
            setPhase(1);
            setSubStep(0);
            setFeedbackMsg('Bagus sekali! Tangan kiri mengalir mulus. Tahap 2: Tekan tombol titik koma (;) dengan kelingking kanan.');
          } else {
            setSubStep(nextSub);
            const nextKey = expectedSequence[nextSub]!.toUpperCase();
            const fingerName = nextSub === 1 ? 'manis' : nextSub === 2 ? 'tengah' : 'telunjuk';
            setFeedbackMsg(`Bagus! Selanjutnya tekan tombol ${nextKey} dengan jari ${fingerName} kiri.`);
          }
        } else if (['a', 's', 'd', 'f'].includes(key)) {
          triggerErrorSound();
          setFeedbackMsg(`Perhatikan urutan aliran tangan kiri: A ➔ S ➔ D ➔ F. Sekarang saatnya menekan ${currentExpected.toUpperCase()}.`);
        }
      }
      // Phase 1: Right hand flow: [';', 'l', 'k', 'j']
      else if (phase === 1) {
        const expectedSequence = [';', 'l', 'k', 'j'];
        const currentExpected = expectedSequence[subStep];

        if (key === currentExpected) {
          e.preventDefault();
          triggerKeySound();
          const nextSub = subStep + 1;
          if (nextSub >= expectedSequence.length) {
            setPhase(2);
            setSubStep(0);
            setFeedbackMsg('Sempurna! Tangan kanan stabil di Home Row. Tahap 3: Tekan tuts A (kelingking kiri) lalu ; (kelingking kanan).');
          } else {
            setSubStep(nextSub);
            const nextKey = expectedSequence[nextSub]!.toUpperCase();
            const fingerName = nextSub === 1 ? 'manis' : nextSub === 2 ? 'tengah' : 'telunjuk';
            setFeedbackMsg(`Tepat! Sekarang tekan tombol ${nextKey} dengan jari ${fingerName} kanan.`);
          }
        } else if ([';', 'l', 'k', 'j'].includes(key)) {
          triggerErrorSound();
          setFeedbackMsg(`Perhatikan urutan aliran tangan kanan: ; ➔ L ➔ K ➔ J. Sekarang saatnya menekan ${currentExpected}.`);
        }
      }
      // Phase 2: Symmetrical cross pairs: ['a', ';', ' ']
      else if (phase === 2) {
        if (subStep === 0 && key === 'a') {
          e.preventDefault();
          triggerKeySound();
          setSubStep(1);
          setFeedbackMsg('Bagus! Sekarang tekan tuts titik koma (;) dengan kelingking kanan.');
        } else if (subStep === 1 && key === ';') {
          e.preventDefault();
          triggerKeySound();
          setSubStep(2);
          setFeedbackMsg('Mantap! Terakhir tekan tombol Spasi menggunakan ibu jari.');
        } else if (subStep === 2 && (key === ' ' || key === 'spacebar')) {
          e.preventDefault();
          triggerSuccessSound();
          setPhase(3);
          setIsCompleted(true);
          setFeedbackMsg('Luar biasa! Koordinasi 8 tuts Home Row kini terhubung mantap. Memori otot Anda siap untuk latihan ulasan.');

          try {
            confetti({
              particleCount: 65,
              spread: 65,
              origin: { y: 0.6 },
            });
          } catch {
            // Ignore if canvas is unavailable
          }

          if (onWarmupComplete) {
            onWarmupComplete();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, phase, subStep, isCompleted, triggerKeySound, triggerErrorSound, triggerSuccessSound, onWarmupComplete]);

  return (
    <div className="rounded-3xl border border-primary/30 bg-gradient-to-b from-card via-card/95 to-primary/5 shadow-card overflow-hidden transition-all duration-300">
      {/* Header Bar with Accordion Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.2 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Ulasan & Pemantapan
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                {lessonId ? `Pelajaran ${lessonId} · ` : ''}{lessonTitle}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight mt-0.5">
              Ulasan Koordinasi Tombol A & ; dengan Seluruh Home Row
            </h3>
          </div>
        </div>

        {onToggleOpen && (
          <button
            onClick={onToggleOpen}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors self-start sm:self-center shadow-xs"
          >
            <span>{isOpen ? 'Sembunyikan Panduan Ulasan' : 'Buka Panduan Ulasan (Review)'}</span>
            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Expandable Content Area */}
      {isOpen && (
        <div className="p-5 sm:p-6 space-y-6 animate-in fade-in duration-200">
          {/* Coordination Flow Cards (Left Hand & Right Hand) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Hand Coordination: A -> S -> D -> F */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                  <Hand className="h-3.5 w-3.5" />
                  <span>Koordinasi Tangan Kiri (A ➔ S ➔ D ➔ F)</span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                  Luar ke Jangkar
                </span>
              </div>

              {/* Visual 4 Keycaps Row */}
              <div className="flex justify-between items-center gap-2 pt-1">
                {leftHandKeys.map((item, idx) => {
                  const isCurrentTarget = phase === 0 && subStep === idx;
                  const isPassedInPhase = phase > 0 || (phase === 0 && subStep > idx);

                  return (
                    <div key={item.key} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className="finger-pillar w-full max-w-[36px] rounded-t-full"
                        style={{
                          height: item.finger === 0 ? 36 : item.finger === 2 ? 48 : 42,
                          ['--finger' as string]: `var(--finger-${item.finger})`,
                        }}
                      />
                      <div
                        data-active={isCurrentTarget ? 'true' : undefined}
                        className={`key-cap relative flex h-11 w-full max-w-[42px] items-center justify-center rounded-xl font-mono text-base font-bold shadow-xs transition-all ${
                          isPassedInPhase
                            ? 'border-emerald-500/70 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold ring-1 ring-emerald-500/40'
                            : isCurrentTarget
                            ? 'border-primary ring-2 ring-primary/80 scale-105 bg-card text-foreground font-extrabold'
                            : item.isFocal
                            ? 'border-rose-500/60 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold'
                            : 'border-border bg-card text-foreground'
                        }`}
                        style={{ ['--finger' as string]: `var(--finger-${item.finger})` }}
                      >
                        <span className="uppercase">{item.key}</span>
                        {item.hasBump && (
                          <span
                            className="absolute bottom-1 h-0.8 w-2.5 rounded-full bg-primary ring-1 ring-background"
                            title="Tonjolan jangkar F"
                          />
                        )}
                        {isPassedInPhase && (
                          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
                            <Check className="h-2 w-2 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-muted-foreground font-semibold text-center truncate max-w-full">
                        {item.fingerName}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-primary/20 bg-background/60 p-2.5 text-left text-[11px] text-muted-foreground flex items-center gap-2">
                <Anchor className="h-4 w-4 text-primary shrink-0" />
                <span>
                  <b>Refleks Jangkar:</b> Saat kelingking menekan <b>A</b>, jari telunjuk tetap meraba tonjolan <b>F</b> agar telapak tangan tidak bergeser keluar.
                </span>
              </div>
            </div>

            {/* Right Hand Coordination: ; -> L -> K -> J */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  <Hand className="h-3.5 w-3.5" />
                  <span>Koordinasi Tangan Kanan (; ➔ L ➔ K ➔ J)</span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                  Luar ke Jangkar
                </span>
              </div>

              {/* Visual 4 Keycaps Row */}
              <div className="flex justify-between items-center gap-2 pt-1">
                {rightHandKeys.map((item, idx) => {
                  const isCurrentTarget = phase === 1 && subStep === idx;
                  const isPassedInPhase = phase > 1 || (phase === 1 && subStep > idx);

                  return (
                    <div key={item.key} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className="finger-pillar w-full max-w-[36px] rounded-t-full"
                        style={{
                          height: item.finger === 8 ? 36 : item.finger === 6 ? 48 : 42,
                          ['--finger' as string]: `var(--finger-${item.finger})`,
                        }}
                      />
                      <div
                        data-active={isCurrentTarget ? 'true' : undefined}
                        className={`key-cap relative flex h-11 w-full max-w-[42px] items-center justify-center rounded-xl font-mono text-base font-bold shadow-xs transition-all ${
                          isPassedInPhase
                            ? 'border-emerald-500/70 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold ring-1 ring-emerald-500/40'
                            : isCurrentTarget
                            ? 'border-amber-500 ring-2 ring-amber-500/80 scale-105 bg-card text-foreground font-extrabold'
                            : item.isFocal
                            ? 'border-rose-500/60 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold'
                            : 'border-border bg-card text-foreground'
                        }`}
                        style={{ ['--finger' as string]: `var(--finger-${item.finger})` }}
                      >
                        <span>{item.key}</span>
                        {item.hasBump && (
                          <span
                            className="absolute bottom-1 h-0.8 w-2.5 rounded-full bg-primary ring-1 ring-background"
                            title="Tonjolan jangkar J"
                          />
                        )}
                        {isPassedInPhase && (
                          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
                            <Check className="h-2 w-2 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-muted-foreground font-semibold text-center truncate max-w-full">
                        {item.fingerName}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-background/60 p-2.5 text-left text-[11px] text-muted-foreground flex items-center gap-2">
                <Anchor className="h-4 w-4 text-amber-500 shrink-0" />
                <span>
                  <b>Refleks Jangkar:</b> Saat kelingking menekan <b>;</b>, telunjuk kanan tetap menjadi poros di tonjolan <b>J</b> agar jari tidak melayang liar.
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Coordination Warm-up Exercise */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 text-left space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <Keyboard className="h-4 w-4" />
                  <span>Pemanasan Kelancaran Transisi Antar-Jari (Interactive Review Warm-up)</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Latih refleks perpindahan jari Anda secara berurutan pada keyboard fisik sebelum mulai mengetik teks materi ulasan:
                </p>
              </div>

              {isCompleted ? (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 self-start sm:self-auto">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Refleks Koordinasi Siap!</span>
                </div>
              ) : (
                <span className="text-xs font-mono font-semibold text-muted-foreground self-start sm:self-auto">
                  Fase {phase + 1} dari 3
                </span>
              )}
            </div>

            {/* 3 Review Warmup Phase Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Phase 1: Left Hand asdf */}
              <div
                className={`rounded-xl border p-3 transition-all ${
                  phase > 0
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : phase === 0
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 text-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase">Fase 1 · Tangan Kiri</span>
                  {phase > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : phase === 0 ? (
                    <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  ) : null}
                </div>
                <div className="mt-1 font-mono font-bold text-sm flex items-center gap-1.5">
                  {['a', 's', 'd', 'f'].map((k, idx) => (
                    <kbd
                      key={k}
                      className={`rounded px-1.5 py-0.2 border text-xs uppercase ${
                        phase > 0 || (phase === 0 && subStep > idx)
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-extrabold'
                          : phase === 0 && subStep === idx
                          ? 'bg-primary text-primary-foreground border-primary font-black animate-pulse'
                          : 'bg-card border-border'
                      }`}
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground block mt-1">Kelingking ke Telunjuk</span>
              </div>

              {/* Phase 2: Right Hand ;lkj */}
              <div
                className={`rounded-xl border p-3 transition-all ${
                  phase > 1
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : phase === 1
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5 text-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase">Fase 2 · Tangan Kanan</span>
                  {phase > 1 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : phase === 1 ? (
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  ) : null}
                </div>
                <div className="mt-1 font-mono font-bold text-sm flex items-center gap-1.5">
                  {[';', 'l', 'k', 'j'].map((k, idx) => (
                    <kbd
                      key={k}
                      className={`rounded px-1.5 py-0.2 border text-xs uppercase ${
                        phase > 1 || (phase === 1 && subStep > idx)
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-extrabold'
                          : phase === 1 && subStep === idx
                          ? 'bg-amber-500 text-white border-amber-500 font-black animate-pulse'
                          : 'bg-card border-border'
                      }`}
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground block mt-1">Kelingking ke Telunjuk</span>
              </div>

              {/* Phase 3: Symmetrical cross rhythm a; */}
              <div
                className={`rounded-xl border p-3 transition-all ${
                  phase > 2
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : phase === 2
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 text-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase">Fase 3 · Pasangan Kelingking</span>
                  {phase > 2 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : phase === 2 ? (
                    <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  ) : null}
                </div>
                <div className="mt-1 font-mono font-bold text-sm flex items-center gap-1.5">
                  {['A', ';', 'Spasi'].map((lbl, idx) => (
                    <kbd
                      key={lbl}
                      className={`rounded px-1.5 py-0.2 border text-xs uppercase ${
                        phase > 2 || (phase === 2 && subStep > idx)
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-extrabold'
                          : phase === 2 && subStep === idx
                          ? 'bg-primary text-primary-foreground border-primary font-black animate-pulse'
                          : 'bg-card border-border'
                      }`}
                    >
                      {lbl}
                    </kbd>
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground block mt-1">Kiri - Kanan Simetris</span>
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
                  title="Ulangi pemanasan koordinasi"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Ulangi</span>
                </button>

                {onWarmupComplete && (
                  <button
                    onClick={onWarmupComplete}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
                  >
                    <span>Mulai Mengetik Teks Ulasan</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Transition to Module 14 Notice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              <span>
                <b>Sasaran Ulasan:</b> Memastikan refleks jari Anda tidak kaku saat beralih antara tuts luar (A, ;) dan tuts tengah (S, D, F, J, K, L).
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground sm:text-right shrink-0">
              Lulus modul ini untuk membuka: <b>14. First 8 Keys</b> ➔ <b>15. Play: First 8 Keys</b>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
