import type { Article, MP, Ad, Video } from '@/data/newsData';
import type { Fact } from '@/lib/factsStore';

export type Tab = 'articles' | 'mps' | 'ambassadors' | 'ads' | 'videos' | 'facts';

/** Табын компонент бүр эцэг рүүгээ өгөх handle ("Шинэ ..." товчинд). */
export type TabHandle = { reset: () => void };

export type ArticleForm = {
  id?: number;
  cat: string;
  featured: boolean;
  title: string;
  excerpt: string;
  author: string;
  time: string;
  image: string;
  body: string;
  src: string;
};

export type AmbForm = {
  country: string;
  city: string;
  name: string;
  role: string;
  image?: string;
};

export type AdForm = {
  title: string;
  image: string;
  link: string;
  active: boolean;
};

export type VideoForm = {
  title: string;
  youtubeId: string;
  active: boolean;
};

export type FactForm = {
  claim: string;
  verdict: 'true' | 'false' | 'half';
  vlabel: string;
  exp: string;
};

export type Option = { value: string; label: string };

// ── Хоосон формууд ──

export const emptyArticleForm: ArticleForm = {
  cat: 'uih',
  featured: false,
  title: '',
  excerpt: '',
  author: 'Редакц',
  time: 'Саяхан',
  image: '',
  body: '',
  src: 'Эх сурвалж: Сонор.мн',
};

export const emptyMpForm: Partial<MP> = {
  party: 'МАН',
  pcls: 'man',
  gender: 'M',
  electedYear: 2024,
  attendance: 100,
  laws: 0,
  socials: {},
  committees: [],
  education: [],
  experience: [],
  image: '',
  name: '',
  district: '',
  position: 'УИХ-ын гишүүн',
  bio: '',
  contact: '',
  src: '',
};

export const emptyAmbForm: AmbForm = {
  country: '',
  city: '',
  name: '',
  role: 'Элчин сайд',
  image: '',
};

export const emptyAdForm: AdForm = {
  title: '',
  image: '',
  link: '',
  active: true,
};

export const emptyVideoForm: VideoForm = {
  title: '',
  youtubeId: '',
  active: true,
};

export const emptyFactForm: FactForm = {
  claim: '',
  verdict: 'half',
  vlabel: '',
  exp: '',
};

// ── Өгөгдөл → форм хөрвүүлэгч ──

export const toArticleForm = (article: Article): ArticleForm => ({
  id: article.id,
  cat: article.cat,
  featured: Boolean(article.featured),
  title: article.title,
  excerpt: article.excerpt,
  author: article.author,
  time: article.time,
  image: article.image ?? '',
  body: article.body.join('\n\n'),
  src: article.src,
});

export const toAdForm = (ad: Ad): AdForm => ({
  title: ad.title,
  image: ad.image,
  link: ad.link ?? '',
  active: ad.active,
});

export const toVideoForm = (video: Video): VideoForm => ({
  title: video.title,
  youtubeId: video.youtubeId,
  active: video.active,
});

export const toFactForm = (fact: Fact): FactForm => ({
  claim: fact.claim,
  verdict: fact.verdict,
  vlabel: fact.vlabel,
  exp: fact.exp,
});

// ── Сонголтууд ──

export const VERDICT_OPTIONS: Option[] = [
  { value: 'true', label: 'Үнэн' },
  { value: 'half', label: 'Хагас үнэн' },
  { value: 'false', label: 'Худал' },
];

export const PARTY_OPTIONS: Option[] = [
  { value: 'МАН', label: 'МАН' },
  { value: 'АН', label: 'АН' },
  { value: 'ХҮН', label: 'ХҮН' },
  { value: 'Бусад', label: 'Бусад (бие даагч)' },
];

export const GENDER_OPTIONS: Option[] = [
  { value: 'M', label: 'Эрэгтэй' },
  { value: 'F', label: 'Эмэгтэй' },
];

export const ROLE_OPTIONS: Option[] = [
  { value: 'Элчин сайд', label: 'Элчин сайд' },
  { value: 'Ерөнхий консул', label: 'Ерөнхий консул' },
  { value: 'Байнгын төлөөлөгч', label: 'Байнгын төлөөлөгч' },
];

export const partyToPcls = (party: string): MP['pcls'] =>
  (party === 'МАН' ? 'man' : party === 'АН' ? 'an' : party === 'ХҮН' ? 'hun' : 'independent') as MP['pcls'];

export const extractYoutubeIdClient = (input: string): string => {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '');
    }
    if (url.hostname.includes('youtube.com')) {
      if (url.pathname === '/watch') return url.searchParams.get('v') ?? trimmed;
      if (url.pathname.startsWith('/embed/')) return url.pathname.split('/embed/')[1];
      if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/shorts/')[1];
    }
  } catch {
    // URL биш бол доор анхны утгыг буцаана
  }

  return trimmed;
};
