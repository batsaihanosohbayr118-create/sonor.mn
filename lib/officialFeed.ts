import https from 'https';

const BASE_URL = 'https://www.1212.mn';

/**
 * 1212.mn (National Statistics Office) serves its news through this JSON API,
 * discovered from the site's own Next.js client bundle. `type=latest` returns
 * the newest articles first, so new posts on 1212 flow in automatically.
 */
const NEWS_API = (pageSize: number) =>
  `${BASE_URL}/api/articles?page=1&pageSize=${pageSize}&lng=mn&type=latest`;

/** How many recent articles to scan before filtering down to economy news. */
const SCAN_SIZE = 120;

export interface OfficialFeedItem {
  id: string;
  title: string;
  url: string;
  image?: string;
  excerpt?: string;
  time?: string;
  source: '1212';
  kind: 'news' | 'release';
}

type CachedFeed = {
  at: number;
  items: OfficialFeedItem[];
};

const CACHE_TTL = 5 * 60 * 1000;
let cachedFeed: CachedFeed | null = null;

/**
 * 1212's news API has no topic field, so economy news is matched on the
 * Mongolian economy vocabulary. Titles are the reliable signal (broad set),
 * while the body only counts for a few unambiguous economic-indicator phrases —
 * this keeps institutional / non-economy articles out of the feed.
 */
const ECONOMY_TITLE_RE = /(эдийн засаг|инфляц|үнийн индекс|хэрэглээний үн|дотоодын нийт бүтээгдэхүүн|\bднб\b|экспорт|импорт|гадаад худалдаа|худалдааны тэнцэл|ажил эрхлэлт|ажиллах хүч|ажилгүйдл|цалин|өрхийн орлого|амьжиргаа|төсөв|татвар|хөрөнгө оруулалт|аж үйлдвэр|үйлдвэрлэл|бизнес|мөнгө|банк|зээл|валют|нэмэгдсэн өртөг|өртгийн зэрэгцүүлэлт)/i;
const ECONOMY_BODY_RE = /(хэрэглээний үнийн индекс|дотоодын нийт бүтээгдэхүүн|инфляцийн түвшин|гадаад худалдааны нийт бараа эргэлт|аж үйлдвэрийн үйлдвэрлэлийн индекс)/i;

const isEconomy = (title: string, body: string) =>
  ECONOMY_TITLE_RE.test(title) || ECONOMY_BODY_RE.test(body);

const stripTags = (value: string) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const inferExcerpt = (body: string) => {
  const cleaned = stripTags(body);
  if (cleaned.length <= 140) return cleaned;
  return `${cleaned.slice(0, 137)}...`;
};

const formatDate = (value?: string) => {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  const iso = d.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
};

const toImage = (header?: string | null) => {
  if (!header) return undefined;
  if (/^https?:\/\//.test(header)) return header;
  if (header.startsWith('/uploads/')) return `${BASE_URL}${header}`;
  return `${BASE_URL}/uploads/${header}`;
};

interface RawArticle {
  id: string | number;
  name?: string;
  body?: string;
  header_image?: string | null;
  thumb_image?: string | null;
  published_date?: string;
  created_date?: string;
}

const mapItem = (a: RawArticle): OfficialFeedItem => ({
  id: String(a.id),
  title: (a.name || '').trim(),
  // Read on our own site instead of jumping out to 1212.mn.
  url: `/news/${a.id}`,
  image: toImage(a.header_image || a.thumb_image),
  excerpt: inferExcerpt(a.body || ''),
  time: formatDate(a.published_date || a.created_date),
  source: '1212',
  kind: 'news',
});

/**
 * 1212.mn presents an incomplete TLS certificate chain, which makes the
 * platform's global fetch() reject the connection (UNABLE_TO_VERIFY_LEAF_
 * SIGNATURE). This is a public, read-only government feed and we send no
 * credentials, so we read it over an agent that tolerates the broken chain.
 */
const insecureAgent = new https.Agent({ rejectUnauthorized: false });

function fetchJson<T = unknown>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        agent: insecureAgent,
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; SonorNewsBot/1.0)',
          accept: 'application/json',
        },
      },
      response => {
        const status = response.statusCode ?? 0;
        if (status < 200 || status >= 400) {
          response.resume();
          reject(new Error(`1212 API responded ${status}`));
          return;
        }
        let raw = '';
        response.setEncoding('utf8');
        response.on('data', chunk => {
          raw += chunk;
        });
        response.on('end', () => {
          try {
            resolve(JSON.parse(raw) as T);
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    request.on('error', reject);
    request.setTimeout(8000, () => request.destroy(new Error('1212 API timeout')));
  });
}

const fallbackFeed: OfficialFeedItem[] = [
  {
    id: 'fallback-1',
    title: 'ҮСХ: Эдийн засгийн статистик мэдээлэл шинэчлэгдэж байна',
    url: `${BASE_URL}/mn/about-us/news/home`,
    excerpt: 'Албан ёсны 1212.mn эх сурвалжаас эдийн засгийн хамгийн сүүлийн мэдээллийг татаж харуулна.',
    source: '1212',
    kind: 'news',
  },
];

export interface OfficialArticle {
  id: string;
  title: string;
  paragraphs: string[];
  image?: string;
  time?: string;
  /** original article on 1212.mn, kept as the source attribution link */
  sourceUrl: string;
}

/** Split a 1212 HTML body into clean text paragraphs. */
const parseParagraphs = (body: string): string[] =>
  body
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/<\/p>|<\/div>|<\/li>|\n{2,}/i)
    .map(stripTags)
    .filter(text => text.length > 0);

/** Fetch a single 1212 article by id so it can be read on our own site. */
export async function getOfficialArticle(id: string): Promise<OfficialArticle | null> {
  try {
    const json = await fetchJson<{ data?: RawArticle }>(`${BASE_URL}/api/articles/${encodeURIComponent(id)}`);
    const a = json?.data;
    if (!a || !a.name) return null;

    const paragraphs = parseParagraphs(a.body || '');
    return {
      id: String(a.id),
      title: a.name.trim(),
      paragraphs: paragraphs.length > 0 ? paragraphs : [inferExcerpt(a.body || '')],
      image: toImage(a.header_image || a.thumb_image),
      time: formatDate(a.published_date || a.created_date),
      sourceUrl: `${BASE_URL}/mn/about-us/news/${a.id}`,
    };
  } catch {
    return null;
  }
}

export async function getOfficialFeed(limit = 8): Promise<OfficialFeedItem[]> {
  const now = Date.now();
  if (cachedFeed && now - cachedFeed.at < CACHE_TTL) {
    return cachedFeed.items.slice(0, limit);
  }

  try {
    const json = await fetchJson<{ data?: RawArticle[] }>(NEWS_API(SCAN_SIZE));
    const rows = Array.isArray(json?.data) ? json.data : [];

    const economy = rows
      .filter(article => article && article.name)
      .filter(article => isEconomy(article.name || '', stripTags(article.body || '')))
      .map(mapItem)
      .filter(item => item.title.length > 0);

    const finalItems = economy.length > 0 ? economy : fallbackFeed;
    cachedFeed = { at: now, items: finalItems };
    return finalItems.slice(0, limit);
  } catch {
    // Keep serving the last good feed if 1212 is briefly unreachable.
    if (cachedFeed) return cachedFeed.items.slice(0, limit);
    return fallbackFeed.slice(0, limit);
  }
}
