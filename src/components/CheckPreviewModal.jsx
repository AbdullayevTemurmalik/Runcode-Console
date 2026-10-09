import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, CheckCircle2, XCircle, Download, ExternalLink, FileText, CreditCard,
  ZoomIn, ZoomOut, RotateCw, RotateCcw
} from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

export const CheckPreviewModal = ({ isOpen, onClose, order, onApprove, onReject }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Reset controls when modal opens or order changes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, order]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleReset();
      } else if (e.key === 'r' || e.key === 'R') {
        handleRotate();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, zoom, rotation]);

  if (!isOpen || !order) return null;

  const isPdf = order.receipt_url?.toLowerCase().endsWith('.pdf');

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.25, 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      handleReset();
    }
  };

  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoom <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Plan name helper
  const getPlanBadge = (planName) => {
    switch (planName) {
      case '7_days':
        return { name: 'Test (7 Kunlik)', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' };
      case '1_month':
        return { name: 'Plus (1 Oylik)', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
      case '2_months':
        return { name: 'Pro (2 Oylik)', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case '3_months':
        return { name: 'Ultra (3 Oylik)', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
      default:
        return { name: planName || 'Tarif', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' };
    }
  };

  const planInfo = getPlanBadge(order.plan_name);

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      {/* Dark Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
        <div className="relative bg-white dark:bg-[#0f1422] w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-200 dark:border-white/[0.08] overflow-hidden my-6 z-10 animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between flex-shrink-0 bg-gray-50/60 dark:bg-white/[0.02]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center space-x-2">
                <span>To'lov Cheki Ko'rinishi</span>
                <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-gray-200 dark:bg-white/[0.1] text-gray-700 dark:text-gray-300">
                  #{order.id}
                </span>
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                Kattalashtirish (Zoom in/out) va to'liq tekshirish oynasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Order Summary Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] text-xs">
            <div>
              <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Foydalanuvchi</p>
              <p className="font-bold text-gray-900 dark:text-white truncate">{order.user_name || "Noma'lum"}</p>
              {order.user_username && (
                <p className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold truncate">@{order.user_username}</p>
              )}
              {order.user_phone && (
                <p className="text-[10px] text-gray-400 truncate">{order.user_phone}</p>
              )}
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Tarif</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${planInfo.color}`}>
                {planInfo.name}
              </span>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Summa</p>
              <p className="font-extrabold text-brand-600 dark:text-brand-400 text-sm mt-0.5">
                {order.amount?.toLocaleString()} so'm
              </p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">To'lov Usuli</p>
              <p className="font-bold text-gray-900 dark:text-white capitalize mt-0.5">
                {order.payment_method === 'apps' ? "To'lov ilovasi (Payme/Click)" : 'Bankomat'}
              </p>
            </div>
          </div>

          {/* Receipt Zoom & Controls Toolbar */}
          {!isPdf && order.receipt_url && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-xs">
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  title="Kichiklashtirish (-)"
                  className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/[0.1] disabled:opacity-40 transition cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  title="Masshtabni tiklash (100%)"
                  className="px-2 py-1 rounded-lg text-[11px] font-black font-mono text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-white/[0.1] transition cursor-pointer"
                >
                  {Math.round(zoom * 100)}%
                </button>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoom >= 4}
                  title="Kattalashtirish (+)"
                  className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/[0.1] disabled:opacity-40 transition cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

                <button
                  type="button"
                  onClick={handleRotate}
                  title="90° Burish (R)"
                  className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/[0.1] transition cursor-pointer flex items-center space-x-1"
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="text-[10px] hidden sm:inline">90°</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  title="Asliga qaytarish"
                  className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/[0.1] transition cursor-pointer flex items-center space-x-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-[10px] hidden sm:inline">Reset</span>
                </button>
              </div>

              <div className="flex items-center space-x-1">
                <a
                  href={getImageUrl(order.receipt_url)}
                  target="_blank"
                  rel="noreferrer"
                  title="To'liq hajmda yangi oynada ochish"
                  className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/[0.1] transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={getImageUrl(order.receipt_url)}
                  download={`receipt-order-${order.id}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  title="Yuklab olish"
                  className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/[0.1] transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* Receipt Image / PDF Display Container */}
          <div 
            className="rounded-2xl border border-gray-200 dark:border-white/[0.08] overflow-hidden bg-gray-950 flex flex-col items-center justify-center min-h-[340px] max-h-[520px] p-2 relative select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {order.receipt_url ? (
              isPdf ? (
                <div className="p-8 text-center space-y-3">
                  <FileText className="w-16 h-16 text-rose-500 mx-auto" />
                  <p className="text-xs text-gray-300 font-medium">PDF Chek Hujjati</p>
                  <a
                    href={getImageUrl(order.receipt_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition"
                  >
                    <span>PDF Faylni Yangi Oynada Ochish</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div 
                  className={`relative flex items-center justify-center w-full h-full min-h-[320px] overflow-hidden ${
                    zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
                  }`}
                  onDoubleClick={handleDoubleClick}
                >
                  <img
                    src={getImageUrl(order.receipt_url)}
                    alt="Chek rasmi"
                    draggable={false}
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                      transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
                    }}
                    className="max-h-[480px] max-w-full object-contain rounded-xl select-none"
                  />
                  {zoom > 1 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 backdrop-blur text-[10px] text-white/90 font-mono pointer-events-none">
                      Siljitish uchun torting | {Math.round(zoom * 100)}%
                    </div>
                  )}
                </div>
              )
            ) : (
              <p className="text-xs text-gray-400">Chek fayli yuklanmagan</p>
            )}
          </div>

          {/* Action Buttons if Pending */}
          {order.status === 'pending' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReject(order);
                }}
                className="px-5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Rad Etish (Sabab Bilan)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onApprove(order.id);
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/25 flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tasdiqlash & Obunani Yoqish</span>
              </button>
            </div>
          )}

        </div>

      </div>
      </div>
    </div>,
    document.body
  );
};
