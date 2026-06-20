import React from 'react';
import Link from 'next/link';
import { CATS, Article } from '@/data/newsData';
import ArticleCard from '@/components/ArticleCard';
import { getArticleById, getArticles } from '@/lib/articlesStore';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps<{ article: Article; relatedArticles: Article[] }> = async ({ params }) => {
  if (!params?.id) return { notFound: true };
  
  const article = await getArticleById(parseInt(params.id as string));
  if (!article) return { notFound: true };

  const articles = await getArticles();
  const relatedArticles = articles.filter(x => x.id !== article.id && x.cat === article.cat).slice(0, 2);

  return {
    props: {
      article,
      relatedArticles,
    },
  };
}

interface ArticleDetailProps {
  article: Article;
  relatedArticles: Article[];
}

export default function ArticleDetail({ article, relatedArticles }: ArticleDetailProps) {
  const category = CATS[article.cat];

  return (
    <div className="article">
      <Link href="/" className="backlink">← Буцах</Link>

      <span className={`cat ${category.color}`}>{category.label}</span>
      <h1>{article.title}</h1>
      <div className="meta">{article.author} · {article.time}</div>

      <div className="lead-row">
        <div className="thumb lead-thumb">
          {article.image || category.image ? (
            <img src={article.image || category.image} alt={article.title} />
          ) : (
            category.icon
          )}
        </div>
        <div className="lead-info content">
          {article.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>

      <div className="src">{article.src}</div>
      {relatedArticles.length > 0 && (
        <>
          <div className="seclabel"><span className="bar"></span><h3>Холбоотой мэдээ</h3></div>
          {relatedArticles.map(related => <ArticleCard key={related.id} article={related} />)}
        </>
      )}
    </div>
  );
}