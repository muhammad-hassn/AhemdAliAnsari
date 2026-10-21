import { getBlogPosts } from "@/server/queries/blog";

export const dynamic = "force-dynamic";

export async function GET() {
  const { posts } = await getBlogPosts({ limit: 50 });
  const siteUrl = "https://zahraluxe.com";

  const itemsXml = posts
    .map((post) => {
      const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : new Date().toUTCString();
      const escapedTitle = post.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const escapedExcerpt = post.excerpt.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const link = `${siteUrl}/blog/${post.slug}`;

      return `
    <item>
      <title>${escapedTitle}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapedExcerpt}</description>
      <author>${post.author?.name || "Zahra Luxe"}</author>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Atelier Journal | Zahra Luxe</title>
    <link>${siteUrl}/blog</link>
    <description>Chronicles of Pakistani luxury Eastern-wear craftsmanship and bridal heritage.</description>
    <language>en</language>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
