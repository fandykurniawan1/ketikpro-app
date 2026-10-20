import React, { useState } from 'react';
import { HelpCircle, Trophy, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface MetricsBarProps {
  wpm: number;
  cpm?: number;
  accuracy: number;
  errors: number;
  correctCount?: number;
  totalChars?: number;
  elapsedSeconds: number;
  timeLimit?: number;
  progress: number;
  isPaused?: boolean;
  personalBestWpm?: number;
}

function formatTime(totalSeconds: number): string {
  const rounded = Math.round(totalSeconds);
  if (rounded >= 60) {
    const mins = Math.floor(rounded / 60);
    const secs = rounded % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${rounded}s`;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  wpm,
  cpm,
  accuracy,
  errors,
  correctCount = 0,
  totalChars,
  elapsedSeconds,
  timeLimit,
  progress,
  isPaused = false,
  personalBestWpm,
}) => {
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const isOvertime = Boolean(timeLimit && elapsedSeconds > timeLimit);
  const displayTime = timeLimit
    ? isOvertime
      ? `+${formatTime(elapsedSeconds - timeLimit)}`
      : formatTime(Math.max(0, timeLimit - elapsedSeconds))
    : formatTime(elapsedSeconds);

  const calculatedCpm = cpm ?? (elapsedSeconds > 0 ? Math.round((correctCount / Math.max(0.1, elapsedSeconds)) * 60) : 0);
  const isAccuracyCritical = accuracy < 92 && errors > 0;

  return (
    <div className="space-y-3">
      {/* 4 Main Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {/* Time */}
        <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {timeLimit ? (isOvertime ? 'Lewat Target' : 'Sisa Waktu') : 'Durasi'}
            </span>
            {isPaused && (
              <span className="rounded bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-bold text-amber-500 uppercase">
                Dijeda
              </span>
            )}
          </div>
          <div
            className={`mt-1 font-mono text-2xl font-bold tracking-tight ${
              isOvertime ? 'text-amber-500' : 'text-foreground'
            }`}
          >
            {displayTime}
          </div>
        </div>

        {/* WPM */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3 sm:p-4 shadow-sm transition-colors relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              WPM (Kata/Mnt)
            </span>
            {personalBestWpm !== undefined && personalBestWpm > 0 && (
              <span
                className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400"
                title={`Rekor Pribadi Tertinggi Anda: ${personalBestWpm} WPM`}
              >
                <Trophy className="h-3 w-3" />
                <span>PB {personalBestWpm}</span>
              </span>
            )}
          </div>
          <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-primary">
            {wpm}
          </div>
        </div>

        {/* Accuracy */}
        <div
          className={`rounded-2xl border p-3 sm:p-4 shadow-sm transition-colors ${
            isAccuracyCritical
              ? 'border-rose-500/40 bg-rose-500/5'
              : 'border-border bg-card'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Akurasi
            </span>
            {isAccuracyCritical && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500">
                <AlertTriangle className="h-3 w-3" />
                <span>Prioritas!</span>
              </span>
            )}
          </div>
          <div
            className={`mt-1 font-mono text-2xl font-bold tracking-tight ${
              accuracy < 90 ? 'text-destructive' : 'text-foreground'
            }`}
          >
            {accuracy}%
          </div>
        </div>

        {/* Errors & Correct Counts */}
        <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Kesalahan
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Benar: <b className="text-foreground">{correctCount}</b>
            </span>
          </div>
          <div
            className={`mt-1 font-mono text-2xl font-bold tracking-tight ${
              errors > 0 ? 'text-destructive' : 'text-foreground'
            }`}
          >
            {errors}
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Formula Explanation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-3 font-mono">
          <span>
            CPM: <b className="text-foreground">{calculatedCpm}</b> char/menit
          </span>
          {typeof totalChars === 'number' && totalChars > 0 && (
            <span>
              Karakter: <b className="text-foreground">{correctCount}</b>/{totalChars}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAccuracyCritical && (
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
              💡 Turunkan kecepatan, utamakan ketepatan tombol
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowFormulaModal(true)}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted"
          >
            <HelpCircle className="h-3 w-3" />
            <span>Rumus WPM & Akurasi</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted shadow-inner">
        <div
          className="h-full bg-primary transition-all duration-200 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      {/* Formula & Evaluation Info Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                Metode Perhitungan Statistik & Evaluasi KetikPro
              </h3>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div className="font-bold text-foreground text-sm flex items-center gap-1.5 mb-1">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>1. WPM (Words Per Minute) — Standar Internasional</span>
                </div>
                <p>
                  Sesuai standar internasional (Typing Master & Monkeytype), <b>1 kata standar dihitung setara 5 karakter</b> (termasuk spasi). WPM BUKAN sekadar menghitung jumlah kata yang dipisahkan spasi.
                </p>
                <div className="mt-2 font-mono bg-card rounded-lg p-2 text-foreground font-semibold border border-border">
                  WPM = (Jumlah Karakter Benar / 5) / Menit Latihan Aktif
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <div className="font-bold text-foreground text-sm mb-1">
                  2. CPM (Characters Per Minute)
                </div>
                <p>
                  Jumlah karakter benar murni yang berhasil diketik dalam rentang satu menit waktu aktif:
                </p>
                <div className="mt-2 font-mono bg-card rounded-lg p-2 text-foreground font-semibold border border-border">
                  CPM = Jumlah Karakter Benar / Menit Latihan Aktif = WPM × 5
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <div className="font-bold text-foreground text-sm mb-1">
                  3. Persentase Akurasi (%)
                </div>
                <p>
                  Akurasi mengukur ketepatan setiap ketukan jari fisik terhadap tombol yang seharusnya:
                </p>
                <div className="mt-2 font-mono bg-card rounded-lg p-2 text-foreground font-semibold border border-border">
                  Akurasi (%) = ((Total Ketukan − Total Kesalahan) / Total Ketukan) × 100%
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-700 dark:text-amber-300">
                <div className="font-bold text-sm mb-1">
                  🎯 Prinsip Utama: Akurasi Dulu, Kecepatan Menyusul
                </div>
                <p>
                  Memori otot 10 jari terbentuk dari <i>gerakan yang benar berulang-ulang</i>. Jika Anda mengetik cepat dengan banyak salah, Anda justru melatih jari merekam kesalahan. KetikPro memprioritaskan akurasi di atas 95% sebelum Anda dianjurkan meningkatkan tempo.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
