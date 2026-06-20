import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Article } from '@/data/newsData';
import type { TwitterPoliticsItem } from '@/lib/twitterPolitics';

interface TwitterPoliticsResponse {
  items: TwitterPoliticsItem[];
  configured: boolean;
}

interface FeaturedListProps {
  featuredArticles: Article[];
}

export default function FeaturedList({ featuredArticles }: FeaturedListProps) {
  const [twitterItems, setTwitterItems] = useState<TwitterPoliticsItem[]>([]);

  useEffect(() => {
    let alive = true;

    fetch('/api/twitter-politics')
      .then(response => response.ok ? response.json() : Promise.reject())
      .then((json: TwitterPoliticsResponse) => {
        if (alive && json.items.length > 0) {
          setTwitterItems(json.items);
        }
      })
      .catch(() => {
        if (alive) setTwitterItems([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="card featlist">
      <div className="head">{twitterItems.length > 0 ? 'X-ээс онцлох' : 'Онцлох'}</div>
      <div className="pad">
        <div className="featlist">
          {twitterItems.length > 0 ? (
            twitterItems.map((item, i) => (
              <a key={item.id} href={item.url} target="_blank" rel="noreferrer">
                <div>
                  <div className="n">{i + 1}</div>
                  <span className="t">
                    {item.title}
                    <small className="x-meta">@{item.username} · {item.time}</small>
                  </span>
                </div>
              </a>
            ))
          ) : (
            featuredArticles.map((a, i) => {
              return (
                <Link key={a.id} href={`/articles/${a.id}`}>
                  <div>
                    <div className="n">{i + 1}</div>
                    <span className="t">{a.title}</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
