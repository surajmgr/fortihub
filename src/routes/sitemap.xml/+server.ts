export async function GET({ url }: { url: URL }) {
    const modules = import.meta.glob('../docs/**/+page.svelte');
    const pages = Object.keys(modules).map((path) => {
        // Convert relative path to route path
        // e.g., "../docs/getting-started/+page.svelte" -> "/docs/getting-started"
        return path
            .replace('../docs', '/docs')
            .replace('/+page.svelte', '')
            .replace('/+page.ts', '') // Handle .ts page loads if any (though glob is for svelte)
            .replace('/+page.js', '');
    });

    // Add root page
    const allPages = ['/', '/docs', ...pages.filter((p) => p !== '/docs')]; // Filter out /docs if it was picked up (it should be, but just to be safe/clean)

    const body = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
>
  ${allPages
            .map(
                (path) => `
  <url>
    <loc>${url.origin}${path}</loc>
    <changefreq>daily</changefreq>
    <priority>${path === '/' ? '1.0' : '0.7'}</priority>
  </url>
  `
            )
            .join('')}
</urlset>`;

    return new Response(body, {
        headers: {
            'Cache-Control': 'max-age=0, s-maxage=3600',
            'Content-Type': 'application/xml'
        }
    });
}
