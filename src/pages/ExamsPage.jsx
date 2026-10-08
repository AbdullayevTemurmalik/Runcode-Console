import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Award, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  Trash2, 
  Eye, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Filter, 
  Loader2,
  Calendar,
  Sparkles,
  X,
  Check
} from 'lucide-react';
import adminApi from '../services/adminApi';
import { ConfirmModal } from '../components/ConfirmModal';
import { CustomSelect } from '../components/CustomSelect';

export const ExamsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'passed', 'reexam', 'failed'
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedExamForPreview, setSelectedExamForPreview] = useState(null);
  const [selectedExamForDelete, setSelectedExamForDelete] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Imtihon natijalarini olish
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-exams'],
    queryFn: () => adminApi.get('/admin/exams'),
    staleTime: 1000 * 30,
    refetchInterval: 30000
  });

  const exams = data?.exams || [];

  // O'chirish mutatsiyasi
  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.delete(`/admin/exams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-exams']);
      setFeedbackMessage({ type: 'success', text: "Imtihon natijasi muvaffaqiyatli o'chirildi!" });
      setTimeout(() => setFeedbackMessage(null), 3500);
      setSelectedExamForDelete(null);
    },
    onError: (err) => {
      setFeedbackMessage({ type: 'error', text: err.response?.data?.message || "O'chirishda xatolik yuz berdi" });
      setTimeout(() => setFeedbackMessage(null), 3500);
    }
  });

  // Filtrlash
  const filteredExams = exams.filter((e) => {
    // Status filter
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;

    // Course filter
    if (courseFilter !== 'all' && e.course_slug !== courseFilter) return false;

    // Search term
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const fullName = (e.user_full_name || `${e.user_first_name || ''} ${e.user_last_name || ''}`).toLowerCase();
    const email = (e.user_email || '').toLowerCase();
    const phone = (e.user_phone || '').toLowerCase();
    const courseTitle = (e.course_title || '').toLowerCase();
    const username = (e.user_username || '').toLowerCase();

    return fullName.includes(term) || email.includes(term) || phone.includes(term) || courseTitle.includes(term) || username.includes(term);
  });

  // Statistika hisob-kitoblari
  const totalExams = exams.length;
  const passedExams = exams.filter(e => e.status === 'passed').length;
  const reexamCount = exams.filter(e => e.status === 'reexam').length;
  const failedExams = exams.filter(e => e.status === 'failed').length;
  const avgScore = totalExams > 0 ? Math.round(exams.reduce((sum, e) => sum + (e.score || 0), 0) / totalExams) : 0;

  // Vaqtni chiroyli formatlash
  const formatDuration = (totalSec) => {
    if (!totalSec || totalSec <= 0) return '1 daq ichida';
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins === 0) return `${secs} soniya`;
    if (secs === 0) return `${mins} daqiqa`;
    return `${mins} daq ${secs} son`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className={`fixed top-20 right-6 z-50 p-4 rounded-2xl font-bold text-xs shadow-2xl flex items-center space-x-2 animate-in slide-in-from-top-4 ${
          feedbackMessage.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Imtihon Natijalari
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              {totalExams} ta topshirilgan
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Barcha kurslar bo'yicha o'quvchilarning 20 ta savollik yakuniy imtihon natijalari, ballari va sarflangan vaqti
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 shadow-sm transition-colors"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-brand-500' : ''}`} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/[0.07] shadow-xl shadow-gray-200/40 dark:shadow-black/40">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Jami Imtihonlar</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{totalExams}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            <span>O'tganlar (Passed)</span>
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {passedExams} <span className="text-xs font-normal opacity-75">({totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0}%)</span>
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 shadow-xl shadow-amber-500/5">
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            <span>Qayta topshirish</span>
          </p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{reexamCount}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-rose-500/10 dark:bg-rose-950/20 border border-rose-500/20 shadow-xl shadow-rose-500/5">
          <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            <span>Yiqilganlar</span>
          </p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{failedExams}</p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-3xl bg-brand-500/10 dark:bg-brand-950/20 border border-brand-500/20 shadow-xl shadow-brand-500/5">
          <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center">
            <Award className="w-3.5 h-3.5 mr-1" />
            <span>O'rtacha Ball</span>
          </p>
          <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">{avgScore}%</p>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="relative z-30 flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-3xl bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl border border-gray-200/80 dark:border-white/[0.07] shadow-xl shadow-gray-200/40 dark:shadow-black/40">
        
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="O'quvchi ismi, email, telefon yoki kurs..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-black/30 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
          />
        </div>

        {/* Filter Tabs & Course Select */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.05] text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'all' 
                  ? 'bg-white dark:bg-[#101422] text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Barchasi ({totalExams})
            </button>
            <button
              onClick={() => setStatusFilter('passed')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'passed' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              O'tganlar ({passedExams})
            </button>
            <button
              onClick={() => setStatusFilter('reexam')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'reexam' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              Qayta topshirish ({reexamCount})
            </button>
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'failed' 
                  ? 'bg-rose-600 text-white shadow-sm' 
                  : 'text-gray-500 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              Yiqilganlar ({failedExams})
            </button>
          </div>

          {/* Custom Styled Course Dropdown */}
          <div className="w-full sm:w-64 relative z-40">
            <CustomSelect
              icon={BookOpen}
              options={[
                { value: 'all', label: 'Barcha Kurslar', subtext: 'Hammasi' },
                { value: 'html', label: 'HTML', subtext: '11 ta dars' },
                { value: 'css', label: 'CSS', subtext: '19 ta dars' },
                { value: 'javascript', label: 'JavaScript', subtext: '28 ta dars' },
                { value: 'react', label: 'React', subtext: '15 ta dars' },
                { value: 'nodejs', label: 'Node.js', subtext: 'Backend darslik' },
                { value: 'nextjs', label: 'Next.js', subtext: 'Fullstack darslik' },
                { value: 'vuejs', label: 'Vue.js', subtext: 'Frontend freymvork' },
                { value: 'typescript', label: 'TypeScript', subtext: 'Tiplangan JS' },
                { value: 'ai-integration', label: 'AI Bilan Ishlash', subtext: 'Sun\'iy intellekt' }
              ]}
              value={courseFilter}
              onChange={(val) => setCourseFilter(val)}
              placeholder="Kursni tanlang..."
              size="sm"
              className="w-full"
            />
          </div>

        </div>
      </div>

      {/* Main Table */}
      <div className="relative z-10 bg-white/95 dark:bg-[#101422]/90 backdrop-blur-xl rounded-3xl border border-gray-200/80 dark:border-white/[0.07] overflow-hidden shadow-xl shadow-gray-200/40 dark:shadow-black/40">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-xs text-gray-400">Imtihon natijalari yuklanmoqda...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Award className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Hech qanday imtihon natijasi topilmadi</p>
            <p className="text-xs text-gray-400">Qidiruv yoki filtrlarni o'zgartirib ko'ring.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-white/[0.02] text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-100 dark:border-white/[0.06]">
                <tr>
                  <th className="px-5 py-4"># ID</th>
                  <th className="px-5 py-4">O'quvchi</th>
                  <th className="px-5 py-4">Kurs / Imtihon</th>
                  <th className="px-5 py-4">To'plangan Ball</th>
                  <th className="px-5 py-4">To'g'ri / Xato</th>
                  <th className="px-5 py-4">Sarflangan Vaqt</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Sana</th>
                  <th className="px-5 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium text-gray-700 dark:text-gray-300">
                {filteredExams.map((exam, idx) => {
                  const studentName = exam.user_full_name || `${exam.user_first_name || ''} ${exam.user_last_name || ''}`.trim() || exam.user_username || 'O\'quvchi';
                  const isPassed = exam.status === 'passed';
                  const isReexam = exam.status === 'reexam';
                  const correct = exam.correct_count ?? 0;
                  const incorrect = exam.incorrect_count ?? 0;
                  const total = exam.total_questions ?? 20;

                  return (
                    <tr key={exam.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                      {/* ID */}
                      <td className="px-5 py-4 text-gray-400 font-mono text-[11px]">
                        #{exam.id}
                      </td>

                      {/* O'quvchi */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-sm flex-shrink-0">
                            {studentName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white truncate">
                              {studentName}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate flex items-center space-x-1 mt-0.5">
                              <span>{exam.user_email || `@${exam.user_username}`}</span>
                              {exam.user_phone && (
                                <>
                                  <span>&middot;</span>
                                  <span>{exam.user_phone}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Kurs */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-gray-900 dark:text-white flex items-center space-x-1">
                            <BookOpen className="w-3.5 h-3.5 text-brand-500 mr-1 flex-shrink-0" />
                            <span>{exam.course_title || exam.course_slug?.toUpperCase()}</span>
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            20 ta savollik yakuniy test
                          </span>
                        </div>
                      </td>

                      {/* Ball */}
                      <td className="px-5 py-4">
                        <div className="space-y-1.5 w-28">
                          <div className="flex items-center justify-between text-xs font-black">
                            <span className={
                              isPassed 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : isReexam 
                                ? 'text-amber-600 dark:text-amber-400' 
                                : 'text-rose-600 dark:text-rose-400'
                            }>
                              {exam.score}%
                            </span>
                            <span className="text-[10px] text-gray-400 font-normal">
                              {exam.score >= 70 ? 'O\'tdi' : 'Qayta'}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                isPassed 
                                  ? 'bg-emerald-500' 
                                  : isReexam 
                                  ? 'bg-amber-500' 
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, exam.score)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* To'g'ri / Xato */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Check className="w-3 h-3 mr-1" />
                            {correct} to'g'ri
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            <X className="w-3 h-3 mr-1" />
                            {incorrect} xato
                          </span>
                        </div>
                      </td>

                      {/* Sarflangan Vaqt */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-900/60 font-mono text-[11px] font-bold text-gray-700 dark:text-gray-300">
                          <Clock className="w-3.5 h-3.5 text-brand-500" />
                          <span>{formatDuration(exam.time_spent_seconds)}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {isPassed ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Muvaffaqiyatli</span>
                          </span>
                        ) : isReexam ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Qayta Topshirish</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-sm">
                            <XCircle className="w-3 h-3" />
                            <span>Yetarli Emas</span>
                          </span>
                        )}
                      </td>

                      {/* Sana */}
                      <td className="px-5 py-4 text-gray-400 text-[11px] whitespace-nowrap">
                        {formatDate(exam.created_at)}
                      </td>

                      {/* Amallar */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedExamForPreview(exam)}
                            title="Tafsilotlarni ko'rish"
                            className="p-2 rounded-xl text-gray-500 hover:text-brand-600 hover:bg-brand-500/10 dark:hover:bg-brand-500/20 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedExamForDelete(exam)}
                            title="O'chirish"
                            className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tafsilotlar Modali (Preview Modal) */}
      {selectedExamForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedExamForPreview(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Imtihon Natijasi #{selectedExamForPreview.id}
                </h3>
                <p className="text-xs text-gray-400">
                  {selectedExamForPreview.course_title} &middot; {formatDate(selectedExamForPreview.created_at)}
                </p>
              </div>
            </div>

            {/* O'quvchi ma'lumotlari */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">O'quvchi:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedExamForPreview.user_full_name || selectedExamForPreview.user_username}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedExamForPreview.user_email || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Telefon:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedExamForPreview.user_phone || '-'}
                </span>
              </div>
            </div>

            {/* Metrikalar jadvali */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-gray-400 text-[10px]">To'plangan Ball</p>
                <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-0.5">
                  {selectedExamForPreview.score}%
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-gray-400 text-[10px]">Sarflangan Vaqt</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                  {formatDuration(selectedExamForPreview.time_spent_seconds)}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 text-center">
                <p className="text-emerald-600 dark:text-emerald-400 text-[10px]">To'g'ri Javoblar</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {selectedExamForPreview.correct_count ?? 0} ta
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 text-center">
                <p className="text-rose-600 dark:text-rose-400 text-[10px]">Xato Javoblar</p>
                <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                  {selectedExamForPreview.incorrect_count ?? 0} ta
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedExamForPreview(null)}
              className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* O'chirishni Tasdiqlash Modali */}
      <ConfirmModal
        isOpen={!!selectedExamForDelete}
        onClose={() => setSelectedExamForDelete(null)}
        onConfirm={() => selectedExamForDelete && deleteMutation.mutate(selectedExamForDelete.id)}
        title="Imtihon natijasini o'chirish"
        message={`Haqiqatan ham #${selectedExamForDelete?.id} raqamli imtihon natijasini butunlay o'chirmoqchimisiz?`}
        confirmText="O'chirish"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />

    </div>
  );
};
