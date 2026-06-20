export interface Category {
  label: string;
  color: string;
  icon: string;
  image?: string;
}

export interface Article {
  id: number;
  cat: keyof typeof CATS;
  featured?: boolean;
  title: string;
  excerpt: string;
  author: string;
  time: string;
  image?: string;
  body: string[];
  src: string;
}

export const CATS: Record<string, Category> = {
  uih: { label: 'УИХ', color: 'red', icon: '🏛', image: '/UlsTor.jpg' },
  gov: { label: 'Засгийн газар', color: 'blue', icon: '⚖', image: '/Zasag.jpg' },
  election: { label: 'Сонгууль', color: 'red', icon: '🗳', image: '/Songuuli.jpg' },
  foreign: { label: 'Гадаад харилцаа', color: 'blue', icon: '🌐' },
  law: { label: 'Хууль ба бодлого', color: 'navy', icon: '📜' },
  party: { label: 'Намууд', color: 'red', icon: '🏴' },
  economy: { label: 'Эдийн засаг', color: 'blue', icon: '📈' },
  local: { label: 'Орон нутаг', color: 'navy', icon: '🏙' },
};

// Энэ хэсэг одоог хүртэл статик (гараар бичсэн) байна. 
export const ARTICLES: Article[] = [
  { id: 4, cat: 'foreign', title: 'Гадаад айлчлалын хөтөлбөр зарлагдлаа', excerpt: 'Хоёр болон олон талт хамтын ажиллагааны хэлэлцээрүүд яригдана.', author: 'Б.Болд', time: '5 цагийн өмнө', body: ['Удахгүй болох албан ёсны айлчлалын хүрээнд эдийн засаг, худалдаа, дэд бүтцийн чиглэлийн хэд хэдэн хэлэлцээр яригдахаар хөтөлбөрт тусгагдсан байна.', 'Айлчлалын үр дүн, гарын үсэг зурах баримт бичгүүдийн талаар дэлгэрэнгүй мэдээллийг бид айлчлалын дараа нийтэлнэ.'], src: 'Эх сурвалж: Гадаад харилцааны яам' },
  { id: 5, cat: 'law', title: 'Шинэ татварын хуулийн төсөл өргөн баригдав', excerpt: 'Иргэд, аж ахуйн нэгжийн татварын ачааллыг тодотгох заалтуудтай.', author: 'С.Оюун', time: '7 цагийн өмнө', body: ['Татварын багц хуулийн шинэчилсэн найруулгын төслийг УИХ-д өргөн барилаа. Төсөлд татварын хувь хэмжээ, хөнгөлөлт чөлөөлөлтийн зохицуулалтыг тодотгосон заалтууд орсон байна.', 'Хуулийн төсөл хэлэлцэх явц, гол өөрчлөлтүүдийг бид "Хуулийн төсөл хяналт" хэсэгт байршуулж, явцыг тухай бүрд шинэчилнэ.'], src: 'Эх сурвалж: УИХ-ын гэрэгэ систем' },
  { id: 6, cat: 'party', title: 'Сайдын асуудлаар нам дотроо зөрчил үүслээ', excerpt: 'Намын бүлгийн дотоод хуралдаанд байр суурь зөрчилдсөн гэв.', author: 'Г.Энх', time: '9 цагийн өмнө', body: ['Нэгэн намын бүлгийн дотоод хуралдаанаар тодорхой сайдын асуудлаар гишүүдийн байр суурь зөрчилдсөн талаар мэдээлэл гарч байна. Редакц холбогдох талуудаас тайлбар авахаар ажиллаж байна.', 'Бид баталгаажаагүй мэдээллийг баримт мэт хүргэхгүй. Энэ мэдээлэл нэмэлт эх сурвалжаар баталгаажсаны дараа дэлгэрэнгүйг нийтэлнэ.'], src: 'Баталгаажаагүй мэдээлэл — нэмэлт эх сурвалжаар шалгаж байна' },
  { id: 9, cat: 'local', title: 'Нийслэлийн төсвийн хуваарилалт яригдана', excerpt: 'Дүүрэг бүрийн дэд бүтцийн төсөл, санхүүжилтийн асуудал хэлэлцэгдэнэ.', author: 'Г.Энх', time: '1 өдрийн өмнө', body: ['Нийслэлийн иргэдийн Төлөөлөгчдийн Хурлаар ирэх оны төсвийн төсөл, дүүрэг бүрийн дэд бүтцийн санхүүжилтийн асуудлыг хэлэлцэнэ.', 'Орон нутгийн төсвийн ил тод байдал, хуваарилалтын шударга байдалд редакц онцгой анхаарна.'], src: 'Эх сурвалж: Нийслэлийн ИТХ' },
];

export const FEATURED: number[] = [1, 6, 5, 8, 3];

export interface Fact {
  claim: string;
  verdict: 'true' | 'false' | 'half';
  vlabel: string;
  exp: string;
}

export const FACTS: Fact[] = [
  { claim: '«Энэ онд цалин 2 дахин нэмэгдсэн» гэх олон нийтэд тархсан мэдэгдэл', verdict: 'false', vlabel: 'Худал', exp: 'Албан ёсны статистикаар дундаж цалин тодорхой хувиар өссөн боловч хоёр дахин нэмэгдээгүй. Тоо баримтыг гуйвуулсан.' },
  { claim: '«Төсвийн алдагдал түүхэн дээд хэмжээнд хүрсэн» гэх мэдэгдэл', verdict: 'half', vlabel: 'Хагас үнэн', exp: 'Нэрлэсэн дүнгээр алдагдал өндөр боловч ДНБ-д харьцуулсан хувиар авч үзвэл өмнөх жилүүдтэй ойролцоо түвшинд байна.' },
  { claim: '«Шинэ хууль батлагдсан өдрөөсөө эхлэн хүчин төгөлдөр болно» гэх мэдээлэл', verdict: 'true', vlabel: 'Үнэн', exp: 'Хуульд хүчин төгөлдөр болох хугацааг тусгайлан заасан тул мэдэгдэл нийцэж байна.' }
];

export let POLL = { voted: false, yes: 58, no: 42 };

export interface MP {
  id: number;
  name: string;
  party: string;
  pcls: 'man' | 'an' | 'hun' | 'independent';
  district: string;
  committees: string[];
  position: string;
  electedYear: number;
  image: string;
  gender: 'M' | 'F';
  bio: string;
  education: string[];
  experience: string[];
  attendance: number;
  laws: number;
  socials: { fb?: string; x?: string };
  contact: string;
  isFeatured?: boolean;
}

export const SEED_MPS: MP[] = [
  {
    id: 1,
    name: 'Батхүүгийн Батбаяр',
    party: 'МАН',
    pcls: 'man',
    district: '12-р тойрог, Баянзүрх',
    committees: ['Төсвийн байнгын хороо', 'Эдийн засгийн байнгын хороо'],
    position: 'УИХ-ын гишүүн',
    electedYear: 2024,
    image: 'https://via.placeholder.com/300x400',
    gender: 'M',
    bio: 'Эдийн засагч, эрх зүйч мэргэжилтэй. Төрийн албанд 15 жил ажилласан.',
    education: ['МУИС, Эдийн засгийн сургууль', 'Харвардын их сургууль, Төрийн удирдлага'],
    experience: ['Сант Марал сангийн судлаач', 'Сангийн яамны хэлтсийн дарга'],
    attendance: 98.5,
    laws: 12,
    socials: { fb: 'https://facebook.com', x: 'https://twitter.com' },
    contact: 'batbayar@parliament.mn',
    isFeatured: true
  },
  {
    id: 2,
    name: 'Даваагийн Оюунчимэг',
    party: 'АН',
    pcls: 'an',
    district: '5-р тойрог, Дархан-Уул',
    committees: ['Нийгмийн бодлогын байнгын хороо'],
    position: 'УИХ-ын гишүүн',
    electedYear: 2024,
    image: 'https://via.placeholder.com/300x400',
    gender: 'F',
    bio: 'Сэтгүүлч, нийгмийн зүтгэлтэн.',
    education: ['МУИС, Сэтгүүл зүй'],
    experience: ['МҮОНТ-ийн сэтгүүлч', 'Нийгмийн хөгжлийн сангийн тэргүүн'],
    attendance: 94.2,
    laws: 5,
    socials: { fb: 'https://facebook.com' },
    contact: 'oyunchimeg@parliament.mn'
  },
  // Бусад гишүүдийг энд нэмж болно...
];

export const SEED_AMB = [
  { country: 'БНХАУ', city: 'Бээжин', name: 'Н.Энхболд', role: 'Элчин сайд' },
  { country: 'ОХУ', city: 'Москва', name: 'Д.Даваа', role: 'Элчин сайд' },
  { country: 'АНУ', city: 'Вашингтон', name: 'Ө.Батбаяр', role: 'Элчин сайд' },
  { country: 'Япон', city: 'Токио', name: 'Б.Баярсайхан', role: 'Элчин сайд' },
  { country: 'БНСУ', city: 'Сөүл', name: 'С.Сүхболд', role: 'Элчин сайд' },
  { country: 'БНАСАУ', city: 'Пхеньян', name: 'Л.Эрдэнэдаваа', role: 'Элчин сайд' },
  { country: 'Их Британи', city: 'Лондон', name: 'Б.Мөнхжин', role: 'Элчин сайд' },
  { country: 'Герман', city: 'Берлин', name: 'Б.Мандахбилэг', role: 'Элчин сайд' },
  { country: 'Франц', city: 'Париз', name: 'Н.Анхбаяр', role: 'Элчин сайд' },
  { country: 'Бельги (ЕХ)', city: 'Брюссель', name: 'Л.Болд', role: 'Элчин сайд' },
  { country: 'Швейцарь', city: 'Женев', name: 'П.Анхбаяр', role: 'Байнгын төлөөлөгч' },
  { country: 'Австри', city: 'Вена', name: 'Г.Баттунгалаг', role: 'Элчин сайд' },
  { country: 'Чех', city: 'Прага', name: 'Д.Гансүх', role: 'Элчин сайд' },
  { country: 'Болгар', city: 'София', name: 'Л.Саянаа', role: 'Элчин сайд' },
  { country: 'Турк', city: 'Анкара', name: 'Г.Мөнхбаяр', role: 'Элчин сайд' },
  { country: 'Энэтхэг', city: 'Шинэ Дели', name: 'Л.Өлзийт', role: 'Элчин сайд' },
  { country: 'Казахстан', city: 'Астана', name: 'Д.Баярхүү', role: 'Элчин сайд' },
  { country: 'Кувейт', city: 'Кувейт', name: 'П.Сэргэлэн', role: 'Элчин сайд' },
  { country: 'Вьетнам', city: 'Ханой', name: 'Ж.Сэрээжав', role: 'Элчин сайд' },
  { country: 'Куба', city: 'Гавана', name: 'Ш.Батцэцэг', role: 'Элчин сайд' },
  { country: 'Канад', city: 'Оттава', name: 'Э.Сарантогос', role: 'Элчин сайд' },
  { country: 'Сингапур', city: 'Сингапур', name: 'Э.Булган', role: 'Элчин сайд' },
  { country: 'БНХАУ', city: 'Эрээн', name: 'Д.Мөнх-Эрдэнэ', role: 'Ерөнхий консул' },
  { country: 'БНХАУ', city: 'Хөх хот', name: 'Д.Ганхуяг', role: 'Ерөнхий консул' },
  { country: 'АНУ', city: 'Сан Франциско', name: 'Д.Батжаргал', role: 'Ерөнхий консул' },
  { country: 'ОХУ', city: 'Эрхүү', name: 'Б.Энхтүвшин', role: 'Ерөнхий консул' },
  { country: 'Турк', city: 'Истанбул', name: 'Ч.Мөнгөндалай', role: 'Ерөнхий консул' }
];

export const getArticleById = (id: number) => ARTICLES.find(a => a.id === id);
