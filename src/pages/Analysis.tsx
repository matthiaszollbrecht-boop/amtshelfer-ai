import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import BottomNav from '../components/BottomNav';
import RiskBadge from '../components/RiskBadge';
import DisclaimerModal from '../components/DisclaimerModal';
import { AnalysisResult } from '../lib/store';
import { saveDocument, getDocumentById, uploadFile, getSignedUrl, getReplies, deleteReply, SavedReply } from '../lib/db';
import {
  FileText, Clock, CreditCard, FolderOpen, Lightbulb, ArrowRight,
  Save, MessageSquare, AlertTriangle, Loader2, Download, Upload as UploadIcon,
  ChevronDown, ChevronUp, Trash2,
} from 'lucide-react';

type SaveState = 'idle' | 'uploading' | 'saving' | 'done';

export default function Analysis() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user, isGuest } = useAuth();

  const stateAnalysis = location.state?.analysis as AnalysisResult | undefined;
  const stateOcrText = location.state?.ocrText as string | undefined;
  const stateFile = location.state?.file as File | undefined;

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(stateAnalysis || null);
  const [fileUrl, setFileUrl] = useState<string | undefined>();
  const [loadingDoc, setLoadingDoc] = useState(!stateAnalysis && id !== 'new');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Resolved document ID (from URL param or captured after a fresh save)
  const [savedDocId, setSavedDocId] = useState<string | undefined>(
    id && id !== 'new' ? id : undefined
  );

  const [replies, setReplies] = useState<SavedReply[]>([]);
  const [expandedReplyId, setExpandedReplyId] = useState<string | null>(null);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);

  // Load from DB when navigating to an archived document
  useEffect(() => {
    if (stateAnalysis || id === 'new') return;
    if (!id) return;
    setLoadingDoc(true);
    getDocumentById(id)
      .then(doc => {
        if (doc) {
          setAnalysis(doc.analysis);
          setFileUrl(doc.fileUrl);
        }
        setLoadingDoc(false);
      })
      .catch(() => setLoadingDoc(false));
  }, [id, stateAnalysis]);

  // Fetch saved replies whenever the document ID is known
  useEffect(() => {
    if (!savedDocId) return;
    getReplies(savedDocId).then(setReplies).catch(() => {});
  }, [savedDocId]);

  const handleDownload = async () => {
    if (!fileUrl) return;
    setDownloadLoading(true);
    try {
      const signedUrl = await getSignedUrl(fileUrl);
      const a = document.createElement('a');
      a.href = signedUrl;
      a.download = fileUrl.split('/').pop() || 'dokument';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDisclaimerAccept = async () => {
    setShowDisclaimer(false);
    setSaveError(null);
    if (!user || isGuest || !analysis) return;

    let storagePath = '';

    if (stateFile) {
      setSaveState('uploading');
      try {
        storagePath = await uploadFile(user.id, stateFile);
      } catch (err) {
        console.warn('Storage upload failed, saving without file:', err);
      }
    }

    setSaveState('saving');
    try {
      const saved = await saveDocument(user.id, analysis, stateOcrText || '', storagePath);
      if (saved.fileUrl) setFileUrl(saved.fileUrl);
      setSavedDocId(saved.id);
      setSaveState('done');
    } catch (err) {
      setSaveError('Speichern fehlgeschlagen. Bitte erneut versuchen.');
      setSaveState('idle');
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    setDeletingReplyId(replyId);
    try {
      await deleteReply(replyId);
      setReplies(prev => prev.filter(r => r.id !== replyId));
      if (expandedReplyId === replyId) setExpandedReplyId(null);
    } catch (err) {
      console.error('deleteReply error:', err);
    } finally {
      setDeletingReplyId(null);
    }
  };

  if (loadingDoc) {
    return (
      <Layout title={t('analysis.title')} showBack>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </Layout>
    );
  }

  if (!analysis) {
    return (
      <Layout title={t('analysis.title')} showBack>
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-gray-500">{t('common.error')}</p>
          <button
            onClick={() => navigate('/upload')}
            className="mt-4 text-blue-600 dark:text-blue-400 text-sm hover:underline"
          >
            {t('upload.title')} →
          </button>
        </div>
      </Layout>
    );
  }

  const isSaved = saveState === 'done';
  const isSaving = saveState === 'uploading' || saveState === 'saving';

  const saveLabel = () => {
    if (saveState === 'uploading') return 'Datei wird hochgeladen...';
    if (saveState === 'saving') return 'Wird gespeichert...';
    if (saveState === 'done') return t('common.saved');
    if (isGuest) return 'Login zum Speichern';
    return t('analysis.saveToArchive');
  };

  const sections = [
    { icon: FileText, label: t('analysis.summary'), content: analysis.summary },
    { icon: FileText, label: t('analysis.sender'), content: analysis.sender },
    { icon: FileText, label: t('analysis.type'), content: analysis.type },
    ...(analysis.deadlines.length > 0 ? [{ icon: Clock, label: t('analysis.deadlines'), content: analysis.deadlines.join('\n') }] : []),
    ...(analysis.payments.length > 0 ? [{ icon: CreditCard, label: t('analysis.payments'), content: analysis.payments.join('\n') }] : []),
    ...(analysis.documents.length > 0 ? [{ icon: FolderOpen, label: t('analysis.documents'), content: analysis.documents.join('\n') }] : []),
    { icon: Lightbulb, label: t('analysis.simpleExplanation'), content: analysis.simpleExplanation },
  ];

  return (
    <>
      <Layout title={t('analysis.title')} showBack>
        <div className="space-y-4">
          {/* Risk Level */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('analysis.riskLevel')}</span>
            <RiskBadge level={analysis.riskLevel} size="md" />
          </div>

          {/* Analysis Sections */}
          {sections.map((section, i) => (
            <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <section.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{section.label}</h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}

          {/* Next Steps */}
          {analysis.nextSteps.length > 0 && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('analysis.nextSteps')}</h3>
              </div>
              <ul className="space-y-2">
                {analysis.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Saved Replies */}
          {savedDocId && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex-1">
                  {t('analysis.savedReplies')}
                </h3>
                {replies.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                    {replies.length}
                  </span>
                )}
              </div>
              {replies.length === 0 ? (
                <p className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                  {t('analysis.noReplies')}
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {replies.map(reply => (
                    <li key={reply.id}>
                      <div className="flex items-center gap-2 px-4 py-3">
                        <button
                          onClick={() => setExpandedReplyId(expandedReplyId === reply.id ? null : reply.id)}
                          className="flex-1 flex items-center gap-3 text-start min-w-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {t(`reply.${reply.replyType}`)}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {expandedReplyId === reply.id
                            ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                        </button>
                        <button
                          onClick={() => handleDeleteReply(reply.id)}
                          disabled={deletingReplyId === reply.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                        >
                          {deletingReplyId === reply.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {expandedReplyId === reply.id && (
                        <div className="px-4 pb-4">
                          <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            {reply.content}
                          </pre>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Storage Upload Progress */}
          {isSaving && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                {saveState === 'uploading' ? 'Originaldatei wird in Storage gespeichert...' : 'Analyse wird archiviert...'}
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{t('analysis.disclaimer')}</p>
            </div>
          </div>

          {saveError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
              <p className="text-xs text-red-700 dark:text-red-300">{saveError}</p>
            </div>
          )}

          {/* Download original file */}
          {fileUrl && (
            <button
              onClick={handleDownload}
              disabled={downloadLoading}
              className="w-full py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              {downloadLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Download className="w-4 h-4" />}
              Originaldokument herunterladen
            </button>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/reply', { state: { analysis, documentId: savedDocId } })}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              {t('analysis.generateReply')}
            </button>
            <button
              onClick={() => !isSaved && !isSaving && !isGuest && setShowDisclaimer(true)}
              disabled={isSaved || isSaving || isGuest}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2
                ${isSaved
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
                  : isGuest
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSaved ? (
                <FileText className="w-4 h-4" />
              ) : stateFile ? (
                <UploadIcon className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saveLabel()}
            </button>
          </div>
        </div>
      </Layout>
      {showDisclaimer && <DisclaimerModal onAccept={handleDisclaimerAccept} />}
      <BottomNav />
    </>
  );
}
