import { useState } from 'react';
import { useI18n } from '../i18n';
import { LANGUAGES } from '../i18n/types';
import { Check, ChevronRight, Shield, FileText, Sparkles, ClipboardList } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { t, setLanguage, language } = useI18n();
  const [step, setStep] = useState(0);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="flex flex-col items-center text-center py-8">
      <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-lg">
        <span className="text-white font-bold text-2xl">AH</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('onboarding.welcome')}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xs">{t('onboarding.welcomeDesc')}</p>
      <div className="w-full max-w-xs">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('onboarding.selectLanguage')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-2
                ${language === lang.code
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'}`}
            >
              <span className="block">{lang.nativeName}</span>
              <span className="block text-xs opacity-60">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 1: How it works
    <div key="explain" className="py-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        {t('onboarding.explainTitle')}
      </h2>
      <div className="space-y-4">
        {[
          { icon: FileText, text: t('onboarding.step1') },
          { icon: ClipboardList, text: t('onboarding.step2') },
          { icon: Sparkles, text: t('onboarding.step3') },
          { icon: Check, text: t('onboarding.step4') },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // Step 2: Privacy & Disclaimer
    <div key="privacy" className="py-8">
      <div className="flex items-center justify-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
          <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
        {t('onboarding.privacyTitle')}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center leading-relaxed">
        {t('onboarding.privacyDesc')}
      </p>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
          {t('disclaimer.text')}
        </p>
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={privacyAgreed}
            onChange={e => setPrivacyAgreed(e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">{t('onboarding.privacyAgree')}</span>
        </label>
        <label className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={disclaimerAgreed}
            onChange={e => setDisclaimerAgreed(e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">{t('onboarding.disclaimerAgree')}</span>
        </label>
      </div>
    </div>,
  ];

  const canProceed = step === 0 || step === 1 || (step === 2 && privacyAgreed && disclaimerAgreed);
  const isLastStep = step === steps.length - 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="max-w-lg mx-auto w-full px-6 flex-1">
        <div className="flex gap-1.5 py-4">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
          ))}
        </div>
        {steps[step]}
      </div>
      <div className="max-w-lg mx-auto w-full px-6 pb-8 pt-4">
        <button
          disabled={!canProceed}
          onClick={() => isLastStep ? onComplete() : setStep(s => s + 1)}
          className={`w-full py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2
            ${canProceed
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}
        >
          {isLastStep ? t('onboarding.start') : t('onboarding.next')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
