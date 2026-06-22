import { useState } from 'react';
import { useI18n } from '../i18n';
import { usePremium } from '../contexts/PremiumContext';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import BottomNav from '../components/BottomNav';
import PaywallModal from '../components/PaywallModal';
import {
  FileUp, Clock, HelpCircle, Calendar, MessageSquare,
  Copy, Check, AlertTriangle, Sparkles, Lock, Send, Pencil, BookmarkCheck,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { AnalysisResult } from '../lib/store';
import { generateReply, AnalysisError } from '../services/analysisService';
import { saveReply } from '../lib/db';

type ReplyType = 'submitDocs' | 'extendDeadline' | 'inquiry' | 'reschedule' | 'general';

const replyTypes: { key: ReplyType; icon: typeof FileUp }[] = [
  { key: 'submitDocs', icon: FileUp },
  { key: 'extendDeadline', icon: Clock },
  { key: 'inquiry', icon: HelpCircle },
  { key: 'reschedule', icon: Calendar },
  { key: 'general', icon: MessageSquare },
];

export default function Reply() {
  const { t } = useI18n();
  const { isPremium } = usePremium();
  const { user } = useAuth();
  const location = useLocation();
  const analysis = location.state?.analysis as AnalysisResult | undefined;
  const documentId = location.state?.documentId as string | undefined;

  const [selectedType, setSelectedType] = useState<ReplyType | null>(null);
  const [editedText, setEditedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [savedToDoc, setSavedToDoc] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!isPremium) { setShowPaywall(true); return; }
    if (!selectedType) return;
    setGenerating(true);
    setError(null);
    setSent(false);
    setSavedToDoc(false);
    try {
      const text = await generateReply(selectedType, analysis || {} as AnalysisResult, 'de');
      setEditedText(text);
    } catch (err) {
      const msg = err instanceof AnalysisError ? err.message : 'Antwort konnte nicht generiert werden.';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const persistReply = async () => {
    if (!user || !documentId || !selectedType || savedToDoc) return;
    try {
      await saveReply(user.id, documentId, selectedType, editedText);
      setSavedToDoc(true);
    } catch (err) {
      console.error('saveReply error:', err);
    }
  };

  const openMailto = (subject: string) => {
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(editedText)}`;
    window.open(mailto, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const handleSend = async () => {
    const subject = analysis?.sender
      ? `${t('reply.shareSubject')}: ${analysis.sender}`
      : t('reply.shareSubject');

    // Persist reply to document before sending
    await persistReply();

    if (navigator.share) {
      try {
        await navigator.share({ title: subject, text: editedText });
        setSent(true);
        setTimeout(() => setSent(false), 3000);
        return;
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
    openMailto(subject);
  };

  return (
    <>
      <Layout title={t('reply.title')} showBack>
        <div className="space-y-4">
          {!isPremium && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                {t('premium.replyLocked')}
              </span>
            </div>
          )}

          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('reply.selectType')}</h3>
          <div className="space-y-2">
            {replyTypes.map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setSelectedType(key); setEditedText(''); setSent(false); setSavedToDoc(false); }}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-start
                  ${selectedType === key
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{t(`reply.${key}`)}</span>
                {!isPremium && <Lock className="w-3.5 h-3.5 ms-auto text-amber-500" />}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!selectedType || generating}
            className={`w-full py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2
              ${selectedType && !generating
                ? isPremium
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('premium.generating')}
              </>
            ) : !isPremium ? (
              <>
                <Lock className="w-4 h-4" />
                {t('premium.unlockPremium')}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t('reply.generate')}
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {editedText && (
            <div className="space-y-3">
              {/* Editable letter area */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <Pencil className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('reply.editHint')}</span>
                </div>
                <textarea
                  value={editedText}
                  onChange={e => setEditedText(e.target.value)}
                  rows={14}
                  className="w-full p-4 text-sm text-gray-700 dark:text-gray-300 bg-transparent leading-relaxed resize-none outline-none font-sans"
                  spellCheck
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{t('reply.draftNotice')}</p>
                </div>
              </div>

              {/* Saved-to-document confirmation */}
              {savedToDoc && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    {t('reply.savedToDoc')}
                  </span>
                </div>
              )}

              {/* Copy + Send row */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? t('reply.copied') : t('reply.copy')}
                </button>
                <button
                  onClick={handleSend}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                    ${sent
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'}`}
                >
                  {sent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  {sent ? t('reply.sent') : t('reply.send')}
                </button>
              </div>

              {/* Save to document without sending */}
              {documentId && !savedToDoc && (
                <button
                  onClick={persistReply}
                  className="w-full py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  {t('reply.saveToDoc')}
                </button>
              )}
            </div>
          )}
        </div>
      </Layout>
      {showPaywall && <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} feature="Antwortgenerator" />}
      <BottomNav />
    </>
  );
}
