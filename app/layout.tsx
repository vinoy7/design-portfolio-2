import type { Metadata } from "next";
import { Averia_Serif_Libre, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import TabTeaser from "@/components/TabTeaser";

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

const TITLE = "Vinoy Varghese — Product Designer";
const DESCRIPTION =
  "Portfolio of Vinoy Varghese, product designer working across FinTech, SalesTech, EdTech, and HRTech.";

export const metadata: Metadata = {
  metadataBase: new URL("https://vinoy.in"),
  title: "Vinoy's Design Portfolio",
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://vinoy.in",
    siteName: "Vinoy Varghese",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
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
      <body>
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "xbwtm4oyp8");`}
        </Script>
        <TabTeaser />
        {children}
      </body>
    </html>
  );
}
