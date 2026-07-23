import https from 'https';

/**
 * Live economy indicators pulled from the National Statistics Office open-data
 * API (PxWeb) at data.1212.mn. Documented at 1212.mn/mn/data-base/open-data.
 * Each table is queried for the latest 6 years; the newest year is the headline
 * value and the series feeds the mini chart.
 */

const BASE = 'https://data.1212.mn/api/v1/mn/NSO';

export type ChartVariant = 'line' | 'bars' | 'area';

export interface Indicator {
  title: string;
  value: string;
  unit?: string | null;
  change: string;
  changeTone: 'pos' | 'neg';
  note: string;
  color: string;
  variant: ChartVariant;
  icon: 'people' | 'bars' | 'trend' | 'work';
  data: number[];
  labels: string[];
}

interface PxSelection {
  code: string;
  selection: { filter: string; values: string[] };
}

interface IndicatorDef {
  key: string;
  title: string;
  path: string;
  /** fixed dimension selections (everything except the year dimension) */
  fixed: PxSelection[];
  /** code of the time dimension */
  yearCode: string;
  unit?: string;
  /** turn the raw NSO number into the chart/headline number */
  scale: (n: number) => number;
  /** format the headline value for display */
  format: (n: number) => string;
  /** 'ratio' → year-over-year %, 'points' → absolute point difference */
  changeKind: 'ratio' | 'points';
  higherIsBetter: boolean;
  noteSuffix: string;
  color: string;
  variant: ChartVariant;
  icon: Indicator['icon'];
}

const INDICATOR_DEFS: IndicatorDef[] = [
  {
    key: 'population',
    title: 'ХҮН АМЫН ТОО',
    path: '/Population, household/1_Population, household/DT_NSO_0300_003V1.px',
    fixed: [
      { code: 'Хүйс', selection: { filter: 'item', values: ['0'] } },
      { code: 'Насны бүлэг', selection: { filter: 'item', values: ['0'] } },
    ],
    yearCode: 'Он',
    scale: n => n,
    format: n => Math.round(n).toLocaleString('en-US').replace(/,/g, ' '),
    changeKind: 'ratio',
    higherIsBetter: true,
    noteSuffix: 'оны жилийн эцэс',
    color: '#2f6bd8',
    variant: 'line',
    icon: 'people',
  },
  {
    key: 'gdp',
    title: 'ДОТООДЫН НИЙТ БҮТЭЭГДЭХҮҮН',
    path: '/Economy, environment/National Accounts/DT_NSO_0500_006V1.px',
    fixed: [
      { code: 'Үзүүлэлт', selection: { filter: 'item', values: ['0'] } },
      { code: 'Бүрэлдэхүүн', selection: { filter: 'item', values: ['0'] } },
    ],
    yearCode: 'Он',
    unit: 'их наяд ₮',
    scale: n => n / 1_000_000, // сая төгрөг → их наяд (trillion)
    format: n => (n / 1_000_000).toFixed(1),
    changeKind: 'ratio',
    higherIsBetter: true,
    noteSuffix: 'оны жилийн эцэс',
    color: '#1fae74',
    variant: 'bars',
    icon: 'bars',
  },
  {
    key: 'inflation',
    title: 'ИНФЛЯЦЫН ТҮВШИН',
    path: '/Economy, environment/Consumer Price Index/DT_NSO_0600_013V2.px',
    fixed: [{ code: 'Үзүүлэлт', selection: { filter: 'item', values: ['0'] } }],
    yearCode: 'Он',
    unit: '%',
    scale: n => n,
    format: n => n.toFixed(1),
    changeKind: 'points',
    higherIsBetter: false,
    noteSuffix: 'оны эцэст',
    color: '#e5484d',
    variant: 'area',
    icon: 'trend',
  },
  {
    key: 'unemployment',
    title: 'АЖИЛГҮЙДЛИЙН ТҮВШИН',
    path: '/Labour, business/Decent work/DT_NSO_0400_049V1.px',
    fixed: [{ code: 'Ангилал', selection: { filter: 'item', values: ['0'] } }],
    yearCode: 'Он',
    unit: '%',
    scale: n => n,
    format: n => n.toFixed(1),
    changeKind: 'points',
    higherIsBetter: false,
    noteSuffix: 'оны жилийн эцэс',
    color: '#7b61d6',
    variant: 'line',
    icon: 'work',
  },
];

/**
 * data.1212.mn serves an incomplete TLS chain (same as www.1212.mn), so we read
 * this public open-data API over an agent that tolerates it. No credentials sent.
 */
const insecureAgent = new https.Agent({ rejectUnauthorized: false });

function pxRequest<T = unknown>(path: string, body?: string): Promise<T> {
  const url = encodeURI(`${BASE}${path}`);
  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {
        agent: insecureAgent,
        method: body ? 'POST' : 'GET',
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; SonorNewsBot/1.0)',
          'content-type': 'application/json',
          accept: 'application/json',
        },
      },
      response => {
        const status = response.statusCode ?? 0;
        if (status < 200 || status >= 400) {
          response.resume();
          reject(new Error(`PxWeb ${status}`));
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
    request.setTimeout(9000, () => request.destroy(new Error('PxWeb timeout')));
    if (body) request.write(body);
    request.end();
  });
}

interface JsonStat2 {
  id: string[];
  value: (number | null)[];
  dimension: Record<string, { category: { index: Record<string, number>; label: Record<string, string> } }>;
}

/** newest-first list of { year, value } from a json-stat2 response */
function toSeries(js: JsonStat2, yearCode: string): { year: string; value: number }[] {
  const dim = js.dimension[yearCode];
  const { index, label } = dim.category;
  const codesByPos = Object.keys(index).sort((a, b) => index[a] - index[b]);
  return codesByPos.map((code, i) => ({ year: label[code], value: Number(js.value[i]) }));
}

const buildQuery = (def: IndicatorDef): string =>
  JSON.stringify({
    query: [...def.fixed, { code: def.yearCode, selection: { filter: 'top', values: ['6'] } }],
    response: { format: 'json-stat2' },
  });

const formatChange = (def: IndicatorDef, latest: number, prev: number): { text: string; tone: 'pos' | 'neg' } => {
  const delta = def.changeKind === 'ratio' ? ((latest - prev) / prev) * 100 : latest - prev;
  const good = def.higherIsBetter ? delta >= 0 : delta <= 0;
  const sign = delta > 0 ? '+' : delta < 0 ? '-' : '';
  return { text: `${sign}${Math.abs(delta).toFixed(1)}%`, tone: good ? 'pos' : 'neg' };
};

async function fetchIndicator(def: IndicatorDef): Promise<Indicator> {
  const js = await pxRequest<JsonStat2>(def.path, buildQuery(def));
  const series = toSeries(js, def.yearCode).filter(point => Number.isFinite(point.value));
  if (series.length === 0) throw new Error(`no data for ${def.key}`);

  const [latest, prev] = series; // newest first
  const change = prev ? formatChange(def, latest.value, prev.value) : { text: '', tone: 'pos' as const };
  const chrono = [...series].reverse(); // oldest → newest for the chart

  return {
    title: def.title,
    value: def.format(latest.value),
    unit: def.unit ?? null,
    change: change.text,
    changeTone: change.tone,
    note: `${latest.year} ${def.noteSuffix}`,
    color: def.color,
    variant: def.variant,
    icon: def.icon,
    data: chrono.map(point => Number(def.scale(point.value).toFixed(2))),
    labels: chrono.map(point => point.year),
  };
}

type Cached = { at: number; items: Indicator[] };
const CACHE_TTL = 6 * 60 * 60 * 1000; // stats change slowly — refresh every 6h
let cache: Cached | null = null;

/** Live economy indicators from NSO, or null if the API is unreachable. */
export async function getEconomyIndicators(): Promise<Indicator[] | null> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL) return cache.items;

  try {
    const items = await Promise.all(INDICATOR_DEFS.map(fetchIndicator));
    cache = { at: now, items };
    return items;
  } catch {
    if (cache) return cache.items; // serve last good data on a transient failure
    return null;
  }
}

/* ── sidebar quick stats (also live from NSO) ── */
export interface QuickStat {
  label: string;
  value: string;
  tone?: 'pos' | 'neg';
  icon: 'index' | 'export' | 'import' | 'balance';
}

const INFLATION_PATH = '/Economy, environment/Consumer Price Index/DT_NSO_0600_013V2.px';
const TRADE_PATH = '/Economy, environment/Foreign Trade/DT_NSO_1400_001V1_year.px';

const latestQuery = (fixed: PxSelection[]) =>
  JSON.stringify({
    query: [...fixed, { code: 'Он', selection: { filter: 'top', values: ['1'] } }],
    response: { format: 'json-stat2' },
  });

let statsCache: { at: number; items: QuickStat[] } | null = null;

/** Live foreign-trade + inflation summary for the sidebar, or null if unreachable. */
export async function getEconomyStats(): Promise<QuickStat[] | null> {
  const now = Date.now();
  if (statsCache && now - statsCache.at < CACHE_TTL) return statsCache.items;

  try {
    const [inflationJs, tradeJs] = await Promise.all([
      pxRequest<JsonStat2>(INFLATION_PATH, latestQuery([{ code: 'Үзүүлэлт', selection: { filter: 'item', values: ['0'] } }])),
      pxRequest<JsonStat2>(
        TRADE_PATH,
        latestQuery([{ code: 'Гадаад худалдааны үндсэн үзүүлэлт', selection: { filter: 'item', values: ['1', '2', '3'] } }]),
      ),
    ]);

    const inflation = Number(inflationJs.value[0]);
    const [exports, imports, balance] = (tradeJs.value as (number | null)[]).map(Number);
    const bil = (n: number) => `${(n / 1000).toFixed(1)} тэрбум $`; // million USD → billion

    const items: QuickStat[] = [
      { label: 'Инфляц (жилийн эцэст)', value: `${inflation.toFixed(1)}%`, icon: 'index' },
      { label: 'Экспорт', value: bil(exports), tone: 'pos', icon: 'export' },
      { label: 'Импорт', value: bil(imports), icon: 'import' },
      { label: 'Худалдааны тэнцэл', value: `${balance >= 0 ? '+' : ''}${bil(balance)}`, tone: balance >= 0 ? 'pos' : 'neg', icon: 'balance' },
    ];
    statsCache = { at: now, items };
    return items;
  } catch {
    if (statsCache) return statsCache.items;
    return null;
  }
}
