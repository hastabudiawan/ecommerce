import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { title: "Produk tidak ditemukan" };

    const { data } = await res.json();
    return {
      title: data.name,
      description: data.description ?? `Beli ${data.name} di SHOP.CO`,
      openGraph: {
        title: data.name,
        images: data.images?.[0] ? [data.images[0].imageUrl] : [],
      },
    };
  } catch {
    return { title: "Produk" };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}