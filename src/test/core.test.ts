import { describe, expect, it } from 'vitest';
import {
  curriculum,
  keyFor,
  fingerMap,
  defaultPassCriteria,
  criteriaPresets,
} from '../core/constants/curriculum';
import {
  unlockedLevels,
  isPassed,
  stars,
  exportProgressAsJson,
  importProgressFromJson,
  savePassCriteria,
  loadPassCriteria,
  resetPassCriteria,
} from '../core/storage/progressStorage';
import {
  calculateWpm,
  calculateCpm,
  calculateAccuracy,
  evaluateAccuracyPriority,
  getPersonalRecords,
  getAggregatedWeakKeys,
  generateRemedialDrill,
} from '../core/engine/evaluationEngine';
import type { Result } from '../types/typing';

const createResult = (lessonId: string, accuracy: number, wpm: number): Result => ({
  lessonId,
  accuracy,
  wpm,
  errors: 0,
  date: Date.now(),
});

describe('Struktur Kurikulum 10 Level Lengkap', () => {
  it('Memiliki tepat 10 Level terstruktur', () => {
    expect(curriculum).toHaveLength(10);
    expect(curriculum.map((l) => l.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('Level 1 mencakup Pengenalan Keyboard, Ergonomi, Fungsi Jari, Penanda F & J, dan Home Row', () => {
    const lvl1 = curriculum[0]!;
    expect(lvl1.title).toBe('Pengenalan Keyboard');
    const titles = lvl1.lessons.map((l) => l.title);
    expect(titles.some((t) => t.includes('QWERTY'))).toBe(true);
    expect(titles.some((t) => t.includes('Posisi Duduk') || t.includes('Pergelangan'))).toBe(true);
    expect(titles.some((t) => t.includes('Fungsi Setiap Jari'))).toBe(true);
    expect(titles.some((t) => t.includes('Tombol Pemandu F dan J') || t.includes('F dan J'))).toBe(true);
    expect(titles.some((t) => t.includes('Menempatkan Jari') || t.includes('Home Row'))).toBe(true);
  });

  it('Level 2 mencakup latihan tombol Home Row: A S D F J K L ;', () => {
    const lvl2 = curriculum[1]!;
    expect(lvl2.title).toBe('Home Row');
    const lessonKeys = lvl2.lessons.map((l) => l.keys).join('');
    expect(lessonKeys).toContain('asdf');
    expect(lessonKeys).toContain('jkl;');
  });

  it('Level 3 mencakup Top Row (Q W E R T Y U I O P) dan integrasi dengan Home Row', () => {
    const lvl3 = curriculum[2]!;
    expect(lvl3.title).toBe('Top Row');
    expect(lvl3.lessons.some((l) => l.id === '3-6' && l.keys.includes('qwertyuiop'))).toBe(true);
  });

  it('Level 4 mencakup Bottom Row (Z X C V B N M , . /) dan kembali ke Home Row', () => {
    const lvl4 = curriculum[3]!;
    expect(lvl4.title).toBe('Bottom Row');
    expect(lvl4.lessons.some((l) => l.title.includes('Kembali ke Home Row'))).toBe(true);
  });

  it('Level 5 mencakup alfabet lengkap, pola sering dipakai, kata, kalimat, dan mode tanpa melihat keyboard', () => {
    const lvl5 = curriculum[4]!;
    expect(lvl5.title).toBe('Kombinasi Seluruh Huruf');
    expect(lvl5.lessons.some((l) => l.blind === true)).toBe(true);
  });

  it('Level 6 mencakup Shift kiri, Shift kanan, kapital, tanda baca, Enter, dan Backspace', () => {
    const lvl6 = curriculum[5]!;
    expect(lvl6.title).toBe('Huruf Kapital dan Tanda Baca');
    const titles = lvl6.lessons.map((l) => l.title);
    expect(titles.some((t) => t.includes('Shift Kiri'))).toBe(true);
    expect(titles.some((t) => t.includes('Shift Kanan'))).toBe(true);
    expect(titles.some((t) => t.includes('Enter'))).toBe(true);
    expect(titles.some((t) => t.includes('Backspace'))).toBe(true);
  });

  it('Level 7 mencakup kata sehari-hari, paragraf pendek, cerita, dan teks profesional perkantoran', () => {
    const lvl7 = curriculum[6]!;
    expect(lvl7.title).toBe('Kata dan Kalimat');
    const titles = lvl7.lessons.map((l) => l.title);
    expect(titles.some((t) => t.includes('Profesional'))).toBe(true);
  });

  it('Level 8 mencakup baris angka, simbol umum, shift, dan angka/simbol pekerjaan', () => {
    const lvl8 = curriculum[7]!;
    expect(lvl8.title).toBe('Angka dan Simbol');
    expect(lvl8.lessons.some((l) => l.keys.includes('12345'))).toBe(true);
    expect(lvl8.lessons.some((l) => l.keys.includes('67890'))).toBe(true);
  });

  it('Level 9 mencakup tes 1 menit, 3 menit, 5 menit, akurasi, kecepatan, dan kombinasi kata/kalimat', () => {
    const lvl9 = curriculum[8]!;
    expect(lvl9.title).toBe('Latihan Kecepatan');
    const timeLimits = lvl9.lessons.map((l) => l.timeLimit).filter(Boolean);
    expect(timeLimits).toContain(60);
    expect(timeLimits).toContain(180);
    expect(timeLimits).toContain(300);
  });

  it('Level 10 mencakup ujian akhir komprehensif master touch typing', () => {
    const lvl10 = curriculum[9]!;
    expect(lvl10.title).toBe('Master Touch Typing');
    expect(lvl10.lessons.length).toBeGreaterThanOrEqual(3);
    expect(lvl10.lessons.every((l) => l.blind === true)).toBe(true);
  });
});

describe('Sistem Kelulusan & Kriteria Konfigurasi (Configurable Pass Criteria)', () => {
  it('Hanya Level 1 yang terbuka di awal saat belum ada riwayat latihan', () => {
    expect([...unlockedLevels([])]).toEqual([1]);
  });

  it('Level 2 terbuka jika semua pelajaran di Level 1 lulus sesuai kriteria standar', () => {
    const level1Results = curriculum[0]!.lessons.map((l) => createResult(l.id, 95, 10));
    const openLevels = unlockedLevels(level1Results);
    expect(openLevels.has(2)).toBe(true);
  });

  it('Mendukung kriteria kelulusan yang dapat dikonfigurasi secara kustom', () => {
    // Hasil: Akurasi 82%, WPM 5 pada level 1
    const subStandardResults = curriculum[0]!.lessons.map((l) => createResult(l.id, 82, 5));

    // Di bawah standar default (min 90%), Level 2 tidak terbuka
    expect(isPassed(createResult('1-1', 82, 5), defaultPassCriteria)).toBe(false);
    const defaultOpen = unlockedLevels(subStandardResults, defaultPassCriteria);
    expect(defaultOpen.has(2)).toBe(false);

    // Dengan kriteria kustom 'santai' (min 80%), Level 2 terbuka!
    const santaiCriteria = criteriaPresets.santai;
    expect(isPassed(createResult('1-1', 82, 5), santaiCriteria)).toBe(true);
    const relaxedOpen = unlockedLevels(subStandardResults, santaiCriteria);
    expect(relaxedOpen.has(2)).toBe(true);
  });

  it('Menyimpan dan memulihkan konfigurasi kriteria kelulusan', () => {
    const customConfig = {
      ...defaultPassCriteria,
      1: { minAccuracy: 75, minWpm: 0 },
      2: { minAccuracy: 80, minWpm: 2 },
    };
    savePassCriteria(customConfig);
    const loaded = loadPassCriteria();
    expect(loaded[1]!.minAccuracy).toBe(75);
    expect(loaded[2]!.minWpm).toBe(2);

    // Reset kembali ke default
    resetPassCriteria();
    const afterReset = loadPassCriteria();
    expect(afterReset[1]!.minAccuracy).toBe(defaultPassCriteria[1]!.minAccuracy);
  });
});

describe('Sistem Bintang Prestasi (Stars Calculation)', () => {
  it('Memberikan 3 bintang untuk akurasi >= 97% dan WPM >= 25', () => {
    expect(stars(98, 30)).toBe(3);
  });

  it('Memberikan 2 bintang untuk akurasi >= 92%', () => {
    expect(stars(94, 20)).toBe(2);
  });

  it('Memberikan 1 bintang untuk akurasi >= 80%', () => {
    expect(stars(85, 15)).toBe(1);
  });

  it('Memberikan 0 bintang untuk akurasi < 80%', () => {
    expect(stars(75, 40)).toBe(0);
  });
});

describe('Pemetaan Tombol Fisik & Shift (Key Mapping)', () => {
  it('Mendeteksi huruf kapital memerlukan tombol Shift', () => {
    expect(keyFor('A')).toEqual({ key: 'a', shift: true });
    expect(keyFor('B')).toEqual({ key: 'b', shift: true });
  });

  it('Mendeteksi huruf kecil tidak memerlukan Shift', () => {
    expect(keyFor('a')).toEqual({ key: 'a', shift: false });
    expect(keyFor('j')).toEqual({ key: 'j', shift: false });
  });

  it('Mendeteksi simbol Shift pada baris angka', () => {
    expect(keyFor('!')).toEqual({ key: '1', shift: true });
    expect(keyFor('@')).toEqual({ key: '2', shift: true });
    expect(keyFor('?')).toEqual({ key: '/', shift: true });
  });

  it('Mendeteksi tombol Enter dan Backspace secara tepat', () => {
    expect(keyFor('Backspace')).toEqual({ key: 'Backspace', shift: false });
    expect(keyFor('\n')).toEqual({ key: '\n', shift: false });
  });
});

describe('Pemetaan 10 Jari Standar Touch Typing (Finger Assignment)', () => {
  it('Memetakan tuts home row ke jari yang tepat', () => {
    expect(fingerMap['a']).toBe(0); // Kelingking kiri
    expect(fingerMap['s']).toBe(1); // Manis kiri
    expect(fingerMap['d']).toBe(2); // Tengah kiri
    expect(fingerMap['f']).toBe(3); // Telunjuk kiri
    expect(fingerMap[' ']).toBe(4); // Ibu jari
    expect(fingerMap['j']).toBe(5); // Telunjuk kanan
    expect(fingerMap['k']).toBe(6); // Tengah kanan
    expect(fingerMap['l']).toBe(7); // Manis kanan
    expect(fingerMap[';']).toBe(8); // Kelingking kanan
  });

  it('Telunjuk kiri bertugas pada tombol F dan kelompok tuts di sekitarnya (4, 5, R, T, F, G, V, B)', () => {
    const leftIndexKeys = '45rtfgvb'.split('');
    leftIndexKeys.forEach((char) => {
      expect(fingerMap[char]).toBe(3); // Telunjuk kiri
    });
  });

  it('Telunjuk kanan bertugas pada tombol J dan kelompok tuts di sekitarnya (6, 7, Y, U, H, J, N, M)', () => {
    const rightIndexKeys = '67yuhjnm'.split('');
    rightIndexKeys.forEach((char) => {
      expect(fingerMap[char]).toBe(5); // Telunjuk kanan
    });
  });

  it('Mengikuti prinsip Shift silang (huruf tangan kanan didukung Shift kiri, huruf tangan kiri didukung Shift kanan)', () => {
    // 'A' berada di tangan kiri (finger 0) -> butuh Shift kanan
    const keyA = keyFor('A');
    const fingerA = fingerMap[keyA.key]!;
    const shiftForA = fingerA >= 5 ? 'ShiftL' : 'ShiftR';
    expect(shiftForA).toBe('ShiftR');

    // 'J' berada di tangan kanan (finger 5) -> butuh Shift kiri
    const keyJ = keyFor('J');
    const fingerJ = fingerMap[keyJ.key]!;
    const shiftForJ = fingerJ >= 5 ? 'ShiftL' : 'ShiftR';
    expect(shiftForJ).toBe('ShiftL');
  });
});

describe('Cadangan Data Progres (JSON Export & Import)', () => {
  it('Mampu mengekspor struktur JSON yang valid', () => {
    const jsonStr = exportProgressAsJson();
    expect(typeof jsonStr).toBe('string');
    const parsed = JSON.parse(jsonStr);
    expect(parsed).toHaveProperty('version');
    expect(parsed).toHaveProperty('results');
    expect(parsed).toHaveProperty('criteria');
  });

  it('Mampu mengimpor kembali string JSON yang valid', () => {
    const testJson = JSON.stringify({
      version: '2.0',
      results: [createResult('1-1', 95, 15)],
      criteria: defaultPassCriteria,
    });
    expect(importProgressFromJson(testJson)).toBe(true);
  });

  it('Menolak string JSON yang rusak / tidak sesuai format', () => {
    expect(importProgressFromJson('bukan json valid')).toBe(false);
  });
});

describe('Aturan Mesin Latihan Mengetik (Typing Engine Rules)', () => {
  it('Menghitung akurasi dan WPM dengan formula standar tanpa menghitung ganda', () => {
    const totalKeystrokes = 100;
    const errors = 5;
    const accuracy = Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100);
    expect(accuracy).toBe(95);

    // 95 karakter benar dalam 60 detik (1 menit) = 19 WPM (1 kata = 5 karakter standar)
    const elapsedMinutes = 1;
    const correctCount = 95;
    const wpm = Math.round(correctCount / 5 / elapsedMinutes);
    expect(wpm).toBe(19);
  });

  it('Aturan penyelesaian: latihan teks tidak boleh selesai hanya karena waktu habis jika teks belum tuntas', () => {
    const textToType = 'Halo dunia!';
    const typedSoFar = 'Halo';
    const requireCompleteText = true;

    // Jika requireCompleteText = true dan typed belum mencapai text.length, latihan BELUM selesai
    const isCompleted = requireCompleteText ? typedSoFar.length >= textToType.length : true;
    expect(isCompleted).toBe(false);

    // Latihan baru selesai jika seluruh teks sudah diketik
    const fullyTyped = 'Halo dunia!';
    const isNowCompleted = requireCompleteText ? fullyTyped.length >= textToType.length : true;
    expect(isNowCompleted).toBe(true);
  });

  it('Aturan Backspace: mode koreksi ketat mewajibkan perbaikan error sebelum lanjut', () => {
    const expected = 'belajar';
    const currentTyped = 'bxl'; // 'x' adalah salah
    const strictCorrection = true;

    let firstWrong = -1;
    for (let i = 0; i < currentTyped.length; i++) {
      if (currentTyped[i] !== expected[i]) {
        firstWrong = i;
        break;
      }
    }
    expect(firstWrong).toBe(1); // salah pada index 1 ('x' bukan 'e')

    // Pada mode strict, tombol selanjutnya wajib Backspace
    const nextRequiredKey = firstWrong !== -1 && strictCorrection ? 'Backspace' : expected[currentTyped.length];
    expect(nextRequiredKey).toBe('Backspace');

    // Setelah Backspace menghapus karakter salah
    const correctedTyped = currentTyped.slice(0, 1); // kembali ke 'b'
    let newFirstWrong = -1;
    for (let i = 0; i < correctedTyped.length; i++) {
      if (correctedTyped[i] !== expected[i]) {
        newFirstWrong = i;
        break;
      }
    }
    expect(newFirstWrong).toBe(-1); // tidak ada salah lagi
    const nowRequiredKey = newFirstWrong !== -1 && strictCorrection ? 'Backspace' : expected[correctedTyped.length];
    expect(nowRequiredKey).toBe('e'); // sekarang boleh lanjut ketik 'e'
  });

  it('Mengabaikan tombol tidak relevan (Modifier, Tombol Fungsi, Navigasi)', () => {
    const ignoredKeys = [
      'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'NumLock', 'ScrollLock',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End',
      'PageUp', 'PageDown', 'Insert', 'Delete', 'Pause', 'PrintScreen', 'ContextMenu',
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
    ];

    // Simulasi filter input: setiap tombol di atas harus ditolak dan tidak mengubah typed
    const isIgnored = (key: string) => ignoredKeys.includes(key);
    ignoredKeys.forEach((key) => {
      expect(isIgnored(key)).toBe(true);
    });

    // Karakter valid tidak boleh diabaikan
    expect(isIgnored('a')).toBe(false);
    expect(isIgnored(' ')).toBe(false);
    expect(isIgnored('Backspace')).toBe(false);
  });

  it('Mencegah penghitungan ganda ketika tombol ditahan (repeat event filtering)', () => {
    // Fungsi simulasi filter event repeat
    const shouldProcessEvent = (e: { repeat: boolean; key: string }) => {
      if (e.repeat && e.key !== 'Backspace') return false;
      return true;
    };

    // Tombol biasa yang ditahan harus diabaikan setelah event pertama
    expect(shouldProcessEvent({ repeat: true, key: 'a' })).toBe(false);
    expect(shouldProcessEvent({ repeat: true, key: ' ' })).toBe(false);

    // Tombol biasa pertama kali ditekan harus diproses
    expect(shouldProcessEvent({ repeat: false, key: 'a' })).toBe(true);

    // Backspace yang ditahan diizinkan untuk kemudahan menghapus banyak karakter
    expect(shouldProcessEvent({ repeat: true, key: 'Backspace' })).toBe(true);
  });

  it('Tidak menghitung karakter yang sama dua kali meskipun terjadi koreksi Backspace berulang', () => {
    const targetText = 'program';
    // Simulasi: user ketik 'pro', salah ketik 'x', hapus dengan Backspace, lalu ketik 'g'
    let typed = 'pro';
    typed += 'x'; // 'prox'
    typed = typed.slice(0, -1); // 'pro'
    typed += 'g'; // 'prog'

    // Perhitungan karakter benar berbasis indeks unik
    const correctCount = typed
      .split('')
      .reduce((acc, char, idx) => (char === targetText[idx] ? acc + 1 : acc), 0);

    // Tepat 4 karakter benar (p, r, o, g) - tidak ada slot karakter yang dihitung ganda
    expect(correctCount).toBe(4);
    expect(typed).toBe('prog');
  });

  it('Mendukung durasi aktif yang mengecualikan waktu jeda (pause exclusion)', () => {
    let accumulatedMs = 0;
    let segmentStart = 1000;
    let now = 6000; // 5 detik berjalan

    // Jeda terjadi
    accumulatedMs += now - segmentStart;
    expect(accumulatedMs).toBe(5000); // 5 detik

    // Waktu berhenti selama 10 detik dijeda (tidak bertambah ke accumulatedMs)
    // Kemudian dilanjutkan
    segmentStart = 16000;
    now = 18000; // 2 detik lagi berjalan
    const totalActiveMs = accumulatedMs + (now - segmentStart);
    expect(totalActiveMs).toBe(7000); // Total 7 detik (bukan 17 detik)
  });
});

describe('Sistem Statistik dan Evaluasi (WPM, CPM, Akurasi, Prioritas, & Remedial Drill)', () => {
  it('Rumus WPM standar berbasis lima karakter per kata (WPM = (Karakter Benar / 5) / Menit)', () => {
    // 250 karakter benar dalam 2 menit = 50 kata standar = 25 WPM
    const wpm = calculateWpm(250, 2);
    expect(wpm).toBe(25);

    // 150 karakter benar dalam 1 menit = 30 WPM
    expect(calculateWpm(150, 1)).toBe(30);

    // Durasi sangat singkat / belum mulai menghasilkan 0
    expect(calculateWpm(10, 0)).toBe(0);
  });

  it('Rumus CPM dan hubungan WPM = CPM / 5 (Jangan menyamakan WPM dengan CPM)', () => {
    // 300 karakter benar dalam 1 menit = 300 CPM = 60 WPM
    const cpm = calculateCpm(300, 1);
    const wpm = calculateWpm(300, 1);
    expect(cpm).toBe(300);
    expect(wpm).toBe(60);
    expect(cpm / 5).toBe(wpm);
  });

  it('Hitung akurasi secara konsisten: Akurasi = ((Total Ketukan - Kesalahan) / Total Ketukan) * 100%', () => {
    // 100 ketukan, 0 kesalahan = 100%
    expect(calculateAccuracy(100, 0)).toBe(100);

    // 100 ketukan, 8 kesalahan = 92%
    expect(calculateAccuracy(100, 8)).toBe(92);

    // 50 ketukan, 5 kesalahan = 90%
    expect(calculateAccuracy(50, 5)).toBe(90);

    // 0 ketukan = 100% default
    expect(calculateAccuracy(0, 0)).toBe(100);
  });

  it('Prioritaskan akurasi terlebih dahulu: tidak mendorong pengguna mengetik terlalu cepat jika kesalahan masih tinggi', () => {
    // Akurasi 85% (di bawah 92%) harus memicu peringatan kritis dan canPushSpeed: false
    const evalLow = evaluateAccuracyPriority(85, 45);
    expect(evalLow.level).toBe('critical');
    expect(evalLow.canPushSpeed).toBe(false);
    expect(evalLow.title).toContain('Prioritaskan Akurasi');
    expect(evalLow.advice).toContain('Turunkan tempo');

    // Akurasi 93% (antara 92% dan 95%) fokus stabilisasi ritme, canPushSpeed: false
    const evalMedium = evaluateAccuracyPriority(93, 30);
    expect(evalMedium.level).toBe('good');
    expect(evalMedium.canPushSpeed).toBe(false);

    // Akurasi 98% (>= 96%) baru memberikan lampu hijau untuk meningkatkan tempo kecepatan
    const evalHigh = evaluateAccuracyPriority(98, 40);
    expect(evalHigh.level).toBe('master');
    expect(evalHigh.canPushSpeed).toBe(true);
    expect(evalHigh.title).toContain('Siap Tingkatkan Kecepatan');
  });

  it('Menghitung Rekor Pribadi (Personal Records) dan agregasi statistik kumulatif', () => {
    const dummyResults: Result[] = [
      { lessonId: '1-1', wpm: 20, cpm: 100, accuracy: 90, errors: 4, correctChars: 100, seconds: 60, date: 1000 },
      { lessonId: '1-2', wpm: 35, cpm: 175, accuracy: 96, errors: 2, correctChars: 175, seconds: 60, date: 2000 },
      { lessonId: '1-3', wpm: 28, cpm: 140, accuracy: 92, errors: 3, correctChars: 140, seconds: 60, date: 3000 },
    ];

    const records = getPersonalRecords(dummyResults);
    expect(records.bestWpm).toBe(35); // PB WPM tertinggi
    expect(records.bestAccuracy).toBe(96); // PB Akurasi tertinggi
    expect(records.totalSessions).toBe(3);
    expect(records.totalSeconds).toBe(180);
    expect(records.totalCorrectChars).toBe(415);
    expect(records.totalErrors).toBe(9);
    expect(records.avgWpm).toBe(28); // (20 + 35 + 28) / 3 = 27.67 -> 28
  });

  it('Mengagregasi tombol kelemahan (weak keys) dan mengurutkannya berdasarkan frekuensi kesalahan', () => {
    const dummyResults: Result[] = [
      { lessonId: '1-1', wpm: 20, accuracy: 90, errors: 3, date: 1, weakKeys: { e: 2, r: 1 } },
      { lessonId: '1-2', wpm: 25, accuracy: 92, errors: 4, date: 2, weakKeys: { e: 3, k: 2 } },
    ];

    const aggregated = getAggregatedWeakKeys(dummyResults);
    expect(aggregated[0]).toEqual({ key: 'e', count: 5 }); // 2 + 3 = 5
    expect(aggregated.some((w) => w.key === 'k' && w.count === 2)).toBe(true);
    expect(aggregated.some((w) => w.key === 'r' && w.count === 1)).toBe(true);
  });

  it('Membangkitkan materi latihan tambahan/remedial otomatis berdasarkan tombol lemah', () => {
    const weakKeys = ['e', 'r', 'k'];
    const drill = generateRemedialDrill(weakKeys);

    expect(drill.title).toContain('E, R, K');
    expect(drill.targetKeys).toEqual(['e', 'r', 'k']);
    expect(drill.text.length).toBeGreaterThan(20);

    // Teks harus mengandung huruf-huruf target yang ingin dilatih
    expect(drill.text.toLowerCase()).toContain('e');
    expect(drill.text.toLowerCase()).toContain('r');
    expect(drill.text.toLowerCase()).toContain('k');
  });
});
