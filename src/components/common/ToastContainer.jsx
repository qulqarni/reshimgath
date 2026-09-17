import React from 'react';
import { useProfiles } from '../../context/ProfileContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts } = useProfiles();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all transform translate-y-0 animate-bounce-short ${
            toast.type === 'success'
              ? 'bg-brand-plum text-white border-brand-gold'
              : toast.type === 'warning'
              ? 'bg-amber-800 text-amber-50 border-amber-500'
              : 'bg-brand-charcoal text-white border-gray-700'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-brand-gold shrink-0 mr-3 mt-0.5" />}
          {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-300 shrink-0 mr-3 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-brand-rose shrink-0 mr-3 mt-0.5" />}
          
          <div className="text-sm font-medium leading-snug">{toast.message}</div>
        </div>
      ))}
    </div>
  );
};
