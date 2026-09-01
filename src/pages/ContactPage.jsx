import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Phone, Mail, MapPin, CheckCircle2, Send } from 'lucide-react';

export const ContactPage = () => {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
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
        
        {/* Contact Info */}
        <div className="lg:col-span-5 bg-brand-plum text-white p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
          <h3 className="font-serif font-bold text-xl text-brand-rose">Sambodhi Sarang Helpline HQ</h3>

          <div className="space-y-4 text-xs text-gray-200">
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-brand-rose shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Call Helpline / WhatsApp</p>
                <p className="text-sm font-bold text-white mt-0.5">+91 9823425404</p>
                <span className="text-[10px] text-brand-rose">Mon - Sat: 9:30 AM to 7:00 PM IST</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-brand-rose shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Email Support</p>
                <p className="text-sm font-bold text-white mt-0.5">pk9823435404@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-brand-rose shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Bureau Address</p>
                <p className="text-sm text-white mt-0.5">Sambodhi Sarang Marriage Bureau, Ichalkaranji, Maharashtra</p>
              </div>
            </div>
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
                <label className="block font-semibold mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Swara Patil"
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9823425404"
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="pk9823435404@gmail.com"
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Message / Inquiry *</label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your inquiry or question for Sambodhi Sarang Marriage Bureau..."
                className="w-full p-3 rounded-xl border border-gray-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow-md hover:bg-brand-plumDark transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
