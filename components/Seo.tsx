import Head from 'next/head';

const SITE = 'Сонор.мн';
const SITE_URL = 'https://sonor.mn';
const DEFAULT_DESC =
  'Хараат бус, шуурхай, итгэлтэй мэдээллийн эх сурвалж — улс төр, эдийн засаг, нийгмийн мэдээ.';
const DEFAULT_IMAGE = `${SITE_URL}/logo/Sonor.png`;

interface SeoProps {
  title?: string;
  description?: string;
  image?: string | null;
  path?: string;
  type?: 'website' | 'article';
}

export default function Seo({ title, description, image, path, type = 'website' }: SeoProps) {
  const fullTitle = title ? `${title} — ${SITE}` : `${SITE} — Хараат бус, шуурхай мэдээ`;
  const desc = description || DEFAULT_DESC;
  const url = `${SITE_URL}${path || ''}`;
  const img = image || DEFAULT_IMAGE;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE} />
      <meta property="og:locale" content="mn_MN" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
    </Head>
  );
}
