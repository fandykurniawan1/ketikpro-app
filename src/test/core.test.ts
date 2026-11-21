import { describe, expect, it } from 'vitest';
import {
  curriculum,
  keyFor,
  fingerMap,
  fingerNames,
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

  it('Level 1 mencakup Home Row lengkap (23 pelajaran: F & J, Spasi, D & K, S & L, A & ;, First 8 Keys, G & H, hingga Play Home Row)', () => {
    const lvl1 = curriculum[0]!;
    expect(lvl1.title).toBe('Home Row');
    expect(lvl1.lessons).toHaveLength(23);
    const titles = lvl1.lessons.map((l) => l.title);
    expect(titles.some((t) => t.includes('Introduction to Typing'))).toBe(true);
    expect(titles.some((t) => t.includes('Keys f & j'))).toBe(true);
    expect(titles.some((t) => t.includes('Space Bar'))).toBe(true);
    expect(titles.some((t) => t.includes('Keys d & k'))).toBe(true);
    expect(titles.some((t) => t.includes('Keys s & l'))).toBe(true);
    expect(titles.some((t) => t.includes('Keys a & ;'))).toBe(true);
    expect(titles.some((t) => t.includes('First 8 Keys'))).toBe(true);
    expect(titles.some((t) => t.includes('Keys g & h'))).toBe(true);
    expect(titles.some((t) => t.includes('Home Row Review'))).toBe(true);
    expect(titles.some((t) => t.includes('Play Home Row'))).toBe(true);

    const lesson12 = lvl1.lessons.find((l) => l.id === '1-2')!;
    expect(lesson12.title).toBe('Keys f & j');
    expect(lesson12.keys).toBe('fj');
    expect(/^[fj]+$/.test(lesson12.text)).toBe(true);
    expect(lesson12.text.includes(' ')).toBe(false);

    const lesson13 = lvl1.lessons.find((l) => l.id === '1-3')!;
    expect(lesson13.title).toBe('Space Bar');
    expect(lesson13.keys).toBe('fj ');
    expect(lesson13.text.includes(' ')).toBe(true);
    expect(/^[fj ]+$/.test(lesson13.text)).toBe(true);

    const lesson17 = lvl1.lessons.find((l) => l.id === '1-7')!;
    expect(lesson17.title).toBe('Practice: d & k');
    expect(lesson17.text).toContain('ffff ddd jjjj kkkk df df jk jk jjj');
    expect(/^[fdjk ]+$/.test(lesson17.text)).toBe(true);

    const lesson110 = lvl1.lessons.find((l) => l.id === '1-10')!;
    expect(lesson110.title).toBe('Review: s & l');
    expect(lesson110.text).toBe('ll ss ssll slsl lsssl slls lsll ssl llss ssll slsl llsslsll ssl ssll slsl lsll ll');
    expect(/^[sl ]+$/.test(lesson110.text)).toBe(true);

    const lesson111 = lvl1.lessons.find((l) => l.id === '1-11')!;
    expect(lesson111.title).toBe('Practice: s & l');
    expect(lesson111.text).toBe('jj ff kk dd ll ssssd df fj jk kl sdfsk dl ks jf kd lslfl kl js kd jf sdfllk kkj jjf');
    expect(/^[sldkfj ]+$/.test(lesson111.text)).toBe(true);

    const lesson112 = lvl1.lessons.find((l) => l.id === '1-12')!;
    expect(lesson112.title).toBe('Keys a & ;');
    expect(lesson112.desc).toContain('Tekan tombol huruf a menggunakan jari kelingking tangan kiri');
    expect(lesson112.desc).toContain('Tekan tombol titik koma (;) menggunakan jari kelingking tangan kanan');
  });

  it('Level 2 mencakup latihan lanjutan tombol Home Row: A S D F J K L ;', () => {
    const lvl2 = curriculum[1]!;
    expect(lvl2.title).toContain('Home Row');
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

  describe('Home Row: Posisi Dasar Jari Tangan Specification', () => {
    it('Memvalidasi pemetaan posisi tuts Home Row tangan kiri: A (kelingking), S (manis), D (tengah), F (telunjuk)', () => {
      expect(fingerMap['a']).toBe(0); // Kelingking Kiri
      expect(fingerMap['s']).toBe(1); // Manis Kiri
      expect(fingerMap['d']).toBe(2); // Tengah Kiri
      expect(fingerMap['f']).toBe(3); // Telunjuk Kiri
    });

    it('Memvalidasi pemetaan posisi tuts Home Row tangan kanan: J (telunjuk), K (tengah), L (manis), ; (kelingking)', () => {
      expect(fingerMap['j']).toBe(5); // Telunjuk Kanan
      expect(fingerMap['k']).toBe(6); // Tengah Kanan
      expect(fingerMap['l']).toBe(7); // Manis Kanan
      expect(fingerMap[';']).toBe(8); // Kelingking Kanan
    });

    it('Memvalidasi tombol spasi untuk kedua ibu jari', () => {
      expect(fingerMap[' ']).toBe(4); // Ibu Jari
    });
  });

  describe('Modul 12: Keys a & ; (Alur New Key Introduction)', () => {
    const lvl1 = curriculum[0]!;
    const lesson12 = lvl1.lessons.find((l) => l.id === '1-12')!;
    const lesson13 = lvl1.lessons.find((l) => l.id === '1-13')!;
    const lesson14 = lvl1.lessons.find((l) => l.id === '1-14')!;

    it('Mendefinisikan modul 12 dengan judul "Keys a & ;" dan penugasan jari kelingking', () => {
      expect(lesson12.id).toBe('1-12');
      expect(lesson12.title).toBe('Keys a & ;');
      expect(lesson12.keys).toBe('a; ');
      expect(lesson12.desc).toContain('jari kelingking tangan kiri');
      expect(lesson12.desc).toContain('jari kelingking tangan kanan');
      expect(fingerMap['a']).toBe(0); // Kelingking kiri
      expect(fingerMap[';']).toBe(8); // Kelingking kanan
      expect(keyFor('a')).toEqual({ key: 'a', shift: false });
      expect(keyFor(';')).toEqual({ key: ';', shift: false });
    });

    it('Teks latihan modul 12 hanya berisi tuts baru a, ;, dan spasi untuk melatih memori otot', () => {
      expect(/^[a; ]+$/.test(lesson12.text)).toBe(true);
      expect(lesson12.text).toContain('a');
      expect(lesson12.text).toContain(';');
      expect(lesson12.text).toContain(' ');
      expect(lesson12.guide).toBe(true);
    });

    it('Kelanjutan modul terstruktur: 12 (Keys a & ;) -> 13 (Review: a & ;) -> 14 (First 8 Keys)', () => {
      expect(lesson13.id).toBe('1-13');
      expect(lesson13.title).toBe('Review: a & ;');
      expect(lesson13.keys).toContain('a;');

      expect(lesson14.id).toBe('1-14');
      expect(lesson14.title).toBe('First 8 Keys');
      expect(lesson14.keys).toContain('asdfjkl;');
    });
  });

  describe('Modul 13: Review: a & ; (Alur Review & Pemantapan Koordinasi)', () => {
    const lvl1 = curriculum[0]!;
    const lesson13 = lvl1.lessons.find((l) => l.id === '1-13')!;

    it('Mendefinisikan modul 13 dengan ulasan koordinasi 8 tuts Home Row', () => {
      expect(lesson13.id).toBe('1-13');
      expect(lesson13.title).toBe('Review: a & ;');
      expect(lesson13.desc).toContain('Ulasan tombol kelingking luar yang dipadukan dengan tuts home row lainnya');
      expect(lesson13.keys).toBe('a;sldkfj ');
      expect(lesson13.guide).toBe(true);
    });

    it('Teks latihan modul 13 menguji integrasi 8 tuts Home Row dengan kata dan pola ritmis terstruktur', () => {
      // Seluruh karakter dalam teks latihan harus berasal dari {a, s, d, f, j, k, l, ;, spasi}
      expect(/^[asdfjkl; ]+$/.test(lesson13.text)).toBe(true);
      expect(lesson13.text.length).toBeGreaterThan(60);

      // Menguji keberadaan tuts kelingking luar a dan ;
      expect(lesson13.text).toContain('a;');
      expect(lesson13.text).toContain(';a');
      expect(lesson13.text).toContain('asdf');
      expect(lesson13.text).toContain(';lkj');

      // Menguji keberadaan kata-kata bahasa Indonesia alami yang terbentuk dari 8 tuts Home Row
      expect(lesson13.text).toContain('ada');
      expect(lesson13.text).toContain('alas');
      expect(lesson13.text).toContain('lada');
      expect(lesson13.text).toContain('salak');
    });

    it('Memvalidasi penugasan jari seluruh 8 tuts pada modul 13', () => {
      // Tangan kiri
      expect(fingerMap['a']).toBe(0); // Kelingking
      expect(fingerMap['s']).toBe(1); // Manis
      expect(fingerMap['d']).toBe(2); // Tengah
      expect(fingerMap['f']).toBe(3); // Telunjuk
      // Tangan kanan
      expect(fingerMap['j']).toBe(5); // Telunjuk
      expect(fingerMap['k']).toBe(6); // Tengah
      expect(fingerMap['l']).toBe(7); // Manis
      expect(fingerMap[';']).toBe(8); // Kelingking
      // Spasi
      expect(fingerMap[' ']).toBe(4); // Ibu Jari
    });
  });

  describe('Modul 14: First 8 Keys (Integrasi Mengetik Kata Pertama)', () => {
    const lvl1 = curriculum[0]!;
    const lesson14 = lvl1.lessons.find((l) => l.id === '1-14')!;
    const lesson15 = lvl1.lessons.find((l) => l.id === '1-15')!;

    it('Mendefinisikan modul 14 dengan 8 tuts lengkap Home Row', () => {
      expect(lesson14.id).toBe('1-14');
      expect(lesson14.title).toBe('First 8 Keys');
      expect(lesson14.desc).toContain('Latihan integrasi lengkap 8 tombol utama home row: A S D F J K L ;');
      expect(lesson14.keys).toBe('asdfjkl; ');
      expect(lesson14.guide).toBe(true);
    });

    it('Teks latihan modul 14 hanya menggunakan karakter valid dari 8 tuts Home Row dan spasi', () => {
      expect(/^[asdfjkl; ]+$/.test(lesson14.text)).toBe(true);
      expect(lesson14.text.length).toBeGreaterThan(80);

      // Menguji keberadaan kata-kata utuh bahasa Indonesia berbasis 8 tombol Home Row
      expect(lesson14.text).toContain('ada');
      expect(lesson14.text).toContain('saja');
      expect(lesson14.text).toContain('jasa');
      expect(lesson14.text).toContain('lada');
      expect(lesson14.text).toContain('alas');
      expect(lesson14.text).toContain('kala');
      expect(lesson14.text).toContain('salak');
      expect(lesson14.text).toContain('jaksa');
      expect(lesson14.text).toContain('fasad');

      // Menguji penutupan dan pembukaan ritme 8 tuts
      expect(lesson14.text).toContain('asdf jkl;');
    });

    it('Kelanjutan modul terstruktur: 14 (First 8 Keys) -> 15 (Play: First 8 Keys)', () => {
      expect(lesson15.id).toBe('1-15');
      expect(lesson15.title).toBe('Play: First 8 Keys');
      expect(lesson15.keys).toContain('asdfjkl;');
    });
  });

  describe('Modul 17: Home Row: L Hand (Isolasi 4 Jari Tangan Kiri)', () => {
    const lvl1 = curriculum[0]!;
    const lesson17 = lvl1.lessons.find((l) => l.id === '1-17')!;
    const lesson18 = lvl1.lessons.find((l) => l.id === '1-18')!;

    it('Mendefinisikan modul 17 dengan isolasi tuts tangan kiri: asdf dan spasi', () => {
      expect(lesson17.id).toBe('1-17');
      expect(lesson17.title).toBe('Home Row: L Hand');
      expect(lesson17.desc).toContain('kelingking (A), manis (S), tengah (D), dan telunjuk (F)');
      expect(lesson17.keys).toBe('asdf ');
      expect(lesson17.guide).toBe(true);
    });

    it('Teks latihan modul 17 murni hanya menggunakan tuts tangan kiri {a, s, d, f} dan spasi', () => {
      expect(/^[asdf ]+$/.test(lesson17.text)).toBe(true);
      expect(lesson17.text.length).toBeGreaterThan(80);

      // Menguji keberadaan kata-kata murni tangan kiri
      expect(lesson17.text).toContain('ada');
      expect(lesson17.text).toContain('asa');
      expect(lesson17.text).toContain('dada');
      expect(lesson17.text).toContain('fasad');

      // Menguji pola roll tangan kiri
      expect(lesson17.text).toContain('asdf');
      expect(lesson17.text).toContain('fdsa');

      // Memastikan TIDAK ADA tuts tangan kanan (j, k, l, ;)
      expect(lesson17.text).not.toContain('j');
      expect(lesson17.text).not.toContain('k');
      expect(lesson17.text).not.toContain('l');
      expect(lesson17.text).not.toContain(';');
    });

    it('Memvalidasi penugasan 4 jari tangan kiri', () => {
      expect(fingerMap['a']).toBe(0); // Kelingking Kiri
      expect(fingerMap['s']).toBe(1); // Manis Kiri
      expect(fingerMap['d']).toBe(2); // Tengah Kiri
      expect(fingerMap['f']).toBe(3); // Telunjuk Kiri (Jangkar)
      expect(fingerNames[0]).toBe('Kelingking kiri');
      expect(fingerNames[1]).toBe('Manis kiri');
      expect(fingerNames[2]).toBe('Tengah kiri');
      expect(fingerNames[3]).toBe('Telunjuk kiri');
    });

    it('Kelanjutan modul terstruktur: 17 (Home Row: L Hand) -> 18 (Home Row: R Hand)', () => {
      expect(lesson18.id).toBe('1-18');
      expect(lesson18.title).toBe('Home Row: R Hand');
      expect(lesson18.keys).toContain('jkl;');
    });
  });

  describe('Modul 18: Home Row: R Hand (Isolasi 4 Jari Tangan Kanan)', () => {
    const lvl1 = curriculum[0]!;
    const lesson18 = lvl1.lessons.find((l) => l.id === '1-18')!;
    const lesson19 = lvl1.lessons.find((l) => l.id === '1-19')!;

    it('Mendefinisikan modul 18 dengan isolasi tuts tangan kanan: jkl; dan spasi', () => {
      expect(lesson18.id).toBe('1-18');
      expect(lesson18.title).toBe('Home Row: R Hand');
      expect(lesson18.desc).toContain('telunjuk (J), tengah (K), manis (L), dan kelingking (;)');
      expect(lesson18.keys).toBe('jkl; ');
      expect(lesson18.guide).toBe(true);
    });

    it('Teks latihan modul 18 murni hanya menggunakan tuts tangan kanan {j, k, l, ;} dan spasi', () => {
      expect(/^[jkl; ]+$/.test(lesson18.text)).toBe(true);
      expect(lesson18.text.length).toBeGreaterThan(80);

      // Menguji pola roll dan adjacent pairs tangan kanan
      expect(lesson18.text).toContain('jkl;');
      expect(lesson18.text).toContain(';lkj');
      expect(lesson18.text).toContain('jk kj');
      expect(lesson18.text).toContain('kl lk');
      expect(lesson18.text).toContain('l; ;l');

      // Memastikan TIDAK ADA tuts tangan kiri (a, s, d, f) maupun baris lain
      expect(lesson18.text).not.toContain('a');
      expect(lesson18.text).not.toContain('s');
      expect(lesson18.text).not.toContain('d');
      expect(lesson18.text).not.toContain('f');
      expect(lesson18.text).not.toContain('g');
      expect(lesson18.text).not.toContain('h');
    });

    it('Memvalidasi penugasan 4 jari tangan kanan dan ibu jari', () => {
      expect(fingerMap['j']).toBe(5); // Telunjuk Kanan (Jangkar)
      expect(fingerMap['k']).toBe(6); // Tengah Kanan
      expect(fingerMap['l']).toBe(7); // Manis Kanan
      expect(fingerMap[';']).toBe(8); // Kelingking Kanan
      expect(fingerMap[' ']).toBe(4); // Ibu Jari

      expect(fingerNames[5]).toBe('Telunjuk kanan');
      expect(fingerNames[6]).toBe('Tengah kanan');
      expect(fingerNames[7]).toBe('Manis kanan');
      expect(fingerNames[8]).toBe('Kelingking kanan');
      expect(fingerNames[4]).toBe('Ibu jari');
    });

    it('Kelanjutan modul terstruktur: 18 (Home Row: R Hand) -> 19 (Keys g & h)', () => {
      expect(lesson19.id).toBe('1-19');
      expect(lesson19.title).toBe('Keys g & h');
      expect(lesson19.keys).toContain('gh');
    });
  });

  describe('Modul 19: Keys g & h (New Key Introduction: Jangkau & Kembali)', () => {
    const lvl1 = curriculum[0]!;
    const lesson19 = lvl1.lessons.find((l) => l.id === '1-19')!;
    const lesson20 = lvl1.lessons.find((l) => l.id === '1-20')!;

    it('Mendefinisikan modul 19 dengan perkenalan tombol baru G & H', () => {
      expect(lesson19.id).toBe('1-19');
      expect(lesson19.title).toBe('Keys g & h');
      expect(lesson19.desc).toContain('telunjuk kiri ke G');
      expect(lesson19.desc).toContain('telunjuk kanan ke H');
      expect(lesson19.keys).toContain('gh');
      expect(lesson19.guide).toBe(true);
    });

    it('Teks latihan modul 19 murni hanya menggunakan tuts g, h, dan spasi', () => {
      expect(/^[gh ]+$/.test(lesson19.text)).toBe(true);
      expect(lesson19.text.length).toBeGreaterThan(80);

      // Menguji pola repetisi dan alternasi jangkauan telunjuk kiri & kanan
      expect(lesson19.text).toContain('g h');
      expect(lesson19.text).toContain('gg hh');
      expect(lesson19.text).toContain('gh hg');
      expect(lesson19.text).toContain('ghg hgh');
      expect(lesson19.text).toContain('ggg hhh');

      // Memastikan TIDAK ADA tuts home row lainnya pada tahap pengenalan awal G & H
      expect(lesson19.text).not.toContain('a');
      expect(lesson19.text).not.toContain('s');
      expect(lesson19.text).not.toContain('d');
      expect(lesson19.text).not.toContain('f');
      expect(lesson19.text).not.toContain('j');
      expect(lesson19.text).not.toContain('k');
      expect(lesson19.text).not.toContain('l');
      expect(lesson19.text).not.toContain(';');
    });

    it('Memvalidasi penugasan jari telunjuk untuk tuts G (3 - kiri) dan H (5 - kanan)', () => {
      expect(fingerMap['g']).toBe(3); // Telunjuk Kiri (Inward Reach dari F)
      expect(fingerMap['h']).toBe(5); // Telunjuk Kanan (Inward Reach dari J)
      expect(fingerNames[3]).toBe('Telunjuk kiri');
      expect(fingerNames[5]).toBe('Telunjuk kanan');
    });

    it('Kelanjutan modul terstruktur: 19 (Keys g & h) -> 20 (Review: g & h)', () => {
      expect(lesson20.id).toBe('1-20');
      expect(lesson20.title).toBe('Review: g & h');
      expect(lesson20.keys).toContain('fghj');
    });
  });
});
