import React, { useState, useEffect } from 'react';
import { Language, Theme } from './types';
import { translations } from './i18n/translations';
import { PLANETS_DATA, ASSET_IMAGES } from './data/spaceData';
import { StarfieldCanvas } from './components/StarfieldCanvas';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SolarSystem3D } from './components/SolarSystem3D';
import { Planet3DView } from './components/Planet3DView';
import { EarthGlobe3D } from './components/EarthGlobe3D';
import { MoonExplorer3D } from './components/MoonExplorer3D';
import { BlackHoleSimulation } from './components/BlackHoleSimulation';
import { GalaxyViewer } from './components/GalaxyViewer';
import { StarViewer } from './components/StarViewer';
import { SpaceMissionsView } from './components/SpaceMissionsView';
import { SpaceObjectsCatalog } from './components/SpaceObjectsCatalog';
import { LearningHub } from './components/LearningHub';
import { SpaceQuiz } from './components/SpaceQuiz';
import { FavoritesView } from './components/FavoritesView';
import { AboutView } from './components/AboutView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import {
  Globe,
  Compass,
  Orbit,
  Moon,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Zap,
  Rocket,
} from 'lucide-react';

export default function App() {
  // 1. Language state (default: 'uz')
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('cosmos_lang');
    return saved === 'en' || saved === 'uz' ? saved : 'uz';
  });

  // 2. Theme state (default: 'dark')
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('cosmos_theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  // 3. Navigation section
  const [currentSection, setCurrentSection] = useState<string>('home');
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>('earth');

  // 4. Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cosmos_favorites');
      return saved ? JSON.parse(saved) : ['earth', 'jupiter', 'sagittarius-a', 'jwst'];
    } catch {
      return ['earth', 'jupiter', 'sagittarius-a', 'jwst'];
    }
  });

  // 5. Global Search modal state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Sync theme with HTML documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('cosmos_theme', theme);
  }, [theme]);

  // Sync language with localStorage
  useEffect(() => {
    localStorage.setItem('cosmos_lang', language);
  }, [language]);

  // Sync favorites with localStorage
  useEffect(() => {
    localStorage.setItem('cosmos_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Keyboard shortcut Cmd+K or Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'uz' ? 'en' : 'uz'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearAllFavorites = () => {
    setFavorites([]);
  };

  const handleNavigate = (section: string, detailId?: string) => {
    setCurrentSection(section);
    if (detailId) {
      setSelectedPlanetId(detailId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPlanetForDetail = (planetId: string) => {
    setSelectedPlanetId(planetId);
    setCurrentSection('planets');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = translations[language];

  return (
    <div className="min-h-screen relative flex flex-col transition-colors selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Background Starfield Canvas with parallax particles */}
      <StarfieldCanvas theme={theme} />

      {/* Top Navigation Bar */}
      <Navbar
        currentSection={currentSection}
        onNavigate={handleNavigate}
        language={language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        favoritesCount={favorites.length}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* ======================================================= */}
        {/* 1. HOME LANDING VIEW */}
        {/* ======================================================= */}
        {currentSection === 'home' && (
          <div className="space-y-16">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/80 shadow-2xl p-8 sm:p-12 lg:p-16">
              {/* Subtle background image overlay */}
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <img
                  src={ASSET_IMAGES.heroNebula}
                  alt="Deep cosmos nebula"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="relative z-10 max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'uz' ? 'INTERAKTIV KOINOT MUZEYI' : 'INTERACTIVE DIGITAL COSMOS'}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] text-balance">
                  {t.hero.title}
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                  {t.hero.subtitle}
                </p>

                {/* Primary CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => handleNavigate('solar-system')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                  >
                    <span>{t.hero.startExploring}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleNavigate('solar-system')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Orbit className="w-4 h-4 text-cyan-400" />
                    <span>{t.hero.exploreSolarSystem}</span>
                  </button>
                </div>
              </div>

              {/* Informational Numerical Metrics Bar */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-12 mt-10 border-t border-slate-800/80">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white block">
                    8
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wide">
                    {t.hero.stats.planets}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-400 block">
                    1
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                    {t.hero.stats.star}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white block">
                    200+
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                    {t.hero.stats.moons}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-purple-400 block">
                    2T+
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                    {t.hero.stats.galaxies}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 col-span-2 sm:col-span-1">
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400 block">
                    ∞
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                    {t.hero.stats.discoveries}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive 3D Solar System Showcase on Home */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase font-mono tracking-wider text-cyan-500 font-bold mb-1">
                    {language === 'uz' ? 'Jonli 3D simulyatsiya' : 'Live 3D Simulation'}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {t.solarSystem.title}
                  </h2>
                </div>
                <button
                  onClick={() => handleNavigate('solar-system')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  <span>{language === 'uz' ? 'To‘liq ekranda ko‘rish' : 'Open Fullscreen Explorer'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <SolarSystem3D
                language={language}
                onSelectPlanetForDetail={handleSelectPlanetForDetail}
              />
            </div>

            {/* 4 Feature Gateways Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Earth Explorer Gateway */}
              <div
                onClick={() => handleNavigate('earth')}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500 w-fit">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                    {t.quickFeatures.earthTitle}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t.quickFeatures.earthDesc}
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-cyan-500">
                  <span>{language === 'uz' ? 'O‘rganish' : 'Explore'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Black Hole Gateway */}
              <div
                onClick={() => handleNavigate('black-holes')}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 w-fit">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {t.quickFeatures.blackHoleTitle}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t.quickFeatures.blackHoleDesc}
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-amber-500">
                  <span>{language === 'uz' ? 'Simulyatsiya' : 'Simulate'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Space Missions Gateway */}
              <div
                onClick={() => handleNavigate('missions')}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 w-fit">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">
                    {t.missions.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {language === 'uz'
                      ? 'Apollo 11, Voyager, Hubble, James Webb va Artemis missiyalarining ilmiy kashfiyotlari.'
                      : 'Historic Apollo lunar steps, interstellar Voyagers, JWST infrared vistas, and robotic rovers.'}
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-purple-500">
                  <span>{language === 'uz' ? 'Missiyalar' : 'View Missions'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Cosmos Academy Gateway */}
              <div
                onClick={() => handleNavigate('learn')}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {t.quickFeatures.learnTitle}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t.quickFeatures.learnDesc}
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-emerald-500">
                  <span>{language === 'uz' ? 'Darslar' : 'Start Lessons'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Photographic Telescopic Assets Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* JWST Asset card */}
              <div
                onClick={() => handleNavigate('missions')}
                className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-64 group cursor-pointer shadow-md"
              >
                <img
                  src={ASSET_IMAGES.jwst}
                  alt="James Webb Space Telescope"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">
                    NASA / ESA / CSA · 2021
                  </span>
                  <h3 className="text-xl font-bold">James Webb Space Telescope</h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {language === 'uz'
                      ? 'L2 orbitasida oltin nometallari orqali 13.5 milliard yil avvalgi eng qadimiy galaktikalarni kuzatmoqda.'
                      : 'Deploying golden beryllium mirrors at L2 to witness the earliest primordial post-Big Bang galaxies.'}
                  </p>
                </div>
              </div>

              {/* Andromeda Galaxy Asset card */}
              <div
                onClick={() => handleNavigate('galaxies')}
                className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-64 group cursor-pointer shadow-md"
              >
                <img
                  src={ASSET_IMAGES.andromeda}
                  alt="Andromeda Galaxy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-[10px] font-mono text-purple-400 uppercase font-semibold">
                    Messier 31 · 2.537M Light Years
                  </span>
                  <h3 className="text-xl font-bold">Andromeda Galaxy (M31)</h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {language === 'uz'
                      ? '1 trillion yulduzga ega ulkan spiral qo‘shnimiz, Somon Yo‘li bilan to‘qnashish sari harakatlanmoqda.'
                      : 'One trillion stars spiraling across 220,000 light-years on an eventual collision course with the Milky Way.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* 2. SOLAR SYSTEM DEDICATED VIEW */}
        {/* ======================================================= */}
        {currentSection === 'solar-system' && (
          <div className="space-y-6">
            <div>
              <div className="text-xs uppercase font-mono tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">
                {language === 'uz' ? 'Markaziy yulduz va 8 sayyora' : 'Heliocentric Architecture'}
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t.solarSystem.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                {t.solarSystem.subtitle}
              </p>
            </div>

            <SolarSystem3D
              language={language}
              onSelectPlanetForDetail={handleSelectPlanetForDetail}
            />

            {/* Quick Planet Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4">
              {PLANETS_DATA.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPlanetForDetail(p.id)}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 shadow-sm transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: p.colorHex }}
                    />
                    <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                      {language === 'uz' ? p.nameUz : p.nameEn}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block">
                    {p.distanceAU} AU · {p.diameterKm.toLocaleString()} km
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* 3. DEDICATED PLANET VIEW */}
        {/* ======================================================= */}
        {currentSection === 'planets' && (
          <Planet3DView
            planetId={selectedPlanetId}
            language={language}
            onSelectPlanet={(id) => setSelectedPlanetId(id)}
            isFavorite={favorites.includes(selectedPlanetId)}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {/* ======================================================= */}
        {/* 4. EARTH EXPLORER */}
        {/* ======================================================= */}
        {currentSection === 'earth' && <EarthGlobe3D language={language} />}

        {/* ======================================================= */}
        {/* 5. MOON EXPLORER */}
        {/* ======================================================= */}
        {currentSection === 'moon' && <MoonExplorer3D language={language} />}

        {/* ======================================================= */}
        {/* 6. BLACK HOLES SECTION */}
        {/* ======================================================= */}
        {currentSection === 'black-holes' && <BlackHoleSimulation language={language} />}

        {/* ======================================================= */}
        {/* 7. GALAXY EXPLORER */}
        {/* ======================================================= */}
        {currentSection === 'galaxies' && <GalaxyViewer language={language} />}

        {/* ======================================================= */}
        {/* 8. STAR OBSERVATORY */}
        {/* ======================================================= */}
        {currentSection === 'stars' && <StarViewer language={language} />}

        {/* ======================================================= */}
        {/* 9. SPACE MISSIONS */}
        {/* ======================================================= */}
        {currentSection === 'missions' && <SpaceMissionsView language={language} />}

        {/* ======================================================= */}
        {/* 10. SPACE OBJECTS DIRECTORY */}
        {/* ======================================================= */}
        {currentSection === 'objects' && (
          <SpaceObjectsCatalog
            language={language}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onNavigateToDetail={handleNavigate}
          />
        )}

        {/* ======================================================= */}
        {/* 11. LEARNING MODE (10 LESSONS) */}
        {/* ======================================================= */}
        {currentSection === 'learn' && <LearningHub language={language} />}

        {/* ======================================================= */}
        {/* 12. SPACE QUIZ */}
        {/* ======================================================= */}
        {currentSection === 'quiz' && <SpaceQuiz language={language} />}

        {/* ======================================================= */}
        {/* 13. FAVORITES */}
        {/* ======================================================= */}
        {currentSection === 'favorites' && (
          <FavoritesView
            language={language}
            favorites={favorites}
            onRemoveFavorite={toggleFavorite}
            onClearAll={clearAllFavorites}
            onNavigate={handleNavigate}
          />
        )}

        {/* ======================================================= */}
        {/* 14. ABOUT VIEW */}
        {/* ======================================================= */}
        {currentSection === 'about' && <AboutView language={language} />}
      </main>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        language={language}
        onNavigate={handleNavigate}
      />

      {/* Footer */}
      <Footer
        language={language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
