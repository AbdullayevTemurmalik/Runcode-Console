import React from 'react';
import { Search, X, Trash2 } from 'lucide-react';

export const PaymentsFilterTabs = ({
  statusFilter,
  handleTabChange,
  pendingCount,
  trashCount,
  searchTerm,
  setSearchTerm
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 dark:bg-[#101422]/90 backdrop-blur-xl p-3.5 sm:p-4 rounded-3xl border border-gray-200/80 dark:border-white/[0.07] shadow-xl shadow-gray-200/40 dark:shadow-black/40">
      {/* Status Tabs */}
      <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
        {[
          { key: '', label: 'Barchasi', count: null },
          { key: 'pending', label: 'Kutilmoqda', count: pendingCount, countColor: 'bg-amber-500 text-white' },
          { key: 'approved', label: 'Tasdiqlangan', count: null },
          { key: 'rejected', label: 'Rad etilgan', count: null }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              statusFilter === tab.key
                ? 'bg-gradient-to-r from-brand-600 to-emerald-600 text-white shadow-md shadow-brand-500/25 ring-1 ring-white/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                statusFilter === tab.key ? 'bg-white text-brand-600' : tab.countColor
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}

        {/* Savat Tab */}
        <button
          onClick={() => handleTabChange('trash')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
            statusFilter === 'trash'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/25 ring-1 ring-white/20'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Savat</span>
          {trashCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black leading-none ${
              statusFilter === 'trash' ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'
            }`}>
              {trashCount}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Ism, username, telefon yoki ID..."
          className="w-full pl-10 pr-9 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-black/30 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-gray-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
