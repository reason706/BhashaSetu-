import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Home,
  BookOpen,
  BookMarked,
  BarChart3,
  Settings,
  Wand2,
  ArrowRight,
  CheckCircle2,
  Volume2,
  Download,
  WifiOff,
  Search,
  Flame,
  Info,
  Sparkles,
  Zap,
  Trophy,
  ShieldCheck,
  X,
  Cloud,
  RefreshCw,
  LogOut,
  LogIn,
  Brain,
  Check,
  Mic,
  Lock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Sliders,
  Puzzle,
  Menu,
  MessageSquare,
  Loader2,
  Send,
  Clock,
  Layers,
  Play,
} from 'lucide-react';
import type { User } from 'firebase/auth';
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
  SRSRating,
  UserProgressState,
} from './types/curriculum';
import {
  loadUserProgress,
  loadFromIndexedDB,
  getTodayDateString,
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
  resetAllUserProgress,
} from './services/storage';
import { speechService } from './services/speech';
import { useOnlineStatus } from './hooks/usePWA';
import { MODAL_OPEN_EVENT, scrollBehavior } from './hooks/useModalBehavior';
import { LecturePlayer, ModuleStep } from './components/LecturePlayer';
import { LessonProgressCard } from './components/LessonProgressCard';
import { LevelUpCelebrationModal } from './components/LevelUpCelebrationModal';
import { DictionaryView } from './components/DictionaryView';
import { AILessonModal } from './components/AILessonModal';
import { AIRoleplayModal } from './components/AIRoleplayModal';
import { ProgressSettingsView } from './components/ProgressSettingsView';
import { AboutView } from './components/AboutView';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { PracticeArenaView, ArenaToolTab } from './components/PracticeArenaView';
import {
  PrintableStudySheetModal,
  StudySheetFocusMode,
} from './components/PrintableStudySheetModal';
import {
  subscribeToAuthState,
  signInWithGooglePopup,
  signOutFirebaseUser,
  syncProgressToCloud,
  pullAndMergeCloudProgress,
  resetCloudProgress,
} from './services/firebase';
import { Toaster, toast } from 'sonner';
import { WordPhoneticsPopover } from './components/ui/ResponsivePrimitives';

type NavTab = 'home' | 'lessons' | 'dictionary' | 'arena' | 'progress' | 'settings' | 'about';

export default function App() {
  const [progress, setProgress] = useState<UserProgressState>(() => loadUserProgress());
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeLectureId, setActiveLectureId] = useState<string | null>(null);
  const [initialModuleStep, setInitialModuleStep] = useState<ModuleStep>(0);
  const [dictionaryLectureFilter, setDictionaryLectureFilter] = useState<number | null>(null);

  // Lessons Curriculum Filter ('ALL' | 'B1' | 'B2' | 'C1') & Topic Search
  const [levelFilter, setLevelFilter] = useState<'ALL' | CEFRLevel>('ALL');
  const [lessonTopicSearch, setLessonTopicSearch] = useState('');
  const [expandedLessonPreviewId, setExpandedLessonPreviewId] = useState<string | null>(null);

  // Global Top Search Bar State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  // Phones: search collapses to an icon that expands over the whole top bar
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const globalSearchInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Top-Right User Avatar Dropdown State
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isEditingAvatarName, setIsEditingAvatarName] = useState(false);
  const [avatarDraftName, setAvatarDraftName] = useState('');
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);

  // Home Weekly Bar Chart Interactive Selection
  const [selectedWeekDayIdx, setSelectedWeekDayIdx] = useState<number | null>(null);

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isDailyChallengeOpen, setIsDailyChallengeOpen] = useState(false);
  const [hasAutoCheckedDailyChallenge, setHasAutoCheckedDailyChallenge] = useState(false);
  const [initialArenaTool, setInitialArenaTool] = useState<ArenaToolTab | null>(null);
  const [progressSubViewTarget, setProgressSubViewTarget] = useState<'overview' | 'achievements'>(
    'overview'
  );
  const [dashboardStudySheetMode, setDashboardStudySheetMode] =
    useState<StudySheetFocusMode | null>(null);
  const hasSeededInitialBadgesRef = useRef(false);

  // Firebase Cloud Sync & Multi-Device Account State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudSyncStatusMsg, setCloudSyncStatusMsg] = useState<string | null>(null);

  // Home SRS Quick-Review Interactive Card State
  const [srsQuickIdx, setSrsQuickIdx] = useState(0);
  const [srsQuickFlipped, setSrsQuickFlipped] = useState(false);

  // Gmail-Style Foldable Desktop Sidebar State (persisted in localStorage)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bhashasetu_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bhashasetu_sidebar_collapsed', String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  // AI Roleplay Conversation Partner Modal State
  const [isAIRoleplayOpen, setIsAIRoleplayOpen] = useState(false);

  // Level Up / Milestone Celebration Modal State (Image 3)
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
  const [bonusShareXP, setBonusShareXP] = useState(0);
  const sentenceCoachSectionRef = useRef<HTMLDivElement | null>(null);
  const sentenceCoachInputRef = useRef<HTMLInputElement | null>(null);

  // Home AI Sentence & Grammar Coach State
  const [sentenceCoachInput, setSentenceCoachInput] = useState('');
  const [isSentenceCoachLoading, setIsSentenceCoachLoading] = useState(false);
  const [sentenceCoachError, setSentenceCoachError] = useState<string | null>(null);
  const [sentenceCoachResult, setSentenceCoachResult] = useState<{
    isAlreadyCorrect: boolean;
    correctedEnglish: string;
    naturalAlternative: string;
    nepaliMeaning: string;
    grammarTipNepali: string;
    svoComparisonNote: string;
    focusTag: string;
  } | null>(null);

  // Home Word Spotlight AI Silent-Letter Explainer State
  const [spotlightAIExplanation, setSpotlightAIExplanation] = useState<{
    word: string;
    silentReasonNepali: string;
    mouthPositionNepali: string;
    nepaliSoundComparison: string;
    memoryTrickNepali: string;
    extraExampleEnglish: string;
    extraExampleNepali: string;
  } | null>(null);
  const [isSpotlightAILoading, setIsSpotlightAILoading] = useState(false);

  // Skeleton loader states for Word of the Day & dynamic sections
  const [isInitialHydrating, setIsInitialHydrating] = useState(true);
  const [isWordOfTheDayLoading, setIsWordOfTheDayLoading] = useState(false);
  const [isSpotlightTransitioning, setIsSpotlightTransitioning] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsInitialHydrating(false);
    }, 320);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    speechService.setHapticFeedbackEnabled(progress.hapticFeedbackEnabled !== false);
  }, [progress.hapticFeedbackEnabled]);

  const handleCycleWordOfTheDay = () => {
    speechService.triggerHaptic('light');
    setIsWordOfTheDayLoading(true);
    window.setTimeout(() => {
      setWordOfTheDayOffset((n) => n + 1);
      setIsWordOfTheDayLoading(false);
    }, 240);
  };

  const handleCycleSpotlightWord = (markMasteredId?: string) => {
    speechService.triggerHaptic('light');
    setIsSpotlightTransitioning(true);
    window.setTimeout(() => {
      if (markMasteredId) {
        handleToggleMasteredWord(markMasteredId);
      }
      setSrsQuickFlipped(false);
      setSpotlightAIExplanation(null);
      setSrsQuickIdx((i) => i + 1);
      setIsSpotlightTransitioning(false);
    }, 220);
  };

  const handleRunSentenceCoach = async (customText?: string) => {
    const text = (customText ?? sentenceCoachInput).trim();
    if (!text || isSentenceCoachLoading) return;
    if (customText) setSentenceCoachInput(customText);
    setIsSentenceCoachLoading(true);
    setSentenceCoachError(null);

    try {
      const res = await fetch('/api/ai/sentence-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: text,
          level: progress.currentLevel || 'B1',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.result) {
        throw new Error(data.error || 'Could not analyze sentence right now.');
      }
      setSentenceCoachResult(data.result);
    } catch (err: unknown) {
      setSentenceCoachError(
        err instanceof Error ? err.message : 'Unable to reach AI Sentence Coach.'
      );
    } finally {
      setIsSentenceCoachLoading(false);
    }
  };

  const handleExplainSpotlightWord = async (wordObj: {
    word: string;
    ipa: string;
    silentLettersSummary: string;
  }) => {
    if (isSpotlightAILoading) return;
    if (spotlightAIExplanation && spotlightAIExplanation.word === wordObj.word) {
      setSpotlightAIExplanation(null);
      return;
    }
    setIsSpotlightAILoading(true);
    try {
      const res = await fetch('/api/ai/word-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: wordObj.word,
          ipa: wordObj.ipa,
          silentLettersSummary: wordObj.silentLettersSummary,
          level: progress.currentLevel || 'B1',
        }),
      });
      const data = await res.json();
      if (res.ok && data.explanation) {
        setSpotlightAIExplanation({
          ...data.explanation,
          word: wordObj.word,
        });
      }
    } catch {
      // Ignore transient errors
    } finally {
      setIsSpotlightAILoading(false);
    }
  };

  const isOnline = useOnlineStatus();
  const languageMode: LanguageMode = progress.languageMode || 'full-nepali';

  // Close search & avatar popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(e.target as Node)
      ) {
        setIsAvatarMenuOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
        setIsMobileSearchOpen(false);
      }
    };
    // Escape closes the search / avatar popovers; "/" focuses the global search
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchDropdownOpen(false);
        setIsMobileSearchOpen(false);
        setIsAvatarMenuOpen(false);
        return;
      }
      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);
      if (e.key === '/' && !isTyping && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        if (window.matchMedia('(max-width: 639px)').matches) {
          setIsMobileSearchOpen(true);
        }
        setIsSearchDropdownOpen(true);
        window.setTimeout(() => globalSearchInputRef.current?.focus(), 0);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Any modal opening closes the top-bar popovers so only one pop-up is visible
  useEffect(() => {
    const closeShellPopovers = () => {
      setIsAvatarMenuOpen(false);
      setIsSearchDropdownOpen(false);
      setIsMobileSearchOpen(false);
    };
    window.addEventListener(MODAL_OPEN_EVENT, closeShellPopovers);
    return () => window.removeEventListener(MODAL_OPEN_EVENT, closeShellPopovers);
  }, []);

  // Focus the expanded phone search field as soon as it opens
  useEffect(() => {
    if (isMobileSearchOpen) {
      window.setTimeout(() => globalSearchInputRef.current?.focus(), 0);
    }
  }, [isMobileSearchOpen]);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (progress.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [progress.darkMode]);

  // Phase 7 Audit Fix: Hydrate from IndexedDB fallback if localStorage was cleared/evicted
  useEffect(() => {
    const isFreshDefault =
      progress.completedUnitIds.length === 0 &&
      progress.savedWordIds.length === 0 &&
      !progress.lastStudyDate;
    if (!isFreshDefault) return;

    void loadFromIndexedDB().then((idbState) => {
      if (
        idbState &&
        (idbState.completedUnitIds?.length > 0 ||
          idbState.savedWordIds?.length > 0 ||
          Boolean(idbState.lastStudyDate))
      ) {
        setProgress(idbState);
        saveUserProgress(idbState);
      }
    });
  }, []);

  // Sync offline queue when back online
  useEffect(() => {
    if (isOnline && progress.pendingSyncQueue.length > 0) {
      void flushPendingSyncQueue(progress).then((updated) => {
        setProgress(updated);
      });
    }
  }, [isOnline]);

  // Subscribe to Firebase Auth & automatically merge cloud progress on sign-in
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsCloudSyncing(true);
        try {
          const merged = await pullAndMergeCloudProgress(user, loadUserProgress());
          setProgress(merged);
          setCloudSyncStatusMsg('Cloud progress synced across devices');
        } catch (err) {
          console.error('Initial cloud merge failed:', err);
          setCloudSyncStatusMsg('Cloud sync temporarily unavailable (offline-safe)');
        } finally {
          setIsCloudSyncing(false);
        }
      } else {
        setCloudSyncStatusMsg(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Debounced background push of ALL user data & info to Firestore when signed in
  useEffect(() => {
    if (!firebaseUser || !isOnline) return;
    const timer = window.setTimeout(() => {
      void syncProgressToCloud(firebaseUser, progress)
        .then((syncedState) => {
          setProgress((prev) => ({
            ...prev,
            lastSyncedAt: syncedState.lastSyncedAt,
            pendingSyncQueue: [],
          }));
        })
        .catch((err) => {
          console.warn('Background cloud sync skipped:', err);
        });
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [
    firebaseUser,
    isOnline,
    progress.userName,
    progress.dailyReminderEnabled,
    progress.selectedLevel,
    progress.dailyGoalMinutes,
    progress.onboardingComplete,
    progress.currentStreakDays,
    progress.streakFreezeShields,
    progress.sprintHighScore,
    progress.preferredSpeechRate,
    progress.darkMode,
    progress.languageMode,
    progress.completedUnitIds,
    progress.completedStepsByLecture,
    progress.moduleScores,
    progress.savedWordIds,
    progress.masteredWordIds,
    progress.wordSRS,
    progress.mistakeNotebook,
    progress.lectureNotes,
    progress.customLectures,
    progress.customWords,
    progress.unlockedBadgeIds,
    progress.detectiveSolvedIds,
    progress.rolePlayCompletedIds,
    progress.examHistory,
    progress.studyActivityByDate,
  ]);

  const allLectures: LectureUnit[] = useMemo(() => {
    return [...CORE_SYLLABUS, ...enrichSyllabusWithEnhancements(progress.customLectures)];
  }, [progress.customLectures]);

  const massiveLexicon = useMemo(() => {
    return getMassiveLexicon(allLectures);
  }, [allLectures]);

  // Overall Course Progress Metrics
  const courseStats = useMemo(() => {
    const totalUnits = CORE_SYLLABUS.length;
    const completedCount = CORE_SYLLABUS.filter((l) =>
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

  const handleRecordExamResult = (
    examRecord: Omit<ExamSimulationRecord, 'id' | 'completedAt'> | ExamSimulationRecord
  ) => {
    const fullRecord: ExamSimulationRecord = {
      id: 'id' in examRecord && examRecord.id ? examRecord.id : `exam-${Date.now()}`,
      completedAt:
        'completedAt' in examRecord && examRecord.completedAt
          ? examRecord.completedAt
          : new Date().toISOString(),
      ...examRecord,
    };
    setProgress((prev) => recordExamSimulationResult(prev, fullRecord));
  };

  const handleCompleteLecture = (scoreRecord: ModuleScoreRecord) => {
    const completedUnit = allLectures.find((l) => l.id === scoreRecord.unitId);
    const wasAlreadyCompleted = progress.completedUnitIds.includes(scoreRecord.unitId);

    setProgress((prev) => {
      const next = recordLectureCompletion(prev, scoreRecord);

      if (completedUnit && !wasAlreadyCompleted) {
        const trackLevel = completedUnit.level;
        const trackLectures = CORE_SYLLABUS.filter((l) => l.level === trackLevel);
        const allTrackDone =
          trackLectures.length > 0 &&
          trackLectures.every((l) => next.completedUnitIds.includes(l.id));

        if (allTrackDone) {
          speechService.playCelebrationChime('milestone');
          toast.success(
            `🎉 ${trackLevel} Track Milestone Completed!`,
            {
              description: `You finished all ${trackLectures.length} lectures in the ${
                trackLevel === 'B1'
                  ? 'B1 Foundation'
                  : trackLevel === 'B2'
                  ? 'B2 Workplace'
                  : 'C1 Advanced'
              } curriculum track!`,
              duration: 6000,
            }
          );
        } else {
          speechService.playCelebrationChime('achievement');
        }
      } else {
        speechService.playCelebrationChime('achievement');
      }

      return next;
    });
    setIsLevelUpModalOpen(true);
  };

  const handleCompleteStep = (lectureId: string, stepIndex: number) => {
    setProgress((prev) => recordModuleStepCompleted(prev, lectureId, stepIndex));
  };

  const handleUpdateWordSRS = (wordId: string, ratingOrCorrect: boolean | SRSRating) => {
    setProgress((prev) => updateWordSRS(prev, wordId, ratingOrCorrect));
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
    setActiveTab('lessons');
  };

  const handleUpdateLevel = (level: CEFRLevel) => {
    setProgress((prev) => {
      const next = { ...prev, selectedLevel: level, currentLevel: level };
      saveUserProgress(next);
      return next;
    });
  };

  const handleUpdateUserName = (name: string) => {
    setProgress((prev) => {
      const next = { ...prev, userName: name };
      saveUserProgress(next);
      return next;
    });
  };

  const handleToggleDailyReminder = () => {
    setProgress((prev) => {
      const next = {
        ...prev,
        dailyReminderEnabled: prev.dailyReminderEnabled === false ? true : false,
      };
      saveUserProgress(next);
      return next;
    });
  };

  const handleToggleHapticFeedback = () => {
    setProgress((prev) => {
      const nextEnabled = prev.hapticFeedbackEnabled === false ? true : false;
      const next = {
        ...prev,
        hapticFeedbackEnabled: nextEnabled,
      };
      speechService.setHapticFeedbackEnabled(nextEnabled);
      if (nextEnabled) {
        speechService.triggerHaptic('light');
      }
      saveUserProgress(next);
      toast.success(
        nextEnabled ? 'Haptic feedback enabled' : 'Haptic feedback turned off',
        {
          description: nextEnabled
            ? 'Gentle vibration is active on answers and interactions.'
            : 'Vibration feedback is now muted across all exercises.',
          duration: 2400,
        }
      );
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
    setIsCloudSyncing(true);
    try {
      let updated = await flushPendingSyncQueue(progress);
      if (firebaseUser) {
        updated = await syncProgressToCloud(firebaseUser, updated);
        setCloudSyncStatusMsg('All progress backed up to Firebase Cloud');
      } else {
        setCloudSyncStatusMsg('Offline queue flushed locally');
      }
      setProgress(updated);
    } catch (err) {
      console.error('Manual sync error:', err);
      setCloudSyncStatusMsg('Sync failed — saved locally');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsCloudSyncing(true);
    setCloudSyncStatusMsg(null);
    try {
      const user = await signInWithGooglePopup();
      if (user) {
        const merged = await pullAndMergeCloudProgress(user, progress);
        setProgress(merged);
        setCloudSyncStatusMsg(`Signed in as ${user.displayName || user.email}`);
      }
    } catch (err) {
      console.error('Google Sign-In error:', err);
      setCloudSyncStatusMsg('Google Sign-In was cancelled or blocked by popup settings');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await signOutFirebaseUser();
    setFirebaseUser(null);
    setCloudSyncStatusMsg('Signed out — local progress remains safe on this device');
  };

  const handlePullFromCloud = async () => {
    if (!firebaseUser) return;
    setIsCloudSyncing(true);
    try {
      const merged = await pullAndMergeCloudProgress(firebaseUser, progress);
      setProgress(merged);
      setCloudSyncStatusMsg('Restored & merged all study data from your Google Account');
    } catch (err) {
      console.error('Cloud restore error:', err);
      setCloudSyncStatusMsg('Could not pull from cloud — using local copy');
    } finally {
      setIsCloudSyncing(false);
    }
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

  const handleResetAllProgress = async (includeCloud: boolean) => {
    setIsCloudSyncing(true);
    try {
      const freshLocal = resetAllUserProgress({
        userName: progress.userName,
        darkMode: progress.darkMode,
        languageMode: progress.languageMode,
        selectedLevel: progress.selectedLevel,
        dailyGoalMinutes: (progress.dailyGoalMinutes === 5 ||
        progress.dailyGoalMinutes === 10 ||
        progress.dailyGoalMinutes === 30
          ? progress.dailyGoalMinutes
          : 15) as 5 | 10 | 15 | 30,
      });

      if (includeCloud && firebaseUser) {
        const syncedFresh = await resetCloudProgress(firebaseUser, freshLocal);
        setProgress(syncedFresh);
        setCloudSyncStatusMsg('All progress reset to 0 locally and in Google Cloud');
      } else {
        setProgress(freshLocal);
        setCloudSyncStatusMsg('Local progress reset to 0');
      }
    } catch (err) {
      console.error('Reset progress error:', err);
      setCloudSyncStatusMsg('Local progress reset to 0 (cloud sync skipped)');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const unifiedMasteredWordsCount = useMemo(
    () => getUnifiedMasteredWordsCount(progress),
    [progress]
  );

  // Words learned count starting cleanly from 0 and growing with user progress
  const wordsLearnedDisplayCount = useMemo(() => {
    return unifiedMasteredWordsCount;
  }, [unifiedMasteredWordsCount]);

  // Shared XP + learner level (used by the top bar, Today's goal card and the level-up modal)
  const learnerXP = useMemo(() => {
    const stepTotalCount = (
      Object.values(progress.completedStepsByLecture || {}) as number[][]
    ).reduce((sum, arr) => sum + arr.length, 0);
    return (
      courseStats.completedCount * 250 +
      stepTotalCount * 35 +
      wordsLearnedDisplayCount * 15 +
      (progress.sprintHighScore || 0) * 5 +
      (progress.dailyChallengeTotalCompleted || 0) * 60 +
      bonusShareXP
    );
  }, [
    progress.completedStepsByLecture,
    progress.sprintHighScore,
    progress.dailyChallengeTotalCompleted,
    courseStats.completedCount,
    wordsLearnedDisplayCount,
    bonusShareXP,
  ]);
  const learnerLevelNumber = Math.max(1, Math.floor(learnerXP / 500) + 1);
  const learnerLevelTitle =
    learnerLevelNumber < 3
      ? 'Starter'
      : learnerLevelNumber < 5
      ? 'Explorer'
      : learnerLevelNumber < 8
      ? 'Communicator'
      : learnerLevelNumber < 12
      ? 'Fluent Speaker'
      : 'Bridge Master';

  // Spaced Repetition (wordSRS) "Words Due Today" Queue
  const dueSRSWords = useMemo(() => {
    const nowMs = Date.now();
    const srsMap = progress.wordSRS || {};
    const masteredSet = new Set(progress.masteredWordIds || []);

    const explicitlyDueIds = Object.values(srsMap)
      .filter((rec) => {
        if (masteredSet.has(rec.wordId)) return false;
        const dueTime = Date.parse(rec.nextReviewDue);
        return Number.isNaN(dueTime) || dueTime <= nowMs;
      })
      .sort((a, b) => Date.parse(a.nextReviewDue) - Date.parse(b.nextReviewDue))
      .map((rec) => rec.wordId);

    const dueSet = new Set(explicitlyDueIds);

    for (const savedId of progress.savedWordIds) {
      if (!masteredSet.has(savedId) && !srsMap[savedId]) {
        dueSet.add(savedId);
      }
    }

    if (dueSet.size < 5 && recommendedLecture) {
      for (const vocab of recommendedLecture.moduleA_vocabulary) {
        if (!masteredSet.has(vocab.id) && !srsMap[vocab.id]) {
          dueSet.add(vocab.id);
        }
        if (dueSet.size >= 8) break;
      }
    }

    const lexiconById = new Map(massiveLexicon.map((w) => [w.id, w]));
    return Array.from(dueSet)
      .map((id) => lexiconById.get(id))
      .filter((w): w is NonNullable<typeof w> => Boolean(w))
      .slice(0, 12);
  }, [
    progress.wordSRS,
    progress.savedWordIds,
    progress.masteredWordIds,
    recommendedLecture,
    massiveLexicon,
  ]);

  const activeSRSQuickWord =
    dueSRSWords.length > 0 ? dueSRSWords[srsQuickIdx % dueSRSWords.length] : null;

  // Daily Random High-Frequency 'Word of the Day' for Home Page
  const [wordOfTheDayOffset, setWordOfTheDayOffset] = useState(0);
  const wordOfTheDay = useMemo(() => {
    const coreHighFreqPool = massiveLexicon.filter((w) => w.isCoreLessonWord);
    const pool = coreHighFreqPool.length > 0 ? coreHighFreqPool : massiveLexicon;
    if (pool.length === 0) return null;

    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    let hash = 2166136261;
    for (let i = 0; i < todayStr.length; i++) {
      hash ^= todayStr.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const baseIdx = Math.abs(hash) % pool.length;
    return pool[(baseIdx + wordOfTheDayOffset) % pool.length];
  }, [massiveLexicon, wordOfTheDayOffset]);

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
      const isMajorMilestone =
        newlyUnlocked.id.includes('graduate') ||
        newlyUnlocked.id.includes('master-linguist') ||
        newlyUnlocked.id === 'first-lecture-finished' ||
        newlyUnlocked.id === 'ten-day-streak' ||
        newlyUnlocked.id === 'fifty-words-mastered';
      speechService.playCelebrationChime(isMajorMilestone ? 'milestone' : 'achievement');

      toast.success(`🏆 ${newlyUnlocked.title} · ${newlyUnlocked.nepaliTitle}`, {
        description: newlyUnlocked.desc,
        duration: 6000,
        action: {
          label: 'View Badge',
          onClick: () => openProgressSubView('achievements'),
        },
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
    if (tab === 'arena') {
      setInitialArenaTool(null);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  };

  const openProgressSubView = (subView: 'overview' | 'achievements') => {
    setActiveLectureId(null);
    setProgressSubViewTarget(subView);
    setActiveTab('progress');
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  };

  const openArenaTool = (tool: ArenaToolTab) => {
    setInitialArenaTool(tool);
    setActiveLectureId(null);
    setActiveTab('arena');
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  };

  const openLecture = (id: string, step: ModuleStep = 0) => {
    setInitialModuleStep(step);
    setActiveLectureId(id);
    setActiveTab('lessons');
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  };

  const openSectionInDictionary = (lectureNumber: number) => {
    setDictionaryLectureFilter(lectureNumber);
    setActiveLectureId(null);
    setActiveTab('dictionary');
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  };

  // Global Top Search Bar Instant Results (Words, Lessons, Practice Arena Activities)
  const globalSearchResults = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchingLectures = allLectures
      .filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.subtitle.toLowerCase().includes(q) ||
          l.moduleC_spelling.ruleTitle.toLowerCase().includes(q) ||
          l.moduleD_grammar.topicTitle.toLowerCase().includes(q)
      )
      .slice(0, 4);

    const matchingWords = massiveLexicon
      .filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.nepaliMeaning.toLowerCase().includes(q) ||
          w.silentLettersSummary.toLowerCase().includes(q)
      )
      .slice(0, 5);

    const arenaActivities: { id: ArenaToolTab; title: string; subtitle: string }[] = [
      { id: 'sprint', title: '60-Second Word Sprint', subtitle: 'Timed silent-letter spelling game' },
      { id: 'detective', title: 'Silent-Letter Detective', subtitle: 'Spot silent letters in passages' },
      { id: 'roleplay', title: 'Voice Role-Play Simulator', subtitle: 'Interactive workplace & interview dialogues' },
      { id: 'interference', title: 'Nepali-to-English Translation Lab', subtitle: 'SOV to SVO, articles & prepositions' },
      { id: 'exam-simulator', title: '10-Min IELTS / PTE Simulator', subtitle: 'Full diagnostic mock test' },
      { id: 'shadowing', title: 'Audio Shadowing & Pitch Trainer', subtitle: 'Compare waveform & F0 contour' },
      { id: 'minimal-pairs', title: 'Minimal Pair Ear & Voice Lab', subtitle: '/v/ vs /w/, /s/ vs /ʃ/, /f/ vs /p/' },
      { id: 'commuter-audio', title: 'Commuter Audio Podcast Player', subtitle: 'Hands-free vocabulary recall loop' },
    ];
    const matchingActivities = arenaActivities
      .filter(
        (a) =>
          a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
      )
      .slice(0, 3);

    return { matchingLectures, matchingWords, matchingActivities };
  }, [globalSearchQuery, allLectures, massiveLexicon]);

  // Display Name & Initials for Greeting & Top-Right Avatar
  const fullDisplayName =
    progress.userName || firebaseUser?.displayName || 'Anisha Sharma';
  const firstName = fullDisplayName.split(' ')[0] || 'Anisha';
  const userInitials =
    fullDisplayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'AS';

  // 7-Day Weekly Bar Chart Data for Home Screen ("Your week" M T W T F S S)
  const homeWeekBars = useMemo(() => {
    const dailyGoal = Math.max(5, progress.dailyGoalMinutes || 15);
    const maxScaleMinutes = Math.max(dailyGoal * 1.5, 25);
    const goalThresholdPct = Math.min(88, Math.max(28, Math.round((dailyGoal / maxScaleMinutes) * 100)));

    const entries = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(Date.now() - (6 - idx) * 86400000);
      const dateStr = getTodayDateString(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      const letter = d.toLocaleDateString('en-US', { weekday: 'short' })[0] || 'D';
      const loggedCount = progress.studyActivityByDate?.[dateStr] || 0;
      const minutes = loggedCount * 5;
      const isGoalMet = minutes >= dailyGoal;
      const rawPct =
        minutes > 0
          ? Math.round((minutes / maxScaleMinutes) * 100)
          : 10;
      const pct = minutes > 0 ? Math.min(96, Math.max(22, rawPct)) : 10;
      return {
        idx,
        letter,
        dayName,
        dateStr,
        minutes,
        loggedCount,
        pct,
        isFilled: loggedCount > 0,
        isGoalMet,
      };
    });
    const totalMinutes = entries.reduce((acc, item) => acc + item.minutes, 0);
    const goalsMetCount = entries.filter((item) => item.isGoalMet).length;
    return { entries, totalMinutes, dailyGoal, goalsMetCount, goalThresholdPct };
  }, [progress.studyActivityByDate, progress.dailyGoalMinutes]);

  // 4-Pillar Language Mastery Data for Home Interactive Chart
  const homeSkillPillars = useMemo(() => {
    const scoreRecords = Object.values(progress.moduleScores) as ModuleScoreRecord[];
    const spellingCorrect = scoreRecords.reduce((acc, r) => acc + r.spellingScore, 0);
    const spellingTotal = scoreRecords.reduce((acc, r) => acc + r.spellingTotal, 0);
    const grammarCorrect = scoreRecords.reduce((acc, r) => acc + r.grammarScore, 0);
    const grammarTotal = scoreRecords.reduce((acc, r) => acc + r.grammarTotal, 0);
    const dialogueCorrect = scoreRecords.reduce((acc, r) => acc + (r.dialogueScore || 0), 0);
    const dialogueTotal = scoreRecords.reduce((acc, r) => acc + (r.dialogueTotal || 0), 0);

    const stepValues = Object.values(progress.completedStepsByLecture || {}) as number[][];
    const totalStepsCompleted = stepValues.reduce((acc, arr) => acc + arr.length, 0);

    const vocabPct = Math.min(100, Math.round((unifiedMasteredWordsCount / 50) * 100));
    const phonicsPct =
      spellingTotal > 0
        ? Math.round((spellingCorrect / spellingTotal) * 100)
        : Math.min(100, (progress.sprintHighScore || 0) * 2 + totalStepsCompleted * 4);
    const grammarPct =
      grammarTotal > 0
        ? Math.round((grammarCorrect / grammarTotal) * 100)
        : Math.min(100, totalStepsCompleted * 5);
    const dialoguePct =
      dialogueTotal > 0
        ? Math.round((dialogueCorrect / dialogueTotal) * 100)
        : Math.min(100, (progress.rolePlayCompletedIds?.length || 0) * 25 + totalStepsCompleted * 4);

    return [
      {
        id: 'vocab',
        label: 'Vocabulary & Silent-Letter Lexicon',
        pct: vocabPct,
        metricLabel: `${unifiedMasteredWordsCount} / 50 words mastered`,
        color: 'bg-[#A82020]',
        actionLabel: 'Open Dictionary',
        onAction: () => navigateTab('dictionary'),
      },
      {
        id: 'phonics',
        label: 'Silent-Letter Phonics & Spelling',
        pct: phonicsPct,
        metricLabel:
          spellingTotal > 0
            ? `${spellingCorrect}/${spellingTotal} quiz score`
            : `Sprint best: ${progress.sprintHighScore || 0} pts`,
        color: 'bg-[#D97706]',
        actionLabel: '60s Word Sprint',
        onAction: () => openArenaTool('sprint'),
      },
      {
        id: 'grammar',
        label: 'SVO Grammar & Nepali-to-English Syntax',
        pct: grammarPct,
        metricLabel:
          grammarTotal > 0
            ? `${grammarCorrect}/${grammarTotal} quiz score`
            : `${progress.completedUnitIds.length} grammar units done`,
        color: 'bg-[#2E6F4E]',
        actionLabel: 'Translation Lab',
        onAction: () => openArenaTool('interference'),
      },
      {
        id: 'fluency',
        label: 'Spoken Dialogue & Pronunciation',
        pct: dialoguePct,
        metricLabel:
          dialogueTotal > 0
            ? `${dialogueCorrect}/${dialogueTotal} dialogue score`
            : `${progress.rolePlayCompletedIds?.length || 0} role-plays completed`,
        color: 'bg-[#284B7A]',
        actionLabel: 'Role-Play Lab',
        onAction: () => openArenaTool('roleplay'),
      },
    ];
  }, [
    progress.moduleScores,
    progress.completedStepsByLecture,
    progress.sprintHighScore,
    progress.completedUnitIds.length,
    progress.rolePlayCompletedIds,
    unifiedMasteredWordsCount,
  ]);

  // Editorial Curriculum Metadata mapping for Lessons 01–12 matching Screenshot 2
  const getEditorialLessonPresentation = (lecture: LectureUnit) => {
    const num = lecture.lectureNumber;
    const editorialTitles: Record<number, { title: string; sub: string; duration: number }> = {
      1: {
        title: 'Silent K, W & P · Start speaking clearly',
        sub: 'Vocabulary · Phonics · SVO word order',
        duration: 15,
      },
      2: {
        title: 'Past and present · Tell your story',
        sub: 'Silent B, T & N · Present perfect',
        duration: 18,
      },
      3: {
        title: 'Describe more · Words that paint a picture',
        sub: 'Vowel patterns · Comparatives · Clear examples',
        duration: 16,
      },
      4: {
        title: 'Listen closely · The quiet T and L',
        sub: 'Often, whistle, castle · Spelling patterns',
        duration: 12,
      },
      5: {
        title: 'Sound natural · Stress, schwa & polite questions',
        sub: 'Connected speech · Indirect questions',
        duration: 20,
      },
      6: {
        title: 'Words that sound alike · Choose with care',
        sub: 'Spelling families · Workplace English',
        duration: 17,
      },
    };
    const preset = editorialTitles[num];
    return {
      displayTitle: preset ? preset.title : lecture.title,
      displaySub: preset
        ? preset.sub
        : `${lecture.moduleC_spelling.ruleTitle} · ${lecture.moduleD_grammar.topicTitle}`,
      duration: preset ? preset.duration : lecture.estimatedMinutes,
    };
  };

  // Weak-Spot Mistake Radar computed from Mistake Notebook & SRS
  const mistakeRadarSummary = useMemo(() => {
    const mistakes = progress.mistakeNotebook || [];
    const spellingMistakes = mistakes.filter((m) => m.category === 'spelling');
    const grammarMistakes = mistakes.filter((m) => m.category === 'grammar');

    // Analyze most common silent-letter pattern in mistakes or due SRS words
    const patternCounts: Record<string, { count: number; sampleWords: string[]; rule: string }> = {
      'Silent K / W (kn-, wr-)': {
        count: 0,
        sampleWords: ['Knowledge', 'Wrinkle', 'Wrapper'],
        rule: 'Drop K before N and W before R at the start of words.',
      },
      'Silent B / T (-mb, -bt, -stle)': {
        count: 0,
        sampleWords: ['Subtle', 'Doubt', 'Castle', 'Listen'],
        rule: 'B is silent in -mb/-bt; T is silent in -sten/-stle.',
      },
      'Silent P / G / H (ps-, -gn, h-)': {
        count: 0,
        sampleWords: ['Psychology', 'Receipt', 'Campaign', 'Honest'],
        rule: 'Greek ps-/pn- drops P; -gn drops G before final nasal.',
      },
      'SVO Word Order & Prepositions': {
        count: grammarMistakes.length,
        sampleWords: ['Discuss about → Discuss', 'Married with → Married to'],
        rule: 'English uses Subject-Verb-Object order and direct transitive verbs.',
      },
    };

    for (const m of spellingMistakes) {
      const text = `${m.prompt} ${m.correctAnswer} ${m.explanation}`.toLowerCase();
      if (text.includes('silent k') || text.includes('silent w') || /\b(kn|wr)/.test(text)) {
        patternCounts['Silent K / W (kn-, wr-)'].count += 2;
      } else if (
        text.includes('silent b') ||
        text.includes('silent t') ||
        /\b(doubt|subtle|plumber|castle|listen|fasten)/.test(text)
      ) {
        patternCounts['Silent B / T (-mb, -bt, -stle)'].count += 2;
      } else {
        patternCounts['Silent P / G / H (ps-, -gn, h-)'].count += 2;
      }
    }

    for (const w of dueSRSWords) {
      const rule = (w.silentLettersSummary || '').toLowerCase();
      if (rule.includes('silent k') || rule.includes('silent w')) {
        patternCounts['Silent K / W (kn-, wr-)'].count += 1;
      } else if (rule.includes('silent b') || rule.includes('silent t')) {
        patternCounts['Silent B / T (-mb, -bt, -stle)'].count += 1;
      } else if (rule.includes('silent p') || rule.includes('silent g') || rule.includes('silent h')) {
        patternCounts['Silent P / G / H (ps-, -gn, h-)'].count += 1;
      }
    }

    const sorted = Object.entries(patternCounts).sort((a, b) => b[1].count - a[1].count);
    const [topTitle, topData] = sorted[0];

    return {
      totalMistakes: mistakes.length,
      dueCount: dueSRSWords.length,
      topWeakArea: topTitle,
      sampleWords: topData.sampleWords,
      ruleSummary: topData.rule,
      isGrammarTop: topTitle.includes('SVO'),
    };
  }, [progress.mistakeNotebook, dueSRSWords]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] dark:bg-[#141210] text-[#1C1917] dark:text-[#F5F2EB]">
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          className: 'mb-16 md:mb-0 font-sans',
        }}
      />
      {/* =================================================================== */}
      {/* TOP HEADER BAR: [भ BhashaSetu] — [Global Search] — [Streak + Avatar] */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 h-16 bg-[#FAF8F4]/95 dark:bg-[#141210]/95 backdrop-blur-md border-b border-[#E6E0D4] dark:border-[#2E2924] px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Gmail-Style Sidebar Hamburger Toggle + Brand Mark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            aria-label={isSidebarCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
            title={isSidebarCollapsed ? 'Expand menu' : 'Main menu (collapse sidebar)'}
            className="hidden md:flex w-10 h-10 rounded-full items-center justify-center text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] hover:bg-[#EFECE4] dark:hover:bg-[#1F1C18] transition-colors focus:outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              navigateTab('home');
            }}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#A82020] text-white flex items-center justify-center font-nepali font-bold text-base shadow-xs">
              भ
            </div>
            <span className="text-lg font-semibold tracking-tight text-[#1C1917] dark:text-[#F5F2EB]">
              BhashaSetu
            </span>
          </a>
        </div>

        {/* Center: Interactive Global Search Bar */}
        <div
          ref={searchContainerRef}
          className={`${
            isMobileSearchOpen
              ? 'absolute inset-x-0 top-0 h-16 z-50 flex items-center gap-2 px-3 bg-[#FAF8F4] dark:bg-[#141210] animate-fade-up'
              : 'hidden'
          } sm:relative sm:inset-auto sm:h-auto sm:z-auto sm:px-0 sm:gap-0 sm:bg-transparent sm:dark:bg-transparent sm:block sm:flex-1 sm:max-w-md sm:mx-auto sm:animate-none`}
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={globalSearchInputRef}
              type="search"
              aria-label="Search words, lessons, or activities"
              enterKeyHint="search"
              value={globalSearchQuery}
              onFocus={() => setIsSearchDropdownOpen(true)}
              onChange={(e) => {
                setGlobalSearchQuery(e.target.value);
                setIsSearchDropdownOpen(true);
              }}
              placeholder="Search words, lessons, or activities"
              className="w-full h-11 sm:h-10 pl-10 pr-14 rounded-xl bg-white sm:bg-[#F3EFE6] dark:bg-[#1F1C18] border border-[#9E2A2B] sm:border-[#E6E0D4] dark:border-[#2E2924] text-base sm:text-sm text-[#1C1917] dark:text-[#F5F2EB] placeholder:text-[#78716C] focus:outline-none focus:border-[#9E2A2B] focus:ring-4 focus:ring-[#F8E7E3] dark:focus:ring-[#9E2A2B]/25 transition-colors [&::-webkit-search-cancel-button]:hidden"
            />
            {globalSearchQuery ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setGlobalSearchQuery('');
                  globalSearchInputRef.current?.focus();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd
                aria-hidden="true"
                className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 font-ipa text-[11px] font-semibold border border-[#DFD7C8] dark:border-[#3A332D] border-b-2 rounded-md px-1.5 text-[#57534E] dark:text-[#A8A29E] bg-[#FAF8F4] dark:bg-[#141210]"
              >
                /
              </kbd>
            )}
          </div>

          {isMobileSearchOpen && (
            <button
              type="button"
              aria-label="Close search"
              onClick={() => {
                setIsMobileSearchOpen(false);
                setIsSearchDropdownOpen(false);
              }}
              className="sm:hidden w-11 h-11 shrink-0 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-[#1C1917] dark:text-[#F5F2EB] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Instant Global Search Results Popover */}
          {isSearchDropdownOpen && globalSearchResults && (
            <div className="absolute left-3 right-3 top-full sm:left-0 sm:right-0 sm:top-auto mt-2 bg-white dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl shadow-xl p-3 space-y-3 z-50 max-h-[420px] overflow-y-auto">
              {globalSearchResults.matchingLectures.length === 0 &&
              globalSearchResults.matchingWords.length === 0 &&
              globalSearchResults.matchingActivities.length === 0 ? (
                <div className="p-3 text-center text-xs text-[#78716C]">
                  No matching lessons, words, or activities found for “{globalSearchQuery}”.
                </div>
              ) : (
                <>
                  {globalSearchResults.matchingLectures.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#A82020] px-2 mb-1">
                        Lessons
                      </div>
                      {globalSearchResults.matchingLectures.map((lec) => (
                        <button
                          key={lec.id}
                          type="button"
                          onClick={() => {
                            openLecture(lec.id, 0);
                            setIsSearchDropdownOpen(false);
                            setIsMobileSearchOpen(false);
                          }}
                          className="w-full px-2.5 py-2 rounded-xl hover:bg-[#FAF8F4] dark:hover:bg-[#141210] text-left flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                              Lesson {String(lec.lectureNumber).padStart(2, '0')} · {lec.title}
                            </div>
                            <div className="text-[11px] text-[#78716C]">{lec.subtitle}</div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#78716C]" />
                        </button>
                      ))}
                    </div>
                  )}

                  {globalSearchResults.matchingWords.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#A82020] px-2 mb-1">
                        Dictionary Words
                      </div>
                      {globalSearchResults.matchingWords.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            speechService.speak(w.word, { rate: progress.preferredSpeechRate });
                            navigateTab('dictionary');
                            setIsSearchDropdownOpen(false);
                            setIsMobileSearchOpen(false);
                          }}
                          className="w-full px-2.5 py-2 rounded-xl hover:bg-[#FAF8F4] dark:hover:bg-[#141210] text-left flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                              {w.word}
                            </span>{' '}
                            <span className="font-ipa text-[#78716C]">{w.ipa}</span>
                            <span className="mx-1.5 text-[#78716C]">·</span>
                            <span className="font-nepali text-[#1F5C3D] dark:text-emerald-400">
                              {w.nepaliMeaning}
                            </span>
                          </div>
                          <Volume2 className="w-3.5 h-3.5 text-[#A82020]" />
                        </button>
                      ))}
                    </div>
                  )}

                  {globalSearchResults.matchingActivities.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#A82020] px-2 mb-1">
                        Practice Arena Activities
                      </div>
                      {globalSearchResults.matchingActivities.map((act) => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => {
                            openArenaTool(act.id);
                            setIsSearchDropdownOpen(false);
                            setIsMobileSearchOpen(false);
                          }}
                          className="w-full px-2.5 py-2 rounded-xl hover:bg-[#FAF8F4] dark:hover:bg-[#141210] text-left flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                              {act.title}
                            </div>
                            <div className="text-[11px] text-[#78716C]">{act.subtitle}</div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#A82020]" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Streak Indicator + Interactive User Avatar Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto sm:ml-0">
          {/* Phones: search icon that expands over the whole bar */}
          <button
            type="button"
            aria-label="Search words, lessons, or activities"
            aria-expanded={isMobileSearchOpen}
            onClick={() => {
              setIsAvatarMenuOpen(false);
              setIsMobileSearchOpen(true);
              setIsSearchDropdownOpen(true);
            }}
            className="sm:hidden w-10 h-10 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-[#1C1917] dark:text-[#F5F2EB] flex items-center justify-center"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => openProgressSubView('overview')}
            aria-label={`${progress.currentStreakDays || 0}-day streak`}
            className="inline-flex items-center gap-1 sm:gap-1.5 h-10 px-2.5 sm:px-3 rounded-full bg-white dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] text-[13px] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B] transition-colors whitespace-nowrap"
            title="View your study streak and shields"
          >
            <Flame className="w-4 h-4 text-[#9E2A2B] dark:text-[#F87171]" />
            <b className="font-extrabold">{progress.currentStreakDays || 0}</b>
            <span className="hidden md:inline font-semibold text-[#6E685F] dark:text-[#A8A29E]">day streak</span>
          </button>

          <button
            type="button"
            onClick={() => openProgressSubView('achievements')}
            aria-label={`Level ${learnerLevelNumber}, ${learnerLevelTitle}`}
            className="inline-flex items-center gap-1 sm:gap-1.5 h-10 px-2.5 sm:px-3 rounded-full bg-white dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] text-[13px] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B] transition-colors whitespace-nowrap"
            title={`${learnerXP.toLocaleString()} XP · view achievements`}
          >
            <Trophy className="w-4 h-4 text-[#B07D2E]" />
            <b className="font-extrabold">
              <span className="hidden sm:inline">Lv </span>
              {learnerLevelNumber}
            </b>
            <span className="hidden lg:inline font-semibold text-[#6E685F] dark:text-[#A8A29E]">{learnerLevelTitle}</span>
          </button>

          {/* User Avatar Button + Rich User Profile, Login & Settings Popover */}
          <div ref={avatarMenuRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setAvatarDraftName(fullDisplayName);
                setIsSearchDropdownOpen(false);
                setIsAvatarMenuOpen((prev) => !prev);
              }}
              aria-label="Open user account, login, and settings menu"
              className="w-9 h-9 rounded-full bg-[#E5DEC9] dark:bg-[#2E2924] border border-[#1C1917]/30 dark:border-[#F5F2EB]/30 text-[#1C1917] dark:text-[#F5F2EB] text-xs font-semibold flex items-center justify-center hover:ring-2 hover:ring-[#A82020]/30 transition-all overflow-hidden"
            >
              {firebaseUser?.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={fullDisplayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{userInitials}</span>
              )}
            </button>

            {isAvatarMenuOpen && (
              <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl shadow-2xl p-5 z-50 space-y-4">
                {/* 1. User Identity Header + Inline Edit */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#EFEAE0] dark:border-[#2E2924]">
                  <div className="flex items-center gap-3 min-w-0">
                    {firebaseUser?.photoURL ? (
                      <img
                        src={firebaseUser.photoURL}
                        alt={fullDisplayName}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover border border-[#E6E0D4]"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#E5DEC9] dark:bg-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] font-semibold text-sm flex items-center justify-center shrink-0">
                        {userInitials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                        {fullDisplayName}
                      </div>
                      <div className="text-xs text-[#78716C] dark:text-[#A8A29E] truncate">
                        {firebaseUser?.email
                          ? firebaseUser.email
                          : `Level ${progress.currentLevel} · ${progress.dailyGoalMinutes || 15}m daily goal`}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingAvatarName((prev) => !prev)}
                    className="px-2.5 py-1 rounded-lg border border-[#E6E0D4] dark:border-[#2E2924] text-[11px] font-medium text-[#A82020] hover:bg-[#FAF8F4]"
                  >
                    {isEditingAvatarName ? 'Cancel' : 'Edit Info'}
                  </button>
                </div>

                {isEditingAvatarName && (
                  <div className="p-3 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] space-y-2">
                    <label className="block text-[11px] font-semibold text-[#57534E] dark:text-[#A8A29E]">
                      Learner Name
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={avatarDraftName}
                        onChange={(e) => setAvatarDraftName(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#E6E0D4] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (avatarDraftName.trim()) {
                            handleUpdateUserName(avatarDraftName.trim());
                          }
                          setIsEditingAvatarName(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#A82020] text-white text-xs font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Learner Info & Stats Snapshot */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924]">
                    <div className="text-sm font-serif font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      {wordsLearnedDisplayCount}
                    </div>
                    <div className="text-[10px] text-[#78716C]">Words learned</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924]">
                    <div className="text-sm font-serif font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      {courseStats.completedCount} / {courseStats.totalUnits}
                    </div>
                    <div className="text-[10px] text-[#78716C]">Lessons done</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924]">
                    <div className="text-sm font-serif font-semibold text-[#1F5C3D] dark:text-emerald-400">
                      {progress.streakFreezeShields ?? 1} Shield
                    </div>
                    <div className="text-[10px] text-[#78716C]">{progress.currentStreakDays}d streak</div>
                  </div>
                </div>

                {/* 3. Google Account Cloud Login & Sync */}
                <div className="p-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB] inline-flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5 text-[#1F5C3D]" />
                      <span>Google Cloud Backup</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#E2EFE7] text-[#1F5C3D] text-[10px] font-semibold">
                      {firebaseUser ? 'Connected' : 'Local Safe'}
                    </span>
                  </div>

                  {firebaseUser ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={isCloudSyncing}
                        onClick={handleManualSync}
                        className="flex-1 py-2 px-3 rounded-lg bg-[#2E6F4E] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                        <span>{isCloudSyncing ? 'Syncing...' : 'Sync Now'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGoogleSignOut}
                        className="py-2 px-3 rounded-lg border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#57534E] hover:text-[#1C1917] inline-flex items-center gap-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isCloudSyncing}
                      onClick={handleGoogleSignIn}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold hover:bg-[#A82020] transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{isCloudSyncing ? 'Connecting...' : 'Sign in with Google Account'}</span>
                    </button>
                  )}
                  {cloudSyncStatusMsg && (
                    <div className="text-[11px] text-[#1F5C3D] dark:text-emerald-400">
                      {cloudSyncStatusMsg}
                    </div>
                  )}
                </div>

                {/* 4. Quick Settings Controls inside Avatar Menu */}
                <div className="space-y-2 pt-1 border-t border-[#EFEAE0] dark:border-[#2E2924] text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#57534E] dark:text-[#A8A29E]">Learning level</span>
                    <div className="flex items-center gap-1">
                      {(['B1', 'B2', 'C1'] as CEFRLevel[]).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleUpdateLevel(lvl)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            progress.currentLevel === lvl
                              ? 'bg-[#A82020] text-white'
                              : 'bg-[#F4F0E8] dark:bg-[#141210] text-[#57534E]'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#57534E] dark:text-[#A8A29E]">Appearance</span>
                    <button
                      type="button"
                      onClick={handleToggleDarkMode}
                      className="px-2.5 py-1 rounded-lg bg-[#F4F0E8] dark:bg-[#141210] text-[#1C1917] dark:text-[#F5F2EB] font-medium inline-flex items-center gap-1.5"
                    >
                      {progress.darkMode ? (
                        <>
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-3.5 h-3.5 text-[#57534E]" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 5. Navigation Links to Full Settings, Achievements & Study Sheet */}
                <div className="pt-2 border-t border-[#EFEAE0] dark:border-[#2E2924] grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      openProgressSubView('achievements');
                    }}
                    className="py-2 px-3 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#A82020] inline-flex items-center justify-center gap-1.5"
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#A82020]" />
                    <span>Achievements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      navigateTab('settings');
                    }}
                    className="py-2 px-3 rounded-xl bg-[#A82020] text-white text-xs font-medium hover:bg-[#8E1B1B] inline-flex items-center justify-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>All Settings</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Achievement & Lock notifications are handled via floating auto-dismissing Sonner toasts */}

      {/* =================================================================== */}
      {/* BODY LAYOUT: PERSISTENT LEFT SIDEBAR + MAIN CONTENT WORKSPACE       */}
      {/* =================================================================== */}
      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        {/* Left Sidebar (Desktop >= md): Gmail-Style Foldable Drawer (240px <-> 72px) */}
        <aside
          aria-label="Primary navigation"
          className={`hidden md:flex shrink-0 flex-col justify-between border-r border-[#E6E0D4] dark:border-[#2E2924] bg-[#FAF8F4] dark:bg-[#141210] py-5 select-none transition-all duration-200 ease-in-out ${
            isSidebarCollapsed ? 'w-[72px] px-2 items-center' : 'w-60 px-4'
          }`}
        >
          <div className="w-full space-y-5">
            {/* Group 1: LEARN */}
            <div>
              {!isSidebarCollapsed && (
                <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8C857B] dark:text-[#A8A29E] mb-2">
                  LEARN
                </div>
              )}
              <nav className="space-y-1">
                {[
                  {
                    id: 'home' as NavTab,
                    label: 'Home',
                    icon: Home,
                    isActive: activeTab === 'home' && !activeLectureId,
                  },
                  {
                    id: 'lessons' as NavTab,
                    label: 'Lessons',
                    icon: BookOpen,
                    isActive: activeTab === 'lessons' || Boolean(activeLectureId),
                  },
                  {
                    id: 'dictionary' as NavTab,
                    label: 'Dictionary',
                    icon: BookMarked,
                    isActive: activeTab === 'dictionary',
                    badgeCount: dueSRSWords.length,
                  },
                  {
                    id: 'arena' as NavTab,
                    label: 'Practice arena',
                    icon: Puzzle,
                    isActive: activeTab === 'arena',
                  },
                ].map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateTab(item.id)}
                      title={isSidebarCollapsed ? item.label : undefined}
                      aria-label={item.label}
                      className={`group relative w-full flex items-center rounded-xl text-sm transition-colors ${
                        isSidebarCollapsed
                          ? 'justify-center h-11 w-11 mx-auto'
                          : 'justify-between px-3 py-2.5'
                      } ${
                        item.isActive
                          ? 'font-semibold text-[#A82020] dark:text-[#F87171] bg-[#F2EDE4] dark:bg-[#1F1C18]'
                          : 'font-normal text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] hover:bg-[#F2EDE4]/60'
                      }`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <IconComponent className="w-4 h-4 shrink-0" />
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </span>
                      {!isSidebarCollapsed && 'badgeCount' in item && item.badgeCount ? (
                        <span
                          title={`${item.badgeCount} words due for SRS review`}
                          className="px-1.5 py-0.5 rounded-full bg-[#9E2A2B]/12 text-[#9E2A2B] dark:text-[#F87171] text-[10px] font-ipa font-semibold shrink-0"
                        >
                          {item.badgeCount} due
                        </span>
                      ) : null}
                      {isSidebarCollapsed && (
                        <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#1C1917] text-[#FAF8F4] text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md">
                          {item.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-[#E6E0D4] dark:border-[#2E2924]" />

            {/* Group 2: YOUR JOURNEY */}
            <div>
              {!isSidebarCollapsed && (
                <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8C857B] dark:text-[#A8A29E] mb-2">
                  YOUR JOURNEY
                </div>
              )}
              <nav className="space-y-1">
                {[
                  {
                    id: 'progress' as NavTab,
                    label: 'Progress',
                    icon: BarChart3,
                    isActive: activeTab === 'progress',
                  },
                  {
                    id: 'settings' as NavTab,
                    label: 'Settings',
                    icon: Sliders,
                    isActive: activeTab === 'settings',
                  },
                  {
                    id: 'about' as NavTab,
                    label: 'About guide',
                    icon: Info,
                    isActive: activeTab === 'about',
                  },
                ].map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateTab(item.id)}
                      title={isSidebarCollapsed ? item.label : undefined}
                      aria-label={item.label}
                      className={`group relative w-full flex items-center rounded-xl text-sm transition-colors ${
                        isSidebarCollapsed
                          ? 'justify-center h-11 w-11 mx-auto'
                          : 'gap-3 px-3 py-2.5'
                      } ${
                        item.isActive
                          ? 'font-semibold text-[#A82020] dark:text-[#F87171] bg-[#F2EDE4] dark:bg-[#1F1C18]'
                          : 'font-normal text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] hover:bg-[#F2EDE4]/60'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 shrink-0" />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      {isSidebarCollapsed && (
                        <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#1C1917] text-[#FAF8F4] text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md">
                          {item.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-[#E6E0D4] dark:border-[#2E2924]" />

            {/* Group 3: AI STUDIO TOOLS */}
            <div className="space-y-1.5">
              {!isSidebarCollapsed && (
                <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8C857B] dark:text-[#A8A29E] mb-2">
                  AI STUDIO
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsAIModalOpen(true)}
                title={isSidebarCollapsed ? 'Create AI lesson' : undefined}
                aria-label="Create AI lesson"
                className={`group relative w-full flex items-center rounded-xl text-xs font-medium transition-colors ${
                  isSidebarCollapsed
                    ? 'justify-center h-11 w-11 mx-auto bg-[#F8E7E3] dark:bg-red-950/60 text-[#A82020] dark:text-red-300'
                    : 'gap-2.5 px-3 py-2.5 bg-[#F8E7E3]/70 dark:bg-red-950/40 text-[#A82020] dark:text-red-300 hover:bg-[#F8E7E3]'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">Create AI lesson</span>}
                {isSidebarCollapsed && (
                  <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#1C1917] text-[#FAF8F4] text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md">
                    Create AI lesson
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsAIRoleplayOpen(true)}
                title={isSidebarCollapsed ? 'AI Roleplay Partner' : undefined}
                aria-label="AI Roleplay Partner"
                className={`group relative w-full flex items-center rounded-xl text-xs font-medium transition-colors ${
                  isSidebarCollapsed
                    ? 'justify-center h-11 w-11 mx-auto bg-[#DCECE2] dark:bg-emerald-950/60 text-[#1F5C3D] dark:text-emerald-300'
                    : 'gap-2.5 px-3 py-2.5 bg-[#DCECE2]/70 dark:bg-emerald-950/40 text-[#1F5C3D] dark:text-emerald-300 hover:bg-[#DCECE2]'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">AI Roleplay Partner</span>}
                {isSidebarCollapsed && (
                  <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#1C1917] text-[#FAF8F4] text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-md">
                    AI Roleplay Partner
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Sidebar Offline Readiness Card */}
          {isSidebarCollapsed ? (
            <div
              title={isOnline ? 'Ready when you are · Offline lessons available' : 'Offline mode active'}
              className="w-11 h-11 rounded-2xl bg-[#EFECE4] dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] flex items-center justify-center"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline ? 'bg-[#2E6F4E]' : 'bg-[#D97706]'
                }`}
              />
            </div>
          ) : (
            <div className="w-full p-3.5 rounded-2xl bg-[#EFECE4] dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924]">
              <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Ready when you are
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#57534E] dark:text-[#A8A29E] mt-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-[#2E6F4E]' : 'bg-[#D97706]'
                  }`}
                />
                <span>Offline lessons available</span>
              </div>
            </div>
          )}
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 min-w-0">
          {activeLecture ? (
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
              onSelectTool={setInitialArenaTool}
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
              firebaseUser={firebaseUser}
              isCloudSyncing={isCloudSyncing}
              cloudSyncStatusMsg={cloudSyncStatusMsg}
              onGoogleSignIn={handleGoogleSignIn}
              onGoogleSignOut={handleGoogleSignOut}
              onPullFromCloud={handlePullFromCloud}
              onUpdateUserName={handleUpdateUserName}
              onToggleDailyReminder={handleToggleDailyReminder}
              onToggleHapticFeedback={handleToggleHapticFeedback}
              onResetAllProgress={handleResetAllProgress}
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
              firebaseUser={firebaseUser}
              isCloudSyncing={isCloudSyncing}
              cloudSyncStatusMsg={cloudSyncStatusMsg}
              onGoogleSignIn={handleGoogleSignIn}
              onGoogleSignOut={handleGoogleSignOut}
              onPullFromCloud={handlePullFromCloud}
              onUpdateUserName={handleUpdateUserName}
              onToggleDailyReminder={handleToggleDailyReminder}
              onToggleHapticFeedback={handleToggleHapticFeedback}
              onResetAllProgress={handleResetAllProgress}
            />
          ) : activeTab === 'about' ? (
            <AboutView
              languageMode={languageMode}
              preferredSpeechRate={progress.preferredSpeechRate}
              onStartCurriculum={() => navigateTab('lessons')}
              onOpenSettings={() => navigateTab('settings')}
            />
          ) : dashboardStudySheetMode ? (
            <PrintableStudySheetModal
              initialFocusMode={dashboardStudySheetMode}
              allLexiconWords={massiveLexicon}
              savedWordIds={progress.savedWordIds}
              masteredWordIds={progress.masteredWordIds || []}
              wordSRS={progress.wordSRS}
              mistakeNotebook={progress.mistakeNotebook}
              onClose={() => setDashboardStudySheetMode(null)}
            />
          ) : activeTab === 'lessons' ? (
            /* =============================================================== */
            /* LESSONS VIEW (Exact Editorial Match to Screenshot 2)            */
            /* =============================================================== */
            <div className="w-full max-w-[82rem] mx-auto px-[0.625rem] sm:px-[1rem] lg:px-[1.5rem] py-[0.875rem] sm:py-[1.25rem] pb-24 space-y-5">
              {/* Top Heading */}
              <div>
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] text-[#A82020] dark:text-[#F87171] mb-1.5">
                  YOUR CURRICULUM
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1C1917] dark:text-[#F5F2EB] tracking-tight">
                  Lessons for your next step
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-[#6E685F] dark:text-[#A8A29E] mt-1">
                  A guided path from everyday fluency to confident expression.
                </p>
              </div>

              {/* Search Bar + Filter Pills + "+ Create AI lesson" Button on opposite side */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 min-w-0">
                  {/* Small Search Bar by Topic */}
                  <div className="relative w-full sm:w-56 shrink-0">
                    <Search className="w-3.5 h-3.5 text-[#78716C] dark:text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={lessonTopicSearch}
                      onChange={(e) => setLessonTopicSearch(e.target.value)}
                      placeholder="Search lesson by topic..."
                      className="w-full h-9 pl-8 pr-7 rounded-full bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] text-xs text-[#1C1917] dark:text-[#F5F2EB] placeholder:text-[#8C857B] focus:outline-none focus:border-[#A82020] transition-colors"
                    />
                    {lessonTopicSearch && (
                      <button
                        type="button"
                        onClick={() => setLessonTopicSearch('')}
                        aria-label="Clear topic search"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Level Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'ALL', label: 'All levels' },
                        { id: 'B1', label: 'B1 Foundation' },
                        { id: 'B2', label: 'B2 Workplace' },
                        { id: 'C1', label: 'C1 Advanced' },
                      ] as { id: 'ALL' | CEFRLevel; label: string }[]
                    ).map((pill) => {
                      const isActive = levelFilter === pill.id;
                      return (
                        <button
                          key={pill.id}
                          type="button"
                          onClick={() => setLevelFilter(pill.id)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-[#F6E6E2] dark:bg-red-950/60 text-[#A82020] dark:text-red-300 font-semibold'
                              : 'bg-[#F2EFE9] dark:bg-[#1F1C18] text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917]'
                          }`}
                        >
                          {pill.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Create AI Lesson */}
                <button
                  type="button"
                  onClick={() => setIsAIModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#A82020] hover:bg-[#8E1B1B] active:scale-[0.98] text-white text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 self-start lg:self-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create AI lesson</span>
                </button>
              </div>

              {/* Lesson & Track Progress Card (Step Completion + Track Quiz Accuracy) */}
              <LessonProgressCard
                lectures={CORE_SYLLABUS}
                progress={progress}
                recommendedLecture={recommendedLecture}
                activeLevelFilter={levelFilter}
                onSelectLevelFilter={(lvl) => setLevelFilter(lvl)}
                onOpenLecture={(lectureId, step = 0) => openLecture(lectureId, step)}
              />

              {/* Level Group Containers (B1, B2, C1) */}
              <div className="space-y-6">
                {(
                  [
                    {
                      level: 'B1' as CEFRLevel,
                      badgeBg: 'bg-[#DCECE2] text-[#1F5C3D]',
                      title: 'Foundation · Everyday confidence',
                      rangeLabel: 'Lessons 01–04',
                    },
                    {
                      level: 'B2' as CEFRLevel,
                      badgeBg: 'bg-[#DCE6F2] text-[#284B7A]',
                      title: 'Workplace · Clear communication',
                      rangeLabel: 'Lessons 05–08',
                    },
                    {
                      level: 'C1' as CEFRLevel,
                      badgeBg: 'bg-[#F6E3DF] text-[#A82020]',
                      title: 'Advanced · Academic & leadership',
                      rangeLabel: 'Lessons 09–12',
                    },
                  ]
                )
                  .filter((grp) => levelFilter === 'ALL' || levelFilter === grp.level)
                  .map((grp) => {
                    const topicQuery = lessonTopicSearch.trim().toLowerCase();
                    const groupLessons = CORE_SYLLABUS.filter((l) => {
                      if (l.level !== grp.level) return false;
                      if (!topicQuery) return true;
                      const { displayTitle, displaySub } = getEditorialLessonPresentation(l);
                      const matchesText =
                        displayTitle.toLowerCase().includes(topicQuery) ||
                        displaySub.toLowerCase().includes(topicQuery) ||
                        l.title.toLowerCase().includes(topicQuery) ||
                        l.subtitle.toLowerCase().includes(topicQuery) ||
                        l.category.toLowerCase().includes(topicQuery) ||
                        l.moduleC_spelling.ruleTitle.toLowerCase().includes(topicQuery) ||
                        l.moduleD_grammar.topicTitle.toLowerCase().includes(topicQuery) ||
                        l.moduleA_vocabulary.some(
                          (v) =>
                            v.word.toLowerCase().includes(topicQuery) ||
                            v.nepaliMeaning.toLowerCase().includes(topicQuery)
                        );
                      return matchesText;
                    });

                    if (groupLessons.length === 0) return null;

                    return (
                      <section
                        key={grp.level}
                        className="rounded-2xl bg-[#F5F2EB] dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] p-3.5 sm:p-5 space-y-3"
                      >
                        {/* Track Header Row */}
                        <div className="flex items-center justify-between gap-2 px-1 py-1">
                          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                            <span
                              className={`px-2 py-0.5 sm:px-2.5 rounded-full text-[10px] sm:text-xs font-semibold shrink-0 ${grp.badgeBg}`}
                            >
                              {grp.level}
                            </span>
                            <h2 className="text-xs sm:text-sm md:text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                              {grp.title}
                            </h2>
                          </div>
                          <span className="text-[10px] sm:text-xs text-[#78716C] dark:text-[#A8A29E] shrink-0">
                            {grp.rangeLabel}
                          </span>
                        </div>

                        {/* Lesson Cards inside Group */}
                        <div className="space-y-2.5">
                          {groupLessons.map((lesson) => {
                            const syllabusIdx = CORE_SYLLABUS.findIndex(
                              (item) => item.id === lesson.id
                            );
                            const prevLesson =
                              syllabusIdx > 0 ? CORE_SYLLABUS[syllabusIdx - 1] : null;
                            const isCompleted = progress.completedUnitIds.includes(lesson.id);
                            const stepsDone =
                              progress.completedStepsByLecture?.[lesson.id]?.length || 0;
                            const isUnlocked =
                              syllabusIdx === 0 ||
                              isCompleted ||
                              stepsDone > 0 ||
                              (prevLesson
                                ? progress.completedUnitIds.includes(prevLesson.id)
                                : true);
                            const isInProgress = !isCompleted && stepsDone > 0;
                            const isReadyToStart = !isCompleted && stepsDone === 0 && isUnlocked;

                            const { displayTitle, displaySub, duration } =
                              getEditorialLessonPresentation(lesson);
                            const isPreviewExpanded = expandedLessonPreviewId === lesson.id;

                            // Border color according to status:
                            // - Finished: Green
                            // - In progress: Warm Terracotta / Crimson
                            // - Unlocked / Ready to start: Amber Gold
                            // - Locked / Up next: Cool Slate-Stone
                            const statusBorderClass = isCompleted
                              ? 'border-[1.5px] border-[#2E6F4E] dark:border-emerald-500/80'
                              : isInProgress
                              ? 'border-[1.5px] border-[#C86D63] dark:border-[#F87171] shadow-xs'
                              : isReadyToStart
                              ? 'border-[1.5px] border-[#D97706] dark:border-amber-500/80 shadow-xs'
                              : 'border-[1.5px] border-[#CBD5E1] dark:border-[#334155]';

                            const numberBadgeClass = isCompleted
                              ? 'bg-[#DCECE2] dark:bg-emerald-950/60 text-[#1F5C3D] dark:text-emerald-300'
                              : isInProgress
                              ? 'bg-[#F8E7E3] dark:bg-red-950/50 text-[#A82020] dark:text-red-300'
                              : isReadyToStart
                              ? 'bg-[#FEF3C7] dark:bg-amber-950/50 text-[#B45309] dark:text-amber-300'
                              : 'bg-[#EDE8DC] dark:bg-[#26221E] text-[#57534E] dark:text-[#A8A29E]';

                            const triggerLockedMessage = (e?: React.MouseEvent) => {
                              if (e) e.stopPropagation();
                              speechService.playWrongTone();
                              const fallbackPrev = prevLesson || lesson;
                              const prevPres = getEditorialLessonPresentation(fallbackPrev);
                              toast.warning(
                                `Lecture ${String(lesson.lectureNumber).padStart(2, '0')} is locked`,
                                {
                                  description: `Finish Lecture ${String(
                                    fallbackPrev.lectureNumber
                                  ).padStart(2, '0')} (${prevPres.displayTitle}) first to unlock it.`,
                                  duration: 5000,
                                  action: {
                                    label: `Open Lecture ${String(
                                      fallbackPrev.lectureNumber
                                    ).padStart(2, '0')}`,
                                    onClick: () => openLecture(fallbackPrev.id, 0),
                                  },
                                }
                              );
                            };

                            return (
                              <div
                                key={lesson.id}
                                className={`rounded-2xl bg-white dark:bg-[#141210] transition-all overflow-hidden ${statusBorderClass}`}
                              >
                                {/* Tap Card Row -> Opens/Closes Folded Part */}
                                <div
                                  onClick={() =>
                                    setExpandedLessonPreviewId((prev) =>
                                      prev === lesson.id ? null : lesson.id
                                    )
                                  }
                                  className="p-3 sm:p-5 flex items-start sm:items-center justify-between gap-2.5 sm:gap-4 cursor-pointer select-none"
                                >
                                  {/* Left: Proportional Number Box + Full Mobile-Readable Title & Subtitle */}
                                  <div className="flex items-start sm:items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
                                    <div
                                      className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center font-serif text-xs sm:text-base font-semibold shrink-0 mt-0.5 sm:mt-0 ${numberBadgeClass}`}
                                    >
                                      {String(lesson.lectureNumber).padStart(2, '0')}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <h3 className="text-[0.8125rem] sm:text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB] leading-snug line-clamp-2 sm:line-clamp-1">
                                        {displayTitle}
                                      </h3>
                                      <p className="text-[0.6875rem] sm:text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5 line-clamp-1">
                                        {displaySub}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-2 mt-1 md:hidden text-[0.625rem] text-[#78716C] dark:text-[#A8A29E]">
                                        <span>
                                          {isInProgress
                                            ? `Step ${Math.max(1, stepsDone + 1)}/5 · ${duration}m left`
                                            : `5 steps · ${duration} min`}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right: Desktop Steps Info + Compact Mobile Status Action (Completed / Continue / Start / Lock Icon) */}
                                  <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 self-center">
                                    <span className="hidden md:inline-block text-xs text-[#78716C] dark:text-[#A8A29E] whitespace-nowrap">
                                      {isInProgress
                                        ? `Step ${Math.max(1, stepsDone + 1)} of 5 · ${duration} min left`
                                        : `5 steps · ${duration} min`}
                                    </span>

                                    {isCompleted ? (
                                      <div className="flex items-center gap-1.5 sm:gap-2">
                                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#DCECE2] dark:bg-emerald-950/60 text-[#1F5C3D] dark:text-emerald-300 text-xs font-medium">
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Completed</span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openLecture(lesson.id, 0);
                                          }}
                                          className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-[#2E6F4E]/40 bg-[#DCECE2]/50 dark:bg-emerald-950/40 text-[11px] sm:text-xs font-semibold text-[#1F5C3D] dark:text-emerald-300 hover:bg-[#DCECE2] transition-colors"
                                        >
                                          Start
                                        </button>
                                      </div>
                                    ) : isInProgress ? (
                                      <div className="flex items-center gap-1.5 sm:gap-2">
                                        <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-[#F0ECE1] dark:bg-[#26221E] text-[#6E685F] dark:text-[#A8A29E] text-xs font-medium">
                                          In progress
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openLecture(
                                              lesson.id,
                                              Math.min(4, stepsDone) as ModuleStep
                                            );
                                          }}
                                          className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl border border-[#C86D63] dark:border-[#F87171] bg-white dark:bg-[#1F1C18] text-[11px] sm:text-xs font-semibold text-[#A82020] dark:text-[#F87171] hover:bg-[#FAF8F4] transition-colors"
                                        >
                                          Continue
                                        </button>
                                      </div>
                                    ) : isReadyToStart ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openLecture(lesson.id, 0);
                                        }}
                                        className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#A82020] hover:bg-[#8E1B1B] text-white text-[11px] sm:text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-xs"
                                      >
                                        <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                                        <span>Start</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={triggerLockedMessage}
                                        title="Locked — finish the previous lecture first"
                                        aria-label={`Lecture ${lesson.lectureNumber} is locked. Click for details.`}
                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#F2EFE9] dark:bg-[#26221E] border border-[#CBD5E1] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#A82020] hover:border-[#A82020]/50 flex items-center justify-center transition-colors"
                                      >
                                        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      </button>
                                    )}

                                    <span
                                      aria-hidden="true"
                                      className="p-0.5 sm:p-1 text-[#78716C] dark:text-[#A8A29E]"
                                    >
                                      {isPreviewExpanded ? (
                                        <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      ) : (
                                        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {/* Folded Part: Opens on Tap with Full Info, 5 Steps, Key Vocabulary & Start/Continue CTA */}
                                {isPreviewExpanded && (
                                  <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-[#EFEAE0] dark:border-[#2E2924] bg-[#FAF8F4]/80 dark:bg-[#1A1714] space-y-3">
                                    {/* Full Title & Details for Mobile Clarity */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                      <div className="space-y-0.5">
                                        <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                                          {displayTitle}
                                        </div>
                                        <div className="text-xs text-[#6E685F] dark:text-[#A8A29E]">
                                          {displaySub} · 5 steps · {duration} min
                                        </div>
                                      </div>

                                      {isUnlocked ? (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            openLecture(
                                              lesson.id,
                                              isInProgress
                                                ? (Math.min(4, stepsDone) as ModuleStep)
                                                : 0
                                            )
                                          }
                                          className="px-4 py-2 rounded-xl bg-[#A82020] hover:bg-[#8E1B1B] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0 transition-colors"
                                        >
                                          <Play className="w-3.5 h-3.5 fill-current" />
                                          <span>
                                            {isInProgress
                                              ? 'Continue lecture'
                                              : isCompleted
                                              ? 'Start again'
                                              : 'Start lecture'}
                                          </span>
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={triggerLockedMessage}
                                          className="px-3.5 py-1.5 rounded-xl bg-[#FEF3C7] dark:bg-amber-950/60 border border-[#D97706]/50 text-[#B45309] dark:text-amber-300 text-xs font-medium inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                                        >
                                          <Lock className="w-3.5 h-3.5" />
                                          <span>
                                            Finish Lecture{' '}
                                            {String(prevLesson?.lectureNumber || 1).padStart(2, '0')}{' '}
                                            first to unlock
                                          </span>
                                        </button>
                                      )}
                                    </div>

                                    {/* 5 Interactive Module Steps */}
                                    <div className="space-y-1.5">
                                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                                        5 interactive steps in this lecture:
                                      </span>
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        {[
                                          { step: 0 as ModuleStep, label: '01 · Vocabulary' },
                                          { step: 1 as ModuleStep, label: '02 · Silent Phonics' },
                                          { step: 2 as ModuleStep, label: '03 · Grammar & Syntax' },
                                          { step: 3 as ModuleStep, label: '04 · Live Dialogue' },
                                          { step: 4 as ModuleStep, label: '05 · Mastery Quiz' },
                                        ].map((st) => {
                                          const stepCompleted =
                                            isCompleted ||
                                            (progress.completedStepsByLecture?.[lesson.id] || []).includes(
                                              st.step
                                            );
                                          return (
                                            <button
                                              key={st.step}
                                              type="button"
                                              onClick={() => {
                                                if (!isUnlocked) {
                                                  triggerLockedMessage();
                                                  return;
                                                }
                                                openLecture(lesson.id, st.step);
                                              }}
                                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium inline-flex items-center gap-1 transition-colors ${
                                                stepCompleted
                                                  ? 'bg-[#DCECE2]/60 dark:bg-emerald-950/40 border-[#2E6F4E]/40 text-[#1F5C3D] dark:text-emerald-300'
                                                  : 'bg-white dark:bg-[#141210] border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#A82020] text-[#1C1917] dark:text-[#F5F2EB]'
                                              }`}
                                            >
                                              {stepCompleted && <Check className="w-3 h-3" />}
                                              {!isUnlocked && <Lock className="w-2.5 h-2.5 opacity-60" />}
                                              <span>{st.label}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Key Words Preview with Instant Phonetics Popover */}
                                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                      <span className="text-[#78716C] mr-1">
                                        Key Words (tap for phonetics):
                                      </span>
                                      {lesson.moduleA_vocabulary.slice(0, 6).map((vocab) => (
                                        <WordPhoneticsPopover
                                          key={vocab.id}
                                          word={vocab.word}
                                          ipa={vocab.ipa}
                                          partOfSpeech={vocab.partOfSpeech}
                                          nepaliMeaning={vocab.nepaliMeaning}
                                          silentLettersSummary={vocab.silentLettersSummary}
                                          englishExample={vocab.englishExample}
                                          segments={vocab.segments}
                                          isSaved={progress.savedWordIds.includes(vocab.id)}
                                          preferredSpeechRate={progress.preferredSpeechRate}
                                          onToggleSave={() => handleToggleSaveWord(vocab.id)}
                                        >
                                          <button
                                            type="button"
                                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-xs inline-flex items-center gap-1 hover:border-[#A82020]"
                                          >
                                            <Volume2 className="w-3 h-3 text-[#A82020]" />
                                            <span className="font-bold">{vocab.word}</span>
                                            <span className="font-nepali text-[#1F5C3D] text-[11px]">
                                              ({vocab.nepaliMeaning})
                                            </span>
                                          </button>
                                        </WordPhoneticsPopover>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}

                {/* Empty search state if no lessons match */}
                {lessonTopicSearch.trim() &&
                  CORE_SYLLABUS.filter((l) => {
                    if (levelFilter !== 'ALL' && l.level !== levelFilter) return false;
                    const q = lessonTopicSearch.trim().toLowerCase();
                    const { displayTitle, displaySub } = getEditorialLessonPresentation(l);
                    return (
                      displayTitle.toLowerCase().includes(q) ||
                      displaySub.toLowerCase().includes(q) ||
                      l.title.toLowerCase().includes(q) ||
                      l.subtitle.toLowerCase().includes(q) ||
                      l.category.toLowerCase().includes(q) ||
                      l.moduleC_spelling.ruleTitle.toLowerCase().includes(q) ||
                      l.moduleD_grammar.topicTitle.toLowerCase().includes(q) ||
                      l.moduleA_vocabulary.some(
                        (v) =>
                          v.word.toLowerCase().includes(q) ||
                          v.nepaliMeaning.toLowerCase().includes(q)
                      )
                    );
                  }).length === 0 && (
                    <div className="rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] p-6 text-center space-y-2">
                      <p className="text-sm font-medium text-[#1C1917] dark:text-[#F5F2EB]">
                        No lessons found for “{lessonTopicSearch}”
                      </p>
                      <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                        Try another topic keyword or create a custom AI lesson on this topic.
                      </p>
                    </div>
                  )}
              </div>

              {/* Bottom Section: Your custom lessons (Exact match to Screenshot 2) */}
              <section className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                    Your custom lessons
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsAIModalOpen(true)}
                    className="text-xs font-medium text-[#A82020] dark:text-[#F87171] hover:underline"
                  >
                    + Make a lesson
                  </button>
                </div>

                {progress.customLectures.length === 0 ? (
                  <div className="rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] p-5 text-sm text-[#78716C] dark:text-[#A8A29E]">
                    AI-created lessons appear here and are saved for offline study.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {enrichSyllabusWithEnhancements(progress.customLectures).map((customLec) => (
                      <div
                        key={customLec.id}
                        onClick={() => openLecture(customLec.id, 0)}
                        className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#A82020] flex items-center justify-between gap-3 sm:gap-4 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[#F8E7E3] text-[#A82020] flex items-center justify-center font-serif font-semibold text-xs sm:text-sm shrink-0">
                            AI
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-[13px] sm:text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB] leading-snug line-clamp-2 sm:line-clamp-1">
                              {customLec.title}
                            </h3>
                            <p className="text-[11px] sm:text-xs text-[#78716C] dark:text-[#A8A29E] line-clamp-1">
                              {customLec.subtitle}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-[#A82020] text-white text-[11px] sm:text-xs font-medium shrink-0"
                        >
                          Open
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : (
            /* =============================================================== */
            /* HOME VIEW: TWO-COLUMN DESKTOP ARCHITECTURE & BRAND PALETTE      */
            /* =============================================================== */
            <div className="w-full max-w-[82rem] mx-auto px-[0.625rem] sm:px-[1rem] lg:px-[1.5rem] py-[0.875rem] sm:py-[1.25rem] pb-24 space-y-6">
              {/* Top Editorial Greeting Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1 border-b border-[#EAE4D8] dark:border-[#26221E]">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9E2A2B] dark:text-[#F87171]">
                    {new Date()
                      .toLocaleDateString('en-US', { weekday: 'long' })
                      .toUpperCase()}{' '}
                    · YOUR LEARNING SPACE
                  </div>
                  <h1 className="font-serif text-3xl sm:text-[38px] leading-tight font-bold text-[#1C1917] dark:text-[#F5F2EB] tracking-tight mt-1">
                    Namaste, {firstName}
                  </h1>
                  <p className="text-sm text-[#6E685F] dark:text-[#A8A29E] mt-1">
                    A little practice today goes a long way.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-end shrink-0 pb-0.5">
                  <button
                    type="button"
                    onClick={() => navigateTab('lessons')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#F2EDE2] dark:bg-[#221E1A] border border-[#E2DACB] dark:border-[#2E2924] text-[#9E2A2B] dark:text-[#F87171] text-xs font-bold hover:border-[#9E2A2B]/50 transition-colors"
                  >
                    {progress.currentLevel || 'B1'} ·{' '}
                    {progress.currentLevel === 'C1'
                      ? 'Advanced Track'
                      : progress.currentLevel === 'B2'
                      ? 'Workplace Track'
                      : 'Foundation Track'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTab('lessons')}
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#57534E] dark:text-[#A8A29E] hover:border-[#9E2A2B] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] transition-colors"
                  >
                    Syllabus ({courseStats.completedCount}/{courseStats.totalUnits}) →
                  </button>
                </div>
              </div>

              {/* ============================================================= */}
              {/* ASYMMETRIC TWO-COLUMN DESKTOP GRID (8 COLS STAGE / 4 COLS RAIL) */}
              {/* ============================================================= */}
              <div className="flex flex-col gap-5 sm:gap-6 lg:grid lg:grid-cols-12 lg:items-start">
                {/* =========================================================== */}
                {/* LEFT COLUMN (8 COLS): PRIMARY LEARNING STAGE                */}
                {/* =========================================================== */}
                <div className="contents lg:block lg:col-span-8 lg:space-y-6 min-w-0">
                  {/* 1. UNIFIED HERO + ACTIVE LESSON STEP TRACKER CARD */}
                  <div className="order-2 lg:order-none min-w-0">
                  {(() => {
                    const completedSteps =
                      progress.completedStepsByLecture?.[recommendedLecture.id] || [];
                    const nextStepIdx = Math.min(4, completedSteps.length) as ModuleStep;
                    const editorialLesson = getEditorialLessonPresentation(recommendedLecture);
                    const stepItems: { step: ModuleStep; num: string; label: string }[] = [
                      { step: 0, num: '01', label: 'Vocab' },
                      { step: 1, num: '02', label: 'Audio' },
                      { step: 2, num: '03', label: 'Spelling' },
                      { step: 3, num: '04', label: 'Grammar' },
                      { step: 4, num: '05', label: 'Dialogue' },
                    ];

                    return (
                      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EFEADE] via-[#EAE1D2] to-[#E2D6C3] dark:from-[#221E1A] dark:via-[#1E1A17] dark:to-[#181512] border border-[#E4DDD0] dark:border-[#2E2924] p-5 sm:p-7 shadow-xs">
                        {/* Subtle Devanagari Watermark */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none select-none absolute right-5 -bottom-3 font-nepali text-[64px] sm:text-[74px] font-bold text-[#CFC2AE]/40 dark:text-[#3A332C]/30 leading-none"
                        >
                          भाषासेतु
                        </div>

                        {/* Top Hero Split: Active Lesson Copy + Tilted Open Book Illustration */}
                        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                          <div className="sm:col-span-8 space-y-3 pr-6 sm:pr-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9E2A2B] dark:text-[#F87171]">
                                CONTINUE YOUR PATH
                              </span>
                              <span className="text-xs text-[#8C8275]">·</span>
                              <span className="px-2.5 py-0.5 rounded-md bg-[#FAF8F4]/85 dark:bg-[#141210]/80 border border-[#DFD7C8] dark:border-[#2E2924] text-[11px] font-semibold text-[#57534E] dark:text-[#A8A29E]">
                                Lesson {String(recommendedLecture.lectureNumber).padStart(2, '0')} of{' '}
                                {courseStats.totalUnits} · {recommendedLecture.level}
                              </span>
                            </div>

                            <h2 className="font-serif text-2xl sm:text-[30px] leading-[1.18] font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                              {editorialLesson.displayTitle}
                            </h2>

                            <p className="text-xs sm:text-sm text-[#5F584E] dark:text-[#A8A29E] max-w-xl leading-relaxed">
                              {editorialLesson.displaySub} — pick up at{' '}
                              <strong className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                                Step {Math.min(5, completedSteps.length + 1)} of 5
                              </strong>{' '}
                              and build spoken confidence at your own pace.
                            </p>

                            {/* Metadata & Primary CTA Row */}
                            <div className="pt-1 flex flex-wrap items-center gap-3 sm:gap-4">
                              <button
                                type="button"
                                onClick={() => openLecture(recommendedLecture.id, nextStepIdx)}
                                className="px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#872223] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors shadow-xs"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>
                                  {completedSteps.length > 0 ? 'Resume Lesson' : 'Start Lesson'}
                                </span>
                              </button>

                              <div className="flex items-center gap-3.5 text-xs text-[#655E54] dark:text-[#A8A29E]">
                                <span className="inline-flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-[#78716C]" />
                                  <span>{editorialLesson.duration} min</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5 text-[#78716C]" />
                                  <span>{completedSteps.length}/5 steps done</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Side: Tilted Open Book (अ | A) Audio Medallion */}
                          <div className="hidden sm:flex sm:col-span-4 justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                speechService.speak(editorialLesson.displayTitle, {
                                  rate: progress.preferredSpeechRate,
                                })
                              }
                              title="Click to hear lesson title pronunciation"
                              className="w-36 h-36 lg:w-40 lg:h-40 rounded-full bg-[#D7C6AE]/75 dark:bg-[#2C2620] border border-[#CBB89D]/60 dark:border-[#3A332C] flex items-center justify-center relative group transition-transform hover:scale-[1.02] focus:outline-none"
                            >
                              <svg
                                viewBox="0 0 220 165"
                                className="w-32 h-24 lg:w-36 lg:h-28 -rotate-6 drop-shadow-[0_8px_16px_rgba(28,25,23,0.08)]"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <rect
                                  x="18"
                                  y="20"
                                  width="86"
                                  height="122"
                                  rx="6"
                                  fill="#FAF7F0"
                                  stroke="#E2DACB"
                                  strokeWidth="1.5"
                                />
                                <rect
                                  x="112"
                                  y="20"
                                  width="86"
                                  height="122"
                                  rx="6"
                                  fill="#FAF7F0"
                                  stroke="#E2DACB"
                                  strokeWidth="1.5"
                                />
                                <rect x="103" y="18" width="10" height="126" rx="4" fill="#9E2A2B" />
                                <line
                                  x1="34"
                                  y1="44"
                                  x2="86"
                                  y2="44"
                                  stroke="#CFC8BC"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                />
                                <line
                                  x1="34"
                                  y1="62"
                                  x2="78"
                                  y2="62"
                                  stroke="#CFC8BC"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                />
                                <line
                                  x1="128"
                                  y1="44"
                                  x2="180"
                                  y2="44"
                                  stroke="#CFC8BC"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                />
                                <line
                                  x1="128"
                                  y1="62"
                                  x2="172"
                                  y2="62"
                                  stroke="#CFC8BC"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                />
                                <text
                                  x="62"
                                  y="114"
                                  textAnchor="middle"
                                  fill="#9E2A2B"
                                  fontSize="36"
                                  fontWeight="600"
                                  fontFamily="Noto Sans Devanagari, serif"
                                >
                                  अ
                                </text>
                                <text
                                  x="155"
                                  y="114"
                                  textAnchor="middle"
                                  fill="#2D6A4F"
                                  fontSize="38"
                                  fontWeight="500"
                                  fontFamily="Newsreader, Georgia, serif"
                                >
                                  A
                                </text>
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Unified 5-Step Interactive Lesson Stepper */}
                        <div className="relative z-10 mt-5 pt-4 border-t border-[#DCD3C2] dark:border-[#2E2924] space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold uppercase tracking-[0.08em] text-[10px] text-[#655E54] dark:text-[#A8A29E]">
                              ACTIVE LESSON STEPS — JUMP TO ANY STAGE
                            </span>
                            <button
                              type="button"
                              onClick={() => navigateTab('lessons')}
                              className="text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171] hover:underline"
                            >
                              All {courseStats.totalUnits} lessons →
                            </button>
                          </div>

                          <div className="grid grid-flow-col auto-cols-[minmax(6.25rem,1fr)] sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-5 gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1 sm:mx-0 sm:px-0 sm:pb-0 snap-x">
                            {stepItems.map((item) => {
                              const isStepDone = completedSteps.includes(item.step);
                              const isStepCurrent = !isStepDone && item.step === nextStepIdx;
                              return (
                                <button
                                  key={item.step}
                                  type="button"
                                  onClick={() => openLecture(recommendedLecture.id, item.step)}
                                  className={`px-2 py-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                                    isStepDone
                                      ? 'bg-[#E6F0EA] dark:bg-emerald-950/50 border-[#2D6A4F]/40 text-[#1F5C3D] dark:text-emerald-300'
                                      : isStepCurrent
                                      ? 'bg-[#FAF8F4] dark:bg-[#141210] border-[#9E2A2B] ring-1 ring-[#9E2A2B]/30 text-[#1C1917] dark:text-[#F5F2EB]'
                                      : 'bg-[#FAF8F4]/70 dark:bg-[#141210]/60 border-[#DFD7C8] dark:border-[#2E2924] text-[#6E685F] dark:text-[#A8A29E] hover:border-[#9E2A2B]/50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-ipa text-[10px] font-bold opacity-80">
                                      {item.num}
                                    </span>
                                    {isStepDone ? (
                                      <Check className="w-3 h-3 text-[#2D6A4F] dark:text-emerald-400 stroke-[2.5]" />
                                    ) : isStepCurrent ? (
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#9E2A2B]" />
                                    ) : null}
                                  </div>
                                  <span className="text-[11px] sm:text-xs font-bold truncate mt-1">
                                    {item.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* 3 CEFR Track Progress Pills (Brand Palette: Sage, Ochre, Crimson) */}
                          <div className="grid grid-flow-col auto-cols-[minmax(8.5rem,1fr)] sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-3 gap-2 pt-1 overflow-x-auto no-scrollbar -mx-1 px-1 sm:mx-0 sm:px-0">
                            {[
                              {
                                id: 'B1' as const,
                                label: 'B1 Foundation',
                                done: courseStats.b1Done,
                                total: courseStats.b1Total,
                                barColor: 'bg-[#2D6A4F]',
                              },
                              {
                                id: 'B2' as const,
                                label: 'B2 Workplace',
                                done: courseStats.b2Done,
                                total: courseStats.b2Total,
                                barColor: 'bg-[#B8863B]',
                              },
                              {
                                id: 'C1' as const,
                                label: 'C1 Advanced',
                                done: courseStats.c1Done,
                                total: courseStats.c1Total,
                                barColor: 'bg-[#9E2A2B]',
                              },
                            ].map((trk) => {
                              const pct =
                                trk.total > 0 ? Math.round((trk.done / trk.total) * 100) : 0;
                              return (
                                <button
                                  key={trk.label}
                                  type="button"
                                  onClick={() => {
                                    setLevelFilter(trk.id);
                                    navigateTab('lessons');
                                  }}
                                  className="p-2.5 rounded-xl bg-[#FAF8F4]/90 dark:bg-[#141210]/90 border border-[#DFD7C8] dark:border-[#2E2924] text-left hover:border-[#9E2A2B]/50 transition-colors"
                                >
                                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                                    <span className="truncate">{trk.label}</span>
                                    <span className="font-ipa shrink-0 ml-1 text-[#6E685F] dark:text-[#A8A29E]">
                                      {trk.done}/{trk.total}
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-[#E6E0D4] dark:bg-[#26221E] mt-1.5 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${trk.barColor} transition-all duration-300`}
                                      style={{ width: `${Math.max(8, pct)}%` }}
                                    />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    );
                  })()}
                  </div>

                  {/* 2. QUICK TOOLS: 4-CARD EDITORIAL PRACTICE GRID (BRAND COLORS ONLY) */}
                  <div className="order-4 lg:order-none min-w-0">
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-serif font-bold text-xl sm:text-[22px] text-[#1C1917] dark:text-[#F5F2EB]">
                          Quick Tools
                        </h2>
                      </div>
                      <span className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                        One-tap practice labs
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Tool 1: Speaking Practice (Forest Sage) */}
                      <button
                        type="button"
                        onClick={() => openArenaTool('shadowing')}
                        className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#2D6A4F] p-4 text-left flex flex-col justify-between min-h-[120px] transition-all"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 80 80"
                          className="pointer-events-none absolute -right-3 -top-3 w-20 h-20 text-[#2D6A4F]/10 dark:text-emerald-400/10"
                        >
                          <circle cx="52" cy="24" r="18" fill="currentColor" />
                          <circle cx="64" cy="48" r="14" fill="currentColor" />
                          <circle cx="34" cy="42" r="12" fill="currentColor" />
                        </svg>
                        <div className="w-9 h-9 rounded-xl bg-[#E3EFE8] dark:bg-emerald-950/70 text-[#1F5C3D] dark:text-emerald-300 flex items-center justify-center">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div className="mt-3">
                          <div className="font-bold text-xs sm:text-sm text-[#1C1917] dark:text-[#F5F2EB] group-hover:text-[#1F5C3D] dark:group-hover:text-emerald-300 transition-colors">
                            Speaking Practice
                          </div>
                          <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                            Voice + pitch feedback
                          </div>
                        </div>
                      </button>

                      {/* Tool 2: Chat with AI (Himalayan Crimson) */}
                      <button
                        type="button"
                        onClick={() => setIsAIRoleplayOpen(true)}
                        className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#9E2A2B] p-4 text-left flex flex-col justify-between min-h-[120px] transition-all"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 80 80"
                          className="pointer-events-none absolute -right-3 -top-3 w-20 h-20 text-[#9E2A2B]/10 dark:text-red-400/10"
                        >
                          <circle cx="52" cy="24" r="18" fill="currentColor" />
                          <circle cx="64" cy="48" r="14" fill="currentColor" />
                          <circle cx="34" cy="42" r="12" fill="currentColor" />
                        </svg>
                        <div className="w-9 h-9 rounded-xl bg-[#F8E7E3] dark:bg-red-950/70 text-[#9E2A2B] dark:text-red-300 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="mt-3">
                          <div className="font-bold text-xs sm:text-sm text-[#1C1917] dark:text-[#F5F2EB] group-hover:text-[#9E2A2B] dark:group-hover:text-red-300 transition-colors">
                            Chat with AI
                          </div>
                          <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                            Free conversation
                          </div>
                        </div>
                      </button>

                      {/* Tool 3: Fix my Grammar (Warm Sandstone & Espresso — Brand Aligned) */}
                      <button
                        type="button"
                        onClick={() => {
                          sentenceCoachSectionRef.current?.scrollIntoView({
                            behavior: scrollBehavior(),
                            block: 'center',
                          });
                          window.setTimeout(() => {
                            sentenceCoachInputRef.current?.focus();
                          }, 350);
                        }}
                        className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#8C6527] p-4 text-left flex flex-col justify-between min-h-[120px] transition-all"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 80 80"
                          className="pointer-events-none absolute -right-3 -top-3 w-20 h-20 text-[#8C6527]/10 dark:text-amber-400/10"
                        >
                          <circle cx="52" cy="24" r="18" fill="currentColor" />
                          <circle cx="64" cy="48" r="14" fill="currentColor" />
                          <circle cx="34" cy="42" r="12" fill="currentColor" />
                        </svg>
                        <div className="w-9 h-9 rounded-xl bg-[#EFE9DC] dark:bg-[#2A241D] text-[#6E5023] dark:text-amber-300 flex items-center justify-center">
                          <Wand2 className="w-4 h-4" />
                        </div>
                        <div className="mt-3">
                          <div className="font-bold text-xs sm:text-sm text-[#1C1917] dark:text-[#F5F2EB] group-hover:text-[#6E5023] dark:group-hover:text-amber-300 transition-colors">
                            Fix my Grammar
                          </div>
                          <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                            SVO vs SOV checker
                          </div>
                        </div>
                      </button>

                      {/* Tool 4: Silent-Letter Lab (Warm Ochre) */}
                      <button
                        type="button"
                        onClick={() => openArenaTool('sprint')}
                        className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#B8863B] p-4 text-left flex flex-col justify-between min-h-[120px] transition-all"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 80 80"
                          className="pointer-events-none absolute -right-3 -top-3 w-20 h-20 text-[#B8863B]/12 dark:text-amber-400/10"
                        >
                          <circle cx="52" cy="24" r="18" fill="currentColor" />
                          <circle cx="64" cy="48" r="14" fill="currentColor" />
                          <circle cx="34" cy="42" r="12" fill="currentColor" />
                        </svg>
                        <div className="w-9 h-9 rounded-xl bg-[#F6EEDF] dark:bg-amber-950/70 text-[#8C6527] dark:text-amber-300 flex items-center justify-center">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div className="mt-3">
                          <div className="font-bold text-xs sm:text-sm text-[#1C1917] dark:text-[#F5F2EB] group-hover:text-[#8C6527] dark:group-hover:text-amber-300 transition-colors">
                            Silent-Letter Lab
                          </div>
                          <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                            60s phonics sprint
                          </div>
                        </div>
                      </button>
                    </div>
                  </section>
                  </div>

                  {/* 3. PAIRED VOCABULARY ROW: WORD OF THE DAY + SILENT-LETTER SPOTLIGHT */}
                  <div className="order-5 lg:order-none min-w-0">
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                    {/* Left Vocab Card: Word of the Day */}
                    {isInitialHydrating || isWordOfTheDayLoading || !wordOfTheDay ? (
                      <div
                        aria-label="Loading Word of the Day"
                        className="rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] p-5 flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-3.5 w-28 rounded-md skeleton-shimmer" />
                            <div className="h-5 w-20 rounded-full skeleton-shimmer" />
                          </div>
                          <div className="flex items-baseline gap-3">
                            <div className="h-8 w-36 rounded-lg skeleton-shimmer" />
                            <div className="h-5 w-24 rounded-md skeleton-shimmer" />
                          </div>
                          <div className="h-4 w-full rounded-md skeleton-shimmer" />
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <div className="h-9 w-24 rounded-xl skeleton-shimmer" />
                          <div className="h-9 w-20 rounded-xl skeleton-shimmer" />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] p-5 flex flex-col justify-between gap-4">
                        <div className="space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9E2A2B] dark:text-[#F87171]">
                              WORD OF THE DAY
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-[#F2EFE9] dark:bg-[#26221E] text-[11px] font-medium text-[#57534E] dark:text-[#A8A29E]">
                                {wordOfTheDay.partOfSpeech} · {wordOfTheDay.level}
                              </span>
                              {wordOfTheDay.silentLettersSummary &&
                                wordOfTheDay.silentLettersSummary !== 'Standard pronunciation' && (
                                  <span className="px-2 py-0.5 rounded-full bg-[#F8E7E3] dark:bg-red-950/50 text-[11px] font-medium text-[#9E2A2B] dark:text-red-300">
                                    {wordOfTheDay.silentLettersSummary}
                                  </span>
                                )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-baseline gap-2.5 pt-0.5">
                            <h2 className="font-serif font-bold text-2xl sm:text-[28px] text-[#1C1917] dark:text-[#F5F2EB]">
                              {wordOfTheDay.segments?.map((seg, idx) =>
                                seg.silent ? (
                                  <span
                                    key={idx}
                                    className="text-[#9E2A2B] dark:text-[#F87171] underline decoration-dotted underline-offset-4"
                                  >
                                    {seg.text}
                                  </span>
                                ) : (
                                  <span key={idx}>{seg.text}</span>
                                )
                              )}
                            </h2>
                            <span className="font-ipa text-xs sm:text-sm text-[#78716C] dark:text-[#A8A29E]">
                              {wordOfTheDay.ipa}
                            </span>
                            <span className="font-nepali text-base font-bold text-[#1F5C3D] dark:text-emerald-400">
                              {wordOfTheDay.nepaliMeaning}
                            </span>
                          </div>

                          <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                            “{wordOfTheDay.englishExample}”
                            {wordOfTheDay.nepaliExampleTranslation && (
                              <span className="font-nepali block mt-1 text-[#78716C] dark:text-[#8C857B]">
                                ({wordOfTheDay.nepaliExampleTranslation})
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#EFEAE0] dark:border-[#2E2924] flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                speechService.triggerHaptic('light');
                                speechService.speak(wordOfTheDay.word, {
                                  rate: progress.preferredSpeechRate,
                                });
                              }}
                              aria-label={`Play pronunciation for ${wordOfTheDay.word}`}
                              className="px-3.5 py-2 rounded-xl bg-[#9E2A2B] hover:bg-[#872223] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                speechService.triggerHaptic('light');
                                speechService.speak(wordOfTheDay.word, {
                                  rate: 0.55,
                                });
                              }}
                              title="Listen slowly at 0.55x speed"
                              className="px-2.5 py-2 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#9E2A2B] text-xs font-medium text-[#57534E] dark:text-[#A8A29E] transition-colors"
                            >
                              0.5×
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleCycleWordOfTheDay}
                            title="Show another high-frequency word"
                            className="px-3 py-2 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#9E2A2B] text-xs font-medium text-[#57534E] dark:text-[#A8A29E] inline-flex items-center gap-1.5 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Another word</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Right Vocab Card: Silent-Letter Word Spotlight + AI Phonetic Guide */}
                    {isInitialHydrating || isSpotlightTransitioning || !activeSRSQuickWord ? (
                      <div
                        aria-label="Loading Silent-Letter Word Spotlight"
                        className="rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] p-5 flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="h-3.5 w-44 rounded-md skeleton-shimmer" />
                          <div className="h-7 w-32 rounded-lg skeleton-shimmer" />
                          <div className="h-4 w-5/6 rounded-md skeleton-shimmer" />
                        </div>
                        <div className="h-9 w-full rounded-xl skeleton-shimmer" />
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] p-5 flex flex-col justify-between gap-4">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9E2A2B] dark:text-[#F87171]">
                              SILENT-LETTER SPOTLIGHT ({(srsQuickIdx % dueSRSWords.length) + 1}/
                              {dueSRSWords.length})
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  speechService.triggerHaptic('light');
                                  speechService.speak(activeSRSQuickWord.word, {
                                    rate: progress.preferredSpeechRate,
                                  });
                                }}
                                className="w-8 h-8 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] flex items-center justify-center text-[#9E2A2B] hover:border-[#9E2A2B]"
                                title="Listen at 1.0x speed"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  speechService.triggerHaptic('light');
                                  speechService.speak(activeSRSQuickWord.word, {
                                    rate: 0.5,
                                  });
                                }}
                                className="h-8 px-2 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-[11px] font-medium text-[#57534E] dark:text-[#A8A29E] hover:border-[#9E2A2B]"
                                title="Listen slowly at 0.5x speed"
                              >
                                0.5×
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-baseline gap-2.5">
                            <h2 className="font-serif font-bold text-2xl sm:text-[28px] text-[#1C1917] dark:text-[#F5F2EB]">
                              {activeSRSQuickWord.segments?.map((seg, idx) =>
                                seg.silent ? (
                                  <span
                                    key={idx}
                                    className="text-[#9E2A2B] dark:text-[#F87171] underline decoration-dotted underline-offset-4"
                                  >
                                    {seg.text}
                                  </span>
                                ) : (
                                  <span key={idx}>{seg.text}</span>
                                )
                              )}
                            </h2>
                            <span className="font-ipa text-xs sm:text-sm text-[#78716C]">
                              {activeSRSQuickWord.ipa}
                            </span>
                          </div>

                          <div className="text-xs text-[#6E685F] dark:text-[#A8A29E] leading-relaxed">
                            <span className="font-semibold text-[#9E2A2B] dark:text-[#F87171]">
                              {activeSRSQuickWord.silentLettersSummary}
                            </span>{' '}
                            · “{activeSRSQuickWord.englishExample}”
                          </div>

                          {srsQuickFlipped && (
                            <div className="p-2.5 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] font-nepali text-xs sm:text-sm text-[#1F5C3D] dark:text-emerald-400">
                              अर्थ: <strong>{activeSRSQuickWord.nepaliMeaning}</strong> —{' '}
                              <span className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                                {activeSRSQuickWord.nepaliExampleTranslation}
                              </span>
                            </div>
                          )}

                          {isSpotlightAILoading && (
                            <div
                              aria-label="Loading AI Phonetic Breakdown"
                              className="p-3 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] space-y-2"
                            >
                              <div className="h-3.5 w-40 rounded-md skeleton-shimmer" />
                              <div className="h-4 w-full rounded-md skeleton-shimmer" />
                            </div>
                          )}

                          {!isSpotlightAILoading &&
                            spotlightAIExplanation &&
                            spotlightAIExplanation.word === activeSRSQuickWord.word && (
                              <div className="p-3 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold uppercase tracking-wider text-[10px] text-[#9E2A2B]">
                                    AI Phonetic Guide
                                  </span>
                                  <span className="font-nepali font-semibold text-[#1F5C3D] dark:text-emerald-400">
                                    उच्चारण: {spotlightAIExplanation.nepaliSoundComparison}
                                  </span>
                                </div>
                                <p className="font-nepali text-[#1C1917] dark:text-[#F5F2EB]">
                                  <strong>किन साइलेन्ट:</strong>{' '}
                                  {spotlightAIExplanation.silentReasonNepali}
                                </p>
                                <p className="font-nepali text-[#1F5C3D] dark:text-emerald-400">
                                  <strong>ट्रिक:</strong> {spotlightAIExplanation.memoryTrickNepali}
                                </p>
                              </div>
                            )}
                        </div>

                        <div className="pt-3 border-t border-[#EFEAE0] dark:border-[#2E2924] flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleExplainSpotlightWord(activeSRSQuickWord)}
                            disabled={isSpotlightAILoading}
                            className="px-3 py-2 rounded-xl bg-[#F4E6E2] dark:bg-red-950/50 text-[#9E2A2B] dark:text-red-300 text-xs font-medium inline-flex items-center gap-1.5 hover:bg-[#EDD8D2] transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>
                              {spotlightAIExplanation?.word === activeSRSQuickWord.word
                                ? 'Hide AI Guide'
                                : 'Ask AI Why'}
                            </span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            {!srsQuickFlipped ? (
                              <button
                                type="button"
                                onClick={() => {
                                  speechService.triggerHaptic('light');
                                  setSrsQuickFlipped(true);
                                }}
                                className="px-3 py-2 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B]"
                              >
                                Reveal Nepali
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleCycleSpotlightWord(activeSRSQuickWord.id)}
                                className="px-3 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-medium"
                              >
                                Mastered ✓
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCycleSpotlightWord()}
                              className="px-2.5 py-2 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#78716C] hover:text-[#1C1917]"
                            >
                              Next →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                  </div>

                  {/* 4. YOUR WEAK SPOTS & MISTAKE RADAR */}
                  <div className="order-6 lg:order-none min-w-0">
                  {isInitialHydrating ? (
                    <section
                      aria-label="Loading Weak-Spot Mistake Radar"
                      className="rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] p-5 sm:p-6 space-y-3"
                    >
                      <div className="h-4 w-40 rounded-md skeleton-shimmer" />
                      <div className="h-6 w-64 rounded-lg skeleton-shimmer" />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2">
                        <div className="h-14 rounded-xl skeleton-shimmer" />
                        <div className="h-14 rounded-xl skeleton-shimmer" />
                        <div className="h-14 rounded-xl skeleton-shimmer" />
                      </div>
                    </section>
                  ) : (
                    <section className="rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] p-5 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9E2A2B] dark:text-[#F87171]">
                              YOUR WEAK SPOTS &amp; MISTAKE RADAR
                            </span>
                            <span className="text-xs text-[#78716C]">·</span>
                            <span className="text-xs font-medium text-[#9E2A2B] dark:text-red-300">
                              {mistakeRadarSummary.totalMistakes > 0
                                ? `${mistakeRadarSummary.totalMistakes} logged mistakes`
                                : `${mistakeRadarSummary.dueCount} SRS words queued`}
                            </span>
                          </div>
                          <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1C1917] dark:text-[#F5F2EB]">
                            Focus Area: {mistakeRadarSummary.topWeakArea}
                          </h3>
                          <p className="text-xs text-[#6E685F] dark:text-[#A8A29E]">
                            {mistakeRadarSummary.ruleSummary} · Key targets:{' '}
                            <span className="font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                              {mistakeRadarSummary.sampleWords.join(', ')}
                            </span>
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              openArenaTool(
                                mistakeRadarSummary.isGrammarTop ? 'interference' : 'sprint'
                              )
                            }
                            className="px-4 py-2 rounded-xl bg-[#9E2A2B] hover:bg-[#872223] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Targeted Fix →</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-[#EFEAE0] dark:border-[#2E2924]">
                        <button
                          type="button"
                          onClick={() => openArenaTool('minimal-pairs')}
                          className="min-h-[60px] px-3.5 py-3 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#2D6A4F] flex items-center justify-between gap-3 text-left transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-9 h-9 rounded-xl bg-[#E3EFE8] dark:bg-emerald-950/60 text-[#1F5C3D] dark:text-emerald-300 flex items-center justify-center shrink-0">
                              <Mic className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-xs sm:text-sm text-[#1C1917] dark:text-[#F5F2EB] truncate">
                                Pronunciation — Silent Letters
                              </div>
                              <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E] truncate">
                                Targets: {mistakeRadarSummary.sampleWords.slice(0, 2).join(', ')}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-[#78716C] dark:text-[#A8A29E] shrink-0 tabular-nums">
                            4 min
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openArenaTool('interference')}
                          className="min-h-[60px] px-3.5 py-3 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#9E2A2B] flex items-center justify-between gap-3 text-left transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-9 h-9 rounded-xl bg-[#F8E7E3] dark:bg-red-950/60 text-[#9E2A2B] dark:text-red-300 flex items-center justify-center shrink-0">
                              <Layers className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-xs sm:text-sm text-[#1C1917] dark:text-[#F5F2EB] truncate">
                                Grammar — SVO vs SOV Order
                              </div>
                              <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E] truncate">
                                Articles, prepositions &amp; tense
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-[#78716C] dark:text-[#A8A29E] shrink-0 tabular-nums">
                            5 min
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openArenaTool('detective')}
                          className="min-h-[60px] px-3.5 py-3 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#B8863B] flex items-center justify-between gap-3 text-left transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-9 h-9 rounded-xl bg-[#F6EEDF] dark:bg-amber-950/60 text-[#8C6527] dark:text-amber-300 flex items-center justify-center shrink-0">
                              <Search className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-xs sm:text-sm text-[#1C1917] dark:text-[#F5F2EB] truncate">
                                Spelling — Silent Detective
                              </div>
                              <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E] truncate">
                                Spot unpronounced letters
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-[#78716C] dark:text-[#A8A29E] shrink-0 tabular-nums">
                            3 min
                          </span>
                        </button>
                      </div>
                    </section>
                  )}
                  </div>

                  {/* 5. AI SENTENCE & GRAMMAR COACH (SVO vs SOV) */}
                  <div className="order-7 lg:order-none min-w-0">
                  <section
                    ref={sentenceCoachSectionRef}
                    className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9E2A2B] dark:text-[#F87171] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI SENTENCE &amp; GRAMMAR COACH</span>
                        </div>
                        <h2 className="font-serif font-bold text-xl text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                          Check grammar or translate a Nepali thought
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAIRoleplayOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-[#FAF8F4] dark:bg-[#26221E] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#2D6A4F] text-xs font-medium text-[#2D6A4F] dark:text-emerald-400 inline-flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Live Roleplay</span>
                      </button>
                    </div>

                    <p className="text-xs text-[#6E685F] dark:text-[#A8A29E]">
                      Type any English sentence to check grammar and SVO word order, or write in
                      Nepali to get natural workplace English phrasing.
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'I am having a doubt in this work.',
                        'Yesterday I have gone to office.',
                        'म भोलि बिहान मिटिङमा उपस्थित हुनेछु।',
                      ].map((sample) => (
                        <button
                          key={sample}
                          type="button"
                          onClick={() => handleRunSentenceCoach(sample)}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#9E2A2B] text-[11px] text-[#57534E] dark:text-[#A8A29E] transition-colors"
                        >
                          “{sample}”
                        </button>
                      ))}
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleRunSentenceCoach();
                      }}
                      className="flex items-center gap-2 pt-1"
                    >
                      <input
                        ref={sentenceCoachInputRef}
                        type="text"
                        value={sentenceCoachInput}
                        onChange={(e) => setSentenceCoachInput(e.target.value)}
                        placeholder="Type an English sentence or Nepali thought..."
                        className="flex-1 h-10 px-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-xs sm:text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#9E2A2B]"
                      />
                      <button
                        type="submit"
                        disabled={isSentenceCoachLoading || !sentenceCoachInput.trim()}
                        className="h-10 px-4 rounded-xl bg-[#9E2A2B] hover:bg-[#872223] disabled:opacity-40 text-white text-xs font-medium inline-flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        {isSentenceCoachLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Check</span>
                      </button>
                    </form>

                    {sentenceCoachError && (
                      <div className="text-xs text-[#9E2A2B] dark:text-red-300 bg-[#F8E7E3]/60 px-3 py-2 rounded-xl">
                        {sentenceCoachError}
                      </div>
                    )}

                    {isSentenceCoachLoading && (
                      <div
                        aria-label="Analyzing sentence"
                        className="p-4 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] space-y-2.5"
                      >
                        <div className="h-4 w-24 rounded-md skeleton-shimmer" />
                        <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
                        <div className="h-10 w-full rounded-lg skeleton-shimmer" />
                      </div>
                    )}

                    {!isSentenceCoachLoading && sentenceCoachResult && (
                      <div className="p-4 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#E3EFE8] text-[#1F5C3D] font-semibold text-[10px]">
                            {sentenceCoachResult.focusTag}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              speechService.speak(sentenceCoachResult.correctedEnglish, {
                                rate: progress.preferredSpeechRate,
                              })
                            }
                            className="text-[#9E2A2B] dark:text-[#F87171] font-medium inline-flex items-center gap-1 hover:underline"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </button>
                        </div>

                        <div>
                          <span className="text-[#78716C]">Polished English: </span>
                          <strong className="text-sm text-[#1C1917] dark:text-[#F5F2EB]">
                            “{sentenceCoachResult.correctedEnglish}”
                          </strong>
                        </div>

                        <div>
                          <span className="text-[#78716C]">Natural Workplace Option: </span>
                          <span className="text-[#1F5C3D] dark:text-emerald-400 font-medium">
                            “{sentenceCoachResult.naturalAlternative}”
                          </span>
                        </div>

                        <div className="font-nepali text-[#1C1917] dark:text-[#F5F2EB]">
                          <span className="text-[#78716C] font-sans">Nepali Meaning: </span>
                          {sentenceCoachResult.nepaliMeaning}
                        </div>

                        <div className="pt-1.5 border-t border-[#EFEAE0] dark:border-[#2E2924] font-nepali text-[#57534E] dark:text-[#A8A29E] space-y-1">
                          <p>
                            <strong>व्याकरण टिप:</strong> {sentenceCoachResult.grammarTipNepali}
                          </p>
                          <p>
                            <strong>वाक्य संरचना (SVO vs SOV):</strong>{' '}
                            {sentenceCoachResult.svoComparisonNote}
                          </p>
                        </div>

                        <div className="pt-1.5 border-t border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-2 text-[10px] text-[#78716C] dark:text-[#A8A29E]">
                          <span>AI-generated coaching · Verify against core curriculum rules</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSentenceCoachResult(null);
                              setSentenceCoachInput('');
                            }}
                            className="text-[#9E2A2B] dark:text-[#F87171] font-semibold hover:underline"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                  </div>
                </div>

                {/* =========================================================== */}
                {/* RIGHT COLUMN (4 COLS): DAILY COMPANION, GOALS & HABIT RAIL  */}
                {/* =========================================================== */}
                <aside className="contents lg:block lg:col-span-4 lg:space-y-6 lg:sticky lg:top-6">
                  {/* 1. BRAND-ALIGNED "TODAY GOALS" CARD (WARM SANDSTONE & PAPER) */}
                  <div className="order-3 lg:order-none min-w-0">
                  {(() => {
                    const todayMins = homeWeekBars.entries[6]?.minutes || 0;
                    const targetMins = progress.dailyGoalMinutes || 15;
                    const isTodayGoalMet = todayMins >= targetMins;
                    const ringPct = Math.min(100, Math.round((todayMins / targetMins) * 100));
                    const ringRadius = 30;
                    const ringCircumference = 2 * Math.PI * ringRadius;
                    const ringOffset =
                      ringCircumference - (Math.max(8, ringPct) / 100) * ringCircumference;

                    const totalXPEarned = learnerXP;

                    return (
                      <section className="rounded-2xl overflow-hidden bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] shadow-xs">
                        {/* Editorial Warm Sandstone Header Strip */}
                        <div className="px-5 py-3.5 bg-[#F2EDE2] dark:bg-[#221E1A] border-b border-[#E6E0D4] dark:border-[#2E2924] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isTodayGoalMet ? 'bg-[#2D6A4F]' : 'bg-[#9E2A2B]'
                              }`}
                            />
                            <h2 className="font-serif font-bold text-base sm:text-lg text-[#1C1917] dark:text-[#F5F2EB] tracking-tight">
                              Today&apos;s Goal
                            </h2>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigateTab('settings')}
                            title="Adjust daily study goal"
                            className="px-2.5 py-0.5 rounded-full bg-[#FAF8F4] dark:bg-[#141210] border border-[#DFD7C8] dark:border-[#2E2924] text-xs font-bold text-[#57534E] dark:text-[#A8A29E] hover:border-[#9E2A2B] tabular-nums transition-colors"
                          >
                            {todayMins} / {targetMins} mins
                          </button>
                        </div>

                        {/* Card Body: Circular SVG Ring + Streak & XP Metrics */}
                        <div className="p-5 space-y-4">
                          <div className="flex items-center gap-4">
                            {/* Circular Progress Ring */}
                            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 76 76">
                                <circle
                                  cx="38"
                                  cy="38"
                                  r={ringRadius}
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="6.5"
                                  className="text-[#EAE5DC] dark:text-[#2C2824]"
                                />
                                <circle
                                  cx="38"
                                  cy="38"
                                  r={ringRadius}
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="6.5"
                                  strokeLinecap="round"
                                  strokeDasharray={ringCircumference}
                                  strokeDashoffset={ringOffset}
                                  className={
                                    isTodayGoalMet
                                      ? 'text-[#2D6A4F] dark:text-emerald-400 transition-all duration-500'
                                      : 'text-[#9E2A2B] dark:text-[#F87171] transition-all duration-500'
                                  }
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                                <span className="font-serif font-bold text-lg text-[#1C1917] dark:text-[#F5F2EB] tabular-nums">
                                  {todayMins}
                                </span>
                                <span className="text-[10px] text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                                  min
                                </span>
                              </div>
                            </div>

                            {/* Streak & XP Earned Split */}
                            <div className="flex-1 min-w-0 grid grid-cols-2 divide-x divide-[#EAE5DC] dark:divide-[#2E2924]">
                              <button
                                type="button"
                                onClick={() => openProgressSubView('overview')}
                                className="pr-3 text-left group"
                              >
                                <div className="flex items-center gap-1.5">
                                  <Flame className="w-4 h-4 text-[#9E2A2B] dark:text-[#F87171] shrink-0" />
                                  <span className="font-serif font-bold text-xl text-[#1C1917] dark:text-[#F5F2EB] tabular-nums group-hover:text-[#9E2A2B] transition-colors">
                                    {progress.currentStreakDays || 0}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                                  Day Streak
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => setIsLevelUpModalOpen(true)}
                                className="pl-3 text-left group"
                              >
                                <div className="flex items-center gap-1.5">
                                  <Sparkles className="w-4 h-4 text-[#B8863B] shrink-0" />
                                  <span className="font-serif font-bold text-xl text-[#1C1917] dark:text-[#F5F2EB] tabular-nums group-hover:text-[#8C6527] transition-colors">
                                    {totalXPEarned.toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                                  XP Earned
                                </div>
                              </button>
                            </div>
                          </div>

                          {/* Status Message + Level Celebration Pill */}
                          <div className="pt-3 border-t border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                                isTodayGoalMet
                                  ? 'bg-[#E3EFE8] dark:bg-emerald-950/60 text-[#1F5C3D] dark:text-emerald-300'
                                  : 'bg-[#F8E7E3]/75 dark:bg-red-950/40 text-[#9E2A2B] dark:text-red-300'
                              }`}
                            >
                              {isTodayGoalMet ? (
                                <>
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                  <span>Daily goal completed!</span>
                                </>
                              ) : (
                                <span>
                                  {Math.max(1, targetMins - todayMins)} min left to hit today&apos;s
                                  goal
                                </span>
                              )}
                            </span>

                            <button
                              type="button"
                              onClick={() => setIsLevelUpModalOpen(true)}
                              className="px-2.5 py-1 rounded-lg bg-[#F5EFE4] dark:bg-[#2A241D] border border-[#E2D6C1] dark:border-[#3D3429] text-[11px] font-bold text-[#7C5826] dark:text-amber-300 hover:border-[#B8863B] inline-flex items-center gap-1 transition-colors shrink-0"
                            >
                              <Trophy className="w-3 h-3 text-[#B8863B]" />
                              <span>Lvl {learnerLevelNumber}</span>
                            </button>
                          </div>
                        </div>
                      </section>
                    );
                  })()}
                  </div>

                  {/* 2. YOUR WEEK: 7-DAY BAR CHART WITH GOAL-MET INDICATORS */}
                  <div className="order-8 lg:order-none min-w-0">
                  <section className="rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-serif font-bold text-lg sm:text-xl text-[#1C1917] dark:text-[#F5F2EB]">
                          Your Week
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => openProgressSubView('overview')}
                        className="text-xs font-medium text-[#9E2A2B] dark:text-[#F87171] hover:underline"
                      >
                        Details →
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                          {selectedWeekDayIdx !== null
                            ? `${homeWeekBars.entries[selectedWeekDayIdx]?.dayName} studied`
                            : 'Minutes studied this week'}
                        </span>
                        <span className="font-serif font-bold text-xl text-[#1C1917] dark:text-[#F5F2EB] tabular-nums">
                          {selectedWeekDayIdx !== null
                            ? `${homeWeekBars.entries[selectedWeekDayIdx]?.minutes} min`
                            : `${homeWeekBars.totalMinutes} min`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#78716C] dark:text-[#A8A29E] tabular-nums">
                        {selectedWeekDayIdx !== null ? (
                          <span>
                            {homeWeekBars.entries[selectedWeekDayIdx]?.isGoalMet ? (
                              <strong className="text-[#2D6A4F] dark:text-emerald-400 font-semibold">
                                Daily goal met ({homeWeekBars.dailyGoal}m target) ✓
                              </strong>
                            ) : (
                              <span>
                                {homeWeekBars.entries[selectedWeekDayIdx]?.minutes} /{' '}
                                {homeWeekBars.dailyGoal} min toward daily goal
                              </span>
                            )}
                          </span>
                        ) : (
                          <span>
                            <strong className="text-[#2D6A4F] dark:text-emerald-400 font-semibold">
                              {homeWeekBars.goalsMetCount} of 7
                            </strong>{' '}
                            daily goals met
                          </span>
                        )}
                        <span>Target · {homeWeekBars.dailyGoal}m/day</span>
                      </div>
                    </div>

                    {/* 7 Vertical Capsule Bars M T W T F S S */}
                    <div className="relative pt-1">
                      <div className="grid grid-cols-7 gap-2 items-end">
                        {homeWeekBars.entries.map((bar) => {
                          const isSelected = selectedWeekDayIdx === bar.idx;
                          const isTodayBar = bar.idx === 6;
                          return (
                            <button
                              key={bar.idx}
                              type="button"
                              onClick={() => {
                                speechService.triggerHaptic('light');
                                setSelectedWeekDayIdx((prev) =>
                                  prev === bar.idx ? null : bar.idx
                                );
                              }}
                              title={`${bar.dayName}: ${bar.minutes} min studied (${
                                bar.isGoalMet
                                  ? `Daily ${homeWeekBars.dailyGoal}m goal met`
                                  : `${homeWeekBars.dailyGoal}m daily goal`
                              })`}
                              className="flex flex-col items-center gap-1.5 group focus:outline-none"
                            >
                              <div className="h-4 flex items-center justify-center">
                                {bar.isGoalMet ? (
                                  <span
                                    aria-label="Daily goal met"
                                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                                      isSelected
                                        ? 'bg-[#1F5C3D] text-white ring-2 ring-[#2D6A4F]/30'
                                        : 'bg-[#2D6A4F] dark:bg-emerald-500 text-white'
                                    }`}
                                  >
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </span>
                                ) : bar.isFilled ? (
                                  <span className="text-[9px] font-medium text-[#8C6527] dark:text-amber-400 tabular-nums">
                                    {bar.minutes}m
                                  </span>
                                ) : (
                                  <span className="w-1 h-1 rounded-full bg-[#D6D0C4] dark:bg-[#3A342E]" />
                                )}
                              </div>

                              <div
                                className={`relative w-full max-w-[28px] h-20 rounded-xl bg-[#EAE6DF] dark:bg-[#26221E] flex items-end overflow-hidden transition-all ${
                                  isSelected
                                    ? 'ring-2 ring-[#9E2A2B]/60 dark:ring-[#F87171]/60'
                                    : ''
                                }`}
                              >
                                <div
                                  aria-hidden="true"
                                  className="absolute inset-x-0 border-t border-dashed border-[#78716C]/35 dark:border-[#A8A29E]/30 z-10 pointer-events-none"
                                  style={{ bottom: `${homeWeekBars.goalThresholdPct}%` }}
                                />

                                <div
                                  className={`w-full rounded-xl transition-all duration-300 ${
                                    bar.isGoalMet
                                      ? isTodayBar
                                        ? 'bg-gradient-to-t from-[#1F5C3D] to-[#2D6A4F] dark:from-emerald-600 dark:to-emerald-400'
                                        : 'bg-[#2D6A4F] dark:bg-emerald-500 group-hover:bg-[#1F5C3D]'
                                      : isTodayBar
                                      ? 'bg-[#9E2A2B]'
                                      : bar.isFilled
                                      ? 'bg-[#B8863B] dark:bg-amber-500/80 group-hover:bg-[#9E6F2B]'
                                      : 'bg-[#DFDAD0] dark:bg-[#3A342E]'
                                  }`}
                                  style={{ height: `${bar.pct}%` }}
                                />
                              </div>

                              <span
                                className={`text-[11px] leading-none ${
                                  isSelected
                                    ? 'font-bold text-[#9E2A2B] dark:text-[#F87171]'
                                    : bar.isGoalMet
                                    ? 'font-bold text-[#2D6A4F] dark:text-emerald-400'
                                    : isTodayBar
                                    ? 'font-semibold text-[#1C1917] dark:text-[#F5F2EB]'
                                    : 'text-[#78716C] dark:text-[#A8A29E]'
                                }`}
                              >
                                {bar.letter}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#EFEAE0] dark:border-[#2E2924] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#78716C] dark:text-[#A8A29E]">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F] dark:bg-emerald-500 inline-flex items-center justify-center text-white">
                            <Check className="w-1.5 h-1.5 stroke-[3]" />
                          </span>
                          <span>Goal met</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-xs bg-[#B8863B]" />
                          <span>Partial</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-xs bg-[#9E2A2B]" />
                          <span>Today</span>
                        </span>
                      </div>
                      <span>Tap bar to inspect</span>
                    </div>
                  </section>
                  </div>

                  {/* 3. DAILY CHALLENGE HABIT TRIGGER CARD */}
                  <div className="order-1 lg:order-none min-w-0">
                  <section className="rounded-2xl bg-[#FAF8F4] dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] p-4 sm:p-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#F2EBDC] dark:bg-[#26221E] text-[#8C6527] dark:text-amber-300 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                          A small daily challenge
                        </h3>
                        <p className="text-[11px] text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                          3 quick recall questions · +60 XP
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDailyChallengeOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#141210] border border-[#DFD9CE] dark:border-[#2E2924] text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171] hover:border-[#9E2A2B] transition-colors shrink-0"
                    >
                      Start · 2m
                    </button>
                  </section>
                  </div>

                  {/* 4. COMPACT 2x2 COURSE & LEXICON SNAPSHOT */}
                  <div className="order-9 lg:order-none min-w-0">
                  {isInitialHydrating ? (
                    <section
                      aria-label="Loading learning metrics"
                      className="grid grid-cols-2 gap-3"
                    >
                      {[0, 1, 2, 3].map((idx) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-4 space-y-2"
                        >
                          <div className="h-3 w-20 rounded-md skeleton-shimmer" />
                          <div className="h-6 w-16 rounded-lg skeleton-shimmer" />
                        </div>
                      ))}
                    </section>
                  ) : (
                    <section className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => navigateTab('dictionary')}
                        className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-4 text-left hover:border-[#9E2A2B]/50 transition-colors"
                      >
                        <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                          Words explored
                        </div>
                        <div className="font-serif font-bold text-2xl text-[#1C1917] dark:text-[#F5F2EB] mt-1 leading-none tabular-nums">
                          {wordsLearnedDisplayCount}
                        </div>
                        <div className="text-[10px] text-[#2D6A4F] dark:text-emerald-400 font-medium mt-2">
                          +{progress.savedWordIds.length + (progress.masteredWordIds || []).length}{' '}
                          saved
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigateTab('lessons')}
                        className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-4 text-left hover:border-[#9E2A2B]/50 transition-colors"
                      >
                        <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                          Lessons finished
                        </div>
                        <div className="font-serif font-bold text-2xl text-[#1C1917] dark:text-[#F5F2EB] mt-1 leading-none tabular-nums">
                          {courseStats.completedCount}
                          <span className="text-xs font-sans font-normal text-[#78716C] ml-1">
                            / {courseStats.totalUnits}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#78716C] dark:text-[#A8A29E] mt-2">
                          Core syllabus
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => openProgressSubView('overview')}
                        className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-4 text-left hover:border-[#9E2A2B]/50 transition-colors"
                      >
                        <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                          Longest streak
                        </div>
                        <div className="font-serif font-bold text-2xl text-[#1C1917] dark:text-[#F5F2EB] mt-1 leading-none tabular-nums">
                          {Math.max(
                            progress.longestStreakDays || 0,
                            progress.currentStreakDays || 0
                          )}{' '}
                          <span className="text-xs font-sans font-normal text-[#78716C]">days</span>
                        </div>
                        <div className="text-[10px] text-[#78716C] dark:text-[#A8A29E] mt-2">
                          Personal best
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigateTab('dictionary')}
                        className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-4 text-left hover:border-[#9E2A2B]/50 transition-colors"
                      >
                        <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                          SRS review queue
                        </div>
                        <div className="font-serif font-bold text-2xl text-[#9E2A2B] dark:text-[#F87171] mt-1 leading-none tabular-nums">
                          {mistakeRadarSummary.dueCount}
                        </div>
                        <div className="text-[10px] text-[#78716C] dark:text-[#A8A29E] mt-2">
                          Due for recall →
                        </div>
                      </button>
                    </section>
                  )}
                  </div>
                </aside>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =================================================================== */}
      {/* IMAGE 1 INSPIRED: FLOATING PILL MOBILE BOTTOM NAVIGATION BAR        */}
      {/* =================================================================== */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-2.5 left-2.5 right-2.5 z-40 h-14 rounded-full bg-[#241E1A]/95 dark:bg-[#1E1A17]/95 backdrop-blur-md border border-[#3E352E] px-2 flex items-center justify-between shadow-xl"
      >
        {(
          [
            {
              id: 'home' as const,
              label: 'Home',
              icon: Home,
              active: activeTab === 'home' && !activeLectureId,
              badge: 0,
            },
            {
              id: 'lessons' as const,
              label: 'Lessons',
              icon: BookOpen,
              active: activeTab === 'lessons' || Boolean(activeLectureId),
              badge: 0,
            },
            {
              id: 'dictionary' as const,
              label: 'Lexicon',
              icon: BookMarked,
              active: activeTab === 'dictionary' && !activeLectureId,
              badge: dueSRSWords.length,
            },
            {
              id: 'arena' as const,
              label: 'Arena',
              icon: Puzzle,
              active: activeTab === 'arena' && !activeLectureId,
              badge: 0,
            },
            {
              id: 'progress' as const,
              label: 'Progress',
              icon: BarChart3,
              active: activeTab === 'progress' && !activeLectureId,
              badge: 0,
            },
            {
              id: 'settings' as const,
              label: 'Settings',
              icon: Sliders,
              active: activeTab === 'settings' && !activeLectureId,
              badge: 0,
            },
          ]
        ).map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTab(item.id)}
              aria-label={item.label}
              className={`relative min-h-[42px] rounded-full flex items-center justify-center transition-all duration-200 ${
                item.active
                  ? 'bg-[#FAF8F4] text-[#9E2A2B] px-3.5 py-1.5 gap-1.5 font-bold shadow-xs'
                  : 'min-w-[42px] text-[#D6CFC5] hover:text-white'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <IconComponent className="w-4 h-4 shrink-0" />
                {item.badge > 0 && !item.active && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 px-1 rounded-full bg-[#9E2A2B] text-white text-[8px] font-ipa font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              {item.active && (
                <span className="text-xs tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
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

      {/* AI Roleplay Conversation Partner Modal */}
      <AIRoleplayModal
        isOpen={isAIRoleplayOpen}
        isOnline={isOnline}
        defaultLevel={progress.selectedLevel}
        preferredSpeechRate={progress.preferredSpeechRate}
        languageMode={languageMode}
        onClose={() => setIsAIRoleplayOpen(false)}
        onCompleteRoleplayTurn={(scenarioId) => handleRecordRolePlayCompleted(scenarioId)}
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

      {/* Image 3 Inspired: Level Up & Milestone Celebration Modal */}
      <LevelUpCelebrationModal
        isOpen={isLevelUpModalOpen}
        levelNumber={learnerLevelNumber}
        cefrLevel={progress.selectedLevel}
        milestoneTitle={`${progress.selectedLevel} Track · ${courseStats.completedCount}/${courseStats.totalUnits} Lessons & ${wordsLearnedDisplayCount} Words Explored`}
        xpEarned={learnerXP}
        masteryPointsEarned={
          courseStats.completedCount * 50 +
          (progress.currentStreakDays || 1) * 20 +
          75
        }
        onClose={() => setIsLevelUpModalOpen(false)}
        onShareBonusClaimed={() => {
          setBonusShareXP((prev) => prev + 25);
          toast.success('+25 Bonus XP Earned!', {
            description: 'Your BhashaSetu milestone summary is ready to share.',
            duration: 3000,
          });
        }}
      />
    </div>
  );
}
