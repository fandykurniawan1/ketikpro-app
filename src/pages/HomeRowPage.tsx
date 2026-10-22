import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Anchor,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Keyboard,
  ShieldCheck,
  Compass,
  GraduationCap,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '@/hooks/useSound';
import { VirtualKeyboard } from '@/components/keyboard/VirtualKeyboard';
import type { HitState } from '@/types/typing';

interface KeyInfo {
  key: string;
  display: string;
  fingerId: number;
  fingerName: string;
  hand: 'left' | 'right' | 'thumb';
  hasTactileBump?: boolean;
  desc: string;
}

const homeRowKeys: KeyInfo[] = [
  {
    key: 'a',
    display: 'A',
    fingerId: 0,
    fingerName: 'Kelingking Kiri',
    hand: 'left',
    desc: 'Jari kelingking kiri diletakkan di atas huruf A.',
  },
  {
    key: 's',
    display: 'S',
    fingerId: 1,
    fingerName: 'Jari Manis Kiri',
    hand: 'left',
    desc: 'Jari manis kiri diletakkan di atas huruf S.',
  },
  {
    key: 'd',
    display: 'D',
    fingerId: 2,
    fingerName: 'Jari Tengah Kiri',
    hand: 'left',
    desc: 'Jari tengah kiri diletakkan di atas huruf D.',
  },
  {
    key: 'f',
    display: 'F',
    fingerId: 3,
    fingerName: 'Jari Telunjuk Kiri',
    hand: 'left',
    hasTactileBump: true,
    desc: 'Jari telunjuk kiri di huruf F. Raba tonjolan taktil kecil pada tuts ini.',
  },
  {
    key: ' ',
    display: 'SPASI',
    fingerId: 4,
    fingerName: 'Kedua Ibu Jari',
    hand: 'thumb',
    desc: 'Kedua ibu jari bertumpu santai di atas tombol Spasi.',
  },
  {
    key: 'j',
    display: 'J',
    fingerId: 5,
    fingerName: 'Jari Telunjuk Kanan',
    hand: 'right',
    hasTactileBump: true,
    desc: 'Jari telunjuk kanan di huruf J. Raba tonjolan taktil kecil penanda posisi.',
  },
  {
    key: 'k',
    display: 'K',
    fingerId: 6,
    fingerName: 'Jari Tengah Kanan',
    hand: 'right',
    desc: 'Jari tengah kanan diletakkan di atas huruf K.',
  },
  {
    key: 'l',
    display: 'L',
    fingerId: 7,
    fingerName: 'Jari Manis Kanan',
    hand: 'right',
    desc: 'Jari manis kanan diletakkan di atas huruf L.',
  },
  {
    key: ';',
    display: ';',
    fingerId: 8,
    fingerName: 'Jari Kelingking Kanan',
    hand: 'right',
    desc: 'Jari kelingking kanan diletakkan di atas tombol titik koma (;).',
  },
];

const drillSequence = ['a', 's', 'd', 'f', ' ', 'j', 'k', 'l', ';'];

export const HomeRowPage: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string>('f');
  const [hit, setHit] = useState<HitState | null>(null);
  const [drillStep, setDrillStep] = useState<number>(0);
  const [isDrillCompleted, setIsDrillCompleted] = useState<boolean>(false);
  const { soundTheme, changeSoundTheme, triggerKeySound, triggerErrorSound, triggerSuccessSound } =
    useSound();

  const currentKeyInfo = homeRowKeys.find((k) => k.key === activeKey.toLowerCase());

  const handleSelectKey = useCallback(
    (keyChar: string) => {
      const normalizedKey = keyChar.toLowerCase();
      setActiveKey(normalizedKey);
      setHit({ key: normalizedKey, ok: true, timestamp: Date.now() });
      triggerKeySound();
    },
    [triggerKeySound]
  );

  // Global physical keyboard listener for interactive exploration and drill
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting browser shortcuts
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const pressedKey = e.key.toLowerCase();
      setActiveKey(pressedKey);
      triggerKeySound();

      // Check drill progress if not yet finished
      if (!isDrillCompleted) {
        const expected = drillSequence[drillStep];
        if (pressedKey === expected) {
          const nextStep = drillStep + 1;
          setHit({ key: pressedKey, ok: true, timestamp: Date.now(), expected });
          if (nextStep >= drillSequence.length) {
            setDrillStep(nextStep);
            setIsDrillCompleted(true);
            triggerSuccessSound();
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } else {
            setDrillStep(nextStep);
          }
        } else if (drillSequence.includes(pressedKey)) {
          setHit({ key: pressedKey, ok: false, timestamp: Date.now(), expected });
          triggerErrorSound();
        } else {
          setHit({ key: pressedKey, ok: true, timestamp: Date.now() });
        }
      } else {
        setHit({ key: pressedKey, ok: true, timestamp: Date.now() });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drillStep, isDrillCompleted, triggerKeySound, triggerErrorSound, triggerSuccessSound]);

  const resetDrill = () => {
    setDrillStep(0);
    setIsDrillCompleted(false);
    setActiveKey('a');
    setHit(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
            <Anchor className="h-3.5 w-3.5" />
            <span>Fondasi Utama 10 Jari</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-2">
            Home Row: Posisi Dasar Jari Tangan
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
            Titik awal dan jangkar kembali dari seluruh gerakan mengetik sepuluh jari tanpa perlu melihat keyboard.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeSoundTheme(soundTheme === 'off' ? 'mechanical' : 'off')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
            title="Nyalakan / Matikan Efek Suara Ketukan"
          >
            {soundTheme === 'off' ? (
              <>
                <VolumeX className="h-4 w-4 text-muted-foreground" />
                <span>Suara: Mati</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-primary" />
                <span>Suara: Aktif</span>
              </>
            )}
          </button>

          <Link
            to="/belajar"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Ke Kurikulum</span>
          </Link>
        </div>
      </div>

      {/* Main Introduction Callout */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background p-6 sm:p-8 shadow-card">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Compass className="h-4 w-4" />
              <span>Instruksi Utama</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground leading-snug">
              Tempatkan jari-jari tangan Anda pada posisi dasar yang disebut{' '}
              <span className="text-primary underline decoration-primary/40 underline-offset-4">
                Home Row
              </span>
              .
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Home Row (baris beranda) adalah baris tengah pada keyboard yang menjadi rumah dan titik tolak bagi sepuluh jari Anda. Setiap kali selesai menekan tombol lain di baris atas atau baris bawah, jari harus selalu segera ditarik kembali ke posisi ini.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm backdrop-blur-xs">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Anchor className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-muted-foreground">Deretan Tuts</div>
              <div className="font-mono text-base font-extrabold text-foreground">
                A S D F — J K L ;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Virtual Keyboard QWERTY & Panduan Jari (Integrated Full Component) */}
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Virtual Keyboard QWERTY & Panduan Jari Interaktif
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gunakan keyboard fisik Anda atau klik tombol mana pun pada keyboard visual di bawah untuk mengeksplorasi posisi tuts dan jari.
            </p>
          </div>

          {/* Quick Home Row Key Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
            <span className="text-[11px] text-muted-foreground mr-1 hidden lg:inline">Pilih Home Row:</span>
            {homeRowKeys.map((k) => {
              const isSelected = activeKey.toLowerCase() === k.key;
              return (
                <button
                  key={k.key}
                  onClick={() => handleSelectKey(k.key)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-xs ring-2 ring-primary ring-offset-1 ring-offset-background'
                      : 'border border-border bg-muted/40 hover:bg-muted text-foreground'
                  }`}
                  title={`${k.fingerName}: ${k.display}`}
                >
                  {k.key === ' ' ? 'Spasi' : k.display}
                </button>
              );
            })}
          </div>
        </div>

        {/* The Full Virtual Keyboard QWERTY & Hands Guide Component */}
        <div className="pt-2">
          <VirtualKeyboard
            nextChar={activeKey}
            hit={hit}
            initialMode="full"
            onKeyClick={(keyId) => handleSelectKey(keyId)}
          />
        </div>

        {/* Active Key Detail Strip */}
        {currentKeyInfo && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <span
                className="grid h-10 w-10 place-items-center rounded-xl font-mono text-lg font-extrabold text-foreground shadow-xs border"
                style={{
                  backgroundColor: `color-mix(in oklab, var(--finger-${currentKeyInfo.fingerId}) 25%, var(--card))`,
                  borderColor: `var(--finger-${currentKeyInfo.fingerId})`,
                }}
              >
                {currentKeyInfo.display}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {currentKeyInfo.fingerName}
                  </span>
                  {currentKeyInfo.hasTactileBump && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                      <Sparkles className="h-3 w-3" />
                      Tonjolan Taktil Pemandu
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {currentKeyInfo.desc}
                </p>
              </div>
            </div>

            <span className="text-[11px] text-muted-foreground italic shrink-0">
              {currentKeyInfo.hand === 'left' && 'Tangan Kiri · Tuts Home Row'}
              {currentKeyInfo.hand === 'right' && 'Tangan Kanan · Tuts Home Row'}
              {currentKeyInfo.hand === 'thumb' && 'Kedua Ibu Jari · Bilah Spasi'}
            </span>
          </div>
        )}
      </section>

      {/* Step-by-Step Detail Cards (Exact Content from User Request) */}
      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Tata Letak Rinci 10 Jari</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-1">
            Pembagian Posisi Tangan Kiri, Kanan, dan Ibu Jari
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Card: Tangan Kiri */}
          <div className="rounded-3xl border border-blue-500/20 bg-card p-6 shadow-card hover:border-blue-500/40 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Tangan Kiri
                </span>
                <span className="font-mono text-xs font-bold text-muted-foreground">A · S · D · F</span>
              </div>

              {/* Exact user content quotation */}
              <p className="text-sm font-semibold text-foreground leading-relaxed">
                Untuk tangan kiri, letakkan jari kelingking pada huruf A, jari manis pada huruf S, jari tengah pada huruf D, dan jari telunjuk pada huruf F.
              </p>

              {/* Breakdown list */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleSelectKey('a')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 text-xs transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: 'var(--finger-0)' }} />
                    <span className="font-medium text-foreground">Jari Kelingking</span>
                  </div>
                  <kbd className="font-mono font-bold text-xs bg-card border px-2.5 py-0.5 rounded shadow-2xs">A</kbd>
                </button>
                <button
                  onClick={() => handleSelectKey('s')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 text-xs transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: 'var(--finger-1)' }} />
                    <span className="font-medium text-foreground">Jari Manis</span>
                  </div>
                  <kbd className="font-mono font-bold text-xs bg-card border px-2.5 py-0.5 rounded shadow-2xs">S</kbd>
                </button>
                <button
                  onClick={() => handleSelectKey('d')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 text-xs transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: 'var(--finger-2)' }} />
                    <span className="font-medium text-foreground">Jari Tengah</span>
                  </div>
                  <kbd className="font-mono font-bold text-xs bg-card border px-2.5 py-0.5 rounded shadow-2xs">D</kbd>
                </button>
                <button
                  onClick={() => handleSelectKey('f')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 text-xs transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: 'var(--finger-3)' }} />
                    <span className="font-bold text-foreground">Jari Telunjuk (Tonjolan Taktil)</span>
                  </div>
                  <kbd className="font-mono font-bold text-xs bg-card border border-blue-500/40 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded shadow-2xs">F</kbd>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground border-t border-border/50 pt-3 flex items-center gap-2">
              <Info className="h-3.5 w-3.5 shrink-0 text-blue-500" />
              <span>Telunjuk di F juga bertugas menjangkau R, V, T, G, dan B.</span>
            </div>
          </div>

          {/* Card: Tangan Kanan */}
          <div className="rounded-3xl border border-purple-500/20 bg-card p-6 shadow-card hover:border-purple-500/40 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Tangan Kanan
                </span>
                <span className="font-mono text-xs font-bold text-muted-foreground">J · K · L · ;</span>
              </div>

              {/* Exact user content quotation */}
              <p className="text-sm font-semibold text-foreground leading-relaxed">
                Sementara itu, untuk tangan kanan, letakkan jari telunjuk pada huruf J, jari tengah pada huruf K, jari manis pada huruf L, dan jari kelingking pada tombol titik koma (;).
              </p>

              {/* Breakdown list */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleSelectKey('j')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 text-xs transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: 'var(--finger-5)' }} />
                    <span className="font-bold text-foreground">Jari Telunjuk (Tonjolan Taktil)</span>
                  </div>
                  <kbd className="font-mono font-bold text-xs bg-card border border-purple-500/40 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded shadow-2xs">J</kbd>
                </button>
                <button
                  onClick={() => handleSelectKey('k')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 text-xs transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: 'var(--finger-6)' }} />
                    <span className="font-medium text-foreground">Jari Tengah</span>
                  </div>
                  <kbd className="font-mono font-bold text-xs bg-card border px-2.5 py-0.5 rounded shadow-2xs">K</kbd>
                </button>
                <button
                  onClick={() => handleSelectKey('l')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 text-xs transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: 'var(--finger-7)' }} />
                    <span className="font-medium text-foreground">Jari Manis</span>
                  </div>
                  <kbd className="font-mono font-bold text-xs bg-card border px-2.5 py-0.5 rounded shadow-2xs">L</kbd>
                </button>
                <button
                  onClick={() => handleSelectKey(';')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 text-xs transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: 'var(--finger-8)' }} />
                    <span className="font-medium text-foreground">Jari Kelingking</span>
                  </div>
                  <kbd className="font-mono font-bold text-xs bg-card border px-2.5 py-0.5 rounded shadow-2xs">;</kbd>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground border-t border-border/50 pt-3 flex items-center gap-2">
              <Info className="h-3.5 w-3.5 shrink-0 text-purple-500" />
              <span>Telunjuk di J juga bertugas menjangkau U, M, Y, H, dan N.</span>
            </div>
          </div>
        </div>

        {/* Card: Kedua Ibu Jari */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-foreground uppercase tracking-wider">
              Kedua Ibu Jari
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Terakhir, posisikan kedua ibu jari di atas tombol spasi.
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Kedua ibu jari tidak menekan tuts huruf, melainkan melayang santai di atas bilah tombol spasi yang panjang. Anda dapat menggunakan ibu jari tangan kanan atau tangan kiri sesuai kenyamanan ritme Anda.
            </p>
          </div>

          <button
            onClick={() => handleSelectKey(' ')}
            className="shrink-0 flex items-center gap-2 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
          >
            <kbd className="rounded-2xl border-2 border-border bg-muted/60 px-6 py-3 font-mono text-sm font-extrabold uppercase tracking-widest text-foreground shadow-xs">
              [ &nbsp;&nbsp;&nbsp; SPASI &nbsp;&nbsp;&nbsp; ]
            </kbd>
          </button>
        </div>
      </section>

      {/* Interactive Drill: Latihan Sentuh Posisi Dasar */}
      <section className="rounded-3xl border border-primary/30 bg-gradient-to-b from-card via-card to-primary/5 p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Latihan Refleks Langsung</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-foreground mt-1">
              Uji Coba Posisi Home Row Anda
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Letakkan 10 jari Anda di atas keyboard sekarang. Tekan tuts sesuai urutan berikut untuk memverifikasi penempatan jari:
            </p>
          </div>

          <button
            onClick={resetDrill}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start sm:self-auto shadow-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Tes</span>
          </button>
        </div>

        {/* Drill Progress Step Display */}
        <div className="grid grid-cols-5 sm:grid-cols-9 gap-2 pt-2">
          {drillSequence.map((char, index) => {
            const isPassed = index < drillStep;
            const isCurrent = index === drillStep && !isDrillCompleted;
            const displayChar = char === ' ' ? 'SPASI' : char.toUpperCase();

            return (
              <button
                key={index}
                onClick={() => handleSelectKey(char)}
                className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                  isPassed
                    ? 'border-success bg-success/10 text-success'
                    : isCurrent
                    ? 'border-primary bg-primary/15 text-primary scale-105 shadow-md ring-2 ring-primary animate-pulse'
                    : 'border-border/60 bg-muted/20 text-muted-foreground opacity-60 hover:opacity-100'
                }`}
              >
                {isPassed && (
                  <CheckCircle2 className="h-4 w-4 text-success absolute top-1.5 right-1.5" />
                )}
                <span className="font-mono text-base sm:text-lg font-extrabold">
                  {displayChar}
                </span>
                <span className="text-[9px] font-semibold uppercase mt-0.5">
                  {index < 4 ? 'Kiri' : index === 4 ? 'Ibu Jari' : 'Kanan'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Completion Message */}
        {isDrillCompleted && (
          <div className="rounded-2xl border border-success/40 bg-success/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-success text-success-foreground shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">
                  Hebat! 10 Jari Anda Terpasang Sempurna di Home Row!
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Anda telah mempraktikkan penempatan jari dasar dengan tepat. Sekarang saatnya melatih kecepatan di kurikulum.
                </p>
              </div>
            </div>

            <Link
              to="/latihan/2-1"
              className="inline-flex items-center gap-2 rounded-xl bg-success text-success-foreground px-5 py-2.5 text-xs font-bold hover:opacity-90 transition-opacity shadow-sm shrink-0"
            >
              <span>Mulai Latihan Level 2</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Conclusion & Golden Rule Section (User's Exact Ending Text) */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
          <Anchor className="h-4 w-4" />
          <span>Aturan Emas Mengetik 10 Jari</span>
        </div>

        <div className="space-y-4">
          <blockquote className="border-l-4 border-primary pl-4 sm:pl-6 text-base sm:text-lg font-semibold text-foreground italic leading-relaxed">
            &ldquo;Posisi ini menjadi titik awal untuk melatih teknik mengetik 10 jari. Biasakan mengembalikan jari-jari ke posisi Home Row setelah menekan tombol lain agar gerakan mengetik menjadi lebih teratur, cepat, dan akurat.&rdquo;
          </blockquote>

          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Titik Awal (Starting Point)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Setiap kali Anda meletakkan tangan di keyboard, raba tonjolan F dan J untuk memulai dari Home Row.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Jangkar Kembali (Home Base)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Setelah jari menjangkau baris atas atau baris bawah, segera tarik kembali ke Home Row tanpa jeda.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Teratur, Cepat & Akurat</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Memori otot otomatis terbangun saat jari selalu berangkat dan berlabuh di posisi yang konsisten.
              </p>
            </div>
          </div>
        </div>

        {/* Action navigation footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-5">
          <Link
            to="/panduan"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Buka Panduan Ergonomi & Pembagian Jari Lengkap
          </Link>

          <Link
            to="/latihan/2-1"
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
          >
            <span>Latihan Home Row di Kurikulum (Level 2)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomeRowPage;
