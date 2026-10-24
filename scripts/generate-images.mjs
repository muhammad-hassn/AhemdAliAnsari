import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const imagesToCreate = [
  // Collections
  {
    path: "public/images/collections/bridal.jpg",
    width: 800,
    height: 1200,
    title: "Bridal Couture",
    subtitle: "Ali Ahmed Ansari Atelier",
    bg1: "#3D131C",
    bg2: "#5A1F2B",
    accent: "#D4AF37",
  },
  {
    path: "public/images/collections/formals.jpg",
    width: 800,
    height: 1200,
    title: "Luxury Formals",
    subtitle: "Ali Ahmed Ansari Atelier",
    bg1: "#1A2E22",
    bg2: "#2A4736",
    accent: "#B08D57",
  },
  {
    path: "public/images/collections/pret.jpg",
    width: 800,
    height: 1200,
    title: "Festive Pret",
    subtitle: "Ali Ahmed Ansari Atelier",
    bg1: "#473322",
    bg2: "#6B4E36",
    accent: "#E5C287",
  },

  // Hero Slides (1920x1080 and 800x1200)
  {
    path: "public/images/hero/hero-1.jpg",
    width: 1920,
    height: 1080,
    title: "Heirloom Bridal Ensembles",
    subtitle: "Ali Ahmed Ansari — Lahore Atelier",
    bg1: "#1C1412",
    bg2: "#421820",
    accent: "#D4AF37",
  },
  {
    path: "public/images/hero/hero-1-mobile.jpg",
    width: 800,
    height: 1200,
    title: "Heirloom Bridal Ensembles",
    subtitle: "Ali Ahmed Ansari",
    bg1: "#1C1412",
    bg2: "#421820",
    accent: "#D4AF37",
  },
  {
    path: "public/images/hero/hero-2.jpg",
    width: 1920,
    height: 1080,
    title: "Imperial Velvet & Silks",
    subtitle: "Ali Ahmed Ansari — Autumn/Winter",
    bg1: "#121C18",
    bg2: "#283D33",
    accent: "#B08D57",
  },
  {
    path: "public/images/hero/hero-2-mobile.jpg",
    width: 800,
    height: 1200,
    title: "Imperial Velvet & Silks",
    subtitle: "Ali Ahmed Ansari",
    bg1: "#121C18",
    bg2: "#283D33",
    accent: "#B08D57",
  },
  {
    path: "public/images/hero/hero-3.jpg",
    width: 1920,
    height: 1080,
    title: "Festive Pret & Chiffons",
    subtitle: "Ali Ahmed Ansari — Festive Edit",
    bg1: "#2B1A14",
    bg2: "#472C22",
    accent: "#D4AF37",
  },
  {
    path: "public/images/hero/hero-3-mobile.jpg",
    width: 800,
    height: 1200,
    title: "Festive Pret & Chiffons",
    subtitle: "Ali Ahmed Ansari",
    bg1: "#2B1A14",
    bg2: "#472C22",
    accent: "#D4AF37",
  },

  // Craftsmanship
  {
    path: "public/images/craftsmanship.jpg",
    width: 900,
    height: 1200,
    title: "Master Artisans",
    subtitle: "Pure Zardozi Handwork",
    bg1: "#2B231D",
    bg2: "#1C1713",
    accent: "#B08D57",
  },

  // About Hero & Placeholder
  {
    path: "public/images/about-hero.jpg",
    width: 1600,
    height: 900,
    title: "The House of Ali Ahmed Ansari",
    subtitle: "Legacy of Craftsmanship",
    bg1: "#1F1A18",
    bg2: "#382F2B",
    accent: "#D4AF37",
  },
  {
    path: "public/images/placeholder-product.jpg",
    width: 800,
    height: 1200,
    title: "Ali Ahmed Ansari",
    subtitle: "Embroidered Couture",
    bg1: "#2B2623",
    bg2: "#1A1715",
    accent: "#B08D57",
  },
];

// Add 12 products (with 2-3 images each)
const productSeeds = [
  { name: "Zoya Embroidered Chiffon", prefix: "zoya", count: 3, bg1: "#471D27", bg2: "#291016" },
  { name: "Meera Velvet Anarkali", prefix: "meera", count: 3, bg1: "#380D17", bg2: "#1F070D" },
  { name: "Nilofer Sage Zari Peshwas", prefix: "nilofer", count: 3, bg1: "#1B3026", bg2: "#101D17" },
  { name: "Shehnai Crimson Lehenga", prefix: "shehnai", count: 3, bg1: "#4D0C14", bg2: "#290409" },
  { name: "Ayla Antique Gold Gharara", prefix: "ayla", count: 2, bg1: "#3B2E17", bg2: "#1F180B" },
  { name: "Roshni Champagne Kaftan", prefix: "roshni", count: 2, bg1: "#362E27", bg2: "#1F1A15" },
  { name: "Suraiya Rust Angrakha", prefix: "suraiya", count: 2, bg1: "#472115", bg2: "#241009" },
  { name: "Nazia Emerald Jacket", prefix: "nazia", count: 2, bg1: "#11261B", bg2: "#08140E" },
  { name: "Noor Blush Cotton-Silk", prefix: "noor", count: 2, bg1: "#3B282A", bg2: "#241718" },
  { name: "Yasmin Ivory Chikankari", prefix: "yasmin", count: 2, bg1: "#2B2826", bg2: "#1A1817" },
  { name: "Fiza Ochre Linen Tunic", prefix: "fiza", count: 2, bg1: "#3B2B12", bg2: "#211808" },
  { name: "Hira Lilac Pleated Set", prefix: "hira", count: 2, bg1: "#2B212D", bg2: "#17101A" },
];

for (const p of productSeeds) {
  for (let i = 1; i <= p.count; i++) {
    imagesToCreate.push({
      path: `public/images/products/${p.prefix}-${i}.jpg`,
      width: 800,
      height: 1200,
      title: p.name,
      subtitle: `View ${i} — Haute Couture`,
      bg1: p.bg1,
      bg2: p.bg2,
      accent: i === 1 ? "#D4AF37" : "#E5C287",
    });
  }
}

// Instagram posts
for (let i = 1; i <= 6; i++) {
  imagesToCreate.push({
    path: `public/images/instagram/insta-${i}.jpg`,
    width: 600,
    height: 600,
    title: "@aliahmedansari",
    subtitle: `Atelier Moment 0${i}`,
    bg1: "#1E1A17",
    bg2: "#332B25",
    accent: "#B08D57",
  });
}

async function generateAll() {
  for (const item of imagesToCreate) {
    const fullPath = path.resolve(process.cwd(), item.path);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    const cleanTitle = item.title.replace(/&/g, "&amp;");
    const cleanSubtitle = item.subtitle.replace(/&/g, "&amp;");

    const svg = `
      <svg width="${item.width}" height="${item.height}" viewBox="0 0 ${item.width} ${item.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="grad" cx="50%" cy="40%" r="70%" fx="50%" fy="30%">
            <stop offset="0%" stop-color="${item.bg2}" />
            <stop offset="100%" stop-color="${item.bg1}" />
          </radialGradient>
          <pattern id="motif" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M40 10 L50 40 L40 70 L30 40 Z" fill="none" stroke="${item.accent}" stroke-width="0.75" opacity="0.15" />
            <circle cx="40" cy="40" r="4" fill="${item.accent}" opacity="0.12" />
          </pattern>
        </defs>

        <!-- Background -->
        <rect width="${item.width}" height="${item.height}" fill="url(#grad)" />
        <rect width="${item.width}" height="${item.height}" fill="url(#motif)" />

        <!-- Luxury Framing Border -->
        <rect x="24" y="24" width="${item.width - 48}" height="${item.height - 48}" fill="none" stroke="${item.accent}" stroke-width="1" opacity="0.4" />
        <rect x="32" y="32" width="${item.width - 64}" height="${item.height - 64}" fill="none" stroke="${item.accent}" stroke-width="0.5" opacity="0.25" />

        <!-- Center Emblem -->
        <circle cx="${item.width / 2}" cy="${item.height * 0.45}" r="48" fill="none" stroke="${item.accent}" stroke-width="1" opacity="0.4" />
        <circle cx="${item.width / 2}" cy="${item.height * 0.45}" r="40" fill="none" stroke="${item.accent}" stroke-width="0.5" opacity="0.25" />
        <text x="${item.width / 2}" y="${item.height * 0.45 + 8}" font-family="Georgia, serif" font-size="28" font-weight="300" fill="${item.accent}" text-anchor="middle" letter-spacing="4">ZL</text>

        <!-- Typography -->
        <text x="${item.width / 2}" y="${item.height * 0.65}" font-family="Georgia, serif" font-size="${item.width > 900 ? "40" : "26"}" font-weight="300" fill="#FAF6EE" text-anchor="middle" letter-spacing="1">
          ${cleanTitle}
        </text>
        <text x="${item.width / 2}" y="${item.height * 0.70}" font-family="-apple-system, sans-serif" font-size="12" font-weight="500" fill="${item.accent}" text-anchor="middle" letter-spacing="5">
          ${cleanSubtitle.toUpperCase()}
        </text>
        <text x="${item.width / 2}" y="${item.height * 0.75}" font-family="-apple-system, sans-serif" font-size="10" font-weight="400" fill="#E4DDD1" opacity="0.6" text-anchor="middle" letter-spacing="3">
          HANDCRAFTED IN PAKISTAN
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .jpeg({ quality: 90 })
      .toFile(fullPath);
  }

  console.log(`Successfully generated ${imagesToCreate.length} luxury images.`);
}

generateAll().catch(console.error);
