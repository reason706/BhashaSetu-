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
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  Target,
  Compass,
  Type,
  Plus,
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
import { WelcomeOnboarding, WelcomeOnboardingResult } from './components/WelcomeOnboarding';
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
  // Phones: the full lesson/track progress card is collapsed behind a toggle
  const [isLessonProgressExpanded, setIsLessonProgressExpanded] = useState(false);
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

  // Welcome onboarding: only for brand-new learners who have not finished it yet
  // (existing learners with study history are never interrupted)
  const [isWelcomeDismissed, setIsWelcomeDismissed] = useState(false);
  // Home hero: which of the 5 step tiles is selected (null = the next step to do)
  const [heroSelectedStep, setHeroSelectedStep] = useState<ModuleStep | null>(null);
  // Word of the day playback speed (artifact .seg 1.0× / 0.5×)
  const [wodSlow, setWodSlow] = useState(false);
  const hasStudyHistory =
    progress.completedUnitIds.length > 0 ||
    progress.savedWordIds.length > 0 ||
    Boolean(progress.lastStudyDate) ||
    Object.keys(progress.completedStepsByLecture || {}).length > 0;
  const showWelcomeOnboarding =
    !isInitialHydrating && !progress.onboardingComplete && !hasStudyHistory && !isWelcomeDismissed;
  const firstCoreLecture = CORE_SYLLABUS[0];

  const handleSkipWelcome = () => {
    setIsWelcomeDismissed(true);
    setProgress((prev) => completeOnboarding(prev, prev.selectedLevel, prev.dailyGoalMinutes));
  };

  const handleFinishWelcome = (result: WelcomeOnboardingResult, startFirstLesson: boolean) => {
    setIsWelcomeDismissed(true);
    setProgress((prev) =>
      completeOnboarding(
        {
          ...prev,
          currentLevel: result.level,
          languageMode: result.languageMode,
          dailyReminderEnabled: result.dailyReminderEnabled,
        },
        result.level,
        result.dailyGoalMinutes
      )
    );
    if (startFirstLesson && firstCoreLecture) {
      openLecture(firstCoreLecture.id, 0);
    } else {
      navigateTab('home');
    }
  };
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
        color: 'bg-[#9E2A2B]',
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

  // Lessons page: one topic matcher shared by the level groups, pill counts and empty state
  const lessonMatchesTopic = (l: LectureUnit, rawQuery: string) => {
    const q = rawQuery.trim().toLowerCase();
    if (!q) return true;
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
          v.word.toLowerCase().includes(q) || v.nepaliMeaning.toLowerCase().includes(q)
      )
    );
  };
  const lessonMatchCounts = (() => {
    const matching = CORE_SYLLABUS.filter((l) => lessonMatchesTopic(l, lessonTopicSearch));
    return {
      ALL: matching.length,
      B1: matching.filter((l) => l.level === 'B1').length,
      B2: matching.filter((l) => l.level === 'B2').length,
      C1: matching.filter((l) => l.level === 'C1').length,
    } as Record<'ALL' | CEFRLevel, number>;
  })();

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
            <div className="w-8 h-8 rounded-lg bg-[#9E2A2B] text-white flex items-center justify-center font-nepali font-bold text-base shadow-xs">
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
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#9E2A2B] px-2 mb-1">
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
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#9E2A2B] px-2 mb-1">
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
                          <Volume2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
                        </button>
                      ))}
                    </div>
                  )}

                  {globalSearchResults.matchingActivities.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#9E2A2B] px-2 mb-1">
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
                          <ArrowRight className="w-3.5 h-3.5 text-[#9E2A2B]" />
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
              className="w-9 h-9 rounded-full bg-[#E5DEC9] dark:bg-[#2E2924] border border-[#1C1917]/30 dark:border-[#F5F2EB]/30 text-[#1C1917] dark:text-[#F5F2EB] text-xs font-semibold flex items-center justify-center hover:ring-2 hover:ring-[#9E2A2B]/30 transition-all overflow-hidden"
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
                    className="px-2.5 py-1 rounded-lg border border-[#E6E0D4] dark:border-[#2E2924] text-[11px] font-medium text-[#9E2A2B] hover:bg-[#FAF8F4]"
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
                        className="px-3 py-1.5 rounded-lg bg-[#9E2A2B] text-white text-xs font-semibold"
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
                      className="w-full py-2.5 px-3 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold hover:bg-[#9E2A2B] transition-colors inline-flex items-center justify-center gap-2"
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
                              ? 'bg-[#9E2A2B] text-white'
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
                    className="py-2 px-3 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B] inline-flex items-center justify-center gap-1.5"
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>Achievements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAvatarMenuOpen(false);
                      navigateTab('settings');
                    }}
                    className="py-2 px-3 rounded-xl bg-[#9E2A2B] text-white text-xs font-medium hover:bg-[#872223] inline-flex items-center justify-center gap-1.5"
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
            <div className="main w-full max-w-[1240px] mx-auto px-4 lg:px-10 pt-4 md:pt-7 pb-28 flex flex-col gap-5 md:gap-6">
              {/* .ls-head: title + Create AI lesson on one line */}
              <div className="flex items-center justify-between gap-3">
                <h1 className="serif m-0 text-[28px] md:text-[34px] leading-[1.1] text-[#1C1917] dark:text-[#F5F2EB]">
                  Lessons
                </h1>
                <button
                  type="button"
                  onClick={() => setIsAIModalOpen(true)}
                  className="btn btn-p !min-h-[40px] md:!min-h-[44px] !px-3.5 md:!px-[18px] !text-[13px] md:!text-sm !rounded-xl md:!rounded-[14px]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden md:inline">Create AI lesson</span>
                  <span className="md:hidden">AI lesson</span>
                </button>
              </div>

              {/* .ls-stats: compact progress strip (one row on every screen) */}
              {(() => {
                const coreIds = new Set(CORE_SYLLABUS.map((l) => l.id));
                const stepsDone = CORE_SYLLABUS.reduce((sum, l) => {
                  if (progress.completedUnitIds.includes(l.id)) return sum + 5;
                  const raw = progress.completedStepsByLecture?.[l.id] || [];
                  return sum + new Set(raw.filter((x) => x >= 0 && x <= 4)).size;
                }, 0);
                let qc = 0;
                let qt = 0;
                Object.entries(progress.moduleScores || {}).forEach(([id, rec]) => {
                  if (!coreIds.has(id) || !rec) return;
                  qc += (rec.spellingScore || 0) + (rec.grammarScore || 0) + (rec.dialogueScore || 0);
                  qt += (rec.spellingTotal || 0) + (rec.grammarTotal || 0) + (rec.dialogueTotal || 0);
                });
                const quizAcc = qt > 0 ? `${Math.round((qc / qt) * 100)}%` : '—';
                const stats = [
                  { key: 'lec', tone: 'i-crim', Icon: BookOpen, v: courseStats.completedCount, of: courseStats.totalUnits, l: 'Lectures' },
                  { key: 'steps', tone: 'i-sage', Icon: CheckCircle2, v: stepsDone, of: CORE_SYLLABUS.length * 5, l: 'Steps' },
                  { key: 'quiz', tone: 'i-ochre', Icon: Target, v: quizAcc, of: null, l: 'Quiz accuracy' },
                ];
                return (
                  <section
                    aria-label="Course progress"
                    className="card !px-3 !py-2.5 md:!px-5 md:!py-3 !rounded-2xl md:!rounded-[20px] flex items-center justify-between gap-2"
                  >
                    {stats.map((st, i) => (
                      <React.Fragment key={st.key}>
                        {i > 0 && <span aria-hidden="true" className="w-px h-7 bg-[#EAE4D8] dark:bg-[#2E2924]" />}
                        <div className="flex items-center gap-[7px] md:gap-2.5 min-w-0">
                          <span className={`ico xs ${st.tone} hidden md:flex`}>
                            <st.Icon className="w-3.5 h-3.5" />
                          </span>
                          <span>
                            <span className="serif block text-lg md:text-xl leading-[1.1] text-[#1C1917] dark:text-[#F5F2EB]">
                              {st.v}
                              {st.of !== null && <small className="muted text-xs font-semibold font-sans">/{st.of}</small>}
                            </span>
                            <span className="muted block text-[10px] md:text-[11px] font-semibold whitespace-nowrap">{st.l}</span>
                          </span>
                        </div>
                      </React.Fragment>
                    ))}
                  </section>
                );
              })()}

              {/* .ls-resume: dark continue strip (all sizes) */}
              {(() => {
                const recSteps = progress.completedStepsByLecture?.[recommendedLecture.id] || [];
                const nextStep = Math.min(4, recSteps.length) as ModuleStep;
                return (
                  <button
                    type="button"
                    onClick={() => openLecture(recommendedLecture.id, nextStep)}
                    className="flex items-center gap-3 p-2.5 pr-3 rounded-[18px] bg-[#1C1917] dark:bg-[#F5F2EB] text-[#F5F2EB] dark:text-[#1C1917] text-left shadow-[0_14px_28px_-18px_rgba(28,25,23,0.6)] hover:-translate-y-px transition-transform"
                  >
                    <span className="serif w-10 h-10 shrink-0 rounded-xl bg-[#9E2A2B] text-white flex items-center justify-center text-[15px]">
                      {String(recommendedLecture.lectureNumber).padStart(2, '0')}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[11px] font-extrabold tracking-[0.1em] text-[#E9C77B] dark:text-[#9E2A2B]">
                        {recSteps.length > 0 ? 'CONTINUE' : 'START'} · STEP {nextStep + 1} OF 5
                      </span>
                      <span className="block text-sm font-bold truncate">
                        {getEditorialLessonPresentation(recommendedLecture).displayTitle}
                      </span>
                    </span>
                    <span className="w-10 h-10 shrink-0 rounded-full bg-[#E9C77B] text-[#1C1917] flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </span>
                  </button>
                );
              })()}

              {/* .ls-sfield search (always visible) */}
              <div className="flex items-center gap-2.5 h-12 pl-3.5 pr-1.5 rounded-[14px] bg-white dark:bg-[#1A1714] border border-[#DFD7C8] dark:border-[#3A332D] w-full max-w-[560px] focus-within:border-[#9E2A2B] focus-within:shadow-[0_0_0_4px_#F8E7E3] dark:focus-within:shadow-[0_0_0_4px_rgba(158,42,43,0.25)] transition-shadow">
                <Search className="w-[18px] h-[18px] muted shrink-0" />
                <label htmlFor="ls-q" className="sr-only">
                  Search lessons by topic
                </label>
                <input
                  id="ls-q"
                  type="search"
                  value={lessonTopicSearch}
                  onChange={(e) => setLessonTopicSearch(e.target.value)}
                  placeholder="Search lessons — silent, modals, passive…"
                  className="flex-1 min-w-0 border-0 outline-none bg-transparent text-base md:text-[15px] text-[#1C1917] dark:text-[#F5F2EB] placeholder:text-[#8C857B] [&::-webkit-search-cancel-button]:hidden"
                />
                {lessonTopicSearch.trim() && (
                  <>
                    <span aria-live="polite" className="shrink-0 text-[11px] font-bold text-[#9E2A2B] dark:text-[#FCA5A5] bg-[#F8E7E3] dark:bg-red-950/40 rounded-full px-2 py-[3px]">
                      {(levelFilter === 'ALL' ? lessonMatchCounts.ALL : lessonMatchCounts[levelFilter])}{' '}
                      {(levelFilter === 'ALL' ? lessonMatchCounts.ALL : lessonMatchCounts[levelFilter]) === 1 ? 'result' : 'results'}
                    </span>
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => setLessonTopicSearch('')}
                      className="w-9 h-9 shrink-0 rounded-[10px] bg-[#F2EEE6] dark:bg-[#2E2924] text-[#3D342B] dark:text-[#D6CFC4] flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* .ls-tabs: underline level tabs with counts */}
              <div className="flex gap-5 overflow-x-auto no-scrollbar border-b border-[#EAE4D8] dark:border-[#2E2924] -mt-1" role="tablist" aria-label="Filter by level">
                {(
                  [
                    { id: 'ALL', label: 'All' },
                    { id: 'B1', label: 'B1 Foundation' },
                    { id: 'B2', label: 'B2 Workplace' },
                    { id: 'C1', label: 'C1 Advanced' },
                  ] as { id: 'ALL' | CEFRLevel; label: string }[]
                ).map((tab) => {
                  const on = levelFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setLevelFilter(tab.id)}
                      className={`relative shrink-0 pt-2 pb-2.5 text-[13px] inline-flex items-center gap-1.5 whitespace-nowrap transition-colors after:absolute after:left-0 after:right-0 after:-bottom-px after:h-[3px] after:rounded-t-[3px] after:bg-[#9E2A2B] after:origin-center after:transition-transform after:duration-200 ${
                        on
                          ? 'font-bold text-[#1C1917] dark:text-[#F5F2EB] after:scale-x-100'
                          : 'font-semibold text-[#6E685F] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] after:scale-x-0'
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`text-[10px] font-bold rounded-full px-1.5 py-px ${
                          on
                            ? 'bg-[#F8E7E3] text-[#9E2A2B] dark:bg-red-950/40 dark:text-[#FCA5A5]'
                            : 'bg-[#EFE9DD] text-[#6E685F] dark:bg-[#2E2924] dark:text-[#A8A29E]'
                        }`}
                      >
                        {lessonMatchCounts[tab.id]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Track & quiz details (existing LessonProgressCard), one tap away */}
              <div>
                <button
                  type="button"
                  aria-expanded={isLessonProgressExpanded}
                  onClick={() => setIsLessonProgressExpanded((prev) => !prev)}
                  className="pill !min-h-[36px] !text-xs"
                >
                  <Layers className="w-3.5 h-3.5" />
                  {isLessonProgressExpanded ? 'Hide track & quiz details' : 'Track & quiz details'}
                  {isLessonProgressExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {isLessonProgressExpanded && (
                  <div className="mt-3 animate-fade-up">
                    <LessonProgressCard
                      lectures={CORE_SYLLABUS}
                      progress={progress}
                      recommendedLecture={recommendedLecture}
                      activeLevelFilter={levelFilter}
                      onSelectLevelFilter={(lvl) => setLevelFilter(lvl)}
                      onOpenLecture={(lectureId, step = 0) => openLecture(lectureId, step)}
                    />
                  </div>
                )}
              </div>

              {/* Level groups: one .card per level with .ls-gh header + row list */}
              {(
                [
                  { level: 'B1' as CEFRLevel, name: 'Foundation track', tag: 't-sage', color: '#2D6A4F' },
                  { level: 'B2' as CEFRLevel, name: 'Workplace track', tag: 't-ochre', color: '#B07D2E' },
                  { level: 'C1' as CEFRLevel, name: 'Advanced track', tag: 't-crim', color: '#9E2A2B' },
                ]
              )
                .filter((grp) => levelFilter === 'ALL' || levelFilter === grp.level)
                .map((grp) => {
                  const groupLessons = CORE_SYLLABUS.filter(
                    (l) => l.level === grp.level && lessonMatchesTopic(l, lessonTopicSearch)
                  );
                  if (groupLessons.length === 0) return null;
                  const groupDone = groupLessons.filter((l) => progress.completedUnitIds.includes(l.id)).length;
                  const groupPct = Math.round((groupDone / groupLessons.length) * 100);

                  return (
                    <section key={grp.level} className="card !p-0 overflow-hidden" aria-labelledby={`ls-g-${grp.level}`}>
                      <div className="flex items-center gap-2 md:gap-2.5 px-3.5 md:px-5 py-3 md:py-3.5 bg-[#F6F2EA] dark:bg-[#141210] border-b border-[#EAE4D8] dark:border-[#2E2924]">
                        <span className={`tag ${grp.tag}`}>{grp.level}</span>
                        <h2 id={`ls-g-${grp.level}`} className="serif m-0 text-base md:text-lg whitespace-nowrap text-[#1C1917] dark:text-[#F5F2EB]">
                          {grp.name}
                        </h2>
                        <span className="flex-1 flex items-center gap-2 justify-end min-w-[70px] max-w-[110px] md:max-w-[220px] ml-auto">
                          <span className="track flex-1 !h-[5px]">
                            <span className="fill" style={{ width: `${groupPct}%`, background: grp.color }} />
                          </span>
                          <span className="text-xs font-bold text-[#3D342B] dark:text-[#D6CFC4] whitespace-nowrap">
                            {groupDone}/{groupLessons.length}
                          </span>
                        </span>
                      </div>
                      <div className="px-3.5 md:px-5">
                        {groupLessons.map((lesson, rowIdx) => {
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

                          const state: 'done' | 'cur' | 'new' | 'lock' = isCompleted
                            ? 'done'
                            : isInProgress
                            ? 'cur'
                            : isReadyToStart
                            ? 'new'
                            : 'lock';
                          const doneStepSet = new Set(progress.completedStepsByLecture?.[lesson.id] || []);
                          const numClass = {
                            done: 'bg-[#E3EFE8] text-[#1F5C3D] dark:bg-emerald-950/50 dark:text-emerald-300',
                            cur: 'bg-[#9E2A2B] text-white',
                            new: 'bg-[#EFE9DD] text-[#3D342B] dark:bg-[#2E2924] dark:text-[#D6CFC4]',
                            lock: 'bg-[#F2EEE6] text-[#6E685F] dark:bg-[#1F1C18] dark:text-[#A8A29E]',
                          }[state];
                          const tagInfo = {
                            done: ['t-sage', 'Completed'],
                            cur: ['t-crim', 'Continue'],
                            new: ['t-ink', 'Start'],
                            lock: ['t-ink', 'Locked'],
                          }[state];
                          const sub =
                            state === 'done'
                              ? `Completed · ${displaySub}`
                              : state === 'cur'
                              ? `Step ${Math.min(5, stepsDone + 1)} of 5 · ${duration} min left`
                              : state === 'new'
                              ? `5 steps · ~${duration} min`
                              : `Locked · ${displaySub}`;
                          const ctaStep = (isInProgress ? Math.min(4, stepsDone) : 0) as ModuleStep;

                          return (
                            <div key={lesson.id} className={rowIdx > 0 ? 'border-t border-[#EFE9DD] dark:border-[#2E2924]' : ''}>
                              <button
                                type="button"
                                aria-expanded={state !== 'lock' ? isPreviewExpanded : undefined}
                                onClick={(e) => {
                                  if (state === 'lock') {
                                    triggerLockedMessage(e);
                                    return;
                                  }
                                  setExpandedLessonPreviewId((prev) => (prev === lesson.id ? null : lesson.id));
                                }}
                                className={`w-full flex items-center gap-3 min-h-[60px] py-2.5 text-left ${state === 'lock' ? 'opacity-60' : ''}`}
                              >
                                <span className={`serif shrink-0 w-[34px] h-[34px] md:w-10 md:h-10 rounded-[10px] md:rounded-xl flex items-center justify-center text-[13px] md:text-[15px] ${numClass}`}>
                                  {String(lesson.lectureNumber).padStart(2, '0')}
                                </span>
                                <span className="flex-1 min-w-0">
                                  <span className="block text-sm md:text-[15px] font-bold leading-[1.3] text-[#1C1917] dark:text-[#F5F2EB]">
                                    {displayTitle}
                                  </span>
                                  <span className="muted block text-xs mt-px truncate">{sub}</span>
                                </span>
                                <span className="hidden md:flex gap-1" aria-hidden="true">
                                  {[0, 1, 2, 3, 4].map((i) => (
                                    <span
                                      key={i}
                                      className="w-[18px] h-1.5 rounded"
                                      style={{
                                        background:
                                          isCompleted || doneStepSet.has(i)
                                            ? '#2D6A4F'
                                            : state === 'cur' && i === stepsDone
                                            ? '#9E2A2B'
                                            : '#E6E0D4',
                                      }}
                                    />
                                  ))}
                                </span>
                                <span className={`tag ${tagInfo[0]} hidden md:inline-flex`}>{tagInfo[1]}</span>
                                {state === 'lock' ? (
                                  <Lock className="w-[18px] h-[18px] muted shrink-0" aria-label="Locked" />
                                ) : (
                                  <ChevronDown
                                    className={`w-[18px] h-[18px] muted shrink-0 transition-transform ${isPreviewExpanded ? 'rotate-180' : ''}`}
                                  />
                                )}
                              </button>

                              {/* .lx expanded panel */}
                              {isPreviewExpanded && state !== 'lock' && (
                                <div className="md:ml-[62px] flex flex-col gap-3.5 pb-5 animate-fade-up">
                                  <p className="np muted m-0 text-sm">{lesson.nepaliTitle || lesson.subtitle}</p>
                                  <div className="steps5 !grid-cols-2 md:!grid-cols-5 !grid-flow-row !overflow-visible">
                                    {[
                                      { step: 0 as ModuleStep, label: '01 · Vocabulary' },
                                      { step: 1 as ModuleStep, label: '02 · Pronunciation' },
                                      { step: 2 as ModuleStep, label: '03 · Spelling' },
                                      { step: 3 as ModuleStep, label: '04 · Grammar' },
                                      { step: 4 as ModuleStep, label: '05 · Dialogue' },
                                    ].map((st) => {
                                      const stDone = isCompleted || doneStepSet.has(st.step);
                                      const stCur = state === 'cur' && st.step === stepsDone;
                                      return (
                                        <button
                                          key={st.step}
                                          type="button"
                                          onClick={() => openLecture(lesson.id, st.step)}
                                          className={`btn btn-sm !justify-start ${
                                            stDone
                                              ? 'bg-[#E3EFE8] text-[#1F5C3D] dark:bg-emerald-950/40 dark:text-emerald-300'
                                              : stCur
                                              ? 'bg-white text-[#9E2A2B] shadow-[inset_0_0_0_2px_#9E2A2B] dark:bg-[#1F1C18] dark:text-[#FCA5A5]'
                                              : 'bg-white text-[#1C1917] border border-[#DFD7C8] dark:bg-[#1F1C18] dark:text-[#F5F2EB] dark:border-[#3A332D] hover:border-[#9E2A2B]'
                                          }`}
                                        >
                                          {stDone && <Check className="w-3.5 h-3.5" />}
                                          {st.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="muted text-xs font-semibold inline-flex gap-1.5 items-center">
                                      <Type className="w-3.5 h-3.5" />
                                      Key words
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
                                        <button type="button" className="pill !min-h-[34px]">
                                          {vocab.word} <span className="mono muted text-[11px]">{vocab.ipa}</span>
                                        </button>
                                      </WordPhoneticsPopover>
                                    ))}
                                  </div>
                                  <div>
                                    <button type="button" onClick={() => openLecture(lesson.id, ctaStep)} className="btn btn-p">
                                      <Play className="w-[15px] h-[15px] fill-current" />
                                      {state === 'done'
                                        ? 'Review lecture'
                                        : state === 'cur'
                                        ? `Continue at step ${ctaStep + 1}`
                                        : 'Start lecture'}
                                    </button>
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

              {/* Empty state */}
              {lessonTopicSearch.trim() &&
                (levelFilter === 'ALL' ? lessonMatchCounts.ALL : lessonMatchCounts[levelFilter]) === 0 && (
                  <div className="card paper text-center flex flex-col items-center gap-2 !p-10">
                    <span className="ico i-ink">
                      <Search className="w-[22px] h-[22px]" />
                    </span>
                    <strong className="text-[#1C1917] dark:text-[#F5F2EB]">No lessons match “{lessonTopicSearch}”</strong>
                    <span className="muted text-[13px]">Try “silent”, “modals” or create an AI lesson for it.</span>
                    <button type="button" onClick={() => setIsAIModalOpen(true)} className="btn btn-g btn-sm mt-1">
                      <Sparkles className="w-4 h-4" />
                      Create AI lesson
                    </button>
                  </div>
                )}

              {/* Your custom lessons (.g3 of .card.hov + dashed create card) */}
              <section className="flex flex-col gap-3" aria-labelledby="ls-custom">
                <div className="sec">
                  <h2 id="ls-custom" className="serif h2 text-[#1C1917] dark:text-[#F5F2EB]">
                    Your custom lessons
                  </h2>
                  <span className="muted text-[13px]">Made with AI from your own topics</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {enrichSyllabusWithEnhancements(progress.customLectures).map((customLec) => (
                    <button
                      key={customLec.id}
                      type="button"
                      onClick={() => openLecture(customLec.id, 0)}
                      className="card hov flex flex-col gap-2.5 text-left"
                    >
                      <span className="flex justify-between items-center">
                        <span className="ico sm i-ochre">
                          <Sparkles className="w-[18px] h-[18px]" />
                        </span>
                        <span className="tag t-ochre">AI · {customLec.level}</span>
                      </span>
                      <span className="text-[15px] font-bold text-[#1C1917] dark:text-[#F5F2EB] line-clamp-2">
                        {customLec.title}
                      </span>
                      <span className="muted text-[13px] line-clamp-2">
                        {customLec.moduleA_vocabulary?.length || 0} words · {customLec.subtitle}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsAIModalOpen(true)}
                    className="card hov !bg-transparent !border-2 !border-dashed !border-[#DFD7C8] dark:!border-[#3A332D] flex flex-col items-center justify-center gap-2 min-h-[140px] text-[#9E2A2B] dark:text-[#F87171] font-bold"
                  >
                    <Plus className="w-[22px] h-[22px]" />
                    Create AI lesson
                    <span className="muted font-medium text-xs">Any topic, your level</span>
                  </button>
                </div>
                {progress.customLectures.length === 0 && (
                  <p className="muted text-xs m-0">AI-created lessons appear here and are saved for offline study.</p>
                )}
              </section>
            </div>
          ) : (
            /* =============================================================== */
            /* HOME VIEW: TWO-COLUMN DESKTOP ARCHITECTURE & BRAND PALETTE      */
            /* =============================================================== */
            <div className="main w-full max-w-[1240px] mx-auto px-4 lg:px-10 pt-4 md:pt-7 pb-28 flex flex-col gap-5 md:gap-6">
              {/* Page head (artifact .ls-head: eyebrow + serif greeting + crimson track chip) */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="eyebrow">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long' })} · Your learning space
                  </div>
                  <h1 className="serif mt-1 mb-0 text-[28px] md:text-[34px] leading-[1.1] text-[#1C1917] dark:text-[#F5F2EB]">
                    Namaste, {firstName}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigateTab('lessons')}
                    className="chip !bg-[#F8E7E3] !border-[#EBC9C1] !text-[#9E2A2B] dark:!bg-red-950/40 dark:!border-red-900/50 dark:!text-red-300"
                  >
                    <Compass className="w-4 h-4" />
                    <span>
                      {progress.currentLevel || 'B1'} ·{' '}
                      {progress.currentLevel === 'C1'
                        ? 'Advanced'
                        : progress.currentLevel === 'B2'
                        ? 'Workplace'
                        : 'Foundation'}
                      <span className="hidden md:inline"> track</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTab('lessons')}
                    className="chip hidden sm:inline-flex hover:!border-[#9E2A2B]"
                  >
                    Syllabus {courseStats.completedCount}/{courseStats.totalUnits} →
                  </button>
                </div>
              </div>

              {/* ============================================================= */}
              {/* ASYMMETRIC TWO-COLUMN DESKTOP GRID (8 COLS STAGE / 4 COLS RAIL) */}
              {/* ============================================================= */}
              <div className="flex flex-col gap-5 sm:gap-6 xl:grid xl:grid-cols-12 xl:items-start">
                {/* =========================================================== */}
                {/* LEFT COLUMN (8 COLS): PRIMARY LEARNING STAGE                */}
                {/* =========================================================== */}
                <div className="contents xl:block xl:col-span-8 xl:space-y-6 min-w-0">
                  {/* 1. HERO (artifact .hero): illustration underlay, Devanagari watermark, .step tiles */}
                  <div className="order-2 xl:order-none min-w-0">
                  {(() => {
                    const completedSteps =
                      progress.completedStepsByLecture?.[recommendedLecture.id] || [];
                    const nextStepIdx = Math.min(4, completedSteps.length) as ModuleStep;
                    const selectedStep = (heroSelectedStep ?? nextStepIdx) as ModuleStep;
                    const editorialLesson = getEditorialLessonPresentation(recommendedLecture);
                    const vocabCount = recommendedLecture.moduleA_vocabulary?.length || 0;
                    const stepItems: { step: ModuleStep; num: string; label: string; info: string }[] = [
                      { step: 0, num: '01', label: 'Vocab', info: `${vocabCount} words with silent-letter phonics` },
                      { step: 1, num: '02', label: 'Audio', info: 'Pronunciation guide & live mic practice' },
                      { step: 2, num: '03', label: 'Spelling', info: 'Spelling rules, dictation bee & quizzes' },
                      { step: 3, num: '04', label: 'Grammar', info: 'SOV → SVO sentence builder' },
                      { step: 4, num: '05', label: 'Dialogue', info: 'Real-life dialogue & comprehension' },
                    ];
                    const stepCta =
                      selectedStep < nextStepIdx && completedSteps.includes(selectedStep)
                        ? `Review step ${selectedStep + 1}`
                        : selectedStep === nextStepIdx
                        ? completedSteps.length > 0
                          ? 'Resume lesson'
                          : 'Start lesson'
                        : `Jump to step ${selectedStep + 1}`;

                    return (
                      <section className="hero" aria-labelledby="home-hero-title">
                        <div className="art" aria-hidden="true">
                          <svg viewBox="0 0 320 300" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
                            <circle cx="160" cy="150" r="140" fill="#D7C6AE" fillOpacity="0.55" />
                            <circle cx="160" cy="150" r="140" fill="none" stroke="#CBB89D" strokeOpacity="0.6" />
                            <g transform="translate(50 68) rotate(-6 110 82)">
                              <rect x="18" y="26" width="86" height="122" rx="6" fill="#1C1917" fillOpacity="0.08" />
                              <rect x="18" y="20" width="86" height="122" rx="6" fill="#FAF7F0" stroke="#E2DACB" strokeWidth="1.5" />
                              <rect x="112" y="20" width="86" height="122" rx="6" fill="#FAF7F0" stroke="#E2DACB" strokeWidth="1.5" />
                              <rect x="103" y="18" width="10" height="126" rx="4" fill="#9E2A2B" />
                              <line x1="34" y1="44" x2="86" y2="44" stroke="#CFC8BC" strokeWidth="3" strokeLinecap="round" />
                              <line x1="34" y1="62" x2="78" y2="62" stroke="#CFC8BC" strokeWidth="3" strokeLinecap="round" />
                              <line x1="128" y1="44" x2="180" y2="44" stroke="#CFC8BC" strokeWidth="3" strokeLinecap="round" />
                              <line x1="128" y1="62" x2="172" y2="62" stroke="#CFC8BC" strokeWidth="3" strokeLinecap="round" />
                              <text x="62" y="114" textAnchor="middle" fill="#9E2A2B" fontSize="36" fontWeight="600" fontFamily="Noto Sans Devanagari, serif">अ</text>
                              <text x="155" y="114" textAnchor="middle" fill="#2D6A4F" fontSize="38" fontWeight="600" fontFamily="Fraunces, Georgia, serif">A</text>
                            </g>
                          </svg>
                        </div>
                        <div className="np wm" aria-hidden="true">भाषासेतु</div>

                        <div className="body flex flex-col gap-3">
                          <div className="flex gap-2 items-center flex-wrap">
                            <span className="eyebrow">Continue your path</span>
                            <span className="text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] bg-[#FAF8F4]/85 dark:bg-[#141210]/80 border border-[#DFD7C8] dark:border-[#2E2924] rounded-lg px-2.5 py-[3px]">
                              Lesson {String(recommendedLecture.lectureNumber).padStart(2, '0')} of {courseStats.totalUnits} · {recommendedLecture.level}
                            </span>
                          </div>
                          <h2 id="home-hero-title" className="serif m-0 text-[26px] md:text-[32px] leading-[1.15] text-[#1C1917] dark:text-[#F5F2EB]">
                            {editorialLesson.displayTitle}
                          </h2>
                          <p className="m-0 text-[15px] leading-[1.6] text-[#57534E] dark:text-[#A8A29E]">
                            {editorialLesson.displaySub}
                          </p>
                          <div className="flex gap-2.5 items-center flex-wrap mt-1">
                            <button
                              type="button"
                              onClick={() => openLecture(recommendedLecture.id, selectedStep)}
                              className="btn btn-p"
                            >
                              <Play className="w-4 h-4 fill-current" />
                              {stepCta}
                            </button>
                            <button
                              type="button"
                              aria-label="Hear lesson title"
                              onClick={() =>
                                speechService.speak(editorialLesson.displayTitle, {
                                  rate: progress.preferredSpeechRate,
                                })
                              }
                              className="btn btn-g !bg-white/75 dark:!bg-[#1F1C18]/80"
                            >
                              <Volume2 className="w-4 h-4" />
                              <span className="hidden md:inline">Hear title</span>
                            </button>
                            <span className="muted hidden md:inline-flex gap-3.5 text-[13px]">
                              <span className="inline-flex gap-[5px] items-center">
                                <Clock className="w-3.5 h-3.5" />
                                {editorialLesson.duration} min
                              </span>
                              <span className="inline-flex gap-[5px] items-center">
                                <Layers className="w-3.5 h-3.5" />
                                {completedSteps.length}/5 done
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="steps5 relative mt-[22px]" role="tablist" aria-label="Lesson steps">
                          {stepItems.map((item) => {
                            const isDone = completedSteps.includes(item.step);
                            const isCur = !isDone && item.step === nextStepIdx;
                            const isSel = item.step === selectedStep;
                            return (
                              <button
                                key={item.step}
                                type="button"
                                role="tab"
                                aria-selected={isSel}
                                onClick={() => setHeroSelectedStep(item.step)}
                                onDoubleClick={() => openLecture(recommendedLecture.id, item.step)}
                                className={`step${isSel ? ' sel' : ''}`}
                              >
                                <div
                                  className="h-1 rounded"
                                  style={{
                                    background: isDone
                                      ? '#2D6A4F'
                                      : isCur
                                      ? 'linear-gradient(90deg,#9E2A2B 40%,#DDD3C2 40%)'
                                      : '#DDD3C2',
                                  }}
                                />
                                <span
                                  className={`text-xs font-bold ${
                                    isDone
                                      ? 'text-[#1F5C3D] dark:text-emerald-300'
                                      : isCur
                                      ? 'text-[#9E2A2B] dark:text-[#F87171]'
                                      : 'text-[#6E685F] dark:text-[#A8A29E]'
                                  }`}
                                >
                                  {item.num} {item.label}
                                </span>
                                <span className="muted text-[11px]">{isDone ? 'Done' : isCur ? 'Now' : 'Next'}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="relative mt-2.5 text-[13px] text-[#3D342B] dark:text-[#D6CFC4] flex items-center gap-2 flex-wrap">
                          <Info className="w-4 h-4 text-[#9E2A2B] dark:text-[#F87171] shrink-0" />
                          <span className="flex-1 min-w-0">
                            Step {stepItems[selectedStep].num} · {stepItems[selectedStep].info}
                          </span>
                          <button
                            type="button"
                            onClick={() => navigateTab('lessons')}
                            className="text-[13px] font-semibold text-[#9E2A2B] dark:text-[#F87171] hover:underline"
                          >
                            All {courseStats.totalUnits} lessons →
                          </button>
                        </div>

                        {/* Track shortcuts (B1 / B2 / C1) styled as artifact chips with a .track bar */}
                        <div className="relative mt-3 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 md:mx-0 md:px-0">
                          {[
                            { id: 'B1' as const, label: 'B1 Foundation', done: courseStats.b1Done, total: courseStats.b1Total, color: '#2D6A4F' },
                            { id: 'B2' as const, label: 'B2 Workplace', done: courseStats.b2Done, total: courseStats.b2Total, color: '#B07D2E' },
                            { id: 'C1' as const, label: 'C1 Advanced', done: courseStats.c1Done, total: courseStats.c1Total, color: '#9E2A2B' },
                          ].map((trk) => {
                            const pct = trk.total > 0 ? Math.round((trk.done / trk.total) * 100) : 0;
                            return (
                              <button
                                key={trk.id}
                                type="button"
                                onClick={() => {
                                  setLevelFilter(trk.id);
                                  navigateTab('lessons');
                                }}
                                className="chip !h-auto py-2 flex-1 min-w-[9rem] !bg-white/75 dark:!bg-[#1F1C18]/80 hover:!border-[#9E2A2B] flex-col !items-stretch !gap-1.5 !rounded-[14px] text-left"
                              >
                                <span className="flex justify-between text-xs font-bold">
                                  <span>{trk.label}</span>
                                  <span className="mono muted">{trk.done}/{trk.total}</span>
                                </span>
                                <span className="track !h-[5px]">
                                  <span className="fill" style={{ width: `${Math.max(6, pct)}%`, background: trk.color }} />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })()}
                  </div>

                  {/* 2. QUICK TOOLS (artifact: .card.hov tiles with .ico) */}
                  <div className="order-4 xl:order-none min-w-0">
                  <section className="flex flex-col gap-3" aria-labelledby="home-quick-tools">
                    <div className="sec">
                      <h2 id="home-quick-tools" className="serif h2 text-[#1C1917] dark:text-[#F5F2EB]">
                        Quick tools
                      </h2>
                      <button
                        type="button"
                        onClick={() => navigateTab('arena')}
                        className="text-[13px] font-semibold text-[#9E2A2B] dark:text-[#F87171] hover:underline"
                      >
                        All labs →
                      </button>
                    </div>
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                      {[
                        {
                          key: 'speak',
                          tone: 'i-sage',
                          Icon: Mic,
                          title: 'Speaking practice',
                          desc: 'Shadow native audio at 0.5×–1×',
                          onClick: () => openArenaTool('shadowing'),
                        },
                        {
                          key: 'chat',
                          tone: 'i-crim',
                          Icon: MessageSquare,
                          title: 'Chat with AI',
                          desc: 'Roleplay an interview or office call',
                          onClick: () => setIsAIRoleplayOpen(true),
                        },
                        {
                          key: 'grammar',
                          tone: 'i-ink',
                          Icon: Wand2,
                          title: 'Fix my grammar',
                          desc: 'Catch SOV → SVO slips as you write',
                          onClick: () => {
                            sentenceCoachSectionRef.current?.scrollIntoView({
                              behavior: scrollBehavior(),
                              block: 'center',
                            });
                            window.setTimeout(() => {
                              sentenceCoachInputRef.current?.focus();
                            }, 350);
                          },
                        },
                        {
                          key: 'silent',
                          tone: 'i-ochre',
                          Icon: Zap,
                          title: 'Silent-letter lab',
                          desc: '60-second phonics sprint',
                          onClick: () => openArenaTool('sprint'),
                        },
                      ].map(({ key, tone, Icon, title, desc, onClick }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={onClick}
                          className="card hov !p-4 flex flex-col gap-3.5 text-left"
                        >
                          <span className={`ico ${tone}`}>
                            <Icon className="w-5 h-5" />
                          </span>
                          <span>
                            <span className="block text-[15px] font-bold">{title}</span>
                            <span className="muted block text-xs mt-1 leading-[1.45]">{desc}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                  </div>

                  {/* 3. PAIRED VOCABULARY ROW (artifact .g2 of .card) */}
                  <div className="order-5 xl:order-none min-w-0">
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                    {/* Left Vocab Card: Word of the Day */}
                    {isInitialHydrating || isWordOfTheDayLoading || !wordOfTheDay ? (
                      <div
                        aria-label="Loading Word of the Day"
                        className="card flex flex-col justify-between space-y-4"
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
                      <section className="card flex flex-col gap-3.5" aria-labelledby="home-wod">
                        <div className="flex justify-between items-center gap-2">
                          <span id="home-wod" className="eyebrow inline-flex gap-1.5 items-center">
                            <Sparkles className="w-3.5 h-3.5" />
                            Word of the day
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="tag t-sage">
                              {wordOfTheDay.partOfSpeech} · {wordOfTheDay.level}
                            </span>
                            <button
                              type="button"
                              onClick={handleCycleWordOfTheDay}
                              title="Show another high-frequency word"
                              aria-label="Another word"
                              className="w-8 h-8 rounded-full flex items-center justify-center text-[#6E685F] dark:text-[#A8A29E] hover:bg-[#F2EEE6] dark:hover:bg-[#2E2924] hover:text-[#9E2A2B]"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </span>
                        </div>
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <span className="serif text-[32px] md:text-[36px] leading-tight text-[#1C1917] dark:text-[#F5F2EB]">
                            {wordOfTheDay.segments?.map((seg, idx) =>
                              seg.silent ? (
                                <span key={idx} className="sil">
                                  {seg.text}
                                </span>
                              ) : (
                                <span key={idx}>{seg.text}</span>
                              )
                            )}
                          </span>
                          <span className="mono muted text-sm">{wordOfTheDay.ipa}</span>
                        </div>
                        <p className="np m-0 text-[15px] text-[#1C1917] dark:text-[#F5F2EB]">
                          {wordOfTheDay.nepaliMeaning}
                        </p>
                        {wordOfTheDay.silentLettersSummary &&
                          wordOfTheDay.silentLettersSummary !== 'Standard pronunciation' && (
                            <span className="tag t-crim self-start">{wordOfTheDay.silentLettersSummary}</span>
                          )}
                        <p className="m-0 text-sm leading-[1.6] text-[#57534E] dark:text-[#A8A29E]">
                          “{wordOfTheDay.englishExample}”
                          {wordOfTheDay.nepaliExampleTranslation && (
                            <span className="np block mt-1 text-[13px] text-[#6E685F] dark:text-[#8C857B]">
                              {wordOfTheDay.nepaliExampleTranslation}
                            </span>
                          )}
                        </p>
                        <div className="flex gap-2 mt-auto items-center flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              speechService.triggerHaptic('light');
                              speechService.speak(wordOfTheDay.word, {
                                rate: wodSlow ? 0.55 : progress.preferredSpeechRate,
                              });
                            }}
                            aria-label={`Play pronunciation for ${wordOfTheDay.word}`}
                            className="btn btn-p btn-sm"
                          >
                            <Volume2 className="w-4 h-4" />
                            Play
                          </button>
                          <div className="seg" role="group" aria-label="Playback speed">
                            <button type="button" className={!wodSlow ? 'on' : ''} aria-pressed={!wodSlow} onClick={() => setWodSlow(false)}>
                              1.0×
                            </button>
                            <button type="button" className={wodSlow ? 'on' : ''} aria-pressed={wodSlow} onClick={() => setWodSlow(true)}>
                              0.5×
                            </button>
                          </div>
                          <div className="ml-auto flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleSaveWord(wordOfTheDay.id)}
                              aria-label={progress.savedWordIds.includes(wordOfTheDay.id) ? 'Saved' : 'Save word'}
                              aria-pressed={progress.savedWordIds.includes(wordOfTheDay.id)}
                              className="ibtn !w-10 !h-10"
                            >
                              {progress.savedWordIds.includes(wordOfTheDay.id) ? (
                                <BookmarkCheck className="w-[18px] h-[18px] text-[#9E2A2B] dark:text-[#F87171]" />
                              ) : (
                                <Bookmark className="w-[18px] h-[18px]" />
                              )}
                            </button>
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Right Vocab Card: Silent-Letter Word Spotlight + AI Phonetic Guide */}
                    {isInitialHydrating || isSpotlightTransitioning || !activeSRSQuickWord ? (
                      <div
                        aria-label="Loading Silent-Letter Word Spotlight"
                        className="card flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="h-3.5 w-44 rounded-md skeleton-shimmer" />
                          <div className="h-7 w-32 rounded-lg skeleton-shimmer" />
                          <div className="h-4 w-5/6 rounded-md skeleton-shimmer" />
                        </div>
                        <div className="h-9 w-full rounded-xl skeleton-shimmer" />
                      </div>
                    ) : (
                      <section className="card flex flex-col gap-3.5" aria-labelledby="home-spotlight">
                        <div className="flex justify-between items-center gap-2">
                          <span id="home-spotlight" className="eyebrow inline-flex gap-1.5 items-center">
                            <Lightbulb className="w-3.5 h-3.5" />
                            Silent-letter spotlight
                          </span>
                          <span className="muted text-xs">
                            {(srsQuickIdx % dueSRSWords.length) + 1}/{dueSRSWords.length}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <span className="serif text-[32px] md:text-[36px] leading-tight text-[#1C1917] dark:text-[#F5F2EB]">
                            {activeSRSQuickWord.segments?.map((seg, idx) =>
                              seg.silent ? (
                                <span key={idx} className="sil">
                                  {seg.text}
                                </span>
                              ) : (
                                <span key={idx}>{seg.text}</span>
                              )
                            )}
                          </span>
                          <span className="mono muted text-sm">{activeSRSQuickWord.ipa}</span>
                        </div>
                        {srsQuickFlipped ? (
                          <p className="np m-0 text-[15px] text-[#1C1917] dark:text-[#F5F2EB]">
                            {activeSRSQuickWord.nepaliMeaning}
                            {activeSRSQuickWord.nepaliExampleTranslation && (
                              <span className="block text-[13px] text-[#6E685F] dark:text-[#A8A29E] mt-0.5">
                                {activeSRSQuickWord.nepaliExampleTranslation}
                              </span>
                            )}
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              speechService.triggerHaptic('light');
                              setSrsQuickFlipped(true);
                            }}
                            className="min-h-[44px] rounded-xl border border-dashed border-[#B07D2E] bg-[#FBF6EC] dark:bg-amber-950/20 text-[13px] font-bold text-[#6B4D1E] dark:text-amber-300"
                          >
                            Recall the meaning, then tap to reveal
                          </button>
                        )}
                        <div className="bg-[#FAF8F4] dark:bg-[#141210] rounded-xl px-3.5 py-3 text-[13px] leading-[1.6] text-[#57534E] dark:text-[#A8A29E] flex gap-2.5">
                          <span className="crim flex pt-0.5">
                            <Info className="w-4 h-4" />
                          </span>
                          <span>
                            <strong className="crim">{activeSRSQuickWord.silentLettersSummary}</strong> · “
                            {activeSRSQuickWord.englishExample}”
                          </span>
                        </div>

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
                            <div className="p-3.5 rounded-[14px] bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-xs space-y-1.5">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="tag t-crim">
                                  <Sparkles className="w-3 h-3" />
                                  AI phonetic guide
                                </span>
                                <span className="np font-semibold text-[#1F5C3D] dark:text-emerald-400">
                                  उच्चारण: {spotlightAIExplanation.nepaliSoundComparison}
                                </span>
                              </div>
                              <p className="np text-[#1C1917] dark:text-[#F5F2EB]">
                                <strong>किन साइलेन्ट:</strong> {spotlightAIExplanation.silentReasonNepali}
                              </p>
                              <p className="np text-[#1F5C3D] dark:text-emerald-400">
                                <strong>ट्रिक:</strong> {spotlightAIExplanation.memoryTrickNepali}
                              </p>
                            </div>
                          )}

                        <div className="flex gap-2 mt-auto flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              speechService.triggerHaptic('light');
                              speechService.speak(activeSRSQuickWord.word, {
                                rate: progress.preferredSpeechRate,
                              });
                            }}
                            className="btn btn-g btn-sm"
                          >
                            <Volume2 className="w-4 h-4" />
                            Hear it
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              speechService.triggerHaptic('light');
                              speechService.speak(activeSRSQuickWord.word, { rate: 0.5 });
                            }}
                            className="btn btn-g btn-sm"
                            title="Listen slowly at 0.5x speed"
                          >
                            0.5×
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExplainSpotlightWord(activeSRSQuickWord)}
                            disabled={isSpotlightAILoading}
                            className="btn btn-g btn-sm"
                          >
                            <Sparkles className="w-4 h-4" />
                            {spotlightAIExplanation?.word === activeSRSQuickWord.word
                              ? 'Hide AI guide'
                              : 'AI phonetic guide'}
                          </button>
                          <div className="flex gap-2 ml-auto">
                            {srsQuickFlipped && (
                              <button
                                type="button"
                                onClick={() => handleCycleSpotlightWord(activeSRSQuickWord.id)}
                                className="btn btn-sm !bg-[#2D6A4F] !text-white"
                              >
                                <Check className="w-4 h-4" />
                                Mastered
                              </button>
                            )}
                            <button type="button" onClick={() => handleCycleSpotlightWord()} className="btn btn-g btn-sm">
                              Next →
                            </button>
                          </div>
                        </div>
                      </section>
                    )}
                  </section>
                  </div>

                  {/* 4. WEAK SPOTS / MISTAKE RADAR (artifact .card + .card.paper.hov tiles) */}
                  <div className="order-6 xl:order-none min-w-0">
                  {isInitialHydrating ? (
                    <section aria-label="Loading Weak-Spot Mistake Radar" className="card space-y-3">
                      <div className="h-4 w-40 rounded-md skeleton-shimmer" />
                      <div className="h-6 w-64 rounded-lg skeleton-shimmer" />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2">
                        <div className="h-14 rounded-xl skeleton-shimmer" />
                        <div className="h-14 rounded-xl skeleton-shimmer" />
                        <div className="h-14 rounded-xl skeleton-shimmer" />
                      </div>
                    </section>
                  ) : (
                    <section className="card flex flex-col gap-4" aria-labelledby="home-radar">
                      <div className="sec !items-end">
                        <div className="min-w-0">
                          <span className="eyebrow">
                            Weak spots ·{' '}
                            {mistakeRadarSummary.totalMistakes > 0
                              ? `${mistakeRadarSummary.totalMistakes} logged mistakes`
                              : `${mistakeRadarSummary.dueCount} SRS words queued`}
                          </span>
                          <h3 id="home-radar" className="serif h2 mt-1.5 text-[#1C1917] dark:text-[#F5F2EB]">
                            Your mistake radar
                          </h3>
                          <p className="muted text-[13px] mt-1">
                            Focus: <strong className="text-[#1C1917] dark:text-[#F5F2EB]">{mistakeRadarSummary.topWeakArea}</strong> ·{' '}
                            {mistakeRadarSummary.ruleSummary} · Key targets:{' '}
                            <strong className="text-[#1C1917] dark:text-[#F5F2EB]">
                              {mistakeRadarSummary.sampleWords.join(', ')}
                            </strong>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            openArenaTool(mistakeRadarSummary.isGrammarTop ? 'interference' : 'sprint')
                          }
                          className="btn btn-p btn-sm"
                        >
                          <Zap className="w-4 h-4" />
                          Targeted fix
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        {[
                          {
                            key: 'pron',
                            tone: 'i-crim',
                            count: 'crim',
                            Icon: Mic,
                            title: 'Silent letters',
                            sub: `Targets: ${mistakeRadarSummary.sampleWords.slice(0, 2).join(', ')}`,
                            mins: '4 min',
                            onClick: () => openArenaTool('minimal-pairs'),
                          },
                          {
                            key: 'order',
                            tone: 'i-ochre',
                            count: 'ochre',
                            Icon: Layers,
                            title: 'Word order',
                            sub: 'SVO vs SOV, articles & tense',
                            mins: '5 min',
                            onClick: () => openArenaTool('interference'),
                          },
                          {
                            key: 'spell',
                            tone: 'i-sage',
                            count: 'sage',
                            Icon: Search,
                            title: 'Silent detective',
                            sub: 'Spot unpronounced letters',
                            mins: '3 min',
                            onClick: () => openArenaTool('detective'),
                          },
                        ].map(({ key, tone, count, Icon, title, sub, mins, onClick }) => (
                          <button
                            key={key}
                            type="button"
                            onClick={onClick}
                            className="card paper hov !p-3.5 flex gap-3 items-center text-left"
                          >
                            <span className={`ico sm ${tone}`}>
                              <Icon className="w-[18px] h-[18px]" />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="flex justify-between gap-2 text-[13px] font-bold">
                                {title}
                                <span className={`${count} tabular-nums`}>{mins}</span>
                              </span>
                              <span className="muted block text-xs truncate">{sub}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                  </div>

                  {/* 5. AI SENTENCE COACH (artifact .card with .ico header, .input, .pill samples) */}
                  <div className="order-7 xl:order-none min-w-0">
                  <section
                    ref={sentenceCoachSectionRef}
                    className="card flex flex-col gap-3.5"
                    aria-labelledby="home-coach"
                  >
                    <div className="flex gap-3.5 items-center">
                      <span className="ico i-crim">
                        <Sparkles className="w-5 h-5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="eyebrow">AI sentence coach · SOV → SVO</span>
                        <h3 id="home-coach" className="serif h2 mt-1 text-[#1C1917] dark:text-[#F5F2EB]">
                          Write it the way you’d say it
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAIRoleplayOpen(true)}
                        className="btn btn-g btn-sm hidden sm:inline-flex"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Live roleplay
                      </button>
                    </div>

                    <p className="muted text-[13px] m-0">
                      Type any English sentence to check grammar and SVO word order, or write in Nepali to
                      get natural workplace English phrasing.
                    </p>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleRunSentenceCoach();
                      }}
                      className="flex gap-2"
                    >
                      <label htmlFor="home-coach-input" className="sr-only">
                        Sentence to check
                      </label>
                      <input
                        id="home-coach-input"
                        ref={sentenceCoachInputRef}
                        type="text"
                        value={sentenceCoachInput}
                        onChange={(e) => setSentenceCoachInput(e.target.value)}
                        placeholder="Type an English sentence or Nepali thought…"
                        className="input !text-base sm:!text-sm"
                      />
                      <button
                        type="submit"
                        disabled={isSentenceCoachLoading || !sentenceCoachInput.trim()}
                        className="btn btn-p !min-h-[48px] disabled:opacity-40"
                      >
                        {isSentenceCoachLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Check
                      </button>
                    </form>

                    <div className="flex gap-2 flex-wrap">
                      {[
                        'I am having a doubt in this work.',
                        'Yesterday I have gone to office.',
                        'म भोलि बिहान मिटिङमा उपस्थित हुनेछु।',
                      ].map((sample) => (
                        <button
                          key={sample}
                          type="button"
                          onClick={() => handleRunSentenceCoach(sample)}
                          className="pill np !min-h-[36px] !text-xs"
                        >
                          “{sample}”
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setIsAIRoleplayOpen(true)}
                        className="pill !min-h-[36px] !text-xs sm:hidden"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Live roleplay
                      </button>
                    </div>

                    {sentenceCoachError && (
                      <div className="text-[13px] text-[#9E2A2B] dark:text-red-300 bg-[#F8E7E3] dark:bg-red-950/40 px-3.5 py-2.5 rounded-[14px]">
                        {sentenceCoachError}
                      </div>
                    )}

                    {isSentenceCoachLoading && (
                      <div
                        aria-label="Analyzing sentence"
                        className="p-4 rounded-[14px] bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] space-y-2.5"
                      >
                        <div className="h-4 w-24 rounded-md skeleton-shimmer" />
                        <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
                        <div className="h-10 w-full rounded-lg skeleton-shimmer" />
                      </div>
                    )}

                    {!isSentenceCoachLoading && sentenceCoachResult && (
                      <div className="border border-[#E6E0D4] dark:border-[#2E2924] bg-[#FAF8F4] dark:bg-[#141210] rounded-[14px] px-4 py-3.5 flex flex-col gap-2 animate-fade-up">
                        <div className="flex items-center justify-between gap-2">
                          <span className="tag t-sage">
                            <CheckCircle2 className="w-3 h-3" />
                            {sentenceCoachResult.focusTag || 'Polished English'}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              speechService.speak(sentenceCoachResult.correctedEnglish, {
                                rate: progress.preferredSpeechRate,
                              })
                            }
                            className="text-[13px] text-[#9E2A2B] dark:text-[#F87171] font-semibold inline-flex items-center gap-1 hover:underline"
                          >
                            <Volume2 className="w-4 h-4" />
                            Listen
                          </button>
                        </div>
                        <strong className="serif text-xl text-[#1C1917] dark:text-[#F5F2EB]">
                          “{sentenceCoachResult.correctedEnglish}”
                        </strong>
                        <span className="text-[13px] text-[#57534E] dark:text-[#A8A29E]">
                          Natural workplace option:{' '}
                          <span className="sage font-semibold">“{sentenceCoachResult.naturalAlternative}”</span>
                        </span>
                        <span className="np text-[13px] text-[#1C1917] dark:text-[#F5F2EB]">
                          <span className="muted font-sans">Nepali meaning: </span>
                          {sentenceCoachResult.nepaliMeaning}
                        </span>
                        <div className="pt-2 border-t border-[#EFE9DD] dark:border-[#2E2924] np text-[13px] text-[#57534E] dark:text-[#A8A29E] space-y-1">
                          <p>
                            <strong>व्याकरण टिप:</strong> {sentenceCoachResult.grammarTipNepali}
                          </p>
                          <p>
                            <strong>वाक्य संरचना (SVO vs SOV):</strong> {sentenceCoachResult.svoComparisonNote}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-[#EFE9DD] dark:border-[#2E2924] flex items-center justify-between gap-2 text-[11px] muted">
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
                <aside className="contents xl:block xl:col-span-4 xl:space-y-6 xl:sticky xl:top-20">
                  {/* 1. BRAND-ALIGNED "TODAY GOALS" CARD (WARM SANDSTONE & PAPER) */}
                  <div className="order-3 xl:order-none min-w-0">
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

                    const minsLeft = Math.max(1, targetMins - todayMins);

                    return (
                      <section className="card !p-0 overflow-hidden" aria-labelledby="home-goal">
                        <div className="bg-[#F2EBDC] dark:bg-[#221E1A] px-5 py-3.5 flex justify-between items-center gap-2">
                          <h3 id="home-goal" className="h3 flex gap-2 items-center text-[#1C1917] dark:text-[#F5F2EB]">
                            <Target className="w-[18px] h-[18px] ochre" />
                            Today’s goal
                          </h3>
                          <button
                            type="button"
                            onClick={() => navigateTab('settings')}
                            title="Adjust daily study goal"
                            className="text-xs font-semibold text-[#6B4D1E] dark:text-amber-300 hover:underline"
                          >
                            {targetMins} min target
                          </button>
                        </div>
                        <div className="p-5 flex gap-5 items-center">
                          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 76 76" aria-hidden="true">
                              <circle cx="38" cy="38" r={ringRadius} fill="none" strokeWidth="7" className="stroke-[#EFE9DD] dark:stroke-[#2E2924]" />
                              <circle
                                cx="38"
                                cy="38"
                                r={ringRadius}
                                fill="none"
                                strokeWidth="7"
                                strokeLinecap="round"
                                strokeDasharray={ringCircumference}
                                strokeDashoffset={ringOffset}
                                className={`transition-all duration-500 ${isTodayGoalMet ? 'stroke-[#2D6A4F]' : 'stroke-[#B07D2E]'}`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                              <span className="serif text-2xl tabular-nums text-[#1C1917] dark:text-[#F5F2EB]">{todayMins}</span>
                              <span className="muted text-[11px] mt-0.5">of {targetMins} min</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2.5 min-w-0">
                            <div>
                              <div className="serif text-[22px] text-[#1C1917] dark:text-[#F5F2EB]">
                                {isTodayGoalMet ? 'Goal met today' : `${minsLeft} min to go`}
                              </div>
                              <div className="muted text-[13px]">
                                {isTodayGoalMet ? 'Lovely work — anything more is a bonus.' : 'One step finishes today’s goal.'}
                              </div>
                            </div>
                            <div className="flex gap-3.5 text-[13px] flex-wrap items-center">
                              <button
                                type="button"
                                onClick={() => openProgressSubView('overview')}
                                className="inline-flex gap-[5px] items-center hover:underline"
                              >
                                <Flame className="w-4 h-4 text-[#B4541A]" />
                                <strong className="tabular-nums">{progress.currentStreakDays || 0}</strong> days
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsLevelUpModalOpen(true)}
                                className="inline-flex gap-[5px] items-center hover:underline"
                              >
                                <Sparkles className="w-4 h-4 ochre" />
                                <strong className="tabular-nums">{totalXPEarned.toLocaleString()}</strong> XP
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsLevelUpModalOpen(true)}
                                className="tag t-ochre hover:brightness-95"
                              >
                                <Trophy className="w-3 h-3" />
                                Lv {learnerLevelNumber}
                              </button>
                            </div>
                          </div>
                        </div>
                      </section>
                    );
                  })()}
                  </div>

                  {/* 2. YOUR WEEK (artifact .card: 7 bars, selected-day ring, footer tag) */}
                  <div className="order-8 xl:order-none min-w-0">
                  {(() => {
                    const sel =
                      selectedWeekDayIdx !== null ? homeWeekBars.entries[selectedWeekDayIdx] : null;
                    return (
                      <section className="card" aria-labelledby="home-week">
                        <div className="sec">
                          <h3 id="home-week" className="h3 text-[#1C1917] dark:text-[#F5F2EB]">
                            Your week
                          </h3>
                          <button
                            type="button"
                            onClick={() => openProgressSubView('overview')}
                            className="muted text-xs hover:text-[#9E2A2B] dark:hover:text-[#F87171]"
                            title="Open progress details"
                          >
                            {homeWeekBars.goalsMetCount} of 7 goals · {homeWeekBars.totalMinutes} min →
                          </button>
                        </div>
                        <div
                          className="grid grid-cols-7 gap-2 items-end h-[120px] mt-4"
                          role="group"
                          aria-label="Pick a day"
                        >
                          {homeWeekBars.entries.map((bar) => {
                            const isSelected = selectedWeekDayIdx === bar.idx;
                            const isTodayBar = bar.idx === 6;
                            return (
                              <button
                                key={bar.idx}
                                type="button"
                                aria-pressed={isSelected}
                                aria-label={`${bar.dayName}: ${bar.minutes} min${bar.isGoalMet ? ', goal met' : ''}`}
                                onClick={() => {
                                  speechService.triggerHaptic('light');
                                  setSelectedWeekDayIdx((prev) => (prev === bar.idx ? null : bar.idx));
                                }}
                                className="h-full flex flex-col items-center justify-end gap-1.5"
                              >
                                <span
                                  className={`block w-full max-w-[30px] rounded-lg transition-all duration-300 ${
                                    bar.isGoalMet ? 'bg-[#2D6A4F]' : 'bg-[#D9D1C3] dark:bg-[#3A332D]'
                                  } ${
                                    isSelected
                                      ? 'shadow-[0_0_0_3px_#FAF8F4,0_0_0_5px_#9E2A2B] dark:shadow-[0_0_0_3px_#1A1714,0_0_0_5px_#F87171]'
                                      : ''
                                  }`}
                                  style={{ height: `${Math.max(6, bar.pct)}%` }}
                                />
                                <span
                                  className={`text-[11px] ${
                                    isSelected
                                      ? 'font-bold text-[#9E2A2B] dark:text-[#F87171]'
                                      : isTodayBar
                                      ? 'font-bold text-[#1C1917] dark:text-[#F5F2EB]'
                                      : 'font-medium muted'
                                  }`}
                                >
                                  {bar.letter}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex justify-between items-center gap-2 mt-3 pt-3 border-t border-[#EFE9DD] dark:border-[#2E2924]">
                          <strong className="text-[13px] text-[#1C1917] dark:text-[#F5F2EB]">
                            {sel ? `${sel.dayName} · ${sel.minutes} min` : `This week · ${homeWeekBars.totalMinutes} min`}
                          </strong>
                          {sel ? (
                            <span className={`tag ${sel.isGoalMet ? 't-sage' : 't-ochre'}`}>
                              {sel.isGoalMet
                                ? `Daily ${homeWeekBars.dailyGoal}-min goal met`
                                : `${Math.max(0, homeWeekBars.dailyGoal - sel.minutes)} min short of goal`}
                            </span>
                          ) : (
                            <span className="tag t-ink">Target {homeWeekBars.dailyGoal} min/day</span>
                          )}
                        </div>
                      </section>
                    );
                  })()}
                  </div>

                  {/* 3. DAILY CHALLENGE (artifact .card.ink) */}
                  <div className="order-1 xl:order-none min-w-0">
                  <section className="card ink flex flex-row xl:flex-col items-center xl:items-stretch gap-3.5 !p-3.5 xl:!p-6" aria-labelledby="home-challenge">
                    <div className="flex gap-3 items-center flex-1 min-w-0">
                      <span className="ico bg-[#3A2F22] text-[#E9C77B] dark:bg-[#F2EBDC] dark:text-[#8C6527]">
                        <Sparkles className="w-5 h-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 id="home-challenge" className="h3">Daily challenge</h3>
                        <div className="text-xs text-[#C9C1B4] dark:text-[#57534E]">
                          3 recall questions · +60 XP · 2 min
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDailyChallengeOpen(true)}
                      className="btn !min-h-[42px] xl:!min-h-[44px] xl:w-full bg-[#F5F2EB] text-[#1C1917] hover:bg-white dark:bg-[#1C1917] dark:text-[#F5F2EB] dark:hover:bg-[#2E2924]"
                    >
                      Start challenge
                    </button>
                  </section>
                  </div>

                  {/* 4. SNAPSHOT (artifact .g2 of .card.kpi with .ico.xs) */}
                  <div className="order-9 xl:order-none min-w-0">
                  {isInitialHydrating ? (
                    <section aria-label="Loading learning metrics" className="grid grid-cols-2 gap-3">
                      {[0, 1, 2, 3].map((idx) => (
                        <div key={idx} className="card !p-4 space-y-2">
                          <div className="h-3 w-20 rounded-md skeleton-shimmer" />
                          <div className="h-6 w-16 rounded-lg skeleton-shimmer" />
                        </div>
                      ))}
                    </section>
                  ) : (
                    <section className="grid grid-cols-2 gap-3" aria-label="Course snapshot">
                      {[
                        {
                          key: 'lectures',
                          label: 'Lectures',
                          tone: 'i-crim',
                          Icon: BookOpen,
                          value: (
                            <>
                              {courseStats.completedCount}
                              <span className="muted text-[15px]">/{courseStats.totalUnits}</span>
                            </>
                          ),
                          onClick: () => navigateTab('lessons'),
                        },
                        {
                          key: 'words',
                          label: 'Words learned',
                          tone: 'i-ochre',
                          Icon: BookMarked,
                          value: <>{wordsLearnedDisplayCount}</>,
                          onClick: () => navigateTab('dictionary'),
                        },
                        {
                          key: 'streak',
                          label: 'Best streak',
                          tone: 'i-sage',
                          Icon: Flame,
                          value: (
                            <>
                              {Math.max(progress.longestStreakDays || 0, progress.currentStreakDays || 0)}
                              <span className="muted text-[15px]"> days</span>
                            </>
                          ),
                          onClick: () => openProgressSubView('overview'),
                        },
                        {
                          key: 'srs',
                          label: 'SRS due',
                          tone: 'i-ink',
                          Icon: RefreshCw,
                          value: <span className="crim">{mistakeRadarSummary.dueCount}</span>,
                          onClick: () => navigateTab('dictionary'),
                        },
                      ].map(({ key, label, tone, Icon, value, onClick }) => (
                        <button key={key} type="button" onClick={onClick} className="card kpi hov !p-4 text-left">
                          <span className="top">
                            <span className="muted text-xs">{label}</span>
                            <span className={`ico xs ${tone}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                          </span>
                          <span className="serif text-2xl tabular-nums text-[#1C1917] dark:text-[#F5F2EB]">{value}</span>
                        </button>
                      ))}
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

      {/* First-run Welcome onboarding (level, daily goal, explanation language) */}
      <WelcomeOnboarding
        isOpen={showWelcomeOnboarding}
        learnerFirstName={progress.userName?.trim().split(' ')[0] || undefined}
        firstLessonTitle={firstCoreLecture?.title || ''}
        firstLessonNumber={firstCoreLecture?.lectureNumber || 1}
        defaultLevel={progress.selectedLevel}
        defaultGoalMinutes={progress.dailyGoalMinutes || 15}
        defaultLanguageMode={languageMode}
        defaultReminder={progress.dailyReminderEnabled !== false}
        onSkip={handleSkipWelcome}
        onFinish={handleFinishWelcome}
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
