import React, { useState } from 'react';
import { Language, CelestialCategory, SpaceObjectItem } from '../types';
import { SPACE_OBJECTS } from '../data/spaceData';
import { translations } from '../i18n/translations';
import { Search, Heart, Sparkles, Filter, Info, X } from 'lucide-react';

interface SpaceObjectsCatalogProps {
  language: Language;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onNavigateToDetail?: (category: string, id: string) => void;
}

export const SpaceObjectsCatalog: React.FC<SpaceObjectsCatalogProps> = ({
  language,
  favorites,
  onToggleFavorite,
  onNavigateToDetail,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedObjectForModal, setSelectedObjectForModal] = useState<SpaceObjectItem | null>(null);

  const t = translations[language];

  const categoriesList: { id: string; labelUz: string; labelEn: string }[] = [
    { id: 'all', labelUz: 'Barchasi', labelEn: 'All' },
    { id: 'star', labelUz: 'Yulduzlar', labelEn: 'Stars' },
    { id: 'moon', labelUz: 'Yo‘ldoshlar', labelEn: 'Moons' },
    { id: 'asteroid', labelUz: 'Asteroidlar', labelEn: 'Asteroids' },
    { id: 'comet', labelUz: 'Kometalar', labelEn: 'Comets' },
    { id: 'nebula', labelUz: 'Tumanliklar', labelEn: 'Nebulae' },
    { id: 'black-hole', labelUz: 'Qora tuynuklar', labelEn: 'Black Holes' },
    { id: 'exoplanet', labelUz: 'Ekzosayyoralar', labelEn: 'Exoplanets' },
  ];

  const filteredObjects = SPACE_OBJECTS.filter((obj) => {
    const matchesCategory = selectedCategory === 'all' || obj.category === selectedCategory;
    const nameMatch =
      obj.nameUz.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.shortDescUz.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.shortDescEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && nameMatch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs uppercase font-mono tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">
          {language === 'uz' ? 'Koinot katalogi' : 'Celestial Catalog'}
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.objects.title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          {t.objects.subtitle}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.objects.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        {/* Category Horizontal Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                {language === 'uz' ? cat.labelUz : cat.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Cards Grid */}
      {filteredObjects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-500">
          <p className="text-sm font-medium">{t.objects.noResults}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredObjects.map((item) => {
            const isFav = favorites.includes(item.id);
            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-cyan-500/40 transition-all duration-300"
              >
                <div className="space-y-3">
                  {/* Card Header with Color Accent & Heart */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: item.colorHex }}
                      />
                      <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 uppercase font-semibold">
                        {item.category}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isFav
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                          : 'border-transparent text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={isFav ? 'Remove Favorite' : 'Save Favorite'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* Title & Short Description */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                      {language === 'uz' ? item.nameUz : item.nameEn}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                      {language === 'uz' ? item.shortDescUz : item.shortDescEn}
                    </p>
                  </div>

                  {/* Key Features Bullet points */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-mono text-cyan-500 block font-semibold">
                      {language === 'uz' ? item.distanceUz : item.distanceEn}
                    </span>
                  </div>
                </div>

                {/* Learn More Action Button */}
                <div className="pt-4 mt-2">
                  <button
                    onClick={() => setSelectedObjectForModal(item)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors cursor-pointer text-center"
                  >
                    {language === 'uz' ? 'Batafsil o‘rganish' : 'Learn More'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedObjectForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <button
              onClick={() => setSelectedObjectForModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs uppercase font-mono text-cyan-500 font-bold">
                {selectedObjectForModal.category}
              </span>
              <h3 className="text-2xl font-extrabold mt-0.5">
                {language === 'uz' ? selectedObjectForModal.nameUz : selectedObjectForModal.nameEn}
              </h3>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {language === 'uz' ? selectedObjectForModal.fullDescUz : selectedObjectForModal.fullDescEn}
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <span className="font-mono text-slate-400 uppercase text-[10px] block">
                {language === 'uz' ? 'Asosiy parametrlar' : 'Primary Characteristics'}
              </span>
              {(language === 'uz' ? selectedObjectForModal.featuresUz : selectedObjectForModal.featuresEn).map(
                (f, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>{f}</span>
                  </div>
                )
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedObjectForModal(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                {language === 'uz' ? 'Yopish' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
