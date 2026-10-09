import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  Award, 
  Image as ImageIcon, 
  BookOpen, 
  Users,
  Tag
} from 'lucide-react';

export const AdminMobileBottomNav = ({ pendingCount = 0 }) => {
  const navItems = [
    { label: 'Panel', path: '/', icon: LayoutDashboard },
    { label: "To'lovlar", path: '/payments', icon: CreditCard, badge: pendingCount },
    { label: 'Promo', path: '/promocodes', icon: Tag },
    { label: 'Imtihon', path: '/exams', icon: Award },
    { label: 'Media', path: '/media', icon: ImageIcon },
    { label: 'Kurslar', path: '/courses', icon: BookOpen },
    { label: 'Userlar', path: '/users', icon: Users },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-[#0c101d]/95 backdrop-blur-2xl border-t border-gray-200/90 dark:border-white/[0.08] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] pb-safe">
      <nav className="grid grid-cols-7 items-center px-1 py-1.5 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `group relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all duration-200 select-none ${
                  isActive
                    ? 'text-brand-600 dark:text-emerald-400 font-black'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <div className={`p-1 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 scale-110 shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                    }`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    {/* Pending Payments Badge */}
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white shadow-sm animate-pulse min-w-[16px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <span className={`text-[9px] sm:text-[10px] mt-0.5 truncate tracking-tight transition-colors ${
                    isActive ? 'font-black' : 'font-medium'
                  }`}>
                    {item.label}
                  </span>

                  {/* Active Indicator Dot */}
                  {isActive && (
                    <span className="absolute bottom-0 w-1 h-1 rounded-full bg-emerald-500" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
