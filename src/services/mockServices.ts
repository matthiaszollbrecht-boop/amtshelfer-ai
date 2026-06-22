import { AnalysisResult, MOCK_ANALYSIS, MOCK_ANALYSIS_URGENT } from '../lib/store';

export async function mockOCR(file: File | null): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (!file) {
    return 'Beispieltext eines amtlichen Schreibens. Dieses Dokument enthält Informationen über eine Anmeldebescheinigung.';
  }

  const name = file.name.toLowerCase();
  if (name.includes('krank') || name.includes('health') || name.includes('aok')) {
    return `AOK Krankenkasse — Beitragsabteilung

Sehr geehrte/r Versicherte/r,

wir möchten Sie darüber informieren, dass für den Zeitraum Januar bis März 2026 ein Beitragsrückstand in Höhe von 245,80 EUR besteht.

Bitte überweisen Sie den Betrag bis zum 15.07.2026 auf das unten angegebene Konto.

Sollten Sie Fragen haben, wenden Sie sich bitte an unsere Service-Hotline.

Mit freundlichen Grüßen
AOK Beitragsabteilung`;
  }

  return `Stadtverwaltung München — Bürgeramt

Anmeldebescheinigung

Sehr geehrte/r Frau/Herr [Name],

hiermit bestätigen wir, dass Sie sich unter der folgenden Adresse angemeldet haben:

[Anschrift]

Die Anmeldung wurde am [Datum] im Melderegister eingetragen.

Personalausweisnummer: [Nummer]

Dies ist eine automatisiert erstellte Bescheinigung.

Mit freundlichen Grüßen
Bürgeramt München`;
}

const ANALYSIS_PROMPT = `Du bist ein Assistent, der Bürgern hilft, Schreiben in einfacher Sprache zu verstehen. Du gibst keine Rechtsberatung, Steuerberatung oder verbindliche behördliche Auskunft. Analysiere den folgenden Dokumenttext vorsichtig und strukturiert. Erkläre den Inhalt einfach, nenne mögliche Fristen, mögliche nächste Schritte und weise darauf hin, dass der Nutzer bei Unsicherheit eine offizielle Beratungsstelle, Behörde, Anwalt oder Steuerberater kontaktieren sollte.`;

export function getAnalysisPrompt(): string {
  return ANALYSIS_PROMPT;
}

export async function mockAnalyze(text: string): Promise<AnalysisResult> {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const isUrgent = text.toLowerCase().includes('rückstand') ||
    text.toLowerCase().includes('frist') ||
    text.toLowerCase().includes('bis zum') ||
    text.toLowerCase().includes('nachzahlung');

  if (isUrgent) {
    return MOCK_ANALYSIS_URGENT;
  }
  return MOCK_ANALYSIS;
}
