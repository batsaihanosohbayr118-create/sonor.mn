import React from 'react';
import { Video } from '@/data/newsData';

interface VideoSidebarProps {
  videos: Video[];
}

export default function VideoSidebar({ videos }: VideoSidebarProps) {
  if (videos.length === 0) return null;

  return (
    <div className="card videolist">
      <div className="head">Онцлох видео</div>
      <div className="pad">
        <div className="videolist-items">
          {videos.map(video => (
            <div key={video.id} className="video-embed">
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
          ))}
        </div>
      </div>
    </div>
  );
}