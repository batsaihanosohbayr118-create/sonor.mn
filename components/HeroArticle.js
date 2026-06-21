import React from 'react';
import Link from 'next/link';
import { CATS } from '@/data/newsData';

export default function HeroArticle({ article }) {
  if (!article) return null; // ← ЭНЭ МӨРИЙГ НЭМЭХ

  const category = CATS[article.cat] ?? CATS['uih']; // ← fallback нэмэх

  return (
    <Link href={`/articles/${article.id}`} className="hero">
      <div className="thumb">
        {article.image || category.image ? (
          <img src={article.image || category.image} alt={article.title || 'hero'} />
        ) : (
          <span className="hero-icon">{category.icon}</span>
        )}
      </div>
      <div className="body">
        <span className={`cat ${category.color}`}>{category.label}</span>
        <h2>{article.title}</h2>
        <p>{article.excerpt}</p>
        <div className="meta"><span>{article.author}</span><span>·</span><span>{article.time}</span></div>
      </div>
    </Link>
  );
}
