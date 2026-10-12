import React, { useState } from 'react';
import { Language, Theme } from '../types';
import { translations } from '../i18n/translations';
import {
  Search,
  Sun,
  Moon,
  Heart,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Globe2,
} from 'lucide-react';

interface NavbarProps {
  currentSection: string;
  onNavigate: (section: string) => void;
  language: Language;
  onToggleLanguage: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  favoritesCount: number;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  onNavigate,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  favoritesCount,
  onOpenSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const t = translations[language];

  const primaryNavItems = [
    { id: 'home', label: t.nav.home },
    { id: 'solar-system', label: t.nav.solarSystem },
    { id: 'planets', label: t.nav.planets },
    { id: 'learn', label: t.nav.learn },
    { id: 'quiz', label: t.nav.quiz },
  ];

  const secondaryNavItems = [
    { id: 'earth', label: t.nav.earth },
    { id: 'moon', label: t.nav.moon },
    { id: 'black-holes', label: t.nav.blackHoles },
    { id: 'stars', label: t.nav.stars },
    { id: 'galaxies', label: t.nav.galaxies },
    { id: 'missions', label: t.nav.missions },
    { id: 'objects', label: t.nav.objects },
    { id: 'about', label: t.nav.about },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 group cursor-pointer text-left"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50 group-hover:scale-125 transition-transform" />
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors whitespace-nowrap">
            COSMOS EXPLORER
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {primaryNavItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`transition-colors whitespace-nowrap cursor-pointer hover:text-cyan-500 dark:hover:text-cyan-400 ${
                  isActive
                    ? 'text-cyan-600 dark:text-cyan-400 font-bold border-b-2 border-cyan-500 pb-0.5'
                    : ''
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* More Dropdown for Earth, Moon, Black Holes, etc. */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer hover:text-cyan-500 dark:hover:text-cyan-400 ${
                secondaryNavItems.some((s) => s.id === currentSection)
                  ? 'text-cyan-500 font-bold'
                  : ''
              }`}
            >
              <span>{language === 'uz' ? 'Bo‘limlar' : 'Explore More'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {dropdownOpen && (
              <div
                onMouseLeave={() => setDropdownOpen(false)}
                className="absolute top-full left-0 mt-2 w-48 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-1 animate-in fade-in duration-100"
              >
                {secondaryNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                      currentSection === item.id
                        ? 'bg-cyan-500/10 text-cyan-500 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Zone 3: Interactive Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-colors cursor-pointer"
            title="Search (Cmd+K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Favorites Button with Counter */}
          <button
            onClick={() => handleNavClick('favorites')}
            className={`flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              currentSection === 'favorites'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-500'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-500'
            }`}
            title={t.nav.favorites}
          >
            <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {favoritesCount > 0 && (
              <span className="font-mono text-[11px] font-bold text-rose-500">{favoritesCount}</span>
            )}
          </button>

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:border-cyan-500 transition-colors cursor-pointer"
            title="Switch Language"
          >
            <Globe2 className="w-3.5 h-3.5 text-cyan-500" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-500 transition-colors cursor-pointer"
            title={theme === 'dark' ? t.footer.lightMode : t.footer.darkMode}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {[...primaryNavItems, ...secondaryNavItems].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                  currentSection === item.id
                    ? 'bg-cyan-500/15 text-cyan-500 font-bold border border-cyan-500/30'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
