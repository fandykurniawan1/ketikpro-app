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

interface RightHandGuideProps {
  lessonId?: string;
  lessonTitle: string;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  onWarmupComplete?: () => void;
}

const rightHandFingers = [
  { key: 'j', finger: 5, fingerName: 'Telunjuk', hasBump: true, desc: 'Menekan tuts J. Poros taktil penanda jangkar utama tangan kanan.' },
  { key: 'k', finger: 6, fingerName: 'Tengah', desc: 'Menekan tuts K. Jari paling panjang dan bertenaga di tangan kanan.' },
  { key: 'l', finger: 7, fingerName: 'Manis', desc: 'Menekan tuts L. Butuh isolasi mandiri agar fleksibel dan tidak kaku mengikuti jari tengah.' },
  { key: ';', finger: 8, fingerName: 'Kelingking', desc: 'Menekan tuts titik koma (;). Menyeimbangkan batas luar Home Row tangan kanan.' },
];

export const RightHandGuide: React.FC<RightHandGuideProps> = ({
  lessonId,
  lessonTitle,
  isOpen = true,
  onToggleOpen,
  onWarmupComplete,
}) => {
  // Phase 0: Roll In-to-Out (j -> k -> l -> ;)
  // Phase 1: Roll Out-to-In (; -> l -> k -> j)
  // Phase 2: Rhythmic Combination & Space (jkl; ;lkj )
  // Phase 3: Completed
  const [phase, setPhase] = useState<number>(0);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>(
    'Fase 1 (Dalam ke Luar): Tekan tuts J dengan jari telunjuk kanan.'
  );

  const { triggerKeySound, triggerErrorSound, triggerSuccessSound } = useSound();

  const handleResetWarmup = useCallback(() => {
    setPhase(0);
    setStepIndex(0);
    setIsCompleted(false);
    setLastKeyPressed(null);
    setFeedbackMsg('Fase 1 (Dalam ke Luar): Tekan tuts J dengan jari telunjuk kanan.');
  }, []);

  // Keyboard handler for interactive right hand warmup
  useEffect(() => {
    if (!isOpen || isCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.isComposing) return;

      const key = e.key.toLowerCase();
      setLastKeyPressed(key);

      // Phase 0: In-to-Out roll: ['j', 'k', 'l', ';']
      if (phase === 0) {
        const seq = ['j', 'k', 'l', ';'];
        const currentExpected = seq[stepIndex];

        if (key === currentExpected) {
          e.preventDefault();
          triggerKeySound();
          const next = stepIndex + 1;
          if (next >= seq.length) {
            setPhase(1);
            setStepIndex(0);
            setFeedbackMsg('Hebat! Aliran dalam-ke-luar tuntas. Fase 2 (Luar ke Dalam): Tekan tuts titik koma (;) dengan kelingking kanan.');
          } else {
            setStepIndex(next);
            const nextKey = seq[next] === ';' ? 'titik koma (;)' : `huruf ${seq[next]!.toUpperCase()}`;
            const fingerName = next === 1 ? 'tengah' : next === 2 ? 'manis' : 'kelingking';
            setFeedbackMsg(`Tepat! Sekarang tekan tuts ${nextKey} menggunakan jari ${fingerName} kanan.`);
          }
        } else if (['j', 'k', 'l', ';'].includes(key)) {
          triggerErrorSound();
          const expectedDisplay = currentExpected === ';' ? ';' : currentExpected.toUpperCase();
          setFeedbackMsg(`Urutan Fase 1 adalah J ➔ K ➔ L ➔ ;. Tombol berikutnya yang diharapkan adalah [${expectedDisplay}].`);
        }
      }
      // Phase 1: Out-to-In roll: [';', 'l', 'k', 'j']
      else if (phase === 1) {
        const seq = [';', 'l', 'k', 'j'];
        const currentExpected = seq[stepIndex];

        if (key === currentExpected) {
          e.preventDefault();
          triggerKeySound();
          const next = stepIndex + 1;
          if (next >= seq.length) {
            setPhase(2);
            setStepIndex(0);
            setFeedbackMsg('Bagus sekali! Refleks kembali ke poros J sangat presisi. Fase 3: Ketik pola ritmis "jkl; ;lkj " berturut-turut.');
          } else {
            setStepIndex(next);
            const nextKey = seq[next] === ';' ? ';' : seq[next]!.toUpperCase();
            const fingerName = next === 1 ? 'manis' : next === 2 ? 'tengah' : 'telunjuk';
            setFeedbackMsg(`Bagus! Lanjutkan tekan [${nextKey}] dengan jari ${fingerName} kanan.`);
          }
        } else if (['j', 'k', 'l', ';'].includes(key)) {
          triggerErrorSound();
          const expectedDisplay = currentExpected === ';' ? ';' : currentExpected.toUpperCase();
          setFeedbackMsg(`Urutan Fase 2 adalah ; ➔ L ➔ K ➔ J. Tombol berikutnya yang diharapkan adalah [${expectedDisplay}].`);
        }
      }
      // Phase 2: Rhythmic Combination & Space: "jkl; ;lkj "
      else if (phase === 2) {
        const targetSequence = ['j', 'k', 'l', ';', ' ', ';', 'l', 'k', 'j', ' '];
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
            setFeedbackMsg('Luar biasa! 4 jari tangan kanan Anda kini memiliki refleks yang lincah, ritmis, dan mandiri. Siap masuk ke latihan teks lengkap.');

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
            const nextDisplay = targetSequence[next] === ' ' ? 'Spasi' : targetSequence[next] === ';' ? ';' : targetSequence[next]!.toUpperCase();
            setFeedbackMsg(`Bagus! Lanjut ketukan berikutnya: [${nextDisplay}].`);
          }
        } else {
          triggerErrorSound();
          const expectedDisplay = currentExpected === ' ' ? 'Spasi' : currentExpected === ';' ? ';' : currentExpected!.toUpperCase();
          setFeedbackMsg(`Ketukan yang diharapkan adalah [${expectedDisplay}]. Tekan dengan jari tangan kanan yang sesuai.`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, phase, stepIndex, isCompleted, triggerKeySound, triggerErrorSound, triggerSuccessSound, onWarmupComplete]);

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-card via-card/95 to-amber-500/5 shadow-card overflow-hidden transition-all duration-300">
      {/* Header Bar with Accordion Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border/60 bg-amber-500/5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 text-amber-950 font-bold shadow-xs">
            <Hand className="h-4 w-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.2 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Isolasi Tangan Kanan
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                {lessonId ? `Pelajaran ${lessonId} · ` : ''}{lessonTitle}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight mt-0.5">
              Penguatan Koordinasi & Kemandirian 4 Jari Tangan Kanan (J - K - L - ;)
            </h3>
          </div>
        </div>

        {onToggleOpen && (
          <button
            onClick={onToggleOpen}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors self-start sm:self-center shadow-xs"
          >
            <span>{isOpen ? 'Sembunyikan Panduan Tangan Kanan' : 'Buka Panduan Tangan Kanan'}</span>
            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Expandable Content Area */}
      {isOpen && (
        <div className="p-5 sm:p-6 space-y-6 animate-in fade-in duration-200">
          {/* 4 Fingers Anatomy & Pillar Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {rightHandFingers.map((item, idx) => {
              const isCurrentInPhase0 = phase === 0 && idx === stepIndex;
              const isCurrentInPhase1 = phase === 1 && (3 - idx) === stepIndex;
              const isCurrentInPhase2 = phase === 2 && ['j', 'k', 'l', ';', ' ', ';', 'l', 'k', 'j', ' '][stepIndex] === item.key;

              return (
                <div
                  key={item.key}
                  className={`rounded-2xl border p-3.5 flex flex-col justify-between space-y-3 transition-all ${
                    isCurrentInPhase0 || isCurrentInPhase1 || isCurrentInPhase2
                      ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-500/10 shadow-sm'
                      : 'border-border bg-card/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Jari {item.finger}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{item.fingerName}</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <div
                      className="finger-pillar w-8 rounded-t-full"
                      style={{
                        height: item.finger === 8 ? 36 : item.finger === 6 ? 52 : 44,
                        ['--finger' as string]: `var(--finger-${item.finger})`,
                      }}
                    />
                    <div
                      data-active={isCurrentInPhase0 || isCurrentInPhase1 || isCurrentInPhase2 ? 'true' : undefined}
                      className="key-cap relative flex h-11 w-11 items-center justify-center rounded-xl font-mono text-base font-black shadow-xs border border-border bg-card text-foreground"
                      style={{ ['--finger' as string]: `var(--finger-${item.finger})` }}
                    >
                      <span className="uppercase">{item.key}</span>
                      {item.hasBump && (
                        <span
                          className="absolute bottom-1 h-0.8 w-2.5 rounded-full bg-amber-500 ring-1 ring-background"
                          title="Tonjolan taktil penanda posisi awal J"
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
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Keyboard className="h-4 w-4" />
                  <span>Uji Coba Ketukan Tangan Kanan (Interactive Right Hand Warm-up)</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Lakukan 3 tahapan pemanasan berikut langsung di keyboard fisik Anda menggunakan tangan kanan:
                </p>
              </div>

              {isCompleted ? (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 self-start sm:self-auto">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Pemanasan Tangan Kanan Selesai!</span>
                </div>
              ) : (
                <span className="text-xs font-mono font-semibold text-muted-foreground self-start sm:self-auto">
                  Fase {phase + 1} dari 3
                </span>
              )}
            </div>

            {/* 3 Phase Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Phase 1: In to Out (J K L ;) */}
              <div
                className={`rounded-xl border p-3 transition-all ${
                  phase > 0
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : phase === 0
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5 text-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase">Fase 1 · Dalam ke Luar</span>
                  {phase > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : phase === 0 ? (
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  ) : null}
                </div>
                <div className="mt-1 font-mono font-bold text-sm flex items-center gap-1.5">
                  {['J', 'K', 'L', ';'].map((k, idx) => (
                    <kbd
                      key={k}
                      className={`rounded px-1.5 py-0.2 border text-xs uppercase ${
                        phase > 0 || (phase === 0 && stepIndex > idx)
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-extrabold'
                          : phase === 0 && stepIndex === idx
                          ? 'bg-amber-500 text-amber-950 border-amber-500 font-black animate-pulse'
                          : 'bg-card border-border'
                      }`}
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground block mt-1">Telunjuk ke Kelingking</span>
              </div>

              {/* Phase 2: Out to In (; L K J) */}
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
                  <span className="text-[11px] font-bold uppercase">Fase 2 · Luar ke Dalam</span>
                  {phase > 1 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : phase === 1 ? (
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  ) : null}
                </div>
                <div className="mt-1 font-mono font-bold text-sm flex items-center gap-1.5">
                  {[';', 'L', 'K', 'J'].map((k, idx) => (
                    <kbd
                      key={k}
                      className={`rounded px-1.5 py-0.2 border text-xs uppercase ${
                        phase > 1 || (phase === 1 && stepIndex > idx)
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-extrabold'
                          : phase === 1 && stepIndex === idx
                          ? 'bg-amber-500 text-amber-950 border-amber-500 font-black animate-pulse'
                          : 'bg-card border-border'
                      }`}
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground block mt-1">Kelingking ke Telunjuk</span>
              </div>

              {/* Phase 3: Rhythmic Combination & Space (jkl; ;lkj) */}
              <div
                className={`rounded-xl border p-3 transition-all ${
                  phase > 2
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : phase === 2
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5 text-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase">Fase 3 · Pola Ritmis</span>
                  {phase > 2 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : phase === 2 ? (
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  ) : null}
                </div>
                <div className="mt-1 font-mono font-bold text-xs flex items-center gap-1">
                  <span className="rounded bg-card px-1.5 py-0.5 border border-border">jkl;</span>
                  <span className="text-muted-foreground">+</span>
                  <span className="rounded bg-card px-1.5 py-0.5 border border-border">;lkj</span>
                </div>
                <span className="text-[10px] text-muted-foreground block mt-1">Kombinasi Tangan Kanan & Spasi</span>
              </div>
            </div>

            {/* Dynamic Instructional Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/40 p-3.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <Info className="h-4 w-4 text-amber-500 shrink-0" />
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
                  title="Ulangi pemanasan tangan kanan"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Ulangi</span>
                </button>

                {onWarmupComplete && (
                  <button
                    onClick={onWarmupComplete}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 text-amber-950 font-bold text-xs shadow-xs hover:bg-amber-400 transition-colors"
                  >
                    <span>Mulai Mengetik Teks Tangan Kanan</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Ergonomic & Poros J Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">
                <ShieldCheck className="h-4 w-4" />
                <span>Kemandirian Jari Manis (L) & Kelingking (;)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Jari manis dan kelingking tangan kanan memiliki keterikatan tendon fleksor alami. Latihan kombinasi roll ini melatih saraf motorik agar jari manis tetap luwes saat kelingking menekan tuts <b>;</b>.
              </p>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase">
                <Anchor className="h-4 w-4" />
                <span>Poros Tonjolan Taktil J & Siaga Tangan Kiri</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Raba tonjolan kecil di tombol <b>J</b> dengan bantalan jari telunjuk kanan Anda sebagai jangkar utama. Jaga jari tangan kiri tetap beristirahat rileks di tuts <b>A - S - D - F</b>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
