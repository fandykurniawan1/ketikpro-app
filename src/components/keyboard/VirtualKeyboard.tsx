import React, { useState } from 'react';
import { Eye, EyeOff, Keyboard as KeyboardIcon, Sparkles } from 'lucide-react';
import type { HitState, KeyDef } from '@/types/typing';
import { fingerMap, fingerNames, homeKeys, keyFor } from '@/core/constants/curriculum';
import { KeyCap } from './KeyCap';
import { HandsGuide } from './HandsGuide';

// Physical keyboard layout with authentic dual legends and touch typing finger assignment
const keyboardPhysicalLayout: KeyDef[][] = [
  // Row 0: Number Row
  [
    { id: '`', label: '`', subLabel: '~', finger: 0, hand: 'left' },
    { id: '1', label: '1', subLabel: '!', finger: 0, hand: 'left' },
    { id: '2', label: '2', subLabel: '@', finger: 1, hand: 'left' },
    { id: '3', label: '3', subLabel: '#', finger: 2, hand: 'left' },
    { id: '4', label: '4', subLabel: '$', finger: 3, hand: 'left' },
    { id: '5', label: '5', subLabel: '%', finger: 3, hand: 'left' },
    { id: '6', label: '6', subLabel: '^', finger: 5, hand: 'right' },
    { id: '7', label: '7', subLabel: '&', finger: 5, hand: 'right' },
    { id: '8', label: '8', subLabel: '*', finger: 6, hand: 'right' },
    { id: '9', label: '9', subLabel: '(', finger: 7, hand: 'right' },
    { id: '0', label: '0', subLabel: ')', finger: 8, hand: 'right' },
    { id: '-', label: '-', subLabel: '_', finger: 8, hand: 'right' },
    { id: '=', label: '=', subLabel: '+', finger: 8, hand: 'right' },
    { id: 'Backspace', label: '⌫ Hapus', w: 'w-20 sm:w-24', finger: 8, hand: 'right' },
  ],
  // Row 1: Top Row
  [
    { id: 'Tab', label: 'Tab', w: 'w-14 sm:w-16', finger: 0, hand: 'left' },
    { id: 'q', label: 'q', finger: 0, hand: 'left' },
    { id: 'w', label: 'w', finger: 1, hand: 'left' },
    { id: 'e', label: 'e', finger: 2, hand: 'left' },
    { id: 'r', label: 'r', finger: 3, hand: 'left' },
    { id: 't', label: 't', finger: 3, hand: 'left' },
    { id: 'y', label: 'y', finger: 5, hand: 'right' },
    { id: 'u', label: 'u', finger: 5, hand: 'right' },
    { id: 'i', label: 'i', finger: 6, hand: 'right' },
    { id: 'o', label: 'o', finger: 7, hand: 'right' },
    { id: 'p', label: 'p', finger: 8, hand: 'right' },
    { id: '[', label: '[', subLabel: '{', finger: 8, hand: 'right' },
    { id: ']', label: ']', subLabel: '}', finger: 8, hand: 'right' },
    { id: '\\', label: '\\', subLabel: '|', w: 'w-14 sm:w-16', finger: 8, hand: 'right' },
  ],
  // Row 2: Home Row (Fondasi)
  [
    { id: 'Caps', label: 'Caps Lock', w: 'w-16 sm:w-20', finger: 0, hand: 'left' },
    { id: 'a', label: 'a', finger: 0, hand: 'left', isAnchor: true },
    { id: 's', label: 's', finger: 1, hand: 'left', isAnchor: true },
    { id: 'd', label: 'd', finger: 2, hand: 'left', isAnchor: true },
    { id: 'f', label: 'f', finger: 3, hand: 'left', isAnchor: true }, // has tactile bump
    { id: 'g', label: 'g', finger: 3, hand: 'left' },
    { id: 'h', label: 'h', finger: 5, hand: 'right' },
    { id: 'j', label: 'j', finger: 5, hand: 'right', isAnchor: true }, // has tactile bump
    { id: 'k', label: 'k', finger: 6, hand: 'right', isAnchor: true },
    { id: 'l', label: 'l', finger: 7, hand: 'right', isAnchor: true },
    { id: ';', label: ';', subLabel: ':', finger: 8, hand: 'right', isAnchor: true },
    { id: '\'', label: '\'', subLabel: '"', finger: 8, hand: 'right' },
    { id: '\n', label: 'Enter ↵', w: 'w-20 sm:w-24', finger: 8, hand: 'right' },
  ],
  // Row 3: Bottom Row
  [
    { id: 'ShiftL', label: 'Shift ⇧', w: 'w-20 sm:w-24', finger: 0, hand: 'left' },
    { id: 'z', label: 'z', finger: 0, hand: 'left' },
    { id: 'x', label: 'x', finger: 1, hand: 'left' },
    { id: 'c', label: 'c', finger: 2, hand: 'left' },
    { id: 'v', label: 'v', finger: 3, hand: 'left' },
    { id: 'b', label: 'b', finger: 3, hand: 'left' },
    { id: 'n', label: 'n', finger: 5, hand: 'right' },
    { id: 'm', label: 'm', finger: 5, hand: 'right' },
    { id: ',', label: ',', subLabel: '<', finger: 6, hand: 'right' },
    { id: '.', label: '.', subLabel: '>', finger: 7, hand: 'right' },
    { id: '/', label: '/', subLabel: '?', finger: 8, hand: 'right' },
    { id: 'ShiftR', label: 'Shift ⇧', w: 'w-24 sm:w-28', finger: 8, hand: 'right' },
  ],
  // Row 4: Space & Modifiers Row
  [
    { id: 'CtrlL', label: 'Ctrl', w: 'w-14 sm:w-16', finger: 0, hand: 'left' },
    { id: 'Win', label: '⊞ Win', w: 'w-12 sm:w-14', finger: 0, hand: 'left' },
    { id: 'AltL', label: 'Alt', w: 'w-12 sm:w-14', finger: 4, hand: 'thumb' },
    { id: ' ', label: '␣ Spasi (Space)', w: 'w-60 sm:w-80', finger: 4, hand: 'thumb' },
    { id: 'AltR', label: 'Alt', w: 'w-12 sm:w-14', finger: 4, hand: 'thumb' },
    { id: 'Fn', label: 'Fn', w: 'w-12 sm:w-14', finger: 8, hand: 'right' },
    { id: 'CtrlR', label: 'Ctrl', w: 'w-14 sm:w-16', finger: 8, hand: 'right' },
  ],
];

export type GuidanceViewMode = 'full' | 'keyboard-only' | 'blind';

interface VirtualKeyboardProps {
  nextChar: string;
  hit: HitState | null;
  initialMode?: GuidanceViewMode;
  onKeyClick?: (keyId: string) => void;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  nextChar,
  hit,
  initialMode = 'full',
  onKeyClick,
}) => {
  const [viewMode, setViewMode] = useState<GuidanceViewMode>(initialMode);

  // Compute key and shift requirements according to touch typing standards
  const { key, shift } = keyFor(nextChar);
  const finger = fingerMap[key] ?? -1;

  // Standard touch typing rule:
  // If target key belongs to right hand (finger >= 5), press LEFT SHIFT with left pinky (finger 0).
  // If target key belongs to left hand (finger < 5), press RIGHT SHIFT with right pinky (finger 8).
  const shiftKey = shift ? (finger >= 5 ? 'ShiftL' : 'ShiftR') : null;
  const shiftFinger = shiftKey === 'ShiftL' ? 0 : shiftKey === 'ShiftR' ? 8 : -1;

  // Home key anchor for this finger
  const homeKey = finger >= 0 ? homeKeys[finger] : undefined;
  const isAwayFromHome = homeKey !== undefined && key !== homeKey && finger !== 4;

  const getHitState = (id: string): 'ok' | 'bad' | undefined => {
    if (hit && hit.key.toLowerCase() === id.toLowerCase()) {
      return hit.ok ? 'ok' : 'bad';
    }
    return undefined;
  };

  const isLeftHand = finger < 4 || (finger === 4 && false);
  const isRightHand = finger >= 5;

  return (
    <div className="space-y-4">
      {/* Top Controls: View Mode Selector (Sediakan pilihan menyembunyikan petunjuk) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <KeyboardIcon className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Virtual Keyboard QWERTY & Panduan Jari
          </span>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-center bg-muted/50 p-1 rounded-xl border border-border/60 text-xs">
          <button
            onClick={() => setViewMode('full')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'full'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Tampilkan keyboard fisik dan panduan visual tangan lengkap"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Petunjuk Lengkap</span>
          </button>

          <button
            onClick={() => setViewMode('keyboard-only')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'keyboard-only'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Tampilkan hanya keyboard fisik tanpa visual tangan"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Hanya Keyboard</span>
          </button>

          <button
            onClick={() => setViewMode('blind')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'blind'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Sembunyikan petunjuk untuk latihan mandiri berbasis memori otot"
          >
            <EyeOff className="h-3.5 w-3.5" />
            <span>Mode Mandiri (Blind)</span>
          </button>
        </div>
      </div>

      {/* Blind Mode Notice */}
      {viewMode === 'blind' ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center space-y-2 shadow-xs animate-in fade-in duration-200">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 text-primary mb-1">
            <EyeOff className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Mode Latihan Mandiri Aktif (Blind Typing)
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Keyboard dan panduan jari disembunyikan. Percaya sepenuhnya pada sensasi taktil dan memori otot jari Anda tanpa melirik ke layar keyboard.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setViewMode('full')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <span>Klik di sini untuk menampilkan kembali petunjuk</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Physical Keyboard Frame */}
          <div className="relative mx-auto w-fit max-w-full overflow-x-auto rounded-3xl border-2 border-border/80 bg-gradient-to-b from-card to-card/90 p-4 sm:p-5 shadow-2xl space-y-1.5 animate-in fade-in duration-200">
            {/* Visual Header with Left/Right Hand Division Indicator */}
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 pb-1.5 border-b border-border/40">
              <span className="flex items-center gap-1.5 text-blue-500">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Wilayah Tangan Kiri
              </span>
              <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
                QWERTY Physical Layout · 10 Jari Standar
              </span>
              <span className="flex items-center gap-1.5 text-purple-500">
                Wilayah Tangan Kanan
                <span className="h-2 w-2 rounded-full bg-purple-500" />
              </span>
            </div>

            {/* Keyboard Rows */}
            {keyboardPhysicalLayout.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-1.5 justify-center">
                {row.map((k) => {
                  const isTargetKey = k.id.toLowerCase() === key.toLowerCase() || k.id === shiftKey;
                  const isTactileHome = k.id === 'f' || k.id === 'j';
                  const isAnchorKeyToReturn =
                    isAwayFromHome && k.id.toLowerCase() === homeKey?.toLowerCase();

                  return (
                    <KeyCap
                      key={k.id}
                      keyDef={k}
                      isActive={isTargetKey}
                      isHome={isTactileHome}
                      isAnchorReturn={isAnchorKeyToReturn}
                      hitState={getHitState(k.id)}
                      onClick={onKeyClick ? () => onKeyClick(k.id) : undefined}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Hands Guide Visual (Shown only in 'full' mode) */}
          {viewMode === 'full' && (
            <HandsGuide
              activeFingers={[finger, shiftFinger].filter((f) => f >= 0)}
              targetKey={nextChar}
              shiftKey={shiftKey}
            />
          )}

          {/* Dynamic Touch Typing Guidance HUD Card */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-card space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Target Key Info */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 text-primary font-mono text-xl font-bold shadow-xs">
                  {nextChar === ' ' ? '␣' : nextChar === '\n' ? '↵' : nextChar}
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Tombol Sasaran Berikutnya:
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    Tekan{' '}
                    <kbd className="rounded border border-border bg-muted/80 px-2 py-0.5 font-mono text-xs uppercase font-extrabold text-primary">
                      {nextChar === ' ' ? 'Spasi' : nextChar === '\n' ? 'Enter' : nextChar}
                    </kbd>
                    {shift && (
                      <span className="ml-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        (Kombinasi Shift + {key.toUpperCase()})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Finger Assignment Badge */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span
                  className="h-3.5 w-3.5 rounded-full border shadow-xs"
                  style={{ backgroundColor: `var(--finger-${finger >= 0 ? finger : 4})` }}
                />
                <div className="text-left">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Tanggung Jawab Jari:
                  </div>
                  <div className="text-xs font-bold text-foreground">
                    {finger >= 0 ? fingerNames[finger] : 'Ibu Jari'}{' '}
                    <span className="font-normal text-muted-foreground">
                      ({isLeftHand ? 'Tangan Kiri' : isRightHand ? 'Tangan Kanan' : 'Kedua Tangan'})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Home Row Return Warning Banner */}
            {isAwayFromHome && (
              <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200 font-medium animate-in fade-in duration-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white font-bold text-xs shadow-xs">
                  ⚓
                </span>
                <div>
                  <span className="font-bold">Panduan Refleks Jangkar:</span> Tuts{' '}
                  <b className="font-mono uppercase">[{key}]</b> berada di luar Home Row. Setelah
                  menekan tombol ini,{' '}
                  <span className="underline decoration-amber-500/60 font-semibold">
                    segera tarik kembali jari ke tombol jangkar [{homeKey?.toUpperCase()}]
                  </span>
                  .
                </div>
              </div>
            )}

            {/* Last Hit Feedback Notification */}
            {hit && (
              <div
                className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold animate-in fade-in duration-150 ${
                  hit.ok
                    ? 'border border-success/30 bg-success/10 text-success'
                    : 'border border-destructive/30 bg-destructive/10 text-destructive'
                }`}
              >
                <span>{hit.ok ? '✓ Ketukan Berhasil:' : '⚠️ Salah Ketik:'}</span>
                <kbd className="rounded border border-current/30 px-1.5 py-0.2 font-mono uppercase font-bold">
                  {hit.key === ' ' ? 'Spasi' : hit.key}
                </kbd>
                {!hit.ok && (
                  <span className="font-normal">
                    (Seharusnya menekan tombol:{' '}
                    <b className="font-mono font-bold uppercase">{nextChar === ' ' ? 'Spasi' : nextChar}</b>)
                  </span>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
