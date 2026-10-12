import React, { useState, useEffect } from 'react';
import { Language, QuizQuestion, QuizScoreRecord } from '../types';
import { QUIZ_QUESTIONS } from '../data/spaceData';
import { translations } from '../i18n/translations';
import { Trophy, CheckCircle2, XCircle, RotateCcw, Award, ChevronRight, User } from 'lucide-react';

interface SpaceQuizProps {
  language: Language;
}

export const SpaceQuiz: React.FC<SpaceQuizProps> = ({ language }) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<QuizScoreRecord[]>([]);

  const t = translations[language];

  // Filter questions by difficulty
  const questions = QUIZ_QUESTIONS.filter((q) => q.difficulty === difficulty);
  const currentQuestion = questions[currentIndex] || questions[0];

  // Load Leaderboard from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cosmos_quiz_leaderboard');
      if (stored) {
        setLeaderboard(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    const newRecord: QuizScoreRecord = {
      id: Date.now().toString(),
      playerName: playerName.trim(),
      score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      difficulty,
      date: new Date().toLocaleDateString(),
    };

    const updated = [newRecord, ...leaderboard].slice(0, 10);
    setLeaderboard(updated);
    try {
      localStorage.setItem('cosmos_quiz_leaderboard', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setPlayerName('');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-xs uppercase font-mono tracking-widest text-cyan-500 dark:text-cyan-400 mb-1">
          {language === 'uz' ? 'Astronomik bilim sinovi' : 'Cosmic Knowledge Examination'}
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.quiz.title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {t.quiz.subtitle}
        </p>
      </div>

      {/* Difficulty Switcher */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-slate-500 uppercase mr-1">
          {t.quiz.difficulty}:
        </span>
        {(['easy', 'medium', 'hard'] as const).map((diff) => {
          const isActive = difficulty === diff;
          return (
            <button
              key={diff}
              onClick={() => {
                setDifficulty(diff);
                handleRestart();
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              {diff === 'easy' ? t.quiz.easy : diff === 'medium' ? t.quiz.medium : t.quiz.hard}
            </button>
          );
        })}
      </div>

      {/* Quiz Card View */}
      {!isFinished ? (
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {/* Progress Bar & Counter */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-cyan-500 font-bold">
                {t.quiz.question} {currentIndex + 1} / {questions.length}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {t.quiz.score}: <strong className="text-slate-900 dark:text-white">{score}</strong>
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-snug">
            {language === 'uz' ? currentQuestion.questionUz : currentQuestion.questionEn}
          </h3>

          {/* 4 Choices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(language === 'uz' ? currentQuestion.optionsUz : currentQuestion.optionsEn).map(
              (opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctIndex;

                let btnStyle =
                  'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-cyan-500/50';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle =
                      'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold';
                  } else if (isSelected) {
                    btnStyle =
                      'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-semibold';
                  } else {
                    btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`flex items-center justify-between p-4 rounded-xl border text-xs text-left transition-all cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="font-medium">{opt}</span>
                    </div>

                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              }
            )}
          </div>

          {/* Answer Explanation & Feedback */}
          {isAnswered && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-xs space-y-1 animate-in fade-in duration-200">
              <span
                className={`font-bold block ${
                  selectedOption === currentQuestion.correctIndex
                    ? 'text-emerald-500'
                    : 'text-rose-500'
                }`}
              >
                {selectedOption === currentQuestion.correctIndex
                  ? t.quiz.correctFeedback
                  : t.quiz.incorrectFeedback}
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'uz'
                  ? currentQuestion.explanationUz
                  : currentQuestion.explanationEn}
              </p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
              >
                <span>{currentIndex + 1 < questions.length ? t.quiz.next : t.quiz.finish}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results Screen */
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="inline-flex p-4 rounded-2xl bg-cyan-500/10 text-cyan-500 mb-2">
            <Award className="w-12 h-12" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {score >= questions.length * 0.7 ? t.quiz.congrats : t.quiz.tryAgain}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === 'uz'
                ? `Siz ${questions.length} ta savoldan ${score} tasiga to‘g‘ri javob berdingiz!`
                : `You answered ${score} out of ${questions.length} questions accurately!`}
            </p>
          </div>

          <div className="text-4xl font-extrabold font-mono text-cyan-500">
            {Math.round((score / questions.length) * 100)}%
          </div>

          {/* Save to Leaderboard form */}
          <form onSubmit={handleSaveScore} className="max-w-xs mx-auto flex gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={t.quiz.enterName}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={!playerName.trim()}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer whitespace-nowrap"
            >
              {t.quiz.saveScore}
            </button>
          </form>

          <div className="pt-2">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.quiz.restart}</span>
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>{t.quiz.leaderboard}</span>
        </div>

        {leaderboard.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">{t.quiz.noLeaderboardYet}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-mono text-slate-400">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">O‘yinchi</th>
                  <th className="py-2 px-3">Daraja</th>
                  <th className="py-2 px-3">Natija</th>
                  <th className="py-2 px-3">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {leaderboard.map((item, idx) => (
                  <tr key={item.id} className="text-slate-700 dark:text-slate-300">
                    <td className="py-2.5 px-3 text-cyan-500 font-bold">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {item.playerName}
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[10px] text-slate-400">
                      {item.difficulty}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-500 font-bold">
                      {item.score}/{item.total} ({item.percentage}%)
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
