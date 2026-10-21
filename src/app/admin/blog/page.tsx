import { getAdminBlogPosts } from "@/server/queries/admin";
import { BlogListTable, BlogListHeader } from "@/components/admin/BlogListTable";

export default async function AdminBlogPage() {
  const posts = await getAdminBlogPosts();

  return (
    <div className="space-y-6">
      <BlogListHeader />
      <BlogListTable posts={posts} />
    </div>
  );
}
