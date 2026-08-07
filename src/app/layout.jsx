import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import "@/Styles/globals.css";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for react-toastify

export const metadata = {
  metadataBase: new URL("https://mystiqueapparel.in"),
  title: {
    template: "%s | Mystique Apparel",
    default: "Mystique Apparel | Premium Streetwear & Dark Fashion",
  },
  description: "Discover premium streetwear and dark fashion at Mystique Apparel. Bold style, high-quality fabrics, and unique designs born in India.",
  keywords: ["streetwear", "dark fashion", "premium apparel", "mystique apparel", "india streetwear", "clothing brand", "oversized t-shirts"],
  openGraph: {
    title: "Mystique Apparel | Premium Streetwear",
    description: "Discover premium streetwear and dark fashion at Mystique Apparel. Bold style, high-quality fabrics, and unique designs.",
    url: "https://mystiqueapparel.in",
    siteName: "Mystique Apparel",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Mystique Apparel Logo",
      }
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mystique Apparel | Premium Streetwear",
    description: "Discover premium streetwear and dark fashion at Mystique Apparel.",
    images: ["/logo.png"],
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
  return (
    <html lang="en">
      <body className="antialiased bg-primary-bg text-primary-text dark:bg-primary-bg dark:text-primary-text flex flex-col min-h-screen">
        <AuthProvider>
          <UserProvider>
            <WishlistProvider>
              <CartProvider>
                <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
                  <AnnouncementBar />
                  <Navbar />
                </div>
                <main className="flex-grow pt-24">{children}</main>
                <Footer />
                {/* Add ToastContainer here */}
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                />
              </CartProvider>
            </WishlistProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}