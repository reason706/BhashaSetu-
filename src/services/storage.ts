import {
  UserProgressState,
  LectureUnit,
  ModuleScoreRecord,
  CEFRLevel,
  MistakeItem,
  SRSRecord,
  SRSStage,
  CustomVocabItem,
} from '../types/curriculum';

const STORAGE_KEY = 'bhashasetu_user_progress_v1';
const DB_NAME = 'BhashaSetuOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_state';

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export const DEFAULT_USER_PROGRESS: UserProgressState = {
  selectedLevel: 'B1',
  dailyGoalMinutes: 15,
  onboardingComplete: false,
  currentStreakDays: 1,
  lastStudyDate: getTodayDateString(),
  completedUnitIds: [],
  completedStepsByLecture: {},
  moduleScores: {},
  savedWordIds: ['l1-v1', 'l1-v2', 'l2-v1', 'l4-v1', 'l7-v1', 'l12-v1'],
  wordSRS: {
    'l1-v1': {
      wordId: 'l1-v1',
      stage: 'review',
      correctStreak: 1,
      lastReviewedAt: new Date(Date.now() - 86400000).toISOString(),
      nextReviewDue: new Date().toISOString(),
    },
    'l1-v2': {
      wordId: 'l1-v2',
      stage: 'learning',
      correctStreak: 0,
      lastReviewedAt: new Date(Date.now() - 86400000).toISOString(),
      nextReviewDue: new Date().toISOString(),
    },
    'l2-v3': {
      wordId: 'l2-v3',
      stage: 'review',
      correctStreak: 1,
      lastReviewedAt: new Date(Date.now() - 86400000).toISOString(),
      nextReviewDue: new Date().toISOString(),
    },
  },
  mistakeNotebook: [],
  customLectures: [],
  customWords: [
    {
      id: 'cw-sample-1',
      word: 'Handkerchief',
      ipa: '/ˈhæŋ.kə.tʃɪf/',
      partOfSpeech: 'noun',
      silentLettersSummary: 'Silent middle "d"',
      nepaliMeaning: 'रुमाल',
      englishExample: 'He kept a clean cotton handkerchief in his coat pocket.',
      deckTag: 'Daily Essentials',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cw-sample-2',
      word: 'Cupboard',
      ipa: '/ˈkʌb.əd/',
      partOfSpeech: 'noun',
      silentLettersSummary: 'Silent "p" before "b"',
      nepaliMeaning: 'दराज / भाँडा राख्ने अलमारी',
      englishExample: 'The tea cups are stored neatly in the kitchen cupboard.',
      deckTag: 'Home & Kitchen',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cw-sample-3',
      word: 'Mortgage',
      ipa: '/ˈmɔː.ɡɪdʒ/',
      partOfSpeech: 'noun',
      silentLettersSummary: 'Silent middle "t"',
      nepaliMeaning: 'धितो / घरजग्गा कर्जा',
      englishExample: 'The family paid off their bank mortgage ahead of schedule.',
      deckTag: 'Finance & Banking',
      createdAt: new Date().toISOString(),
    },
  ],
  preferredSpeechRate: 0.95,
  darkMode: false,
  languageMode: 'english-meanings',
  pendingSyncQueue: [],
  lastSyncedAt: null,
  lastDailyChallengeAt: null,
  dailyChallengeStreak: 0,
  dailyChallengeTotalCompleted: 0,
  sprintHighScore: 0,
  detectiveSolvedIds: [],
  rolePlayCompletedIds: [],
  studyActivityByDate: {
    [getTodayDateString()]: 2,
  },
};

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

export function loadUserProgress(): UserProgressState {
  if (typeof window === 'undefined') return DEFAULT_USER_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<UserProgressState>;
    return {
      ...DEFAULT_USER_PROGRESS,
      ...parsed,
      completedStepsByLecture: parsed.completedStepsByLecture || {},
      wordSRS: parsed.wordSRS || DEFAULT_USER_PROGRESS.wordSRS,
      mistakeNotebook: parsed.mistakeNotebook || [],
      customWords: parsed.customWords || DEFAULT_USER_PROGRESS.customWords,
      detectiveSolvedIds: parsed.detectiveSolvedIds || [],
      rolePlayCompletedIds: parsed.rolePlayCompletedIds || [],
      studyActivityByDate: parsed.studyActivityByDate || DEFAULT_USER_PROGRESS.studyActivityByDate,
    };
  } catch {
    return DEFAULT_USER_PROGRESS;
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

export function calculateUpdatedStreak(state: UserProgressState): {
  currentStreakDays: number;
  lastStudyDate: string;
} {
  const today = new Date().toISOString().split('T')[0];
  if (!state.lastStudyDate) {
    return { currentStreakDays: 1, lastStudyDate: today };
  }
  if (state.lastStudyDate === today) {
    return { currentStreakDays: Math.max(1, state.currentStreakDays), lastStudyDate: today };
  }

  const lastDate = new Date(state.lastStudyDate);
  const currentDate = new Date(today);
  const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { currentStreakDays: state.currentStreakDays + 1, lastStudyDate: today };
  }
  return { currentStreakDays: 1, lastStudyDate: today };
}

export function recordModuleStepCompleted(
  state: UserProgressState,
  lectureId: string,
  stepIndex: number
): UserProgressState {
  const currentSteps = state.completedStepsByLecture[lectureId] || [];
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
  };
  saveUserProgress(nextState);
  return nextState;
}

export function recordLectureCompletion(
  state: UserProgressState,
  scoreRecord: ModuleScoreRecord
): UserProgressState {
  const { currentStreakDays, lastStudyDate } = calculateUpdatedStreak(state);
  const completedUnitIds = state.completedUnitIds.includes(scoreRecord.unitId)
    ? state.completedUnitIds
    : [...state.completedUnitIds, scoreRecord.unitId];

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
    completedUnitIds,
    completedStepsByLecture: {
      ...state.completedStepsByLecture,
      [scoreRecord.unitId]: [0, 1, 2, 3, 4],
    },
    moduleScores: {
      ...state.moduleScores,
      [scoreRecord.unitId]: scoreRecord,
    },
    pendingSyncQueue: [...state.pendingSyncQueue, syncEvent],
  };

  saveUserProgress(nextState);
  return nextState;
}

export function updateWordSRS(
  state: UserProgressState,
  wordId: string,
  wasCorrect: boolean
): UserProgressState {
  const existing = state.wordSRS[wordId];
  const streak = wasCorrect ? (existing ? existing.correctStreak + 1 : 1) : 0;
  let stage: SRSStage = 'learning';
  let hoursUntilNext = 4;

  if (wasCorrect) {
    if (streak >= 3) {
      stage = 'mastered';
      hoursUntilNext = 72;
    } else if (streak === 2) {
      stage = 'review';
      hoursUntilNext = 24;
    } else {
      stage = 'learning';
      hoursUntilNext = 8;
    }
  } else {
    stage = 'learning';
    hoursUntilNext = 1;
  }

  const now = new Date();
  const nextDue = new Date(now.getTime() + hoursUntilNext * 3600 * 1000);

  const record: SRSRecord = {
    wordId,
    stage,
    correctStreak: streak,
    lastReviewedAt: now.toISOString(),
    nextReviewDue: nextDue.toISOString(),
  };

  const nextState: UserProgressState = {
    ...state,
    wordSRS: {
      ...state.wordSRS,
      [wordId]: record,
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
  const { currentStreakDays, lastStudyDate } = calculateUpdatedStreak(state);
  const today = getTodayDateString();
  const existingMap = state.studyActivityByDate || {};
  const nextStreak =
    correctCount >= 2 ? (state.dailyChallengeStreak || 0) + 1 : Math.max(1, state.dailyChallengeStreak || 0);

  const nextState: UserProgressState = {
    ...state,
    currentStreakDays,
    lastStudyDate,
    lastDailyChallengeAt: new Date().toISOString(),
    dailyChallengeStreak: nextStreak,
    dailyChallengeTotalCompleted: (state.dailyChallengeTotalCompleted || 0) + 1,
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
    const updated: UserProgressState = {
      ...state,
      pendingSyncQueue: [],
      lastSyncedAt: data.syncedAt || new Date().toISOString(),
    };
    saveUserProgress(updated);
    return updated;
  } catch {
    return state;
  }
}

