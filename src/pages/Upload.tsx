import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { usePremium } from '../contexts/PremiumContext';
import Layout from '../components/Layout';
import BottomNav from '../components/BottomNav';
import DisclaimerModal from '../components/DisclaimerModal';
import PaywallModal from '../components/PaywallModal';
import { Camera, Upload as UploadIcon, FileUp, X, Loader2, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import { analyzeDocument, AnalysisError } from '../services/analysisService';

export default function Upload() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { canAnalyze, isPremium, analysesUsed, analysesLimit, incrementUsage } = usePremium();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState<'reading' | 'analyzing'>('reading');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [error, setError] = useState<{ message: string; code: string } | null>(null);

  const isPdfMode = searchParams.get('type') === 'pdf';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setError(null);
    setFiles(prev => [...prev, ...selected]);
    selected.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => setPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    if (!canAnalyze) {
      setShowPaywall(true);
      return;
    }
    setShowDisclaimer(true);
  };

  const handleDisclaimerAccept = async () => {
    setShowDisclaimer(false);
    setAnalyzing(true);
    setError(null);
    setAnalyzeStep('reading');
    await new Promise(resolve => setTimeout(resolve, 800));
    setAnalyzeStep('analyzing');
    try {
      const result = await analyzeDocument(files[0], language);
      incrementUsage();
      navigate('/analysis/new', { state: { analysis: result, ocrText: result.ocrText || '', file: files[0] } });
    } catch (err) {
      setAnalyzing(false);
      if (err instanceof AnalysisError) {
        setError({ message: err.message, code: err.code });
      } else {
        setError({ message: 'Ein unbekannter Fehler ist aufgetreten. Bitte erneut versuchen.', code: 'unknown' });
      }
    }
  };

  return (
    <>
      <Layout title={t('upload.title')} showBack>
        <div className="space-y-4">
          {/* Usage counter for free users */}
          {!isPremium && (
            <div className={`flex items-center justify-between p-3 rounded-xl border
              ${canAnalyze
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'}`}
            >
              <span className={`text-sm font-medium ${canAnalyze ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
                {canAnalyze
                  ? `${analysesUsed}/${analysesLimit} ${t('premium.free')} ${t('premium.freeAnalyses')}`
                  : t('premium.limitReached')}
              </span>
              {!canAnalyze && (
                <button
                  onClick={() => navigate('/premium')}
                  className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
                >
                  {t('premium.unlockPremium')} →
                </button>
              )}
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors">
            <div className="flex flex-col items-center gap-4">
              {isPdfMode ? (
                <FileUp className="w-12 h-12 text-gray-400" />
              ) : (
                <Camera className="w-12 h-12 text-gray-400" />
              )}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isPdfMode ? t('upload.uploadPdf') : t('upload.takePhoto')}
                </p>
                <p className="text-xs text-gray-400 mt-1">{t('upload.supportedFormats')}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Camera className="w-4 h-4 inline-block me-1.5" />
                  {t('upload.takePhoto')}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <UploadIcon className="w-4 h-4 inline-block me-1.5" />
                  {t('upload.uploadImage')}
                </button>
              </div>
            </div>
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Previews */}
          {previews.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('upload.preview')}</h3>
              <div className="grid grid-cols-3 gap-2">
                {previews.map((preview, i) => (
                  <div key={i} className="relative group">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      {files[i]?.type === 'application/pdf' ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileUp className="w-8 h-8 text-gray-400" />
                        </div>
                      ) : (
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute -top-1.5 -end-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">{t('upload.multiPage')}</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    {error.code === 'unreadable' ? 'Dokument nicht lesbar' :
                     error.code === 'api_key_missing' ? 'Konfigurationsfehler' :
                     error.code === 'network_error' ? 'Verbindungsfehler' : 'Fehler bei der Analyse'}
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1 leading-relaxed">{error.message}</p>
                  {error.code === 'unreadable' && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                      Tipps: Gutes Licht verwenden, Dokument flach hinlegen, alle 4 Ecken sichtbar halten.
                    </p>
                  )}
                </div>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {error.code !== 'api_key_missing' && (
                <button
                  onClick={() => { setError(null); setShowDisclaimer(true); }}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Erneut versuchen
                </button>
              )}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={files.length === 0 || analyzing}
            className={`w-full py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2
              ${files.length > 0 && !analyzing && canAnalyze
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                : files.length > 0 && !analyzing && !canAnalyze
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {analyzeStep === 'reading' ? 'Dokument wird gelesen...' : 'KI analysiert...'}
              </>
            ) : !canAnalyze ? (
              <>
                <Eye className="w-5 h-5" />
                {t('premium.premiumRequired')}
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                {t('upload.analyze')}
              </>
            )}
          </button>

          {files.length > 0 && !analyzing && canAnalyze && (
            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
              GPT-4o liest und analysiert Ihr Dokument. Dauert ca. 10–20 Sekunden.
            </p>
          )}
        </div>
      </Layout>
      {showDisclaimer && <DisclaimerModal onAccept={handleDisclaimerAccept} />}
      {showPaywall && <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} feature="Analyse" />}
      <BottomNav />
    </>
  );
}
