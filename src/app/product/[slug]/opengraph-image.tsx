import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/server/queries/products";

export const runtime = "edge";
export const alt = "Zahra Luxe Couture";
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
  const product = await getProductBySlug(slug);

  const title = product ? product.name : "Luxury Pakistani Eastern Wear";
  const price = product ? `PKR ${product.price_pkr.toLocaleString()}` : "";
  const subtitle = product ? (product.details?.fabric ?? "Handcrafted Atelier Couture") : "Handcrafted Atelier Couture";

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
            letterSpacing: "0.3em",
            fontSize: "14px",
            color: "#C5A059",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          Z A H R A &nbsp; L U X E
        </div>

        <div
          style={{
            fontSize: "52px",
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
            fontSize: "20px",
            color: "#A8A29E",
            textAlign: "center",
            marginBottom: "32px",
            fontStyle: "italic",
          }}
        >
          {subtitle}
        </div>

        {price && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(197, 160, 89, 0.15)",
              border: "1px solid #C5A059",
              padding: "10px 28px",
              color: "#C5A059",
              fontSize: "24px",
              letterSpacing: "0.1em",
            }}
          >
            {price}
          </div>
        )}
      </div>
    ),
    {
      ...size,
    },
  );
}
