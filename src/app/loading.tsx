import { Container } from "@/components/ui/Container";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-ivory">
      <Container className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-stone-light border-t-gold animate-spin mx-auto rounded-full" />
        <p className="text-xs font-sans uppercase tracking-[0.2em] text-stone">
          Curating Couture Experience...
        </p>
      </Container>
    </div>
  );
}
