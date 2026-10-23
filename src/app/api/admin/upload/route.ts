import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

// Conservative limit — must not exceed the smallest bucket's configured file_size_limit (10 MB).
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_BUCKETS = new Set(["hero-images", "promotions", "product-images"]);

export async function POST(req: NextRequest) {
  try {
    // 1. Authorization check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in to upload images." },
        { status: 401 },
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "editor"].includes(profile.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not have permission to upload files." },
        { status: 403 },
      );
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get("file");
    const requestedBucket = (formData.get("bucket") as string) || "hero-images";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 },
      );
    }

    const bucket = ALLOWED_BUCKETS.has(requestedBucket) ? requestedBucket : "hero-images";

    // 3. Validation
    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type (${file.type}). Please select a JPG, PNG, or WebP image.`,
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the 10MB limit (current: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
        },
        { status: 400 },
      );
    }

    // 4. Generate clean persistent filename
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const baseName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const destinationPath = `${baseName || "image"}-${uniqueSuffix}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // 5. Upload to persistent Supabase Storage
    const serviceClient = createServiceClient();
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from(bucket)
      .upload(destinationPath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError || !uploadData) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        {
          success: false,
          error: uploadError?.message || "Failed to persist image to cloud storage.",
        },
        { status: 500 },
      );
    }

    // 6. Retrieve public permanent URL
    const { data: publicUrlData } = serviceClient.storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: uploadData.path,
      bucket,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal upload server error.",
      },
      { status: 500 },
    );
  }
}
