import React from 'react';
import { Language } from '../types';
import { PLANETS_DATA, GALAXY_DATA, STARS_DATA, SPACE_MISSIONS, SPACE_OBJECTS } from '../data/spaceData';
import { translations } from '../i18n/translations';
import { Heart, Trash2, ArrowRight } from 'lucide-react';

interface FavoritesViewProps {
  language: Language;
  favorites: string[];
  onRemoveFavorite: (id: string) => void;
  onClearAll: () => void;
  onNavigate: (section: string, detailId?: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  language,
  favorites,
  onRemoveFavorite,
  onClearAll,
  onNavigate,
}) => {
  const t = translations[language];

  // Resolve favorite items across datasets
  const favoriteItems = favorites.map((id) => {
    // Planet?
    const planet = PLANETS_DATA.find((p) => p.id === id);
    if (planet) {
      return {
        id,
        title: language === 'uz' ? planet.nameUz : planet.nameEn,
        category: language === 'uz' ? 'Sayyora' : 'Planet',
        description: language === 'uz' ? planet.taglineUz : planet.taglineEn,
        targetSection: 'planets',
        detailId: planet.id,
      };
    }
    // Star?
    const star = STARS_DATA.find((s) => s.id === id);
    if (star) {
      return {
        id,
        title: star.name,
        category: language === 'uz' ? 'Yulduz' : 'Star',
        description: star.spectralType,
        targetSection: 'stars',
      };
    }
    // Galaxy?
    const galaxy = GALAXY_DATA.find((g) => g.id === id);
    if (galaxy) {
      return {
        id,
        title: language === 'uz' ? galaxy.nameUz : galaxy.nameEn,
        category: language === 'uz' ? 'Galaktika' : 'Galaxy',
        description: language === 'uz' ? galaxy.typeUz : galaxy.typeEn,
        targetSection: 'galaxies',
      };
    }
    // Mission?
    const mission = SPACE_MISSIONS.find((m) => m.id === id);
    if (mission) {
      return {
        id,
        title: mission.name,
        category: language === 'uz' ? 'Missiya' : 'Mission',
        description: `${mission.agency} · ${mission.yearLaunched}`,
        targetSection: 'missions',
      };
    }
    // Space Object?
    const obj = SPACE_OBJECTS.find((o) => o.id === id);
    if (obj) {
      return {
        id,
        title: language === 'uz' ? obj.nameUz : obj.nameEn,
        category: obj.category,
        description: language === 'uz' ? obj.shortDescUz : obj.shortDescEn,
        targetSection: 'objects',
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-mono tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">
            {language === 'uz' ? 'Shaxsiy kolleksiya' : 'Personal Curations'}
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.favorites.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t.favorites.subtitle}
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.favorites.clearAll}</span>
          </button>
        )}
      </div>

      {favoriteItems.length === 0 ? (
        <div className="p-16 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Heart className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t.favorites.empty}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteItems.map((item) => {
            if (!item) return null;
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-cyan-500 font-semibold uppercase">
                      {item.category}
                    </span>
                    <button
                      onClick={() => onRemoveFavorite(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => onNavigate(item.targetSection, item.detailId)}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <span>{language === 'uz' ? 'Obyektni ko‘rish' : 'View Object'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
