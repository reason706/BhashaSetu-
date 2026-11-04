import { EnrichedLexiconItem } from '../data/massiveLexicon';
import { MistakeItem, SRSRecord } from '../types/curriculum';

function escapeCSVField(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/\r?\n|\r/g, ' ').trim();
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

function triggerCSVDownload(csvContent: string, filenamePrefix: string): void {
  const dateStr = new Date().toISOString().slice(0, 10);
  // Prepend UTF-8 BOM (\uFEFF) so Excel, Numbers, and Google Sheets render Nepali Devanagari and IPA symbols properly
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filenamePrefix}-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getMasteryLabelForExport(
  wordId: string,
  masteredWordIds: string[] = [],
  wordSRS: Record<string, SRSRecord> = {}
): string {
  const rec = wordSRS[wordId];
  if (
    masteredWordIds.includes(wordId) ||
    rec?.stage === 'mastered' ||
    (rec?.intervalDays ?? 0) >= 7
  ) {
    return 'Mastered';
  }
  if (rec?.stage === 'review' || (rec?.intervalDays ?? 0) >= 3) {
    return 'Reviewing';
  }
  if (rec?.stage === 'learning' || (rec?.repetitions ?? 0) > 0) {
    return 'Learning';
  }
  return 'Saved for Review';
}

export function exportSavedWordsToCSV(
  savedWords: EnrichedLexiconItem[],
  masteredWordIds: string[] = [],
  wordSRS: Record<string, SRSRecord> = {}
): void {
  const headers = [
    'No.',
    'English Word',
    'IPA Pronunciation',
    'Part of Speech',
    'CEFR Level',
    'Lecture Unit',
    'Silent-Letter / Phonics Rule',
    'Nepali Meaning (नेपाली अर्थ)',
    'English Example Sentence',
    'Nepali Example Translation',
    'Mastery Status',
    'On-The-Go Review Check',
  ];

  const rows = savedWords.map((item, idx) => [
    idx + 1,
    item.word,
    item.ipa,
    item.partOfSpeech,
    item.level,
    `Lecture ${String(item.lectureNumber).padStart(2, '0')} (${item.category})`,
    item.silentLettersSummary || 'Standard phonetic pronunciation',
    item.nepaliMeaning,
    item.englishExample,
    item.nepaliExampleTranslation || item.nepaliExample || '',
    getMasteryLabelForExport(item.id, masteredWordIds, wordSRS),
    '[ ] Pass 1   [ ] Pass 2   [ ] Mastered',
  ]);

  const csvLines = [
    headers.map(escapeCSVField).join(','),
    ...rows.map((r) => r.map(escapeCSVField).join(',')),
  ].join('\r\n');

  triggerCSVDownload(csvLines, 'bhashasetu-saved-words-sheet');
}

export function exportMistakeNotebookToCSV(mistakes: MistakeItem[]): void {
  const headers = [
    'No.',
    'Quiz / Skill Type',
    'Lecture Unit',
    'Question / Prompt',
    'Previous Mistake',
    'Correct Target Answer',
    'Orthographic / Grammar Explanation',
    'Nepali Context / Hint',
    'Personal Study Note',
    'Graduation Progress',
    'Recorded Date',
    'Physical Review Check',
  ];

  const rows = mistakes.map((m, idx) => [
    idx + 1,
    (m.sourceType || 'QUIZ').toUpperCase(),
    `Lecture ${String(m.lectureNumber).padStart(2, '0')}`,
    m.prompt,
    m.userWrongAnswer,
    m.correctAnswer,
    m.explanation,
    m.nepaliHint || '',
    m.userNote || '',
    `${m.consecutiveCorrect}/2 Correct`,
    m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '',
    '[ ] Reviewed   [ ] Re-tested',
  ]);

  const csvLines = [
    headers.map(escapeCSVField).join(','),
    ...rows.map((r) => r.map(escapeCSVField).join(',')),
  ].join('\r\n');

  triggerCSVDownload(csvLines, 'bhashasetu-mistake-notebook-sheet');
}

export function exportCombinedStudySheetToCSV(
  savedWords: EnrichedLexiconItem[],
  mistakes: MistakeItem[],
  masteredWordIds: string[] = [],
  wordSRS: Record<string, SRSRecord> = {}
): void {
  const headers = [
    'Section',
    'No.',
    'Target Word / Prompt',
    'IPA / Previous Mistake',
    'Correct Meaning / Target Answer',
    'Phonics Rule / Grammar Explanation',
    'Example / Context Hint',
    'Lecture & Level',
    'Status',
    'Physical Review Check',
  ];

  const wordRows = savedWords.map((w, idx) => [
    'SAVED WORD',
    idx + 1,
    w.word,
    w.ipa,
    w.nepaliMeaning,
    w.silentLettersSummary || 'Standard pronunciation',
    w.englishExample,
    `L${String(w.lectureNumber).padStart(2, '0')} (${w.level})`,
    getMasteryLabelForExport(w.id, masteredWordIds, wordSRS),
    '[ ] Pass 1   [ ] Pass 2',
  ]);

  const mistakeRows = mistakes.map((m, idx) => [
    `MISTAKE (${(m.sourceType || 'QUIZ').toUpperCase()})`,
    idx + 1,
    m.prompt,
    `Missed: ${m.userWrongAnswer}`,
    m.correctAnswer,
    m.explanation,
    m.nepaliHint || m.userNote || '',
    `L${String(m.lectureNumber).padStart(2, '0')}`,
    `${m.consecutiveCorrect}/2 Streak`,
    '[ ] Corrected   [ ] Mastered',
  ]);

  const csvLines = [
    headers.map(escapeCSVField).join(','),
    ...wordRows.map((r) => r.map(escapeCSVField).join(',')),
    ...mistakeRows.map((r) => r.map(escapeCSVField).join(',')),
  ].join('\r\n');

  triggerCSVDownload(csvLines, 'bhashasetu-combined-study-sheet');
}
