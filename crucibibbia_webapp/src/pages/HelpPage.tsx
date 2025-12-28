import React from 'react';
import { Link } from 'react-router-dom';

interface HelpSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const HelpSection: React.FC<HelpSectionProps> = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <span className="text-primary-600">{icon}</span>
      {title}
    </h2>
    {children}
  </div>
);

interface HelpItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const HelpItem: React.FC<HelpItemProps> = ({ icon, title, description }) => (
  <div className="flex gap-4 py-3 border-b dark:border-gray-700 last:border-0">
    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

export const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-primary-600 text-white py-4 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-primary-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <h1 className="text-xl font-bold">Come giocare</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl shadow-lg p-6 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-16 h-16 mx-auto mb-4 opacity-90"
          >
            <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Benvenuto in CruciBibbia!</h2>
          <p className="text-primary-100">
            Risolvi cruciverba biblici tratti dalla rivista Svegliatevi!
          </p>
        </div>

        {/* Navigation */}
        <HelpSection
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.438zM9 6a.75.75 0 01.75.75V15a.75.75 0 01-1.5 0V6.75A.75.75 0 019 6zm6.75 3a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V9z" clipRule="evenodd" />
            </svg>
          }
          title="Navigazione"
        >
          <HelpItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                <path d="M12 12.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
              </svg>
            }
            title="Home"
            description="Dalla schermata principale puoi accedere ai puzzle divisi per anno, vedere le statistiche e le impostazioni."
          />
          <HelpItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
              </svg>
            }
            title="Lista anni"
            description="Seleziona un anno per vedere tutti i cruciverba disponibili di quel periodo."
          />
          <HelpItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            }
            title="Riprendi"
            description="I tuoi progressi vengono salvati automaticamente. Puoi riprendere un puzzle in qualsiasi momento."
          />
        </HelpSection>

        {/* Gameplay */}
        <HelpSection
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
            </svg>
          }
          title="Come giocare"
        >
          <HelpItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
              </svg>
            }
            title="Seleziona una cella"
            description="Tocca una cella per selezionarla. Toccala di nuovo per cambiare direzione (orizzontale/verticale)."
          />
          <HelpItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 016.775-5.025.75.75 0 01.313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 011.248.313 5.25 5.25 0 01-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 112.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0112 6.75z" clipRule="evenodd" />
              </svg>
            }
            title="Inserisci lettere"
            description="Usa la tastiera in basso per inserire le lettere. Il cursore si sposta automaticamente alla cella successiva."
          />
          <HelpItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            }
            title="Verifica"
            description="Premi 'Verifica' per controllare le risposte. Le celle corrette diventeranno verdi, quelle errate rosse."
          />
          <HelpItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 .75a8.25 8.25 0 00-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 00.577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 01-.937-.171.75.75 0 11.374-1.453 5.261 5.261 0 002.626 0 .75.75 0 11.374 1.452 6.712 6.712 0 01-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 00.577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0012 .75z" />
                <path fillRule="evenodd" d="M9.013 19.9a.75.75 0 01.877-.597 11.319 11.319 0 004.22 0 .75.75 0 11.28 1.473 12.819 12.819 0 01-4.78 0 .75.75 0 01-.597-.876zM9.754 22.344a.75.75 0 01.824-.668 13.682 13.682 0 002.844 0 .75.75 0 11.156 1.492 15.156 15.156 0 01-3.156 0 .75.75 0 01-.668-.824z" clipRule="evenodd" />
              </svg>
            }
            title="Suggerimento"
            description="Premi 'Suggerimento' per rivelare la lettera della cella selezionata. Ogni suggerimento riduce il punteggio."
          />
        </HelpSection>

        {/* Scoring */}
        <HelpSection
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743-.356l.135-.054a2.25 2.25 0 012.146 0l.135.054a6.73 6.73 0 002.743.356 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744z" clipRule="evenodd" />
              <path d="M12.75 12a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0V12z" />
            </svg>
          }
          title="Sistema di punteggio"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Punteggio base</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ogni cruciverba completato vale <span className="font-bold text-primary-600">100 punti</span> base.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Bonus</h4>
              <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                <li>+Fino a 50 punti se completi in meno di 10 minuti</li>
                <li>+100 punti bonus perfetto (no errori, no suggerimenti)</li>
                <li>+10 punti per ogni giorno di streak (max 50)</li>
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Penalità</h4>
              <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                <li>-10 punti per ogni suggerimento usato</li>
                <li>-5 punti per ogni errore trovato con 'Verifica'</li>
              </ul>
            </div>
          </div>
        </HelpSection>

        {/* Tips */}
        <HelpSection
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 .75a8.25 8.25 0 00-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 00.577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 01-.937-.171.75.75 0 11.374-1.453 5.261 5.261 0 002.626 0 .75.75 0 11.374 1.452 6.712 6.712 0 01-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 00.577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0012 .75z" />
            </svg>
          }
          title="Suggerimenti utili"
        >
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">1.</span>
              <span className="text-gray-700 dark:text-gray-300">
                Tocca l'icona della Bibbia accanto alla definizione per aprire il versetto su wol.jw.org
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">2.</span>
              <span className="text-gray-700 dark:text-gray-300">
                Inizia dalle definizioni più semplici per avere più lettere di incrocio
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">3.</span>
              <span className="text-gray-700 dark:text-gray-300">
                Se non conosci una risposta, prova a risolverla con le lettere di incrocio
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">4.</span>
              <span className="text-gray-700 dark:text-gray-300">
                Gioca ogni giorno per aumentare il tuo streak e guadagnare bonus!
              </span>
            </li>
          </ul>
        </HelpSection>
      </main>
    </div>
  );
};
