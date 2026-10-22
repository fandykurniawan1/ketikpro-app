import React, { useState } from 'react';
import {
  Keyboard,
  Armchair,
  Hand,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  BookmarkCheck,
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
  title: string;
  description: string;
  bulletPoints: string[];
  highlight: string;
}

const levelOneTabs: TabItem[] = [
  {
    id: 'qwerty',
    label: '1. Mengenal QWERTY',
    icon: Keyboard,
    title: 'Tata Letak Standar Keyboard QWERTY',
    description:
      'Keyboard QWERTY adalah standar susunan tombol paling populer di dunia. Susunan ini dirancang untuk mendistribusikan ketikan secara seimbang antara tangan kiri dan tangan kanan.',
    bulletPoints: [
      'Baris Angka (Number Row): Deretan angka 1 sampai 0 serta simbol kombinasi Shift.',
      'Baris Atas (Top Row): Tombol Q W E R T Y U I O P yang dijangkau ke atas.',
      'Baris Beranda (Home Row): Tombol A S D F J K L ; yang menjadi rumah dan jangkar 10 jari.',
      'Baris Bawah (Bottom Row): Tombol Z X C V B N M , . / yang dijangkau ke bawah.',
    ],
    highlight: 'Kunci utama: Ingat posisi setiap tuts relatif dari posisi jangkar Home Row.',
  },
  {
    id: 'posture',
    label: '2. Postur & Pergelangan',
    icon: Armchair,
    title: 'Posisi Duduk, Tangan, dan Pergelangan Tangan',
    description:
      'Ergonomi yang tepat mencegah cedera saraf carpal tunnel, pegal di leher, serta kelelahan otot saat mengetik berjam-jam.',
    bulletPoints: [
      'Posisi Duduk: Duduk tegak dengan punggung bersandar nyaman, bahu rileks turun tanpa tegang.',
      'Ketinggian Kursi & Kaki: Telapak kaki menapak rata di lantai atau di atas pijakan kaki (footrest).',
      'Pergelangan Tangan Melayang: Jaga pergelangan tangan lurus melayang sejajar keyboard, jangan menumpu keras pada tepi meja.',
      'Jarak & Sudut Layar: Bagian atas monitor sejajar dengan tinggi mata, berjarak sekitar 50–70 cm.',
    ],
    highlight: 'Tips emas: Bayangkan tangan Anda seperti pemain piano yang melengkung lentur dan rileks di atas tuts.',
  },
  {
    id: 'fingers',
    label: '3. Fungsi 10 Jari',
    icon: Hand,
    title: 'Fungsi & Wilayah Tugas Setiap Jari',
    description:
      'Metode touch typing menugaskan tuts tertentu ke jari tertentu sehingga Anda tidak perlu mengetik dengan 2 jari telunjuk ("patuk ayam").',
    bulletPoints: [
      'Kelingking Kiri & Kanan: Tombol tepi luar (A, Q, Z, Shift kiri / ;, P, /, Enter, Shift kanan).',
      'Jari Manis Kiri & Kanan: Tombol kolom kedua (S, W, X / L, O, .).',
      'Jari Tengah Kiri & Kanan: Tombol kolom ketiga (D, E, C / K, I, ,).',
      'Telunjuk Kiri & Kanan: Menangani 2 kolom tengah (F, R, V, G, T, B / J, U, M, H, Y, N).',
      'Ibu Jari (Kedua Tangan): Bertugas khusus dan eksklusif menekan tombol Spasi.',
    ],
    highlight: 'Gunakan warna panduan pada tuts keyboard asailmu untuk mengingat jari pemiliknya.',
  },
  {
    id: 'tactile',
    label: '4. Tonjolan Taktil F & J',
    icon: Sparkles,
    title: 'Mengenal Tombol F dan J Sebagai Penanda Posisi Awal',
    description:
      'Di keyboard fisik Anda, tombol huruf F dan J memiliki garis tonjolan kecil timbul yang dapat dirasakan oleh ujung jari.',
    bulletPoints: [
      'Penanda Taktil: Dirancang khusus agar Anda bisa menemukan kembali posisi awal tanpa melirik keyboard sedikit pun.',
      'Telunjuk Kiri di Tombol F: Begitu telunjuk kiri merasakan tonjolan F, ketiga jari lainnya otomatis mendarat di D, S, dan A.',
      'Telunjuk Kanan di Tombol J: Begitu telunjuk kanan merasakan tonjolan J, jari lainnya mendarat di K, L, dan ;.',
      'Refleks Alami: Setiap kali selesai mengetik tombol di baris lain atau saat tangan terangkat, langsung raba tonjolan ini.',
    ],
    highlight: 'Coba raba keyboard Anda sekarang: rasakan garis tonjolan kecil di tombol F dan J!',
  },
  {
    id: 'placement',
    label: '5. Latihan Jangkar Home Row',
    icon: BookmarkCheck,
    title: 'Latihan Menempatkan Jari pada Home Row',
    description:
      'Home row (Baris Beranda) adalah posisi dasar awal dan akhir dari seluruh pengetikan 10 jari.',
    bulletPoints: [
      'Tangan Kiri: Kelingking di [A], Manis di [S], Tengah di [D], Telunjuk di [F].',
      'Tangan Kanan: Telunjuk di [J], Tengah di [K], Manis di [L], Kelingking di [;].',
      'Kedua Ibu Jari: Mengambang santai di atas bilah tombol [Spasi].',
      'Aturan Emas: Jari boleh menjangkau ke baris atas atau bawah, namun harus SEGERA ditarik kembali ke home row.',
    ],
    highlight: 'Mulai latihan Level 1 di bawah ini untuk melatih memori otot posisi jangkar secara bertahap!',
  },
];

export const LevelOneGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('qwerty');
  const currentItem = levelOneTabs.find((t) => t.id === activeTab) ?? levelOneTabs[0]!;

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-5 sm:p-6 shadow-card space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Sparkles className="h-3 w-3" />
            Panduan Lengkap Level 1
          </span>
          <h3 className="text-xl font-extrabold text-foreground mt-1">
            Fondasi Pengenalan Keyboard & Ergonomi
          </h3>
        </div>
        <p className="text-xs text-muted-foreground sm:text-right max-w-xs">
          Pelajari 5 fondasi utama sebelum memulai latihan pelajaran Level 1.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {levelOneTabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="rounded-xl border border-border/70 bg-muted/20 p-5 space-y-4 animate-in fade-in duration-200">
        <div>
          <h4 className="text-base font-bold text-foreground flex items-center gap-2">
            <currentItem.icon className="h-4 w-4 text-primary" />
            {currentItem.title}
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
            {currentItem.description}
          </p>
        </div>

        <ul className="space-y-2 pt-1">
          {currentItem.bulletPoints.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs font-medium text-primary flex items-center gap-2">
          <ChevronRight className="h-4 w-4 shrink-0" />
          <span>{currentItem.highlight}</span>
        </div>
      </div>
    </div>
  );
};
