import { useState } from "react";
import AdminSidebar from "../components/layout/AdminSidebar";
import Header from "../components/layout/Header";

export default function UserLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fbff]">
      
      {/* ✅ FULL WIDTH HEADER */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Body */}
      <div className="flex">
        
        {/* Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>

      </div>
    </div>
  );
}