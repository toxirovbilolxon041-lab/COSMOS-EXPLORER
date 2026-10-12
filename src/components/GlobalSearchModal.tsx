import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { PLANETS_DATA, GALAXY_DATA, STARS_DATA, SPACE_MISSIONS, SPACE_OBJECTS, LEARNING_LESSONS } from '../data/spaceData';
import { translations } from '../i18n/translations';
import { Search, X, ChevronRight, Globe, Star, Orbit, Rocket, BookOpen, Compass } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onNavigate: (section: string, detailId?: string) => void;
}

interface SearchResultItem {
  id: string;
  title: string;
  category: string;
  snippet: string;
  targetSection: string;
  detailId?: string;
  icon: any;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  language,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build searchable index
  const allItems: SearchResultItem[] = [
    ...PLANETS_DATA.map((p) => ({
      id: `planet-${p.id}`,
      title: language === 'uz' ? p.nameUz : p.nameEn,
      category: language === 'uz' ? 'Sayyora' : 'Planet',
      snippet: language === 'uz' ? p.taglineUz : p.taglineEn,
      targetSection: 'planets',
      detailId: p.id,
      icon: Globe,
    })),
    ...GALAXY_DATA.map((g) => ({
      id: `galaxy-${g.id}`,
      title: language === 'uz' ? g.nameUz : g.nameEn,
      category: language === 'uz' ? 'Galaktika' : 'Galaxy',
      snippet: language === 'uz' ? g.typeUz : g.typeEn,
      targetSection: 'galaxies',
      icon: Orbit,
    })),
    ...STARS_DATA.map((s) => ({
      id: `star-${s.id}`,
      title: s.name,
      category: language === 'uz' ? 'Yulduz' : 'Star',
      snippet: s.spectralType,
      targetSection: 'stars',
      icon: Star,
    })),
    ...SPACE_MISSIONS.map((m) => ({
      id: `mission-${m.id}`,
      title: m.name,
      category: language === 'uz' ? 'Fazoviy missiya' : 'Space Mission',
      snippet: `${m.agency} (${m.yearLaunched})`,
      targetSection: 'missions',
      icon: Rocket,
    })),
    ...SPACE_OBJECTS.map((o) => ({
      id: `obj-${o.id}`,
      title: language === 'uz' ? o.nameUz : o.nameEn,
      category: o.category,
      snippet: language === 'uz' ? o.shortDescUz : o.shortDescEn,
      targetSection: 'objects',
      icon: Compass,
    })),
    ...LEARNING_LESSONS.map((l) => ({
      id: `lesson-${l.id}`,
      title: language === 'uz' ? l.titleUz : l.titleEn,
      category: language === 'uz' ? 'Ta’lim darsi' : 'Lesson',
      snippet: language === 'uz' ? l.subtitleUz : l.subtitleEn,
      targetSection: 'learn',
      icon: BookOpen,
    })),
  ];

  const results = query.trim()
    ? allItems.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.snippet.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelect = (item: SearchResultItem) => {
    onNavigate(item.targetSection, item.detailId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-white">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search.placeholder}
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-xs text-slate-500 space-y-3">
              <span className="font-mono uppercase text-[10px] text-slate-400 block">
                {t.search.suggestions}
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {['Earth', 'Mars', 'Jupiter', 'Black Hole', 'Apollo 11', 'Milky Way', 'James Webb'].map(
                  (sug) => (
                    <button
                      key={sug}
                      onClick={() => setQuery(sug)}
                      className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      {sug}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              "{query}" — {t.search.noMatches}
            </div>
          ) : (
            results.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                        {item.snippet}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 shrink-0" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
