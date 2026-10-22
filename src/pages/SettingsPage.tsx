import React, { useState, useRef } from 'react';
import {
  Settings,
  Volume2,
  Moon,
  Sun,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sliders,
  RotateCcw,
  ShieldCheck,
  Zap,
  Target,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useSound } from '@/hooks/useSound';
import { useUserProgress } from '@/hooks/useUserProgress';
import {
  curriculum,
  criteriaPresets,
  defaultPassCriteria,
} from '@/core/constants/curriculum';
import {
  exportProgressAsJson,
  importProgressFromJson,
  resetAllProgress,
  type SoundTheme,
} from '@/core/storage/progressStorage';
import type { PassCriteria, CriteriaPreset } from '@/types/curriculum';

export const SettingsPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { soundTheme, changeSoundTheme, triggerKeySound } = useSound();
  const { criteria, updateCriteria, resetCriteria, unlocked } = useUserProgress();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Local state for editing criteria
  const [localCriteria, setLocalCriteria] = useState<Record<number, PassCriteria>>(criteria);
  const [activePreset, setActivePreset] = useState<CriteriaPreset>('standar');
  const [hasUnsavedCriteria, setHasUnsavedCriteria] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSoundChange = (theme: SoundTheme) => {
    changeSoundTheme(theme);
    if (theme !== 'off') {
      triggerKeySound();
    }
  };

  const handleApplyPreset = (presetKey: Exclude<CriteriaPreset, 'kustom'>) => {
    const selected = criteriaPresets[presetKey];
    setLocalCriteria({ ...selected });
    setActivePreset(presetKey);
    setHasUnsavedCriteria(true);
  };

  const handleLevelCriteriaChange = (
    levelNum: number,
    field: 'minAccuracy' | 'minWpm',
    value: number
  ) => {
    setLocalCriteria((prev) => ({
      ...prev,
      [levelNum]: {
        ...prev[levelNum]!,
        [field]: value,
      },
    }));
    setActivePreset('kustom');
    setHasUnsavedCriteria(true);
  };

  const handleSaveCriteria = () => {
    updateCriteria(localCriteria);
    setHasUnsavedCriteria(false);
    showToast('Kriteria kelulusan berhasil diperbarui! Gating level telah diperbarui.');
  };

  const handleResetCriteria = () => {
    resetCriteria();
    setLocalCriteria(defaultPassCriteria);
    setActivePreset('standar');
    setHasUnsavedCriteria(false);
    showToast('Kriteria kelulusan dikembalikan ke standar default.');
  };

  const handleExportData = () => {
    try {
      const json = exportProgressAsJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `asailmu-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Data progres & kriteria berhasil diunduh ke file JSON!');
    } catch {
      showToast('Gagal mengekspor data.', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importProgressFromJson(content);
      if (success) {
        showToast('Data progres & kriteria berhasil dipulihkan!');
      } else {
        showToast('Format file JSON tidak valid.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetData = () => {
    resetAllProgress();
    setShowConfirmReset(false);
    showToast('Seluruh riwayat progres belajar berhasil direset.');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg animate-in slide-in-from-bottom-3 duration-200 ${
            notification.type === 'success'
              ? 'bg-success text-white'
              : 'bg-destructive text-white'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
          <Settings className="h-4 w-4" />
          <span>Preferensi & Konfigurasi</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">
          Pengaturan Aplikasi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sesuaikan kriteria kelulusan level, efek suara ketikan, tampilan visual, serta kelola cadangan data.
        </p>
      </div>

      {/* 1. Kriteria Kelulusan Level (Configurable Pass Criteria) */}
      <section className="rounded-2xl border border-primary/30 bg-card p-6 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" />
              Gating Kurikulum
            </div>
            <h2 className="text-xl font-bold text-foreground mt-1 flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              Kriteria Kelulusan Level (Dapat Dikonfigurasi)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Level berikutnya terbuka otomatis ketika Anda lulus semua materi di level sebelumnya sesuai ambang batas ini.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-medium text-muted-foreground">Level Terbuka:</span>
            <span className="rounded-lg bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
              {unlocked.size} / 10
            </span>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-foreground uppercase tracking-wider">
            Pilihan Mode Preset Standar:
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                id: 'santai' as const,
                title: '🟢 Santai (Pemula)',
                desc: 'Akurasi ≥ 80%, WPM 0–15. Sangat cocok bagi pemula yang baru pertama kali belajar 10 jari.',
              },
              {
                id: 'standar' as const,
                title: '🔵 Standar (Rekomendasi)',
                desc: 'Akurasi ≥ 90%, WPM 0–25. Keseimbangan ideal antara ketelitian dan kecepatan mengetik.',
              },
              {
                id: 'ketat' as const,
                title: '🔴 Ketat (Master)',
                desc: 'Akurasi ≥ 95–98%, WPM 10–40. Standar tinggi untuk kecepatan profesional perkantoran.',
              },
            ].map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset.id)}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <span className="text-sm font-bold text-foreground">{preset.title}</span>
                  <span className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {preset.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level-by-level Fine Tuning */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Kustomisasi Ambang Batas per Level (1 - 10):
            </span>
            {activePreset === 'kustom' && (
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Mode Kustom Aktif
              </span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {curriculum.map((lv) => {
              const c = localCriteria[lv.level] ?? defaultPassCriteria[lv.level]!;
              return (
                <div
                  key={lv.level}
                  className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2.5 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                    <span className="font-bold text-sm text-foreground">
                      Level {lv.level} — {lv.title}
                    </span>
                    <span className="font-mono text-xs text-primary font-semibold">
                      ≥ {c.minAccuracy}% · ≥ {c.minWpm} WPM
                    </span>
                  </div>

                  {/* Accuracy Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-emerald-500" />
                        Min. Akurasi:
                      </span>
                      <b className="font-mono text-foreground">{c.minAccuracy}%</b>
                    </div>
                    <input
                      type="range"
                      min={70}
                      max={100}
                      step={1}
                      value={c.minAccuracy}
                      onChange={(e) =>
                        handleLevelCriteriaChange(lv.level, 'minAccuracy', Number(e.target.value))
                      }
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* WPM Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-500" />
                        Min. Kecepatan (WPM):
                      </span>
                      <b className="font-mono text-foreground">{c.minWpm} WPM</b>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={60}
                      step={1}
                      value={c.minWpm}
                      onChange={(e) =>
                        handleLevelCriteriaChange(lv.level, 'minWpm', Number(e.target.value))
                      }
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons for Criteria */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
          <button
            onClick={handleResetCriteria}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset ke Standar Default
          </button>

          <button
            onClick={handleSaveCriteria}
            disabled={!hasUnsavedCriteria}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm transition-all ${
              hasUnsavedCriteria
                ? 'bg-primary text-primary-foreground hover:opacity-90 animate-pulse'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{hasUnsavedCriteria ? 'Terapkan & Simpan Kriteria' : 'Kriteria Tersimpan'}</span>
          </button>
        </div>
      </section>

      {/* 2. Theme Setting */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          {isDark ? <Moon className="h-5 w-5 text-indigo-500" /> : <Sun className="h-5 w-5 text-amber-500" />}
          Mode Tampilan
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border/60">
          <div>
            <div className="text-sm font-semibold text-foreground">Tema Gelap / Terang</div>
            <div className="text-xs text-muted-foreground">Sesuaikan kontras dengan kenyamanan mata Anda</div>
          </div>
          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors self-start sm:self-center"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            <span>Ganti ke {isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>
        </div>
      </section>

      {/* 3. Sound Effects Setting */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Efek Suara Ketikan (Mechanical Keyboard)
          </h2>
          <button
            onClick={() => triggerKeySound()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-muted"
            title="Dengarkan contoh suara"
          >
            <Play className="h-3 w-3 fill-current" />
            Tes Suara
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-4 pt-2 border-t border-border/60">
          {[
            { id: 'mechanical', title: 'Mechanical Click', desc: 'Tajam & responsif' },
            { id: 'thock', title: 'Warm Thock', desc: 'Tebal & lembut' },
            { id: 'typewriter', title: 'Typewriter', desc: 'Klasik mesin tik' },
            { id: 'off', title: 'Senyap (Mute)', desc: 'Tanpa suara' },
          ].map((item) => {
            const isSelected = soundTheme === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSoundChange(item.id as SoundTheme)}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-card hover:bg-muted/40'
                }`}
              >
                <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                  {item.title}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Data Backup & Restore */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Cadangkan & Pulihkan Progres
        </h2>
        <p className="text-xs text-muted-foreground">
          Semua riwayat progres belajar dan preferensi kriteria disimpan secara aman di browser lokal Anda.
        </p>

        <div className="flex flex-wrap gap-3 pt-2 border-t border-border/60">
          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
          >
            <Download className="h-4 w-4" />
            Ekspor Data & Kriteria (.JSON)
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors shadow-sm"
          >
            <Upload className="h-4 w-4" />
            Impor & Pulihkan Data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => setShowConfirmReset(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 text-destructive bg-destructive/5 px-4 py-2.5 text-sm font-semibold hover:bg-destructive/10 transition-colors ml-auto"
          >
            <Trash2 className="h-4 w-4" />
            Reset Seluruh Progres
          </button>
        </div>
      </section>

      {/* Confirmation Reset Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="rounded-2xl border border-border bg-card p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Hapus Seluruh Riwayat?</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Tindakan ini akan menghapus semua bintang, status kelulusan pelajaran, dan catatan WPM Anda.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
              >
                Batal
              </button>
              <button
                onClick={handleResetData}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer info */}
      <footer className="text-center text-xs text-muted-foreground py-6 border-t border-border/40">
        <p className="font-semibold text-foreground">asailmu — Master Touch Typing 10 Jari</p>
        <p className="mt-1">
          Dibuat dengan React 19, TypeScript, dan Tailwind CSS v4. Kriteria kelulusan dapat dikonfigurasi bebas.
        </p>
      </footer>
    </div>
  );
};
