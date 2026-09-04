import { Helmet } from "react-helmet-async";

const SITE_URL = "https://gradient-todo-vibe.lovable.app";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}

export const SEO = ({ title, description, path, noindex }: SEOProps) => {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content="noindex, follow" /> : null}
      {noindex ? null : <link rel="canonical" href={url} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};
