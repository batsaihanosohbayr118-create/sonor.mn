import React from 'react';
import { useRouter } from 'next/router';
import { CATS, Article } from '@/data/newsData';
import { getArticles } from '@/lib/articlesStore';
import { getOfficialFeed, OfficialFeedItem } from '@/lib/officialFeed';
import NewsCard from '@/components/NewsCard';
import Seo from '@/components/Seo';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export const getServerSideProps: GetServerSideProps<{
  articles: Article[];
  economyFeed: OfficialFeedItem[];
}> = async () => {
  const [articles, economyFeed] = await Promise.all([
    getArticles(),
    getOfficialFeed(12).catch(() => []),
  ]);

  return {
    props: { articles, economyFeed },
  };
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

type CardItem = {
  id: string;
  title: string;
  href: string;
  image: string | null;
  cat: keyof typeof CATS;
  catLabel: string;
  icon?: string;
  time?: string;
};

export default function PoliticsPage({ articles: allArticles, economyFeed }: Props) {
  const router = useRouter();
  const { cat, search } = router.query;
  const selectedCat = typeof cat === 'string' ? cat : '';
  const query = typeof search === 'string' ? search.toLowerCase().trim() : '';

  const matchesSearch = (texts: string[]) =>
    query ? texts.some(text => text.toLowerCase().includes(query)) : true;

  const articleCards: CardItem[] = allArticles
    .filter(article => (selectedCat ? article.cat === selectedCat : true))
    .filter(article => matchesSearch([article.title, article.excerpt, article.body.join(' ')]))
    .map(article => {
      const category = CATS[article.cat];
      return {
        id: `article-${article.id}`,
        title: article.title,
        href: `/articles/${article.id}`,
        image: article.image || category.image || null,
        cat: article.cat,
        catLabel: category.label,
        icon: category.icon,
        time: article.time,
      };
    });

  // 1212.mn economy feed shows up on the economy category page.
  const showEconomyFeed = selectedCat === 'economy';
  const feedCards: CardItem[] = showEconomyFeed
    ? economyFeed
        .filter(item => matchesSearch([item.title, item.excerpt ?? '']))
        .map(item => ({
          id: `feed-${item.id}`,
          title: item.title,
          href: item.url,
          image: item.image ?? CATS.economy.image ?? null,
          cat: 'economy',
          catLabel: CATS.economy.label,
          time: item.time,
        }))
    : [];

  const cards = [...feedCards, ...articleCards];

  const pageTitle = selectedCat ? `${CATS[selectedCat]?.label ?? 'Мэдээ'} мэдээ` : 'Улс төрийн мэдээ';

  return (
    <div className="list-page">
      <Seo title={pageTitle} path={selectedCat ? `/politics?cat=${selectedCat}` : '/politics'} />
      <div className="page-head"><span className="bar" /><h1>{pageTitle}</h1></div>
      <p className="list-sub">{cards.length} мэдээ байна</p>
      <div className="news-grid">
        {cards.map(card => (
          <NewsCard
            key={card.id}
            variant="grid"
            href={card.href}
            title={card.title}
            image={card.image}
            cat={card.cat}
            catLabel={card.catLabel}
            icon={card.icon}
            time={card.time}
          />
        ))}
      </div>
    </div>
  );
}
