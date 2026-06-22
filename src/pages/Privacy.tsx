import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import BottomNav from '../components/BottomNav';
import { Shield, Mail, ChevronRight } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>;
}

function SubHead({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-3 mb-1">{children}</p>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
      {children}
    </li>
  );
}

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <>
      <Layout title="Datenschutzerklärung" showBack>
        <div className="space-y-4 pb-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <Shield className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-center">
              <h1 className="text-base font-bold text-gray-900 dark:text-white">Datenschutzerklärung</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">AmtsHelfer AI — Stand: Juni 2026</p>
            </div>
          </div>

          {/* 1. Verantwortlicher */}
          <Section title="1. Verantwortlicher (Art. 4 Nr. 7 DSGVO)">
            <P>
              Verantwortlich für die Datenverarbeitung im Rahmen dieser App ist:
            </P>
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Matthias Zollbrecht</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Gartenstraße 36</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">84577 Tüßling, Deutschland</p>
              <a
                href="mailto:info@dlekem.com"
                className="flex items-center gap-1.5 mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Mail className="w-3 h-3" />
                info@dlekem.com
              </a>
            </div>
          </Section>

          {/* 2. Überblick */}
          <Section title="2. Datenverarbeitung im Überblick">
            <P>
              AmtsHelfer AI ist eine KI-gestützte App zur Analyse offizieller Schreiben und Behördenbriefe.
              Bei der Nutzung der App werden folgende personenbezogene Daten verarbeitet:
            </P>
            <SubHead>Beim Erstellen eines Kontos</SubHead>
            <ul className="space-y-1">
              <Li>E-Mail-Adresse und Passwort (verschlüsselt)</Li>
              <Li>Zeitpunkt der Registrierung</Li>
              <Li>Spracheinstellung</Li>
              <Li>Anzahl genutzter Analysen (Nutzungszähler)</Li>
            </ul>
            <SubHead>Bei der Dokumentenanalyse</SubHead>
            <ul className="space-y-1">
              <Li>Hochgeladene Dokumente (Foto oder PDF), die zur Analyse an die OpenAI API übertragen werden</Li>
              <Li>Vom KI-System extrahierter Text (OCR) und Analyse-Ergebnis (Zusammenfassung, Fristen, Zahlungsangaben)</Li>
              <Li>Bei Speicherung im Archiv: Original-Datei und Analyse-Daten in der Datenbank</Li>
            </ul>
            <SubHead>Bei der Antwortgenerierung</SubHead>
            <ul className="space-y-1">
              <Li>Analyse-Kontext (Absender, Dokumenttyp, Fristen) wird an die OpenAI API übertragen</Li>
              <Li>Generierter Antwortbrief-Entwurf — optional in der App gespeichert</Li>
            </ul>
            <SubHead>Gastnutzung</SubHead>
            <P>
              Bei der Nutzung ohne Konto werden keine Daten dauerhaft gespeichert. Analyse-Ergebnisse verbleiben nur im Arbeitsspeicher des Browsers und werden beim Schließen der App gelöscht. Dokumente werden dennoch zur Verarbeitung temporär an OpenAI übertragen.
            </P>
          </Section>

          {/* 3. Rechtsgrundlagen */}
          <Section title="3. Rechtsgrundlagen (Art. 6 DSGVO)">
            <P>Wir verarbeiten Ihre Daten auf folgenden Rechtsgrundlagen:</P>
            <SubHead>Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)</SubHead>
            <P>
              Verarbeitung von E-Mail-Adresse, Nutzungsdaten und Archivdaten, um die Kernfunktionen der App bereitzustellen — Dokumentenanalyse, Archivierung, Fristenverwaltung.
            </P>
            <SubHead>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</SubHead>
            <P>
              Die Übertragung von Dokumenteninhalten an die OpenAI API zur KI-Analyse erfolgt nur nach Ihrer ausdrücklichen Bestätigung des Hinweisdialoges vor jeder Analyse. Diese Einwilligung kann jederzeit widerrufen werden, indem Sie keine weiteren Dokumente hochladen.
            </P>
            <SubHead>Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO)</SubHead>
            <P>
              Speicherung von Nutzungszählern zur Verwaltung des Gratis-Kontingents (3 Analysen/Monat) sowie Missbrauchsprävention.
            </P>
          </Section>

          {/* 4. Drittanbieter */}
          <Section title="4. Drittanbieter und Auftragsverarbeitung">
            <SubHead>OpenAI (Dokumentenanalyse und Antwortgenerierung)</SubHead>
            <P>
              Zur KI-gestützten Analyse von Dokumenten wird die OpenAI API (OpenAI OpCo, LLC, San Francisco, USA) als Auftragsverarbeiter gemäß Art. 28 DSGVO eingesetzt. Hochgeladene Dokumente und Analyse-Kontext werden dabei per HTTPS an OpenAI übertragen.
            </P>
            <ul className="space-y-1 mt-1">
              <Li>OpenAI verwendet API-Eingaben nicht zum Training seiner Modelle</Li>
              <Li>Daten werden bei OpenAI für maximal 30 Tage zur Missbrauchsprüfung gespeichert und anschließend gelöscht</Li>
              <Li>Die Übertragung in die USA erfolgt auf Basis der EU-Standardvertragsklauseln (SCC)</Li>
            </ul>
            <SubHead>Supabase (Datenbank, Storage und Authentifizierung)</SubHead>
            <P>
              Nutzerdaten, Analyseergebnisse, Archivdokumente und Fristendaten werden bei Supabase Inc. (San Francisco, USA) als Auftragsverarbeiter gespeichert. Supabase ist gemäß Art. 28 DSGVO vertraglich gebunden.
            </P>
            <ul className="space-y-1 mt-1">
              <Li>Daten sind mit TLS in der Übertragung und AES-256 im Ruhezustand verschlüsselt</Li>
              <Li>Zugriff auf Ihre Daten ist technisch auf Ihr eigenes Konto beschränkt (Row Level Security)</Li>
              <Li>Passwörter werden niemals im Klartext gespeichert (bcrypt-Hashing durch Supabase Auth)</Li>
              <Li>Datenübertragung in die USA auf Basis der EU-Standardvertragsklauseln (SCC)</Li>
            </ul>
          </Section>

          {/* 5. Datenspeicherung und -löschung */}
          <Section title="5. Datenspeicherung und -löschung">
            <SubHead>Archivierte Dokumente</SubHead>
            <P>
              Im Archiv gespeicherte Dokumente (Original-Datei, Analyse, Antwortbriefe, Fristen) werden so lange gespeichert, bis Sie sie aktiv löschen. Eine Löschung in der App entfernt sämtliche Daten dauerhaft — aus der Datenbank und aus dem Speicher.
            </P>
            <SubHead>Kontoschließung</SubHead>
            <P>
              Bei Wunsch zur Löschung Ihres Kontos und aller damit verbundenen Daten wenden Sie sich bitte an: info@dlekem.com. Alle Ihre Daten werden innerhalb von 30 Tagen vollständig gelöscht.
            </P>
            <SubHead>Gastnutzung</SubHead>
            <P>
              Analyse-Ergebnisse ohne Konto-Speicherung sind nur im Browserspeicher (RAM) vorhanden und werden beim Schließen der App oder des Browsers automatisch gelöscht.
            </P>
            <SubHead>Gerätespeicher (localStorage)</SubHead>
            <P>
              Auf Ihrem Gerät werden ausschließlich gespeichert: Spracheinstellung, Onboarding-Status, Session-Token (zum automatischen Einloggen). Kein Tracking, keine Analyse-Cookies.
            </P>
          </Section>

          {/* 6. KI und automatisierte Entscheidungen */}
          <Section title="6. KI-gestützte Verarbeitung">
            <P>
              AmtsHelfer AI nutzt das KI-Modell GPT-4o von OpenAI zur Analyse von Dokumenten. Die Ergebnisse — Zusammenfassung, Risikoeinstufung, Empfehlungen — sind KI-generierte Einschätzungen und stellen keine Rechts-, Steuer- oder Behördenberatung dar.
            </P>
            <P>
              Es findet keine vollständig automatisierte Entscheidungsfindung im Sinne von Art. 22 DSGVO statt. Die Analyse dient ausschließlich als informative Unterstützung. Alle Ergebnisse müssen vom Nutzer selbst bewertet werden.
            </P>
          </Section>

          {/* 7. Ihre Rechte */}
          <Section title="7. Ihre Rechte als betroffene Person">
            <P>
              Sie haben gegenüber dem Verantwortlichen folgende Rechte nach der DSGVO:
            </P>
            <ul className="space-y-1 mt-1">
              <Li><strong>Auskunft (Art. 15 DSGVO):</strong> Sie können Auskunft über Ihre gespeicherten Daten verlangen.</Li>
              <Li><strong>Berichtigung (Art. 16 DSGVO):</strong> Unrichtige Daten können Sie berichtigen lassen.</Li>
              <Li><strong>Löschung (Art. 17 DSGVO):</strong> Sie können die Löschung Ihrer Daten verlangen ("Recht auf Vergessenwerden").</Li>
              <Li><strong>Einschränkung (Art. 18 DSGVO):</strong> Sie können die Verarbeitung einschränken lassen.</Li>
              <Li><strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie können Ihre Daten in maschinenlesbarem Format anfordern.</Li>
              <Li><strong>Widerspruch (Art. 21 DSGVO):</strong> Sie können der Verarbeitung auf Basis berechtigter Interessen widersprechen.</Li>
              <Li><strong>Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO):</strong> Erteilte Einwilligungen können Sie jederzeit mit Wirkung für die Zukunft widerrufen.</Li>
            </ul>
            <P>
              Zur Ausübung Ihrer Rechte wenden Sie sich per E-Mail an: info@dlekem.com
            </P>
          </Section>

          {/* 8. Beschwerderecht */}
          <Section title="8. Beschwerderecht bei der Aufsichtsbehörde">
            <P>
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren. Die zuständige Behörde für Bayern ist:
            </P>
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Promenade 27 (Schloss), 91522 Ansbach</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Tel.: +49 (0) 981 53 1300</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">www.lda.bayern.de</p>
            </div>
          </Section>

          {/* 9. Datensicherheit */}
          <Section title="9. Datensicherheit">
            <P>
              Alle Datenübertragungen erfolgen verschlüsselt per HTTPS/TLS. Gespeicherte Daten sind mit AES-256 verschlüsselt. Zugriff auf Ihre Daten ist technisch auf Ihr eigenes Konto beschränkt (Row Level Security in der Datenbank). Passwörter werden ausschließlich als gehashter Wert (bcrypt) gespeichert — ein Zugriff auf Ihr Passwort im Klartext ist nicht möglich.
            </P>
          </Section>

          {/* 10. Impressum */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => navigate('/impressum')}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span>Zum Impressum</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 pb-2">
            Stand: Juni 2026 · Letzte Aktualisierung: 17.06.2026
          </p>
        </div>
      </Layout>
      <BottomNav />
    </>
  );
}
