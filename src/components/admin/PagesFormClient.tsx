"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Eye,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormSection } from "@/components/admin/FormSection";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { AdminSeoPanel } from "@/components/admin/AdminSeoPanel";
import { savePageAction } from "@/server/actions/admin";
import { SafeHtml } from "@/components/ui/SafeHtml";

const PAGE_METADATA: Record<
  string,
  { label: string; defaultTitle: string; path: string; defaultContent: string }
> = {
  about: {
    label: "About Us",
    defaultTitle: "About Ahmed Ali Ansari",
    path: "/about",
    defaultContent: `<h2>Craftsmanship, Lineage & Timeless Elegance</h2>
<p>Rooted in Lahore's rich textile heritage, <strong>Ahmed Ali Ansari</strong> is dedicated to the art of luxury Eastern fashion, premium fabrics, and bespoke pret. Every ensemble reflects an uncompromised commitment to quality, refined aesthetics, and the enduring grace of South Asian couture.</p>

<h3>Our Philosophy</h3>
<p>We believe that luxury lies in subtlety and substance. Rather than fleeting trends, Ahmed Ali Ansari focuses on heirloom-worthy garments crafted with purpose and precision. From intimate festive gatherings to grand formal occasions, our collections are created to make every wearer feel confident, regal, and uniquely distinguished.</p>

<h3>Artisanal Needlework & Pure Textiles</h3>
<p>Our ateliers bring together master artisans specializing in traditional embroidery techniques: delicate resham threadwork, antique tilla, intricate zardozi, and meticulous bead embellishments. We source only premium-grade textiles — pure chiffons, hand-loomed raw silks, gossamer organzas, and rich velvets — ensuring each silhouette drapes with effortless fluidity.</p>

<h3>Customer-Focused Bespoke Care</h3>
<p>Whether you are shopping ready-to-wear kurtis or custom-tailored occasion wear, our team is committed to a seamless and trustworthy shopping experience. We offer bespoke sizing consultations, direct WhatsApp support, and reliable doorstep delivery across Pakistan and worldwide.</p>`,
  },
  privacy: {
    label: "Privacy Policy",
    defaultTitle: "Privacy Policy",
    path: "/privacy",
    defaultContent: `<h2>Your Privacy at Ahmed Ali Ansari</h2>
<p>At <strong>Ahmed Ali Ansari</strong>, we value the trust you place in us when sharing your personal information. This Privacy Policy outlines how we collect, handle, protect, and use your data when you visit our website, communicate with us, or place an order.</p>

<h3>Information We Collect</h3>
<p>When you browse our storefront, register an account, or complete a purchase, we may collect the following details:</p>
<ul>
  <li>Contact details including your full name, email address, phone number, and delivery address.</li>
  <li>Custom measurements and tailoring preferences provided for bespoke orders.</li>
  <li>Order transaction details and communication records.</li>
  <li>Technical browsing data (such as browser type and device identifiers) to improve your browsing experience.</li>
</ul>

<h3>How We Use Your Information</h3>
<p>We process your data exclusively for legitimate business purposes:</p>
<ul>
  <li>Fulfilling, processing, and delivering your orders.</li>
  <li>Providing customer care, order tracking updates, and tailoring assistance.</li>
  <li>Notifying you about order status or important service announcements.</li>
  <li>Improving website performance, security, and user convenience.</li>
</ul>

<h3>Data Protection & Confidentiality</h3>
<p>We maintain strict administrative, technical, and physical security measures to safeguard your personal data. We do not sell, rent, or trade your personal information to third parties.</p>

<h3>Contact Our Privacy Desk</h3>
<p>If you have any questions, requests to review your information, or concerns about our privacy practices, please contact us at <a href="mailto:aahmedaliansariofficial@gmail.com">aahmedaliansariofficial@gmail.com</a> or via phone at +92 309 2045906.</p>`,
  },
  refund: {
    label: "Refund Policy",
    defaultTitle: "Refund & Exchange Policy",
    path: "/refund",
    defaultContent: `<h2>Our Commitment to Quality</h2>
<p>At <strong>Ahmed Ali Ansari</strong>, every garment undergoes thorough multi-point quality inspection before dispatch to ensure impeccable stitching, embroidery, and finishing.</p>

<h3>Eligibility for Exchanges</h3>
<p>We accept exchange requests within <strong>7 days</strong> of delivery under the following conditions:</p>
<ul>
  <li>The item is unworn, unwashed, unaltered, and in its original pristine condition.</li>
  <li>All original brand tags, labels, and packaging remain intact.</li>
  <li>Proof of purchase (order confirmation or receipt) is provided.</li>
</ul>

<h3>Bespoke & Made-to-Order Items</h3>
<p>Due to the personalized nature of bespoke couture and garments made to custom measurements, these pieces are non-refundable. However, we gladly provide complimentary alteration assistance if the delivered size differs from your confirmed measurements.</p>

<h3>Defective or Incorrect Deliveries</h3>
<p>In the unlikely event that you receive a damaged, defective, or incorrect ensemble, please notify us within <strong>48 hours</strong> of receipt with clear photographic proof via WhatsApp (+92 309 2045906) or email. We will arrange a prompt replacement at no extra cost.</p>

<h3>Initiating a Request</h3>
<p>To initiate an exchange or inquiry, please contact our support team at <a href="mailto:aahmedaliansariofficial@gmail.com">aahmedaliansariofficial@gmail.com</a> with your order number.</p>`,
  },
  terms: {
    label: "Terms of Service",
    defaultTitle: "Terms and Conditions",
    path: "/terms",
    defaultContent: `<h2>Website Terms & Conditions</h2>
<p>Welcome to <strong>Ahmed Ali Ansari</strong>. By accessing our website, browsing our collections, or placing an order, you agree to comply with and be bound by the following terms and conditions.</p>

<h3>1. General Terms</h3>
<p>These terms govern your use of the Ahmed Ali Ansari website and all associated services. We reserve the right to revise or update these terms at any time. Continued use of the platform constitutes acceptance of any updates.</p>

<h3>2. Product Representation & Colors</h3>
<p>We make every effort to display the colors, textures, and details of our embroidered fabrics accurately. However, slight variations may occur due to photography lighting, monitor displays, and the artisanal nature of hand-dyeing and needlework.</p>

<h3>3. Pricing & Orders</h3>
<p>All prices are listed in Pakistani Rupees (PKR) and foreign currency equivalents where applicable. Prices and availability are subject to change without notice. We reserve the right to refuse or cancel any order in the event of pricing errors or inventory constraints.</p>

<h3>4. Intellectual Property</h3>
<p>All content on this website, including designs, photographs, brand identity, text, and graphics, is the exclusive property of Ahmed Ali Ansari and is protected by copyright and intellectual property laws.</p>

<h3>5. Contact Information</h3>
<p>For questions regarding our terms of service, reach out to <a href="mailto:aahmedaliansariofficial@gmail.com">aahmedaliansariofficial@gmail.com</a>.</p>`,
  },
  shipping: {
    label: "Shipping Policy",
    defaultTitle: "Shipping Policy",
    path: "/shipping",
    defaultContent: `<h2>Delivery & Dispatch Information</h2>
<p><strong>Ahmed Ali Ansari</strong> delivers luxury Eastern ensembles across Pakistan and internationally with trusted express courier partners.</p>

<h3>Domestic Shipping (Pakistan)</h3>
<ul>
  <li><strong>Standard Delivery:</strong> 3 to 5 business days after order processing.</li>
  <li><strong>Complimentary Delivery:</strong> Complimentary shipping on all domestic orders above <strong>PKR 15,000</strong>.</li>
  <li><strong>Standard Shipping Fee:</strong> PKR 250 on orders below the complimentary threshold.</li>
</ul>

<h3>International Shipping</h3>
<ul>
  <li>We ship worldwide via reputable international couriers (DHL / FedEx).</li>
  <li><strong>Delivery Timeline:</strong> Typically 7 to 14 business days depending on destination customs clearance.</li>
  <li><strong>Customs & Duties:</strong> Any applicable import duties, customs taxes, or clearance fees levied by the destination country are the recipient's responsibility.</li>
</ul>

<h3>Order Tracking</h3>
<p>Once your parcel is dispatched, you will receive a tracking number via email or SMS, allowing you to track your delivery progress online.</p>

<h3>Need Assistance?</h3>
<p>For urgent deliveries or special requests, please contact our concierge team at <a href="mailto:aahmedaliansariofficial@gmail.com">aahmedaliansariofficial@gmail.com</a> or WhatsApp +92 309 2045906.</p>`,
  },
};

interface Page {
  key: string;
  title: string;
  content: string;
  meta_title?: string | null;
  meta_description?: string | null;
  hero_image_url?: string | null;
}

interface PageState {
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  heroImageUrl: string;
}

interface PagesFormClientProps {
  pages: Page[];
}

export function PagesFormClient({ pages }: PagesFormClientProps) {
  const [activeKey, setActiveKey] = useState("about");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Initialize state with database values if available, or sensible starter defaults
  const [pageStates, setPageStates] = useState<Record<string, PageState>>(() => {
    const init: Record<string, PageState> = {};
    const pageMap = new Map(pages.map((p) => [p.key, p]));

    for (const [key, meta] of Object.entries(PAGE_METADATA)) {
      const existing = pageMap.get(key);
      init[key] = {
        title: existing?.title || meta.defaultTitle,
        content: existing?.content || meta.defaultContent,
        metaTitle: existing?.meta_title || `${meta.defaultTitle} | Ahmed Ali Ansari`,
        metaDescription:
          existing?.meta_description ||
          `Official ${meta.defaultTitle.toLowerCase()} for Ahmed Ali Ansari luxury Eastern wear and fabrics.`,
        heroImageUrl: existing?.hero_image_url || "",
      };
    }
    return init;
  });

  const currentMeta = PAGE_METADATA[activeKey] || PAGE_METADATA.about;
  const current = pageStates[activeKey] || {
    title: currentMeta.defaultTitle,
    content: currentMeta.defaultContent,
    metaTitle: "",
    metaDescription: "",
    heroImageUrl: "",
  };

  const update = (field: keyof PageState, val: string) => {
    setPageStates((prev) => ({
      ...prev,
      [activeKey]: { ...prev[activeKey], [field]: val },
    }));
  };

  const handleResetToDefault = () => {
    if (
      !confirm(
        `Are you sure you want to restore the default starter template for "${currentMeta.label}"? Unsaved changes will be replaced.`,
      )
    ) {
      return;
    }
    setPageStates((prev) => ({
      ...prev,
      [activeKey]: {
        title: currentMeta.defaultTitle,
        content: currentMeta.defaultContent,
        metaTitle: `${currentMeta.defaultTitle} | Ahmed Ali Ansari`,
        metaDescription: `Official ${currentMeta.defaultTitle.toLowerCase()} for Ahmed Ali Ansari luxury Eastern wear and fabrics.`,
        heroImageUrl: "",
      },
    }));
    setSuccessMsg("Restored default starter content. Click 'Save Page' to persist.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSave = async () => {
    if (!current.title.trim()) {
      setErrorMsg("Page Title is required.");
      return;
    }
    if (!current.content.trim()) {
      setErrorMsg("Page Content cannot be empty.");
      return;
    }

    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const res = await savePageAction({
      key: activeKey,
      title: current.title.trim(),
      content: current.content.trim(),
      meta_title: current.metaTitle?.trim() || undefined,
      meta_description: current.metaDescription?.trim() || undefined,
      hero_image_url: current.heroImageUrl?.trim() || undefined,
    });

    setSaving(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to save page.");
    } else {
      setSuccessMsg(`"${current.title}" saved successfully to the database and published live.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      {/* Left Sidebar: Page Selector */}
      <div className="lg:w-64 shrink-0 space-y-4">
        <div className="border border-stone-200 bg-white overflow-hidden shadow-xs">
          <p className="text-[10px] uppercase tracking-widest font-mono text-stone-500 px-4 py-3 border-b border-stone-100 font-semibold flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            Pages & Policies ({Object.keys(PAGE_METADATA).length})
          </p>
          {Object.entries(PAGE_METADATA).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActiveKey(key);
                setSuccessMsg(null);
                setErrorMsg(null);
              }}
              className={`w-full text-left px-4 py-3 text-xs font-sans transition-colors border-b border-stone-100 last:border-0 flex items-center justify-between cursor-pointer ${
                activeKey === key
                  ? "bg-stone-900 text-white font-medium shadow-inner"
                  : "text-stone-700 hover:bg-stone-50"
              }`}
            >
              <span>{meta.label}</span>
              <span
                className={`text-[10px] font-mono uppercase ${
                  activeKey === key ? "text-stone-300" : "text-stone-400"
                }`}
              >
                {key}
              </span>
            </button>
          ))}
        </div>

        {/* Quick link to live public page */}
        <div className="p-4 bg-stone-50 border border-stone-200 rounded space-y-2">
          <p className="text-xs font-medium text-stone-800">Public Live URL</p>
          <p className="text-[11px] text-stone-500 font-mono break-all">{currentMeta.path}</p>
          <Link
            href={currentMeta.path}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-stone-700 hover:text-stone-900 font-medium underline underline-offset-2 pt-1"
          >
            <span>Open live page</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Editor & Content Area */}
      <div className="flex-1 space-y-6">
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans flex items-center gap-2 rounded">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-sans flex items-center gap-2 rounded">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <FormSection
          title={`${currentMeta.label} (${activeKey})`}
          description="Edit formatted rich content, titles, and SEO meta tags. Changes persist to the database."
          action={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewOpen(true)}
                className="h-8 text-xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                Preview
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetToDefault}
                className="h-8 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                title="Restore sensible default starter template"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset Template
              </Button>
              <Button
                type="button"
                variant="solid"
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="h-8 text-xs cursor-pointer bg-stone-900 text-white hover:bg-stone-800"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                {saving ? "Saving..." : "Save Page"}
              </Button>
            </div>
          }
        >
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Page Title *
            </label>
            <input
              required
              value={current.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full h-10 px-3 border border-stone-300 bg-white text-sm text-stone-900 font-sans focus:outline-none focus:border-stone-900"
              placeholder="e.g. About Ahmed Ali Ansari"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-2">
              Page Content (Rich Text / HTML) *
            </label>
            <RichTextEditor
              value={current.content}
              onChange={(val) => update("content", val)}
              placeholder="Write rich HTML content with headings, lists, bold text, and paragraphs..."
              minHeight="340px"
            />
          </div>
        </FormSection>

        {/* SEO Panel */}
        <AdminSeoPanel
          metaTitle={current.metaTitle}
          metaDescription={current.metaDescription}
          slug={activeKey}
          onMetaTitleChange={(val) => update("metaTitle", val)}
          onMetaDescriptionChange={(val) => update("metaDescription", val)}
        />
      </div>

      {/* Live Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-ivory text-ink border border-stone-300 shadow-2xl max-h-[88vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-cream">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gold font-sans font-medium">
                  Page Preview Mode
                </span>
                <h3 className="font-heading text-xl text-ink font-light">{current.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-10 overflow-y-auto space-y-6 flex-1 bg-ivory">
              <div className="border-b border-stone-200 pb-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-sans font-medium">
                  Ahmed Ali Ansari
                </span>
                <h1 className="font-heading text-3xl sm:text-4xl font-light text-ink mt-1">
                  {current.title}
                </h1>
                <p className="text-xs text-stone-500 font-mono mt-1">
                  Public URL: https://ahmedaliansari.com{currentMeta.path}
                </p>
              </div>

              <div className="prose prose-stone max-w-none text-sm font-sans leading-relaxed text-stone-800">
                <SafeHtml html={current.content} />
              </div>
            </div>

            <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewOpen(false)}
                className="text-xs"
              >
                Close Preview
              </Button>
              <Button
                type="button"
                variant="solid"
                size="sm"
                onClick={() => {
                  setPreviewOpen(false);
                  handleSave();
                }}
                disabled={saving}
                className="text-xs bg-stone-900 text-white"
              >
                {saving ? "Saving..." : "Save & Publish Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
