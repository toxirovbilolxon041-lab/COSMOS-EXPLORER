import React, { useState, useEffect } from 'react';
import { Language, LearningLesson } from '../types';
import { LEARNING_LESSONS } from '../data/spaceData';
import { translations } from '../i18n/translations';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Award,
} from 'lucide-react';

interface LearningHubProps {
  language: Language;
}

export const LearningHub: React.FC<LearningHubProps> = ({ language }) => {
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [miniQuizSelected, setMiniQuizSelected] = useState<number | null>(null);
  const [miniQuizSubmitted, setMiniQuizSubmitted] = useState<boolean>(false);

  const t = translations[language];

  // Load progress from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cosmos_completed_lessons');
      if (stored) {
        setCompletedLessonIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const activeLesson =
    LEARNING_LESSONS.find((l) => l.id === selectedLessonId) || LEARNING_LESSONS[0];

  const isCompleted = completedLessonIds.includes(activeLesson.id);
  const progressPercent = Math.round(
    (completedLessonIds.length / LEARNING_LESSONS.length) * 100
  );

  const toggleComplete = (id: number) => {
    let updated: number[];
    if (completedLessonIds.includes(id)) {
      updated = completedLessonIds.filter((item) => item !== id);
    } else {
      updated = [...completedLessonIds, id];
    }
    setCompletedLessonIds(updated);
    try {
      localStorage.setItem('cosmos_completed_lessons', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleLessonChange = (id: number) => {
    setSelectedLessonId(id);
    setMiniQuizSelected(null);
    setMiniQuizSubmitted(false);
  };

  return (
    <div className="space-y-8">
      {/* Header and Progress Tracker */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-mono tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">
            {language === 'uz' ? 'Astronomiya darslari' : 'Curriculum of Astrophysics'}
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.learn.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            {t.learn.subtitle}
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full md:w-64 p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-400">{t.learn.progress}</span>
            <span className="font-bold text-cyan-500">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 text-right font-mono">
            {completedLessonIds.length} / {LEARNING_LESSONS.length} {language === 'uz' ? 'dars' : 'lessons'}
          </div>
        </div>
      </div>

      {/* Main Learning Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Lesson Directory Navigation */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-2 px-1">
            {language === 'uz' ? '10 ta darslik mundarijasi' : '10 Curriculum Modules'}
          </div>

          <div className="space-y-1.5">
            {LEARNING_LESSONS.map((lesson) => {
              const isCurrent = lesson.id === activeLesson.id;
              const isDone = completedLessonIds.includes(lesson.id);

              return (
                <button
                  key={lesson.id}
                  onClick={() => handleLessonChange(lesson.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] shrink-0 ${
                        isCurrent
                          ? 'bg-slate-950 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {lesson.id}
                    </span>
                    <span className="truncate">
                      {language === 'uz' ? lesson.titleUz : lesson.titleEn}
                    </span>
                  </div>

                  {isDone && (
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        isCurrent ? 'text-slate-950' : 'text-emerald-500'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Lesson Reader Stage */}
        <div className="lg:col-span-8 p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          {/* Lesson Header */}
          <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-[11px] font-mono font-bold">
                {t.learn.lesson} {activeLesson.id}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {activeLesson.readTimeMinutes} {t.learn.readTime}
                </span>
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              {language === 'uz' ? activeLesson.titleUz : activeLesson.titleEn}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {language === 'uz' ? activeLesson.subtitleUz : activeLesson.subtitleEn}
            </p>
          </div>

          {/* Lesson Sections Text */}
          <div className="space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {activeLesson.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'uz' ? sec.headingUz : sec.headingEn}
                </h4>
                <p>{language === 'uz' ? sec.contentUz : sec.contentEn}</p>
                {(sec.highlightUz || sec.highlightEn) && (
                  <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-cyan-900 dark:text-cyan-300 font-medium">
                    {language === 'uz' ? sec.highlightUz : sec.highlightEn}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Key Facts Bullet points */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{language === 'uz' ? 'Asosiy xulosalar' : 'Key Takeaways'}</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {(language === 'uz' ? activeLesson.keyFactsUz : activeLesson.keyFactsEn).map(
                (kf, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>{kf}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Checkpoint Mini Quiz */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <HelpCircle className="w-4 h-4 text-cyan-500" />
              <span>{t.learn.miniQuizTitle}</span>
            </div>

            <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
              {language === 'uz'
                ? activeLesson.miniQuiz.questionUz
                : activeLesson.miniQuiz.questionEn}
            </p>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(language === 'uz'
                ? activeLesson.miniQuiz.optionsUz
                : activeLesson.miniQuiz.optionsEn
              ).map((opt, oIdx) => {
                const isSelected = miniQuizSelected === oIdx;
                const isCorrect = oIdx === activeLesson.miniQuiz.correctIndex;

                let style =
                  'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-500';

                if (miniQuizSubmitted) {
                  if (isCorrect) {
                    style = 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-bold';
                  } else if (isSelected) {
                    style = 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-300 font-bold';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => {
                      if (!miniQuizSubmitted) setMiniQuizSelected(oIdx);
                    }}
                    className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${style}`}
                  >
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Check Button & Explanation */}
            {!miniQuizSubmitted ? (
              <button
                onClick={() => {
                  if (miniQuizSelected !== null) setMiniQuizSubmitted(true);
                }}
                disabled={miniQuizSelected === null}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg disabled:opacity-40 transition-opacity cursor-pointer"
              >
                {t.learn.checkAnswer}
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-cyan-500 block mb-1">
                  {miniQuizSelected === activeLesson.miniQuiz.correctIndex
                    ? t.quiz.correctFeedback
                    : t.quiz.incorrectFeedback}
                </span>
                <p>
                  {language === 'uz'
                    ? activeLesson.miniQuiz.explanationUz
                    : activeLesson.miniQuiz.explanationEn}
                </p>
              </div>
            )}
          </div>

          {/* Mark Complete & Step Navigation Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => toggleComplete(activeLesson.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? t.learn.completedBadge : t.learn.markComplete}</span>
            </button>

            <div className="flex items-center gap-2">
              {activeLesson.id > 1 && (
                <button
                  onClick={() => handleLessonChange(activeLesson.id - 1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t.learn.prevLesson}</span>
                </button>
              )}
              {activeLesson.id < LEARNING_LESSONS.length && (
                <button
                  onClick={() => handleLessonChange(activeLesson.id + 1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>{t.learn.nextLesson}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
