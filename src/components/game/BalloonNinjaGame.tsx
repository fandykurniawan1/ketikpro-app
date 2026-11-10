import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  LogOut,
  Sparkles,
  Heart,
  Lightbulb,
  Timer,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Lesson } from '@/types/curriculum';
import type { Stats } from '@/types/typing';
import { useSound } from '@/hooks/useSound';

interface BalloonNinjaGameProps {
  lesson: Lesson;
  onFinish: (stats: Stats, weakKeys: Record<string, number>) => void;
  onExit: () => void;
  onSwitchToClassic?: () => void;
}

type BalloonColor = 'purple' | 'red' | 'orange' | 'blue';

interface BalloonItem {
  id: number;
  char: string;
  color: BalloonColor;
  offsetY: number;
  delay: number;
}

const COLOR_PALETTE: BalloonColor[] = [
  'purple',
  'red',
  'purple',
  'orange',
  'red',
  'purple',
  'blue',
  'red',
  'orange',
  'red',
];

const BALLOON_TIME_LIMIT = 4000; // 4 detik per balon berjalan

export const BalloonNinjaGame: React.FC<BalloonNinjaGameProps> = ({
  lesson,
  onFinish,
  onExit,
  onSwitchToClassic,
}) => {
  const {
    soundTheme,
    changeSoundTheme,
    triggerErrorSound,
    triggerSuccessSound,
    triggerBalloonPopSound,
    triggerShurikenThrowSound,
  } = useSound();

  // Generate target sequence (40 balloon items to match screenshot)
  const targets = useMemo<BalloonItem[]>(() => {
    const rawChars = lesson.text.replace(/\s+/g, '').split('');
    const charPool = rawChars.length > 0 ? rawChars : ['f', 'j', 'k', 'd'];
    const totalCount = 40;
    const items: BalloonItem[] = [];

    for (let i = 0; i < totalCount; i++) {
      const char = charPool[i % charPool.length]!;
      const color = COLOR_PALETTE[i % COLOR_PALETTE.length]!;
      items.push({
        id: i,
        char,
        color,
        offsetY: ((i * 7) % 14) - 7,
        delay: (i * 0.2) % 2,
      });
    }
    return items;
  }, [lesson.text]);

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover' | 'completed'>('ready');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [errors, setErrors] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [weakKeys, setWeakKeys] = useState<Record<string, number>>({});
  const [isNinjaThrowing, setIsNinjaThrowing] = useState(false);
  const [shurikenActive, setShurikenActive] = useState<{ id: number; char: string } | null>(null);
  const [poppingState, setPoppingState] = useState<{ id: number; isError: boolean } | null>(null);
  const [wrongShake, setWrongShake] = useState(false);

  // Waktu balon berjalan (hitung mundur per balon dalam milidetik)
  const [timeLeft, setTimeLeft] = useState<number>(BALLOON_TIME_LIMIT);

  const containerRef = useRef<HTMLDivElement>(null);
  const isFinishedRef = useRef(false);
  const isTransitioningRef = useRef(false);

  const activeBalloon = targets[currentIndex];
  const remainingCount = targets.length - currentIndex;

  const handleStartGame = useCallback(() => {
    setGameState('playing');
    setStartTime(Date.now());
    setCurrentIndex(0);
    setLives(3);
    setErrors(0);
    setKeystrokes(0);
    setWeakKeys({});
    setTimeLeft(BALLOON_TIME_LIMIT);
    isFinishedRef.current = false;
    isTransitioningRef.current = false;
  }, []);

  const handleFinishGame = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setGameState('completed');
    triggerSuccessSound();

    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.6 },
    });

    const elapsedMs = startTime ? Date.now() - startTime : 1000;
    const elapsedSeconds = Math.max(1, Math.round(elapsedMs / 1000));
    const totalChars = targets.length;
    const effectiveKeystrokes = Math.max(totalChars, keystrokes);
    const accuracy = Math.max(0, Math.round(((effectiveKeystrokes - errors) / effectiveKeystrokes) * 100));
    const wpm = Math.max(1, Math.round((totalChars / 5) / (elapsedSeconds / 60)));
    const cpm = Math.round(totalChars / (elapsedSeconds / 60));

    const finalStats: Stats = {
      wpm,
      cpm,
      accuracy,
      errors,
      correctChars: totalChars,
      keystrokes: effectiveKeystrokes,
      seconds: elapsedSeconds,
    };

    onFinish(finalStats, weakKeys);
  }, [startTime, targets.length, keystrokes, errors, weakKeys, onFinish, triggerSuccessSound]);

  // Handler saat ketikan BENAR: Lempar shuriken ninja -> Balon meletus sukses -> Lanjut
  const handleCorrectHit = useCallback(
    (expectedChar: string) => {
      if (isTransitioningRef.current || isFinishedRef.current) return;
      if (!activeBalloon) return;

      isTransitioningRef.current = true;

      triggerShurikenThrowSound();
      setIsNinjaThrowing(true);
      setShurikenActive({ id: activeBalloon.id, char: expectedChar });

      setTimeout(() => {
        setIsNinjaThrowing(false);
        setPoppingState({ id: activeBalloon.id, isError: false });
        triggerBalloonPopSound();

        setTimeout(() => {
          setShurikenActive(null);
          setPoppingState(null);
          isTransitioningRef.current = false;
          setTimeLeft(BALLOON_TIME_LIMIT);

          const nextIdx = currentIndex + 1;
          if (nextIdx >= targets.length) {
            handleFinishGame();
          } else {
            setCurrentIndex(nextIdx);
          }
        }, 120);
      }, 130);
    },
    [activeBalloon, currentIndex, targets.length, handleFinishGame, triggerShurikenThrowSound, triggerBalloonPopSound]
  );

  // Handler saat KEHABISAN WAKTU: Balon meletus dan nyawa berkurang satu
  const handleTimeoutPop = useCallback(
    (expectedChar: string) => {
      if (isTransitioningRef.current || isFinishedRef.current) return;
      if (!activeBalloon) return;

      isTransitioningRef.current = true;

      triggerBalloonPopSound();
      triggerErrorSound();

      setErrors((prev) => prev + 1);
      setWeakKeys((prev) => ({
        ...prev,
        [expectedChar]: (prev[expectedChar] || 0) + 1,
      }));

      setPoppingState({ id: activeBalloon.id, isError: true });

      setLives((prev) => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          setGameState('gameover');
        }
        return Math.max(0, nextLives);
      });

      setTimeout(() => {
        setPoppingState(null);
        isTransitioningRef.current = false;
        setTimeLeft(BALLOON_TIME_LIMIT);

        setLives((currentLives) => {
          if (currentLives > 0) {
            const nextIdx = currentIndex + 1;
            if (nextIdx >= targets.length) {
              handleFinishGame();
            } else {
              setCurrentIndex(nextIdx);
            }
          }
          return currentLives;
        });
      }, 180);
    },
    [activeBalloon, currentIndex, targets.length, handleFinishGame, triggerBalloonPopSound, triggerErrorSound]
  );

  // Handler saat SALAH KETIK:
  // Balon HANYA bergoyang, suara error berbunyi, tapi TIDAK mengurangi nyawa dan TIDAK meletus!
  const handleWrongKeystroke = useCallback(
    (expectedChar: string) => {
      triggerErrorSound();
      setErrors((prev) => prev + 1);
      setWeakKeys((prev) => ({
        ...prev,
        [expectedChar]: (prev[expectedChar] || 0) + 1,
      }));
      setWrongShake(true);
      setTimeout(() => setWrongShake(false), 300);
    },
    [triggerErrorSound]
  );

  // Timer interval: Waktu balon berjalan mundur (countdown per balon)
  useEffect(() => {
    if (gameState !== 'playing' || isTransitioningRef.current) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (isTransitioningRef.current) return prev;
        const nextTime = prev - 60;
        if (nextTime <= 0) {
          // HABIS WAKTU: Balon meletus dan nyawa berkurang satu!
          if (activeBalloon) {
            handleTimeoutPop(activeBalloon.char.toLowerCase());
          }
          return BALLOON_TIME_LIMIT;
        }
        return nextTime;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [gameState, activeBalloon, handleTimeoutPop]);

  // Global keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept browser shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (gameState === 'ready') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleStartGame();
        }
        return;
      }

      if (gameState === 'gameover') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleStartGame();
        }
        return;
      }

      if (gameState !== 'playing' || isTransitioningRef.current) return;

      // Prevent scroll on spacebar during game
      if (e.key === ' ') {
        e.preventDefault();
      }

      const pressedKey = e.key.toLowerCase();
      if (pressedKey.length !== 1 && pressedKey !== ' ') return;

      setKeystrokes((prev) => prev + 1);

      if (!activeBalloon) return;

      const expected = activeBalloon.char.toLowerCase();

      if (pressedKey === expected) {
        // Ketikan BENAR: Lempar shuriken dan letuskan balon
        handleCorrectHit(expected);
      } else {
        // Ketikan SALAH: Balon HANYA bergoyang, tidak mengurangi nyawa!
        handleWrongKeystroke(expected);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameState,
    activeBalloon,
    handleStartGame,
    handleCorrectHit,
    handleWrongKeystroke,
  ]);

  // 10 visible balloons in the row
  const visibleBalloons = useMemo(() => {
    return targets.slice(currentIndex, currentIndex + 10);
  }, [targets, currentIndex]);

  // Sink effect: balon aktif perlahan turun saat waktunya berjalan menipis
  const sinkOffset = Math.min(22, Math.max(0, ((BALLOON_TIME_LIMIT - timeLeft) / BALLOON_TIME_LIMIT) * 22));

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-3xl border-2 border-primary/30 shadow-2xl select-none min-h-[480px] sm:min-h-[540px] flex flex-col justify-between"
      style={{
        background: 'linear-gradient(180deg, #378cd4 0%, #5ba7e4 45%, #88c5ef 75%, #b9e0f8 100%)',
      }}
    >
      {/* Top Controls Overlay */}
      <div className="relative z-20 flex items-center justify-between p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 rounded-xl bg-black/25 hover:bg-black/40 text-white px-3 py-1.5 text-xs font-bold backdrop-blur-xs transition-colors"
            title="Keluar ke kurikulum"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Kurikulum</span>
          </button>

          <button
            onClick={() => handleStartGame()}
            className="flex items-center gap-1.5 rounded-xl bg-black/25 hover:bg-black/40 text-white px-3 py-1.5 text-xs font-bold backdrop-blur-xs transition-colors"
            title="Ulangi permainan dari awal"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Mulai Ulang</span>
          </button>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          {onSwitchToClassic && (
            <button
              onClick={onSwitchToClassic}
              className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 text-xs font-bold backdrop-blur-xs transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Mode Klasik</span>
            </button>
          )}

          <button
            onClick={() => changeSoundTheme(soundTheme === 'off' ? 'mechanical' : 'off')}
            className="rounded-xl bg-black/25 hover:bg-black/40 text-white p-2 text-xs font-bold backdrop-blur-xs transition-colors"
            title="Nyalakan / Matikan Efek Suara"
          >
            {soundTheme === 'off' ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Floating Clouds Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Cloud 1 */}
        <div className="absolute top-6 left-8 opacity-80 animate-pulse" style={{ animationDuration: '6s' }}>
          <svg width="140" height="60" viewBox="0 0 140 60" fill="white">
            <path d="M20 50 A20 20 0 0 1 40 25 A30 30 0 0 1 90 20 A25 25 0 0 1 125 35 A20 20 0 0 1 120 50 Z" opacity="0.9" />
          </svg>
        </div>
        {/* Cloud 2 */}
        <div className="absolute top-16 right-16 opacity-75">
          <svg width="170" height="70" viewBox="0 0 170 70" fill="white">
            <path d="M25 60 A25 25 0 0 1 50 30 A35 35 0 0 1 115 25 A30 30 0 0 1 155 45 A25 25 0 0 1 145 60 Z" opacity="0.85" />
          </svg>
        </div>
        {/* Cloud 3 */}
        <div className="absolute top-44 left-1/3 opacity-70">
          <svg width="130" height="50" viewBox="0 0 130 50" fill="white">
            <path d="M20 45 A18 18 0 0 1 40 25 A25 25 0 0 1 80 20 A20 20 0 0 1 115 35 A15 15 0 0 1 110 45 Z" opacity="0.75" />
          </svg>
        </div>

        {/* Misty Distant Mountains Layers at Bottom */}
        <div className="absolute bottom-0 inset-x-0 h-48 opacity-60">
          <svg viewBox="0 0 1200 240" preserveAspectRatio="none" className="w-full h-full fill-[#529cd2]">
            <path d="M0,240 L0,140 Q150,70 300,120 T600,90 T900,130 T1200,80 L1200,240 Z" />
          </svg>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-36 opacity-70">
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-full fill-[#418dc7]">
            <path d="M0,200 L0,100 Q200,40 400,90 T800,60 T1200,110 L1200,200 Z" />
          </svg>
        </div>
      </div>

      {/* Row of Hot Air Balloons */}
      <div className="relative z-10 pt-2 sm:pt-4 px-4 sm:px-8">
        <div className="flex items-center justify-center gap-2 sm:gap-3.5 md:gap-4 overflow-x-hidden min-h-[160px]">
          {visibleBalloons.map((balloon, index) => {
            const isTarget = index === 0;
            const isPopping = poppingState?.id === balloon.id;
            const isErrorPop = isPopping && poppingState?.isError;

            return (
              <div
                key={balloon.id}
                className={`relative flex flex-col items-center transition-all duration-200 ${
                  isTarget ? 'scale-110 z-20' : 'scale-95 opacity-90 z-10'
                } ${isPopping ? (isErrorPop ? 'scale-125 opacity-0 rotate-12 transition-all duration-150' : 'scale-150 opacity-0 transition-all duration-150') : ''} ${
                  isTarget && wrongShake ? 'animate-shake' : ''
                }`}
                style={{
                  transform: `translateY(${balloon.offsetY + (isTarget ? sinkOffset : 0)}px)`,
                }}
              >
                {/* Visual Timer Berjalan di atas Balon Aktif */}
                {isTarget && gameState === 'playing' && (
                  <div className="absolute -top-9 flex flex-col items-center pointer-events-none z-30 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/30 text-[10px] font-bold text-white shadow-md">
                      <Timer className="h-3 w-3 text-amber-300" />
                      <span>{(Math.max(0, timeLeft) / 1000).toFixed(1)}s</span>
                    </div>
                    {/* Progress Bar Waktu Balon Berjalan */}
                    <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden mt-0.5 border border-white/20">
                      <div
                        className={`h-full transition-all duration-75 rounded-full ${
                          timeLeft > 2200
                            ? 'bg-emerald-400'
                            : timeLeft > 1000
                            ? 'bg-amber-400'
                            : 'bg-rose-500 animate-pulse'
                        }`}
                        style={{ width: `${Math.max(0, (timeLeft / BALLOON_TIME_LIMIT) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Radiant Aura / Starburst Halo on Target Balloon */}
                {isTarget && (
                  <div
                    className="absolute -inset-4 sm:-inset-6 rounded-full pointer-events-none animate-pulse"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0) 70%)',
                      filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.9))',
                    }}
                  />
                )}

                {/* Hot Air Balloon SVG */}
                <div className="relative">
                  <svg width="56" height="72" viewBox="0 0 60 76" className="drop-shadow-md">
                    <defs>
                      <linearGradient id={`bg-${balloon.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        {balloon.color === 'purple' && (
                          <>
                            <stop offset="0%" stopColor="#c084fc" />
                            <stop offset="100%" stopColor="#7e22ce" />
                          </>
                        )}
                        {balloon.color === 'red' && (
                          <>
                            <stop offset="0%" stopColor="#f87171" />
                            <stop offset="100%" stopColor="#dc2626" />
                          </>
                        )}
                        {balloon.color === 'orange' && (
                          <>
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#d97706" />
                          </>
                        )}
                        {balloon.color === 'blue' && (
                          <>
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#1d4ed8" />
                          </>
                        )}
                      </linearGradient>
                    </defs>

                    {/* Balloon Body */}
                    <path
                      d="M30 4 C15 4, 4 15, 4 30 C4 42, 18 54, 27 60 L33 60 C42 54, 56 42, 56 30 C56 15, 45 4, 30 4 Z"
                      fill={`url(#bg-${balloon.id})`}
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth="1.5"
                    />

                    {/* Subtle Balloon Vertical Rib Stripes */}
                    <path
                      d="M30 4 C24 15, 20 40, 28 60"
                      fill="none"
                      stroke="rgba(255,255,255,0.25)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M30 4 C36 15, 40 40, 32 60"
                      fill="none"
                      stroke="rgba(255,255,255,0.25)"
                      strokeWidth="1.5"
                    />

                    {/* Ropes to Basket */}
                    <line x1="26" y1="60" x2="24" y2="67" stroke="#78350f" strokeWidth="1" />
                    <line x1="34" y1="60" x2="36" y2="67" stroke="#78350f" strokeWidth="1" />

                    {/* Wicker Basket */}
                    <rect x="23" y="67" width="14" height="8" rx="1.5" fill="#b45309" stroke="#78350f" strokeWidth="1" />
                  </svg>

                  {/* Character on Balloon */}
                  <span
                    className={`absolute inset-0 flex items-center justify-center font-mono font-black text-white text-lg sm:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${
                      isTarget ? 'scale-110' : ''
                    }`}
                    style={{ top: '-10px' }}
                  >
                    {balloon.char}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Interactive Message */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center my-6 text-center px-4">
        {gameState === 'ready' && (
          <div
            onClick={handleStartGame}
            className="group cursor-pointer rounded-2xl bg-black/40 hover:bg-black/55 backdrop-blur-md px-8 py-5 border border-white/30 shadow-2xl transition-all hover:scale-105 active:scale-95 animate-in zoom-in-95 duration-200"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide drop-shadow-md">
              Type <span className="text-amber-300 underline underline-offset-4 decoration-amber-400">SPACE</span> to begin
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 mt-2 font-medium">
              Balon akan berjalan dengan waktu 4 detik. Ketik dengan cepat dan tepat!
            </p>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="rounded-2xl bg-black/80 backdrop-blur-md px-8 py-6 border border-rose-500/50 text-center shadow-2xl animate-in zoom-in-95 duration-200 max-w-sm">
            <div className="text-4xl mb-2">💔</div>
            <h3 className="text-xl font-extrabold text-white">Hati Habis!</h3>
            <p className="text-xs text-rose-200 mt-1.5 leading-relaxed">
              Waktu balon habis atau salah ketik membuat 3 balon meletus. Jaga ritme dan konsentrasi di tombol F, J, K, D!
            </p>
            <button
              onClick={handleStartGame}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold px-6 py-2.5 text-xs shadow-md transition-all active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Tekan Spasi untuk Coba Lagi</span>
            </button>
          </div>
        )}
      </div>

      {/* Shuriken Projectile Flying Effect */}
      {shurikenActive && (
        <div
          className="absolute z-30 pointer-events-none transition-all duration-150 ease-out"
          style={{
            left: '12%',
            bottom: '22%',
            animation: 'flyToTarget 130ms forwards linear',
          }}
        >
          <div className="animate-spin text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5">
              <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" />
              <circle cx="12" cy="12" r="2.5" fill="#0f172a" />
            </svg>
          </div>
        </div>
      )}

      {/* Bottom Scene: Cliff with Grass + Chibi Ninja & HUD */}
      <div className="relative z-10 flex items-end justify-between px-6 pb-6 pt-12">
        {/* Left Cliff with Ninja */}
        <div className="relative">
          {/* Rocky Cliff Base */}
          <div className="relative w-44 sm:w-56 h-32 sm:h-36">
            <svg viewBox="0 0 220 140" className="w-full h-full drop-shadow-xl overflow-visible">
              {/* Rock Body */}
              <path
                d="M-20,140 L0,50 Q30,42 60,45 Q120,40 160,55 Q180,65 170,140 Z"
                fill="#2c4d6f"
              />
              {/* Rock Dark Shadows */}
              <path
                d="M20,60 L40,140 L90,140 L80,75 Z"
                fill="#1e3650"
                opacity="0.6"
              />
              {/* Lush Green Grass Rim */}
              <path
                d="M-20,50 Q20,38 70,42 Q130,36 175,54 Q155,62 130,52 Q80,52 30,58 Z"
                fill="#48bb78"
              />
              <path
                d="M-20,48 Q20,36 70,40 Q130,34 175,52 Q150,56 120,48 Q70,48 20,54 Z"
                fill="#68d391"
              />
            </svg>

            {/* Cute Chibi Ninja */}
            <div
              className={`absolute left-10 sm:left-14 bottom-14 sm:bottom-18 transition-transform duration-100 ${
                isNinjaThrowing ? 'scale-110 -translate-y-1' : ''
              }`}
            >
              <svg width="68" height="68" viewBox="0 0 100 100" className="drop-shadow-lg">
                {/* Headband Tails Fluttering */}
                <path
                  d="M38 42 Q20 38 12 48 Q22 46 36 46 Z"
                  fill="#8b5cf6"
                />
                <path
                  d="M36 45 Q18 45 10 58 Q20 54 34 50 Z"
                  fill="#7c3aed"
                />

                {/* Ninja Body */}
                <ellipse cx="50" cy="68" rx="18" ry="16" fill="#1e293b" />
                {/* Belt */}
                <rect x="36" y="66" width="28" height="5" rx="2" fill="#dc2626" />

                {/* Ninja Head */}
                <circle cx="50" cy="40" r="20" fill="#0f172a" />
                {/* Mask Opening (Face area) */}
                <ellipse cx="54" cy="38" rx="13" ry="8" fill="#fed7aa" />
                {/* Big Expressive Anime Eyes */}
                <ellipse cx="50" cy="38" rx="3" ry="4" fill="#0f172a" />
                <circle cx="49" cy="37" r="1.2" fill="white" />
                <ellipse cx="58" cy="38" rx="3" ry="4" fill="#0f172a" />
                <circle cx="57" cy="37" r="1.2" fill="white" />

                {/* Headband Forehead Ribbon */}
                <path d="M33 32 Q50 30 67 32 L66 36 Q50 34 34 36 Z" fill="#8b5cf6" />
                <circle cx="50" cy="33" r="2.5" fill="#facc15" />

                {/* Arms & Hands */}
                {isNinjaThrowing ? (
                  // Throw pose: Right arm thrust forward with open hand
                  <>
                    <path d="M40 60 Q30 52 26 44" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" fill="none" />
                    <path d="M58 60 Q75 50 88 44" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" fill="none" />
                    <circle cx="89" cy="44" r="4.5" fill="#fed7aa" />
                  </>
                ) : (
                  // Ready martial stance
                  <>
                    <path d="M38 62 Q28 58 32 48" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" fill="none" />
                    <circle cx="32" cy="48" r="4.5" fill="#fed7aa" />
                    <path d="M60 62 Q72 56 68 46" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" fill="none" />
                    <circle cx="68" cy="46" r="4.5" fill="#fed7aa" />
                  </>
                )}

                {/* Little Feet */}
                <ellipse cx="42" cy="84" rx="6" ry="4" fill="#0f172a" />
                <ellipse cx="58" cy="84" rx="6" ry="4" fill="#0f172a" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom Right HUD: Target Count Bulb & Lives */}
        <div className="flex flex-col items-end gap-2.5">
          {/* Remaining Target Lightbulb */}
          <div className="flex items-center gap-2 rounded-2xl bg-black/40 backdrop-blur-md px-4 py-2 border border-white/20 shadow-lg text-white">
            <Lightbulb className="h-5 w-5 text-amber-300 fill-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]" />
            <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight">
              {remainingCount}
            </span>
          </div>

          {/* 3 Lives Hearts */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-black/35 backdrop-blur-md px-3.5 py-1.5 border border-white/15 shadow-md">
            {[0, 1, 2].map((idx) => {
              const isAlive = idx < lives;
              return (
                <Heart
                  key={idx}
                  className={`h-5 w-5 transition-transform duration-200 ${
                    isAlive
                      ? 'text-rose-500 fill-rose-500 scale-100 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]'
                      : 'text-white/20 fill-transparent scale-90'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalloonNinjaGame;
