import { ImageResponse } from "next/og";
import { getCollectionBySlug } from "@/server/queries/collections";

export const runtime = "edge";
export const alt = "Zahra Luxe Collection";
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
  const collection = await getCollectionBySlug(slug);

  const title = collection ? collection.name : "Luxury Eastern Wear Collection";
  const subtitle = collection?.description || "Handcrafted Pakistani Formal Wear & Couture";

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
            letterSpacing: "0.3em",
            fontSize: "14px",
            color: "#C5A059",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          Z A H R A &nbsp; L U X E &nbsp; C O L L E C T I O N
        </div>

        <div
          style={{
            fontSize: "56px",
            fontWeight: "normal",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: "900px",
            color: "#FDFBF7",
            marginBottom: "16px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: "18px",
            color: "#A8A29E",
            textAlign: "center",
            maxWidth: "700px",
            fontStyle: "italic",
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
