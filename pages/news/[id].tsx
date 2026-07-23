import React from 'react';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { CATS } from '@/data/newsData';
import { getOfficialArticle, getOfficialFeed, OfficialArticle, OfficialFeedItem } from '@/lib/officialFeed';
import Seo from '@/components/Seo';

interface NewsDetailProps {
  article: OfficialArticle;
  related: OfficialFeedItem[];
}

export const getServerSideProps: GetServerSideProps<NewsDetailProps> = async ({ params }) => {
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params?.id[0] : '';
  if (!id) return { notFound: true };

  const article = await getOfficialArticle(id);
  if (!article) return { notFound: true };

  const feed = await getOfficialFeed(6).catch(() => []);
  const related = feed.filter(item => item.id !== article.id).slice(0, 3);

  return { props: { article, related } };
};

export default function NewsDetail({ article, related }: NewsDetailProps) {
  const category = CATS.economy;

  return (
    <div className="article">
      <Seo
        title={article.title}
        description={article.paragraphs[0]?.slice(0, 160)}
        image={article.image}
        path={`/news/${article.id}`}
        type="article"
      />
      <Link href="/economy" className="backlink">← Буцах</Link>

      <span className={`cat ${category.color}`}>{category.label}</span>
      <h1>{article.title}</h1>
      <div className="meta">1212.mn · {article.time}</div>

      {article.image ? (
        <div className="thumb lead-thumb">
          <img src={article.image} alt={article.title} />
        </div>
      ) : null}

      <div className="content">
        {article.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <div className="src">
        Эх сурвалж:{' '}
        <a href={article.sourceUrl} target="_blank" rel="noreferrer">
          Үндэсний статистикийн хороо (1212.mn)
        </a>
      </div>

      {related.length > 0 && (
        <>
          <div className="section-head"><span className="bar" /><h3>Холбоотой мэдээ</h3></div>
          <div className="stack-card">
            {related.map(item => (
              <Link key={item.id} href={item.url} className="list-item">
                <div className="list-body">
                  <span className="cat-label">{category.label}</span>
                  <h3>{item.title}</h3>
                  <div className="card-meta">
                    {item.time ? <span>{item.time}</span> : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
