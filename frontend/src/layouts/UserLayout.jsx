import { useState } from "react";
import UserSidebar from "../components/UserSidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BackToTop from "../components/BackToTop";

export default function UserLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fbff]">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1">
        <UserSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
}