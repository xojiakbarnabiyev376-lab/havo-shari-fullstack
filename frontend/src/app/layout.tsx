import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Havo Shari - Havoda erkinlik hisini his eting",
  description: "O'zbekistonda unutilmas havo shari parvozlari. Xavfsiz, professional va premium xizmat.",
  keywords: ["havo shari", "parvoz", "uzbekistan travel", "adrenalin", "balloon flight", "shar parvozi"],
  openGraph: {
    title: "Havo Shari - Unutilmas Parvozlar",
    description: "O'zbekistondagi eng yaxshi havo shari parvozlari. Hozir band qiling!",
    url: "https://havoshari.uz",
    siteName: "Havo Shari",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Havo Shari - Unutilmas Parvozlar",
    description: "O'zbekistondagi eng yaxshi havo shari parvozlari.",
    images: ["/images/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
