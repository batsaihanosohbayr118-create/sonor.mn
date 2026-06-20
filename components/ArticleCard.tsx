import React from 'react';
import Link from 'next/link';
import { CATS, Article } from '@/data/newsData';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const category = CATS[article.cat];
  const catLabelColor = category.color === 'red' ? 'var(--red)' : (category.color === 'navy' ? 'var(--navy)' : 'var(--blue)');

  return (
    <Link href={`/articles/${article.id}`} className="row">
      <div
        className="thumb"
        style={{ width: '104px', minWidth: '104px', height: '74px', borderRadius: '8px', fontSize: '23px', overflow: 'hidden' }}
      >
        {article.image ? <img src={article.image} alt={article.title} /> : category.image ? <img src={category.image} alt={category.label} /> : category.icon}
      </div>
      <div>
        <span className="ecat" style={{ color: catLabelColor }}>{category.label}</span>
        <h4>{article.title}</h4>
        <div className="meta">{article.time}</div>
      </div>
    </Link>
  );
}
