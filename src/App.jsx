import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminNavbar } from './components/AdminNavbar';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminMobileBottomNav } from './components/AdminMobileBottomNav';

import { AdminDashboard } from './pages/AdminDashboard';
import { PaymentsPage } from './pages/PaymentsPage';
import { UsersPage } from './pages/UsersPage';
import { CoursesManagementPage } from './pages/CoursesManagementPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { MediaPage } from './pages/MediaPage';
import { TrashPage } from './pages/TrashPage';
import { ExamsPage } from './pages/ExamsPage';
import adminApi from './services/adminApi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 daqiqa keshda saqlash (Reload yoki tarmoq uzilishida saqlanadi)
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const AdminLayout = () => {
  const { isAuthenticated, loading } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats-count'],
    queryFn: () => adminApi.get('/admin/stats'),
    enabled: isAuthenticated,
    staleTime: 1000 * 15,
    refetchInterval: 15000
  });

  const pendingCount = statsData?.stats?.pendingOrders || 0;
  const trashCount = statsData?.stats?.trashCount || 0;

  if (loading) return null;

  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0b0f19] dark:text-gray-100 flex flex-col transition-colors">
      <AdminNavbar 
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="container-admin py-5 sm:py-7 flex-1 w-full min-w-0">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full min-w-0">
          
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:sticky lg:top-24 flex-shrink-0">
            <AdminSidebar pendingCount={pendingCount} />
          </div>

          {/* Mobile Drawer Sidebar */}
          {isMobileMenuOpen && (
            <div className="fixed top-16 left-0 bottom-0 z-50 w-72 p-4 bg-white dark:bg-[#101422] border-r border-gray-200 dark:border-white/[0.08] shadow-2xl overflow-y-auto lg:hidden animate-in slide-in-from-left duration-200">
              <AdminSidebar 
                pendingCount={pendingCount} 
                onItemClick={() => setIsMobileMenuOpen(false)}
              />
            </div>
          )}
          
          <main className="flex-1 w-full min-w-0 pb-24 lg:pb-0">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/trash" element={<Navigate to="/payments?status=trash" replace />} />
              <Route path="/exams" element={<ExamsPage />} />
              <Route path="/media" element={<MediaPage />} />
              <Route path="/courses" element={<CoursesManagementPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* Mobile pastki navigatsiya paneli (Bottom Navigation Bar) */}
      <AdminMobileBottomNav pendingCount={pendingCount} />
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AdminAuthProvider>
            <AdminLayout />
          </AdminAuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
