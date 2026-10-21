import "server-only";
import { createPublicClient } from "@/lib/supabase/server";
import type { BlogPost, BlogCategory, BlogTag } from "@/types";

export interface BlogFilterOptions {
  page?: number;
  limit?: number;
  categorySlug?: string;
  tagSlug?: string;
  featuredOnly?: boolean;
}

export async function getBlogPosts(options: BlogFilterOptions = {}): Promise<{
  posts: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 9;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const supabase = createPublicClient();
    const now = new Date().toISOString();

    let query = supabase
      .from("blog_posts")
      .select(
        `
        *,
        author:authors(*),
        category:blog_categories(*),
        post_tags(tag:blog_tags(*))
      `,
        { count: "exact" },
      )
      .eq("status", "published")
      .lte("published_at", now)
      .order("published_at", { ascending: false });

    if (options.featuredOnly) {
      query = query.eq("is_featured", true);
    }

    if (options.categorySlug) {
      const { data: category } = await supabase
        .from("blog_categories")
        .select("id")
        .eq("slug", options.categorySlug)
        .single();

      if (category) {
        query = query.eq("category_id", category.id);
      }
    }

    if (options.tagSlug) {
      const { data: tag } = await supabase
        .from("blog_tags")
        .select("id")
        .eq("slug", options.tagSlug)
        .single();

      if (tag) {
        const { data: postTagRows } = await supabase
          .from("post_tags")
          .select("post_id")
          .eq("tag_id", tag.id);
        const postIds = (postTagRows || []).map((r) => r.post_id);
        query = query.in("id", postIds.length > 0 ? postIds : ["00000000-0000-0000-0000-000000000000"]);
      }
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error || !data) {
      return { posts: [], total: 0, page, totalPages: 0 };
    }

    type RawPostTag = { tag: BlogTag | null };
    type RawBlogPost = BlogPost & { post_tags?: RawPostTag[] };

    const posts: BlogPost[] = (data as unknown as RawBlogPost[]).map((post) => {
      const tags: BlogTag[] = (post.post_tags || [])
        .map((pt) => pt.tag)
        .filter((t): t is BlogTag => Boolean(t));
      return {
        ...post,
        tags,
      };
    });

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return { posts, total, page, totalPages };
  } catch {
    return { posts: [], total: 0, page, totalPages: 0 };
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = createPublicClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        `
        *,
        author:authors(*),
        category:blog_categories(*),
        post_tags(tag:blog_tags(*))
      `,
      )
      .eq("slug", slug)
      .eq("status", "published")
      .lte("published_at", now)
      .single();

    if (error || !data) return null;

    type RawPostTag = { tag: BlogTag | null };
    type RawBlogPost = BlogPost & { post_tags?: RawPostTag[] };
    const rawPost = data as unknown as RawBlogPost;

    const tags: BlogTag[] = (rawPost.post_tags || [])
      .map((pt) => pt.tag)
      .filter((t): t is BlogTag => Boolean(t));

    return {
      ...rawPost,
      tags,
    };
  } catch {
    return null;
  }
}

export async function getFeaturedBlogPost(): Promise<BlogPost | null> {
  try {
    const supabase = createPublicClient();
    const now = new Date().toISOString();

    const { data } = await supabase
      .from("blog_posts")
      .select(
        `
        *,
        author:authors(*),
        category:blog_categories(*),
        post_tags(tag:blog_tags(*))
      `,
      )
      .eq("status", "published")
      .lte("published_at", now)
      .order("is_featured", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(1)
      .single();

    if (!data) return null;

    type RawPostTag = { tag: BlogTag | null };
    type RawBlogPost = BlogPost & { post_tags?: RawPostTag[] };
    const rawPost = data as unknown as RawBlogPost;

    const tags: BlogTag[] = (rawPost.post_tags || [])
      .map((pt) => pt.tag)
      .filter((t): t is BlogTag => Boolean(t));

    return {
      ...rawPost,
      tags,
    };
  } catch {
    return null;
  }
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("blog_categories")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data) return [];
    return data as BlogCategory[];
  } catch {
    return [];
  }
}

export async function getBlogTags(): Promise<BlogTag[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("blog_tags")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data) return [];
    return data as BlogTag[];
  } catch {
    return [];
  }
}

export async function getRelatedPosts(
  postId: string,
  categoryId: string | null,
  limit: number = 3,
): Promise<BlogPost[]> {
  try {
    const supabase = createPublicClient();
    const now = new Date().toISOString();

    let query = supabase
      .from("blog_posts")
      .select(
        `
        *,
        author:authors(*),
        category:blog_categories(*)
      `,
      )
      .eq("status", "published")
      .lte("published_at", now)
      .neq("id", postId)
      .limit(limit);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    } else {
      query = query.order("published_at", { ascending: false });
    }

    const { data } = await query;
    return (data as unknown as BlogPost[]) || [];
  } catch {
    return [];
  }
}

export async function getAllBlogSlugs(): Promise<string[]> {
  try {
    const supabase = createPublicClient();
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("status", "published")
      .lte("published_at", now)
      .eq("noindex", false);

    if (!data) return [];
    return data.map((d) => d.slug);
  } catch {
    return [];
  }
}
