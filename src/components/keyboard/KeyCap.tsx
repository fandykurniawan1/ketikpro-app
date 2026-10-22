import React from 'react';
import type { KeyDef } from '@/types/typing';

interface KeyCapProps {
  keyDef: KeyDef;
  isActive?: boolean;
  isHome?: boolean;
  isAnchorReturn?: boolean;
  hitState?: 'ok' | 'bad';
  onClick?: () => void;
}

export const KeyCap: React.FC<KeyCapProps> = ({
  keyDef,
  isActive = false,
  isHome = false,
  isAnchorReturn = false,
  hitState,
  onClick,
}) => {
  const isLetter = keyDef.label.length === 1 && /[a-zA-Z]/.test(keyDef.label);
  const isSpecial = keyDef.label.length > 1;

  return (
    <div
      onClick={onClick}
      data-active={isActive ? 'true' : undefined}
      data-hit={hitState}
      data-anchor={isAnchorReturn ? 'true' : undefined}
      className={`key-cap relative flex h-11 sm:h-12 shrink-0 flex-col items-center justify-center rounded-xl font-mono select-none transition-all duration-100 ${
        onClick ? 'cursor-pointer active:scale-95' : ''
      } ${
        keyDef.w ?? 'w-9 sm:w-11'
      } ${
        isActive
          ? 'z-20 scale-[1.03] ring-2 ring-primary/80 shadow-md ring-offset-1 ring-offset-background'
          : isAnchorReturn
          ? 'z-10 ring-2 ring-amber-500/70 ring-dashed shadow-xs'
          : 'hover:brightness-105'
      }`}
      style={{ ['--finger' as string]: `var(--finger-${keyDef.finger})` }}
      title={`${keyDef.label} (Jari: ${keyDef.finger})`}
    >
      {/* Dual legend if subLabel exists (e.g. ! on top of 1) */}
      {keyDef.subLabel ? (
        <div className="flex flex-col items-center justify-between h-full py-1 text-[11px] sm:text-xs leading-none">
          <span className={`font-semibold opacity-75 ${isActive ? 'opacity-100 font-bold' : ''}`}>
            {keyDef.subLabel}
          </span>
          <span className={`font-bold ${isActive ? 'text-white' : 'text-foreground'}`}>
            {keyDef.label}
          </span>
        </div>
      ) : isLetter ? (
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">
          {keyDef.label}
        </span>
      ) : isSpecial ? (
        <span className="text-[10px] sm:text-xs font-semibold tracking-tight px-1 truncate max-w-full">
          {keyDef.label}
        </span>
      ) : (
        <span className="text-xs sm:text-sm font-bold">
          {keyDef.label}
        </span>
      )}

      {/* Tactile bump bar for F and J keys (physical keyboard bumps) */}
      {isHome && (
        <span
          className="absolute bottom-1.5 h-1 w-3.5 rounded-full bg-current opacity-85 shadow-xs"
          title="Tonjolan taktil penanda posisi awal F/J"
        />
      )}

      {/* Anchor return indicator pill when finger moves away */}
      {isAnchorReturn && !isActive && (
        <span
          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white shadow-sm animate-bounce"
          title="Jangkar posisi kembali ke Home Row"
        >
          ⚓
        </span>
      )}

      {/* Active pulse aura */}
      {isActive && (
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
        </span>
      )}
    </div>
  );
};
