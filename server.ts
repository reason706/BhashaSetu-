import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

function getGenAIClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Route: Sync offline progress when back online
app.post('/api/sync', (req, res) => {
  const { events } = req.body || {};
  const count = Array.isArray(events) ? events.length : 0;
  res.json({
    status: 'synced',
    syncedEventsCount: count,
    syncedAt: new Date().toISOString(),
  });
});

// API Route: Dynamic AI Lesson Generation with Gemini 3.8 Flash
app.post('/api/lessons/generate', async (req, res) => {
  try {
    const { topic, level = 'B2', lectureNumber = 13 } = req.body || {};

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Please provide a valid lesson topic.' });
      return;
    }

    const ai = getGenAIClient();

    const systemInstruction = `You are a senior English-to-Nepali linguist and curriculum designer for "BhashaSetu", an intermediate English learning app for Nepali speakers.
Design a cohesive, deeply educational 4-module lecture on the requested topic and CEFR level (${level}) using the "Spiral 4-Pillar Bridge" methodology:
1. Module A (Vocabulary & Silent-Letter Phonics): Generate 5 high-utility English vocabulary words related to the topic (prioritize words with silent letters or tricky orthography). Break every word into exact character segments ("segments") marking which letters are silent (silent: true) vs pronounced (silent: false) so that concatenating all segments.text equals the exact word. Include accurate IPA, Nepali meaning in Devanagari script, part of speech, an English example sentence, its Nepali translation, and a Nepali usage tip.
2. Module B (Pronunciation Guide): For those same 5 words, break them into easy-to-read syllables, identify the 0-based stressed syllable index, give a simplified English phonetic respelling (e.g., "Kyou" for Queue or "Ker-nel" for Colonel), a Devanagari phonetic sound approximation, a pronunciation rule title, and a clear explanation in Nepali of the pronunciation rule/exception.
3. Module C (Spelling Rules & Common Errors): Teach 1 major English spelling rule relevant to the vocabulary/topic with a clear formula, detailed Nepali explanation, 4 concrete word transformation examples showing correct vs common wrong spelling, 3 exceptions, and 4 interactive mini-quizzes (2 "multiple-choice" and 2 "fill-blank") with Nepali hints and Nepali explanations of why learners make that mistake.
4. Module D (Grammar Capstone): Tie the newly learned vocabulary into a practical grammar lesson comparing English sentence structure (SVO) with Nepali grammar structure (SOV / कर्ता + कर्म + क्रिया) in clear Devanagari Nepali. Include 2 side-by-side syntax comparisons broken into grammatical role tokens (Subject, Verb, Object, Modifier) and 3 interactive capstone exercises.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Create a complete 4-module English-to-Nepali lecture for level ${level} on the topic: "${topic.trim()}". Ensure all Nepali translations and explanations are written in natural, accurate Devanagari script.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'English title of the lecture' },
            nepaliTitle: { type: Type.STRING, description: 'Nepali title in Devanagari script' },
            subtitle: { type: Type.STRING, description: 'Short 1-sentence summary of what the lecture covers' },
            category: { type: Type.STRING, description: 'Short category label, e.g., Workplace, Academic, Daily Life' },
            estimatedMinutes: { type: Type.INTEGER, description: 'Estimated study time in minutes, e.g. 15' },
            moduleA_vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  ipa: { type: Type.STRING },
                  partOfSpeech: { type: Type.STRING },
                  segments: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        silent: { type: Type.BOOLEAN },
                      },
                      required: ['text', 'silent'],
                    },
                  },
                  silentLettersSummary: { type: Type.STRING, description: 'e.g., Silent k and gh, or Pronounced fully (stressed vowel shift)' },
                  nepaliMeaning: { type: Type.STRING, description: 'Meaning in Nepali Devanagari' },
                  englishExample: { type: Type.STRING },
                  nepaliExampleTranslation: { type: Type.STRING },
                  usageTipNepali: { type: Type.STRING },
                },
                required: [
                  'word',
                  'ipa',
                  'partOfSpeech',
                  'segments',
                  'silentLettersSummary',
                  'nepaliMeaning',
                  'englishExample',
                  'nepaliExampleTranslation',
                  'usageTipNepali',
                ],
              },
            },
            moduleB_pronunciation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  ipa: { type: Type.STRING },
                  syllables: { type: Type.ARRAY, items: { type: Type.STRING } },
                  stressedSyllableIndex: { type: Type.INTEGER },
                  simplifiedPhonetic: { type: Type.STRING },
                  nepaliPhoneticHint: { type: Type.STRING },
                  ruleTitle: { type: Type.STRING },
                  ruleExplanationNepali: { type: Type.STRING },
                  commonMispronunciation: { type: Type.STRING },
                },
                required: [
                  'word',
                  'ipa',
                  'syllables',
                  'stressedSyllableIndex',
                  'simplifiedPhonetic',
                  'nepaliPhoneticHint',
                  'ruleTitle',
                  'ruleExplanationNepali',
                  'commonMispronunciation',
                ],
              },
            },
            moduleC_spelling: {
              type: Type.OBJECT,
              properties: {
                ruleTitle: { type: Type.STRING },
                nepaliRuleTitle: { type: Type.STRING },
                formula: { type: Type.STRING },
                nepaliExplanation: { type: Type.STRING },
                examples: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      baseWord: { type: Type.STRING },
                      transformation: { type: Type.STRING },
                      correctSpelling: { type: Type.STRING },
                      commonWrongSpelling: { type: Type.STRING },
                      nepaliMeaning: { type: Type.STRING },
                    },
                    required: ['baseWord', 'transformation', 'correctSpelling', 'commonWrongSpelling', 'nepaliMeaning'],
                  },
                },
                exceptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                quizzes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, description: 'multiple-choice or fill-blank' },
                      promptEnglish: { type: Type.STRING },
                      promptNepaliHint: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } },
                      correctAnswer: { type: Type.STRING },
                      commonMistakeExplanationNepali: { type: Type.STRING },
                    },
                    required: [
                      'type',
                      'promptEnglish',
                      'promptNepaliHint',
                      'options',
                      'correctAnswer',
                      'commonMistakeExplanationNepali',
                    ],
                  },
                },
              },
              required: ['ruleTitle', 'nepaliRuleTitle', 'formula', 'nepaliExplanation', 'examples', 'exceptions', 'quizzes'],
            },
            moduleD_grammar: {
              type: Type.OBJECT,
              properties: {
                topicTitle: { type: Type.STRING },
                nepaliTopicTitle: { type: Type.STRING },
                explanationNepali: { type: Type.STRING },
                keyTakeawaysNepali: { type: Type.ARRAY, items: { type: Type.STRING } },
                syntaxComparisons: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      contextLabel: { type: Type.STRING },
                      englishFullSentence: { type: Type.STRING },
                      nepaliFullSentence: { type: Type.STRING },
                      englishOrderFormula: { type: Type.STRING },
                      nepaliOrderFormula: { type: Type.STRING },
                      structuralNoteNepali: { type: Type.STRING },
                      tokens: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            role: { type: Type.STRING, description: 'Subject, Verb, Object, Modifier, or Connector' },
                            englishText: { type: Type.STRING },
                            nepaliText: { type: Type.STRING },
                            nepaliRoleLabel: { type: Type.STRING },
                          },
                          required: ['role', 'englishText', 'nepaliText', 'nepaliRoleLabel'],
                        },
                      },
                    },
                    required: [
                      'contextLabel',
                      'englishFullSentence',
                      'nepaliFullSentence',
                      'englishOrderFormula',
                      'nepaliOrderFormula',
                      'structuralNoteNepali',
                      'tokens',
                    ],
                  },
                },
                capstoneExercises: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      questionPrompt: { type: Type.STRING },
                      nepaliContext: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } },
                      correctAnswer: { type: Type.STRING },
                      explanationNepali: { type: Type.STRING },
                    },
                    required: ['questionPrompt', 'nepaliContext', 'options', 'correctAnswer', 'explanationNepali'],
                  },
                },
              },
              required: ['topicTitle', 'nepaliTopicTitle', 'explanationNepali', 'keyTakeawaysNepali', 'syntaxComparisons', 'capstoneExercises'],
            },
          },
          required: [
            'title',
            'nepaliTitle',
            'subtitle',
            'category',
            'estimatedMinutes',
            'moduleA_vocabulary',
            'moduleB_pronunciation',
            'moduleC_spelling',
            'moduleD_grammar',
          ],
        },
      },
    });

    const rawText = (response.text ?? '{}').trim();
    const parsed = JSON.parse(rawText);
    const timestamp = Date.now();

    const structuredLecture = {
      id: `ai-lecture-${timestamp}`,
      lectureNumber: Number(lectureNumber) || 7,
      title: parsed.title || `Custom Topic: ${topic}`,
      nepaliTitle: parsed.nepaliTitle || topic,
      subtitle: parsed.subtitle || `AI-generated bilingual curriculum on ${topic}`,
      level: ['B1', 'B2', 'C1'].includes(level) ? level : 'B2',
      category: parsed.category || 'Custom AI Topic',
      estimatedMinutes: parsed.estimatedMinutes || 15,
      isCustomAI: true,
      createdAt: new Date().toISOString(),
      moduleA_vocabulary: (parsed.moduleA_vocabulary || []).map((v: Record<string, unknown>, idx: number) => ({
        ...v,
        id: `ai-${timestamp}-vocab-${idx}`,
      })),
      moduleB_pronunciation: (parsed.moduleB_pronunciation || []).map((p: Record<string, unknown>, idx: number) => ({
        ...p,
        id: `ai-${timestamp}-pron-${idx}`,
      })),
      moduleC_spelling: {
        ...parsed.moduleC_spelling,
        quizzes: (parsed.moduleC_spelling?.quizzes || []).map((q: Record<string, unknown>, idx: number) => ({
          ...q,
          id: `ai-${timestamp}-spell-q-${idx}`,
          type: q.type === 'fill-blank' ? 'fill-blank' : 'multiple-choice',
        })),
      },
      moduleD_grammar: {
        ...parsed.moduleD_grammar,
        syntaxComparisons: (parsed.moduleD_grammar?.syntaxComparisons || []).map((s: Record<string, unknown>, idx: number) => ({
          ...s,
          id: `ai-${timestamp}-syn-${idx}`,
        })),
        capstoneExercises: (parsed.moduleD_grammar?.capstoneExercises || []).map((e: Record<string, unknown>, idx: number) => ({
          ...e,
          id: `ai-${timestamp}-cap-${idx}`,
        })),
      },
    };

    res.json({ lecture: structuredLecture });
  } catch (err: unknown) {
    console.error('Error generating AI lesson:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate AI lecture.';
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BhashaSetu server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
