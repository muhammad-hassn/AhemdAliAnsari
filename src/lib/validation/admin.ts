import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  collection_id: z.string().uuid().nullable().optional(),
  price_pkr: z.coerce.number().positive("Price must be greater than 0"),
  compare_at_price_pkr: z.coerce.number().positive().nullable().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  fabric: z.string().min(2, "Fabric is required"),
  trouser: z.string().optional(),
  dupatta: z.string().optional(),
  sizes: z.array(z.string()).min(1, "Select at least one size"),
  stock: z.record(z.string(), z.coerce.number().int().nonnegative()),
  images: z.array(z.string()).min(1, "At least one image is required"),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  meta_title: z.string().max(70).optional(),
  meta_description: z.string().max(160).optional(),
});

export type ProductInput = z.infer<typeof ProductSchema>;

export const CollectionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Collection name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().min(5, "Description is required"),
  image_url: z.string().min(1, "Image URL is required"),
  sort_order: z.coerce.number().int().default(0),
});

export type CollectionInput = z.infer<typeof CollectionSchema>;

export const BlogPostSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  cover_image_url: z.string().min(1, "Cover image URL is required"),
  cover_alt: z.string().min(2, "Cover alt text is required"),
  author_id: z.string().uuid().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  tag_ids: z.array(z.string().uuid()).default([]),
  status: z.enum(["draft", "scheduled", "published"]).default("draft"),
  published_at: z.string().nullable().optional(),
  is_featured: z.boolean().default(false),
  meta_title: z.string().max(70).optional(),
  meta_description: z.string().max(160).optional(),
  og_image_url: z.string().optional(),
  canonical_url: z.string().optional(),
  noindex: z.boolean().default(false),
});

export type BlogPostInput = z.infer<typeof BlogPostSchema>;

export const PageSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(2),
  content: z.string().min(10),
  meta_title: z.string().max(70).optional(),
  meta_description: z.string().max(160).optional(),
  hero_image_url: z.string().optional(),
});

export type PageInput = z.infer<typeof PageSchema>;

export const RedirectSchema = z.object({
  id: z.string().uuid().optional(),
  from_path: z.string().min(1).startsWith("/", "Path must start with /"),
  to_path: z.string().min(1),
  status_code: z.coerce.number().refine((val) => val === 301 || val === 302, "Status code must be 301 or 302"),
  is_active: z.boolean().default(true),
});

export type RedirectInput = z.infer<typeof RedirectSchema>;
