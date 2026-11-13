import type { ImageSource } from 'expo-image';

export type ImgSrc = number | string | ImageSource;

export type GeoPoint = { lat: number; lng: number };

export type Listing = {
  id: string;
  title: string;
  category: string;
  price: number;
  negotiable: boolean;
  images: ImgSrc[];
  breed: string;
  age: string;
  gender: 'erkak' | 'urgochi' | 'aralash' | '';
  count?: number;
  documents?: string;
  weight: string;
  color: string;
  city: string;
  district: string;
  geo: GeoPoint;
  description: string;
  phone: string;
  sellerName: string;
  delivery: boolean;
  vaccinated: boolean;
  createdAt: number;
  rating: number;
  views: number;
  weekSale?: boolean;
  own?: boolean;
  sample?: boolean;
  ownerId?: string;
  localOnly?: boolean;
};

/** Sample catalogue listings have no owner account; they all belong to one demo seller page. */
export const SAMPLE_SELLER = 'sample';
export const sellerKey = (l: Pick<Listing, 'ownerId' | 'sample'>) => l.ownerId ?? (l.sample ? SAMPLE_SELLER : undefined);

export type Product = {
  id: string;
  title: string;
  category: string;
  weight: string;
  price: number;
  oldPrice?: number;
  image: ImgSrc;
  description: string;
  rating: number;
  sold: number;
  /** Who the product is for (Figma "Kim uchun"). */
  pet: string;
};

const I = {
  homeBanner: require('../assets/figma/home-imgRectangle237.jpg'),
  promoCats: require('../assets/figma/home-imgRectangle331.jpg'),
  catMushuk: require('../assets/figma/home-imgRectangle283.jpg'),
  catKuchuk: require('../assets/figma/home-imgRectangle284.jpg'),
  catQush: require('../assets/figma/home-imgRectangle285.jpg'),
  catEkzotik: require('../assets/figma/home-imgRectangle286.jpg'),
  catQoramol: require('../assets/figma/home-imgRectangle287.jpg'),
  parrot: require('../assets/figma/home-imgRectangle98.jpg'),
  golden: require('../assets/figma/home-imgRectangle295.jpg'),
  horse1: require('../assets/figma/home-imgRectangle306.jpg'),
  cow1: require('../assets/figma/home-imgRectangle307.jpg'),
  golden2: require('../assets/figma/home-imgRectangle328.jpg'),
  hawk: require('../assets/figma/home-imgRectangle333.jpg'),
  horse2: require('../assets/figma/home-imgRectangle341.jpg'),
  cow2: require('../assets/figma/home-imgRectangle342.jpg'),
  horse3: require('../assets/figma/home-imgRectangle348.jpg'),
  cow3: require('../assets/figma/home-imgRectangle349.jpg'),
  catHero: require('../assets/figma/detail-imgChatGptImage420261114231.jpg'),
  catTabby: require('../assets/figma/detail-imgRectangle307.png'),
  catStone: require('../assets/figma/detail-imgRectangle394.png'),
  catPersian: require('../assets/figma/detail-imgRectangle397.png'),
  catSofa: require('../assets/figma/detail-imgRectangle400.png'),
  marketBanner: require('../assets/figma/market-imgChatGptImage1620262241392.jpg'),
  whiskas1: require('../assets/figma/market-imgImage23.jpg'),
  myau: require('../assets/figma/market-imgImage25.jpg'),
  foldBall: require('../assets/figma/market-imgRectangle279.jpg'),
  whiskas2: require('../assets/figma/market-imgRectangle328.jpg'),
  whiskas3: require('../assets/figma/market-imgRectangle333.jpg'),
  nulo: require('../assets/figma/market-imgRectangle335.jpg'),
  whiskas4: require('../assets/figma/market-imgRectangle337.jpg'),
  whiskasPouch: require('../assets/figma/market-whiskas-pouch.png'),
  s1: require('../assets/figma/home-imgEllipse27.png'),
  s2: require('../assets/figma/home-imgEllipse28.png'),
  s3: require('../assets/figma/home-imgEllipse29.png'),
  s4: require('../assets/figma/home-imgEllipse30.png'),
  s5: require('../assets/figma/home-imgEllipse31.png'),
  s6: require('../assets/figma/home-imgEllipse32.png'),
};
export const IMAGES = I;

export const CATEGORIES = [
  { id: 'mushuk', label: 'Mushuk', image: I.catMushuk, tint: '#f4a259' },
  { id: 'kuchuk', label: 'Kuchuk', image: I.catKuchuk, tint: '#e86a33' },
  { id: 'qush', label: 'Qush', image: I.catQush, tint: '#f2c14e' },
  { id: 'qoramol', label: 'Qoramol', image: I.catQoramol, tint: '#d9a066' },
  { id: 'ot', label: 'Ot', image: I.horse2, tint: '#8bb174' },
  { id: 'ekzotik', label: 'Ekzotik', image: I.catEkzotik, tint: '#b8d8e8' },
];

export const categoryLabel = (id: string) =>
  CATEGORIES.find((c) => c.id === id)?.label ?? 'Boshqa';

export const STORIES = [
  { id: 's1', label: 'Mushuk parvarishi', image: I.s1, title: 'Mushuk parvarishi', text: 'Mushukka kuniga 2–3 marta oz-ozdan ovqat bering, toza suv doim yonida boʻlsin. Junini haftasiga kamida bir marta tarang.' },
  { id: 's2', label: 'Nega?', image: I.s2, title: 'Nega mushuk xirillaydi?', text: 'Xirillash nafaqat xursandchilik, balki stress yoki ogʻriq belgisi ham boʻlishi mumkin. Odatiy boʻlmagan xatti-harakatda veterinarga murojaat qiling.' },
  { id: 's3', label: 'Bilasizmi?', image: I.s3, title: 'Bilasizmi?', text: 'Itning hid bilish qobiliyati odamnikidan oʻn minglab marta kuchli. Sayrda unga hidlash uchun vaqt bering — bu uning uchun yangiliklarni oʻqish kabi.' },
  { id: 's4', label: 'Aynan siz', image: I.s4, title: 'Aynan siz kerak', text: 'Uy hayvonini sotib olishdan oldin oʻylang: unga har kuni vaqt, joy va eʼtibor ajrata olasizmi? Gʻamxoʻr egasi — eng yaxshi uy.' },
  { id: 's5', label: 'Miyov', image: I.s5, title: 'Miyov tili', text: 'Mushuklar odamlar bilan muloqot qilish uchun miyovlaydi. Kattalar mushuklari bir-biriga deyarli miyovlamaydi.' },
  { id: 's6', label: 'Sayr', image: I.s6, title: 'Yozgi sayr', text: 'Issiq kunlarda hayvonlarni ertalab yoki kechqurun sayrga olib chiqing va suvni unutmang.' },
];

const H = 3600 * 1000;
const now = Date.now();
const TASH: GeoPoint = { lat: 41.3111, lng: 69.2797 };

const base = {
  negotiable: true,
  phone: '',
  sellerName: 'Namuna sotuvchi',
  delivery: false,
  vaccinated: false,
  sample: true,
  breed: '',
  weight: '',
  color: '',
};

export const SAMPLE_LISTINGS: Listing[] = [
  { ...base, id: 'a1', title: 'Jako Papugay', category: 'qush', price: 870000, images: [I.parrot], age: '2 yosh', gender: 'erkak', breed: 'Jako', color: 'Kulrang', city: 'Toshkent', district: 'Chilonzor', geo: { lat: 41.2756, lng: 69.2034 }, description: 'Jako papugayi, soʻzlarni takrorlaydi, qoʻlga oʻrgatilgan. Qafasi bilan beriladi.', createdAt: now - 3 * H, rating: 3.5, views: 1124 },
  { ...base, id: 'a2', title: 'Dog Gurgan', category: 'kuchuk', price: 800000, images: [I.golden, I.golden2], age: '4 oylik', gender: 'erkak', breed: 'Golden retriver', color: 'Tilla rang', city: 'Toshkent', district: 'Yunusobod', geo: { lat: 41.3646, lng: 69.2867 }, description: 'Golden retriver kuchugi, emlangan, juda xushmuomala. Bolalar bilan yaxshi chiqishadi.', createdAt: now - 5 * H, rating: 4.5, views: 1824, vaccinated: true, delivery: true },
  { ...base, id: 'a3', title: 'Toy Bolgar', category: 'ot', price: 870000, images: [I.horse1, I.horse2], age: '1 yosh', gender: 'erkak', breed: 'Qorabayir', color: 'Toʻriq', city: 'Samarqand', district: 'Urgut', geo: { lat: 39.4021, lng: 67.2431 }, description: 'Sogʻlom toy, yaylovda boqilgan. Hujjatlari bor.', createdAt: now - 26 * H, rating: 3.4, views: 1124 },
  { ...base, id: 'a4', title: 'Eston sigir', category: 'qoramol', price: 800000, images: [I.cow1, I.cow2], age: '3 yosh', gender: 'urgochi', breed: 'Eston qora-ola', color: 'Qora-oq', city: 'Fargʻona', district: 'Qoʻqon', geo: { lat: 40.5286, lng: 70.9425 }, description: 'Sutli sigir, kuniga 18–20 litr sut beradi. Veterinar koʻrigidan oʻtgan.', createdAt: now - 30 * H, rating: 4.5, views: 1824, vaccinated: true },
  { ...base, id: 'a5', title: 'Brittan Fold mushugi', category: 'mushuk', price: 1530000, images: [I.catHero, I.catTabby, I.catStone, I.catPersian, I.catSofa], age: '9 oylik', gender: 'urgochi', breed: 'Britan Scottish Fold', weight: '5,5 kg', color: 'Kulrang', city: 'Toshkent', district: 'Yunusobod', geo: { lat: 41.3646, lng: 69.2867 }, description: '9 oylik urgʻochi Britan mushugi sotiladi. Rangi kulrang, vazni 5,5 kg. Uy sharoitida boqilgan. Pasporti bor, emlangan. Narxi kelishiladi. Batafsil maʼlumot uchun yozing.', createdAt: now - 5 * H, rating: 4.8, views: 2310, vaccinated: true, delivery: true, weekSale: true },
  { ...base, id: 'a6', title: 'Scottish Strayt', category: 'mushuk', price: 840000, images: [I.catTabby], age: '6 oylik', gender: 'erkak', breed: 'Scottish Straight', color: 'Yoʻl-yoʻl', city: 'Toshkent', district: 'Mirzo Ulugʻbek', geo: { lat: 41.3385, lng: 69.3346 }, description: 'Oʻynoqi va sogʻlom mushukcha, lotokka oʻrgatilgan.', createdAt: now - 8 * H, rating: 4.1, views: 640, weekSale: true },
  { ...base, id: 'a7', title: 'Heyland Strayt', category: 'mushuk', price: 700000, images: [I.catPersian], age: '1 yosh', gender: 'urgochi', breed: 'Highland Straight', color: 'Krem', city: 'Buxoro', district: 'Markaz', geo: { lat: 39.7747, lng: 64.4286 }, description: 'Uzun junli, tinch tabiatli mushuk.', createdAt: now - 12 * H, rating: 4.2, views: 512, weekSale: true },
  { ...base, id: 'a8', title: 'Bengal', category: 'mushuk', price: 900000, images: [I.catSofa, I.catStone], age: '8 oylik', gender: 'erkak', breed: 'Bengal', color: 'Dogʻli', city: 'Andijon', district: 'Markaz', geo: { lat: 40.7821, lng: 72.3442 }, description: 'Faol va aqlli Bengal mushugi.', createdAt: now - 20 * H, rating: 4.6, views: 980 },
  { ...base, id: 'a9', title: 'Toy Bolgar', category: 'ot', price: 870000, images: [I.horse3], age: '2 yosh', gender: 'urgochi', breed: 'Lokay', color: 'Jiyron', city: 'Jizzax', district: 'Zomin', geo: { lat: 39.9601, lng: 68.3958 }, description: 'Chiniqqan, sogʻlom toy.', createdAt: now - 40 * H, rating: 3.5, views: 1124 },
  { ...base, id: 'a10', title: 'Eston sigir', category: 'qoramol', price: 800000, images: [I.cow3], age: '4 yosh', gender: 'urgochi', breed: 'Eston qora-ola', color: 'Qora-oq', city: 'Namangan', district: 'Chust', geo: { lat: 41.0, lng: 71.2333 }, description: 'Sutli, tinch sigir.', createdAt: now - 50 * H, rating: 4.5, views: 1824 },
  { ...base, id: 'a11', title: 'Golden kuchuk', category: 'kuchuk', price: 970000, images: [I.golden2, I.golden], age: '3 oylik', gender: 'urgochi', breed: 'Golden retriver', color: 'Tilla rang', city: 'Toshkent', district: 'Shayxontohur', geo: { lat: 41.3233, lng: 69.2289 }, description: 'Emlangan, pasportli kuchukcha.', createdAt: now - 2 * H, rating: 4.7, views: 1290, vaccinated: true, weekSale: true },
  { ...base, id: 'a12', title: 'Lochin', category: 'qush', price: 950000, images: [I.hawk], age: '1 yosh', gender: 'erkak', breed: 'Lochin', color: 'Jigarrang', city: 'Qashqadaryo', district: 'Qarshi', geo: { lat: 38.8606, lng: 65.7891 }, description: 'Qoʻlga oʻrgatilgan ovchi qush. Hujjatlarini tekshirib oling.', createdAt: now - 70 * H, rating: 4.0, views: 870, weekSale: true },
];

export const PRODUCT_CATEGORIES = [
  { id: 'all', label: 'Hammasi' },
  { id: 'ozuqa', label: 'Ozuqa' },
  { id: 'nam', label: 'Nam ozuqa' },
  { id: 'oyinchoq', label: 'Oʻyinchoqlar' },
];

export const PRODUCTS: Product[] = [
  { id: 'p1', title: 'Whiskas', category: 'ozuqa', weight: '45 gr', price: 58000, oldPrice: 67000, image: I.whiskas1, description: 'Britan mushugi uchun quruq ozuqa, losos taʼmi bilan. Mushugingiz juda yaxshi koʻradi.', rating: 7.9, sold: 12, pet: 'Mushuklar' },
  { id: 'p2', title: 'Myau', category: 'nam', weight: '45 gr', price: 58000, oldPrice: 67000, image: I.myau, description: 'Mushuklar uchun nam ozuqa, sous ichida goʻsht boʻlakchalari.', rating: 7.9, sold: 12, pet: 'Mushuklar' },
  { id: 'p3', title: 'Whiskas Junior', category: 'ozuqa', weight: '350 gr', price: 42500, image: I.whiskas2, description: 'Mushukchalar uchun toʻyimli quruq ozuqa.', rating: 3.5, sold: 1124, pet: 'Mushukchalar' },
  { id: 'p4', title: 'Whiskas Tuna', category: 'ozuqa', weight: '800 gr', price: 87500, oldPrice: 94000, image: I.whiskas3, description: 'Tunets taʼmli quruq ozuqa, katta mushuklar uchun.', rating: 3.5, sold: 1124, pet: 'Mushuklar' },
  { id: 'p5', title: 'Nulo Kitten', category: 'ozuqa', weight: '1,3 kg', price: 214000, image: I.nulo, description: 'Donsiz, yuqori oqsilli mushukcha ozuqasi.', rating: 4.6, sold: 86, pet: 'Mushukchalar' },
  { id: 'p6', title: 'Whiskas Ocean', category: 'ozuqa', weight: '350 gr', price: 41000, image: I.whiskas4, description: 'Dengiz baliqlari taʼmidagi quruq ozuqa.', rating: 4.1, sold: 214, pet: 'Mushuklar' },
  { id: 'p7', title: 'Fold oʻyin toʻpi', category: 'oyinchoq', weight: '1 dona', price: 36900, image: I.foldBall, description: 'Mushuk va kuchuklar uchun yumshoq rezina toʻp.', rating: 4.4, sold: 57, pet: 'Mushuk va kuchuklar' },
  // Figma "8-Mahsulot maʼlumoti": title, price, type, weight and pet from the mock-up.
  { id: 'p8', title: 'Mushuklar uchun quruq', category: 'ozuqa', weight: '1 kg', price: 4700, image: I.whiskasPouch, description: 'Quruq ozuqa. Olib ketish: Toshkent, Yunusobod.', rating: 4.5, sold: 150, pet: 'Mushuklar' },
];

export const CITIES: { name: string; geo: GeoPoint }[] = [
  { name: 'Toshkent', geo: TASH },
  { name: 'Samarqand', geo: { lat: 39.6542, lng: 66.9597 } },
  { name: 'Buxoro', geo: { lat: 39.7747, lng: 64.4286 } },
  { name: 'Fargʻona', geo: { lat: 40.3864, lng: 71.7864 } },
  { name: 'Andijon', geo: { lat: 40.7821, lng: 72.3442 } },
  { name: 'Namangan', geo: { lat: 40.9983, lng: 71.6726 } },
  { name: 'Qarshi', geo: { lat: 38.8606, lng: 65.7891 } },
  { name: 'Nukus', geo: { lat: 42.4531, lng: 59.6103 } },
  { name: 'Xiva', geo: { lat: 41.3783, lng: 60.3639 } },
];

export function formatPrice(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function timeAgo(ts: number) {
  const m = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (m < 60) return `${m} daqiqa oldin`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} soat oldin`;
  return `${Math.round(h / 24)} kun oldin`;
}

export function mapsUrl(geo: GeoPoint, label?: string) {
  const t = label ? `&text=${encodeURIComponent(label)}` : '';
  return `https://yandex.uz/maps/?pt=${geo.lng},${geo.lat}&z=15&l=map${t}`;
}

export function distanceKm(a: GeoPoint, b: GeoPoint) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
