'use client'

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-16 lg:pt-28">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

