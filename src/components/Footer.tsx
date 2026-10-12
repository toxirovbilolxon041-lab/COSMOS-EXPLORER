import React from 'react';
import { Language, Theme } from '../types';
import { translations } from '../i18n/translations';
import { Orbit, Globe2, Sun, Moon } from 'lucide-react';

interface FooterProps {
  language: Language;
  onToggleLanguage: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onNavigate: (section: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  onNavigate,
}) => {
  const t = translations[language];

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand & Purpose */}
          <div className="space-y-1.5 max-w-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50" />
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                COSMOS EXPLORER
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.footer.tagline}
            </p>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-cyan-500 transition-colors cursor-pointer"
            >
              {t.nav.home}
            </button>
            <button
              onClick={() => onNavigate('solar-system')}
              className="hover:text-cyan-500 transition-colors cursor-pointer"
            >
              {t.nav.solarSystem}
            </button>
            <button
              onClick={() => onNavigate('learn')}
              className="hover:text-cyan-500 transition-colors cursor-pointer"
            >
              {t.nav.learn}
            </button>
            <button
              onClick={() => onNavigate('quiz')}
              className="hover:text-cyan-500 transition-colors cursor-pointer"
            >
              {t.nav.quiz}
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-cyan-500 transition-colors cursor-pointer"
            >
              {t.nav.about}
            </button>
          </div>

          {/* Foot Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 hover:border-cyan-500 transition-colors cursor-pointer"
            >
              <Globe2 className="w-3.5 h-3.5 text-cyan-500" />
              <span>{language === 'uz' ? 'O‘zbekcha' : 'English'}</span>
            </button>

            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-cyan-500 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.footer.lightMode}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span>{t.footer.darkMode}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quiet Copyright Footnote */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-500 font-mono">
          <span>© {new Date().getFullYear()} COSMOS EXPLORER. {t.footer.rights}</span>
          <span>NASA, ESA & Astrophysics Open Data Grounded</span>
        </div>
      </div>
    </footer>
  );
};
