import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SearchModal from "@/components/SearchModal";
import AmbientExperience from "@/components/AmbientExperience";
import "@/Styles/globals.css";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://mystiqueapparel.in"),
  title: {
    template: "%s — Mystique Apparel",
    default: "Mystique Apparel — Architectural Heavyweight Streetwear",
  },
  description:
    "Heavyweight 240 GSM combed cotton silhouettes. Architectural drop-shoulder proportions. Small-batch luxury streetwear born in India.",
  keywords: [
    "luxury streetwear india",
    "mystique apparel",
    "240 gsm oversized t-shirts",
    "heavyweight hoodies",
    "architectural streetwear",
  ],
  openGraph: {
    title: "Mystique Apparel — Architectural Heavyweight Streetwear",
    description:
      "Heavyweight 240 GSM silhouettes crafted in small batches in India.",
    url: "https://mystiqueapparel.in",
    siteName: "Mystique Apparel",
    images: [
      {
        url: "/tshirt.jpg",
        width: 1200,
        height: 630,
        alt: "Mystique Apparel",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mystique Apparel — Architectural Heavyweight Streetwear",
    description: "Heavyweight 240 GSM silhouettes crafted in small batches.",
    images: ["/tshirt.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://mystiqueapparel.in/#organization",
        name: "Mystique Apparel",
        url: "https://mystiqueapparel.in",
        logo: "https://mystiqueapparel.in/tshirt.jpg",
        sameAs: ["https://www.instagram.com/mystique_.apparel/"],
      },
      {
        "@type": "WebSite",
        "@id": "https://mystiqueapparel.in/#website",
        url: "https://mystiqueapparel.in",
        name: "Mystique Apparel",
        publisher: {
          "@id": "https://mystiqueapparel.in/#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://mystiqueapparel.in/shop?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#F6F5F1] text-[#0D0D0D] font-body flex flex-col min-h-screen">
        <AuthProvider>
          <UserProvider>
            <WishlistProvider>
              <CartProvider>
                <AmbientExperience />
                <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
                  <AnnouncementBar />
                  <Navbar />
                </div>
                <main className="flex-grow pt-[96px]">{children}</main>
                <Footer />
                <CartDrawer />
                <SearchModal />
                <ToastContainer
                  position="bottom-right"
                  autoClose={2600}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  pauseOnHover
                  theme="dark"
                />
              </CartProvider>
            </WishlistProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
