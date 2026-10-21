import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { SUBSCRIPTION_PLANS } from '../data/subscriptionPlans';
import { openRazorpayCheckout } from '../services/razorpayService';
import { 
  Crown, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Phone, 
  HelpCircle,
  FileCheck,
  CreditCard,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';

const PLAN_RANKS = {
  basic: 1,
  standard: 2,
  premium: 3
};

export const SubscriptionPage = ({ onNavigate }) => {
  const { lang } = useLanguage();
  const { user, subscribeUserToPlan, isAuthenticated } = useAuth();
  const { subscriptionPlans } = useProfiles();
  const plansToRender = subscriptionPlans && subscriptionPlans.length > 0 ? subscriptionPlans : SUBSCRIPTION_PLANS;

  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [statusStep, setStatusStep] = useState('');

  // Active Subscription Calculations
  const currentSub = user?.subscription || {};
  const creditsRemaining = typeof currentSub.creditsRemaining === 'number'
    ? currentSub.creditsRemaining
    : (typeof user?.creditsRemaining === 'number' ? user.creditsRemaining : 0);
  const currentPlanId = (currentSub.planId || user?.subPlanId || 'none').toLowerCase();
  const isSubActive = currentPlanId !== 'none' && currentPlanId !== 'free' && creditsRemaining > 0;
  const activePlanRank = isSubActive ? (PLAN_RANKS[currentPlanId] || 0) : 0;

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      alert('Please log in or register your profile first to subscribe to a membership plan.');
      if (onNavigate) onNavigate('/login');
      return;
    }

    const targetRank = PLAN_RANKS[plan.id.toLowerCase()] || 0;
    const isCurrentActive = isSubActive && currentPlanId === plan.id.toLowerCase();
    const isLowerTier = isSubActive && targetRank < activePlanRank;

    if (isCurrentActive) {
      alert(`You already have an active ${plan.name} Plan with ${creditsRemaining} profile visit credits remaining.`);
      return;
    }

    if (isLowerTier) {
      alert(`You currently have an active ${currentSub.planName || currentPlanId.toUpperCase()} subscription. You cannot purchase a lower-tier plan while your current plan is active.`);
      return;
    }

    setProcessingPlanId(plan.id);
    setStatusStep('CREATING_ORDER');

    openRazorpayCheckout({
      plan,
      user,
      onStatusChange: (step) => {
        setStatusStep(step);
      },
      onSuccess: ({ paymentId, orderId, plan }) => {
        setProcessingPlanId(null);
        setStatusStep('');
        subscribeUserToPlan(plan, paymentId);
        alert(`🎉 Payment Verified & Successful!\nPayment ID: ${paymentId}\nYour ${plan.name} Plan is now ACTIVE with ${plan.visits} Profile Visit Unlocks.`);
      },
      onError: (err) => {
        setProcessingPlanId(null);
        setStatusStep('');
      }
    });
  };

  return (
    <div className="min-h-screen bg-brand-lightBg/40 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
            <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>{lang === 'en' ? 'Official Membership Plans' : 'अधिकृत वर्गणी व सदस्यत्व योजना'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-brand-plum">
            {lang === 'en' ? 'Choose Your Matrimonial Plan' : 'योग्य वर्गणी प्लॅन निवडा'}
          </h1>

          <p className="text-xs sm:text-sm text-brand-gray leading-relaxed">
            {lang === 'en'
              ? 'Unlock verified contact numbers, view comprehensive Biodata PDFs, and send unlimited matrimonial interests to compatible Maharashtrian brides and grooms.'
              : 'पडताळणी केलेले संपर्क क्रमांक मिळवा, संपूर्ण बायोडाटा पीडीएफ पहा आणि पसंतीच्या स्थळांना थेट मागणी पाठवा.'}
          </p>
        </div>

        {/* Active Plan Banner (if user has an active membership) */}
        {isSubActive && (
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-amber-500/15 via-amber-500/25 to-amber-500/15 border border-amber-400 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-md">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow">
                <Crown className="w-6 h-6 fill-slate-950" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900">Active Membership</span>
                <h3 className="font-serif font-bold text-lg text-slate-900">{currentSub.planName || currentPlanId.toUpperCase()} PLAN</h3>
                <p className="text-slate-600">You have <strong className="text-slate-900">{creditsRemaining} profile contact unlocks</strong> remaining.</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="px-3 py-1 bg-emerald-600 text-white rounded-full font-bold text-[11px] shadow-sm">
                Active & Verified
              </span>
            </div>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plansToRender.map((plan) => {
            const isPopular = plan.popular;
            const isProcessing = processingPlanId === plan.id;
            const isCurrentActive = isSubActive && currentPlanId === plan.id.toLowerCase();

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl overflow-hidden bg-white border transition-all flex flex-col justify-between ${
                  isPopular
                    ? 'border-amber-400 shadow-2xl ring-2 ring-amber-400/50 scale-100 md:-translate-y-2'
                    : 'border-brand-rose/20 shadow-luxury hover:shadow-luxury-hover'
                }`}
              >
                {/* Popular Ribbon */}
                {isPopular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-extrabold uppercase px-4 py-1 rounded-bl-xl shadow-md tracking-wider">
                      Most Recommended
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className={`p-6 sm:p-8 bg-gradient-to-br ${plan.headerBg || 'from-brand-plum to-brand-plumDark'} text-white space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-widest uppercase opacity-90">
                      {plan.nameMar || plan.name}
                    </span>
                    <Crown className="w-5 h-5 text-amber-300" />
                  </div>

                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
                    {plan.name}
                  </h3>

                  <div className="pt-2 flex items-baseline space-x-1">
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                      ₹{plan.price}
                    </span>
                    <span className="text-xs text-white/80">/ {plan.validity}</span>
                  </div>

                  <p className="text-[11px] text-white/90">
                    Includes <strong>{plan.visits} Verified Candidate Unlocks</strong>
                  </p>
                </div>

                {/* Features List */}
                <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-brand-charcoal uppercase tracking-wider block">
                      Plan Highlights:
                    </span>
                    <ul className="space-y-2.5 text-xs text-brand-charcoal">
                      {(plan.features || []).map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Checkout CTA Button */}
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isProcessing}
                      className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 ${
                        isCurrentActive
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                          : plan.buttonBg || 'bg-brand-plum hover:bg-brand-plumDark text-white'
                      }`}
                    >
                      {isProcessing ? (
                        <span>Processing with Razorpay...</span>
                      ) : isCurrentActive ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Currently Active ({creditsRemaining} Credits Left)</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Subscribe for ₹{plan.price}</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges & Guarantee */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-6 text-center text-xs text-brand-gray">
          <div className="p-4 bg-white rounded-2xl border border-brand-rose/20 space-y-1">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-brand-plum">100% Secure Payments</h4>
            <p className="text-[11px]">Powered by Razorpay with UPI, Cards, and Net Banking.</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-brand-rose/20 space-y-1">
            <FileCheck className="w-6 h-6 text-brand-plum mx-auto" />
            <h4 className="font-bold text-brand-plum">Screened Profiles</h4>
            <p className="text-[11px]">Verified family contact numbers and biodata credentials.</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-brand-rose/20 space-y-1">
            <Phone className="w-6 h-6 text-amber-600 mx-auto" />
            <h4 className="font-bold text-brand-plum">Personal Assistance</h4>
            <p className="text-[11px]">Helpline support at +91 9823425404 (Mon - Sat).</p>
          </div>
        </div>

      </div>
    </div>
  );
};
