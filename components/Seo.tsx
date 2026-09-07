import Head from 'next/head';

const SITE = 'Сонор.мн';
const SITE_URL = 'https://www.sonornews.mn';
const DEFAULT_DESC =
  'Хараат бус, шуурхай, итгэлтэй мэдээллийн эх сурвалж — улс төр, эдийн засаг, нийгмийн мэдээ.';
const DEFAULT_IMAGE = `${SITE_URL}/logo/Sonor.png`;

interface SeoProps {
  title?: string;
  description?: string;
  image?: string | null;
  path?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const ORG_LOGO = `${SITE_URL}/logo/Sonor.png`;

const organizationJsonLd = {
  '@type': 'Organization',
  name: SITE,
  url: SITE_URL,
  logo: ORG_LOGO,
};

export default function Seo({
  title,
  description,
  image,
  path,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  jsonLd,
}: SeoProps) {
  const fullTitle = title ? `${title} — ${SITE}` : `${SITE} — Хараат бус, шуурхай мэдээ`;
  const desc = description || DEFAULT_DESC;
  const url = `${SITE_URL}${path || ''}`;
  const img = image || DEFAULT_IMAGE;
  const ldEntries = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <link rel="canonical" href={url} />
      {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? (
        <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
      ) : null}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE} />
      <meta property="og:locale" content="mn_MN" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      {type === 'article' && publishedTime ? <meta property="article:published_time" content={publishedTime} /> : null}
      {type === 'article' && modifiedTime ? <meta property="article:modified_time" content={modifiedTime} /> : null}
      {type === 'article' && author ? <meta property="article:author" content={author} /> : null}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      {ldEntries.map((entry, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', ...entry }) }}
        />
      ))}
    </Head>
  );
}

export { organizationJsonLd, SITE, SITE_URL, ORG_LOGO };
