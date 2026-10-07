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
  Calendar, 
  HardDrive, 
  Loader2,
  X,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import adminApi from '../services/adminApi';
import { ConfirmModal } from '../components/ConfirmModal';

export const MediaPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImageForZoom, setSelectedImageForZoom] = useState(null);
  const [copiedFilename, setCopiedFilename] = useState(null);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Fetch all media files from backend
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-media-files'],
    queryFn: () => adminApi.get('/admin/media'),
    staleTime: 1000 * 10
  });

  const mediaList = data?.media || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (filename) => adminApi.delete(`/admin/media/${filename}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-media-files']);
      queryClient.invalidateQueries(['admin-orders']);
      setFeedback({ type: 'success', text: 'Media fayli muvaffaqiyatli o\'chirildi!' });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err) => {
      setFeedback({ type: 'error', text: err.message || 'Faylni o\'chirishda xatolik yuz berdi' });
      setTimeout(() => setFeedback(null), 4000);
    }
  });

  const handleDelete = (filename) => {
    setMediaToDelete(filename);
  };

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
        setFeedback({ type: 'success', text: 'Yangi media fayli yuklandi!' });
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

  const filteredMedia = mediaList.filter(item => 
    item.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBytes = mediaList.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-8 animate-in fade-in">
      
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

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all shadow-sm"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 text-brand-500 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-gray-400">Jami Media Fayllar</span>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1 font-mono">{mediaList.length} ta</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-gray-400">Diskdagi Hajmi</span>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1 font-mono">{totalMB} MB</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-gray-400">Rasmlar & Cheklar</span>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1 font-mono">
              {mediaList.filter(m => m.isImage).length} ta
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Fayl nomi bo'yicha qidirish..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
        />
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hech qanday media fayl topilmadi</p>
          <p className="text-xs text-gray-500">To'lov cheklari yoki rasmlar yuklanganda bu yerda avtomatik paydo bo'ladi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedia.map((item) => {
            const fileUrl = `http://localhost:5000${item.url}`;
            return (
              <div 
                key={item.filename}
                className="group rounded-3xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 overflow-hidden flex items-center justify-center">
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
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    {item.isImage && (
                      <button
                        onClick={() => setSelectedImageForZoom(fileUrl)}
                        className="p-2 rounded-xl bg-white/90 hover:bg-white text-gray-900 shadow-lg transition-transform hover:scale-110"
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
                      className="p-2 rounded-xl bg-white/90 hover:bg-white text-gray-900 shadow-lg transition-transform hover:scale-110"
                      title="Yuklab olish"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(item.filename)}
                      className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-transform hover:scale-110"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.relatedOrderId && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-brand-600/90 text-white text-[10px] font-bold shadow-md">
                      Buyurtma #{item.relatedOrderId}
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

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                    <button
                      onClick={() => handleCopyLink(item.url, item.filename)}
                      className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
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

                    <button
                      onClick={() => handleDelete(item.filename)}
                      disabled={deleteMutation.isPending}
                      className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Zoom Image Modal */}
      {selectedImageForZoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div 
            className="fixed inset-0" 
            onClick={() => setSelectedImageForZoom(null)} 
            aria-hidden="true" 
          />

          <div className="relative max-w-4xl max-h-[90vh] z-10 flex flex-col items-center">
            <button
              onClick={() => setSelectedImageForZoom(null)}
              className="absolute -top-12 right-0 p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
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

      {/* Media faylni o'chirish tasdiqlash modali */}
      <ConfirmModal
        isOpen={!!mediaToDelete}
        onClose={() => setMediaToDelete(null)}
        onConfirm={() => {
          if (mediaToDelete) {
            deleteMutation.mutate(mediaToDelete);
            setMediaToDelete(null);
          }
        }}
        title="Faylni diskdan o'chirish"
        message={`Haqiqatan ham "${mediaToDelete}" faylini server diskidan butunlay o'chirmoqchimisiz?`}
        confirmText="Ha, o'chirish"
        cancelText="Bekor qilish"
        type="danger"
        loading={deleteMutation.isPending}
      />

    </div>
  );
};
