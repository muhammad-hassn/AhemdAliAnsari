"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import type { HeroSlide } from "@/types";
import { saveHeroSlideAction, deleteHeroSlideAction } from "@/server/actions/admin";
import { ConfirmDialog } from "./ConfirmDialog";

interface HomepageManagerClientProps {
  initialSlides: HeroSlide[];
}

export function HomepageManagerClient({ initialSlides }: HomepageManagerClientProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide({ ...slide });
  };

  const handleCreateNew = () => {
    setEditingSlide({
      heading: "",
      subheading: "",
      desktop_image_url: "",
      mobile_image_url: "",
      cta_text: "Explore Collection",
      cta_link: "/shop",
      sort_order: slides.length + 1,
      is_active: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    if (!editingSlide.heading || !editingSlide.desktop_image_url || !editingSlide.cta_text || !editingSlide.cta_link) {
      setError("Please fill in all required fields (Heading, Desktop Image, CTA text & link).");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await saveHeroSlideAction(
      editingSlide as Partial<HeroSlide> & { heading: string; desktop_image_url: string; cta_text: string; cta_link: string },
    );

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to save slide");
      return;
    }

    const savedId = res.data?.id;
    if (!savedId) {
      setError("Failed to save slide: missing ID");
      return;
    }

    setSlides((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === savedId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...(editingSlide as HeroSlide), id: savedId };
        return updated.sort((a, b) => a.sort_order - b.sort_order);
      } else {
        return [...prev, { ...(editingSlide as HeroSlide), id: savedId }].sort((a, b) => a.sort_order - b.sort_order);
      }
    });
    setEditingSlide(null);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    const res = await deleteHeroSlideAction(deletingId);
    setLoading(false);

    if (res.success) {
      setSlides((prev) => prev.filter((s) => s.id !== deletingId));
      setDeletingId(null);
    } else {
      setError(res.error || "Failed to delete slide");
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center bg-white border border-stone-200 p-4">
        <div>
          <h2 className="text-sm font-medium text-stone-900 uppercase tracking-wider">
            Hero Carousel Slides ({slides.length})
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage full-width luxury banners displayed at the top of the homepage.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs uppercase tracking-wider font-medium hover:bg-stone-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Slide
        </button>
      </div>

      {/* Slides Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="bg-white border border-stone-200 overflow-hidden flex flex-col justify-between"
          >
            <div className="relative aspect-[16/9] w-full bg-stone-100 overflow-hidden">
              {slide.desktop_image_url ? (
                <Image
                  src={slide.desktop_image_url}
                  alt={slide.heading}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                  No image
                </div>
              )}
              <div className="absolute top-2 right-2">
                {slide.is_active ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-900/80 text-emerald-100 text-[10px] uppercase tracking-wider backdrop-blur-sm">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-900/80 text-stone-300 text-[10px] uppercase tracking-wider backdrop-blur-sm">
                    <XCircle className="w-3 h-3" /> Inactive
                  </span>
                )}
              </div>
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 backdrop-blur-sm">
                Order: #{slide.sort_order}
              </div>
            </div>

            <div className="p-4 space-y-2 flex-1">
              <h3 className="font-serif text-lg text-stone-900 font-normal">{slide.heading}</h3>
              {slide.subheading && (
                <p className="text-xs text-stone-600 line-clamp-2">{slide.subheading}</p>
              )}
              <div className="pt-2 flex items-center gap-2 text-xs text-stone-500">
                <span className="font-medium text-stone-700">Button:</span>
                <span>{slide.cta_text} &rarr; {slide.cta_link}</span>
              </div>
            </div>

            <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex justify-end gap-2">
              <button
                onClick={() => handleEdit(slide)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-stone-700 hover:text-stone-900 hover:bg-stone-200 border border-stone-200 bg-white transition-colors"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={() => setDeletingId(slide.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 bg-white transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-stone-200 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h3 className="font-serif text-xl text-stone-900">
              {editingSlide.id ? "Edit Hero Slide" : "New Hero Slide"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Heading *
                </label>
                <input
                  type="text"
                  required
                  value={editingSlide.heading || ""}
                  onChange={(e) => setEditingSlide((prev) => ({ ...prev, heading: e.target.value }))}
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                  placeholder="e.g. Royal Velvet Festive '26"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Subheading
                </label>
                <input
                  type="text"
                  value={editingSlide.subheading || ""}
                  onChange={(e) => setEditingSlide((prev) => ({ ...prev, subheading: e.target.value }))}
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                  placeholder="e.g. Handcrafted zardozi artistry on pure silk velvet."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Desktop Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={editingSlide.desktop_image_url || ""}
                  onChange={(e) => setEditingSlide((prev) => ({ ...prev, desktop_image_url: e.target.value }))}
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Mobile Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={editingSlide.mobile_image_url || ""}
                  onChange={(e) => setEditingSlide((prev) => ({ ...prev, mobile_image_url: e.target.value }))}
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    CTA Button Text *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlide.cta_text || ""}
                    onChange={(e) => setEditingSlide((prev) => ({ ...prev, cta_text: e.target.value }))}
                    className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                    placeholder="Explore Collection"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    CTA Link URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlide.cta_link || ""}
                    onChange={(e) => setEditingSlide((prev) => ({ ...prev, cta_link: e.target.value }))}
                    className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                    placeholder="/shop or /collections/velvet"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={editingSlide.sort_order ?? 0}
                    onChange={(e) => setEditingSlide((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
                    className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="slide-is-active"
                    checked={editingSlide.is_active ?? true}
                    onChange={(e) => setEditingSlide((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <label htmlFor="slide-is-active" className="text-xs text-stone-700 font-medium">
                    Active / Published
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 text-xs uppercase tracking-wider hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-stone-900 text-white text-xs uppercase tracking-wider font-medium hover:bg-stone-800 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title="Delete Hero Slide"
        description="Are you sure you want to delete this hero slide? This action cannot be undone."
        confirmLabel={loading ? "Deleting..." : "Delete"}
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
