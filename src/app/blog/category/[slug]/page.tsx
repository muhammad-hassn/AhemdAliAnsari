import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getBlogPosts, getBlogCategories } from "@/server/queries/blog";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getBlogCategories();
  const category = categories.find((c) => c.slug === slug);
  const name = category?.name || slug;

  return {
    title: `${name} — Journal | Ali Ahmed Ansari`,
    description: `Discover articles, crafts, and updates regarding ${name} at Ali Ahmed Ansari.`,
  };
}

export default async function BlogCategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page, 10) : 1;

  const [categories, { posts, totalPages }] = await Promise.all([
    getBlogCategories(),
    getBlogPosts({ page: currentPage, limit: 9, categorySlug: slug }),
  ]);

  const currentCategory = categories.find((c) => c.slug === slug);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <section className="pt-24 pb-12 border-b border-stone-200 text-center px-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Stories
        </Link>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#C5A059] font-medium mb-2">
          Category
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-stone-900 font-normal tracking-wide">
          {currentCategory?.name || slug}
        </h1>
        {currentCategory?.description && (
          <p className="max-w-xl mx-auto mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            {currentCategory.description}
          </p>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-stone-200 p-8">
            <p className="font-serif text-xl text-stone-700">No stories found in this category.</p>
            <Link
              href="/blog"
              className="mt-6 inline-block px-5 py-2 bg-stone-900 text-white text-xs uppercase tracking-wider"
            >
              Browse All Stories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group bg-white border border-stone-200 overflow-hidden flex flex-col justify-between hover:border-stone-400 transition-colors"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden">
                    <Image
                      src={post.cover_image_url}
                      alt={post.cover_alt || post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>

                  <div className="p-6 space-y-3">
                    <p className="text-[10px] uppercase font-mono text-stone-400">
                      {post.published_at
                        ? format(new Date(post.published_at), "MMM d, yyyy")
                        : "Recent"}
                    </p>
                    <h2 className="font-serif text-xl text-stone-900 group-hover:text-[#C5A059] transition-colors leading-snug">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
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
                    className="text-xs uppercase tracking-wider font-medium text-stone-900 hover:text-[#C5A059] inline-flex items-center gap-1"
                  >
                    Read <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            {currentPage > 1 && (
              <Link
                href={`/blog/category/${slug}?page=${currentPage - 1}`}
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
                href={`/blog/category/${slug}?page=${currentPage + 1}`}
                className="px-4 py-2 border border-stone-200 text-xs uppercase tracking-wider text-stone-700 hover:bg-stone-100"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
