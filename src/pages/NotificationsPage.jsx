import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { Bell, Heart, CheckCircle, Eye, ShieldCheck } from 'lucide-react';

export const NotificationsPage = ({ onNavigate }) => {
  const { user, isAuthenticated, triggerPrivacyAlert } = useAuth();
  const { t } = useLanguage();
  const { notifications, markNotificationRead } = useProfiles();

  if (!isAuthenticated) {
    triggerPrivacyAlert();
    onNavigate('/login');
    return null;
  }

  const userNotifications = notifications.filter((n) => {
    if (!user) return true;
    if (n.type === 'view' && String(n.profileId) === String(user.id)) return false;
    if (n.targetUserId && String(n.targetUserId) !== String(user.id) && (user.email ? n.targetUserId !== user.email : true)) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-brand-plum/10 text-brand-plum flex items-center justify-center">
          <Bell className="w-5 h-5 text-brand-plum" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-plum">Notifications Center</h1>
          <p className="text-xs text-brand-gray">Stay updated on your partner interests, accepted requests & profile views.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury overflow-hidden divide-y divide-gray-100">
        {userNotifications.length === 0 ? (
          <div className="p-8 text-center text-xs font-medium text-brand-gray space-y-1">
            <p className="font-semibold text-brand-plum">No New Notifications</p>
            <p className="text-[11px]">When candidates express interest or visit your profile, notifications will appear here.</p>
          </div>
        ) : (
          userNotifications.map((n) => (
          <div
            key={n.id}
            onClick={() => {
              markNotificationRead(n.id);
              if (n.type === 'interest') onNavigate('/interests');
              if (n.type === 'accepted') onNavigate('/messages');
            }}
            className={`p-5 hover:bg-brand-ivory cursor-pointer transition-colors flex items-start space-x-4 ${
              n.unread ? 'bg-brand-rose/10' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-brand-plum/10 text-brand-plum flex items-center justify-center shrink-0 mt-0.5">
              {n.type === 'interest' ? <Heart className="w-5 h-5 text-brand-rose fill-brand-rose" /> : <CheckCircle className="w-5 h-5 text-brand-kesari" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-brand-plum">{n.title}</h4>
                <span className="text-xs text-gray-400">{n.time}</span>
              </div>
              <p className="text-xs text-brand-gray mt-1">{n.text}</p>
            </div>
          </div>
        ))
      )}
      </div>
    </div>
  );
};
