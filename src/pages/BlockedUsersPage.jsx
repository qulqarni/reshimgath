import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfiles } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { Ban, ArrowLeft, UserCheck, ShieldCheck, UserX, AlertCircle } from 'lucide-react';

export const BlockedUsersPage = ({ onNavigate }) => {
  const { user, blockedUsers, unblockUser } = useAuth();
  const { addToast } = useProfiles();
  const { t } = useLanguage();
  const [unblockingId, setUnblockingId] = useState(null);

  const handleUnblock = async (targetId, name) => {
    setUnblockingId(targetId);
    try {
      await unblockUser(targetId);
      addToast(`${name || 'Member'} has been unblocked.`, 'success');
    } catch (err) {
      console.error('Error unblocking user:', err);
      addToast('Failed to unblock member.', 'error');
    } finally {
      setUnblockingId(null);
    }
  };

  const list = Array.isArray(blockedUsers) ? blockedUsers : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 pb-28 md:pb-12 space-y-6">
      {/* Back button & Heading */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onNavigate('/settings')}
          className="p-2 rounded-xl border border-gray-200 text-brand-charcoal hover:bg-brand-lightBg transition-colors"
          title="Back to Settings"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-plum">
            Blocked Members
          </h1>
          <p className="text-xs text-brand-gray">
            ब्लॉक केलेले सदस्य • Manage members you have restricted from contacting you.
          </p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-serif font-bold text-lg text-brand-plum">
              No Blocked Members
            </h3>
            <p className="text-xs text-brand-gray leading-relaxed">
              You haven't blocked any members yet. When you block a member from their profile or chat, they will appear here and will be prevented from contacting you.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-brand-lightBg/30">
            <div className="flex items-center space-x-2 text-xs font-bold text-brand-plum">
              <Ban className="w-4 h-4 text-rose-500" />
              <span>{list.length} {list.length === 1 ? 'Blocked Member' : 'Blocked Members'}</span>
            </div>
            <span className="text-[11px] text-brand-gray">
              Unblocked members can contact you again.
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {list.map((item, idx) => {
              const itemObj = typeof item === 'object' ? item : { id: item, name: `Member ${item}` };
              const id = itemObj.id || `blocked_${idx}`;
              const name = itemObj.name || 'Member';
              const regId = itemObj.regId || (itemObj.registrationId ? `SS-${itemObj.registrationId}` : `SS-${id}`);
              const avatar = itemObj.avatar || '/default-avatar.png';
              const district = itemObj.district || '';
              const blockedDate = itemObj.blockedAt ? new Date(itemObj.blockedAt).toLocaleDateString() : '';

              return (
                <div key={id} className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <img
                      src={avatar}
                      alt={name}
                      onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
                      className="w-12 h-12 rounded-full object-cover border border-rose-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-sm text-brand-plum truncate">
                        {name}
                      </h4>
                      <p className="text-[11px] text-brand-gray truncate">
                        {regId} {district ? `• ${district}` : ''}
                      </p>
                      {blockedDate && (
                        <p className="text-[10px] text-rose-500 mt-0.5">
                          Blocked on {blockedDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={unblockingId === id}
                    onClick={() => handleUnblock(id, name)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-brand-plum border border-brand-rose/40 hover:bg-brand-rose/20 transition-all shrink-0 flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-brand-plum" />
                    <span>{unblockingId === id ? 'Unblocking...' : 'Unblock'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
