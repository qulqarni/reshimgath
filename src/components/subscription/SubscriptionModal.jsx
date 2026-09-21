import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { SUBSCRIPTION_PLANS } from '../../data/subscriptionPlans';
import { openRazorpayCheckout } from '../../services/razorpayService';
import { useAuth } from '../../context/AuthContext';
import { useProfiles } from '../../context/ProfileContext';
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

const PLAN_RANKS = {
  basic: 1,
  standard: 2,
  premium: 3
};

export const SubscriptionModal = ({ isOpen, onClose, targetProfileName = null, reason = null }) => {
  const { user, subscribeUserToPlan } = useAuth();
  const { subscriptionPlans } = useProfiles();
  const plansToRender = subscriptionPlans && subscriptionPlans.length > 0 ? subscriptionPlans : SUBSCRIPTION_PLANS;
  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [statusStep, setStatusStep] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Active Subscription Calculations
  const currentSub = user?.subscription || {};
  const creditsRemaining = typeof currentSub.creditsRemaining === 'number' 
    ? currentSub.creditsRemaining 
    : (typeof user?.creditsRemaining === 'number' ? user.creditsRemaining : 0);
  const currentPlanId = (currentSub.planId || user?.subPlanId || 'none').toLowerCase();
  
  // A plan is active if user has an active plan ID and remaining credits > 0
  const isSubActive = currentPlanId !== 'none' && currentPlanId !== 'free' && creditsRemaining > 0;
  const activePlanRank = isSubActive ? (PLAN_RANKS[currentPlanId] || 0) : 0;

  const handleSelectPlan = (plan) => {
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
        if (onClose) onClose();
      },
      onError: (err) => {
        setProcessingPlanId(null);
        setStatusStep('');
      }
    });
  };

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[99999] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center">
      <div className="bg-white max-w-5xl w-full max-h-[85vh] sm:max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative border border-slate-200 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 pt-12 sm:pt-10 space-y-6 bg-slate-50/50">
          
          {targetProfileName && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center space-x-3 text-xs text-amber-950">
              <Lock className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <span className="font-bold">Subscription Required: </span>
                {reason === 'send_interest'
                  ? <>To express interest and connect with <strong className="underline">{targetProfileName}</strong>, please activate any membership plan below.</>
                  : reason === 'connect'
                  ? <>To accept interest and connect with <strong className="underline">{targetProfileName}</strong>, please activate any membership plan below.</>
                  : <>To view complete details, contact number, and biodata of <strong className="underline">{targetProfileName}</strong>, please activate any plan below.</>}
              </div>
            </div>
          )}

          {/* Active Subscription Banner (If User Has Active Plan) */}
          {isSubActive && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-300/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-950">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                  <Crown className="w-5 h-5 fill-slate-950" />
                </div>
                <div>
                  <p className="font-bold">Active Membership: <span className="uppercase text-amber-900 font-extrabold">{currentSub.planName || `${currentPlanId.toUpperCase()} Plan`}</span></p>
                  <p className="text-[11px] text-amber-900">You currently have <strong>{creditsRemaining} Profile Visit Unlocks</strong> remaining. You can upgrade to a higher tier plan anytime.</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-amber-200/80 text-amber-950 font-extrabold text-[10px] uppercase tracking-wider rounded-full border border-amber-400 shrink-0">
                Upgrade Eligible
              </span>
            </div>
          )}

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plansToRender.map((plan) => {
              const isProcessing = processingPlanId === plan.id;
              const isPopular = plan.popular;
              const targetRank = PLAN_RANKS[plan.id.toLowerCase()] || 0;
              const isCurrentActivePlan = isSubActive && currentPlanId === plan.id.toLowerCase();
              const isLowerTier = isSubActive && targetRank < activePlanRank;
              const isUpgrade = isSubActive && targetRank > activePlanRank;

              let btnLabel = `Pay ₹ ${plan.price.toLocaleString('en-IN')} with Razorpay`;
              let btnIcon = <CreditCard className="w-4 h-4" />;
              let btnStyle = plan.buttonBg;
              let isBtnDisabled = isProcessing || isCurrentActivePlan || isLowerTier;

              if (isCurrentActivePlan) {
                btnLabel = `Active Plan (${creditsRemaining} Left)`;
                btnIcon = <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />;
                btnStyle = 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold cursor-not-allowed opacity-90 shadow-none';
              } else if (isLowerTier) {
                btnLabel = 'Lower Tier (Not Available)';
                btnIcon = <Lock className="w-4 h-4 text-slate-400" />;
                btnStyle = 'bg-slate-100 text-slate-400 border border-slate-200 font-semibold cursor-not-allowed shadow-none';
              } else if (isUpgrade) {
                btnLabel = `Upgrade to ${plan.name} (₹ ${plan.price.toLocaleString('en-IN')})`;
                btnIcon = <Crown className="w-4 h-4 text-white fill-white" />;
                btnStyle = 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold shadow-lg hover:shadow-xl';
              }

              if (isProcessing) {
                btnLabel = statusStep === 'VERIFYING_PAYMENT' 
                  ? 'Verifying Payment...' 
                  : statusStep === 'CREATING_ORDER'
                  ? 'Creating Order...'
                  : 'Opening Razorpay...';
              }

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all relative flex flex-col justify-between space-y-5 shadow-sm hover:shadow-xl ${
                    isCurrentActivePlan
                      ? 'border-2 border-emerald-400 shadow-md ring-2 ring-emerald-400/20'
                      : isPopular 
                      ? 'border-2 border-amber-400 shadow-md' 
                      : isLowerTier
                      ? 'border-slate-200 opacity-60'
                      : 'border-slate-200'
                  }`}
                >
                  {isCurrentActivePlan ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-1 rounded-full shadow-md border border-emerald-400 flex items-center space-x-1 whitespace-nowrap">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Your Active Plan</span>
                    </div>
                  ) : isPopular && (
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
                      disabled={isBtnDisabled}
                      className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 ${btnStyle} ${
                        isProcessing ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      {btnIcon}
                      <span>{btnLabel}</span>
                    </button>
                    <p className="text-[10px] text-center text-slate-500 font-medium">
                      {isCurrentActivePlan 
                        ? `${creditsRemaining} Profile Opening Credits Remaining` 
                        : isUpgrade 
                        ? `Upgrades Plan & Adds +${plan.visits} Profile Visits`
                        : `Instant Activation • ${plan.visits} Profile Opening Credits`}
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
    </div>,
    document.body
  );
};
