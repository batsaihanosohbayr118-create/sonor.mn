import React from 'react';
import Link from 'next/link';

export type NewsCardVariant = 'hero' | 'grid' | 'list';

export interface NewsCardProps {
  variant: NewsCardVariant;
  href: string;
  title: string;
  catLabel: string;
  /** category key (e.g. 'uih', 'economy') — drives the image fallback gradient */
  cat?: string;
  excerpt?: string;
  image?: string | null;
  /** fallback glyph shown in the thumbnail when no image is available */
  icon?: string;
  time?: string;
  views?: string;
  readTime?: string;
  /** list variant only: render a leading thumbnail */
  thumb?: boolean;
}

function CardLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  if (href.startsWith('http')) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function Media({
  image,
  title,
  cat,
  icon,
}: {
  image?: string | null;
  title: string;
  cat?: string;
  icon?: string;
}) {
  if (image) return <img src={image} alt={title} />;
  if (icon) return <span className="card-fallback-icon">{icon}</span>;
  return <div className={`hero-fallback${cat ? ` ${cat}` : ''}`} />;
}

export default function NewsCard(props: NewsCardProps) {
  const { variant, href, title, catLabel, cat, excerpt, image, icon, time, views, readTime } = props;

  if (variant === 'hero') {
    return (
      <CardLink href={href} className="hero-card">
        <div className="hero-card-media">
          <Media image={image} title={title} cat={cat} />
          <div className="hero-card-overlay" />
          <span className="cat-chip">{catLabel}</span>
        </div>
        <div className="hero-card-body">
          <h2>{title}</h2>
          {excerpt ? <p>{excerpt}</p> : null}
          <div className="card-meta light">
            {time ? <span>{time}</span> : null}
            {views ? <span>👁 {views}</span> : null}
            {readTime ? <span>🕐 {readTime}</span> : null}
          </div>
        </div>
      </CardLink>
    );
  }

  if (variant === 'grid') {
    return (
      <CardLink href={href} className="news-card">
        <div className="news-card-media">
          <Media image={image} title={title} cat={cat} icon={icon} />
        </div>
        <div className="news-card-body">
          <span className="cat-label">{catLabel}</span>
          <h3>{title}</h3>
          <div className="card-meta">
            {time ? <span>{time}</span> : null}
            {views ? <span>👁 {views}</span> : null}
          </div>
        </div>
      </CardLink>
    );
  }

  // list
  return (
    <CardLink href={href} className={`list-item${props.thumb ? ' has-thumb' : ''}`}>
      {props.thumb ? (
        <div className="list-thumb">
          <Media image={image} title={title} cat={cat} icon={icon} />
        </div>
      ) : null}
      <div className="list-body">
        <span className="cat-label">{catLabel}</span>
        <h3>{title}</h3>
        <div className="card-meta">
          {time ? <span>{time}</span> : null}
          {views ? <span>👁 {views}</span> : null}
        </div>
      </div>
    </CardLink>
  );
}
