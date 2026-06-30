import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import BottomNav from '../components/BottomNav';
import { ScrollText, Mail, AlertCircle, ChevronRight, Shield } from 'lucide-react';

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
          {num}
        </span>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
      {children}
    </li>
  );
}

export default function Terms() {
  const navigate = useNavigate();

  return (
    <>
      <Layout title="Nutzungsbedingungen" showBack>
        <div className="space-y-4 pb-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <ScrollText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-center">
              <h1 className="text-base font-bold text-gray-900 dark:text-white">Nutzungsbedingungen</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">AmtsHelfer AI — Stand: Juni 2026</p>
            </div>
          </div>

          {/* Intro */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700">
            <P>
              Diese Nutzungsbedingungen regeln die Nutzung der App <strong>AmtsHelfer AI</strong>. Mit der Nutzung der App erklären Sie sich mit diesen Bedingungen einverstanden.
            </P>
          </div>

          {/* 1. Anbieter */}
          <Section num="1" title="Anbieter">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Matthias Zollbrecht</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Gartenstraße 36</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">84577 Tüßling, Deutschland</p>
            </div>
            <a
              href="mailto:info@dlekem.com"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
            >
              <Mail className="w-3 h-3" />
              info@dlekem.com
            </a>
          </Section>

          {/* 2. Leistungsbeschreibung */}
          <Section num="2" title="Leistungsbeschreibung">
            <P>
              AmtsHelfer AI analysiert behördliche Schreiben, Bescheide und offizielle Dokumente mithilfe künstlicher Intelligenz (OpenAI GPT-4o). Die App bietet folgende Leistungen:
            </P>
            <ul className="space-y-1 mt-1">
              <Li>Automatische Erkennung und Zusammenfassung von Dokumenteninhalten</Li>
              <Li>Identifikation von Fristen, Zahlungsaufforderungen und erforderlichen Unterlagen</Li>
              <Li>Risikoeinstufung (gering / mittel / hoch) des jeweiligen Dokuments</Li>
              <Li>Erstellung von Antwortbrief-Entwürfen auf Basis des analysierten Dokuments</Li>
              <Li>Archivierung analysierter Dokumente und Fristenverwaltung (für eingeloggte Nutzer)</Li>
            </ul>
            <P>
              Die Verfügbarkeit der Dienste ist abhängig von der Erreichbarkeit der eingesetzten Drittanbieter (OpenAI, Supabase). Ein Anspruch auf ununterbrochene Verfügbarkeit besteht nicht.
            </P>
          </Section>

          {/* 3. Kein Rechtsrat */}
          <Section num="3" title="Kein Ersatz für Rechtsberatung">
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <P>
                <strong>AmtsHelfer AI ersetzt keine rechtliche, steuerliche oder behördliche Beratung.</strong>
              </P>
            </div>
            <P>
              Alle durch die App generierten Analyse-Ergebnisse, Zusammenfassungen, Risikoeinschätzungen und Antwortvorschläge sind automatisch erstellte Einschätzungen und dienen ausschließlich der ersten Orientierung. Sie stellen keine verbindlichen Aussagen dar und ersetzen nicht die Beratung durch:
            </P>
            <ul className="space-y-1">
              <Li>einen zugelassenen Rechtsanwalt oder Notar</Li>
              <Li>einen Steuerberater oder Wirtschaftsprüfer</Li>
              <Li>eine offizielle Behörde oder anerkannte Beratungsstelle</Li>
            </ul>
            <P>
              Bei rechtlich bedeutsamen Schreiben — insbesondere bei Mahnungen, Klagen, Steuerbescheiden oder Kündigungen — empfehlen wir ausdrücklich die Hinzuziehung eines Fachberaters.
            </P>
          </Section>

          {/* 4. Eigenverantwortung */}
          <Section num="4" title="Eigenverantwortung der Nutzer">
            <P>
              Nutzer der App tragen die volle Eigenverantwortung für:
            </P>
            <ul className="space-y-1">
              <Li>Die Einhaltung aller in Dokumenten genannten Fristen und Handlungsaufforderungen</Li>
              <Li>Den Inhalt, die Richtigkeit und die rechtzeitige Einreichung von Behördenkommunikation</Li>
              <Li>Die sorgfältige Prüfung aller hochgeladenen und gespeicherten Dokumente</Li>
              <Li>Entscheidungen, die auf Basis der KI-generierten Analysen getroffen werden</Li>
              <Li>Die Überprüfung von Antwortbrief-Entwürfen vor dem Versand</Li>
            </ul>
            <P>
              Die App ist ein Hilfsmittel zur Unterstützung — nicht zur Übernahme der Verantwortung für behördliche Angelegenheiten.
            </P>
          </Section>

          {/* 5. Haftungsbeschränkung */}
          <Section num="5" title="Haftungsbeschränkung">
            <P>
              Der Anbieter haftet nicht für Schäden, die aus der Nutzung der App entstehen. Dies gilt insbesondere für:
            </P>
            <ul className="space-y-1">
              <Li>Versäumte Fristen infolge fehlerhafter oder unvollständiger KI-Erkennung</Li>
              <Li>Fehlerhafte oder missverständliche KI-Analysen</Li>
              <Li>Unvollständige Texterkennung (OCR) bei schlecht lesbaren Dokumenten</Li>
              <Li>Schäden durch Versand von auf KI-Entwürfen basierenden Antwortbriefen ohne vorherige Überprüfung</Li>
              <Li>Datenverlust durch technische Störungen oder den Ausfall von Drittanbietern</Li>
              <Li>Schäden durch vorübergehende Nichtverfügbarkeit der App</Li>
            </ul>
            <P>
              Die Haftungsbeschränkung gilt nicht bei Vorsatz oder grober Fahrlässigkeit des Anbieters sowie bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten). In letzterem Fall ist die Haftung auf den vorhersehbaren, vertragstypischen Schaden begrenzt.
            </P>
          </Section>

          {/* 6. Premium */}
          <Section num="6" title="Premium-Abonnement">
            <P>
              AmtsHelfer AI bietet ein kostenloses Kontingent sowie ein kostenpflichtiges Premium-Abonnement:
            </P>
            <ul className="space-y-1">
              <Li><strong>Kostenloses Kontingent:</strong> 3 Dokumentenanalysen pro Monat</Li>
              <Li><strong>Premium:</strong> Unbegrenzte Analysen, Archivfunktion, Fristenverwaltung und Antwortgenerierung</Li>
              <Li><strong>Abrechnung:</strong> Das Premium-Abonnement wird über den Google Play Store abgewickelt. Es gelten die Zahlungs- und Abrechnungsbedingungen von Google Play</Li>
              <Li><strong>Kündigung:</strong> Das Abonnement kann jederzeit über die Einstellungen im Google Play Store gekündigt werden. Die Kündigung wird zum Ende des laufenden Abrechnungszeitraums wirksam</Li>
              <Li><strong>Preisänderungen:</strong> Der Anbieter behält sich vor, Preise mit angemessener Vorankündigung anzupassen</Li>
            </ul>
            <P>
              Bei Fragen zur Abrechnung wenden Sie sich an: info@dlekem.com
            </P>
          </Section>

          {/* 7. Datenschutz */}
          <Section num="7" title="Datenschutz">
            <P>
              Die Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutz-Grundverordnung (DSGVO). Ausführliche Informationen zur Datenverarbeitung, zu eingesetzten Drittanbietern (OpenAI, Supabase) und zu Ihren Rechten als betroffene Person finden Sie in der Datenschutzerklärung.
            </P>
            <button
              onClick={() => navigate('/privacy')}
              className="w-full flex items-center justify-between px-3 py-2.5 mt-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Zur Datenschutzerklärung</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </Section>

          {/* 8. Kontolöschung */}
          <Section num="8" title="Kontolöschung und Datenlöschung">
            <P>
              Nutzer haben das Recht, ihr Konto und alle damit verbundenen Daten jederzeit selbst zu löschen:
            </P>
            <ul className="space-y-1">
              <Li>Einzelne gespeicherte Dokumente können direkt in der App gelöscht werden</Li>
              <Li><strong>Vollständige Kontolöschung direkt in der App:</strong> Startseite → „Konto löschen" → Bestätigung. Alle Daten (Profil, Dokumente, Analysen, Antwortbriefe, Fristen) werden sofort und dauerhaft gelöscht.</Li>
              <Li>Alternativ per E-Mail an info@dlekem.com — Bearbeitung innerhalb von 30 Tagen</Li>
              <Li>Bei aktivem Google-Play-Abonnement muss dieses zusätzlich im Google Play Store gekündigt werden</Li>
              <Li>Eine Wiederherstellung nach der Löschung ist nicht möglich</Li>
            </ul>
          </Section>

          {/* 9. Änderungen */}
          <Section num="9" title="Änderungen der Nutzungsbedingungen">
            <P>
              Der Anbieter behält sich vor, diese Nutzungsbedingungen bei Bedarf anzupassen — etwa bei Erweiterungen des Funktionsumfangs, geänderten gesetzlichen Anforderungen oder Anpassungen der eingesetzten Dienste.
            </P>
            <P>
              Wesentliche Änderungen werden Nutzern mit eingerichtetem Konto per E-Mail oder durch einen Hinweis in der App mitgeteilt. Die weitere Nutzung der App nach dem Inkrafttreten der geänderten Bedingungen gilt als Zustimmung.
            </P>
          </Section>

          {/* 10. Anwendbares Recht */}
          <Section num="10" title="Anwendbares Recht und Gerichtsstand">
            <P>
              Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG). Für Verbraucher innerhalb der Europäischen Union gelten ergänzend die zwingenden Verbraucherschutzvorschriften des jeweiligen EU-Mitgliedstaats.
            </P>
            <P>
              Gerichtsstand für Streitigkeiten mit Unternehmern ist, soweit gesetzlich zulässig, der Sitz des Anbieters.
            </P>
          </Section>

          {/* Footer note */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Bei Fragen zu diesen Nutzungsbedingungen wenden Sie sich an:{' '}
              <a href="mailto:info@dlekem.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                info@dlekem.com
              </a>
            </p>
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
