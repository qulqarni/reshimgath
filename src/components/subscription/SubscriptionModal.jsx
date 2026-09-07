import React, { useState } from 'react';
import { SUBSCRIPTION_PLANS } from '../../data/subscriptionPlans';
import { openRazorpayCheckout } from '../../services/razorpayService';
import { useAuth } from '../../context/AuthContext';
import { 
  Check, 
  X, 
  ShieldCheck, 
  Crown, 
  Sparkles, 
  CreditCard,
  Lock,
  Phone,
  Eye
} from 'lucide-react';

export const SubscriptionModal = ({ isOpen, onClose, targetProfileName = null }) => {
  const { user, subscribeUserToPlan } = useAuth();
  const [processingPlanId, setProcessingPlanId] = useState(null);

  if (!isOpen) return null;

  const handleSelectPlan = (plan) => {
    setProcessingPlanId(plan.id);

    openRazorpayCheckout({
      plan,
      user,
      onSuccess: ({ paymentId, plan }) => {
        setProcessingPlanId(null);
        subscribeUserToPlan(plan, paymentId);
        alert(`🎉 Payment Successful! (${paymentId})\nYour ${plan.name} Plan is now ACTIVE with ${plan.visits} Profile Visit Unlocks.`);
        if (onClose) onClose();
      },
      onError: (err) => {
        setProcessingPlanId(null);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center min-h-screen">
      <div className="bg-white max-w-5xl w-full max-h-[85vh] sm:max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative border border-slate-200 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Banner */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between relative border-b border-amber-500/30 shrink-0">
          <div className="space-y-1 min-w-0 pr-6">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-extrabold shadow-sm border border-amber-300">
              <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>संबोधी सारंग वधूवर सुचक केंद्र</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
              {targetProfileName 
                ? `Unlock Full Profile Access for ${targetProfileName}` 
                : 'CHOOSE A MATRIMONIAL MEMBERSHIP PLAN'}
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              Select a plan to start opening candidate profiles and viewing direct contact details.
            </p>
          </div>

          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-50/50">
          
          {targetProfileName && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center space-x-3 text-xs text-amber-950">
              <Lock className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <span className="font-bold">Subscription Required: </span>
                To view complete details, contact number, and biodata of <strong className="underline">{targetProfileName}</strong>, please activate any plan below.
              </div>
            </div>
          )}

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isProcessing = processingPlanId === plan.id;
              const isPopular = plan.popular;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all relative flex flex-col justify-between space-y-5 shadow-sm hover:shadow-xl ${
                    isPopular 
                      ? 'border-2 border-amber-400 shadow-md' 
                      : 'border-slate-200'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-4 py-1 rounded-full shadow-md border border-amber-300 flex items-center space-x-1 whitespace-nowrap">
                      <Sparkles className="w-3 h-3 fill-slate-950" />
                      <span>Most Popular Plan</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Header */}
                    <div className="text-center pb-4 border-b border-slate-100 space-y-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${plan.badgeColor}`}>
                        {plan.nameMar} ({plan.name})
                      </span>
                      <div className="flex items-baseline justify-center space-x-1 pt-1">
                        <span className="text-xs font-bold text-slate-500">₹</span>
                        <span className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900">
                          {plan.price.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl">
                        <Eye className="w-3.5 h-3.5 text-amber-600" />
                        <span>{plan.visits} Profile Unlocks / Visits</span>
                      </div>
                    </div>

                    {/* Features Bullet List */}
                    <ul className="space-y-2 text-xs text-slate-700 font-medium">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Razorpay Action Button */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isProcessing}
                      className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 ${plan.buttonBg} ${
                        isProcessing ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {isProcessing 
                          ? 'Opening Razorpay...' 
                          : `Pay ₹ ${plan.price.toLocaleString('en-IN')} with Razorpay`}
                      </span>
                    </button>
                    <p className="text-[10px] text-center text-slate-500 font-medium">
                      Instant Activation • {plan.visits} Profile Opening Credits
                    </p>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Bureau Contact Footer Banner */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-slate-900">100% Safe & Secure Online Payments</h4>
                <p className="text-slate-500 text-[11px]">
                  Processed securely via Razorpay (UPI, Google Pay, Credit/Debit Cards, NetBanking).
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 shrink-0">
              <Phone className="w-4 h-4 text-amber-700" />
              <span>Helpline: 9823425404</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
