import { Shield, Trash2, Mail, AlertTriangle, CheckCircle, Store } from 'lucide-react';

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">AH</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">AmtsHelfer AI</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
            <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Konto löschen
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
            Auf dieser Seite erfahren Sie, wie Sie Ihr AmtsHelfer-AI-Konto und alle
            zugehörigen Daten dauerhaft löschen können.
          </p>
        </div>

        {/* How to delete */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              So löschen Sie Ihr Konto in der App
            </h2>
          </div>
          <div className="p-5">
            <ol className="space-y-3">
              {[
                'Öffnen Sie AmtsHelfer AI und melden Sie sich an.',
                'Scrollen Sie auf der Startseite nach unten zu den Quick-Links.',
                'Tippen Sie auf „Konto löschen".',
                'Lesen Sie den Bestätigungsdialog sorgfältig durch.',
                'Setzen Sie das Häkchen und bestätigen Sie mit „Konto löschen".',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* What gets deleted */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Welche Daten werden gelöscht?
            </h2>
          </div>
          <div className="p-5 space-y-2">
            {[
              'E-Mail-Adresse und alle Login-Daten',
              'Alle hochgeladenen Dokumente und KI-Analysen',
              'Alle Erinnerungen und Fristen',
              'Alle gespeicherten Antwortentwürfe',
              'Profil- und Premium-Statusinformationen',
              'Nutzungsstatistiken (Analysen pro Monat)',
            ].map(item => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {item}
              </div>
            ))}
            <p className="text-xs text-gray-400 dark:text-gray-500 pt-2">
              Die Löschung erfolgt unmittelbar nach Bestätigung und kann nicht rückgängig gemacht werden.
            </p>
          </div>
        </section>

        {/* Data retention */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Welche Daten werden aufbewahrt?
            </h2>
          </div>
          <div className="p-5 space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Wir bewahren ausschließlich Daten auf, zu deren Speicherung wir gesetzlich
              verpflichtet sind:
            </p>
            <div className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
              <span>
                <strong>Abrechnungs- und Transaktionsdaten</strong> (z. B. Kaufbelege)
                werden gemäß § 147 AO und § 257 HGB für bis zu 10 Jahre aufbewahrt.
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
              <span>
                Anonymisierte, nicht personenbezogene Nutzungsstatistiken zur
                Produktverbesserung.
              </span>
            </div>
          </div>
        </section>

        {/* Google Play */}
        <section className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-700 p-5">
          <div className="flex gap-3">
            <Store className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h2 className="font-semibold text-amber-800 dark:text-amber-300">
                Google-Play-Abonnement
              </h2>
              <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                Falls Sie ein aktives Abonnement über Google Play haben, müssen Sie dieses{' '}
                <strong>zusätzlich im Google Play Store kündigen</strong>. Die Kontolöschung
                in der App beendet nicht automatisch Ihr Google-Play-Abonnement. Weitere
                Informationen finden Sie in der{' '}
                <a
                  href="https://support.google.com/googleplay/answer/7018481"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  Google-Play-Hilfe
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-500" />
              Löschanfrage per E-Mail
            </h2>
          </div>
          <div className="p-5 space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Falls Sie keinen Zugang zu Ihrem Konto mehr haben oder Fragen zur
              Datenlöschung haben, wenden Sie sich direkt an uns:
            </p>
            <a
              href="mailto:info@dlekem.com"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Mail className="w-4 h-4" />
              info@dlekem.com
            </a>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Bitte nennen Sie im Betreff: „Kontolöschung" und geben Sie die bei der
              Registrierung verwendete E-Mail-Adresse an. Wir bearbeiten Ihre Anfrage
              innerhalb von 30 Tagen.
            </p>
          </div>
        </section>

        {/* Warning note */}
        <div className="flex gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Hinweis: Das Löschen Ihres Kontos ist endgültig. Wir empfehlen, wichtige
            Dokumente oder Analysen vorher herunterzuladen oder anderweitig zu sichern.
          </p>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 mt-10">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center text-xs text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} AmtsHelfer AI &mdash; Alle Rechte vorbehalten
        </div>
      </footer>
    </div>
  );
}
