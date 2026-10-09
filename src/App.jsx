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
import { PromocodesPage } from './pages/PromocodesPage';
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
      <AdminNavbar />

      <div className="container-admin py-5 sm:py-7 flex-1 w-full min-w-0">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full min-w-0">
          
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:sticky lg:top-24 flex-shrink-0">
            <AdminSidebar pendingCount={pendingCount} />
          </div>
          
          <main className="flex-1 w-full min-w-0 pb-24 lg:pb-0">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/promocodes" element={<PromocodesPage />} />
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
