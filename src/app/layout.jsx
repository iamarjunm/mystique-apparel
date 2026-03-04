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
  title: "Mystique Apparel",
  description: "Dark fashion, bold style.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-primary-bg text-primary-text dark:bg-primary-bg dark:text-primary-text flex flex-col min-h-screen">
        <AuthProvider>
          <UserProvider>
            <WishlistProvider>
              <CartProvider>
                <div className="fixed top-0 left-0 right-0 z-50">
                  <AnnouncementBar />
                </div>
                <div className="relative z-40">
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