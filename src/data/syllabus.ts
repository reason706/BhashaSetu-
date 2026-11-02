import { LectureUnit } from '../types/curriculum';
import { CORE_SYLLABUS_PART_2 } from './curriculumDetails';
import { enrichSyllabusWithEnhancements } from './lectureEnhancements';

const RAW_CORE_SYLLABUS: LectureUnit[] = [
  // ============================================================================
  // LECTURE 1 (B1 · Foundation): Silent Consonants & Everyday Action Structures
  // ============================================================================
  {
    id: 'lecture-1-silent-consonants',
    lectureNumber: 1,
    title: 'Silent Consonants & Action Word Order',
    nepaliTitle: 'मौन व्यञ्जन वर्ण (Silent Consonants) र अंग्रेजी वाक्य ढाँचा',
    subtitle:
      'Master classic silent consonant clusters (kn-, wr-, -bt, -lm, -gh) and compare English SVO action sentences with Nepali SOV structure.',
    level: 'B1',
    category: 'Foundation Phonics & Syntax',
    estimatedMinutes: 15,
    moduleA_vocabulary: [
      {
        id: 'l1-v1',
        word: 'Knight',
        ipa: '/naɪt/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'K', silent: true },
          { text: 'ni', silent: false },
          { text: 'gh', silent: true },
          { text: 't', silent: false },
        ],
        silentLettersSummary: 'Silent "k" at start & silent "gh" in middle',
        nepaliMeaning: 'योद्धा / मध्यकालीन शूरवीर',
        nepaliTransliteration: 'नाइट',
        englishExample: 'The brave knight defended the ancient mountain fortress.',
        nepaliExampleTranslation: 'बहादुर योद्धाले प्राचीन पहाडी किल्लाको रक्षा गरे।',
        usageTipNepali:
          '"Knight" (योद्धा) र "Night" (रात) को उच्चारण ठ्याक्कै एउटै (/naɪt/) हुन्छ। सुरुको "K" र बीचको "gh" कहिल्यै उच्चारण हुँदैन।',
      },
      {
        id: 'l1-v2',
        word: 'Subtle',
        ipa: '/ˈsʌt.əl/',
        partOfSpeech: 'Adjective',
        segments: [
          { text: 'Su', silent: false },
          { text: 'b', silent: true },
          { text: 'tle', silent: false },
        ],
        silentLettersSummary: 'Silent "b" before "t"',
        nepaliMeaning: 'सूक्ष्म / सजिलै नदेखिने तर गहिरो',
        nepaliTransliteration: 'सटल',
        englishExample: 'There is a subtle difference between these two Nepali proverbs.',
        nepaliExampleTranslation: 'यी दुई नेपाली उखानहरू बीच एउटा सूक्ष्म भिन्नता छ।',
        usageTipNepali:
          'धेरैजसो सिकारुहरूले यसलाई "सब-टल" भन्छन्, तर बीचको "b" पूर्ण रूपमा मौन (silent) हुन्छ र यो "स-टल" (/ˈsʌt.əl/) सुनिन्छ।',
      },
      {
        id: 'l1-v3',
        word: 'Wrist',
        ipa: '/rɪst/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'W', silent: true },
          { text: 'rist', silent: false },
        ],
        silentLettersSummary: 'Silent "w" before "r"',
        nepaliMeaning: 'नाडी (हातको मणिबन्ध)',
        nepaliTransliteration: 'रिस्ट',
        englishExample: 'She wears a traditional silver bangle on her right wrist.',
        nepaliExampleTranslation: 'उनी आफ्नो दाहिने नाडीमा परम्परागत चाँदीको चुरा लगाउँछिन्।',
        usageTipNepali:
          'अंग्रेजीमा "wr-" बाट सुरु हुने शब्दहरू (wrist, write, wrong, wrap) मा "w" कहिल्यै बोलिँदैन। सिधै "r" बाट आवाज सुरु गर्नुहोस्।',
      },
      {
        id: 'l1-v4',
        word: 'Doubt',
        ipa: '/daʊt/',
        partOfSpeech: 'Noun / Verb',
        segments: [
          { text: 'Dou', silent: false },
          { text: 'b', silent: true },
          { text: 't', silent: false },
        ],
        silentLettersSummary: 'Silent "b" before final "t"',
        nepaliMeaning: 'शंका / सन्देह गर्नु',
        nepaliTransliteration: 'डाउट',
        englishExample: 'Without a doubt, consistent daily practice improves fluency.',
        nepaliExampleTranslation: 'निःसन्देह, निरन्तर दैनिक अभ्यासले भाषा प्रवाहमा सुधार ल्याउँछ।',
        usageTipNepali:
          '"Doubt" र "Debt" (ऋण) दुवैमा "b" लेखिन्छ तर उच्चारण गर्दा "b" लाई पूरै छोडेर "डाउट" र "डेट" भनिन्छ।',
      },
      {
        id: 'l1-v5',
        word: 'Calm',
        ipa: '/kɑːm/',
        partOfSpeech: 'Adjective / Verb',
        segments: [
          { text: 'Ca', silent: false },
          { text: 'l', silent: true },
          { text: 'm', silent: false },
        ],
        silentLettersSummary: 'Silent "l" before "m"',
        nepaliMeaning: 'शान्त / स्थिर',
        nepaliTransliteration: 'काम',
        englishExample: 'The lake in Pokhara remained completely calm at sunrise.',
        nepaliExampleTranslation: 'सूर्योदयको समयमा पोखराको ताल पूर्ण रूपमा शान्त रह्यो।',
        usageTipNepali:
          '"Calm", "Palm" (हत्केला), र "Almond" (बदाम) मा "m" भन्दा अगाडि आउने "l" मौन रहन्छ। यसलाई "काल्म" होइन "काम" भन्नुहोस्।',
      },
    ],
    moduleB_pronunciation: [
      {
        id: 'l1-p1',
        word: 'Knight',
        ipa: '/naɪt/',
        syllables: ['knight'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'Nait',
        nepaliPhoneticHint: 'नाइट (१ सिलेबल)',
        ruleTitle: 'The Silent "KN-" & "-GH-" Heritage Rule',
        ruleExplanationNepali:
          'पुरानो अंग्रेजीमा "k" उच्चारण गरिन्थ्यो, तर आधुनिक अंग्रेजीमा शब्दको सुरुमा "kn" आउँदा (know, knee, knife, knight) "k" सधैं मौन हुन्छ। त्यस्तै, स्वर वर्णपछिको "gh" (night, light,flight) पनि बोलिँदैन।',
        commonMispronunciation: 'Kuh-night (क-नाइट)',
      },
      {
        id: 'l1-p2',
        word: 'Subtle',
        ipa: '/ˈsʌt.əl/',
        syllables: ['sut', 'uhl'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'Suh-tl',
        nepaliPhoneticHint: 'स-टल (पहिलो भागमा जोड)',
        ruleTitle: 'Silent "B" in "-BT" Combinations',
        ruleExplanationNepali:
          'ल्याटिन मूलबाट आएका शब्दहरू जस्तै "subtle", "doubt", र "debt" मा "b" र "t" सँगै आउँदा जिब्रोले "b" उच्चारण गर्दैन, सिधै "t" मा जान्छ।',
        commonMispronunciation: 'Sub-tle (सब-टल)',
      },
      {
        id: 'l1-p3',
        word: 'Wrist',
        ipa: '/rɪst/',
        syllables: ['rist'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'Rist',
        nepaliPhoneticHint: 'रिस्ट',
        ruleTitle: 'Initial "WR-" Gliding Rule',
        ruleExplanationNepali:
          'जब शब्द "wr" बाट सुरु हुन्छ (wrist, write, wrestle, wrinkle), ओठ गोलो पारेर "व" भन्नु पर्दैन; सिधै अंग्रेजी "r" को आवाज निकाल्नुहोस्।',
        commonMispronunciation: 'Wuh-rist (व-रिस्ट)',
      },
      {
        id: 'l1-p4',
        word: 'Doubt',
        ipa: '/daʊt/',
        syllables: ['dawt'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'Dawt',
        nepaliPhoneticHint: 'डाउट',
        ruleTitle: 'Diphthong /aʊ/ + Silent B',
        ruleExplanationNepali:
          '"ou" ले नेपाली "आउ" (/aʊ/) को आवाज दिन्छ (जस्तै out, loud, house)। बीचको "b" नबोली सिधै "डाउट" भन्नुहोस्।',
        commonMispronunciation: 'Dow-but (डाउ-बट)',
      },
      {
        id: 'l1-p5',
        word: 'Calm',
        ipa: '/kɑːm/',
        syllables: ['kaam'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'Kaam',
        nepaliPhoneticHint: 'काम (लामो आ)',
        ruleTitle: 'Silent "L" Before Labial Consonants (M, F, K)',
        ruleExplanationNepali:
          '"a" पछि आउने "l" यदि "m", "f", वा "k" भन्दा अगाडि छ भने प्रायः मौन हुन्छ—जस्तै: calm (काम), half (हाफ), talk (टक), walk (वक)।',
        commonMispronunciation: 'Kaalm (काल्म)',
      },
    ],
    moduleC_spelling: {
      ruleTitle: 'The Silent "-E" Drop vs. Keep Rule',
      nepaliRuleTitle: 'अन्तिमको मौन "-e" हटाउने वा राख्ने नियम',
      formula:
        'Drop "-e" before a Vowel Suffix (-ing, -ed, -able) · Keep "-e" before a Consonant Suffix (-ly, -ful, -less, -ment)',
      nepaliExplanation:
        'अंग्रेजी शब्दको अन्त्यमा नबोलिने "-e" छ भने, त्यसपछाडि स्वर वर्ण (vowel: a, e, i, o, u) बाट सुरु हुने प्रत्यय (suffix) जोड्दा "-e" हटाइन्छ (जस्तै: write + ing = writing)। तर व्यञ्जन वर्ण (consonant: -ly, -ful, -ment) बाट सुरु हुने प्रत्यय जोड्दा "-e" कायम राखिन्छ (जस्तै: subtle + ly = subtly अपवाद बाहेक care + ful = careful)।',
      examples: [
        {
          baseWord: 'write',
          transformation: 'write + -ing (vowel suffix)',
          correctSpelling: 'writing',
          commonWrongSpelling: 'writeing / writting',
          nepaliMeaning: 'लेख्दै (एकवटा मात्र t र e हटाइएको)',
        },
        {
          baseWord: 'subtle',
          transformation: 'subtle + -ty (noun suffix)',
          correctSpelling: 'subtlety',
          commonWrongSpelling: 'subtley',
          nepaliMeaning: 'सूक्ष्मता',
        },
        {
          baseWord: 'hope',
          transformation: 'hope + -ful (consonant suffix)',
          correctSpelling: 'hopeful',
          commonWrongSpelling: 'hopful',
          nepaliMeaning: 'आशावादी (व्यञ्जन प्रत्यय अगाडि e रहन्छ)',
        },
        {
          baseWord: 'argue',
          transformation: 'argue + -ment (important exception)',
          correctSpelling: 'argument',
          commonWrongSpelling: 'arguement',
          nepaliMeaning: 'तर्क / बहस (यसमा e हट्छ)',
        },
      ],
      exceptions: [
        'truly (true + ly → drops e)',
        'argument (argue + ment → drops e)',
        'noticeable & courageous (keep e after c/g before -able/-ous to keep soft sound)',
      ],
      quizzes: [
        {
          id: 'l1-q1',
          type: 'multiple-choice',
          promptEnglish: 'Choose the correct spelling for the continuous form of "write":',
          promptNepaliHint: '"Write" मा "-ing" जोड्दा सही हिज्जे कुन हुन्छ?',
          options: ['writing', 'writting', 'writeing', 'ritng'],
          correctAnswer: 'writing',
          commonMistakeExplanationNepali:
            '"Write" मा लामो स्वर ध्वनि (/aɪ/) छ, त्यसैले "t" दोब्बर हुँदैन (writting गलत हो) र अन्तिमको "-e" हटेर "writing" बन्छ।',
        },
        {
          id: 'l1-q2',
          type: 'multiple-choice',
          promptEnglish: 'Which word correctly spells the person or action with a silent "b"?',
          promptNepaliHint: 'मौन "b" भएको सही हिज्जे छान्नुहोस्:',
          options: ['doubtful', 'doutful', 'doubbtful', 'dubtful'],
          correctAnswer: 'doubtful',
          commonMistakeExplanationNepali:
            'उच्चारणमा "b" नसुनिने भए तापनि हिज्जेमा "d-o-u-b-t-f-u-l" नै लेख्नुपर्छ।',
        },
        {
          id: 'l1-q3',
          type: 'fill-blank',
          promptEnglish: 'She explained the grammar rule in a very ______ (subtle) way.',
          promptNepaliHint: 'खाली ठाउँमा "सूक्ष्म" अर्थ दिने सही हिज्जे छान्नुहोस्:',
          options: ['subtle', 'suttle', 'subtel', 'suddle'],
          correctAnswer: 'subtle',
          commonMistakeExplanationNepali:
            'यसमा "b" मौन रहन्छ तर लेख्दा सधैं "s-u-b-t-l-e" लेखिन्छ।',
        },
        {
          id: 'l1-q4',
          type: 'fill-blank',
          promptEnglish: 'After a long discussion, they settled their ______ (argue + ment) calmly.',
          promptNepaliHint: '"Argue" र "-ment" जोड्दा बन्ने सही शब्द छान्नुहोस्:',
          options: ['argument', 'arguement', 'argumant', 'arrgument'],
          correctAnswer: 'argument',
          commonMistakeExplanationNepali:
            '"Argue" मा "-ment" थप्दा अपवाद स्वरूप अन्तिमको "e" हट्छ र "argument" मात्र लेखिन्छ।',
        },
      ],
    },
    moduleD_grammar: {
      topicTitle: 'English SVO vs. Nepali SOV & Placement of Manner Adverbs',
      nepaliTopicTitle: 'अंग्रेजी (SVO) र नेपाली (SOV) वाक्य ढाँचा तथा क्रियाविशेषणको स्थान',
      explanationNepali:
        'नेपाली भाषामा वाक्यको ढाँचा "कर्ता + कर्म + क्रिया" (Subject + Object + Verb) हुन्छ—जस्तै: "योद्धाले (S) किल्लाको (O) रक्षा गरे (V)।" तर अंग्रेजीमा क्रिया (Verb) सधैं कर्ता (Subject) लगत्तै आउँछ र कर्म (Object) पछाडि जान्छ (Subject + Verb + Object)। साथै, काम कसरी भयो भन्ने क्रियाविशेषण (जस्तै calmly, subtly) अंग्रेजीमा प्रायः कर्म (Object) पछि राखिन्छ—क्रिया र कर्मको बीचमा राखिँदैन!',
      keyTakeawaysNepali: [
        'अंग्रेजीमा Subject पछि तुरुन्तै Verb राख्नुहोस्, Object लाई Verb पछि सार्नुहोस्।',
        'Verb र Object को बीचमा कहिल्यै पनि "calmly" वा "carefully" जस्ता शब्द नराख्नुहोस् (❌ He Bandaged Calmly His Wrist → ✅ He bandaged his wrist calmly)।',
        'शंका वा निश्चितता व्यक्त गर्दा "Without a doubt" वाक्यको सुरुमा वा अन्त्यमा राख्न सकिन्छ।',
      ],
      syntaxComparisons: [
        {
          id: 'l1-syn-1',
          contextLabel: 'Action Sentence with Direct Object',
          englishFullSentence: 'The brave knight protected the fortress.',
          nepaliFullSentence: 'बहादुर योद्धाले किल्लाको रक्षा गरे।',
          englishOrderFormula: 'Subject + Verb + Object (SVO)',
          nepaliOrderFormula: 'कर्ता (Subject) + कर्म (Object) + क्रिया (Verb) (SOV)',
          structuralNoteNepali:
            'ध्यान दिनुहोस्: नेपालीमा अन्त्यमा आउने "रक्षा गरे" (protected) अंग्रेजीमा कर्ता लगत्तै दोस्रो स्थानमा आउँछ।',
          tokens: [
            {
              role: 'Subject',
              englishText: 'The brave knight',
              nepaliText: 'बहादुर योद्धाले',
              nepaliRoleLabel: 'कर्ता (Subject)',
            },
            {
              role: 'Verb',
              englishText: 'protected',
              nepaliText: 'रक्षा गरे',
              nepaliRoleLabel: 'क्रिया (Verb)',
            },
            {
              role: 'Object',
              englishText: 'the fortress',
              nepaliText: 'किल्लाको',
              nepaliRoleLabel: 'कर्म (Object)',
            },
          ],
        },
        {
          id: 'l1-syn-2',
          contextLabel: 'Action Sentence + Adverb of Manner (कसरी?)',
          englishFullSentence: 'She wrapped her injured wrist calmly.',
          nepaliFullSentence: 'उनले शान्तपूर्वक आफ्नो घाइते नाडी बाँधिन्।',
          englishOrderFormula: 'Subject + Verb + Object + Manner Adverb',
          nepaliOrderFormula: 'कर्ता + क्रियाविशेषण + कर्म + क्रिया',
          structuralNoteNepali:
            'नेपालीमा "शान्तपूर्वक" सुरुतिरै आए पनि अंग्रेजीमा "wrapped" र "her injured wrist" लाई छुट्याउन मिल्दैन, त्यसैले "calmly" वाक्यको अन्त्यमा जान्छ।',
          tokens: [
            {
              role: 'Subject',
              englishText: 'She',
              nepaliText: 'उनले',
              nepaliRoleLabel: 'कर्ता (Subject)',
            },
            {
              role: 'Verb',
              englishText: 'wrapped',
              nepaliText: 'बाँधिन्',
              nepaliRoleLabel: 'क्रिया (Verb)',
            },
            {
              role: 'Object',
              englishText: 'her injured wrist',
              nepaliText: 'आफ्नो घाइते नाडी',
              nepaliRoleLabel: 'कर्म (Object)',
            },
            {
              role: 'Modifier',
              englishText: 'calmly',
              nepaliText: 'शान्तपूर्वक',
              nepaliRoleLabel: 'रीतिवाचक क्रियाविशेषण',
            },
          ],
        },
      ],
      capstoneExercises: [
        {
          id: 'l1-cap-1',
          questionPrompt: 'Which English sentence uses the natural word order for: "शिक्षकले सूक्ष्म संकेत दिनुभयो"?',
          nepaliContext: 'Subject + Verb + Object नियम प्रयोग गर्नुहोस्:',
          options: [
            'The teacher gave a subtle hint.',
            'The teacher a subtle hint gave.',
            'Gave the teacher a subtle hint.',
            'The teacher subtly gave hint a.',
          ],
          correctAnswer: 'The teacher gave a subtle hint.',
          explanationNepali:
            'अंग्रेजीमा कर्ता (The teacher) पछि क्रिया (gave) र त्यसपछि कर्म (a subtle hint) आउँछ।',
        },
        {
          id: 'l1-cap-2',
          questionPrompt: 'Where should the adverb "calmly" be placed in this sentence?',
          nepaliContext: 'क्रिया (Verb) र कर्म (Object) को बीचमा क्रियाविशेषण नराख्ने नियम सम्झनुहोस्:',
          options: [
            'He answered every doubt calmly.',
            'He answered calmly every doubt.',
            'He calmly every doubt answered.',
            'Calmly he every doubt answered.',
          ],
          correctAnswer: 'He answered every doubt calmly.',
          explanationNepali:
            'अंग्रेजीमा मुख्य क्रिया (answered) र कर्म (every doubt) बीचमा "calmly" राख्नु अस्वाभाविक मानिन्छ; यसलाई कर्म पछाडि अन्त्यमा राख्नु उत्तम हुन्छ।',
        },
        {
          id: 'l1-cap-3',
          questionPrompt: 'Complete the sentence: "I have no ______ that she was ______ the truth."',
          nepaliContext: 'मौन "b" भएको शब्द र "-ing" हिज्जे नियम दुवै प्रयोग गर्नुहोस्:',
          options: [
            'doubt / writing',
            'dout / writting',
            'doubt / writeing',
            'dubt / writing',
          ],
          correctAnswer: 'doubt / writing',
          explanationNepali:
            '"Doubt" मा मौन "b" हुन्छ र "write + ing" हुँदा अन्तिमको "e" हटेर "writing" बन्छ।',
        },
      ],
    },
  },

  // ============================================================================
  // LECTURE 2 (B1 · Everyday Communication): Deceptive Vowels, Syllables & Time
  // ============================================================================
  {
    id: 'lecture-2-deceptive-vowels',
    lectureNumber: 2,
    title: 'Deceptive Vowels, Dropped Syllables & Time Prepositions',
    nepaliTitle: 'भ्रामक स्वर वर्ण, छोटिने सिलेबल र समयका नामयोगी (Prepositions)',
    subtitle:
      'Learn why "Queue" is just one syllable and "Wednesday" has two, master the "I before E" spelling rule, and choose a/an & on/in/at accurately.',
    level: 'B1',
    category: 'Everyday Communication',
    estimatedMinutes: 16,
    moduleA_vocabulary: [
      {
        id: 'l2-v1',
        word: 'Queue',
        ipa: '/kjuː/',
        partOfSpeech: 'Noun / Verb',
        segments: [
          { text: 'Q', silent: false },
          { text: 'ue', silent: false },
          { text: 'ue', silent: true },
        ],
        silentLettersSummary: 'Pronounced just like the letter "Q" — trailing "ue" is silent',
        nepaliMeaning: 'लाम / पालो पर्खने लाइन',
        nepaliTransliteration: 'क्यू',
        englishExample: 'People stood patiently in a long queue outside the bank.',
        nepaliExampleTranslation: 'मानिसहरू बैंक बाहिर लामो लाममा धैर्यपूर्वक उभिए।',
        usageTipNepali:
          '"Queue" मा ५ वटा अक्षर भए पनि यसको उच्चारण अंग्रेजी अक्षर "Q" (/kjuː/ - क्यू) मात्र हुन्छ! पछाडिका चारवटा स्वर वर्णहरूले आवाज लामो मात्र बनाउँछन्।',
      },
      {
        id: 'l2-v2',
        word: 'Wednesday',
        ipa: '/ˈwenz.deɪ/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'We', silent: false },
          { text: 'd', silent: true },
          { text: 'n', silent: false },
          { text: 'e', silent: true },
          { text: 'sday', silent: false },
        ],
        silentLettersSummary: 'Silent "d" and silent middle "e" (2 syllables, not 3)',
        nepaliMeaning: 'बुधबार',
        nepaliTransliteration: 'वेन्ज-डे',
        englishExample: 'Our English pronunciation workshop meets every Wednesday.',
        nepaliExampleTranslation: 'हाम्रो अंग्रेजी उच्चारण कार्यशाला हरेक बुधबार बस्छ।',
        usageTipNepali:
          'यसलाई हिज्जे सम्झन मनमनै "Wed-nes-day" भन्न सकिन्छ, तर बोल्दा बीचको "d" र "e" लोप भएर दुई सिलेबलमा "वेन्ज-डे" (/ˈwenz.deɪ/) मात्र भनिन्छ।',
      },
      {
        id: 'l2-v3',
        word: 'Receipt',
        ipa: '/rɪˈsiːt/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'Re', silent: false },
          { text: 'cei', silent: false },
          { text: 'p', silent: true },
          { text: 't', silent: false },
        ],
        silentLettersSummary: 'Silent "p" before final "t", and "ei" after "c"',
        nepaliMeaning: 'रसिद / भुक्तानी बिल',
        nepaliTransliteration: 'रिसिट',
        englishExample: 'Please keep your digital receipt after paying the tuition fee.',
        nepaliExampleTranslation: 'कृपया शुल्क तिरेपछि आफ्नो डिजिटल रसिद सुरक्षित राख्नुहोस्।',
        usageTipNepali:
          '"Recipe" (खाना पकाउने विधि - रे-सि-पी) मा "p" बोलिन्छ, तर "Receipt" (रसिद - रि-सिट) मा "p" पूर्ण रूपमा मौन हुन्छ!',
      },
      {
        id: 'l2-v4',
        word: 'Honest',
        ipa: '/ˈɒn.ɪst/',
        partOfSpeech: 'Adjective',
        segments: [
          { text: 'H', silent: true },
          { text: 'onest', silent: false },
        ],
        silentLettersSummary: 'Silent initial "h" — starts with vowel sound /ɒ/',
        nepaliMeaning: 'इमानदार / निष्कपट',
        nepaliTransliteration: 'अनिस्ट',
        englishExample: 'An honest person earns respect in every community.',
        nepaliExampleTranslation: 'एक इमानदार व्यक्तिले हरेक समुदायमा सम्मान कमाउँछ।',
        usageTipNepali:
          'सुरुको "H" मौन हुने हुनाले यसको आवाज स्वर वर्ण "अ" (/ɒ/) बाट सुरु हुन्छ। त्यसैले यसको अगाडि "a honest" नभई सधैं "an honest" लाग्छ।',
      },
      {
        id: 'l2-v5',
        word: 'February',
        ipa: '/ˈfeb.ru.ər.i/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'Feb', silent: false },
          { text: 'r', silent: false },
          { text: 'uary', silent: false },
        ],
        silentLettersSummary: 'First "r" is often softened to /j/ in speech, but mandatory in spelling',
        nepaliMeaning: 'फेब्रुअरी महिना',
        nepaliTransliteration: 'फेब्रुअरी',
        englishExample: 'The cultural festival will take place in mid-February.',
        nepaliExampleTranslation: 'सांस्कृतिक महोत्सव फेब्रुअरीको मध्यमा आयोजना हुनेछ।',
        usageTipNepali:
          'धेरै मानिसले हिज्जे लेख्दा पहिलो "r" छुटाएर "Febuary" लेख्छन्। सधैं "Feb + r + uary" लेख्न नबिर्सनुहोस्।',
      },
    ],
    moduleB_pronunciation: [
      {
        id: 'l2-p1',
        word: 'Queue',
        ipa: '/kjuː/',
        syllables: ['kyou'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'Kyou',
        nepaliPhoneticHint: 'क्यू (१ सिलेबल मात्र)',
        ruleTitle: 'French Vowel Tail Silence',
        ruleExplanationNepali:
          'फ्रान्सेली मूलको यो शब्दमा "qu" पछाडि आउने "eue" केवल हिज्जेको परम्परा हो। यसलाई "क्यु-इ-यु" वा "क्वी" भनिँदैन, सिधै "क्यू" भनिन्छ।',
        commonMispronunciation: 'Kwee-wee / Kyoo-ee',
      },
      {
        id: 'l2-p2',
        word: 'Wednesday',
        ipa: '/ˈwenz.deɪ/',
        syllables: ['wenz', 'day'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'Wenz-day',
        nepaliPhoneticHint: 'वेन्ज-डे (२ सिलेबल)',
        ruleTitle: 'Syllable Compression (Syncope)',
        ruleExplanationNepali:
          'छिटो र स्वाभाविक अंग्रेजी बोल्दा बीचको कमजोर सिलेबल दबिन्छ। त्यसैले ३ सिलेबल जस्तो देखिने "Wed-nes-day" बोल्दा २ सिलेबलको "वेन्ज-डे" मात्र हुन्छ।',
        commonMispronunciation: 'Wed-nes-day (वेड-नेस-डे)',
      },
      {
        id: 'l2-p3',
        word: 'Receipt',
        ipa: '/rɪˈsiːt/',
        syllables: ['ri', 'seet'],
        stressedSyllableIndex: 1,
        simplifiedPhonetic: 'Ri-SEET',
        nepaliPhoneticHint: 'रि-सिट (दोस्रो भागमा जोड)',
        ruleTitle: 'Silent "P" in "-PT" Endings',
        ruleExplanationNepali:
          '"Receive" बाट बनेको नाम शब्द "Receipt" मा पुरानो ल्याटिन रूप देखाउन "p" राखिएको हो, तर उच्चारणमा "p" कहिल्यै आउँदैन।',
        commonMispronunciation: 'Ri-sept / Re-si-pit',
      },
      {
        id: 'l2-p4',
        word: 'Honest',
        ipa: '/ˈɒn.ɪst/',
        syllables: ['on', 'ist'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'On-ist',
        nepaliPhoneticHint: 'अ-निस्ट',
        ruleTitle: 'The 4 Silent "H" Words (Hour, Honest, Honour, Heir)',
        ruleExplanationNepali:
          'अंग्रेजीमा अधिकांश "h" उच्चारण हुन्छन् (house, happy), तर चारवटा मुख्य शब्द परिवार—hour (घण्टा), honest (इमानदार), honour (सम्मान), र heir (उत्तराधिकारी)—मा "h" पूर्ण रूपमा मौन हुन्छ।',
        commonMispronunciation: 'Ho-nest (हो-नेस्ट)',
      },
      {
        id: 'l2-p5',
        word: 'February',
        ipa: '/ˈfeb.ru.ər.i/',
        syllables: ['feb', 'roo', 'uh', 'ree'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'Feb-roo-uh-ree',
        nepaliPhoneticHint: 'फेब-रु-अ-री',
        ruleTitle: 'R-Cluster Dissimilation',
        ruleExplanationNepali:
          'एउटै शब्दमा नजिकै दुईवटा "r" आउँदा जिब्रोलाई सजिलो बनाउन कतिपय वक्ताले "फेब्युअरी" जस्तो बोले पनि स्पष्ट उच्चारण र हिज्जे दुवैका लागि "Feb-ru-ary" सम्झनु उपयोगी हुन्छ।',
        commonMispronunciation: 'Feb-yoo-ree (पहिलो r पूरै बिर्सने)',
      },
    ],
    moduleC_spelling: {
      ruleTitle: '"I Before E, Except After C" (and the /eɪ/ Sound Rule)',
      nepaliRuleTitle: '"C" पछाडि बाहेक सधैं "I" पछि "E" आउने नियम',
      formula: 'Long /iː/ sound → "ie" (believe, piece) · After "c" → "ei" (receive, receipt) · /eɪ/ sound → "ei" (weight, neighbor)',
      nepaliExplanation:
        'जब शब्दमा लामो "ई" (/iː/) को आवाज आउँछ, सामान्यतया पहिले "i" अनि "e" लेखिन्छ (ie: believe, achieve, field)। तर यदि अगाडि अक्षर "c" छ भने उल्टो भएर "ei" लेखिन्छ (receive, receipt, ceiling, deceive)। यदि आवाज "ए" (/eɪ/) जस्तो छ भने पनि "ei" नै हुन्छ (weight, eight, neighbor)।',
      examples: [
        {
          baseWord: 'receive',
          transformation: 'After letter "c" (/iː/ sound)',
          correctSpelling: 'receive',
          commonWrongSpelling: 'recieve',
          nepaliMeaning: 'प्राप्त गर्नु (c पछाडि e-i)',
        },
        {
          baseWord: 'receipt',
          transformation: 'After letter "c" + silent "p"',
          correctSpelling: 'receipt',
          commonWrongSpelling: 'reciept / receit',
          nepaliMeaning: 'रसिद (c पछाडि e-i र अन्त्यमा pt)',
        },
        {
          baseWord: 'believe',
          transformation: 'Standard /iː/ sound (not after c)',
          correctSpelling: 'believe',
          commonWrongSpelling: 'beleive',
          nepaliMeaning: 'विश्वास गर्नु (l पछाडि i-e)',
        },
        {
          baseWord: 'neighbor',
          transformation: 'Vowels making /eɪ/ ("ए") sound',
          correctSpelling: 'neighbor',
          commonWrongSpelling: 'nieghbor',
          nepaliMeaning: 'छिमेकी ("ए" आवाज आउँदा e-i)',
        },
      ],
      exceptions: [
        'weird (अनौठो — starts with we-)',
        'foreign (विदेशी — e-i before silent g)',
        'seize & protein (/iː/ sound with ei)',
      ],
      quizzes: [
        {
          id: 'l2-q1',
          type: 'multiple-choice',
          promptEnglish: 'Select the correct spelling for the payment slip you get at a shop:',
          promptNepaliHint: 'पसलमा पैसा तिरेपछि पाइने "रसिद" को सही हिज्जे कुन हो?',
          options: ['receipt', 'reciept', 'receit', 'resipt'],
          correctAnswer: 'receipt',
          commonMistakeExplanationNepali:
            'अक्षर "c" पछाडि सधैं "e-i" आउँछ र अन्त्यमा मौन "p" सहित "receipt" लेखिन्छ।',
        },
        {
          id: 'l2-q2',
          type: 'multiple-choice',
          promptEnglish: 'Which day of the week is spelled correctly?',
          promptNepaliHint: '"बुधबार" को सही अंग्रेजी हिज्जे छान्नुहोस्:',
          options: ['Wednesday', 'Wensday', 'Wednsday', 'Wedenesday'],
          correctAnswer: 'Wednesday',
          commonMistakeExplanationNepali:
            'बोल्दा "Wenz-day" भनिए पनि लेख्दा "Wed + nes + day" तीनवटै भाग पूरा लेख्नुपर्छ।',
        },
        {
          id: 'l2-q3',
          type: 'fill-blank',
          promptEnglish: 'Did you ______ (receive) the schedule for ______ (February)?',
          promptNepaliHint: '"c पछाडि ei" र फेब्रुअरीमा दुवै "r" हुने नियम प्रयोग गर्नुहोस्:',
          options: [
            'receive / February',
            'recieve / February',
            'receive / Febuary',
            'recieve / Febuary',
          ],
          correctAnswer: 'receive / February',
          commonMistakeExplanationNepali:
            '"Receive" मा c पछि ei हुन्छ र "February" मा पहिले Feb पछि r-u-a-r-y आउँछ।',
        },
        {
          id: 'l2-q4',
          type: 'fill-blank',
          promptEnglish: 'We waited in a long ______ (queue) to ______ (believe) what we saw.',
          promptNepaliHint: '"लाम" र "विश्वास गर्नु" को सही हिज्जे जोडी छान्नुहोस्:',
          options: [
            'queue / believe',
            'que / beleive',
            'queue / beleive',
            'quew / believe',
          ],
          correctAnswer: 'queue / believe',
          commonMistakeExplanationNepali:
            '"Queue" मा q पछि u-e-u-e आउँछ र "believe" मा c नभएकोले i-e लेखिन्छ।',
        },
      ],
    },
    moduleD_grammar: {
      topicTitle: 'Sound-Based Articles (A vs. An) & Time Prepositions (On, In, At)',
      nepaliTopicTitle: 'ध्वनिमा आधारित आर्टिकल (A/An) र समय बुझाउने नामयोगी (On, In, At)',
      explanationNepali:
        '१. आर्टिकल नियम: "A" वा "An" छान्दा शब्दको पहिलो अक्षर (letter) होइन, पहिलो आवाज (sound) हेर्नुपर्छ! "Honest" र "Hour" व्यञ्जन अक्षर H बाट सुरु भए पनि आवाज स्वर वर्ण "अ" बाट आउने हुनाले "an honest person" भनिन्छ। अर्कोतर्फ "University" वा "Queue" मा "य / क" व्यञ्जन आवाज आउने हुनाले "a queue / a university" हुन्छ।\n२. समयको नियम: नेपालीमा बार, महिना, र घडीको समय तीनवटैमा एउटै "-मा" विभक्ति (बुधबारमा / फेब्रुअरीमा / ५ बजेमा) लाग्छ। तर अंग्रेजीमा: बार र मितिको अगाडि "ON" (on Wednesday), महिना र वर्षको अगाडि "IN" (in February), र घडीको निश्चित समयको अगाडि "AT" (at 9:00 AM) प्रयोग हुन्छ।',
      keyTakeawaysNepali: [
        'स्वर ध्वनि (अ, आ, इ, ए, ओ) बाट उच्चारण सुरु भएमा "an" राख्नुहोस्: an honest man, an hour।',
        'बार वा तोकिएको दिनमा = ON (on Wednesday, on May 5th)।',
        'महिना, ऋतु, वा वर्षमा = IN (in February, in 2026)।',
        'घडीको ठ्याक्कै समयमा = AT (at 7:30 AM, at noon)।',
      ],
      syntaxComparisons: [
        {
          id: 'l2-syn-1',
          contextLabel: 'Nepali "-मा" Split Across English Time Prepositions',
          englishFullSentence: 'The meeting is on Wednesday in February at 10 AM.',
          nepaliFullSentence: 'बैठक फेब्रुअरीमा बुधबार बिहान १० बजेमा छ।',
          englishOrderFormula: 'on + Day · in + Month · at + Clock Time',
          nepaliOrderFormula: 'महिनामा + बार + बजेमा + क्रिया',
          structuralNoteNepali:
            'नेपालीमा एउटै "-मा" ले काम चलाए पनि अंग्रेजीमा दिनलाई "on", महिनालाई "in", र घडीको समयलाई "at" चाहिन्छ।',
          tokens: [
            {
              role: 'Subject',
              englishText: 'The meeting',
              nepaliText: 'बैठक',
              nepaliRoleLabel: 'कर्ता (Subject)',
            },
            {
              role: 'Verb',
              englishText: 'is',
              nepaliText: 'छ',
              nepaliRoleLabel: 'क्रिया (Verb)',
            },
            {
              role: 'Modifier',
              englishText: 'on Wednesday',
              nepaliText: 'बुधबार',
              nepaliRoleLabel: 'बार (on + Day)',
            },
            {
              role: 'Modifier',
              englishText: 'in February',
              nepaliText: 'फेब्रुअरीमा',
              nepaliRoleLabel: 'महिना (in + Month)',
            },
            {
              role: 'Modifier',
              englishText: 'at 10 AM',
              nepaliText: 'बिहान १० बजे',
              nepaliRoleLabel: 'समय (at + Time)',
            },
          ],
        },
        {
          id: 'l2-syn-2',
          contextLabel: 'Article Selection by Initial Sound vs. Spelling',
          englishFullSentence: 'An honest cashier gave me a receipt in a queue.',
          nepaliFullSentence: 'एक इमानदार क्यासियरले मलाई लाममा एउटा रसिद दिए।',
          englishOrderFormula: 'An + Vowel Sound (/ɒ/) · A + Consonant Sound (/r/, /k/)',
          nepaliOrderFormula: 'एक/एउटा + विशेषण + नाम',
          structuralNoteNepali:
            '"Honest" को "H" मौन भएकाले "An honest" भयो, तर "receipt" (/r/) र "queue" (/kjuː/) व्यञ्जन ध्वनि भएकाले "a" लाग्यो।',
          tokens: [
            {
              role: 'Subject',
              englishText: 'An honest cashier',
              nepaliText: 'एक इमानदार क्यासियरले',
              nepaliRoleLabel: 'कर्ता (An + स्वर ध्वनि)',
            },
            {
              role: 'Verb',
              englishText: 'gave me',
              nepaliText: 'मलाई दिए',
              nepaliRoleLabel: 'क्रिया + अप्रत्यक्ष कर्म',
            },
            {
              role: 'Object',
              englishText: 'a receipt',
              nepaliText: 'एउटा रसिद',
              nepaliRoleLabel: 'प्रत्यक्ष कर्म',
            },
            {
              role: 'Modifier',
              englishText: 'in a queue',
              nepaliText: 'लाममा',
              nepaliRoleLabel: 'स्थान (Prepositional Phrase)',
            },
          ],
        },
      ],
      capstoneExercises: [
        {
          id: 'l2-cap-1',
          questionPrompt: 'Choose the correct articles: "It took ___ hour to reach the counter because of ___ long queue, but the clerk gave ___ honest answer."',
          nepaliContext: 'उच्चारणको पहिलो ध्वनि (स्वर कि व्यञ्जन?) विचार गर्नुहोस्:',
          options: ['an / a / an', 'a / a / a', 'an / an / a', 'a / a / an'],
          correctAnswer: 'an / a / an',
          explanationNepali:
            '"Hour" र "honest" मा H मौन भई स्वर ध्वनि आउने हुनाले "an" लाग्छ, तर "long queue" व्यञ्जन ध्वनिबाट सुरु हुने हुनाले "a" लाग्छ।',
        },
        {
          id: 'l2-cap-2',
          questionPrompt: 'Fill in the correct time prepositions: "The seminar starts ___ 9:00 AM ___ Wednesday ___ February."',
          nepaliContext: 'घडीको समय (at), बार (on), र महिना (in) को नियम लगाउनुहोस्:',
          options: ['at / on / in', 'on / in / at', 'in / on / at', 'at / in / on'],
          correctAnswer: 'at / on / in',
          explanationNepali:
            'घडीको समयमा "at 9:00 AM", बारमा "on Wednesday", र महिनामा "in February" प्रयोग हुन्छ।',
        },
        {
          id: 'l2-cap-3',
          questionPrompt: 'Which sentence has ZERO spelling or grammar errors?',
          nepaliContext: 'हिज्जे (receipt, Wednesday) र व्याकरण दुवै सही भएको वाक्य छान्नुहोस्:',
          options: [
            'I received the receipt on Wednesday.',
            'I recieved the reciept in Wednesday.',
            'I received the reciept on Wensday.',
            'I recieved the receipt at Wednesday.',
          ],
          correctAnswer: 'I received the receipt on Wednesday.',
          explanationNepali:
            'यसमा "received", "receipt", र "on Wednesday" तीनवटै पूर्ण रूपमा शुद्ध छन्।',
        },
      ],
    },
  },

  // ============================================================================
  // LECTURE 3 (B2 · Upper-Intermediate): Consonant Doubling & Present Perfect
  // ============================================================================
  {
    id: 'lecture-3-consonant-doubling',
    lectureNumber: 3,
    title: 'Stress-Based Consonant Doubling & Experience vs. Past',
    nepaliTitle: 'व्यञ्जन दोब्बर हुने नियम र पूर्ण वर्तमान (Present Perfect) बनाम सामान्य भूत',
    subtitle:
      'Discover silent "-mn" and "sc" words, learn why "occurred" doubles the R while "visited" does not, and master Present Perfect vs. Simple Past.',
    level: 'B2',
    category: 'Upper-Intermediate Accuracy',
    estimatedMinutes: 18,
    moduleA_vocabulary: [
      {
        id: 'l3-v1',
        word: 'Fascinate',
        ipa: '/ˈfæs.ɪ.neɪt/',
        partOfSpeech: 'Verb',
        segments: [
          { text: 'Fa', silent: false },
          { text: 's', silent: false },
          { text: 'c', silent: true },
          { text: 'inate', silent: false },
        ],
        silentLettersSummary: 'Silent "c" after "s" (/s/ sound only)',
        nepaliMeaning: 'मोहित पार्नु / अत्यन्त आकर्षित गर्नु',
        nepaliTransliteration: 'फ्यासिनेट',
        englishExample: 'Himalayan biodiversity continues to fascinate researchers worldwide.',
        nepaliExampleTranslation: 'हिमाली जैविक विविधताले विश्वभरका अनुसन्धानकर्ताहरूलाई मोहित पार्ने क्रम जारी छ।',
        usageTipNepali:
          '"Science", "Scene", "Muscle", र "Fascinate" मा "s" पछाडि आउने "c" छुट्टै बोलिँदैन; दुवै मिलेर एउटै "स" (/s/) को आवाज दिन्छन्।',
      },
      {
        id: 'l3-v2',
        word: 'Column',
        ipa: '/ˈkɒl.əm/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'Colum', silent: false },
          { text: 'n', silent: true },
        ],
        silentLettersSummary: 'Silent final "n" after "m"',
        nepaliMeaning: 'स्तम्भ / पत्रिकाको लेख वा तालिकाको ठाडो हरफ',
        nepaliTransliteration: 'कलम',
        englishExample: 'Please enter the total amount in the third column of the table.',
        nepaliExampleTranslation: 'कृपया तालिकाको तेस्रो स्तम्भमा कुल रकम प्रविष्ट गर्नुहोस्।',
        usageTipNepali:
          'शब्दको अन्त्यमा "-mn" आउँदा "n" मौन हुन्छ। यसलाई "कलम्न" होइन "कलम" (/ˈkɒl.əm/) भनिन्छ।',
      },
      {
        id: 'l3-v3',
        word: 'Autumn',
        ipa: '/ˈɔː.təm/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'Autum', silent: false },
          { text: 'n', silent: true },
        ],
        silentLettersSummary: 'Silent final "n" after "m"',
        nepaliMeaning: 'शरद ऋतु (दशैं–तिहारको मौसम)',
        nepaliTransliteration: 'अटम',
        englishExample: 'Clear blue skies make autumn the best season for trekking in Nepal.',
        nepaliExampleTranslation: 'सफा नीलो आकाशले शरद ऋतुलाई नेपालमा पदयात्राको लागि उत्कृष्ट मौसम बनाउँछ।',
        usageTipNepali:
          '"Autumn" मा अन्तिमको "n" बोलिँदैन ("अटम"), तर यसमा "-al" जोडेर विशेषण बनाउँदा "Autumnal" मा भने "n" उच्चारण हुन्छ!',
      },
      {
        id: 'l3-v4',
        word: 'Foreign',
        ipa: '/ˈfɒr.ən/',
        partOfSpeech: 'Adjective',
        segments: [
          { text: 'Forei', silent: false },
          { text: 'g', silent: true },
          { text: 'n', silent: false },
        ],
        silentLettersSummary: 'Silent "g" before final "n"',
        nepaliMeaning: 'विदेशी / बाह्य देशको',
        nepaliTransliteration: 'फरिन / फरेन',
        englishExample: 'Learning a foreign language opens doors to global careers.',
        nepaliExampleTranslation: 'विदेशी भाषा सिक्नाले विश्वव्यापी रोजगारीका ढोकाहरू खोल्छ।',
        usageTipNepali:
          '"Sign", "Design", "Campaign", र "Foreign" मा "n" भन्दा ठीक अगाडि आउने "g" सधैं मौन हुन्छ।',
      },
      {
        id: 'l3-v5',
        word: 'Guard',
        ipa: '/ɡɑːd/',
        partOfSpeech: 'Noun / Verb',
        segments: [
          { text: 'G', silent: false },
          { text: 'u', silent: true },
          { text: 'ard', silent: false },
        ],
        silentLettersSummary: 'Silent "u" after "g"',
        nepaliMeaning: 'रक्षक / सुरक्षा गर्नु',
        nepaliTransliteration: 'गार्ड',
        englishExample: 'The security guard checked every visitor badge at the gate.',
        nepaliExampleTranslation: 'सुरक्षा रक्षकले गेटमा हरेक आगन्तुकको पास जाँच गरे।',
        usageTipNepali:
          '"Guard", "Guess", "Guide", र "Guitar" मा "g" पछाडिको "u" कहिल्यै उच्चारण हुँदैन ("ग्वा-र्ड" होइन, सिधै "गार्ड")।',
      },
    ],
    moduleB_pronunciation: [
      {
        id: 'l3-p1',
        word: 'Fascinate',
        ipa: '/ˈfæs.ɪ.neɪt/',
        syllables: ['fas', 'i', 'nayt'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'FAS-i-nayt',
        nepaliPhoneticHint: 'फ्या-सि-नेट',
        ruleTitle: 'The Silent "SC" Digraph Rule',
        ruleExplanationNepali:
          'जब "sc" पछाडि "e" वा "i" आउँछ (science, scene, fascinate, discipline), "sc" ले केवल एउटै "स" (/s/) को आवाज निकाल्छ; "स्क" भनिँदैन।',
        commonMispronunciation: 'Fas-ki-nate (फास-कि-नेट)',
      },
      {
        id: 'l3-p2',
        word: 'Column',
        ipa: '/ˈkɒl.əm/',
        syllables: ['kol', 'uhm'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'KOL-uhm',
        nepaliPhoneticHint: 'क-लम',
        ruleTitle: 'Final "-MN" Cluster Reduction',
        ruleExplanationNepali:
          'अंग्रेजीमा शब्दको अन्त्यमा "m" र "n" एकैसाथ आउँदा (column, autumn, solemn, hymn) अन्तिमको "n" सधैं मौन रहन्छ।',
        commonMispronunciation: 'Kol-umn (कलम्न)',
      },
      {
        id: 'l3-p3',
        word: 'Autumn',
        ipa: '/ˈɔː.təm/',
        syllables: ['aw', 'tuhm'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'AW-tuhm',
        nepaliPhoneticHint: 'अ-टम',
        ruleTitle: 'Initial "AU-" Monophthong (/ɔː/)',
        ruleExplanationNepali:
          '"Au" अक्षरहरू सँगै आउँदा (autumn, August, author, cause) नेपाली "अउ" होइन, लामो "अ" (/ɔː/) को आवाज आउँछ।',
        commonMispronunciation: 'Aw-tumn / Au-tum (आउ-टम)',
      },
      {
        id: 'l3-p4',
        word: 'Foreign',
        ipa: '/ˈfɒr.ən/',
        syllables: ['for', 'in'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'FOR-in',
        nepaliPhoneticHint: 'फ-रिन',
        ruleTitle: 'Silent "G" in "-GN" Endings',
        ruleExplanationNepali:
          'शब्दको अन्त्यमा "-gn" हुँदा (foreign, sign, align, assign, reign) "g" नबोली सिधै "n" उच्चारण गरिन्छ।',
        commonMispronunciation: 'For-e-gun (फरेगन)',
      },
      {
        id: 'l3-p5',
        word: 'Guard',
        ipa: '/ɡɑːd/',
        syllables: ['gaard'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'Gaard',
        nepaliPhoneticHint: 'गार्ड',
        ruleTitle: 'Orthographic "GU-" Hard G Marker',
        ruleExplanationNepali:
          'यहाँ "u" को काम उच्चारण हुनु होइन, बरु "g" लाई "ज" हुनबाट रोकेर कडा "ग" (/ɡ/) बनाउनु मात्र हो (जस्तै guest, guide, guard)।',
        commonMispronunciation: 'Gward (ग्वार्ड)',
      },
    ],
    moduleC_spelling: {
      ruleTitle: 'The 1-1-1 & Multi-Syllable Stress Consonant Doubling Rule',
      nepaliRuleTitle: 'प्रत्यय (-ed, -ing) थप्दा अन्तिम व्यञ्जन दोब्बर हुने नियम',
      formula:
        'Ends in CVC (Consonant-Vowel-Consonant) + Stressed Final Syllable → Double Final Consonant (oc·CUR → occurred, be·GIN → beginning)',
      nepaliExplanation:
        'जब शब्दको अन्त्यमा "व्यञ्जन + १ स्वर + १ व्यञ्जन" (CVC) छ र त्यसमा स्वरबाट सुरु हुने प्रत्यय (-ed, -ing, -er) थपिन्छ:\n१. एक सिलेबलका शब्दमा सधैं अन्तिम अक्षर दोब्बर हुन्छ (stop → stopped, plan → planning)।\n२. दुई वा सोभन्दा बढी सिलेबलका शब्दमा यदि **अन्तिम सिलेबलमा जोड (stress)** पर्छ भने मात्र दोब्बर हुन्छ (be-GIN → beginning, oc-CUR → occurred, pre-FER → preferred)। तर यदि **पहिलो सिलेबलमा जोड** पर्छ भने दोब्बर हुँदैन (VIS-it → visited, HAP-pen → happened, OP-en → opening)!',
      examples: [
        {
          baseWord: 'occur',
          transformation: 'oc·CUR (stress on 2nd syllable) + -ed',
          correctSpelling: 'occurred',
          commonWrongSpelling: 'occured',
          nepaliMeaning: 'घट्यो / भइपरी आयो (दुईवटा c र दुईवटा r)',
        },
        {
          baseWord: 'begin',
          transformation: 'be·GIN (stress on 2nd syllable) + -ing',
          correctSpelling: 'beginning',
          commonWrongSpelling: 'begining',
          nepaliMeaning: 'सुरुवात (दुईवटा n)',
        },
        {
          baseWord: 'visit',
          transformation: 'VIS·it (stress on 1st syllable) + -ed',
          correctSpelling: 'visited',
          commonWrongSpelling: 'visitted',
          nepaliMeaning: 'भ्रमण गर्यो (अन्त्यमा जोड नपर्ने हुनाले एउटै t)',
        },
        {
          baseWord: 'happen',
          transformation: 'HAP·pen (stress on 1st syllable) + -ing',
          correctSpelling: 'happening',
          commonWrongSpelling: 'happenning',
          nepaliMeaning: 'भइरहेको (अन्तिमको n दोब्बर हुँदैन)',
        },
      ],
      exceptions: [
        'Never double final w, x, or y (snowed, fixed, stayed)',
        'Words with 2 vowels before the final consonant do NOT double (need → needed, wait → waiting)',
      ],
      quizzes: [
        {
          id: 'l3-q1',
          type: 'multiple-choice',
          promptEnglish: 'Which spelling is correct for the past tense of "occur"?',
          promptNepaliHint: '"Occur" मा दोस्रो सिलेबल (oc-CUR) मा जोड पर्छ—यसमा "-ed" जोड्दा के हुन्छ?',
          options: ['occurred', 'occured', 'ocurred', 'ocured'],
          correctAnswer: 'occurred',
          commonMistakeExplanationNepali:
            '"Occur" मा पहिले नै दुईवटा "c" हुन्छन् र अन्तिम सिलेबलमा जोड पर्ने हुनाले "r" पनि दोब्बर भई "occurred" बन्छ।',
        },
        {
          id: 'l3-q2',
          type: 'multiple-choice',
          promptEnglish: 'Choose the correct spelling when adding "-ing" to "begin":',
          promptNepaliHint: '"Begin" मा "-ing" थप्दा बन्ने सही हिज्जे छान्नुहोस्:',
          options: ['beginning', 'begining', 'beggining', 'begginning'],
          correctAnswer: 'beginning',
          commonMistakeExplanationNepali:
            '"be-GIN" मा दोस्रो भागमा जोड पर्छ र अन्त्यमा i-n (स्वर+व्यञ्जन) छ, त्यसैले "n" दोब्बर भएर "beginning" हुन्छ ("g" दोब्बर हुँदैन)।',
        },
        {
          id: 'l3-q3',
          type: 'fill-blank',
          promptEnglish: 'Many ______ (foreign) tourists ______ (visit + ed) Mustang last ______ (autumn).',
          promptNepaliHint: 'तीनवटै शब्दको शुद्ध हिज्जे भएको विकल्प छान्नुहोस्:',
          options: [
            'foreign / visited / autumn',
            'foriegn / visitted / autum',
            'foreign / visitted / autumn',
            'foriegn / visited / autumn',
          ],
          correctAnswer: 'foreign / visited / autumn',
          commonMistakeExplanationNepali:
            '"Foreign" मा e-i-g-n हुन्छ, "VIS-it" मा पहिलो सिलेबलमा जोड पर्ने हुनाले एउटै t ("visited") हुन्छ, र "autumn" को अन्त्यमा मौन n हुन्छ।',
        },
        {
          id: 'l3-q4',
          type: 'fill-blank',
          promptEnglish: 'The history of this temple ______ (fascinate) everyone who reads the ______ (column).',
          promptNepaliHint: 'मौन "c" र मौन "n" भएका शब्दहरूको सही जोडी छान्नुहोस्:',
          options: [
            'fascinates / column',
            'fasinates / colum',
            'fascinates / collumn',
            'facinates / column',
          ],
          correctAnswer: 'fascinates / column',
          commonMistakeExplanationNepali:
            '"Fascinates" मा s पछि c अनिवार्य छ र "column" मा m पछि मौन n आउँछ।',
        },
      ],
    },
    moduleD_grammar: {
      topicTitle: 'Present Perfect (Have/Has + V3) vs. Simple Past (V2)',
      nepaliTopicTitle: 'पूर्ण वर्तमान (गरेको छु) बनाम सामान्य भूत (गरें) को सही प्रयोग',
      explanationNepali:
        'नेपालीभाषीहरूले प्रायः "मैले काम सिध्याएको छु" र "मैले हिजो काम सिध्याएँ" दुवैमा एउटै टेन्स प्रयोग गर्ने गल्ती गर्छन्।\n१. **Present Perfect (have/has + V3)**: जब कामको समय तोकिएको छैन (जस्तै जीवनको अनुभव: "I have visited three foreign countries") वा कामको असर अहिले वर्तमानमा छ ("A problem has occurred")।\n२. **Simple Past (V2)**: जब काम बितेको निश्चित समयमा भयो र त्यो समय सकिइसक्यो—जस्तै `yesterday`, `last autumn`, `in 2023`, `two days ago` भनिएको छ भने **कहिल्यै पनि have/has प्रयोग नगर्नुहोस्!** सिधै V2 प्रयोग गर्नुहोस् ("I visited Pokhara last autumn")।',
      keyTakeawaysNepali: [
        'वाक्यमा "yesterday", "last autumn", "in 2022", "ago" जस्ता बितेको समय तोकिएको छ भने सधैं Simple Past (V2) मात्र लगाउनुहोस् (❌ I have visited yesterday → ✅ I visited yesterday)।',
        'समय नतोकी जीवनको अनुभव वा हालको परिणाम बताउँदा Present Perfect (have/has + V3) लगाउनुहोस्।',
      ],
      syntaxComparisons: [
        {
          id: 'l3-syn-1',
          contextLabel: 'Life Experience (Unspecified Time) → Present Perfect',
          englishFullSentence: 'She has studied two foreign languages.',
          nepaliFullSentence: 'उनले दुईवटा विदेशी भाषाहरू पढेकी छिन्।',
          englishOrderFormula: 'Subject + has/have + V3 (Past Participle) + Object',
          nepaliOrderFormula: 'कर्ता + कर्म + धातु-एकी छिन् (पूर्ण वर्तमान)',
          structuralNoteNepali:
            'यहाँ "कहिले पढिन्" भनिएको छैन, केवल उनको अनुभव (उनलाई अहिले ती भाषा आउँछ) बताइएकोले "has studied" प्रयोग भयो।',
          tokens: [
            {
              role: 'Subject',
              englishText: 'She',
              nepaliText: 'उनले',
              nepaliRoleLabel: 'कर्ता (Subject)',
            },
            {
              role: 'Verb',
              englishText: 'has studied',
              nepaliText: 'पढेकी छिन्',
              nepaliRoleLabel: 'पूर्ण वर्तमान क्रिया (has + V3)',
            },
            {
              role: 'Object',
              englishText: 'two foreign languages',
              nepaliText: 'दुईवटा विदेशी भाषाहरू',
              nepaliRoleLabel: 'कर्म (Object)',
            },
          ],
        },
        {
          id: 'l3-syn-2',
          contextLabel: 'Finished Past Time ("last autumn") → Simple Past (V2)',
          englishFullSentence: 'We visited Lumbini last autumn.',
          nepaliFullSentence: 'हामीले गत शरद ऋतुमा लुम्बिनी भ्रमण गर्यौं।',
          englishOrderFormula: 'Subject + V2 (Simple Past) + Object + Past Time Marker',
          nepaliOrderFormula: 'कर्ता + समय + कर्म + सामान्य भूत क्रिया',
          structuralNoteNepali:
            'वाक्यमा "last autumn" (गत शरद ऋतु - बितिसकेको समय) उल्लेख भएकोले यहाँ "have visited" भन्न मिल्दैन, केवल "visited" (V2) हुन्छ।',
          tokens: [
            {
              role: 'Subject',
              englishText: 'We',
              nepaliText: 'हामीले',
              nepaliRoleLabel: 'कर्ता (Subject)',
            },
            {
              role: 'Verb',
              englishText: 'visited',
              nepaliText: 'भ्रमण गर्यौं',
              nepaliRoleLabel: 'सामान्य भूत क्रिया (V2)',
            },
            {
              role: 'Object',
              englishText: 'Lumbini',
              nepaliText: 'लुम्बिनी',
              nepaliRoleLabel: 'कर्म (Object)',
            },
            {
              role: 'Modifier',
              englishText: 'last autumn',
              nepaliText: 'गत शरद ऋतुमा',
              nepaliRoleLabel: 'बितेको निश्चित समय',
            },
          ],
        },
      ],
      capstoneExercises: [
        {
          id: 'l3-cap-1',
          questionPrompt: 'Choose the grammatically correct verb form: "An unexpected error ______ during the server update yesterday."',
          nepaliContext: 'वाक्यको अन्त्यमा "yesterday" (बितेको समय) छ र हिज्जे नियम पनि ध्यान दिनुहोस्:',
          options: ['occurred', 'has occurred', 'occured', 'have occurred'],
          correctAnswer: 'occurred',
          explanationNepali:
            '"Yesterday" तोकिएको हुनाले Present Perfect (has occurred) मिल्दैन; Simple Past र सही दोब्बर r हिज्जे भएको "occurred" सही हो।',
        },
        {
          id: 'l3-cap-2',
          questionPrompt: 'Which sentence correctly expresses a life experience without a specific past date?',
          nepaliContext: '"मैले त्यो पत्रिकामा धेरै स्तम्भहरू लेखेको छु" (अनुभव):',
          options: [
            'I have written several columns for that magazine.',
            'I wrote several columns for that magazine since 2024.',
            'I have wrote several columns for that magazine.',
            'I am writing several columns for that magazine yesterday.',
          ],
          correctAnswer: 'I have written several columns for that magazine.',
          explanationNepali:
            'समय नतोकिएको अनुभव बताउँदा "have + V3 (written)" प्रयोग गरिन्छ।',
        },
        {
          id: 'l3-cap-3',
          questionPrompt: 'Complete the sentence: "Ancient temples have always ______ visitors from ______ countries."',
          nepaliContext: '"have + V3" र शुद्ध हिज्जे छान्नुहोस्:',
          options: [
            'fascinated / foreign',
            'fascinate / foreign',
            'fasinated / foriegn',
            'fascinated / foriegn',
          ],
          correctAnswer: 'fascinated / foreign',
          explanationNepali:
            '"Have + always" पछि V3 ("fascinated") लाग्छ र विदेशीको सही हिज्जे "foreign" हो।',
        },
      ],
    },
  },

  // ============================================================================
  // LECTURE 4 (B2 · Workplace & Travel): Loanwords, Double Letters & Polite Modals
  // ============================================================================
  {
    id: 'lecture-4-loanwords-politeness',
    lectureNumber: 4,
    title: 'Tricky Loanwords, Double-Consonant Spelling & Polite Modals',
    nepaliTitle: 'आगन्तुक शब्दको उच्चारण, दोब्बर अक्षरको हिज्जे र शिष्ट अंग्रेजी (Polite Modals)',
    subtitle:
      'Learn why "Colonel" sounds like "Kernel", conquer double-letter traps like "accommodate" and "necessary", and form polite indirect workplace requests.',
    level: 'B2',
    category: 'Workplace & Travel Fluency',
    estimatedMinutes: 18,
    moduleA_vocabulary: [
      {
        id: 'l4-v1',
        word: 'Colonel',
        ipa: '/ˈkɜː.nəl/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'Col', silent: false },
          { text: 'o', silent: true },
          { text: 'nel', silent: false },
        ],
        silentLettersSummary: 'Spelled with "l-o", but pronounced "Ker-nel" (/ˈkɜː.nəl/) with an R sound!',
        nepaliMeaning: 'कर्नल (सेनाको उच्च अधिकृत पद)',
        nepaliTransliteration: 'कर्नल',
        englishExample: 'The retired colonel shared stories of peacekeeping missions.',
        nepaliExampleTranslation: 'अवकाशप्राप्त कर्नलले शान्ति स्थापना मिसनका कथाहरू सुनाए।',
        usageTipNepali:
          'अंग्रेजीको सबैभन्दा अनौठो शब्दमध्ये एक! हिज्जेमा कतै पनि "r" छैन, तर पुरानो फ्रान्सेली उच्चारणका कारण यसलाई "कोलोनेल" होइन, ठ्याक्कै "कर्नल" (/ˈkɜː.nəl/) भनिन्छ।',
      },
      {
        id: 'l4-v2',
        word: 'Mortgage',
        ipa: '/ˈmɔː.ɡɪdʒ/',
        partOfSpeech: 'Noun / Verb',
        segments: [
          { text: 'Mor', silent: false },
          { text: 't', silent: true },
          { text: 'gage', silent: false },
        ],
        silentLettersSummary: 'Silent "t" in the middle',
        nepaliMeaning: 'धितो / घरजग्गा बन्धकी कर्जा',
        nepaliTransliteration: 'मर्गिज',
        englishExample: 'They applied for a bank mortgage to purchase their first home.',
        nepaliExampleTranslation: 'तिनीहरूले आफ्नो पहिलो घर किन्न बैंक धितो कर्जाको लागि आवेदन दिए।',
        usageTipNepali:
          'बीचको "t" पूर्ण रूपमा मौन हुन्छ र अन्तिमको "-age" लाई "एज" नभई छोटो "इज" (/ɡɪdʒ/) भनिन्छ: "मर्-गिज"।',
      },
      {
        id: 'l4-v3',
        word: 'Psychology',
        ipa: '/saɪˈkɒl.ə.dʒi/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'P', silent: true },
          { text: 'sychology', silent: false },
        ],
        silentLettersSummary: 'Silent initial "p" before "s"; "ch" sounds like /k/',
        nepaliMeaning: 'मनोविज्ञान',
        nepaliTransliteration: 'साइकोलोजी',
        englishExample: 'Understanding consumer psychology helps businesses design better products.',
        nepaliExampleTranslation: 'उपभोक्ता मनोविज्ञान बुझ्नाले व्यवसायहरूलाई अझ राम्रा उत्पादनहरू बनाउन मद्दत गर्छ।',
        usageTipNepali:
          'ग्रीक मूलका "ps-" बाट सुरु हुने शब्दमा "p" मौन हुन्छ र बीचको "ch" ले "च" होइन "क" (/k/) को आवाज दिन्छ।',
      },
      {
        id: 'l4-v4',
        word: 'Island',
        ipa: '/ˈaɪ.lənd/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'I', silent: false },
          { text: 's', silent: true },
          { text: 'land', silent: false },
        ],
        silentLettersSummary: 'Silent "s" after "i"',
        nepaliMeaning: 'टापु / चारैतिर पानीले घेरिएको जमिन',
        nepaliTransliteration: 'आइल्यान्ड',
        englishExample: 'The ferry departs for the small island every morning at eight.',
        nepaliExampleTranslation: 'फेरी हरेक बिहान आठ बजे सानो टापुको लागि प्रस्थान गर्छ।',
        usageTipNepali:
          '"Island" र "Aisle" (सिटहरू बीचको बाटो) दुवैमा "s" कहिल्यै बोलिँदैन। यसलाई "इस-ल्यान्ड" होइन "आइ-ल्यान्ड" (/ˈaɪ.lənd/) भन्नुहोस्।',
      },
      {
        id: 'l4-v5',
        word: 'Accommodate',
        ipa: '/əˈkɒm.ə.deɪt/',
        partOfSpeech: 'Verb',
        segments: [
          { text: 'Acco', silent: false },
          { text: 'mm', silent: false },
          { text: 'odate', silent: false },
        ],
        silentLettersSummary: 'Double "cc" AND double "mm" (pronounced as single /k/ and /m/ sounds)',
        nepaliMeaning: 'बसोबासको व्यवस्था मिलाउनु / अटाउनु',
        nepaliTransliteration: 'अकमडेट',
        englishExample: 'This conference hall in Kathmandu can accommodate five hundred guests.',
        nepaliExampleTranslation: 'काठमाडौंको यो सम्मेलन हलमा पाँच सय पाहुनाहरू अटाउन सक्छन्।',
        usageTipNepali:
          'उच्चारण गर्दा एउटै "क" र "म" जस्तो सुनिए पनि लेख्दा दुईवटा "c" (cc) र दुईवटा "m" (mm) दुवै अनिवार्य चाहिन्छ!',
      },
    ],
    moduleB_pronunciation: [
      {
        id: 'l4-p1',
        word: 'Colonel',
        ipa: '/ˈkɜː.nəl/',
        syllables: ['ker', 'nuhl'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'KER-nuhl',
        nepaliPhoneticHint: 'कर्-नल (२ सिलेबल)',
        ruleTitle: 'Historical French-Italian Respelling Mismatch',
        ruleExplanationNepali:
          '१६औं शताब्दीमा फ्रान्सेली शब्द "coronel" (कर्नल) को उच्चारण लिइयो तर इटालियन हिज्जे "colonnello" बाट "l" राखियो। परिणामस्वरूप लेखाइ "colonel" र बोलाइ "कर्नल" रहन गयो।',
        commonMispronunciation: 'Ko-lo-nel (कोलोनेल)',
      },
      {
        id: 'l4-p2',
        word: 'Mortgage',
        ipa: '/ˈmɔː.ɡɪdʒ/',
        syllables: ['mor', 'gij'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'MOR-gij',
        nepaliPhoneticHint: 'मर्-गिज',
        ruleTitle: 'Silent French "T" + Unstressed "-AGE" (/ɪdʒ/)',
        ruleExplanationNepali:
          'मध्यकालीन फ्रान्सेलीमा "mort" (मृत) + "gage" (प्रतिज्ञा) जोडिँदा "t" लोप भयो। साथै अंग्रेजीमा बहु-सिलेबल शब्दको अन्त्यमा आउने "-age" (village, luggage, package, mortgage) लाई "एज" होइन "इज" (/ɪdʒ/) भनिन्छ।',
        commonMispronunciation: 'Mort-gayj (मोर्ट-गेज)',
      },
      {
        id: 'l4-p3',
        word: 'Psychology',
        ipa: '/saɪˈkɒl.ə.dʒi/',
        syllables: ['sai', 'kol', 'uh', 'jee'],
        stressedSyllableIndex: 1,
        simplifiedPhonetic: 'sai-KOL-uh-jee',
        nepaliPhoneticHint: 'साइ-क-ल-जी (दोस्रो भागमा जोड)',
        ruleTitle: 'Greek "PS-" & "CH-" (/k/) Roots',
        ruleExplanationNepali:
          'ग्रीक मूलका वैज्ञानिक शब्दहरूमा सुरुको "ps-" सधैं "स" (/s/) हुन्छ र बीचको "ch" (psychology, chemistry, architect, stomach) सधैं "क" (/k/) उच्चारण गरिन्छ।',
        commonMispronunciation: 'Puh-sai-cho-lo-gy',
      },
      {
        id: 'l4-p4',
        word: 'Island',
        ipa: '/ˈaɪ.lənd/',
        syllables: ['ai', 'luhnd'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'AI-luhnd',
        nepaliPhoneticHint: 'आइ-लन्ड',
        ruleTitle: 'Silent "S" in Island & Aisle',
        ruleExplanationNepali:
          'पहिलो सिलेबल "आइ" (/aɪ/) उच्चारण गरेपछि सिधै "लन्ड" (/lənd/) भन्नुहोस्। बीचको "s" लाई पूर्ण रूपमा बेवास्ता गर्नुहोस्।',
        commonMispronunciation: 'Iz-land / Is-land (इज-ल्यान्ड)',
      },
      {
        id: 'l4-p5',
        word: 'Accommodate',
        ipa: '/əˈkɒm.ə.deɪt/',
        syllables: ['uh', 'kom', 'uh', 'dayt'],
        stressedSyllableIndex: 1,
        simplifiedPhonetic: 'uh-KOM-uh-dayt',
        nepaliPhoneticHint: 'अ-क-म-डेट',
        ruleTitle: 'Initial Schwa /ə/ + Second-Syllable Stress',
        ruleExplanationNepali:
          'सुरुको "A" लाई "ए" वा "आ" नभनी हल्का "अ" (/ə/) भन्नुहोस् र दोस्रो सिलेबल "KOM" मा मुख्य जोड दिनुहोस्।',
        commonMispronunciation: 'Aa-ko-mo-date',
      },
    ],
    moduleC_spelling: {
      ruleTitle: 'High-Frequency Double-Consonant Combinations (CC, MM, SS, RR)',
      nepaliRuleTitle: 'धेरै झुक्किने दोब्बर व्यञ्जन (Double Consonants) का हिज्जे सूत्रहरू',
      formula:
        'Accommodate (2 C, 2 M) · Recommend (1 C, 2 M) · Necessary (1 C, 2 S) · Embarrass (2 R, 2 S)',
      nepaliExplanation:
        'अंग्रेजीका व्यावसायिक इमेल र परीक्षाहरूमा सबैभन्दा बढी गल्ती हुने शब्दहरू यिनै हुन्। यिनलाई सम्झने सजिला नेपाली स्मरण-सूत्रहरू (Memory Tricks):\n• **Accommodate**: होटलमा सबै अटाउन **२ वटा C (दिवांग)** र **२ वटा M (म्याट्रेस)** चाहिन्छ (a-cc-o-mm-odate)।\n• **Necessary**: एउटा सर्टमा **१ वटा मात्र कलर (Collar = १ C)** र **२ वटा बाहुला (Sleeves = २ S)** हुन्छन् (ne-c-e-ss-ary)!\n• **Recommend**: `Re + commend` = १ वटा C र २ वटा M (re-c-o-mm-end)।',
      examples: [
        {
          baseWord: 'accommodate',
          transformation: 'Prefix ad- + com- → double C & double M',
          correctSpelling: 'accommodate',
          commonWrongSpelling: 'accomodate / acommodate',
          nepaliMeaning: 'व्यवस्था मिलाउनु / अटाउनु (cc + mm)',
        },
        {
          baseWord: 'necessary',
          transformation: '1 Collar (c), 2 Sleeves (ss)',
          correctSpelling: 'necessary',
          commonWrongSpelling: 'neccessary / necesary',
          nepaliMeaning: 'आवश्यक (एउटै c र दुईवटा s)',
        },
        {
          baseWord: 'recommend',
          transformation: 're- + commend (1 c, 2 m)',
          correctSpelling: 'recommend',
          commonWrongSpelling: 'reccommend / recomend',
          nepaliMeaning: 'सिफारिस गर्नु (एउटै c र दुईवटा m)',
        },
        {
          baseWord: 'embarrass',
          transformation: 'Double R + Double S',
          correctSpelling: 'embarrass',
          commonWrongSpelling: 'embarass / embarras',
          nepaliMeaning: 'लज्जित बनाउनु (rr + ss)',
        },
      ],
      exceptions: [
        'committee (२ m, २ t, २ e — तीनवटा जोडी अक्षर!)',
        'tomorrow (१ m, २ r — to-m-o-rr-ow)',
        'occurrence (२ c, २ r — oc-cu-rr-ence)',
      ],
      quizzes: [
        {
          id: 'l4-q1',
          type: 'multiple-choice',
          promptEnglish: 'Remember the "1 Collar, 2 Sleeves" rule! Which spelling is correct?',
          promptNepaliHint: '"आवश्यक" अर्थ दिने शब्दको शुद्ध हिज्जे कुन हो? (१ कलर C, २ बाहुला SS):',
          options: ['necessary', 'neccessary', 'necesary', 'neccesary'],
          correctAnswer: 'necessary',
          commonMistakeExplanationNepali:
            'सर्टको १ कलर (१ वटा c) र २ बाहुला (२ वटा s) को सूत्र अनुसार "ne-c-e-ss-ary" मात्र सही हो।',
        },
        {
          id: 'l4-q2',
          type: 'multiple-choice',
          promptEnglish: 'Which word correctly spells "to provide lodging or space for"?',
          promptNepaliHint: 'दुईवटा C र दुईवटा M लाग्ने सही शब्द छान्नुहोस्:',
          options: ['accommodate', 'accomodate', 'acommodate', 'acomodate'],
          correctAnswer: 'accommodate',
          commonMistakeExplanationNepali:
            '"Accommodate" मा दुईवटा c (cc) र दुईवटा m (mm) दुवै चाहिन्छ।',
        },
        {
          id: 'l4-q3',
          type: 'fill-blank',
          promptEnglish: 'Could you ______ (recommend) a book on workplace ______ (psychology)?',
          promptNepaliHint: '"सिफारिस गर्नु" र "मनोविज्ञान" को सही हिज्जे छान्नुहोस्:',
          options: [
            'recommend / psychology',
            'reccommend / psychology',
            'recomend / sycology',
            'recommend / physcology',
          ],
          correctAnswer: 'recommend / psychology',
          commonMistakeExplanationNepali:
            '"Recommend" मा १ c र २ m हुन्छ भने "psychology" मा सुरुमा मौन p-s-y-c-h-o-l-o-g-y लेखिन्छ।',
        },
        {
          id: 'l4-q4',
          type: 'fill-blank',
          promptEnglish: 'The retired ______ (colonel) paid off the ______ (mortgage) on his ______ (island) cottage.',
          promptNepaliHint: 'तीनवटै आगन्तुक शब्दहरूको शुद्ध हिज्जे छान्नुहोस्:',
          options: [
            'colonel / mortgage / island',
            'kernal / morgage / iland',
            'colonel / morgage / island',
            'colonal / mortgage / iland',
          ],
          correctAnswer: 'colonel / mortgage / island',
          commonMistakeExplanationNepali:
            '"Colonel" मा l-o हुन्छ, "mortgage" मा मौन t हुन्छ, र "island" मा मौन s हुन्छ।',
        },
      ],
    },
    moduleD_grammar: {
      topicTitle: 'Polite Indirect Questions & Modal Verbs vs. Nepali Honorifics',
      nepaliTopicTitle: 'शिष्ट अप्रत्यक्ष प्रश्न (Indirect Questions) र नेपाली आदरार्थी क्रियाको तुलना',
      explanationNepali:
        'नेपालीमा शिष्टता देखाउन हामी क्रियाको रूप बदल्छौं ("कहाँ छ?" → "कहाँ होला? / भनिदिनुहुन्छ कि?")। तर अंग्रेजीमा क्रियाको आदरार्थी रूप हुँदैन! त्यसैले कार्यस्थल वा अपरिचित व्यक्तिसँग शिष्ट (polite) बोल्न **"Could you tell me..."** वा **"Would you mind..."** जस्ता Indirect Question प्रयोग गरिन्छ।\n**सबैभन्दा महत्त्वपूर्ण नियम**: जब प्रश्नको अगाडि "Could you tell me..." थपिन्छ, पछाडिको भाग प्रश्न रहेन—त्यसैले `where is the bank?` उल्टिएर सामान्य कथन जस्तै **`where the bank is`** (Subject + Verb) बन्छ! बीचमा `does/did` राखिँदैन।',
      keyTakeawaysNepali: [
        'Direct Question: "Where IS the island?" (Verb अगाडि)',
        'Polite Indirect Question: "Could you tell me where the island IS?" (Subject अगाडि, Verb अन्त्यमा!)',
        '"Would you mind + V-ing...?" पछाडि सधैं क्रियाको -ing रूप आउँछ (Would you mind recommending a hotel?)।',
      ],
      syntaxComparisons: [
        {
          id: 'l4-syn-1',
          contextLabel: 'Polite Workplace Inquiry (Embedded Clause Word Order)',
          englishFullSentence: 'Could you tell me where the colonel lives?',
          nepaliFullSentence: 'कर्नल कहाँ बस्नुहुन्छ मलाई भनिदिनुहुन्छ कि?',
          englishOrderFormula: 'Polite Frame (Could you tell me) + Question Word + Subject + Verb',
          nepaliOrderFormula: 'कर्ता + प्रश्नवाचक + आदरार्थी क्रिया + विनम्र अनुरोध',
          structuralNoteNepali:
            'ध्यान दिनुहोस्: यहाँ "where does the colonel live?" भन्न मिल्दैन! "Could you tell me" पछाडि "where the colonel lives" (Subject + Verb) नै हुनुपर्छ।',
          tokens: [
            {
              role: 'Connector',
              englishText: 'Could you tell me',
              nepaliText: 'मलाई भनिदिनुहुन्छ कि',
              nepaliRoleLabel: 'विनम्र अनुरोध वाक्यांश',
            },
            {
              role: 'Modifier',
              englishText: 'where',
              nepaliText: 'कहाँ',
              nepaliRoleLabel: 'प्रश्नवाचक शब्द',
            },
            {
              role: 'Subject',
              englishText: 'the colonel',
              nepaliText: 'कर्नल',
              nepaliRoleLabel: 'कर्ता (Subject)',
            },
            {
              role: 'Verb',
              englishText: 'lives?',
              nepaliText: 'बस्नुहुन्छ?',
              nepaliRoleLabel: 'क्रिया (अन्त्यमा)',
            },
          ],
        },
        {
          id: 'l4-syn-2',
          contextLabel: 'Polite Request with "Would you mind + V-ing"',
          englishFullSentence: 'Would you mind explaining the mortgage terms?',
          nepaliFullSentence: 'धितो कर्जाका सर्तहरू बुझाइदिनुहुन्छ कि?',
          englishOrderFormula: 'Would you mind + Gerund (V-ing) + Object?',
          nepaliOrderFormula: 'कर्म + धातु-इदिनुहुन्छ कि?',
          structuralNoteNepali:
            '"Would you mind" पछाडि "explain" वा "to explain" होइन, सधैं "-ing" रूप ("explaining") प्रयोग गरिन्छ।',
          tokens: [
            {
              role: 'Connector',
              englishText: 'Would you mind',
              nepaliText: 'कृपया मान्नुहुन्न भने',
              nepaliRoleLabel: 'शिष्ट मोडाल वाक्यांश',
            },
            {
              role: 'Verb',
              englishText: 'explaining',
              nepaliText: 'बुझाइदिनुहुन्छ कि',
              nepaliRoleLabel: 'V-ing (Gerund)',
            },
            {
              role: 'Object',
              englishText: 'the mortgage terms?',
              nepaliText: 'धितो कर्जाका सर्तहरू?',
              nepaliRoleLabel: 'कर्म (Object)',
            },
          ],
        },
      ],
      capstoneExercises: [
        {
          id: 'l4-cap-1',
          questionPrompt: 'Convert the direct question "How much does this mortgage cost?" into a polite indirect question:',
          nepaliContext: '"Could you tell me..." पछाडि does हटेर Subject + Verb आउने नियम प्रयोग गर्नुहोस्:',
          options: [
            'Could you tell me how much this mortgage costs?',
            'Could you tell me how much does this mortgage cost?',
            'Could you tell me how much costs this mortgage?',
            'Could you tell me how much this mortgage cost?',
          ],
          correctAnswer: 'Could you tell me how much this mortgage costs?',
          explanationNepali:
            'अप्रत्यक्ष प्रश्नमा "does" हट्छ र एकवचन कर्ता "this mortgage" पछि क्रियामा -s थपिएर "costs" अन्त्यमा आउँछ।',
        },
        {
          id: 'l4-cap-2',
          questionPrompt: 'Choose the polite and grammatically correct workplace request:',
          nepaliContext: '"Would you mind" पछाडि लाग्ने क्रियाको रूप र "accommodate" को हिज्जे हेर्नुहोस्:',
          options: [
            'Would you mind accommodating two more guests?',
            'Would you mind to accommodate two more guests?',
            'Would you mind accomodating two more guests?',
            'Could you mind accommodate two more guests?',
          ],
          correctAnswer: 'Would you mind accommodating two more guests?',
          explanationNepali:
            '"Would you mind" पछि सधैं V-ing ("accommodating" - २ c, २ m र अन्तिम e हटाएर ing) आउँछ।',
        },
        {
          id: 'l4-cap-3',
          questionPrompt: 'Complete the sentence: "Do you know whether it is ______ to book the ______ ferry in advance?"',
          nepaliContext: '"१ कलर, २ बाहुला" हिज्जे र मौन "s" भएको शब्द छान्नुहोस्:',
          options: [
            'necessary / island',
            'neccessary / island',
            'necessary / iland',
            'necesary / island',
          ],
          correctAnswer: 'necessary / island',
          explanationNepali:
            '"Necessary" (१ c, २ s) र "island" (मौन s) दुवै शुद्ध छन्।',
        },
      ],
    },
  },

  // ============================================================================
  // LECTURE 5 (B2/C1 · Academic & Professional): Schwa Reduction & Relative Clauses
  // ============================================================================
  {
    id: 'lecture-5-schwa-relative-clauses',
    lectureNumber: 5,
    title: 'Schwa Syllable Reduction, Suffix Traps & Relative Clauses',
    nepaliTitle: 'अंग्रेजी लय (Schwa Reduction), प्रत्यय नियम र विशेषण उपवाक्य (Relative Clauses)',
    subtitle:
      'Speak with natural rhythm on words like "Comfortable" and "Handkerchief", master -able/-ible & -ance/-ence suffixes, and build post-nominal relative clauses.',
    level: 'B2',
    category: 'Academic & Professional Fluency',
    estimatedMinutes: 20,
    moduleA_vocabulary: [
      {
        id: 'l5-v1',
        word: 'Comfortable',
        ipa: '/ˈkʌmf.tə.bəl/',
        partOfSpeech: 'Adjective',
        segments: [
          { text: 'Comf', silent: false },
          { text: 'or', silent: true },
          { text: 'table', silent: false },
        ],
        silentLettersSummary: 'Middle "or" is compressed in natural speech (3 syllables: KUMF-tuh-bul)',
        nepaliMeaning: 'आरामदायी / सहज',
        nepaliTransliteration: 'कम्फ-टबल',
        englishExample: 'Make sure you wear comfortable hiking boots on the Annapurna trail.',
        nepaliExampleTranslation: 'अन्नपूर्ण पदमार्गमा जाँदा आरामदायी ट्रेकिङ बुट लगाउन सुनिश्चित गर्नुहोस्।',
        usageTipNepali:
          'यसमा ४ वटा सिलेबल (Com-for-ta-ble) जस्तो देखिए पनि प्राकृतिक अंग्रेजीमा बीचको "or" दबिएर ३ सिलेबलमा "कम्फ-टबल" (/ˈkʌmf.tə.bəl/) मात्र बोलिन्छ र अन्त्यमा "टेबल" होइन "टबल" भनिन्छ!',
      },
      {
        id: 'l5-v2',
        word: 'Environment',
        ipa: '/ɪnˈvaɪ.rən.mənt/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'Enviro', silent: false },
          { text: 'n', silent: false },
          { text: 'ment', silent: false },
        ],
        silentLettersSummary: 'Critical "n" before "-ment" (often slurred in fast speech, mandatory in spelling)',
        nepaliMeaning: 'वातावरण / परिवेश',
        nepaliTransliteration: 'इन्भाइरन्मेन्ट',
        englishExample: 'Protecting the mountain environment requires community cooperation.',
        nepaliExampleTranslation: 'पहाडी वातावरणको संरक्षण गर्न सामुदायिक सहकार्य आवश्यक छ।',
        usageTipNepali:
          'छिटो बोल्दा मान्छेहरूले "o" पछिको "n" निलिदिन्छन् र परीक्षामा "enviroment" लेखेर नम्बर गुमाउँछन्। मूल शब्द "environ + ment" सम्झनुहोस्!',
      },
      {
        id: 'l5-v3',
        word: 'Government',
        ipa: '/ˈɡʌv.ən.mənt/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'Gover', silent: false },
          { text: 'n', silent: true },
          { text: 'ment', silent: false },
        ],
        silentLettersSummary: 'First "n" before "-ment" is often silent in fast speech, but required in writing',
        nepaliMeaning: 'सरकार / शासन प्रणाली',
        nepaliTransliteration: 'गभर्नमेन्ट',
        englishExample: 'The local government launched a new digital literacy program.',
        nepaliExampleTranslation: 'स्थानीय सरकारले नयाँ डिजिटल साक्षरता कार्यक्रम सुरु गर्यो।',
        usageTipNepali:
          'यसको मूल क्रिया "govern" (शासन गर्नु) हो। त्यसमा "-ment" थपिँदा "govern + ment = government" बन्छ—बीचको "n" कहिल्यै नछुटाउनुहोस्!',
      },
      {
        id: 'l5-v4',
        word: 'Knowledge',
        ipa: '/ˈnɒl.ɪdʒ/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'K', silent: true },
          { text: 'nowle', silent: false },
          { text: 'd', silent: true },
          { text: 'ge', silent: false },
        ],
        silentLettersSummary: 'Silent initial "k" and silent "d" before "g"; short /ɒ/ vowel',
        nepaliMeaning: 'ज्ञान / जानकारी',
        nepaliTransliteration: 'नलिज',
        englishExample: 'Practical knowledge is just as valuable as academic degrees.',
        nepaliExampleTranslation: 'व्यावहारिक ज्ञान शैक्षिक डिग्री जत्तिकै मूल्यवान् हुन्छ।',
        usageTipNepali:
          '"Know" मा लामो "नो" (/nəʊ/) आवाज भए पनि "Knowledge" मा स्वर छोटिएर "न-लिज" (/ˈnɒl.ɪdʒ/) हुन्छ ("नाउ-लेज" वा "नो-लेज" होइन)।',
      },
      {
        id: 'l5-v5',
        word: 'Handkerchief',
        ipa: '/ˈhæŋ.kə.tʃɪf/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'Han', silent: false },
          { text: 'd', silent: true },
          { text: 'kerchief', silent: false },
        ],
        silentLettersSummary: 'Silent "d" after "n" (pronounced /ˈhæŋ.kə.tʃɪf/)',
        nepaliMeaning: 'रुमाल',
        nepaliTransliteration: 'ह्याङ-कर-चिफ',
        englishExample: 'He carried a clean cotton handkerchief in his coat pocket.',
        nepaliExampleTranslation: 'उनले आफ्नो कोटको खल्तीमा सफा सुतीको रुमाल बोकेका थिए।',
        usageTipNepali:
          'लेख्दा "hand + kerchief" लेखिए पनि बोल्दा बीचको "d" हराउँछ र "n" ले "k" सँग मिलेर "ङ" (/ŋ/) को आवाज निकाल्छ: "ह्याङ-कर-चिफ"।',
      },
    ],
    moduleB_pronunciation: [
      {
        id: 'l5-p1',
        word: 'Comfortable',
        ipa: '/ˈkʌmf.tə.bəl/',
        syllables: ['kumf', 'tuh', 'buhl'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'KUMF-tuh-buhl',
        nepaliPhoneticHint: 'कम्फ-ट-बल (३ सिलेबल)',
        ruleTitle: 'The Schwa (/ə/) & "-ABLE" Suffix Reduction',
        ruleExplanationNepali:
          'नेपाली भाषामा हरेक अक्षर बराबर समय दिएर बोलिन्छ, तर अंग्रेजीमा जोड नपर्ने सिलेबलहरूलाई खुम्च्याएर छोटो "अ" (/ə/ - Schwa) बनाइन्छ। त्यसैले "-table" वा "-able" प्रत्ययलाई सधैं "टबल / अबल" भनिन्छ, "टेबल" होइन (comfortable, vegetable, capable)।',
        commonMispronunciation: 'Kom-for-tay-bul (कम-फर-टे-बल)',
      },
      {
        id: 'l5-p2',
        word: 'Environment',
        ipa: '/ɪnˈvaɪ.rən.mənt/',
        syllables: ['in', 'vai', 'ruhn', 'muhnt'],
        stressedSyllableIndex: 1,
        simplifiedPhonetic: 'in-VAI-ruhn-muhnt',
        nepaliPhoneticHint: 'इन-भाइ-रन-मन्ट',
        ruleTitle: 'Second-Syllable Diphthong /aɪ/ + Unstressed "-MENT"',
        ruleExplanationNepali:
          'दोस्रो सिलेबल "VAI" (/vaɪ/) मा स्पष्ट जोड दिनुहोस् र अन्तिमको "-ment" लाई "मेन्ट" नभई हल्का "मन्ट" (/mənt/) उच्चारण गर्नुहोस्।',
        commonMispronunciation: 'En-vi-ro-ment',
      },
      {
        id: 'l5-p3',
        word: 'Government',
        ipa: '/ˈɡʌv.ən.mənt/',
        syllables: ['guv', 'uhn', 'muhnt'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'GUV-uhn-muhnt',
        nepaliPhoneticHint: 'ग-भन-मन्ट',
        ruleTitle: 'Consonant Cluster Assimilation (-RNM-)',
        ruleExplanationNepali:
          'पहिलो सिलेबल "GUV" मा जोड पर्छ र पछाडिका दुई सिलेबल छोटो श्वा (/ə/) ध्वनिमा छिटो बोलिन्छन्।',
        commonMispronunciation: 'Go-vern-ment (गो-भर्न-मेन्ट)',
      },
      {
        id: 'l5-p4',
        word: 'Knowledge',
        ipa: '/ˈnɒl.ɪdʒ/',
        syllables: ['nol', 'ij'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'NOL-ij',
        nepaliPhoneticHint: 'न-लिज',
        ruleTitle: 'Vowel Shortening in Derived Nouns + Silent "-D-"',
        ruleExplanationNepali:
          'मूल शब्द "know" (/nəʊ/) मा "-ledge" थपिँदा स्वर छोटिएर "/ɒ/" (न) बन्छ, र "dge" ले केवल "ज" (/dʒ/) को आवाज दिन्छ (bridge, judge, edge, knowledge)।',
        commonMispronunciation: 'Now-lej / No-lej (नाउलेज / नोलेज)',
      },
      {
        id: 'l5-p5',
        word: 'Handkerchief',
        ipa: '/ˈhæŋ.kə.tʃɪf/',
        syllables: ['hang', 'kuh', 'chif'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'HANG-kuh-chif',
        nepaliPhoneticHint: 'ह्याङ-क-चिफ',
        ruleTitle: 'Elision of "D" & Velar Nasal Assimilation (/ŋk/)',
        ruleExplanationNepali:
          '"n" र "k" को बीचमा रहेको "d" लोप हुन्छ र "k" को प्रभावले "n" को आवाज नाकबाट निस्कने "ङ" (/ŋ/) मा बदलिन्छ (जस्तै handsome मा पनि d मौन हुन्छ)।',
        commonMispronunciation: 'Hand-ker-cheef (ह्यान्ड-कर-चिफ)',
      },
    ],
    moduleC_spelling: {
      ruleTitle: 'Root Preservation (-ment) & "-ABLE / -IBLE" vs. "-ANCE / -ENCE"',
      nepaliRuleTitle: 'मूल शब्द जोगाउने नियम (-ment) र -able/-ible तथा -ance/-ence छान्ने तरिका',
      formula:
        'Complete English Root Word → "-able" (comfort → comfortable, depend → dependable) · Bound Latin Root → "-ible" (visible, audible) · Keep "n" in environ+ment & govern+ment',
      nepaliExplanation:
        '१. **-ment नियम**: प्रत्यय `-ment` थप्दा मूल शब्दको कुनै पनि अक्षर हट्दैन: `environ + ment = environment`, `govern + ment = government`।\n२. **-able बनाम -ible**: यदि प्रत्यय हटाउँदा बाँकी रहने भाग आफैंमा पूर्ण अंग्रेजी शब्द हो भने प्रायः सधैं **-able** लाग्छ (`comfort` → `comfortable`, `reason` → `reasonable`, `believe` → `believable`)। यदि अगाडिको भाग एक्लै प्रयोग हुँदैन भने **-ible** लाग्छ (`vis-` → `visible`, `poss-` → `possible`, `horr-` → `horrible`)।\n३. **Independent र Existence**: यी दुवैमा अन्त्यतिर **-ent / -ence** लाग्छ (`independent` मा कतै पनि `a` आउँदैन—सबै `e` मात्र हुन्छन्!)।',
      examples: [
        {
          baseWord: 'environ',
          transformation: 'environ + -ment (keep root "n")',
          correctSpelling: 'environment',
          commonWrongSpelling: 'enviroment',
          nepaliMeaning: 'वातावरण (m भन्दा अगाडि n अनिवार्य)',
        },
        {
          baseWord: 'govern',
          transformation: 'govern + -ment (keep root "n")',
          correctSpelling: 'government',
          commonWrongSpelling: 'goverment',
          nepaliMeaning: 'सरकार (govern को n नछुटाउनुहोस्)',
        },
        {
          baseWord: 'independent',
          transformation: 'All "E"s in the second half (-pendent)',
          correctSpelling: 'independent',
          commonWrongSpelling: 'independant',
          nepaliMeaning: 'स्वतन्त्र (अन्त्यमा -ent हुन्छ, -ant होइन)',
        },
        {
          baseWord: 'knowledge',
          transformation: 'know + -ledge (silent d before ge)',
          correctSpelling: 'knowledge',
          commonWrongSpelling: 'knowlege',
          nepaliMeaning: 'ज्ञान (g अगाडि d अनिवार्य)',
        },
      ],
      exceptions: [
        'accessible, flexible, responsible (complete words taking -ible)',
        'indispensable (takes -able)',
      ],
      quizzes: [
        {
          id: 'l5-q1',
          type: 'multiple-choice',
          promptEnglish: 'Which spelling is 100% accurate for academic writing?',
          promptNepaliHint: 'मूल शब्द "environ" मा "-ment" थपिँदा बन्ने सही हिज्जे छान्नुहोस्:',
          options: ['environment', 'enviroment', 'enviornment', 'invironment'],
          correctAnswer: 'environment',
          commonMistakeExplanationNepali:
            'मूल शब्द "environ" मा रहेको "n" कायम रहन्छ, त्यसैले "e-n-v-i-r-o-n-m-e-n-t" सही हो।',
        },
        {
          id: 'l5-q2',
          type: 'multiple-choice',
          promptEnglish: 'Select the correct spelling of the word meaning "self-reliant / free":',
          promptNepaliHint: '"स्वतन्त्र" को अंग्रेजी हिज्जेमा पछाडि -ent लाग्छ कि -ant?',
          options: ['independent', 'independant', 'indipendent', 'independunt'],
          correctAnswer: 'independent',
          commonMistakeExplanationNepali:
            '"Independent" मा "in-de-pend-ent" चारवटै सिलेबलमा स्वर वर्ण "i" र तीनवटा "e" मात्र हुन्छन्; कतै पनि "a" हुँदैन!',
        },
        {
          id: 'l5-q3',
          type: 'fill-blank',
          promptEnglish: 'The ______ (government) shared new ______ (knowledge) about clean energy.',
          promptNepaliHint: '"सरकार" र "ज्ञान" को शुद्ध हिज्जे जोडी छान्नुहोस्:',
          options: [
            'government / knowledge',
            'goverment / knowlege',
            'government / knowlege',
            'goverment / knowledge',
          ],
          correctAnswer: 'government / knowledge',
          commonMistakeExplanationNepali:
            '"Government" मा r पछि n र "knowledge" मा l-e पछि d अनिवार्य हुन्छ।',
        },
        {
          id: 'l5-q4',
          type: 'fill-blank',
          promptEnglish: 'A soft cotton ______ (handkerchief) feels very ______ (comfortable).',
          promptNepaliHint: '"रुमाल" र "आरामदायी" को सही हिज्जे छान्नुहोस्:',
          options: [
            'handkerchief / comfortable',
            'hankerchief / comfortable',
            'handkercheif / comfortible',
            'handkerchief / comfortible',
          ],
          correctAnswer: 'handkerchief / comfortable',
          commonMistakeExplanationNepali:
            '"Handkerchief" मा मौन d र i-e हुन्छ भने पूर्ण मूल शब्द "comfort" मा "-able" लाग्छ।',
        },
      ],
    },
    moduleD_grammar: {
      topicTitle: 'Relative Clauses (Who, Which, That, Whose) vs. Nepali Pre-Nominal Modifiers',
      nepaliTopicTitle: 'अंग्रेजी विशेषण उपवाक्य (Relative Clauses) र नेपाली पूर्व-विशेषणको तुलना',
      explanationNepali:
        'यो नेपाली र अंग्रेजी व्याकरण बीचको सबैभन्दा रोचक भिन्नता हो!\n• **नेपालीमा**: कुनै नाम (Noun) को व्याख्या गर्ने लामो वाक्यांश सधैं त्यो नामभन्दा **अगाडि** आउँछ—जस्तै: `[सरकारले वातावरण जोगाउन बनाएको] नीति`।\n• **अंग्रेजीमा**: पहिले मुख्य नाम (`The policy`) राखिन्छ, अनि त्यसको ठीक **पछाडि** `that / which / who` लगाएर व्याख्या गरिन्छ: `The policy [that the government created to protect the environment]`।\n• मान्छेका लागि **who/that**, वस्तु वा नीतिका लागि **which/that**, र स्वामित्व ("जसको") बुझाउन **whose** प्रयोग हुन्छ।',
      keyTakeawaysNepali: [
        'नेपालीको "...गरेको / ...बनाएको + नाम" लाई अंग्रेजीमा लैजाँदा पहिले नाम (Noun) लेख्नुहोस् अनि पछाडि who/which/that जोड्नुहोस्।',
        'मानिस = who / that (The researcher who has deep knowledge...)',
        'वस्तु / संस्था / वातावरण = which / that (The environment that we protect...)',
        'Relative Clause भित्र फेरि दोहोर्याएर सर्वनाम (it/he/them) नराख्नुहोस् (❌ The policy that the government created it → ✅ The policy that the government created)।',
      ],
      syntaxComparisons: [
        {
          id: 'l5-syn-1',
          contextLabel: 'Nepali Pre-Nominal Participial Clause vs. English Post-Nominal Relative Clause',
          englishFullSentence: 'The policy that the government introduced protects the environment.',
          nepaliFullSentence: 'सरकारले ल्याएको नीतिले वातावरणको रक्षा गर्छ।',
          englishOrderFormula: 'Head Noun + [that + Subject + Verb] + Main Verb + Object',
          nepaliOrderFormula: '[विशेषण उपवाक्य: सरकारले ल्याएको] + मुख्य नाम (नीतिले) + कर्म + क्रिया',
          structuralNoteNepali:
            'नेपालीमा "सरकारले ल्याएको" सुरुमा र "नीति" पछि आउँछ; अंग्रेजीमा पहिले "The policy" अनि पछि "that the government introduced" आउँछ।',
          tokens: [
            {
              role: 'Subject',
              englishText: 'The policy',
              nepaliText: 'नीतिले',
              nepaliRoleLabel: 'मुख्य नाम (Head Noun)',
            },
            {
              role: 'Modifier',
              englishText: 'that the government introduced',
              nepaliText: 'सरकारले ल्याएको',
              nepaliRoleLabel: 'विशेषण उपवाक्य (Relative Clause)',
            },
            {
              role: 'Verb',
              englishText: 'protects',
              nepaliText: 'रक्षा गर्छ',
              nepaliRoleLabel: 'मुख्य क्रिया (Main Verb)',
            },
            {
              role: 'Object',
              englishText: 'the environment',
              nepaliText: 'वातावरणको',
              nepaliRoleLabel: 'कर्म (Object)',
            },
          ],
        },
        {
          id: 'l5-syn-2',
          contextLabel: 'Describing People with "Who / Whose"',
          englishFullSentence: 'We hired an independent consultant who has practical knowledge.',
          nepaliFullSentence: 'हामीले व्यावहारिक ज्ञान भएको एक स्वतन्त्र परामर्शदाता नियुक्ती गर्यौं।',
          englishOrderFormula: 'Subject + Verb + Object Noun + [who + Verb + Object]',
          nepaliOrderFormula: 'कर्ता + [विशेषण वाक्यांश: ज्ञान भएको] + कर्म नाम + क्रिया',
          structuralNoteNepali:
            '"व्यावहारिक ज्ञान भएको परामर्शदाता" भन्न अंग्रेजीमा पहिले "an independent consultant" र पछाडि "who has practical knowledge" राखिन्छ।',
          tokens: [
            {
              role: 'Subject',
              englishText: 'We',
              nepaliText: 'हामीले',
              nepaliRoleLabel: 'कर्ता',
            },
            {
              role: 'Verb',
              englishText: 'hired',
              nepaliText: 'नियुक्ती गर्यौं',
              nepaliRoleLabel: 'क्रिया',
            },
            {
              role: 'Object',
              englishText: 'an independent consultant',
              nepaliText: 'एक स्वतन्त्र परामर्शदाता',
              nepaliRoleLabel: 'मुख्य कर्म नाम',
            },
            {
              role: 'Modifier',
              englishText: 'who has practical knowledge',
              nepaliText: 'व्यावहारिक ज्ञान भएको',
              nepaliRoleLabel: 'मानिस बुझाउने Relative Clause (who)',
            },
          ],
        },
      ],
      capstoneExercises: [
        {
          id: 'l5-cap-1',
          questionPrompt: 'Translate naturally into English: "मैले हिजो किनेको आरामदायी कुर्सी"',
          nepaliContext: 'पहिले मुख्य नाम (The comfortable chair) र पछाडि Relative Clause राख्नुहोस् (दोहोरो "it" नराख्नुहोस्):',
          options: [
            'The comfortable chair that I bought yesterday',
            'Yesterday I bought that comfortable chair it',
            'The comfortable chair that I bought it yesterday',
            'That I bought yesterday the comfortable chair',
          ],
          correctAnswer: 'The comfortable chair that I bought yesterday',
          explanationNepali:
            'पहिले मुख्य नाम "The comfortable chair" आउँछ र पछाडि "that I bought yesterday" आउँछ ("that" ले नै कुर्सी बुझाउने हुनाले फेरि "it" थपिँदैन)।',
        },
        {
          id: 'l5-cap-2',
          questionPrompt: 'Choose the correct relative pronoun: "The scientist ______ research protects the mountain environment won an award."',
          nepaliContext: '"जसको अनुसन्धान" (स्वामित्व / सम्बन्ध) बुझाउन कुन शब्द प्रयोग हुन्छ?',
          options: ['whose', 'who', 'which', 'whom'],
          correctAnswer: 'whose',
          explanationNepali:
            'नाम शब्द "research" अगाडि "जसको" (स्वामित्व) अर्थ दिन सधैं "whose" (whose research) प्रयोग गरिन्छ।',
        },
        {
          id: 'l5-cap-3',
          questionPrompt: 'Identify the sentence with completely accurate spelling and grammar:',
          nepaliContext: 'environment, government, र independent को हिज्जे तथा Relative Clause जाँच्नुहोस्:',
          options: [
            'An independent committee that advises the government reviewed the environment report.',
            'An independant committee who advises the goverment reviewed the enviroment report.',
            'An independent committee that advises the goverment reviewed the environment report.',
            'An independant committee that advises the government reviewed the enviroment report.',
          ],
          correctAnswer: 'An independent committee that advises the government reviewed the environment report.',
          explanationNepali:
            'यसमा "independent", "committee", "government", र "environment" चारवटै शब्दको हिज्जे र Relative Clause पूर्ण रूपमा शुद्ध छ।',
        },
      ],
    },
  },

  // ============================================================================
  // LECTURE 6 (C1 · Advanced Fluency): Confusable Pairs & Conditionals
  // ============================================================================
  {
    id: 'lecture-6-confusables-conditionals',
    lectureNumber: 6,
    title: 'Advanced Silent Clusters, Confusable Pairs & Conditionals',
    nepaliTitle: 'उच्चस्तरीय मौन अक्षर, उस्तै सुनिने शब्दहरू (Homophones) र सर्तवाचक वाक्य (Conditionals)',
    subtitle:
      'Distinguish "Conscious" vs. "Conscience" and "Affect" vs. "Effect", pronounce "Rhythm" and "Pneumonia", and master 2nd & 3rd Conditionals.',
    level: 'C1',
    category: 'Advanced Professional Mastery',
    estimatedMinutes: 20,
    moduleA_vocabulary: [
      {
        id: 'l6-v1',
        word: 'Conscious',
        ipa: '/ˈkɒn.ʃəs/',
        partOfSpeech: 'Adjective',
        segments: [
          { text: 'Con', silent: false },
          { text: 'sci', silent: false },
          { text: 'ous', silent: false },
        ],
        silentLettersSummary: '"sci" blends into a single "/ʃ/" (श) sound: KON-shus',
        nepaliMeaning: 'सचेत / होशमा रहेको / जागरूक',
        nepaliTransliteration: 'कन्शस',
        englishExample: 'Consumers are becoming increasingly conscious of sustainable packaging.',
        nepaliExampleTranslation: 'उपभोक्ताहरू दिगो प्याकेजिङप्रति झन्झन् सचेत हुँदै गइरहेका छन्।',
        usageTipNepali:
          'यो विशेषण (Adjective) हो। यसमा रहेको "sci" लाई "साइ" होइन "श" (/ʃ/) उच्चारण गरिन्छ: "कन्-शस" (/ˈkɒn.ʃəs/)।',
      },
      {
        id: 'l6-v2',
        word: 'Conscience',
        ipa: '/ˈkɒn.ʃəns/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'Con', silent: false },
          { text: 'sci', silent: false },
          { text: 'ence', silent: false },
        ],
        silentLettersSummary: 'Spelled "con + science", but pronounced KON-shuhns (/ˈkɒn.ʃəns/)',
        nepaliMeaning: 'अन्तरात्मा / विवेक (सही र गलत छुट्याउने भित्री मन)',
        nepaliTransliteration: 'कन्शन्स',
        englishExample: 'A clear conscience brings deep peace of mind.',
        nepaliExampleTranslation: 'सफा अन्तरात्माले मनमा गहिरो शान्ति ल्याउँछ।',
        usageTipNepali:
          'हिज्जे सम्झने ट्रिक: `Con + science`! तर उच्चारण गर्दा "कन-साइन्स" कहिल्यै नभन्नुहोस्—यसलाई "कन्-शन्स" (/ˈkɒn.ʃəns/) भनिन्छ।',
      },
      {
        id: 'l6-v3',
        word: 'Rhythm',
        ipa: '/ˈrɪð.əm/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'R', silent: false },
          { text: 'h', silent: true },
          { text: 'ythm', silent: false },
        ],
        silentLettersSummary: 'Silent "h" after "r", and no standard vowel letters (a, e, i, o, u)',
        nepaliMeaning: 'लय / ताल (संगीत वा दैनिक जीवनको गति)',
        nepaliTransliteration: 'रिदम',
        englishExample: 'The traditional madal sets an energetic rhythm for Nepali folk dances.',
        nepaliExampleTranslation: 'परम्परागत मादलले नेपाली लोक नृत्यको लागि ऊर्जावान् लय तय गर्छ।',
        usageTipNepali:
          'यसमा a, e, i, o, u मध्ये कुनै पनि अक्षर छैन ("y" ले नै स्वरको काम गर्छ)। सुरुमा "r-h" भएो कुरा ध्यान दिनुहोस्।',
      },
      {
        id: 'l6-v4',
        word: 'Wholesome',
        ipa: '/ˈhəʊl.səm/',
        partOfSpeech: 'Adjective',
        segments: [
          { text: 'W', silent: true },
          { text: 'holesome', silent: false },
        ],
        silentLettersSummary: 'Silent initial "w" before "ho" (starts with /h/ sound)',
        nepaliMeaning: 'स्वस्थकर / शरीर र मनका लागि हितकारी',
        nepaliTransliteration: 'होलसम',
        englishExample: 'Traditional dal-bhat with fresh greens is a wholesome meal.',
        nepaliExampleTranslation: 'ताजा सागसब्जी सहितको परम्परागत दाल-भात एक स्वस्थकर भोजन हो।',
        usageTipNepali:
          'सामान्यतया "wh-" (what, where, why) मा "h" मौन र "w" उच्चारण हुन्छ, तर "who, whole, wholesale, wholesome" मा ठीक उल्टो—"w" मौन हुन्छ र "h" बोलिन्छ!',
      },
      {
        id: 'l6-v5',
        word: 'Pneumonia',
        ipa: '/njuːˈməʊ.ni.ə/',
        partOfSpeech: 'Noun',
        segments: [
          { text: 'P', silent: true },
          { text: 'neumonia', silent: false },
        ],
        silentLettersSummary: 'Silent initial "p" before "n"',
        nepaliMeaning: 'निमोनिया (फोक्सोमा हुने गम्भीर संक्रमण)',
        nepaliTransliteration: 'न्युमोनिया',
        englishExample: 'Warm clothing and timely care help prevent winter pneumonia.',
        nepaliExampleTranslation: 'तातो कपडा र समयमै गरिने हेरचाहले जाडोको निमोनिया रोक्न मद्दत गर्छ।',
        usageTipNepali:
          'ग्रीक शब्द मूल "pneumon" (फोक्सो/हावा) बाट आएको हुनाले सुरुमा "P" लेखिन्छ तर बोलिँदैन।',
      },
    ],
    moduleB_pronunciation: [
      {
        id: 'l6-p1',
        word: 'Conscious',
        ipa: '/ˈkɒn.ʃəs/',
        syllables: ['kon', 'shuhs'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'KON-shuhs',
        nepaliPhoneticHint: 'कन्-शस (विशेषण)',
        ruleTitle: 'Palatalization of "-SCI-" to /ʃ/',
        ruleExplanationNepali:
          '"Conscious" (सचेत) र "Conscience" (विवेक) दुवैमा बीचको "sci" ले "श" (/ʃ/) आवाज दिन्छ। अन्त्यमा "-ous" हुँदा "शस" र "-ence" हुँदा "शन्स" सुनिन्छ।',
        commonMispronunciation: 'Kon-si-ous (कन-सि-अस)',
      },
      {
        id: 'l6-p2',
        word: 'Conscience',
        ipa: '/ˈkɒn.ʃəns/',
        syllables: ['kon', 'shuhns'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'KON-shuhns',
        nepaliPhoneticHint: 'कन्-शन्स (नाम)',
        ruleTitle: 'Don’t Say "Science" Inside "Conscience"',
        ruleExplanationNepali:
          'हिज्जेमा "science" देखिए पनि उच्चारणमा "साइन्स" भनिँदैन, २ सिलेबलमा "कन्-शन्स" मात्र भनिन्छ।',
        commonMispronunciation: 'Kon-sai-uhns (कन-साइन्स)',
      },
      {
        id: 'l6-p3',
        word: 'Rhythm',
        ipa: '/ˈrɪð.əm/',
        syllables: ['rith', 'uhm'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'RITH-uhm',
        nepaliPhoneticHint: 'रि-दम',
        ruleTitle: 'Voiced "TH" (/ð/) + Syllabic "M"',
        ruleExplanationNepali:
          'बीचको "th" ले थ (thin) होइन, नरम "द" (/ð/ जस्तै this, mother) को आवाज दिन्छ र अन्त्यमा हल्का "अम" जोडिन्छ।',
        commonMispronunciation: 'Ri-thum (रि-थम)',
      },
      {
        id: 'l6-p4',
        word: 'Wholesome',
        ipa: '/ˈhəʊl.səm/',
        syllables: ['hohl', 'suhm'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'HOHL-suhm',
        nepaliPhoneticHint: 'होल-सम',
        ruleTitle: 'The "WHO-" Exception Group (/h/ Instead of /w/)',
        ruleExplanationNepali:
          'जब "wh" पछाडि अक्षर "o" आउँछ (who, whom, whose, whole, wholesome), सुरुको "w" पूरै मौन हुन्छ र आवाज "ह" (/h/) बाट सुरु हुन्छ।',
        commonMispronunciation: 'Wohl-some (वोल-सम)',
      },
      {
        id: 'l6-p5',
        word: 'Pneumonia',
        ipa: '/njuːˈməʊ.ni.ə/',
        syllables: ['nyoo', 'moh', 'nee', 'uh'],
        stressedSyllableIndex: 1,
        simplifiedPhonetic: 'nyoo-MOH-nee-uh',
        nepaliPhoneticHint: 'न्यु-मो-नि-या',
        ruleTitle: 'Silent Initial "P" Before Nasal "N"',
        ruleExplanationNepali:
          'अंग्रेजीमा शब्दको सुरुमा "pn-" आउँदा (pneumonia, pneumatic) "p" मौन रहन्छ र सिधै "n" बाट आवाज सुरु गरिन्छ।',
        commonMispronunciation: 'Puh-new-mo-nia',
      },
    ],
    moduleC_spelling: {
      ruleTitle: 'High-Stakes Confusable Pairs (Affect/Effect, Principle/Principal, Compliment/Complement)',
      nepaliRuleTitle: 'उस्तै सुनिने तर अर्थ फरक हुने शब्द जोडीहरू (Confusable Homophones)',
      formula:
        'Affect = Verb (Action: A) · Effect = Noun (End Result: E) | Principle = Rule (le) · Principal = Head/Main (pal) | Compliment = Praise (I) · Complement = Complete (E)',
      nepaliExplanation:
        'उच्चस्तरीय अंग्रेजी लेखनमा यी ४ जोडी शब्दहरूमा विशेष ध्यान दिनुपर्छ:\n१. **Affect बनाम Effect**: **A**ffect प्रायः क्रिया (**A**ction = प्रभाव पार्नु) हो, जस्तै: "Cold weather affects health." **E**ffect प्रायः नाम (**E**nd result = असर/परिणाम) हो, जस्तै: "The medicine had a positive effect."\n२. **Principle बनाम Principal**: `Princi-ple` (`ru-le` जस्तै अन्त्यमा `-le`) को अर्थ **सिद्धान्त वा नियम** हो। `Princi-pal` को अर्थ **प्रधानाध्यापक वा मुख्य** हो।\n३. **Compliment बनाम Complement**: बीचमा **i** भएको `Compliment` ले **प्रशंसा** बुझाउँछ ("I like praise")। बीचमा **e** भएको `Complement` ले **पूरक बनाउनु** (`complEte` सँग मिल्ने) बुझाउँछ।',
      examples: [
        {
          baseWord: 'affect vs. effect',
          transformation: 'Action Verb (a) vs. End Result Noun (e)',
          correctSpelling: 'affect (verb) / effect (noun)',
          commonWrongSpelling: 'Mixing up verb and noun roles',
          nepaliMeaning: 'प्रभाव पार्नु (affect) बनाम परिणाम/असर (effect)',
        },
        {
          baseWord: 'principle vs. principal',
          transformation: 'ruLE (-ple) vs. main/head (-pal)',
          correctSpelling: 'principle (rule) / principal (head)',
          commonWrongSpelling: 'moral principals (wrong for rules)',
          nepaliMeaning: 'सिद्धान्त/नियम (principle) बनाम प्रमुख/प्रधानाध्यापक (principal)',
        },
        {
          baseWord: 'compliment vs. complement',
          transformation: 'Praise (-pli-) vs. Complete (-ple-)',
          correctSpelling: 'compliment / complement',
          commonWrongSpelling: 'free인의 complement (when meaning praise)',
          nepaliMeaning: 'प्रशंसा (compliment) बनाम परिपूरक (complement)',
        },
        {
          baseWord: 'rhythm',
          transformation: 'R-H-Y-T-H-M (two Hs, one Y)',
          correctSpelling: 'rhythm',
          commonWrongSpelling: 'rythm / rhythym',
          nepaliMeaning: 'लय / ताल (दुईवटा h: rh + th)',
        },
      ],
      exceptions: [
        'In formal policy writing, "effect change" uses effect as a verb meaning "to bring about".',
      ],
      quizzes: [
        {
          id: 'l6-q1',
          type: 'multiple-choice',
          promptEnglish: 'Choose the correct pair: "Lack of sleep can ______ your focus and have a negative ______ on your health."',
          promptNepaliHint: 'पहिलो खाली ठाउँमा क्रिया (प्रभाव पार्नु) र दोस्रोमा नाम (असर) चाहिन्छ:',
          options: [
            'affect / effect',
            'effect / affect',
            'affect / affect',
            'effect / effect',
          ],
          correctAnswer: 'affect / effect',
          commonMistakeExplanationNepali:
            '"Can" पछि क्रिया चाहिने हुनाले "affect" (प्रभाव पार्नु) र "a negative" पछि नाम चाहिने हुनाले "effect" (असर) सही हो।',
        },
        {
          id: 'l6-q2',
          type: 'multiple-choice',
          promptEnglish: 'Which spelling of "लय / ताल" (musical beat) is correct?',
          promptNepaliHint: 'दुईवटा "h" हुने सही हिज्जे छान्नुहोस् (Rhythm Helps Your Two Hips Move!):',
          options: ['rhythm', 'rythm', 'rhythem', 'rythym'],
          correctAnswer: 'rhythm',
          commonMistakeExplanationNepali:
            '"Rhythm" मा सुरुमा r-h र पछाडि t-h गरी दुई ठाउँमा h आउँछ (r-h-y-t-h-m)।',
        },
        {
          id: 'l6-q3',
          type: 'fill-blank',
          promptEnglish: 'She remained ______ (conscious = aware) of her moral ______ (principles = rules) and clear ______ (conscience).',
          promptNepaliHint: 'विशेषण (conscious), सिद्धान्त (principles), र विवेक (conscience) को सही जोडी छान्नुहोस्:',
          options: [
            'conscious / principles / conscience',
            'conscience / principals / conscious',
            'conscious / principals / conscience',
            'concious / principles / consience',
          ],
          correctAnswer: 'conscious / principles / conscience',
          commonMistakeExplanationNepali:
            'सचेत = conscious (-ous विशेषण), सिद्धान्त = principles (-le नियम), र विवेक = conscience (con+science नाम)।',
        },
        {
          id: 'l6-q4',
          type: 'fill-blank',
          promptEnglish: 'Fresh ginger tea ______ (complements = completes) a ______ (wholesome) meal and helps prevent ______ (pneumonia).',
          promptNepaliHint: '"पूरक हुनु" (e सहित), "स्वस्थकर", र "निमोनिया" को शुद्ध हिज्जे छान्नुहोस्:',
          options: [
            'complements / wholesome / pneumonia',
            'compliments / holesome / newmonia',
            'complements / wholesome / numonia',
            'compliments / wholesome / pneumonia',
          ],
          correctAnswer: 'complements / wholesome / pneumonia',
          commonMistakeExplanationNepali:
            'भोजनलाई पूर्ण/पूरक बनाउने अर्थमा "complements" (e सहित), मौन w सहित "wholesome", र मौन p सहित "pneumonia" सही छ।',
        },
      ],
    },
    moduleD_grammar: {
      topicTitle: 'Second & Third Conditionals (Hypothetical Present vs. Past Regrets)',
      nepaliTopicTitle: 'काल्पनिक वर्तमान (2nd Conditional) र बितेको अपसोच/सर्त (3rd Conditional)',
      explanationNepali:
        'नेपालीमा काल्पनिक वा असम्भव सर्त बुझाउन "-एमा" वा "-एको भए ... हुने थियो" प्रयोग गरिन्छ। अंग्रेजीमा यसका दुई स्पष्ट सूत्रहरू छन् र **If भएको भाग (If-clause) मा कहिल्यै पनि "would" राखिँदैन!**\n१. **Second Conditional (अहिलेको काल्पनिक अवस्था)**: `If + Simple Past (V2/were), ... would + V1`\nउदाहरण: "If I **knew** the rhythm, I **would play** the madal." (यदि मलाई अहिले ताल थाहा हुँदो हो त म मादल बजाउने थिएँ—तर वास्तवमा थाहा छैन)।\n२. **Third Conditional (बितेको समयको काल्पनिक सर्त — अब बदल्न नसकिने)**: `If + Past Perfect (had + V3), ... would have + V3`\nउदाहरण: "If he **had worn** a warm coat, he **would not have caught** pneumonia." (यदि उनले न्यानो कोट लगाएको भए उनलाई निमोनिया हुने थिएन)।',
      keyTakeawaysNepali: [
        'सुनौलो नियम: "If" सँगै आउने उपवाक्यमा "would" वा "would have" कहिल्यै नराख्नुहोस् (❌ If I would have known → ✅ If I had known)!',
        'अहिले वा भविष्यको काल्पनिक कुरा = If + V2/were ... would + V1।',
        'बितिसकेको घटनाको कल्पना वा पछुतो = If + had + V3 ... would have + V3।',
      ],
      syntaxComparisons: [
        {
          id: 'l6-syn-1',
          contextLabel: 'Third Conditional (Counterfactual Past — "-एको भए ... हुने थिएन")',
          englishFullSentence: 'If I had been conscious of the trap, I would have avoided the mistake.',
          nepaliFullSentence: 'यदि म त्यो पासोप्रति सचेत भएको भए, मैले त्यो गल्ती टार्ने थिएँ।',
          englishOrderFormula: 'If + Subject + had + V3, Subject + would have + V3',
          nepaliOrderFormula: 'यदि + कर्ता + धातु-एको भए, कर्ता + कर्म + धातु-ने थिएँ',
          structuralNoteNepali:
            'नेपालीको "सचेत भएको भए" लाई अंग्रेजीमा "If I had been conscious" भनिन्छ र दोस्रो भागमा "would have avoided" लाग्छ।',
          tokens: [
            {
              role: 'Connector',
              englishText: 'If I had been',
              nepaliText: 'यदि म भएको भए',
              nepaliRoleLabel: 'सर्त क्रिया (If + had + V3)',
            },
            {
              role: 'Modifier',
              englishText: 'conscious of the trap,',
              nepaliText: 'त्यो पासोप्रति सचेत,',
              nepaliRoleLabel: 'पूरक विशेषण वाक्यांश',
            },
            {
              role: 'Subject',
              englishText: 'I',
              nepaliText: 'मैले',
              nepaliRoleLabel: 'मुख्य कर्ता',
            },
            {
              role: 'Verb',
              englishText: 'would have avoided',
              nepaliText: 'टार्ने थिएँ',
              nepaliRoleLabel: 'परिणाम क्रिया (would have + V3)',
            },
            {
              role: 'Object',
              englishText: 'the mistake.',
              nepaliText: 'त्यो गल्ती।',
              nepaliRoleLabel: 'कर्म (Object)',
            },
          ],
        },
        {
          id: 'l6-syn-2',
          contextLabel: 'Second Conditional (Present Unreal — "यदि म तपाईंको ठाउँमा भए...")',
          englishFullSentence: 'If I were you, I would follow my conscience.',
          nepaliFullSentence: 'यदि म तपाईंको ठाउँमा हुँदो हुँ त, म आफ्नो अन्तरात्माको आवाज सुन्ने थिएँ।',
          englishOrderFormula: 'If + Subject + were, Subject + would + V1 + Object',
          nepaliOrderFormula: 'यदि + कर्ता + पूरक + क्रिया, कर्ता + कर्म + क्रिया',
          structuralNoteNepali:
            'काल्पनिक सर्तमा एकवचन कर्ता (I, he, she) सँग पनि औपचारिक अंग्रेजीमा "was" को सट्टा "were" ("If I were you") प्रयोग गरिन्छ।',
          tokens: [
            {
              role: 'Connector',
              englishText: 'If I were you,',
              nepaliText: 'यदि म तपाईंको ठाउँमा हुँदो हुँ त,',
              nepaliRoleLabel: 'काल्पनिक सर्त (Subjunctive were)',
            },
            {
              role: 'Subject',
              englishText: 'I',
              nepaliText: 'म',
              nepaliRoleLabel: 'कर्ता',
            },
            {
              role: 'Verb',
              englishText: 'would follow',
              nepaliText: 'पछ्याउने / सुन्ने थिएँ',
              nepaliRoleLabel: 'परिणाम क्रिया (would + V1)',
            },
            {
              role: 'Object',
              englishText: 'my conscience.',
              nepaliText: 'आफ्नो अन्तरात्माको आवाज।',
              nepaliRoleLabel: 'कर्म',
            },
          ],
        },
      ],
      capstoneExercises: [
        {
          id: 'l6-cap-1',
          questionPrompt: 'Choose the correct Third Conditional form: "If the patient ______ medical care earlier, the pneumonia ______ so severe."',
          nepaliContext: 'बितिसकेको समयको काल्पनिक सर्त (If + had + V3 ... would not have + V3):',
          options: [
            'had received / would not have become',
            'would have received / had not become',
            'received / would not have become',
            'had phrasing / will not become',
          ],
          correctAnswer: 'had received / would not have become',
          explanationNepali:
            'If-clause मा "had + V3" (had received) र मुख्य उपवाक्यमा "would not have + V3" (would not have become) लाग्छ।',
        },
        {
          id: 'l6-cap-2',
          questionPrompt: 'Spot the error and select the correct version of: "If I would know the rhythm, I would join the dance."',
          nepaliContext: 'If सँगै कहिल्यै "would" नआउने नियम सम्झनुहोस्:',
          options: [
            'If I knew the rhythm, I would join the dance.',
            'If I would knew the rhythm, I would join the dance.',
            'If I know the rhythm, I would have joined the dance.',
            'If I had knew the rhythm, I would join the dance.',
          ],
          correctAnswer: 'If I knew the rhythm, I would join the dance.',
          explanationNepali:
            'Second Conditional मा If पछि Simple Past ("If I knew") र दोस्रो भागमा "would + V1" ("would join") प्रयोग हुन्छ।',
        },
        {
          id: 'l6-cap-3',
          questionPrompt: 'Which sentence uses "conscience", "conscious", and "principles" with 100% accuracy?',
          nepaliContext: 'अन्तरात्मा (conscience - नाम), सचेत (conscious - विशेषण), र सिद्धान्त (principles) जाँच्नुहोस्:',
          options: [
            'If we were more conscious of our core principles, our conscience would remain clear.',
            'If we were more conscience of our core principals, our conscious would remain clear.',
            'If we would be conscious of our principles, our conscience will remain clear.',
            'If we were more conscious of our principals, our concience would remain clear.',
          ],
          correctAnswer: 'If we were more conscious of our core principles, our conscience would remain clear.',
          explanationNepali:
            'यसमा Second Conditional व्याकरण र "conscious" (सचेत), "principles" (सिद्धान्तहरू), तथा "conscience" (विवेक) तीनवटैको प्रयोग पूर्ण रूपमा सही छ।',
        },
      ],
    },
  },
  ...CORE_SYLLABUS_PART_2,
];

export const CORE_SYLLABUS: LectureUnit[] = enrichSyllabusWithEnhancements(RAW_CORE_SYLLABUS);


