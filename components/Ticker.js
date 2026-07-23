import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Ticker() {
  const [headline, setHeadline] = useState({
    title: '1212.mn-ээс сүүлийн статистикийн шинэчлэлийг татаж байна...',
    url: '/politics',
    time: 'ШУУРХАЙ',
  });

  useEffect(() => {
    let alive = true;

    fetch('/api/official-feed?limit=6')
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(json => {
        if (!alive || !Array.isArray(json.items) || json.items.length === 0) return;
        const item = json.items[0];
        setHeadline({
          title: item.title,
          url: item.url,
          time: item.time || 'ШУУРХАЙ',
        });
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="ticker">
      <div className="wrap ticker-inner">
        <div className="ticker-left">
          <span className="ticker-tag">ШУУРХАЙ</span>
          <span className="ticker-time">07:45</span>
        </div>
        <div className="ticker-track">
          <a href={headline.url} className="ticker-link" target={headline.url.startsWith('http') ? '_blank' : undefined} rel={headline.url.startsWith('http') ? 'noreferrer' : undefined}>
            {headline.title}
            <span className="ticker-arrow">›</span>
          </a>
        </div>
        <Link href="/politics" className="ticker-all">
          Бүгдийг харах <span>•</span>
        </Link>
      </div>
    </div>
  );
}

