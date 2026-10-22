import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hand, CheckCircle2, ShieldCheck, Anchor } from 'lucide-react';
import { fingerMap, fingerNames } from '@/core/constants/curriculum';
import { HomeRowGuide } from '@/components/keyboard/HomeRowGuide';
import { LevelOneGuide } from '@/components/keyboard/LevelOneGuide';

const ergonomicTips = [
  {
    title: 'Posisi Duduk & Postur',
    desc: 'Punggung tegak, bahu rileks, kaki menapak rata di lantai. Layar monitor harus sejajar dengan ketinggian mata Anda.',
  },
  {
    title: 'Pergelangan Tangan Melayang',
    desc: 'Pergelangan tangan harus melayang santai di atas keyboard, jangan menumpu keras pada meja agar tidak menekan syaraf tangan.',
  },
  {
    title: 'Home Row Sebagai Jangkar',
    desc: 'Jari tangan kiri diletakkan di A, S, D, F dan jari kanan di J, K, L, ;. Ibu jari bertugas khusus menekan tombol Spasi.',
  },
  {
    title: 'Raba Tonjolan F & J',
    desc: 'Tombol F dan J memiliki tonjolan taktil kecil. Raba tonjolan ini dengan kedua telunjuk untuk kembali ke posisi awal tanpa melihat.',
  },
  {
    title: 'Tatapan Hanya ke Layar',
    desc: 'Jangan pernah melihat ke keyboard saat mengetik. Biarkan otak dan saraf memori otot Anda yang menghafal koordinat tombol.',
  },
  {
    title: 'Selalu Kembali ke Home Row',
    desc: 'Setelah jari bergerak menjangkau baris atas atau baris bawah, biasakan selalu segera menariknya kembali ke home row.',
  },
];

export const FingerGuidePage: React.FC = () => {
  const [selectedFinger, setSelectedFinger] = useState<number | null>(null);

  // Group keys by finger ID
  const keysByFinger = fingerNames.map((_, fingerIdx) => {
    if (fingerIdx === 4) return ['Spasi'];
    return Object.keys(fingerMap).filter(
      (k) => fingerMap[k] === fingerIdx && k !== ' ' && k !== '\n' && k !== 'Backspace'
    );
  });

  return (
    <div className="mx-auto max-w-4xl space-y-10 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Hand className="h-4 w-4" />
            <span>Panduan Ergonomi & Posisi 10 Jari</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Tata Cara Mengetik Benar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kuasai fondasi posisi dan pembagian tugas 10 jari agar mengetik lebih cepat tanpa cepat lelah.
          </p>
        </div>

        <Link
          to="/home-row"
          className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary transition-all self-start sm:self-center shadow-xs shrink-0"
        >
          <Anchor className="h-4 w-4" />
          <span>Menu Home Row: Posisi Dasar</span>
        </Link>
      </div>

      {/* Home row visual guide */}
      <HomeRowGuide />

      {/* Level 1 Comprehensive Foundation Guide */}
      <LevelOneGuide />

      {/* Ergonomic Tips Grid */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Prinsip Ergonomi & Kesehatan Jari</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ergonomicTips.map((tip, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-card p-5 shadow-card hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">{tip.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Finger Task Assignment Table */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Pembagian Wilayah 10 Jari</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Setiap jari memiliki wilayah tombol yang menjadi tanggung jawabnya masing-masing.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {fingerNames.map((name, fIdx) => {
            const isHovered = selectedFinger === fIdx;
            const keysList = keysByFinger[fIdx] || [];

            return (
              <div
                key={fIdx}
                onMouseEnter={() => setSelectedFinger(fIdx)}
                onMouseLeave={() => setSelectedFinger(null)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                  isHovered
                    ? 'border-primary/60 bg-muted/50 scale-[1.01]'
                    : 'border-border/60 bg-card hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full border shadow-sm"
                    style={{ backgroundColor: `var(--finger-${fIdx})` }}
                  />
                  <span className="font-semibold text-sm text-foreground w-40">
                    {name}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-w-xl">
                  {keysList.map((k) => (
                    <kbd
                      key={k}
                      className="rounded border border-border bg-muted/60 px-2 py-0.5 font-mono text-xs uppercase font-semibold text-foreground shadow-xs"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
