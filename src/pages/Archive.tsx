import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import BottomNav from '../components/BottomNav';
import RiskBadge from '../components/RiskBadge';
import { ArchivedDocument, Category } from '../lib/store';
import { getDocuments, deleteDocument, getSignedUrl } from '../lib/db';
import { Search, FileText, Trash2, Loader2, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES: Category[] = ['authority', 'health', 'insurance', 'bank', 'work', 'housing', 'other'];

export default function Archive() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  const [documents, setDocuments] = useState<ArchivedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, [checkScroll]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -140 : 140, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!user || isGuest) { setLoading(false); return; }
    getDocuments(user.id)
      .then(docs => { setDocuments(docs); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, isGuest]);

  const filtered = documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.sender.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || doc.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error('deleteDocument error:', err);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleDownload = async (doc: ArchivedDocument) => {
    if (!doc.fileUrl) return;
    setDownloadingId(doc.id);
    try {
      const signedUrl = await getSignedUrl(doc.fileUrl);
      const a = document.createElement('a');
      a.href = signedUrl;
      a.download = doc.fileUrl.split('/').pop() || 'dokument';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <Layout title={t('archive.title')} showBack>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('archive.search')}
              className="w-full ps-10 pe-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Category Filter with scroll arrows */}
          <div className="relative flex items-center gap-1">
            {/* Left arrow */}
            <button
              onClick={() => scroll('left')}
              className={`flex-shrink-0 w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-sm transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              tabIndex={-1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable row */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-2 pb-1">
                <button
                  onClick={() => setCategory('all')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                    ${category === 'all' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}
                >
                  {t('archive.all')}
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                      ${category === cat ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}
                  >
                    {t(`archive.${cat}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Right arrow */}
            <button
              onClick={() => scroll('right')}
              className={`flex-shrink-0 w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-sm transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              tabIndex={-1}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Documents */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : isGuest ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Bitte registrieren Sie sich, um Dokumente zu speichern.
              </p>
              <button onClick={() => navigate('/home')} className="mt-3 text-xs text-blue-600 hover:underline">
                Zurück zur Startseite
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400 dark:text-gray-500">{t('archive.noDocs')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <button
                    onClick={() => navigate(`/analysis/${doc.id}`)}
                    className="flex-1 flex items-center gap-3 text-start min-w-0 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{doc.date}</span>
                        <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
                        <span className="text-xs text-gray-400">{t(`archive.${doc.category}`)}</span>
                      </div>
                    </div>
                    <RiskBadge level={doc.riskLevel} showLabel={false} size="sm" />
                  </button>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {doc.fileUrl && (
                      <button
                        onClick={() => handleDownload(doc)}
                        disabled={downloadingId === doc.id}
                        title="Herunterladen"
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        {downloadingId === doc.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Download className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteId(doc.id)}
                      title={t('archive.delete')}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        {deleteId && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Trash2 className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('archive.delete')}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t('archive.deleteConfirm')}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('archive.delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
      <BottomNav />
    </>
  );
}
