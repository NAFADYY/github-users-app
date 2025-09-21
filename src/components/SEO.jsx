
import { Helmet } from "react-helmet-async";

const absoluteUrl = (url) => {
    if (!url) return "";
    // لو url نسبي: حوّله لمطلق بناء على origin
    try {
        return new URL(url, window.location.origin).toString();
    } catch {
        return url;
    }
};

export default function SEO({
    title = "GitHub Users App",
    description = "Explore GitHub users with search, favorites, and details.",
    image = "/social-cover.png",
    keywords = "GitHub, users, search, React, Vite",
    type = "website",
    noindex = false,
    locale = "en",
}) {
    const url = typeof window !== "undefined" ? window.location.href : "https://your-domain.com";
    const canonical = url.split("#")[0];
    const ogImage = absoluteUrl(image);

    return (
        <Helmet prioritizeSeoTags>
            {/* Title */}
            <title>{title}</title>

            {/* Canonical */}
            <link rel="canonical" href={canonical} />

            {/* Base meta */}
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            {noindex && <meta name="robots" content="noindex,nofollow" />}

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content="GitHub Users App" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonical} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:locale" content={locale} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* JSON-LD (Organization مثال) */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    name: title,
                    url: canonical,
                    description,
                    applicationCategory: "DeveloperApplication",
                    inLanguage: locale,
                })}
            </script>
        </Helmet>
    );
}
