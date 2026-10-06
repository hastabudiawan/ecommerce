import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

const stats = [
  { value: "200+", label: "International Brands" },
  { value: "2,000+", label: "High-Quality Products" },
  { value: "30,000+", label: "Happy Customers" },
];

export function Hero() {
  return (
    <section className="bg-hero">
      <Container className="grid gap-8 py-10 md:grid-cols-2 md:items-center md:py-16">
        <div>
          <h1 className="font-display text-4xl leading-[1.05] md:text-6xl">
            FIND CLOTHES THAT MATCHES YOUR STYLE
          </h1>
          <p className="mt-6 max-w-105 text-black/60">
            Browse through our diverse range of meticulously crafted garments,
            designed to bring out your individuality and cater to your sense of
            style.
          </p>

          <Link
            href="/products"
            className="mt-8 block w-full text-center md:inline-block md:w-auto rounded-full bg-ink px-12 py-4 text-sm font-medium text-white hover:opacity-90"
          >
            Shop Now
          </Link>

          <dl className="mt-10 flex flex-wrap justify-center md:justify-start gap-6 md:gap-10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <dt className="font-display text-2xl md:text-3xl">
                  {stat.value}
                </dt>
                <dd className="text-sm text-black/60">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mx-auto w-full max-w-105 md:max-w-none">
          <Image
            src="/img/banner/hero.png"
            alt="Model mengenakan outfit SHOP.CO"
            width={630}
            height={663}
            priority
            className="h-auto w-full"
          />
        </div>
      </Container>
    </section>
  );
}
