import { supabase } from '../lib/supabase';
import { AnalysisResult } from '../lib/store';

export class AnalysisError extends Error {
  constructor(
    message: string,
    public readonly code: 'unreadable' | 'api_key_missing' | 'server_error' | 'network_error'
  ) {
    super(message);
    this.name = 'AnalysisError';
  }
}

export async function analyzeDocument(file: File, language: string): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/analyze-document`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        Apikey: supabaseAnonKey,
      },
      body: formData,
    });
  } catch {
    throw new AnalysisError(
      'Keine Verbindung zum Server. Bitte prüfen Sie Ihre Internetverbindung.',
      'network_error'
    );
  }

  const json = await response.json();

  if (response.status === 422 && json.error === 'unreadable') {
    throw new AnalysisError(
      json.message || 'Das Dokument konnte nicht gelesen werden. Bitte ein klareres Foto aufnehmen.',
      'unreadable'
    );
  }

  if (response.status === 500 && json.error === 'config') {
    throw new AnalysisError(
      'OpenAI API-Schlüssel nicht konfiguriert. Bitte in Supabase Secrets hinterlegen.',
      'api_key_missing'
    );
  }

  if (!response.ok) {
    throw new AnalysisError(
      json.message || `Serverfehler (${response.status}). Bitte versuchen Sie es erneut.`,
      'server_error'
    );
  }

  return json as AnalysisResult;
}

export async function generateReply(
  replyType: string,
  analysis: AnalysisResult,
  language: string
): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/analyze-document`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        Apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'generate-reply', replyType, analysis, language }),
    });
  } catch {
    throw new AnalysisError(
      'Keine Verbindung zum Server.',
      'network_error'
    );
  }

  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    throw new AnalysisError(
      json.message || 'Antwort konnte nicht generiert werden.',
      'server_error'
    );
  }

  const json = await response.json();
  return json.replyText || '';
}
