import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BookOpen, 
  Pencil, 
  Trash2, 
  Plus, 
  Sparkles, 
  Lock, 
  Check, 
  X, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import adminApi from '../services/adminApi';
import { ConfirmModal } from '../components/ConfirmModal';

export const CoursesManagementPage = () => {
  const queryClient = useQueryClient();
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => adminApi.get('/courses'),
    staleTime: 1000 * 60 * 5,
  });

  const courses = data?.courses || [];

  // Kursni tahrirlash (Edit)
  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => adminApi.put(`/admin/courses/${id}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-courses']);
      setEditingCourse(null);
      setFeedback({ type: 'success', text: 'Kurs ma\'lumotlari muvaffaqiyatli yangilandi.' });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (err) => {
      setFeedback({ type: 'error', text: err.message || 'Yangilashda xatolik' });
      setTimeout(() => setFeedback(null), 3000);
    }
  });

  // Kursni o'chirish (Delete)
  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.delete(`/admin/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-courses']);
      setFeedback({ type: 'success', text: 'Kurs o\'chirildi.' });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (err) => {
      setFeedback({ type: 'error', text: err.message || 'O\'chirishda xatolik' });
      setTimeout(() => setFeedback(null), 3000);
    }
  });

  const handleDelete = (id, title) => {
    setCourseToDelete({ id, title });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      id: editingCourse.id,
      formData: {
        title: editingCourse.title,
        description: editingCourse.description,
        is_premium: editingCourse.is_premium
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Kurslar va Darsliklar Boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Algoritm_lessons bazasidagi o'quv dasturlarini tahrirlash va nazorat qilish
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-2 ${
          feedback.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
        }`}>
          {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Courses List */}
      <div className="bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl rounded-3xl border border-gray-200/80 dark:border-white/[0.07] overflow-hidden shadow-xl shadow-gray-200/40 dark:shadow-black/40">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-xs text-gray-400 font-medium">Kurslar ro'yxati yuklanmoqda...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-white/[0.02] text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-200/80 dark:border-white/[0.08]">
                <tr>
                  <th className="px-6 py-4">Kurs Nomi & Tavsif</th>
                  <th className="px-6 py-4">Slug (URL)</th>
                  <th className="px-6 py-4">Darslar Soni</th>
                  <th className="px-6 py-4">Tarif Turi</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-sm">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{course.title}</p>
                          <p className="text-[11px] text-gray-400 line-clamp-1 max-w-sm mt-0.5">{course.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500 dark:text-gray-400">
                      /{course.slug}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-300">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/[0.05] border border-gray-200/50 dark:border-white/[0.05]">
                        {course.lesson_count} ta dars
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {course.is_premium ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center">
                          <Lock className="w-3 h-3 mr-1" /> Pullik Obuna
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center">
                          <Sparkles className="w-3 h-3 mr-1" /> Bepul Kurs
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        
                        {/* QALAMCHA (PENCIL) Ikonkasi — Tahrirlash */}
                        <button
                          type="button"
                          onClick={() => setEditingCourse(course)}
                          className="p-2 rounded-xl bg-gray-100 dark:bg-white/[0.05] hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 dark:hover:text-white text-gray-700 dark:text-gray-200 transition-all cursor-pointer active:scale-95 shadow-sm"
                          title="Tahrirlash"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* KORZINKA (TRASH2) Ikonkasi — O'chirish */}
                        <button
                          type="button"
                          onClick={() => handleDelete(course.id, course.title)}
                          disabled={deleteMutation.isPending}
                          className="p-2 rounded-xl bg-gray-100 dark:bg-white/[0.05] hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white text-gray-700 dark:text-gray-200 transition-all cursor-pointer active:scale-95 shadow-sm"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative">
            
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Pencil className="w-4 h-4 text-brand-500" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Kursni Tahrirlash
                </h3>
              </div>
              <button
                onClick={() => setEditingCourse(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Kurs Nomi:
                </label>
                <input
                  type="text"
                  required
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tavsif (Description):
                </label>
                <textarea
                  rows={3}
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="is_premium"
                  checked={editingCourse.is_premium}
                  onChange={(e) => setEditingCourse({ ...editingCourse, is_premium: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300"
                />
                <label htmlFor="is_premium" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Pullik Obuna Kursi (CSS, JS, React kabi)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Saqlash</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Kursni o'chirish tasdiqlash modali */}
      <ConfirmModal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={() => {
          if (courseToDelete) {
            deleteMutation.mutate(courseToDelete.id);
            setCourseToDelete(null);
          }
        }}
        title="Kursni o'chirish"
        message={`Haqiqatan ham "${courseToDelete?.title}" kursini va uning barcha darsliklarini bazadan butunlay o'chirmoqchimisiz?`}
        confirmText="Ha, o'chirish"
        cancelText="Bekor qilish"
        type="danger"
        loading={deleteMutation.isPending}
      />

    </div>
  );
};
