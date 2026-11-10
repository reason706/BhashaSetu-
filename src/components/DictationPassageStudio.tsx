import React, { useState, useMemo } from 'react';
import {
  Volume2,
  Turtle,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Headphones,
  Award,
} from 'lucide-react';
import { LanguageMode, MistakeItem, CEFRLevel } from '../types/curriculum';
import { speechService } from '../services/speech';

interface DictationPassageItem {
  id: string;
  title: string;
  nepaliTitle: string;
  level: CEFRLevel;
  domain: string;
  englishTranscript: string;
  nepaliTranslation: string;
  silentWordsMap: Record<string, { rule: string; ipa: string }>;
  comprehensionQuestion: {
    prompt: string;
    nepaliPrompt: string;
    options: string[];
    correctAnswer: string;
  };
}

const DICTATION_PASSAGES: DictationPassageItem[] = [
  {
    id: 'dict-b1-plumber-schedule',
    title: 'Passage 01: The Wednesday Maintenance Receipt',
    nepaliTitle: 'अनुच्छेद ०१: बुधबारको मर्मत रसिद र समय तालिका',
    level: 'B1',
    domain: 'Workplace & Daily Administration',
    englishTranscript:
      'On Wednesday morning, our honest plumber fixed the subtle leak near the kitchen cupboard and signed the official receipt.',
    nepaliTranslation:
      'बुधबार बिहान हाम्रा इमानदार प्लम्बरले भान्साको दराज नजिकैको सूक्ष्म चुहावट मर्मत गरे र आधिकारिक रसिदमा हस्ताक्षर गरे।',
    silentWordsMap: {
      wednesday: { rule: 'Silent middle "d" and "e"', ipa: '/ˈwenz.deɪ/' },
      honest: { rule: 'Silent initial "h"', ipa: '/ˈɒn.ɪst/' },
      plumber: { rule: 'Silent "b" after "m"', ipa: '/ˈplʌm.ər/' },
      subtle: { rule: 'Silent "b" before "t"', ipa: '/ˈsʌt.əl/' },
      cupboard: { rule: 'Silent "p" before "b"', ipa: '/ˈkʌb.əd/' },
      receipt: { rule: 'Silent "p" before "t" + EI after C', ipa: '/rɪˈsiːt/' },
    },
    comprehensionQuestion: {
      prompt: 'What document did the plumber sign after repairing the leak?',
      nepaliPrompt: 'चुहावट मर्मत गरेपछि प्लम्बरले कुन कागजातमा हस्ताक्षर गरे?',
      options: [
        'The official receipt',
        'A bank mortgage contract',
        'A boarding pass',
        'A university syllabus',
      ],
      correctAnswer: 'The official receipt',
    },
  },
  {
    id: 'dict-b2-mortgage-committee',
    title: 'Passage 02: Parliamentary Budget & Mortgage Review',
    nepaliTitle: 'अनुच्छेद ०२: संसदीय बजेट र घरजग्गा धितो समीक्षा',
    level: 'B2',
    domain: 'Banking, Finance & Governance',
    englishTranscript:
      'Without a doubt, the parliamentary committee reviewed the autumn budget and approved the mortgage alignment for rural households.',
    nepaliTranslation:
      'निस्सन्देह, संसदीय समितिले शरद ऋतुको बजेट समीक्षा गर्यो र ग्रामीण घरधुरीका लागि धितो कर्जा समायोजन स्वीकृत गर्यो।',
    silentWordsMap: {
      doubt: { rule: 'Silent "b" before "t"', ipa: '/daʊt/' },
      parliamentary: { rule: 'Silent "i" in "-lia-"', ipa: '/ˌpɑː.ləˈmen.tər.i/' },
      committee: { rule: 'Double MM, double TT, double EE', ipa: '/kəˈmɪt.i/' },
      autumn: { rule: 'Silent final "n" after "m"', ipa: '/ˈɔː.təm/' },
      budget: { rule: 'Silent "d" before "g"', ipa: '/ˈbʌdʒ.ɪt/' },
      mortgage: { rule: 'Silent "t" before "g"', ipa: '/ˈmɔː.ɡɪdʒ/' },
      alignment: { rule: 'Silent "g" before "n"', ipa: '/əˈlaɪn.mənt/' },
    },
    comprehensionQuestion: {
      prompt: 'Which group benefited from the approved mortgage alignment?',
      nepaliPrompt: 'स्वीकृत धितो कर्जा समायोजनबाट कुन समूह लाभान्वित भयो?',
      options: [
        'Rural households',
        'International airlines',
        'Private art galleries',
        'Maritime shipping crews',
      ],
      correctAnswer: 'Rural households',
    },
  },
  {
    id: 'dict-c1-diplomatic-rapport',
    title: 'Passage 03: Diplomatic Rapport & Conscientious Dialogue',
    nepaliTitle: 'अनुच्छेद ०३: कूटनीतिक सुमधुर सम्बन्ध र कर्तव्यनिष्ठ संवाद',
    level: 'C1',
    domain: 'Executive Leadership & IELTS Academic Listening',
    englishTranscript:
      'Conscientious diplomats build genuine rapport with foreign colleagues and remain discreet during solemn treaty negotiations.',
    nepaliTranslation:
      'कर्तव्यनिष्ठ कूटनीतिज्ञहरूले विदेशी सहकर्मीहरूसँग वास्तविक सुमधुर सम्बन्ध बनाउँछन् र गम्भीर सन्धि वार्ताका क्रममा गोपनीयता कायम राख्छन्।',
    silentWordsMap: {
      conscientious: { rule: 'Spelled "-scien-" (/ˌkɒn.ʃiˈen.ʃəs/)', ipa: '/ˌkɒn.ʃiˈen.ʃəs/' },
      rapport: { rule: 'Silent final "t" (French loanword)', ipa: '/ræˈpɔːr/' },
      colleagues: { rule: 'Silent final "-ue" after "g"', ipa: '/ˈkɒl.iːɡz/' },
      discreet: { rule: 'Spelled "-eet" (careful/tactful)', ipa: '/dɪˈskriːt/' },
      solemn: { rule: 'Silent final "n" after "m"', ipa: '/ˈsɒl.əm/' },
    },
    comprehensionQuestion: {
      prompt: 'How do conscientious diplomats behave during solemn treaty negotiations?',
      nepaliPrompt: 'गम्भीर सन्धि वार्ताका क्रममा कर्तव्यनिष्ठ कूटनीतिज्ञहरू कस्तो व्यवहार गर्छन्?',
      options: [
        'They remain discreet and build genuine rapport',
        'They publish confidential drafts immediately',
        'They cancel all bilateral meetings',
        'They avoid speaking with foreign colleagues',
      ],
      correctAnswer: 'They remain discreet and build genuine rapport',
    },
  },
];

interface WordDiffToken {
  expectedRaw: string;
  expectedClean: string;
  userTypedClean: string;
  status: 'exact' | 'silent-letter-error' | 'function-word-error' | 'misspelled';
  silentMeta?: { rule: string; ipa: string };
}

interface DictationPassageStudioProps {
  languageMode: LanguageMode;
  preferredSpeechRate: number;
  onRecordMistake?: (mistake: Omit<MistakeItem, 'id' | 'consecutiveCorrect' | 'createdAt'>) => void;
}

export const DictationPassageStudio: React.FC<DictationPassageStudioProps> = ({
  languageMode,
  preferredSpeechRate,
  onRecordMistake,
}) => {
  const [selectedPassageId, setSelectedPassageId] = useState<string>(DICTATION_PASSAGES[0].id);
  const [userInput, setUserInput] = useState<string>('');
  const [selectedCompOption, setSelectedCompOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [playCount, setPlayCount] = useState<number>(0);

  const showNepali = languageMode !== 'english-only';

  const activePassage = useMemo(
    () => DICTATION_PASSAGES.find((p) => p.id === selectedPassageId) || DICTATION_PASSAGES[0],
    [selectedPassageId]
  );

  const handleSelectPassage = (id: string) => {
    setSelectedPassageId(id);
    setUserInput('');
    setSelectedCompOption(null);
    setIsSubmitted(false);
    setPlayCount(0);
  };

  const handlePlayPassage = (rate: number) => {
    setPlayCount((prev) => prev + 1);
    speechService.speakSentence(activePassage.englishTranscript, rate);
  };

  const diffResults = useMemo((): {
    tokens: WordDiffToken[];
    accuracyPercent: number;
    silentWordsAccurate: number;
    silentWordsTotal: number;
  } => {
    const expectedWords = activePassage.englishTranscript.split(/\s+/);
    const userWords = userInput
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.replace(/[.,!?;:]/g, '').toLowerCase());

    const functionWords = new Set(['on', 'the', 'a', 'an', 'and', 'for', 'with', 'in', 'to', 'of', 'our']);
    let exactCount = 0;
    let silentTotal = 0;
    let silentCorrect = 0;

    const tokens: WordDiffToken[] = expectedWords.map((rawWord, idx) => {
      const cleanExpected = rawWord.replace(/[.,!?;:]/g, '').toLowerCase();
      const silentMeta = activePassage.silentWordsMap[cleanExpected];
      if (silentMeta) silentTotal++;

      // Match either at same index or within +/- 2 word window
      const exactWindowMatch = [idx, idx - 1, idx + 1, idx - 2, idx + 2].some(
        (i) => i >= 0 && i < userWords.length && userWords[i] === cleanExpected
      );
      const userAtPos = userWords[idx] || '';

      if (exactWindowMatch) {
        exactCount++;
        if (silentMeta) silentCorrect++;
        return {
          expectedRaw: rawWord,
          expectedClean: cleanExpected,
          userTypedClean: cleanExpected,
          status: 'exact',
          silentMeta,
        };
      }

      if (silentMeta) {
        return {
          expectedRaw: rawWord,
          expectedClean: cleanExpected,
          userTypedClean: userAtPos || '(omitted)',
          status: 'silent-letter-error',
          silentMeta,
        };
      }

      if (functionWords.has(cleanExpected)) {
        return {
          expectedRaw: rawWord,
          expectedClean: cleanExpected,
          userTypedClean: userAtPos || '(omitted)',
          status: 'function-word-error',
        };
      }

      return {
        expectedRaw: rawWord,
        expectedClean: cleanExpected,
        userTypedClean: userAtPos || '(omitted)',
        status: 'misspelled',
      };
    });

    const accuracyPercent =
      expectedWords.length > 0 ? Math.round((exactCount / expectedWords.length) * 100) : 0;

    return {
      tokens,
      accuracyPercent,
      silentWordsAccurate: silentCorrect,
      silentWordsTotal: silentTotal,
    };
  }, [activePassage, userInput]);

  const handleGradeDictation = () => {
    if (!userInput.trim()) return;
    setIsSubmitted(true);

    // Log any missed silent-letter words to Mistake Notebook
    if (onRecordMistake) {
      diffResults.tokens
        .filter((t) => t.status === 'silent-letter-error')
        .forEach((missed) => {
          onRecordMistake({
            lectureId: 'dictation-studio',
            lectureNumber: activePassage.level === 'B1' ? 1 : activePassage.level === 'B2' ? 4 : 6,
            category: 'dictation',
            sourceType: 'dictation',
            prompt: `Dictation Silent-Letter Target: "${missed.expectedRaw.replace(/[.,!?;:]/g, '')}" (${missed.silentMeta?.ipa || ''})`,
            nepaliHint: activePassage.nepaliTranslation,
            userWrongAnswer: missed.userTypedClean,
            correctAnswer: missed.expectedRaw.replace(/[.,!?;:]/g, ''),
            explanation: missed.silentMeta?.rule || 'Check silent consonant orthography.',
          });
        });
    }
  };

  return (
    <div className="bg-white dark:bg-[#1C1917] rounded-2xl border border-[#E6E0D4] dark:border-stone-800 p-5 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E6E0D4] dark:border-stone-800 pb-5">
        <div>
          <p className="text-xs font-semibold text-[#9E2A2B] dark:text-red-400">
            Multi-Speed Acoustic Dictation & Orthographic Diff Engine
          </p>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            Dictation & Listening Comprehension Passage Studio
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
            Listen to complete B1–C1 passages at normal or slow speed, transcribe what you hear, and inspect word-by-word diagnostics for silent letters and unstressed function words.
          </p>
        </div>

        {/* Passage Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 self-start">
          {DICTATION_PASSAGES.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPassage(p.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                p.id === selectedPassageId
                  ? 'bg-stone-900 dark:bg-amber-600 text-white border-stone-900 dark:border-amber-500'
                  : 'bg-[#FAF7F2] dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-[#E6E0D4] dark:border-stone-800 hover:border-stone-400'
              }`}
            >
              {p.level} · {p.title.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Audio Deck */}
      <div className="rounded-2xl border border-[#E6E0D4] dark:border-stone-800 bg-[#FAF7F2] dark:bg-stone-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono text-[#9E2A2B] dark:text-amber-400 font-bold">
            {activePassage.level} Track · {activePassage.domain} · Played {playCount}x
          </div>
          <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
            {activePassage.title}
          </h4>
          {showNepali && (
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {activePassage.nepaliTitle}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handlePlayPassage(preferredSpeechRate)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9E2A2B] text-white text-xs font-bold hover:bg-red-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Volume2 className="w-4 h-4" />
            Play Passage (1.0x)
          </button>
          <button
            onClick={() => handlePlayPassage(0.8)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-800 text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0"
          >
            <Headphones className="w-4 h-4" />
            0.80x Clear
          </button>
          <button
            onClick={() => handlePlayPassage(0.65)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-[#E6E0D4] dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Turtle className="w-4 h-4" />
            0.65x Slow Phonemes
          </button>
        </div>
      </div>

      {/* Dictation Input & Comprehension Question */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          <label className="block text-xs font-bold text-stone-900 dark:text-stone-100">
            Step 1: Type the Exact English Sentence You Hear (Watch Silent Consonants!)
          </label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={4}
            placeholder="Listen to the passage above and type every word here..."
            className="w-full rounded-xl border border-[#E6E0D4] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 p-4 text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-relaxed focus:outline-none focus:border-stone-900 dark:focus:border-amber-500"
          />
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setUserInput('');
                setIsSubmitted(false);
                setSelectedCompOption(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Attempt
            </button>
            <button
              onClick={handleGradeDictation}
              disabled={!userInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer disabled:opacity-40 whitespace-nowrap shrink-0"
            >
              Check Dictation & Silent Letters
            </button>
          </div>
        </div>

        {/* Step 2: Listening Comprehension Check */}
        <div className="lg:col-span-5 rounded-xl border border-[#E6E0D4] dark:border-stone-800 bg-[#FAF7F2] dark:bg-stone-900 p-4 space-y-3">
          <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
            Step 2: Listening Comprehension Check
          </div>
          <p className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
            {activePassage.comprehensionQuestion.prompt}
          </p>
          {showNepali && (
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {activePassage.comprehensionQuestion.nepaliPrompt}
            </p>
          )}
          <div className="space-y-2 pt-1">
            {activePassage.comprehensionQuestion.options.map((opt) => {
              const isSelected = selectedCompOption === opt;
              const isCorrect = opt === activePassage.comprehensionQuestion.correctAnswer;
              let btnClass =
                'border-[#E6E0D4] dark:border-stone-800 bg-white dark:bg-[#1C1917] text-stone-800 dark:text-stone-200';
              if (selectedCompOption !== null) {
                if (isCorrect) {
                  btnClass =
                    'border-[#2D6A4F] bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                } else if (isSelected) {
                  btnClass =
                    'border-[#9E2A2B] bg-red-50/80 dark:bg-red-950/40 text-red-900 dark:text-red-200';
                }
              }
              return (
                <button
                  key={opt}
                  onClick={() => setSelectedCompOption(opt)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs transition-all cursor-pointer ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Diagnostic Diff Report */}
      {isSubmitted && (
        <div className="rounded-2xl border border-[#E6E0D4] dark:border-stone-800 bg-[#FAF7F2] dark:bg-stone-900 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6E0D4] dark:border-stone-800 pb-3">
            <div>
              <h5 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Word-by-Word Orthographic & Silent-Letter Diagnostic
              </h5>
              {showNepali && (
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                  र्थ: {activePassage.nepaliTranslation}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
              <span>
                Overall Accuracy: <strong>{diffResults.accuracyPercent}%</strong>
              </span>
              <span>·</span>
              <span>
                Silent-Letter Targets:{' '}
                <strong>
                  {diffResults.silentWordsAccurate}/{diffResults.silentWordsTotal}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {diffResults.tokens.map((tok, idx) => {
              const colorClass =
                tok.status === 'exact'
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                  : tok.status === 'silent-letter-error'
                  ? 'border-red-300 dark:border-red-800 bg-red-50/80 dark:bg-red-950/30 text-[#9E2A2B] dark:text-red-300'
                  : 'border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200';

              return (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg border text-xs ${colorClass}`}
                  title={tok.silentMeta ? `${tok.silentMeta.ipa} — ${tok.silentMeta.rule}` : undefined}
                >
                  <div className="font-bold">{tok.expectedRaw}</div>
                  {tok.status !== 'exact' && (
                    <div className="text-[10px] font-mono opacity-80">
                      typed: {tok.userTypedClean}
                    </div>
                  )}
                  {tok.silentMeta && (
                    <div className="text-[10px] font-mono mt-0.5 underline">
                      {tok.silentMeta.rule}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
