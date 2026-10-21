import Image from "next/image";
import { Instagram } from "lucide-react";
import { INSTAGRAM_URL } from "@/lib/constants";
import { Container } from "@/components/ui/Container";

const INSTAGRAM_POSTS = [
  { id: 1, image: "/images/instagram/insta-1.jpg", alt: "Bridal veil with hand-strung pearls" },
  { id: 2, image: "/images/instagram/insta-2.jpg", alt: "Intricate zardozi needlework detail" },
  { id: 3, image: "/images/instagram/insta-3.jpg", alt: "Lahore atelier artisans at work" },
  { id: 4, image: "/images/instagram/insta-4.jpg", alt: "Velvet kalidaar border craftsmanship" },
  { id: 5, image: "/images/instagram/insta-5.jpg", alt: "Silk tissue peshwas draped in sunlight" },
  { id: 6, image: "/images/instagram/insta-6.jpg", alt: "Antique gold tilla cord hand-braiding" },
];

export function InstagramStrip() {
  return (
    <div className="w-full bg-ivory py-16 sm:py-20 border-b border-hairline">
      <Container>
        <div className="text-center mb-10 space-y-2">
          <span className="font-sans text-xs uppercase tracking-[0.16em] text-stone">
            Follow Our Atelier
          </span>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-heading text-2xl sm:text-3xl font-light text-ink hover:text-gold transition-colors tracking-tight"
          >
            @ahmedaliansari.official
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {INSTAGRAM_POSTS.map((post) => (
            <a
              key={post.id}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-[#EFE9DF] border border-hairline block"
            >
              <Image
                src={post.image}
                alt={post.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-ivory">
                <Instagram className="h-5 w-5 stroke-[1.5]" />
              </div>
            </a>
          ))}
        </div>
      </Container>
    </div>
  );
}
