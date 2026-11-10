import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Volume2,
  Mic,
  Send,
  Sparkles,
  Loader2,
  RotateCcw,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { CEFRLevel, LanguageMode } from '../types/curriculum';
import { speechService } from '../services/speech';
import { useModalBehavior, backdropDismiss, MODAL_BACKDROP_CLASS, scrollBehavior } from '../hooks/useModalBehavior';

export interface RoleplayScenario {
  id: string;
  title: string;
  nepaliTitle: string;
  role: string;
  level: CEFRLevel;
  openingEnglish: string;
  openingNepali: string;
  starterSuggestions: string[];
}

export const AI_ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'job-interview',
    title: 'Job Interview in Kathmandu',
    nepaliTitle: 'काठमाडौँमा जागिरको अन्तर्वार्ता',
    role: 'Hiring Manager',
    level: 'B2',
    openingEnglish:
      'Good morning! Welcome to our office. Could you briefly introduce yourself and tell me why you are interested in this role?',
    openingNepali:
      'शुभ प्रभात! हाम्रो कार्यालयमा स्वागत छ। के तपाईं संक्षिप्तमा आफ्नो परिचय दिन र यो पदमा किन रुचि छ भनी बताउन सक्नुहुन्छ?',
    starterSuggestions: [
      'Thank you for having me. I have three years of experience in customer operations and enjoy solving complex problems.',
      'Good morning! I recently graduated and I am eager to contribute my communication skills to your team.',
    ],
  },
  {
    id: 'clinic-visit',
    title: 'Clinic & Pharmacy Consultation',
    nepaliTitle: 'क्लिनिक र स्वास्थ्य परामर्श',
    role: 'Doctor at City Clinic',
    level: 'B1',
    openingEnglish:
      'Hello, please have a seat. What symptoms have you been experiencing, and how many days have you felt this way?',
    openingNepali:
      'नमस्ते, कृपया बस्नुहोस्। तपाईंलाई के-कस्ता लक्षणहरू देखिएका छन्, र यस्तो भएको कति दिन भयो?',
    starterSuggestions: [
      'I have had a mild fever and a sore throat since Tuesday evening.',
      'My stomach has been hurting after meals for the past two days.',
    ],
  },
  {
    id: 'workplace-standup',
    title: 'Workplace Project Update',
    nepaliTitle: 'अफिस प्रोजेक्ट अपडेट र बैठक',
    role: 'Project Lead',
    level: 'B2',
    openingEnglish:
      'Hi team! How is the client deliverables schedule looking for this week, and do you need support with any blockers?',
    openingNepali:
      'नमस्ते! यो हप्ताको क्लाइन्ट डेलिभरेबल तालिका कस्तो छ, र के तपाईंलाई कुनै अवरोधमा सहयोग चाहिन्छ?',
    starterSuggestions: [
      'Everything is on track. I finished the first draft yesterday and will share it this afternoon.',
      'We are slightly delayed on the design review, so I would appreciate an extra day.',
    ],
  },
  {
    id: 'airport-immigration',
    title: 'International Airport & Immigration',
    nepaliTitle: 'अन्तर्राष्ट्रिय विमानस्थल र अध्यागमन',
    role: 'Immigration Officer',
    level: 'B1',
    openingEnglish:
      'Good afternoon. May I see your passport and boarding pass? What is the purpose of your visit and where will you be staying?',
    openingNepali:
      'शुभ अपराह्न। के म तपाईंको पासपोर्ट र बोर्डिङ पास हेर्न सक्छु? तपाईंको भ्रमणको उद्देश्य के हो र कहाँ बस्नुहुनेछ?',
    starterSuggestions: [
      'Here is my passport. I am visiting for a two-week professional conference and staying at a hotel downtown.',
      'Good afternoon. I am travelling for tourism and sightseeing for ten days.',
    ],
  },
];

interface ChatTurn {
  id: string;
  speaker: 'ai' | 'user';
  text: string;
  nepaliTranslation?: string;
  improvedUserSentence?: string;
  userFeedbackNepali?: string;
}

interface AIRoleplayModalProps {
  isOpen: boolean;
  isOnline: boolean;
  defaultLevel: CEFRLevel;
  preferredSpeechRate: number;
  languageMode: LanguageMode;
  onClose: () => void;
  onCompleteRoleplayTurn?: (scenarioId: string) => void;
}

export const AIRoleplayModal: React.FC<AIRoleplayModalProps> = ({
  isOpen,
  isOnline,
  preferredSpeechRate,
  languageMode,
  onClose,
  onCompleteRoleplayTurn,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario>(
    AI_ROLEPLAY_SCENARIOS[0]
  );
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      id: 'opening',
      speaker: 'ai',
      text: AI_ROLEPLAY_SCENARIOS[0].openingEnglish,
      nepaliTranslation: AI_ROLEPLAY_SCENARIOS[0].openingNepali,
    },
  ]);
  const [suggestions, setSuggestions] = useState<string[]>(
    AI_ROLEPLAY_SCENARIOS[0].starterSuggestions
  );
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: scrollBehavior() });
  }, [turns, isSending]);

  useModalBehavior(isOpen, onClose);

  if (!isOpen) return null;

  const selectScenario = (sc: RoleplayScenario) => {
    setSelectedScenario(sc);
    setTurns([
      {
        id: `opening-${sc.id}`,
        speaker: 'ai',
        text: sc.openingEnglish,
        nepaliTranslation: sc.openingNepali,
      },
    ]);
    setSuggestions(sc.starterSuggestions);
    setUserInput('');
    setErrorMsg(null);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend ?? userInput).trim();
    if (!message || isSending) return;
    if (!isOnline) {
      setErrorMsg('Please connect to the internet to practice with the AI Roleplay Partner.');
      return;
    }

    const userTurnId = `user-${Date.now()}`;
    const updatedTurns: ChatTurn[] = [
      ...turns,
      {
        id: userTurnId,
        speaker: 'user',
        text: message,
      },
    ];
    setTurns(updatedTurns);
    setUserInput('');
    setIsSending(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: selectedScenario.title,
          scenarioRole: selectedScenario.role,
          level: selectedScenario.level,
          history: updatedTurns.map((t) => ({ speaker: t.speaker, text: t.text })),
          userMessage: message,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.turn) {
        throw new Error(data.error || 'Could not reach AI Roleplay Partner.');
      }

      const aiTurn = data.turn;

      // Attach grammar coaching feedback onto the user's turn and append AI's reply
      setTurns((prev) => {
        const withFeedback = prev.map((t) =>
          t.id === userTurnId
            ? {
                ...t,
                improvedUserSentence: aiTurn.improvedUserSentence,
                userFeedbackNepali: aiTurn.userFeedbackNepali,
              }
            : t
        );
        return [
          ...withFeedback,
          {
            id: `ai-${Date.now()}`,
            speaker: 'ai',
            text: aiTurn.replyEnglish,
            nepaliTranslation: aiTurn.replyNepaliTranslation,
          },
        ];
      });

      if (Array.isArray(aiTurn.suggestedNextResponses) && aiTurn.suggestedNextResponses.length > 0) {
        setSuggestions(aiTurn.suggestedNextResponses);
      }

      onCompleteRoleplayTurn?.(selectedScenario.id);
      speechService.speak(aiTurn.replyEnglish, { rate: preferredSpeechRate });
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Something went wrong during the conversation.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (!SpeechRec) {
      setErrorMsg('Voice input is not supported in this browser. Please type your reply below.');
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRec as any)();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      setIsListeningMic(true);
      setErrorMsg(null);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setUserInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListeningMic(false);
      };
      recognition.onerror = () => {
        setIsListeningMic(false);
      };
      recognition.onend = () => {
        setIsListeningMic(false);
      };
      recognition.start();
    } catch {
      setIsListeningMic(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={backdropDismiss(onClose)}
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center ${MODAL_BACKDROP_CLASS} p-0 sm:p-4 animate-fade-up`}
    >
      <div className="pp-sheet !p-0 max-w-3xl flex flex-col !max-h-[92vh] !overflow-hidden">
        <span className="pp-grab !mt-3 !mb-1" aria-hidden="true" />
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#E6E0D4] dark:border-[#2E2924] flex items-center justify-between gap-4 bg-white dark:bg-[#141210]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F8E7E3] dark:bg-red-950/60 text-[#9E2A2B] dark:text-red-300 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9E2A2B] dark:text-[#F87171]">
                  AI CONVERSATION PARTNER
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#DCECE2] text-[#1F5C3D] text-[10px] font-semibold">
                  Live Speaking & Writing Coach
                </span>
              </div>
              <h2 className="font-serif text-lg sm:text-xl text-[#1C1917] dark:text-[#F5F2EB]">
                Real-Life English Roleplay Studio
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => selectScenario(selectedScenario)}
              title="Restart conversation"
              className="h-9 px-3 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close roleplay studio"
              className="h-9 w-9 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] flex items-center justify-center text-[#57534E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scenario Selector Strip */}
        <div className="px-6 py-3 bg-[#F4EFE4] dark:bg-[#1F1C18] border-b border-[#E6E0D4] dark:border-[#2E2924] flex items-center gap-2 overflow-x-auto">
          {AI_ROLEPLAY_SCENARIOS.map((sc) => {
            const active = sc.id === selectedScenario.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => selectScenario(sc)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 border ${
                  active
                    ? 'bg-[#9E2A2B] text-white border-[#9E2A2B] shadow-xs'
                    : 'bg-white dark:bg-[#141210] text-[#57534E] dark:text-[#A8A29E] border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#9E2A2B]/50'
                }`}
              >
                <span>{sc.title}</span>
                <span className="ml-1.5 opacity-75">({sc.level})</span>
              </button>
            );
          })}
        </div>

        {/* Conversation Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {turns.map((turn) => (
            <div key={turn.id} className="space-y-2">
              <div
                className={`flex ${
                  turn.speaker === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-2 ${
                    turn.speaker === 'user'
                      ? 'bg-[#1C1917] text-[#FAF8F4] dark:bg-[#2E2924]'
                      : 'bg-white dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                      {turn.speaker === 'user' ? 'You' : selectedScenario.role}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        speechService.speak(turn.text, { rate: preferredSpeechRate })
                      }
                      className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#9E2A2B] dark:text-[#F87171]"
                      title="Listen to sentence"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-sm leading-relaxed">{turn.text}</p>

                  {turn.nepaliTranslation && languageMode !== 'english-only' && (
                    <p className="font-nepali text-xs text-[#6E685F] dark:text-[#A8A29E] pt-1 border-t border-[#EFEAE0] dark:border-[#2E2924]">
                      {turn.nepaliTranslation}
                    </p>
                  )}
                </div>
              </div>

              {/* Instant Bilingual Coaching Card on User's Turn */}
              {turn.speaker === 'user' &&
                (turn.improvedUserSentence || turn.userFeedbackNepali) && (
                  <div className="ml-auto max-w-[82%] rounded-xl bg-[#F4EFE4] dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] p-3.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#1F5C3D] dark:text-emerald-400 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>AI Coach Feedback</span>
                      </span>
                      {turn.improvedUserSentence && (
                        <button
                          type="button"
                          onClick={() =>
                            speechService.speak(turn.improvedUserSentence || '', {
                              rate: preferredSpeechRate,
                            })
                          }
                          className="text-[#9E2A2B] dark:text-[#F87171] hover:underline inline-flex items-center gap-1"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Hear natural phrasing</span>
                        </button>
                      )}
                    </div>
                    {turn.improvedUserSentence && (
                      <div className="text-[#1C1917] dark:text-[#F5F2EB]">
                        <span className="text-[#78716C]">Polished English: </span>
                        <strong className="font-medium">“{turn.improvedUserSentence}”</strong>
                      </div>
                    )}
                    {turn.userFeedbackNepali && (
                      <div className="font-nepali text-[#57534E] dark:text-[#A8A29E]">
                        {turn.userFeedbackNepali}
                      </div>
                    )}
                  </div>
                )}
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-[#78716C] p-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#9E2A2B]" />
              <span>{selectedScenario.role} is replying and reviewing your grammar...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Responses + Input Bar */}
        <div className="p-4 sm:px-6 bg-white dark:bg-[#141210] border-t border-[#E6E0D4] dark:border-[#2E2924] space-y-3">
          {suggestions.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-medium text-[#78716C] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#9E2A2B]" />
                <span>Suggested replies (click to send or edit):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={isSending}
                    onClick={() => setUserInput(sug)}
                    className="text-left px-3 py-1.5 rounded-xl bg-[#FAF8F4] dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#9E2A2B] text-xs text-[#1C1917] dark:text-[#F5F2EB] transition-colors"
                  >
                    “{sug}”
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="text-xs text-[#9E2A2B] dark:text-red-300 bg-[#F8E7E3]/60 dark:bg-red-950/40 px-3 py-2 rounded-xl">
              {errorMsg}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={isSending}
              title="Speak your response in English"
              className={`h-11 w-11 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                isListeningMic
                  ? 'bg-[#9E2A2B] text-white border-[#9E2A2B] animate-pulse'
                  : 'bg-[#FAF8F4] dark:bg-[#1F1C18] border-[#E6E0D4] dark:border-[#2E2924] text-[#57534E] hover:border-[#9E2A2B]'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your response in English (or click the mic to speak)..."
              className="flex-1 h-11 px-4 rounded-xl bg-[#FAF8F4] dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#9E2A2B]"
            />

            <button
              type="submit"
              disabled={isSending || !userInput.trim()}
              className="h-11 px-5 rounded-xl bg-[#9E2A2B] hover:bg-[#872223] disabled:opacity-40 text-white text-xs sm:text-sm font-medium inline-flex items-center gap-2 shrink-0 transition-colors"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
