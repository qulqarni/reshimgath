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
        
        {/* Contact Info (Rich Plum Gradient & Frosted Pink Theme) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-brand-plum via-brand-plumDark to-[#7A0037] text-white p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden border border-brand-rose/40">
          
          {/* Subtle Decorative Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-rose/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-brand-gold/15 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-1 relative z-10">
            <span className="text-[11px] font-bold text-brand-gold uppercase tracking-widest block">
              Direct Assistance & Support
            </span>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-wide">
              Sambodhi Sarang Helpline HQ
            </h3>
          </div>

          <div className="space-y-4 text-xs text-brand-rose relative z-10 pt-1">
            
            <div className="flex items-start space-x-3.5 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 hover:border-white/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/30">
                <Phone className="w-5 h-5 text-brand-gold" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="font-bold text-white">Call Helpline / WhatsApp</p>
                <p className="text-sm sm:text-base font-extrabold text-amber-300 font-mono tracking-wide">+91 9823425404</p>
                <span className="text-[10px] text-white/80 block pt-0.5 font-medium">Mon - Sat: 9:30 AM to 7:00 PM IST</span>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 hover:border-white/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/30">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="font-bold text-white">Email Support</p>
                <p className="text-sm font-bold text-white break-all">pk9823435404@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 hover:border-white/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/30">
                <MapPin className="w-5 h-5 text-brand-gold" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="font-bold text-white">Bureau Office Address</p>
                <p className="text-xs text-white/90 leading-relaxed pt-0.5">
                  Sambodhi Sarang Marriage Bureau, Ichalkaranji, Maharashtra
                </p>
              </div>
            </div>

          </div>

          <div className="pt-2 border-t border-white/20 text-[11px] text-white/80 flex items-center justify-between font-semibold">
            <span>Verified Bureau Operations</span>
            <span className="text-brand-gold">Ichalkaranji, MH</span>
          </div>

        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-6">
          <h3 className="font-serif font-bold text-xl text-brand-plum">Send Support Message</h3>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Thank you! Our customer representative will reach out shortly.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-brand-charcoal">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Swara Patil"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-brand-charcoal">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9823425404"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-brand-charcoal">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@gmail.com"
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-brand-charcoal">Message / Inquiry *</label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your inquiry or question for Sambodhi Sarang Marriage Bureau..."
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-brand-plum to-brand-plumDark hover:from-brand-plumDark hover:to-brand-plum text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-brand-gold/30"
            >
              <Send className="w-4 h-4 text-brand-gold" />
              <span>Send Support Message</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
