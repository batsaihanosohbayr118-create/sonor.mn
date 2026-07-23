import type { GetServerSideProps } from 'next';
import { getArticles } from '@/lib/articlesStore';
import { getOfficialFeed } from '@/lib/officialFeed';

const SITE_URL = 'https://sonor.mn';
const STATIC_PATHS = ['/', '/economy', '/factcheck', '/people', '/policy', '/weather'];

const urlEntry = (loc: string, lastmod?: string) =>
  `<url><loc>${SITE_URL}${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const [articles, feed] = await Promise.all([
    getArticles().catch(() => []),
    getOfficialFeed(30).catch(() => []),
  ]);

  const entries = [
    ...STATIC_PATHS.map(path => urlEntry(path)),
    ...articles.map(article => urlEntry(`/articles/${article.id}`)),
    ...feed.map(item => urlEntry(item.url)), // item.url is an internal /news/{id} path
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
