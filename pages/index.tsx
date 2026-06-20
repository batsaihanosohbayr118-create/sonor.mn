import React, { useState, useEffect } from 'react';
import { Article } from '@/data/newsData';
import HeroArticle from '@/components/HeroArticle';
import ArticleCard from '@/components/ArticleCard';
import FeaturedList from '@/components/FeaturedList';
import FactCheckCard from '@/components/FactCheckCard';
import PollCard from '@/components/PollCard';
import { getArticles, getFeaturedArticles } from '@/lib/articlesStore';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps<{
  heroArticle: Article | null;
  politicsArticles: Article[];
  featuredArticles: Article[];
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
    },
  };
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

export default function HomePage({ heroArticle, politicsArticles: staticPolitics, featuredArticles }: Props) {
  const [rssArticles, setRssArticles] = useState<Article[]>([]);
  const [rssLoading, setRssLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rss-fetch')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setRssArticles(data.articles ?? []);
        setRssLoading(false);
      })
      .catch(() => setRssLoading(false));
  }, []);

  const allPoliticsNews = [
    ...rssArticles,
    ...staticPolitics.filter(s => !rssArticles.some(r => r.title === s.title)),
  ];

  return (
    <div className="grid">
      <div>
        <HeroArticle article={heroArticle} />
        <div className="seclabel"><span className="bar"></span><h3>Улс төрийн мэдээ</h3></div>
        {rssLoading ? (
          <p style={{ color: 'var(--muted)', fontSize: '14px', padding: '12px 0' }}>Мэдээ татаж байна...</p>
        ) : (
          allPoliticsNews.map(article => <ArticleCard key={article.id} article={article} />)
        )}
      </div>
      <aside className="side">
        <FeaturedList featuredArticles={featuredArticles} />
        <FactCheckCard />
        <PollCard />
      </aside>
    </div>
  );
}