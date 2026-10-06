import { Container } from "@/components/ui/Container";

const columns = [
  { title: "Company", links: ["About", "Features", "Works", "Career"] },
  {
    title: "Help",
    links: ["Customer Support", "Delivery Details", "Terms & Conditions", "Privacy Policy"],
  },
  { title: "FAQ", links: ["Account", "Manage Deliveries", "Orders", "Payments"] },
  {
    title: "Resources",
    links: ["Free eBooks", "Development Tutorial", "How to - Blog", "Youtube Playlist"],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 bg-surface">
      <Container className="py-10 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-[32px] leading-none">SHOP.CO</p>
            <p className="mt-6 max-w-62 text-sm text-black/60">
              We have clothes that suits your style and which you&apos;re proud
              to wear. From women to men.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-base font-medium uppercase tracking-[0.2em]">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3.5">
                {column.links.map((label) => (
                  <li key={label}>
                    <a href="#" className="text-black/60 hover:text-black">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-black/10 pt-5 text-sm text-black/60">
          Shop.co © {new Date().getFullYear()}, All Rights Reserved
        </div>
      </Container>
    </footer>
  );
}