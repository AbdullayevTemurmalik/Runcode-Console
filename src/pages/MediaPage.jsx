import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Image as ImageIcon, 
  UploadCloud, 
  Trash2, 
  Eye, 
  Copy, 
  Check, 
  Download, 
  Search, 
  RefreshCw, 
  FileText, 
  HardDrive, 
  Loader2,
  X,
  Layers,
  RotateCcw,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import adminApi from '../services/adminApi';
import { ConfirmModal } from '../components/ConfirmModal';

export const MediaPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'trash'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImageForZoom, setSelectedImageForZoom] = useState(null);
  const [copiedFilename, setCopiedFilename] = useState(null);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const [mediaToForceDelete, setMediaToForceDelete] = useState(null);
  const [isClearTrashOpen, setIsClearTrashOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Fetch all media files from backend
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-media-files'],
    queryFn: () => adminApi.get('/admin/media'),
    staleTime: 1000 * 10
  });

  const rawMediaList = data?.media || [];
  const rawTrashList = data?.trash || [];

  // Filter out any hidden files (.gitkeep, etc.)
  const mediaList = rawMediaList.filter(item => !item.filename.startsWith('.') && item.filename !== '.gitkeep');
  const trashList = rawTrashList.filter(item => !item.filename.startsWith('.') && item.filename !== '.gitkeep');

  // 1. Soft Delete (Savatga o'tkazish)
  const softDeleteMutation = useMutation({
    mutationFn: (filename) => adminApi.delete(`/admin/media/${filename}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-media-files']);
      queryClient.invalidateQueries(['admin-orders']);
      setFeedback({ type: 'success', text: 'Media fayli savatga (Trash) muvaffaqiyatli o\'tkazildi!' });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err) => {
      setFeedback({ type: 'error', text: err.message || 'Faylni savatga o\'tkazishda xatolik yuz berdi' });
      setTimeout(() => setFeedback(null), 4000);
    }
  });

  // 2. Qaytarish (Restore)
  const restoreMutation = useMutation({
    mutationFn: (filename) => adminApi.post(`/admin/media/${filename}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-media-files']);
      queryClient.invalidateQueries(['admin-orders']);
      setFeedback({ type: 'success', text: 'Media fayli savatdan muvaffaqiyatli qaytarildi!' });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err) => {
      setFeedback({ type: 'error', text: err.message || 'Faylni qaytarishda xatolik yuz berdi' });
      setTimeout(() => setFeedback(null), 4000);
    }
  });

  // 3. Butunlay o'chirish (Force delete)
  const forceDeleteMutation = useMutation({
    mutationFn: (filename) => adminApi.delete(`/admin/media/${filename}/force`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-media-files']);
      queryClient.invalidateQueries(['admin-orders']);
      setFeedback({ type: 'success', text: 'Media fayli diskdan butunlay o\'chirildi!' });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err) => {
      setFeedback({ type: 'error', text: err.message || 'Faylni butunlay o\'chirishda xatolik' });
      setTimeout(() => setFeedback(null), 4000);
    }
  });

  // 4. Savatni tozalash (Clear trash)
  const clearTrashMutation = useMutation({
    mutationFn: () => adminApi.delete('/admin/trash/media/clear'),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-media-files']);
      setIsClearTrashOpen(false);
      setFeedback({ type: 'success', text: 'Media savati to\'liq tozalandi!' });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err) => {
      setFeedback({ type: 'error', text: err.message || 'Savatni tozalashda xatolik' });
      setTimeout(() => setFeedback(null), 4000);
    }
  });

  const handleCopyLink = (url, filename) => {
    const full = window.location.origin.replace(':5174', ':5000') + url;
    navigator.clipboard.writeText(full);
    setCopiedFilename(filename);
    setTimeout(() => setCopiedFilename(null), 2500);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setFeedback(null);

    try {
      const res = await adminApi.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success) {
        queryClient.invalidateQueries(['admin-media-files']);
        setFeedback({ type: 'success', text: 'Yangi media fayli muvaffaqiyatli yuklandi!' });
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Yuklashda xatolik' });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const currentDisplayList = activeTab === 'active' ? mediaList : trashList;

  const filteredMedia = currentDisplayList.filter(item => 
    item.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBytes = mediaList.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold mb-2">
            <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
            <span>Fayllar va Cheklar Media Markazi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Media Fayllar Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Foydalanuvchilar yuklagan barcha to'lov cheklari, rasmlar va resurslar galereyasi
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {activeTab === 'active' ? (
            <label className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-brand-500/20 transition-all cursor-pointer">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              <span>{uploading ? 'Yuklanmoqda...' : 'Media Yuklash'}</span>
              <input 
                type="file" 
                accept="image/*,.pdf" 
                onChange={handleFileUpload} 
                className="hidden" 
                disabled={uploading}
              />
            </label>
          ) : (
            trashList.length > 0 && (
              <button
                type="button"
                onClick={() => setIsClearTrashOpen(true)}
                disabled={clearTrashMutation.isPending}
                className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Savatni Bo'shatish</span>
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all shadow-sm cursor-pointer"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 text-brand-500 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-2 animate-in fade-in ${
          feedback.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
        }`}>
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#101422] border border-gray-200 dark:border-white/[0.08] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-gray-400">Faol Media Fayllar</span>
            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1 font-mono">{mediaList.length} ta</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#101422] border border-gray-200 dark:border-white/[0.08] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-gray-400">Diskdagi Hajmi</span>
            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1 font-mono">{totalMB} MB</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#101422] border border-gray-200 dark:border-white/[0.08] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-gray-400">Savatdagi Fayllar</span>
            <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">{trashList.length} ta</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Faol Media vs Savat) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-white/[0.08] pb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'active'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                : 'bg-white dark:bg-[#101422] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Faol Media Fayllar</span>
            <span className={`px-2 py-0.2 rounded-full text-[10px] ${activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400'}`}>
              {mediaList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('trash')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'trash'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/25'
                : 'bg-white dark:bg-[#101422] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Media Savati</span>
            {trashList.length > 0 && (
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'trash' ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'}`}>
                {trashList.length}
              </span>
            )}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Fayl nomi bo'yicha qidirish..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#101422] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
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

      {/* Media Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-gray-400">Media fayllar yuklanmoqda...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#101422] border border-gray-200 dark:border-white/[0.08] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.04] text-gray-400 flex items-center justify-center mx-auto">
            {activeTab === 'active' ? <ImageIcon className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
          </div>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
            {activeTab === 'active' ? "Hech qanday media fayl topilmadi" : "Media savati bo'sh"}
          </p>
          <p className="text-xs text-gray-500">
            {activeTab === 'active' 
              ? "To'lov cheklari yoki rasmlar yuklanganda bu yerda avtomatik paydo bo'ladi." 
              : "O'chirilgan fayllar va cheklar bu yerda saqlanadi."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredMedia.map((item) => {
            const fileUrl = `http://localhost:5000${item.url}`;
            return (
              <div 
                key={item.filename}
                className={`group rounded-3xl bg-white dark:bg-[#101422] border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                  activeTab === 'trash' ? 'border-rose-500/20' : 'border-gray-200 dark:border-white/[0.08]'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-950 overflow-hidden flex items-center justify-center">
                  {item.isImage ? (
                    <img 
                      src={fileUrl} 
                      alt={item.filename} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <FileText className="w-12 h-12 text-gray-400" />
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 p-2">
                    {item.isImage && (
                      <button
                        onClick={() => setSelectedImageForZoom(fileUrl)}
                        className="p-2 rounded-xl bg-white/90 hover:bg-white text-gray-900 shadow-lg transition-transform hover:scale-110 cursor-pointer"
                        title="Kattalashtirib ko'rish"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="p-2 rounded-xl bg-white/90 hover:bg-white text-gray-900 shadow-lg transition-transform hover:scale-110 cursor-pointer"
                      title="Yuklab olish"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    {activeTab === 'active' ? (
                      <button
                        onClick={() => setMediaToDelete(item.filename)}
                        className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-transform hover:scale-110 cursor-pointer"
                        title="Savatga o'tkazish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => restoreMutation.mutate(item.filename)}
                          disabled={restoreMutation.isPending}
                          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-transform hover:scale-110 cursor-pointer"
                          title="Qaytarish (Restore)"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setMediaToForceDelete(item.filename)}
                          className="p-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white shadow-lg transition-transform hover:scale-110 cursor-pointer"
                          title="Butunlay o'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {item.relatedOrderId && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-brand-600/95 text-white text-[10px] font-bold shadow-md">
                      Buyurtma #{item.relatedOrderId}
                    </span>
                  )}

                  {activeTab === 'trash' && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-rose-500/90 text-white text-[10px] font-bold shadow-md">
                      Savatda
                    </span>
                  )}
                </div>

                {/* Info Card */}
                <div className="p-4 space-y-2">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                    <span>{item.sizeFormatted}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString('uz-UZ')}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
                    <button
                      onClick={() => handleCopyLink(item.url, item.filename)}
                      className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedFilename === item.filename ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Nusxalandi!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>URL nusxalash</span>
                        </>
                      )}
                    </button>

                    {activeTab === 'active' ? (
                      <button
                        onClick={() => setMediaToDelete(item.filename)}
                        disabled={softDeleteMutation.isPending}
                        className="text-gray-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="Savatga o'tkazish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => restoreMutation.mutate(item.filename)}
                          className="text-emerald-600 hover:text-emerald-500 p-1 cursor-pointer"
                          title="Qaytarish"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setMediaToForceDelete(item.filename)}
                          className="text-rose-600 hover:text-rose-500 p-1 cursor-pointer"
                          title="Butunlay o'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Zoom Image Modal */}
      {selectedImageForZoom && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div 
            className="fixed inset-0" 
            onClick={() => setSelectedImageForZoom(null)} 
            aria-hidden="true" 
          />

          <div className="relative max-w-4xl max-h-[90vh] z-10 flex flex-col items-center">
            <button
              onClick={() => setSelectedImageForZoom(null)}
              className="absolute -top-12 right-0 p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={selectedImageForZoom} 
              alt="Zoomed" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}

      {/* 1. Savatga o'tkazish (Soft delete) modali */}
      <ConfirmModal
        isOpen={!!mediaToDelete}
        onClose={() => setMediaToDelete(null)}
        onConfirm={() => {
          if (mediaToDelete) {
            softDeleteMutation.mutate(mediaToDelete);
            setMediaToDelete(null);
          }
        }}
        title="Faylni savatga o'tkazish"
        message={`"${mediaToDelete}" fayli savatga (Trash) o'tkaziladi. Kerak bo'lsa uni istalgan payt qaytarib olishingiz mumkin.`}
        confirmText="Ha, savatga o'tkazish"
        cancelText="Bekor qilish"
        type="warning"
        loading={softDeleteMutation.isPending}
      />

      {/* 2. Butunlay o'chirish (Force delete) modali */}
      <ConfirmModal
        isOpen={!!mediaToForceDelete}
        onClose={() => setMediaToForceDelete(null)}
        onConfirm={() => {
          if (mediaToForceDelete) {
            forceDeleteMutation.mutate(mediaToForceDelete);
            setMediaToForceDelete(null);
          }
        }}
        title="Faylni butunlay o'chirish"
        message={`DIQQAT! "${mediaToForceDelete}" fayli server diskidan butunlay o'chiriladi va uni qayta tiklab bo'lmaydi.`}
        confirmText="Ha, butunlay o'chirish"
        cancelText="Bekor qilish"
        type="danger"
        loading={forceDeleteMutation.isPending}
      />

      {/* 3. Savatni bo'shatish modali */}
      <ConfirmModal
        isOpen={isClearTrashOpen}
        onClose={() => setIsClearTrashOpen(false)}
        onConfirm={() => clearTrashMutation.mutate()}
        title="Media savatini tozalash"
        message={`Savatdagi barcha (${trashList.length} ta) media fayllar diskdan butunlay o'chiriladi. Ushbu amalni ortga qaytarib bo'lmaydi.`}
        confirmText="Ha, tozalash"
        cancelText="Bekor qilish"
        type="danger"
        loading={clearTrashMutation.isPending}
      />

    </div>
  );
};
