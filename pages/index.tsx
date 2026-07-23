import React from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Article, Video, CATS } from '@/data/newsData';
import { getArticles, getFeaturedArticles } from '@/lib/articlesStore';
import { getOfficialFeed, OfficialFeedItem } from '@/lib/officialFeed';
import { getActiveVideos } from '@/lib/videosStore';
import NewsCard from '@/components/NewsCard';
import Seo from '@/components/Seo';

type Story = {
  id: string;
  title: string;
  excerpt: string;
  time: string;
  image: string | null;
  cat: keyof typeof CATS;
  url: string;
  sourceLabel: string;
  views: string;
};

type PageProps = {
  heroStory: Story | null;
  spotlightStories: Story[];
  cardStories: Story[];
  featureStories: Story[];
  videos: Video[];
};

const CATEGORY_ORDER: (keyof typeof CATS)[] = ['uih', 'economy', 'local', 'foreign', 'law', 'party', 'election'];

const inferCat = (title: string, fallback: keyof typeof CATS = 'uih'): keyof typeof CATS => {
  const text = title.toLowerCase();
  if (/(үнэ|инфляц|эдийн|төсөв|банк|валют|хөрөнгө|бирж|санхүү)/i.test(text)) return 'economy';
  if (/(бороо|цаг агаар|сургууль|нийгэм|эрүүл|орчин|амралт)/i.test(text)) return 'local';
  if (/(гадаад|дэлхий|хятад|орос|америк|уулзалт|хамтын ажиллагаа)/i.test(text)) return 'foreign';
  if (/(хууль|бодлого|эрх зүй|шүүх|эрэн сурвалжлах|авлига)/i.test(text)) return 'law';
  if (/(нам|улс төр|сонгууль|их хурал|засгийн газар|ерөнхийлөгч)/i.test(text)) return 'uih';
  if (/(opinion|сэтгэгдэл|үзэл бодол)/i.test(text)) return 'party';
  if (/(спорт|тэмцээн|аялал|соёл|урлаг|видео)/i.test(text)) return 'election';
  return fallback;
};

const formatTime = (value?: string) => value || '07:45';

const cleanExcerpt = (value?: string) => {
  const text = (value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '1212.mn-ээс шинэ мэдээлэл татагдлаа.';
  return text.length > 130 ? `${text.slice(0, 127)}...` : text;
};

const toStory = (
  item: Article | OfficialFeedItem,
  fallbackCat: keyof typeof CATS = 'uih',
): Story => {
  if ('cat' in item) {
    const cat = item.cat ?? fallbackCat;
    const category = CATS[cat] ?? CATS[fallbackCat];
    return {
      id: String(item.id),
      title: item.title,
      excerpt: item.excerpt,
      time: item.time,
      image: item.image ?? null,
      cat,
      url: `/articles/${item.id}`,
      sourceLabel: category.label,
      views: '',
    };
  }

  const cat = inferCat(item.title, fallbackCat);
  const category = CATS[cat] ?? CATS[fallbackCat];

  return {
    id: item.id,
    title: item.title,
    excerpt: cleanExcerpt(item.excerpt),
    time: formatTime(item.time),
    image: item.image ?? category.image ?? null,
    cat,
    url: item.url,
    sourceLabel: item.source === '1212' ? '1212.mn' : category.label,
    views: '',
  };
};

const storyWithFallback = (story: Story | null, fallback: Story | null) => story ?? fallback;

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const [officialFeed, articles, videos] = await Promise.all([
    getOfficialFeed(10).catch(() => []),
    getArticles().catch(() => []),
    getActiveVideos().catch(() => []),
  ]);

  const mergedStories = [
    // 1212.mn feed is already filtered to economy news, so tag it as such.
    ...officialFeed.map(item => ({ ...toStory(item, 'economy'), cat: 'economy' as const })),
    ...articles.map((item, index) => toStory(item, CATEGORY_ORDER[index % CATEGORY_ORDER.length])),
  ];

  const featureStories = getFeaturedArticles(articles)
    .slice(0, 4)
    .map((item, index) => toStory(item, CATEGORY_ORDER[index % CATEGORY_ORDER.length]));

  const heroStory = storyWithFallback(mergedStories[0] ?? null, featureStories[0] ?? null);
  const spotlightStories = mergedStories.slice(1, 4).length > 0
    ? mergedStories.slice(1, 4)
    : featureStories.slice(0, 3);
  const cardStories = mergedStories.slice(0, 4).length > 0
    ? mergedStories.slice(0, 4)
    : featureStories;

  return {
    props: {
      heroStory,
      spotlightStories,
      cardStories,
      featureStories,
      videos: videos.slice(0, 1),
    },
  };
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const viewCount = (views: string) => views.replace(' үзсэн', '');

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="section-head">
      <span className="bar" />
      <h2>{title}</h2>
    </div>
  );
}

function VideoCard({ video }: { video: Video | null }) {
  return (
    <div className="panel-card video-panel">
      <div className="panel-head">
        <div className="section-head"><span className="bar" /><h3>ОНЦЛОХ ВИДЕО</h3></div>
      </div>
      {video ? (
        <>
          <a
            href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
            target="_blank"
            rel="noreferrer"
            className="video-thumb"
          >
            <img src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`} alt={video.title} />
            <span className="play-badge">▶</span>
          </a>
          <h4 className="video-title">{video.title}</h4>
          <p className="video-meta">YouTube дээр үзэх →</p>
        </>
      ) : (
        <>
          <div className="video-thumb video-thumb-empty">
            <span className="play-badge">▶</span>
          </div>
          <h4 className="video-title">Онцлох видео удахгүй нэмэгдэнэ</h4>
          <p className="video-meta">Шинэ видео контентыг эндээс үзэх боломжтой болно.</p>
        </>
      )}
    </div>
  );
}

function SubscribeCard() {
  return (
    <div className="panel-card subscribe-panel">
      <div className="subscribe-head">
        <span className="subscribe-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path fill="var(--blue)" d="M12 1.5 4 4.8v5.7c0 4.9 3.4 9.2 8 10.3 4.6-1.1 8-5.4 8-10.3V4.8L12 1.5Z" />
            <path fill="#fff" d="m10.6 14.7-2.6-2.6 1.3-1.3 1.3 1.3 3.5-3.5 1.3 1.3-4.8 4.8Z" />
          </svg>
        </span>
        <h3>Итгэлтэй, бодит мэдээлэл</h3>
      </div>
      <p>Шинэ мэдээ, онцлох контентоо имэйлээр аваарай.</p>
      <div className="subscribe-form">
        <input type="email" placeholder="Таны и-мэйл" />
        <button type="button">Бүртгүүлэх</button>
      </div>
      <small>
        Бүртгүүлснээр Та манай <a href="/policy">Нууцлалын бодлогыг</a> зөвшөөрч байна.
      </small>
    </div>
  );
}

function SocialCard() {
  return (
    <div className="panel-card social-panel">
      <div className="section-head"><span className="bar" /><h3>СОШИАЛ ХОЛБООС</h3></div>
      <div className="social-icons">
        <a className="soc fb" href="https://www.facebook.com/share/18S8xE4tLi/" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
        <a className="soc tw" href="https://x.com/SonorNews" target="_blank" rel="noreferrer" aria-label="X">x</a>
        <a className="soc yt" href="https://youtube.com/@sonornews" target="_blank" rel="noreferrer" aria-label="YouTube">▶</a>
        <a className="soc ig" href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">◎</a>
        <a className="soc tg" href="https://telegram.org" target="_blank" rel="noreferrer" aria-label="Telegram">✈</a>
      </div>
    </div>
  );
}

export default function HomePage({ heroStory, spotlightStories, cardStories, featureStories, videos }: Props) {
  const hero = heroStory ?? featureStories[0];
  const secondary = spotlightStories.length > 0 ? spotlightStories : featureStories.slice(1, 4);
  const cards = cardStories.length > 0 ? cardStories.slice(0, 4) : featureStories.slice(0, 4);

  return (
    <div className="home-shell">
      <Seo path="/" />
      <div className="home-main">
        <div className="top-main">
          <div className="hero-column">
            {hero ? (
              <NewsCard
                variant="hero"
                href={hero.url}
                title={hero.title}
                excerpt={hero.excerpt}
                image={hero.image}
                cat={hero.cat}
                catLabel={(CATS[hero.cat] ?? CATS.uih).label}
                time={hero.time}
                views={viewCount(hero.views)}
                readTime="3 мин унших"
              />
            ) : null}
          </div>

          <div className="spotlight-column stack-card">
            {secondary.map(story => (
              <NewsCard
                key={story.id}
                variant="list"
                href={story.url}
                title={story.title}
                cat={story.cat}
                catLabel={(CATS[story.cat] ?? CATS.uih).label}
                time={story.time}
                views={viewCount(story.views)}
              />
            ))}
          </div>
        </div>

        <section className="news-section">
          <SectionTitle title="ШИНЭ МЭДЭЭ" />
          <div className="news-grid">
            {cards.map(story => (
              <NewsCard
                key={story.id}
                variant="grid"
                href={story.url}
                title={story.title}
                image={story.image}
                cat={story.cat}
                catLabel={(CATS[story.cat] ?? CATS.uih).label}
                time={story.time}
                views={viewCount(story.views)}
              />
            ))}
          </div>
        </section>
      </div>

      <aside className="right-column">
        <VideoCard video={videos[0] ?? null} />
        <SubscribeCard />
        <SocialCard />
      </aside>
    </div>
  );
}
