import { Container } from "@/components/ui/Container";

const brands = [
  { src: "/img/brands/versace.svg", alt: "Versace" },
  { src: "/img/brands/zara.svg", alt: "Zara" },
  { src: "/img/brands/gucci.svg", alt: "Gucci" },
  { src: "/img/brands/prada.svg", alt: "Prada" },
  { src: "/img/brands/calvinKlein.svg", alt: "Calvin Klein" },
];

export function BrandStrip() {
  return (
    <div className="bg-ink py-6 md:py-8">
      <Container className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:justify-between">
        {brands.map((brand) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={brand.alt} src={brand.src} alt={brand.alt} className="h-5 w-auto md:h-7" />
        ))}
      </Container>
    </div>
  );
}