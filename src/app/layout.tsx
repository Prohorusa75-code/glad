import type { Metadata, Viewport } from "next";
import { Golos_Text } from "next/font/google";
import "./globals.css";

const golos = Golos_Text({
  variable: "--font-golos",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Гладь — химчистка с курьером",
  description:
    "Концепт для портфолио: химчистка «Гладь». Заберём вещи от двери, почистим и вернём отглаженными. Услуги, цены, калькулятор заказа и заявка на вывоз.",
};

export const viewport: Viewport = {
  themeColor: "#050608",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={golos.variable}>
      <body>
        {/* тихая подсветка за страницей — стеклу есть что «преломлять» */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background:
              "radial-gradient(42vmax 42vmax at 88% 28%, #1d3f8a3d, transparent 70%), radial-gradient(46vmax 46vmax at 6% 78%, #2a48963a, transparent 70%)",
          }}
        />
        {children}
      </body>
    </html>
  );
}
