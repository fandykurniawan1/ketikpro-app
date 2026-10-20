import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Target,
  Trophy,
  Flame,
  Play,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Activity,
  Sparkles,
} from 'lucide-react';
import { allLessons, curriculum } from '@/core/constants/curriculum';
import { useUserProgress } from '@/hooks/useUserProgress';
import {
  getPersonalRecords,
  getAggregatedWeakKeys,
  evaluateAccuracyPriority,
} from '@/core/engine/evaluationEngine';
import { RemedialDrillModal } from '@/components/typing/RemedialDrillModal';

export const DashboardPage: React.FC = () => {
  const { results, passed, unlocked } = useUserProgress();
  const [chartMetric, setChartMetric] = useState<'wpm' | 'accuracy' | 'cpm'>('wpm');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [isRemedialOpen, setIsRemedialOpen] = useState(false);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  const completedCount = allLessons.filter((l) => passed.has(l.id)).length;
  const progressPercent = Math.round((completedCount / allLessons.length) * 100);

  // Aggregated Analytics
  const records = getPersonalRecords(results);
  const weakKeysList = getAggregatedWeakKeys(results);
  const topWeakKeys = weakKeysList.slice(0, 5).map((w) => w.key);

  // Pedagogical evaluation based on recent accuracy
  const recentResults = results.slice(-15);
  const recentAccuracy =
    recentResults.length > 0
      ? Math.round(recentResults.reduce((sum, r) => sum + r.accuracy, 0) / recentResults.length)
      : 100;
  const recentWpm =
    recentResults.length > 0
      ? Math.round(recentResults.reduce((sum, r) => sum + r.wpm, 0) / recentResults.length)
      : 0;

  const evaluation = evaluateAccuracyPriority(
    results.length > 0 ? recentAccuracy : 100,
    recentWpm
  );

  // Next lesson recommendation
  const nextLesson =
    allLessons.find(
      (l) => !passed.has(l.id) && unlocked.has(Number(l.id.split('-')[0]))
    ) ?? allLessons[0]!;

  // Format practice seconds to readable hours / minutes
  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}j ${mins}m`;
    if (mins > 0) return `${mins} menit`;
    return `${totalSeconds} detik`;
  };

  // Prepare chart data points
  const chartData = recentResults.map((r, i) => {
    let value = r.wpm;
    if (chartMetric === 'accuracy') value = r.accuracy;
    if (chartMetric === 'cpm') value = r.cpm ?? r.wpm * 5;
    return {
      index: i,
      lessonId: r.lessonId,
      wpm: r.wpm,
      accuracy: r.accuracy,
      cpm: r.cpm ?? r.wpm * 5,
      errors: r.errors,
      value,
      date: new Date(r.date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  });

  const maxValue = chartData.reduce(
    (max, d) => Math.max(max, d.value),
    chartMetric === 'accuracy' ? 100 : 30
  );
  const avgValue =
    chartData.length > 0
      ? Math.round(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length)
      : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
          <Flame className="h-4 w-4" />
          <span>Statistik & Evaluasi Belajar KetikPro</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Akurasi dulu, kecepatan menyusul.
        </h1>
        <p className="text-sm text-muted-foreground">
          Pantau grafik perkembangan WPM, akurasi, rekor pribadi, dan perbaikan tombol secara real-time.
        </p>
      </header>

      {/* Hero CTA Card */}
      <Link
        to={`/latihan/${nextLesson.id}`}
        className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-primary via-primary/95 to-amber-600 p-6 sm:p-8 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden"
      >
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Play className="h-3 w-3 fill-current" />
            <span>Lanjutkan Materi Pelajaran</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {nextLesson.title}
          </h2>
          <p className="text-sm opacity-90 max-w-xl">
            {nextLesson.desc}
          </p>
        </div>
        <div className="flex items-center gap-3 z-10">
          <span className="text-sm font-semibold hidden sm:inline-block">Mulai Latihan</span>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-white backdrop-blur-sm group-hover:translate-x-1 transition-transform">
            <ArrowRight className="h-6 w-6" />
          </div>
        </div>
      </Link>

      {/* Pedagogical Evaluation Status Card */}
      {results.length > 0 && (
        <div
          className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
            evaluation.level === 'critical'
              ? 'border-rose-500/40 bg-rose-500/10'
              : evaluation.level === 'good'
              ? 'border-amber-500/40 bg-amber-500/10'
              : 'border-emerald-500/40 bg-emerald-500/10'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase ${evaluation.badgeColor}`}
              >
                {evaluation.badge}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                {evaluation.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              {evaluation.advice}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 font-mono text-xs">
            <div className="rounded-xl border border-border bg-card px-3 py-2 text-center">
              <div className="text-base font-bold text-foreground">{recentAccuracy}%</div>
              <div className="text-[10px] text-muted-foreground uppercase">Akurasi</div>
            </div>
            <div className="rounded-xl border border-border bg-card px-3 py-2 text-center">
              <div className="text-base font-bold text-primary">{recentWpm}</div>
              <div className="text-[10px] text-muted-foreground uppercase">WPM</div>
            </div>
          </div>
        </div>
      )}

      {/* 4 Personal Records & Cumulative Metrics Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Rekor Pribadi WPM */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rekor WPM Tertinggi
            </span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-extrabold text-primary">
            {records.bestWpm}
            <span className="text-sm font-sans font-medium text-muted-foreground ml-1.5">WPM</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Rata-rata: <b className="text-foreground">{records.avgWpm} WPM</b> ({records.avgCpm} CPM)
          </div>
        </div>

        {/* Rekor Akurasi Tertinggi */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Akurasi Terbaik
            </span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-extrabold text-foreground">
            {records.bestAccuracy}%
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Rata-rata akurasi: <b className="text-foreground">{records.avgAccuracy}%</b>
          </div>
        </div>

        {/* Total Karakter Benar */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Karakter Terketik
            </span>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-extrabold text-foreground">
            {records.totalCorrectChars.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Total kesalahan: <b className="text-destructive">{records.totalErrors}</b>
          </div>
        </div>

        {/* Total Waktu Berlatih */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Waktu Berlatih
            </span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-extrabold text-foreground">
            {formatDuration(records.totalSeconds)}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Dari total <b className="text-foreground">{records.totalSessions} sesi</b> latihan
          </div>
        </div>
      </div>

      {/* Interactive Trend Chart: Perkembangan dari Waktu ke Waktu */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">
                Grafik Perkembangan dari Waktu ke Waktu
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Visualisasi tren kestabilan pengetikan hingga 15 sesi latihan terakhir.
            </p>
          </div>

          {/* Metric Switcher Tabs */}
          <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1 text-xs">
            <button
              onClick={() => {
                setChartMetric('wpm');
                setSelectedPointIndex(null);
              }}
              className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
                chartMetric === 'wpm'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Kecepatan (WPM)
            </button>
            <button
              onClick={() => {
                setChartMetric('accuracy');
                setSelectedPointIndex(null);
              }}
              className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
                chartMetric === 'accuracy'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Akurasi (%)
            </button>
            <button
              onClick={() => {
                setChartMetric('cpm');
                setSelectedPointIndex(null);
              }}
              className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
                chartMetric === 'cpm'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Karakter/Mnt (CPM)
            </button>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Belum Ada Riwayat Sesi Latihan</p>
            <p className="text-xs mt-1">Selesaikan satu pelajaran untuk melihat visualisasi grafik performa Anda.</p>
            <Link
              to="/belajar"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm"
            >
              Mulai Sesi Pertama
            </Link>
          </div>
        ) : (
          <div>
            {/* Legend & Average Baseline Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground mb-4 font-mono">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span>Nilai Sesi</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 bg-muted-foreground border-t border-dashed border-muted-foreground" />
                  <span>Rata-rata: <b className="text-foreground">{avgValue} {chartMetric === 'accuracy' ? '%' : chartMetric.toUpperCase()}</b></span>
                </span>
              </div>
              <div>
                Puncak: <b className="text-primary">{maxValue} {chartMetric === 'accuracy' ? '%' : chartMetric.toUpperCase()}</b>
              </div>
            </div>

            {/* SVG Interactive Trend Chart */}
            <div className="relative w-full h-48 sm:h-56">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary, #6366f1)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--color-primary, #6366f1)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Baseline Grids */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => (
                  <line
                    key={idx}
                    x1="0"
                    y1={20 + (1 - pct) * 160}
                    x2="800"
                    y2={20 + (1 - pct) * 160}
                    stroke="currentColor"
                    className="text-border/40"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                ))}

                {/* Average Reference Line */}
                {maxValue > 0 && (
                  <line
                    x1="0"
                    y1={20 + (1 - avgValue / maxValue) * 160}
                    x2="800"
                    y2={20 + (1 - avgValue / maxValue) * 160}
                    stroke="currentColor"
                    className="text-amber-500/70"
                    strokeDasharray="6 4"
                    strokeWidth="1.5"
                  />
                )}

                {/* Area Fill */}
                {chartData.length > 1 && (
                  <polygon
                    points={`
                      0,180
                      ${chartData
                        .map((d, i) => {
                          const x = (i / (chartData.length - 1)) * 800;
                          const y = 20 + (1 - Math.min(1, d.value / (maxValue || 1))) * 160;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                      800,180
                    `}
                    fill="url(#areaGradient)"
                  />
                )}

                {/* Main Curve Line */}
                {chartData.length > 1 ? (
                  <polyline
                    fill="none"
                    stroke="var(--color-primary, #6366f1)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartData
                      .map((d, i) => {
                        const x = (i / (chartData.length - 1)) * 800;
                        const y = 20 + (1 - Math.min(1, d.value / (maxValue || 1))) * 160;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                ) : null}

                {/* Data Points */}
                {chartData.map((d, i) => {
                  const x = chartData.length > 1 ? (i / (chartData.length - 1)) * 800 : 400;
                  const y = 20 + (1 - Math.min(1, d.value / (maxValue || 1))) * 160;
                  const isSelected = selectedPointIndex === i;
                  const isPeak = d.value === maxValue;

                  return (
                    <g key={i} className="cursor-pointer" onClick={() => setSelectedPointIndex(i)}>
                      {/* Outer pulse circle for peak */}
                      {isPeak && (
                        <circle
                          cx={x}
                          cy={y}
                          r="9"
                          fill="none"
                          stroke="var(--color-primary, #6366f1)"
                          strokeWidth="2"
                          className="animate-ping opacity-60"
                        />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 6 : 4.5}
                        fill="var(--color-card, #ffffff)"
                        stroke="var(--color-primary, #6366f1)"
                        strokeWidth={isSelected ? 3 : 2.5}
                        className="transition-all hover:scale-125"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Point Popover / Details Bar */}
            {selectedPointIndex !== null && chartData[selectedPointIndex] && (
              <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-3 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    Sesi #{selectedPointIndex + 1} ({chartData[selectedPointIndex].lessonId}):
                  </span>
                  <span className="text-muted-foreground">{chartData[selectedPointIndex].date}</span>
                </div>
                <div className="flex items-center gap-4 font-mono">
                  <span>WPM: <b className="text-primary">{chartData[selectedPointIndex].wpm}</b></span>
                  <span>CPM: <b className="text-foreground">{chartData[selectedPointIndex].cpm}</b></span>
                  <span>Akurasi: <b className="text-foreground">{chartData[selectedPointIndex].accuracy}%</b></span>
                  <span>Salah: <b className="text-destructive">{chartData[selectedPointIndex].errors}</b></span>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Weak Keys Heatmap & Automatic Recommendation */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-bold text-foreground">
                Evaluasi Tombol yang Paling Sering Salah (Heatmap)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tombol-tombol yang tercatat paling banyak mengalami salah ketik di seluruh riwayat sesi Anda.
            </p>
          </div>

          {weakKeysList.length > 0 && (
            <button
              onClick={() => setIsRemedialOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:brightness-110 transition-all shrink-0 self-start sm:self-auto"
            >
              <Sparkles className="h-4 w-4" />
              <span>Mulai Latihan Tambahan Remedial</span>
            </button>
          )}
        </div>

        {weakKeysList.length === 0 ? (
          <div className="rounded-2xl border border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
            Belum ada catatan tombol lemah. Ketik akurat dan minimalkan kesalahan untuk mempertahankan rekor ini!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {weakKeysList.slice(0, 6).map(({ key, count }) => (
              <div
                key={key}
                className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3.5 text-center flex flex-col items-center justify-center gap-1 shadow-xs"
              >
                <div className="font-mono text-2xl font-black text-destructive uppercase">
                  {key === ' ' ? 'Spasi' : key}
                </div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase">
                  {count}x Salah Ketik
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Curriculum Overall 10 Level Progress */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Progres Kurikulum 10 Level</h3>
            <p className="text-xs text-muted-foreground">
              {completedCount} dari {allLessons.length} materi telah lulus kriteria kelulusan
            </p>
          </div>
          <span className="font-mono text-xl font-bold text-primary">{progressPercent}%</span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 pt-2">
          {curriculum.map((lv) => {
            const completedInLevel = lv.lessons.filter((l) => passed.has(l.id)).length;
            const isOpen = unlocked.has(lv.level);
            return (
              <div
                key={lv.level}
                className={`rounded-2xl border p-3.5 transition-all ${
                  isOpen
                    ? 'border-border bg-card hover:border-primary/50'
                    : 'border-border/60 bg-muted/20 opacity-60'
                }`}
              >
                <div className="text-[11px] font-semibold text-primary uppercase">Level {lv.level}</div>
                <div className="text-sm font-bold text-foreground truncate">{lv.title}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {completedInLevel}/{lv.lessons.length} selesai
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Transparent Calculation Method Card */}
      <section className="rounded-2xl border border-border bg-muted/20 p-5 text-xs text-muted-foreground space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-foreground text-sm">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span>Metode Perhitungan Statistik Standar Internasional di KetikPro</span>
          </div>
          <button
            onClick={() => setShowFormulaInfo((prev) => !prev)}
            className="text-primary hover:underline font-semibold"
          >
            {showFormulaInfo ? 'Sembunyikan' : 'Pelajari Detail'}
          </button>
        </div>

        {showFormulaInfo && (
          <div className="grid gap-3 sm:grid-cols-3 pt-2 animate-in fade-in">
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="font-bold text-foreground mb-1">1. Rumus WPM Standar</div>
              <p>
                Sesuai standar global, 1 kata dihitung <b>5 karakter</b>. WPM = (Karakter Benar / 5) / Menit Aktif. WPM tidak sama dengan CPM.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="font-bold text-foreground mb-1">2. Rumus CPM</div>
              <p>
                Jumlah karakter benar per menit: CPM = Karakter Benar / Menit = <b>WPM × 5</b>.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="font-bold text-foreground mb-1">3. Rumus Akurasi Presisi</div>
              <p>
                Akurasi = ((Total Ketukan − Kesalahan) / Total Ketukan) × 100%. Tidak ada karakter dihitung dua kali.
              </p>
            </div>
          </div>
        )}
      </section>

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
