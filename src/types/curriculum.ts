export type CEFRLevel = 'B1' | 'B2' | 'C1';

export interface WordSegment {
  text: string;
  silent: boolean;
}

export interface VocabularyItem {
  id: string;
  word: string;
  ipa: string;
  partOfSpeech: string;
  segments: WordSegment[];
  silentLettersSummary: string;
  nepaliMeaning: string;
  nepaliTransliteration?: string;
  englishExample: string;
  nepaliExampleTranslation: string;
  usageTipNepali: string;
}

export interface PronunciationItem {
  id: string;
  wordId?: string;
  word: string;
  ipa: string;
  syllables: string[];
  stressedSyllableIndex: number;
  simplifiedPhonetic: string;
  nepaliPhoneticHint: string;
  ruleTitle: string;
  ruleExplanationNepali: string;
  commonMispronunciation: string;
}

export interface SpellingExample {
  baseWord: string;
  transformation: string;
  correctSpelling?: string;
  resultWord?: string;
  commonWrongSpelling?: string;
  wrongSpelling?: string;
  nepaliMeaning?: string;
}

export interface SpellingQuizQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank';
  promptEnglish?: string;
  prompt?: string;
  promptNepaliHint?: string;
  nepaliHint?: string;
  options: string[];
  correctAnswer: string;
  commonMistakeExplanationNepali?: string;
  explanationNepali?: string;
}

export interface SpellingModule {
  ruleTitle: string;
  nepaliRuleTitle: string;
  formula: string;
  nepaliExplanation: string;
  examples: SpellingExample[];
  exceptions: string[];
  quizzes: SpellingQuizQuestion[];
}

export type GrammaticalRole = 'Subject' | 'Verb' | 'Object' | 'Modifier' | 'Connector';

export interface SyntaxToken {
  role: GrammaticalRole;
  englishText: string;
  nepaliText: string;
  nepaliRoleLabel: string;
}

export interface SyntaxComparisonItem {
  id: string;
  contextLabel?: string;
  structureType?: string;
  englishFullSentence?: string;
  englishSentence?: string;
  nepaliFullSentence?: string;
  nepaliSentence?: string;
  englishOrderFormula?: string;
  nepaliOrderFormula?: string;
  tokens: SyntaxToken[];
  structuralNoteNepali?: string;
  comparisonNoteNepali?: string;
}

export interface GrammarCapstoneExercise {
  id: string;
  questionPrompt: string;
  nepaliContext: string;
  options: string[];
  correctAnswer: string;
  explanationNepali: string;
}

export interface SentenceBuilderExercise {
  id: string;
  nepaliPrompt: string;
  englishContextHint: string;
  correctTokens: { text: string; role: GrammaticalRole }[];
  grammarTip: string;
}

export interface DialogueLine {
  speaker: string;
  role: string;
  english: string;
  nepali: string;
  highlightedWords: string[];
}

export interface DialogueComprehensionQuestion {
  id: string;
  question: string;
  nepaliQuestion: string;
  options: string[];
  correctAnswer: string;
  explanationEnglish: string;
  explanationNepali: string;
}

export interface LectureDialogue {
  title: string;
  nepaliTitle: string;
  setting: string;
  nepaliSetting?: string;
  lines: DialogueLine[];
  comprehensionQuestions?: DialogueComprehensionQuestion[];
}

export interface GrammarModule {
  topicTitle: string;
  nepaliTopicTitle: string;
  explanationNepali: string;
  keyTakeawaysNepali: string[];
  syntaxComparisons: SyntaxComparisonItem[];
  capstoneExercises: GrammarCapstoneExercise[];
  sentenceBuilders?: SentenceBuilderExercise[];
}

export interface LectureUnit {
  id: string;
  lectureNumber: number;
  title: string;
  nepaliTitle: string;
  subtitle: string;
  level: CEFRLevel;
  category: string;
  estimatedMinutes: number;
  isCustomAI?: boolean;
  createdAt?: string;
  moduleA_vocabulary: VocabularyItem[];
  moduleB_pronunciation: PronunciationItem[];
  moduleC_spelling: SpellingModule;
  moduleD_grammar: GrammarModule;
  moduleE_dialogue?: LectureDialogue;
}

export interface ModuleScoreRecord {
  unitId: string;
  spellingScore: number;
  spellingTotal: number;
  grammarScore: number;
  grammarTotal: number;
  dialogueScore?: number;
  dialogueTotal?: number;
  pronunciationPracticed: number;
  completedAt: string;
}

export type SRSStage = 'new' | 'learning' | 'review' | 'mastered';

export interface SRSRecord {
  wordId: string;
  stage: SRSStage;
  correctStreak: number;
  lastReviewedAt: string;
  nextReviewDue: string;
}

export interface MistakeItem {
  id: string;
  lectureId: string;
  lectureNumber: number;
  category?: 'spelling' | 'grammar' | 'vocabulary' | 'dictation' | 'dialogue';
  sourceType?: 'spelling' | 'grammar' | 'vocab-quiz' | 'dictation' | 'dialogue' | 'custom-note';
  prompt: string;
  nepaliHint?: string;
  userWrongAnswer: string;
  correctAnswer: string;
  options?: string[];
  explanation: string;
  userNote?: string;
  consecutiveCorrect: number;
  createdAt: string;
}

export interface SyncEvent {
  id: string;
  type: 'LECTURE_COMPLETED' | 'WORD_SAVED' | 'LEVEL_UPDATED' | 'STEP_COMPLETED' | 'SRS_UPDATED';
  payload: Record<string, unknown>;
  timestamp: string;
}

export type LanguageMode = 'english-only' | 'english-meanings' | 'full-nepali';

export interface CustomVocabItem {
  id: string;
  word: string;
  ipa: string;
  partOfSpeech: string;
  silentLettersSummary: string;
  nepaliMeaning: string;
  englishExample: string;
  deckTag: string;
  createdAt: string;
}

export interface ExamSimulationRecord {
  id: string;
  completedAt: string;
  overallBand: number;
  cefrEstimate: CEFRLevel;
  pteScore: number;
  dictationScore: number;
  proofreadingScore: number;
  grammarScore: number;
  speakingScore: number;
  weakestSkill: 'dictation' | 'proofreading' | 'grammar' | 'speaking';
}

export interface UserProgressState {
  selectedLevel: CEFRLevel;
  dailyGoalMinutes: number;
  onboardingComplete: boolean;
  currentStreakDays: number;
  lastStudyDate: string | null;
  completedUnitIds: string[];
  completedStepsByLecture: Record<string, number[]>;
  moduleScores: Record<string, ModuleScoreRecord>;
  savedWordIds: string[];
  masteredWordIds?: string[];
  wordSRS: Record<string, SRSRecord>;
  mistakeNotebook: MistakeItem[];
  lectureNotes?: Record<string, string>;
  customLectures: LectureUnit[];
  customWords?: CustomVocabItem[];
  preferredSpeechRate: number;
  darkMode: boolean;
  languageMode: LanguageMode;
  pendingSyncQueue: SyncEvent[];
  lastSyncedAt: string | null;
  lastDailyChallengeAt?: string | null;
  dailyChallengeStreak?: number;
  dailyChallengeTotalCompleted?: number;
  streakFreezeShields?: number;
  unlockedBadgeIds?: string[];
  sprintHighScore?: number;
  detectiveSolvedIds?: string[];
  rolePlayCompletedIds?: string[];
  examHistory?: ExamSimulationRecord[];
  studyActivityByDate?: Record<string, number>;
}


