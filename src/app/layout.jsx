import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/Styles/globals.css";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext";
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
        <UserProvider>
          <WishlistProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-grow pt-16">{children}</main>
              <Footer />
              {/* Add ToastContainer here */}
              <ToastContainer
                position="top-right" // Position of the toasts
                autoClose={3000} // Auto-close after 3 seconds
                hideProgressBar={false} // Show progress bar
                newestOnTop={false} // New toasts appear below older ones
                closeOnClick // Close toast on click
                rtl={false} // Left-to-right layout
                pauseOnFocusLoss // Pause toast timer when window loses focus
                draggable // Allow dragging to dismiss
                pauseOnHover // Pause toast timer on hover
                theme="colored" // Use colored theme
              />
            </CartProvider>
          </WishlistProvider>
        </UserProvider>
      </body>
    </html>
  );
}