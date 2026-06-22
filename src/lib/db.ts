import { supabase } from './supabase';
import { AnalysisResult, ArchivedDocument, Category, Reminder, RiskLevel } from './store';

// ─── Category Inference ────────────────────────────────────────────────────

export function inferCategory(type: string, sender: string): Category {
  const s = (type + ' ' + sender).toLowerCase();
  if (s.match(/kranken|health|aok|tkk|barmer|dak|versicherung.*gesund|krankenkasse/)) return 'health';
  if (s.match(/versicherung|insurance|allianz|haftpflicht|gebäude|kfz-versicherung/)) return 'insurance';
  if (s.match(/bank|sparkasse|konto|kredit|giro|ing|dkb|volksbank|commerzbank/)) return 'bank';
  if (s.match(/arbeitsamt|jobcenter|employment|arbeit|sozialamt|agentur für arbeit/)) return 'work';
  if (s.match(/wohnung|miete|vermieter|rent|kündigung.*wohn|hausverwaltung|mietvertrag/)) return 'housing';
  if (s.match(/amt|behörde|finanzamt|bürger|steuerbescheid|rathaus|stadtamt|bescheid/)) return 'authority';
  return 'other';
}

// ─── Date Parsing ──────────────────────────────────────────────────────────

export function parseDeadlineDate(str: string): string | null {
  const deMatch = str.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (deMatch) {
    const [, d, m, y] = deMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const isoMatch = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];
  return null;
}

// ─── Storage ───────────────────────────────────────────────────────────────

const BUCKET = 'documents';

export async function uploadFile(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const safeName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 60);
  const path = `${userId}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || `application/${ext}` });

  if (error) throw error;
  return path;
}

export async function getSignedUrl(storagePath: string, expiresInSeconds = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteStorageFile(storagePath: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) console.error('Storage delete error (non-fatal):', error);
}

// ─── Profile ───────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  language: string;
  is_premium: boolean;
  analyses_used: number;
  subscription_type: 'monthly' | 'yearly' | null;
  subscription_expires_at: string | null;
  subscription_purchase_token: string | null;
  created_at: string;
  updated_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function ensureProfile(userId: string, email: string): Promise<Profile> {
  const existing = await getProfile(userId);
  if (existing) return existing;
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, email, language: 'de', is_premium: false, analyses_used: 0 })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAnalysesUsed(userId: string, count: number): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ analyses_used: count, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) console.error('updateAnalysesUsed:', error);
}

export async function setPremiumStatus(userId: string, isPremium: boolean): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_premium: isPremium, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

export interface SubscriptionResult {
  premium: boolean;
  subscriptionType?: 'monthly' | 'yearly';
  expiresAt?: string | null;
  message?: string;
  error?: string;
}

export async function verifyPurchase(
  purchaseToken: string,
  productId: string
): Promise<SubscriptionResult> {
  const { data, error } = await supabase.functions.invoke('verify-purchase', {
    body: { action: 'verify', purchaseToken, productId },
  });
  if (error) throw error;
  return data as SubscriptionResult;
}

export async function restoreSubscription(): Promise<SubscriptionResult> {
  const { data, error } = await supabase.functions.invoke('verify-purchase', {
    body: { action: 'restore' },
  });
  if (error) throw error;
  return data as SubscriptionResult;
}

// ─── Documents ─────────────────────────────────────────────────────────────

function toArchivedDocument(row: Record<string, unknown>): ArchivedDocument {
  const analysis = row.analysis_json as AnalysisResult;
  return {
    id: row.id as string,
    title: row.title as string,
    date: (row.created_at as string).split('T')[0],
    category: row.category as Category,
    sender: row.sender as string,
    riskLevel: row.risk_level as RiskLevel,
    deadlines: analysis?.deadlines || [],
    analysis,
    fileUrl: (row.file_url as string) || undefined,
  };
}

export async function saveDocument(
  userId: string,
  analysis: AnalysisResult,
  ocrText = '',
  storagePath = ''
): Promise<ArchivedDocument> {
  const category = inferCategory(analysis.type, analysis.sender);
  const senderShort = analysis.sender.split('—')[0]?.trim() || analysis.sender;
  const title = `${analysis.type} — ${senderShort}`;

  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      title,
      category,
      sender: analysis.sender,
      risk_level: analysis.riskLevel,
      ocr_text: ocrText,
      analysis_json: analysis,
      file_url: storagePath || null,
    })
    .select()
    .single();
  if (error) throw error;

  // Save each parseable deadline to the deadlines table
  const rows = analysis.deadlines
    .map(d => {
      const dateStr = parseDeadlineDate(d);
      if (!dateStr) return null;
      return { document_id: data.id, user_id: userId, title: d, deadline_date: dateStr };
    })
    .filter(Boolean);

  if (rows.length > 0) {
    const { error: dlErr } = await supabase.from('deadlines').insert(rows);
    if (dlErr) console.error('saveDocument deadlines:', dlErr);
  }

  return toArchivedDocument(data);
}

export async function getDocuments(userId: string): Promise<ArchivedDocument[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(toArchivedDocument);
}

export async function getDocumentById(id: string): Promise<ArchivedDocument | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return toArchivedDocument(data);
}

export async function deleteDocument(id: string): Promise<void> {
  // Fetch file_url before deletion (CASCADE will remove DB rows but not Storage)
  const { data } = await supabase
    .from('documents')
    .select('file_url')
    .eq('id', id)
    .maybeSingle();

  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw error;

  // Remove file from Storage (non-fatal if missing)
  if (data?.file_url) {
    await deleteStorageFile(data.file_url);
  }
}

// ─── Replies ───────────────────────────────────────────────────────────────

export interface SavedReply {
  id: string;
  documentId: string;
  replyType: string;
  content: string;
  createdAt: string;
}

export async function saveReply(
  userId: string,
  documentId: string,
  replyType: string,
  content: string
): Promise<SavedReply> {
  const { data, error } = await supabase
    .from('replies')
    .insert({ user_id: userId, document_id: documentId, reply_type: replyType, content })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, documentId: data.document_id, replyType: data.reply_type, content: data.content, createdAt: data.created_at };
}

export async function getReplies(documentId: string): Promise<SavedReply[]> {
  const { data, error } = await supabase
    .from('replies')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    documentId: row.document_id,
    replyType: row.reply_type,
    content: row.content,
    createdAt: row.created_at,
  }));
}

export async function deleteReply(id: string): Promise<void> {
  const { error } = await supabase.from('replies').delete().eq('id', id);
  if (error) throw error;
}

// ─── Reminders / Deadlines ─────────────────────────────────────────────────

export async function getReminders(userId: string): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('deadlines')
    .select('id, title, deadline_date, document_id, documents(title, risk_level)')
    .eq('user_id', userId)
    .order('deadline_date');
  if (error) throw error;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (data || []).map(row => {
    const deadline = new Date(row.deadline_date);
    deadline.setHours(0, 0, 0, 0);
    const daysLeft = Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const doc = row.documents as { title: string; risk_level: string } | null;
    return {
      id: row.id,
      documentId: row.document_id,
      documentTitle: doc?.title || row.title,
      deadline: row.deadline_date,
      daysLeft,
      riskLevel: (doc?.risk_level || 'yellow') as RiskLevel,
    };
  });
}

export async function createReminder(userId: string, title: string, deadlineDate: string): Promise<Reminder> {
  const { data, error } = await supabase
    .from('deadlines')
    .insert({ user_id: userId, title, deadline_date: deadlineDate, document_id: null })
    .select()
    .single();
  if (error) throw error;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(data.deadline_date);
  dl.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    id: data.id,
    documentId: data.document_id,
    documentTitle: data.title,
    deadline: data.deadline_date,
    daysLeft,
    riskLevel: 'yellow',
  };
}

export async function updateReminder(id: string, title: string, deadlineDate: string): Promise<void> {
  const { error } = await supabase
    .from('deadlines')
    .update({ title, deadline_date: deadlineDate, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteReminder(id: string): Promise<void> {
  const { error } = await supabase.from('deadlines').delete().eq('id', id);
  if (error) throw error;
}
