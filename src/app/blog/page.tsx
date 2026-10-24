import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Clock, ArrowRight } from "lucide-react";
import { getBlogPosts, getFeaturedBlogPost, getBlogCategories } from "@/server/queries/blog";

export const metadata: Metadata = {
  title: "The Atelier Journal | Ali Ahmed Ansari",
  description:
    "Explore the craftsmanship, heritage embroidery techniques, bridal styling notes, and festive luxury collections from Ali Ahmed Ansari.",
  openGraph: {
    title: "The Atelier Journal | Ali Ahmed Ansari",
    description:
      "Explore the craftsmanship, heritage embroidery techniques, bridal styling notes, and festive luxury collections from Ali Ahmed Ansari.",
    type: "website",
  },
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function BlogIndexPage({ searchParams }: BlogPageProps) {
  const resolvedParams = await searchParams;
  const currentPage = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;
  const categorySlug = resolvedParams.category;

  const [featuredPost, { posts, totalPages }, categories] = await Promise.all([
    getFeaturedBlogPost(),
    getBlogPosts({ page: currentPage, limit: 9, categorySlug }),
    getBlogCategories(),
  ]);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Journal Header */}
      <section className="pt-24 pb-12 border-b border-stone-200 text-center px-4">
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#C5A059] font-medium mb-3">
          Chronicles of Craft & Elegance
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-stone-900 font-normal tracking-wide">
          The Atelier Journal
        </h1>
        <p className="max-w-xl mx-auto mt-4 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
          Insights into heritage Pakistani craftsmanship, royal zardozi artistry, bridal chronicles,
          and contemporary luxury silhouette inspirations.
        </p>

        {/* Category Filter Tabs */}
        {categories.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            <Link
              href="/blog"
              className={`px-4 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                !categorySlug
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All Articles
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog?category=${cat.slug}`}
                className={`px-4 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                  categorySlug === cat.slug
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Featured Hero Article */}
        {!categorySlug && currentPage === 1 && featuredPost && (
          <article className="group bg-white border border-stone-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 transition-shadow duration-300 hover:shadow-md">
            <div className="relative aspect-[16/10] lg:aspect-auto lg:col-span-7 bg-stone-100 overflow-hidden">
              <Image
                src={featuredPost.cover_image_url}
                alt={featuredPost.cover_alt || featuredPost.title}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute top-4 left-4 bg-stone-900 text-white text-[10px] uppercase tracking-widest px-3 py-1">
                Featured Editorial
              </div>
            </div>

            <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-stone-500 font-mono">
                  {featuredPost.category && (
                    <span className="text-[#C5A059] font-medium">{featuredPost.category.name}</span>
                  )}
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {featuredPost.reading_time} min read
                  </span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 leading-snug group-hover:text-[#C5A059] transition-colors">
                  <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div className="pt-8 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {featuredPost.author?.avatar_url && (
                    <Image
                      src={featuredPost.author.avatar_url}
                      alt={featuredPost.author.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="text-xs font-medium text-stone-900">
                      {featuredPost.author?.name || "Ali Ahmed Ansari Editorial"}
                    </p>
                    <p className="text-[10px] text-stone-400">
                      {featuredPost.published_at
                        ? format(new Date(featuredPost.published_at), "MMMM d, yyyy")
                        : "Recent"}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-stone-900 font-medium hover:text-[#C5A059] transition-colors"
                >
                  Read Story <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </article>
        )}

        {/* Editorial Grid */}
        <section>
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-stone-200 p-8">
              <p className="font-serif text-xl text-stone-700">No stories found in this section.</p>
              <p className="text-xs text-stone-500 mt-2">
                Check back soon for new releases from our atelier craftsmen.
              </p>
              <Link
                href="/blog"
                className="mt-6 inline-block px-5 py-2 bg-stone-900 text-white text-xs uppercase tracking-wider"
              >
                View All Articles
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group bg-white border border-stone-200 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-stone-400 hover:shadow-sm"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden">
                      <Image
                        src={post.cover_image_url}
                        alt={post.cover_alt || post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {post.category && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-stone-900 text-[10px] uppercase tracking-wider px-2.5 py-1">
                          {post.category.name}
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-stone-400 font-mono">
                        <span>
                          {post.published_at
                            ? format(new Date(post.published_at), "MMM d, yyyy")
                            : "Recent"}
                        </span>
                        <span>&bull;</span>
                        <span>{post.reading_time} min read</span>
                      </div>

                      <h3 className="font-serif text-xl text-stone-900 group-hover:text-[#C5A059] transition-colors leading-snug">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>

                      <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-stone-100 mt-4">
                    <span className="text-[11px] text-stone-500">
                      By {post.author?.name || "Atelier"}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-xs uppercase tracking-wider font-medium text-stone-900 hover:text-[#C5A059] inline-flex items-center gap-1 transition-colors"
                    >
                      Read <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/blog?page=${currentPage - 1}${categorySlug ? `&category=${categorySlug}` : ""}`}
                  className="px-4 py-2 border border-stone-200 text-xs uppercase tracking-wider text-stone-700 hover:bg-stone-100"
                >
                  Previous
                </Link>
              )}
              <span className="px-4 py-2 text-xs font-mono text-stone-500">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={`/blog?page=${currentPage + 1}${categorySlug ? `&category=${categorySlug}` : ""}`}
                  className="px-4 py-2 border border-stone-200 text-xs uppercase tracking-wider text-stone-700 hover:bg-stone-100"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
