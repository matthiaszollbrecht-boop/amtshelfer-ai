import { useState } from 'react';
import { useI18n } from '../i18n';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface DisclaimerModalProps {
  onAccept: () => void;
}

export default function DisclaimerModal({ onAccept }: DisclaimerModalProps) {
  const { t } = useI18n();
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
        {/* Header band */}
        <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-100 dark:border-amber-800 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-800/60 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-base font-semibold text-amber-900 dark:text-amber-200">
            {t('disclaimer.title')}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('disclaimer.text')}
          </p>

          {/* Mandatory checkbox */}
          <label className="flex items-start gap-3 mt-5 cursor-pointer select-none group">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={checked}
                onChange={e => setChecked(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                ${checked
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'}`}
              >
                {checked && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
              {t('disclaimer.accept')}
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onAccept}
            disabled={!checked}
            className={`w-full font-medium py-3 rounded-xl transition-all
              ${checked
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}
          >
            {t('disclaimer.accept')}
          </button>
          {!checked && (
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Bitte Checkbox ankreuzen, um fortzufahren
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
