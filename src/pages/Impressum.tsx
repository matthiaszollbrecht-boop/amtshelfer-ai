import Layout from '../components/Layout';
import BottomNav from '../components/BottomNav';
import { Building2, Mail, AlertCircle } from 'lucide-react';

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

export default function Impressum() {
  return (
    <>
      <Layout title="Impressum" showBack>
        <div className="space-y-4 pb-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-center">
              <h1 className="text-base font-bold text-gray-900 dark:text-white">Impressum</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Angaben gemäß § 5 TMG</p>
            </div>
          </div>

          {/* Anbieter */}
          <Section title="Anbieter">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Matthias Zollbrecht</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Gartenstraße 36</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">84577 Tüßling</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Deutschland</p>
            </div>
          </Section>

          {/* Kontakt */}
          <Section title="Kontakt">
            <a
              href="mailto:info@dlekem.com"
              className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              info@dlekem.com
            </a>
          </Section>

          {/* Verantwortlich für den Inhalt */}
          <Section title="Verantwortlich für den Inhalt (§ 55 Abs. 2 RStV)">
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Matthias Zollbrecht</p>
            <P>Gartenstraße 36, 84577 Tüßling</P>
          </Section>

          {/* Haftungsausschluss */}
          <Section title="Haftungsausschluss">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Haftung für Inhalte</p>
            <P>
              Die durch AmtsHelfer AI bereitgestellten KI-generierten Analysen und Antwortvorlagen stellen ausdrücklich keine Rechts-, Steuer- oder Behördenberatung dar. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte nach den allgemeinen Gesetzen verantwortlich. Wir übernehmen keinerlei Haftung für die Vollständigkeit, Richtigkeit oder Aktualität der KI-generierten Inhalte.
            </P>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-2">Keine Rechtsberatung</p>
            <P>
              Alle durch die App generierten Texte — Zusammenfassungen, Risikoeinschätzungen, Handlungsempfehlungen und Antwortbriefe — sind automatisch erstellte Entwürfe und ersetzen nicht die Beratung durch einen Rechtsanwalt, Steuerberater oder eine amtliche Beratungsstelle.
            </P>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-2">Haftung für Links</p>
            <P>
              Unser Angebot enthält keine externen Links. Sollten solche in Zukunft aufgenommen werden, haben wir zum Zeitpunkt der Verlinkung keine illegalen Inhalte festgestellt. Auf die aktuelle und zukünftige Gestaltung verlinkter Seiten haben wir keinen Einfluss.
            </P>
          </Section>

          {/* Urheberrecht */}
          <Section title="Urheberrecht">
            <P>
              Die durch den Betreiber erstellten Inhalte und Werke in dieser App unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </P>
          </Section>

          {/* Streitschlichtung */}
          <Section title="Streitschlichtung (EU)">
            <P>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit. Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </P>
          </Section>

          {/* Hinweis KI */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              <strong>Hinweis:</strong> AmtsHelfer AI ist ein KI-gestütztes Hilfsmittel. Alle Analyseergebnisse und Antwortvorlagen sind maschinell erstellt und müssen vor Verwendung durch den Nutzer sorgfältig geprüft werden. Bei rechtlich bedeutsamen Schreiben empfehlen wir stets die Konsultation eines Fachberaters.
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 pb-2">
            Stand: Juni 2026
          </p>
        </div>
      </Layout>
      <BottomNav />
    </>
  );
}
