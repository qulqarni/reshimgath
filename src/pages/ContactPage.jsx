import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { Phone, Mail, MapPin, CheckCircle2, Send } from 'lucide-react';

export const ContactPage = () => {
  const { t } = useLanguage();
  const { addInquiry } = useProfiles();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;
    addInquiry({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      message: formData.message
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-plum">
          {t('contactUs')}
        </h1>
        <p className="text-xs sm:text-sm text-brand-gray">
          Have questions about profile verification, Biodata PDF verification, or membership assistance? We are here to assist your family.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contact Info (Royal Dark Slate & Gold Theme) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden border border-amber-500/30">
          
          {/* Subtle Decorative Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-kesari/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-1 relative z-10">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
              Direct Assistance & Support
            </span>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-wide">
              Sambodhi Sarang Helpline HQ
            </h3>
          </div>

          <div className="space-y-4 text-xs text-slate-200 relative z-10 pt-1">
            
            <div className="flex items-start space-x-3.5 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:border-amber-400/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
                <Phone className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="font-bold text-slate-100">Call Helpline / WhatsApp</p>
                <p className="text-sm sm:text-base font-extrabold text-amber-300 font-mono tracking-wide">+91 9823425404</p>
                <span className="text-[10px] text-slate-400 block pt-0.5 font-medium">Mon - Sat: 9:30 AM to 7:00 PM IST</span>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:border-amber-400/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-400/30">
                <Mail className="w-5 h-5 text-blue-300" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="font-bold text-slate-100">Email Support</p>
                <p className="text-sm font-bold text-slate-200 break-all">pk9823435404@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:border-amber-400/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/30">
                <MapPin className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="font-bold text-slate-100">Bureau Office Address</p>
                <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                  Sambodhi Sarang Marriage Bureau, Ichalkaranji, Maharashtra
                </p>
              </div>
            </div>

          </div>

          <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between font-semibold">
            <span>Verified Bureau Operations</span>
            <span className="text-amber-400">Ichalkaranji, MH</span>
          </div>

        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-luxury space-y-6">
          <h3 className="font-serif font-bold text-xl text-slate-900">Send Support Message</h3>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Thank you! Our customer representative will reach out shortly.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Swara Patil"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9823425404"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="pk9823435404@gmail.com"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700">Message / Inquiry *</label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your inquiry or question for Sambodhi Sarang Marriage Bureau..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-slate-900 via-brand-blue to-slate-900 hover:from-slate-800 hover:to-slate-900 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 border border-brand-gold/30"
            >
              <Send className="w-4 h-4 text-amber-400" />
              <span>Send Support Message</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
