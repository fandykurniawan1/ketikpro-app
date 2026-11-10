import React from 'react';

const leftHand = [
  ['a', 0, 'Kelingking', false],
  ['s', 1, 'Manis', false],
  ['d', 2, 'Tengah', false],
  ['f', 3, 'Telunjuk', true], // has tactile bump
] as const;

const rightHand = [
  ['j', 5, 'Telunjuk', true], // has tactile bump
  ['k', 6, 'Tengah', false],
  ['l', 7, 'Manis', false],
  [';', 8, 'Kelingking', false],
] as const;

interface HomeRowGuideProps {
  activeChar?: string;
}

const getActiveCharPrompt = (char: string): string => {
  const c = char.toLowerCase();
  switch (c) {
    case 'a':
      return 'Tekan tombol huruf a menggunakan jari kelingking tangan kiri.';
    case ';':
      return 'Tekan tombol titik koma (;) menggunakan jari kelingking tangan kanan.';
    case 's':
      return 'Tekan tombol huruf s menggunakan jari manis tangan kiri.';
    case 'l':
      return 'Tekan tombol huruf l menggunakan jari manis tangan kanan.';
    case 'd':
      return 'Tekan tombol huruf d menggunakan jari tengah tangan kiri.';
    case 'k':
      return 'Tekan tombol huruf k menggunakan jari tengah tangan kanan.';
    case 'f':
      return 'Tekan tombol huruf f menggunakan jari telunjuk tangan kiri.';
    case 'j':
      return 'Tekan tombol huruf j menggunakan jari telunjuk tangan kanan.';
    case 'g':
      return 'Tekan tombol huruf g menggunakan jari telunjuk tangan kiri (jangkau ke tengah).';
    case 'h':
      return 'Tekan tombol huruf h menggunakan jari telunjuk tangan kanan (jangkau ke tengah).';
    case ' ':
      return 'Tekan tombol Spasi menggunakan ibu jari.';
    default:
      return `Tekan tombol "${char}" sesuai posisi jari pemandu.`;
  }
};

export const HomeRowGuide: React.FC<HomeRowGuideProps> = ({ activeChar }) => {
  const renderHand = (
    title: string,
    subtitle: string,
    themeClasses: string,
    keys: typeof leftHand | typeof rightHand
  ) => (
    <div className={`flex-1 rounded-2xl border p-4 shadow-sm transition-all ${themeClasses}`}>
      <div className="mb-1 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
          {title}
        </span>
        <span className="block text-[11px] text-muted-foreground">{subtitle}</span>
      </div>
      <div className="flex justify-center gap-2 sm:gap-2.5 pt-2">
        {keys.map(([k, f, name, hasBump]) => {
          const isActive = activeChar?.toLowerCase() === k;
          return (
            <div key={k} className="flex flex-col items-center gap-1.5">
              <div
                data-active={isActive ? 'true' : undefined}
                className="finger-pillar w-7 rounded-t-full"
                style={{
                  height: f === 0 || f === 8 ? 40 : f === 2 || f === 6 ? 58 : 50,
                  ['--finger' as string]: `var(--finger-${f})`,
                }}
              />
              <div
                data-active={isActive ? 'true' : undefined}
                className="key-cap relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl font-mono text-sm uppercase font-bold shadow-xs"
                style={{ ['--finger' as string]: `var(--finger-${f})` }}
              >
                <span>{k}</span>
                {hasBump && (
                  <span
                    className="absolute bottom-1 h-1 w-3.5 rounded-full bg-primary ring-1 ring-background"
                    title="Tonjolan taktil pemandu F/J"
                  />
                )}
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4 sm:p-5 shadow-card space-y-3">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-primary border-b border-border/50 pb-2">
        <span>Pembagian Wilayah Jari Tangan Kiri & Kanan (Home Row)</span>
        <span className="text-muted-foreground normal-case font-normal text-[11px] hidden sm:inline">
          Fondasi 10 Jari
        </span>
      </div>

      <div className="flex flex-col gap-3.5 sm:flex-row">
        {renderHand(
          'Tangan Kiri (A - S - D - F)',
          'Kelingking, Manis, Tengah, Telunjuk',
          'border-primary/20 bg-primary/5',
          leftHand
        )}
        {renderHand(
          'Tangan Kanan (J - K - L - ;)',
          'Telunjuk, Tengah, Manis, Kelingking',
          'border-amber-500/20 bg-amber-500/5',
          rightHand
        )}
      </div>

      {/* Interactive Space Bar Key Indicator */}
      <div className="flex justify-center pt-0.5">
        <div
          data-active={activeChar === ' ' ? 'true' : undefined}
          className={`key-cap flex h-9 sm:h-10 w-48 sm:w-64 items-center justify-center rounded-xl font-mono text-xs uppercase font-bold transition-all shadow-xs ${
            activeChar === ' '
              ? 'border-primary bg-primary text-primary-foreground scale-105 shadow-md ring-2 ring-primary ring-offset-1'
              : 'border-border/80 bg-muted/40 text-muted-foreground'
          }`}
          style={{ ['--finger' as string]: `var(--finger-4)` }}
        >
          <span>␣ SPASI (Ibu Jari)</span>
        </div>
      </div>

      {/* Dynamic Key Instruction Banner */}
      {activeChar && (
        <div className="flex items-center justify-center pt-1 animate-in fade-in duration-150">
          <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/25 px-4 py-2 text-xs font-semibold text-primary shadow-xs">
            <span className="inline-block h-2 w-2 rounded-full bg-primary animate-ping" />
            <span>{getActiveCharPrompt(activeChar)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-center text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 font-medium text-foreground">
          <span className="h-1.5 w-3 rounded-full bg-primary" />
          Tonjolan Taktil Tombol F & J
        </span>
        <span>·</span>
        <span>Ibu jari selalu bersiaga di <b>Spasi</b></span>
        <span>·</span>
        <span>Setelah menjangkau baris lain, <b>selalu kembali ke posisi jangkar ini</b></span>
      </div>
    </div>
  );
};
