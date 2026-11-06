import {
  UserProgressState,
  LectureUnit,
  ModuleScoreRecord,
  CEFRLevel,
  MistakeItem,
  SRSRecord,
  SRSStage,
  SRSRating,
  CustomVocabItem,
  ExamSimulationRecord,
} from '../types/curriculum';

const STORAGE_KEY = 'bhashasetu_user_progress_v2';
const LEGACY_STORAGE_KEY = 'bhashasetu_user_progress_v1';
const DB_NAME = 'BhashaSetuOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_state';

/**
 * Timezone-safe local date formatter (YYYY-MM-DD in learner's local timezone).
 * Fixes UTC day-boundary bugs for learners in Nepal (UTC+5:45) and Australia (AEST/AEDT).
 */
export function getTodayDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const DEFAULT_USER_PROGRESS: UserProgressState = {
  userName: 'Anisha Sharma',
  dailyReminderEnabled: true,
  hapticFeedbackEnabled: true,
  selectedLevel: 'B1',
  currentLevel: 'B1',
  dailyGoalMinutes: 15,
  onboardingComplete: false,
  currentStreakDays: 0,
  lastStudyDate: null,
  completedUnitIds: [],
  completedStepsByLecture: {},
  moduleScores: {},
  savedWordIds: [],
  masteredWordIds: [],
  wordSRS: {},
  mistakeNotebook: [],
  lectureNotes: {},
  customLectures: [],
  customWords: [],
  preferredSpeechRate: 1.0,
  darkMode: false,
  languageMode: 'full-nepali',
  pendingSyncQueue: [],
  lastSyncedAt: null,
  lastDailyChallengeAt: null,
  dailyChallengeStreak: 0,
  dailyChallengeTotalCompleted: 0,
  streakFreezeShields: 1,
  unlockedBadgeIds: [],
  sprintHighScore: 0,
  detectiveSolvedIds: [],
  rolePlayCompletedIds: [],
  examHistory: [],
  studyActivityByDate: {},
};

export function getUnifiedMasteredWordsCount(state: UserProgressState): number {
  const masteredSet = new Set<string>(state.masteredWordIds || []);
  for (const [wordId, rec] of Object.entries(state.wordSRS || {})) {
    if (rec.stage === 'mastered' || rec.correctStreak >= 2) {
      masteredSet.add(wordId);
    }
  }
  const explicitAndSrs = masteredSet.size;
  const fromCompletedLectures = (state.completedUnitIds?.length || 0) * 10;
  return Math.max(
    explicitAndSrs,
    explicitAndSrs +
      Math.min(state.savedWordIds?.length || 0, 15) +
      Math.floor(fromCompletedLectures / 2)
  );
}

function openOfflineDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveToIndexedDB(state: UserProgressState): Promise<void> {
  const db = await openOfflineDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(state, STORAGE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Phase 7 Audit Fix: Fallback reader from IndexedDB when localStorage is cleared or evicted.
 */
export async function loadFromIndexedDB(): Promise<UserProgressState | null> {
  const db = await openOfflineDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(STORAGE_KEY);
      req.onsuccess = () => {
        if (req.result && typeof req.result === 'object') {
          resolve(req.result as UserProgressState);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function clearOfflineIndexedDB(): Promise<void> {
  const db = await openOfflineDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export function loadUserProgress(): UserProgressState {
  if (typeof window === 'undefined') return { ...DEFAULT_USER_PROGRESS };
  try {
    // Clean up legacy v1 seeded demo storage if present
    if (window.localStorage.getItem(LEGACY_STORAGE_KEY)) {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_USER_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<UserProgressState>;
    const resolvedLevel = parsed.selectedLevel || parsed.currentLevel || 'B1';
    return {
      ...DEFAULT_USER_PROGRESS,
      ...parsed,
      selectedLevel: resolvedLevel,
      currentLevel: resolvedLevel,
      completedUnitIds: Array.isArray(parsed.completedUnitIds) ? parsed.completedUnitIds : [],
      completedStepsByLecture: parsed.completedStepsByLecture || {},
      moduleScores: parsed.moduleScores || {},
      savedWordIds: Array.isArray(parsed.savedWordIds) ? parsed.savedWordIds : [],
      masteredWordIds: Array.isArray(parsed.masteredWordIds) ? parsed.masteredWordIds : [],
      wordSRS: parsed.wordSRS || {},
      mistakeNotebook: Array.isArray(parsed.mistakeNotebook) ? parsed.mistakeNotebook : [],
      lectureNotes: parsed.lectureNotes || {},
      customLectures: Array.isArray(parsed.customLectures) ? parsed.customLectures : [],
      customWords: Array.isArray(parsed.customWords) ? parsed.customWords : [],
      streakFreezeShields:
        typeof parsed.streakFreezeShields === 'number'
          ? parsed.streakFreezeShields
          : DEFAULT_USER_PROGRESS.streakFreezeShields,
      unlockedBadgeIds: Array.isArray(parsed.unlockedBadgeIds) ? parsed.unlockedBadgeIds : [],
      detectiveSolvedIds: Array.isArray(parsed.detectiveSolvedIds) ? parsed.detectiveSolvedIds : [],
      rolePlayCompletedIds: Array.isArray(parsed.rolePlayCompletedIds)
        ? parsed.rolePlayCompletedIds
        : [],
      examHistory: Array.isArray(parsed.examHistory) ? parsed.examHistory : [],
      studyActivityByDate: parsed.studyActivityByDate || {},
    };
  } catch {
    return { ...DEFAULT_USER_PROGRESS };
  }
}

export function saveUserProgress(state: UserProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    void saveToIndexedDB(state);
  } catch (err) {
    console.error('Failed to save progress to localStorage:', err);
  }
}

export function resetAllUserProgress(preservePreferences?: {
  userName?: string;
  darkMode?: boolean;
  hapticFeedbackEnabled?: boolean;
  languageMode?: UserProgressState['languageMode'];
  selectedLevel?: CEFRLevel;
  dailyGoalMinutes?: 5 | 10 | 15 | 30;
}): UserProgressState {
  const freshState: UserProgressState = {
    ...DEFAULT_USER_PROGRESS,
    userName: preservePreferences?.userName || DEFAULT_USER_PROGRESS.userName,
    darkMode: preservePreferences?.darkMode ?? DEFAULT_USER_PROGRESS.darkMode,
    hapticFeedbackEnabled:
      preservePreferences?.hapticFeedbackEnabled ?? DEFAULT_USER_PROGRESS.hapticFeedbackEnabled,
    languageMode: preservePreferences?.languageMode || DEFAULT_USER_PROGRESS.languageMode,
    selectedLevel: preservePreferences?.selectedLevel || DEFAULT_USER_PROGRESS.selectedLevel,
    currentLevel: preservePreferences?.selectedLevel || DEFAULT_USER_PROGRESS.selectedLevel,
    dailyGoalMinutes:
      preservePreferences?.dailyGoalMinutes || DEFAULT_USER_PROGRESS.dailyGoalMinutes,
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
      void clearOfflineIndexedDB().then(() => saveToIndexedDB(freshState));
    } catch (err) {
      console.error('Failed to reset local progress:', err);
    }
  }
  return freshState;
}

export function calculateUpdatedStreak(state: UserProgressState): {
  currentStreakDays: number;
  lastStudyDate: string;
  streakFreezeShields: number;
} {
  const today = getTodayDateString();
  const shields = state.streakFreezeShields ?? 1;
  if (!state.lastStudyDate) {
    return { currentStreakDays: 1, lastStudyDate: today, streakFreezeShields: shields };
  }
  if (state.lastStudyDate === today) {
    return {
      currentStreakDays: Math.max(1, state.currentStreakDays),
      lastStudyDate: today,
      streakFreezeShields: shields,
    };
  }

  const [lastY, lastM, lastD] = state.lastStudyDate.split('-').map(Number);
  const [curY, curM, curD] = today.split('-').map(Number);
  const lastDate = new Date(lastY, (lastM || 1) - 1, lastD || 1);
  const currentDate = new Date(curY, (curM || 1) - 1, curD || 1);
  const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return {
      currentStreakDays: state.currentStreakDays + 1,
      lastStudyDate: today,
      streakFreezeShields: shields,
    };
  }
  // 1-Day Grace Shield: If user missed 1 day (diffDays === 2) and has a Streak Freeze Shield, protect streak!
  if (diffDays === 2 && shields > 0) {
    return {
      currentStreakDays: state.currentStreakDays + 1,
      lastStudyDate: today,
      streakFreezeShields: shields - 1,
    };
  }
  return { currentStreakDays: 1, lastStudyDate: today, streakFreezeShields: shields };
}

export function recordModuleStepCompleted(
  state: UserProgressState,
  lectureId: string,
  stepIndex: number
): UserProgressState {
  const currentSteps = state.completedStepsByLecture[lectureId] || [];
  const today = getTodayDateString();
  const existingMap = state.studyActivityByDate || {};
  if (currentSteps.includes(stepIndex)) {
    return state;
  }
  const updatedSteps = [...currentSteps, stepIndex].sort((a, b) => a - b);
  const nextState: UserProgressState = {
    ...state,
    completedStepsByLecture: {
      ...state.completedStepsByLecture,
      [lectureId]: updatedSteps,
    },
    studyActivityByDate: {
      ...existingMap,
      [today]: (existingMap[today] || 0) + 1,
    },
  };
  saveUserProgress(nextState);
  return nextState;
}

export function recordLectureCompletion(
  state: UserProgressState,
  scoreRecord: ModuleScoreRecord
): UserProgressState {
  const { currentStreakDays, lastStudyDate, streakFreezeShields } = calculateUpdatedStreak(state);
  const completedUnitIds = state.completedUnitIds.includes(scoreRecord.unitId)
    ? state.completedUnitIds
    : [...state.completedUnitIds, scoreRecord.unitId];

  const today = getTodayDateString();
  const existingMap = state.studyActivityByDate || {};

  const syncEvent = {
    id: `sync-${Date.now()}`,
    type: 'LECTURE_COMPLETED' as const,
    payload: { ...scoreRecord },
    timestamp: new Date().toISOString(),
  };

  const nextState: UserProgressState = {
    ...state,
    currentStreakDays,
    lastStudyDate,
    streakFreezeShields,
    completedUnitIds,
    completedStepsByLecture: {
      ...state.completedStepsByLecture,
      [scoreRecord.unitId]: [0, 1, 2, 3, 4],
    },
    moduleScores: {
      ...state.moduleScores,
      [scoreRecord.unitId]: scoreRecord,
    },
    studyActivityByDate: {
      ...existingMap,
      [today]: (existingMap[today] || 0) + 4,
    },
    pendingSyncQueue: [...state.pendingSyncQueue, syncEvent],
  };

  saveUserProgress(nextState);
  return nextState;
}

export function toggleMasteredWord(
  state: UserProgressState,
  wordId: string
): UserProgressState {
  const currentMastered = state.masteredWordIds || [];
  const isCurrentlyMastered =
    currentMastered.includes(wordId) || state.wordSRS?.[wordId]?.stage === 'mastered';

  const nextMasteredIds = isCurrentlyMastered
    ? currentMastered.filter((id) => id !== wordId)
    : Array.from(new Set([...currentMastered, wordId]));

  const now = new Date();
  const nextSRS: Record<string, SRSRecord> = { ...(state.wordSRS || {}) };

  if (isCurrentlyMastered) {
    nextSRS[wordId] = {
      wordId,
      stage: 'learning',
      correctStreak: 1,
      lastReviewedAt: now.toISOString(),
      nextReviewDue: new Date(now.getTime() + 8 * 3600 * 1000).toISOString(),
    };
  } else {
    nextSRS[wordId] = {
      wordId,
      stage: 'mastered',
      correctStreak: 3,
      lastReviewedAt: now.toISOString(),
      nextReviewDue: new Date(now.getTime() + 72 * 3600 * 1000).toISOString(),
    };
  }

  const today = getTodayDateString();
  const existingMap = state.studyActivityByDate || {};

  const nextState: UserProgressState = {
    ...state,
    masteredWordIds: nextMasteredIds,
    wordSRS: nextSRS,
    studyActivityByDate: {
      ...existingMap,
      [today]: (existingMap[today] || 0) + 1,
    },
  };
  saveUserProgress(nextState);
  return nextState;
}

export function updateWordSRS(
  state: UserProgressState,
  wordId: string,
  ratingOrCorrect: boolean | SRSRating
): UserProgressState {
  const existing = state.wordSRS[wordId];
  const rating: SRSRating =
    typeof ratingOrCorrect === 'boolean'
      ? ratingOrCorrect
        ? 'good'
        : 'again'
      : ratingOrCorrect;
  const wasPositive = rating !== 'again';
  const prevStreak = existing?.correctStreak || 0;

  let streak = 0;
  let stage: SRSStage = 'learning';
  let hoursUntilNext = 1;

  if (rating === 'again') {
    streak = 0;
    stage = 'learning';
    hoursUntilNext = 1; // 1 hour retry
  } else if (rating === 'hard') {
    streak = Math.max(1, prevStreak);
    stage = 'learning';
    hoursUntilNext = 6; // 6 hours consolidation
  } else if (rating === 'good') {
    streak = prevStreak + 1;
    if (streak >= 3) {
      stage = 'mastered';
      hoursUntilNext = 72; // 3 days
    } else if (streak === 2) {
      stage = 'review';
      hoursUntilNext = 24; // 1 day
    } else {
      stage = 'learning';
      hoursUntilNext = 12; // 12 hours
    }
  } else {
    // 'easy'
    streak = prevStreak + 2;
    stage = streak >= 3 ? 'mastered' : 'review';
    hoursUntilNext = streak >= 3 ? 96 : 48; // 4 days or 2 days
  }

  const now = new Date();
  const nextDue = new Date(now.getTime() + hoursUntilNext * 3600 * 1000);
  const today = getTodayDateString(now);
  const existingMap = state.studyActivityByDate || {};

  const record: SRSRecord = {
    wordId,
    stage,
    correctStreak: streak,
    intervalHours: hoursUntilNext,
    intervalDays: Math.max(1, Math.round(hoursUntilNext / 24)),
    lastRating: rating,
    repetitions: (existing?.repetitions || 0) + 1,
    lastReviewedAt: now.toISOString(),
    nextReviewDue: nextDue.toISOString(),
  };

  const currentMastered = state.masteredWordIds || [];
  const nextMasteredIds =
    stage === 'mastered'
      ? Array.from(new Set([...currentMastered, wordId]))
      : wasPositive
      ? currentMastered
      : currentMastered.filter((id) => id !== wordId);

  const nextState: UserProgressState = {
    ...state,
    masteredWordIds: nextMasteredIds,
    wordSRS: {
      ...state.wordSRS,
      [wordId]: record,
    },
    studyActivityByDate: {
      ...existingMap,
      [today]: (existingMap[today] || 0) + 1,
    },
  };
  saveUserProgress(nextState);
  return nextState;
}

export function updateLectureScratchpadNote(
  state: UserProgressState,
  lectureId: string,
  noteText: string
): UserProgressState {
  const nextState: UserProgressState = {
    ...state,
    lectureNotes: {
      ...(state.lectureNotes || {}),
      [lectureId]: noteText,
    },
  };
  saveUserProgress(nextState);
  return nextState;
}

export function recordExamSimulationResult(
  state: UserProgressState,
  examRecord: ExamSimulationRecord
): UserProgressState {
  const today = getTodayDateString();
  const existingMap = state.studyActivityByDate || {};
  const nextState: UserProgressState = {
    ...state,
    examHistory: [examRecord, ...(state.examHistory || [])].slice(0, 15),
    studyActivityByDate: {
      ...existingMap,
      [today]: (existingMap[today] || 0) + 5,
    },
  };
  saveUserProgress(nextState);
  return nextState;
}

export function addMistakeToNotebook(
  state: UserProgressState,
  mistake: Omit<MistakeItem, 'id' | 'consecutiveCorrect' | 'createdAt'>
): UserProgressState {
  // Check if same prompt + lecture already exists in notebook
  const existingIdx = state.mistakeNotebook.findIndex(
    (m) => m.prompt === mistake.prompt && m.lectureId === mistake.lectureId
  );

  let updatedList: MistakeItem[];
  if (existingIdx >= 0) {
    updatedList = state.mistakeNotebook.map((item, idx) =>
      idx === existingIdx
        ? {
            ...item,
            userWrongAnswer: mistake.userWrongAnswer,
            consecutiveCorrect: 0,
            createdAt: new Date().toISOString(),
          }
        : item
    );
  } else {
    const newItem: MistakeItem = {
      ...mistake,
      id: `mistake-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      consecutiveCorrect: 0,
      createdAt: new Date().toISOString(),
    };
    updatedList = [newItem, ...state.mistakeNotebook];
  }

  const nextState: UserProgressState = {
    ...state,
    mistakeNotebook: updatedList,
  };
  saveUserProgress(nextState);
  return nextState;
}

export function recordMistakePracticeResult(
  state: UserProgressState,
  mistakeId: string,
  wasCorrect: boolean
): UserProgressState {
  const updatedList = state.mistakeNotebook
    .map((item) => {
      if (item.id !== mistakeId) return item;
      const nextStreak = wasCorrect ? item.consecutiveCorrect + 1 : 0;
      return {
        ...item,
        consecutiveCorrect: nextStreak,
      };
    })
    // Automatically graduate & remove from Mistake Notebook once answered accurately twice in a row
    .filter((item) => item.consecutiveCorrect < 2);

  const nextState: UserProgressState = {
    ...state,
    mistakeNotebook: updatedList,
  };
  saveUserProgress(nextState);
  return nextState;
}

export function removeMistakeFromNotebook(
  state: UserProgressState,
  mistakeId: string
): UserProgressState {
  const nextState: UserProgressState = {
    ...state,
    mistakeNotebook: state.mistakeNotebook.filter((m) => m.id !== mistakeId),
  };
  saveUserProgress(nextState);
  return nextState;
}

export function updateMistakeNote(
  state: UserProgressState,
  mistakeId: string,
  userNote: string
): UserProgressState {
  const nextState: UserProgressState = {
    ...state,
    mistakeNotebook: state.mistakeNotebook.map((item) =>
      item.id === mistakeId ? { ...item, userNote } : item
    ),
  };
  saveUserProgress(nextState);
  return nextState;
}

export function toggleSavedWord(state: UserProgressState, wordId: string): UserProgressState {
  const exists = state.savedWordIds.includes(wordId);
  const savedWordIds = exists
    ? state.savedWordIds.filter((id) => id !== wordId)
    : [...state.savedWordIds, wordId];

  const nextState: UserProgressState = {
    ...state,
    savedWordIds,
    pendingSyncQueue: [
      ...state.pendingSyncQueue,
      {
        id: `sync-${Date.now()}`,
        type: 'WORD_SAVED',
        payload: { wordId, saved: !exists },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  saveUserProgress(nextState);
  return nextState;
}

export function addCustomLecture(state: UserProgressState, lecture: LectureUnit): UserProgressState {
  const nextState: UserProgressState = {
    ...state,
    customLectures: [lecture, ...state.customLectures],
  };
  saveUserProgress(nextState);
  return nextState;
}

export function incrementDailyStudyActivity(
  state: UserProgressState,
  amount = 1
): UserProgressState {
  const today = getTodayDateString();
  const existingMap = state.studyActivityByDate || {};
  const nextState: UserProgressState = {
    ...state,
    studyActivityByDate: {
      ...existingMap,
      [today]: (existingMap[today] || 0) + amount,
    },
  };
  saveUserProgress(nextState);
  return nextState;
}

export function recordDailyChallengeCompletion(
  state: UserProgressState,
  correctCount: number
): UserProgressState {
  const { currentStreakDays, lastStudyDate, streakFreezeShields } = calculateUpdatedStreak(state);
  const today = getTodayDateString();
  const existingMap = state.studyActivityByDate || {};
  const nextStreak =
    correctCount >= 2 ? (state.dailyChallengeStreak || 0) + 1 : Math.max(1, state.dailyChallengeStreak || 0);
  const nextTotal = (state.dailyChallengeTotalCompleted || 0) + 1;

  // Award +1 Streak Freeze Shield every 3 Daily Challenges completed
  const bonusShield = nextTotal % 3 === 0 ? 1 : 0;

  const nextState: UserProgressState = {
    ...state,
    currentStreakDays,
    lastStudyDate,
    lastDailyChallengeAt: new Date().toISOString(),
    dailyChallengeStreak: nextStreak,
    dailyChallengeTotalCompleted: nextTotal,
    streakFreezeShields: Math.min(5, streakFreezeShields + bonusShield),
    studyActivityByDate: {
      ...existingMap,
      [today]: (existingMap[today] || 0) + 3,
    },
  };
  saveUserProgress(nextState);
  return nextState;
}

export function addCustomWord(
  state: UserProgressState,
  item: Omit<CustomVocabItem, 'id' | 'createdAt'>
): UserProgressState {
  const newWord: CustomVocabItem = {
    ...item,
    id: `cw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  const today = getTodayDateString();
  const existingMap = state.studyActivityByDate || {};
  const nextState: UserProgressState = {
    ...state,
    customWords: [newWord, ...(state.customWords || [])],
    studyActivityByDate: {
      ...existingMap,
      [today]: (existingMap[today] || 0) + 1,
    },
  };
  saveUserProgress(nextState);
  return nextState;
}

export function removeCustomWord(
  state: UserProgressState,
  wordId: string
): UserProgressState {
  const nextState: UserProgressState = {
    ...state,
    customWords: (state.customWords || []).filter((w) => w.id !== wordId),
  };
  saveUserProgress(nextState);
  return nextState;
}

export function recordSprintScore(
  state: UserProgressState,
  score: number
): UserProgressState {
  const today = getTodayDateString();
  const existingMap = state.studyActivityByDate || {};
  const nextState: UserProgressState = {
    ...state,
    sprintHighScore: Math.max(state.sprintHighScore || 0, score),
    studyActivityByDate: {
      ...existingMap,
      [today]: (existingMap[today] || 0) + 2,
    },
  };
  saveUserProgress(nextState);
  return nextState;
}

export function recordDetectiveSolved(
  state: UserProgressState,
  passageId: string
): UserProgressState {
  const today = getTodayDateString();
  const existingMap = state.studyActivityByDate || {};
  const currentIds = state.detectiveSolvedIds || [];
  const nextIds = currentIds.includes(passageId) ? currentIds : [...currentIds, passageId];
  const nextState: UserProgressState = {
    ...state,
    detectiveSolvedIds: nextIds,
    studyActivityByDate: {
      ...existingMap,
      [today]: (existingMap[today] || 0) + 2,
    },
  };
  saveUserProgress(nextState);
  return nextState;
}

export function recordRolePlayCompleted(
  state: UserProgressState,
  scenarioId: string
): UserProgressState {
  const today = getTodayDateString();
  const existingMap = state.studyActivityByDate || {};
  const currentIds = state.rolePlayCompletedIds || [];
  const nextIds = currentIds.includes(scenarioId) ? currentIds : [...currentIds, scenarioId];
  const nextState: UserProgressState = {
    ...state,
    rolePlayCompletedIds: nextIds,
    studyActivityByDate: {
      ...existingMap,
      [today]: (existingMap[today] || 0) + 2,
    },
  };
  saveUserProgress(nextState);
  return nextState;
}

export function completeOnboarding(
  state: UserProgressState,
  level: CEFRLevel,
  dailyGoalMinutes: number
): UserProgressState {
  const nextState: UserProgressState = {
    ...state,
    selectedLevel: level,
    dailyGoalMinutes,
    onboardingComplete: true,
  };
  saveUserProgress(nextState);
  return nextState;
}

export async function flushPendingSyncQueue(
  state: UserProgressState
): Promise<UserProgressState> {
  if (!state.pendingSyncQueue.length || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return state;
  }

  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: state.pendingSyncQueue }),
    });
    if (!response.ok) return state;
    const data = await response.json();
    const ackSet = new Set<string>(
      Array.isArray(data.acknowledgedEventIds) ? data.acknowledgedEventIds : []
    );
    const remainingQueue =
      ackSet.size > 0
        ? state.pendingSyncQueue.filter((evt) => !ackSet.has(evt.id))
        : [];
    const updated: UserProgressState = {
      ...state,
      pendingSyncQueue: remainingQueue,
      lastSyncedAt: data.syncedAt || new Date().toISOString(),
    };
    saveUserProgress(updated);
    return updated;
  } catch {
    return state;
  }
}


