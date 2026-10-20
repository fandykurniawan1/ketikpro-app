import type { Result } from '@/types/typing';

/**
 * Formula Standar Internasional:
 * 1 Kata Standar = 5 Karakter (termasuk spasi).
 * WPM = (Karakter Benar / 5) / Menit Aktif
 * CPM = Karakter Benar / Menit Aktif
 * WPM = CPM / 5
 */
export function calculateWpm(correctChars: number, activeMinutes: number): number {
  if (activeMinutes <= 0.005) return 0;
  return Math.round(correctChars / 5 / activeMinutes);
}

export function calculateCpm(correctChars: number, activeMinutes: number): number {
  if (activeMinutes <= 0.005) return 0;
  return Math.round(correctChars / activeMinutes);
}

export function calculateAccuracy(keystrokes: number, errors: number): number {
  if (keystrokes <= 0) return 100;
  return Math.max(0, Math.round(((keystrokes - errors) / keystrokes) * 100));
}

export interface AccuracyEvaluation {
  level: 'critical' | 'good' | 'master';
  title: string;
  badge: string;
  badgeColor: string;
  advice: string;
  canPushSpeed: boolean;
}

/**
 * Evaluasi pedagogis memori otot:
 * Mengutamakan akurasi di atas kecepatan. Menolak dorongan kecepatan jika akurasi masih rendah.
 */
export function evaluateAccuracyPriority(accuracy: number, wpm: number): AccuracyEvaluation {
  if (accuracy < 92) {
    return {
      level: 'critical',
      title: 'Prioritaskan Akurasi Terlebih Dahulu!',
      badge: 'Fokus Akurasi',
      badgeColor: 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400',
      advice: `Tingkat akurasi Anda (${accuracy}%) masih di bawah ambang aman (92%). Jangan mengetik terburu-buru! Turunkan tempo, rasakan posisi tonjolan jangkar F & J, dan pastikan setiap huruf ditekan oleh jari yang benar. Memori otot hanya akan terbentuk kuat jika Anda mengetik tanpa salah.`,
      canPushSpeed: false,
    };
  }

  if (accuracy < 96) {
    return {
      level: 'good',
      title: 'Akurasi Cukup Stabil, Jaga Ritme!',
      badge: 'Ritme Seimbang',
      badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
      advice: `Akurasi Anda (${accuracy}%) sudah baik. Pertahankan ketenangan dan ritme ketukan yang konstan. Jangan tergesa-gesa memacu WPM sampai Anda konsisten meraih akurasi di atas 95%.`,
      canPushSpeed: false,
    };
  }

  return {
    level: 'master',
    title: 'Akurasi Sangat Presisi! Siap Tingkatkan Kecepatan 🚀',
    badge: 'Akurasi Unggul',
    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    advice: `Luar biasa! Akurasi ${accuracy}% dengan kecepatan ${wpm} WPM membuktikan koordinasi 10 jari Anda sangat solid. Anda kini memiliki fondasi yang kuat untuk meningkatkan tempo ketikan secara bertahap.`,
    canPushSpeed: true,
  };
}

export interface PersonalRecords {
  bestWpm: number;
  bestAccuracy: number;
  totalSessions: number;
  totalSeconds: number;
  totalCorrectChars: number;
  totalErrors: number;
  avgWpm: number;
  avgAccuracy: number;
  avgCpm: number;
}

export function getPersonalRecords(results: Result[]): PersonalRecords {
  if (results.length === 0) {
    return {
      bestWpm: 0,
      bestAccuracy: 0,
      totalSessions: 0,
      totalSeconds: 0,
      totalCorrectChars: 0,
      totalErrors: 0,
      avgWpm: 0,
      avgAccuracy: 0,
      avgCpm: 0,
    };
  }

  const bestWpm = results.reduce((max, r) => Math.max(max, r.wpm), 0);
  const bestAccuracy = results.reduce((max, r) => Math.max(max, r.accuracy), 0);
  const totalSessions = results.length;
  const totalSeconds = results.reduce((sum, r) => sum + (r.seconds || 30), 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

  // Estimasi total karakter benar jika tidak tersimpan langsung
  const totalCorrectChars = results.reduce((sum, r) => {
    if (typeof r.correctChars === 'number') return sum + r.correctChars;
    // Estimasi dari WPM dan seconds
    const minutes = (r.seconds || 30) / 60;
    return sum + Math.round(r.wpm * 5 * minutes);
  }, 0);

  const avgWpm = Math.round(results.reduce((sum, r) => sum + r.wpm, 0) / totalSessions);
  const avgAccuracy = Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / totalSessions);
  const avgCpm = Math.round(results.reduce((sum, r) => sum + (r.cpm || r.wpm * 5), 0) / totalSessions);

  return {
    bestWpm,
    bestAccuracy,
    totalSessions,
    totalSeconds,
    totalCorrectChars,
    totalErrors,
    avgWpm,
    avgAccuracy,
    avgCpm,
  };
}

/**
 * Agregasi seluruh tombol kelemahan dari riwayat sesi pengguna
 */
export function getAggregatedWeakKeys(results: Result[]): { key: string; count: number }[] {
  const map: Record<string, number> = {};

  results.forEach((r) => {
    if (r.weakKeys) {
      Object.entries(r.weakKeys).forEach(([key, count]) => {
        map[key] = (map[key] || 0) + count;
      });
    }
  });

  return Object.entries(map)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Kumpulan kosakata bahasa Indonesia terkurasi per huruf untuk latihan remedial terfokus
 */
const VOCAB_MAP: Record<string, string[]> = {
  a: ['ada', 'anak', 'asal', 'alam', 'arah', 'aman', 'awan', 'akar', 'atas', 'ajar'],
  b: ['bisa', 'buku', 'batu', 'buka', 'baru', 'baik', 'bawa', 'bagi', 'bumi', 'beda'],
  c: ['cara', 'cari', 'cepat', 'coba', 'cerah', 'cahaya', 'cermat', 'contoh', 'cinta', 'cuaca'],
  d: ['dari', 'dan', 'dua', 'daya', 'daun', 'dalam', 'datang', 'dunia', 'dekat', 'duduk'],
  e: ['emas', 'enak', 'erat', 'edar', 'ekor', 'elok', 'empuk', 'enam', 'esai', 'esok'],
  f: ['fokus', 'fakta', 'format', 'fungsi', 'faktor', 'fisik', 'fasih', 'faedah', 'filosofi', 'fajar'],
  g: ['gaya', 'gula', 'guru', 'guna', 'gelap', 'gerak', 'gagang', 'garis', 'gembira', 'gunung'],
  h: ['hari', 'hidup', 'hati', 'hutan', 'hujan', 'harus', 'hebat', 'hawa', 'hasil', 'harap'],
  i: ['ini', 'itu', 'ibu', 'ikan', 'ilmu', 'indah', 'ingat', 'ikut', 'isi', 'ikatan'],
  j: ['juga', 'jari', 'jalan', 'jauh', 'jelas', 'jaga', 'janji', 'juang', 'juara', 'jujur'],
  k: ['kita', 'kami', 'kunci', 'kata', 'kerja', 'kaki', 'kiri', 'kanan', 'kabar', 'kawan'],
  l: ['lalu', 'lama', 'laut', 'lagi', 'langkah', 'latih', 'luas', 'laju', 'lurus', 'lancar'],
  m: ['mata', 'maka', 'malam', 'maju', 'mampu', 'mudah', 'makan', 'murni', 'masuk', 'mulai'],
  n: ['nama', 'nada', 'naik', 'nyata', 'nasi', 'nilai', 'nomor', 'nyaman', 'napas', 'niat'],
  o: ['orang', 'otak', 'obat', 'olah', 'ombak', 'orbit', 'organ', 'orisinil', 'obor', 'otot'],
  p: ['pagi', 'pasti', 'pola', 'peta', 'pintu', 'pikir', 'pohon', 'padu', 'pesat', 'pulang'],
  q: ['qurani', 'qasidah', 'quran', 'qari', 'quota', 'qasar', 'qadha'],
  r: ['rasa', 'rapi', 'rajin', 'ruang', 'rintis', 'ritme', 'rantai', 'ramah', 'rahasia', 'roda'],
  s: ['satu', 'sama', 'saya', 'selalu', 'sehat', 'suara', 'sudah', 'segar', 'sejati', 'siap'],
  t: ['tahu', 'tangan', 'tetap', 'tata', 'tenang', 'teratur', 'tumbuh', 'tuntas', 'tujuan', 'terang'],
  u: ['udara', 'usaha', 'untuk', 'ujung', 'utama', 'ulang', 'untung', 'umur', 'ucap', 'unggul'],
  v: ['visi', 'variasi', 'vokal', 'volume', 'valid', 'vital', 'vektor', 'ventura', 'verifikasi'],
  w: ['waktu', 'warga', 'warna', 'wajah', 'wajar', 'wadah', 'wawasan', 'wilayah', 'wujud', 'wangi'],
  x: ['xenon', 'xilofon', 'xilem', 'xenofobia', 'xerox'],
  y: ['yang', 'yakin', 'yodium', 'yuris', 'yayasan', 'yojana', 'yoga'],
  z: ['zat', 'zona', 'zaman', 'ziarah', 'zebra', 'zamrud', 'zenit', 'zero'],
  '1': ['10', '12', '15', '18', '21', '31', '41', '51', '100', '199'],
  '2': ['20', '22', '24', '28', '32', '42', '52', '62', '200', '250'],
  '3': ['30', '33', '35', '38', '13', '23', '43', '53', '300', '333'],
  '4': ['40', '44', '45', '48', '14', '24', '34', '54', '400', '450'],
  '5': ['50', '55', '58', '15', '25', '35', '45', '65', '500', '555'],
  ',': ['satu,', 'dua,', 'tiga,', 'lalu,', 'kita,', 'mereka,'],
  '.': ['selesai.', 'tuntas.', 'benar.', 'tepat.', 'rapi.', 'maju.'],
  ';': ['fokus; tenang;', 'rapi; teratur;', 'cepat; tepat;'],
};

export interface RemedialDrill {
  title: string;
  desc: string;
  targetKeys: string[];
  text: string;
}

/**
 * Membangkitkan latihan remedial terfokus berdasarkan huruf-huruf yang paling sering salah ditekan
 */
export function generateRemedialDrill(targetKeys: string[]): RemedialDrill {
  const cleanedKeys = targetKeys
    .map((k) => k.toLowerCase())
    .filter((k) => k.length === 1 && k !== ' ')
    .slice(0, 5);

  if (cleanedKeys.length === 0) {
    return {
      title: 'Latihan Penguatan Home Row',
      desc: 'Latihan penguatan posisi jangkar dasar jari tangan.',
      targetKeys: ['f', 'j', 'd', 'k'],
      text: 'fada kada jasa kaca lada masa nada rasa sana taat',
    };
  }

  const keyDisplay = cleanedKeys.map((k) => k.toUpperCase()).join(', ');

  // Kumpulkan kata-kata yang relevan
  const relevantWords: string[] = [];
  cleanedKeys.forEach((key) => {
    const words = VOCAB_MAP[key] || [];
    words.forEach((w) => {
      if (!relevantWords.includes(w)) {
        relevantWords.push(w);
      }
    });
  });

  // Susun pola latihan berjenjang:
  // 1. Drill tuts ritmis (misal: f f f j j j)
  // 2. Kombinasi suku kata
  // 3. Kata bahasa Indonesia utuh
  const drillChunks: string[] = [];

  // Pola 1: Repetisi jari
  cleanedKeys.forEach((k) => {
    drillChunks.push(`${k}${k}${k} ${k}a${k} ${k}i${k}`);
  });

  // Pola 2: Pasangan kata
  const shuffledWords = [...relevantWords].sort(() => 0.5 - Math.random()).slice(0, 14);
  if (shuffledWords.length > 0) {
    drillChunks.push(shuffledWords.join(' '));
  } else {
    cleanedKeys.forEach((k) => {
      drillChunks.push(`${k}ada ${k}ata ${k}ara ${k}asa`);
    });
  }

  const text = drillChunks.join(' ');

  return {
    title: `Latihan Penguatan Tombol [${keyDisplay}]`,
    desc: `Materi drill remedial untuk melatih memori otot dan akurasi khusus tombol: ${keyDisplay}.`,
    targetKeys: cleanedKeys,
    text,
  };
}
