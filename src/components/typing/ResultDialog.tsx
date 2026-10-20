import React, { useState } from 'react';
import {
  Star,
  RotateCcw,
  ArrowRight,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Stats } from '@/types/typing';
import { evaluateAccuracyPriority } from '@/core/engine/evaluationEngine';
import { RemedialDrillModal } from './RemedialDrillModal';

interface ResultDialogProps {
  stats: Stats;
  starsCount: number;
  isPassed: boolean;
  minWpm: number;
  minAccuracy: number;
  personalBestWpm?: number;
  weakKeys?: Record<string, number>;
  onRetry: () => void;
  onNext?: () => void;
  onBackToCurriculum: () => void;
}

export const ResultDialog: React.FC<ResultDialogProps> = ({
  stats,
  starsCount,
  isPassed,
  minWpm,
  minAccuracy,
  personalBestWpm,
  weakKeys = {},
  onRetry,
  onNext,
  onBackToCurriculum,
}) => {
  const [showFormulaExplanation, setShowFormulaExplanation] = useState(false);
  const [isRemedialOpen, setIsRemedialOpen] = useState(false);

  const sortedWeakKeys = Object.entries(weakKeys).sort(([, a], [, b]) => b - a);
  const topWeakKeys = sortedWeakKeys.slice(0, 5).map(([char]) => char);

  const evaluation = evaluateAccuracyPriority(stats.accuracy, stats.wpm);
  const isNewRecord = Boolean(personalBestWpm && stats.wpm > personalBestWpm);
  const cpm = stats.cpm || stats.wpm * 5;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 text-center shadow-card animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
      {/* New Personal Record Banner */}
      {isNewRecord && (
        <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-amber-500 to-yellow-400 py-1 text-center text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5 animate-bounce">
          <Trophy className="h-3.5 w-3.5" />
          <span>REKOR PRIBADI BARU TERCAPAI! WPM TERTINGGI!</span>
        </div>
      )}

      {/* Stars Header */}
      <div className={`flex justify-center gap-2 mb-4 ${isNewRecord ? 'mt-3' : ''}`}>
        {[0, 1, 2].map((i) => (
          <Star
            key={i}
            className={`h-9 w-9 sm:h-10 sm:w-10 transition-transform ${
              i < starsCount
                ? 'fill-primary text-primary scale-110 drop-shadow'
                : 'text-border stroke-1'
            }`}
          />
        ))}
      </div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
        {isPassed ? 'Lulus! Kerja Bagus 🎉' : 'Belum Lulus — Terus Asah Jari Anda 💪'}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
        {isPassed
          ? 'Kemampuan mengetik Anda berkembang pesat dengan pola gerakan yang semakin refleks.'
          : 'Fokus terlebih dahulu pada akurasi jari, kecepatan akan menyusul secara alami.'}
      </p>

      {/* Primary Metrics Grid (WPM, CPM, Akurasi, Salah & Benar) */}
      <div className="mx-auto mt-6 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4 font-mono">
        {/* WPM */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3 sm:p-4">
          <div className="text-3xl font-bold text-primary">{stats.wpm}</div>
          <div className="text-[11px] font-sans text-primary uppercase font-bold mt-0.5">WPM</div>
          <div className="text-[10px] font-sans text-muted-foreground">Kata/Menit</div>
        </div>

        {/* CPM */}
        <div className="rounded-2xl border border-border bg-muted/30 p-3 sm:p-4">
          <div className="text-3xl font-bold text-foreground">{cpm}</div>
          <div className="text-[11px] font-sans text-muted-foreground uppercase font-bold mt-0.5">CPM</div>
          <div className="text-[10px] font-sans text-muted-foreground">Karakter/Menit</div>
        </div>

        {/* Accuracy */}
        <div
          className={`rounded-2xl border p-3 sm:p-4 ${
            stats.accuracy >= minAccuracy
              ? 'border-border bg-muted/30'
              : 'border-destructive/40 bg-destructive/10'
          }`}
        >
          <div
            className={`text-3xl font-bold ${
              stats.accuracy >= minAccuracy ? 'text-foreground' : 'text-destructive'
            }`}
          >
            {stats.accuracy}%
          </div>
          <div className="text-[11px] font-sans text-muted-foreground uppercase font-bold mt-0.5">Akurasi</div>
          <div className="text-[10px] font-sans text-muted-foreground">Target ≥ {minAccuracy}%</div>
        </div>

        {/* Character Counts (Correct & Errors) */}
        <div className="rounded-2xl border border-border bg-muted/30 p-3 sm:p-4">
          <div className="text-3xl font-bold text-foreground">{stats.errors}</div>
          <div className="text-[11px] font-sans text-muted-foreground uppercase font-bold mt-0.5">Kesalahan</div>
          <div className="text-[10px] font-sans text-muted-foreground">
            Benar: <b className="text-foreground">{stats.correctChars}</b>
          </div>
        </div>
      </div>

      {/* Passing Criteria Checklist & Personal Record */}
      <div className="mx-auto mt-4 max-w-xl rounded-xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground flex flex-wrap justify-around items-center gap-2">
        <div className="flex items-center gap-1.5">
          {stats.accuracy >= minAccuracy ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          <span>Akurasi: target ≥ {minAccuracy}% ({stats.accuracy}%)</span>
        </div>

        <div className="flex items-center gap-1.5">
          {stats.wpm >= minWpm ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          <span>WPM: target ≥ {minWpm} ({stats.wpm})</span>
        </div>

        {personalBestWpm !== undefined && (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
            <Trophy className="h-3.5 w-3.5" />
            <span>Rekor Pribadi: {personalBestWpm} WPM</span>
          </div>
        )}
      </div>

      {/* Pedagogical Accuracy Priority Evaluator Card */}
      <div
        className={`mx-auto mt-5 max-w-xl rounded-2xl border p-4 text-left transition-all ${
          evaluation.level === 'critical'
            ? 'border-rose-500/40 bg-rose-500/10'
            : evaluation.level === 'good'
            ? 'border-amber-500/40 bg-amber-500/10'
            : 'border-emerald-500/40 bg-emerald-500/10'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase ${evaluation.badgeColor}`}
            >
              {evaluation.badge}
            </span>
            <h4 className="text-sm font-bold text-foreground">
              {evaluation.title}
            </h4>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {evaluation.advice}
        </p>
      </div>

      {/* Automatic Recommendation & Remedial Drill Button */}
      {sortedWeakKeys.length > 0 && (
        <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-border p-4 sm:p-5 text-left bg-muted/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Rekomendasi Otomatis Berdasarkan Tombol Lemah:
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Huruf-huruf di bawah ini paling sering salah ditekan selama sesi latihan ini.
              </p>
            </div>

            <button
              onClick={() => setIsRemedialOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110 transition-all shrink-0 self-start sm:self-auto"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Latihan Tambahan Remedial</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {sortedWeakKeys.slice(0, 6).map(([char, count]) => (
              <span
                key={char}
                className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-mono font-semibold text-destructive"
              >
                <span>{char === ' ' ? 'Spasi' : char.toUpperCase()}</span>
                <span className="rounded-full bg-destructive/20 px-1.5 text-[10px] font-sans">
                  {count}x salah
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Transparent Calculation Method Accordion */}
      <div className="mx-auto mt-5 max-w-xl text-left">
        <button
          onClick={() => setShowFormulaExplanation((prev) => !prev)}
          className="flex items-center justify-between w-full rounded-xl border border-border/80 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold">Transparansi Rumus: Bagaimana WPM & Akurasi Dihitung?</span>
          </div>
          {showFormulaExplanation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showFormulaExplanation && (
          <div className="mt-2 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground space-y-2 animate-in fade-in duration-150">
            <div>
              <b className="text-foreground">Rumus WPM Standar Internasional:</b>
              <p className="mt-0.5">
                1 kata standar dihitung setara 5 karakter. WPM = (Karakter Benar / 5) / Menit Aktif.
                WPM tidak sama dengan CPM (Karakter Per Menit); <b>WPM = CPM / 5</b>.
              </p>
            </div>
            <div>
              <b className="text-foreground">Rumus Akurasi Presisi (%):</b>
              <p className="mt-0.5">
                Akurasi = ((Total Ketukan − Total Kesalahan) / Total Ketukan) × 100%. Setiap ketukan salah dicatat secara akurat tanpa menghitung ganda.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted transition-colors shadow-sm"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Ulangi Latihan</span>
        </button>

        {isPassed && onNext && (
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
          >
            <span>Lanjut Materi Berikutnya</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={onBackToCurriculum}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          <span>Ke Kurikulum</span>
        </button>
      </div>

      {/* Remedial Drill Interactive Modal */}
      {isRemedialOpen && (
        <RemedialDrillModal
          keys={topWeakKeys}
          isOpen={isRemedialOpen}
          onClose={() => setIsRemedialOpen(false)}
        />
      )}
    </div>
  );
};
