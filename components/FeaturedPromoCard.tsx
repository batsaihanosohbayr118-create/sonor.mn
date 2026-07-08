import React from 'react';
import { Ad, Video } from '@/data/newsData';
import AdBanner from '@/components/AdBanner';

interface FeaturedPromoCardProps {
  ads: Ad[];
  video: Video | null;
}

export default function FeaturedPromoCard({ ads, video }: FeaturedPromoCardProps) {
  if (ads.length === 0 && !video) return null;

  return (
    <div className="card promo-card">
      <div className="promo-grid">
        {ads.length > 0 && <AdBanner ads={ads} />}
        {video && (
          <div className="video-embed">
            <div className="video-frame">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                title={video.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <span className="video-title">{video.title}</span>
          </div>
        )}
      </div>
    </div>
  );
}