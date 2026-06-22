import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import BottomNav from '../components/BottomNav';
import RiskBadge from '../components/RiskBadge';
import { Reminder } from '../lib/store';
import { getReminders, createReminder, updateReminder, deleteReminder } from '../lib/db';
import { Bell, Clock, AlertOctagon, LucideIcon, Loader2, Plus, Pencil, Trash2, FileText, X } from 'lucide-react';

type ModalMode = 'create' | 'edit';

interface ReminderForm {
  title: string;
  deadline: string;
}

export default function Reminders() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ReminderForm>({ title: '', deadline: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user || isGuest) { setLoading(false); return; }
    getReminders(user.id)
      .then(data => { setReminders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, isGuest]);

  const sorted = [...reminders].sort((a, b) => a.daysLeft - b.daysLeft);
  const overdue = sorted.filter(r => r.daysLeft <= 0);
  const urgent = sorted.filter(r => r.daysLeft > 0 && r.daysLeft <= 3);
  const soon = sorted.filter(r => r.daysLeft > 3 && r.daysLeft <= 7);
  const later = sorted.filter(r => r.daysLeft > 7);

  const openCreate = () => {
    setModalMode('create');
    setEditingId(null);
    setForm({ title: '', deadline: '' });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (r: Reminder, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode('edit');
    setEditingId(r.id);
    setForm({ title: r.documentTitle, deadline: r.deadline });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError(t('reminders.reminderTitle') + ' fehlt'); return; }
    if (!form.deadline) { setFormError(t('reminders.deadlineDate') + ' fehlt'); return; }
    if (!user) return;

    setSaving(true);
    setFormError(null);
    try {
      if (modalMode === 'create') {
        const newR = await createReminder(user.id, form.title.trim(), form.deadline);
        setReminders(prev => [...prev, newR].sort((a, b) => a.daysLeft - b.daysLeft));
      } else if (editingId) {
        await updateReminder(editingId, form.title.trim(), form.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dl = new Date(form.deadline);
        dl.setHours(0, 0, 0, 0);
        const daysLeft = Math.round((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        setReminders(prev =>
          prev
            .map(r => r.id === editingId ? { ...r, documentTitle: form.title.trim(), deadline: form.deadline, daysLeft } : r)
            .sort((a, b) => a.daysLeft - b.daysLeft)
        );
      }
      setModalOpen(false);
    } catch {
      setFormError('Fehler beim Speichern. Bitte erneut versuchen.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('deleteReminder error:', err);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const renderGroup = (title: string, items: Reminder[], Icon: LucideIcon) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4" key={title}>
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        </div>
        <div className="space-y-2">
          {items.map(r => (
            <div
              key={r.id}
              className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <button
                onClick={() => r.documentId ? navigate(`/analysis/${r.documentId}`) : undefined}
                className="flex-1 flex items-center gap-3 text-start min-w-0"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                  ${r.daysLeft <= 0 ? 'bg-red-100 dark:bg-red-900/30' : r.daysLeft <= 3 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}
                >
                  <Clock className={`w-5 h-5 ${r.daysLeft <= 0 ? 'text-red-600 dark:text-red-400' : r.daysLeft <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.documentTitle}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400">
                      {r.daysLeft <= 0 ? t('reminders.overdue') : `${r.daysLeft} ${t('reminders.daysLeft')}`}
                      {' · '}{r.deadline}
                    </span>
                    {!r.documentId && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
                        <FileText className="w-3 h-3" />
                        {t('reminders.noLinkedDoc')}
                      </span>
                    )}
                  </div>
                </div>
                <RiskBadge level={r.riskLevel} showLabel={false} size="sm" />
              </button>
              <button
                onClick={e => openEdit(r, e)}
                className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-shrink-0"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteId(r.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Layout
        title={t('reminders.title')}
        showBack
        headerRight={
          !isGuest ? (
            <button
              onClick={openCreate}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          ) : undefined
        }
      >
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : isGuest ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Bitte registrieren Sie sich, um Erinnerungen zu nutzen.
              </p>
              <button onClick={() => navigate('/home')} className="mt-3 text-xs text-blue-600 hover:underline">
                Zurück zur Startseite
              </button>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">{t('reminders.noReminders')}</p>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('reminders.add')}
              </button>
            </div>
          ) : (
            <>
              {renderGroup(t('reminders.overdue'), overdue, AlertOctagon)}
              {renderGroup(t('reminders.in1Day'), urgent, AlertOctagon)}
              {renderGroup(t('reminders.in3Days'), soon, Bell)}
              {renderGroup(t('reminders.in7Days'), later, Bell)}
            </>
          )}
        </div>

        {/* Delete confirmation */}
        {deleteId && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Trash2 className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('common.delete')}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t('reminders.deleteConfirm')}</p>
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
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create / Edit modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {modalMode === 'create' ? t('reminders.add') : t('reminders.edit')}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('reminders.reminderTitle')}
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder={t('reminders.reminderTitlePlaceholder')}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('reminders.deadlineDate')}
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                {formError && (
                  <p className="text-xs text-red-600 dark:text-red-400">{formError}</p>
                )}
              </div>
              <div className="flex gap-3 px-5 pb-5">
                <button
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('common.save')}
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
