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
  resetAllUserProgress,
} from './services/storage';
import { speechService } from './services/speech';
import { useOnlineStatus } from './hooks/usePWA';
import { LecturePlayer, ModuleStep } from './components/LecturePlayer';
import { DictionaryView } from './components/DictionaryView';
import { AILessonModal } from './components/AILessonModal';
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

type NavTab = 'home' | 'lessons' | 'dictionary' | 'arena' | 'progress' | 'settings' | 'about';

export default function App() {
  const [progress, setProgress] = useState<UserProgressState>(() => loadUserProgress());
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeLectureId, setActiveLectureId] = useState<string | null>(null);
  const [initialModuleStep, setInitialModuleStep] = useState<ModuleStep>(0);
  const [dictionaryLectureFilter, setDictionaryLectureFilter] = useState<number | null>(null);

  // Lessons Curriculum Filter ('ALL' | 'B1' | 'B2' | 'C1')
  const [levelFilter, setLevelFilter] = useState<'ALL' | CEFRLevel>('ALL');
  const [expandedLessonPreviewId, setExpandedLessonPreviewId] = useState<string | null>(null);

  // Global Top Search Bar State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
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
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (progress.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [progress.darkMode]);

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
        dailyGoalMinutes: progress.dailyGoalMinutes,
      });

      if (includeCloud && firebaseUser) {
        const syncedFresh = await resetCloudProgress(firebaseUser, freshLocal);
        setProgress(syncedFresh);
        setCloudSyncStatusMsg('All progress reset to 0 locally and in Google Cloud');
      } else {
        setProgress(freshLocal);
        setCloudSyncStatusMsg('Local progress reset to 0');
      }
      setLiveAchievementToast(null);
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
    setActiveTab('lessons');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openSectionInDictionary = (lectureNumber: number) => {
    setDictionaryLectureFilter(lectureNumber);
    setActiveLectureId(null);
    setActiveTab('dictionary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const entries = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(Date.now() - (6 - idx) * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      const letter = d.toLocaleDateString('en-US', { weekday: 'short' })[0] || 'D';
      const loggedCount = progress.studyActivityByDate?.[dateStr] || 0;
      const minutes = loggedCount * 5;
      const pct = loggedCount > 0 ? Math.min(95, Math.max(22, loggedCount * 20)) : 10;
      return {
        idx,
        letter,
        dayName,
        dateStr,
        minutes,
        loggedCount,
        pct,
        isFilled: loggedCount > 0,
      };
    });
    const totalMinutes = entries.reduce((acc, item) => acc + item.minutes, 0);
    return { entries, totalMinutes };
  }, [progress.studyActivityByDate]);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] dark:bg-[#141210] text-[#1C1917] dark:text-[#F5F2EB]">
      {/* =================================================================== */}
      {/* TOP HEADER BAR: [भ BhashaSetu] — [Global Search] — [Streak + Avatar] */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 h-16 bg-[#FAF8F4]/95 dark:bg-[#141210]/95 backdrop-blur-md border-b border-[#E6E0D4] dark:border-[#2E2924] px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand Mark (भ in crimson rounded square + BhashaSetu) */}
        <div className="flex items-center gap-6 shrink-0">
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
          className="relative flex-1 max-w-md mx-auto hidden sm:block"
        >
          <div className="relative">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalSearchQuery}
              onFocus={() => setIsSearchDropdownOpen(true)}
              onChange={(e) => {
                setGlobalSearchQuery(e.target.value);
                setIsSearchDropdownOpen(true);
              }}
              placeholder="Search words, lessons, or activities"
              className="w-full h-10 pl-10 pr-8 rounded-xl bg-[#F3EFE6] dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] text-xs sm:text-sm text-[#1C1917] dark:text-[#F5F2EB] placeholder:text-[#78716C] focus:outline-none focus:border-[#A82020] transition-colors"
            />
            {globalSearchQuery && (
              <button
                type="button"
                onClick={() => setGlobalSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Instant Global Search Results Popover */}
          {isSearchDropdownOpen && globalSearchResults && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl shadow-xl p-3 space-y-3 z-50 max-h-[420px] overflow-y-auto">
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
        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => openProgressSubView('overview')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] transition-colors"
            title="View your study streak and shields"
          >
            <Flame className="w-4 h-4 text-[#A82020]" />
            <span>{progress.currentStreakDays || 0} day streak</span>
          </button>

          {/* User Avatar Button + Rich User Profile, Login & Settings Popover */}
          <div ref={avatarMenuRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setAvatarDraftName(fullDisplayName);
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

      {/* Celebratory Live Achievement Unlock Toast Banner */}
      {liveAchievementToast && (
        <div className="sticky top-16 z-40 bg-[#1F5C3D] text-white border-b border-emerald-700 px-4 py-3 shadow-lg">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-[#1C1917] flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-ipa uppercase tracking-wider text-amber-200 font-semibold">
                  Achievement Unlocked! · {liveAchievementToast.nepaliTitle}
                </div>
                <div className="text-sm font-bold">
                  {liveAchievementToast.title} —{' '}
                  <span className="font-normal text-emerald-100 text-xs">
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
                className="px-3 py-1.5 rounded-lg bg-amber-400 text-[#1C1917] text-xs font-semibold hover:bg-amber-300"
              >
                View Badge
              </button>
              <button
                type="button"
                onClick={() => setLiveAchievementToast(null)}
                aria-label="Dismiss achievement notification"
                className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* BODY LAYOUT: PERSISTENT LEFT SIDEBAR + MAIN CONTENT WORKSPACE       */}
      {/* =================================================================== */}
      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        {/* Left Sidebar (Desktop >= md) matching Screenshots 1, 2, 3 */}
        <aside className="hidden md:flex w-60 shrink-0 flex-col justify-between border-r border-[#E6E0D4] dark:border-[#2E2924] bg-[#FAF8F4] dark:bg-[#141210] px-4 py-6 select-none">
          <div className="space-y-6">
            {/* Group 1: LEARN */}
            <div>
              <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8C857B] dark:text-[#A8A29E] mb-2">
                LEARN
              </div>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => navigateTab('home')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    activeTab === 'home' && !activeLectureId
                      ? 'font-semibold text-[#1C1917] dark:text-[#F5F2EB] bg-[#F2EDE4] dark:bg-[#1F1C18]'
                      : 'font-normal text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] hover:bg-[#F2EDE4]/50'
                  }`}
                >
                  <Home className="w-4 h-4 shrink-0" />
                  <span>Home</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTab('lessons')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    activeTab === 'lessons' || Boolean(activeLectureId)
                      ? 'font-semibold text-[#1C1917] dark:text-[#F5F2EB] bg-[#F2EDE4] dark:bg-[#1F1C18]'
                      : 'font-normal text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] hover:bg-[#F2EDE4]/50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>Lessons</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTab('dictionary')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    activeTab === 'dictionary'
                      ? 'font-semibold text-[#1C1917] dark:text-[#F5F2EB] bg-[#F2EDE4] dark:bg-[#1F1C18]'
                      : 'font-normal text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] hover:bg-[#F2EDE4]/50'
                  }`}
                >
                  <BookMarked className="w-4 h-4 shrink-0" />
                  <span>Dictionary</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTab('arena')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    activeTab === 'arena'
                      ? 'font-semibold text-[#1C1917] dark:text-[#F5F2EB] bg-[#F2EDE4] dark:bg-[#1F1C18]'
                      : 'font-normal text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] hover:bg-[#F2EDE4]/50'
                  }`}
                >
                  <Puzzle className="w-4 h-4 shrink-0" />
                  <span>Practice arena</span>
                </button>
              </nav>
            </div>

            <div className="border-t border-[#E6E0D4] dark:border-[#2E2924]" />

            {/* Group 2: YOUR JOURNEY */}
            <div>
              <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8C857B] dark:text-[#A8A29E] mb-2">
                YOUR JOURNEY
              </div>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => navigateTab('progress')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    activeTab === 'progress'
                      ? 'font-semibold text-[#1C1917] dark:text-[#F5F2EB] bg-[#F2EDE4] dark:bg-[#1F1C18]'
                      : 'font-normal text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] hover:bg-[#F2EDE4]/50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  <span>Progress</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTab('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    activeTab === 'settings'
                      ? 'font-semibold text-[#1C1917] dark:text-[#F5F2EB] bg-[#F2EDE4] dark:bg-[#1F1C18]'
                      : 'font-normal text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] hover:bg-[#F2EDE4]/50'
                  }`}
                >
                  <Sliders className="w-4 h-4 shrink-0" />
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTab('about')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    activeTab === 'about'
                      ? 'font-semibold text-[#1C1917] dark:text-[#F5F2EB] bg-[#F2EDE4] dark:bg-[#1F1C18]'
                      : 'font-normal text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] hover:bg-[#F2EDE4]/50'
                  }`}
                >
                  <Info className="w-4 h-4 shrink-0" />
                  <span>About guide</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Bottom Sidebar Offline Readiness Card matching Screenshots 1, 2, 3 */}
          <div className="p-3.5 rounded-2xl bg-[#EFECE4] dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924]">
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
              onToggleMasterWord={handleToggleMasteredWord}
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
              firebaseUser={firebaseUser}
              isCloudSyncing={isCloudSyncing}
              cloudSyncStatusMsg={cloudSyncStatusMsg}
              onGoogleSignIn={handleGoogleSignIn}
              onGoogleSignOut={handleGoogleSignOut}
              onPullFromCloud={handlePullFromCloud}
              onUpdateUserName={handleUpdateUserName}
              onToggleDailyReminder={handleToggleDailyReminder}
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
              onResetAllProgress={handleResetAllProgress}
            />
          ) : activeTab === 'about' ? (
            <AboutView
              languageMode={languageMode}
              preferredSpeechRate={progress.preferredSpeechRate}
              onStartCurriculum={() => navigateTab('lessons')}
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
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 pb-24 space-y-8">
              {/* Top Heading */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A82020] dark:text-[#F87171] mb-2">
                  YOUR CURRICULUM
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1917] dark:text-[#F5F2EB] tracking-tight">
                  Lessons for your next step
                </h1>
                <p className="text-sm sm:text-base text-[#6E685F] dark:text-[#A8A29E] mt-1.5">
                  A guided path from everyday fluency to confident expression.
                </p>
              </div>

              {/* Filter Pills Row + "+ Create AI lesson" Button */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
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
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
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

                <button
                  type="button"
                  onClick={() => setIsAIModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#A82020] hover:bg-[#8E1B1B] text-white text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create AI lesson</span>
                </button>
              </div>

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
                    const groupLessons = CORE_SYLLABUS.filter((l) => l.level === grp.level);
                    return (
                      <section
                        key={grp.level}
                        className="rounded-2xl bg-[#F5F2EB] dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] p-4 sm:p-5 space-y-3"
                      >
                        {/* Track Header Row */}
                        <div className="flex items-center justify-between gap-2 px-1 py-1">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${grp.badgeBg}`}
                            >
                              {grp.level}
                            </span>
                            <h2 className="text-sm sm:text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                              {grp.title}
                            </h2>
                          </div>
                          <span className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                            {grp.rangeLabel}
                          </span>
                        </div>

                        {/* Lesson Cards inside Group */}
                        <div className="space-y-2.5">
                          {groupLessons.map((lesson) => {
                            const isCompleted = progress.completedUnitIds.includes(lesson.id);
                            const stepsDone =
                              progress.completedStepsByLecture?.[lesson.id]?.length || 0;
                            const isCurrentActive =
                              !isCompleted &&
                              (recommendedLecture?.id === lesson.id || stepsDone > 0);
                            const { displayTitle, displaySub, duration } =
                              getEditorialLessonPresentation(lesson);
                            const isPreviewExpanded = expandedLessonPreviewId === lesson.id;

                            return (
                              <div
                                key={lesson.id}
                                className={`rounded-2xl bg-white dark:bg-[#141210] transition-all ${
                                  isCurrentActive
                                    ? 'border-[1.5px] border-[#C86D63] dark:border-[#F87171] shadow-xs'
                                    : 'border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#A82020]/50'
                                }`}
                              >
                                <div
                                  onClick={() =>
                                    openLecture(
                                      lesson.id,
                                      isCurrentActive
                                        ? (Math.min(4, stepsDone) as ModuleStep)
                                        : 0
                                    )
                                  }
                                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                                >
                                  {/* Left: Number Box + Title & Subtitle */}
                                  <div className="flex items-center gap-4 min-w-0">
                                    <div
                                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-serif text-base font-medium shrink-0 ${
                                        isCurrentActive
                                          ? 'bg-[#F8E7E3] dark:bg-red-950/50 text-[#A82020] dark:text-red-300'
                                          : 'bg-[#EDE8DC] dark:bg-[#26221E] text-[#57534E] dark:text-[#A8A29E]'
                                      }`}
                                    >
                                      {String(lesson.lectureNumber).padStart(2, '0')}
                                    </div>
                                    <div className="min-w-0">
                                      <h3 className="text-sm sm:text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                                        {displayTitle}
                                      </h3>
                                      <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5 truncate">
                                        {displaySub}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Right: Steps Info + Status Pill + Action */}
                                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                                    <span className="text-xs text-[#78716C] dark:text-[#A8A29E] whitespace-nowrap">
                                      {isCurrentActive
                                        ? `Step ${Math.max(1, stepsDone + 1)} of 5 · ${duration} min left`
                                        : `5 steps · ${duration} min`}
                                    </span>

                                    {isCompleted ? (
                                      <div className="flex items-center gap-3">
                                        <span className="px-4 py-1.5 rounded-full bg-[#DCECE2] dark:bg-emerald-950/60 text-[#1F5C3D] dark:text-emerald-300 text-xs font-medium min-w-[115px] text-center">
                                          Completed
                                        </span>
                                        <Check className="w-4 h-4 text-[#57534E]" />
                                      </div>
                                    ) : isCurrentActive ? (
                                      <div className="flex items-center gap-2.5">
                                        <span className="px-3.5 py-1.5 rounded-full bg-[#F0ECE1] dark:bg-[#26221E] text-[#6E685F] dark:text-[#A8A29E] text-xs font-medium">
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
                                          className="px-4 py-2 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-xs font-semibold text-[#A82020] dark:text-[#F87171] hover:bg-[#FAF8F4]"
                                        >
                                          Continue
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-3">
                                        <span className="px-4 py-1.5 rounded-full bg-[#E3ECF6] dark:bg-slate-900 text-[#3B5984] dark:text-blue-300 text-xs font-medium min-w-[115px] text-center">
                                          Up next
                                        </span>
                                        <Lock className="w-4 h-4 text-[#8C857B]" />
                                      </div>
                                    )}

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedLessonPreviewId((prev) =>
                                          prev === lesson.id ? null : lesson.id
                                        );
                                      }}
                                      aria-label="Preview interactive lesson steps"
                                      className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F4] dark:hover:bg-[#1F1C18]"
                                      title="Preview 5 interactive steps & vocabulary"
                                    >
                                      {isPreviewExpanded ? (
                                        <ChevronUp className="w-4 h-4" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* Interactive Step Launcher & Vocabulary Preview Drawer */}
                                {isPreviewExpanded && (
                                  <div className="px-5 pb-4 pt-2 border-t border-[#EFEAE0] dark:border-[#2E2924] bg-[#FAF8F4]/70 dark:bg-[#1A1714] rounded-b-2xl space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                      <span className="font-semibold text-[#57534E] dark:text-[#A8A29E]">
                                        Jump directly to any interactive step:
                                      </span>
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        {[
                                          { step: 0 as ModuleStep, label: '01 · Vocabulary' },
                                          { step: 1 as ModuleStep, label: '02 · Silent Phonics' },
                                          { step: 2 as ModuleStep, label: '03 · Grammar & Syntax' },
                                          { step: 3 as ModuleStep, label: '04 · Live Dialogue' },
                                          { step: 4 as ModuleStep, label: '05 · Mastery Quiz' },
                                        ].map((st) => (
                                          <button
                                            key={st.step}
                                            type="button"
                                            onClick={() => openLecture(lesson.id, st.step)}
                                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#A82020] text-[11px] font-medium text-[#1C1917] dark:text-[#F5F2EB]"
                                          >
                                            {st.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                      <span className="text-[#78716C]">Key Words (click to hear):</span>
                                      {lesson.moduleA_vocabulary.slice(0, 6).map((vocab) => (
                                        <button
                                          key={vocab.id}
                                          type="button"
                                          onClick={() =>
                                            speechService.speak(vocab.word, {
                                              rate: progress.preferredSpeechRate,
                                            })
                                          }
                                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-xs inline-flex items-center gap-1 hover:border-[#A82020]"
                                        >
                                          <Volume2 className="w-3 h-3 text-[#A82020]" />
                                          <span className="font-medium">{vocab.word}</span>
                                          <span className="font-nepali text-[#1F5C3D] text-[11px]">
                                            ({vocab.nepaliMeaning})
                                          </span>
                                        </button>
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
              </div>

              {/* Bottom Section: Your custom lessons (Exact match to Screenshot 2) */}
              <section className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#1C1917] dark:text-[#F5F2EB]">
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
                        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#A82020] flex items-center justify-between gap-4 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-[#F8E7E3] text-[#A82020] flex items-center justify-center font-serif font-semibold text-sm">
                            AI
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                              {customLec.title}
                            </h3>
                            <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                              {customLec.subtitle}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl bg-[#A82020] text-white text-xs font-medium"
                        >
                          Open lesson
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : (
            /* =============================================================== */
            /* HOME VIEW (Exact Editorial Match to Screenshot 1)               */
            /* =============================================================== */
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 pb-24 space-y-6">
              {/* Greeting Header */}
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1917] dark:text-[#F5F2EB] tracking-tight">
                  Namaste, {firstName}
                </h1>
                <p className="text-sm sm:text-base text-[#6E685F] dark:text-[#A8A29E] mt-1.5">
                  Take a quiet moment for yourself. Your next English lesson is ready.
                </p>
              </div>

              {/* Hero Card: CONTINUE YOUR PATH + Open Book अ | A Illustration */}
              <section className="rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] p-6 sm:p-8 shadow-[0_1px_2px_rgba(28,25,23,0.03)]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-8 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A82020] dark:text-[#F87171]">
                      {progress.completedUnitIds.length === 0 &&
                      (progress.completedStepsByLecture?.[recommendedLecture.id]?.length || 0) === 0
                        ? 'START YOUR PATH'
                        : 'CONTINUE YOUR PATH'}
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1C1917] dark:text-[#F5F2EB] leading-snug">
                      {`Lesson ${String(recommendedLecture.lectureNumber).padStart(2, '0')} · ${
                        getEditorialLessonPresentation(recommendedLecture).displayTitle
                      }`}
                    </h2>
                    <p className="text-sm text-[#6E685F] dark:text-[#A8A29E] max-w-xl leading-relaxed">
                      {recommendedLecture.subtitle}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          openLecture(
                            recommendedLecture.id,
                            Math.min(
                              4,
                              progress.completedStepsByLecture?.[recommendedLecture.id]?.length || 0
                            ) as ModuleStep
                          )
                        }
                        className="px-5 py-3 rounded-xl bg-[#A82020] hover:bg-[#8E1B1B] text-white text-sm font-medium inline-flex items-center gap-2 transition-colors shadow-xs"
                      >
                        <span>
                          {(progress.completedStepsByLecture?.[recommendedLecture.id]?.length || 0) > 0
                            ? 'Continue lesson'
                            : 'Start lesson'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                        Step{' '}
                        {Math.min(
                          5,
                          (progress.completedStepsByLecture?.[recommendedLecture.id]?.length || 0) +
                            1
                        )}{' '}
                        of 5 · About{' '}
                        {getEditorialLessonPresentation(recommendedLecture).duration} minutes
                      </span>
                    </div>
                  </div>

                  {/* Right Open-Book Bridge Illustration Box (अ | A) */}
                  <div className="lg:col-span-4 flex justify-center lg:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        speechService.speak('Knowledge, subtle, castle', {
                          rate: progress.preferredSpeechRate,
                        })
                      }
                      title="Click to hear sample pronunciation"
                      className="w-full max-w-[240px] h-36 rounded-2xl bg-[#F4EFE4] dark:bg-[#26221E] border border-[#E6E0D4] dark:border-[#3A342E] flex items-center justify-center p-4 hover:border-[#A82020]/50 transition-colors group"
                    >
                      <svg
                        viewBox="0 0 200 120"
                        className="w-40 h-28"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Left Page */}
                        <path
                          d="M100 28 C78 22, 46 22, 24 28 L24 94 C46 88, 78 88, 100 94 Z"
                          fill="#FAF8F4"
                          stroke="#8C7A6B"
                          strokeWidth="2"
                        />
                        {/* Right Page */}
                        <path
                          d="M100 28 C122 22, 154 22, 176 28 L176 94 C154 88, 122 88, 100 94 Z"
                          fill="#FAF8F4"
                          stroke="#8C7A6B"
                          strokeWidth="2"
                        />
                        {/* Center Spine */}
                        <line
                          x1="100"
                          y1="28"
                          x2="100"
                          y2="94"
                          stroke="#8C7A6B"
                          strokeWidth="2"
                        />
                        {/* Left Character: अ */}
                        <text
                          x="62"
                          y="68"
                          textAnchor="middle"
                          fill="#A82020"
                          fontSize="26"
                          fontWeight="600"
                          fontFamily="Noto Sans Devanagari, serif"
                        >
                          अ
                        </text>
                        {/* Right Character: A */}
                        <text
                          x="138"
                          y="68"
                          textAnchor="middle"
                          fill="#A82020"
                          fontSize="26"
                          fontWeight="500"
                          fontFamily="Newsreader, Georgia, serif"
                        >
                          A
                        </text>
                      </svg>
                    </button>
                  </div>
                </div>
              </section>

              {/* 4 KPI Summary Cards Row (Starting cleanly from 0) */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => navigateTab('dictionary')}
                  className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-5 text-left hover:border-[#A82020]/50 transition-colors"
                >
                  <div className="text-xs text-[#78716C] dark:text-[#A8A29E]">Words learned</div>
                  <div className="font-serif text-2xl sm:text-3xl text-[#1C1917] dark:text-[#F5F2EB] mt-2">
                    {wordsLearnedDisplayCount}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTab('lessons')}
                  className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-5 text-left hover:border-[#A82020]/50 transition-colors"
                >
                  <div className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                    Lessons completed
                  </div>
                  <div className="font-serif text-2xl sm:text-3xl text-[#1C1917] dark:text-[#F5F2EB] mt-2">
                    {courseStats.completedCount}{' '}
                    <span className="text-base font-sans text-[#78716C]">
                      of {courseStats.totalUnits}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => openProgressSubView('overview')}
                  className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-5 text-left hover:border-[#A82020]/50 transition-colors"
                >
                  <div className="text-xs text-[#78716C] dark:text-[#A8A29E]">Daily streak</div>
                  <div className="font-serif text-2xl sm:text-3xl text-[#1C1917] dark:text-[#F5F2EB] mt-2">
                    {progress.currentStreakDays || 0}{' '}
                    <span className="text-base font-sans text-[#78716C]">days</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTab('settings')}
                  className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-5 text-left hover:border-[#A82020]/50 transition-colors"
                >
                  <div className="text-xs text-[#78716C] dark:text-[#A8A29E]">Current level</div>
                  <div className="font-serif text-2xl sm:text-3xl text-[#1C1917] dark:text-[#F5F2EB] mt-2">
                    {progress.currentLevel || 'B1'}
                  </div>
                </button>
              </section>

              {/* Two-Column Middle Section: "Pick up where you left off" + "Your week" Bar Chart */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Column: Pick up where you left off (with 3 action rows) */}
                <div className="lg:col-span-7 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <h2 className="font-serif text-xl text-[#1C1917] dark:text-[#F5F2EB]">
                      Pick up where you left off
                    </h2>

                    {/* Row 1: Saved words or Flashcard refresher */}
                    <button
                      type="button"
                      onClick={() => navigateTab('dictionary')}
                      className="w-full p-4 rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#A82020]/60 flex items-center justify-between gap-4 text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#F8E7E3] dark:bg-red-950/50 text-[#A82020] dark:text-red-300 flex items-center justify-center shrink-0">
                          <BookMarked className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                            {progress.savedWordIds.length > 0
                              ? `Review ${progress.savedWordIds.length} saved words`
                              : 'Explore silent-letter flashcards'}
                          </div>
                          <div className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                            {progress.savedWordIds.length > 0
                              ? 'A 3-minute flashcard refresher from your saved deck'
                              : 'Browse 10,000+ words and bookmark your study deck'}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#78716C] group-hover:text-[#A82020] transition-colors" />
                    </button>

                    {/* Row 2: Quick pronunciation check */}
                    <button
                      type="button"
                      onClick={() => openArenaTool('shadowing')}
                      className="w-full p-4 rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#A82020]/60 flex items-center justify-between gap-4 text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#DCECE2] dark:bg-emerald-950/50 text-[#1F5C3D] dark:text-emerald-300 flex items-center justify-center shrink-0">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                            Quick pronunciation check
                          </div>
                          <div className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                            Listen and compare your voice
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#78716C] group-hover:text-[#1F5C3D] transition-colors" />
                    </button>

                    {/* Row 3: 60-second word sprint */}
                    <button
                      type="button"
                      onClick={() => openArenaTool('sprint')}
                      className="w-full p-4 rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#A82020]/60 flex items-center justify-between gap-4 text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#F4E8D1] dark:bg-amber-950/50 text-[#B45309] dark:text-amber-300 flex items-center justify-center shrink-0">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                            60-second word sprint
                          </div>
                          <div className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                            Warm up with a gentle spelling game
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#78716C] group-hover:text-[#B45309] transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Right Column: "Your week" Interactive 7-Day Vertical Capsule Bar Chart */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl text-[#1C1917] dark:text-[#F5F2EB]">
                      Your week
                    </h2>
                    {selectedWeekDayIdx !== null ? (
                      <span className="text-xs text-[#A82020] font-medium">
                        {homeWeekBars.entries[selectedWeekDayIdx]?.dayName}:{' '}
                        {homeWeekBars.entries[selectedWeekDayIdx]?.minutes} mins
                      </span>
                    ) : (
                      <span className="text-xs text-[#78716C]">
                        Goal: {progress.dailyGoalMinutes || 15}m/day
                      </span>
                    )}
                  </div>

                  <div className="flex-1 bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-6 flex flex-col justify-between min-h-[236px]">
                    {/* 7 Vertical Capsule Bars M T W T F S S */}
                    <div className="grid grid-cols-7 gap-3 items-end h-36 pt-2 px-1">
                      {homeWeekBars.entries.map((bar) => {
                        const isSelected = selectedWeekDayIdx === bar.idx;
                        return (
                          <button
                            key={bar.idx}
                            type="button"
                            onClick={() =>
                              setSelectedWeekDayIdx((prev) =>
                                prev === bar.idx ? null : bar.idx
                              )
                            }
                            title={`${bar.dayName}: ${bar.minutes} minutes studied`}
                            className="flex flex-col items-center gap-2 h-full justify-end group focus:outline-none"
                          >
                            <span className="text-[10px] font-ipa text-[#78716C] group-hover:text-[#A82020]">
                              {bar.minutes}m
                            </span>
                            <div className="w-full max-w-[26px] h-24 rounded-full bg-[#EFECE4] dark:bg-[#26221E] flex items-end overflow-hidden p-0.5">
                              <div
                                className={`w-full rounded-full transition-all duration-300 ${
                                  isSelected
                                    ? 'bg-[#1F5C3D]'
                                    : bar.isFilled
                                    ? 'bg-[#A82020] group-hover:bg-[#8E1B1B]'
                                    : 'bg-[#E2DDD2] dark:bg-[#3A342E]'
                                }`}
                                style={{ height: `${bar.pct}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs ${
                                isSelected
                                  ? 'font-bold text-[#A82020]'
                                  : 'text-[#78716C] dark:text-[#A8A29E]'
                              }`}
                            >
                              {bar.letter}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between text-xs text-[#78716C] dark:text-[#A8A29E]">
                      <span>{homeWeekBars.totalMinutes} minutes studied this week</span>
                      <button
                        type="button"
                        onClick={() => openProgressSubView('overview')}
                        className="text-[#A82020] dark:text-[#F87171] font-medium hover:underline"
                      >
                        Full analytics →
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* ============================================================= */}
              {/* NEW INTERACTIVE HOME CHARTS: 4-PILLAR SKILL BREAKDOWN +       */}
              {/* CEFR CURRICULUM ROADMAP CHART (B1 -> B2 -> C1)                */}
              {/* ============================================================= */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Chart Card (7 cols): 4-Pillar Language Mastery Breakdown Chart */}
                <div className="lg:col-span-7 bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-6 space-y-5 flex flex-col justify-between">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#A82020] dark:text-[#F87171]">
                        SKILL MASTERY CHART
                      </div>
                      <h2 className="font-serif text-xl text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                        4-Pillar Language Breakdown
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => openProgressSubView('overview')}
                      className="text-xs font-medium text-[#A82020] dark:text-[#F87171] hover:underline"
                    >
                      Detailed report →
                    </button>
                  </div>

                  <div className="space-y-4">
                    {homeSkillPillars.map((pillar) => (
                      <div key={pillar.id} className="space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                            {pillar.label}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-[#78716C] dark:text-[#A8A29E]">
                              {pillar.metricLabel}
                            </span>
                            <span className="font-ipa font-semibold text-[#1C1917] dark:text-[#F5F2EB] min-w-[34px] text-right">
                              {pillar.pct}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2.5 rounded-full bg-[#EFECE4] dark:bg-[#26221E] overflow-hidden">
                            <div
                              className={`h-full ${pillar.color} rounded-full transition-all duration-500`}
                              style={{ width: `${Math.max(4, pillar.pct)}%` }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={pillar.onAction}
                            className="px-2.5 py-1 rounded-lg border border-[#E6E0D4] dark:border-[#2E2924] text-[11px] font-medium text-[#57534E] dark:text-[#A8A29E] hover:border-[#A82020] hover:text-[#A82020] transition-colors shrink-0"
                          >
                            {pillar.actionLabel}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Chart Card (5 cols): CEFR Curriculum Track Roadmap Chart */}
                <div className="lg:col-span-5 bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-6 flex flex-col justify-between space-y-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#A82020] dark:text-[#F87171]">
                        CURRICULUM ROADMAP
                      </div>
                      <span className="font-ipa text-xs font-semibold text-[#1F5C3D] dark:text-emerald-400">
                        {courseStats.overallPercent}% Complete
                      </span>
                    </div>
                    <h2 className="font-serif text-xl text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                      CEFR Track Progress
                    </h2>
                    <p className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-1">
                      Complete all 4 lessons in each level to unlock your track certificate.
                    </p>
                  </div>

                  {/* Visual Track Bars (B1, B2, C1) */}
                  <div className="space-y-3">
                    {[
                      {
                        level: 'B1' as CEFRLevel,
                        title: 'B1 Foundation · Lessons 01–04',
                        done: courseStats.b1Done,
                        total: courseStats.b1Total,
                        barColor: 'bg-[#2E6F4E]',
                        badgeClass: 'bg-[#DCECE2] text-[#1F5C3D]',
                      },
                      {
                        level: 'B2' as CEFRLevel,
                        title: 'B2 Workplace · Lessons 05–08',
                        done: courseStats.b2Done,
                        total: courseStats.b2Total,
                        barColor: 'bg-[#284B7A]',
                        badgeClass: 'bg-[#DCE6F2] text-[#284B7A]',
                      },
                      {
                        level: 'C1' as CEFRLevel,
                        title: 'C1 Advanced · Lessons 09–12',
                        done: courseStats.c1Done,
                        total: courseStats.c1Total,
                        barColor: 'bg-[#A82020]',
                        badgeClass: 'bg-[#F6E3DF] text-[#A82020]',
                      },
                    ].map((trk) => {
                      const pct = trk.total > 0 ? Math.round((trk.done / trk.total) * 100) : 0;
                      return (
                        <button
                          key={trk.level}
                          type="button"
                          onClick={() => {
                            setLevelFilter(trk.level);
                            navigateTab('lessons');
                          }}
                          className="w-full p-3 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#A82020]/50 text-left space-y-2 transition-colors"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${trk.badgeClass}`}
                              >
                                {trk.level}
                              </span>
                              <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                                {trk.title}
                              </span>
                            </div>
                            <span className="font-ipa text-xs text-[#78716C]">
                              {trk.done}/{trk.total}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#ECE6DA] dark:bg-[#26221E] overflow-hidden">
                            <div
                              className={`h-full ${trk.barColor} rounded-full transition-all duration-500`}
                              style={{ width: `${Math.max(4, pct)}%` }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between text-xs">
                    <span className="text-[#78716C]">
                      Quiz accuracy:{' '}
                      <strong className="text-[#1C1917] dark:text-[#F5F2EB]">
                        {courseStats.avgQuizAccuracy !== null
                          ? `${courseStats.avgQuizAccuracy}%`
                          : 'No quizzes yet'}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => openProgressSubView('achievements')}
                      className="text-[#A82020] dark:text-[#F87171] font-medium hover:underline inline-flex items-center gap-1"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Badges ({progress.unlockedBadgeIds.length}/12)</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Interactive Quick SRS Flashcard Strip on Home */}
              {activeSRSQuickWord && (
                <section className="rounded-2xl bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        speechService.speak(activeSRSQuickWord.word, {
                          rate: progress.preferredSpeechRate,
                        })
                      }
                      className="w-11 h-11 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] flex items-center justify-center text-[#A82020] hover:border-[#A82020] shrink-0"
                      title="Listen to word"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A82020]">
                          Silent-Letter Word Spotlight ({(srsQuickIdx % dueSRSWords.length) + 1}/{dueSRSWords.length})
                        </span>
                        <span className="font-ipa text-xs text-[#78716C]">
                          {activeSRSQuickWord.ipa}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                        {activeSRSQuickWord.segments?.map((seg, idx) =>
                          seg.silent ? (
                            <span
                              key={idx}
                              className="text-[#A82020] underline decoration-dotted underline-offset-4"
                            >
                              {seg.text}
                            </span>
                          ) : (
                            <span key={idx}>{seg.text}</span>
                          )
                        )}
                        {srsQuickFlipped && (
                          <span className="ml-3 font-nepali text-base text-[#1F5C3D] dark:text-emerald-400">
                            — {activeSRSQuickWord.nepaliMeaning}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#78716C] mt-0.5">
                        {activeSRSQuickWord.silentLettersSummary} · “{activeSRSQuickWord.englishExample}”
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        speechService.speak(activeSRSQuickWord.word, {
                          rate: 0.5,
                        })
                      }
                      className="px-3 py-2 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#57534E] dark:text-[#A8A29E] hover:border-[#A82020]"
                      title="Listen slowly at 0.5x speed"
                    >
                      0.5× Slow
                    </button>
                    {!srsQuickFlipped ? (
                      <button
                        type="button"
                        onClick={() => setSrsQuickFlipped(true)}
                        className="px-4 py-2 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#A82020]"
                      >
                        Reveal Nepali meaning
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateWordSRS(activeSRSQuickWord.id, false);
                            setSrsQuickFlipped(false);
                            setSrsQuickIdx((i) => i + 1);
                          }}
                          className="px-3.5 py-2 rounded-xl border border-[#E6E0D4] text-xs font-medium text-[#78716C]"
                        >
                          Next word
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleToggleMasteredWord(activeSRSQuickWord.id);
                            setSrsQuickFlipped(false);
                            setSrsQuickIdx((i) => i + 1);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#2E6F4E] text-white text-xs font-medium"
                        >
                          Mark Mastered ✓
                        </button>
                      </>
                    )}
                  </div>
                </section>
              )}

              {/* Bottom Banner: "A small daily challenge" (Exact match to Screenshot 1) */}
              <section className="rounded-2xl bg-[#F4EFE4] dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] p-5 sm:px-7 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                    A small daily challenge
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6E685F] dark:text-[#A8A29E] mt-0.5">
                    Three quick questions on silent letters — takes under two minutes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDailyChallengeOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-xs sm:text-sm font-medium text-[#A82020] dark:text-[#F87171] hover:bg-[#FAF8F4] transition-colors self-start sm:self-center shrink-0"
                >
                  Start
                </button>
              </section>
            </div>
          )}
        </main>
      </div>

      {/* =================================================================== */}
      {/* MOBILE FIXED BOTTOM NAVIGATION BAR (6 Tabs, >= 44px Hitboxes)       */}
      {/* =================================================================== */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#FAF8F4]/95 dark:bg-[#141210]/95 backdrop-blur-md border-t border-[#E6E0D4] dark:border-[#2E2924] grid grid-cols-6 items-center"
      >
        <button
          onClick={() => navigateTab('home')}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'home' && !activeLectureId
              ? 'text-[#A82020] dark:text-[#F87171] font-semibold'
              : 'text-[#57534E] dark:text-[#A8A29E]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Home</span>
        </button>

        <button
          onClick={() => navigateTab('lessons')}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'lessons' || Boolean(activeLectureId)
              ? 'text-[#A82020] dark:text-[#F87171] font-semibold'
              : 'text-[#57534E] dark:text-[#A8A29E]'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Lessons</span>
        </button>

        <button
          onClick={() => navigateTab('dictionary')}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'dictionary'
              ? 'text-[#A82020] dark:text-[#F87171] font-semibold'
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
              ? 'text-[#A82020] dark:text-[#F87171] font-semibold'
              : 'text-[#57534E] dark:text-[#A8A29E]'
          }`}
        >
          <Puzzle className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Arena</span>
        </button>

        <button
          onClick={() => navigateTab('progress')}
          className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'progress'
              ? 'text-[#A82020] dark:text-[#F87171] font-semibold'
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
              ? 'text-[#A82020] dark:text-[#F87171] font-semibold'
              : 'text-[#57534E] dark:text-[#A8A29E]'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Settings</span>
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
