export interface Category {
  label: string;
  color: string;
  icon?: string;
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

export interface Ad {
  id: number;
  title: string;
  image: string;
  link?: string;
  active: boolean;
}

export const CATS: Record<string, Category> = {
  uih: { label: 'УИХ', color: 'red', image: '/UlsTor.jpg' },
  gov: { label: 'Засгийн газар', color: 'blue', image: '/Zasag.jpg' },
  election: { label: 'Сонгууль', color: 'red', image: '/Songuuli.jpg' },
  foreign: { label: 'Гадаад харилцаа', color: 'blue', },
  law: { label: 'Хууль ба бодлого', color: 'navy', },
  party: { label: 'Намууд', color: 'red', },
  economy: { label: 'Эдийн засаг', color: 'blue', },
  local: { label: 'Орон нутаг', color: 'navy', },
};

export const ARTICLES: Article[] = [
  { id: 4, cat: 'foreign', title: 'Гадаад айлчлалын хөтөлбөр зарлагдлаа', excerpt: 'Хоёр болон олон талт хамтын ажиллагааны хэлэлцээрүүд яригдана.', author: 'Б.Болд', time: '5 цагийн өмнө', body: ['Удахгүй болох албан ёсны айлчлалын хүрээнд эдийн засаг, худалдаа, дэд бүтцийн чиглэлийн хэд хэдэн хэлэлцээр яригдахаар хөтөлбөрт тусгагдсан байна.', 'Айлчлалын үр дүн, гарын үсэг зурах баримт бичгүүдийн талаар дэлгэрэнгүй мэдээллийг бид айлчлалын дараа нийтэлнэ.'], src: 'Эх сурвалж: Гадаад харилцааны яам' }
];

export const FEATURED: number[] = [1, 6, 5, 8, 3];

export let POLL = { voted: false, yes: 0, no: 0 };

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
  src?: string;
}

export const getArticleById = (id: number) => ARTICLES.find(a => a.id === id);

export interface Video {
  id: number;
  youtubeId: string;
  title: string;
  active: boolean;
}