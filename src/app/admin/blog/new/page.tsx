import {
  getAdminAuthors,
  getAdminBlogCategories,
  getAdminBlogTags,
} from "@/server/queries/admin";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export default async function NewBlogPostPage() {
  const [authors, categories, tags] = await Promise.all([
    getAdminAuthors(),
    getAdminBlogCategories(),
    getAdminBlogTags(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          New Editorial Post
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5">
          Craft a story about style, craft, heritage, or brand culture.
        </p>
      </div>

      <BlogPostForm authors={authors} categories={categories} tags={tags} />
    </div>
  );
}
