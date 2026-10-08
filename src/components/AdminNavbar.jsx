import React, { useState } from 'react';
import { ShieldCheck, Sun, Moon, LogOut } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useTheme } from '../context/ThemeContext';
import { ConfirmModal } from './ConfirmModal';

export const AdminNavbar = () => {
  const { admin, logout } = useAdminAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="container-admin flex items-center justify-between h-16 sm:h-20">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white leading-none">
                RunCode<span className="text-brand-500">.uz</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                Admin Panel
              </span>
            </div>
            <p className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 tracking-wider uppercase mt-1">
              By Temurmalik
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          
          <button
            onClick={toggleTheme}
            aria-label="Rejimni o'zgartirish"
            className="p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block" />

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{admin?.fullName || 'Bosh Admin'}</p>
              <p className="text-[10px] text-gray-400 truncate">{admin?.email}</p>
            </div>
          </div>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            title="Chiqish"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Admin Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          logout();
        }}
        title="Admin paneldan chiqish"
        message="Haqiqatan ham boshqaruv panelidan chiqmoqchimisiz? Qayta kirish uchun maxsus admin login va paroli talab etiladi."
        confirmText="Ha, chiqish"
        cancelText="Bekor qilish"
        type="logout"
      />
    </header>
  );
};
