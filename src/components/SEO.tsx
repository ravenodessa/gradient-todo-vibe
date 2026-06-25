import { Helmet } from "react-helmet-async";

const SITE_URL = "https://gradient-todo-vibe.lovable.app";

interface SEOProps {
  title: string;
  description: string;
  path: string;
}

export const SEO = ({ title, description, path }: SEOProps) => {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
};
