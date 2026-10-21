import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Phone, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  History,
  PartyPopper
} from 'lucide-react';

export const UpcomingEventsPage = () => {
  const { lang } = useLanguage();
  const { events } = useProfiles();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'

  const nowStr = new Date().toISOString().split('T')[0];

  // Separate events into upcoming and past
  const publishedEvents = (events || []).filter((e) => e.published !== false);

  const upcomingEvents = publishedEvents.filter((e) => {
    if (!e.date) return true;
    return e.date >= nowStr;
  }).sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const pastEvents = publishedEvents.filter((e) => {
    if (!e.date) return false;
    return e.date < nowStr;
  }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const currentList = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="min-h-screen bg-brand-lightBg/40 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-rose/20 text-brand-plum text-xs font-bold border border-brand-rose/40">
            <PartyPopper className="w-3.5 h-3.5 text-brand-kesari" />
            <span>{lang === 'en' ? 'Community Gatherings & Melawas' : 'मेळावे व समाज संमेलन'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-brand-plum">
            {lang === 'en' ? 'Matrimonial Events & Melawa' : 'वधू-वर परिचय मेळावे'}
          </h1>

          <p className="text-xs sm:text-sm text-brand-gray leading-relaxed">
            {lang === 'en'
              ? 'Join our upcoming Vadhu-Var Melawas and face-to-face family meets across Maharashtra. Connect directly with eligible candidates and their parents in a cultural, dignified atmosphere.'
              : 'महाराष्ट्रातील विविध शहरांत आयोजित भव्य वधू-वर मेळावे आणि पालक भेट कार्यक्रम. थेट संवाद, पत्रिका मिलन आणि त्वरित नोंदणीची सुवर्णसंधी.'}
          </p>
        </div>

        {/* Tab Toggle (Upcoming vs Past Events) */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 bg-white rounded-2xl border border-brand-rose/20 shadow-sm">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'upcoming'
                  ? 'bg-brand-plum text-white shadow-md'
                  : 'text-brand-charcoal hover:bg-brand-lightBg'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Upcoming Events ({upcomingEvents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'past'
                  ? 'bg-brand-plum text-white shadow-md'
                  : 'text-brand-charcoal hover:bg-brand-lightBg'
              }`}
            >
              <History className="w-4 h-4 text-brand-rose" />
              <span>Past Events Archive ({pastEvents.length})</span>
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {currentList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-brand-rose/20 shadow-luxury space-y-3">
            <Calendar className="w-12 h-12 text-brand-rose mx-auto" />
            <h3 className="font-serif font-bold text-lg text-brand-plum">
              {activeTab === 'upcoming'
                ? (lang === 'en' ? 'No Upcoming Events Scheduled Yet' : 'सध्या कोणताही आगामी मेळावा नियोजित नाही')
                : (lang === 'en' ? 'No Past Events in Archive' : 'मागील मेळाव्यांचे रेकॉर्ड उपलब्ध नाही')}
            </h3>
            <p className="text-xs text-brand-gray">
              {lang === 'en'
                ? 'Stay tuned! New Melawa dates will be announced here soon. You may also contact our Ichalkaranji office.'
                : 'लवकरच नवीन मेळाव्यांची घोषणा येथे करण्यात येईल.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentList.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-3xl overflow-hidden shadow-luxury border border-brand-rose/20 hover:shadow-luxury-hover transition-all flex flex-col justify-between group"
              >
                {/* Poster Image */}
                <div className="relative h-56 overflow-hidden bg-brand-plum">
                  <img
                    src={event.posterUrl || '/popup_banner.jpg'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {event.city && (
                    <span className="absolute top-3 left-3 bg-brand-plum/90 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-sm border border-white/20 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-brand-gold" />
                      <span>{event.city}</span>
                    </span>
                  )}

                  <span className={`absolute bottom-3 right-3 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md shadow border ${
                    activeTab === 'upcoming'
                      ? 'bg-emerald-600/90 text-white border-emerald-400'
                      : 'bg-black/70 text-gray-300 border-white/20'
                  }`}>
                    {activeTab === 'upcoming' ? 'Registration Open' : 'Event Concluded'}
                  </span>
                </div>

                {/* Event Details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-serif font-bold text-xl text-brand-plum group-hover:text-rose-600 transition-colors">
                      {event.title}
                    </h3>

                    {/* Date & Time Badges */}
                    <div className="space-y-1.5 text-xs text-brand-charcoal">
                      <div className="flex items-center space-x-2 text-brand-kesari font-bold">
                        <Calendar className="w-4 h-4 shrink-0 text-brand-kesari" />
                        <span>{event.date}</span>
                      </div>

                      {event.time && (
                        <div className="flex items-center space-x-2 text-brand-gray font-medium">
                          <Clock className="w-4 h-4 shrink-0 text-brand-plum" />
                          <span>{event.time}</span>
                        </div>
                      )}

                      {event.venue && (
                        <div className="flex items-start space-x-2 text-brand-gray font-medium pt-0.5">
                          <MapPin className="w-4 h-4 shrink-0 text-brand-plum mt-0.5" />
                          <span className="leading-snug">{event.venue}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-brand-gray leading-relaxed line-clamp-3 pt-1">
                      {event.description}
                    </p>
                  </div>

                  {/* Actions / Registration CTA */}
                  <div className="pt-4 border-t border-brand-rose/15 space-y-2">
                    {event.registrationFee && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-brand-gray">Entry / Registration:</span>
                        <span className="font-bold text-emerald-700">{event.registrationFee}</span>
                      </div>
                    )}

                    {activeTab === 'upcoming' && event.registrationLink && (
                      <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-gradient-to-r from-brand-plum to-brand-plumDark hover:from-brand-plumDark hover:to-brand-plum text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-brand-gold/30"
                      >
                        <span>Register Now / नावनोंदणी करा</span>
                        <ExternalLink className="w-3.5 h-3.5 text-brand-gold" />
                      </a>
                    )}

                    {event.contactPhone && (
                      <a
                        href={`tel:${event.contactPhone}`}
                        className="w-full py-2 bg-gray-50 hover:bg-brand-lightBg text-brand-plum font-semibold text-xs rounded-xl border border-brand-rose/20 transition-all flex items-center justify-center space-x-2"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Helpline: {event.contactPhone}</span>
                      </a>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
