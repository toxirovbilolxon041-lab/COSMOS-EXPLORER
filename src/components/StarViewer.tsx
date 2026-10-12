import React, { useState } from 'react';
import { Language, StarItem } from '../types';
import { STARS_DATA } from '../data/spaceData';
import { translations } from '../i18n/translations';
import { Sparkles, Sun, Thermometer, Compass, Scale, Info } from 'lucide-react';

interface StarViewerProps {
  language: Language;
}

export const StarViewer: React.FC<StarViewerProps> = ({ language }) => {
  const [selectedStar, setSelectedStar] = useState<StarItem>(STARS_DATA[0]);
  const t = translations[language];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs uppercase font-mono tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">
          {language === 'uz' ? 'Termoyadro o‘choqlari' : 'Cosmic Fusion Engines'}
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.stars.title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          {t.stars.subtitle}
        </p>
      </div>

      {/* Star Selector Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STARS_DATA.map((star) => {
          const isSelected = selectedStar.id === star.id;
          return (
            <button
              key={star.id}
              onClick={() => setSelectedStar(star)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: star.colorHex }}
              />
              <span>{star.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Focus Card: Visual Glow Representation + Deep Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Visual Stellar Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-xl relative overflow-hidden min-h-[380px]">
          {/* Animated Stellar Plasma Sphere */}
          <div className="relative flex items-center justify-center">
            {/* Corona Outer Glow */}
            <div
              className="absolute rounded-full filter blur-2xl opacity-40 animate-pulse transition-all duration-700"
              style={{
                backgroundColor: selectedStar.colorHex,
                width: `${Math.min(260, Math.max(90, Math.log10(selectedStar.solarRadius + 1) * 90 + 70))}px`,
                height: `${Math.min(260, Math.max(90, Math.log10(selectedStar.solarRadius + 1) * 90 + 70))}px`,
              }}
            />
            {/* Core Sphere */}
            <div
              className="rounded-full shadow-2xl relative z-10 transition-all duration-700 flex items-center justify-center text-center p-4"
              style={{
                backgroundColor: selectedStar.colorHex,
                boxShadow: `0 0 50px ${selectedStar.colorHex}88`,
                width: `${Math.min(180, Math.max(60, Math.log10(selectedStar.solarRadius + 1) * 60 + 50))}px`,
                height: `${Math.min(180, Math.max(60, Math.log10(selectedStar.solarRadius + 1) * 60 + 50))}px`,
              }}
            >
              <span className="text-[11px] font-mono font-bold text-slate-950 select-none">
                {selectedStar.spectralType.split(' ')[0]}
              </span>
            </div>
          </div>

          <div className="mt-8 text-center space-y-1 z-10">
            <span className="text-xs uppercase font-mono text-cyan-400 block">
              {language === 'uz' ? selectedStar.constellationUz : selectedStar.constellationEn}
            </span>
            <div className="text-xl font-bold text-white tracking-wide">
              {selectedStar.name}
            </div>
            <span className="text-xs text-slate-400 font-mono">
              T = {selectedStar.temperatureK.toLocaleString()} Kelvin
            </span>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-cyan-500 mb-1">
              {t.stars.spectralType}: {selectedStar.spectralType}
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {selectedStar.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {language === 'uz' ? selectedStar.descriptionUz : selectedStar.descriptionEn}
            </p>
          </div>

          {/* Grid of Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">
                {t.stars.temperature}
              </span>
              <span className="font-mono font-bold text-amber-500 text-sm">
                {selectedStar.temperatureK.toLocaleString()} K
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">
                {t.stars.radius}
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {selectedStar.solarRadius} R☉
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">
                {t.stars.mass}
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {selectedStar.solarMass} M☉
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">
                {t.stars.luminosity}
              </span>
              <span className="font-mono font-bold text-cyan-500 text-sm">
                {selectedStar.luminositySolar}
              </span>
            </div>
          </div>

          {/* Facts list */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{language === 'uz' ? 'Yulduz haqida faktlar' : 'Stellar Facts'}</span>
            </div>
            {(language === 'uz' ? selectedStar.factsUz : selectedStar.factsEn).map((fact, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-mono text-cyan-500 font-bold shrink-0">{idx + 1}.</span>
                <span>{fact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stellar Evolution Stages Infographic */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Sun className="w-4 h-4 text-cyan-500" />
          <span>{t.stars.lifecycle}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-1">
            <span className="font-mono text-cyan-500 font-bold">1. Molekulyar bulut</span>
            <div className="font-semibold text-slate-900 dark:text-white">
              {language === 'uz' ? 'Tumanlik va Proto-yulduz' : 'Nebula & Protostar'}
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {language === 'uz'
                ? 'Gravitatsiya ta’sirida gaz va chang siqilib, harorat va bosim oshib boradi.'
                : 'Gravitational collapse of interstellar hydrogen gas heating the core.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-1">
            <span className="font-mono text-cyan-500 font-bold">2. Asosiy ketma-ketlik</span>
            <div className="font-semibold text-slate-900 dark:text-white">
              {language === 'uz' ? 'Barqaror termoyadroviy davr' : 'Main Sequence Life'}
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {language === 'uz'
                ? 'Vodorod geliyga aylanadi. Yadro bosimi va tortishish kuchi mutlaq muvozanatda (Quyosh hozir shu yerda).'
                : 'Stable hydrogen burning in hydrostatic equilibrium lasting millions to billions of years.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-1">
            <span className="font-mono text-amber-500 font-bold">3. Qizil Gigant / Supergigant</span>
            <div className="font-semibold text-slate-900 dark:text-white">
              {language === 'uz' ? 'Kengayish va geliy sintezi' : 'Red Giant / Supergiant'}
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {language === 'uz'
                ? 'Vodorod tugagach yadro qisqaradi, tashqi qatlamlar millionlab kilometrlarga kengayadi (Betelgeyze kabi).'
                : 'Hydrogen depletion triggers core contraction and outer envelope swelling.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-1">
            <span className="font-mono text-rose-500 font-bold">4. Yakuniy qismat</span>
            <div className="font-semibold text-slate-900 dark:text-white">
              {language === 'uz' ? 'Oq mitti yoki Supernova' : 'White Dwarf or Supernova'}
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {language === 'uz'
                ? 'Kichik yulduzlar oq mittiga aylanadi. Massiv yulduzlar portlab, neytron yulduz yoki qora tuynuk qoldiradi.'
                : 'Planetary nebula white dwarf remnant, or catastrophic supernova yielding a neutron star or black hole.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
