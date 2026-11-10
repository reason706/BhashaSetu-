import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronDown,
  Check,
  X,
  Volume2,
  Turtle,
  BookmarkCheck,
  PlusCircle,
} from 'lucide-react';
import { speechService } from '../../services/speech';
import { toast } from 'sonner';

export interface SelectOptionItem<T extends string | number = string> {
  value: T;
  label: string;
  sublabel?: string;
  sub?: string;
  badge?: string;
}

export type SelectSheetOption<T extends string | number = string> = SelectOptionItem<T>;

export interface ResponsiveSelectSheetProps<T extends string | number = string> {
  value: T;
  onChange: (nextValue: T) => void;
  options: SelectOptionItem<T>[];
  title?: string;
  sheetTitle?: string;
  sheetDescription?: string;
  ariaLabel?: string;
  triggerLabel?: string;
  triggerIcon?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end' | 'left' | 'right';
  compact?: boolean;
}

/**
 * Responsive Selector:
 * - On mobile (< 640px): Opens an accessible Radix Dialog Bottom Sheet with 48px touch targets.
 * - On desktop (>= 640px): Opens a collision-aware Radix Popover menu.
 */
export function ResponsiveSelectSheet<T extends string | number = string>({
  value,
  onChange,
  options,
  title,
  sheetTitle,
  sheetDescription,
  ariaLabel,
  triggerLabel,
  triggerIcon,
  icon,
  className = '',
  align = 'start',
  compact = false,
}: ResponsiveSelectSheetProps<T>) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedOption =
    options.find((o) => String(o.value) === String(value)) || options[0];
  const resolvedTitle = sheetTitle || title || ariaLabel || 'Select Option';
  const displayLabel = triggerLabel ?? selectedOption?.label ?? resolvedTitle;
  const resolvedIcon = triggerIcon ?? icon;
  const popoverAlign: 'start' | 'center' | 'end' =
    align === 'left' ? 'start' : align === 'right' ? 'end' : align;

  const triggerButton = (
    <button
      type="button"
      aria-label={ariaLabel || resolvedTitle}
      className={`${
        compact ? 'min-h-[36px] px-3 py-1.5 text-xs' : 'min-h-[40px] px-3.5 py-2 text-xs'
      } rounded-xl bg-white dark:bg-[#191715] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#9E2A2B] font-medium text-[#1C1917] dark:text-[#F5F2EB] inline-flex items-center justify-between gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9E2A2B]/40 cursor-pointer ${className}`}
    >
      <span className="inline-flex items-center gap-2 min-w-0 truncate">
        {resolvedIcon && <span className="shrink-0 text-[#9E2A2B]">{resolvedIcon}</span>}
        <span className="truncate">{displayLabel}</span>
      </span>
      <ChevronDown
        className={`w-3.5 h-3.5 text-[#78716C] shrink-0 transition-transform duration-150 ${
          open ? 'rotate-180' : ''
        }`}
      />
    </button>
  );

  if (isMobile) {
    return (
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>{triggerButton}</Dialog.Trigger>
        <AnimatePresence>
          {open && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                  className="fixed inset-x-0 bottom-0 z-50 max-h-[82vh] rounded-t-3xl bg-[#FAF8F4] dark:bg-[#1A1714] border-t border-[#E6E0D4] dark:border-[#2E2924] shadow-2xl flex flex-col focus:outline-none pb-6"
                >
                  {/* Drag Handle */}
                  <div className="w-10 h-1.5 rounded-full bg-[#D6CFC2] dark:bg-[#3A342E] mx-auto mt-3 mb-1 shrink-0" />

                  <div className="px-5 py-3 border-b border-[#E6E0D4] dark:border-[#2E2924] flex items-center justify-between gap-3 shrink-0">
                    <div>
                      <Dialog.Title className="font-serif text-base font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                        {resolvedTitle}
                      </Dialog.Title>
                      {sheetDescription && (
                        <Dialog.Description className="text-[11px] text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                          {sheetDescription}
                        </Dialog.Description>
                      )}
                    </div>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        aria-label="Close selector"
                        className="w-8 h-8 rounded-full bg-[#EFECE4] dark:bg-[#26221E] text-[#57534E] dark:text-[#A8A29E] flex items-center justify-center shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="overflow-y-auto p-3 space-y-1">
                    {options.map((opt) => {
                      const isSelected = String(opt.value) === String(value);
                      const subText = opt.sublabel || opt.sub;
                      return (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() => {
                            onChange(opt.value);
                            setOpen(false);
                          }}
                          className={`w-full min-h-[48px] px-4 py-2.5 rounded-xl text-left flex items-center justify-between gap-3 transition-colors ${
                            isSelected
                              ? 'bg-[#F8E7E3] dark:bg-red-950/50 text-[#9E2A2B] dark:text-red-300 font-semibold'
                              : 'text-[#1C1917] dark:text-[#F5F2EB] hover:bg-[#EFECE4]/70 dark:hover:bg-[#26221E]'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-sm leading-snug truncate">{opt.label}</div>
                            {subText && (
                              <div className="text-xs text-[#78716C] dark:text-[#A8A29E] truncate mt-0.5">
                                {subText}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {opt.badge && (
                              <span className="text-xs font-ipa text-[#78716C] dark:text-[#A8A29E]">
                                {opt.badge}
                              </span>
                            )}
                            {isSelected && <Check className="w-4 h-4 text-[#9E2A2B] shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    );
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{triggerButton}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align={popoverAlign}
          sideOffset={6}
          collisionPadding={12}
          className="z-50 w-72 max-h-80 overflow-y-auto rounded-2xl bg-[#FAF8F4] dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] shadow-xl p-1.5 focus:outline-none"
        >
          <div className="px-3 py-1.5 text-[11px] font-semibold text-[#78716C] dark:text-[#A8A29E] border-b border-[#E6E0D4]/70 dark:border-[#2E2924] mb-1">
            {resolvedTitle}
          </div>
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            const subText = opt.sublabel || opt.sub;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2.5 text-xs transition-colors ${
                  isSelected
                    ? 'bg-[#F8E7E3] dark:bg-red-950/50 text-[#9E2A2B] dark:text-red-300 font-semibold'
                    : 'text-[#1C1917] dark:text-[#F5F2EB] hover:bg-[#EFECE4]/70 dark:hover:bg-[#26221E]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate">{opt.label}</div>
                  {subText && (
                    <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E] truncate">
                      {subText}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {opt.badge && (
                    <span className="text-[11px] font-ipa text-[#78716C] dark:text-[#A8A29E]">
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />}
                </div>
              </button>
            );
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export interface PhoneticWordInfo {
  id?: string;
  word: string;
  ipa?: string;
  partOfSpeech?: string;
  nepaliMeaning?: string;
  silentLettersSummary?: string;
  englishExample?: string;
  segments?: { text: string; isSilent?: boolean; silent?: boolean }[];
}

export interface WordPhoneticsPopoverProps {
  wordInfo?: PhoneticWordInfo;
  word?: string;
  ipa?: string;
  partOfSpeech?: string;
  nepaliMeaning?: string;
  silentLettersSummary?: string;
  silentRule?: string;
  englishExample?: string;
  example?: string;
  segments?: { text: string; isSilent?: boolean; silent?: boolean }[];
  preferredSpeechRate?: number;
  isSaved?: boolean;
  onToggleSave?: (wordId?: string) => void;
  onAddToSRS?: (wordId?: string) => void;
  children: React.ReactNode;
}

/**
 * Instant Phonetics Popover:
 * Tapping any word in lectures or questions reveals an accessible popover with
 * IPA, silent-letter breakdown, Nepali meaning, audio controls, and "Add to SRS".
 */
export const WordPhoneticsPopover: React.FC<WordPhoneticsPopoverProps> = ({
  wordInfo,
  word,
  ipa,
  partOfSpeech,
  nepaliMeaning,
  silentLettersSummary,
  silentRule,
  englishExample,
  example,
  segments,
  preferredSpeechRate = 0.9,
  isSaved = false,
  onToggleSave,
  onAddToSRS,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [localSaved, setLocalSaved] = useState(isSaved);

  useEffect(() => {
    setLocalSaved(isSaved);
  }, [isSaved]);

  const resolvedWord = wordInfo?.word || word || '';
  const resolvedIpa = wordInfo?.ipa || ipa;
  const resolvedPos = wordInfo?.partOfSpeech || partOfSpeech;
  const resolvedNepali = wordInfo?.nepaliMeaning || nepaliMeaning;
  const resolvedSilentRule =
    wordInfo?.silentLettersSummary || silentLettersSummary || silentRule;
  const resolvedExample = wordInfo?.englishExample || englishExample || example;
  const resolvedSegments = wordInfo?.segments || segments;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="inline-block cursor-pointer decoration-dotted underline-offset-4 hover:underline"
        >
          {children}
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="center"
          sideOffset={8}
          collisionPadding={12}
          onClick={(e) => e.stopPropagation()}
          className="z-50 w-72 sm:w-80 rounded-2xl bg-[#FAF8F4] dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] shadow-xl p-4 space-y-3 text-left focus:outline-none"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-serif text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                  {resolvedSegments && resolvedSegments.length > 0
                    ? resolvedSegments.map((seg, i) =>
                        seg.silent || seg.isSilent ? (
                          <span
                            key={i}
                            className="text-[#9E2A2B] dark:text-[#F87171] underline decoration-dotted underline-offset-4"
                          >
                            {seg.text}
                          </span>
                        ) : (
                          <span key={i}>{seg.text}</span>
                        )
                      )
                    : resolvedWord}
                </span>
                {resolvedIpa && (
                  <span className="font-ipa text-xs text-[#78716C] dark:text-[#A8A29E]">
                    {resolvedIpa}
                  </span>
                )}
              </div>
              {(resolvedPos || resolvedSilentRule) && (
                <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                  {resolvedPos}
                  {resolvedPos && resolvedSilentRule ? ' · ' : ''}
                  {resolvedSilentRule}
                </div>
              )}
            </div>

            <Popover.Close asChild>
              <button
                type="button"
                aria-label="Close word details"
                className="p-1 rounded-lg text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </Popover.Close>
          </div>

          {resolvedNepali && (
            <div className="font-nepali text-sm font-semibold text-[#1F5C3D] dark:text-emerald-400">
              {resolvedNepali}
            </div>
          )}

          {resolvedExample && (
            <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
              “{resolvedExample}”
            </p>
          )}

          <div className="pt-2 border-t border-[#E6E0D4] dark:border-[#2E2924] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  speechService.speak(resolvedWord, { rate: preferredSpeechRate })
                }
                className="min-h-[34px] px-2.5 py-1 rounded-lg bg-[#9E2A2B] text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen</span>
              </button>
              <button
                type="button"
                onClick={() => speechService.speak(resolvedWord, { rate: 0.55 })}
                className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#57534E] dark:text-[#A8A29E] inline-flex items-center gap-1 cursor-pointer"
              >
                <Turtle className="w-3.5 h-3.5 text-[#D97706]" />
                <span>0.55×</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onToggleSave) {
                  onToggleSave(wordInfo?.id);
                }
                if (onAddToSRS) {
                  onAddToSRS(wordInfo?.id);
                }
                setLocalSaved((prev) => !prev);
                toast.success(
                  localSaved
                    ? `Updated "${resolvedWord}" in your SRS study deck`
                    : `Added "${resolvedWord}" (${resolvedNepali || ''}) to SRS deck`
                );
              }}
              className={`min-h-[34px] px-2.5 py-1 rounded-lg border text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer ${
                localSaved
                  ? 'border-[#1F5C3D]/40 bg-[#DCECE2] dark:bg-emerald-950/50 text-[#1F5C3D] dark:text-emerald-300'
                  : 'border-[#E6E0D4] dark:border-[#2E2924] bg-white dark:bg-[#141210] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B]'
              }`}
            >
              {localSaved ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>In SRS Deck</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5 text-[#9E2A2B]" />
                  <span>Add to SRS</span>
                </>
              )}
            </button>
          </div>
          <Popover.Arrow className="fill-[#E6E0D4] dark:fill-[#2E2924]" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
