import React, { useEffect, useState } from 'react';
import { Zap, Coins, Share2, Check, X, Sparkles } from 'lucide-react';
import { speechService } from '../services/speech';
import { CEFRLevel } from '../types/curriculum';

export interface LevelUpCelebrationModalProps {
  isOpen: boolean;
  levelNumber: number;
  cefrLevel: CEFRLevel;
  milestoneTitle: string;
  xpEarned: number;
  masteryPointsEarned: number;
  onClose: () => void;
  onShareBonusClaimed?: () => void;
}

export const LevelUpCelebrationModal: React.FC<LevelUpCelebrationModalProps> = ({
  isOpen,
  levelNumber,
  cefrLevel,
  milestoneTitle,
  xpEarned,
  masteryPointsEarned,
  onClose,
  onShareBonusClaimed,
}) => {
  const [sharedBonusClaimed, setSharedBonusClaimed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSharedBonusClaimed(false);
      speechService.playCelebrationChime('milestone');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShareNews = async () => {
    speechService.triggerHaptic('success');
    const shareText = `I just reached Level ${levelNumber} (${cefrLevel} Track) on BhashaSetu with ${xpEarned.toLocaleString()} XP! (${milestoneTitle})`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'BhashaSetu Level Up!',
          text: shareText,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
      }
    } catch {
      // User dismissed native share sheet; still award bonus
    }

    if (!sharedBonusClaimed) {
      setSharedBonusClaimed(true);
      onShareBonusClaimed?.();
    }
  };

  const bonusAdjustedXP = sharedBonusClaimed ? xpEarned + 25 : xpEarned;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-up-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-gradient-to-b from-[#FFF6E5] via-[#FAF8F4] to-[#F3EDE0] dark:from-[#261F18] dark:via-[#1A1714] dark:to-[#141210] border border-[#E6DEC8] dark:border-[#3A3228] shadow-2xl p-6 sm:p-7 text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close celebration modal"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/70 dark:bg-black/30 border border-[#E6E0D4] dark:border-[#2E2924] flex items-center justify-center text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-white transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Decorative Confetti Ribbons (Brand Crimson, Emerald, Gold, Sapphire) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 320 140"
          className="pointer-events-none absolute top-0 left-0 right-0 w-full h-36 opacity-85"
        >
          <rect x="28" y="18" width="14" height="8" rx="2" fill="#9E2A2B" transform="rotate(-18 28 18)" />
          <rect x="74" y="12" width="12" height="7" rx="2" fill="#E09F3E" transform="rotate(24 74 12)" />
          <rect x="132" y="8" width="15" height="8" rx="2" fill="#2D6A4F" transform="rotate(-12 132 8)" />
          <rect x="195" y="14" width="14" height="8" rx="2" fill="#284B7A" transform="rotate(28 195 14)" />
          <rect x="258" y="16" width="16" height="8" rx="2" fill="#E09F3E" transform="rotate(-22 258 16)" />
          <rect x="44" y="54" width="12" height="7" rx="2" fill="#2D6A4F" transform="rotate(15 44 54)" />
          <rect x="96" y="42" width="11" height="6" rx="2" fill="#9E2A2B" transform="rotate(-32 96 42)" />
          <rect x="220" y="48" width="13" height="7" rx="2" fill="#9E2A2B" transform="rotate(19 220 48)" />
          <rect x="276" y="56" width="12" height="7" rx="2" fill="#2D6A4F" transform="rotate(-25 276 56)" />
          <circle cx="62" cy="84" r="4" fill="#E09F3E" />
          <circle cx="248" cy="86" r="4" fill="#284B7A" />
        </svg>

        {/* 3D Hexagonal Gold & Crimson Level Emblem */}
        <div className="relative z-10 mt-6 mb-4 flex items-center justify-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-[#F4C95D]/25 blur-xl" />
            <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-md">
              {/* Outer White/Cream Cushion Hexagon */}
              <polygon
                points="60,4 110,32 110,88 60,116 10,88 10,32"
                fill="#FFFFFF"
                stroke="#EFE6D5"
                strokeWidth="3"
                 strokeLinejoin="round"
              />
              {/* Outer Gold Bevel Hexagon */}
              <polygon
                points="60,11 103,36 103,84 60,109 17,84 17,36"
                fill="url(#hexGoldGrad)"
                stroke="#D99B26"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Inner Recessed Medallion */}
              <polygon
                points="60,21 94,41 94,79 60,99 26,79 26,41"
                fill="url(#hexInnerGrad)"
                stroke="#F7D97E"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="hexGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE07D" />
                  <stop offset="55%" stopColor="#F5B82E" />
                  <stop offset="100%" stopColor="#C88214" />
                </linearGradient>
                <linearGradient id="hexInnerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#E69D1E" />
                  <stop offset="100%" stopColor="#B86B11" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="font-serif font-bold text-4xl leading-none drop-shadow-xs tabular-nums">
                {levelNumber}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#FFF6D6] mt-0.5">
                {cefrLevel} TIER
              </span>
            </div>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="relative z-10 space-y-1">
          <h2
            id="level-up-modal-title"
            className="font-serif font-bold text-2xl sm:text-[28px] tracking-tight text-[#1C1917] dark:text-[#F5F2EB]"
          >
            LEVEL UP!
          </h2>
          <p className="text-xs text-[#6E685F] dark:text-[#A8A29E] font-medium">
            {milestoneTitle}
          </p>
        </div>

        {/* Two-Column Reward Counters (+Mastery Points | +XP Earned) */}
        <div className="relative z-10 my-6 grid grid-cols-2 divide-x divide-[#E6DEC8] dark:divide-[#2E2924] bg-white/80 dark:bg-[#141210]/80 rounded-2xl border border-[#E6E0D4] dark:border-[#2E2924] py-4 px-3">
          <div className="flex flex-col items-center justify-center gap-1 px-2">
            <div className="w-8 h-8 rounded-full bg-[#FEF3C7] dark:bg-amber-950/60 border border-[#F59E0B]/40 flex items-center justify-center text-[#D97706] dark:text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
            <div className="font-serif font-bold text-lg sm:text-xl text-[#1C1917] dark:text-[#F5F2EB] tabular-nums mt-0.5">
              +{masteryPointsEarned.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
              Mastery Points
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 px-2">
            <div className="w-8 h-8 rounded-full bg-[#F8E7E3] dark:bg-red-950/60 border border-[#9E2A2B]/30 flex items-center justify-center text-[#9E2A2B] dark:text-[#F87171]">
              <Zap className="w-4 h-4" />
            </div>
            <div className="font-serif font-bold text-lg sm:text-xl text-[#1C1917] dark:text-[#F5F2EB] tabular-nums mt-0.5">
              +{bonusAdjustedXP.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
              XP Earned
            </div>
          </div>
        </div>

        {/* Primary Continue CTA & Secondary Share Row */}
        <div className="relative z-10 space-y-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] py-3 px-5 rounded-2xl bg-[#9E2A2B] hover:bg-[#872223] active:scale-[0.99] text-white font-semibold text-sm shadow-md transition-all"
          >
            Continue
          </button>

          <button
            type="button"
            onClick={handleShareNews}
            className="w-full min-h-[46px] py-2.5 px-4 rounded-2xl bg-[#F3EBDD] dark:bg-[#221E1A] border border-[#E4DAC6] dark:border-[#342E28] hover:border-[#9E2A2B]/40 flex items-center justify-between text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] transition-colors"
          >
            <span className="inline-flex items-center gap-2">
              {sharedBonusClaimed ? (
                <>
                  <Check className="w-4 h-4 text-[#2D6A4F]" />
                  <span className="text-[#2D6A4F] dark:text-emerald-400">
                    Progress copied · Bonus claimed!
                  </span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#78716C]" />
                  <span>Share the News</span>
                </>
              )}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-[#141210] border border-[#E6DEC8] dark:border-[#2E2924] text-[11px] font-bold text-[#B87D14] dark:text-amber-300 tabular-nums">
              <Sparkles className="w-3 h-3 text-[#E09F3E]" />
              <span>+25</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
