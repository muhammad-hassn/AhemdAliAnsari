import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Clock, ArrowLeft, ArrowRight, Tag } from "lucide-react";
import { getBlogPostBySlug, getRelatedPosts } from "@/server/queries/blog";
import { getProducts } from "@/server/queries/products";
import { BlogShareButtons } from "@/components/blog/BlogShareButtons";
import { BlogTableOfContents } from "@/components/blog/BlogTableOfContents";

export const revalidate = 3600;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Story Not Found | Zahra Luxe",
    };
  }

  const title = post.meta_title || `${post.title} | Zahra Luxe Atelier`;
  const description = post.meta_description || post.excerpt;
  const ogImage = post.og_image_url || post.cover_image_url;

  return {
    title,
    description,
    robots: post.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.published_at || undefined,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: ogImage ? [{ url: ogImage, alt: post.cover_alt || post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const [relatedPosts, relatedProducts] = await Promise.all([
    getRelatedPosts(post.id, post.category_id, 3),
    getProducts({ perPage: 4 }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: [post.cover_image_url],
    datePublished: post.published_at || new Date().toISOString(),
    dateModified: post.updated_at || post.published_at || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: post.author?.name || "Zahra Luxe Editorial Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Zahra Luxe",
      logo: {
        "@type": "ImageObject",
        url: "https://zahraluxe.com/logo.png",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen bg-[#FDFBF7]">
        {/* Back Link & Breadcrumb Header */}
        <div className="pt-24 pb-8 max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Journal
          </Link>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider font-mono text-stone-500">
              {post.category && (
                <Link
                  href={`/blog/category/${post.category.slug}`}
                  className="text-[#C5A059] font-medium hover:underline"
                >
                  {post.category.name}
                </Link>
              )}
              <span>&bull;</span>
              <span>
                {post.published_at ? format(new Date(post.published_at), "MMMM d, yyyy") : ""}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {post.reading_time} min read
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-900 font-normal leading-tight">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-stone-600 font-serif italic leading-relaxed pt-2">
              {post.excerpt}
            </p>

            {/* Author info & Share Bar */}
            <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {post.author?.avatar_url && (
                  <Image
                    src={post.author.avatar_url}
                    alt={post.author.name}
                    width={44}
                    height={44}
                    className="rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-xs font-medium text-stone-900 uppercase tracking-wider">
                    {post.author?.name || "Zahra Luxe Editorial"}
                  </p>
                  {post.author?.bio && (
                    <p className="text-[11px] text-stone-500 line-clamp-1">{post.author.bio}</p>
                  )}
                </div>
              </div>

              <BlogShareButtons title={post.title} slug={post.slug} />
            </div>
          </div>
        </div>

        {/* Hero Cover Image */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
          <div className="relative aspect-[16/9] w-full bg-stone-100 overflow-hidden border border-stone-200">
            <Image
              src={post.cover_image_url}
              alt={post.cover_alt || post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>
          {post.cover_alt && (
            <p className="text-[11px] text-stone-500 text-center mt-2 italic">
              {post.cover_alt}
            </p>
          )}
        </div>

        {/* Content Body with TOC */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-28 space-y-6">
                <BlogTableOfContents contentHtml={post.content} />
              </div>
            </aside>

            <main className="lg:col-span-8">
              <div
                className="prose prose-stone max-w-none text-stone-800 leading-relaxed text-sm sm:text-base font-sans font-light [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:font-normal [&>h2]:text-stone-900 [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:font-serif [&>h3]:text-xl [&>h3]:font-normal [&>h3]:text-stone-900 [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>blockquote]:border-l-2 [&>blockquote]:border-[#C5A059] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-stone-700"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-6 border-t border-stone-200 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-stone-500 uppercase tracking-wider flex items-center gap-1 mr-2">
                    <Tag className="w-3 h-3" /> Tags:
                  </span>
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/blog/tag/${tag.slug}`}
                      className="text-xs bg-white border border-stone-200 px-3 py-1 text-stone-700 hover:border-stone-900 transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Related Products Showcase */}
        {relatedProducts.products.length > 0 && (
          <section className="bg-white border-t border-stone-200 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium mb-1">
                  Featured Couture
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-normal">
                  Silhouettes Mentioned In This Story
                </h2>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.products.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group flex flex-col"
                  >
                    <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden mb-3 border border-stone-100">
                      {product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                      )}
                    </div>
                    <h3 className="font-serif text-sm text-stone-900 group-hover:text-[#C5A059] transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-stone-500 font-mono mt-1">
                      PKR {product.price_pkr.toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Stories */}
        {relatedPosts.length > 0 && (
          <section className="bg-[#FAF8F5] border-t border-stone-200 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium mb-1">
                    Keep Reading
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-normal">
                    Related Journal Stories
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="text-xs uppercase tracking-wider text-stone-900 hover:text-[#C5A059] inline-flex items-center gap-1 font-medium"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((related: { id: string; slug: string; title: string; cover_image_url: string; cover_alt: string; excerpt: string; published_at: string | null; reading_time: number; author?: { name: string } | null }) => (
                  <article
                    key={related.id}
                    className="group bg-white border border-stone-200 overflow-hidden flex flex-col justify-between hover:border-stone-400 transition-colors"
                  >
                    <div>
                      <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                        <Image
                          src={related.cover_image_url}
                          alt={related.cover_alt || related.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      <div className="p-5 space-y-2">
                        <p className="text-[10px] uppercase font-mono text-stone-400">
                          {related.published_at
                            ? format(new Date(related.published_at), "MMM d, yyyy")
                            : "Recent"}
                        </p>
                        <h3 className="font-serif text-base text-stone-900 group-hover:text-[#C5A059] transition-colors leading-snug">
                          <Link href={`/blog/${related.slug}`}>{related.title}</Link>
                        </h3>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
