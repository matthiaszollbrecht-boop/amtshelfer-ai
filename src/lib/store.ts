export type RiskLevel = 'green' | 'yellow' | 'red';
export type Category = 'authority' | 'health' | 'insurance' | 'bank' | 'work' | 'housing' | 'other';

export interface AnalysisResult {
  summary: string;
  sender: string;
  type: string;
  deadlines: string[];
  payments: string[];
  documents: string[];
  simpleExplanation: string;
  nextSteps: string[];
  riskLevel: RiskLevel;
}

export interface ArchivedDocument {
  id: string;
  title: string;
  date: string;
  category: Category;
  sender: string;
  riskLevel: RiskLevel;
  deadlines: string[];
  analysis: AnalysisResult;
  fileUrl?: string;
}

export interface Reminder {
  id: string;
  documentId: string;
  documentTitle: string;
  deadline: string;
  daysLeft: number;
  riskLevel: RiskLevel;
}

export interface AppState {
  isOnboarded: boolean;
  isGuest: boolean;
  user: { email: string } | null;
  documents: ArchivedDocument[];
  reminders: Reminder[];
  analysesUsed: number;
  isPremium: boolean;
  currentAnalysis: AnalysisResult | null;
}

const STORAGE_KEY = 'amtsHelfer_state';

export function loadState(): Partial<AppState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
}

export const MOCK_ANALYSIS: AnalysisResult = {
  summary: 'Das Schreiben ist ein Bescheid der Stadtverwaltung über die Anmeldung Ihres Wohnsitzes. Die Anmeldung wurde ordnungsgemäß durchgeführt.',
  sender: 'Stadtverwaltung München — Bürgeramt',
  type: 'Anmeldebescheid',
  deadlines: ['Innerhalb von 14 Tagen zu prüfen'],
  payments: [],
  documents: ['Personalausweis', 'Anmeldeformular'],
  simpleExplanation: 'Die Stadt bestätigt, dass Ihre Adresse angemeldet wurde. Sie müssen nichts weiter tun, es sei denn, die Daten sind falsch.',
  nextSteps: [
    'Prüfen Sie, ob Ihre Daten im Bescheid korrekt sind',
    'Bei Fehlern: Es könnte sinnvoll sein, das Bürgeramt zu kontaktieren',
    'Heben Sie den Bescheid als Nachweis auf',
  ],
  riskLevel: 'green',
};

export const MOCK_ANALYSIS_URGENT: AnalysisResult = {
  summary: 'Dies ist eine Aufforderung der Krankenkasse zur Nachzahlung von Beiträgen. Es besteht eine Frist, innerhalb derer Sie reagieren sollten.',
  sender: 'AOK Krankenkasse — Beitragsabteilung',
  type: 'Nachzahlungsaufforderung',
  deadlines: ['Bis zum 15.07.2026'],
  payments: ['Nachzahlung: 245,80 €'],
  documents: ['Einkommensnachweis', 'Krankenversichertenkarte'],
  simpleExplanation: 'Die Krankenkasse fordert Sie auf, einen Betrag nachzuzahlen. Sie sollten prüfen, ob die Forderung berechtigt ist und gegebenenfalls reagieren.',
  nextSteps: [
    'Prüfen Sie, ob die Forderung berechtigt ist',
    'Es könnte sinnvoll sein, sich bei der Krankenkasse zu melden',
    'Bei Unklarheiten: Eine Beratungsstelle oder ein Sozialberater kann helfen',
    'Reagieren Sie vor Ablauf der Frist',
  ],
  riskLevel: 'red',
};

export const MOCK_REPLY_SUBMIT_DOCS = `Sehr geehrte Damen und Herren,

in Bezug auf Ihr Schreiben vom [Datum] reiche ich hiermit die angeforderten Unterlagen ein:

- [Dokument 1]
- [Dokument 2]

Sollten Sie weitere Unterlagen benötigen, stehe ich Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
[Ihr Name]`;

export const MOCK_REPLY_EXTEND_DEADLINE = `Sehr geehrte Damen und Herren,

ich habe Ihr Schreiben vom [Datum] erhalten. Leider benötige ich mehr Zeit, um die angeforderten Unterlagen zusammenzustellen.

Ich bitte daher um eine Fristverlängerung bis zum [gewünschtes Datum].

Für Rückfragen stehe ich Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
[Ihr Name]`;

export const MOCK_REPLY_INQUIRY = `Sehr geehrte Damen und Herren,

ich habe Ihr Schreiben vom [Datum] erhalten und habe dazu einige Rückfragen:

- [Frage 1]
- [Frage 2]

Ich wäre Ihnen dankbar, wenn Sie mir diese Punkte erläutern könnten.

Mit freundlichen Grüßen
[Ihr Name]`;

export const MOCK_REPLY_RESCHEDULE = `Sehr geehrte Damen und Herren,

ich habe Ihren Termin am [Datum] erhalten. Leider kann ich zu diesem Termin nicht erscheinen.

Ich bitte um eine Neuvereinbarung des Termins. Mir würde es passen an:
- [Alternativtermin 1]
- [Alternativtermin 2]

Mit freundlichen Grüßen
[Ihr Name]`;

export const MOCK_REPLY_GENERAL = `Sehr geehrte Damen und Herren,

ich habe Ihr Schreiben vom [Datum] erhalten und nehme hierzu wie folgt Stellung:

[Ihre Nachricht]

Für Rückfragen stehe ich Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
[Ihr Name]`;

export const MOCK_DOCUMENTS: ArchivedDocument[] = [
  {
    id: '1',
    title: 'Anmeldebescheid — Bürgeramt',
    date: '2026-06-10',
    category: 'authority',
    sender: 'Stadtverwaltung München',
    riskLevel: 'green',
    deadlines: [],
    analysis: MOCK_ANALYSIS,
  },
  {
    id: '2',
    title: 'Nachzahlung — Krankenkasse',
    date: '2026-06-08',
    category: 'health',
    sender: 'AOK Krankenkasse',
    riskLevel: 'red',
    deadlines: ['Bis zum 15.07.2026'],
    analysis: MOCK_ANALYSIS_URGENT,
  },
  {
    id: '3',
    title: 'Versicherungsbestätigung',
    date: '2026-05-28',
    category: 'insurance',
    sender: 'Allianz Versicherung',
    riskLevel: 'green',
    deadlines: [],
    analysis: {
      ...MOCK_ANALYSIS,
      summary: 'Dies ist eine Bestätigung Ihrer Versicherungspolice. Ihre Versicherung ist weiterhin aktiv.',
      sender: 'Allianz Versicherung',
      type: 'Versicherungsbestätigung',
      payments: [],
    },
  },
];

export const MOCK_REMINDERS: Reminder[] = [
  {
    id: 'r1',
    documentId: '2',
    documentTitle: 'Nachzahlung — Krankenkasse',
    deadline: '2026-07-15',
    daysLeft: 29,
    riskLevel: 'red',
  },
  {
    id: 'r2',
    documentId: '4',
    documentTitle: 'Kündigungsfrist Wohnung',
    deadline: '2026-06-23',
    daysLeft: 7,
    riskLevel: 'yellow',
  },
];
