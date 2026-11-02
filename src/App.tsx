import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  BookMarked,
  BarChart3,
  Settings,
  Wand2,
  ArrowRight,
  CheckCircle2,
  Volume2,
  Download,
  Smartphone,
  WifiOff,
  Compass,
  Globe,
  Search,
  LayoutGrid,
  ListChecks,
  Layers,
  Flame,
  Award,
  Info,
  AlertCircle,
  Sparkles,
  Zap,
  GitBranch,
  Printer,
  Headphones,
  Trophy,
  ShieldCheck,
  X,
} from 'lucide-react';
import { CORE_SYLLABUS } from './data/syllabus';
import { enrichSyllabusWithEnhancements } from './data/lectureEnhancements';
import { getMassiveLexicon } from './data/massiveLexicon';
import {
  CEFRLevel,
  CustomVocabItem,
  ExamSimulationRecord,
  LanguageMode,
  LectureUnit,
  MistakeItem,
  ModuleScoreRecord,
  UserProgressState,
} from './types/curriculum';
import {
  loadUserProgress,
  saveUserProgress,
  recordLectureCompletion,
  recordModuleStepCompleted,
  updateWordSRS,
  addMistakeToNotebook,
  recordMistakePracticeResult,
  removeMistakeFromNotebook,
  updateMistakeNote,
  toggleSavedWord,
  toggleMasteredWord,
  getUnifiedMasteredWordsCount,
  updateLectureScratchpadNote,
  recordExamSimulationResult,
  addCustomLecture,
  completeOnboarding,
  flushPendingSyncQueue,
  recordDailyChallengeCompletion,
  addCustomWord,
  removeCustomWord,
  recordSprintScore,
  recordDetectiveSolved,
  recordRolePlayCompleted,
} from './services/storage';
import { speechService } from './services/speech';
import { usePWAInstall, useOnlineStatus } from './hooks/usePWA';
import { LecturePlayer, ModuleStep } from './components/LecturePlayer';
import { DictionaryView } from './components/DictionaryView';
import { AILessonModal } from './components/AILessonModal';
import { ProgressSettingsView } from './components/ProgressSettingsView';
import { AboutView } from './components/AboutView';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { PracticeArenaView, ArenaToolTab } from './components/PracticeArenaView';

type NavTab = 'lectures' | 'dictionary' | 'arena' | 'progress' | 'settings' | 'about';
type SyllabusDisplayMode = 'tracks' | 'grid' | 'table';
type StatusFilter = 'ALL' | 'TODO' | 'COMPLETED';

export default function App() {
  const [progress, setProgress] = useState<UserProgressState>(() => loadUserProgress());
  const [activeTab, setActiveTab] = useState<NavTab>('lectures');
  const [activeLectureId, setActiveLectureId] = useState<string | null>(null);
  const [initialModuleStep, setInitialModuleStep] = useState<ModuleStep>(0);
  const [dictionaryLectureFilter, setDictionaryLectureFilter] = useState<number | null>(null);

  // Managed Lecture Syllabus Controls
  const [levelFilter, setLevelFilter] = useState<'ALL' | CEFRLevel | 'CUSTOM'>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [lectureSearch, setLectureSearch] = useState('');
  const [syllabusDisplayMode, setSyllabusDisplayMode] = useState<SyllabusDisplayMode>('tracks');

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [showInstallHelpModal, setShowInstallHelpModal] = useState(false);
  const [isDailyChallengeOpen, setIsDailyChallengeOpen] = useState(false);
  const [hasAutoCheckedDailyChallenge, setHasAutoCheckedDailyChallenge] = useState(false);
  const [initialArenaTool, setInitialArenaTool] = useState<ArenaToolTab>('detective');
  const [progressSubViewTarget, setProgressSubViewTarget] = useState<'overview' | 'achievements'>(
    'overview'
  );
  const [liveAchievementToast, setLiveAchievementToast] = useState<{
    id: string;
    title: string;
    nepaliTitle: string;
    desc: string;
  } | null>(null);
  const hasSeededInitialBadgesRef = useRef(false);

  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const languageMode: LanguageMode = progress.languageMode || 'english-meanings';
  const isFullNepali = languageMode === 'full-nepali';

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (progress.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [progress.darkMode]);

  // 24-Hour Daily Challenge Pop-Up Auto-Trigger on the Home Page
  useEffect(() => {
    if (hasAutoCheckedDailyChallenge) return;
    if (activeTab === 'lectures' && !activeLectureId) {
      const last = progress.lastDailyChallengeAt
        ? Date.parse(progress.lastDailyChallengeAt)
        : 0;
      const isDue = !last || Number.isNaN(last) || Date.now() - last >= 24 * 60 * 60 * 1000;
      setHasAutoCheckedDailyChallenge(true);
      if (isDue) {
        const timer = window.setTimeout(() => {
          setIsDailyChallengeOpen(true);
        }, 650);
        return () => window.clearTimeout(timer);
      }
    }
  }, [activeTab, activeLectureId, progress.lastDailyChallengeAt, hasAutoCheckedDailyChallenge]);

  // Sync offline queue when back online
  useEffect(() => {
    if (isOnline && progress.pendingSyncQueue.length > 0) {
      void flushPendingSyncQueue(progress).then((updated) => {
        setProgress(updated);
      });
    }
  }, [isOnline]);

  const allLectures: LectureUnit[] = useMemo(() => {
    return [...CORE_SYLLABUS, ...enrichSyllabusWithEnhancements(progress.customLectures)];
  }, [progress.customLectures]);

  const massiveLexicon = useMemo(() => {
    return getMassiveLexicon(allLectures);
  }, [allLectures]);

  const sectionWordCountMap = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const item of massiveLexicon) {
      counts[item.lectureNumber] = (counts[item.lectureNumber] || 0) + 1;
    }
    return counts;
  }, [massiveLexicon]);

  // Overall Course Progress Metrics
  const courseStats = useMemo(() => {
    const totalUnits = allLectures.length;
    const completedCount = allLectures.filter((l) =>
      progress.completedUnitIds.includes(l.id)
    ).length;
    const overallPercent = totalUnits > 0 ? Math.round((completedCount / totalUnits) * 100) : 0;

    const b1Lectures = allLectures.filter((l) => l.level === 'B1');
    const b1Done = b1Lectures.filter((l) => progress.completedUnitIds.includes(l.id)).length;

    const b2Lectures = allLectures.filter((l) => l.level === 'B2');
    const b2Done = b2Lectures.filter((l) => progress.completedUnitIds.includes(l.id)).length;

    const c1Lectures = allLectures.filter((l) => l.level === 'C1');
    const c1Done = c1Lectures.filter((l) => progress.completedUnitIds.includes(l.id)).length;

    const scoreRecords = Object.values(progress.moduleScores) as ModuleScoreRecord[];
    const totalCorrect = scoreRecords.reduce(
      (acc, r) => acc + r.spellingScore + r.grammarScore + (r.dialogueScore || 0),
      0
    );
    const totalQuestions = scoreRecords.reduce(
      (acc, r) => acc + r.spellingTotal + r.grammarTotal + (r.dialogueTotal || 0),
      0
    );
    const avgQuizAccuracy =
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null;

    return {
      totalUnits,
      completedCount,
      overallPercent,
      b1Total: b1Lectures.length,
      b1Done,
      b2Total: b2Lectures.length,
      b2Done,
      c1Total: c1Lectures.length,
      c1Done,
      avgQuizAccuracy,
    };
  }, [allLectures, progress.completedUnitIds, progress.moduleScores]);

  const activeLecture = useMemo(() => {
    if (!activeLectureId) return null;
    return allLectures.find((l) => l.id === activeLectureId) || null;
  }, [allLectures, activeLectureId]);

  const filteredLectures = useMemo(() => {
    const q = lectureSearch.toLowerCase().trim();
    return allLectures.filter((l) => {
      if (levelFilter === 'CUSTOM' && !l.isCustomAI) return false;
      if ((levelFilter === 'B1' || levelFilter === 'B2' || levelFilter === 'C1') && l.level !== levelFilter) {
        return false;
      }
      const isDone = progress.completedUnitIds.includes(l.id);
      if (statusFilter === 'TODO' && isDone) return false;
      if (statusFilter === 'COMPLETED' && !isDone) return false;

      if (!q) return true;
      const inWords = l.moduleA_vocabulary.some(
        (v) => v.word.toLowerCase().includes(q) || v.nepaliMeaning.toLowerCase().includes(q)
      );
      return (
        l.title.toLowerCase().includes(q) ||
        l.subtitle.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.moduleC_spelling.ruleTitle.toLowerCase().includes(q) ||
        l.moduleD_grammar.topicTitle.toLowerCase().includes(q) ||
        inWords
      );
    });
  }, [allLectures, levelFilter, statusFilter, lectureSearch, progress.completedUnitIds]);

  const recommendedLecture = useMemo(() => {
    const matchingUnfinished = allLectures.find(
      (l) => l.level === progress.selectedLevel && !progress.completedUnitIds.includes(l.id)
    );
    if (matchingUnfinished) return matchingUnfinished;
    const anyUnfinished = allLectures.find((l) => !progress.completedUnitIds.includes(l.id));
    return anyUnfinished || allLectures[0];
  }, [allLectures, progress.selectedLevel, progress.completedUnitIds]);

  const handleToggleSaveWord = (wordId: string) => {
    setProgress((prev) => toggleSavedWord(prev, wordId));
  };

  const handleToggleMasteredWord = (wordId: string) => {
    setProgress((prev) => toggleMasteredWord(prev, wordId));
  };

  const handleUpdateLectureNote = (lectureId: string, noteText: string) => {
    setProgress((prev) => updateLectureScratchpadNote(prev, lectureId, noteText));
  };

  const handleRecordExamResult = (examRecord: ExamSimulationRecord) => {
    setProgress((prev) => recordExamSimulationResult(prev, examRecord));
  };

  const handleCompleteLecture = (scoreRecord: ModuleScoreRecord) => {
    setProgress((prev) => recordLectureCompletion(prev, scoreRecord));
  };

  const handleCompleteStep = (lectureId: string, stepIndex: number) => {
    setProgress((prev) => recordModuleStepCompleted(prev, lectureId, stepIndex));
  };

  const handleUpdateWordSRS = (wordId: string, wasCorrect: boolean) => {
    setProgress((prev) => updateWordSRS(prev, wordId, wasCorrect));
  };

  const handleRecordMistake = (
    mistake: Omit<MistakeItem, 'id' | 'consecutiveCorrect' | 'createdAt'>
  ) => {
    setProgress((prev) => addMistakeToNotebook(prev, mistake));
  };

  const handlePracticeMistake = (mistakeId: string, wasCorrect: boolean) => {
    setProgress((prev) => recordMistakePracticeResult(prev, mistakeId, wasCorrect));
  };

  const handleRemoveMistake = (mistakeId: string) => {
    setProgress((prev) => removeMistakeFromNotebook(prev, mistakeId));
  };

  const handleUpdateMistakeNote = (mistakeId: string, userNote: string) => {
    setProgress((prev) => updateMistakeNote(prev, mistakeId, userNote));
  };

  const handleLectureGenerated = (newLecture: LectureUnit) => {
    setProgress((prev) => addCustomLecture(prev, newLecture));
    setInitialModuleStep(0);
    setActiveLectureId(newLecture.id);
    setActiveTab('lectures');
  };

  const handleSelectOnboardingLevel = (level: CEFRLevel) => {
    setProgress((prev) => completeOnboarding(prev, level, prev.dailyGoalMinutes));
    setLevelFilter(level);
  };

  const handleUpdateLevel = (level: CEFRLevel) => {
    setProgress((prev) => {
      const next = { ...prev, selectedLevel: level };
      saveUserProgress(next);
      return next;
    });
  };

  const handleUpdateSpeechRate = (rate: number) => {
    setProgress((prev) => {
      const next = { ...prev, preferredSpeechRate: rate };
      saveUserProgress(next);
      return next;
    });
  };

  const handleUpdateLanguageMode = (newMode: LanguageMode) => {
    setProgress((prev) => {
      const next = { ...prev, languageMode: newMode };
      saveUserProgress(next);
      return next;
    });
  };

  const handleUpdateDailyGoal = (minutes: 5 | 10 | 15 | 30) => {
    setProgress((prev) => {
      const next = { ...prev, dailyGoalMinutes: minutes };
      saveUserProgress(next);
      return next;
    });
  };

  const handleImportProgress = (imported: UserProgressState) => {
    saveUserProgress(imported);
    setProgress(imported);
  };

  const handleToggleDarkMode = () => {
    setProgress((prev) => {
      const next = { ...prev, darkMode: !prev.darkMode };
      saveUserProgress(next);
      return next;
    });
  };

  const handleManualSync = async () => {
    const updated = await flushPendingSyncQueue(progress);
    setProgress(updated);
  };

  const handleCompleteDailyChallenge = (correctCount: number) => {
    setProgress((prev) => recordDailyChallengeCompletion(prev, correctCount));
  };

  const handleAddCustomWord = (item: Omit<CustomVocabItem, 'id' | 'createdAt'>) => {
    setProgress((prev) => addCustomWord(prev, item));
  };

  const handleRemoveCustomWord = (wordId: string) => {
    setProgress((prev) => removeCustomWord(prev, wordId));
  };

  const handleRecordSprintScore = (score: number) => {
    setProgress((prev) => recordSprintScore(prev, score));
  };

  const handleRecordDetectiveSolved = (passageId: string) => {
    setProgress((prev) => recordDetectiveSolved(prev, passageId));
  };

  const handleRecordRolePlayCompleted = (scenarioId: string) => {
    setProgress((prev) => recordRolePlayCompleted(prev, scenarioId));
  };

  const unifiedMasteredWordsCount = useMemo(
    () => getUnifiedMasteredWordsCount(progress),
    [progress]
  );

  // Live Achievement Unlock Watcher & Toast Trigger
  useEffect(() => {
    const completedCount = progress.completedUnitIds.length;
    const streakDays = progress.currentStreakDays || 0;
    const dailyChallenges = progress.dailyChallengeTotalCompleted || 0;
    const detectiveSolved = progress.detectiveSolvedIds?.length || 0;
    const sprintBest = progress.sprintHighScore || 0;
    const rolePlaysDone = progress.rolePlayCompletedIds?.length || 0;
    const customDeckCount = progress.customWords?.length || 0;

    const evaluatedBadges = [
      {
        id: 'first-lecture-finished',
        title: 'First Lecture Finished',
        nepaliTitle: 'पहिलो पाठ सम्पन्न',
        desc: 'You completed your first sequential 5-module BhashaSetu lecture!',
        unlocked: completedCount >= 1,
      },
      {
        id: 'ten-day-streak',
        title: '10-Day Streak',
        nepaliTitle: '१०-दिने निरन्तर अध्ययन',
        desc: '10 consecutive days of English phonics, spelling, and syntax study!',
        unlocked: streakDays >= 10,
      },
      {
        id: 'fifty-words-mastered',
        title: '50 Words Mastered',
        nepaliTitle: '५० शब्दमा पूर्ण दक्षता',
        desc: 'You mastered 50 silent-letter and high-frequency English words!',
        unlocked: unifiedMasteredWordsCount >= 50,
      },
      {
        id: 'three-day-streak',
        title: '3-Day Streak Builder',
        nepaliTitle: '३-दिने अध्ययन बानी',
        desc: '3 consecutive days of active study momentum unlocked!',
        unlocked: streakDays >= 3,
      },
      {
        id: 'twenty-five-words-collector',
        title: '25 Words Collector',
        nepaliTitle: '२५ शब्द संग्रहकर्ता',
        desc: 'You mastered or bookmarked 25 core English vocabulary words!',
        unlocked: unifiedMasteredWordsCount >= 25,
      },
      {
        id: 'b1-foundation-graduate',
        title: 'B1 Foundation Graduate',
        nepaliTitle: 'B1 आधारभूत तह पूरा',
        desc: 'Completed all 4 lectures in Track 1 · B1 Lower-Intermediate!',
        unlocked: courseStats.b1Done >= courseStats.b1Total && courseStats.b1Total > 0,
      },
      {
        id: 'b2-workplace-graduate',
        title: 'B2 Workplace Graduate',
        nepaliTitle: 'B2 कार्यस्थल तह पूरा',
        desc: 'Completed all 4 lectures in Track 2 · B2 Upper-Intermediate!',
        unlocked: courseStats.b2Done >= courseStats.b2Total && courseStats.b2Total > 0,
      },
      {
        id: 'c1-master-linguist',
        title: 'C1 Master Linguist',
        nepaliTitle: 'C1 उच्च तह विशेषज्ञ',
        desc: 'Completed all 12 core curriculum lectures from B1 to C1!',
        unlocked: completedCount >= 12,
      },
      {
        id: 'daily-challenge-champion',
        title: 'Daily Challenge Champion',
        nepaliTitle: 'दैनिक चुनौती विजेता',
        desc: 'Completed the 24-Hour 3-Question Daily Challenge!',
        unlocked: dailyChallenges >= 1,
      },
      {
        id: 'silent-letter-detective',
        title: 'Silent-Letter Detective',
        nepaliTitle: 'मौन-अक्षर जासुस',
        desc: 'Spotted all hidden silent-letter words in a Detective passage!',
        unlocked: detectiveSolved >= 1,
      },
      {
        id: 'phonics-sprint-speedster',
        title: '60s Phonics Speedster',
        nepaliTitle: '६०-सेकेन्ड स्पेलिङ च्याम्पियन',
        desc: 'Scored 40+ points in the 60-Second Spelling Sprint!',
        unlocked: sprintBest >= 40,
      },
      {
        id: 'roleplay-deck-architect',
        title: 'Fluency & Deck Architect',
        nepaliTitle: 'संवाद र शब्दकोश निर्माता',
        desc: 'Completed a Real-World Role-Play simulation or custom deck milestone!',
        unlocked:
          rolePlaysDone >= 1 ||
          customDeckCount >= 3 ||
          (courseStats.avgQuizAccuracy !== null && courseStats.avgQuizAccuracy >= 85),
      },
    ];

    const currentlyUnlockedIds = evaluatedBadges.filter((b) => b.unlocked).map((b) => b.id);
    const knownUnlockedIds = progress.unlockedBadgeIds || [];

    if (!hasSeededInitialBadgesRef.current) {
      hasSeededInitialBadgesRef.current = true;
      if (currentlyUnlockedIds.length > knownUnlockedIds.length) {
        const synced = Array.from(new Set([...knownUnlockedIds, ...currentlyUnlockedIds]));
        setProgress((prev) => {
          const next = { ...prev, unlockedBadgeIds: synced };
          saveUserProgress(next);
          return next;
        });
      }
      return;
    }

    const newlyUnlocked = evaluatedBadges.find(
      (b) => b.unlocked && !knownUnlockedIds.includes(b.id)
    );

    if (newlyUnlocked) {
      speechService.playCelebrationChime();
      setLiveAchievementToast({
        id: newlyUnlocked.id,
        title: newlyUnlocked.title,
        nepaliTitle: newlyUnlocked.nepaliTitle,
        desc: newlyUnlocked.desc,
      });

      const updatedIds = Array.from(new Set([...knownUnlockedIds, ...currentlyUnlockedIds]));
      setProgress((prev) => {
        const next = { ...prev, unlockedBadgeIds: updatedIds };
        saveUserProgress(next);
        return next;
      });
    }
  }, [
    progress.completedUnitIds.length,
    progress.currentStreakDays,
    progress.dailyChallengeTotalCompleted,
    progress.detectiveSolvedIds,
    progress.sprintHighScore,
    progress.rolePlayCompletedIds,
    progress.customWords,
    progress.unlockedBadgeIds,
    unifiedMasteredWordsCount,
    courseStats,
  ]);

  const navigateTab = (tab: NavTab) => {
    setActiveLectureId(null);
    if (tab === 'dictionary') {
      setDictionaryLectureFilter(null);
    }
    if (tab === 'progress') {
      setProgressSubViewTarget('overview');
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProgressSubView = (subView: 'overview' | 'achievements') => {
    setActiveLectureId(null);
    setProgressSubViewTarget(subView);
    setActiveTab('progress');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openArenaTool = (tool: ArenaToolTab) => {
    setInitialArenaTool(tool);
    setActiveLectureId(null);
    setActiveTab('arena');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLecture = (id: string, step: ModuleStep = 0) => {
    setInitialModuleStep(step);
    setActiveLectureId(id);
    setActiveTab('lectures');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openSectionInDictionary = (lectureNumber: number) => {
    setDictionaryLectureFilter(lectureNumber);
    setActiveLectureId(null);
    setActiveTab('dictionary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderLectureCard = (lecture: LectureUnit) => {
    const isDone = progress.completedUnitIds.includes(lecture.id);
    const score = progress.moduleScores[lecture.id];
    const previewWords = lecture.moduleA_vocabulary.slice(0, 4);

    return (
      <article
        key={lecture.id}
        className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-[#B91C1C]/60 transition-colors"
      >
        <div>
          {/* Clean Top Metadata Line (No word count heading after lecture number) */}
          <div className="flex items-center justify-between gap-2 text-xs text-[#57534E] dark:text-[#A8A29E] mb-2">
            <div>
              <span className="font-ipa font-semibold text-[#B91C1C] dark:text-[#F87171]">
                Lecture {String(lecture.lectureNumber).padStart(2, '0')}
              </span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>Level {lecture.level}</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>{lecture.category}</span>
            </div>
            {isDone ? (
              <span className="text-[#15803D] dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed</span>
              </span>
            ) : (
              <span className="font-ipa text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                {lecture.estimatedMinutes} min
              </span>
            )}
          </div>

          <h3 className="text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
            {lecture.title}
          </h3>
          {isFullNepali && (
            <p className="font-nepali text-sm font-medium text-[#57534E] dark:text-[#A8A29E] mt-0.5">
              {lecture.nepaliTitle}
            </p>
          )}
          <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-1.5 mb-4 line-clamp-2">
            {lecture.subtitle}
          </p>

          {/* Concise Lecture Focus Summary Box */}
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-2 mb-4 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB] mr-1">
                Focus Words:
              </span>
              {previewWords.map((v) => (
                <span
                  key={v.id}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] font-medium text-[#1C1917] dark:text-[#F5F2EB]"
                >
                  {v.segments?.map((s, sIdx) =>
                    s.silent ? (
                      <span
                        key={sIdx}
                        className="text-[#B91C1C] dark:text-[#F87171] underline decoration-dotted"
                      >
                        {s.text}
                      </span>
                    ) : (
                      <span key={sIdx}>{s.text}</span>
                    )
                  )}
                </span>
              ))}
              {lecture.moduleA_vocabulary.length > 4 && (
                <span className="text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                  +{lecture.moduleA_vocabulary.length - 4} more
                </span>
              )}
            </div>

            <div className="truncate">
              <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Spelling:{' '}
              </span>
              <span className="text-[#57534E] dark:text-[#A8A29E]">
                {lecture.moduleC_spelling.ruleTitle}
              </span>
            </div>

            <div className="truncate">
              <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Grammar:{' '}
              </span>
              <span className="text-[#57534E] dark:text-[#A8A29E]">
                {lecture.moduleD_grammar.topicTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Clean Footer Action Row */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E7E0D6] dark:border-[#2E2924]">
          <div className="text-xs text-[#57534E] dark:text-[#A8A29E]">
            {score ? (
              <span className="font-ipa font-semibold text-[#15803D] dark:text-emerald-400">
                Quiz Accuracy:{' '}
                {Math.round(
                  ((score.spellingScore + score.grammarScore + (score.dialogueScore || 0)) /
                    Math.max(
                      1,
                      score.spellingTotal + score.grammarTotal + (score.dialogueTotal || 0)
                    )) *
                    100
                )}
                %
              </span>
            ) : (
              <span>5 Modules · {lecture.estimatedMinutes} min</span>
            )}
          </div>
          <button
            onClick={() => openLecture(lecture.id, 0)}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold hover:bg-[#B91C1C] dark:hover:bg-[#B91C1C] dark:hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <span>{isDone ? 'Review Lecture' : 'Start Lecture'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] dark:bg-[#141210] text-[#1C1917] dark:text-[#F5F2EB]">
      {/* =================================================================== */}
      {/* TOP BAR CONTRACT: [1-line Brand] — [5 Nav Links] — [1 Primary CTA]  */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-30 h-14 bg-[#FAF7F2]/95 dark:bg-[#141210]/95 backdrop-blur-md border-b border-[#E7E0D6] dark:border-[#2E2924] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            navigateTab('lectures');
          }}
          className="font-serif-display text-xl font-bold tracking-tight text-[#1C1917] dark:text-[#F5F2EB] whitespace-nowrap shrink-0"
        >
          BhashaSetu
        </a>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#57534E] dark:text-[#A8A29E]">
          <button
            onClick={() => navigateTab('lectures')}
            className={`hover:text-[#1C1917] dark:hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'lectures'
                ? 'text-[#B91C1C] dark:text-[#F87171] underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            Lectures
          </button>
          <button
            onClick={() => navigateTab('dictionary')}
            className={`hover:text-[#1C1917] dark:hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'dictionary'
                ? 'text-[#B91C1C] dark:text-[#F87171] underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            Dictionary (10k+)
          </button>
          <button
            onClick={() => navigateTab('arena')}
            className={`hover:text-[#1C1917] dark:hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 inline-flex items-center gap-1.5 ${
              activeTab === 'arena'
                ? 'text-[#B91C1C] dark:text-[#F87171] underline underline-offset-8 decoration-2 font-semibold'
                : ''
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>Practice Hub</span>
          </button>
          <button
            onClick={() => navigateTab('progress')}
            className={`hover:text-[#1C1917] dark:hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'progress'
                ? 'text-[#B91C1C] dark:text-[#F87171] underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            Progress
          </button>
          <button
            onClick={() => navigateTab('settings')}
            className={`hover:text-[#1C1917] dark:hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'settings'
                ? 'text-[#B91C1C] dark:text-[#F87171] underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => navigateTab('about')}
            className={`hover:text-[#1C1917] dark:hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'about'
                ? 'text-[#B91C1C] dark:text-[#F87171] underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            About
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="min-h-[38px] px-4 py-2 text-xs font-semibold text-white bg-[#B91C1C] rounded-lg hover:bg-[#991B1B] transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Create AI Lecture</span>
          </button>
        </div>
      </header>

      {/* Celebratory Live Achievement Unlock Toast Banner */}
      {liveAchievementToast && (
        <div className="sticky top-14 z-40 bg-emerald-900 text-white border-b border-emerald-700 px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#1C1917] flex items-center justify-center shrink-0 shadow-xs">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-ipa uppercase tracking-wider text-amber-300 font-semibold">
                  Achievement Unlocked! · {liveAchievementToast.nepaliTitle}
                </div>
                <div className="text-sm sm:text-base font-bold">
                  {liveAchievementToast.title} —{' '}
                  <span className="font-normal text-emerald-100 text-xs sm:text-sm">
                    {liveAchievementToast.desc}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setLiveAchievementToast(null);
                  openProgressSubView('achievements');
                }}
                className="min-h-[34px] px-3.5 py-1.5 rounded-lg bg-amber-400 text-[#1C1917] text-xs font-semibold hover:bg-amber-300 inline-flex items-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>View Badge in Trophy Case</span>
              </button>
              <button
                type="button"
                onClick={() => setLiveAchievementToast(null)}
                aria-label="Dismiss achievement notification"
                className="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Mode Connectivity Indicator */}
      {!isOnline && (
        <div className="bg-amber-100 dark:bg-amber-950/80 border-b border-amber-300 dark:border-amber-800 px-4 py-2 text-xs text-amber-950 dark:text-amber-200 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 shrink-0 text-[#D97706]" />
          <span>
            Offline Mode Active — All 12 core lectures, 10,400+ dictionary words, and audio pronunciation work offline.
          </span>
        </div>
      )}

      {/* =================================================================== */}
      {/* MAIN CONTENT WORKSPACE                                              */}
      {/* =================================================================== */}
      <main className="flex-1">
        {activeTab === 'lectures' && activeLecture ? (
          <LecturePlayer
            lecture={activeLecture}
            allLectures={allLectures}
            savedWordIds={progress.savedWordIds}
            masteredWordIds={progress.masteredWordIds || []}
            lectureNote={progress.lectureNotes?.[activeLecture.id] || ''}
            completedUnitIds={progress.completedUnitIds}
            completedSteps={progress.completedStepsByLecture?.[activeLecture.id] || []}
            mistakeNotebook={progress.mistakeNotebook}
            preferredSpeechRate={progress.preferredSpeechRate}
            languageMode={languageMode}
            isCompleted={progress.completedUnitIds.includes(activeLecture.id)}
            initialStep={initialModuleStep}
            onToggleSaveWord={handleToggleSaveWord}
            onToggleMasteredWord={handleToggleMasteredWord}
            onUpdateLectureNote={handleUpdateLectureNote}
            onCompleteLecture={handleCompleteLecture}
            onCompleteStep={handleCompleteStep}
            onSelectLecture={(id, step = 0) => openLecture(id, step)}
            onRecordMistake={handleRecordMistake}
            onPracticeMistake={handlePracticeMistake}
            onRemoveMistake={handleRemoveMistake}
            onUpdateMistakeNote={handleUpdateMistakeNote}
            onUpdateWordSRS={handleUpdateWordSRS}
            onBackToDashboard={() => setActiveLectureId(null)}
            onOpenSectionDictionary={openSectionInDictionary}
          />
        ) : activeTab === 'dictionary' ? (
          <DictionaryView
            lectures={allLectures}
            savedWordIds={progress.savedWordIds}
            masteredWordIds={progress.masteredWordIds || []}
            wordSRS={progress.wordSRS}
            mistakeNotebook={progress.mistakeNotebook}
            preferredSpeechRate={progress.preferredSpeechRate}
            languageMode={languageMode}
            initialLectureFilter={dictionaryLectureFilter}
            onToggleSaveWord={handleToggleSaveWord}
            onToggleMasteredWord={handleToggleMasteredWord}
            onUpdateWordSRS={handleUpdateWordSRS}
            onRecordMistake={handleRecordMistake}
            onPracticeMistake={handlePracticeMistake}
            onRemoveMistake={handleRemoveMistake}
            onOpenLecture={(id) => openLecture(id, 0)}
          />
        ) : activeTab === 'arena' ? (
          <PracticeArenaView
            lectures={allLectures}
            customWords={progress.customWords || []}
            savedWordIds={progress.savedWordIds}
            mistakeNotebook={progress.mistakeNotebook}
            sprintHighScore={progress.sprintHighScore || 0}
            detectiveSolvedIds={progress.detectiveSolvedIds || []}
            rolePlayCompletedIds={progress.rolePlayCompletedIds || []}
            preferredSpeechRate={progress.preferredSpeechRate}
            languageMode={languageMode}
            initialToolTab={initialArenaTool}
            onAddCustomWord={handleAddCustomWord}
            onRemoveCustomWord={handleRemoveCustomWord}
            onRecordSprintScore={handleRecordSprintScore}
            onRecordDetectiveSolved={handleRecordDetectiveSolved}
            onRecordRolePlayCompleted={handleRecordRolePlayCompleted}
            onRecordMistake={handleRecordMistake}
            onRecordExamResult={handleRecordExamResult}
            onOpenLecture={(id) => openLecture(id, 0)}
            onOpenDailyChallenge={() => setIsDailyChallengeOpen(true)}
          />
        ) : activeTab === 'progress' ? (
          <ProgressSettingsView
            mode="progress"
            progress={progress}
            lectures={allLectures}
            isOnline={isOnline}
            initialProgressSubView={progressSubViewTarget}
            onUpdateLevel={handleUpdateLevel}
            onUpdateSpeechRate={handleUpdateSpeechRate}
            onUpdateLanguageMode={handleUpdateLanguageMode}
            onUpdateDailyGoal={handleUpdateDailyGoal}
            onImportProgress={handleImportProgress}
            onRecordMistake={handleRecordMistake}
            onToggleDarkMode={handleToggleDarkMode}
            onManualSync={handleManualSync}
            onOpenLecture={(id) => openLecture(id, 0)}
            onOpenArenaTool={(tool) => openArenaTool(tool)}
            onOpenDictionary={() => navigateTab('dictionary')}
            onOpenDailyChallenge={() => setIsDailyChallengeOpen(true)}
          />
        ) : activeTab === 'settings' ? (
          <ProgressSettingsView
            mode="settings"
            progress={progress}
            lectures={allLectures}
            isOnline={isOnline}
            onUpdateLevel={handleUpdateLevel}
            onUpdateSpeechRate={handleUpdateSpeechRate}
            onUpdateLanguageMode={handleUpdateLanguageMode}
            onUpdateDailyGoal={handleUpdateDailyGoal}
            onImportProgress={handleImportProgress}
            onRecordMistake={handleRecordMistake}
            onToggleDarkMode={handleToggleDarkMode}
            onManualSync={handleManualSync}
            onOpenLecture={(id) => openLecture(id, 0)}
            onOpenArenaTool={(tool) => openArenaTool(tool)}
            onOpenDictionary={() => navigateTab('dictionary')}
            onOpenDailyChallenge={() => setIsDailyChallengeOpen(true)}
          />
        ) : activeTab === 'about' ? (
          <AboutView
            languageMode={languageMode}
            preferredSpeechRate={progress.preferredSpeechRate}
            onStartCurriculum={() => navigateTab('lectures')}
          />
        ) : (
          /* HOME / LECTURES SYLLABUS DASHBOARD */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8">
            {/* Step 1: Onboarding Level Selection & Add to Home Screen Card */}
            {!progress.onboardingComplete && (
              <section className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7 space-y-3">
                    <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                      Welcome to BhashaSetu
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      Select Your Starting English Level & Install for Offline Study
                    </h2>
                    <p className="text-sm sm:text-base text-[#57534E] dark:text-[#A8A29E]">
                      Choose your current proficiency level to personalize your recommended lectures, and add the app to your home screen for offline access.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                      {(
                        [
                          {
                            level: 'B1' as CEFRLevel,
                            title: 'B1 · Lower-Int',
                            sub: 'Lectures 01–04 · Silent Letters & Plurals',
                          },
                          {
                            level: 'B2' as CEFRLevel,
                            title: 'B2 · Upper-Int',
                            sub: 'Lectures 05–08 · Workplace & Passive',
                          },
                          {
                            level: 'C1' as CEFRLevel,
                            title: 'C1 · Advanced',
                            sub: 'Lectures 09–12 · Academic & Inversion',
                          },
                        ]
                      ).map((opt) => (
                        <button
                          key={opt.level}
                          onClick={() => handleSelectOnboardingLevel(opt.level)}
                          className={`min-h-[48px] p-3.5 rounded-xl border text-left transition-all ${
                            progress.selectedLevel === opt.level
                              ? 'border-[#B91C1C] bg-[#B91C1C]/8 dark:bg-[#B91C1C]/20'
                              : 'border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] hover:border-[#B91C1C]/50'
                          }`}
                        >
                          <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                            {opt.title}
                          </div>
                          <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                            {opt.sub}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PWA Install Callout Box */}
                  <div className="lg:col-span-5 p-5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-3">
                    <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      Add to Home Screen · Offline PWA Setup
                    </div>
                    <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                      Install BhashaSetu on your phone or desktop so you can listen to pronunciations and practice quizzes even without internet.
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {!isInstalled && isInstallable && (
                        <button
                          onClick={install}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                        >
                          <Download className="w-4 h-4" />
                          <span>Install App Now</span>
                        </button>
                      )}
                      {!isInstalled && !isInstallable && (
                        <button
                          onClick={() => setShowInstallHelpModal((prev) => !prev)}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                        >
                          <Smartphone className="w-4 h-4" />
                          <span>{isIOS ? 'Install on iPhone/iPad' : 'Add to Home Screen Guide'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleSelectOnboardingLevel(progress.selectedLevel)}
                        className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]"
                      >
                        Start with {progress.selectedLevel}
                      </button>
                    </div>

                    {showInstallHelpModal && (
                      <div className="p-3 rounded-lg bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs text-[#57534E] dark:text-[#A8A29E] space-y-1">
                        <div>
                          • <strong>Android / Chrome</strong>: Tap browser menu (⋮) →{' '}
                          <strong>Install App / Add to Home Screen</strong>.
                        </div>
                        <div>
                          • <strong>iOS Safari</strong>: Tap <strong>Share</strong> →{' '}
                          <strong>Add to Home Screen</strong>.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* =============================================================== */}
            {/* OVERALL COURSE PROGRESS STATUS & TRACK MASTERY BANNER           */}
            {/* =============================================================== */}
            <section className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E7E0D6] dark:border-[#2E2924]">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                    <Award className="w-4 h-4" />
                    <span>Overall Course Progress & Sequential Curriculum</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                    {courseStats.completedCount} of {courseStats.totalUnits} Lectures Completed ({courseStats.overallPercent}%)
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <button
                    onClick={() => setIsDailyChallengeOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-semibold hover:border-[#D97706] inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Daily 3-Q Challenge ({progress.dailyChallengeStreak || 0}d)</span>
                  </button>
                  <div className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] inline-flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#D97706]" />
                    <span className="font-ipa font-semibold">
                      {progress.currentStreakDays}d Streak
                    </span>
                    <span className="text-[#15803D] dark:text-emerald-400 font-ipa font-semibold inline-flex items-center gap-1 pl-1 border-l border-[#E7E0D6] dark:border-[#2E2924]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{progress.streakFreezeShields ?? 1} Shield</span>
                    </span>
                  </div>
                  <button
                    onClick={() => openProgressSubView('achievements')}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#B91C1C] font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Achievements & Badges</span>
                  </button>
                  <button
                    onClick={() => openLecture(recommendedLecture.id, 0)}
                    className="px-3.5 py-2 rounded-xl bg-[#B91C1C] text-white font-semibold hover:bg-[#991B1B] inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>
                      Resume Lecture {String(recommendedLecture.lectureNumber).padStart(2, '0')}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Overall Progress Bar + 3 Sequential CEFR Track Breakdowns */}
              <div className="pt-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#57534E] dark:text-[#A8A29E] mb-1.5">
                    <span>
                      Master Syllabus Completion Bar (Lectures 01–{String(courseStats.totalUnits).padStart(2, '0')})
                    </span>
                    <span className="font-ipa font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      {courseStats.overallPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#F2ECE1] dark:bg-[#141210] overflow-hidden">
                    <div
                      className="h-full bg-[#B91C1C] transition-all duration-300 rounded-full"
                      style={{ width: `${Math.max(4, courseStats.overallPercent)}%` }}
                    />
                  </div>
                </div>

                {/* 3 Sequential Track Mini-Cards (01-04 B1, 05-08 B2, 09-12 C1) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <button
                    onClick={() => setLevelFilter(levelFilter === 'B1' ? 'ALL' : 'B1')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      levelFilter === 'B1'
                        ? 'border-[#B91C1C] bg-[#B91C1C]/8 dark:bg-[#B91C1C]/20'
                        : 'border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      <span>Track 1 · B1 Lower-Intermediate</span>
                      <span className="font-ipa text-[#B91C1C] dark:text-[#F87171]">
                        {courseStats.b1Done}/{courseStats.b1Total} Done
                      </span>
                    </div>
                    <p className="text-[11px] text-[#57534E] dark:text-[#A8A29E] mt-1">
                      Lectures 01–04 · Silent Letters, Plurals, Causatives & Quantifiers
                    </p>
                  </button>

                  <button
                    onClick={() => setLevelFilter(levelFilter === 'B2' ? 'ALL' : 'B2')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      levelFilter === 'B2'
                        ? 'border-[#B91C1C] bg-[#B91C1C]/8 dark:bg-[#B91C1C]/20'
                        : 'border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      <span>Track 2 · B2 Upper-Intermediate</span>
                      <span className="font-ipa text-[#B91C1C] dark:text-[#F87171]">
                        {courseStats.b2Done}/{courseStats.b2Total} Done
                      </span>
                    </div>
                    <p className="text-[11px] text-[#57534E] dark:text-[#A8A29E] mt-1">
                      Lectures 05–08 · Workplace, Passive Voice & Reported Speech
                    </p>
                  </button>

                  <button
                    onClick={() => setLevelFilter(levelFilter === 'C1' ? 'ALL' : 'C1')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      levelFilter === 'C1'
                        ? 'border-[#B91C1C] bg-[#B91C1C]/8 dark:bg-[#B91C1C]/20'
                        : 'border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      <span>Track 3 · C1 Advanced Mastery</span>
                      <span className="font-ipa text-[#B91C1C] dark:text-[#F87171]">
                        {courseStats.c1Done}/{courseStats.c1Total} Done
                      </span>
                    </div>
                    <p className="text-[11px] text-[#57534E] dark:text-[#A8A29E] mt-1">
                      Lectures 09–12 · Prefixes, Confusables, Conditionals & Inversion
                    </p>
                  </button>
                </div>
              </div>
            </section>

            {/* Hero Split: Recommended Next Lecture + Study Focus & Methodology Link */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Dominant Anchor: Today's Recommended Lecture */}
              <div className="lg:col-span-8 bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mb-2">
                    <span className="text-[#B91C1C] dark:text-[#F87171] font-semibold">
                      Recommended Next Lecture
                    </span>
                    <span className="mx-2" aria-hidden="true">·</span>
                    <span>Lecture {String(recommendedLecture.lectureNumber).padStart(2, '0')}</span>
                    <span className="mx-2" aria-hidden="true">·</span>
                    <span>Level {recommendedLecture.level}</span>
                    <span className="mx-2" aria-hidden="true">·</span>
                    <span className="font-ipa">{recommendedLecture.category}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] leading-tight">
                    {recommendedLecture.title}
                  </h1>
                  {isFullNepali && (
                    <p className="font-nepali text-base sm:text-lg text-[#57534E] dark:text-[#A8A29E] mt-1.5">
                      {recommendedLecture.nepaliTitle}
                    </p>
                  )}
                  <p className="text-sm text-[#57534E] dark:text-[#A8A29E] leading-relaxed mt-2 mb-5">
                    {recommendedLecture.subtitle}
                  </p>

                  {/* Preview of Target Silent-Letter Words in this Lecture */}
                  <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] mb-5">
                    <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E] mb-2">
                      Key Silent-Letter Words in This Lecture (Tap to Hear):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recommendedLecture.moduleA_vocabulary.slice(0, 6).map((w) => (
                        <button
                          key={w.id}
                          onClick={() =>
                            speechService.speak(w.word, { rate: progress.preferredSpeechRate })
                          }
                          className="min-h-[38px] px-3 py-1.5 rounded-lg bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#B91C1C] text-sm font-medium inline-flex items-center gap-2 transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#B91C1C]" />
                          <span>
                            {w.segments?.map((seg, i) =>
                              seg.silent ? (
                                <span
                                  key={i}
                                  className="text-[#B91C1C] dark:text-[#F87171] font-semibold underline decoration-dotted"
                                >
                                  {seg.text}
                                </span>
                              ) : (
                                <span key={i}>{seg.text}</span>
                              )
                            )}
                          </span>
                          {languageMode !== 'english-only' && (
                            <span className="font-nepali text-xs text-[#57534E] dark:text-[#A8A29E]">
                              ({w.nepaliMeaning.split('/')[0].trim()})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E7E0D6] dark:border-[#2E2924]">
                  <div className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                    5 Connected Modules · {recommendedLecture.estimatedMinutes} mins
                  </div>
                  <button
                    onClick={() => openLecture(recommendedLecture.id, 0)}
                    className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#B91C1C] text-white text-sm font-semibold hover:bg-[#991B1B] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <span>Start Lecture {String(recommendedLecture.lectureNumber).padStart(2, '0')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Study Status, Mistake Notebook & About Methodology Shortcut */}
              <div className="lg:col-span-4 bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      <Compass className="w-4 h-4 text-[#B91C1C]" />
                      <span>Daily Study Companion</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="text-xs font-medium text-[#B91C1C] dark:text-[#F87171] hover:underline inline-flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>
                        {languageMode === 'english-only'
                          ? 'English Only'
                          : languageMode === 'english-meanings'
                          ? 'English + Meanings'
                          : 'Full Nepali'}
                      </span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-1.5">
                    <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] flex items-center justify-between">
                      <span>Mistake Notebook Queue</span>
                      <span className="font-ipa text-[#B91C1C] dark:text-[#F87171]">
                        {progress.mistakeNotebook.length} Active
                      </span>
                    </div>
                    <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                      Words missed in Audio Dictation, Spelling, or Grammar quizzes are saved for targeted review.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-1.5">
                    <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] flex items-center justify-between">
                      <span>Saved Bookmarks</span>
                      <span className="font-ipa text-[#15803D] dark:text-emerald-400">
                        {progress.savedWordIds.length} Words
                      </span>
                    </div>
                    <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                      Review your bookmarked vocabulary and spaced-repetition flashcards anytime in the Dictionary.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E7E0D6] dark:border-[#2E2924] flex flex-col gap-2">
                  <button
                    onClick={() => setIsDailyChallengeOpen(true)}
                    className="w-full min-h-[40px] px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 hover:border-[#D97706] text-xs font-semibold text-amber-950 dark:text-amber-200 inline-flex items-center justify-between transition-colors"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Launch 24h Daily 3-Question Quiz</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D97706]" />
                  </button>
                  <button
                    onClick={() => setActiveTab('about')}
                    className="w-full min-h-[40px] px-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#B91C1C] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] inline-flex items-center justify-between transition-colors"
                  >
                    <span>Explore 4-Pillar Bridge & Silent-Letter Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B91C1C]" />
                  </button>
                </div>
              </div>
            </section>

            {/* =============================================================== */}
            {/* PRACTICE ARENA & FLUENCY LAB QUICK-LAUNCH HUB                   */}
            {/* =============================================================== */}
            <section className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E0D6] dark:border-[#2E2924] pb-3.5">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Interactive Practice Arena, Translation Lab & Career Exam Simulator</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                    12 Specialized Phonics, Nepali Translation, 10-Min IELTS/PTE Exam & Commuter Audio Tools
                  </h2>
                </div>
                <button
                  onClick={() => openArenaTool('interference')}
                  className="min-h-[38px] px-4 py-2 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold hover:bg-[#B91C1C] dark:hover:bg-[#B91C1C] dark:hover:text-white inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
                >
                  <span>Open Full Practice Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                {[
                  {
                    id: 'interference' as ArenaToolTab,
                    title: 'Nepali-to-English Lab',
                    desc: 'SOV→SVO reordering, Articles, Prepositions (मा/ले/सँग) & Continuous traps.',
                    badge: '4 Drill Labs',
                  },
                  {
                    id: 'exam-simulator' as ArenaToolTab,
                    title: '10-Min IELTS/PTE Sim',
                    desc: 'Timed diagnostic mock exam with Band/CEFR score breakdown & Speaking.',
                    badge: 'Mock Exam',
                  },
                  {
                    id: 'commuter-audio' as ArenaToolTab,
                    title: 'Commuter Audio Mode',
                    desc: 'Hands-free podcast loop (1.0x → 2s recall → 0.75x → example sentence).',
                    badge: 'Hands-Free',
                  },
                  {
                    id: 'detective' as ArenaToolTab,
                    title: 'Silent-Letter Detective',
                    desc: 'Spot hidden silent letters in realistic workplace passages.',
                    badge: `${progress.detectiveSolvedIds?.length || 0}/3 Solved`,
                  },
                  {
                    id: 'sprint' as ArenaToolTab,
                    title: '60s Spelling Sprint',
                    desc: 'Timed arcade challenge with B1/B2/C1 & Mistake Notebook tiers.',
                    badge: `Best: ${progress.sprintHighScore || 0} pts`,
                  },
                  {
                    id: 'roleplay' as ArenaToolTab,
                    title: 'Voice Role-Play Sim',
                    desc: 'Speak or select responses in Job Interview, Airport, Clinic & Bank.',
                    badge: 'Mic + Options',
                  },
                ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => openArenaTool(tool.id)}
                    className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#B91C1C] text-left flex flex-col justify-between transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] group-hover:text-[#B91C1C] dark:group-hover:text-[#F87171]">
                          {tool.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#57534E] dark:text-[#A8A29E] line-clamp-2">
                        {tool.desc}
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-[#E7E0D6]/70 dark:border-[#2E2924] flex items-center justify-between text-[11px] font-ipa font-semibold text-[#B91C1C] dark:text-[#F87171]">
                      <span>{tool.badge}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* =============================================================== */}
            {/* MANAGED CURRICULUM SYLLABUS ORGANIZER                           */}
            {/* Hierarchy: 1. Unified Filter Bar -> 2. Search Bar -> 3. Courses */}
            {/* =============================================================== */}
            <section className="space-y-4">
              <div className="border-b border-[#E7E0D6] dark:border-[#2E2924] pb-3">
                <h2 className="text-2xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Managed Curriculum Syllabus
                </h2>
                <p className="text-sm text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                  Sequentially structured from B1 Foundation (01–04) to B2 Workplace (05–08) and C1 Mastery (09–12).
                </p>
              </div>

              {/* ROW 1: ALL FILTERS IN ONE UNIFIED BAR */}
              <div className="p-3 rounded-2xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] flex flex-wrap items-center justify-between gap-3">
                {/* Group 1: View Mode (By Track | Grid | Roadmap Table) */}
                <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] dark:bg-[#141210] rounded-xl border border-[#E7E0D6] dark:border-[#2E2924]">
                  <button
                    onClick={() => setSyllabusDisplayMode('tracks')}
                    className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                      syllabusDisplayMode === 'tracks'
                        ? 'bg-white dark:bg-[#1F1C18] text-[#1C1917] dark:text-[#F5F2EB] shadow-xs'
                        : 'text-[#57534E] dark:text-[#A8A29E]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>By Track</span>
                  </button>
                  <button
                    onClick={() => setSyllabusDisplayMode('grid')}
                    className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                      syllabusDisplayMode === 'grid'
                        ? 'bg-white dark:bg-[#1F1C18] text-[#1C1917] dark:text-[#F5F2EB] shadow-xs'
                        : 'text-[#57534E] dark:text-[#A8A29E]'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Grid</span>
                  </button>
                  <button
                    onClick={() => setSyllabusDisplayMode('table')}
                    className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                      syllabusDisplayMode === 'table'
                        ? 'bg-white dark:bg-[#1F1C18] text-[#1C1917] dark:text-[#F5F2EB] shadow-xs'
                        : 'text-[#57534E] dark:text-[#A8A29E]'
                    }`}
                  >
                    <ListChecks className="w-3.5 h-3.5" />
                    <span>Roadmap Table</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Group 2: Level Filter (All | B1 | B2 | C1) */}
                  <div className="flex flex-wrap items-center gap-1 p-1 bg-[#FAF7F2] dark:bg-[#141210] rounded-xl border border-[#E7E0D6] dark:border-[#2E2924]">
                    {(
                      [
                        { id: 'ALL', label: `All (${allLectures.length})` },
                        { id: 'B1', label: 'B1' },
                        { id: 'B2', label: 'B2' },
                        { id: 'C1', label: 'C1' },
                        ...(progress.customLectures.length > 0
                          ? [{ id: 'CUSTOM', label: `AI (${progress.customLectures.length})` }]
                          : []),
                      ] as { id: 'ALL' | CEFRLevel | 'CUSTOM'; label: string }[]
                    ).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setLevelFilter(f.id)}
                        className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          levelFilter === f.id
                            ? 'bg-white dark:bg-[#1F1C18] text-[#1C1917] dark:text-[#F5F2EB] font-semibold shadow-xs'
                            : 'text-[#57534E] dark:text-[#A8A29E]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Group 3: Completion Status Filter (All Status | To Do | Completed) */}
                  <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] dark:bg-[#141210] rounded-xl border border-[#E7E0D6] dark:border-[#2E2924]">
                    {(
                      [
                        { id: 'ALL', label: 'All Status' },
                        { id: 'TODO', label: 'To Do' },
                        { id: 'COMPLETED', label: 'Completed' },
                      ] as { id: StatusFilter; label: string }[]
                    ).map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setStatusFilter(st.id)}
                        className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          statusFilter === st.id
                            ? 'bg-white dark:bg-[#1F1C18] text-[#1C1917] dark:text-[#F5F2EB] font-semibold shadow-xs'
                            : 'text-[#57534E] dark:text-[#A8A29E]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ROW 2: DEDICATED SEARCH SECTION DIRECTLY BELOW FILTERS */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#57534E] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={lectureSearch}
                  onChange={(e) => setLectureSearch(e.target.value)}
                  placeholder="Search lectures by title, vocabulary word, spelling rule, or grammar topic (e.g., passive, conditionals, plumber)..."
                  className="w-full min-h-[44px] pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs sm:text-sm focus:outline-none focus:border-[#B91C1C]"
                />
              </div>

              {/* ROW 3: ALL COURSES SECTION DIRECTLY BELOW SEARCH */}
              {filteredLectures.length === 0 ? (
                <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-8 text-center space-y-2">
                  <div className="text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                    No lectures match your current filter
                  </div>
                  <button
                    onClick={() => {
                      setLectureSearch('');
                      setLevelFilter('ALL');
                      setStatusFilter('ALL');
                    }}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold"
                  >
                    Reset Syllabus Filters
                  </button>
                </div>
              ) : syllabusDisplayMode === 'table' ? (
                /* COMPACT SYLLABUS ROADMAP TABLE VIEW */
                <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-[#FAF7F2] dark:bg-[#141210] border-b border-[#E7E0D6] dark:border-[#2E2924] text-xs text-[#57534E] dark:text-[#A8A29E]">
                          <th className="py-3.5 px-4 font-semibold">Unit</th>
                          <th className="py-3.5 px-4 font-semibold">Level</th>
                          <th className="py-3.5 px-4 font-semibold">Focus Words</th>
                          <th className="py-3.5 px-4 font-semibold">Spelling & Grammar Focus</th>
                          <th className="py-3.5 px-4 font-semibold">Status</th>
                          <th className="py-3.5 px-4 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7E0D6] dark:divide-[#2E2924]">
                        {filteredLectures.map((lec) => {
                          const isDone = progress.completedUnitIds.includes(lec.id);
                          const score = progress.moduleScores[lec.id];
                          return (
                            <tr key={lec.id} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#141210]/40">
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                                  {String(lec.lectureNumber).padStart(2, '0')}. {lec.title}
                                </div>
                                <div className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                                  {lec.category}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-ipa text-xs font-semibold">
                                {lec.level}
                              </td>
                              <td className="py-3.5 px-4 text-xs text-[#1C1917] dark:text-[#F5F2EB]">
                                {lec.moduleA_vocabulary
                                  .slice(0, 5)
                                  .map((w) => w.word)
                                  .join(', ')}
                              </td>
                              <td className="py-3.5 px-4 text-xs text-[#57534E] dark:text-[#A8A29E]">
                                <div>
                                  <strong>Spell:</strong> {lec.moduleC_spelling.ruleTitle}
                                </div>
                                <div>
                                  <strong>Grammar:</strong> {lec.moduleD_grammar.topicTitle}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-ipa text-xs">
                                {score ? (
                                  <span className="text-[#15803D] dark:text-emerald-400 font-semibold">
                                    {score.spellingScore + score.grammarScore}/
                                    {score.spellingTotal + score.grammarTotal}
                                  </span>
                                ) : isDone ? (
                                  <span className="text-[#15803D]">Done</span>
                                ) : (
                                  <span className="text-[#57534E]">To Do</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <button
                                  onClick={() => openLecture(lec.id, 0)}
                                  className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold whitespace-nowrap"
                                >
                                  {isDone ? 'Review' : 'Start'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : syllabusDisplayMode === 'tracks' && levelFilter === 'ALL' ? (
                /* STRUCTURED TRACK VIEW (GROUPED BY SEQUENTIAL B1, B2, C1 TRACKS) */
                <div className="space-y-8">
                  {(
                    [
                      {
                        level: 'B1' as CEFRLevel,
                        trackTitle: 'Track 1 · B1 Lower-Intermediate Foundation (Lectures 01–04)',
                        trackDesc:
                          'Silent consonant clusters, deceptive vowels, plural spelling transformations, SVO word order, causatives, and quantifiers.',
                      },
                      {
                        level: 'B2' as CEFRLevel,
                        trackTitle: 'Track 2 · B2 Upper-Intermediate Workplace & Media (Lectures 05–08)',
                        trackDesc:
                          'Consonant doubling, schwa reduction, "-ceed/-sede/-cede", polite indirect questions, passive voice, and reported speech.',
                      },
                      {
                        level: 'C1' as CEFRLevel,
                        trackTitle: 'Track 3 · C1 Advanced Academic & Executive Mastery (Lectures 09–12)',
                        trackDesc:
                          'Negative prefixes, confusable pairs, Greek/French loanwords, academic plurals, conditionals, contrastive clauses, and negative inversion.',
                      },
                    ]
                  ).map((track) => {
                    const trackLectures = filteredLectures.filter((l) => l.level === track.level);
                    if (trackLectures.length === 0) return null;
                    const doneInTrack = trackLectures.filter((l) =>
                      progress.completedUnitIds.includes(l.id)
                    ).length;

                    return (
                      <div key={track.level} className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-[#F2ECE1]/70 dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924]">
                          <div>
                            <h3 className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                              {track.trackTitle}
                            </h3>
                            <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                              {track.trackDesc}
                            </p>
                          </div>
                          <div className="font-ipa text-xs font-semibold text-[#B91C1C] dark:text-[#F87171] shrink-0">
                            {doneInTrack} / {trackLectures.length} Track Units Completed
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {trackLectures.map((lec) => renderLectureCard(lec))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* STANDARD 2-COLUMN CARD GRID */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredLectures.map((lecture) => renderLectureCard(lecture))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* =================================================================== */}
      {/* MOBILE FIXED BOTTOM NAVIGATION BAR (6 Tabs, >= 44px Hitboxes)       */}
      {/* =================================================================== */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#FAF7F2]/95 dark:bg-[#141210]/95 backdrop-blur-md border-t border-[#E7E0D6] dark:border-[#2E2924] grid grid-cols-6 items-center"
      >
        <button
          onClick={() => navigateTab('lectures')}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'lectures'
              ? 'text-[#B91C1C] dark:text-[#F87171] font-semibold'
              : 'text-[#57534E] dark:text-[#A8A29E]'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Lectures</span>
        </button>

        <button
          onClick={() => navigateTab('dictionary')}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'dictionary'
              ? 'text-[#B91C1C] dark:text-[#F87171] font-semibold'
              : 'text-[#57534E] dark:text-[#A8A29E]'
          }`}
        >
          <BookMarked className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Dictionary</span>
        </button>

        <button
          onClick={() => navigateTab('arena')}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'arena'
              ? 'text-[#B91C1C] dark:text-[#F87171] font-semibold'
              : 'text-[#57534E] dark:text-[#A8A29E]'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Practice</span>
        </button>

        <button
          onClick={() => navigateTab('progress')}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'progress'
              ? 'text-[#B91C1C] dark:text-[#F87171] font-semibold'
              : 'text-[#57534E] dark:text-[#A8A29E]'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Progress</span>
        </button>

        <button
          onClick={() => navigateTab('settings')}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'settings'
              ? 'text-[#B91C1C] dark:text-[#F87171] font-semibold'
              : 'text-[#57534E] dark:text-[#A8A29E]'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Settings</span>
        </button>

        <button
          onClick={() => navigateTab('about')}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'about'
              ? 'text-[#B91C1C] dark:text-[#F87171] font-semibold'
              : 'text-[#57534E] dark:text-[#A8A29E]'
          }`}
        >
          <Info className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">About</span>
        </button>
      </nav>

      {/* AI Lesson Generation Modal */}
      <AILessonModal
        isOpen={isAIModalOpen}
        isOnline={isOnline}
        nextLectureNumber={allLectures.length + 1}
        defaultLevel={progress.selectedLevel}
        languageMode={languageMode}
        onClose={() => setIsAIModalOpen(false)}
        onLectureGenerated={handleLectureGenerated}
      />

      {/* 24-Hour 3-Question Daily Challenge Pop-Up Modal */}
      <DailyChallengeModal
        isOpen={isDailyChallengeOpen}
        lectures={allLectures}
        completedUnitIds={progress.completedUnitIds}
        completedStepsByLecture={progress.completedStepsByLecture || {}}
        savedWordIds={progress.savedWordIds}
        wordSRS={progress.wordSRS}
        dailyChallengeStreak={progress.dailyChallengeStreak || 0}
        lastDailyChallengeAt={progress.lastDailyChallengeAt}
        preferredSpeechRate={progress.preferredSpeechRate}
        languageMode={languageMode}
        onClose={() => setIsDailyChallengeOpen(false)}
        onCompleteChallenge={handleCompleteDailyChallenge}
        onUpdateWordSRS={handleUpdateWordSRS}
        onRecordMistake={handleRecordMistake}
      />
    </div>
  );
}
