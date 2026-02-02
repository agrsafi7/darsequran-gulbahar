import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BackToTop } from "@/components/shared/BackToTop";
import { MobileStickyAd } from "@/components/shared/MobileStickyAd";
import { InstallPrompt } from "@/components/shared/InstallPrompt";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <InstallPrompt />
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <BackToTop />
      <MobileStickyAd />
    </div>
  );
}
