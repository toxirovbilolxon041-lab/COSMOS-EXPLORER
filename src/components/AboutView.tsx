import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { Compass, BookOpen, Layers, ShieldCheck, Sparkles, Orbit, Cpu, Globe } from 'lucide-react';

interface AboutViewProps {
  language: Language;
}

export const AboutView: React.FC<AboutViewProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-xs font-mono font-semibold">
          <Orbit className="w-3.5 h-3.5" />
          <span>COSMOS EXPLORER PORTAL</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.about.title}
        </h2>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t.about.subtitle}
        </p>
      </div>

      {/* Mission Section */}
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-lg">
          <Compass className="w-5 h-5 text-cyan-500" />
          <span>{t.about.missionTitle}</span>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {t.about.missionDesc}
        </p>
      </div>

      {/* Feature Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <Globe className="w-6 h-6 text-cyan-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {language === 'uz' ? 'Haqiqiy 3D grafikalar' : 'Photorealistic 3D Engines'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {language === 'uz'
              ? 'Three.js va WebGL texnologiyalari orqali Quyosh tizimi, Yer shari, Oy va Qora tuynuklarning fizik simulyatsiyalari.'
              : 'Interactive WebGL simulations powered by Three.js rendering real orbital scales and spacetime geometries.'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <BookOpen className="w-6 h-6 text-emerald-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {language === 'uz' ? '10 ta strukturaviy dars' : 'Interactive Curriculum'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {language === 'uz'
              ? 'Katta Portlashdan tortib ekzosayyoralar va koinot taqdirigacha bo‘lgan darsliklar, mini-testlar va progress kuzatish.'
              : '10 structured astrophysics chapters with checkpoint mini-quizzes and persistent progress tracking.'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <ShieldCheck className="w-6 h-6 text-amber-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {language === 'uz' ? 'Ilmiy aniqlik va xolislik' : 'Empirical Scientific Rigor'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {language === 'uz'
              ? 'Barcha parametrik raqamlar, massalar va masofalar NASA, ESA va xalqaro astrofizika ma’lumotlar bazalariga asoslangan.'
              : 'All orbital periods, diameters, and astrophysical parameters are cross-checked against NASA & ESA ephemerides.'}
          </p>
        </div>
      </div>

      {/* Tech Stack & Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Cpu className="w-4 h-4 text-cyan-500" />
            <span>{t.about.techTitle}</span>
          </div>
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div>• React 19 + TypeScript (komponentlar arxitekturasi)</div>
            <div>• Three.js (WebGL 3D interaktiv fazoviy sahnasi)</div>
            <div>• Tailwind CSS (zamonaviy adaptiv dizayn)</div>
            <div>• HTML5 Canvas (yulduzlar maydoni va zarralar oqimi)</div>
            <div>• LocalStorage API (til, mavzu, testlar va progressni saqlash)</div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t.about.sourcesTitle}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.about.sourcesDesc}
          </p>
          <div className="text-[11px] font-mono text-cyan-500 pt-1">
            NASA PDS · ESA Science · Event Horizon Telescope Collaboration
          </div>
        </div>
      </div>
    </div>
  );
};
