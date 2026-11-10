import React, { useMemo } from 'react';
import {
  Check,
  CheckCircle2,
  Layers,
  Play,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import {
  CEFRLevel,
  LectureUnit,
  ModuleScoreRecord,
  UserProgressState,
} from '../types/curriculum';
import { speechService } from '../services/speech';

export type ModuleStepIndex = 0 | 1 | 2 | 3 | 4;

export interface LessonProgressCardProps {
  lectures: LectureUnit[];
  progress: UserProgressState;
  recommendedLecture: LectureUnit;
  activeLevelFilter?: 'ALL' | CEFRLevel;
  compact?: boolean;
  onSelectLevelFilter?: (level: 'ALL' | CEFRLevel) => void;
  onOpenLecture: (lectureId: string, initialStep?: ModuleStepIndex) => void;
}

const STEP_DEFINITIONS: { step: ModuleStepIndex; number: string; label: string; shortLabel: string }[] = [
  { step: 0, number: '01', label: 'Vocabulary', shortLabel: 'Vocab' },
  { step: 1, number: '02', label: 'Audio Dictation', shortLabel: 'Audio' },
  { step: 2, number: '03', label: 'Spelling Rule', shortLabel: 'Spelling' },
  { step: 3, number: '04', label: 'Grammar & Syntax', shortLabel: 'Grammar' },
  { step: 4, number: '05', label: 'Live Dialogue', shortLabel: 'Dialogue' },
];

export const LessonProgressCard: React.FC<LessonProgressCardProps> = ({
  lectures,
  progress,
  recommendedLecture,
  activeLevelFilter = 'ALL',
  compact = false,
  onSelectLevelFilter,
  onOpenLecture,
}) => {
  const analytics = useMemo(() => {
    const coreLectures = lectures.filter((l) => l.lectureNumber <= 12);
    const totalLessons = coreLectures.length;
    const totalSteps = totalLessons * 5;

    let completedLessons = 0;
    let completedSteps = 0;

    let overallSpellingCorrect = 0;
    let overallSpellingTotal = 0;
    let overallGrammarCorrect = 0;
    let overallGrammarTotal = 0;
    let overallDialogueCorrect = 0;
    let overallDialogueTotal = 0;

    const trackConfigs: {
      level: CEFRLevel;
      title: string;
      subtitle: string;
      barColor: string;
      pillClass: string;
      borderActiveClass: string;
    }[] = [
      {
        level: 'B1',
        title: 'B1 Foundation',
        subtitle: 'Everyday confidence · L01–L04',
        barColor: 'bg-[#2E6F4E]',
        pillClass: 'bg-[#DCECE2] dark:bg-emerald-950/60 text-[#1F5C3D] dark:text-emerald-300',
        borderActiveClass: 'border-[#2E6F4E] ring-1 ring-[#2E6F4E]/25',
      },
      {
        level: 'B2',
        title: 'B2 Workplace',
        subtitle: 'Professional clarity · L05–L08',
        barColor: 'bg-[#284B7A]',
        pillClass: 'bg-[#DCE6F2] dark:bg-sky-950/60 text-[#284B7A] dark:text-sky-300',
        borderActiveClass: 'border-[#284B7A] ring-1 ring-[#284B7A]/25',
      },
      {
        level: 'C1',
        title: 'C1 Advanced',
        subtitle: 'Executive & academic · L09–L12',
        barColor: 'bg-[#9E2A2B]',
        pillClass: 'bg-[#F6E3DF] dark:bg-red-950/60 text-[#9E2A2B] dark:text-red-300',
        borderActiveClass: 'border-[#9E2A2B] ring-1 ring-[#9E2A2B]/25',
      },
    ];

    const tracks = trackConfigs.map((cfg) => {
      const trackUnits = coreLectures.filter((l) => l.level === cfg.level);
      const trackTotalLessons = trackUnits.length;
      const trackTotalSteps = trackTotalLessons * 5;

      let trackDoneLessons = 0;
      let trackDoneSteps = 0;

      let tSpellingScore = 0;
      let tSpellingTotal = 0;
      let tGrammarScore = 0;
      let tGrammarTotal = 0;
      let tDialogueScore = 0;
      let tDialogueTotal = 0;

      const unitStepDetails = trackUnits.map((unit) => {
        const isUnitDone = progress.completedUnitIds.includes(unit.id);
        const rawSteps = progress.completedStepsByLecture?.[unit.id] || [];
        const uniqueSteps = Array.from(new Set(rawSteps)).filter((s) => s >= 0 && s <= 4);
        const unitStepsCount = isUnitDone ? 5 : uniqueSteps.length;

        if (isUnitDone) {
          trackDoneLessons += 1;
          completedLessons += 1;
        }
        trackDoneSteps += unitStepsCount;
        completedSteps += unitStepsCount;

        const scoreRec: ModuleScoreRecord | undefined = progress.moduleScores?.[unit.id];
        let unitAccuracy: number | null = null;
        if (scoreRec) {
          const uCorrect =
            (scoreRec.spellingScore || 0) +
            (scoreRec.grammarScore || 0) +
            (scoreRec.dialogueScore || 0);
          const uTotal =
            (scoreRec.spellingTotal || 0) +
            (scoreRec.grammarTotal || 0) +
            (scoreRec.dialogueTotal || 0);

          if (uTotal > 0) {
            unitAccuracy = Math.round((uCorrect / uTotal) * 100);
          }

          tSpellingScore += scoreRec.spellingScore || 0;
          tSpellingTotal += scoreRec.spellingTotal || 0;
          tGrammarScore += scoreRec.grammarScore || 0;
          tGrammarTotal += scoreRec.grammarTotal || 0;
          tDialogueScore += scoreRec.dialogueScore || 0;
          tDialogueTotal += scoreRec.dialogueTotal || 0;

          overallSpellingCorrect += scoreRec.spellingScore || 0;
          overallSpellingTotal += scoreRec.spellingTotal || 0;
          overallGrammarCorrect += scoreRec.grammarScore || 0;
          overallGrammarTotal += scoreRec.grammarTotal || 0;
          overallDialogueCorrect += scoreRec.dialogueScore || 0;
          overallDialogueTotal += scoreRec.dialogueTotal || 0;
        }

        return {
          id: unit.id,
          lectureNumber: unit.lectureNumber,
          title: unit.title,
          isUnitDone,
          stepsCount: unitStepsCount,
          unitAccuracy,
        };
      });

      const trackQuizCorrect = tSpellingScore + tGrammarScore + tDialogueScore;
      const trackQuizTotal = tSpellingTotal + tGrammarTotal + tDialogueTotal;
      const trackQuizAccuracy =
        trackQuizTotal > 0 ? Math.round((trackQuizCorrect / trackQuizTotal) * 100) : null;

      const trackSpellingAccuracy =
        tSpellingTotal > 0 ? Math.round((tSpellingScore / tSpellingTotal) * 100) : null;
      const trackGrammarAccuracy =
        tGrammarTotal > 0 ? Math.round((tGrammarScore / tGrammarTotal) * 100) : null;
      const trackDialogueAccuracy =
        tDialogueTotal > 0 ? Math.round((tDialogueScore / tDialogueTotal) * 100) : null;

      const stepPct =
        trackTotalSteps > 0 ? Math.round((trackDoneSteps / trackTotalSteps) * 100) : 0;

      return {
        ...cfg,
        doneLessons: trackDoneLessons,
        totalLessons: trackTotalLessons,
        doneSteps: trackDoneSteps,
        totalSteps: trackTotalSteps,
        stepPct,
        isTrackComplete: trackDoneLessons >= trackTotalLessons && trackTotalLessons > 0,
        trackQuizAccuracy,
        trackSpellingAccuracy,
        trackGrammarAccuracy,
        trackDialogueAccuracy,
        unitStepDetails,
      };
    });

    const overallQuizCorrect =
      overallSpellingCorrect + overallGrammarCorrect + overallDialogueCorrect;
    const overallQuizTotal =
      overallSpellingTotal + overallGrammarTotal + overallDialogueTotal;
    const overallQuizAccuracy =
      overallQuizTotal > 0 ? Math.round((overallQuizCorrect / overallQuizTotal) * 100) : null;

    const spellingAccuracy =
      overallSpellingTotal > 0
        ? Math.round((overallSpellingCorrect / overallSpellingTotal) * 100)
        : null;
    const grammarAccuracy =
      overallGrammarTotal > 0
        ? Math.round((overallGrammarCorrect / overallGrammarTotal) * 100)
        : null;
    const dialogueAccuracy =
      overallDialogueTotal > 0
        ? Math.round((overallDialogueCorrect / overallDialogueTotal) * 100)
        : null;

    const overallStepsPct =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return {
      totalLessons,
      completedLessons,
      totalSteps,
      completedSteps,
      overallStepsPct,
      overallQuizAccuracy,
      spellingAccuracy,
      grammarAccuracy,
      dialogueAccuracy,
      tracks,
    };
  }, [lectures, progress.completedUnitIds, progress.completedStepsByLecture, progress.moduleScores]);

  const currentLessonStepsDone = useMemo(() => {
    if (progress.completedUnitIds.includes(recommendedLecture.id)) {
      return [0, 1, 2, 3, 4];
    }
    return progress.completedStepsByLecture?.[recommendedLecture.id] || [];
  }, [progress.completedUnitIds, progress.completedStepsByLecture, recommendedLecture.id]);

  const nextActiveStepIndex = useMemo((): ModuleStepIndex => {
    for (let s = 0; s <= 4; s++) {
      if (!currentLessonStepsDone.includes(s)) {
        return s as ModuleStepIndex;
      }
    }
    return 0;
  }, [currentLessonStepsDone]);

  const recommendedScoreRecord = progress.moduleScores?.[recommendedLecture.id];
  const recommendedLessonAccuracy = useMemo(() => {
    if (!recommendedScoreRecord) return null;
    const c =
      (recommendedScoreRecord.spellingScore || 0) +
      (recommendedScoreRecord.grammarScore || 0) +
      (recommendedScoreRecord.dialogueScore || 0);
    const t =
      (recommendedScoreRecord.spellingTotal || 0) +
      (recommendedScoreRecord.grammarTotal || 0) +
      (recommendedScoreRecord.dialogueTotal || 0);
    return t > 0 ? Math.round((c / t) * 100) : null;
  }, [recommendedScoreRecord]);

  return (
    <section
      aria-label="Lesson Progress and Track Quiz Accuracy"
      className="rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] p-4 sm:p-5 space-y-4 shadow-[0_1px_2px_rgba(28,25,23,0.03)]"
    >
      {/* Top Row: Eyebrow + Overall Step & Quiz Accuracy Summary + Resume CTA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-3.5 border-b border-[#EFEAE0] dark:border-[#2E2924]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#9E2A2B] dark:text-[#F87171] inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>LESSON PROGRESS</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#F2EFE9] dark:bg-[#26221E] text-[0.6875rem] font-bold text-[#1C1917] dark:text-[#F5F2EB]">
              {analytics.completedSteps}/{analytics.totalSteps} Steps ({analytics.overallStepsPct}%)
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[0.6875rem] font-bold inline-flex items-center gap-1 ${
                analytics.overallQuizAccuracy !== null
                  ? 'bg-[#DCECE2] dark:bg-emerald-950/60 text-[#1F5C3D] dark:text-emerald-300'
                  : 'bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-[#78716C] dark:text-[#A8A29E]'
              }`}
            >
              <Target className="w-3 h-3" />
              <span>
                Quiz Accuracy:{' '}
                {analytics.overallQuizAccuracy !== null
                  ? `${analytics.overallQuizAccuracy}%`
                  : 'No quizzes yet'}
              </span>
            </span>
          </div>

          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
            {analytics.completedLessons} of {analytics.totalLessons} Core Lessons · Step &amp; Quiz Mastery
          </h2>

          {/* Module Quiz Accuracy Breakdown Pills */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6E685F] dark:text-[#A8A29E]">
            <span>
              Spelling &amp; Dictation:{' '}
              <strong className="font-ipa text-[#1C1917] dark:text-[#F5F2EB]">
                {analytics.spellingAccuracy !== null ? `${analytics.spellingAccuracy}%` : '—'}
              </strong>
            </span>
            <span>·</span>
            <span>
              Grammar Syntax:{' '}
              <strong className="font-ipa text-[#1C1917] dark:text-[#F5F2EB]">
                {analytics.grammarAccuracy !== null ? `${analytics.grammarAccuracy}%` : '—'}
              </strong>
            </span>
            <span>·</span>
            <span>
              Dialogue Quiz:{' '}
              <strong className="font-ipa text-[#1C1917] dark:text-[#F5F2EB]">
                {analytics.dialogueAccuracy !== null ? `${analytics.dialogueAccuracy}%` : '—'}
              </strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
          <button
            type="button"
            onClick={() => {
              speechService.triggerHaptic('light');
              onOpenLecture(recommendedLecture.id, nextActiveStepIndex);
            }}
            className="px-4 py-2 rounded-xl bg-[#9E2A2B] hover:bg-[#872223] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>
              Continue L{String(recommendedLecture.lectureNumber).padStart(2, '0')} · Step{' '}
              {String(nextActiveStepIndex + 1).padStart(2, '0')}
            </span>
          </button>
        </div>
      </div>

      {/* Current Active Lesson: 5-Step Individual Completion Strip */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-md bg-[#9E2A2B]/10 text-[#9E2A2B] dark:text-[#F87171] font-ipa text-[0.6875rem] font-bold shrink-0">
              ACTIVE LESSON {String(recommendedLecture.lectureNumber).padStart(2, '0')} (
              {recommendedLecture.level})
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB] truncate">
              {recommendedLecture.title}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[0.6875rem] font-ipa shrink-0">
            <span className="font-bold text-[#1F5C3D] dark:text-emerald-400">
              {currentLessonStepsDone.length}/5 Steps Done
            </span>
            {recommendedLessonAccuracy !== null && (
              <span className="px-2 py-0.5 rounded-md bg-[#DCECE2] dark:bg-emerald-950/60 text-[#1F5C3D] dark:text-emerald-300 font-bold">
                Quiz: {recommendedLessonAccuracy}%
              </span>
            )}
          </div>
        </div>

        {/* 5 Interactive Step Pills */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {STEP_DEFINITIONS.map((st) => {
            const isStepDone = currentLessonStepsDone.includes(st.step);
            const isCurrentNext = !isStepDone && st.step === nextActiveStepIndex;

            return (
              <button
                key={st.step}
                type="button"
                onClick={() => {
                  speechService.triggerHaptic('light');
                  onOpenLecture(recommendedLecture.id, st.step);
                }}
                title={`Open Lesson ${recommendedLecture.lectureNumber} · Step ${st.number}: ${st.label}`}
                className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between gap-1 ${
                  isStepDone
                    ? 'bg-[#DCECE2]/65 dark:bg-emerald-950/40 border-[#2E6F4E]/40 text-[#1F5C3D] dark:text-emerald-300'
                    : isCurrentNext
                    ? 'bg-white dark:bg-[#1F1C18] border-[#9E2A2B] text-[#9E2A2B] dark:text-[#F87171] shadow-xs'
                    : 'bg-white/70 dark:bg-[#1A1714] border-[#E6E0D4] dark:border-[#2E2924] text-[#78716C] dark:text-[#A8A29E] hover:border-[#9E2A2B]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="font-ipa text-[0.625rem] font-bold">{st.number}</span>
                  {isStepDone ? (
                    <CheckCircle2 className="w-3 h-3 text-[#1F5C3D] dark:text-emerald-400 shrink-0" />
                  ) : isCurrentNext ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9E2A2B] animate-pulse shrink-0" />
                  ) : null}
                </div>
                <div className="text-[0.65rem] sm:text-xs font-bold leading-tight truncate">
                  <span className="sm:hidden">{st.shortLabel}</span>
                  <span className="hidden sm:inline">{st.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Course Tracks Grid: Individual Step Completion + Track Quiz Accuracy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
        {analytics.tracks.map((trk) => {
          const isSelectedFilter = activeLevelFilter === trk.level;
          return (
            <div
              key={trk.level}
              onClick={() => {
                if (onSelectLevelFilter) {
                  onSelectLevelFilter(
                    activeLevelFilter === trk.level ? 'ALL' : trk.level
                  );
                }
                if (trk.isTrackComplete) {
                  speechService.playCelebrationChime('milestone');
                } else {
                  speechService.triggerHaptic('light');
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (onSelectLevelFilter) {
                    onSelectLevelFilter(
                      activeLevelFilter === trk.level ? 'ALL' : trk.level
                    );
                  }
                }
              }}
              className={`p-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border transition-all cursor-pointer space-y-2.5 ${
                isSelectedFilter
                  ? trk.borderActiveClass
                  : 'border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#9E2A2B]/50'
              }`}
            >
              {/* Track Header: Pill + Lessons Count & Quiz Accuracy Badge */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold ${trk.pillClass}`}
                >
                  {trk.title}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md font-ipa text-[0.6875rem] font-bold ${
                    trk.trackQuizAccuracy !== null
                      ? trk.trackQuizAccuracy >= 80
                        ? 'bg-[#DCECE2] dark:bg-emerald-950/60 text-[#1F5C3D] dark:text-emerald-300'
                        : 'bg-[#FEF3C7] dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300'
                      : 'bg-[#EFECE4] dark:bg-[#26221E] text-[#78716C] dark:text-[#A8A29E]'
                  }`}
                >
                  {trk.trackQuizAccuracy !== null
                    ? `${trk.trackQuizAccuracy}% Quiz`
                    : 'Quiz —'}
                </span>
              </div>

              {/* Step & Lesson Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[0.6875rem]">
                  <span className="font-semibold text-[#57534E] dark:text-[#A8A29E]">
                    {trk.doneLessons}/{trk.totalLessons} Lessons · {trk.doneSteps}/{trk.totalSteps} Steps
                  </span>
                  <span className="font-ipa font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                    {trk.stepPct}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#EAE5DC] dark:bg-[#26221E] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${trk.barColor}`}
                    style={{ width: `${Math.max(5, trk.stepPct)}%` }}
                  />
                </div>
              </div>

              {/* 4 Mini Lesson Step Capsules inside each Track */}
              {!compact && (
                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  {trk.unitStepDetails.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speechService.triggerHaptic('light');
                        onOpenLecture(
                          u.id,
                          Math.min(4, u.stepsCount) as ModuleStepIndex
                        );
                      }}
                      title={`Lesson ${String(u.lectureNumber).padStart(2, '0')}: ${
                        u.stepsCount
                      }/5 steps${u.unitAccuracy !== null ? ` · ${u.unitAccuracy}% quiz` : ''}`}
                      className={`px-1.5 py-1 rounded-lg border text-center transition-colors ${
                        u.isUnitDone
                          ? 'bg-[#DCECE2]/70 dark:bg-emerald-950/40 border-[#2E6F4E]/40 text-[#1F5C3D] dark:text-emerald-300'
                          : u.stepsCount > 0
                          ? 'bg-white dark:bg-[#1F1C18] border-[#9E2A2B]/40 text-[#9E2A2B] dark:text-[#F87171]'
                          : 'bg-white/60 dark:bg-[#1A1714] border-[#E6E0D4] dark:border-[#2E2924] text-[#78716C] dark:text-[#A8A29E]'
                      }`}
                    >
                      <div className="font-ipa text-[0.625rem] font-bold leading-none">
                        L{String(u.lectureNumber).padStart(2, '0')}
                      </div>
                      <div className="font-ipa text-[0.5625rem] mt-0.5 opacity-85">
                        {u.stepsCount}/5
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Bottom Status / Breakdown Row */}
              <div className="flex items-center justify-between text-[0.65rem] text-[#78716C] dark:text-[#A8A29E] pt-0.5">
                {trk.isTrackComplete ? (
                  <span className="font-bold text-[#1F5C3D] dark:text-emerald-400 inline-flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    <span>Track Complete · Tap to celebrate!</span>
                  </span>
                ) : trk.trackQuizAccuracy !== null ? (
                  <span>
                    Spell {trk.trackSpellingAccuracy ?? '—'}% · Gram{' '}
                    {trk.trackGrammarAccuracy ?? '—'}%
                  </span>
                ) : (
                  <span>{trk.subtitle}</span>
                )}
                {trk.isTrackComplete && (
                  <Sparkles className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
