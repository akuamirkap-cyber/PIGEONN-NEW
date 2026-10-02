import type { AssetId } from './types';

export interface AssetInfo {
  number: string;
  name: string;
  japanese: string;
  subtitle: string;
  description: string;
  accent: string;
  file: string;
  category: 'Tradisional' | 'Perkotaan' | 'Toko' | 'Karakter' | 'Kendaraan' | 'Hewan' | 'Rumah';
  isNew?: boolean;
}

export const ASSET_IDS: AssetId[] = [
  'characters', 'vehicles', 'animals',
  'skyscraper', 'tokyotower', 'pagoda', 'konbini', 'ramen', 'sakura', 'shibuya109',
  'qfront', 'station', 'neon', 'torii', 'izakaya', 'crossing', 'machiya', 'townhouse',
];

export const ASSET_INFO: Record<AssetId, AssetInfo> = {
  machiya: {
    number: '17', name: 'Machiya House', japanese: '\u753a\u5c4b',
    subtitle: 'Rumah kayu kecil dengan cerita panjang.',
    description: 'Rumah Jepang dua lantai, rangka kayu, jendela kisi, dan atap genteng voxel. Proporsinya lebih rendah dan kecil daripada gedung kota.',
    accent: '#ae8452', file: 'shibuya-blocks-machiya-house', category: 'Rumah', isNew: true,
  },
  townhouse: {
    number: '18', name: 'Tokyo Townhouse', japanese: '\u6771\u4eac\u306e\u4f4f\u5b85',
    subtitle: 'Rumah mungil, sudut kota yang hangat.',
    description: 'Rumah dua lantai dengan balkon, pagar, kotak surat, dan atap miring. Aset hunian yang menghubungkan toko kecil dengan skyline kota.',
    accent: '#899a72', file: 'shibuya-blocks-tokyo-townhouse', category: 'Rumah', isNew: true,
  },
  characters: {
    number: '14', name: 'Japan Character Pack', japanese: '\u65e5\u672c\u306e\u4eba\u3005',
    subtitle: 'Sepuluh karakter. Sepuluh langkah berbeda.',
    description: '10 karakter Jepang dijajarkan, dari Yakuza fiksi sampai koki ramen. Pilih gaya jalan atau pose khas, lalu lihat dan unduh satu karakter secara terpisah.',
    accent: '#aa7947', file: 'shibuya-blocks-japan-characters', category: 'Karakter', isNew: true,
  },
  vehicles: {
    number: '15', name: 'Japan Vehicle Pack', japanese: '\u65e5\u672c\u306e\u4e57\u308a\u7269',
    subtitle: 'Dari Cub kecil sampai bus kota.',
    description: '8 tipe motor dengan rider dan 6 mobil khas Jepang. Cub, custom, sport, delivery, retro, cafe racer, trail, dan Shirobai tersedia sebagai aset terpisah.',
    accent: '#477f83', file: 'shibuya-blocks-japan-vehicles', category: 'Kendaraan', isNew: true,
  },
  animals: {
    number: '16', name: 'Little Japan Friends', japanese: '\u5c0f\u3055\u306a\u4ef2\u9593\u305f\u3061',
    subtitle: 'Sedikit kejutan di setiap blok.',
    description: '8 hewan dan maskot: Shiba, tanuki, kitsune, rusa Nara, monyet salju, kapibara onsen, bangau Jepang, dan maneki-neko. Masing-masing punya gerakan lucu.',
    accent: '#87955a', file: 'shibuya-blocks-japan-animals', category: 'Hewan', isNew: true,
  },
  konbini: {
    number: '01', name: 'Konbini Store', japanese: '\u30b3\u30f3\u30d3\u30cb',
    subtitle: 'Sudut kecil yang selalu hidup.',
    description: 'Fasad kaca, rak penuh warna, dan cahaya hangat. Toko 24 jam khas jalanan Shibuya, dalam bentuk voxel 3D.',
    accent: '#2d674a', file: 'shibuya-blocks-konbini', category: 'Toko',
  },
  ramen: {
    number: '02', name: 'Ramen-ya', japanese: '\u30e9\u30fc\u30e1\u30f3\u5c4b',
    subtitle: 'Semangkuk hangat di sudut Shibuya.',
    description: 'Genteng bertingkat, noren merah, dan lentera hangat. Kedai ramen mungil dengan counter terbuka dan detail voxel 3D.',
    accent: '#a54130', file: 'shibuya-blocks-ramen', category: 'Toko',
  },
  shibuya109: {
    number: '03', name: 'Shibuya 109', japanese: '\u6e0b\u8c37 109',
    subtitle: 'Ikon di persimpangan Shibuya.',
    description: 'Mall silinder khas Shibuya dengan fasad bertingkat, jendela biru, dan logo 109 merah di puncaknya. Landmark lama kembali hadir.',
    accent: '#a54130', file: 'shibuya-blocks-109', category: 'Perkotaan',
  },
  qfront: {
    number: '04', name: 'Q-FRONT', japanese: 'Q\u30d5\u30ed\u30f3\u30c8',
    subtitle: 'Layar besar, cerita kecil.',
    description: 'Gedung dengan layar LED raksasa, fasad kaca, dan kafe di lantai dasar. Sudut ikonik Scramble Crossing dibuat dalam blok 3D.',
    accent: '#367c85', file: 'shibuya-blocks-qfront', category: 'Perkotaan',
  },
  station: {
    number: '05', name: 'Shibuya Station', japanese: '\u6e0b\u8c37\u99c5',
    subtitle: 'Kereta hijau dan teman setia.',
    description: 'Stasiun Shibuya dengan kereta Yamanote di rel layang, papan JR, serta patung Hachiko di plaza depannya.',
    accent: '#398346', file: 'shibuya-blocks-station-hachiko', category: 'Perkotaan',
  },
  neon: {
    number: '06', name: 'Neon Building', japanese: '\u30bb\u30f3\u30bf\u30fc\u8857',
    subtitle: 'Warna malam Center-gai.',
    description: 'Gedung tinggi ramping dengan billboard bertumpuk, signage vertikal, dan toko di bawahnya. Neon menyala saat beralih ke malam.',
    accent: '#9b5785', file: 'shibuya-blocks-neon', category: 'Perkotaan',
  },
  torii: {
    number: '07', name: 'Kuil & Torii', japanese: '\u91d1\u738b\u516b\u5e61\u5bae',
    subtitle: 'Tenang di tengah kota.',
    description: 'Kuil kayu mungil, gerbang torii merah, lentera batu, dan pohon sakura. Aset kuil dari koleksi awal tetap tersedia.',
    accent: '#b6553f', file: 'shibuya-blocks-shrine-torii', category: 'Tradisional',
  },
  izakaya: {
    number: '08', name: 'Izakaya Yokocho', japanese: '\u306e\u3093\u3079\u3044\u6a2a\u4e01',
    subtitle: 'Gang mungil penuh lentera.',
    description: 'Dua kedai kayu khas Nonbei Yokocho. Noren, bangku, menu, peti minuman, dan deretan lentera merah menghidupkan gang kecil ini.',
    accent: '#a77540', file: 'shibuya-blocks-izakaya', category: 'Toko',
  },
  crossing: {
    number: '09', name: 'Scramble Crossing', japanese: '\u30b9\u30af\u30e9\u30f3\u30d6\u30eb\u4ea4\u5dee\u70b9',
    subtitle: 'Semua arah bertemu.',
    description: 'Persimpangan Shibuya dengan zebra cross diagonal, lampu lalu lintas, taksi kuning, dan pejalan kaki voxel. Sebuah aset jalan yang modular.',
    accent: '#99783c', file: 'shibuya-blocks-crossing', category: 'Perkotaan',
  },
  pagoda: {
    number: '10', name: 'Pagoda & Sakura', japanese: '\u4e94\u91cd\u5854\u3068\u685c',
    subtitle: 'Lima tingkat, satu taman yang tenang.',
    description: 'Pagoda merah bertingkat dengan atap melengkung, puncak emas, dan sakura berwarna pink. Sebuah taman Jepang kecil, dibangun seluruhnya dari voxel.',
    accent: '#a64d3e', file: 'shibuya-blocks-pagoda-sakura', category: 'Tradisional', isNew: true,
  },
  skyscraper: {
    number: '11', name: 'Shibuya Tower District', japanese: '\u6e0b\u8c37\u30bf\u30ef\u30fc',
    subtitle: 'Shibuya, dari jalan sampai langit.',
    description: 'Satu distrik lengkap: Shibuya Tower, deretan gedung dan billboard, stasiun JR, kereta layang, bus, taksi, pejalan kaki, serta pepohonan di setiap sudut.',
    accent: '#3a7890', file: 'shibuya-blocks-skyscraper-district', category: 'Perkotaan', isNew: true,
  },
  sakura: {
    number: '12', name: 'Sakura Tree', japanese: '\u685c\u306e\u6728',
    subtitle: 'Musim semi, satu blok demi satu blok.',
    description: 'Batang bercabang dengan mahkota bunga pink bertingkat. Pohon sakura tersedia sebagai aset tersendiri untuk taman dan jalanan di duniamu.',
    accent: '#b36e86', file: 'shibuya-blocks-sakura-tree', category: 'Tradisional', isNew: true,
  },
  tokyotower: {
    number: '13', name: 'Tokyo Tower', japanese: '\u6771\u4eac\u30bf\u30ef\u30fc',
    subtitle: 'Merah-putih di atas kota kecil.',
    description: 'Rangka merah-putih, empat kaki terbuka, dek observasi, dan antena tinggi. Tokyo Tower dikelilingi gedung warna-warni, jalan kota, kendaraan, dan pohon voxel.',
    accent: '#b84936', file: 'shibuya-blocks-tokyo-tower-district', category: 'Perkotaan', isNew: true,
  },
};