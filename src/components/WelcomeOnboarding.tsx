import React, { useState } from 'react';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Check,
  Compass,
  Globe2,
  Mountain,
  Play,
  Users,
} from 'lucide-react';
import { CEFRLevel, LanguageMode } from '../types/curriculum';
import { useModalBehavior } from '../hooks/useModalBehavior';

export interface WelcomeOnboardingResult {
  level: CEFRLevel;
  dailyGoalMinutes: number;
  languageMode: LanguageMode;
  dailyReminderEnabled: boolean;
}

interface WelcomeOnboardingProps {
  isOpen: boolean;
  learnerFirstName?: string;
  firstLessonTitle: string;
  firstLessonNumber: number;
  defaultLevel: CEFRLevel;
  defaultGoalMinutes: number;
  defaultLanguageMode: LanguageMode;
  defaultReminder: boolean;
  /** Skip keeps current preferences and only marks onboarding as done. */
  onSkip: () => void;
  /** Saves the choices; `startFirstLesson` opens lesson 01 straight away. */
  onFinish: (result: WelcomeOnboardingResult, startFirstLesson: boolean) => void;
}

const LEVEL_OPTIONS: {
  id: CEFRLevel;
  name: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'B1', name: 'Foundation', desc: 'I can handle everyday conversations', Icon: Compass },
  { id: 'B2', name: 'Workplace', desc: 'I use English at work or college', Icon: Users },
  { id: 'C1', name: 'Advanced', desc: 'I want academic and executive English', Icon: Mountain },
];

const GOAL_OPTIONS = [
  { minutes: 10, name: 'Light', desc: 'A quick daily habit' },
  { minutes: 15, name: 'Steady', desc: 'Recommended for most learners' },
  { minutes: 30, name: 'Serious', desc: 'Fastest path to the next level' },
];

const LANGUAGE_OPTIONS: { id: LanguageMode; name: string; desc: string }[] = [
  { id: 'full-nepali', name: 'नेपाली + English', desc: 'Nepali explanations and hints beside the English' },
  { id: 'english-meanings', name: 'English + Nepali meanings', desc: 'English explanations, Nepali word meanings' },
  { id: 'english-only', name: 'English only', desc: 'Full immersion, no Nepali help' },
];

const optionClass = (selected: boolean) =>
  `w-full flex items-center gap-3 text-left p-3.5 rounded-[18px] bg-white dark:bg-[#1F1C18] transition-all ${
    selected
      ? 'border-2 border-[#9E2A2B] shadow-[0_0_0_4px_#F8E7E3] dark:shadow-[0_0_0_4px_rgba(158,42,43,0.25)]'
      : 'border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#CDBFA8]'
  }`;

export function WelcomeOnboarding({
  isOpen,
  learnerFirstName,
  firstLessonTitle,
  firstLessonNumber,
  defaultLevel,
  defaultGoalMinutes,
  defaultLanguageMode,
  defaultReminder,
  onSkip,
  onFinish,
}: WelcomeOnboardingProps) {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<CEFRLevel>(defaultLevel);
  const [goal, setGoal] = useState<number>(
    GOAL_OPTIONS.some((g) => g.minutes === defaultGoalMinutes) ? defaultGoalMinutes : 15
  );
  const [languageMode, setLanguageMode] = useState<LanguageMode>(defaultLanguageMode);
  const [reminder, setReminder] = useState<boolean>(defaultReminder);

  // Shared pop-up behaviour: closes other modals, Escape = skip, scroll lock
  useModalBehavior(isOpen, onSkip);

  if (!isOpen) return null;

  const result: WelcomeOnboardingResult = {
    level,
    dailyGoalMinutes: goal,
    languageMode,
    dailyReminderEnabled: reminder,
  };
  const isSetupStep = step > 0 && step < 4;
  const selectedMark = (
    <CheckCircle2 className="w-5 h-5 shrink-0 text-[#9E2A2B] dark:text-[#F87171]" aria-hidden="true" />
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      className="fixed inset-0 z-[60] bg-[#FAF8F4] dark:bg-[#141210] overflow-y-auto animate-fade-up"
    >
      <div className="min-h-full w-full max-w-[35rem] mx-auto px-[1.125rem] pt-5 pb-7 flex flex-col gap-4">
        {isSetupStep && (
          <header className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Back"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="w-11 h-11 shrink-0 rounded-full bg-white dark:bg-[#1F1C18] border border-[#DFD7C8] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 flex gap-1.5" aria-label={`Step ${step} of 3`}>
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${
                    i <= step ? 'bg-[#9E2A2B]' : 'bg-[#EFE9DD] dark:bg-[#2E2924]'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={onSkip}
              className="min-h-[44px] px-2 text-[13px] font-bold text-[#9E2A2B] dark:text-[#F87171]"
            >
              Skip
            </button>
          </header>
        )}

        {/* 0 · Welcome */}
        {step === 0 && (
          <>
            <div className="flex-1 flex flex-col justify-center gap-4">
              <div className="relative h-56 sm:h-64 rounded-[28px] bg-gradient-to-br from-[#EFEADE] to-[#E2D6C3] dark:from-[#221E1A] dark:to-[#181512] border border-[#E0D6C4] dark:border-[#2E2924] overflow-hidden">
                <svg viewBox="0 0 320 300" className="absolute inset-2.5 w-[calc(100%-1.25rem)] h-[calc(100%-1.25rem)]" aria-hidden="true">
                  <circle cx="160" cy="150" r="140" fill="#D7C6AE" fillOpacity="0.55" />
                  <g transform="translate(50 68) rotate(-6 110 82)">
                    <rect x="18" y="26" width="86" height="122" rx="6" fill="#1C1917" fillOpacity="0.08" />
                    <rect x="18" y="20" width="86" height="122" rx="6" fill="#FAF7F0" stroke="#E2DACB" strokeWidth="1.5" />
                    <rect x="112" y="20" width="86" height="122" rx="6" fill="#FAF7F0" stroke="#E2DACB" strokeWidth="1.5" />
                    <rect x="103" y="18" width="10" height="126" rx="4" fill="#9E2A2B" />
                    <line x1="34" y1="44" x2="86" y2="44" stroke="#CFC8BC" strokeWidth="3" strokeLinecap="round" />
                    <line x1="34" y1="62" x2="78" y2="62" stroke="#CFC8BC" strokeWidth="3" strokeLinecap="round" />
                    <line x1="128" y1="44" x2="180" y2="44" stroke="#CFC8BC" strokeWidth="3" strokeLinecap="round" />
                    <line x1="128" y1="62" x2="172" y2="62" stroke="#CFC8BC" strokeWidth="3" strokeLinecap="round" />
                    <text x="62" y="114" textAnchor="middle" fill="#9E2A2B" fontSize="36" fontWeight="600" fontFamily="Noto Sans Devanagari, serif">
                      अ
                    </text>
                    <text x="155" y="114" textAnchor="middle" fill="#2D6A4F" fontSize="38" fontWeight="600" fontFamily="Fraunces, Georgia, serif">
                      A
                    </text>
                  </g>
                </svg>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-nepali w-10 h-10 rounded-xl bg-[#9E2A2B] text-white flex items-center justify-center font-bold text-xl">
                  भ
                </span>
                <span className="text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">BhashaSetu</span>
              </div>
              <h1 id="welcome-title" className="font-serif text-[2rem] sm:text-[2.25rem] leading-[1.12] text-[#1C1917] dark:text-[#F5F2EB]">
                Speak the English that isn’t written.
              </h1>
              <p className="text-[15px] leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
                Silent letters, natural word order and real conversations — built for Nepali speakers.{' '}
                <span className="font-nepali">नेपाली भाषीका लागि बनाइएको।</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="min-h-[56px] rounded-2xl bg-[#9E2A2B] hover:bg-[#872223] text-white text-base font-bold inline-flex items-center justify-center gap-2 shadow-[0_8px_16px_-10px_rgba(158,42,43,0.6)]"
            >
              Get started
              <ArrowRight className="w-[18px] h-[18px]" />
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="min-h-[50px] rounded-2xl bg-white dark:bg-[#1F1C18] border border-[#DFD7C8] dark:border-[#2E2924] text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B]"
            >
              I’ll explore on my own
            </button>
          </>
        )}

        {/* 1 · Level */}
        {step === 1 && (
          <>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9E2A2B] dark:text-[#F87171]">Step 1 of 3</span>
              <h1 id="welcome-title" className="font-serif text-[1.75rem] mt-1.5 mb-1 text-[#1C1917] dark:text-[#F5F2EB]">
                Where are you now?
              </h1>
              <p className="text-sm text-[#6E685F] dark:text-[#A8A29E]">You can change this any time in Settings.</p>
            </div>
            <div className="flex flex-col gap-3" role="radiogroup" aria-label="Learning level">
              {LEVEL_OPTIONS.map(({ id, name, desc, Icon }) => (
                <button key={id} type="button" role="radio" aria-checked={level === id} onClick={() => setLevel(id)} className={optionClass(level === id)}>
                  <span className="w-11 h-11 shrink-0 rounded-xl bg-[#F8E7E3] dark:bg-red-950/40 text-[#9E2A2B] dark:text-[#F87171] flex items-center justify-center">
                    <Icon className="w-[22px] h-[22px]" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <strong className="block text-base text-[#1C1917] dark:text-[#F5F2EB]">{id} · {name}</strong>
                    <span className="block text-[13px] text-[#6E685F] dark:text-[#A8A29E]">{desc}</span>
                  </span>
                  {level === id && selectedMark}
                </button>
              ))}
            </div>
          </>
        )}

        {/* 2 · Daily goal */}
        {step === 2 && (
          <>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9E2A2B] dark:text-[#F87171]">Step 2 of 3</span>
              <h1 id="welcome-title" className="font-serif text-[1.75rem] mt-1.5 mb-1 text-[#1C1917] dark:text-[#F5F2EB]">
                Pick a daily goal
              </h1>
              <p className="text-sm text-[#6E685F] dark:text-[#A8A29E]">Small and steady beats long and rare.</p>
            </div>
            <div className="flex flex-col gap-3" role="radiogroup" aria-label="Daily goal">
              {GOAL_OPTIONS.map((g) => (
                <button key={g.minutes} type="button" role="radio" aria-checked={goal === g.minutes} onClick={() => setGoal(g.minutes)} className={optionClass(goal === g.minutes)}>
                  <span className="font-serif w-[52px] h-[52px] shrink-0 rounded-2xl bg-[#F5EBD6] dark:bg-amber-950/40 text-[#6B4D1E] dark:text-amber-300 flex items-center justify-center text-xl font-bold">
                    {g.minutes}
                  </span>
                  <span className="flex-1 min-w-0">
                    <strong className="block text-base text-[#1C1917] dark:text-[#F5F2EB]">{g.name} · {g.minutes} min</strong>
                    <span className="block text-[13px] text-[#6E685F] dark:text-[#A8A29E]">{g.desc}</span>
                  </span>
                  {goal === g.minutes && selectedMark}
                </button>
              ))}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={reminder}
              onClick={() => setReminder((r) => !r)}
              className="w-full flex items-center gap-3 p-3.5 rounded-[18px] bg-white dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] text-left"
            >
              <span className="w-9 h-9 shrink-0 rounded-[10px] bg-[#F5EBD6] dark:bg-amber-950/40 text-[#8C6527] dark:text-amber-300 flex items-center justify-center">
                <Bell className="w-[18px] h-[18px]" />
              </span>
              <span className="flex-1 min-w-0">
                <strong className="block text-sm text-[#1C1917] dark:text-[#F5F2EB]">Daily reminder</strong>
                <span className="block text-xs text-[#6E685F] dark:text-[#A8A29E]">A gentle nudge to practise</span>
              </span>
              <span
                aria-hidden="true"
                className={`relative w-11 h-[26px] shrink-0 rounded-full transition-colors ${reminder ? 'bg-[#2D6A4F]' : 'bg-[#D9D1C3] dark:bg-[#3A332D]'}`}
              >
                <span className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow transition-all ${reminder ? 'left-[21px]' : 'left-[3px]'}`} />
              </span>
            </button>
          </>
        )}

        {/* 3 · Language */}
        {step === 3 && (
          <>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9E2A2B] dark:text-[#F87171]">Step 3 of 3</span>
              <h1 id="welcome-title" className="font-serif text-[1.75rem] mt-1.5 mb-1 text-[#1C1917] dark:text-[#F5F2EB]">
                How should we explain things?
              </h1>
            </div>
            <div className="flex flex-col gap-3" role="radiogroup" aria-label="Explanation language">
              {LANGUAGE_OPTIONS.map((l) => (
                <button key={l.id} type="button" role="radio" aria-checked={languageMode === l.id} onClick={() => setLanguageMode(l.id)} className={optionClass(languageMode === l.id)}>
                  <span className="w-11 h-11 shrink-0 rounded-xl bg-[#E3EFE8] dark:bg-emerald-950/40 text-[#1F5C3D] dark:text-emerald-300 flex items-center justify-center">
                    <Globe2 className="w-[22px] h-[22px]" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <strong className="font-nepali block text-base text-[#1C1917] dark:text-[#F5F2EB]">{l.name}</strong>
                    <span className="block text-[13px] text-[#6E685F] dark:text-[#A8A29E]">{l.desc}</span>
                  </span>
                  {languageMode === l.id && selectedMark}
                </button>
              ))}
            </div>
          </>
        )}

        {isSetupStep && (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="mt-auto min-h-[56px] rounded-2xl bg-[#9E2A2B] hover:bg-[#872223] text-white text-base font-bold inline-flex items-center justify-center gap-2 shadow-[0_8px_16px_-10px_rgba(158,42,43,0.6)]"
          >
            {step === 3 ? 'Finish setup' : 'Continue'}
            <ChevronRight className="w-[18px] h-[18px]" />
          </button>
        )}

        {/* 4 · All set */}
        {step === 4 && (
          <>
            <div className="flex-1 flex flex-col justify-center items-center text-center gap-3.5">
              <span className="w-[88px] h-[88px] rounded-full bg-[#E3EFE8] dark:bg-emerald-950/40 text-[#1F5C3D] dark:text-emerald-300 flex items-center justify-center animate-correct-pop">
                <Check className="w-10 h-10" strokeWidth={3} />
              </span>
              <h1 id="welcome-title" className="font-serif text-[1.875rem] text-[#1C1917] dark:text-[#F5F2EB]">
                You’re all set{learnerFirstName ? `, ${learnerFirstName}` : ''}
              </h1>
              <dl className="w-full rounded-[20px] bg-white dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] px-4 py-1 text-left divide-y divide-[#EFE9DD] dark:divide-[#2E2924]">
                {[
                  ['Level', level],
                  ['Daily goal', `${goal} min a day`],
                  ['Language', LANGUAGE_OPTIONS.find((l) => l.id === languageMode)?.name || ''],
                  ['Daily reminder', reminder ? 'On' : 'Off'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-3 min-h-[52px]">
                    <dt className="flex-1 text-[13px] text-[#6E685F] dark:text-[#A8A29E]">{k}</dt>
                    <dd className="font-nepali font-bold text-sm text-[#1C1917] dark:text-[#F5F2EB]">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="w-full rounded-[20px] bg-[#FAF8F4] dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] p-3.5 flex items-center gap-3 text-left">
                <span className="font-serif w-11 h-11 shrink-0 rounded-[14px] bg-[#9E2A2B] text-white flex items-center justify-center font-bold">
                  {String(firstLessonNumber).padStart(2, '0')}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#9E2A2B] dark:text-[#F87171]">Your first lesson</span>
                  <strong className="block text-sm text-[#1C1917] dark:text-[#F5F2EB] truncate">{firstLessonTitle}</strong>
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onFinish(result, true)}
              className="min-h-[56px] rounded-2xl bg-[#9E2A2B] hover:bg-[#872223] text-white text-base font-bold inline-flex items-center justify-center gap-2 shadow-[0_8px_16px_-10px_rgba(158,42,43,0.6)]"
            >
              <Play className="w-4 h-4 fill-current" />
              Start first lesson
            </button>
            <button
              type="button"
              onClick={() => onFinish(result, false)}
              className="min-h-[50px] rounded-2xl bg-white dark:bg-[#1F1C18] border border-[#DFD7C8] dark:border-[#2E2924] text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B]"
            >
              Explore the app first
            </button>
          </>
        )}
      </div>
    </div>
  );
}
