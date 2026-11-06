import { LectureUnit, VocabularyItem } from '../types/curriculum';

export interface ContentValidationIssue {
  severity: 'error' | 'warning';
  category: 'duplicate_id' | 'segment_mismatch' | 'missing_ipa' | 'missing_nepali';
  itemId: string;
  wordOrTitle: string;
  message: string;
}

export interface ContentValidationReport {
  checkedAt: string;
  totalLectures: number;
  totalVocabularyItems: number;
  validItemsCount: number;
  issues: ContentValidationIssue[];
  isHealthy: boolean;
}

/**
 * Automated Content & Lexicon QA Validator (Phase 3 & Phase 10 Audit Requirement)
 * Verifies:
 * 1. Unique IDs across lectures and vocabulary items
 * 2. Silent-letter orthographic segment integrity: segments.map(s => s.text).join('') === word
 * 3. Non-empty IPA transcription and Nepali Devanagari meaning completeness
 */
export function validateCurriculumAndLexicon(
  lectures: LectureUnit[],
  standaloneVocabulary: VocabularyItem[] = []
): ContentValidationReport {
  const issues: ContentValidationIssue[] = [];
  const seenLectureIds = new Set<string>();
  const seenWordIds = new Set<string>();

  const allVocab: VocabularyItem[] = [];

  for (const lecture of lectures) {
    if (seenLectureIds.has(lecture.id)) {
      issues.push({
        severity: 'error',
        category: 'duplicate_id',
        itemId: lecture.id,
        wordOrTitle: lecture.title,
        message: `Duplicate lecture ID "${lecture.id}" detected.`,
      });
    }
    seenLectureIds.add(lecture.id);

    if (!lecture.nepaliTitle || !lecture.nepaliTitle.trim()) {
      issues.push({
        severity: 'warning',
        category: 'missing_nepali',
        itemId: lecture.id,
        wordOrTitle: lecture.title,
        message: `Lecture "${lecture.title}" is missing a Nepali title.`,
      });
    }

    for (const vocab of lecture.moduleA_vocabulary || []) {
      allVocab.push(vocab);
    }
  }

  for (const vocab of standaloneVocabulary) {
    allVocab.push(vocab);
  }

  let validItemsCount = 0;

  for (const item of allVocab) {
    let itemHasError = false;

    if (seenWordIds.has(item.id)) {
      issues.push({
        severity: 'warning',
        category: 'duplicate_id',
        itemId: item.id,
        wordOrTitle: item.word,
        message: `Duplicate vocabulary ID "${item.id}" for "${item.word}".`,
      });
    }
    seenWordIds.add(item.id);

    // Check segment concatenation integrity
    if (Array.isArray(item.segments) && item.segments.length > 0) {
      const reconstructed = item.segments.map((s) => s.text).join('');
      if (reconstructed.toLowerCase() !== item.word.trim().toLowerCase()) {
        itemHasError = true;
        issues.push({
          severity: 'error',
          category: 'segment_mismatch',
          itemId: item.id,
          wordOrTitle: item.word,
          message: `Segments join to "${reconstructed}" instead of "${item.word}".`,
        });
      }
    }

    // Check IPA presence
    if (!item.ipa || !item.ipa.trim()) {
      itemHasError = true;
      issues.push({
        severity: 'warning',
        category: 'missing_ipa',
        itemId: item.id,
        wordOrTitle: item.word,
        message: `Missing IPA transcription for "${item.word}".`,
      });
    }

    // Check Nepali meaning presence
    if (!item.nepaliMeaning || !item.nepaliMeaning.trim()) {
      itemHasError = true;
      issues.push({
        severity: 'error',
        category: 'missing_nepali',
        itemId: item.id,
        wordOrTitle: item.word,
        message: `Missing Nepali translation for "${item.word}".`,
      });
    }

    if (!itemHasError) {
      validItemsCount++;
    }
  }

  return {
    checkedAt: new Date().toISOString(),
    totalLectures: lectures.length,
    totalVocabularyItems: allVocab.length,
    validItemsCount,
    issues,
    isHealthy: issues.filter((i) => i.severity === 'error').length === 0,
  };
}
