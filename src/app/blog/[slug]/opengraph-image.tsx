import { ImageResponse } from "next/og";
import { getBlogPostBySlug } from "@/server/queries/blog";

export const alt = "The Atelier Journal — Ali Ahmed Ansari";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  const title = post ? post.title : "The Atelier Journal";
  const category = post?.category?.name || "Chronicles of Craft";
  const readTime = post ? `${post.reading_time} MIN READ` : "EDITORIAL";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1C1917",
          color: "#FDFBF7",
          padding: "60px 80px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Subtle Gold Border Frame */}
        <div
          style={{
            position: "absolute",
            inset: "20px",
            border: "1px solid #C5A059",
            opacity: 0.4,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            letterSpacing: "0.25em",
            fontSize: "13px",
            color: "#C5A059",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          THE ATELIER JOURNAL &bull; ALI AHMED ANSARI
        </div>

        <div
          style={{
            fontSize: "48px",
            fontWeight: "normal",
            textAlign: "center",
            lineHeight: 1.25,
            maxWidth: "920px",
            color: "#FDFBF7",
            marginBottom: "24px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "14px",
            letterSpacing: "0.15em",
            color: "#A8A29E",
            textTransform: "uppercase",
          }}
        >
          <span>{category}</span>
          <span>&bull;</span>
          <span>{readTime}</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
