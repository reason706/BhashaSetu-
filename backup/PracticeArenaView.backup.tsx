import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Volume2,
  Turtle,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Play,
  Square,
  RotateCcw,
  GitBranch,
  MessageSquare,
  Plus,
  Trash2,
  Printer,
  Headphones,
  Award,
  ArrowRight,
  Clock,
  Mic,
  Radio,
  SkipForward,
  Check,
  Activity,
} from 'lucide-react';
import {
  LectureUnit,
  LanguageMode,
  CustomVocabItem,
  MistakeItem,
  ExamSimulationRecord,
} from '../types/curriculum';
import { speechService, PronunciationResult } from '../services/speech';
import { getMassiveLexicon } from '../data/massiveLexicon';
import { AudioShadowingTrainer } from './AudioShadowingTrainer';
import { MinimalPairLab } from './MinimalPairLab';
import { WritingInterferenceLinter } from './WritingInterferenceLinter';
import { ArticulationGuideLab } from './ArticulationGuideLab';
import { DictationPassageStudio } from './DictationPassageStudio';

export type ArenaToolTab =
  | 'detective'
  | 'confusables'
  | 'interference'
  | 'connected-speech'
  | 'sprint'
  | 'word-trees'
  | 'roleplay'
  | 'shadowing'
  | 'custom-deck'
  | 'cheatsheets'
  | 'exam-simulator'
  | 'commuter-audio'
  | 'minimal-pairs'
  | 'writing-linter'
  | 'articulation-guide'
  | 'dictation-studio';

interface PracticeArenaViewProps {
  lectures: LectureUnit[];
  savedWordIds?: string[];
  customWords: CustomVocabItem[];
  mistakeNotebook: MistakeItem[];
  sprintHighScore: number;
  detectiveSolvedIds: string[];
  rolePlayCompletedIds: string[];
  preferredSpeechRate: number;
  languageMode: LanguageMode;
  initialToolTab?: ArenaToolTab;
  onAddCustomWord: (item: Omit<CustomVocabItem, 'id' | 'createdAt'>) => void;
  onRemoveCustomWord: (wordId: string) => void;
  onRecordSprintScore: (score: number) => void;
  onRecordDetectiveSolved: (passageId: string) => void;
  onRecordRolePlayCompleted: (scenarioId: string) => void;
  onRecordMistake: (mistake: Omit<MistakeItem, 'id' | 'consecutiveCorrect' | 'createdAt'>) => void;
  onRecordExamResult?: (result: Omit<ExamSimulationRecord, 'id' | 'completedAt'>) => void;
  onOpenLecture?: (lectureId: string) => void;
  onOpenDailyChallenge: () => void;
}

// ============================================================================
// DATA FOR FEATURE #2: SILENT-LETTER DETECTIVE PASSAGES
// ============================================================================
interface DetectivePassage {
  id: string;
  title: string;
  level: string;
  tokens: {
    text: string;
    cleanWord: string;
    isSilentTarget: boolean;
    silentRule?: string;
    ipa?: string;
    nepali?: string;
  }[];
}

const DETECTIVE_PASSAGES: DetectivePassage[] = [
  {
    id: 'det-wednesday-plumber',
    title: 'Case 01: The Honest Plumber’s Wednesday Schedule',
    level: 'B1 · Everyday Silent Consonants',
    tokens: [
      { text: 'On', cleanWord: 'On', isSilentTarget: false },
      {
        text: 'Wednesday',
        cleanWord: 'Wednesday',
        isSilentTarget: true,
        silentRule: 'Silent middle "d" and "e" (/ˈwenz.deɪ/)',
        ipa: '/ˈwenz.deɪ/',
        nepali: 'बुधबार',
      },
      { text: 'morning,', cleanWord: 'morning', isSilentTarget: false },
      { text: 'an', cleanWord: 'an', isSilentTarget: false },
      {
        text: 'honest',
        cleanWord: 'honest',
        isSilentTarget: true,
        silentRule: 'Silent initial "h" (/ˈɒn.ɪst/)',
        ipa: '/ˈɒn.ɪst/',
        nepali: 'इमानदार',
      },
      {
        text: 'plumber',
        cleanWord: 'plumber',
        isSilentTarget: true,
        silentRule: 'Silent "b" after "m" (/ˈplʌm.ər/)',
        ipa: '/ˈplʌm.ər/',
        nepali: 'पाइप मर्मत गर्ने व्यक्ति',
      },
      { text: 'used', cleanWord: 'used', isSilentTarget: false },
      { text: 'a', cleanWord: 'a', isSilentTarget: false },
      { text: 'steel', cleanWord: 'steel', isSilentTarget: false },
      {
        text: 'wrench',
        cleanWord: 'wrench',
        isSilentTarget: true,
        silentRule: 'Silent initial "w" before "r" (/rentʃ/)',
        ipa: '/rentʃ/',
        nepali: 'पाना / रेन्च',
      },
      { text: 'to', cleanWord: 'to', isSilentTarget: false },
      { text: 'fix', cleanWord: 'fix', isSilentTarget: false },
      { text: 'a', cleanWord: 'a', isSilentTarget: false },
      {
        text: 'subtle',
        cleanWord: 'subtle',
        isSilentTarget: true,
        silentRule: 'Silent "b" before "t" (/ˈsʌt.əl/)',
        ipa: '/ˈsʌt.əl/',
        nepali: 'सूक्ष्म',
      },
      { text: 'leak', cleanWord: 'leak', isSilentTarget: false },
      { text: 'near', cleanWord: 'near', isSilentTarget: false },
      { text: 'the', cleanWord: 'the', isSilentTarget: false },
      { text: 'kitchen', cleanWord: 'kitchen', isSilentTarget: false },
      {
        text: 'cupboard',
        cleanWord: 'cupboard',
        isSilentTarget: true,
        silentRule: 'Silent "p" before "b" (/ˈkʌb.əd/)',
        ipa: '/ˈkʌb.əd/',
        nepali: 'दराज / अलमारी',
      },
      { text: 'and', cleanWord: 'and', isSilentTarget: false },
      { text: 'signed', cleanWord: 'signed', isSilentTarget: false },
      { text: 'the', cleanWord: 'the', isSilentTarget: false },
      {
        text: 'receipt.',
        cleanWord: 'receipt',
        isSilentTarget: true,
        silentRule: 'Silent "p" before "t" (/rɪˈsiːt/)',
        ipa: '/rɪˈsiːt/',
        nepali: 'रसिद',
      },
    ],
  },
  {
    id: 'det-castle-knight',
    title: 'Case 02: The Autumn Castle & The Solemn Knight',
    level: 'B2 · Clusters & Historical Orthography',
    tokens: [
      { text: 'During', cleanWord: 'During', isSilentTarget: false },
      {
        text: 'autumn,',
        cleanWord: 'autumn',
        isSilentTarget: true,
        silentRule: 'Silent final "n" after "m" (/ˈɔː.təm/)',
        ipa: '/ˈɔː.təm/',
        nepali: 'शरद ऋतु',
      },
      { text: 'a', cleanWord: 'a', isSilentTarget: false },
      {
        text: 'solemn',
        cleanWord: 'solemn',
        isSilentTarget: true,
        silentRule: 'Silent final "n" after "m" (/ˈsɒl.əm/)',
        ipa: '/ˈsɒl.əm/',
        nepali: 'गम्भीर',
      },
      {
        text: 'knight',
        cleanWord: 'knight',
        isSilentTarget: true,
        silentRule: 'Silent initial "k" and "gh" (/naɪt/)',
        ipa: '/naɪt/',
        nepali: 'योद्धा',
      },
      { text: 'stood', cleanWord: 'stood', isSilentTarget: false },
      { text: 'in', cleanWord: 'in', isSilentTarget: false },
      { text: 'the', cleanWord: 'the', isSilentTarget: false },
      {
        text: 'queue',
        cleanWord: 'queue',
        isSilentTarget: true,
        silentRule: 'Silent "-ueue" after "q" (/kjuː/)',
        ipa: '/kjuː/',
        nepali: 'लाइन / लाम',
      },
      { text: 'outside', cleanWord: 'outside', isSilentTarget: false },
      { text: 'the', cleanWord: 'the', isSilentTarget: false },
      { text: 'stone', cleanWord: 'stone', isSilentTarget: false },
      {
        text: 'castle',
        cleanWord: 'castle',
        isSilentTarget: true,
        silentRule: 'Silent "t" in "-stle" (/ˈkɑː.səl/)',
        ipa: '/ˈkɑː.səl/',
        nepali: 'किल्ला',
      },
      { text: 'holding', cleanWord: 'holding', isSilentTarget: false },
      { text: 'a', cleanWord: 'a', isSilentTarget: false },
      { text: 'heavy', cleanWord: 'heavy', isSilentTarget: false },
      {
        text: 'sword',
        cleanWord: 'sword',
        isSilentTarget: true,
        silentRule: 'Silent "w" in "sw-" (/sɔːd/)',
        ipa: '/sɔːd/',
        nepali: 'तरवार',
      },
      { text: 'without', cleanWord: 'without', isSilentTarget: false },
      { text: 'any', cleanWord: 'any', isSilentTarget: false },
      {
        text: 'doubt.',
        cleanWord: 'doubt',
        isSilentTarget: true,
        silentRule: 'Silent "b" before "t" (/daʊt/)',
        ipa: '/daʊt/',
        nepali: 'शङ्का',
      },
    ],
  },
  {
    id: 'det-executive-mortgage',
    title: 'Case 03: The Psychologist’s Mortgage & Rapport',
    level: 'C1 · Workplace & French/Greek Loanwords',
    tokens: [
      { text: 'The', cleanWord: 'The', isSilentTarget: false },
      {
        text: 'psychologist',
        cleanWord: 'psychologist',
        isSilentTarget: true,
        silentRule: 'Silent initial "p" before "s" (/saɪˈkɒl.ə.dʒɪst/)',
        ipa: '/saɪˈkɒl.ə.dʒɪst/',
        nepali: 'मनोवैज्ञानिक',
      },
      { text: 'built', cleanWord: 'built', isSilentTarget: false },
      { text: 'warm', cleanWord: 'warm', isSilentTarget: false },
      {
        text: 'rapport',
        cleanWord: 'rapport',
        isSilentTarget: true,
        silentRule: 'Silent final French "t" (/ræˈpɔːr/)',
        ipa: '/ræˈpɔːr/',
        nepali: 'सुमधुर सम्बन्ध',
      },
      { text: 'while', cleanWord: 'while', isSilentTarget: false },
      { text: 'reviewing', cleanWord: 'reviewing', isSilentTarget: false },
      { text: 'the', cleanWord: 'the', isSilentTarget: false },
      { text: 'bank', cleanWord: 'bank', isSilentTarget: false },
      {
        text: 'mortgage,',
        cleanWord: 'mortgage',
        isSilentTarget: true,
        silentRule: 'Silent middle "t" (/ˈmɔː.ɡɪdʒ/)',
        ipa: '/ˈmɔː.ɡɪdʒ/',
        nepali: 'घरजग्गा धितो कर्जा',
      },
      { text: 'the', cleanWord: 'the', isSilentTarget: false },
      { text: 'accounting', cleanWord: 'accounting', isSilentTarget: false },
      {
        text: 'ledger,',
        cleanWord: 'ledger',
        isSilentTarget: true,
        silentRule: 'Silent "d" before "g" (/ˈledʒ.ər/)',
        ipa: '/ˈledʒ.ər/',
        nepali: 'हिसाब खाता',
      },
      { text: 'and', cleanWord: 'and', isSilentTarget: false },
      { text: 'the', cleanWord: 'the', isSilentTarget: false },
      { text: 'diplomatic', cleanWord: 'diplomatic', isSilentTarget: false },
      {
        text: 'rendezvous',
        cleanWord: 'rendezvous',
        isSilentTarget: true,
        silentRule: 'Silent "z" and final "s" (/ˈrɒn.deɪ.vuː/)',
        ipa: '/ˈrɒn.deɪ.vuː/',
        nepali: 'पूर्वनिर्धारित भेटघाट',
      },
      { text: 'near', cleanWord: 'near', isSilentTarget: false },
      { text: 'the', cleanWord: 'the', isSilentTarget: false },
      {
        text: 'aisle.',
        cleanWord: 'aisle',
        isSilentTarget: true,
        silentRule: 'Silent "s" (/aɪl/)',
        ipa: '/aɪl/',
        nepali: 'सिटहरू बीचको बाटो',
      },
    ],
  },
];

// ============================================================================
// DATA FOR FEATURE #3: CONFUSABLE WORDS & HOMOPHONES ARENA
// ============================================================================
interface ConfusablePairItem {
  id: string;
  ipa: string;
  wordA: string;
  ruleA: string;
  meaningA: string;
  exampleA: string;
  wordB: string;
  ruleB: string;
  meaningB: string;
  exampleB: string;
  quizSentence: string;
  correctChoice: string;
}

const CONFUSABLE_PAIRS: ConfusablePairItem[] = [
  {
    id: 'conf-knight-night',
    ipa: '/naɪt/',
    wordA: 'Knight',
    ruleA: 'Silent K + silent GH (armored warrior)',
    meaningA: 'योद्धा / नाइट उपाधि',
    exampleA: 'The brave knight defended the ancient castle.',
    wordB: 'Night',
    ruleB: 'Silent GH only (evening/darkness)',
    meaningB: 'रात / रात्रि',
    exampleB: 'Stars shone brightly across the clear mountain night.',
    quizSentence: 'The medieval _____ rode across the stone bridge in shining armor.',
    correctChoice: 'Knight',
  },
  {
    id: 'conf-principle-principal',
    ipa: '/ˈprɪn.sə.pəl/',
    wordA: 'Principle',
    ruleA: 'Ends in -LE = Fundamental rule or moral truth',
    meaningA: 'सिद्धान्त / नैतिक नियम',
    exampleA: 'Honesty is the core principle of our organization.',
    wordB: 'Principal',
    ruleB: 'Ends in -AL = Head of a school or main amount of money',
    meaningB: 'प्रधानाध्यापक / मुख्य साँवा रकम',
    exampleB: 'The school principal welcomed parents to the annual assembly.',
    quizSentence: 'Mrs. Sharma is the new _____ of our community secondary school.',
    correctChoice: 'Principal',
  },
  {
    id: 'conf-stationery-stationary',
    ipa: '/ˈsteɪ.ʃən.ər.i/',
    wordA: 'Stationery',
    ruleA: '-ERY (with E like pEn & papEr) = Office writing supplies',
    meaningA: 'कागज, कलम र कार्यालय सामग्री',
    exampleA: 'We purchased notebooks and pens from the stationery shop.',
    wordB: 'Stationary',
    ruleB: '-ARY (with A like stAnding) = Not moving / still',
    meaningB: 'स्थिर / नचल्ने',
    exampleB: 'Please remain seated until the bus is completely stationary.',
    quizSentence: 'Wait until the train is completely _____ before opening the door.',
    correctChoice: 'Stationary',
  },
  {
    id: 'conf-whole-hole',
    ipa: '/həʊl/',
    wordA: 'Whole',
    ruleA: 'Silent W at start = Entire / 100% complete',
    meaningA: 'सिंगो / सम्पूर्ण',
    exampleA: 'The whole village celebrated the harvest festival together.',
    wordB: 'Hole',
    ruleB: 'Starts with pronounced H = An opening or gap',
    meaningB: 'प्वाल / खाल्डो',
    exampleB: 'Workers repaired the deep hole in the mountain highway.',
    quizSentence: 'She read the _____ book from cover to cover in one weekend.',
    correctChoice: 'Whole',
  },
  {
    id: 'conf-compliment-complement',
    ipa: '/ˈkɒm.plɪ.ment/',
    wordA: 'Compliment',
    ruleA: 'Spelled with "I" = Polite praise ("I like...")',
    meaningA: 'प्रशंसा / तारिफ',
    exampleA: 'The director gave her a warm compliment on her clear pronunciation.',
    wordB: 'Complement',
    ruleB: 'Spelled with "E" = Something that completes or enhances',
    meaningB: 'पूरक / पूर्ण बनाउने तत्व',
    exampleB: 'Fresh mint chutney is the perfect complement to traditional snacks.',
    quizSentence: 'Thank you for such a kind _____ on my English presentation!',
    correctChoice: 'Compliment',
  },
  {
    id: 'conf-discreet-discrete',
    ipa: '/dɪˈskriːt/',
    wordA: 'Discreet',
    ruleA: '-EET = Tactful, careful, keeping secrets confidential',
    meaningA: 'गोपनीय / सावधान र मर्यादित',
    exampleA: 'Doctors must remain discreet about confidential patient records.',
    wordB: 'Discrete',
    ruleB: '-ETE = Separate, distinct, individual parts',
    meaningB: 'छुट्टाछुट्टै / अलग-अलग',
    exampleB: 'Each lecture is divided into five discrete learning steps.',
    quizSentence: 'Please make a _____ inquiry so we do not embarrass the client.',
    correctChoice: 'Discreet',
  },
];

// ============================================================================
// DATA FOR FEATURE #4: NEPALI-TO-ENGLISH INTERFERENCE FIXER
// ============================================================================
interface InterferenceDrill {
  id: string;
  nepaliThought: string;
  commonNepaliTrap: string;
  naturalEnglishFix: string;
  grammarRule: string;
  options: string[];
}

const INTERFERENCE_DRILLS: InterferenceDrill[] = [
  {
    id: 'int-discuss',
    nepaliThought: 'हामीले बजेटको बारेमा छलफल गर्यौँ।',
    commonNepaliTrap: '✗ We discussed about the budget in the meeting.',
    naturalEnglishFix: 'We discussed the budget in the meeting.',
    grammarRule:
      'In Nepali we say "बारेमा छलफल गर्नु" (about + discuss), but in English the verb "discuss" already means "talk about" — never put "about" after "discuss".',
    options: [
      'We discussed the budget in the meeting.',
      'We discussed about the budget in the meeting.',
      'We discussed on the budget in the meeting.',
    ],
  },
  {
    id: 'int-return-back',
    nepaliThought: 'कृपया मेरो रसिद फिर्ता दिनुहोस्।',
    commonNepaliTrap: '✗ Please return back my receipt by Wednesday.',
    naturalEnglishFix: 'Please return my receipt by Wednesday.',
    grammarRule:
      '"Return" already contains the meaning "give back". Saying "return back" or "repeat again" is redundant in formal English.',
    options: [
      'Please return my receipt by Wednesday.',
      'Please return back my receipt by Wednesday.',
      'Please return again my receipt by Wednesday.',
    ],
  },
  {
    id: 'int-give-exam',
    nepaliThought: 'मैले बुधबार अङ्ग्रेजी परीक्षा दिएँ।',
    commonNepaliTrap: '✗ I gave an English exam on Wednesday.',
    naturalEnglishFix: 'I took an English exam on Wednesday.',
    grammarRule:
      'In Nepali students "पक्का परीक्षा दिन्छन्" (give an exam), but in standard English the teacher "gives" the exam and the student "takes" or "sits for" the exam.',
    options: [
      'I took an English exam on Wednesday.',
      'I gave an English exam on Wednesday.',
      'I made an English exam on Wednesday.',
    ],
  },
  {
    id: 'int-having-headache',
    nepaliThought: 'मलाई टाउको दुखिरहेको छ।',
    commonNepaliTrap: '✗ I am having a severe headache right now.',
    naturalEnglishFix: 'I have a severe headache right now.',
    grammarRule:
      'For possession and physical sensations (headache, fever, cold), use the simple present "I have a headache", not the continuous "I am having".',
    options: [
      'I have a severe headache right now.',
      'I am having a severe headache right now.',
      'I having a severe headache right now.',
    ],
  },
  {
    id: 'int-according-to-me',
    nepaliThought: 'मेरो विचारमा यो प्रस्ताव उत्तम छ।',
    commonNepaliTrap: '✗ According to me, this proposal is very subtle.',
    naturalEnglishFix: 'In my opinion, this proposal is very subtle.',
    grammarRule:
      'Use "According to..." only for external sources ("According to the report"). For yourself, always say "In my opinion" or "I believe".',
    options: [
      'In my opinion, this proposal is very subtle.',
      'According to me, this proposal is very subtle.',
      'By my side, this proposal is very subtle.',
    ],
  },
  {
    id: 'int-cousin-brother',
    nepaliThought: 'उनी मेरो काकाको छोरा (दाइ/भाइ) हुन्।',
    commonNepaliTrap: '✗ He is my cousin brother working in Kathmandu.',
    naturalEnglishFix: 'He is my cousin working in Kathmandu.',
    grammarRule:
      'In English, "cousin" is gender-neutral and never followed by "brother" or "sister". The pronoun "He" or "She" already clarifies gender.',
    options: [
      'He is my cousin working in Kathmandu.',
      'He is my cousin brother working in Kathmandu.',
      'He is my brother cousin working in Kathmandu.',
    ],
  },
];

// ============================================================================
// DATA FOR FEATURE #5: CONNECTED SPEECH & SPEED LISTENING DECODER
// ============================================================================
interface ConnectedSpeechItem {
  id: string;
  fullPhrase: string;
  spokenPhoneticLink: string;
  ipaLinked: string;
  linkingExplanation: string;
  nepaliMeaning: string;
  options: string[];
}

const CONNECTED_SPEECH_ITEMS: ConnectedSpeechItem[] = [
  {
    id: 'cs-could-you',
    fullPhrase: 'Could you please send the receipt?',
    spokenPhoneticLink: '“KUD-joo please send the ri-SEET?”',
    ipaLinked: '/ˈkʊdʒuː pliːz send ðə rɪˈsiːt/',
    linkingExplanation:
      'When "Could" (/d/) meets "you" (/j/), the /d/ + /j/ blend into a soft /dʒ/ sound ("KUD-joo"), and the "l" in "Could" + "p" in "receipt" stay silent.',
    nepaliMeaning: 'के तपाईं कृपया रसिद पठाउन सक्नुहुन्छ?',
    options: [
      'Could you please send the receipt?',
      'Called you please send the receipt?',
      'Could we please send the receipt?',
    ],
  },
  {
    id: 'cs-did-you',
    fullPhrase: 'Did you check the Wednesday schedule?',
    spokenPhoneticLink: '“DI-joo check the WENZ-day SKED-jool?”',
    ipaLinked: '/ˈdɪdʒuː tʃek ðə ˈwenz.deɪ ˈʃed.juːl/',
    linkingExplanation:
      'In natural 1.0x speech, "Did you" links into /ˈdɪdʒuː/ ("DI-joo"), while "Wednesday" compresses into 2 syllables ("WENZ-day").',
    nepaliMeaning: 'के तपाईंले बुधबारको तालिका जाँच गर्नुभयो?',
    options: [
      'Did you check the Wednesday schedule?',
      'Do you check the Wednesday schedule?',
      'Did they check the Wednesday schedule?',
    ],
  },
  {
    id: 'cs-would-have',
    fullPhrase: 'We would have finished the budget earlier.',
    spokenPhoneticLink: '“We WOOD-uhv finished the BUH-jit earlier.”',
    ipaLinked: '/wiː ˈwʊdəv ˈfɪn.ɪʃt ðə ˈbʌdʒ.ɪt ˈɜː.li.ər/',
    linkingExplanation:
      'In fast speech, "would have" contracts to /ˈwʊdəv/ (never spell it "would of"!). Also note the silent "l" in "would" and silent "d" in "budget".',
    nepaliMeaning: 'हामीले बजेट अझै छिटो सक्ने थियौँ।',
    options: [
      'We would have finished the budget earlier.',
      'We would of finished the budget earlier.',
      'We will have finished the budget earlier.',
    ],
  },
  {
    id: 'cs-have-to',
    fullPhrase: 'I have to fasten my seatbelt now.',
    spokenPhoneticLink: '“I HAF-tuh FAH-suhn my seatbelt now.”',
    ipaLinked: '/aɪ ˈhæf.tə ˈfɑː.sən maɪ ˈsiːt.belt naʊ/',
    linkingExplanation:
      'When "have" is followed by "to" (obligation), the /v/ assimilates to an unvoiced /f/ ("HAF-tuh"), and the "t" in "fasten" is silent.',
    nepaliMeaning: 'मैले अब मेरो सिटबेल्ट बाँध्नुपर्छ।',
    options: [
      'I have to fasten my seatbelt now.',
      'I had to fasten my seatbelt now.',
      'I half to fasten my seatbelt now.',
    ],
  },
];

// ============================================================================
// DATA FOR FEATURE #6: 60-SECOND SPELLING & PHONICS SPRINT
// ============================================================================
interface SprintItem {
  word: string;
  level: 'B1' | 'B2' | 'C1';
  maskedDisplay: string;
  correctCluster: string;
  options: string[];
  ipa: string;
  nepali: string;
  rule: string;
}

const SPRINT_CHALLENGE_POOL: SprintItem[] = [
  {
    word: 'Receipt',
    level: 'B1',
    maskedDisplay: 'R E C _ _ _ T',
    correctCluster: 'EIP',
    options: ['EIP', 'IEP', 'EEP', 'IAP'],
    ipa: '/rɪˈsiːt/',
    nepali: 'रसिद / बिल',
    rule: 'EI after C + silent P before T',
  },
  {
    word: 'Subtle',
    level: 'B2',
    maskedDisplay: 'S U _ _ L E',
    correctCluster: 'BT',
    options: ['BT', 'TT', 'PT', 'TL'],
    ipa: '/ˈsʌt.əl/',
    nepali: 'सूक्ष्म / बारीक',
    rule: 'Silent B before T',
  },
  {
    word: 'Wednesday',
    level: 'B1',
    maskedDisplay: 'W E _ _ E S D A Y',
    correctCluster: 'DN',
    options: ['DN', 'ND', 'NN', 'NS'],
    ipa: '/ˈwenz.deɪ/',
    nepali: 'बुधबार',
    rule: 'Silent D before N',
  },
  {
    word: 'Plumber',
    level: 'B1',
    maskedDisplay: 'P L U _ _ E R',
    correctCluster: 'MB',
    options: ['MB', 'MM', 'MP', 'NB'],
    ipa: '/ˈplʌm.ər/',
    nepali: 'धारा मर्मत गर्ने व्यक्ति',
    rule: 'Silent B after M',
  },
  {
    word: 'Castle',
    level: 'B1',
    maskedDisplay: 'C A _ _ L E',
    correctCluster: 'ST',
    options: ['ST', 'SS', 'SC', 'SL'],
    ipa: '/ˈkɑː.səl/',
    nepali: 'किल्ला / दरबार',
    rule: 'Silent T in -stle',
  },
  {
    word: 'Mortgage',
    level: 'C1',
    maskedDisplay: 'M O R _ _ A G E',
    correctCluster: 'TG',
    options: ['TG', 'G', 'DG', 'CG'],
    ipa: '/ˈmɔː.ɡɪdʒ/',
    nepali: 'घरजग्गा धितो कर्जा',
    rule: 'Silent T before G in mortgage',
  },
  {
    word: 'Discipline',
    level: 'B2',
    maskedDisplay: 'D I _ _ I P L I N E',
    correctCluster: 'SC',
    options: ['SC', 'SS', 'CC', 'CS'],
    ipa: '/ˈdɪs.ə.plɪn/',
    nepali: 'अनुशासन',
    rule: 'Silent C after S',
  },
  {
    word: 'Autumn',
    level: 'B2',
    maskedDisplay: 'A U T U _ _',
    correctCluster: 'MN',
    options: ['MN', 'MM', 'NM', 'M'],
    ipa: '/ˈɔː.təm/',
    nepali: 'शरद ऋतु',
    rule: 'Silent final N after M',
  },
  {
    word: 'Knight',
    level: 'B1',
    maskedDisplay: '_ _ I G H T',
    correctCluster: 'KN',
    options: ['KN', 'N', 'GN', 'WR'],
    ipa: '/naɪt/',
    nepali: 'योद्धा',
    rule: 'Silent initial K before N',
  },
  {
    word: 'Psychology',
    level: 'C1',
    maskedDisplay: '_ _ Y C H O L O G Y',
    correctCluster: 'PS',
    options: ['PS', 'S', 'PH', 'SC'],
    ipa: '/saɪˈkɒl.ə.dʒi/',
    nepali: 'मनोविज्ञान',
    rule: 'Silent initial P before S',
  },
  {
    word: 'Queue',
    level: 'C1',
    maskedDisplay: 'Q _ _ _ _',
    correctCluster: 'UEUE',
    options: ['UEUE', 'EUEU', 'UUEE', 'UEU'],
    ipa: '/kjuː/',
    nepali: 'लाइन / लाम',
    rule: 'Silent -ueue after Q',
  },
  {
    word: 'Handkerchief',
    level: 'B2',
    maskedDisplay: 'H A N _ _ E R C H I E F',
    correctCluster: 'DK',
    options: ['DK', 'K', 'NK', 'CK'],
    ipa: '/ˈhæŋ.kə.tʃɪf/',
    nepali: 'रुमाल',
    rule: 'Silent D before K',
  },
];

// ============================================================================
// DATA FOR NEPALI-TO-ENGLISH TRANSLATION & L1 INTERFERENCE LAB
// ============================================================================
const SOV_SVO_REORDER_DRILLS = [
  {
    id: 'sov-1',
    nepaliSentence: 'इमानदार प्लम्बरले बुधबार बिहान भान्साको पाइप मर्मत गर्यो।',
    nepaliSOVBreakdown: '[इमानदार प्लम्बरले (S)] + [बुधबार बिहान (Time)] + [भान्साको पाइप (O)] + [मर्मत गर्यो (V)]',
    scrambledChunks: ['the kitchen pipe', 'The honest plumber', 'on Wednesday morning', 'repaired'],
    correctOrder: ['The honest plumber', 'repaired', 'the kitchen pipe', 'on Wednesday morning'],
    explanation:
      'In Nepali (SOV), the verb "मर्मत गर्यो" comes at the very end. In English (SVO), the Verb ("repaired") must follow immediately after the Subject ("The honest plumber").',
  },
  {
    id: 'sov-2',
    nepaliSentence: 'हामीले बैंकका प्रबन्धकलाई हस्ताक्षर गरिएको रसिद बुझायौँ।',
    nepaliSOVBreakdown: '[हामीले (S)] + [बैंकका प्रबन्धकलाई (Indirect O)] + [हस्ताक्षर गरिएको रसिद (Direct O)] + [बुझायौँ (V)]',
    scrambledChunks: ['the signed receipt', 'to the bank manager', 'submitted', 'We'],
    correctOrder: ['We', 'submitted', 'the signed receipt', 'to the bank manager'],
    explanation:
      'Place the action verb ("submitted") right after the subject ("We"), followed by the direct object ("the signed receipt") and recipient ("to the bank manager").',
  },
  {
    id: 'sov-3',
    nepaliSentence: 'मनोविज्ञानका प्राध्यापकले विद्यार्थीहरूलाई मौन अक्षरका नियमहरू बुझाउनुभयो।',
    nepaliSOVBreakdown: '[प्राध्यापकले (S)] + [विद्यार्थीहरूलाई (O)] + [नियमहरू (O)] + [बुझाउनुभयो (V)]',
    scrambledChunks: [
      'explained',
      'to the students',
      'The psychology professor',
      'the silent-letter rules',
    ],
    correctOrder: [
      'The psychology professor',
      'explained',
      'the silent-letter rules',
      'to the students',
    ],
    explanation:
      'English uses "explained [something] to [someone]" in strict Subject + Verb + Object + Prepositional Phrase order.',
  },
  {
    id: 'sov-4',
    nepaliSentence: 'के तपाईं मलाई रेलवे स्टेशन कहाँ छ भन्न सक्नुहुन्छ?',
    nepaliSOVBreakdown: 'Embedded Indirect Question SVO Order',
    scrambledChunks: ['is?', 'where', 'Could you tell me', 'the railway station'],
    correctOrder: ['Could you tell me', 'where', 'the railway station', 'is?'],
    explanation:
      'In polite indirect questions ("Could you tell me..."), keep the embedded clause in SVO order ("where the railway station is"), NOT "where is the railway station".',
  },
];

const ARTICLE_MASTERY_DRILLS = [
  {
    id: 'art-1',
    sentenceWithBlank: 'Mr. Adhikari is ___ honest accountant who never hides a debt.',
    nepaliContext: 'अधिकारीजी एक इमानदार लेखापाल हुनुहुन्छ।',
    options: ['a', 'an', 'the', 'Ø (No article)'],
    correctAnswer: 'an',
    rule: 'Use "an" before "honest" (/ˈɒn.ɪst/) because the initial "h" is SILENT, so the word begins with a vowel sound (/ɒ/).',
  },
  {
    id: 'art-2',
    sentenceWithBlank: 'It takes about ___ hour to reach the castle from the valley.',
    nepaliContext: 'उपत्यकाबाट किल्ला पुग्न करिब एक घण्टा लाग्छ।',
    options: ['a', 'an', 'the', 'Ø (No article)'],
    correctAnswer: 'an',
    rule: 'Use "an" before "hour" (/aʊər/) because "h" is silent and the word starts with a vowel diphthong.',
  },
  {
    id: 'art-3',
    sentenceWithBlank: 'My sister studies psychology at ___ European university.',
    nepaliContext: 'मेरी बहिनी युरोपेली विश्वविद्यालयमा मनोविज्ञान पढ्छिन्।',
    options: ['a', 'an', 'the', 'Ø (No article)'],
    correctAnswer: 'a',
    rule: 'Even though "European" starts with the letter E, it is pronounced with a consonant /j/ ("Yoo-ro-pean") sound, so it takes "a", not "an"!',
  },
  {
    id: 'art-4',
    sentenceWithBlank: '___ knowledge of silent letters improves your English spelling rapidly.',
    nepaliContext: 'मौन अक्षरको ज्ञानले अंग्रेजी हिज्जे छिटो सुधार्छ। (General uncountable noun)',
    options: ['A', 'An', 'The', 'Ø (No article)'],
    correctAnswer: 'Ø (No article)',
    rule: 'Uncountable abstract nouns like "knowledge", "information", and "advice" do NOT take "a/an", and when used in a general sense or with "of", either zero article or specific "The" applies—never "a knowledge".',
  },
];

const PREPOSITION_TRAP_DRILLS = [
  {
    id: 'prep-1',
    nepaliPostposition: 'बुधबारमा (Day of the week · -मा)',
    sentenceWithBlank: 'The plumber promised to inspect the pipeline ___ Wednesday.',
    options: ['in', 'on', 'at', 'by'],
    correctAnswer: 'on',
    explanation:
      'Nepali uses "-मा" for months, days, and times. In English: use "ON" for specific days/dates (on Wednesday), "IN" for months/years (in October), and "AT" for clock times (at 9:00 AM).',
  },
  {
    id: 'prep-2',
    nepaliPostposition: 'आमासँग अनुहार मिल्छ (Resemble · -सँग)',
    sentenceWithBlank: 'The young heir closely resembles ___ his grandfather.',
    options: ['with', 'to', 'by', 'Ø (No preposition)'],
    correctAnswer: 'Ø (No preposition)',
    explanation:
      'In Nepali we say "हजुरबुवासँग मिल्छ", tempting learners to say "resembles with". In English, "resemble" is a transitive verb—no preposition is used!',
  },
  {
    id: 'prep-3',
    nepaliPostposition: 'बसद्वारा / बसमा यात्रा गर्नु (Mode of transport · -ले / -मा)',
    sentenceWithBlank: 'We travelled to Pokhara ___ tourist bus last autumn.',
    options: ['in', 'on', 'by', 'with'],
    correctAnswer: 'by',
    explanation:
      'Use "by + transport noun" without an article (by bus, by train, by plane) when describing how you travelled.',
  },
  {
    id: 'prep-4',
    nepaliPostposition: 'कुनै विषयको बारेमा छलफल गर्नु (Discuss · बारेमा)',
    sentenceWithBlank: 'The committee discussed ___ the new budget for two hours.',
    options: ['about', 'on', 'over', 'Ø (No preposition)'],
    correctAnswer: 'Ø (No preposition)',
    explanation:
      '"Discuss" already means "talk about". Never say "discussed about the budget"—say "discussed the budget".',
  },
];

const CONTINUOUS_OVERUSE_DRILLS = [
  {
    id: 'cont-1',
    nepaliThought: 'मसँग यो बिलको रसिद छ। (Possession state)',
    wrongHabit: '✗ “I am having the receipt for this bill.”',
    options: [
      'I have the receipt for this bill.',
      'I am having the receipt for this bill.',
      'I having the receipt for this bill.',
    ],
    correctAnswer: 'I have the receipt for this bill.',
    explanation:
      'Stative verbs of possession ("have", "own", "belong") use Simple Present ("I have"), not Present Continuous ("I am having"), when describing ownership.',
  },
  {
    id: 'cont-2',
    nepaliThought: 'मलाई यो शब्दको अर्थ थाहा छ। (Mental state)',
    wrongHabit: '✗ “I am knowing the meaning of this word.”',
    options: [
      'I know the meaning of this word.',
      'I am knowing the meaning of this word.',
      'I am know the meaning of this word.',
    ],
    correctAnswer: 'I know the meaning of this word.',
    explanation:
      '"Know", "understand", "believe", and "remember" are mental stative verbs—never use -ing with them in standard English.',
  },
  {
    id: 'cont-3',
    nepaliThought: 'म ५ वर्षदेखि काठमाडौँमा बस्दै छु। (Duration from past to now)',
    wrongHabit: '✗ “I am living in Kathmandu since five years.”',
    options: [
      'I have been living in Kathmandu for five years.',
      'I am living in Kathmandu since five years.',
      'I live in Kathmandu from five years.',
    ],
    correctAnswer: 'I have been living in Kathmandu for five years.',
    explanation:
      'When an action started in the past and continues now, use Present Perfect Continuous ("have been living") + "for" (duration of 5 years) or "since" (starting point like 2020).',
  },
];

// ============================================================================
// DATA FOR 10-MINUTE EXAM & CAREER READINESS SIMULATOR (IELTS / PTE / INTERVIEW)
// ============================================================================
interface ExamDiagnosticQuestion {
  id: string;
  section: 'listening' | 'proofreading' | 'grammar' | 'speaking';
  sectionLabel: string;
  prompt: string;
  nepaliHint: string;
  audioText?: string;
  options: string[];
  correctAnswer: string;
  recommendedLectureId: string;
  recommendedLectureTitle: string;
  explanation: string;
}

const EXAM_DIAGNOSTIC_QUESTIONS: ExamDiagnosticQuestion[] = [
  {
    id: 'ex-1',
    section: 'listening',
    sectionLabel: 'Section A · Listening & Orthography Dictation',
    prompt: 'Listen to the audio prompt and choose the exact spelling of the missing word: "Please keep your stamped ___ for tax records."',
    nepaliHint: 'कृपया कर रेकर्डको लागि छाप लगाइएको रसिद राख्नुहोस्।',
    audioText: 'Please keep your stamped receipt for tax records.',
    options: ['receipt', 'reciept', 'reseipt', 'recipt'],
    correctAnswer: 'receipt',
    recommendedLectureId: 'lecture-1-silent-consonants',
    recommendedLectureTitle: 'Lecture 01: Everyday Silent Consonants',
    explanation: 'Remember the "C + EI" rule (receive, ceiling, receipt) plus silent "p" before "t".',
  },
  {
    id: 'ex-2',
    section: 'listening',
    sectionLabel: 'Section A · Listening & Orthography Dictation',
    prompt: 'Listen and select the exact word spoken: "The bank approved our home ___ on Wednesday."',
    nepaliHint: 'बैंकले बुधबार हाम्रो घर धितो कर्जा स्वीकृत गर्यो।',
    audioText: 'The bank approved our home mortgage on Wednesday.',
    options: ['mortgage', 'morgage', 'mortgaje', 'morggage'],
    correctAnswer: 'mortgage',
    recommendedLectureId: 'lecture-5-vowel-clusters',
    recommendedLectureTitle: 'Lecture 05: Tricky Vowel Clusters & Finance',
    explanation: '"Mortgage" (/ˈmɔː.ɡɪdʒ/) has a silent "t" before "g".',
  },
  {
    id: 'ex-3',
    section: 'proofreading',
    sectionLabel: 'Section B · Silent-Letter Proofreading',
    prompt: 'Which sentence has 100% accurate English spelling for an official workplace email?',
    nepaliHint: 'कार्यालयको इमेलको लागि कुन वाक्यको हिज्जे पूर्ण रूपमा सही छ?',
    options: [
      'Our colleague scheduled the Wednesday meeting with the psychology department.',
      'Our collegue sceduled the Wensday meeting with the sychology department.',
      'Our colleague scheduled the Wednesdey meeting with the psycology department.',
      'Our coleague scheduled the Wednesday meeting with the psychology department.',
    ],
    correctAnswer: 'Our colleague scheduled the Wednesday meeting with the psychology department.',
    recommendedLectureId: 'lecture-9-academic-stems',
    recommendedLectureTitle: 'Lecture 09: Academic & Workplace Orthography',
    explanation: 'Watch out for silent "-ue" in colleague, "dn" in Wednesday, and "ps-" in psychology.',
  },
  {
    id: 'ex-4',
    section: 'proofreading',
    sectionLabel: 'Section B · Silent-Letter Proofreading',
    prompt: 'Spot the accurately spelled sentence describing an autumn travel itinerary:',
    nepaliHint: 'शरद ऋतुको यात्रा तालिका वर्णन गर्ने सही हिज्जे भएको वाक्य छान्नुहोस्:',
    options: [
      'In autumn, foreign tourists climb the ancient castle aisle.',
      'In autum, foriegn tourists clime the ancient casle aisle.',
      'In autumn, foreign tourists climb the ancient castle ile.',
      'In autunm, foreign tourists climb the ancient castel aisle.',
    ],
    correctAnswer: 'In autumn, foreign tourists climb the ancient castle aisle.',
    recommendedLectureId: 'lecture-2-nature-landmarks',
    recommendedLectureTitle: 'Lecture 02: Nature, Landmarks & Silent Consonants',
    explanation: 'Autumn (silent n), foreign (silent g), climb (silent b), castle (silent t), aisle (silent s).',
  },
  {
    id: 'ex-5',
    section: 'grammar',
    sectionLabel: 'Section C · L1 Grammar & SVO Syntax Check',
    prompt: 'Choose the grammatically natural sentence for an IELTS / Job Interview:',
    nepaliHint: 'अन्तर्वार्ताको लागि व्याकरणिक रूपमा प्राकृतिक वाक्य छान्नुहोस्:',
    options: [
      'I have been working in financial accounting for four years.',
      'I am working in financial accounting since four years.',
      'I am having four years experience in financial accounting.',
      'Since four years I work in financial accounting.',
    ],
    correctAnswer: 'I have been working in financial accounting for four years.',
    recommendedLectureId: 'lecture-4-time-tenses',
    recommendedLectureTitle: 'Lecture 04: Time Expressions & Perfect Tenses',
    explanation: 'Use Present Perfect Continuous ("have been working") + "for" with a duration of time.',
  },
  {
    id: 'ex-6',
    section: 'grammar',
    sectionLabel: 'Section C · L1 Grammar & SVO Syntax Check',
    prompt: 'Select the polite, grammatically accurate indirect question:',
    nepaliHint: 'शिष्ट र व्याकरणिक रूपमा सही अप्रत्यक्ष प्रश्न छान्नुहोस्:',
    options: [
      'Could you tell me when the interview panel will announce the results?',
      'Could you tell me when will the interview panel announce the results?',
      'Please tell me that when the interview panel announce result?',
      'Could you tell me about when is the result?',
    ],
    correctAnswer: 'Could you tell me when the interview panel will announce the results?',
    recommendedLectureId: 'lecture-7-polite-modals',
    recommendedLectureTitle: 'Lecture 07: Polite Modals & Indirect Questions',
    explanation: 'After "Could you tell me...", keep the embedded clause in statement SVO order ("when the panel will announce"), without inverting "will".',
  },
  {
    id: 'ex-7',
    section: 'speaking',
    sectionLabel: 'Section D · Career & Exam Spoken Response',
    prompt: 'Job Interview Prompt: "Tell me about a time you solved a difficult problem at work or school." Speak your answer with the mic or select the strongest C1 response:',
    nepaliHint: 'काम वा कलेजमा कुनै कठिन समस्या समाधान गरेको अनुभव बताउनुहोस्:',
    audioText: 'Last autumn, I noticed a subtle discrepancy in our project budget and calmly coordinated with my colleagues to resolve the debt ahead of schedule.',
    options: [
      'Last autumn, I noticed a subtle discrepancy in our project budget and calmly coordinated with my colleagues to resolve the debt ahead of schedule.',
      'According to me, last year problem came in budget and I discussed about it with friends.',
      'I am having good problem solving skill because I gave many exams in college.',
      'Yesterday I project budget checked and mistake fixed.',
    ],
    correctAnswer:
      'Last autumn, I noticed a subtle discrepancy in our project budget and calmly coordinated with my colleagues to resolve the debt ahead of schedule.',
    recommendedLectureId: 'lecture-10-executive-fluency',
    recommendedLectureTitle: 'Lecture 10: Professional & Executive Fluency',
    explanation: 'Uses clear past-tense SVO structure and high-value C1 vocabulary (subtle, discrepancy, budget, colleagues, debt, schedule).',
  },
  {
    id: 'ex-8',
    section: 'speaking',
    sectionLabel: 'Section D · Career & Exam Spoken Response',
    prompt: 'IELTS Speaking Part 3 Prompt: "Why is clear pronunciation important in international communication?" Speak the model response or choose the best structured answer:',
    nepaliHint: 'अन्तर्राष्ट्रिय सञ्चारमा स्पष्ट उच्चारण किन महत्त्वपूर्ण छ?',
    audioText: 'Clear pronunciation bridges the gap between written orthography and spoken fluency, ensuring that silent letters and connected speech never cause misunderstanding.',
    options: [
      'Clear pronunciation bridges the gap between written orthography and spoken fluency, ensuring that silent letters and connected speech never cause misunderstanding.',
      'Pronunciation is very good for talking with foreign peoples in abroad.',
      'If we are knowing silent letter, we are speaking very fastly.',
      'In my point of view, English spelling and sound is having big difference.',
    ],
    correctAnswer:
      'Clear pronunciation bridges the gap between written orthography and spoken fluency, ensuring that silent letters and connected speech never cause misunderstanding.',
    recommendedLectureId: 'lecture-12-rhetoric-mastery',
    recommendedLectureTitle: 'Lecture 12: C1 Rhetoric & Public Speaking Mastery',
    explanation: 'Uses strong academic collocations ("bridges the gap", "written orthography", "spoken fluency") free of L1 translation traps.',
  },
];

// ============================================================================
// DATA FOR FEATURE #7: INTERACTIVE WORD FAMILY & ROOT TREE EXPLORER
// ============================================================================
interface WordFamilyTree {
  id: string;
  rootWord: string;
  rootIpa: string;
  rootMeaning: string;
  silentLetter: string;
  silentBranch: {
    word: string;
    ipa: string;
    meaning: string;
    note: string;
  }[];
  awakeBranch: {
    word: string;
    ipa: string;
    meaning: string;
    note: string;
  }[];
}

const WORD_FAMILY_TREES: WordFamilyTree[] = [
  {
    id: 'tree-sign',
    rootWord: 'Sign',
    rootIpa: '/saɪn/',
    rootMeaning: 'सङ्केत / हस्ताक्षर गर्नु',
    silentLetter: 'G',
    silentBranch: [
      {
        word: 'Signer / Signing',
        ipa: '/ˈsaɪ.nɪŋ/',
        meaning: 'हस्ताक्षर गर्दै',
        note: 'With inflectional suffixes (-ing, -ed, -er), the "g" remains completely silent.',
      },
      {
        word: 'Design / Resign',
        ipa: '/dɪˈzaɪn/ · /rɪˈzaɪn/',
        meaning: 'ढाँचा / राजीनामा दिनु',
        note: 'At the end of the root syllable before "n", the "g" stays silent.',
      },
    ],
    awakeBranch: [
      {
        word: 'Signature',
        ipa: '/ˈsɪɡ.nə.tʃər/',
        meaning: 'हस्ताक्षर (सही)',
        note: 'The silent "g" WAKES UP as /ɡ/ ("SIG-nuh-chur") and the vowel shortens from /aɪ/ to /ɪ/!',
      },
      {
        word: 'Signal / Signify',
        ipa: '/ˈsɪɡ.nəl/ · /ˈsɪɡ.nɪ.faɪ/',
        meaning: 'सङ्केत / जनाउनु',
        note: 'The "g" closes the first syllable (/sɪɡ/) and is clearly pronounced!',
      },
      {
        word: 'Resignation',
        ipa: '/ˌrez.ɪɡˈneɪ.ʃən/',
        meaning: 'राजीनामा पत्र',
        note: 'From "resign" (/rɪˈzaɪn/) → "resignation" (/ˌrez.ɪɡˈneɪ.ʃən/) where /ɡ/ wakes up!',
      },
    ],
  },
  {
    id: 'tree-doubt',
    rootWord: 'Doubt',
    rootIpa: '/daʊt/',
    rootMeaning: 'शङ्का / सन्देह',
    silentLetter: 'B',
    silentBranch: [
      {
        word: 'Doubtful / Doubtless',
        ipa: '/ˈdaʊt.fəl/',
        meaning: 'शङ्कास्पद / निस्सन्देह',
        note: 'With Germanic suffixes (-ful, -less, -ed), the "b" remains silent.',
      },
      {
        word: 'Undoubtedly',
        ipa: '/ʌnˈdaʊ.tɪd.li/',
        meaning: 'निस्सन्देह रूपमा',
        note: 'Keep the "b" silent even in this 4-syllable adverb.',
      },
    ],
    awakeBranch: [
      {
        word: 'Dubious',
        ipa: '/ˈdjuː.bi.əs/',
        meaning: 'शङ्कास्पद / अनिश्चित',
        note: 'In the Latinate adjective "dubious", the "b" wakes up and is pronounced clearly as /b/!',
      },
      {
        word: 'Indubitable',
        ipa: '/ɪnˈdjuː.bɪ.tə.bəl/',
        meaning: 'शङ्का गर्न नसकिने / निर्विवाद',
        note: 'The Latin root "dubit-" pronounces the /b/ clearly.',
      },
    ],
  },
  {
    id: 'tree-muscle',
    rootWord: 'Muscle',
    rootIpa: '/ˈmʌs.əl/',
    rootMeaning: 'मांसपेशी',
    silentLetter: 'C',
    silentBranch: [
      {
        word: 'Muscles / Muscled',
        ipa: '/ˈmʌs.əlz/',
        meaning: 'मांसपेशीहरू',
        note: 'In plural and past forms, the "c" after "s" stays silent.',
      },
    ],
    awakeBranch: [
      {
        word: 'Muscular',
        ipa: '/ˈmʌs.kjə.lər/',
        meaning: 'गठिलो / मांसपेशी बलियो भएको',
        note: 'When "-ar" is added, the silent "c" WAKES UP as a hard /k/ sound ("MUS-kyuh-lur")!',
      },
      {
        word: 'Musculature',
        ipa: '/ˈmʌs.kjə.lə.tʃər/',
        meaning: 'शरीरको मांसपेशी प्रणाली',
        note: 'Pronounced with a clear /k/ sound in the second syllable.',
      },
    ],
  },
  {
    id: 'tree-autumn',
    rootWord: 'Autumn / Column / Condemn',
    rootIpa: '/ˈɔː.təm/ · /ˈkɒl.əm/ · /kənˈdem/',
    rootMeaning: 'शरद ऋतु / स्तम्भ / निन्दा गर्नु',
    silentLetter: 'N',
    silentBranch: [
      {
        word: 'Autumn / Condemning',
        ipa: '/ˈɔː.təm/ · /kənˈdem.ɪŋ/',
        meaning: 'शरद ऋतु / निन्दा गर्दै',
        note: 'Word-finally after "m" (and before -ing/-ed), the "n" is completely silent.',
      },
    ],
    awakeBranch: [
      {
        word: 'Autumnal',
        ipa: '/ɔːˈtʌm.nəl/',
        meaning: 'शरद ऋतुको (शरदकालीन)',
        note: 'When "-al" is added, the silent "n" WAKES UP to start the final syllable (/nəl/)!',
      },
      {
        word: 'Columnist',
        ipa: '/ˈkɒl.əm.nɪst/',
        meaning: 'स्तम्भकार (पत्रिकाको लेखक)',
        note: 'The "n" wakes up before "-ist" (/ˈkɒl.əm.nɪst/).',
      },
      {
        word: 'Condemnation',
        ipa: '/ˌkɒn.demˈneɪ.ʃən/',
        meaning: 'कडाइका साथ गरिएको निन्दा',
        note: 'The silent "n" in "condemn" wakes up loudly in "condem-NA-tion"!',
      },
    ],
  },
];

// ============================================================================
// DATA FOR FEATURE #8: REAL-WORLD SITUATION ROLE-PLAY SIMULATOR
// ============================================================================
interface RolePlayTurn {
  speaker: string;
  interlocutorLine: string;
  nepaliTranslation: string;
  choices: {
    text: string;
    quality: 'best' | 'trap' | 'awkward';
    feedback: string;
  }[];
}

interface RolePlayScenario {
  id: string;
  title: string;
  setting: string;
  level: string;
  turns: RolePlayTurn[];
}

const ROLEPLAY_SCENARIOS: RolePlayScenario[] = [
  {
    id: 'rp-job-interview',
    title: 'Scenario 01: Professional Job Interview in Kathmandu',
    setting: 'Polite indirect questions, SVO order, and silent-letter workplace terms',
    level: 'B2 / C1 Professional',
    turns: [
      {
        speaker: 'Hiring Director (Ms. Thapa)',
        interlocutorLine:
          'Good morning! Welcome to our panel. Could you briefly introduce your background in project budgeting?',
        nepaliTranslation:
          'शुभ प्रभात! हाम्रो प्यानलमा स्वागत छ। के तपाईं परियोजना बजेटिङमा आफ्नो अनुभव संक्षिप्तमा बताउन सक्नुहुन्छ?',
        choices: [
          {
            text: 'Thank you for having me. Over the past three years, I have managed annual budgets and maintained accurate financial ledgers.',
            quality: 'best',
            feedback:
              'Excellent! Present perfect ("I have managed") + clear SVO order + accurate workplace vocabulary ("budgets", "ledgers").',
          },
          {
            text: 'Myself Ramesh. We discussed about many budgets in my previous office.',
            quality: 'trap',
            feedback:
              'Watch out for two Nepali/South Asian interference traps: never start with "Myself [Name]", and never use "about" after "discussed".',
          },
          {
            text: 'Yes, I budget work did for three years in company.',
            quality: 'awkward',
            feedback:
              'This uses Nepali SOV word order ("budget work did"). In English, place the verb immediately after the subject: "I managed budgets".',
          },
        ],
      },
      {
        speaker: 'Hiring Director (Ms. Thapa)',
        interlocutorLine:
          'That sounds impressive. Do you have any questions for us about the Wednesday onboarding schedule?',
        nepaliTranslation:
          'त्यो प्रभावशाली छ। के तपाईंसँग बुधबारको अनबोर्डिङ तालिकाको बारेमा हामीलाई सोध्नुपर्ने कुनै प्रश्न छ?',
        choices: [
          {
            text: 'Could you please let me know what time the Wednesday orientation begins and whom I should report to?',
            quality: 'best',
            feedback:
              'Spot-on! You used a polite indirect question ("Could you please let me know what time the orientation begins...") with embedded SVO statement order.',
          },
          {
            text: 'Could you tell me what time does the Wednesday orientation begin?',
            quality: 'trap',
            feedback:
              'Classic indirect-question trap! Inside "Could you tell me...", drop "does" and keep statement order: "...what time the orientation begins".',
          },
          {
            text: 'Tell me when is Wednesday schedule starting.',
            quality: 'awkward',
            feedback:
              'Imperative "Tell me..." sounds too abrupt in a formal interview. Use "Could you please let me know...".',
          },
        ],
      },
    ],
  },
  {
    id: 'rp-bank-receipt',
    title: 'Scenario 02: Bank Mortgage & Receipt Verification',
    setting: 'Financial terminology (mortgage, receipt, debt, subtle) and polite requests',
    level: 'B1 / B2 Everyday Banking',
    turns: [
      {
        speaker: 'Bank Officer (Mr. Gurung)',
        interlocutorLine:
          'Good afternoon! How may I assist you with your housing mortgage account today?',
        nepaliTranslation:
          'शुभ प्रभात/नमस्कार! आज म तपाईंको आवास धितो कर्जा (mortgage) खाताको बारेमा कसरी मद्दत गर्न सक्छु?',
        choices: [
          {
            text: 'Good afternoon. I made my monthly mortgage payment yesterday, and I would like to request an official receipt.',
            quality: 'best',
            feedback:
              'Perfect! Polite phrasing ("I would like to request...") and accurate use of "mortgage" (/ˈmɔː.ɡɪdʒ/) and "receipt" (/rɪˈsiːt/).',
          },
          {
            text: 'Please return back my mortgage receipt paper now.',
            quality: 'trap',
            feedback:
              'Avoid the redundant phrase "return back", and use polite modal verbs ("Could I please get..." or "I would like to request...").',
          },
          {
            text: 'Yesterday I money paid for debt, give receipt.',
            quality: 'awkward',
            feedback:
              'Use English SVO order ("I paid my installment yesterday") rather than SOV ("I money paid").',
          },
        ],
      },
      {
        speaker: 'Bank Officer (Mr. Gurung)',
        interlocutorLine:
          'Certainly! Here is your stamped receipt. Did you notice the subtle reduction in your interest rate this quarter?',
        nepaliTranslation:
          'पक्कै पनि! यहाँ तपाईंको छाप लगाइएको रसिद छ। के तपाईंले यस त्रैमासिकमा ब्याजदरमा भएको सूक्ष्म कटौती याद गर्नुभयो?',
        choices: [
          {
            text: 'Yes, without a doubt! That reduction will help our family clear the remaining debt ahead of schedule.',
            quality: 'best',
            feedback:
              'Outstanding fluency! You naturally used "doubt" (silent b), "debt" (silent b), and "schedule" in a clear sentence.',
          },
          {
            text: 'According to me, this interest rate is very good.',
            quality: 'trap',
            feedback:
              'Remember: avoid "According to me". Say "In my opinion" or "I am glad to see that reduction".',
          },
          {
            text: 'Yes, I am having happiness about the budget.',
            quality: 'awkward',
            feedback:
              'Instead of "I am having happiness", say "I am very pleased with the rate reduction".',
          },
        ],
      },
    ],
  },
];

export const PracticeArenaView: React.FC<PracticeArenaViewProps> = ({
  lectures,
  savedWordIds = [],
  customWords,
  mistakeNotebook,
  sprintHighScore,
  detectiveSolvedIds,
  rolePlayCompletedIds,
  preferredSpeechRate,
  languageMode,
  initialToolTab = 'detective',
  onAddCustomWord,
  onRemoveCustomWord,
  onRecordSprintScore,
  onRecordDetectiveSolved,
  onRecordRolePlayCompleted,
  onRecordMistake,
  onRecordExamResult,
  onOpenLecture,
  onOpenDailyChallenge,
}) => {
  const [activeTool, setActiveTool] = useState<ArenaToolTab>(initialToolTab);

  // Sync if initialToolTab prop changes
  useEffect(() => {
    if (initialToolTab) {
      setActiveTool(initialToolTab);
    }
  }, [initialToolTab]);

  // --- Feature #2 State: Silent-Letter Detective ---
  const [detectivePassageIdx, setDetectivePassageIdx] = useState(0);
  const [foundSilentTokenIndices, setFoundSilentTokenIndices] = useState<number[]>([]);
  const [wrongTokenIndices, setWrongTokenIndices] = useState<number[]>([]);
  const [selectedTokenDetail, setSelectedTokenDetail] = useState<{
    word: string;
    ipa?: string;
    rule?: string;
    nepali?: string;
  } | null>(null);

  // --- Feature #3 State: Confusables Arena ---
  const [confusableAnswers, setConfusableAnswers] = useState<Record<string, string>>({});

  // --- Feature #4 State: Nepali-to-English Translation & L1 Interference Lab ---
  const [interferenceSubTab, setInterferenceSubTab] = useState<
    'sov-svo' | 'articles' | 'prepositions' | 'continuous-traps'
  >('sov-svo');
  const [sovPlacedChunks, setSovPlacedChunks] = useState<Record<string, string[]>>({});
  const [articleAnswers, setArticleAnswers] = useState<Record<string, string>>({});
  const [prepositionAnswers, setPrepositionAnswers] = useState<Record<string, string>>({});
  const [continuousAnswers, setContinuousAnswers] = useState<Record<string, string>>({});
  const [interferenceAnswers, setInterferenceAnswers] = useState<Record<string, string>>({});

  // --- Feature #5 State: Connected Speech Decoder ---
  const [connectedAnswers, setConnectedAnswers] = useState<Record<string, string>>({});

  // --- Feature #6 State: 60-Second Spelling Sprint + Difficulty Tiers ---
  const [sprintTier, setSprintTier] = useState<'ALL' | 'B1' | 'B2' | 'C1' | 'MISTAKES'>('ALL');
  const [sprintRunning, setSprintRunning] = useState(false);
  const [sprintSecondsLeft, setSprintSecondsLeft] = useState(60);
  const [sprintScore, setSprintScore] = useState(0);
  const [sprintCombo, setSprintCombo] = useState(0);
  const [sprintIdx, setSprintIdx] = useState(0);
  const [sprintFeedback, setSprintFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [sprintFinished, setSprintFinished] = useState(false);

  // --- Feature #7 State: Word Family Tree Explorer ---
  const [selectedTreeId, setSelectedTreeId] = useState(WORD_FAMILY_TREES[0].id);

  // --- Feature #8 State: Role-Play Simulator + Voice Input Mic + Branching Rapport Meter ---
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [rolePlayTurnIdx, setRolePlayTurnIdx] = useState(0);
  const [selectedRolePlayChoice, setSelectedRolePlayChoice] = useState<number | null>(null);
  const [rolePlayListening, setRolePlayListening] = useState(false);
  const [rolePlayVoiceResult, setRolePlayVoiceResult] = useState<PronunciationResult | null>(null);
  const [rolePlayMicError, setRolePlayMicError] = useState<string | null>(null);
  const [rolePlayRapportScore, setRolePlayRapportScore] = useState<number>(80);
  const [rolePlayPolitenessHistory, setRolePlayPolitenessHistory] = useState<
    ('best' | 'acceptable' | 'blunt')[]
  >([]);

  // --- Feature #9 State: Custom Study Deck Builder ---
  const [newWordInput, setNewWordInput] = useState('');
  const [newIpaInput, setNewIpaInput] = useState('');
  const [newPosInput, setNewPosInput] = useState('noun');
  const [newSilentRuleInput, setNewSilentRuleInput] = useState('');
  const [newNepaliInput, setNewNepaliInput] = useState('');
  const [newExampleInput, setNewExampleInput] = useState('');
  const [newDeckTagInput, setNewDeckTagInput] = useState('Personal Study Deck');
  const [customFlashcardIdx, setCustomFlashcardIdx] = useState(0);
  const [customCardFlipped, setCustomCardFlipped] = useState(false);

  // --- Feature #11 State: Shadowing Studio ---
  const [shadowLectureIdx, setShadowLectureIdx] = useState(0);
  const [shadowLineIdx, setShadowLineIdx] = useState(0);
  const [shadowPhase, setShadowPhase] = useState<
    'idle' | 'playing-slow' | 'user-repeat-pause' | 'playing-natural'
  >('idle');
  const [shadowCountdown, setShadowCountdown] = useState(3);

  // --- Feature #12 + Vocab List State ---
  const [cheatSheetTab, setCheatSheetTab] = useState<
    'vocab-table' | 'silent-rules' | 'svo-formulas' | 'mistakes-print'
  >('vocab-table');
  const [vocabTableSearch, setVocabTableSearch] = useState('');
  const [vocabTableLectureFilter, setVocabTableLectureFilter] = useState<number | 'ALL'>('ALL');

  // --- Tool 11 State: Timed 10-Min IELTS / PTE / Job Interview Exam Simulator ---
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [examSecondsLeft, setExamSecondsLeft] = useState(600); // 10 minutes
  const [examQuestionIdx, setExamQuestionIdx] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [examMicListening, setExamMicListening] = useState(false);
  const [examMicResult, setExamMicResult] = useState<PronunciationResult | null>(null);

  // --- Tool 12 State: Hands-Free Commuter Audio Mode (Podcast Player) ---
  const [commuterPlaying, setCommuterPlaying] = useState(false);
  const [commuterSource, setCommuterSource] = useState<'lecture' | 'saved' | 'mistakes'>('lecture');
  const [commuterLectureNum, setCommuterLectureNum] = useState<number>(1);
  const [commuterTrackIdx, setCommuterTrackIdx] = useState(0);
  const [commuterPhase, setCommuterPhase] = useState<
    'idle' | 'word-1x' | 'pause-2s' | 'word-075x' | 'sentence'
  >('idle');
  const commuterCancelRef = useRef(false);

  const isFullNepali = languageMode === 'full-nepali';

  // Core + Curated vocabulary list for the Master Vocabulary Sheet
  const curatedVocabularyList = useMemo(() => {
    const all = getMassiveLexicon(lectures);
    // Filter to core + curated root seeds (first ~320 high-value entries)
    return all.filter((w) => w.isCoreLessonWord || w.id.startsWith('lex-root-'));
  }, [lectures]);

  const filteredVocabSheet = useMemo(() => {
    const q = vocabTableSearch.toLowerCase().trim();
    return curatedVocabularyList.filter((item) => {
      if (vocabTableLectureFilter !== 'ALL' && item.lectureNumber !== vocabTableLectureFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.word.toLowerCase().includes(q) ||
        item.nepaliMeaning.toLowerCase().includes(q) ||
        item.silentLettersSummary.toLowerCase().includes(q) ||
        item.ipa.toLowerCase().includes(q)
      );
    });
  }, [curatedVocabularyList, vocabTableSearch, vocabTableLectureFilter]);

  // 60-Second Sprint Countdown Effect
  useEffect(() => {
    if (!sprintRunning) return;
    if (sprintSecondsLeft <= 0) {
      setSprintRunning(false);
      setSprintFinished(true);
      onRecordSprintScore(sprintScore);
      return;
    }
    const timer = window.setTimeout(() => {
      setSprintSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [sprintRunning, sprintSecondsLeft, sprintScore, onRecordSprintScore]);

  // Automated Shadowing Loop Effect
  const activeShadowLecture = lectures[shadowLectureIdx] || lectures[0];
  const shadowLines = activeShadowLecture?.moduleE_dialogue?.lines || [];
  const currentShadowLine = shadowLines[shadowLineIdx] || shadowLines[0];

  useEffect(() => {
    if (shadowPhase === 'idle' || !currentShadowLine) return;

    let cancelled = false;
    let timerId: number | undefined;

    if (shadowPhase === 'playing-slow') {
      speechService.speak(currentShadowLine.english, {
        rate: 0.75,
        onEnd: () => {
          if (cancelled) return;
          setShadowCountdown(3);
          setShadowPhase('user-repeat-pause');
        },
      });
    } else if (shadowPhase === 'user-repeat-pause') {
      if (shadowCountdown > 0) {
        timerId = window.setTimeout(() => {
          if (!cancelled) setShadowCountdown((c) => c - 1);
        }, 1000);
      } else {
        setShadowPhase('playing-natural');
      }
    } else if (shadowPhase === 'playing-natural') {
      speechService.speak(currentShadowLine.english, {
        rate: 1.0,
        onEnd: () => {
          if (cancelled) return;
          timerId = window.setTimeout(() => {
            if (cancelled) return;
            if (shadowLineIdx + 1 < shadowLines.length) {
              setShadowLineIdx((idx) => idx + 1);
              setShadowPhase('playing-slow');
            } else {
              setShadowPhase('idle');
            }
          }, 600);
        },
      });
    }

    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
    };
  }, [shadowPhase, shadowCountdown, currentShadowLine, shadowLineIdx, shadowLines.length]);

  const currentPassage = DETECTIVE_PASSAGES[detectivePassageIdx] || DETECTIVE_PASSAGES[0];
  const totalSilentInPassage = currentPassage.tokens.filter((t) => t.isSilentTarget).length;

  const handleTapDetectiveToken = (idx: number) => {
    const token = currentPassage.tokens[idx];
    if (!token) return;

    if (token.isSilentTarget) {
      speechService.speak(token.cleanWord, { rate: preferredSpeechRate });
      setSelectedTokenDetail({
        word: token.cleanWord,
        ipa: token.ipa,
        rule: token.silentRule,
        nepali: token.nepali,
      });
      if (!foundSilentTokenIndices.includes(idx)) {
        const updated = [...foundSilentTokenIndices, idx];
        setFoundSilentTokenIndices(updated);
        if (updated.length === totalSilentInPassage) {
          onRecordDetectiveSolved(currentPassage.id);
        }
      }
    } else {
      if (!wrongTokenIndices.includes(idx)) {
        setWrongTokenIndices((prev) => [...prev, idx]);
      }
    }
  };

  // Active Sprint Pool filtered by CEFR Tier or Mistake Notebook
  const activeSprintPool = useMemo(() => {
    if (sprintTier === 'MISTAKES' && mistakeNotebook.length > 0) {
      const mistakeSet = new Set(mistakeNotebook.map((m) => m.correctAnswer.trim().toLowerCase()));
      const matched = SPRINT_CHALLENGE_POOL.filter((item) =>
        mistakeSet.has(item.word.toLowerCase())
      );
      if (matched.length > 0) return matched;
    }
    if (sprintTier === 'B1' || sprintTier === 'B2' || sprintTier === 'C1') {
      const filtered = SPRINT_CHALLENGE_POOL.filter((item) => item.level === sprintTier);
      return filtered.length > 0 ? filtered : SPRINT_CHALLENGE_POOL;
    }
    return SPRINT_CHALLENGE_POOL;
  }, [sprintTier, mistakeNotebook]);

  const handleStartSprint = () => {
    setSprintScore(0);
    setSprintCombo(0);
    setSprintSecondsLeft(60);
    setSprintIdx(0);
    setSprintFeedback(null);
    setSprintFinished(false);
    setSprintRunning(true);
    const firstWord = activeSprintPool[0];
    if (firstWord) {
      speechService.speak(firstWord.word, { rate: preferredSpeechRate });
    }
  };

  const handleAnswerSprint = (choice: string) => {
    if (!sprintRunning || sprintFeedback) return;
    const item = activeSprintPool[sprintIdx % activeSprintPool.length];
    const isCorrect = choice === item.correctCluster;

    if (isCorrect) {
      const nextCombo = sprintCombo + 1;
      const points = 10 + Math.min(20, nextCombo * 2);
      setSprintScore((s) => s + points);
      setSprintCombo(nextCombo);
      setSprintFeedback('correct');
    } else {
      setSprintCombo(0);
      setSprintFeedback('wrong');
      onRecordMistake({
        lectureId: lectures[0]?.id || 'lecture-1-silent-consonants',
        lectureNumber: 1,
        category: 'spelling',
        sourceType: 'spelling',
        prompt: `60s Phonics Sprint: Complete the silent cluster in "${item.maskedDisplay}" (${item.nepali})`,
        nepaliHint: `${item.ipa} · ${item.rule}`,
        userWrongAnswer: choice,
        correctAnswer: item.word,
        explanation: `Correct spelling: "${item.word}" (${item.ipa}) — ${item.rule}.`,
      });
    }

    window.setTimeout(() => {
      const nextIndex = sprintIdx + 1;
      setSprintIdx(nextIndex);
      setSprintFeedback(null);
      const nextItem = activeSprintPool[nextIndex % activeSprintPool.length];
      if (nextItem) {
        speechService.speak(nextItem.word, { rate: preferredSpeechRate });
      }
    }, 380);
  };

  // 10-Minute Exam Simulator Timer Effect
  useEffect(() => {
    if (!examStarted || examFinished) return;
    if (examSecondsLeft <= 0) {
      handleFinishExam();
      return;
    }
    const timer = window.setTimeout(() => {
      setExamSecondsLeft((s) => s - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [examStarted, examFinished, examSecondsLeft]);

  const handleFinishExam = () => {
    setExamStarted(false);
    setExamFinished(true);
    const listeningScore = EXAM_DIAGNOSTIC_QUESTIONS.filter(
      (q) => q.section === 'listening' && examAnswers[q.id] === q.correctAnswer
    ).length;
    const proofreadingScore = EXAM_DIAGNOSTIC_QUESTIONS.filter(
      (q) => q.section === 'proofreading' && examAnswers[q.id] === q.correctAnswer
    ).length;
    const grammarScore = EXAM_DIAGNOSTIC_QUESTIONS.filter(
      (q) => q.section === 'grammar' && examAnswers[q.id] === q.correctAnswer
    ).length;
    const speakingScore = EXAM_DIAGNOSTIC_QUESTIONS.filter(
      (q) => q.section === 'speaking' && examAnswers[q.id] === q.correctAnswer
    ).length;
    const totalCorrect = listeningScore + proofreadingScore + grammarScore + speakingScore;
    const overallScore = Math.round((totalCorrect / EXAM_DIAGNOSTIC_QUESTIONS.length) * 100);
    const estimatedBand =
      overallScore >= 85
        ? 'C1 · IELTS Band 7.5–8.0'
        : overallScore >= 65
        ? 'B2 · IELTS Band 6.5–7.0'
        : 'B1 · IELTS Band 5.5–6.0';

    if (onRecordExamResult) {
      onRecordExamResult({
        overallScore,
        estimatedBand,
        listeningScore: Math.round((listeningScore / 2) * 100),
        proofreadingScore: Math.round((proofreadingScore / 2) * 100),
        grammarScore: Math.round((grammarScore / 2) * 100),
        speakingScore: Math.round((speakingScore / 2) * 100),
      });
    }
  };

  // Commuter Audio Mode Playlist & Loop Effect
  const commuterTracks = useMemo(() => {
    const all = getMassiveLexicon(lectures);
    if (commuterSource === 'saved') {
      const saved = all.filter((w) => savedWordIds.includes(w.id));
      return saved.length > 0 ? saved : all.filter((w) => w.isCoreLessonWord);
    }
    if (commuterSource === 'mistakes') {
      const targets = new Set(mistakeNotebook.map((m) => m.correctAnswer.trim().toLowerCase()));
      const matched = all.filter((w) => targets.has(w.word.toLowerCase()));
      return matched.length > 0 ? matched : all.filter((w) => w.isCoreLessonWord);
    }
    return all.filter((w) => w.lectureNumber === commuterLectureNum && w.isCoreLessonWord);
  }, [commuterSource, commuterLectureNum, lectures, savedWordIds, mistakeNotebook]);

  const currentCommuterTrack =
    commuterTracks[commuterTrackIdx % Math.max(1, commuterTracks.length)] || null;

  useEffect(() => {
    if (!commuterPlaying || !currentCommuterTrack) {
      setCommuterPhase('idle');
      return;
    }
    commuterCancelRef.current = false;
    let pauseTimer: number | null = null;
    let nextTimer: number | null = null;

    setCommuterPhase('word-1x');
    speechService.speak(currentCommuterTrack.word, {
      rate: 1.0,
      onEnd: () => {
        if (commuterCancelRef.current) return;
        setCommuterPhase('pause-2s');
        pauseTimer = window.setTimeout(() => {
          if (commuterCancelRef.current) return;
          setCommuterPhase('word-075x');
          speechService.speak(currentCommuterTrack.word, {
            rate: 0.75,
            onEnd: () => {
              if (commuterCancelRef.current) return;
              setCommuterPhase('sentence');
              speechService.speak(currentCommuterTrack.englishExample, {
                rate: preferredSpeechRate,
                onEnd: () => {
                  if (commuterCancelRef.current) return;
                  nextTimer = window.setTimeout(() => {
                    if (!commuterCancelRef.current) {
                      setCommuterTrackIdx((prev) => (prev + 1) % Math.max(1, commuterTracks.length));
                    }
                  }, 900);
                },
              });
            },
          });
        }, 2000);
      },
    });

    return () => {
      commuterCancelRef.current = true;
      if (pauseTimer) window.clearTimeout(pauseTimer);
      if (nextTimer) window.clearTimeout(nextTimer);
      speechService.stop();
    };
  }, [commuterPlaying, commuterTrackIdx, currentCommuterTrack, commuterTracks.length, preferredSpeechRate]);

  const handleCreateCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordInput.trim() || !newNepaliInput.trim()) return;
    onAddCustomWord({
      word: newWordInput.trim(),
      ipa: newIpaInput.trim() || `/${newWordInput.trim().toLowerCase()}/`,
      partOfSpeech: newPosInput,
      silentLettersSummary: newSilentRuleInput.trim() || 'Custom study vocabulary',
      nepaliMeaning: newNepaliInput.trim(),
      englishExample:
        newExampleInput.trim() ||
        `We practiced using the word "${newWordInput.trim()}" in conversation.`,
      deckTag: newDeckTagInput.trim() || 'Personal Study Deck',
    });
    setNewWordInput('');
    setNewIpaInput('');
    setNewSilentRuleInput('');
    setNewNepaliInput('');
    setNewExampleInput('');
  };

  const currentSprintItem = activeSprintPool[sprintIdx % activeSprintPool.length];
  const currentWordTree =
    WORD_FAMILY_TREES.find((t) => t.id === selectedTreeId) || WORD_FAMILY_TREES[0];
  const currentScenario = ROLEPLAY_SCENARIOS[activeScenarioIdx] || ROLEPLAY_SCENARIOS[0];
  const currentRolePlayTurn =
    currentScenario.turns[rolePlayTurnIdx] || currentScenario.turns[0];

  const handleSpeakRolePlayResponse = async () => {
    setRolePlayMicError(null);
    if (!speechService.isRecognitionSupported()) {
      setRolePlayMicError(
        'Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'
      );
      return;
    }
    const bestIdx = currentRolePlayTurn.choices.findIndex((c) => c.quality === 'best');
    const bestOption = currentRolePlayTurn.choices[bestIdx] || currentRolePlayTurn.choices[0];
    try {
      const res = await speechService.evaluatePronunciation(bestOption.text, (listening) => {
        setRolePlayListening(listening);
      });
      setRolePlayVoiceResult(res);
      if (res.score >= 50 && bestIdx !== -1) {
        setSelectedRolePlayChoice(bestIdx);
        if (rolePlayTurnIdx + 1 === currentScenario.turns.length) {
          onRecordRolePlayCompleted(currentScenario.id);
        }
      }
    } catch (err: unknown) {
      setRolePlayListening(false);
      setRolePlayMicError(err instanceof Error ? err.message : 'Microphone error.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6">
      {/* Page Header + Quick Daily Challenge Launch Button */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[#E7E0D6] dark:border-[#2E2924]">
        <div>
          <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171] mb-1">
            Interactive Fluency, Translation & Exam Readiness Hub · 12 Specialized Studios
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
            Practice Arena, L1 Translation Lab, 10-Min Exam Simulator & Commuter Audio
          </h1>
          <p className="text-sm sm:text-base text-[#57534E] dark:text-[#A8A29E] mt-1">
            Train with the Nepali-to-English Translation Lab, Timed 10-Min IELTS/PTE/Interview Simulator, Hands-Free Commuter Audio Podcast Player, Role-Play Voice Simulator, and 60s Phonics Sprint.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              speechService.stop();
              setCommuterPlaying(false);
              setActiveTool('shadowing');
            }}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Activity className="w-4 h-4 text-[#D97706]" />
            <span>Audio Shadowing Trainer (Waveform)</span>
          </button>

          <button
            type="button"
            onClick={onOpenDailyChallenge}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold hover:bg-[#991B1B] inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Daily 3-Question Challenge</span>
          </button>
        </div>
      </div>

      {/* Enhancement #2: Cross-Linked Mistake Notebook "Fix My Weakest 5 Patterns" Banner */}
      {mistakeNotebook.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#D97706]/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
          <div className="space-y-1">
            <div className="text-xs font-bold text-[#B91C1C] dark:text-amber-400">
              Smart Remedial Cross-Link · {mistakeNotebook.length} Active Items in Mistake Notebook
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#1C1917] dark:text-[#F5F2EB]">
              Fix Your Weakest 5 Patterns Across Specialized Practice Studios
            </h2>
            <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
              Top recent targets:{' '}
              {mistakeNotebook
                .slice(0, 5)
                .map((m) => `“${m.correctAnswer}”`)
                .join(' · ')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSprintTier('MISTAKES');
                setActiveTool('sprint');
              }}
              className="px-3.5 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-bold hover:bg-red-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              Drill Mistakes in 60s Sprint
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('writing-linter')}
              className="px-3.5 py-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
            >
              Open Writing Linter
            </button>
            <button
              type="button"
              onClick={() => {
                setCommuterSource('mistakes');
                setActiveTool('commuter-audio');
              }}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-bold text-[#1C1917] dark:text-[#F5F2EB] cursor-pointer whitespace-nowrap"
            >
              Loop Mistakes in Commuter Audio
            </button>
          </div>
        </div>
      )}

      {/* 16-Tool Navigation Bar */}
      <div className="p-2 rounded-2xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] flex flex-wrap items-center gap-1.5 print:hidden">
        {(
          [
            { id: 'detective', label: '1. Silent-Letter Detective' },
            { id: 'confusables', label: '2. Confusables & Homophones' },
            { id: 'interference', label: '3. Nepali-to-English Translation Lab' },
            { id: 'connected-speech', label: '4. Connected Speech Decoder' },
            { id: 'sprint', label: '5. 60s Phonics Sprint' },
            { id: 'word-trees', label: '6. Word Family Root Trees' },
            { id: 'roleplay', label: '7. Role-Play Simulator (Voice)' },
            { id: 'shadowing', label: '8. Audio Shadowing Trainer (Waveform)' },
            { id: 'custom-deck', label: `9. Custom Deck (${customWords.length})` },
            { id: 'cheatsheets', label: '10. Master Vocab List & PDF Sheets' },
            { id: 'exam-simulator', label: '11. 10-Min Exam Simulator (IELTS/PTE)' },
            { id: 'commuter-audio', label: '12. Hands-Free Commuter Audio' },
            { id: 'minimal-pairs', label: '13. Minimal Pair Ear & Voice Lab' },
            { id: 'writing-linter', label: '14. Writing & Email Linter' },
            { id: 'articulation-guide', label: '15. IPA Mouth & Tongue Guide' },
            { id: 'dictation-studio', label: '16. Dictation Passage Studio' },
          ] as { id: ArenaToolTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              speechService.stop();
              setShadowPhase('idle');
              setCommuterPlaying(false);
              setActiveTool(tab.id);
            }}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTool === tab.id
                ? 'bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] shadow-xs'
                : 'bg-[#FAF7F2] dark:bg-[#141210] text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =================================================================== */}
      {/* TOOL 1 (FEATURE #2): SILENT-LETTER DETECTIVE HIGHLIGHTER GAME       */}
      {/* =================================================================== */}
      {activeTool === 'detective' && (
        <section className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D6] dark:border-[#2E2924]">
            <div>
              <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                Feature #2 · Interactive Orthography Reading Game
              </div>
              <h2 className="text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                Silent-Letter Detective — Tap Every Word with a Hidden Silent Letter!
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                Read the paragraph carefully and tap every word that contains a silent consonant or vowel. Finding a target word plays its pronunciation and reveals its phonics rule!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {DETECTIVE_PASSAGES.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setDetectivePassageIdx(idx);
                    setFoundSilentTokenIndices([]);
                    setWrongTokenIndices([]);
                    setSelectedTokenDetail(null);
                  }}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    detectivePassageIdx === idx
                      ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                      : 'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924]'
                  }`}
                >
                  Case 0{idx + 1} {detectiveSolvedIds.includes(p.id) ? '✓' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              {currentPassage.title} ({currentPassage.level})
            </span>
            <span className="font-ipa font-semibold text-[#B91C1C] dark:text-[#F87171]">
              Silent-Letter Words Found: {foundSilentTokenIndices.length} / {totalSilentInPassage}
            </span>
          </div>

          {/* Interactive Clickable Passage Box */}
          <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] leading-loose flex flex-wrap gap-2">
            {currentPassage.tokens.map((tok, idx) => {
              const isFound = foundSilentTokenIndices.includes(idx);
              const isWrong = wrongTokenIndices.includes(idx);
              let tokenClass =
                'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#B91C1C]';
              if (isFound) {
                tokenClass =
                  'bg-emerald-100 dark:bg-emerald-950/60 border-[#15803D] text-[#15803D] dark:text-emerald-300 font-bold ring-1 ring-[#15803D]';
              } else if (isWrong) {
                tokenClass =
                  'bg-stone-200/70 dark:bg-stone-800/60 border-stone-300 text-[#57534E] opacity-60';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleTapDetectiveToken(idx)}
                  className={`px-3 py-1.5 rounded-xl border text-base sm:text-lg transition-all ${tokenClass}`}
                >
                  {tok.text}
                </button>
              );
            })}
          </div>

          {/* Discovered Word Phonics Card */}
          {selectedTokenDetail && (
            <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                    “{selectedTokenDetail.word}”
                  </span>
                  <span className="font-ipa text-sm text-[#B91C1C] dark:text-[#F87171]">
                    {selectedTokenDetail.ipa}
                  </span>
                  {selectedTokenDetail.nepali && (
                    <span className="font-nepali text-sm font-semibold text-[#15803D] dark:text-emerald-400">
                      ({selectedTokenDetail.nepali})
                    </span>
                  )}
                </div>
                <div className="text-[#57534E] dark:text-[#A8A29E]">
                  <strong>Silent-Letter Rule:</strong> {selectedTokenDetail.rule}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    speechService.speak(selectedTokenDetail.word, { rate: preferredSpeechRate })
                  }
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>1.0x</span>
                </button>
                <button
                  type="button"
                  onClick={() => speechService.speak(selectedTokenDetail.word, { rate: 0.6 })}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Turtle className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>0.65x</span>
                </button>
              </div>
            </div>
          )}

          {foundSilentTokenIndices.length === totalSilentInPassage && (
            <div className="p-4 rounded-xl bg-[#15803D]/10 border border-[#15803D] text-xs sm:text-sm font-semibold text-[#15803D] dark:text-emerald-300 flex items-center justify-between">
              <span>
                🎉 Case Solved! You spotted all {totalSilentInPassage} silent-letter words in this passage!
              </span>
              <button
                type="button"
                onClick={() => {
                  const nextIdx = (detectivePassageIdx + 1) % DETECTIVE_PASSAGES.length;
                  setDetectivePassageIdx(nextIdx);
                  setFoundSilentTokenIndices([]);
                  setWrongTokenIndices([]);
                  setSelectedTokenDetail(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#15803D] text-white text-xs font-semibold"
              >
                Next Detective Case →
              </button>
            </div>
          )}
        </section>
      )}

      {/* =================================================================== */}
      {/* TOOL 2 (FEATURE #3): CONFUSABLE WORDS & HOMOPHONES ARENA            */}
      {/* =================================================================== */}
      {activeTool === 'confusables' && (
        <section className="space-y-4">
          <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6">
            <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
              Feature #3 · Homophones & Spelling Contrast Arena
            </div>
            <h2 className="text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
              Confusable Words & Silent-Letter Homophones Arena
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-1">
              These pairs sound identical (same IPA) because of silent letters or schwa vowels, but have completely different spellings and meanings. Compare them and solve the context check below each card:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {CONFUSABLE_PAIRS.map((pair) => {
              const userAns = confusableAnswers[pair.id];
              return (
                <div
                  key={pair.id}
                  className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-ipa font-semibold text-[#B91C1C] dark:text-[#F87171]">
                        Shared Sound: {pair.ipa}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          speechService.speak(`${pair.wordA}. ${pair.wordB}.`, {
                            rate: preferredSpeechRate,
                          })
                        }
                        className="min-h-[34px] px-3 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] font-semibold inline-flex items-center gap-1.5"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#B91C1C]" />
                        <span>Hear Both</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          w: pair.wordA,
                          rule: pair.ruleA,
                          m: pair.meaningA,
                          ex: pair.exampleA,
                        },
                        {
                          w: pair.wordB,
                          rule: pair.ruleB,
                          m: pair.meaningB,
                          ex: pair.exampleB,
                        },
                      ].map((side) => (
                        <div
                          key={side.w}
                          className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-1"
                        >
                          <div className="text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                            {side.w}
                          </div>
                          <div className="font-nepali text-xs font-semibold text-[#15803D] dark:text-emerald-400">
                            {side.m}
                          </div>
                          <div className="text-[11px] text-[#B91C1C] dark:text-[#F87171]">
                            {side.rule}
                          </div>
                          <div className="text-xs text-[#57534E] dark:text-[#A8A29E] pt-1">
                            “{side.ex}”
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Context Quiz */}
                  <div className="pt-3 border-t border-[#E7E0D6] dark:border-[#2E2924] space-y-2">
                    <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      Fill the Blank: “{pair.quizSentence}”
                    </div>
                    <div className="flex items-center gap-2">
                      {[pair.wordA, pair.wordB].map((opt) => {
                        const isPicked = userAns === opt;
                        const isRight = opt === pair.correctChoice;
                        let style =
                          'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924]';
                        if (userAns) {
                          if (isRight) {
                            style =
                              'bg-emerald-50 dark:bg-emerald-950/50 border-[#15803D] text-[#15803D] font-bold';
                          } else if (isPicked) {
                            style =
                              'bg-red-50 dark:bg-red-950/50 border-[#B91C1C] text-[#B91C1C] line-through';
                          }
                        }
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setConfusableAnswers((prev) => ({ ...prev, [pair.id]: opt }))
                            }
                            className={`flex-1 min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${style}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* TOOL 3 (FEATURE #4): NEPALI-TO-ENGLISH TRANSLATION & L1 LAB         */}
      {/* =================================================================== */}
      {activeTool === 'interference' && (
        <section className="space-y-5">
          <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-4">
            <div>
              <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                Nepali-to-English Translation & L1 Interference Lab
              </div>
              <h2 className="text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                Master SOV → SVO Word Order, Articles, Prepositions & Stative Verbs
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-1">
                Practice the 4 biggest Nepali-to-English structural shifts: reordering Subject-Object-Verb into Subject-Verb-Object, mastering silent-letter articles (a/an/the/Ø), mapping Nepali postpositions (मा, ले, सँग) to English prepositions, and fixing Present Continuous overuse.
              </p>
            </div>

            {/* 4 Sub-Module Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {(
                [
                  { id: 'sov-svo', label: '1. SOV → SVO Word Order Reordering' },
                  { id: 'articles', label: '2. Article Mastery (a / an / the / Ø)' },
                  { id: 'prepositions', label: '3. Preposition Traps (in / on / at / by / with)' },
                  { id: 'continuous-traps', label: '4. Continuous Overuse & Direct Translation Traps' },
                ] as const
              ).map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setInterferenceSubTab(sub.id)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    interferenceSubTab === sub.id
                      ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                      : 'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E]'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          {/* SUB-TAB 1: SOV -> SVO WORD ORDER REORDERING */}
          {interferenceSubTab === 'sov-svo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {SOV_SVO_REORDER_DRILLS.map((drill) => {
                const placed = sovPlacedChunks[drill.id] || [];
                const isComplete = placed.length === drill.correctOrder.length;
                const isExactMatch =
                  isComplete &&
                  placed.every((chunk, idx) => chunk === drill.correctOrder[idx]);

                return (
                  <div
                    key={drill.id}
                    className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="font-nepali text-sm font-semibold text-[#15803D] dark:text-emerald-400">
                        नेपाली वाक्य (SOV): “{drill.nepaliSentence}”
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-[11px] font-nepali text-[#57534E] dark:text-[#A8A29E]">
                        {drill.nepaliSOVBreakdown}
                      </div>

                      <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                        Tap chunks in English SVO order (Subject → Verb → Object):
                      </div>

                      {/* Available Chunk Pool */}
                      <div className="flex flex-wrap gap-2">
                        {drill.scrambledChunks.map((chunk) => {
                          const isUsed = placed.includes(chunk);
                          return (
                            <button
                              key={chunk}
                              type="button"
                              onClick={() => {
                                if (isUsed) {
                                  setSovPlacedChunks((prev) => ({
                                    ...prev,
                                    [drill.id]: (prev[drill.id] || []).filter((c) => c !== chunk),
                                  }));
                                } else {
                                  const next = [...placed, chunk];
                                  setSovPlacedChunks((prev) => ({ ...prev, [drill.id]: next }));
                                  if (
                                    next.length === drill.correctOrder.length &&
                                    next.every((c, i) => c === drill.correctOrder[i])
                                  ) {
                                    speechService.speak(next.join(' '), {
                                      rate: preferredSpeechRate,
                                    });
                                  }
                                }
                              }}
                              className={`min-h-[36px] px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                                isUsed
                                  ? 'bg-[#B91C1C]/10 border-[#B91C1C] text-[#B91C1C] line-through opacity-60'
                                  : 'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#B91C1C]'
                              }`}
                            >
                              {chunk}
                            </button>
                          );
                        })}
                      </div>

                      {/* Assembled English SVO Sentence Box */}
                      <div className="min-h-[48px] p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-dashed border-[#E7E0D6] dark:border-[#2E2924] flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                          {placed.length > 0
                            ? placed.join(' ')
                            : 'Tap the chunks above to build the SVO sentence...'}
                        </span>
                        {placed.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setSovPlacedChunks((prev) => ({ ...prev, [drill.id]: [] }))
                            }
                            className="text-xs font-semibold text-[#B91C1C] hover:underline"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {isComplete && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs ${
                          isExactMatch
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-[#15803D] text-[#15803D] dark:text-emerald-300'
                            : 'bg-amber-50/80 dark:bg-amber-950/40 border-[#D97706] text-amber-900 dark:text-amber-200'
                        }`}
                      >
                        <div className="font-bold mb-1">
                          {isExactMatch
                            ? '✓ Accurate English SVO Order!'
                            : `✗ Target SVO Order: "${drill.correctOrder.join(' ')}"`}
                        </div>
                        <p>{drill.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* SUB-TAB 2: ARTICLE MASTERY (A / AN / THE / ZERO ARTICLE) */}
          {interferenceSubTab === 'articles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {ARTICLE_MASTERY_DRILLS.map((drill) => {
                const picked = articleAnswers[drill.id];
                return (
                  <div
                    key={drill.id}
                    className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="font-nepali text-xs font-semibold text-[#15803D] dark:text-emerald-400">
                        {drill.nepaliContext}
                      </div>
                      <div className="text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                        “{drill.sentenceWithBlank}”
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {drill.options.map((opt) => {
                          const isSelected = picked === opt;
                          const isRight = opt === drill.correctAnswer;
                          let btnClass =
                            'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924]';
                          if (picked) {
                            if (isRight) {
                              btnClass =
                                'bg-emerald-50 dark:bg-emerald-950/50 border-[#15803D] text-[#15803D] font-bold';
                            } else if (isSelected) {
                              btnClass =
                                'bg-red-50 dark:bg-red-950/50 border-[#B91C1C] text-[#B91C1C] line-through';
                            }
                          }
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() =>
                                setArticleAnswers((prev) => ({ ...prev, [drill.id]: opt }))
                              }
                              className={`min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${btnClass}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {picked && (
                      <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs text-[#57534E] dark:text-[#A8A29E]">
                        <strong className="text-[#1C1917] dark:text-[#F5F2EB]">
                          Article Rule:{' '}
                        </strong>
                        {drill.rule}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* SUB-TAB 3: PREPOSITION TRAPS MAPPED TO NEPALI POSTPOSITIONS */}
          {interferenceSubTab === 'prepositions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PREPOSITION_TRAP_DRILLS.map((drill) => {
                const picked = prepositionAnswers[drill.id];
                return (
                  <div
                    key={drill.id}
                    className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="font-nepali text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                        Nepali Postposition Cue: {drill.nepaliPostposition}
                      </div>
                      <div className="text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                        “{drill.sentenceWithBlank}”
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {drill.options.map((opt) => {
                          const isSelected = picked === opt;
                          const isRight = opt === drill.correctAnswer;
                          let btnClass =
                            'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924]';
                          if (picked) {
                            if (isRight) {
                              btnClass =
                                'bg-emerald-50 dark:bg-emerald-950/50 border-[#15803D] text-[#15803D] font-bold';
                            } else if (isSelected) {
                              btnClass =
                                'bg-red-50 dark:bg-red-950/50 border-[#B91C1C] text-[#B91C1C] line-through';
                            }
                          }
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() =>
                                setPrepositionAnswers((prev) => ({ ...prev, [drill.id]: opt }))
                              }
                              className={`min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${btnClass}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {picked && (
                      <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs text-[#57534E] dark:text-[#A8A29E]">
                        <strong className="text-[#1C1917] dark:text-[#F5F2EB]">
                          Preposition Rule:{' '}
                        </strong>
                        {drill.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* SUB-TAB 4: PRESENT CONTINUOUS OVERUSE & DIRECT TRANSLATION TRAPS */}
          {interferenceSubTab === 'continuous-traps' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {CONTINUOUS_OVERUSE_DRILLS.map((drill) => {
                const picked = continuousAnswers[drill.id];
                return (
                  <div
                    key={drill.id}
                    className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="font-nepali text-sm font-semibold text-[#15803D] dark:text-emerald-400">
                        {drill.nepaliThought}
                      </div>
                      <div className="p-3 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-[#B91C1C] dark:text-[#F87171]">
                        <strong>Present Continuous Overuse Trap:</strong> {drill.wrongHabit}
                      </div>
                      <div className="space-y-2 pt-1">
                        {drill.options.map((opt) => {
                          const isPicked = picked === opt;
                          const isRight = opt === drill.correctAnswer;
                          let style =
                            'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924]';
                          if (picked) {
                            if (isRight) {
                              style =
                                'bg-emerald-50 dark:bg-emerald-950/50 border-[#15803D] text-[#15803D] font-semibold';
                            } else if (isPicked) {
                              style =
                                'bg-red-50 dark:bg-red-950/50 border-[#B91C1C] text-[#B91C1C] line-through';
                            }
                          }
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setContinuousAnswers((prev) => ({ ...prev, [drill.id]: opt }));
                                if (opt === drill.correctAnswer) {
                                  speechService.speak(opt, { rate: preferredSpeechRate });
                                }
                              }}
                              className={`w-full min-h-[40px] px-3.5 py-2 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2 ${style}`}
                            >
                              <span>{opt}</span>
                              {picked && isRight && (
                                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {picked && (
                      <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs text-[#57534E] dark:text-[#A8A29E]">
                        <strong className="text-[#1C1917] dark:text-[#F5F2EB]">Why? </strong>
                        {drill.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {INTERFERENCE_DRILLS.map((drill) => {
                const selected = interferenceAnswers[drill.id];
                return (
                  <div
                    key={drill.id}
                    className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="font-nepali text-sm font-semibold text-[#15803D] dark:text-emerald-400">
                        नेपाली भाव: “{drill.nepaliThought}”
                      </div>
                      <div className="p-3 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-[#B91C1C] dark:text-[#F87171]">
                        <strong>Common Direct-Translation Trap:</strong> {drill.commonNepaliTrap}
                      </div>

                      <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] pt-1">
                        Select the Natural Standard English Sentence:
                      </div>
                      <div className="space-y-2">
                        {drill.options.map((opt) => {
                          const isPicked = selected === opt;
                          const isCorrect = opt === drill.naturalEnglishFix;
                          let btnStyle =
                            'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924]';
                          if (selected) {
                            if (isCorrect) {
                              btnStyle =
                                'bg-emerald-50 dark:bg-emerald-950/50 border-[#15803D] text-[#15803D] dark:text-emerald-300 font-semibold';
                            } else if (isPicked) {
                              btnStyle =
                                'bg-red-50 dark:bg-red-950/50 border-[#B91C1C] text-[#B91C1C] line-through';
                            }
                          }
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setInterferenceAnswers((prev) => ({ ...prev, [drill.id]: opt }));
                                if (opt === drill.naturalEnglishFix) {
                                  speechService.speak(opt, { rate: preferredSpeechRate });
                                }
                              }}
                              className={`w-full min-h-[40px] px-3.5 py-2 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {selected && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selected && (
                      <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs text-[#57534E] dark:text-[#A8A29E]">
                        <strong className="text-[#1C1917] dark:text-[#F5F2EB]">Why? </strong>
                        {drill.grammarRule}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* =================================================================== */}
      {/* TOOL 4 (FEATURE #5): CONNECTED SPEECH & SPEED LISTENING DECODER     */}
      {/* =================================================================== */}
      {activeTool === 'connected-speech' && (
        <section className="space-y-4">
          <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6">
            <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
              Feature #5 · Fast-Speech Linking & Ear Decoder
            </div>
            <h2 className="text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
              Speed Listening & Connected Speech Decoder (1.0x vs 0.5x)
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-1">
              In real conversations, English speakers link words together (e.g., <em>“Could you”</em> sounds like <strong>“KUD-joo”</strong>). Listen at 1.0x natural speed and 0.5x phoneme speed, then decode the exact sentence:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CONNECTED_SPEECH_ITEMS.map((item) => {
              const picked = connectedAnswers[item.id];
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => speechService.speak(item.fullPhrase, { rate: 1.0 })}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Play Natural (1.0x)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => speechService.speak(item.fullPhrase, { rate: 0.5 })}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Turtle className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>Play Slow (0.5x)</span>
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-1">
                      <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                        How It Sounds in Fast Connected Speech:
                      </div>
                      <div className="font-ipa text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                        {item.spokenPhoneticLink}
                      </div>
                      <div className="font-ipa text-xs text-[#57534E] dark:text-[#A8A29E]">
                        IPA: {item.ipaLinked}
                      </div>
                      {languageMode !== 'english-only' && (
                        <div className="font-nepali text-xs text-[#15803D] dark:text-emerald-400">
                          {item.nepaliMeaning}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                        Decode the Exact Written Words:
                      </div>
                      {item.options.map((opt) => {
                        const isSelected = picked === opt;
                        const isRight = opt === item.fullPhrase;
                        let style =
                          'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924]';
                        if (picked) {
                          if (isRight) {
                            style =
                              'bg-emerald-50 dark:bg-emerald-950/50 border-[#15803D] text-[#15803D] font-semibold';
                          } else if (isSelected) {
                            style =
                              'bg-red-50 dark:bg-red-950/50 border-[#B91C1C] text-[#B91C1C] line-through';
                          }
                        }
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setConnectedAnswers((prev) => ({ ...prev, [item.id]: opt }))
                            }
                            className={`w-full min-h-[38px] px-3.5 py-2 rounded-xl border text-left text-xs sm:text-sm transition-all ${style}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {picked && (
                    <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs text-[#57534E] dark:text-[#A8A29E]">
                      <strong className="text-[#1C1917] dark:text-[#F5F2EB]">
                        Phonetic Linking Note:{' '}
                      </strong>
                      {item.linkingExplanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* TOOL 5 (FEATURE #6): TIMED 60-SECOND SPELLING & PHONICS SPRINT      */}
      {/* =================================================================== */}
      {activeTool === 'sprint' && (
        <section className="max-w-3xl mx-auto bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E7E0D6] dark:border-[#2E2924]">
            <div>
              <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                Feature #6 · Rapid Orthographic Reflex Arcade
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Timed 60-Second Spelling & Phonics Sprint
              </h2>
            </div>

            <div className="flex items-center gap-3 font-ipa text-xs">
              <div className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] font-semibold">
                Personal Best: <span className="text-[#B91C1C]">{sprintHighScore} pts</span>
              </div>
              {sprintRunning && (
                <div className="px-3.5 py-2 rounded-xl bg-[#B91C1C] text-white font-bold inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{sprintSecondsLeft}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Sprint Difficulty Tier Selector (All / B1 / B2 / C1 / Mistake Notebook) */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
            <span className="text-xs font-semibold text-[#57534E] dark:text-[#A8A29E]">
              Select Sprint Difficulty Tier:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'ALL', label: 'All Levels' },
                  { id: 'B1', label: 'B1 Foundation' },
                  { id: 'B2', label: 'B2 Fluency' },
                  { id: 'C1', label: 'C1 Mastery' },
                  { id: 'MISTAKES', label: `Mistake Notebook (${mistakeNotebook.length})` },
                ] as const
              ).map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  disabled={sprintRunning}
                  onClick={() => {
                    setSprintTier(tier.id);
                    setSprintIdx(0);
                  }}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    sprintTier === tier.id
                      ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                      : 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E]'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {!sprintRunning && !sprintFinished ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#D97706]/15 text-[#D97706] flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                How Many Silent-Letter Words Can You Complete in 60 Seconds? ({sprintTier} Tier)
              </h3>
              <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] max-w-md mx-auto">
                You will hear each word and see its Nepali meaning + masked letters. Tap the accurate missing letter cluster to build your combo multiplier!
              </p>
              <button
                type="button"
                onClick={handleStartSprint}
                className="min-h-[48px] px-7 py-3 rounded-xl bg-[#B91C1C] text-white text-sm font-semibold hover:bg-[#991B1B] inline-flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Start 60-Second Sprint Now</span>
              </button>
            </div>
          ) : sprintFinished ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#15803D]/15 text-[#15803D] flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <div className="text-xs font-semibold text-[#15803D] dark:text-emerald-400">
                60-Second Sprint Complete!
              </div>
              <h3 className="text-3xl font-bold font-ipa text-[#1C1917] dark:text-[#F5F2EB]">
                Final Score: {sprintScore} pts
              </h3>
              <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
                All-Time Personal Best: <strong>{Math.max(sprintHighScore, sprintScore)} pts</strong>
              </p>
              <button
                type="button"
                onClick={handleStartSprint}
                className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#B91C1C] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs font-ipa">
                <span>
                  Current Score: <strong className="text-base">{sprintScore} pts</strong>
                </span>
                <span className="text-[#D97706] font-bold">
                  Combo Streak: {sprintCombo}x 🔥
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      speechService.speak(currentSprintItem.word, { rate: preferredSpeechRate })
                    }
                    className="min-h-[36px] px-3 py-1 rounded-lg bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#B91C1C]" />
                    <span>Hear Word</span>
                  </button>
                  <span className="font-ipa text-xs text-[#57534E] dark:text-[#A8A29E]">
                    {currentSprintItem.ipa}
                  </span>
                </div>

                <div className="font-ipa text-3xl sm:text-4xl font-bold tracking-widest text-[#1C1917] dark:text-[#F5F2EB]">
                  {currentSprintItem.maskedDisplay}
                </div>

                <div className="font-nepali text-sm font-semibold text-[#15803D] dark:text-emerald-400">
                  {currentSprintItem.nepali} · ({currentSprintItem.rule})
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentSprintItem.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAnswerSprint(opt)}
                    className="min-h-[54px] rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] hover:border-[#B91C1C] font-ipa text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB] transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {sprintFeedback && (
                <div
                  className={`text-center text-xs font-bold ${
                    sprintFeedback === 'correct' ? 'text-[#15803D]' : 'text-[#B91C1C]'
                  }`}
                >
                  {sprintFeedback === 'correct'
                    ? `✓ Exact Match: ${currentSprintItem.word}!`
                    : `✗ Target was "${currentSprintItem.word}" (${currentSprintItem.rule})`}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* =================================================================== */}
      {/* TOOL 6 (FEATURE #7): INTERACTIVE WORD FAMILY & ROOT TREE EXPLORER   */}
      {/* =================================================================== */}
      {activeTool === 'word-trees' && (
        <section className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D6] dark:border-[#2E2924]">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                <GitBranch className="w-4 h-4" />
                <span>Feature #7 · Morphological Phonics Tree Explorer</span>
              </div>
              <h2 className="text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                When Silent Letters Stay Silent vs. When They Wake Up!
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                Why does English spell <strong>Sign</strong> with a <em>g</em> or <strong>Autumn</strong> with an <em>n</em>? Because those silent letters wake up and are pronounced aloud in related family words!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {WORD_FAMILY_TREES.map((tree) => (
                <button
                  key={tree.id}
                  type="button"
                  onClick={() => setSelectedTreeId(tree.id)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    selectedTreeId === tree.id
                      ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                      : 'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924]'
                  }`}
                >
                  Root: {tree.rootWord.split('/')[0].trim()} (Silent {tree.silentLetter})
                </button>
              ))}
            </div>
          </div>

          {/* Root Trunk Node */}
          <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                Root Word Family · Target Letter “{currentWordTree.silentLetter}”
              </div>
              <div className="text-2xl font-bold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                {currentWordTree.rootWord}{' '}
                <span className="font-ipa text-base font-normal text-[#57534E] dark:text-[#A8A29E]">
                  {currentWordTree.rootIpa}
                </span>
              </div>
              <div className="font-nepali text-xs sm:text-sm text-[#15803D] dark:text-emerald-400 mt-0.5">
                {currentWordTree.rootMeaning}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                speechService.speak(currentWordTree.rootWord.replace(/\//g, ', '), {
                  rate: preferredSpeechRate,
                })
              }
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Hear Root Word</span>
            </button>
          </div>

          {/* Two Branches: Stays Silent vs. Wakes Up Aloud */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Branch A: Letter Stays Silent */}
            <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#B91C1C] dark:text-[#F87171]">
                Branch 1 · Letter “{currentWordTree.silentLetter}” Stays Silent
              </div>
              {currentWordTree.silentBranch.map((b) => (
                <div
                  key={b.word}
                  className="p-4 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                      {b.word}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        speechService.speak(b.word.replace(/\//g, ', '), {
                          rate: preferredSpeechRate,
                        })
                      }
                      className="min-h-[32px] px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#B91C1C]" />
                      <span>Hear</span>
                    </button>
                  </div>
                  <div className="font-ipa text-xs text-[#57534E] dark:text-[#A8A29E]">
                    {b.ipa} · <span className="font-nepali">{b.meaning}</span>
                  </div>
                  <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">{b.note}</p>
                </div>
              ))}
            </div>

            {/* Branch B: Letter Wakes Up Aloud */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#15803D] dark:text-emerald-400">
                Branch 2 · Letter “{currentWordTree.silentLetter}” Wakes Up Aloud!
              </div>
              {currentWordTree.awakeBranch.map((b) => (
                <div
                  key={b.word}
                  className="p-4 rounded-xl bg-white dark:bg-[#1F1C18] border border-emerald-300/70 dark:border-emerald-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[#15803D] dark:text-emerald-300">
                      {b.word}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        speechService.speak(b.word.replace(/\//g, ', '), {
                          rate: preferredSpeechRate,
                        })
                      }
                      className="min-h-[32px] px-2.5 py-1 rounded-lg bg-[#15803D] text-white text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Hear Awake Letter</span>
                    </button>
                  </div>
                  <div className="font-ipa text-xs text-[#57534E] dark:text-[#A8A29E]">
                    {b.ipa} · <span className="font-nepali">{b.meaning}</span>
                  </div>
                  <p className="text-xs text-[#1C1917] dark:text-[#F5F2EB] font-medium">
                    {b.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* TOOL 7 (FEATURE #8): REAL-WORLD SITUATION ROLE-PLAY SIMULATOR       */}
      {/* =================================================================== */}
      {activeTool === 'roleplay' && (
        <section className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D6] dark:border-[#2E2924]">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                <MessageSquare className="w-4 h-4" />
                <span>Feature #8 · Interactive Branching Conversation Simulator</span>
              </div>
              <h2 className="text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                Real-World Situation Role-Play Simulator
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                Listen to your conversation partner and choose the most polite, grammatically accurate English response:
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {ROLEPLAY_SCENARIOS.map((sc, idx) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    setActiveScenarioIdx(idx);
                    setRolePlayTurnIdx(0);
                    setSelectedRolePlayChoice(null);
                  }}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    activeScenarioIdx === idx
                      ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                      : 'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924]'
                  }`}
                >
                  Scenario 0{idx + 1} {rolePlayCompletedIds.includes(sc.id) ? '✓' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-[#B91C1C] dark:text-[#F87171]">
                {currentScenario.title} · Turn {rolePlayTurnIdx + 1} of{' '}
                {currentScenario.turns.length}
              </span>
              <button
                type="button"
                onClick={() =>
                  speechService.speak(currentRolePlayTurn.interlocutorLine, {
                    rate: preferredSpeechRate,
                  })
                }
                className="min-h-[36px] px-3 py-1 rounded-lg bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] font-semibold inline-flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#B91C1C]" />
                <span>Hear Speaker</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] space-y-1">
              <div className="text-xs font-semibold text-[#57534E] dark:text-[#A8A29E]">
                {currentRolePlayTurn.speaker}:
              </div>
              <div className="text-base sm:text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                “{currentRolePlayTurn.interlocutorLine}”
              </div>
              {languageMode !== 'english-only' && (
                <div className="font-nepali text-xs text-[#57534E] dark:text-[#A8A29E]">
                  {currentRolePlayTurn.nepaliTranslation}
                </div>
              )}
            </div>

            {/* Live Branching Rapport & Politeness Meter (Enhancement #4) */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                  Live Counterpart Rapport & Politeness Meter:
                </span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    rolePlayRapportScore >= 85
                      ? 'text-[#15803D] dark:text-emerald-400'
                      : rolePlayRapportScore >= 65
                      ? 'text-[#D97706]'
                      : 'text-[#B91C1C]'
                  }`}
                >
                  {rolePlayRapportScore}% ({rolePlayRapportScore >= 85 ? 'Diplomatic C1 Register' : rolePlayRapportScore >= 65 ? 'Polite Standard Register' : 'Direct / Needs Softening'})
                </span>
              </div>
              <div className="w-44 h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    rolePlayRapportScore >= 85
                      ? 'bg-[#15803D]'
                      : rolePlayRapportScore >= 65
                      ? 'bg-[#D97706]'
                      : 'bg-[#B91C1C]'
                  }`}
                  style={{ width: `${rolePlayRapportScore}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Choose Your Response (or Speak with Your Microphone!):
                </div>
                <button
                  type="button"
                  disabled={rolePlayListening}
                  onClick={handleSpeakRolePlayResponse}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                    rolePlayListening
                      ? 'bg-[#B91C1C] text-white border-[#B91C1C] animate-pulse'
                      : 'bg-white dark:bg-[#1F1C18] border-[#B91C1C] text-[#B91C1C] dark:text-[#F87171] hover:bg-[#B91C1C] hover:text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>
                    {rolePlayListening
                      ? 'Listening to Your Spoken Response...'
                      : 'Speak Response with Mic'}
                  </span>
                </button>
              </div>

              {rolePlayMicError && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-xs text-amber-900 dark:text-amber-200">
                  {rolePlayMicError}
                </div>
              )}

              {rolePlayVoiceResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                    rolePlayVoiceResult.passed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-[#15803D] text-[#15803D] dark:text-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-[#D97706] text-amber-900 dark:text-amber-200'
                  }`}
                >
                  <span>
                    🎙️ You spoke: “{rolePlayVoiceResult.transcript}”
                  </span>
                  <span className="font-ipa font-bold">{rolePlayVoiceResult.score}% Match</span>
                </div>
              )}

              {currentRolePlayTurn.choices.map((ch, idx) => {
                const isSelected = selectedRolePlayChoice === idx;
                let style =
                  'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#B91C1C]';
                if (selectedRolePlayChoice !== null) {
                  if (ch.quality === 'best') {
                    style =
                      'bg-emerald-50 dark:bg-emerald-950/40 border-[#15803D] text-[#15803D] dark:text-emerald-300 font-semibold';
                  } else if (isSelected) {
                    style =
                      'bg-amber-50 dark:bg-amber-950/40 border-[#D97706] text-amber-900 dark:text-amber-200';
                  }
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedRolePlayChoice(idx);
                      setRolePlayPolitenessHistory((prev) => [...prev, ch.quality]);
                      if (ch.quality === 'best') {
                        setRolePlayRapportScore((s) => Math.min(100, s + 10));
                        speechService.speak(ch.text, {
                          rate: preferredSpeechRate,
                          speakerIndex: 1,
                        });
                        if (rolePlayTurnIdx + 1 === currentScenario.turns.length) {
                          onRecordRolePlayCompleted(currentScenario.id);
                        }
                      } else if (ch.quality === 'acceptable') {
                        setRolePlayRapportScore((s) => Math.min(100, Math.max(40, s + 2)));
                      } else {
                        setRolePlayRapportScore((s) => Math.max(30, s - 12));
                      }
                    }}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer ${style}`}
                  >
                    <div>“{ch.text}”</div>
                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-current/20 text-xs font-normal space-y-1">
                        <div>
                          <strong>Coaching Feedback:</strong> {ch.feedback}
                        </div>
                        <div className="italic opacity-90">
                          <strong>Counterpart Branching Reaction:</strong>{' '}
                          {ch.quality === 'best'
                            ? `“${currentRolePlayTurn.speaker} nods warmly and appreciates your polite, natural register.”`
                            : ch.quality === 'acceptable'
                            ? `“${currentRolePlayTurn.speaker} understands your point, though a softer modal ('Could/Would') would build stronger rapport.”`
                            : `“${currentRolePlayTurn.speaker} looks slightly surprised by the directness; try memilih an indirect polite phrasing.”`}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedRolePlayChoice !== null && (
              <div className="flex justify-end pt-2">
                {rolePlayTurnIdx + 1 < currentScenario.turns.length ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRolePlayTurnIdx((prev) => prev + 1);
                      setSelectedRolePlayChoice(null);
                    }}
                    className="min-h-[40px] px-5 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next Conversation Turn</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveScenarioIdx((prev) => (prev + 1) % ROLEPLAY_SCENARIOS.length);
                      setRolePlayTurnIdx(0);
                      setSelectedRolePlayChoice(null);
                      setRolePlayRapportScore(80);
                      setRolePlayPolitenessHistory([]);
                    }}
                    className="min-h-[40px] px-5 py-2 rounded-xl bg-[#15803D] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      Scenario Complete (Rapport: {rolePlayRapportScore}% · {rolePlayPolitenessHistory.filter((q) => q === 'best').length} Best Turns)! Next Scenario →
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* TOOL 8 (FEATURE #11): AUDIO SHADOWING TRAINER (WEB AUDIO WAVEFORM)  */}
      {/* =================================================================== */}
      {activeTool === 'shadowing' && (
        <AudioShadowingTrainer
          lectures={lectures}
          languageMode={languageMode}
          preferredSpeechRate={preferredSpeechRate}
        />
      )}

      {/* =================================================================== */}
      {/* TOOL 9 (FEATURE #9): CUSTOM STUDY DECK & PERSONAL FLASHCARD BUILDER */}
      {/* =================================================================== */}
      {activeTool === 'custom-deck' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Add New Personal Word Form */}
          <form
            onSubmit={handleCreateCustomCard}
            className="lg:col-span-5 bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-4"
          >
            <div>
              <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                Feature #9 · Personal Lexicon & Flashcard Creator
              </div>
              <h2 className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                Add a Word to Your Custom Study Deck
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">English Word or Phrase *</label>
                <input
                  type="text"
                  required
                  value={newWordInput}
                  onChange={(e) => setNewWordInput(e.target.value)}
                  placeholder="e.g., Sovereign, Handkerchief, Cupboard"
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold mb-1">IPA / Pronunciation Hint</label>
                  <input
                    type="text"
                    value={newIpaInput}
                    onChange={(e) => setNewIpaInput(e.target.value)}
                    placeholder="e.g., /ˈsɒv.rən/"
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] font-ipa"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Part of Speech</label>
                  <select
                    value={newPosInput}
                    onChange={(e) => setNewPosInput(e.target.value)}
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]"
                  >
                    <option value="noun">noun</option>
                    <option value="verb">verb</option>
                    <option value="adjective">adjective</option>
                    <option value="adverb">adverb</option>
                    <option value="phrase">phrase</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nepali Meaning *</label>
                <input
                  type="text"
                  required
                  value={newNepaliInput}
                  onChange={(e) => setNewNepaliInput(e.target.value)}
                  placeholder="e.g., सार्वभौम / रुमाल"
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] font-nepali"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Silent-Letter or Phonics Note</label>
                <input
                  type="text"
                  value={newSilentRuleInput}
                  onChange={(e) => setNewSilentRuleInput(e.target.value)}
                  placeholder="e.g., Silent 'g' before 'n'"
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Example Sentence</label>
                <input
                  type="text"
                  value={newExampleInput}
                  onChange={(e) => setNewExampleInput(e.target.value)}
                  placeholder="e.g., Nepal is an independent sovereign nation."
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold hover:bg-[#991B1B] inline-flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Word to Custom Study Deck</span>
              </button>
            </div>
          </form>

          {/* Right Column: Interactive Custom Flashcard Player + Word List */}
          <div className="lg:col-span-7 space-y-5">
            {customWords.length > 0 && (
              <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#B91C1C] dark:text-[#F87171]">
                    Custom Deck Flashcard Player ({(customFlashcardIdx % customWords.length) + 1} /{' '}
                    {customWords.length})
                  </span>
                  <span className="text-[#57534E] dark:text-[#A8A29E]">
                    {customWords[customFlashcardIdx % customWords.length].deckTag}
                  </span>
                </div>

                {(() => {
                  const card = customWords[customFlashcardIdx % customWords.length];
                  return (
                    <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-center space-y-3">
                      <div className="text-3xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                        {card.word}
                      </div>
                      <div className="font-ipa text-sm text-[#57534E] dark:text-[#A8A29E]">
                        {card.ipa} · {card.partOfSpeech} · {card.silentLettersSummary}
                      </div>

                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            speechService.speak(card.word, { rate: preferredSpeechRate })
                          }
                          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#B91C1C]" />
                          <span>1.0x</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => speechService.speak(card.word, { rate: 0.6 })}
                          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Turtle className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>0.65x</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomCardFlipped((f) => !f)}
                          className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold"
                        >
                          {customCardFlipped ? 'Hide Meaning' : 'Flip Card'}
                        </button>
                      </div>

                      {customCardFlipped && (
                        <div className="pt-3 border-t border-[#E7E0D6] dark:border-[#2E2924] space-y-1">
                          <div className="font-nepali text-lg font-bold text-[#15803D] dark:text-emerald-400">
                            {card.nepaliMeaning}
                          </div>
                          <div className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                            “{card.englishExample}”
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setCustomCardFlipped(false);
                            setCustomFlashcardIdx(
                              (i) => (i - 1 + customWords.length) % customWords.length
                            );
                          }}
                          className="text-xs font-semibold text-[#57534E] hover:text-[#1C1917]"
                        >
                          ← Previous Card
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomCardFlipped(false);
                            setCustomFlashcardIdx((i) => (i + 1) % customWords.length);
                          }}
                          className="text-xs font-semibold text-[#B91C1C]"
                        >
                          Next Card →
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Saved Custom Cards List */}
            <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-3">
              <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Your Custom Vocabulary Cards ({customWords.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customWords.map((cw) => (
                  <div
                    key={cw.id}
                    className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] flex items-start justify-between gap-2"
                  >
                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-sm text-[#1C1917] dark:text-[#F5F2EB]">
                        {cw.word}{' '}
                        <span className="font-ipa font-normal text-[#57534E]">{cw.ipa}</span>
                      </div>
                      <div className="font-nepali text-[#15803D] dark:text-emerald-400 font-semibold">
                        {cw.nepaliMeaning}
                      </div>
                      <div className="text-[11px] text-[#B91C1C] dark:text-[#F87171]">
                        {cw.silentLettersSummary}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => speechService.speak(cw.word, { rate: preferredSpeechRate })}
                        className="p-1.5 rounded-lg text-[#B91C1C]"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveCustomWord(cw.id)}
                        className="p-1.5 rounded-lg text-[#57534E] hover:text-[#B91C1C]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* TOOL 10 (FEATURE #12 + VOCABULARY LIST): MASTER VOCAB & CHEAT-SHEETS */}
      {/* =================================================================== */}
      {activeTool === 'cheatsheets' && (
        <section className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D6] dark:border-[#2E2924] print:hidden">
            <div>
              <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                Feature #12 & Master Vocabulary List · Print-Ready Reference Sheets
              </div>
              <h2 className="text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                Master Vocabulary List & Printable Pocket Cheat-Sheets
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                Browse the complete curated Silent-Letter & Core Vocabulary List table or switch to the A–Z Silent-Letter Rules and SVO Syntax Formulas—and print/save any view as a clean PDF!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  {
                    id: 'vocab-table' as const,
                    label: `Master Vocabulary List (${curatedVocabularyList.length})`,
                  },
                  { id: 'silent-rules' as const, label: 'A–Z Silent-Letter Rules' },
                  { id: 'svo-formulas' as const, label: 'SVO vs. SOV Formulas' },
                  {
                    id: 'mistakes-print' as const,
                    label: `Personal Notes (${mistakeNotebook.length + customWords.length})`,
                  },
                ]
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCheatSheetTab(t.id)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                    cheatSheetTab === t.id
                      ? 'bg-[#1C1917] text-white dark:bg-[#F5F2EB] dark:text-[#1C1917] border-transparent'
                      : 'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924]'
                  }`}
                >
                  {t.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => window.print()}
                className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* SHEET 1: MASTER CURATED VOCABULARY LIST TABLE */}
          {cheatSheetTab === 'vocab-table' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 print:hidden">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#57534E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vocabTableSearch}
                    onChange={(e) => setVocabTableSearch(e.target.value)}
                    placeholder="Filter vocabulary list by English word, Nepali meaning, IPA, or silent letter..."
                    className="w-full min-h-[42px] pl-10 pr-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs sm:text-sm"
                  />
                </div>
                <select
                  value={vocabTableLectureFilter}
                  onChange={(e) =>
                    setVocabTableLectureFilter(
                      e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                    )
                  }
                  className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold"
                >
                  <option value="ALL">All 12 Lectures ({curatedVocabularyList.length} Words)</option>
                  {lectures.slice(0, 12).map((l) => (
                    <option key={l.id} value={l.lectureNumber}>
                      Lecture {String(l.lectureNumber).padStart(2, '0')} · {l.level} ({l.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto border border-[#E7E0D6] dark:border-[#2E2924] rounded-xl">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#FAF7F2] dark:bg-[#141210] border-b border-[#E7E0D6] dark:border-[#2E2924] text-xs text-[#57534E] dark:text-[#A8A29E]">
                      <th className="py-3 px-3.5 font-semibold">Word (Silent Highlight)</th>
                      <th className="py-3 px-3.5 font-semibold">IPA & POS</th>
                      <th className="py-3 px-3.5 font-semibold">Nepali Meaning</th>
                      <th className="py-3 px-3.5 font-semibold">Phonics / Silent Rule</th>
                      <th className="py-3 px-3.5 font-semibold">Unit</th>
                      <th className="py-3 px-3.5 font-semibold print:hidden">Audio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E0D6] dark:divide-[#2E2924]">
                    {filteredVocabSheet.slice(0, 150).map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#141210]/40"
                      >
                        <td className="py-2.5 px-3.5 font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                          {item.segments?.map((seg, i) =>
                            seg.silent ? (
                              <span
                                key={i}
                                className="text-[#B91C1C] dark:text-[#F87171] underline decoration-dotted"
                              >
                                {seg.text}
                              </span>
                            ) : (
                              <span key={i}>{seg.text}</span>
                            )
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 font-ipa text-xs text-[#57534E] dark:text-[#A8A29E]">
                          {item.ipa} · {item.partOfSpeech}
                        </td>
                        <td className="py-2.5 px-3.5 font-nepali font-medium text-[#15803D] dark:text-emerald-400">
                          {item.nepaliMeaning}
                        </td>
                        <td className="py-2.5 px-3.5 text-xs text-[#B91C1C] dark:text-[#F87171]">
                          {item.silentLettersSummary}
                        </td>
                        <td className="py-2.5 px-3.5 font-ipa text-xs">
                          L{String(item.lectureNumber).padStart(2, '0')} ({item.level})
                        </td>
                        <td className="py-2.5 px-3.5 print:hidden">
                          <button
                            type="button"
                            onClick={() =>
                              speechService.speak(item.word, { rate: preferredSpeechRate })
                            }
                            className="p-1.5 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] text-[#B91C1C]"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SHEET 2: MASTER SILENT-LETTER A-Z POCKET RULES */}
          {cheatSheetTab === 'silent-rules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  cluster: 'Silent B (mb / bt)',
                  rule: 'Silent after M at the end of a root word, and before T.',
                  examples: 'Comb, Climb, Lamb, Plumber, Thumb · Debt, Doubt, Subtle',
                },
                {
                  cluster: 'Silent C (sc)',
                  rule: 'Silent after S before e, i, or y.',
                  examples: 'Science, Scene, Muscle, Fascinate, Discipline, Crescent',
                },
                {
                  cluster: 'Silent D (dg / dn)',
                  rule: 'Silent before G in -dge, and in common everyday compounds.',
                  examples: 'Wednesday, Handkerchief, Handsome, Bridge, Ledger, Budget',
                },
                {
                  cluster: 'Silent G & GH (gn / igh)',
                  rule: 'G is silent before N; GH is silent after vowels.',
                  examples: 'Sign, Design, Foreign, Reign, Sovereign · Night, Though, Thorough',
                },
                {
                  cluster: 'Silent H (Initial & rh / wh)',
                  rule: 'Silent at the start of French-origin words and after R or W.',
                  examples: 'Hour, Honest, Heir, Honour · Rhyme, Rhythm, Whisper, Whistle',
                },
                {
                  cluster: 'Silent K & W (kn / wr)',
                  rule: 'Always silent at the beginning of a word before N or R.',
                  examples: 'Knife, Knight, Know, Knee, Knack · Write, Wrist, Wreck, Wrench',
                },
                {
                  cluster: 'Silent L (alm / alk / ould)',
                  rule: 'Silent before M, K, F, and D in modal verbs.',
                  examples: 'Calm, Palm, Almond, Salmon · Walk, Talk, Chalk · Could, Should, Would',
                },
                {
                  cluster: 'Silent N, P & T (mn / ps / pt / stle)',
                  rule: 'N silent after M; P silent before S/T; T silent in -stle/-sten.',
                  examples: 'Autumn, Solemn, Hymn · Psychology, Receipt, Cupboard · Castle, Fasten, Mortgage',
                },
              ].map((card) => (
                <div
                  key={card.cluster}
                  className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-1.5"
                >
                  <div className="font-bold text-sm text-[#B91C1C] dark:text-[#F87171]">
                    {card.cluster}
                  </div>
                  <div className="text-xs text-[#1C1917] dark:text-[#F5F2EB]">{card.rule}</div>
                  <div className="font-ipa text-xs text-[#57534E] dark:text-[#A8A29E]">
                    <strong>Examples:</strong> {card.examples}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SHEET 3: ENGLISH SVO VS NEPALI SOV SYNTAX FORMULAS */}
          {cheatSheetTab === 'svo-formulas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: '1. Core Active Statement Bridge (SVO vs SOV)',
                  formula: 'English: [Subject] + [Verb] + [Object]  |  Nepali: [कर्ता] + [कर्म] + [क्रिया]',
                  example: 'English: “The plumber (S) fixed (V) the pipe (O).” ↔ Nepali: “प्लम्बरले (S) पाइप (O) मर्मत गर्यो (V)।”',
                },
                {
                  title: '2. Prepositions vs. Nepali Postpositions',
                  formula: 'English: [Preposition] BEFORE [Noun]  |  Nepali: [नाम] पछि [विभक्ति]',
                  example: 'English: “on Wednesday / in the cupboard” ↔ Nepali: “बुधबारमा / दराजभित्र”',
                },
                {
                  title: '3. Polite Indirect Questions (Embedded SVO)',
                  formula: '[Could you tell me] + [Question Word] + [Subject] + [Verb] (No do/does/did!)',
                  example: '✓ “Could you tell me where the station is?” (✗ Not “...where is the station?”)',
                },
                {
                  title: '4. Causative Verbs (Have / Get Something Done)',
                  formula: '[Subject] + [have / get] + [Object] + [Past Participle (V3)]',
                  example: '✓ “I had my watch repaired yesterday.” (अर्कैद्वारा काम गराउँदा V3 प्रयोग गर्ने)',
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-2"
                >
                  <div className="font-bold text-sm text-[#1C1917] dark:text-[#F5F2EB]">
                    {f.title}
                  </div>
                  <div className="font-ipa text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                    {f.formula}
                  </div>
                  <div className="font-nepali text-xs text-[#57534E] dark:text-[#A8A29E]">
                    {f.example}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SHEET 4: PERSONAL MISTAKE NOTES & CUSTOM WORDS PRINT SHEET */}
          {cheatSheetTab === 'mistakes-print' && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Personal Mistake Notebook ({mistakeNotebook.length}) & Custom Deck Words (
                {customWords.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mistakeNotebook.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs space-y-1"
                  >
                    <div className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      {m.prompt}
                    </div>
                    <div className="text-[#15803D] font-bold">Target: {m.correctAnswer}</div>
                    <div className="text-[#57534E]">{m.explanation}</div>
                  </div>
                ))}
                {customWords.map((cw) => (
                  <div
                    key={cw.id}
                    className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs space-y-1"
                  >
                    <div className="font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                      {cw.word} ({cw.ipa}) — {cw.nepaliMeaning}
                    </div>
                    <div className="text-[#B91C1C]">{cw.silentLettersSummary}</div>
                    <div className="text-[#57534E]">“{cw.englishExample}”</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* =================================================================== */}
      {/* TOOL 11: TIMED 10-MINUTE EXAM & CAREER READINESS SIMULATOR          */}
      {/* =================================================================== */}
      {activeTool === 'exam-simulator' && (
        <section className="max-w-4xl mx-auto bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E7E0D6] dark:border-[#2E2924]">
            <div>
              <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                Timed Diagnostic Mock Test · IELTS / PTE / Job Interview Readiness
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                10-Minute Comprehensive Fluency & Orthography Simulator
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-1">
                Combines Listening Dictation, Silent-Letter Proofreading, L1 Grammar Error Spotting, and Spoken Response prompts—generating an instant Band/CEFR Score Breakdown with direct links to fix weak areas.
              </p>
            </div>

            {examStarted && !examFinished && (
              <div className="px-4 py-2 rounded-xl bg-[#B91C1C] text-white font-ipa text-sm font-bold inline-flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {Math.floor(examSecondsLeft / 60)}:
                  {String(examSecondsLeft % 60).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          {!examStarted && !examFinished ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#B91C1C]/12 text-[#B91C1C] flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Ready for Your 10-Minute IELTS / PTE / Interview Diagnostic?
              </h3>
              <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] max-w-lg mx-auto">
                You will complete 8 targeted tasks across 4 sections: Listening Dictation, Silent-Letter Proofreading, SVO & Tense Grammar, and Spoken Interview Responses.
              </p>
              <button
                type="button"
                onClick={() => {
                  setExamAnswers({});
                  setExamQuestionIdx(0);
                  setExamSecondsLeft(600);
                  setExamFinished(false);
                  setExamStarted(true);
                }}
                className="min-h-[48px] px-7 py-3 rounded-xl bg-[#B91C1C] text-white text-sm font-semibold hover:bg-[#991B1B] inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start 10-Minute Diagnostic Exam</span>
              </button>
            </div>
          ) : examFinished ? (
            (() => {
              const listeningCorrect = EXAM_DIAGNOSTIC_QUESTIONS.filter(
                (q) => q.section === 'listening' && examAnswers[q.id] === q.correctAnswer
              ).length;
              const proofreadingCorrect = EXAM_DIAGNOSTIC_QUESTIONS.filter(
                (q) => q.section === 'proofreading' && examAnswers[q.id] === q.correctAnswer
              ).length;
              const grammarCorrect = EXAM_DIAGNOSTIC_QUESTIONS.filter(
                (q) => q.section === 'grammar' && examAnswers[q.id] === q.correctAnswer
              ).length;
              const speakingCorrect = EXAM_DIAGNOSTIC_QUESTIONS.filter(
                (q) => q.section === 'speaking' && examAnswers[q.id] === q.correctAnswer
              ).length;
              const totalCorrect =
                listeningCorrect + proofreadingCorrect + grammarCorrect + speakingCorrect;
              const overallPct = Math.round(
                (totalCorrect / EXAM_DIAGNOSTIC_QUESTIONS.length) * 100
              );
              const bandLabel =
                overallPct >= 85
                  ? 'C1 Advanced · IELTS Band 7.5–8.0'
                  : overallPct >= 65
                  ? 'B2 Upper-Intermediate · IELTS Band 6.5–7.0'
                  : 'B1 Intermediate · IELTS Band 5.5–6.0';

              const missedItems = EXAM_DIAGNOSTIC_QUESTIONS.filter(
                (q) => examAnswers[q.id] !== q.correctAnswer
              );

              return (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-center space-y-2">
                    <div className="text-xs font-semibold text-[#15803D] dark:text-emerald-400">
                      Diagnostic Assessment Complete
                    </div>
                    <div className="text-3xl font-bold font-ipa text-[#1C1917] dark:text-[#F5F2EB]">
                      {overallPct}% Overall · {bandLabel}
                    </div>
                    <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                      You answered {totalCorrect} of {EXAM_DIAGNOSTIC_QUESTIONS.length} diagnostic tasks accurately.
                    </p>
                  </div>

                  {/* 4-Pillar Score Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Listening Dictation', score: `${listeningCorrect}/2` },
                      { label: 'Silent Proofreading', score: `${proofreadingCorrect}/2` },
                      { label: 'L1 Grammar & SVO', score: `${grammarCorrect}/2` },
                      { label: 'Spoken Response', score: `${speakingCorrect}/2` },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-center"
                      >
                        <div className="font-ipa text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                          {s.score}
                        </div>
                        <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Targeted Remediation Links */}
                  {missedItems.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                        Targeted Remediation Plan (Click to Fix Weak Areas):
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {missedItems.map((q) => (
                          <div
                            key={q.id}
                            className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-2 text-xs"
                          >
                            <div className="font-semibold text-[#B91C1C] dark:text-[#F87171]">
                              {q.sectionLabel}
                            </div>
                            <div className="text-[#1C1917] dark:text-[#F5F2EB] font-medium">
                              Target: “{q.correctAnswer}”
                            </div>
                            <p className="text-[#57534E] dark:text-[#A8A29E]">{q.explanation}</p>
                            {onOpenLecture && (
                              <button
                                type="button"
                                onClick={() => onOpenLecture(q.recommendedLectureId)}
                                className="min-h-[34px] px-3 py-1.5 rounded-lg bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] font-semibold inline-flex items-center gap-1.5"
                              >
                                <span>Open {q.recommendedLectureTitle}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setExamAnswers({});
                        setExamQuestionIdx(0);
                        setExamSecondsLeft(600);
                        setExamFinished(false);
                        setExamStarted(true);
                      }}
                      className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold inline-flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake 10-Minute Simulator</span>
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            (() => {
              const q = EXAM_DIAGNOSTIC_QUESTIONS[examQuestionIdx];
              const picked = examAnswers[q.id];
              return (
                <div className="space-y-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#B91C1C] dark:text-[#F87171]">
                      {q.sectionLabel}
                    </span>
                    <span className="font-ipa text-[#57534E] dark:text-[#A8A29E]">
                      Task {examQuestionIdx + 1} of {EXAM_DIAGNOSTIC_QUESTIONS.length}
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-3">
                    <div className="text-base sm:text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      {q.prompt}
                    </div>
                    {languageMode !== 'english-only' && (
                      <div className="font-nepali text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
                        {q.nepaliHint}
                      </div>
                    )}

                    {q.audioText && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            speechService.speak(q.audioText!, { rate: preferredSpeechRate })
                          }
                          className="min-h-[40px] px-4 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>Play Exam Audio Prompt (1.0x)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => speechService.speak(q.audioText!, { rate: 0.75 })}
                          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Turtle className="w-4 h-4 text-[#D97706]" />
                          <span>Play Careful (0.75x)</span>
                        </button>

                        {q.section === 'speaking' && (
                          <button
                            type="button"
                            disabled={examMicListening}
                            onClick={async () => {
                              if (!speechService.isRecognitionSupported()) return;
                              try {
                                const res = await speechService.evaluatePronunciation(
                                  q.correctAnswer,
                                  (l) => setExamMicListening(l)
                                );
                                setExamMicResult(res);
                                if (res.score >= 45) {
                                  setExamAnswers((prev) => ({ ...prev, [q.id]: q.correctAnswer }));
                                }
                              } catch {
                                setExamMicListening(false);
                              }
                            }}
                            className={`min-h-[40px] px-4 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 ${
                              examMicListening
                                ? 'bg-[#15803D] text-white border-[#15803D] animate-pulse'
                                : 'bg-white dark:bg-[#1F1C18] border-[#15803D] text-[#15803D]'
                            }`}
                          >
                            <Mic className="w-4 h-4" />
                            <span>
                              {examMicListening ? 'Listening...' : 'Speak Response with Mic'}
                            </span>
                          </button>
                        )}
                      </div>
                    )}

                    {examMicResult && q.section === 'speaking' && (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-[#15803D] text-xs text-[#15803D] dark:text-emerald-300 flex items-center justify-between">
                        <span>You spoke: “{examMicResult.transcript}”</span>
                        <span className="font-ipa font-bold">{examMicResult.score}% Match</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {q.options.map((opt) => {
                      const isSelected = picked === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setExamAnswers((prev) => ({ ...prev, [q.id]: opt }));
                            setExamMicResult(null);
                          }}
                          className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'border-[#B91C1C] bg-[#B91C1C]/10 text-[#1C1917] dark:text-[#F5F2EB] font-semibold ring-1 ring-[#B91C1C]'
                              : 'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924]'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <Check className="w-4 h-4 text-[#B91C1C] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E7E0D6] dark:border-[#2E2924]">
                    <button
                      type="button"
                      disabled={examQuestionIdx === 0}
                      onClick={() => {
                        setExamMicResult(null);
                        setExamQuestionIdx((i) => Math.max(0, i - 1));
                      }}
                      className="min-h-[42px] px-4 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold disabled:opacity-40"
                    >
                      ← Previous Task
                    </button>

                    {examQuestionIdx + 1 < EXAM_DIAGNOSTIC_QUESTIONS.length ? (
                      <button
                        type="button"
                        onClick={() => {
                          setExamMicResult(null);
                          setExamQuestionIdx((i) => i + 1);
                        }}
                        className="min-h-[42px] px-5 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <span>Next Task</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleFinishExam}
                        className="min-h-[42px] px-6 py-2 rounded-xl bg-[#15803D] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit Diagnostic Exam & View Band Report</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </section>
      )}

      {/* =================================================================== */}
      {/* TOOL 12: HANDS-FREE "COMMUTER AUDIO MODE" (PODCAST PLAYER)          */}
      {/* =================================================================== */}
      {activeTool === 'commuter-audio' && (
        <section className="max-w-3xl mx-auto bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D6] dark:border-[#2E2924]">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                <Radio className={`w-4 h-4 ${commuterPlaying ? 'animate-pulse' : ''}`} />
                <span>Hands-Free "Commuter Audio Mode" (Podcast Loop)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                Background-Friendly Vocabulary & Sentence Audio Loop
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-1">
                Speaks each English word at <strong>1.0x</strong>, pauses <strong>2 seconds</strong> for mental recall, speaks it at <strong>0.75x slow phoneme speed</strong>, and reads the example sentence automatically.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'lecture', label: 'Selected Lecture Vocab' },
                  { id: 'saved', label: `Saved Words (${savedWordIds.length})` },
                  { id: 'mistakes', label: `Mistake Notebook (${mistakeNotebook.length})` },
                ] as const
              ).map((src) => (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => {
                    setCommuterSource(src.id);
                    setCommuterTrackIdx(0);
                  }}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold ${
                    commuterSource === src.id
                      ? 'bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] border-transparent'
                      : 'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924]'
                  }`}
                >
                  {src.label}
                </button>
              ))}
            </div>

            {commuterSource === 'lecture' && (
              <select
                value={commuterLectureNum}
                onChange={(e) => {
                  setCommuterLectureNum(Number(e.target.value));
                  setCommuterTrackIdx(0);
                }}
                className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold"
              >
                {lectures.slice(0, 12).map((l) => (
                  <option key={l.id} value={l.lectureNumber}>
                    Lecture {String(l.lectureNumber).padStart(2, '0')}: {l.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {currentCommuterTrack && (
            <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-xs font-ipa">
                <span className="text-[#57534E] dark:text-[#A8A29E]">
                  Track {(commuterTrackIdx % Math.max(1, commuterTracks.length)) + 1} of{' '}
                  {commuterTracks.length}
                </span>
                <span>·</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#B91C1C]/10 text-[#B91C1C] dark:text-[#F87171] font-semibold">
                  {commuterPhase === 'word-1x' && '🔊 1/4 · Word at 1.0x'}
                  {commuterPhase === 'pause-2s' && '⏳ 2/4 · 2s Mental Recall Pause'}
                  {commuterPhase === 'word-075x' && '🐢 3/4 · Word at 0.75x'}
                  {commuterPhase === 'sentence' && '📖 4/4 · Example Sentence'}
                  {commuterPhase === 'idle' && 'Paused / Ready'}
                </span>
              </div>

              <div className="text-3xl sm:text-4xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                {currentCommuterTrack.word}
              </div>
              <div className="font-ipa text-sm text-[#57534E] dark:text-[#A8A29E]">
                {currentCommuterTrack.ipa} · {currentCommuterTrack.silentLettersSummary}
              </div>
              <div className="font-nepali text-lg font-semibold text-[#15803D] dark:text-emerald-400">
                {currentCommuterTrack.nepaliMeaning}
              </div>
              <p className="text-sm text-[#1C1917] dark:text-[#F5F2EB] max-w-lg mx-auto">
                “{currentCommuterTrack.englishExample}”
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (commuterPlaying) {
                      setCommuterPlaying(false);
                      speechService.stop();
                    } else {
                      setCommuterPlaying(true);
                    }
                  }}
                  className={`min-h-[46px] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 ${
                    commuterPlaying
                      ? 'bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917]'
                      : 'bg-[#B91C1C] text-white hover:bg-[#991B1B]'
                  }`}
                >
                  {commuterPlaying ? (
                    <>
                      <Square className="w-4 h-4" />
                      <span>Stop Hands-Free Loop</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Hands-Free Loop</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCommuterTrackIdx((prev) => (prev + 1) % Math.max(1, commuterTracks.length))
                  }
                  className="min-h-[46px] px-4 py-2.5 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <SkipForward className="w-4 h-4" />
                  <span>Skip Track</span>
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =================================================================== */}
      {/* TOOL 13: MINIMAL PAIR EAR-TRAINING & PRONUNCIATION LAB              */}
      {/* =================================================================== */}
      {activeTool === 'minimal-pairs' && (
        <MinimalPairLab
          languageMode={languageMode}
          preferredSpeechRate={preferredSpeechRate}
          onRecordMistake={onRecordMistake}
        />
      )}

      {/* =================================================================== */}
      {/* TOOL 14: PARAGRAPH & EMAIL WRITING CHECKER (INTERFERENCE LINTER)    */}
      {/* =================================================================== */}
      {activeTool === 'writing-linter' && (
        <WritingInterferenceLinter
          languageMode={languageMode}
          preferredSpeechRate={preferredSpeechRate}
          onRecordMistake={onRecordMistake}
        />
      )}

      {/* =================================================================== */}
      {/* TOOL 15: INTERACTIVE IPA MOUTH & TONGUE ARTICULATION GUIDE          */}
      {/* =================================================================== */}
      {activeTool === 'articulation-guide' && (
        <ArticulationGuideLab
          languageMode={languageMode}
          preferredSpeechRate={preferredSpeechRate}
        />
      )}

      {/* =================================================================== */}
      {/* TOOL 16: DICTATION & LISTENING COMPREHENSION PASSAGE STUDIO         */}
      {/* =================================================================== */}
      {activeTool === 'dictation-studio' && (
        <DictationPassageStudio
          languageMode={languageMode}
          preferredSpeechRate={preferredSpeechRate}
          onRecordMistake={onRecordMistake}
        />
      )}
    </div>
  );
};
