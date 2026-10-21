import { notFound } from "next/navigation";
import { getAdminBlogPosts, getAdminAuthors, getAdminBlogCategories, getAdminBlogTags } from "@/server/queries/admin";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;

  const [posts, authors, categories, tags] = await Promise.all([
    getAdminBlogPosts(),
    getAdminAuthors(),
    getAdminBlogCategories(),
    getAdminBlogTags(),
  ]);

  const post = posts.find((p) => p.id === id);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          Edit Post
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5 font-serif">
          &ldquo;{post.title}&rdquo;
        </p>
      </div>

      <BlogPostForm initialPost={post} authors={authors} categories={categories} tags={tags} />
    </div>
  );
}
