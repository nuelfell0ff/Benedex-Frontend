import { Helmet } from "react-helmet-async";

const SITE_URL = "https://benedex.org";
const DEFAULT_IMAGE = `${SITE_URL}/og-preview.jpg`;

function SEO({
  title = "Benedex | Digital Learning & Technology",
  description = "Benedex is a digital learning platform offering online courses, practical learning experiences, and technology education to help students build valuable real-world skills.",
  path = "/",
  image = DEFAULT_IMAGE,
  noIndex = false,
}) {
  const canonicalUrl = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <html lang="en" />

      <title>{title}</title>

      <meta
        name="description"
        content={description}
      />

      <meta
        name="robots"
        content={
          noIndex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large"
        }
      />

      <link
        rel="canonical"
        href={canonicalUrl}
      />

      <meta
        property="og:type"
        content="website"
      />

      <meta
        property="og:site_name"
        content="Benedex"
      />

      <meta
        property="og:url"
        content={canonicalUrl}
      />

      <meta
        property="og:title"
        content={title}
      />

      <meta
        property="og:description"
        content={description}
      />

      <meta
        property="og:image"
        content={image}
      />

      <meta
        property="og:image:alt"
        content={title}
      />

      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content={title}
      />

      <meta
        name="twitter:description"
        content={description}
      />

      <meta
        name="twitter:image"
        content={image}
      />
    </Helmet>
  );
}

export default SEO;