import React from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { CATS, Article } from '@/data/newsData';
import { getArticles } from '@/lib/articlesStore';
import { getOfficialFeed, OfficialFeedItem } from '@/lib/officialFeed';
import { getEconomyIndicators, getEconomyStats, Indicator, QuickStat, ChartVariant } from '@/lib/economyIndicators';
import NewsCard from '@/components/NewsCard';
import Seo from '@/components/Seo';

/* ── Эдийн засгийн гол үзүүлэлтүүд (fallback: 1212 API боломжгүй үед) ── */
const FALLBACK_INDICATORS: Indicator[] = [
  {
    title: 'ХҮН АМЫН ТОО',
    value: '3 591 120',
    change: '+1.0%',
    changeTone: 'pos',
    note: '2024 оны жилийн эцэс',
    color: '#2f6bd8',
    variant: 'line',
    icon: 'people',
    data: [3.30, 3.36, 3.42, 3.49, 3.55, 3.59],
    labels: ['2020', '2021', '2022', '2023', '2024'],
  },
  {
    title: 'ДОТООДЫН НИЙТ БҮТЭЭГДЭХҮҮН',
    value: '22.9',
    unit: 'их наяд ₮',
    change: '+7.9%',
    changeTone: 'pos',
    note: '2024 оны жилийн эцэс',
    color: '#1fae74',
    variant: 'bars',
    icon: 'bars',
    data: [12, 14, 17, 19, 21, 23],
    labels: ['2020', '2021', '2022', '2023', '2024'],
  },
  {
    title: 'ИНФЛЯЦЫН ТҮВШИН',
    value: '12.0',
    unit: '%',
    change: '+0.3%',
    changeTone: 'neg',
    note: '2025 оны 3-р сар',
    color: '#e5484d',
    variant: 'area',
    icon: 'trend',
    data: [5.8, 7.2, 9.4, 11.5, 13.1, 12.0],
    labels: ['2021', '2022', '2023', '2024', '2025'],
  },
  {
    title: 'АЖИЛГҮЙДЛИЙН ТҮВШИН',
    value: '5.7',
    unit: '%',
    change: '-0.1%',
    changeTone: 'pos',
    note: '2024 оны жилийн эцэс',
    color: '#7b61d6',
    variant: 'line',
    icon: 'work',
    data: [8.0, 7.6, 7.1, 6.4, 6.6, 5.7],
    labels: ['2020', '2021', '2022', '2023', '2024'],
  },
];

const FALLBACK_STATS: QuickStat[] = [
  { label: 'Инфляц (жилийн эцэст)', value: '7.5%', icon: 'index' },
  { label: 'Экспорт', value: '15.8 тэрбум $', tone: 'pos', icon: 'export' },
  { label: 'Импорт', value: '11.4 тэрбум $', icon: 'import' },
  { label: 'Худалдааны тэнцэл', value: '+4.4 тэрбум $', tone: 'pos', icon: 'balance' },
];

/* ── news ── */
export const getServerSideProps: GetServerSideProps<{
  articles: Article[];
  economyFeed: OfficialFeedItem[];
  indicators: Indicator[];
  stats: QuickStat[];
}> = async () => {
  const [articles, economyFeed, liveIndicators, liveStats] = await Promise.all([
    getArticles().catch(() => []),
    getOfficialFeed(12).catch(() => []),
    getEconomyIndicators().catch(() => null),
    getEconomyStats().catch(() => null),
  ]);
  return {
    props: {
      articles,
      economyFeed,
      indicators: liveIndicators ?? FALLBACK_INDICATORS,
      stats: liveStats ?? FALLBACK_STATS,
    },
  };
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const KpiIcon = ({ name }: { name: Indicator['icon'] }) => {
  const paths: Record<Indicator['icon'], React.ReactNode> = {
    people: <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 19c0-2.8 2.7-4.5 6-4.5s6 1.7 6 4.5v1H3v-1Zm13-3.7c2.3.3 4 1.6 4 3.7v1h-3v-1c0-1.4-.4-2.6-1-3.7Z" />,
    bars: <path d="M4 20V10h3v10H4Zm6.5 0V4h3v16h-3ZM17 20v-7h3v7h-3Z" />,
    trend: <path d="m3 17 6-6 4 4 8-8v5h-2v-1.6l-6 6-4-4-4.6 4.6L3 17Z" />,
    work: <path d="M9 4h6a2 2 0 0 1 2 2v2h3a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1h3V6a2 2 0 0 1 2-2Zm0 4h6V6H9v2Z" />,
  };
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

const StatIcon = ({ name }: { name: QuickStat['icon'] }) => {
  const paths: Record<QuickStat['icon'], React.ReactNode> = {
    index: <path d="M5 3h14a1 1 0 0 1 1 1v16l-4-2-4 2-4-2-4 2V4a1 1 0 0 1 1-1Zm2 5h10V6H7v2Zm0 4h10v-2H7v2Z" />,
    export: <path d="M12 3 8 7h3v7h2V7h3l-4-4ZM5 19v-4H3v6h18v-6h-2v4H5Z" />,
    import: <path d="M12 14 8 10h3V3h2v7h3l-4 4ZM5 19v-4H3v6h18v-6h-2v4H5Z" />,
    balance: <path d="M12 3v2H8v2h4v10H8v2h4v2h2v-2h4v-2h-4V7h4V5h-4V3h-2ZM4 9l-2 5h4l-2-5Zm14 0-2 5h4l-2-5Z" />,
  };
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

function Sparkline({ data, color, variant }: { data: number[]; color: string; variant: ChartVariant }) {
  const w = 260;
  const h = 70;
  const pad = 8;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const nx = (i: number) => pad + (i / (data.length - 1)) * (w - 2 * pad);
  const ny = (v: number) => h - pad - ((v - min) / span) * (h - 2 * pad);

  if (variant === 'bars') {
    const slot = (w - 2 * pad) / data.length;
    const bw = slot * 0.55;
    return (
      <svg className="spark" viewBox={`0 0 ${w} ${h}`} role="img">
        {data.map((v, i) => {
          const x = pad + slot * (i + 0.5) - bw / 2;
          const y = ny(v);
          return <rect key={i} x={x} y={y} width={bw} height={h - pad - y} rx={2.5} fill={color} />;
        })}
      </svg>
    );
  }

  const line = data.map((v, i) => `${nx(i)} ${ny(v)}`).join(' L ');
  const points = data.map((v, i) => `${nx(i)},${ny(v)}`).join(' ');
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} role="img">
      {variant === 'area' && (
        <path d={`M ${line} L ${nx(data.length - 1)} ${h - pad} L ${nx(0)} ${h - pad} Z`} fill={color} opacity={0.13} />
      )}
      <polyline points={points} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
      {variant === 'line' && data.map((v, i) => <circle key={i} cx={nx(i)} cy={ny(v)} r={2.6} fill={color} />)}
    </svg>
  );
}

export default function EconomyPage({ articles, economyFeed, indicators, stats }: Props) {
  const feedCards = economyFeed.map(item => ({
    id: `feed-${item.id}`,
    title: item.title,
    href: item.url,
    image: item.image ?? CATS.economy.image ?? null,
    time: item.time,
  }));

  const articleCards = articles
    .filter(article => article.cat === 'economy')
    .map(article => ({
      id: `article-${article.id}`,
      title: article.title,
      href: `/articles/${article.id}`,
      image: article.image || CATS.economy.image || null,
      time: article.time,
    }));

  const newsCards = [...feedCards, ...articleCards].slice(0, 8);

  return (
    <div className="econ-page">
      <Seo
        title="Эдийн засаг"
        description="Монгол Улсын эдийн засгийн гол үзүүлэлт, статистик болон эдийн засгийн шинэ мэдээ — ҮСХ-ны албан ёсны эх сурвалжаас."
        path="/economy"
      />
      <div className="econ-top">
        <section className="econ-indicators">
          <div className="section-head">
            <span className="bar" />
            <h2>ЭДИЙН ЗАСГИЙН ГОЛ ҮЗҮҮЛЭЛТҮҮД</h2>
          </div>

          <div className="kpi-grid">
            {indicators.map(ind => (
              <article className="kpi-card" key={ind.title}>
                <div className="kpi-head">
                  <h3>{ind.title}</h3>
                  <span className="kpi-badge" style={{ color: ind.color, background: `${ind.color}1a` }}>
                    <KpiIcon name={ind.icon} />
                  </span>
                </div>
                <div className="kpi-value">
                  {ind.value}
                  {ind.unit ? <span className="kpi-unit"> {ind.unit}</span> : null}
                </div>
                <div className={`kpi-change ${ind.changeTone}`}>{ind.change}</div>
                <div className="kpi-note">({ind.note})</div>
                <div className="kpi-chart">
                  <Sparkline data={ind.data} color={ind.color} variant={ind.variant} />
                  <div className="kpi-years">
                    {ind.labels.map(label => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="econ-side">
          <div className="section-head">
            <span className="bar" />
            <h2>ДЭЛГЭРЭНГҮЙ СТАТИСТИК</h2>
          </div>
          <div className="econ-side-card">
            {stats.map(stat => (
              <div className="stat-row" key={stat.label}>
                <span className="stat-ico"><StatIcon name={stat.icon} /></span>
                <span className="stat-label">{stat.label}</span>
                <span className={`stat-val${stat.tone ? ` ${stat.tone}` : ''}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="econ-news">
        <div className="section-head-row">
          <div className="section-head">
            <span className="bar" />
            <h2>ЭДИЙН ЗАСГИЙН МЭДЭЭ</h2>
          </div>
          <span className="econ-news-count">{newsCards.length} мэдээ</span>
        </div>

        {newsCards.length > 0 ? (
          <div className="news-grid">
            {newsCards.map(card => (
              <NewsCard
                key={card.id}
                variant="grid"
                href={card.href}
                title={card.title}
                image={card.image}
                cat="economy"
                catLabel={CATS.economy.label}
                time={card.time}
              />
            ))}
          </div>
        ) : (
          <p className="list-sub">Одоогоор эдийн засгийн мэдээ алга байна.</p>
        )}
      </section>
    </div>
  );
}
