import React from 'react';
import { CATS, Article } from '@/data/newsData';
import NewsCard from '@/components/NewsCard';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const category = CATS[article.cat];

  return (
    <NewsCard
      variant="list"
      thumb
      href={`/articles/${article.id}`}
      title={article.title}
      image={article.image || category.image || null}
      cat={article.cat}
      catLabel={category.label}
      icon={category.icon}
      time={article.time}
    />
  );
}
