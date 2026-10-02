import type { AssetId, PackId } from './types';

export interface PackMember {
  id: string;
  name: string;
  japanese: string;
  detail: string;
  motion: string;
  color: string;
}

export const CHARACTER_MEMBERS: PackMember[] = [
  { id: 'yakuza', name: 'Yakuza', japanese: '\u30e4\u30af\u30b6', detail: 'Jas arang, rambut slick-back, kacamata hitam, dan rantai emas. Karakter fiksi bergaya film.', motion: 'Langkah santai penuh percaya diri / merapikan kerah.', color: '#394852' },
  { id: 'samurai', name: 'Samurai', japanese: '\u4f8d', detail: 'Armor merah-navy, kabuto, dan katana tersarung. Siluet pendekar klasik dalam blok voxel.', motion: 'Langkah terukur / memberi hormat.', color: '#984d3f' },
  { id: 'ninja', name: 'Ninja', japanese: '\u5fcd\u8005', detail: 'Masker indigo, ikat kepala merah, dan syal. Pendekar bayangan versi chibi.', motion: 'Lari mengendap / bersiap dengan kedua tangan.', color: '#485270' },
  { id: 'maiko', name: 'Maiko', japanese: '\u821e\u5993', detail: 'Kimono sakura, obi emas, kanzashi, dan kipas. Detail pakaian tradisional yang cerah.', motion: 'Langkah kecil anggun / membuka kipas.', color: '#cb839d' },
  { id: 'salaryman', name: 'Salaryman', japanese: '\u30b5\u30e9\u30ea\u30fc\u30de\u30f3', detail: 'Jas biru, dasi merah, kacamata, dan tas kerja. Siap mengejar kereta pagi.', motion: 'Jalan cepat / membungkuk sopan.', color: '#456b85' },
  { id: 'student', name: 'Sailor Student', japanese: '\u5b66\u751f', detail: 'Seragam sailor navy-putih, pita merah, kaus kaki tinggi, dan tas sekolah.', motion: 'Langkah ringan / melambaikan tangan.', color: '#617eae' },
  { id: 'chef', name: 'Ramen Chef', japanese: '\u30e9\u30fc\u30e1\u30f3\u8077\u4eba', detail: 'Tenugui, apron indigo, dan semangkuk ramen lengkap dengan telur dan nori.', motion: 'Langkah pendek sambil membawa ramen / menyajikan mangkuk.', color: '#447c74' },
  { id: 'sumo', name: 'Sumo', japanese: '\u529b\u58eb', detail: 'Tubuh bulat voxel, chonmage, dan mawashi merah marun. Ukuran tubuh dibuat berbeda.', motion: 'Langkah berat bergoyang / latihan shiko.', color: '#b98664' },
  { id: 'miko', name: 'Shrine Miko', japanese: '\u5deb\u5973', detail: 'Atasan putih, hakama merah, rambut panjang, dan gohei kertas putih.', motion: 'Langkah lembut / mengangkat gohei.', color: '#b8584b' },
  { id: 'bosozoku', name: 'Bosozoku', japanese: '\u66b4\u8d70\u65cf', detail: 'Mantel panjang putih, bordir emas, ikat kepala merah, dan rambut pompadour.', motion: 'Langkah berayun / pose tangan di pinggang.', color: '#c0a66a' },
];

export const MOTORCYCLE_MEMBERS: PackMember[] = [
  { id: 'cub', name: 'Super Cub + Rider', japanese: '\u30ab\u30d6', detail: 'Motor bebek retro hijau-krem, keranjang depan, dan pengendara dengan helm retro.', motion: 'Roda berputar, setang bergerak, rider mengikuti getaran.', color: '#73a896' },
  { id: 'custom', name: 'Bosozoku Bike', japanese: '\u30ab\u30b9\u30bf\u30e0\u30d0\u30a4\u30af', detail: 'Motor custom merah dengan jok tinggi, knalpot panjang, dan rider berjaket putih.', motion: 'Roda berputar / rider mengangkat tangan.', color: '#bd624a' },
  { id: 'sport', name: 'Sport 400 + Rider', japanese: '\u30b9\u30dd\u30fc\u30c4\u30d0\u30a4\u30af', detail: 'Sportbike biru-merah, fairing bertingkat, rider berhelm full-face dan pakaian riding.', motion: 'Roda berputar dan badan rider menunduk.', color: '#4a7ca9' },
  { id: 'delivery', name: 'Delivery Scooter', japanese: '\u914d\u9054\u30b9\u30af\u30fc\u30bf\u30fc', detail: 'Skuter oranye dengan boks pengiriman dan rider berhelm. Siap mengantar ramen.', motion: 'Roda berputar dan rider bergoyang ringan.', color: '#d48a43' },
  { id: 'retro', name: 'Retro City Scooter', japanese: '\u30ec\u30c8\u30ed\u30b9\u30af\u30fc\u30bf\u30fc', detail: 'Skuter kota krem-teal dengan leg shield lebar, roda kecil, dan rider berhelm retro.', motion: 'Roda berputar, rider menoleh dan setang bergerak.', color: '#78a6a1' },
  { id: 'cafe', name: 'Cafe Racer', japanese: '\u30ab\u30d5\u30a7\u30ec\u30fc\u30b5\u30fc', detail: 'Motor klasik navy, jok cokelat, tangki panjang, lampu depan bulat voxel, dan rider berjaket kulit.', motion: 'Roda berputar / rider merapikan sarung tangan.', color: '#526277' },
  { id: 'trail', name: 'Trail 250 + Rider', japanese: '\u30c8\u30ec\u30fc\u30eb\u30d0\u30a4\u30af', detail: 'Motor trail hijau dengan ban kasar, spatbor tinggi, rangka ramping, dan rider berhelm motocross.', motion: 'Suspensi naik-turun dan rider mengikuti gerak motor.', color: '#90ad59' },
  { id: 'police', name: 'Shirobai Police Bike', japanese: '\u767d\u30d0\u30a4', detail: 'Motor patroli putih-biru dengan koper samping, windscreen, lampu merah, dan pengendara berseragam.', motion: 'Roda berputar / polisi memberi isyarat tangan.', color: '#7097b4' },
];

export const CAR_MEMBERS: PackMember[] = [
  { id: 'kei', name: 'Kei Car', japanese: '\u8efd\u81ea\u52d5\u8eca', detail: 'Mobil kotak mungil hijau mint, lampu bulat voxel, dan atap putih.', motion: 'Roda berputar dan suspensi bergerak.', color: '#96b99a' },
  { id: 'hachiroku', name: 'Hachiroku Coupe', japanese: '\u30cf\u30c1\u30ed\u30af', detail: 'Coupe panda putih-hitam terinspirasi mobil Jepang tahun 80-an. Lampu pop-up dan spoiler.', motion: 'Roda berputar / lampu pop-up naik-turun.', color: '#d8d9c7' },
  { id: 'gt', name: 'Skyline GT', japanese: '\u30b9\u30ab\u30a4\u30e9\u30a4\u30f3', detail: 'Coupe GT biru, bodi lebar, spoiler, dan empat lampu belakang merah.', motion: 'Roda berputar, badan mobil bergetar pelan.', color: '#5083b3' },
  { id: 'taxi', name: 'Tokyo Taxi', japanese: '\u30bf\u30af\u30b7\u30fc', detail: 'Taksi kuning klasik, papan atap, kabin kaca, dan sopir voxel di dalamnya.', motion: 'Roda berputar / lampu atap menyala.', color: '#d3af4a' },
  { id: 'keitruck', name: 'Kei Truck', japanese: '\u8efd\u30c8\u30e9\u30c3\u30af', detail: 'Truk kecil putih dengan bak terbuka dan peti sayuran warna-warni.', motion: 'Roda berputar dan peti bergoyang ringan.', color: '#bdc8bc' },
  { id: 'bus', name: 'Tokyo City Bus', japanese: '\u90fd\u55b6\u30d0\u30b9', detail: 'Bus kota hijau-krem dengan kaca lebar, kursi, penumpang, dan papan tujuan Shibuya.', motion: 'Roda berputar dan suspensi bergerak.', color: '#658f52' },
];

export const VEHICLE_MEMBERS: PackMember[] = [...MOTORCYCLE_MEMBERS, ...CAR_MEMBERS];
export function isMotorcycle(id: string) { return MOTORCYCLE_MEMBERS.some(member => member.id === id); }

export const ANIMAL_MEMBERS: PackMember[] = [
  { id: 'shiba', name: 'Shiba Inu', japanese: '\u67f4\u72ac', detail: 'Anjing Shiba dengan telinga runcing, muka krem, bandana merah, dan ekor melingkar.', motion: 'Jalan kecil sambil mengibas ekor / menoleh.', color: '#c79757' },
  { id: 'tanuki', name: 'Tanuki', japanese: '\u305f\u306c\u304d', detail: 'Tanuki bundar bermasker cokelat gelap dan topi jerami. Maskot mungil yang ramah.', motion: 'Bergoyang dan menepuk perut.', color: '#917452' },
  { id: 'kitsune', name: 'Kitsune', japanese: '\u72d0', detail: 'Rubah putih tiga ekor, ujung telinga merah, dan lonceng emas. Karakter fantasi.', motion: 'Membungkuk dan mengayun tiga ekor.', color: '#cfb999' },
  { id: 'deer', name: 'Nara Deer', japanese: '\u9e7f', detail: 'Rusa kecil bertanduk voxel dengan bintik putih dan senbei sebagai aksesori.', motion: 'Jalan pelan / membungkuk meminta senbei.', color: '#aa855a' },
  { id: 'monkey', name: 'Snow Monkey', japanese: '\u30cb\u30db\u30f3\u30b6\u30eb', detail: 'Monyet salju dengan muka merah muda dan handuk kecil di kepala.', motion: 'Mengangguk dan menggaruk kepala.', color: '#ad9f8e' },
  { id: 'capybara', name: 'Capybara Onsen', japanese: '\u30ab\u30d4\u30d0\u30e9', detail: 'Kapibara santai dalam bak onsen batu, lengkap dengan yuzu kuning di kepala.', motion: 'Berendam sambil bobbing / yuzu bergoyang.', color: '#b79a73' },
  { id: 'crane', name: 'Red-Crowned Crane', japanese: '\u30bf\u30f3\u30c1\u30e7\u30a6', detail: 'Bangau Jepang putih-hitam, mahkota merah, kaki panjang, dan sayap voxel.', motion: 'Mengangkat kaki dan mengepak sayap.', color: '#b5c2b9' },
  { id: 'neko', name: 'Maneki-neko', japanese: '\u62db\u304d\u732b', detail: 'Maskot kucing pembawa keberuntungan dengan kalung merah, lonceng, dan koin koban.', motion: 'Melambaikan kaki depan dan bergoyang.', color: '#d6b568' },
];

export const PACK_MEMBERS: Record<PackId, PackMember[]> = {
  characters: CHARACTER_MEMBERS,
  vehicles: VEHICLE_MEMBERS,
  animals: ANIMAL_MEMBERS,
};

export function isPackAsset(id: AssetId): id is PackId {
  return id === 'characters' || id === 'vehicles' || id === 'animals';
}

export function getMember(id: AssetId, member?: string | null) {
  return isPackAsset(id) ? PACK_MEMBERS[id].find(item => item.id === member) : undefined;
}