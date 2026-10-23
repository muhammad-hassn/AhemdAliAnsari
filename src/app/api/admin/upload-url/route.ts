import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const BUCKET_SIZE_LIMITS: Record<string, number> = {
  "product-images": 10 * 1024 * 1024,
  "hero-images": 20 * 1024 * 1024,
  promotions: 10 * 1024 * 1024,
};

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const ALLOWED_BUCKETS = new Set(Object.keys(BUCKET_SIZE_LIMITS));

export async function POST(req: NextRequest) {
  try {
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

    let body: { bucket?: string; fileName?: string; fileType?: string; fileSize?: number };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 },
      );
    }

    const { fileName, fileType, fileSize } = body;
    const requestedBucket = body.bucket || "hero-images";
    const bucket = ALLOWED_BUCKETS.has(requestedBucket) ? requestedBucket : "hero-images";

    if (!fileName || !fileType || typeof fileSize !== "number") {
      return NextResponse.json(
        { success: false, error: "Missing required fields: fileName, fileType, fileSize." },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.has(fileType.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type (${fileType}). Please select a JPG, PNG, or WebP image.`,
        },
        { status: 400 },
      );
    }

    const maxBytes = BUCKET_SIZE_LIMITS[bucket] ?? 10 * 1024 * 1024;
    if (fileSize > maxBytes) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the ${Math.round(maxBytes / (1024 * 1024))}MB limit (current: ${(fileSize / (1024 * 1024)).toFixed(1)}MB).`,
        },
        { status: 400 },
      );
    }

    const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
    const baseName = fileName
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const destinationPath = `${baseName || "image"}-${uniqueSuffix}.${ext}`;

    const serviceClient = createServiceClient();
    const { data: signedData, error: signError } = await serviceClient.storage
      .from(bucket)
      .createSignedUploadUrl(destinationPath);

    if (signError || !signedData) {
      console.error("Signed URL generation error:", signError);
      return NextResponse.json(
        {
          success: false,
          error: signError?.message || "Failed to generate upload URL. Please try again.",
        },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = serviceClient.storage
      .from(bucket)
      .getPublicUrl(destinationPath);

    return NextResponse.json({
      success: true,
      signedUrl: signedData.signedUrl,
      token: signedData.token,
      path: destinationPath,
      bucket,
      publicUrl: publicUrlData.publicUrl,
    });
  } catch (error) {
    console.error("upload-url route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error.",
      },
      { status: 500 },
    );
  }
}
