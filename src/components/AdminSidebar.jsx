import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  BookOpen, 
  Users, 
  ExternalLink,
  Activity,
  Image as ImageIcon,
  Award,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export const AdminSidebar = ({ pendingCount = 0, onItemClick }) => {
  const navItems = [
    { label: 'Boshqaruv Paneli', path: '/', icon: LayoutDashboard },
    { label: 'To\'lovlar & Cheklar', path: '/payments', icon: CreditCard, badge: pendingCount, badgeColor: 'bg-amber-500' },
    { label: 'Imtihon Natijalari', path: '/exams', icon: Award },
    { label: 'Media Markazi', path: '/media', icon: ImageIcon },
    { label: 'Kurslar Boshqaruvi', path: '/courses', icon: BookOpen },
    { label: 'Foydalanuvchilar', path: '/users', icon: Users },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-5">
      
      {/* Navigation Links Card */}
      <div className="bg-white/90 dark:bg-[#101422]/90 backdrop-blur-xl rounded-3xl p-3 sm:p-3.5 border border-gray-200/80 dark:border-white/[0.07] shadow-xl shadow-gray-200/40 dark:shadow-black/40 space-y-1.5">
        <div className="px-3 pt-2 pb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-400">
            Asosiy Menyu
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onItemClick}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3.5 py-2.5 sm:py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 ring-1 ring-white/20 translate-x-1'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-white hover:translate-x-0.5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`p-1.5 rounded-xl transition-colors ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:bg-emerald-500/10'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    {item.isLive && !isActive && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        LIVE
                      </span>
                    )}
                    {item.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-sm animate-pulse ${item.badgeColor || 'bg-rose-500'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

    </aside>
  );
};
