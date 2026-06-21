import React, { useEffect, useState } from 'react';
import { Ad } from '@/data/newsData';

export default function AdBanner({ ads }: { ads: Ad[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (ads.length <= 1) return;

    const timer = setInterval(() => {
      setIndex(current => (current + 1) % ads.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [ads.length]);

  if (ads.length === 0) return null;

  const ad = ads[index % ads.length];

  return (
    <div className="ad-banner">
      <span className="ad-label">Сурталчилгаа</span>
      {ad.link ? (
        <a href={ad.link} target="_blank" rel="noopener noreferrer">
          <img src={ad.image} alt={ad.title} />
        </a>
      ) : (
        <img src={ad.image} alt={ad.title} />
      )}
    </div>
  );
}