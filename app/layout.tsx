import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RealtimeHandler from './RealtimeHandler';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stonks Fullstack Demo",
  description: "Stonks Fullstack by Haider Bokhari",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastContainer 
          position="top-right" // You can adjust the position
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <RealtimeHandler />
        {children}
      </body>
    </html>
  );
}
