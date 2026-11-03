import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  UserProgressState,
  CEFRLevel,
  MistakeItem,
  CustomVocabItem,
  LectureUnit,
  ExamSimulationRecord,
} from '../types/curriculum';
import { getUnifiedMasteredWordsCount, saveUserProgress } from './storage';
import { speechService, DialogueCalibrationSettings } from './speech';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore at boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export async function signInWithGooglePopup(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Strips any undefined properties recursively so Firestore setDoc/updateDoc never rejects nested objects.
 */
function stripUndefinedDeep<T>(value: T): T {
  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return value;
  }
}

/**
 * Sanitizes and bounds UserProgressState + Google Account Info into the strict UserProgressDocument schema
 * enforced by firebase-blueprint.json and firestore.rules.
 */
function buildValidatedPayload(user: User, progress: UserProgressState) {
  const safeDisplayName =
    (
      progress.userName ||
      user.displayName ||
      user.email?.split('@')[0] ||
      'Anisha Sharma'
    )
      .trim()
      .slice(0, 100) || 'Learner';
  const validLevels: CEFRLevel[] = ['B1', 'B2', 'C1'];
  const safeLevel: CEFRLevel = validLevels.includes(progress.selectedLevel)
    ? progress.selectedLevel
    : 'B1';
  const safeDailyGoal = Math.min(120, Math.max(1, Number(progress.dailyGoalMinutes) || 15));
  const safeStreak = Math.min(10000, Math.max(0, Number(progress.currentStreakDays) || 0));
  const safeShields = Math.min(100, Math.max(0, Number(progress.streakFreezeShields ?? 1)));
  const safeSprint = Math.min(100000, Math.max(0, Number(progress.sprintHighScore) || 0));
  const safeCompletedCount = Math.min(500, Math.max(0, (progress.completedUnitIds || []).length));
  const safeMasteredCount = Math.min(
    50000,
    Math.max(0, getUnifiedMasteredWordsCount(progress))
  );

  const voiceCalibration = speechService.getDialogueCalibration();

  // Bounded map (33 keys <= 35 keys limit in firestore.rules) containing all user data & Google account metadata
  const progressSnapshot: Record<string, unknown> = stripUndefinedDeep({
    userName: safeDisplayName,
    dailyReminderEnabled: progress.dailyReminderEnabled !== false,
    userEmail: user.email || null,
    userPhotoURL: user.photoURL || null,
    voiceCalibration,
    selectedLevel: safeLevel,
    dailyGoalMinutes: safeDailyGoal,
    onboardingComplete: Boolean(progress.onboardingComplete),
    currentStreakDays: safeStreak,
    lastStudyDate: progress.lastStudyDate || null,
    completedUnitIds: (progress.completedUnitIds || []).slice(0, 100),
    completedStepsByLecture: progress.completedStepsByLecture || {},
    moduleScores: progress.moduleScores || {},
    savedWordIds: (progress.savedWordIds || []).slice(0, 500),
    masteredWordIds: (progress.masteredWordIds || []).slice(0, 1000),
    wordSRS: progress.wordSRS || {},
    mistakeNotebook: (progress.mistakeNotebook || []).slice(0, 150),
    lectureNotes: progress.lectureNotes || {},
    customLectures: (progress.customLectures || []).slice(0, 20),
    customWords: (progress.customWords || []).slice(0, 100),
    preferredSpeechRate: Number(progress.preferredSpeechRate) || 0.75,
    darkMode: Boolean(progress.darkMode),
    languageMode: progress.languageMode || 'english-meanings',
    lastDailyChallengeAt: progress.lastDailyChallengeAt || null,
    dailyChallengeStreak: Number(progress.dailyChallengeStreak) || 0,
    dailyChallengeTotalCompleted: Number(progress.dailyChallengeTotalCompleted) || 0,
    streakFreezeShields: safeShields,
    unlockedBadgeIds: (progress.unlockedBadgeIds || []).slice(0, 50),
    sprintHighScore: safeSprint,
    detectiveSolvedIds: (progress.detectiveSolvedIds || []).slice(0, 50),
    rolePlayCompletedIds: (progress.rolePlayCompletedIds || []).slice(0, 50),
    examHistory: (progress.examHistory || []).slice(0, 15),
    studyActivityByDate: progress.studyActivityByDate || {},
  });

  return {
    ownerId: user.uid,
    displayName: safeDisplayName,
    selectedLevel: safeLevel,
    dailyGoalMinutes: safeDailyGoal,
    currentStreakDays: safeStreak,
    streakFreezeShields: safeShields,
    sprintHighScore: safeSprint,
    completedUnitIdsCount: safeCompletedCount,
    masteredWordsCount: safeMasteredCount,
    progressSnapshot,
  };
}

export async function syncProgressToCloud(
  user: User,
  progress: UserProgressState
): Promise<UserProgressState> {
  const path = `users/${user.uid}`;
  const docRef = doc(db, 'users', user.uid);
  const basePayload = buildValidatedPayload(user, progress);

  let exists = false;
  try {
    const snap = await getDoc(docRef);
    exists = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (!exists) {
    try {
      await setDoc(docRef, {
        ...basePayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  } else {
    try {
      await updateDoc(docRef, {
        displayName: basePayload.displayName,
        selectedLevel: basePayload.selectedLevel,
        dailyGoalMinutes: basePayload.dailyGoalMinutes,
        currentStreakDays: basePayload.currentStreakDays,
        streakFreezeShields: basePayload.streakFreezeShields,
        sprintHighScore: basePayload.sprintHighScore,
        completedUnitIdsCount: basePayload.completedUnitIdsCount,
        masteredWordsCount: basePayload.masteredWordsCount,
        progressSnapshot: basePayload.progressSnapshot,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  const syncedState: UserProgressState = {
    ...progress,
    lastSyncedAt: new Date().toISOString(),
    pendingSyncQueue: [],
  };
  saveUserProgress(syncedState);
  return syncedState;
}

function mergeArrayById<T extends { id: string }>(localArr: T[] = [], cloudArr: T[] = []): T[] {
  const map = new Map<string, T>();
  for (const item of cloudArr) {
    if (item && item.id) map.set(item.id, item);
  }
  for (const item of localArr) {
    if (item && item.id) map.set(item.id, item);
  }
  return Array.from(map.values());
}

export async function pullAndMergeCloudProgress(
  user: User,
  localState: UserProgressState
): Promise<UserProgressState> {
  const path = `users/${user.uid}`;
  const docRef = doc(db, 'users', user.uid);

  let snap;
  try {
    snap = await getDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (!snap || !snap.exists()) {
    // Initialize cloud profile with current local state
    return await syncProgressToCloud(user, localState);
  }

  const data = snap.data();
  const cloudSnap = (data?.progressSnapshot || {}) as Partial<UserProgressState> & {
    voiceCalibration?: DialogueCalibrationSettings;
  };

  if (cloudSnap.voiceCalibration) {
    speechService.saveDialogueCalibration(cloudSnap.voiceCalibration);
  }

  // Intelligent non-destructive union merge between Cloud and Local state
  const mergedCompletedUnits = Array.from(
    new Set([...(cloudSnap.completedUnitIds || []), ...(localState.completedUnitIds || [])])
  );
  const mergedSavedWords = Array.from(
    new Set([...(cloudSnap.savedWordIds || []), ...(localState.savedWordIds || [])])
  );
  const mergedMasteredWords = Array.from(
    new Set([...(cloudSnap.masteredWordIds || []), ...(localState.masteredWordIds || [])])
  );
  const mergedDetective = Array.from(
    new Set([...(cloudSnap.detectiveSolvedIds || []), ...(localState.detectiveSolvedIds || [])])
  );
  const mergedRolePlay = Array.from(
    new Set([
      ...(cloudSnap.rolePlayCompletedIds || []),
      ...(localState.rolePlayCompletedIds || []),
    ])
  );
  const mergedBadges = Array.from(
    new Set([...(cloudSnap.unlockedBadgeIds || []), ...(localState.unlockedBadgeIds || [])])
  );

  // Merge completedStepsByLecture per lecture
  const mergedStepsByLecture: Record<string, number[]> = {
    ...(cloudSnap.completedStepsByLecture || {}),
  };
  for (const [lecId, steps] of Object.entries(localState.completedStepsByLecture || {})) {
    mergedStepsByLecture[lecId] = Array.from(
      new Set([...(mergedStepsByLecture[lecId] || []), ...(steps || [])])
    );
  }

  // Merge study activity by taking max per date
  const mergedActivity: Record<string, number> = {
    ...(cloudSnap.studyActivityByDate || {}),
  };
  for (const [dateKey, count] of Object.entries(localState.studyActivityByDate || {})) {
    mergedActivity[dateKey] = Math.max(mergedActivity[dateKey] || 0, count);
  }

  const mergedMistakes = mergeArrayById<MistakeItem>(
    localState.mistakeNotebook,
    cloudSnap.mistakeNotebook
  ).slice(0, 150);

  const mergedCustomWords = mergeArrayById<CustomVocabItem>(
    localState.customWords,
    cloudSnap.customWords
  ).slice(0, 100);

  const mergedCustomLectures = mergeArrayById<LectureUnit>(
    localState.customLectures,
    cloudSnap.customLectures
  ).slice(0, 20);

  const mergedExamHistory = mergeArrayById<ExamSimulationRecord>(
    localState.examHistory,
    cloudSnap.examHistory
  ).slice(0, 15);

  const resolvedUserName =
    cloudSnap.userName && cloudSnap.userName !== 'Anisha Sharma'
      ? cloudSnap.userName
      : localState.userName && localState.userName !== 'Anisha Sharma'
      ? localState.userName
      : user.displayName || cloudSnap.userName || localState.userName || 'Anisha Sharma';

  const mergedState: UserProgressState = {
    ...localState,
    ...cloudSnap,
    userName: resolvedUserName,
    dailyReminderEnabled:
      typeof cloudSnap.dailyReminderEnabled === 'boolean'
        ? cloudSnap.dailyReminderEnabled
        : localState.dailyReminderEnabled !== false,
    onboardingComplete: Boolean(localState.onboardingComplete || cloudSnap.onboardingComplete),
    currentStreakDays: Math.max(
      localState.currentStreakDays || 0,
      cloudSnap.currentStreakDays || 0
    ),
    dailyChallengeStreak: Math.max(
      localState.dailyChallengeStreak || 0,
      cloudSnap.dailyChallengeStreak || 0
    ),
    dailyChallengeTotalCompleted: Math.max(
      localState.dailyChallengeTotalCompleted || 0,
      cloudSnap.dailyChallengeTotalCompleted || 0
    ),
    streakFreezeShields: Math.max(
      localState.streakFreezeShields ?? 1,
      cloudSnap.streakFreezeShields ?? 1
    ),
    sprintHighScore: Math.max(localState.sprintHighScore || 0, cloudSnap.sprintHighScore || 0),
    completedUnitIds: mergedCompletedUnits,
    completedStepsByLecture: mergedStepsByLecture,
    savedWordIds: mergedSavedWords,
    masteredWordIds: mergedMasteredWords,
    detectiveSolvedIds: mergedDetective,
    rolePlayCompletedIds: mergedRolePlay,
    unlockedBadgeIds: mergedBadges,
    mistakeNotebook: mergedMistakes,
    customWords: mergedCustomWords,
    customLectures: mergedCustomLectures,
    examHistory: mergedExamHistory,
    wordSRS: {
      ...(cloudSnap.wordSRS || {}),
      ...(localState.wordSRS || {}),
    },
    lectureNotes: {
      ...(cloudSnap.lectureNotes || {}),
      ...(localState.lectureNotes || {}),
    },
    moduleScores: {
      ...(cloudSnap.moduleScores || {}),
      ...(localState.moduleScores || {}),
    },
    studyActivityByDate: mergedActivity,
    lastSyncedAt: new Date().toISOString(),
    pendingSyncQueue: [],
  };

  saveUserProgress(mergedState);
  // Push merged union back to Firestore so Cloud also has any newly merged local changes
  try {
    await syncProgressToCloud(user, mergedState);
  } catch (err) {
    console.warn('Merged state push skipped:', err);
  }
  return mergedState;
}

/**
 * Overwrites the user's Firestore cloud progress document with a clean zeroed state
 * so both local and cloud progress start fresh from 0.
 */
export async function resetCloudProgress(
  user: User,
  freshState: UserProgressState
): Promise<UserProgressState> {
  return await syncProgressToCloud(user, freshState);
}


