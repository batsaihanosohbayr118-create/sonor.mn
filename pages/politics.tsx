import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginTop: '16px',
      }}>
        {articles.map(article => {
          const category = CATS[article.cat];
          const catColor = category.color === 'red' ? 'var(--red)' : category.color === 'navy' ? 'var(--navy)' : 'var(--blue)';
          return (
            <Link key={article.id} href={`/articles/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e4e7eb', background: '#fff' }}>
                <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#f0f2f4' }}>
                  {article.image
                    ? <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : category.image
                    ? <img src={category.image} alt={category.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '40px' }}>{category.icon}</div>
                  }
                </div>
                <div style={{ padding: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: catColor }}>{category.label}</span>
                  <h4 style={{ margin: '4px 0 6px', fontSize: '15px', lineHeight: 1.4 }}>{article.title}</h4>
                  <div style={{ fontSize: '12px', color: '#8b919b' }}>{article.time}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}