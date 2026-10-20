import type { Lesson, Level, PassCriteria, CriteriaPreset } from '@/types/curriculum';

function drill(chars: string, len = 60, seed = 1): string {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const words: string[] = [];
  let total = 0;
  while (total < len) {
    const n = 2 + Math.floor(rnd() * 4);
    let w = '';
    for (let i = 0; i < n; i++) w += chars[Math.floor(rnd() * chars.length)];
    words.push(w);
    total += w.length + 1;
  }
  return words.join(' ');
}

export const paragraphPool = [
  'Mengetik dengan sepuluh jari adalah keterampilan dasar di era digital. Dengan latihan rutin, jari akan hafal posisi setiap tombol tanpa perlu melihat keyboard.',
  'Pagi itu kota Bandung diselimuti kabut tipis. Para pedagang mulai membuka kios, sementara anak-anak berjalan menuju sekolah sambil bercanda.',
  'Rapat tim dimulai pukul sembilan. Setiap anggota menyampaikan laporan singkat, kendala yang dihadapi, dan rencana kerja untuk minggu berikutnya.',
  'Kopi tubruk, teh manis, dan pisang goreng adalah teman setia saat hujan turun. Sederhana, murah, namun selalu menghangatkan suasana.',
  'Akurasi lebih penting daripada kecepatan. Ketika jari sudah terbiasa menekan tombol yang benar, kecepatan akan meningkat dengan sendirinya.',
  'Laporan keuangan kuartal ketiga tahun 2026 menunjukkan peningkatan laba bersih sebesar 18.5%, melampaui target awal sebesar Rp450.000.000.',
];

const LONG_TEXT = Array.from({ length: 6 }, () => paragraphPool).flat().join(' ');

export const curriculum: Level[] = [
  {
    level: 1,
    title: 'Pengenalan Keyboard',
    desc: 'Mengenal QWERTY, postur tubuh, fungsi 10 jari, penanda F & J, serta jangkar home row.',
    lessons: [
      {
        id: '1-1',
        title: 'Mengenal Keyboard QWERTY',
        desc: 'Susunan standar QWERTY terbagi dalam 4 baris utama. Mulai rasakan ritme menekan tuts keyboard.',
        keys: 'fj ',
        text: 'f j f j ff jj f j fj jf f j ff jj fj fj f j',
        guide: true,
      },
      {
        id: '1-2',
        title: 'Posisi Duduk & Pergelangan Tangan',
        desc: 'Punggung tegak 90°, bahu rileks, dan pergelangan tangan melayang santai tanpa menumpu pada meja.',
        keys: 'fj ',
        text: 'fff jjj fj fj jf jf ffj jjf fjf jfj fj jf fff jjj',
        guide: true,
      },
      {
        id: '1-3',
        title: 'Mengenal Fungsi Setiap Jari',
        desc: 'Setiap jari memiliki wilayah tugas tertentu. Latih kedua telunjuk, jari tengah, manis, kelingking, dan ibu jari.',
        keys: 'asdfjkl; ',
        text: 'a s d f j k l ; as df jk l; asdf jkl; fdsa ;lkj',
        guide: true,
      },
      {
        id: '1-4',
        title: 'Tombol Pemandu F dan J',
        desc: 'Raba garis tonjolan kecil pada tombol F (telunjuk kiri) dan J (telunjuk kanan) sebagai jangkar posisi awal.',
        keys: 'fj',
        text: 'f j ff jj fff jjj fjf jfj ffjj jjff f j f j ff jj fj jf',
        guide: true,
      },
      {
        id: '1-5',
        title: 'Latihan Menempatkan Jari Home Row',
        desc: 'Tempatkan kelingking-hingga-telunjuk kiri pada A-S-D-F dan kanan pada J-K-L-;, ibu jari pada Spasi.',
        keys: 'asdfjkl; ',
        text: 'asdf jkl; asdf jkl; a s d f j k l ; a s d f j k l ; asdf jkl;',
        guide: true,
      },
      {
        id: '1-6',
        title: 'Jangkar Home Row & Ibu Jari',
        desc: 'Tekan tombol lalu biasakan jari selalu kembali berlabuh di posisi home row tanpa melihat layar keyboard.',
        keys: 'asdfjkl; ',
        text: 'f j asdf jkl; fj fj as df jk l; f j f j asdf jkl; fj jf asdf jkl;',
        guide: true,
      },
    ],
  },
  {
    level: 2,
    title: 'Home Row',
    desc: 'A S D F J K L ; — fondasi utama dari seluruh gerakan jari tangan kiri dan kanan.',
    lessons: [
      {
        id: '2-1',
        title: 'Tangan Kiri: A S D F',
        desc: 'Kelingking A, manis S, tengah D, telunjuk F.',
        keys: 'asdf',
        text: 'aaa sss ddd fff asdf fdsa asdf fdsa as df sa fd asd fds sdf dsa asdf',
        guide: true,
      },
      {
        id: '2-2',
        title: 'Tangan Kanan: J K L ;',
        desc: 'Telunjuk J, tengah K, manis L, kelingking ;.',
        keys: 'jkl;',
        text: 'jjj kkk lll ;;; jkl; ;lkj jkl; ;lkj jk l; kj ;l jkl ;lk kl; lkj jkl;',
        guide: true,
      },
      {
        id: '2-3',
        title: 'Pasangan Simetris Kiri-Kanan',
        desc: 'Jari yang sama di kedua tangan bergantian: kelingking (A-;), manis (S-L), tengah (D-K), telunjuk (F-J).',
        keys: 'asdfjkl;',
        text: 'fj dk sl a; fj dk sl a; jf kd ls ;a fjfj dkdk slsl a;a; fdjk sal; dk fj',
        guide: true,
      },
      {
        id: '2-4',
        title: 'Kombinasi Pola Bertahap',
        desc: 'Latihan pengulangan pola acak tuts home row dari ritme lambat hingga cepat.',
        keys: 'asdfjkl;',
        text: drill('asdfjkl;', 75, 41),
        guide: true,
      },
      {
        id: '2-5',
        title: 'Kata Home Row Bahasa Indonesia',
        desc: 'Kata nyata Bahasa Indonesia yang hanya memakai deretan tombol home row.',
        keys: 'asdfjkl;',
        text: 'ada saja lada kala jaksa salak alas jalak fasad sad ada lada saja jaksa salak alas fasad',
        guide: true,
      },
      {
        id: '2-6',
        title: 'Uji Kelulusan Home Row',
        desc: 'Pola kalimat panjang campuran home row — jaga ritme dan akurasi di atas standar kelulusan.',
        keys: 'asdfjkl;',
        text: 'ada jaksa salak alas. lada saja ada kala jalak salak fasad. alas lada saja ada jaksa kala alas lada salak.',
        guide: true,
      },
    ],
  },
  {
    level: 3,
    title: 'Top Row',
    desc: 'Q W E R T Y U I O P — jangkau tuts atas, lalu segera kembalikan jari ke home row.',
    lessons: [
      { id: '3-1', title: 'E dan I', desc: 'Jari tengah naik dari D dan K, lalu kembali ke posisi jangkar.', keys: 'ei', text: 'ded kik ded kik dei kie die eid ide kei dek kid lei sei fie jie ide dei' },
      { id: '3-2', title: 'R dan U', desc: 'Telunjuk naik dari F dan J, lalu kembali.', keys: 'ru', text: 'frf juj frf juj fur ruj suru ruas sura rusa ular duri ruas sura fur' },
      { id: '3-3', title: 'T dan Y', desc: 'Telunjuk naik serong ke arah tengah.', keys: 'ty', text: 'ftf jyj ftf jyj tay yat tas yas saya taya tali satu tiap yuk ayat tas' },
      { id: '3-4', title: 'W dan O', desc: 'Jari manis naik dari S dan L.', keys: 'wo', text: 'sws lol sws lol wol low sow ola wajo ole kota soto dos tolak awas' },
      { id: '3-5', title: 'Q dan P', desc: 'Kelingking naik dari A dan ;.', keys: 'qp', text: 'aqa ;p; aqa ;p; qap paq apa pak pas papa sapi pada lapis pita aqua' },
      { id: '3-6', title: 'Kombinasi Top Row', desc: 'Seluruh tuts baris atas digabungkan dengan home row.', keys: 'qwertyuiop', text: drill('qwertyuiopasdfghjkl', 80, 53) },
      { id: '3-7', title: 'Kata Top + Home Row', desc: 'Kosakata Bahasa Indonesia yang menggabungkan baris atas dan baris beranda.', keys: '', text: 'saya suka pagi apa kita tulis dia rapi sopir kertas diskusi pesta resep foto topi sepatu roti kopi air tiga hari pulau desa' },
      { id: '3-8', title: 'Uji Top Row', desc: 'Kalimat pendek menggabungkan baris atas dan home row secara luwes.', keys: '', text: 'saya suka kopi pagi hari di desa. dia pergi ke pesta pakai sepatu putih. kita tulis resep roti di kertas' },
    ],
  },
  {
    level: 4,
    title: 'Bottom Row',
    desc: 'Z X C V B N M , . / — turunkan jari menekan tuts, lalu biasakan segera kembali ke home row.',
    lessons: [
      { id: '4-1', title: 'V dan M', desc: 'Telunjuk turun dari F dan J, lalu segera kembali ke posisi home row.', keys: 'vm', text: 'fvf jmj fvf jmj vm mv fvj jmf mama sama maka lima vila diam malam' },
      { id: '4-2', title: 'B dan N', desc: 'Telunjuk turun serong ke bagian tengah bawah.', keys: 'bn', text: 'fbf jnj fbf jnj bn nb ban bin dan ini bisa nanti baju bunga banyak' },
      { id: '4-3', title: 'C dan Koma', desc: 'Jari tengah turun dari D dan K, lalu kembali ke jangkar.', keys: 'c,', text: 'dcd k,k dcd k,k cara, cari, cuka, kaca, cuci, cocok, cepat, cinta,' },
      { id: '4-4', title: 'X dan Titik', desc: 'Jari manis turun dari S dan L, lalu kembali ke jangkar.', keys: 'x.', text: 'sxs l.l sxs l.l taksi. extra. luxs. ok. selesai. sudah. x. lalu.' },
      { id: '4-5', title: 'Z dan Garis Miring', desc: 'Kelingking turun dari A dan ;.', keys: 'z/', text: 'aza ;/; aza ;/; zaman / zat / azan / izin / zona / ziarah / jazz' },
      { id: '4-6', title: 'Kombinasi Bottom Row', desc: 'Latihan transisi baris bawah yang dipadukan dengan baris beranda.', keys: 'zxcvbnm,./', text: drill('zxcvbnm,.asdfjkl', 85, 61) },
      { id: '4-7', title: 'Gerakan Kembali ke Home Row', desc: 'Gerakkan jari menekan tuts bawah dan biasakan selalu menariknya kembali ke home row.', keys: '', text: 'nama saya budi. ibu masak cumi, sambal, dan nasi. zaman berubah cepat, kita juga terus belajar.' },
    ],
  },
  {
    level: 5,
    title: 'Kombinasi Seluruh Huruf',
    desc: 'Alfabet lengkap, pola suku kata, kata harian, kalimat, dan latihan tanpa melihat keyboard.',
    lessons: [
      { id: '5-1', title: 'Latihan Alfabet Lengkap', desc: 'Mengetik huruf A sampai Z secara teratur, urut maju dan mundur.', keys: '', text: 'abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba abcdefghijklmnopqrstuvwxyz' },
      { id: '5-2', title: 'Kombinasi Huruf Sering Digunakan', desc: 'Pola suku kata umum dalam Bahasa Indonesia (ng, ny, an, en, ter, ber, dll).', keys: '', text: 'ng ny an en in ang eng ing kan nya ter ber per men mem pen ke se di yang dan untuk dengan' },
      { id: '5-3', title: 'Kata Sederhana Bahasa Indonesia', desc: 'Kosakata praktis yang digunakan dalam percakapan sehari-hari.', keys: '', text: 'rumah makan buku jalan sekolah teman kerja pasar hujan pantai gunung kereta sepeda jendela' },
      { id: '5-4', title: 'Kalimat Pendek', desc: 'Kalimat lengkap sederhana untuk melatih ritme dan kestabilan.', keys: '', text: 'ayah pergi ke kantor naik kereta. adik membaca buku cerita di kamar. kami makan malam bersama.' },
      { id: '5-5', title: 'Latihan Tanpa Melihat Keyboard', desc: 'Keyboard di layar disembunyikan. Percaya sepenuhnya pada memori otot jari Anda.', keys: '', text: 'hari ini cuaca cerah dan langit biru. saya berjalan ke taman sambil mendengarkan musik santai.', blind: true },
    ],
  },
  {
    level: 6,
    title: 'Huruf Kapital dan Tanda Baca',
    desc: 'Shift kiri dan kanan, huruf kapital, titik, koma, tanya, Enter, dan koreksi Backspace.',
    lessons: [
      { id: '6-1', title: 'Tombol Shift Kiri', desc: 'Kelingking kiri menekan Shift saat jari tangan kanan mengetik huruf kapital.', keys: '', text: 'Jakarta Kamis Lina Maya Nina Putri Hari Yogya Ubud Ika Lombok Medan Jambi Palembang' },
      { id: '6-2', title: 'Tombol Shift Kanan', desc: 'Kelingking kanan menekan Shift saat jari tangan kiri mengetik huruf kapital.', keys: '', text: 'Andi Budi Citra Dewi Eko Fajar Gita Rina Sari Tono Vina Wati Bali Bandung Surabaya' },
      { id: '6-3', title: 'Huruf Kapital dalam Kalimat', desc: 'Penggunaan kapital di awal kalimat, nama kota, dan nama orang.', keys: '', text: 'Rina tinggal di Bogor. Setiap hari Senin dia naik KRL ke Jakarta bersama Budi dan Citra.' },
      { id: '6-4', title: 'Titik, Koma, dan Tanda Tanya', desc: 'Kombinasi tanda baca dasar dan tanda tanya (Shift + /).', keys: ',.?', text: 'Apa kabar? Baik, terima kasih. Kamu dari mana? Dari Bandung. Sudah makan siang? Belum, nanti saja.' },
      { id: '6-5', title: 'Tanda Baca Lainnya', desc: 'Tanda seru (!), titik dua (:), titik koma (;), petik ("), kurung (), dan tanda minus (-).', keys: '!:;"\'()-', text: 'Perhatian! Catatan penting: bawa air minum; jangan lupa. Dia berkata, "Ayo!" (cepat) - itu kata Ani.' },
      { id: '6-6', title: 'Penggunaan Tombol Enter', desc: 'Tekan Enter dengan kelingking kanan untuk berpindah ke baris baru.', keys: '', text: 'Daftar belanja hari ini:\nberas pandan wangi\ntelur ayam negeri\nminyak goreng\ngula pasir\nselesai.' },
      { id: '6-7', title: 'Penggunaan Tombol Backspace', desc: 'Mode koreksi ketat: jika terjadi salah ketik, wajib dihapus dengan Backspace sebelum lanjut.', keys: '', text: 'Kesalahan kecil saat mengetik itu wajar. Segera hapus, perbaiki, lalu lanjutkan dengan tenang.', correction: true },
    ],
  },
  {
    level: 7,
    title: 'Kata dan Kalimat',
    desc: 'Materi Bahasa Indonesia komprehensif: kata harian, paragraf deskriptif, narasi, dan teks profesional.',
    lessons: [
      { id: '7-1', title: 'Kata Sehari-hari', desc: 'Kosakata umum, salam, dan frasa sopan santun.', keys: '', text: 'terima kasih banyak, selamat pagi, sampai jumpa kembali, tolong bantu, mohon maaf, silakan masuk, permisi, tetap semangat, hati-hati di jalan' },
      { id: '7-2', title: 'Paragraf Pendek Deskriptif', desc: 'Paragraf utuh untuk melatih napas ritme pengetikan yang stabil.', keys: '', text: 'Mengetik dengan sepuluh jari adalah keterampilan dasar di era digital. Dengan latihan rutin, jari akan hafal posisi setiap tombol tanpa perlu melihat keyboard.' },
      { id: '7-3', title: 'Teks Cerita & Narasi', desc: 'Deskripsi cerita suasana pagi yang menghangatkan hati.', keys: '', text: 'Pagi itu kota Bandung diselimuti kabut tipis. Para pedagang mulai membuka kios di pasar, sementara anak-anak berjalan riang menuju sekolah sambil bercanda.' },
      { id: '7-4', title: 'Teks Profesional Perkantoran', desc: 'Format korespondensi email resmi dunia kerja dan perkantoran modern.', keys: '', text: 'Yth. Bapak Andi Gunawan,\nBersama email ini saya lampirkan laporan kemajuan proyek kuartal ketiga. Mohon arahan Bapak apabila ada bagian yang perlu disesuaikan kembali. Terima kasih atas perhatian dan kerja samanya.\nHormat kami, Rina Melati' },
    ],
  },
  {
    level: 8,
    title: 'Angka dan Simbol',
    desc: 'Baris angka, simbol umum, kombinasi Shift, serta angka & simbol relevan untuk dunia kerja.',
    lessons: [
      { id: '8-1', title: 'Baris Angka 1 sampai 5', desc: 'Jangkauan jari tangan kiri naik dua baris dari posisi home row.', keys: '12345', text: '1 2 3 4 5 12 34 45 123 345 21 43 54 15 24 135 2345 54321 12345' },
      { id: '8-2', title: 'Baris Angka 6 sampai 0', desc: 'Jangkauan jari tangan kanan naik dua baris dari posisi home row.', keys: '67890', text: '6 7 8 9 0 67 89 90 678 890 76 98 09 60 79 680 7890 09876 67890' },
      { id: '8-3', title: 'Simbol Umum & Shift', desc: 'Simbol umum pada baris angka menggunakan kombinasi Shift (@, #, $, %, &, *, !, +).', keys: '!@#$%&*', text: '@user #promo diskon 50% paket A&B 2*3=6 harga $10 hemat 25%! email: info@kantor.id' },
      { id: '8-4', title: 'Angka & Simbol Relevan Pekerjaan', desc: 'Format harga Rupiah, tanggal, nomor invoice, telepon kantor, dan persentase laporan.', keys: '', text: 'Total tagihan Rp1.750.000; jatuh tempo 17/08/2026; kontak: (021) 555-0199; No. Faktur #INV-2026/08; target pertumbuhan +18.5% tercapai.' },
    ],
  },
  {
    level: 9,
    title: 'Latihan Kecepatan',
    desc: 'Tes waktu 1, 3, dan 5 menit, latihan akurasi, kecepatan tempo tinggi, dan kombinasi kata & kalimat.',
    lessons: [
      { id: '9-1', title: 'Tes Mengetik 1 Menit', desc: 'Uji kecepatan kilat: ketik teks sebanyak dan setepat mungkin dalam 60 detik.', keys: '', text: LONG_TEXT, timeLimit: 60 },
      { id: '9-2', title: 'Tes Mengetik 3 Menit', desc: 'Uji daya tahan menengah: pertahankan tempo dan akurasi stabil selama 180 detik.', keys: '', text: LONG_TEXT, timeLimit: 180 },
      { id: '9-3', title: 'Tes Mengetik 5 Menit', desc: 'Uji ketahanan stamina: latihan maraton penuh 300 detik menguji konsistensi konsentrasi.', keys: '', text: LONG_TEXT, timeLimit: 300 },
      { id: '9-4', title: 'Latihan Akurasi Ketat', desc: 'Fokus ketepatan 100%: setiap kesalahan wajib segera dihapus dengan Backspace.', keys: '', text: 'Akurasi lebih penting daripada kecepatan. Ketika jari sudah terbiasa menekan tombol yang benar, kecepatan akan meningkat dengan sendirinya secara konsisten.', correction: true },
      { id: '9-5', title: 'Latihan Kecepatan (Tempo Tinggi)', desc: 'Kata-kata pendek frekuensi tinggi dalam Bahasa Indonesia untuk mendorong batas WPM Anda.', keys: '', text: 'yang dan di ke itu ini ada dari untuk dengan tidak akan bisa saya kita juga sudah lebih mereka hanya sangat saat bisa jadi lalu oleh' },
      { id: '9-6', title: 'Kombinasi Kata dan Kalimat', desc: 'Kombinasi lengkap kata, angka, dan tanda baca dengan perubahan ritme dinamis.', keys: '', text: 'Rapat tim dimulai pukul sembilan. Setiap anggota menyampaikan laporan singkat, kendala yang dihadapi, dan rencana kerja minggu depan. Target kuartal ini naik 15%, jadi semua anggota harus siap!' },
    ],
  },
  {
    level: 10,
    title: 'Master Touch Typing',
    desc: 'Ujian akhir komprehensif yang menguji seluruh kemampuan 10 jari dari Level 1 hingga 9.',
    lessons: [
      {
        id: '10-1',
        title: 'Ujian Akhir 1: Integrasi Seluruh Kemampuan',
        desc: 'Ujian komprehensif menggabungkan huruf, angka, simbol kerja, kapital, tanda baca, dan email tanpa petunjuk visual.',
        keys: '',
        text: 'Pada tanggal 17 Agustus 2026, Rina mengirim email ke tim@kantor.co.id: "Rapat anggaran dipindah ke pukul 10.30 WIB di ruang B-2; mohon bawa salinan laporan Rp25.000.000 (diskon 10%)." Semua anggota siap? Tentu saja siap!',
        blind: true,
      },
      {
        id: '10-2',
        title: 'Ujian Akhir 2: Daya Tahan 3 Menit',
        desc: 'Uji stamina mengetik tanpa bantuan visual keyboard selama 3 menit penuh.',
        keys: '',
        text: LONG_TEXT,
        timeLimit: 180,
        blind: true,
      },
      {
        id: '10-3',
        title: 'Ujian Akhir 3: Master Touch Typing 5 Menit',
        desc: 'Ujian pamungkas 5 menit tanpa petunjuk. Capai akurasi dan kecepatan master untuk membuktikan kemahiran 10 jari Anda.',
        keys: '',
        text: LONG_TEXT,
        timeLimit: 300,
        blind: true,
      },
    ],
  },
];

export const allLessons: Lesson[] = curriculum.flatMap((l) => l.lessons);

export const testTexts = [
  'Teknologi berkembang sangat cepat. Orang yang mampu mengetik dengan baik akan lebih produktif dalam bekerja, belajar, dan berkomunikasi setiap hari.',
  'Indonesia adalah negara kepulauan terbesar di dunia dengan ribuan pulau, ratusan bahasa daerah, dan budaya yang sangat beragam dari Sabang sampai Merauke.',
  'Latihan yang konsisten setiap hari selama lima belas menit jauh lebih efektif daripada latihan panjang yang hanya dilakukan sekali dalam seminggu.',
  'Keterampilan mengetik tanpa melihat keyboard menghemat waktu berharga dan membantu pikiran tetap fokus pada ide yang sedang dituangkan.',
];

// Finger index: 0 L-pinky, 1 L-ring, 2 L-middle, 3 L-index, 4 thumb, 5 R-index, 6 R-middle, 7 R-ring, 8 R-pinky
export const fingerMap: Record<string, number> = {};
const assign = (keys: string, f: number) => keys.split('').forEach((k) => (fingerMap[k] = f));
assign('`1qaz', 0);
assign('2wsx', 1);
assign('3edc', 2);
assign('45rtfgvb', 3);
assign('67yuhjnm', 5);
assign('8ik,', 6);
assign('9ol.', 7);
assign('0-=p[]\\;\'/', 8);
fingerMap[' '] = 4;
fingerMap['\n'] = 8;
fingerMap['Backspace'] = 8;

export const fingerNames = [
  'Kelingking kiri',
  'Manis kiri',
  'Tengah kiri',
  'Telunjuk kiri',
  'Ibu jari',
  'Telunjuk kanan',
  'Tengah kanan',
  'Manis kanan',
  'Kelingking kanan',
];

/** Standar default kriteria kelulusan */
export const defaultPassCriteria: Record<number, PassCriteria> = {
  1: { minAccuracy: 90, minWpm: 0 },
  2: { minAccuracy: 90, minWpm: 5 },
  3: { minAccuracy: 90, minWpm: 8 },
  4: { minAccuracy: 90, minWpm: 10 },
  5: { minAccuracy: 90, minWpm: 12 },
  6: { minAccuracy: 90, minWpm: 12 },
  7: { minAccuracy: 92, minWpm: 15 },
  8: { minAccuracy: 90, minWpm: 12 },
  9: { minAccuracy: 92, minWpm: 20 },
  10: { minAccuracy: 95, minWpm: 25 },
};

/** Presets untuk kriteria kelulusan yang dapat dipilih pengguna */
export const criteriaPresets: Record<Exclude<CriteriaPreset, 'kustom'>, Record<number, PassCriteria>> = {
  santai: {
    1: { minAccuracy: 80, minWpm: 0 },
    2: { minAccuracy: 80, minWpm: 0 },
    3: { minAccuracy: 80, minWpm: 5 },
    4: { minAccuracy: 80, minWpm: 5 },
    5: { minAccuracy: 82, minWpm: 8 },
    6: { minAccuracy: 82, minWpm: 8 },
    7: { minAccuracy: 85, minWpm: 10 },
    8: { minAccuracy: 82, minWpm: 8 },
    9: { minAccuracy: 85, minWpm: 12 },
    10: { minAccuracy: 88, minWpm: 15 },
  },
  standar: defaultPassCriteria,
  ketat: {
    1: { minAccuracy: 95, minWpm: 0 },
    2: { minAccuracy: 95, minWpm: 10 },
    3: { minAccuracy: 95, minWpm: 15 },
    4: { minAccuracy: 95, minWpm: 18 },
    5: { minAccuracy: 95, minWpm: 20 },
    6: { minAccuracy: 95, minWpm: 22 },
    7: { minAccuracy: 96, minWpm: 25 },
    8: { minAccuracy: 95, minWpm: 22 },
    9: { minAccuracy: 96, minWpm: 32 },
    10: { minAccuracy: 98, minWpm: 40 },
  },
};

/** passCriteria default diekspor untuk kompatibilitas mundur */
export const passCriteria = defaultPassCriteria;

export const homeKeys = ['a', 's', 'd', 'f', ' ', 'j', 'k', 'l', ';'];

const shiftMap: Record<string, string> = {
  '!': '1', '@': '2', '#': '3', $: '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
  _: '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': '\'', '<': ',', '>': '.', '?': '/', '~': '`',
};

export function keyFor(ch: string): { key: string; shift: boolean } {
  if (ch === 'Backspace') return { key: 'Backspace', shift: false };
  if (ch === '\n') return { key: '\n', shift: false };
  if (shiftMap[ch]) return { key: shiftMap[ch], shift: true };
  const low = ch.toLowerCase();
  return { key: low, shift: low !== ch };
}

export function levelOf(lessonId: string): number {
  return Number(lessonId.split('-')[0]) || 1;
}
