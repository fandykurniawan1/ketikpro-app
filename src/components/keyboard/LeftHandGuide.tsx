import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Keyboard,
  Anchor,
  Hand,
  Info,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '@/hooks/useSound';

interface LeftHandGuideProps {
  lessonId?: string;
  lessonTitle: string;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  onWarmupComplete?: () => void;
}

const leftHandFingers = [
  { key: 'a', finger: 0, fingerName: 'Kelingking', desc: 'Menekan tuts A di ujung kiri. Otot terkecil, butuh latihan kelenturan ekstra.' },
  { key: 's', finger: 1, fingerName: 'Manis', desc: 'Menekan tuts S. Cenderung bergantung pada jari tengah, butuh isolasi mandiri.' },
  { key: 'd', finger: 2, fingerName: 'Tengah', desc: 'Menekan tuts D. Jari paling kuat dan tinggi di tangan kiri.' },
  { key: 'f', finger: 3, fingerName: 'Telunjuk', hasBump: true, desc: 'Menekan tuts F. Berlabuh di tonjolan taktil sebagai poros utama.' },
];

export const LeftHandGuide: React.FC<LeftHandGuideProps> = ({
  lessonId,
  lessonTitle,
  isOpen = true,
  onToggleOpen,
  onWarmupComplete,
}) => {
  // Phase 0: Roll In-to-Out (f -> d -> s -> a)
  // Phase 1: Roll Out-to-In (a -> s -> d -> f)
  // Phase 2: Words (ada -> dada -> space)
  // Phase 3: Completed
  const [phase, setPhase] = useState<number>(0);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>(
    'Fase 1 (Dalam ke Luar): Tekan tuts F dengan jari telunjuk kiri.'
  );

  const { triggerKeySound, triggerErrorSound, triggerSuccessSound } = useSound();

  const handleResetWarmup = useCallback(() => {
    setPhase(0);
    setStepIndex(0);
    setIsCompleted(false);
    setLastKeyPressed(null);
    setFeedbackMsg('Fase 1 (Dalam ke Luar): Tekan tuts F dengan jari telunjuk kiri.');
  }, []);

  // Keyboard handler for interactive left hand warmup
  useEffect(() => {
    if (!isOpen || isCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.isComposing) return;

      const key = e.key.toLowerCase();
      setLastKeyPressed(key);

      // Phase 0: In-to-Out roll: ['f', 'd', 's', 'a']
      if (phase === 0) {
        const seq = ['f', 'd', 's', 'a'];
        const currentExpected = seq[stepIndex];

        if (key === currentExpected) {
          e.preventDefault();
          triggerKeySound();
          const next = stepIndex + 1;
          if (next >= seq.length) {
            setPhase(1);
            setStepIndex(0);
            setFeedbackMsg('Bagus sekali! Alur dalam-ke-luar tuntas. Fase 2 (Luar ke Dalam): Tekan tuts A dengan jari kelingking kiri.');
          } else {
            setStepIndex(next);
            const nextKey = seq[next]!.toUpperCase();
            const fingerName = next === 1 ? 'tengah' : next === 2 ? 'manis' : 'kelingking';
            setFeedbackMsg(`Tepat! Sekarang tekan tuts ${nextKey} menggunakan jari ${fingerName} kiri.`);
          }
        } else if (['a', 's', 'd', 'f'].includes(key)) {
          triggerErrorSound();
          setFeedbackMsg(`Urutan Fase 1 adalah F ➔ D ➔ S ➔ A. Tombol berikutnya yang diharapkan adalah ${currentExpected.toUpperCase()}.`);
        }
      }
      // Phase 1: Out-to-In roll: ['a', 's', 'd', 'f']
      else if (phase === 1) {
        const seq = ['a', 's', 'd', 'f'];
        const currentExpected = seq[stepIndex];

        if (key === currentExpected) {
          e.preventDefault();
          triggerKeySound();
          const next = stepIndex + 1;
          if (next >= seq.length) {
            setPhase(2);
            setStepIndex(0);
            setFeedbackMsg('Mantap! Refleks kembali ke jangkar F sangat baik. Fase 3: Ketik kata murni tangan kiri: "ada " (A - D - A - Spasi).');
          } else {
            setStepIndex(next);
            const nextKey = seq[next]!.toUpperCase();
            const fingerName = next === 1 ? 'manis' : next === 2 ? 'tengah' : 'telunjuk';
            setFeedbackMsg(`Bagus! Lanjutkan tekan ${nextKey} dengan jari ${fingerName} kiri.`);
          }
        } else if (['a', 's', 'd', 'f'].includes(key)) {
          triggerErrorSound();
          setFeedbackMsg(`Urutan Fase 2 adalah A ➔ S ➔ D ➔ F. Tombol berikutnya yang diharapkan adalah ${currentExpected.toUpperCase()}.`);
        }
      }
      // Phase 2: Word typing: "ada dada "
      else if (phase === 2) {
        const targetSequence = ['a', 'd', 'a', ' ', 'd', 'a', 'd', 'a', ' '];
        const currentExpected = targetSequence[stepIndex];

        const isSpaceExpected = currentExpected === ' ';
        const isSpacePressed = key === ' ' || key === 'spacebar';
        const isMatch = isSpaceExpected ? isSpacePressed : key === currentExpected;

        if (isMatch) {
          e.preventDefault();
          triggerKeySound();
          const next = stepIndex + 1;
          if (next >= targetSequence.length) {
            triggerSuccessSound();
            setPhase(3);
            setIsCompleted(true);
            setFeedbackMsg('Luar biasa! 4 jari tangan kiri Anda kini memiliki refleks yang lincah dan mandiri. Siap masuk ke latihan teks lengkap.');

            try {
              confetti({
                particleCount: 65,
                spread: 65,
                origin: { y: 0.6 },
              });
            } catch {
              // Ignore if canvas unavailable
            }

            if (onWarmupComplete) {
              onWarmupComplete();
            }
          } else {
            setStepIndex(next);
            const nextDisplay = targetSequence[next] === ' ' ? 'Spasi' : targetSequence[next]!.toUpperCase();
            setFeedbackMsg(`Bagus! Lanjut huruf berikutnya: [${nextDisplay}].`);
          }
        } else {
          triggerErrorSound();
          const expectedDisplay = currentExpected === ' ' ? 'Spasi' : currentExpected!.toUpperCase();
          setFeedbackMsg(`Huruf yang diharapkan adalah [${expectedDisplay}]. Tekan dengan jari tangan kiri yang sesuai.`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, phase, stepIndex, isCompleted, triggerKeySound, triggerErrorSound, triggerSuccessSound, onWarmupComplete]);

  return (
    <div className="rounded-3xl border border-primary/30 bg-gradient-to-b from-card via-card/95 to-primary/5 shadow-card overflow-hidden transition-all duration-300">
      {/* Header Bar with Accordion Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Hand className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-2 py-0.2 text-[10px] font-bold text-primary uppercase tracking-wider">
                Isolasi Tangan Kiri
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                {lessonId ? `Pelajaran ${lessonId} · ` : ''}{lessonTitle}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight mt-0.5">
              Penguatan Koordinasi & Kemandirian 4 Jari Tangan Kiri (A - S - D - F)
            </h3>
          </div>
        </div>

        {onToggleOpen && (
          <button
            onClick={onToggleOpen}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors self-start sm:self-center shadow-xs"
          >
            <span>{isOpen ? 'Sembunyikan Panduan Tangan Kiri' : 'Buka Panduan Tangan Kiri'}</span>
            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Expandable Content Area */}
      {isOpen && (
        <div className="p-5 sm:p-6 space-y-6 animate-in fade-in duration-200">
          {/* 4 Fingers Anatomy & Pillar Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {leftHandFingers.map((item, idx) => {
              const isCurrentInPhase0 = phase === 0 && (3 - idx) === stepIndex;
              const isCurrentInPhase1 = phase === 1 && idx === stepIndex;

              return (
                <div
                  key={item.key}
                  className={`rounded-2xl border p-3.5 flex flex-col justify-between space-y-3 transition-all ${
                    isCurrentInPhase0 || isCurrentInPhase1
                      ? 'border-primary ring-2 ring-primary/40 bg-primary/10 shadow-sm'
                      : 'border-border bg-card/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Jari {item.finger}
                    </span>
                    <span className="text-[10px] font-bold text-primary">{item.fingerName}</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <div
                      className="finger-pillar w-8 rounded-t-full"
                      style={{
                        height: item.finger === 0 ? 36 : item.finger === 2 ? 52 : 44,
                        ['--finger' as string]: `var(--finger-${item.finger})`,
                      }}
                    />
                    <div
                      data-active={isCurrentInPhase0 || isCurrentInPhase1 ? 'true' : undefined}
                      className="key-cap relative flex h-11 w-11 items-center justify-center rounded-xl font-mono text-base font-black shadow-xs border border-border bg-card text-foreground"
                      style={{ ['--finger' as string]: `var(--finger-${item.finger})` }}
                    >
                      <span className="uppercase">{item.key}</span>
                      {item.hasBump && (
                        <span
                          className="absolute bottom-1 h-0.8 w-2.5 rounded-full bg-primary ring-1 ring-background"
                          title="Tonjolan taktil penanda posisi awal F"
                        />
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-snug text-left">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Interactive Warm-up Section */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 text-left space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <Keyboard className="h-4 w-4" />
                  <span>Uji Coba Ketukan Tangan Kiri (Interactive Left Hand Warm-up)</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Lakukan 3 tahapan pemanasan berikut langsung di keyboard fisik Anda menggunakan tangan kiri:
                </p>
              </div>

              {isCompleted ? (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 self-start sm:self-auto">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Pemanasan Tangan Kiri Selesai!</span>
                </div>
              ) : (
                <span className="text-xs font-mono font-semibold text-muted-foreground self-start sm:self-auto">
                  Fase {phase + 1} dari 3
                </span>
              )}
            </div>

            {/* 3 Phase Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Phase 1: In to Out (F D S A) */}
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
                  <span className="text-[11px] font-bold uppercase">Fase 1 · Dalam ke Luar</span>
                  {phase > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : phase === 0 ? (
                    <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  ) : null}
                </div>
                <div className="mt-1 font-mono font-bold text-sm flex items-center gap-1.5">
                  {['F', 'D', 'S', 'A'].map((k, idx) => (
                    <kbd
                      key={k}
                      className={`rounded px-1.5 py-0.2 border text-xs uppercase ${
                        phase > 0 || (phase === 0 && stepIndex > idx)
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-extrabold'
                          : phase === 0 && stepIndex === idx
                          ? 'bg-primary text-primary-foreground border-primary font-black animate-pulse'
                          : 'bg-card border-border'
                      }`}
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground block mt-1">Telunjuk ke Kelingking</span>
              </div>

              {/* Phase 2: Out to In (A S D F) */}
              <div
                className={`rounded-xl border p-3 transition-all ${
                  phase > 1
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : phase === 1
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 text-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase">Fase 2 · Luar ke Dalam</span>
                  {phase > 1 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : phase === 1 ? (
                    <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  ) : null}
                </div>
                <div className="mt-1 font-mono font-bold text-sm flex items-center gap-1.5">
                  {['A', 'S', 'D', 'F'].map((k, idx) => (
                    <kbd
                      key={k}
                      className={`rounded px-1.5 py-0.2 border text-xs uppercase ${
                        phase > 1 || (phase === 1 && stepIndex > idx)
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-extrabold'
                          : phase === 1 && stepIndex === idx
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

              {/* Phase 3: Left Hand Words (ada dada) */}
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
                  <span className="text-[11px] font-bold uppercase">Fase 3 · Kata Kiri</span>
                  {phase > 2 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : phase === 2 ? (
                    <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  ) : null}
                </div>
                <div className="mt-1 font-mono font-bold text-xs flex items-center gap-1">
                  <span className="rounded bg-card px-1.5 py-0.5 border border-border">ada</span>
                  <span className="text-muted-foreground">+</span>
                  <span className="rounded bg-card px-1.5 py-0.5 border border-border">dada</span>
                </div>
                <span className="text-[10px] text-muted-foreground block mt-1">Kata Murni Tangan Kiri</span>
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
                  title="Ulangi pemanasan tangan kiri"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Ulangi</span>
                </button>

                {onWarmupComplete && (
                  <button
                    onClick={onWarmupComplete}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
                  >
                    <span>Mulai Mengetik Teks Tangan Kiri</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Ergonomic & Tendon Independence Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase">
                <ShieldCheck className="h-4 w-4" />
                <span>Kemandirian Jari Manis & Kelingking</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Jari manis dan kelingking tangan kiri berbagi tendon yang sama di punggung tangan. Modul isolasi ini melatih saraf motorik agar jari manis tetap tenang saat kelingking menekan tuts A.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">
                <Anchor className="h-4 w-4" />
                <span>Posisi Tangan Kanan Tetap Siaga</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Meskipun teks hanya mengetik tombol tangan kiri, biarkan tangan kanan tetap bertumpu tenang di tuts <b>J - K - L - ;</b>. Ini menjaga keselarasan bahu dan postur tubuh yang simetris.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
