import { useState } from "react";
import AdminSidebar from "../components/layout/AdminSidebar";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import BackToTop from "../components/layout/BackToTop";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fbff]">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="pt-16 lg:ml-[260px]">
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
          {children}
        </main>

        <Footer />
      </div>

      <BackToTop />
    </div>
  );
}