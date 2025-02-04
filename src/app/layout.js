import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingCountries from "./floatingCountries";
import RoomBackground from "./backgroudRoom";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Flag Quiz",
  description: "",
  icons: {
    icon: "/fav.svg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RoomBackground />
        <FloatingCountries />
        {children}
      </body>
    </html>
  );
}
