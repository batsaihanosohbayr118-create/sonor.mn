import React from 'react';
import { useRouter } from 'next/router';
import ArticleCard from '@/components/ArticleCard';
import { CATS, Article } from '@/data/newsData';
import { getArticles } from '@/lib/articlesStore';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps<{ articles: Article[] }> = async () => {
  return {
    props: {
      articles: await getArticles(),
    },
  };
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

export default function PoliticsPage({ articles: allArticles }: Props) {
  const router = useRouter();
  const { cat, search } = router.query;
  const selectedCat = typeof cat === 'string' ? cat : '';
  const query = typeof search === 'string' ? search.toLowerCase().trim() : '';

  const articles = allArticles.filter(article => {
    const matchesCat = selectedCat ? article.cat === selectedCat : true;
    const matchesSearch = query
      ? [article.title, article.excerpt, article.body.join(' ')].some(text => text.toLowerCase().includes(query))
      : true;
    return matchesCat && matchesSearch;
  });

  const pageTitle = selectedCat ? `${CATS[selectedCat]?.label ?? 'Мэдээ'} мэдээ` : 'Улс төрийн мэдээ';

  return (
    <div className="policy">
      <h1>{pageTitle}</h1>
      <p className="viewsub">{articles.length} мэдээ байна</p>
      <div className="featlist">
        {articles.map(article => <ArticleCard key={article.id} article={article} />)}
      </div>
    </div>
  );
}
