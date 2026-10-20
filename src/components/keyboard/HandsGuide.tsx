import React from 'react';
import { fingerNames } from '@/core/constants/curriculum';

interface HandsGuideProps {
  activeFingers: number[];
  targetKey?: string;
  shiftKey?: string | null;
}

interface FingerMeta {
  id: number;
  name: string;
  shortName: string;
  keys: string;
  height: number;
  tilt: string;
  homeKey: string;
}

const leftFingers: FingerMeta[] = [
  { id: 0, name: 'Kelingking Kiri', shortName: 'Kelingking', keys: '` 1 Q A Z Shift Tab', height: 46, tilt: '-rotate-[6deg]', homeKey: 'A' },
  { id: 1, name: 'Manis Kiri', shortName: 'Jari Manis', keys: '2 W S X', height: 62, tilt: '-rotate-[2deg]', homeKey: 'S' },
  { id: 2, name: 'Tengah Kiri', shortName: 'Jari Tengah', keys: '3 E D C', height: 72, tilt: 'rotate-0', homeKey: 'D' },
  { id: 3, name: 'Telunjuk Kiri', shortName: 'Telunjuk', keys: '4 5 R T F G V B', height: 60, tilt: 'rotate-[4deg]', homeKey: 'F' },
  { id: 4, name: 'Ibu Jari Kiri', shortName: 'Ibu Jari', keys: 'Spasi', height: 34, tilt: '-rotate-[32deg] origin-bottom-right', homeKey: 'Spasi' },
];

const rightFingers: FingerMeta[] = [
  { id: 4, name: 'Ibu Jari Kanan', shortName: 'Ibu Jari', keys: 'Spasi', height: 34, tilt: 'rotate-[32deg] origin-bottom-left', homeKey: 'Spasi' },
  { id: 5, name: 'Telunjuk Kanan', shortName: 'Telunjuk', keys: '6 7 Y U H J N M', height: 60, tilt: '-rotate-[4deg]', homeKey: 'J' },
  { id: 6, name: 'Tengah Kanan', shortName: 'Jari Tengah', keys: '8 I K ,', height: 72, tilt: 'rotate-0', homeKey: 'K' },
  { id: 7, name: 'Manis Kanan', shortName: 'Jari Manis', keys: '9 O L .', height: 62, tilt: 'rotate-[2deg]', homeKey: 'L' },
  { id: 8, name: 'Kelingking Kanan', shortName: 'Kelingking', keys: '0 - = P [ ] ; \' / Enter', height: 46, tilt: 'rotate-[6deg]', homeKey: ';' },
];

export const HandsGuide: React.FC<HandsGuideProps> = ({
  activeFingers,
  targetKey = '',
  shiftKey = null,
}) => {
  const isShiftNeeded = Boolean(shiftKey);

  const renderHand = (
    title: string,
    handType: 'left' | 'right',
    fingers: FingerMeta[]
  ) => {
    const hasActiveFingerInHand = fingers.some((f) => activeFingers.includes(f.id));

    return (
      <div
        className={`flex flex-col items-center rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
          hasActiveFingerInHand
            ? handType === 'left'
              ? 'border-blue-500/50 bg-blue-500/5 shadow-card'
              : 'border-purple-500/50 bg-purple-500/5 shadow-card'
            : 'border-border/60 bg-card/60'
        }`}
      >
        {/* Hand Title & Active Indicator */}
        <div className="mb-4 flex items-center justify-between w-full border-b border-border/40 pb-2">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                hasActiveFingerInHand
                  ? handType === 'left'
                    ? 'bg-blue-500 animate-ping'
                    : 'bg-purple-500 animate-ping'
                  : 'bg-muted-foreground/30'
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              {title}
            </span>
          </div>

          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              hasActiveFingerInHand
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-muted-foreground'
            }`}
          >
            {hasActiveFingerInHand ? 'Aktif Mengetik' : 'Siaga di Home Row'}
          </span>
        </div>

        {/* Fingers Container with Palm Base */}
        <div className="relative flex flex-col items-center">
          {/* Fingers Row */}
          <div className="flex items-end gap-2 sm:gap-3.5 z-10 px-2 min-h-[96px]">
            {fingers.map((f, idx) => {
              const isFingerActive = activeFingers.includes(f.id);
              const isShiftFinger = (f.id === 0 && shiftKey === 'ShiftL') || (f.id === 8 && shiftKey === 'ShiftR');
              const keyLabelToDisplay = isShiftFinger
                ? 'Shift'
                : isFingerActive
                ? targetKey === ' '
                  ? '␣'
                  : targetKey.toUpperCase()
                : f.homeKey;

              return (
                <div
                  key={`${handType}-${f.id}-${idx}`}
                  className="flex flex-col items-center group relative"
                >
                  {/* Floating target pill on active fingertip */}
                  {isFingerActive && (
                    <div className="absolute -top-7 flex flex-col items-center animate-bounce z-30">
                      <span className="rounded-md bg-foreground px-1.5 py-0.5 font-mono text-[10px] font-bold text-background shadow-md ring-2 ring-primary">
                        {keyLabelToDisplay}
                      </span>
                      <span className="h-1.5 w-1.5 rotate-45 bg-foreground -mt-0.5" />
                    </div>
                  )}

                  {/* Finger Pillar / Anatomy */}
                  <div
                    data-active={isFingerActive ? 'true' : undefined}
                    className={`finger-pillar relative flex flex-col justify-between items-center w-7 sm:w-8 rounded-t-full transition-all duration-150 cursor-default ${
                      f.tilt
                    } ${
                      isFingerActive
                        ? '-translate-y-3 scale-105 shadow-glow z-20'
                        : 'hover:brightness-105'
                    }`}
                    style={{
                      height: f.height,
                      ['--finger' as string]: `var(--finger-${f.id})`,
                    }}
                    title={`${f.name} (Tuts: ${f.keys})`}
                  >
                    {/* Fingernail / Pad highlight */}
                    <div
                      className={`mt-1.5 h-3.5 w-4 rounded-full border border-black/10 transition-colors ${
                        isFingerActive ? 'bg-white/80 shadow-xs' : 'bg-white/30'
                      }`}
                    />

                    {/* Home row key marker on finger pad */}
                    <span
                      className={`mb-1 font-mono text-[9px] font-bold select-none ${
                        isFingerActive ? 'text-white' : 'text-foreground/70'
                      }`}
                    >
                      {f.homeKey}
                    </span>
                  </div>

                  {/* Finger short name label */}
                  <span
                    className={`mt-2 text-[10px] text-center font-medium transition-colors ${
                      isFingerActive
                        ? 'font-bold text-primary scale-105'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {f.shortName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Ergonomic Palm Silhouette Base */}
          <div
            className={`w-44 sm:w-52 h-10 rounded-b-3xl border-t border-dashed mt-1 flex items-center justify-center text-[10px] tracking-wider uppercase font-semibold text-muted-foreground/60 transition-colors ${
              hasActiveFingerInHand
                ? 'border-primary/40 bg-muted/40'
                : 'border-border bg-muted/20'
            }`}
          >
            <span>Telapak {handType === 'left' ? 'Kiri' : 'Kanan'}</span>
          </div>
        </div>
      </div>
    );
  };

  // Find active finger description
  const primaryFingerId = activeFingers.find(
    (f) => !(f === 0 && shiftKey === 'ShiftL') && !(f === 8 && shiftKey === 'ShiftR')
  );
  const primaryFingerName = primaryFingerId !== undefined ? fingerNames[primaryFingerId] : null;

  return (
    <div className="space-y-4">
      {/* 2 Hands Side-by-Side Visualization */}
      <div className="grid gap-4 sm:grid-cols-2">
        {renderHand('Tangan Kiri (ASDF & Wilayah Kiri)', 'left', leftFingers)}
        {renderHand('Tangan Kanan (JKL; & Wilayah Kanan)', 'right', rightFingers)}
      </div>

      {/* Dynamic Instruction Bar */}
      <div className="rounded-xl border border-border/80 bg-card/80 p-3 text-center shadow-xs">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
          <span className="text-muted-foreground">Instruksi Jari:</span>
          {primaryFingerName ? (
            <>
              <span className="font-bold text-foreground">
                Gunakan <span className="text-primary underline decoration-primary/40 underline-offset-4">{primaryFingerName}</span>
              </span>
              {isShiftNeeded && (
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>+ Tekan Shift ({shiftKey === 'ShiftL' ? 'Kelingking Kiri' : 'Kelingking Kanan'})</span>
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground italic">Letakkan jari di posisi jangkar Home Row (A S D F — J K L ;)</span>
          )}
        </div>
      </div>
    </div>
  );
};
