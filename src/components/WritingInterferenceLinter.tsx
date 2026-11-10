import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  FileText,
  Volume2,
} from 'lucide-react';
import { LanguageMode, MistakeItem } from '../types/curriculum';
import { speechService } from '../services/speech';

export type LinterRuleCategory =
  | 'stative-progressive'
  | 'silent-letter-spelling'
  | 'postposition-preposition'
  | 'article-redundancy';

interface LinterPatternRule {
  id: string;
  category: LinterRuleCategory;
  categoryLabel: string;
  regex: RegExp;
  replacement: string;
  ruleTitle: string;
  explanationEn: string;
  explanationNe: string;
}

const NEPALI_INTERFERENCE_RULES: LinterPatternRule[] = [
  // 1. Stative Verb Progressive Overuse
  {
    id: 'rule-having-doubt',
    category: 'stative-progressive',
    categoryLabel: 'Stative Verb Trap',
    regex: /\b(I am|we are|he is|she is|they are) having (a |some )?(doubt|doubts|question|problem|car|house|laptop)\b/gi,
    replacement: 'have a $3',
    ruleTitle: 'Avoid "am/is/are having" for possession or mental states',
    explanationEn:
      'In English, "have" (meaning possess or experience a doubt/question) is a stative verb and takes Simple Present ("I have a question / doubt"), not Present Continuous.',
    explanationNe:
      'नेपालीमा "मसँग प्रश्न/शङ्का छ" भन्नुपर्दा अङ्ग्रेजीमा "I am having" होइन, साधारण वर्तमान काल ("I have a question/doubt") प्रयोग गर्नुपर्छ।',
  },
  {
    id: 'rule-knowing',
    category: 'stative-progressive',
    categoryLabel: 'Stative Verb Trap',
    regex: /\b(I am|we are|he is|she is) knowing\b/gi,
    replacement: 'know',
    ruleTitle: '"Know" is a mental state verb (never "am knowing")',
    explanationEn:
      'Mental state verbs like "know", "understand", and "believe" never use "-ing" in standard English.',
    explanationNe:
      '"Know" (थाहा पाउनु) मानसिक अवस्था जनाउने क्रिया हो, यसमा कहिल्यै "-ing" ("am knowing") लाग्दैन; सधैँ "know" मात्र लेख्नुहोस्।',
  },
  {
    id: 'rule-understanding',
    category: 'stative-progressive',
    categoryLabel: 'Stative Verb Trap',
    regex: /\b(I am|we are) understanding\b/gi,
    replacement: 'I understand',
    ruleTitle: 'Use "I understand" instead of "I am understanding"',
    explanationEn:
      'Use Simple Present ("I understand") to express comprehension.',
    explanationNe:
      '"मैले बुझिरहेको छु" भन्न अङ्ग्रेजीमा "I am understanding" होइन "I understand" लेखिन्छ।',
  },
  {
    id: 'rule-belonging',
    category: 'stative-progressive',
    categoryLabel: 'Stative Verb Trap',
    regex: /\b(I am belonging to|is belonging to)\b/gi,
    replacement: 'belong to',
    ruleTitle: 'Use "belong to" instead of "am/is belonging to"',
    explanationEn:
      '"Belong" expresses permanent affiliation or ownership and cannot be used in the continuous tense.',
    explanationNe:
      '"म पोखराबाट हुँ / सम्बन्धित छु" भन्न "I am belonging to" गलत हुन्छ; "I belong to" वा "I am from" प्रयोग गर्नुहोस्।',
  },

  // 2. Silent-Letter & High-Frequency Spelling Traps
  {
    id: 'rule-recieve',
    category: 'silent-letter-spelling',
    categoryLabel: 'Silent-Letter & EI/IE Spelling',
    regex: /\brecieve(d|s|r)?\b/gi,
    replacement: 'receive$1',
    ruleTitle: 'I before E except after C ("receive")',
    explanationEn:
      'After the letter C, the /iː/ vowel sound is always spelled EI ("receive", "receipt", "ceiling").',
    explanationNe:
      '"C" अक्षरपछि ई (/iː/) ध्वनि आउँदा सधैँ "EI" लेखिन्छ ("receive", "receipt"), "IE" होइन।',
  },
  {
    id: 'rule-reciept',
    category: 'silent-letter-spelling',
    categoryLabel: 'Silent-Letter & EI/IE Spelling',
    regex: /\b(reciept|receit)\b/gi,
    replacement: 'receipt',
    ruleTitle: 'Silent "p" + EI after C in "receipt"',
    explanationEn:
      '"Receipt" has both "EI" after C and a silent "p" before "t" (/rɪˈsiːt/).',
    explanationNe:
      '"Receipt" (/rɪˈsiːt/) मा C पछि EI आउँछ र "t" अगाडि मौन "p" अनिवार्य हुन्छ।',
  },
  {
    id: 'rule-wednesday',
    category: 'silent-letter-spelling',
    categoryLabel: 'Silent-Letter & EI/IE Spelling',
    regex: /\b(wensday|wednsday)\b/gi,
    replacement: 'Wednesday',
    ruleTitle: 'Silent middle "d" and "e" in "Wednesday"',
    explanationEn:
      'Even though "Wednesday" is pronounced in 2 syllables (/ˈwenz.deɪ/), it retains "d-n-e-s" in spelling.',
    explanationNe:
      'उच्चारण "वेन्ज्-डे" भए पनि स्पेलिङमा बीचको मौन "d" र "e" (Wed-nes-day) छुटाउनु हुँदैन।',
  },
  {
    id: 'rule-enviroment',
    category: 'silent-letter-spelling',
    categoryLabel: 'Silent-Letter & EI/IE Spelling',
    regex: /\benviroment\b/gi,
    replacement: 'environment',
    ruleTitle: 'Silent/reduced "n" before "m" in "environment"',
    explanationEn:
      'Remember the "n" before "m" in "environ-ment" and "govern-ment".',
    explanationNe:
      '"Environment" र "Government" मा "m" भन्दा अगाडि "n" अक्षर अनिवार्य हुन्छ।',
  },
  {
    id: 'rule-goverment',
    category: 'silent-letter-spelling',
    categoryLabel: 'Silent-Letter & EI/IE Spelling',
    regex: /\bgoverment\b/gi,
    replacement: 'government',
    ruleTitle: 'Retain the "n" in "government"',
    explanationEn:
      'Derived from "govern" + "-ment" -> "government".',
    explanationNe:
      '"Govern" मा "-ment" जोडिएर बनेको हुनाले बीचको "n" छुटाउनु हुँदैन ("government")।',
  },
  {
    id: 'rule-pronounciation',
    category: 'silent-letter-spelling',
    categoryLabel: 'Silent-Letter & EI/IE Spelling',
    regex: /\bpronounciation\b/gi,
    replacement: 'pronunciation',
    ruleTitle: 'Spelled "pronunciation" (n-u-n, not n-o-u-n)',
    explanationEn:
      'While the verb is "pronounce", the noun drops the "o" and becomes "pronunciation" (/prəˌnʌn.siˈeɪ.ʃən/).',
    explanationNe:
      'क्रियामा "pronounce" भए पनि नाम पदमा "o" हटेर "pronunciation" (प्र-नन्-सि-ए-शन्) मात्र लेखिन्छ।',
  },
  {
    id: 'rule-seperate',
    category: 'silent-letter-spelling',
    categoryLabel: 'Silent-Letter & EI/IE Spelling',
    regex: /\bseperat(e|ed|ely|ion)\b/gi,
    replacement: 'separat$1',
    ruleTitle: 'Schwa vowel trap: "separate" has an "a" in the middle',
    explanationEn:
      'The unstressed middle syllable sounds like a schwa (/ə/), but is spelled "sep-A-rate".',
    explanationNe:
      'बीचको अक्षर अस्पष्ट सुनिए पनि स्पेलिङमा "sep-a-rate" ("a" अक्षर) लेखिन्छ।',
  },
  {
    id: 'rule-accomodate',
    category: 'silent-letter-spelling',
    categoryLabel: 'Silent-Letter & EI/IE Spelling',
    regex: /\b(accomodate|acommodate)\b/gi,
    replacement: 'accommodate',
    ruleTitle: 'Double CC and Double MM in "accommodate"',
    explanationEn:
      '"Accommodate" requires both double C and double M.',
    explanationNe:
      '"Accommodate" मा दुईवटा C (cc) र दुईवटा M (mm) दुवै हुन्छन्।',
  },

  // 3. Nepali Postposition-to-Preposition Interference
  {
    id: 'rule-discuss-about',
    category: 'postposition-preposition',
    categoryLabel: 'Nepali Postposition Interference',
    regex: /\bdiscuss(ed|ing|es)? about\b/gi,
    replacement: 'discuss$1',
    ruleTitle: 'Never use "about" after the verb "discuss"',
    explanationEn:
      'In Nepali we say "को बारेमा छलफल गर्नु" (which translates literally to "discuss about"), but English "discuss" is a transitive verb that already means "talk about".',
    explanationNe:
      'नेपालीमा "बारेमा छलफल गर्नु" भनिने हुनाले "discuss about" लेख्ने बानी हुन्छ, तर अङ्ग्रेजीमा "discuss" पछि "about" कहिल्यै लाग्दैन।',
  },
  {
    id: 'rule-return-back',
    category: 'postposition-preposition',
    categoryLabel: 'Nepali Postposition Interference',
    regex: /\b(return|returned|returning) back\b/gi,
    replacement: '$1',
    ruleTitle: 'Avoid redundant "back" after "return"',
    explanationEn:
      '"Return" already means "go/give back". Writing "return back" is redundant.',
    explanationNe:
      '"Return" को अर्थ नै "फिर्ता हुनु/दिनु" हो, त्यसैले यसपछि "back" थप्नु अनावश्यक पुनरावृत्ति हो।',
  },
  {
    id: 'rule-reply-back',
    category: 'postposition-preposition',
    categoryLabel: 'Nepali Postposition Interference',
    regex: /\b(reply|replied|revert) back\b/gi,
    replacement: 'reply',
    ruleTitle: 'Use "reply" (not "reply back" or "revert back")',
    explanationEn:
      'In professional emails, write "Please reply at your earliest convenience" rather than "reply back" or "revert back".',
    explanationNe:
      'औपचारिक इमेलमा "reply back" वा "revert back" को सट्टा केवल "reply" प्रयोग गर्नुहोस्।',
  },
  {
    id: 'rule-cope-up',
    category: 'postposition-preposition',
    categoryLabel: 'Nepali Postposition Interference',
    regex: /\bcope up with\b/gi,
    replacement: 'cope with',
    ruleTitle: 'The phrasal expression is "cope with" (never "cope up with")',
    explanationEn:
      'Drop "up": native English always uses "cope with stress/challenges".',
    explanationNe:
      'कठिनाइको सामना गर्नु भन्न "cope up with" होइन, सधैँ "cope with" मात्र प्रयोग गरिन्छ।',
  },
  {
    id: 'rule-in-monday',
    category: 'postposition-preposition',
    categoryLabel: 'Nepali Postposition Interference',
    regex: /\bin (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/gi,
    replacement: 'on $1',
    ruleTitle: 'Use "on" (not "in") before days of the week',
    explanationEn:
      'Nepali "-मा" maps to "in" for months/years, "on" for specific days ("on Wednesday"), and "at" for clock times.',
    explanationNe:
      'नेपालीमा सबैमा "-मा" लागे पनि अङ्ग्रेजीमा बारको नामअगाडि सधैँ "on" ("on Wednesday") प्रयोग हुन्छ।',
  },

  // 4. Article & South Asian Collocation Traps
  {
    id: 'rule-give-exam',
    category: 'article-redundancy',
    categoryLabel: 'L1 Collocation & Register Trap',
    regex: /\b(give|giving|gave) (an |the |my )?(exam|examination|test|IELTS)\b/gi,
    replacement: 'take $2$3',
    ruleTitle: 'Students "take" or "sit" an exam (teachers "give" exams)',
    explanationEn:
      'In Nepali ("परीक्षा दिनु"), students "give" an exam. In international English, students "take" or "sit for" an exam, while teachers/examiners "give" or "administer" it.',
    explanationNe:
      'नेपालीमा विद्यार्थीले "परीक्षा दिनु" भनिए पनि अङ्ग्रेजीमा विद्यार्थीले परीक्षा दिँदा "take an exam" वा "sit for an exam" भनिन्छ।',
  },
  {
    id: 'rule-according-to-me',
    category: 'article-redundancy',
    categoryLabel: 'L1 Collocation & Register Trap',
    regex: /\baccording to me\b/gi,
    replacement: 'in my opinion',
    ruleTitle: 'Use "in my opinion" instead of "according to me"',
    explanationEn:
      '"According to..." is used only for external sources or authors ("According to the report..."). For your own view, use "In my opinion" or "In my view".',
    explanationNe:
      '"मेरै विचारमा" भन्न अङ्ग्रेजीमा "According to me" भनिँदैन; "In my opinion" वा "From my perspective" प्रयोग गर्नुहोस्।',
  },
];

interface DetectedIssue {
  id: string;
  rule: LinterPatternRule;
  matchedText: string;
  suggestedText: string;
  index: number;
}

interface WritingPresetSample {
  id: string;
  title: string;
  nepaliTitle: string;
  text: string;
}

const PRESET_WRITING_SAMPLES: WritingPresetSample[] = [
  {
    id: 'sample-workplace-email',
    title: 'Sample 1: Workplace Project & Receipt Email',
    nepaliTitle: 'नमुना १: कार्यालयको इमेल (मौन अक्षर र व्याकरण त्रुटि सहित)',
    text: `Dear Manager,\n\nI am having a doubt regarding the budget schedule that we discussed about in Wensday. Did you recieve the payment reciept from the vendor? Please reply back when you return back to the office so we can seperate the accounts.\n\nBest regards,\nAarav`,
  },
  {
    id: 'sample-ielts-paragraph',
    title: 'Sample 2: IELTS Academic Opinion Paragraph',
    nepaliTitle: 'नमुना २: IELTS निबन्ध अनुच्छेद (नेपाली मातृभाषा प्रभाव सहित)',
    text: `According to me, protecting the mountain enviroment is the responsibility of both citizens and the goverment. Many students are knowing that climate change is creating severe challenges, and rural communities cannot cope up with sudden floods. Next month, I am going to give my IELTS exam to study environmental science.`,
  },
  {
    id: 'sample-pronunciation-note',
    title: 'Sample 3: Seminar & Accommodation Request',
    nepaliTitle: 'नमुना ३: सेमिनार र आवास अनुरोध पत्र',
    text: `Hello Coordinator,\n\nI am belonging to Pokhara and I am understanding the seminar rules. Can the university accomodate three delegates in Monday? Also, I want to improve my English pronounciation before the presentation.`,
  },
];

interface WritingInterferenceLinterProps {
  languageMode: LanguageMode;
  preferredSpeechRate: number;
  onRecordMistake?: (mistake: Omit<MistakeItem, 'id' | 'consecutiveCorrect' | 'createdAt'>) => void;
}

export const WritingInterferenceLinter: React.FC<WritingInterferenceLinterProps> = ({
  languageMode,
  preferredSpeechRate,
  onRecordMistake,
}) => {
  const [draftText, setDraftText] = useState<string>(PRESET_WRITING_SAMPLES[0].text);
  const [copiedPolished, setCopiedPolished] = useState<boolean>(false);
  const [fixedCountSession, setFixedCountSession] = useState<number>(0);

  const showNepali = languageMode !== 'english-only';

  const detectedIssues = useMemo(() => {
    const issues: {
      id: string;
      rule: LinterPatternRule;
      matchedText: string;
      suggestedText: string;
      index: number;
    }[] = [];

    for (const rule of NEPALI_INTERFERENCE_RULES) {
      const globalRegex = new RegExp(rule.regex.source, rule.regex.flags);
      let match: RegExpExecArray | null;
      while ((match = globalRegex.exec(draftText)) !== null) {
        const matchedStr = match[0];
        const suggested = matchedStr.replace(new RegExp(rule.regex.source, 'i'), rule.replacement);
        issues.push({
          id: `${rule.id}-${match.index}`,
          rule,
          matchedText: matchedStr,
          suggestedText: suggested,
          index: match.index,
        });
      }
    }

    return issues.sort((a, b) => a.index - b.index);
  }, [draftText]);

  const applySingleFix = (issue: (typeof detectedIssues)[number]) => {
    const before = draftText.slice(0, issue.index);
    const after = draftText.slice(issue.index + issue.matchedText.length);
    setDraftText(`${before}${issue.suggestedText}${after}`);
    setFixedCountSession((prev) => prev + 1);
  };

  const applyAllFixes = () => {
    let updated = draftText;
    for (const rule of NEPALI_INTERFERENCE_RULES) {
      updated = updated.replace(rule.regex, rule.replacement);
    }
    setFixedCountSession((prev) => prev + detectedIssues.length);
    setDraftText(updated);
  };

  const handleCopyPolished = async () => {
    try {
      await navigator.clipboard.writeText(draftText);
      setCopiedPolished(true);
      setTimeout(() => setCopiedPolished(false), 2000);
    } catch {
      // Fallback
    }
  };

  const wordCount = useMemo(() => {
    const trimmed = draftText.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [draftText]);

  return (
    <div className="bg-white dark:bg-[#1C1917] rounded-2xl border border-[#E6E0D4] dark:border-stone-800 p-5 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E6E0D4] dark:border-stone-800 pb-5">
        <div>
          <p className="text-xs font-semibold text-[#9E2A2B] dark:text-red-400">
            L1 Interference & Silent-Letter Proofreading Engine
          </p>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            Paragraph & Email Writing Checker (Nepali-to-English Linter)
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
            Paste or write any email, IELTS essay paragraph, or message. The deterministic linter detects Nepali postposition habits, stative verb overuse (<em>“I am having”</em>), and silent-letter spelling traps in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start">
          {PRESET_WRITING_SAMPLES.map((sample, idx) => (
            <button
              key={sample.id}
              onClick={() => setDraftText(sample.text)}
              className="px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 border border-[#E6E0D4] dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 hover:border-stone-400 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Load Sample {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Editor & Diagnostics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Writing Canvas */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-mono tabular-nums">
            <span>
              Words: <strong className="text-stone-900 dark:text-stone-100">{wordCount}</strong> · Issues Detected:{' '}
              <strong
                className={
                  detectedIssues.length > 0
                    ? 'text-[#9E2A2B] dark:text-red-400'
                    : 'text-[#2D6A4F] dark:text-emerald-400'
                }
              >
                {detectedIssues.length}
              </strong>
            </span>
            <span>Fixes Applied: {fixedCountSession}</span>
          </div>

          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            rows={10}
            placeholder="Type or paste your English email, essay paragraph, or cover letter here..."
            className="w-full rounded-xl border border-[#E6E0D4] dark:border-stone-700 bg-[#FAF7F2] dark:bg-stone-900 p-4 text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-relaxed focus:outline-none focus:border-stone-900 dark:focus:border-amber-500 transition-colors"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => speechService.speakSentence(draftText, preferredSpeechRate)}
                disabled={!draftText.trim()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 dark:bg-amber-600 text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-40"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Read Draft Aloud
              </button>
              <button
                onClick={handleCopyPolished}
                disabled={!draftText.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 border border-[#E6E0D4] dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {copiedPolished ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Text
                  </>
                )}
              </button>
            </div>

            {detectedIssues.length > 0 && (
              <button
                onClick={applyAllFixes}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Fix All {detectedIssues.length} Issues Instantly
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Diagnostic Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
            <span>Real-Time Grammar & Spelling Diagnostics</span>
            <span className="font-mono text-stone-500">{detectedIssues.length} active</span>
          </div>

          {detectedIssues.length === 0 ? (
            <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#2D6A4F] dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                Zero Nepali-Interference or Silent-Letter Errors Found!
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Your paragraph uses natural English verb tenses, accurate prepositions, and clean silent-letter orthography.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {detectedIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="rounded-xl border border-[#E6E0D4] dark:border-stone-800 bg-[#FAF7F2] dark:bg-stone-900 p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#9E2A2B] dark:text-amber-400">
                      {issue.rule.categoryLabel}
                    </span>
                    <button
                      onClick={() => applySingleFix(issue)}
                      className="px-2.5 py-1 rounded-lg bg-[#2D6A4F] text-white text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Apply Fix → “{issue.suggestedText}”
                    </button>
                  </div>

                  <div className="text-xs font-mono flex flex-wrap items-center gap-2">
                    <span className="line-through text-[#9E2A2B] dark:text-red-400 font-bold">
                      {issue.matchedText}
                    </span>
                    <span className="text-stone-400">→</span>
                    <span className="text-[#2D6A4F] dark:text-emerald-400 font-bold">
                      {issue.suggestedText}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {issue.rule.ruleTitle}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    {issue.rule.explanationEn}
                  </p>
                  {showNepali && (
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                      {issue.rule.explanationNe}
                    </p>
                  )}

                  {onRecordMistake && (
                    <div className="pt-1">
                      <button
                        onClick={() =>
                          onRecordMistake({
                            lectureId: 'writing-linter',
                            lectureNumber: 4,
                            category:
                              issue.rule.category === 'silent-letter-spelling'
                                ? 'spelling'
                                : 'grammar',
                            sourceType: 'grammar',
                            prompt: `Writing Correction: Replace "${issue.matchedText}"`,
                            nepaliHint: issue.rule.explanationNe,
                            userWrongAnswer: issue.matchedText,
                            correctAnswer: issue.suggestedText,
                            explanation: issue.rule.explanationEn,
                          })
                        }
                        className="text-[11px] font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 underline cursor-pointer"
                      >
                        + Save Rule to Mistake Notebook
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
