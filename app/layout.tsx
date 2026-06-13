import type { Metadata } from "next";
import { Averia_Serif_Libre, DM_Sans } from "next/font/google";
import "./globals.css";

const averiaSerifLibre = Averia_Serif_Libre({
  variable: "--font-averia",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Vinoy Varghese — Product Designer",
  description:
    "Portfolio of Vinoy Varghese, product designer working across FinTech, SalesTech, EdTech, and HRTech.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${averiaSerifLibre.variable} ${dmSans.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
