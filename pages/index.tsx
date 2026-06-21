import React from 'react';
import { Article, Ad } from '@/data/newsData';
import HeroArticle from '@/components/HeroArticle';
import ArticleCard from '@/components/ArticleCard';
import FeaturedList from '@/components/FeaturedList';
import FactCheckCard from '@/components/FactCheckCard';
import PollCard from '@/components/PollCard';
import AdBanner from '@/components/AdBanner';
import { getArticles, getFeaturedArticles } from '@/lib/articlesStore';
import { getActiveAds } from '@/lib/adsStore';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps<{
  heroArticle: Article | null;
  politicsArticles: Article[];
  featuredArticles: Article[];
  ads: Ad[];
}> = async () => {
  const articles = await getArticles();
  const heroArticle = articles.find(article => article.featured) ?? articles[0] ?? null;
  const politicsArticles: Article[] = articles
    .filter((a: Article) => ['uih', 'gov', 'election', 'foreign', 'law', 'party', 'local'].includes(a.cat))
    .slice(0, 3);

  return {
    props: {
      heroArticle,
      politicsArticles,
      featuredArticles: getFeaturedArticles(articles),
      ads: await getActiveAds(),
    },
  };
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

export default function HomePage({ heroArticle, politicsArticles, featuredArticles, ads }: Props) {
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
        <FactCheckCard />
        <PollCard />
      </aside>
    </div>
  );
}