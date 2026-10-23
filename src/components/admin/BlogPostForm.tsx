"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormSection } from "@/components/admin/FormSection";
import { AdminSeoPanel } from "@/components/admin/AdminSeoPanel";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import { saveBlogPostAction } from "@/server/actions/admin";
import type { BlogPost, Author, BlogCategory, BlogTag } from "@/types";

interface BlogPostFormProps {
  initialPost?: BlogPost | null;
  authors: Author[];
  categories: BlogCategory[];
  tags: BlogTag[];
}

export function BlogPostForm({
  initialPost,
  authors,
  categories,
  tags,
}: BlogPostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [content, setContent] = useState(initialPost?.content || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialPost?.cover_image_url || "");
  const [coverAlt, setCoverAlt] = useState(initialPost?.cover_alt || "");
  const [authorId, setAuthorId] = useState(initialPost?.author_id || "");
  const [categoryId, setCategoryId] = useState(initialPost?.category_id || "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialPost?.tags?.map((t) => t.id) || [],
  );
  const [status, setStatus] = useState<"draft" | "scheduled" | "published">(
    initialPost?.status || "draft",
  );
  const [publishedAt, setPublishedAt] = useState(
    initialPost?.published_at ? initialPost.published_at.slice(0, 16) : "",
  );
  const [isFeatured, setIsFeatured] = useState(initialPost?.is_featured ?? false);
  const [metaTitle, setMetaTitle] = useState(initialPost?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(initialPost?.meta_description || "");
  const [ogImageUrl, setOgImageUrl] = useState(initialPost?.og_image_url || "");
  const [noindex, setNoindex] = useState(initialPost?.noindex ?? false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialPost) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      );
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await saveBlogPostAction({
      id: initialPost?.id,
      title,
      slug,
      excerpt,
      content,
      cover_image_url: coverImageUrl,
      cover_alt: coverAlt,
      author_id: authorId || null,
      category_id: categoryId || null,
      tag_ids: selectedTagIds,
      status,
      published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
      is_featured: isFeatured,
      meta_title: metaTitle,
      meta_description: metaDescription,
      og_image_url: ogImageUrl,
      noindex,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to save post");
      return;
    }

    router.push("/admin/blog");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
          {error}
        </div>
      )}

      <FormSection title="Post Details" description="Title, category, and editorial classification.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Post Title *
            </label>
            <Input
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. The Art of Zardozi Embroidery"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              URL Slug *
            </label>
            <Input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="the-art-of-zardozi-embroidery"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
            Excerpt *
          </label>
          <textarea
            required
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full p-3 border border-stone-300 bg-white text-sm text-stone-900 font-sans focus:outline-none focus:border-stone-900"
            placeholder="A brief compelling intro shown in the post card listing..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Author
            </label>
            <select
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="w-full h-10 px-3 border border-stone-300 bg-white text-sm text-stone-900 font-sans focus:outline-none focus:border-stone-900"
            >
              <option value="">Zahra Luxe Editorial</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-10 px-3 border border-stone-300 bg-white text-sm text-stone-900 font-sans focus:outline-none focus:border-stone-900"
            >
              <option value="">Uncategorised</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const selected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 text-xs border transition-colors font-sans ${
                      selected
                        ? "bg-stone-900 text-white border-stone-900"
                        : "bg-white text-stone-600 border-stone-200 hover:border-stone-900"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </FormSection>

      {/* Cover Image */}
      <FormSection title="Cover Image" description="Hero visual — 16:9 landscape recommended for blog.">
        <div className="space-y-4">
          <SingleImageUploader
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            bucket="product-images"
            label="Cover Image (16:9 Landscape) *"
            helperText="Tap or click to browse image from mobile or laptop. JPG, PNG, WebP supported."
            aspectRatioClass="aspect-[16/9] max-w-md"
          />

          <div className="max-w-md">
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Alt Text (Accessibility & SEO) *
            </label>
            <Input
              required
              value={coverAlt}
              onChange={(e) => setCoverAlt(e.target.value)}
              placeholder="Artisan embroidering zardozi motifs on silk"
            />
          </div>
        </div>
      </FormSection>

      {/* Content Editor */}
      <FormSection title="Post Content" description="Rich editorial content with HTML support.">
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Begin writing your editorial piece here..."
          minHeight="360px"
        />
      </FormSection>

      {/* Publishing */}
      <FormSection title="Publication Settings" description="Status, schedule, and homepage feature.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "scheduled" | "published")}
              className="w-full h-10 px-3 border border-stone-300 bg-white text-sm text-stone-900 font-sans focus:outline-none focus:border-stone-900"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Publish Date / Time
            </label>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full h-10 px-3 border border-stone-300 bg-white text-sm text-stone-900 font-sans focus:outline-none focus:border-stone-900"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none mt-2">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
          />
          <span className="text-xs font-sans text-stone-800 font-medium">
            Feature as Hero Post on Blog Landing Page
          </span>
        </label>
      </FormSection>

      {/* SEO Panel */}
      <AdminSeoPanel
        metaTitle={metaTitle}
        metaDescription={metaDescription}
        slug={`blog/${slug}`}
        ogImage={ogImageUrl}
        noindex={noindex}
        onMetaTitleChange={setMetaTitle}
        onMetaDescriptionChange={setMetaDescription}
        onOgImageChange={setOgImageUrl}
        onNoindexChange={setNoindex}
      />

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-stone-200">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/blog")}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="solid" size="default" disabled={loading}>
          {loading ? "Saving..." : initialPost ? "Update Post" : "Publish Post"}
        </Button>
      </div>
    </form>
  );
}
