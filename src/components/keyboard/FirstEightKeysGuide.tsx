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
  Info,
  Trophy,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '@/hooks/useSound';

interface FirstEightKeysGuideProps {
  lessonId?: string;
  lessonTitle: string;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  onWarmupComplete?: () => void;
}

// 8 Home Row Keys with designated fingers
const leftRow = [
  { char: 'a', finger: 0, fingerName: 'Kelingking' },
  { char: 's', finger: 1, fingerName: 'Manis' },
  { char: 'd', finger: 2, fingerName: 'Tengah' },
  { char: 'f', finger: 3, fingerName: 'Telunjuk', hasBump: true },
];

const rightRow = [
  { char: 'j', finger: 5, fingerName: 'Telunjuk', hasBump: true },
  { char: 'k', finger: 6, fingerName: 'Tengah' },
  { char: 'l', finger: 7, fingerName: 'Manis' },
  { char: ';', finger: 8, fingerName: 'Kelingking' },
];

// Curated Indonesian words formed exclusively with the 8 home row keys
const WORD_BANK = [
  'ada',
  'saja',
  'jasa',
  'lada',
  'alas',
  'kala',
  'asal',
  'salak',
  'jaksa',
  'fasad',
  'alfa',
  'kasa',
];

// 4 Interactive Warm-up Target Words
const WARMUP_WORDS = ['ada ', 'saja ', 'salak ', 'jaksa; '];

export const FirstEightKeysGuide: React.FC<FirstEightKeysGuideProps> = ({
  lessonId,
  lessonTitle,
  isOpen = true,
  onToggleOpen,
  onWarmupComplete,
}) => {
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [charIndex, setCharIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>(
    'Ketik kata pertama: "ada " (tekan tuts A, D, A, lalu Spasi).'
  );

  const { triggerKeySound, triggerErrorSound, triggerSuccessSound } = useSound();

  const handleResetWarmup = useCallback(() => {
    setWordIndex(0);
    setCharIndex(0);
    setIsCompleted(false);
    setLastKeyPressed(null);
    setFeedbackMsg('Ketik kata pertama: "ada " (tekan tuts A, D, A, lalu Spasi).');
  }, []);

  // Keyboard handler for interactive word warmup
  useEffect(() => {
    if (!isOpen || isCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.isComposing) return;

      const key = e.key.toLowerCase();
      setLastKeyPressed(key);

      const targetWord = WARMUP_WORDS[wordIndex];
      if (!targetWord) return;

      const expectedChar = targetWord[charIndex];

      // Handle space bar
      const isSpaceExpected = expectedChar === ' ';
      const isSpacePressed = key === ' ' || key === 'spacebar';
      const isMatch = isSpaceExpected ? isSpacePressed : key === expectedChar;

      if (isMatch) {
        e.preventDefault();
        triggerKeySound();

        const nextChar = charIndex + 1;
        if (nextChar >= targetWord.length) {
          // Completed current word
          const nextWord = wordIndex + 1;
          if (nextWord >= WARMUP_WORDS.length) {
            // All words completed
            triggerSuccessSound();
            setIsCompleted(true);
            setFeedbackMsg(
              'Luar biasa! Seluruh 4 kata pemanasan berhasil diketik dengan sempurna. Anda siap masuk ke latihan teks lengkap.'
            );

            try {
              confetti({
                particleCount: 70,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch {
              // Ignore if canvas is unavailable
            }

            if (onWarmupComplete) {
              onWarmupComplete();
            }
          } else {
            setWordIndex(nextWord);
            setCharIndex(0);
            const nextWordClean = WARMUP_WORDS[nextWord]!.trim();
            setFeedbackMsg(`Bagus sekali! Lanjut ke kata berikutnya: "${nextWordClean}".`);
          }
        } else {
          setCharIndex(nextChar);
          const nextCharDisplay = targetWord[nextChar] === ' ' ? 'Spasi' : targetWord[nextChar]!.toUpperCase();
          setFeedbackMsg(`Tepat! Karakter berikutnya: [${nextCharDisplay}].`);
        }
      } else {
        // Wrong key pressed
        triggerErrorSound();
        const expectedDisplay = expectedChar === ' ' ? 'Spasi' : expectedChar!.toUpperCase();
        setFeedbackMsg(`Tombol yang diharapkan adalah [${expectedDisplay}]. Tekan dengan jari yang sesuai pada Home Row.`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, wordIndex, charIndex, isCompleted, triggerKeySound, triggerErrorSound, triggerSuccessSound, onWarmupComplete]);

  return (
    <div className="rounded-3xl border border-primary/30 bg-gradient-to-b from-card via-card/95 to-primary/5 shadow-card overflow-hidden transition-all duration-300">
      {/* Header Bar with Accordion Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Milestone Fondasi
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                {lessonId ? `Pelajaran ${lessonId} · ` : ''}{lessonTitle}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight mt-0.5">
              Latihan Mengetik Kata Pertama dengan 8 Tombol Utama Home Row
            </h3>
          </div>
        </div>

        {onToggleOpen && (
          <button
            onClick={onToggleOpen}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors self-start sm:self-center shadow-xs"
          >
            <span>{isOpen ? 'Sembunyikan Panduan Kata' : 'Buka Panduan Kata (First 8 Keys)'}</span>
            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Expandable Content Area */}
      {isOpen && (
        <div className="p-5 sm:p-6 space-y-6 animate-in fade-in duration-200">
          {/* Top Section: Complete 8-Key Home Row Overview */}
          <div className="rounded-2xl border border-border bg-card/60 p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                <Anchor className="h-4 w-4" />
                <span>Formasi 8 Tuts Lengkap Baris Beranda (A S D F — J K L ;)</span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                100% Tuts Dasar Home Row Telah Dikuasai
              </span>
            </div>

            {/* Visual Keys Keyboard Representation */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 pt-1">
              {/* Left Hand: A S D F */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {leftRow.map((k) => (
                  <div key={k.char} className="flex flex-col items-center gap-1">
                    <div
                      className="finger-pillar w-7 sm:w-8 rounded-t-full"
                      style={{
                        height: k.finger === 0 ? 34 : k.finger === 2 ? 46 : 40,
                        ['--finger' as string]: `var(--finger-${k.finger})`,
                      }}
                    />
                    <div
                      className="key-cap relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl font-mono text-sm uppercase font-bold shadow-xs border border-border bg-card text-foreground"
                      style={{ ['--finger' as string]: `var(--finger-${k.finger})` }}
                    >
                      <span>{k.char}</span>
                      {k.hasBump && (
                        <span
                          className="absolute bottom-1 h-0.8 w-2.5 rounded-full bg-primary ring-1 ring-background"
                          title="Tonjolan taktil penanda posisi awal F"
                        />
                      )}
                    </div>
                    <span className="text-[9px] text-muted-foreground font-semibold">{k.fingerName}</span>
                  </div>
                ))}
              </div>

              {/* Middle Space Divider */}
              <div className="flex flex-col items-center px-2">
                <div className="h-8 w-px bg-border/80 hidden md:block" />
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase px-2 py-0.5 rounded bg-muted/60 my-1">
                  Home Row
                </span>
                <div className="h-8 w-px bg-border/80 hidden md:block" />
              </div>

              {/* Right Hand: J K L ; */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {rightRow.map((k) => (
                  <div key={k.char} className="flex flex-col items-center gap-1">
                    <div
                      className="finger-pillar w-7 sm:w-8 rounded-t-full"
                      style={{
                        height: k.finger === 8 ? 34 : k.finger === 6 ? 46 : 40,
                        ['--finger' as string]: `var(--finger-${k.finger})`,
                      }}
                    />
                    <div
                      className="key-cap relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl font-mono text-sm font-bold shadow-xs border border-border bg-card text-foreground"
                      style={{ ['--finger' as string]: `var(--finger-${k.finger})` }}
                    >
                      <span>{k.char}</span>
                      {k.hasBump && (
                        <span
                          className="absolute bottom-1 h-0.8 w-2.5 rounded-full bg-primary ring-1 ring-background"
                          title="Tonjolan taktil penanda posisi awal J"
                        />
                      )}
                    </div>
                    <span className="text-[9px] text-muted-foreground font-semibold">{k.fingerName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Word Bank: Indonesian words constructed using only the first 8 home row keys */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <BookOpen className="h-4 w-4" />
                <span>Bank Kosakata Home Row (Word Showcase)</span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Kombinasi kata utuh bahasa Indonesia
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Mulai modul ini, Anda tidak lagi hanya mengetik huruf acak, melainkan kata-kata utuh yang bermakna:
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {WORD_BANK.map((w) => (
                <span
                  key={w}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-primary/20 bg-card font-mono text-xs sm:text-sm font-bold text-foreground shadow-2xs hover:border-primary/50 transition-colors"
                >
                  <span className="text-primary">•</span>
                  <span>{w}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Word Typing Warm-up */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 text-left space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <Keyboard className="h-4 w-4" />
                  <span>Uji Coba Ketik Kata Interaktif (Word Typing Warm-up)</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ketik 4 kata pemanasan berikut langsung di keyboard fisik untuk melatih memori transisi antar-huruf:
                </p>
              </div>

              {isCompleted ? (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 self-start sm:self-auto">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Pemanasan Kata Tuntas!</span>
                </div>
              ) : (
                <span className="text-xs font-mono font-semibold text-muted-foreground self-start sm:self-auto">
                  Kata {wordIndex + 1} dari 4
                </span>
              )}
            </div>

            {/* 4 Interactive Word Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {WARMUP_WORDS.map((w, wIdx) => {
                const cleanWord = w.trim();
                const isPassed = isCompleted || wordIndex > wIdx;
                const isCurrent = !isCompleted && wordIndex === wIdx;

                return (
                  <div
                    key={w}
                    className={`rounded-xl border p-3 transition-all ${
                      isPassed
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : isCurrent
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5 text-foreground'
                        : 'border-border bg-muted/30 text-muted-foreground opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Kata {wIdx + 1}
                      </span>
                      {isPassed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : isCurrent ? (
                        <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                      ) : null}
                    </div>

                    {/* Word Character Breakdown */}
                    <div className="font-mono text-base font-bold flex items-center gap-1">
                      {cleanWord.split('').map((ch, cIdx) => {
                        const isTypedInWord = isPassed || (isCurrent && charIndex > cIdx);
                        const isCurrentCaret = isCurrent && charIndex === cIdx;

                        return (
                          <span
                            key={cIdx}
                            className={`px-1 py-0.2 rounded transition-colors ${
                              isTypedInWord
                                ? 'text-emerald-600 dark:text-emerald-400 font-black bg-emerald-500/20'
                                : isCurrentCaret
                                ? 'bg-primary text-primary-foreground font-black animate-pulse'
                                : 'text-foreground/70'
                            }`}
                          >
                            {ch}
                          </span>
                        );
                      })}
                      {isCurrent && charIndex === cleanWord.length && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1 rounded font-sans uppercase">
                          ␣ Spasi
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
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
                  title="Ulangi pemanasan mengetik kata"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Ulangi</span>
                </button>

                {onWarmupComplete && (
                  <button
                    onClick={onWarmupComplete}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
                  >
                    <span>Mulai Mengetik Teks Lengkap</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Next Lesson Teaser Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>
                <b>Tahap Berikutnya:</b> Selesaikan modul kata ini untuk membuka mini-game interaktif <b>15. Play: First 8 Keys</b>!
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground sm:text-right shrink-0">
              Pertahankan ketukan ritmis konstan di setiap kata
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
