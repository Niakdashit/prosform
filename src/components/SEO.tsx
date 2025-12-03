import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

const defaultMeta = {
  title: 'Prosform - Créez des campagnes marketing interactives',
  description: 'Créez des roues de la fortune, quiz, jeux à gratter et plus encore. Transformez vos visiteurs en leads qualifiés avec des expériences gamifiées.',
  image: '/og-image.png',
  url: 'https://prosform.com',
};

export default function SEO({
  title,
  description = defaultMeta.description,
  image = defaultMeta.image,
  url = defaultMeta.url,
  type = 'website',
  noIndex = false,
}: SEOProps) {
  const fullTitle = title 
    ? `${title} | Prosform` 
    : defaultMeta.title;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#7c3aed" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
