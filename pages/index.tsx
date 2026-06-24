import React from 'react';
import { Article, Ad, Video } from '@/data/newsData';
import { Fact, readFacts } from '@/lib/factsStore';
import HeroArticle from '@/components/HeroArticle';
import ArticleCard from '@/components/ArticleCard';
import FeaturedList from '@/components/FeaturedList';
import FactCheckCard from '@/components/FactCheckCard';
import PollCard from '@/components/PollCard';
import AdBanner from '@/components/AdBanner';
import VideoSidebar from '@/components/VideoSidebar';
import { getArticles, getFeaturedArticles } from '@/lib/articlesStore';
import { getActiveAds } from '@/lib/adsStore';
import { getActiveVideos } from '@/lib/videosStore';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps<{
  heroArticle: Article | null;
  politicsArticles: Article[];
  featuredArticles: Article[];
  ads: Ad[];
  videos: Video[];
  latestFact: Fact | null;
}> = async () => {
  const articles = await getArticles();
  const heroArticle = articles.find(article => article.featured) ?? articles[0] ?? null;
  const politicsArticles: Article[] = articles
    .filter((a: Article) => ['uih', 'gov', 'election', 'foreign', 'law', 'party', 'local'].includes(a.cat))
    .slice(0, 3);

  const facts = readFacts();
  const latestFact = facts.length ? facts[facts.length - 1] : null;

  return {
    props: {
      heroArticle,
      politicsArticles,
      featuredArticles: getFeaturedArticles(articles),
      ads: await getActiveAds(),
      videos: await getActiveVideos(),
      latestFact,
    },
  };
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

export default function HomePage({ heroArticle, politicsArticles, featuredArticles, ads, videos, latestFact }: Props) {
  return (
    <div className="grid">
      <div>
        <HeroArticle article={heroArticle} />

        <div className="seclabel">
          <span className="bar"></span>
          <h3>Улс төрийн мэдээ</h3>
        </div>

        {politicsArticles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      <aside className="side">
        <AdBanner ads={ads} />

        <FeaturedList featuredArticles={featuredArticles} />
        <FactCheckCard fact={latestFact} />
        <PollCard />
      </aside>
      <aside className="videoside">
        <VideoSidebar videos={videos} />
      </aside>
    </div>
  );
}