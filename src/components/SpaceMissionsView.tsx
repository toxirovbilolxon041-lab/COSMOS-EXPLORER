import React, { useState } from 'react';
import { Language, MissionItem } from '../types';
import { SPACE_MISSIONS, ASSET_IMAGES } from '../data/spaceData';
import { translations } from '../i18n/translations';
import { Rocket, Calendar, MapPin, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface SpaceMissionsViewProps {
  language: Language;
}

export const SpaceMissionsView: React.FC<SpaceMissionsViewProps> = ({ language }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'planned'>('all');
  const t = translations[language];

  const filteredMissions = SPACE_MISSIONS.filter((m) => {
    if (filterStatus === 'all') return true;
    return m.status === filterStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs uppercase font-mono tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">
          {language === 'uz' ? 'Koinot kemalari va teleskoplar' : 'Spacecraft & Observatories'}
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.missions.title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          {t.missions.subtitle}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl max-w-fit border border-slate-200 dark:border-slate-800">
        {[
          { id: 'all' as const, label: language === 'uz' ? 'Barcha missiyalar' : 'All Missions' },
          { id: 'active' as const, label: t.missions.statusActive },
          { id: 'completed' as const, label: t.missions.statusCompleted },
          { id: 'planned' as const, label: t.missions.statusPlanned },
        ].map((tab) => {
          const isActive = filterStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Mission Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMissions.map((mission) => {
          return (
            <div
              key={mission.id}
              className="flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4"
            >
              {/* Top Banner */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-cyan-500 uppercase">
                      {mission.agency} · {mission.yearLaunched}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {mission.name}
                    </h3>
                  </div>

                  {/* Status Indicator */}
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium ${
                      mission.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : mission.status === 'completed'
                        ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        mission.status === 'active'
                          ? 'bg-emerald-500 animate-pulse'
                          : mission.status === 'completed'
                          ? 'bg-slate-400'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span>
                      {mission.status === 'active'
                        ? t.missions.statusActive
                        : mission.status === 'completed'
                        ? t.missions.statusCompleted
                        : t.missions.statusPlanned}
                    </span>
                  </div>
                </div>

                {/* Destination */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <span>{language === 'uz' ? mission.destinationUz : mission.destinationEn}</span>
                </div>
              </div>

              {/* Purpose */}
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {language === 'uz' ? mission.purposeUz : mission.purposeEn}
              </p>

              {/* Image banner for JWST */}
              {mission.image && (
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-48">
                  <img
                    src={mission.image}
                    alt={mission.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-44 object-cover"
                  />
                </div>
              )}

              {/* Discoveries */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                <span className="text-[11px] font-mono text-slate-500 uppercase block font-semibold">
                  {t.missions.keyDiscoveries}
                </span>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {(language === 'uz' ? mission.discoveriesUz : mission.discoveriesEn).map(
                    (disc, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{disc}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
