import { LectureUnit } from '../types/curriculum';

export const CORE_SYLLABUS_PART_2: LectureUnit[] = [
  // =========================================================================
  // LECTURE 7 (B1): SILENT "-MB" & "-STL" CLUSTERS, PLURALS & CAUSATIVE VERBS
  // =========================================================================
  {
    id: 'lecture-7-silent-mb-stl-causatives',
    lectureNumber: 7,
    level: 'B1',
    title: 'Silent "-MB" & "-STL" Words, Plurals & Causatives',
    nepaliTitle: 'मौन "-MB" र "-STL" शब्दहरू, बहुवचन नियम र प्रेरणार्थक क्रिया (Causatives)',
    subtitle:
      'Master silent B and T in everyday household words, "-ies/-ves" plural transformations, and how to say "have something done" in English.',
    category: 'Household & Services',
    estimatedMinutes: 14,
    moduleA_vocabulary: [
      {
        id: 'l7-v1',
        word: 'Plumber',
        ipa: '/ˈplʌm.ər/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'Plum', silent: false },
          { text: 'b', silent: true },
          { text: 'er', silent: false },
        ],
        silentLettersSummary: 'Silent "b" after "m"',
        nepaliMeaning: 'प्लम्बर / धारा र पाइप मर्मत गर्ने प्राविधिक',
        nepaliTransliteration: 'Plambar / Dhārā ra pāip marmat garne prāvidhik',
        englishExample: 'We called a local plumber to fix the leaking kitchen pipe.',
        nepaliExampleTranslation: 'हामीले भान्साको चुहिरहेको पाइप मर्मत गर्न स्थानीय प्लम्बरलाई बोलायौँ।',
        usageTipNepali:
          '"Plumber" र "Climb" जस्ता शब्दमा "m" पछि आउने "b" पूर्ण रूपमा मौन हुन्छ—यसलाई "प्लम्बर" होइन "प्लमर" (/ˈplʌm.ər/) भनिन्छ।',
      },
      {
        id: 'l7-v2',
        word: 'Castle',
        ipa: '/ˈkɑː.səl/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'Cas', silent: false },
          { text: 't', silent: true },
          { text: 'le', silent: false },
        ],
        silentLettersSummary: 'Silent "t" in "-stle" & final "-e"',
        nepaliMeaning: 'किल्ला / दरबार / गढी',
        nepaliTransliteration: 'Killā / Darbār',
        englishExample: 'The ancient stone castle stood high above the green valley.',
        nepaliExampleTranslation: 'त्यो प्राचीन ढुङ्गे किल्ला हरियो उपत्यकाभन्दा माथि उभिएको थियो।',
        usageTipNepali:
          '"-stle" बाट टुङ्गिने शब्दहरू (castle, whistle, wrestle) मा बीचको "t" कहिल्यै उच्चारण हुँदैन।',
      },
      {
        id: 'l7-v3',
        word: 'Whistle',
        ipa: '/ˈwɪs.əl/',
        partOfSpeech: 'noun / verb',
        segments: [
          { text: 'W', silent: false },
          { text: 'h', silent: true },
          { text: 'is', silent: false },
          { text: 't', silent: true },
          { text: 'le', silent: false },
        ],
        silentLettersSummary: 'Silent "h" after "w" & silent "t"',
        nepaliMeaning: 'सिठी / सुसेली बजाउनु',
        nepaliTransliteration: 'Siṭhī / Suselī bajāunu',
        englishExample: 'The referee blew his whistle to end the football match.',
        nepaliExampleTranslation: 'रेफ्रीले फुटबल खेल समाप्त गर्न सिठी बजाए।',
        usageTipNepali:
          '"Whistle" मा "h" र बीचको "t" दुवै मौन हुन्छन्; यसलाई "विसल" (/ˈwɪs.əl/) भनिन्छ।',
      },
      {
        id: 'l7-v4',
        word: 'Thumb',
        ipa: '/θʌm/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'Thum', silent: false },
          { text: 'b', silent: true },
        ],
        silentLettersSummary: 'Silent final "b" after "m"',
        nepaliMeaning: 'बुढी औँला',
        nepaliTransliteration: 'Buḍhī aũlā',
        englishExample: 'He hit his thumb with a hammer while repairing the shelf.',
        nepaliExampleTranslation: 'दराज मर्मत गर्दा उसले हथौडाले आफ्नो बुढी औँलामा हिर्कायो।',
        usageTipNepali:
          'शब्दको अन्त्यमा "-mb" आउँदा (thumb, comb, lamb, bomb) अन्तिम "b" सधैँ मौन रहन्छ।',
      },
      {
        id: 'l7-v5',
        word: 'Fasten',
        ipa: '/ˈfɑː.sən/',
        partOfSpeech: 'verb',
        segments: [
          { text: 'Fas', silent: false },
          { text: 't', silent: true },
          { text: 'en', silent: false },
        ],
        silentLettersSummary: 'Silent "t" in "-sten"',
        nepaliMeaning: 'बाँध्नु / कस्नु (जस्तै: सिटबेल्ट बाँध्नु)',
        nepaliTransliteration: 'Bā̃dhnu / Kasnu',
        englishExample: 'Please fasten your seatbelt before the airplane takes off.',
        nepaliExampleTranslation: 'हवाईजहाज उड्नुअघि कृपया आफ्नो सिटबेल्ट बाँध्नुहोस्।',
        usageTipNepali:
          '"Fast" मा "t" उच्चारण हुन्छ, तर "-en" जोडिएर "Fasten" वा "Listen" बन्दा बीचको "t" मौन हुन्छ ("फासन")।',
      },
    ],
    moduleB_pronunciation: [
      {
        id: 'l7-p1',
        wordId: 'l7-v1',
        word: 'Plumber',
        ipa: '/ˈplʌm.ər/',
        syllables: ['plum', 'ber'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'PLUM-er',
        nepaliPhoneticHint: 'प्लम्-अर्',
        ruleTitle: 'The "-mb-" Silent B Rule (Within & End of Words)',
        ruleExplanationNepali:
          '"m" र "b" सँगै आउँदा (thumb, climb, plumber, comb) नाकबाट निस्कने /m/ ध्वनि पछि ओठ खोलेर /b/ उच्चारण गरिँदैन—प्रत्ययान्त "-er" थप्दा पनि "b" मौन नै रहन्छ।',
        commonMispronunciation: 'Plum-ber (pronouncing the B)',
      },
      {
        id: 'l7-p2',
        wordId: 'l7-v2',
        word: 'Castle',
        ipa: '/ˈkɑː.səl/',
        syllables: ['cas', 'tle'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'KAA-suhl',
        nepaliPhoneticHint: 'का-सल्',
        ruleTitle: 'Silent "T" in "-stle" Endings',
        ruleExplanationNepali:
          'जब शब्दको अन्त्य "-stle" बाट हुन्छ, जिब्रो /s/ बाट सिधै /l/ मा जान्छ र बीचको "t" उच्चारण हुँदैन।',
        commonMispronunciation: 'Cas-tle (saying the T)',
      },
      {
        id: 'l7-p3',
        wordId: 'l7-v3',
        word: 'Whistle',
        ipa: '/ˈwɪs.əl/',
        syllables: ['whis', 'tle'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'WIS-uhl',
        nepaliPhoneticHint: 'विस्-अल्',
        ruleTitle: 'Double Silent Cluster ("wh-" + "-stle")',
        ruleExplanationNepali:
          'यसमा सुरुको "wh" ले साधारण /w/ आवाज दिन्छ र पछाडिको "-stle" मा "t" लोप भएर "विस्-अल्" सुनिन्छ।',
        commonMispronunciation: 'Whis-tul',
      },
      {
        id: 'l7-p4',
        wordId: 'l7-v4',
        word: 'Thumb',
        ipa: '/θʌm/',
        syllables: ['thumb'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'THUM',
        nepaliPhoneticHint: 'थम्',
        ruleTitle: 'Unvoiced "TH" (/θ/) + Silent Final "B"',
        ruleExplanationNepali:
          'जिब्रोको टुप्पो माथिल्लो दाँतमा हल्का छुवाएर हावा फ्याँक्दै "थ" (/θ/) उच्चारण गर्नुहोस् र "म" मा टुङ्ग्याउनुहोस्।',
        commonMispronunciation: 'Thumb-uh',
      },
      {
        id: 'l7-p5',
        wordId: 'l7-v5',
        word: 'Fasten',
        ipa: '/ˈfɑː.sən/',
        syllables: ['fas', 'ten'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'FAA-suhn',
        nepaliPhoneticHint: 'फा-सन्',
        ruleTitle: 'Silent "T" in "-sten" Verbs (Fasten, Listen, Glisten)',
        ruleExplanationNepali:
          '"-sten" समूहका क्रियाहरूमा (fasten, listen, hasten, soften) "s" पछि आउने "t" सधैँ मौन हुन्छ।',
        commonMispronunciation: 'Fas-ten (pronouncing T)',
      },
    ],
    moduleC_spelling: {
      ruleTitle: 'Changing "-Y" to "-IES" & "-F/-FE" to "-VES" in Plurals and Verbs',
      nepaliRuleTitle: 'बहुवचन र क्रिया बनाउँदा "-y" लाई "-ies" र "-f/-fe" लाई "-ves" मा बदल्ने नियम',
      formula:
        'Consonant + Y → drop Y + IES (city → cities) | Vowel + Y → keep Y + S (key → keys) | -F/-FE → -VES (knife → knives)',
      nepaliExplanation:
        'अङ्ग्रेजीमा नामलाई बहुवचन (Plural) वा क्रियालाई एकवचन (he/she tries) बनाउँदा दुईवटा मुख्य हिज्जे नियम लागू हुन्छन्:\n१. यदि शब्दको अन्त्यमा व्यञ्जन वर्ण + "y" (Consonant + y) छ भने "y" हटाएर "-ies" वा "-ied" थप्ने (जस्तै: city → cities, try → tried)। तर स्वर वर्ण + "y" (Vowel + y) छ भने सिधै "-s" थप्ने (जस्तै: boy → boys, delay → delays)।\n२. "-f" वा "-fe" मा टुङ्गिने धेरैजसो शब्दहरूको बहुवचन बनाउँदा "-ves" लेखिन्छ (जस्तै: knife → knives, shelf → shelves, leaf → leaves)।',
      examples: [
        {
          baseWord: 'city / family (Consonant + y)',
          transformation: 'drop -y + ies',
          resultWord: 'cities / families',
          wrongSpelling: 'citys / familys',
        },
        {
          baseWord: 'journey / delay (Vowel + y)',
          transformation: 'keep -y + s',
          resultWord: 'journeys / delays',
          wrongSpelling: 'journies / delaies',
        },
        {
          baseWord: 'knife / shelf (-f / -fe)',
          transformation: 'change -f/-fe to -ves',
          resultWord: 'knives / shelves',
          wrongSpelling: 'knifes / shelfs',
        },
        {
          baseWord: 'try / carry (Consonant + y + ed)',
          transformation: 'drop -y + ied',
          resultWord: 'tried / carried',
          wrongSpelling: 'tryed / carryed',
        },
      ],
      exceptions: [
        'roof → roofs (छानो — "-ves" हुँदैन, सिधै "-s" थपिन्छ)',
        'chief → chiefs (प्रमुख — सिधै "-s" थपिन्छ)',
        'belief → beliefs (विश्वास — क्रिया "believe" मा v हुन्छ तर नाम बहुवचनमा "beliefs" हुन्छ)',
      ],
      quizzes: [
        {
          id: 'l7-q1',
          type: 'multiple-choice',
          prompt: 'Choose the correct plural forms for "shelf" and "family":',
          nepaliHint: '"-f" लाई "-ves" र व्यञ्जन + "y" लाई "-ies" बनाउने नियम लगाउनुहोस्:',
          options: [
            'shelves / families',
            'shelfs / familys',
            'shelves / familys',
            'shelfs / families',
          ],
          correctAnswer: 'shelves / families',
          explanationNepali:
            '"Shelf" को "-f" बदलिएर "shelves" हुन्छ र "family" मा व्यञ्जन "l" पछि "y" आएकोले "families" हुन्छ।',
        },
        {
          id: 'l7-q2',
          type: 'fill-blank',
          prompt: 'The ____ (plumber) repaired two old ____ (roof) in our neighborhood.',
          nepaliHint: 'एकजना प्लम्बर र "roof" को अपवाद बहुवचन हिज्जे छान्नुहोस्:',
          options: [
            'plumber / roofs',
            'plummer / rooves',
            'plumber / rooves',
            'plumer / roofs',
          ],
          correctAnswer: 'plumber / roofs',
          explanationNepali:
            '"Plumber" मा मौन "b" रहन्छ र "roof" अपवाद शब्द भएकोले बहुवचनमा "roofs" मात्र लेखिन्छ।',
        },
        {
          id: 'l7-q3',
          type: 'multiple-choice',
          prompt: 'Which sentence has zero spelling errors?',
          nepaliHint: 'Vowel + y (journey) र Consonant + y (carry) को फरक हेर्नुहोस्:',
          options: [
            'The porter carried our heavy bags during both journeys to the castle.',
            'The porter carryed our heavy bags during both journies to the castle.',
            'The porter carried our heavy bags during both journies to the casle.',
            'The porter carryed our heavy bags during both journeys to the castle.',
          ],
          correctAnswer: 'The porter carried our heavy bags during both journeys to the castle.',
          explanationNepali:
            '"Carry" (व्यञ्जन + y) बाट "carried" बन्छ, तर "journey" (स्वर "e" + y) मा सिधै "-s" थपिएर "journeys" हुन्छ।',
        },
        {
          id: 'l7-q4',
          type: 'fill-blank',
          prompt: 'Please ____ (fasten) your coat and keep the sharp ____ (knife) on the top shelf.',
          nepaliHint: 'मौन "t" भएको क्रिया र "knife" को बहुवचन छान्नुहोस्:',
          options: [
            'fasten / knives',
            'fassen / knifes',
            'fasten / knifes',
            'fasen / knives',
          ],
          correctAnswer: 'fasten / knives',
          explanationNepali:
            '"Fasten" मा मौन "t" लेखिन्छ र "knife" को बहुवचन "knives" हुन्छ।',
        },
      ],
    },
    moduleD_grammar: {
      topicTitle: 'Causative Verbs: "Have / Get Something Done" vs. Doing It Yourself',
      nepaliTopicTitle: 'प्रेरणार्थक संरचना (Causative Verbs): आफैँ गर्नु र अरूबाट काम गराउनुको भिन्नता',
      explanationNepali:
        'नेपालीमा हामी अरू कसैलाई काम गर्न लगाउँदा क्रियामा "-उन लगाउनु" प्रयोग गर्छौँ (जस्तै: "मैले धारा मर्मत गराएँ" वा "मैले कपाल काटेँ")। अङ्ग्रेजीमा यदि तपाईंले "I cut my hair" भन्नुभयो भने त्यसको अर्थ "मैले आफैँले कैँची लिएर आफ्नै कपाल काटेँ" भन्ने बुझिन्छ!\nव्यावसायिक व्यक्ति (प्लम्बर, नाइ, मिस्त्री) बाट सेवा लिएर काम गराउँदा अङ्ग्रेजीमा Causative Structure प्रयोग गरिन्छ:\n• सुत्र: Subject + have / get (tense अनुसार) + Object (काम हुने वस्तु) + Past Participle (V3).\nउदाहरण: "We had the leaking pipe repaired by a plumber."',
      keyTakeawaysNepali: [
        'अरूबाट सेवा लिएर काम गराउँदा: Have / Get + Object + V3 (उदा: I had my hair cut / We got the roof fixed)।',
        'यदि कोबाट काम गराउने हो भन्ने व्यक्ति तोकिएको छ भने: Have + Person + V1 (उदा: We had the plumber fix the pipe)।',
        'आफैँले काम नगरी प्राविधिकबाट गराउँदा साधारण क्रिया (I repaired my car) को सट्टा "I had my car repaired" भन्नु प्राकृतिक अङ्ग्रेजी हो।',
      ],
      syntaxComparisons: [
        {
          id: 'l7-syn-1',
          structureType: 'Causative Service (Have + Object + V3)',
          englishSentence: 'We had the leaking pipe fixed by a plumber.',
          nepaliSentence: 'हामीले प्लम्बरद्वारा चुहिरहेको पाइप मर्मत गरायौँ।',
          comparisonNoteNepali:
            'अङ्ग्रेजीमा "had" पछि पहिले वस्तु ("the leaking pipe") आउँछ र त्यसपछि V3 ("fixed") आउँछ।',
          tokens: [
            {
              role: 'Subject',
              englishText: 'We',
              nepaliText: 'हामीले',
              nepaliRoleLabel: 'कर्ता',
            },
            {
              role: 'Verb',
              englishText: 'had ... fixed',
              nepaliText: 'मर्मत गरायौँ',
              nepaliRoleLabel: 'प्रेरणार्थक क्रिया (had + V3)',
            },
            {
              role: 'Object',
              englishText: 'the leaking pipe',
              nepaliText: 'चुहिरहेको पाइप',
              nepaliRoleLabel: 'कर्म (Object बीचमा)',
            },
            {
              role: 'Modifier',
              englishText: 'by a plumber.',
              nepaliText: 'प्लम्बरद्वारा।',
              nepaliRoleLabel: 'माध्यम',
            },
          ],
        },
        {
          id: 'l7-syn-2',
          structureType: 'Causative with Person (Have + Person + Base Verb V1)',
          englishSentence: 'The guard made the visitors fasten their seatbelts.',
          nepaliSentence: 'पालेले आगन्तुकहरूलाई सिटबेल्ट बाँध्न लगाए।',
          comparisonNoteNepali:
            '"Make / Have + Person" पछि "to" नराखी सिधै मूल क्रिया V1 ("fasten") प्रयोग गरिन्छ।',
          tokens: [
            {
              role: 'Subject',
              englishText: 'The guard',
              nepaliText: 'पालेले',
              nepaliRoleLabel: 'कर्ता',
            },
            {
              role: 'Verb',
              englishText: 'made ... fasten',
              nepaliText: 'बाँध्न लगाए',
              nepaliRoleLabel: 'प्रेरणार्थक क्रिया',
            },
            {
              role: 'Object',
              englishText: 'the visitors / their seatbelts',
              nepaliText: 'आगन्तुकहरूलाई आफ्नो सिटबेल्ट',
              nepaliRoleLabel: 'कर्म',
            },
          ],
        },
      ],
      capstoneExercises: [
        {
          id: 'l7-cap-1',
          questionPrompt:
            'You hired technicians to repair the old castle roof. How do you express this naturally using the causative structure?',
          nepaliContext: 'अरू प्राविधिकबाट छानो मर्मत गराएको भाव व्यक्त गर्न सही वाक्य छान्नुहोस्:',
          options: [
            'We had the old castle roof repaired last week.',
            'We had repaired the old castle roof last week.',
            'We had the old castle roof repair last week.',
            'We got repair the old castle roof last week.',
          ],
          correctAnswer: 'We had the old castle roof repaired last week.',
          explanationNepali:
            'Causative सुत्र अनुसार "had + Object (the old castle roof) + V3 (repaired)" प्रयोग हुन्छ।',
        },
        {
          id: 'l7-cap-2',
          questionPrompt:
            'Complete the sentence: "The homeowner had the plumber ______ all the broken pipes in the kitchen."',
          nepaliContext: '"Have + Person (the plumber)" पछि कुन रूपको क्रिया आउँछ?',
          options: [
            'replace',
            'to replace',
            'replaced',
            'replacing',
          ],
          correctAnswer: 'replace',
          explanationNepali:
            'जब "had" पछि काम गर्ने व्यक्ति ("the plumber") आउँछ, त्यसपछि सिधै मूल क्रिया V1 ("replace") आउँछ।',
        },
        {
          id: 'l7-cap-3',
          questionPrompt:
            'Select the sentence that is 100% accurate in both spelling and causative grammar:',
          nepaliContext: 'बहुवचन नियम (shelves, knives) र causative व्याकरण जाँच्नुहोस्:',
          options: [
            'She had new wooden shelves installed to store the kitchen knives safely.',
            'She had new wooden shelfs installed to store the kitchen knifes safely.',
            'She had installed new wooden shelves to store the kitchen knives safely.',
            'She had new wooden shelves install to store the kitchen knives safely.',
          ],
          correctAnswer: 'She had new wooden shelves installed to store the kitchen knives safely.',
          explanationNepali:
            'यसमा "shelves" र "knives" को बहुवचन हिज्जे तथा "had + new wooden shelves + installed (V3)" पूर्ण रूपमा सही छ।',
        },
      ],
    },
  },

  // =========================================================================
  // LECTURE 8 (B1): HOSPITALITY LOANWORDS, "-CE" VS "-SE" & QUANTIFIERS
  // =========================================================================
  {
    id: 'lecture-8-culinary-loanwords-quantifiers',
    lectureNumber: 8,
    level: 'B1',
    title: 'Culinary & Hospitality Words, "-CE" vs. "-SE" & Quantifiers',
    nepaliTitle: 'खानपान र आतिथ्यका शब्दहरू, "-CE/-SE" हिज्जे र अनगिन्ती नाम (Uncountable Nouns)',
    subtitle:
      'Pronounce French culinary loanwords with silent letters, separate "-ce" nouns from "-se" verbs, and master uncountable nouns in English.',
    category: 'Food & Hospitality',
    estimatedMinutes: 15,
    moduleA_vocabulary: [
      {
        id: 'l8-v1',
        word: 'Salmon',
        ipa: '/ˈsæm.ən/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'Sa', silent: false },
          { text: 'l', silent: true },
          { text: 'mon', silent: false },
        ],
        silentLettersSummary: 'Silent "l" before "m"',
        nepaliMeaning: 'साल्मन माछा (रातो मासु हुने प्रसिद्ध समुद्री माछा)',
        nepaliTransliteration: 'Sāman māchhā',
        englishExample: 'The chef served grilled salmon with fresh lemon and herbs.',
        nepaliExampleTranslation: 'भान्छेले ताजा कागती र जडीबुटीसँग ग्रिल गरिएको साल्मन माछा पस्किए।',
        usageTipNepali:
          'नेपालीमा धेरैले यसलाई "साल्मन" भन्छन्, तर अङ्ग्रेजीमा बीचको "l" पूर्ण रूपमा मौन हुन्छ र "स्यामन्" (/ˈsæm.ən/) भनिन्छ।',
      },
      {
        id: 'l8-v2',
        word: 'Almond',
        ipa: '/ˈɑː.mənd/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'A', silent: false },
          { text: 'l', silent: true },
          { text: 'mond', silent: false },
        ],
        silentLettersSummary: 'Silent "l" before "m"',
        nepaliMeaning: 'कागजी बदाम',
        nepaliTransliteration: 'Kāgajī badām',
        englishExample: 'She adds sliced almond and honey to her morning oatmeal.',
        nepaliExampleTranslation: 'उनी आफ्नो बिहानको ओटमिलमा काटिएको बदाम र मह मिसाउँछिन्।',
        usageTipNepali:
          '"Calm" र "Palm" जस्तै "Almond" मा पनि "l" मौन हुन्छ—यसलाई "आ-मन्ड" (/ˈɑː.mənd/) उच्चारण गरिन्छ।',
      },
      {
        id: 'l8-v3',
        word: 'Buffet',
        ipa: '/ˈbʊf.eɪ/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'Buffe', silent: false },
          { text: 't', silent: true },
        ],
        silentLettersSummary: 'Silent final French "t" ("e" sounds like /eɪ/)',
        nepaliMeaning: 'बफे भोज (आफैँ रोजेर पस्केर खाने भोज)',
        nepaliTransliteration: 'Bafe bhoj',
        englishExample: 'The hotel includes a complimentary breakfast buffet for all guests.',
        nepaliExampleTranslation: 'होटेलले सबै पाहुनाहरूका लागि निःशुल्क बिहानको बफे खाजा समावेश गरेको छ।',
        usageTipNepali:
          'फ्रेन्च मूलको शब्द भएकोले अन्तिम "t" मौन रहन्छ र "-et" को उच्चारण "ए" (/eɪ/) हुन्छ: "बु-फे"।',
      },
      {
        id: 'l8-v4',
        word: 'Gourmet',
        ipa: '/ˈɡɔː.meɪ/',
        partOfSpeech: 'adjective / noun',
        segments: [
          { text: 'Gourme', silent: false },
          { text: 't', silent: true },
        ],
        silentLettersSummary: 'Silent final French "t"',
        nepaliMeaning: 'उच्च स्तरीय र स्वादिष्ट परिकार / पारखी',
        nepaliTransliteration: 'Uchcha starīya parikār / Pārakhī',
        englishExample: 'They opened a gourmet coffee shop in the heart of Patan.',
        nepaliExampleTranslation: 'उनीहरूले पाटनको मुटुमा उच्च स्तरीय कफी पसल खोले।',
        usageTipNepali:
          '"Buffet" र "Ballet" जस्तै "Gourmet" मा पनि अन्तिम "t" उच्चारण हुँदैन ("गोर-मे")।',
      },
      {
        id: 'l8-v5',
        word: 'Biscuit',
        ipa: '/ˈbɪs.kɪt/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'Bisc', silent: false },
          { text: 'u', silent: true },
          { text: 'it', silent: false },
        ],
        silentLettersSummary: 'Silent "u" after "c"',
        nepaliMeaning: 'बिस्कुट',
        nepaliTransliteration: 'Biskuṭ',
        englishExample: 'Would you like a wholegrain biscuit with your afternoon tea?',
        nepaliExampleTranslation: 'के तपाईं दिउँसोको चियासँग गहुँको बिस्कुट खान चाहनुहुन्छ?',
        usageTipNepali:
          'नेपालीमा "बिस्कुट" भनिए तापनि अङ्ग्रेजीमा "u" मौन हुन्छ र "बिस्-किट्" (/ˈbɪs.kɪt/) उच्चारण गरिन्छ ("बिस्-कुट" होइन)।',
      },
    ],
    moduleB_pronunciation: [
      {
        id: 'l8-p1',
        wordId: 'l8-v1',
        word: 'Salmon',
        ipa: '/ˈsæm.ən/',
        syllables: ['sal', 'mon'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'SAM-uhn',
        nepaliPhoneticHint: 'स्याम्-अन्',
        ruleTitle: 'Silent "L" in "-alm-" Words',
        ruleExplanationNepali:
          '"Salmon" मा बीचको "l" पूर्ण रूपमा छोडेर पहिलो अक्षरलाई छोटो "स्याम" (/sæm/) र दोस्रोलाई हल्का "अन्" भन्नुहोस्।',
        commonMispronunciation: 'Sal-mon (pronouncing the L)',
      },
      {
        id: 'l8-p2',
        wordId: 'l8-v2',
        word: 'Almond',
        ipa: '/ˈɑː.mənd/',
        syllables: ['al', 'mond'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'AA-muhnd',
        nepaliPhoneticHint: 'आ-मन्ड',
        ruleTitle: 'Long "A" (/ɑː/) Before Silent "L"',
        ruleExplanationNepali:
          '"Almond" मा "l" मौन हुँदा सुरुको "A" लामो "आ" (/ɑː/) ध्वनिमा परिणत हुन्छ: "आ-मन्ड"।',
        commonMispronunciation: 'Al-mond (saying L clearly)',
      },
      {
        id: 'l8-p3',
        wordId: 'l8-v3',
        word: 'Buffet',
        ipa: '/ˈbʊf.eɪ/',
        syllables: ['buf', 'fet'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'BOO-fay',
        nepaliPhoneticHint: 'बु-फे',
        ruleTitle: 'French Loanword "-et" Ending (/eɪ/)',
        ruleExplanationNepali:
          'फ्रेन्च भाषाबाट आएका खानपान र कलाका शब्दहरू (buffet, gourmet, ballet, chalet, bouquet) मा अन्तिम "-et" लाई "ए" (/eɪ/) भनिन्छ र "t" मौन हुन्छ।',
        commonMispronunciation: 'Buf-fet (rhyming with "get")',
      },
      {
        id: 'l8-p4',
        wordId: 'l8-v4',
        word: 'Gourmet',
        ipa: '/ˈɡɔː.meɪ/',
        syllables: ['gour', 'met'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'GOR-may',
        nepaliPhoneticHint: 'गोर-मे',
        ruleTitle: 'Silent Final "T" in Culinary Terms',
        ruleExplanationNepali:
          'पहिलो खण्ड "gour-" लाई "गोर" र दोस्रो खण्ड "-met" लाई "मे" उच्चारण गर्नुहोस्।',
        commonMispronunciation: 'Gour-met (pronouncing final T)',
      },
      {
        id: 'l8-p5',
        wordId: 'l8-v5',
        word: 'Biscuit',
        ipa: '/ˈbɪs.kɪt/',
        syllables: ['bis', 'cuit'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'BIS-kit',
        nepaliPhoneticHint: 'बिस्-किट्',
        ruleTitle: 'Silent "U" in "-cuit" & "-guit" (Biscuit, Circuit, Guitar)',
        ruleExplanationNepali:
          '"Biscuit" र "Circuit" मा रहेको "u" मौन हुन्छ र "-cuit" खण्डको आवाज केवल "किट्" (/kɪt/) हुन्छ।',
        commonMispronunciation: 'Bis-koot',
      },
    ],
    moduleC_spelling: {
      ruleTitle: 'Noun "-CE" vs. Verb "-SE" Pairs (Advice/Advise, Practice/Practise)',
      nepaliRuleTitle: 'नाममा "-CE" र क्रियामा "-SE" हुने जोडी शब्दहरूको नियम',
      formula:
        'Noun = -CE (/s/ sound: advice, practice, device, license) | Verb = -SE (/z/ or /s/ sound: advise, practise, devise, license)',
      nepaliExplanation:
        'अङ्ग्रेजीमा धेरै शब्द जोडीहरूमा एउटै अक्षर ("c" वा "s") ले नाम (Noun) र क्रिया (Verb) छुट्याउँछ:\n१. **"C" = Noun (नाम — Ice र Rice जस्तै "C" सम्झनुहोस्):**\n• Advice (सल्लाह — नाम, उच्चारण: /ədˈvaɪs/)\n• Device (यन्त्र/उपकरण — नाम, उच्चारण: /dɪˈvaɪs/)\n• Practice (अभ्यास — नाम)\n२. **"S" = Verb (क्रिया — काम गर्नु):**\n• Advise (सल्लाह दिनु — क्रिया, उच्चारण: /ədˈvaɪz/)\n• Devise (योजना वा उपाय रच्नु — क्रिया, उच्चारण: /dɪˈvaɪz/)\n• Practise (अभ्यास गर्नु — ब्रिटिश र औपचारिक अङ्ग्रेजीमा क्रिया)',
      examples: [
        {
          baseWord: 'Meaning: helpful suggestion (Noun)',
          transformation: 'use -ce for the noun',
          resultWord: 'valuable advice',
          wrongSpelling: 'valuable advise',
        },
        {
          baseWord: 'Meaning: to recommend / guide (Verb)',
          transformation: 'use -se for the verb',
          resultWord: 'doctors advise patients',
          wrongSpelling: 'doctors advice patients',
        },
        {
          baseWord: 'Meaning: a piece of equipment (Noun)',
          transformation: 'use -ce for the noun',
          resultWord: 'electronic device',
          wrongSpelling: 'electronic devise',
        },
        {
          baseWord: 'Meaning: to invent a plan (Verb)',
          transformation: 'use -se for the verb',
          resultWord: 'devise a new strategy',
          wrongSpelling: 'device a new strategy',
        },
      ],
      exceptions: [
        'Promise → नाम र क्रिया दुवैमा एउटै हिज्जे "promise" (-se) हुन्छ।',
        'Surprise → नाम र क्रिया दुवैमा "surprise" (-se) हुन्छ।',
        'Exercise → नाम र क्रिया दुवैमा "exercise" (-se) हुन्छ ("exer-cise")।',
      ],
      quizzes: [
        {
          id: 'l8-q1',
          type: 'multiple-choice',
          prompt: 'Choose the correct pair: "My mentor gave me great ______ and ______ me to apply early."',
          nepaliHint: 'पहिलो खाली ठाउँमा नाम (Noun: -ce) र दोस्रोमा क्रिया (Verb: -sed) चाहिन्छ:',
          options: [
            'advice / advised',
            'advise / adviced',
            'advice / adviced',
            'advise / advised',
          ],
          correctAnswer: 'advice / advised',
          explanationNepali:
            '"Great" पछि नाम "advice" (-ce) र कर्ताको काम बुझाउन क्रिया "advised" (-sed) प्रयोग हुन्छ।',
        },
        {
          id: 'l8-q2',
          type: 'fill-blank',
          prompt: 'Our team needs to ____ (devise/device) a smart ____ (devise/device) to monitor kitchen temperature.',
          nepaliHint: '"to" पछि क्रिया (-se) र "a smart" पछि नाम (-ce) राख्नुहोस्:',
          options: [
            'devise / device',
            'device / devise',
            'devise / devise',
            'device / device',
          ],
          correctAnswer: 'devise / device',
          explanationNepali:
            '"To devise" (उपाय रच्नु) क्रिया हो भने "a smart device" (यन्त्र) नाम हो।',
        },
        {
          id: 'l8-q3',
          type: 'multiple-choice',
          prompt: 'Which culinary sentence is spelled with 100% accuracy?',
          nepaliHint: 'Biscuit, salmon, almond र buffet को हिज्जे जाँच्नुहोस्:',
          options: [
            'The buffet featured grilled salmon, roasted almond cake, and tea biscuits.',
            'The buffay featured grilled samon, roasted almond cake, and tea biskits.',
            'The buffet featured grilled salmon, roasted amond cake, and tea biscuts.',
            'The buffee featured grilled salmon, roasted almond cake, and tea biscuits.',
          ],
          correctAnswer: 'The buffet featured grilled salmon, roasted almond cake, and tea biscuits.',
          explanationNepali:
            '"Buffet" (मौन t), "salmon" (मौन l), "almond" (मौन l), र "biscuits" (मौन u) सबैको हिज्जे सही छ।',
        },
        {
          id: 'l8-q4',
          type: 'fill-blank',
          prompt: 'The nutritionist ____ (advise) us to eat ____ (gourmet) meals in moderation.',
          nepaliHint: 'Past tense क्रिया (-sed) र मौन "t" भएको विशेषण छान्नुहोस्:',
          options: [
            'advised / gourmet',
            'adviced / gourmay',
            'advised / gormet',
            'adviced / gourmet',
          ],
          correctAnswer: 'advised / gourmet',
          explanationNepali:
            'क्रियामा "advised" (-sed) र विशेषणमा फ्रेन्च मूलको "gourmet" लेखिन्छ।',
        },
      ],
    },
    moduleD_grammar: {
      topicTitle: 'Uncountable Nouns & Quantifiers (Information, Advice, Furniture, Equipment)',
      nepaliTopicTitle: 'अनगिन्ती नामहरू (Uncountable Nouns) र मात्रा बुझाउने शब्दहरूको नियम',
      explanationNepali:
        'नेपालीमा हामी सजिलै "धेरै सल्लाहहरू (advices)", "फर्निचरहरू (furnitures)", वा "एउटा जानकारी (an information)" भन्छौँ। तर अङ्ग्रेजीमा केही महत्त्वपूर्ण नामहरू **Uncountable (गन्न नमिल्ने)** मानिन्छन्:\n• मुख्य Uncountable शब्दहरू: **advice, information, furniture, equipment, luggage, bread, research, knowledge, salmon (मासुको रूपमा)**।\nयी शब्दहरूमा कहिल्यै **"a/an"** लाग्दैन र कहिल्यै पछाडि **"-s"** थपेर बहुवचन बनाइँदैन!\n• यदि "एउटा सल्लाह" भन्नु पर्यो भने **"a piece of advice"** भन्नुपर्छ, र मात्रा बुझाउन **"much / a lot of / some"** प्रयोग गरिन्छ ("many" होइन)।',
      keyTakeawaysNepali: [
        'Advice, information, furniture, equipment र luggage को पछाडि कहिल्यै "-s" नथप्नुहोस् र अगाडि "a/an" नराख्नुहोस्।',
        'एउटा एकाइ बुझाउन "a piece of advice", "a piece of furniture", वा "an item of luggage" प्रयोग गर्नुहोस्।',
        'गन्न मिल्ने बहुवचन नामसँग "many / few" र गन्न नमिल्ने नामसँग "much / little / a lot of" प्रयोग गर्नुहोस्।',
      ],
      syntaxComparisons: [
        {
          id: 'l8-syn-1',
          structureType: 'Uncountable Noun (No "a/an", No "-s", Singular Verb)',
          englishSentence: 'The chef gave me a useful piece of advice about cooking salmon.',
          nepaliSentence: 'भान्छेले मलाई साल्मन पकाउने बारेमा एउटा उपयोगी सल्लाह दिए।',
          comparisonNoteNepali:
            'नेपालीमा "एउटा सल्लाह" भनिए पनि अङ्ग्रेजीमा "an advice" भन्न मिल्दैन—"a piece of advice" भन्नुपर्छ।',
          tokens: [
            {
              role: 'Subject',
              englishText: 'The chef',
              nepaliText: 'भान्छेले',
              nepaliRoleLabel: 'कर्ता',
            },
            {
              role: 'Verb',
              englishText: 'gave',
              nepaliText: 'दिए',
              nepaliRoleLabel: 'क्रिया',
            },
            {
              role: 'Object',
              englishText: 'me / a useful piece of advice',
              nepaliText: 'मलाई एउटा उपयोगी सल्लाह',
              nepaliRoleLabel: 'कर्म (a piece of + uncountable)',
            },
            {
              role: 'Modifier',
              englishText: 'about cooking salmon.',
              nepaliText: 'साल्मन पकाउने बारेमा।',
              nepaliRoleLabel: 'विवरण',
            },
          ],
        },
        {
          id: 'l8-syn-2',
          structureType: 'Singular Verb Agreement with Uncountable Nouns',
          englishSentence: 'All the kitchen equipment in this gourmet restaurant is modern.',
          nepaliSentence: 'यस उच्च स्तरीय रेस्टुरेन्टका सबै भान्साका उपकरणहरू आधुनिक छन्।',
          comparisonNoteNepali:
            'नेपालीमा "उपकरणहरू आधुनिक छन्" (बहुवचन) भनिन्छ, तर अङ्ग्रेजीमा "equipment" सधैँ एकवचन हुने भएकाले "is" लाग्छ।',
          tokens: [
            {
              role: 'Subject',
              englishText: 'All the kitchen equipment in this gourmet restaurant',
              nepaliText: 'यस उच्च स्तरीय रेस्टुरेन्टका सबै भान्साका उपकरणहरू',
              nepaliRoleLabel: 'एकवचन कर्ता (Uncountable)',
            },
            {
              role: 'Verb',
              englishText: 'is',
              nepaliText: 'छन् (एकवचन क्रिया)',
              nepaliRoleLabel: 'क्रिया (Singular)',
            },
            {
              role: 'Object',
              englishText: 'modern.',
              nepaliText: 'आधुनिक।',
              nepaliRoleLabel: 'पूरक विशेषण',
            },
          ],
        },
      ],
      capstoneExercises: [
        {
          id: 'l8-cap-1',
          questionPrompt:
            'Spot the common error and choose the grammatically correct sentence:',
          nepaliContext: '"Advice" र "information" गन्न नमिल्ने (Uncountable) नाम हुन् भन्ने नियम सम्झनुहोस्:',
          options: [
            'She gave me some valuable advice and two pieces of information.',
            'She gave me some valuable advices and two informations.',
            'She gave me a valuable advice and two informations.',
            'She gave me many valuable advices about the buffet.',
          ],
          correctAnswer: 'She gave me some valuable advice and two pieces of information.',
          explanationNepali:
            '"Advice" र "information" मा कहिल्यै "-s" वा "a" लाग्दैन; संख्या तोक्दा "two pieces of information" प्रयोग गरिन्छ।',
        },
        {
          id: 'l8-cap-2',
          questionPrompt:
            'Complete the sentence: "How ______ luggage did you bring, and how ______ biscuits are left in the tin?"',
          nepaliContext: 'Uncountable नाम (luggage) सँग "much" र Countable नाम (biscuits) सँग "many" प्रयोग गर्नुहोस्:',
          options: [
            'much / many',
            'many / much',
            'many / many',
            'much / much',
          ],
          correctAnswer: 'much / many',
          explanationNepali:
            '"Luggage" गन्न नमिल्ने नाम भएकोले "how much luggage" र "biscuits" गन्न मिल्ने बहुवचन नाम भएकोले "how many biscuits" हुन्छ।',
        },
        {
          id: 'l8-cap-3',
          questionPrompt:
            'Which sentence uses "-ce/-se" spelling and uncountable noun grammar accurately?',
          nepaliContext: 'क्रिया "advise" (-se), नाम "equipment" र एकवचन क्रिया जाँच्नुहोस्:',
          options: [
            'I advise you to check whether the new bakery equipment is ready.',
            'I advice you to check whether the new bakery equipments are ready.',
            'I advise you to check whether the new bakery equipments are ready.',
            'I advice you to check whether the new bakery equipment is ready.',
          ],
          correctAnswer: 'I advise you to check whether the new bakery equipment is ready.',
          explanationNepali:
            'कर्ता "I" पछि क्रिया "advise" (-se) आउँछ र "equipment" एकवचन अनगिन्ती नाम भएकोले "equipment is" प्रयोग हुन्छ।',
        },
      ],
    },
  },

  // =========================================================================
  // LECTURE 9 (B2): BUSINESS SILENT LETTERS, "-CEED/-SEDE/-CEDE" & PASSIVE
  // =========================================================================
  {
    id: 'lecture-9-business-silent-passive',
    lectureNumber: 9,
    level: 'B2',
    title: 'Silent Letters in Commerce, "-CEED / -CEDE" & Passive Voice',
    nepaliTitle: 'व्यावसायिक मौन अक्षरहरू, "-CEED/-CEDE" हिज्जे र कर्मवाच्य (Passive Voice)',
    subtitle:
      'Master silent letters in legal and commercial English, conquer the "-ceed/-sede/-cede" family, and write formal reports using Passive Voice.',
    category: 'Business & Law',
    estimatedMinutes: 16,
    moduleA_vocabulary: [
      {
        id: 'l9-v1',
        word: 'Debt',
        ipa: '/det/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'De', silent: false },
          { text: 'b', silent: true },
          { text: 't', silent: false },
        ],
        silentLettersSummary: 'Silent "b" before "t"',
        nepaliMeaning: 'ऋण / कर्जा',
        nepaliTransliteration: 'Ṛṇ / Karjā',
        englishExample: 'The company paid off its entire bank debt within three years.',
        nepaliExampleTranslation: 'कम्पनीले तीन वर्षभित्र आफ्नो सम्पूर्ण बैंक ऋण चुक्ता गर्यो।',
        usageTipNepali:
          '"Doubt" जस्तै "Debt" मा पनि बीचको "b" ल्याटिन मूल देखाउन मात्र राखिएको हो—उच्चारण सिधै "डेट्" (/det/) हुन्छ।',
      },
      {
        id: 'l9-v2',
        word: 'Subpoena',
        ipa: '/səˈpiː.nə/',
        partOfSpeech: 'noun / verb',
        segments: [
          { text: 'Su', silent: false },
          { text: 'b', silent: true },
          { text: 'p', silent: false },
          { text: 'o', silent: true },
          { text: 'ena', silent: false },
        ],
        silentLettersSummary: 'Silent "b" and silent "o" ("oe" = /iː/)',
        nepaliMeaning: 'अदालतमा उपस्थित हुने म्याद / समाह्वान पत्र',
        nepaliTransliteration: 'Adālatmā upasthit hune myād',
        englishExample: 'The witness received a court subpoena to testify on Monday.',
        nepaliExampleTranslation: 'साक्षीले सोमबार बयान दिन अदालतको उपस्थित हुने म्याद पाए।',
        usageTipNepali:
          'कानुनी अङ्ग्रेजीको यो महत्त्वपूर्ण शब्दमा "b" र "o" मौन हुन्छन्—यसलाई "स-पी-ना" (/səˈpiː.nə/) उच्चारण गरिन्छ।',
      },
      {
        id: 'l9-v3',
        word: 'Campaign',
        ipa: '/kæmˈpeɪn/',
        partOfSpeech: 'noun / verb',
        segments: [
          { text: 'Campai', silent: false },
          { text: 'g', silent: true },
          { text: 'n', silent: false },
        ],
        silentLettersSummary: 'Silent "g" before final "n"',
        nepaliMeaning: 'अभियान (प्रचार वा सामाजिक अभियान)',
        nepaliTransliteration: 'Abhiyān',
        englishExample: 'The tourism board launched a global campaign to promote winter trekking.',
        nepaliExampleTranslation: 'पर्यटन बोर्डले हिउँदे पदयात्रा प्रवर्द्धन गर्न विश्वव्यापी अभियान सुरु गर्यो।',
        usageTipNepali:
          '"Foreign" र "Design" जस्तै "Campaign" को अन्त्यमा रहेको "-gn" मा "g" मौन हुन्छ ("क्याम्-पेन")।',
      },
      {
        id: 'l9-v4',
        word: 'Resign',
        ipa: '/rɪˈzaɪn/',
        partOfSpeech: 'verb',
        segments: [
          { text: 'Resi', silent: false },
          { text: 'g', silent: true },
          { text: 'n', silent: false },
        ],
        silentLettersSummary: 'Silent "g" before "n" ("s" sounds like /z/)',
        nepaliMeaning: 'राजीनामा दिनु',
        nepaliTransliteration: 'Rājīnāmā dinu',
        englishExample: 'The director decided to resign after ten years of service.',
        nepaliExampleTranslation: 'दश वर्षको सेवापछि निर्देशकले राजीनामा दिने निर्णय गरे।',
        usageTipNepali:
          'यसमा "g" मौन हुन्छ (रि-जाइन), तर जब यसबाट नाम "Resignation" (/ˌrez.ɪɡˈneɪ.ʃən/) बन्छ, तब "g" फेरि उच्चारण हुन्छ!',
      },
      {
        id: 'l9-v5',
        word: 'Scissors',
        ipa: '/ˈsɪz.əz/',
        partOfSpeech: 'noun (plural)',
        segments: [
          { text: 'S', silent: false },
          { text: 'c', silent: true },
          { text: 'issors', silent: false },
        ],
        silentLettersSummary: 'Silent "c" after initial "s"',
        nepaliMeaning: 'कैँची',
        nepaliTransliteration: 'Kaĩchī',
        englishExample: 'These sharp scissors are used for cutting heavy fabric.',
        nepaliExampleTranslation: 'यो धारिलो कैँची बाक्लो कपडा काट्न प्रयोग गरिन्छ।',
        usageTipNepali:
          '"Science" जस्तै "Scissors" मा पनि सुरुको "sc" मा "c" मौन हुन्छ र बीचको "ss" को आवाज /z/ ("सि-जर्स") आउँछ।',
      },
    ],
    moduleB_pronunciation: [
      {
        id: 'l9-p1',
        wordId: 'l9-v1',
        word: 'Debt',
        ipa: '/det/',
        syllables: ['debt'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'DET',
        nepaliPhoneticHint: 'डेट्',
        ruleTitle: 'Silent "B" in "-bt" Words (Debt, Debtor, Doubt)',
        ruleExplanationNepali:
          '"Debt" र "Debtor" दुवैमा "b" उच्चारण हुँदैन। यो शब्द "Bet" वा "Set" सँग पूर्ण रूपमा तुकबन्दी (rhyme) मिल्छ।',
        commonMispronunciation: 'Deb-t',
      },
      {
        id: 'l9-p2',
        wordId: 'l9-v2',
        word: 'Subpoena',
        ipa: '/səˈpiː.nə/',
        syllables: ['sub', 'poe', 'na'],
        stressedSyllableIndex: 1,
        simplifiedPhonetic: 'suh-PEE-nuh',
        nepaliPhoneticHint: 'स-पी-ना',
        ruleTitle: 'Latin Legal Cluster ("sub-" with Silent B + "oe" as /iː/)',
        ruleExplanationNepali:
          'दोस्रो अक्षर "PEE" मा मुख्य जोड दिनुहोस् र सुरुको "b" लाई पूर्ण रूपमा छोड्नुहोस्।',
        commonMispronunciation: 'Sub-poy-na',
      },
      {
        id: 'l9-p3',
        wordId: 'l9-v3',
        word: 'Campaign',
        ipa: '/kæmˈpeɪn/',
        syllables: ['cam', 'paign'],
        stressedSyllableIndex: 1,
        simplifiedPhonetic: 'kam-PAYN',
        nepaliPhoneticHint: 'क्याम्-पेन्',
        ruleTitle: 'Silent "G" in "-aign" Endings (Campaign, Champagne)',
        ruleExplanationNepali:
          '"-aign" को उच्चारण लामो "एन" (/eɪn/) हुन्छ ("Pain" र "Rain" जस्तै)। दोस्रो खण्डमा जोड दिनुहोस्।',
        commonMispronunciation: 'Cam-paig-n',
      },
      {
        id: 'l9-p4',
        wordId: 'l9-v4',
        word: 'Resign',
        ipa: '/rɪˈzaɪn/',
        syllables: ['re', 'sign'],
        stressedSyllableIndex: 1,
        simplifiedPhonetic: 'ri-ZAIN',
        nepaliPhoneticHint: 'रि-जाइन्',
        ruleTitle: 'Voiced "S" (/z/) + Silent "G" in "Resign" vs. "Resignation"',
        ruleExplanationNepali:
          'दुई स्वर वर्णको बीचमा आएको "s" ले /z/ आवाज दिन्छ र अन्तिम "g" मौन रहन्छ ("रि-जाइन")।',
        commonMispronunciation: 'Re-sign (with /s/ like "sign")',
      },
      {
        id: 'l9-p5',
        wordId: 'l9-v5',
        word: 'Scissors',
        ipa: '/ˈsɪz.əz/',
        syllables: ['scis', 'sors'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'SIZ-uhz',
        nepaliPhoneticHint: 'सि-जर्ज',
        ruleTitle: 'Initial "SC-" (/s/) + Medial "-SS-" (/z/)',
        ruleExplanationNepali:
          'सुरुको "sc" बाट /s/ आवाज निस्कन्छ तर बीचको डबल "ss" बाट /z/ आवाज निस्कन्छ: "सि-जर्ज"।',
        commonMispronunciation: 'Skis-sors',
      },
    ],
    moduleC_spelling: {
      ruleTitle: 'The "-SEDE / -CEED / -CEDE" Spelling Rule (Supersede, Proceed, Precede)',
      nepaliRuleTitle: 'उस्तै सुनिने "-SEDE", "-CEED" र "-CEDE" शब्दहरूको अचुक हिज्जे नियम',
      formula:
        'ONLY 1 word ends in -SEDE (supersede) | ONLY 3 words end in -CEED (proceed, exceed, succeed) | ALL OTHERS end in -CEDE (precede, concede, recede)',
      nepaliExplanation:
        'अङ्ग्रेजीमा अन्त्यमा "/siːd/" (सीड) आवाज आउने क्रियाहरू लेख्दा विद्यार्थीहरू "-ceed" र "-cede" मा निकै झुक्किन्छन्। यो ३-बुँदे सुत्र याद राख्नुहोस्:\n१. **"-SEDE" बाट टुङ्गिने अङ्ग्रेजीको एक मात्र शब्द:** **Supersede** (पुरानोको ठाउँ लिनु/विस्थापित गर्नु)।\n२. **"-CEED" बाट टुङ्गिने केवल ३ वटा शब्दहरू:** **Proceed** (अगाडि बढ्नु), **Exceed** (सीमा नाघ्नु), र **Succeed** (सफल हुनु)। (주의: Proceed बाट नाम बन्दा "u" हटेर **Procedure** बन्छ!)।\n३. **बाँकी सबै शब्दहरू "-CEDE" बाट टुङ्गिन्छन्:** **Precede** (अगाडि आउनु), **Concede** (हार वा गल्ती स्वीकार्नु), **Recede** (पछाडि हट्नु), **Intercede**।',
      examples: [
        {
          baseWord: 'Unique "-sede" word (replace/take the place of)',
          transformation: 'spelled with -sede',
          resultWord: 'supersede',
          wrongSpelling: 'supercede',
        },
        {
          baseWord: 'The 3 "-ceed" words (move forward / surpass / achieve)',
          transformation: 'spelled with -ceed',
          resultWord: 'proceed / exceed / succeed',
          wrongSpelling: 'procede / excede / succede',
        },
        {
          baseWord: 'Standard "-cede" family (come before / admit)',
          transformation: 'spelled with -cede',
          resultWord: 'precede / concede',
          wrongSpelling: 'preceed / conceed',
        },
        {
          baseWord: 'proceed (verb) + -ure (noun suffix)',
          transformation: 'double "ee" changes to single "e"',
          resultWord: 'procedure',
          wrongSpelling: 'proceedure',
        },
      ],
      exceptions: [
        'Procedure → क्रिया "proceed" मा डबल "ee" हुन्छ, तर नाम "procedure" र विशेषण "procedural" मा एउटै "e" मात्र हुन्छ!',
        'Succeed → नाम बन्दा "success" (-cess) हुन्छ।',
        'Exceed → नाम बन्दा "excess" (-cess) हुन्छ।',
      ],
      quizzes: [
        {
          id: 'l9-q1',
          type: 'multiple-choice',
          prompt: 'Which is the ONLY word in the English language that ends in "-sede"?',
          nepaliHint: 'पुरानो नियमलाई विस्थापित गर्नु अर्थ लाग्ने "-sede" शब्द छान्नुहोस्:',
          options: [
            'supersede',
            'supercede',
            'precede',
            'intercede',
          ],
          correctAnswer: 'supersede',
          explanationNepali:
            'अङ्ग्रेजी भाषामा "-sede" बाट टुङ्गिने एक मात्र शब्द "supersede" हो ("supercede" गलत हिज्जे हो)।',
        },
        {
          id: 'l9-q2',
          type: 'fill-blank',
          prompt: 'Before we ____ (proceed) with the campaign, we must review the safety ____ (procedure).',
          nepaliHint: 'क्रियामा डबल "ee" र नाम (-ure) मा एकल "e" हुने नियम सम्झनुहोस्:',
          options: [
            'proceed / procedure',
            'procede / procedure',
            'proceed / proceedure',
            'procede / proceedure',
          ],
          correctAnswer: 'proceed / procedure',
          explanationNepali:
            'क्रिया "proceed" मा "-ceed" हुन्छ तर नाम "procedure" मा एउटा "e" मात्र लेखिन्छ।',
        },
        {
          id: 'l9-q3',
          type: 'multiple-choice',
          prompt: 'Choose the correctly spelled pair for "come before" and "surpass the limit":',
          nepaliHint: 'अगाडि आउनु (-cede) र सीमा नाघ्नु (३ वटा -ceed शब्दमध्ये एक):',
          options: [
            'precede / exceed',
            'preceed / exceed',
            'precede / excede',
            'preceed / excede',
          ],
          correctAnswer: 'precede / exceed',
          explanationNepali:
            '"Precede" मा "-cede" लाग्छ भने "Exceed" तीनवटा "-ceed" शब्दहरूमध्ये (proceed, exceed, succeed) एक हो।',
        },
        {
          id: 'l9-q4',
          type: 'fill-blank',
          prompt: 'After the bank ____ (debt) was cleared, the manager refused to ____ (resign).',
          nepaliHint: 'मौन "b" र मौन "g" भएका सही शब्दहरू छान्नुहोस्:',
          options: [
            'debt / resign',
            'det / rezine',
            'debt / resine',
            'debpt / resign',
          ],
          correctAnswer: 'debt / resign',
          explanationNepali:
            '"Debt" मा मौन "b" र "resign" मा मौन "g" लेखिन्छ।',
        },
      ],
    },
    moduleD_grammar: {
      topicTitle: 'Active vs. Passive Voice in Formal & Commercial English',
      nepaliTopicTitle: 'औपचारिक र व्यावसायिक अङ्ग्रेजीमा कर्मवाच्य (Passive Voice: Be + V3)',
      explanationNepali:
        'औपचारिक प्रतिवेदन, समाचार, र व्यावसायिक पत्राचारमा "काम कसले गर्यो" भन्नुभन्दा **"के काम भयो"** भन्ने कुरा बढी महत्त्वपूर्ण हुन्छ। नेपालीमा हामी यसलाई "गरियो / पठाइयो / तिरियो" (जस्तै: "ऋण चुक्ता गरियो") भन्छौँ।\nअङ्ग्रेजीमा Passive Voice बनाउने सुत्र:\n• **Object + be verb (is/are, was/were, has been, will be) + Past Participle (V3) [+ by Agent]**\nउदाहरण:\n• Active: "The board launched a new campaign." (बोर्डले नयाँ अभियान सुरु गर्यो।)\n• Passive: "A new campaign **was launched** by the board." (बोर्डद्वारा नयाँ अभियान सुरु गरियो।)',
      keyTakeawaysNepali: [
        'Passive Voice मा सधैँ सहायक क्रिया "be" (is/am/are/was/were/been/being) पछि क्रियाको तेस्रो रूप (V3) आउँछ।',
        'काम गर्ने व्यक्ति (Agent) अज्ञात वा सामान्य हुँदा "by someone / by people" लेखिरहनु पर्दैन (उदा: The debt has been paid)।',
        '"Scissors" र "Trousers" जस्ता जोडी बुझाउने शब्दहरू बहुवचन हुन्छन् र तिनले बहुवचन क्रिया ("are / were") लिन्छन्।',
      ],
      syntaxComparisons: [
        {
          id: 'l9-syn-1',
          structureType: 'Past Passive in Business Reporting (was/were + V3)',
          englishSentence: 'The entire bank debt was cleared before the deadline.',
          nepaliSentence: 'तोकिएको समयसीमा अगावै सम्पूर्ण बैंक ऋण चुक्ता गरियो।',
          comparisonNoteNepali:
            'नेपालीमा "चुक्ता गरियो" भनिन्छ भने अङ्ग्रेजीमा कर्म ("The entire bank debt") लाई अगाडि ल्याएर "was cleared (be + V3)" प्रयोग गरिन्छ।',
          tokens: [
            {
              role: 'Subject',
              englishText: 'The entire bank debt',
              nepaliText: 'सम्पूर्ण बैंक ऋण',
              nepaliRoleLabel: 'कर्म (Passive Subject)',
            },
            {
              role: 'Verb',
              englishText: 'was cleared',
              nepaliText: 'चुक्ता गरियो',
              nepaliRoleLabel: 'कर्मवाच्य क्रिया (was + V3)',
            },
            {
              role: 'Modifier',
              englishText: 'before the deadline.',
              nepaliText: 'तोकिएको समयसीमा अगावै।',
              nepaliRoleLabel: 'समय विवरण',
            },
          ],
        },
        {
          id: 'l9-syn-2',
          structureType: 'Present Perfect Passive (has/have been + V3)',
          englishSentence: 'The old safety procedure has been superseded by the new policy.',
          nepaliSentence: 'पुरानो सुरक्षा कार्यविधिलाई नयाँ नीतिले विस्थापित गरेको छ।',
          comparisonNoteNepali:
            'हालसालै सम्पन्न भएको कामको नतिजा देखाउन Present Perfect Passive ("has been + V3") प्रयोग गरिन्छ।',
          tokens: [
            {
              role: 'Subject',
              englishText: 'The old safety procedure',
              nepaliText: 'पुरानो सुरक्षा कार्यविधिलाई',
              nepaliRoleLabel: 'कर्म (Passive Subject)',
            },
            {
              role: 'Verb',
              englishText: 'has been superseded',
              nepaliText: 'विस्थापित गरिएको छ',
              nepaliRoleLabel: 'क्रिया (has been + V3)',
            },
            {
              role: 'Modifier',
              englishText: 'by the new policy.',
              nepaliText: 'नयाँ नीतिद्वारा।',
              nepaliRoleLabel: 'माध्यम (by + Agent)',
            },
          ],
        },
      ],
      capstoneExercises: [
        {
          id: 'l9-cap-1',
          questionPrompt:
            'Choose the correct Passive Voice transformation: "The court issued a subpoena to the former director."',
          nepaliContext: 'Past Simple ("issued") लाई Passive मा बदल्दा "was/were + V3" प्रयोग हुन्छ:',
          options: [
            'A subpoena was issued to the former director by the court.',
            'A subpoena has issued to the former director by the court.',
            'A subpoena was issue to the former director by the court.',
            'A subpoena is issued to the former director yesterday.',
          ],
          correctAnswer: 'A subpoena was issued to the former director by the court.',
          explanationNepali:
            'Simple Past को Passive बनाउँदा एकवचन कर्ता ("A subpoena") सँग "was + V3 (issued)" प्रयोग हुन्छ।',
        },
        {
          id: 'l9-cap-2',
          questionPrompt:
            'Complete the sentence: "These tailoring scissors ______ in Germany, and the new marketing campaign ______ tomorrow."',
          nepaliContext: '"Scissors" बहुवचन नाम हो र "tomorrow" सँग Future Passive ("will be + V3") लाग्छ:',
          options: [
            'are made / will be launched',
            'is made / will launched',
            'are make / will be launched',
            'is made / will be launch',
          ],
          correctAnswer: 'are made / will be launched',
          explanationNepali:
            '"Scissors" सधैँ बहुवचन हुने भएकाले "are made" लाग्छ र भविष्यको कर्मवाच्यमा "will be launched" हुन्छ।',
        },
        {
          id: 'l9-cap-3',
          questionPrompt:
            'Which formal business sentence is 100% accurate in both spelling and grammar?',
          nepaliContext: 'Supersede, procedure, र exceed को हिज्जे तथा Passive संरचना जाँच्नुहोस्:',
          options: [
            'If the budget is exceeded, the old procedure will be superseded immediately.',
            'If the budget is exceded, the old proceedure will be superceded immediately.',
            'If the budget is exceeded, the old procedure will superseded immediately.',
            'If the budget exceeded, the old proceedure will be superseded immediately.',
          ],
          correctAnswer: 'If the budget is exceeded, the old procedure will be superseded immediately.',
          explanationNepali:
            'यसमा "is exceeded", "procedure" (एउटै e), र "will be superseded" (-sede) दुवै हिज्जे र व्याकरणको दृष्टिले पूर्ण छन्।',
        },
      ],
    },
  },

  // =========================================================================
  // LECTURE 10 (B2): SILENT "-PB-" & "-GUE", PREFIXES & REPORTED SPEECH
  // =========================================================================
  {
    id: 'lecture-10-prefixes-reported-speech',
    lectureNumber: 10,
    level: 'B2',
    title: 'Silent "-PB-" & "-GUE" Words, Negative Prefixes & Reported Speech',
    nepaliTitle: 'मौन "-PB-" र "-GUE" शब्दहरू, उपसर्ग (Prefixes) र अप्रत्यक्ष कथन (Reported Speech)',
    subtitle:
      'Master silent P and UE clusters, spell double-consonant prefixes without guessing, and convert direct quotes into natural Reported Speech.',
    category: 'Communication & Media',
    estimatedMinutes: 16,
    moduleA_vocabulary: [
      {
        id: 'l10-v1',
        word: 'Cupboard',
        ipa: '/ˈkʌb.əd/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'Cu', silent: false },
          { text: 'p', silent: true },
          { text: 'board', silent: false },
        ],
        silentLettersSummary: 'Silent "p" before "b" ("-board" reduces to /bəd/)',
        nepaliMeaning: 'दराज / भाँडाकुँडा वा लुगा राख्ने अलमारी',
        nepaliTransliteration: 'Darāj / Alamārī',
        englishExample: 'She kept the porcelain teacups inside the wooden kitchen cupboard.',
        nepaliExampleTranslation: 'उनले चिनियाँ माटोका चिया कपहरू भान्साको काठको दराजभित्र राखिन्।',
        usageTipNepali:
          '"Cup + board" मिलेर बनेको भए पनि बोल्दा बीचको "p" पूर्ण रूपमा मौन हुन्छ र "क-बर्ड" (/ˈkʌb.əd/) भनिन्छ ("कप-बोर्ड" होइन)।',
      },
      {
        id: 'l10-v2',
        word: 'Raspberry',
        ipa: '/ˈrɑːz.bər.i/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'Ras', silent: false },
          { text: 'p', silent: true },
          { text: 'berry', silent: false },
        ],
        silentLettersSummary: 'Silent "p" before "b" ("s" sounds like /z/)',
        nepaliMeaning: 'ऐसेलु (रातो र गुलियो पहाडी फल)',
        nepaliTransliteration: 'Aiselu',
        englishExample: 'We picked fresh wild raspberry fruit along the trekking trail.',
        nepaliExampleTranslation: 'हामीले पदयात्राको बाटोमा ताजा जङ्गली ऐसेलु टिप्यौँ।',
        usageTipNepali:
          '"Raspberry" मा "p" उच्चारण हुँदैन र "s" को आवाज /z/ आउँछ: "राज्-बेरी" (/ˈrɑːz.bər.i/)।',
      },
      {
        id: 'l10-v3',
        word: 'Dialogue',
        ipa: '/ˈdaɪ.ə.lɒɡ/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'Dialog', silent: false },
          { text: 'ue', silent: true },
        ],
        silentLettersSummary: 'Silent final "-ue" after "g"',
        nepaliMeaning: 'संवाद / वार्तालाप',
        nepaliTransliteration: 'Samvād / Vārtālāp',
        englishExample: 'Constructive dialogue between the two teams resolved the dispute.',
        nepaliExampleTranslation: 'दुई टोलीबीचको रचनात्मक संवादले विवाद समाधान गर्यो।',
        usageTipNepali:
          '"-gue" मा टुङ्गिने शब्दहरू (dialogue, colleague, catalogue, league) मा अन्तिम "ue" मौन रहन्छ र "g" कडा /ɡ/ सुनिन्छ।',
      },
      {
        id: 'l10-v4',
        word: 'Colleague',
        ipa: '/ˈkɒl.iːɡ/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'Colleag', silent: false },
          { text: 'ue', silent: true },
        ],
        silentLettersSummary: 'Silent final "-ue" ("ea" sounds like /iː/)',
        nepaliMeaning: 'सहकर्मी (सँगै काम गर्ने साथी)',
        nepaliTransliteration: 'Sahakarmī',
        englishExample: 'My senior colleague helped me prepare the quarterly presentation.',
        nepaliExampleTranslation: 'मेरा वरिष्ठ सहकर्मीले मलाई त्रैमासिक प्रस्तुति तयार गर्न मद्दत गर्नुभयो।',
        usageTipNepali:
          '"College" (कलेज — /ˈkɒl.ɪdʒ/) र "Colleague" (सहकर्मी — /ˈkɒl.iːɡ/) मा नझुक्किनुहोस्! Colleague मा "क-लीग" उच्चारण हुन्छ।',
      },
      {
        id: 'l10-v5',
        word: 'Guarantee',
        ipa: '/ˌɡær.ənˈtiː/',
        partOfSpeech: 'noun / verb',
        segments: [
          { text: 'G', silent: false },
          { text: 'u', silent: true },
          { text: 'arantee', silent: false },
        ],
        silentLettersSummary: 'Silent "u" after initial "g"',
        nepaliMeaning: 'जमानी / पक्का आश्वासन / ग्यारेन्टी',
        nepaliTransliteration: 'Jamānī / Gyārenṭī',
        englishExample: 'The manufacturer offers a two-year guarantee on every solar battery.',
        nepaliExampleTranslation: 'उत्पादकले प्रत्येक सोलार ब्याट्रीमा दुई वर्षको ग्यारेन्टी दिन्छ।',
        usageTipNepali:
          'हिज्जे लेख्दा सुरुमा "g-u-a-r-a-n-t-e-e" (पहिले u अनि a) आउँछ र सुरुको "u" मौन हुन्छ।',
      },
    ],
    moduleB_pronunciation: [
      {
        id: 'l10-p1',
        wordId: 'l10-v1',
        word: 'Cupboard',
        ipa: '/ˈkʌb.əd/',
        syllables: ['cup', 'board'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'KUB-uhd',
        nepaliPhoneticHint: 'कब्-अड्',
        ruleTitle: 'Bilabial Assimilation ("-pb-" → /b/)',
        ruleExplanationNepali:
          'ओठबाट बोलिने दुई ध्वनि /p/ र /b/ एकसाथ आउँदा अङ्ग्रेजीमा अघिल्लो /p/ लोप भएर एउटै /b/ मात्र उच्चारण हुन्छ ("क-बर्ड")।',
        commonMispronunciation: 'Cup-board (pronouncing P and OAR)',
      },
      {
        id: 'l10-p2',
        wordId: 'l10-v2',
        word: 'Raspberry',
        ipa: '/ˈrɑːz.bər.i/',
        syllables: ['rasp', 'ber', 'ry'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'RAAZ-buh-ree',
        nepaliPhoneticHint: 'राज्-ब-री',
        ruleTitle: 'Silent "P" Between "S" and "B"',
        ruleExplanationNepali:
          '"s" र "b" को बीचमा च्यापिएको "p" उच्चारण हुँदैन र "s" ले गुञ्जायमान /z/ आवाज दिन्छ।',
        commonMispronunciation: 'Rasp-berry',
      },
      {
        id: 'l10-p3',
        wordId: 'l10-v3',
        word: 'Dialogue',
        ipa: '/ˈdaɪ.ə.lɒɡ/',
        syllables: ['di', 'a', 'logue'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'DAI-uh-log',
        nepaliPhoneticHint: 'डाइ-अ-लग्',
        ruleTitle: 'Silent "-ue" in "-gue" Endings',
        ruleExplanationNepali:
          'अन्तिम "-ue" को काम केवल अघिल्लो "g" लाई नरम (/dʒ/) हुन नदिई कडा "ग" (/ɡ/) बनाउनु हो।',
        commonMispronunciation: 'Dia-log-yoo',
      },
      {
        id: 'l10-p4',
        wordId: 'l10-v4',
        word: 'Colleague',
        ipa: '/ˈkɒl.iːɡ/',
        syllables: ['col', 'league'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'KOL-eeg',
        nepaliPhoneticHint: 'क-लीग्',
        ruleTitle: 'Distinguishing "Colleague" (/ˈkɒl.iːɡ/) from "College" (/ˈkɒl.ɪdʒ/)',
        ruleExplanationNepali:
          'दोस्रो अक्षरमा लामो ईकार ("लीग" - /iːɡ/) उच्चारण गर्नुहोस् ताकि यो "कलेज" (/ɪdʒ/) जस्तो नसुनियोस्।',
        commonMispronunciation: 'Col-lij (confusing with college)',
      },
      {
        id: 'l10-p5',
        wordId: 'l10-v5',
        word: 'Guarantee',
        ipa: '/ˌɡær.ənˈtiː/',
        syllables: ['guar', 'an', 'tee'],
        stressedSyllableIndex: 2,
        simplifiedPhonetic: 'ga-ruhn-TEE',
        nepaliPhoneticHint: 'ग्या-रन्-टी',
        ruleTitle: 'Final-Syllable Stress on "-ee" Words (Guarantee, Employee, Committee)',
        ruleExplanationNepali:
          '"-ee" बाट टुङ्गिने शब्दहरूमा (guarantee, interviewee, referee) अन्तिम अक्षर "TEE" मा मुख्य जोड पर्छ।',
        commonMispronunciation: 'Goo-uh-ran-tee',
      },
    ],
    moduleC_spelling: {
      ruleTitle: 'Negative Prefixes Without Dropping Letters (UN-, DIS-, MIS-, IL-, IR-, IM-)',
      nepaliRuleTitle: 'उपसर्ग (Prefixes) थप्दा मूल शब्दको अक्षर नहटाउने र डबल अक्षर बन्ने नियम',
      formula:
        'Prefix + Base Word = Keep ALL letters! (dis + appear = disappear | dis + satisfy = dissatisfy | un + necessary = unnecessary)',
      nepaliExplanation:
        'शब्दको अगाडि नकारात्मक उपसर्ग (Prefix: **un-, dis-, mis-, in-, im-, il-, ir-**) थप्दा मूल शब्दको सुरुको अक्षर कहिल्यै घट्दैन र नथपिने ठाउँमा जबरजस्ती डबल अक्षर पनि बन्दैन:\n१. **एकल अक्षर रहने अवस्था:** यदि मूल शब्द फरक अक्षरबाट सुरु हुन्छ भने एउटै अक्षर रहन्छ:\n• **dis + appear → disappear** (यहाँ मूल शब्द "appear" मा s नभएकोले एउटै s हुन्छ!)।\n• **dis + appoint → disappoint** (एउटै s)।\n२. **डबल अक्षर बन्ने अवस्था:** यदि उपसर्गको अन्तिम अक्षर र मूल शब्दको पहिलो अक्षर एउटै छ भने दुवै अक्षर रहन्छन् (Double Consonant):\n• **dis + satisfy → dissatisfy** (ss)\n• **mis + spell → misspell** (ss)\n• **un + necessary → unnecessary** (nn)\n• **ir + responsible → irresponsible** (rr), **il + legal → illegal** (ll)',
      examples: [
        {
          baseWord: 'dis- + appear / appoint',
          transformation: 'base starts with "a" → only 1 "s"',
          resultWord: 'disappear / disappoint',
          wrongSpelling: 'dissappear / dissappoint',
        },
        {
          baseWord: 'dis- + satisfy / similar',
          transformation: 'base starts with "s" → double "ss"',
          resultWord: 'dissatisfy / dissimilar',
          wrongSpelling: 'disatisfy / disimilar',
        },
        {
          baseWord: 'mis- + spell / understand',
          transformation: 'keep both "s"s in misspell',
          resultWord: 'misspell / misunderstand',
          wrongSpelling: 'mispell / missunderstand',
        },
        {
          baseWord: 'ir- + responsible | il- + logical',
          transformation: 'match prefix to root initial (r → ir, l → il)',
          resultWord: 'irresponsible / illogical',
          wrongSpelling: 'iresponsible / ilogical',
        },
      ],
      exceptions: [
        'M र P बाट सुरु हुने शब्दअगाडि "in-" बदलिएर "im-" हुन्छ: impossible, impatient, immature।',
        'R बाट सुरु हुने शब्दअगाडि "ir-" (irregular) र L बाट सुरु हुने शब्दअगाडि "il-" (illegal) लाग्छ।',
        'आश्चर्यजनक अपवाद: "invaluable" को अर्थ "मूल्यहीन" होइन "अमूल्य (अत्यन्तै बहुमूल्य)" र "inflammable" को अर्थ "सजिलै आगो टिप्ने" हुन्छ!',
      ],
      quizzes: [
        {
          id: 'l10-q1',
          type: 'multiple-choice',
          prompt: 'Choose the correct spellings for "dis + appear" and "mis + spell":',
          nepaliHint: '"appear" कतिवटा s बाट सुरु हुन्छ र "spell" कतिवटा s बाट सुरु हुन्छ विचार गर्नुहोस्:',
          options: [
            'disappear / misspell',
            'dissappear / mispell',
            'disappear / mispell',
            'dissappear / misspell',
          ],
          correctAnswer: 'disappear / misspell',
          explanationNepali:
            '"dis + appear" मा एउटै "s" हुन्छ (disappear), तर "mis + spell" मा दुवै "s" मिल्दा डबल "ss" (misspell) हुन्छ।',
        },
        {
          id: 'l10-q2',
          type: 'fill-blank',
          prompt: 'It was ____ (ir + responsible) to include ____ (un + necessary) details in the report.',
          nepaliHint: 'दुवै शब्दमा उपसर्गको अन्तिम अक्षर र मूल शब्दको पहिलो अक्षर एउटै पर्छ:',
          options: [
            'irresponsible / unnecessary',
            'iresponsible / unecessary',
            'irresponsible / unecessary',
            'iresponsible / unnecessary',
          ],
          correctAnswer: 'irresponsible / unnecessary',
          explanationNepali:
            '"ir + responsible" मा डबल "rr" र "un + necessary" मा डबल "nn" (साथै १ c र २ s) रहन्छ।',
        },
        {
          id: 'l10-q3',
          type: 'multiple-choice',
          prompt: 'Which sentence has zero spelling mistakes?',
          nepaliHint: 'Colleague, dialogue, र dissatisfied को हिज्जे जाँच्नुहोस्:',
          options: [
            'My colleague was dissatisfied when the dialogue ended without a guarantee.',
            'My collegue was disatisfied when the dialoge ended without a garantee.',
            'My colleague was disatisfied when the dialogue ended without a guarantee.',
            'My college was dissatisfied when the dialogue ended without a guarentee.',
          ],
          correctAnswer: 'My colleague was dissatisfied when the dialogue ended without a guarantee.',
          explanationNepali:
            '"Colleague" (-gue), "dissatisfied" (dis + satisfied = ss), "dialogue" (-gue), र "guarantee" (gua-) सबै सही छन्।',
        },
        {
          id: 'l10-q4',
          type: 'fill-blank',
          prompt: 'We stored the ____ (raspberry) jam inside the top kitchen ____ (cupboard).',
          nepaliHint: 'मौन "p" भएका दुवै शब्दहरूको सही हिज्जे छान्नुहोस्:',
          options: [
            'raspberry / cupboard',
            'rasberry / cubboard',
            'raspberry / cubord',
            'rasberry / cupboard',
          ],
          correctAnswer: 'raspberry / cupboard',
          explanationNepali:
            'बोल्दा "p" मौन भए पनि लेख्दा "raspberry" र "cupboard" दुवैमा "p" लेख्नैपर्छ।',
        },
      ],
    },
    moduleD_grammar: {
      topicTitle: 'Reported (Indirect) Speech & Tense Backshifting vs. Nepali "भनेर" Clauses',
      nepaliTopicTitle: 'अप्रत्यक्ष कथन (Reported Speech): काल परिवर्तन (Backshift) र नेपाली "भनेर" सँग तुलना',
      explanationNepali:
        'नेपालीमा कसैको भनाइ अरूलाई सुनाउँदा हामी मूल क्रियाको काल नबदली पछाडि **"भनेर भन्यो"** थप्छौँ (जस्तै: सहकर्मीले "म भोलि आउँछु" भनेर भन्यो)।\nतर अङ्ग्रेजीमा जब मुख्य रिपोर्टिङ क्रिया भूतकालमा ("said / told") हुन्छ, भित्रको वाक्यको काल एक कदम पछाडि सर्छ (**Tense Backshift**):\n• **Present Simple (am/is/work) → Past Simple (was/worked)**\n• **Present Perfect / Past Simple → Past Perfect (had + V3)**\n• **Will / Can → Would / Could**\n• **Said vs. Told नियम:** "Said" पछि सिधै श्रोता आउँदैन (He said that...), तर श्रोता तोकिएको छ भने **"told + Object"** प्रयोग हुन्छ (He **told me** that..., कहिल्यै "He told to me" हुँदैन!)।',
      keyTakeawaysNepali: [
        'Reporting verb भूतकाल (said/told) मा हुँदा भित्रको क्रियालाई एक तह भूतकालमा सार्नुहोस् (will → would, am → was, have done → had done)।',
        '"Told" पछि सधैँ सुन्ने व्यक्ति (me, us, her colleague) आउँछ र बीचमा "to" लाग्दैन (✅ She told me, ❌ She told to me)।',
        'प्रश्नलाई Reported Speech मा लैजाँदा "if / whether" वा Wh-word पछि Subject + Verb क्रम राख्नुहोस् (प्रश्नवाचक चिन्ह हट्छ)।',
      ],
      syntaxComparisons: [
        {
          id: 'l10-syn-1',
          structureType: 'Reported Statement with Backshift (will → would)',
          englishSentence: 'My colleague told me that the company would guarantee the loan.',
          nepaliSentence: 'मेरो सहकर्मीले मलाई कम्पनीले ऋणको जमानी बस्नेछ भनेर भन्नुभयो।',
          comparisonNoteNepali:
            'नेपालीमा "बस्नेछ भनेर भन्नुभयो" भनिन्छ, तर अङ्ग्रेजीमा भूतकालको "told" सँग मिलाउन भविष्यको "will" बदलिएर "would" बन्छ।',
          tokens: [
            {
              role: 'Subject',
              englishText: 'My colleague',
              nepaliText: 'मेरो सहकर्मीले',
              nepaliRoleLabel: 'वक्ता',
            },
            {
              role: 'Verb',
              englishText: 'told me that',
              nepaliText: 'मलाई ... भनेर भन्नुभयो',
              nepaliRoleLabel: 'रिपोर्टिङ क्रिया (told + object)',
            },
            {
              role: 'Object',
              englishText: 'the company would guarantee the loan.',
              nepaliText: 'कम्पनीले ऋणको जमानी बस्नेछ।',
              nepaliRoleLabel: 'अप्रत्यक्ष कथन (will → would)',
            },
          ],
        },
        {
          id: 'l10-syn-2',
          structureType: 'Reported Question (asked + if/whether + Subject + Past Verb)',
          englishSentence: 'She asked whether the raspberry jam was in the cupboard.',
          nepaliSentence: 'उनले ऐसेलुको जाम दराजमा छ कि छैन भनेर सोधिन्।',
          comparisonNoteNepali:
            'अप्रत्यक्ष प्रश्नमा "asked" पछि "whether/if" लाग्छ र "was the jam" को सट्टा "the jam was" (Subject + Past Verb) क्रम आउँछ।',
          tokens: [
            {
              role: 'Subject',
              englishText: 'She',
              nepaliText: 'उनले',
              nepaliRoleLabel: 'कर्ता',
            },
            {
              role: 'Verb',
              englishText: 'asked whether',
              nepaliText: '... छ कि छैन भनेर सोधिन्',
              nepaliRoleLabel: 'प्रश्नवाचक रिपोर्टिङ',
            },
            {
              role: 'Object',
              englishText: 'the raspberry jam was in the cupboard.',
              nepaliText: 'ऐसेलुको जाम दराजमा।',
              nepaliRoleLabel: 'Subject + Past Verb (is → was)',
            },
          ],
        },
      ],
      capstoneExercises: [
        {
          id: 'l10-cap-1',
          questionPrompt:
            'Convert into Reported Speech: My colleague said, "I have finished the dialogue script."',
          nepaliContext: 'Direct speech को Present Perfect ("have finished") अप्रत्यक्ष कथनमा Past Perfect ("had finished") मा बदलिन्छ:',
          options: [
            'My colleague said that she had finished the dialogue script.',
            'My colleague said that she has finished the dialogue script.',
            'My colleague told that she had finished the dialogue script.',
            'My colleague said to me that she have finished the dialogue script.',
          ],
          correctAnswer: 'My colleague said that she had finished the dialogue script.',
          explanationNepali:
            '"Said" भूतकालमा भएकोले "have finished" एक कदम पछाडि सरेर "had finished" हुन्छ।',
        },
        {
          id: 'l10-cap-2',
          questionPrompt:
            'Spot the error and select the correct sentence:',
          nepaliContext: '"Told" पछि "to" नलाग्ने र "will" को backshift "would" हुने नियम हेर्नुहोस्:',
          options: [
            'The manager told us that unnecessary delays would not be accepted.',
            'The manager told to us that unnecessary delays will not be accepted.',
            'The manager said us that unnecessary delays would not be accepted.',
            'The manager told us that unecessary delays would not be accepted.',
          ],
          correctAnswer: 'The manager told us that unnecessary delays would not be accepted.',
          explanationNepali:
            '"Told" पछि सिधै "us" आउँछ, "unnecessary" मा डबल "nn" हुन्छ, र भूतकालको वाक्यमा "would" लाग्छ।',
        },
        {
          id: 'l10-cap-3',
          questionPrompt:
            'Choose the correct Reported Question for: He asked me, "Where did the file disappear?"',
          nepaliContext: 'Reported question मा "did" हटेर क्रिया Past Perfect ("had disappeared") मा जान्छ र Subject + Verb क्रम रहन्छ:',
          options: [
            'He asked me where the file had disappeared.',
            'He asked me where did the file disappear.',
            'He asked me where had the file disappeared.',
            'He asked me where the file dissappeared.',
          ],
          correctAnswer: 'He asked me where the file had disappeared.',
          explanationNepali:
            'अप्रत्यक्ष प्रश्नमा "where" पछि कर्ता ("the file") अनि क्रिया ("had disappeared" — एउटै s) आउँछ।',
        },
      ],
    },
  },

  // =========================================================================
  // LECTURE 11 (C1): GREEK "CH/RH" WORDS, "-CIOUS/-TIOUS" & CONTRAST CLAUSES
  // =========================================================================
  {
    id: 'lecture-11-academic-ch-connectors',
    lectureNumber: 11,
    level: 'C1',
    title: 'Academic Greek Roots, "-CIOUS" vs. "-TIOUS" & Contrast Clauses',
    nepaliTitle: 'प्राज्ञिक ग्रीक शब्दहरू, "-CIOUS/-TIOUS" हिज्जे र विरोधाभास बुझाउने संयोजकहरू',
    subtitle:
      'Command C1 academic vocabulary with Greek "rh-" and "ch-" patterns, master "-cious/-tious" adjectives, and contrast "Although" vs. "Despite".',
    category: 'Academic & Analytical',
    estimatedMinutes: 17,
    moduleA_vocabulary: [
      {
        id: 'l11-v1',
        word: 'Rhetoric',
        ipa: '/ˈret.ər.ɪk/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'R', silent: false },
          { text: 'h', silent: true },
          { text: 'etoric', silent: false },
        ],
        silentLettersSummary: 'Silent "h" after initial Greek "r"',
        nepaliMeaning: 'वाक्पटुता / प्रभावकारी वा आलङ्कारिक भाषण कला',
        nepaliTransliteration: 'Vākpaṭutā / Bhāṣaṇ kalā',
        englishExample: 'Voters demanded practical action rather than empty political rhetoric.',
        nepaliExampleTranslation: 'मतदाताहरूले खोक्रो राजनीतिक भाषणबाजीभन्दा व्यावहारिक कामको माग गरे।',
        usageTipNepali:
          '"Rhythm" जस्तै ग्रीक मूलको "Rhetoric" मा पनि सुरुको "r" पछिको "h" पूर्ण रूपमा मौन हुन्छ ("रे-ट-रिक")।',
      },
      {
        id: 'l11-v2',
        word: 'Hierarchy',
        ipa: '/ˈhaɪə.rɑː.ki/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'Hierarc', silent: false },
          { text: 'h', silent: true },
          { text: 'y', silent: false },
        ],
        silentLettersSummary: 'Greek "ch" pronounced as hard /k/ (silent "h")',
        nepaliMeaning: 'पदानुक्रम / श्रेणीबद्ध तहगत संरचना',
        nepaliTransliteration: 'Padānukram / Tahagat sanrachanā',
        englishExample: 'Every employee understood the decision-making hierarchy within the ministry.',
        nepaliExampleTranslation: 'प्रत्येक कर्मचारीले मन्त्रालयभित्रको निर्णय गर्ने पदानुक्रम बुझेका थिए।',
        usageTipNepali:
          'यसमा सुरुमा "h-i-e-r" ("ie" क्रम) लेखिन्छ र पछाडिको "ch" को उच्चारण "च" नभई "क" (/k/) हुन्छ: "हाइ-रार्-की"।',
      },
      {
        id: 'l11-v3',
        word: 'Chaos',
        ipa: '/ˈkeɪ.ɒs/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'C', silent: false },
          { text: 'h', silent: true },
          { text: 'aos', silent: false },
        ],
        silentLettersSummary: 'Initial Greek "ch" pronounced as /k/',
        nepaliMeaning: 'अस्तव्यस्तता / अराजकता / भद्रगोल अवस्था',
        nepaliTransliteration: 'Astavyastatā / Bhadragol',
        englishExample: 'The sudden power outage caused temporary chaos at the international airport.',
        nepaliExampleTranslation: 'अचानक बिजुली जाँदा अन्तर्राष्ट्रिय विमानस्थलमा अस्थायी अस्तव्यस्तता सिर्जना भयो।',
        usageTipNepali:
          'धेरैले यसलाई "चाओस" भन्छन्, तर ग्रीक शब्द भएकोले "ch" ले /k/ आवाज दिन्छ र उच्चारण **"के-अस्"** (/ˈkeɪ.ɒs/) हुन्छ!',
      },
      {
        id: 'l11-v4',
        word: 'Debris',
        ipa: '/ˈdeb.riː/',
        partOfSpeech: 'noun (uncountable)',
        segments: [
          { text: 'Debri', silent: false },
          { text: 's', silent: true },
        ],
        silentLettersSummary: 'Silent final French "s"',
        nepaliMeaning: 'भग्नावशेष / भत्किएका टुक्राटाक्री वा फोहोरको थुप्रो',
        nepaliTransliteration: 'Bhagnāvaśeṣ / Ṭukrāṭākrī',
        englishExample: 'Volunteers cleared the landslide debris from the mountain highway.',
        nepaliExampleTranslation: 'स्वयंसेवकहरूले पहाडी राजमार्गबाट पहिरोको भग्नावशेष हटाए।',
        usageTipNepali:
          'फ्रेन्च मूलको यो शब्दमा अन्तिम "s" पूर्ण रूपमा मौन हुन्छ र उच्चारण "डे-ब्री" (/ˈdeb.riː/) हुन्छ।',
      },
      {
        id: 'l11-v5',
        word: 'Subtlety',
        ipa: '/ˈsʌt.əl.ti/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'Su', silent: false },
          { text: 'b', silent: true },
          { text: 'tlety', silent: false },
        ],
        silentLettersSummary: 'Silent "b" before "t"',
        nepaliMeaning: 'सूक्ष्मता / बारीकी',
        nepaliTransliteration: 'Sūkṣmatā / Bārīkī',
        englishExample: 'Translating poetry requires an appreciation for linguistic subtlety.',
        nepaliExampleTranslation: 'कविता अनुवाद गर्न भाषिक सूक्ष्मताको कदर गर्न आवश्यक हुन्छ।',
        usageTipNepali:
          'पहिलो पाठमा पढेको "Subtle" मा "-ty" थप्दा "Subtlety" (सूक्ष्मता — नाम) बन्छ र यसमा पनि "b" मौन रहन्छ ("स-टल-टी")।',
      },
    ],
    moduleB_pronunciation: [
      {
        id: 'l11-p1',
        wordId: 'l11-v1',
        word: 'Rhetoric',
        ipa: '/ˈret.ər.ɪk/',
        syllables: ['rhet', 'o', 'ric'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'RET-uh-rik',
        nepaliPhoneticHint: 'रे-ट-रिक्',
        ruleTitle: 'Stress Shift from Noun "Rhetoric" to Adjective "Rhetorical"',
        ruleExplanationNepali:
          'नाम "Rhetoric" मा पहिलो अक्षर ("RET") मा जोड पर्छ, तर विशेषण "Rhetorical" (/rɪˈtɒr.ɪ.kəl/) बन्दा जोड दोस्रो अक्षर ("TOR") मा सर्छ!',
        commonMispronunciation: 'Ruh-tor-ik',
      },
      {
        id: 'l11-p2',
        wordId: 'l11-v2',
        word: 'Hierarchy',
        ipa: '/ˈhaɪə.rɑː.ki/',
        syllables: ['hi', 'er', 'ar', 'chy'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'HAI-uh-raa-kee',
        nepaliPhoneticHint: 'हाइ-अ-रार्-की',
        ruleTitle: 'Greek "-archy" Suffix (Rule/Government) Pronounced "-aa-kee"',
        ruleExplanationNepali:
          'ग्रीक मूलका "-archy" शब्दहरू (hierarchy, monarchy, anarchy) मा "ch" को आवाज सधैँ कडा "क" (/k/) हुन्छ।',
        commonMispronunciation: 'Hai-rar-chee (with /tʃ/)',
      },
      {
        id: 'l11-p3',
        wordId: 'l11-v3',
        word: 'Chaos',
        ipa: '/ˈkeɪ.ɒs/',
        syllables: ['cha', 'os'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'KAY-os',
        nepaliPhoneticHint: 'के-अस्',
        ruleTitle: 'Greek "CH-" (/k/) + Two Distinct Vowels ("a-o")',
        ruleExplanationNepali:
          'पहिलो खण्ड "cha-" लाई "के" (/keɪ/) र दोस्रो खण्ड "-os" लाई "अस्" (/ɒs/) भन्नुहोस्। विशेषण बन्दा "Chaotic" (/keɪˈɒt.ɪk/) हुन्छ।',
        commonMispronunciation: 'Cha-os (with "ch" as in chair)',
      },
      {
        id: 'l11-p4',
        wordId: 'l11-v4',
        word: 'Debris',
        ipa: '/ˈdeb.riː/',
        syllables: ['deb', 'ris'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'DEB-ree',
        nepaliPhoneticHint: 'डेब्-री',
        ruleTitle: 'Silent Final "S" in French Borrowings',
        ruleExplanationNepali:
          'दोस्रो अक्षर "-ris" लाई लामो "री" (/riː/) उच्चारण गर्नुहोस् र अन्तिम "s" लाई पूर्ण रूपमा छोड्नुहोस्।',
        commonMispronunciation: 'Deb-riss',
      },
      {
        id: 'l11-p5',
        wordId: 'l11-v5',
        word: 'Subtlety',
        ipa: '/ˈsʌt.əl.ti/',
        syllables: ['sub', 'tle', 'ty'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'SUT-uhl-tee',
        nepaliPhoneticHint: 'सट्-अल्-टी',
        ruleTitle: 'Maintaining Silent "B" Across Suffixes',
        ruleExplanationNepali:
          '"Subtle", "Subtly", र "Subtlety" तिनै रूपहरूमा "b" कहिल्यै उच्चारण हुँदैन।',
        commonMispronunciation: 'Sub-tul-tee',
      },
    ],
    moduleC_spelling: {
      ruleTitle: 'Root-Based "-CIOUS" vs. "-TIOUS" Adjectives (Spacious vs. Ambitious)',
      nepaliRuleTitle: 'एउटै "/ʃəs/" (शस्) आवाज दिने "-CIOUS" र "-TIOUS" विशेषण छुट्याउने नियम',
      formula:
        'Root ends in -CE (space, grace, malice) → -CIOUS | Root noun ends in -TION (ambition, caution, nutrition) → -TIOUS',
      nepaliExplanation:
        'अङ्ग्रेजीमा "-cious" र "-tious" दुवैको उच्चारण एउटै **"/ʃəs/" (शस्)** हुन्छ। कुन शब्दमा "c" लेख्ने र कुनमा "t" लेख्ने भनी पत्ता लगाउन **मूल नाम (Root Noun)** हेर्नुहोस्:\n१. **"-CIOUS" (जब मूल नाममा "C" हुन्छ):**\n• **Space → Spacious** (फराकिलो)\n• **Grace → Gracious** (दयालु/शिष्ट)\n• **Malice → Malicious** (द्वेषपूर्ण)\n• **Conscience → Conscious** (सचेत)\n• **Precious, Delicious, Suspicion → Suspicious**\n२. **"-TIOUS" (जब मूल नाम "-tion" मा टुङ्गिन्छ):**\n• **Ambition → Ambitious** (महत्त्वाकांक्षी)\n• **Caution → Cautious** (सजग/सावधान)\n• **Nutrition → Nutritious** (पोषिलो)\n• **Infection → Infectious** (सरुवा/संक्रामक)',
      examples: [
        {
          baseWord: 'space / grace (root ends in -ce)',
          transformation: 'keep the "c" → -cious',
          resultWord: 'spacious / gracious',
          wrongSpelling: 'spatious / gratious',
        },
        {
          baseWord: 'ambition / caution (noun ends in -tion)',
          transformation: 'keep the "t" → -tious',
          resultWord: 'ambitious / cautious',
          wrongSpelling: 'ambicious / caucious',
        },
        {
          baseWord: 'nutrition / infection (noun ends in -tion)',
          transformation: 'keep the "t" → -tious',
          resultWord: 'nutritious / infectious',
          wrongSpelling: 'nutricious / infeccious',
        },
        {
          baseWord: 'suspicion / malice (root has "c")',
          transformation: 'keep the "c" → -cious',
          resultWord: 'suspicious / malicious',
          wrongSpelling: 'suspitious / malitious',
        },
      ],
      exceptions: [
        'Anxious → मूल नाम "anxiety" मा "x" भएकोले "anxious" (-xious) लेखिन्छ।',
        'Conscientious (इमानदार/कर्तव्यनिष्ठ) → यसमा सुरुमा "sc" र पछाडि "-tious" दुवै आउँछ (con-sci-en-tious)!',
        'Fictitious (काल्पनिक) → "fiction" बाट बनेको हुनाले "-tious" लाग्छ।',
      ],
      quizzes: [
        {
          id: 'l11-q1',
          type: 'multiple-choice',
          prompt: 'Choose the correct spellings derived from "ambition" and "space":',
          nepaliHint: '"ambition" मा t छ र "space" मा c छ:',
          options: [
            'ambitious / spacious',
            'ambicious / spatious',
            'ambitious / spatious',
            'ambicious / spacious',
          ],
          correctAnswer: 'ambitious / spacious',
          explanationNepali:
            '"Ambition" (-tion) बाट "ambitious" र "space" (-ce) बाट "spacious" बन्छ।',
        },
        {
          id: 'l11-q2',
          type: 'fill-blank',
          prompt: 'Doctors advise eating ____ (nutrition) food and remaining ____ (caution) during flu season.',
          nepaliHint: 'दुवै शब्दका मूल नाम (nutrition, caution) "-tion" मा टुङ्गिन्छन्:',
          options: [
            'nutritious / cautious',
            'nutricious / caucious',
            'nutritious / caucious',
            'nutricious / cautious',
          ],
          correctAnswer: 'nutritious / cautious',
          explanationNepali:
            '"Nutrition" र "caution" दुवै "-tion" मूलका भएकाले विशेषणमा "-tious" लाग्छ।',
        },
        {
          id: 'l11-q3',
          type: 'multiple-choice',
          prompt: 'Which academic sentence is 100% free of spelling errors?',
          nepaliHint: 'Rhetoric, hierarchy, र chaos को हिज्जे ध्यानपूर्वक जाँच्नुहोस्:',
          options: [
            'Despite the political rhetoric, the organizational hierarchy prevented total chaos.',
            'Despite the political retoric, the organizational heirarchy prevented total chaos.',
            'Despite the political rhetoric, the organizational hierarchy prevented total kaos.',
            'Despite the political rethoric, the organizational heirarchy prevented total chaos.',
          ],
          correctAnswer: 'Despite the political rhetoric, the organizational hierarchy prevented total chaos.',
          explanationNepali:
            '"Rhetoric" (rh-), "hierarchy" (h-i-e-r-a-r-c-h-y), र "chaos" (ch-) तिनैको हिज्जे पूर्ण रूपमा सही छ।',
        },
        {
          id: 'l11-q4',
          type: 'fill-blank',
          prompt: 'The host was ____ (grace) and appreciated the ____ (subtle) of the artist’s work.',
          nepaliHint: '"grace" बाट बन्ने विशेषण र "subtle" बाट बन्ने नाम छान्नुहोस्:',
          options: [
            'gracious / subtlety',
            'gratious / subtleity',
            'gracious / subtelty',
            'gratious / subtlety',
          ],
          correctAnswer: 'gracious / subtlety',
          explanationNepali:
            '"Grace" बाट "gracious" (-cious) र "subtle + ty" बाट "subtlety" बन्छ।',
        },
      ],
    },
    moduleD_grammar: {
      topicTitle: 'Contrastive Connectors: "Although / Even Though" vs. "Despite / In Spite Of"',
      nepaliTopicTitle: 'विरोधाभास बुझाउने संयोजकहरू: "Although" र "Despite / In Spite Of" प्रयोगको नियम',
      explanationNepali:
        'नेपालीमा हामी विरोधाभास देखाउन एउटै संरचना **"-ए तापनि / हुँदाहुँदै पनि"** प्रयोग गर्छौँ (जस्तै: "पहिरोको भग्नावशेष भए तापनि बाटो खुल्यो")। तर अङ्ग्रेजीमा पछाडि **पूरा उपवाक्य (Subject + Verb)** आउँछ कि **नाम पद (Noun / V-ing)** आउँछ भन्ने आधारमा फरक शब्द छान्नुपर्छ:\n१. **Although / Even though / Though + Subject + Verb (पूरा उपवाक्य):**\n• सुत्र: **Although + Subject + Verb**, Main Clause.\n• उदाहरण: "**Although the storm caused** chaos, flights resumed on time."\n२. **Despite / In spite of + Noun Phrase or Gerund (V-ing) (यसमा सिधै Subject + Verb आउँदैन!):**\n• सुत्र: **Despite + Noun / V-ing**, Main Clause. (주의: **"Despite of"** कहिल्यै लेखिँदैन!)\n• उदाहरण: "**Despite the chaos**, flights resumed on time."',
      keyTakeawaysNepali: [
        '"Although / Even though" पछि सधैँ कर्ता र क्रिया (Subject + Verb) भएको पूरा उपवाक्य आउँछ।',
        '"Despite" र "In spite of" पछि केवल नाम पद (Noun phrase) वा "-ing" क्रिया (Gerund) मात्र आउँछ।',
        'महत्त्वपूर्ण चेतावनी: "Despite" पछि कहिल्यै "of" नराख्नुहोस् (✅ Despite the rain वा ✅ In spite of the rain; ❌ Despite of the rain)।',
        'नेपालीमा जस्तो सुरूमा "Although" राखेपछि दोस्रो भागमा फेरि "but" नराख्नुहोस् (❌ Although he worked hard, but he failed → ✅ Although he worked hard, he failed)।',
      ],
      syntaxComparisons: [
        {
          id: 'l11-syn-1',
          structureType: 'Although + Full Clause (Subject + Verb) — No "but" in main clause!',
          englishSentence: 'Although the landslide left heavy debris, the highway reopened quickly.',
          nepaliSentence: 'पहिरोले बाक्लो भग्नावशेष छोडे तापनि राजमार्ग छिट्टै खुल्यो।',
          comparisonNoteNepali:
            '"Although" पछि कर्ता ("the landslide") र क्रिया ("left") दुवै आएको छ र दोस्रो उपवाक्यमा "but" प्रयोग गरिँदैन।',
          tokens: [
            {
              role: 'Modifier',
              englishText: 'Although the landslide left heavy debris,',
              nepaliText: 'पहिरोले बाक्लो भग्नावशेष छोडे तापनि,',
              nepaliRoleLabel: 'Although + Subject + Verb',
            },
            {
              role: 'Subject',
              englishText: 'the highway',
              nepaliText: 'राजमार्ग',
              nepaliRoleLabel: 'मुख्य कर्ता',
            },
            {
              role: 'Verb',
              englishText: 'reopened quickly.',
              nepaliText: 'छिट्टै खुल्यो।',
              nepaliRoleLabel: 'मुख्य क्रिया',
            },
          ],
        },
        {
          id: 'l11-syn-2',
          structureType: 'Despite + Noun Phrase / Gerund (No "of" after Despite!)',
          englishSentence: 'Despite the strict hierarchy, ambitious employees shared new ideas.',
          nepaliSentence: 'कडा पदानुक्रमका बाबजुद महत्त्वाकांक्षी कर्मचारीहरूले नयाँ विचारहरू राखे।',
          comparisonNoteNepali:
            '"Despite" पछि क्रिया नराखी सिधै नाम पद ("the strict hierarchy") राखिएको छ।',
          tokens: [
            {
              role: 'Modifier',
              englishText: 'Despite the strict hierarchy,',
              nepaliText: 'कडा पदानुक्रमका बाबजुद,',
              nepaliRoleLabel: 'Despite + Noun Phrase',
            },
            {
              role: 'Subject',
              englishText: 'ambitious employees',
              nepaliText: 'महत्त्वाकांक्षी कर्मचारीहरूले',
              nepaliRoleLabel: 'कर्ता',
            },
            {
              role: 'Verb',
              englishText: 'shared',
              nepaliText: 'राखे',
              nepaliRoleLabel: 'क्रिया',
            },
            {
              role: 'Object',
              englishText: 'new ideas.',
              nepaliText: 'नयाँ विचारहरू।',
              nepaliRoleLabel: 'कर्म',
            },
          ],
        },
      ],
      capstoneExercises: [
        {
          id: 'l11-cap-1',
          questionPrompt:
            'Choose the correct connector: "______ the initial chaos at the venue, the conference succeeded."',
          nepaliContext: '"the initial chaos at the venue" एउटा नाम पदावली (Noun Phrase) हो (यसमा क्रिया छैन):',
          options: [
            'Despite',
            'Although',
            'Despite of',
            'Even though',
          ],
          correctAnswer: 'Despite',
          explanationNepali:
            'पछाडि नाम पदावली मात्र भएकोले "Despite" लाग्छ ("Although" पछि Subject + Verb चाहिन्छ र "Despite of" गलत हुन्छ)।',
        },
        {
          id: 'l11-cap-2',
          questionPrompt:
            'Spot the common error and select the grammatically natural English sentence:',
          nepaliContext: '"Although" प्रयोग भएको वाक्यमा दोस्रो खण्डमा फेरि "but" लाग्दैन भन्ने नियम सम्झनुहोस्:',
          options: [
            'Although his speech was full of rhetoric, voters remained cautious.',
            'Although his speech was full of rhetoric, but voters remained cautious.',
            'Despite his speech was full of rhetoric, voters remained cautious.',
            'In spite of his speech was full of rhetoric, voters remained cautious.',
          ],
          correctAnswer: 'Although his speech was full of rhetoric, voters remained cautious.',
          explanationNepali:
            'एउटै वाक्यमा "Although" र "but" दुवै सँगै प्रयोग गरिँदैन; "Although" एक्लैले विरोधाभास जोड्ने काम गर्छ।',
        },
        {
          id: 'l11-cap-3',
          questionPrompt:
            'Select the sentence that is 100% accurate in both C1 spelling and contrastive grammar:',
          nepaliContext: 'Cautious, ambitious, र debris को हिज्जे तथा In spite of + V-ing व्याकरण जाँच्नुहोस्:',
          options: [
            'In spite of being cautious, the ambitious team cleared the heavy debris before dusk.',
            'Despite of being caucious, the ambicious team cleared the heavy debris before dusk.',
            'Although being cautious, the ambitious team cleared the heavy debri before dusk.',
            'In spite of being cautious, the ambicious team cleared the heavy debris before dusk.',
          ],
          correctAnswer: 'In spite of being cautious, the ambitious team cleared the heavy debris before dusk.',
          explanationNepali:
            '"In spite of + being (V-ing)", "cautious" (-tious), "ambitious" (-tious), र "debris" सबै पूर्ण रूपमा सही छन्।',
        },
      ],
    },
  },

  // =========================================================================
  // LECTURE 12 (C1): DIPLOMATIC LOANWORDS, ACADEMIC PLURALS & INVERSION
  // =========================================================================
  {
    id: 'lecture-12-diplomatic-french-inversion',
    lectureNumber: 12,
    level: 'C1',
    title: 'Diplomatic Loanwords, Academic Plurals & Negative Inversion',
    nepaliTitle: 'कूटनीतिक शब्दहरू, प्राज्ञिक बहुवचन (Criteria/Phenomena) र जोडदार वाक्य संरचना (Inversion)',
    subtitle:
      'Master advanced French and Latin loanwords, use Greek/Latin academic plurals accurately, and write powerful C1 sentences with Negative Inversion.',
    category: 'Diplomacy & Executive',
    estimatedMinutes: 18,
    moduleA_vocabulary: [
      {
        id: 'l12-v1',
        word: 'Rendezvous',
        ipa: '/ˈrɒn.deɪ.vuː/',
        partOfSpeech: 'noun / verb',
        segments: [
          { text: 'Rende', silent: false },
          { text: 'z', silent: true },
          { text: 'vou', silent: false },
          { text: 's', silent: true },
        ],
        silentLettersSummary: 'Silent middle "z" and silent final "s"',
        nepaliMeaning: 'पूर्वनिर्धारित भेटघाट वा भेटघाट गर्ने गोप्य/तोकिएको स्थान',
        nepaliTransliteration: 'Pūrvanirdhārit bheṭghāṭ / Bheṭne sthān',
        englishExample: 'The mountaineers arranged a midnight rendezvous at the base camp.',
        nepaliExampleTranslation: 'पर्वतारोहीहरूले आधार शिविरमा मध्यरातमा भेटघाटको व्यवस्था मिलाए।',
        usageTipNepali:
          'फ्रेन्च मूलको यो शब्दमा बीचको "z" र अन्तिम "s" दुवै मौन हुन्छन्—यसलाई **"रन्-डे-भू"** (/ˈrɒn.deɪ.vuː/) उच्चारण गरिन्छ!',
      },
      {
        id: 'l12-v2',
        word: 'Entrepreneur',
        ipa: '/ˌɒn.trə.prəˈnɜːr/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'Entrepreneur', silent: false },
        ],
        silentLettersSummary: 'French nasal "en-" (/ɒn/) & stressed final "-neur" (/nɜːr/)',
        nepaliMeaning: 'उद्यमी / नयाँ व्यवसाय सुरु गर्ने व्यक्ति',
        nepaliTransliteration: 'Udyamī',
        englishExample: 'The young Nepali entrepreneur built a sustainable solar energy startup.',
        nepaliExampleTranslation: 'ती युवा नेपाली उद्यमीले दिगो सौर्य ऊर्जा स्टार्टअप स्थापना गरे।',
        usageTipNepali:
          'हिज्जे र उच्चारण दुवैमा ध्यान दिनुहोस्: सुरुको "En-" लाई "अन" (/ɒn/) र अन्त्यको "-neur" लाई "नर" भनिन्छ: "अन्-ट्र-प्र-नर"।',
      },
      {
        id: 'l12-v3',
        word: 'Liaison',
        ipa: '/liˈeɪ.zɒn/',
        partOfSpeech: 'noun',
        segments: [
          { text: 'Li', silent: false },
          { text: 'a', silent: false },
          { text: 'i', silent: true },
          { text: 'son', silent: false },
        ],
        silentLettersSummary: 'Second "i" merges into /eɪ/ ("s" sounds like /z/)',
        nepaliMeaning: 'सम्पर्क वा समन्वय अधिकारी / दुई पक्षबीचको समन्वय',
        nepaliTransliteration: 'Samparka / Samanvaya adhikārī',
        englishExample: 'She serves as the primary liaison between the embassy and local ministries.',
        nepaliExampleTranslation: 'उनी दूतावास र स्थानीय मन्त्रालयहरूबीच मुख्य सम्पर्क अधिकारीको रूपमा काम गर्छिन्।',
        usageTipNepali:
          'हिज्जे लेख्दा "l-i-a-i-s-o-n" (दुइटा "i" — a को अगाडि र पछाडि) लेख्न नबिर्सनुहोस्! उच्चारण: "लि-ए-जन्"।',
      },
      {
        id: 'l12-v4',
        word: 'Bourgeois',
        ipa: '/ˈbʊə.ʒwɑː/',
        partOfSpeech: 'adjective / noun',
        segments: [
          { text: 'Bour', silent: false },
          { text: 'g', silent: false },
          { text: 'e', silent: true },
          { text: 'oi', silent: false },
          { text: 's', silent: true },
        ],
        silentLettersSummary: 'Silent "e" after "g", "oi" = /wɑː/, silent final "s"',
        nepaliMeaning: 'मध्यमवर्गीय वा पूँजीपति वर्गसम्बन्धी',
        nepaliTransliteration: 'Madhyamvargīya / Pũjīpati varga',
        englishExample: 'The novel critiques the comfortable habits of nineteenth-century bourgeois society.',
        nepaliExampleTranslation: 'उपन्यासले उन्नाइसौँ शताब्दीको मध्यमवर्गीय समाजको आरामदायी बानीको समीक्षा गर्छ।',
        usageTipNepali:
          'फ्रेन्च ध्वनि नियमअनुसार "-geois" को उच्चारण "ज्वा" (/ʒwɑː/) हुन्छ र अन्तिम "s" मौन रहन्छ: "बुर्-ज्वा"।',
      },
      {
        id: 'l12-v5',
        word: 'Sovereign',
        ipa: '/ˈsɒv.rɪn/',
        partOfSpeech: 'adjective / noun',
        segments: [
          { text: 'Sov', silent: false },
          { text: 'e', silent: true },
          { text: 'rei', silent: false },
          { text: 'g', silent: true },
          { text: 'n', silent: false },
        ],
        silentLettersSummary: 'Compressed middle "e" & silent "g" before "n"',
        nepaliMeaning: 'सार्वभौम / स्वतन्त्र सर्वोच्च राष्ट्र वा शासक',
        nepaliTransliteration: 'Sārvabhaum / Swatantra rāṣṭra',
        englishExample: 'Nepal is an independent and sovereign nation with a rich cultural heritage.',
        nepaliExampleTranslation: 'नेपाल समृद्ध सांस्कृतिक सम्पदा भएको एक स्वतन्त्र र सार्वभौम राष्ट्र हो।',
        usageTipNepali:
          '"Foreign" जस्तै "Sovereign" मा पनि अन्त्यको "g" मौन हुन्छ र २ अक्षरमा "सभ्-रिन्" (/ˈsɒv.rɪn/) उच्चारण गरिन्छ।',
      },
    ],
    moduleB_pronunciation: [
      {
        id: 'l12-p1',
        wordId: 'l12-v1',
        word: 'Rendezvous',
        ipa: '/ˈrɒn.deɪ.vuː/',
        syllables: ['ren', 'dez', 'vous'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'RON-day-voo',
        nepaliPhoneticHint: 'रन्-डे-भू',
        ruleTitle: 'French Silent Consonants ("-ez" = /eɪ/, "-vous" = /vuː/)',
        ruleExplanationNepali:
          'फ्रेन्चमा "ren-" ले "रन्", "-dez" ले "डे" (मौन z), र "-vous" ले "भू" (मौन s) आवाज दिन्छ।',
        commonMispronunciation: 'Ren-dez-vuss',
      },
      {
        id: 'l12-p2',
        wordId: 'l12-v2',
        word: 'Entrepreneur',
        ipa: '/ˌɒn.trə.prəˈnɜːr/',
        syllables: ['en', 'tre', 'pre', 'neur'],
        stressedSyllableIndex: 3,
        simplifiedPhonetic: 'on-truh-pruh-NUR',
        nepaliPhoneticHint: 'अन्-ट्र-प्र-नर्',
        ruleTitle: 'Final Stress on French "-eur" Agent Nouns',
        ruleExplanationNepali:
          'सुरुको "en-" लाई "इन्" नभनी ओठ गोलो पारेर "अन्" (/ɒn/) भन्नुहोस् र चौथो खण्ड "-NEUR" मा मुख्य जोड दिनुहोस्।',
        commonMispronunciation: 'En-ter-pren-er',
      },
      {
        id: 'l12-p3',
        wordId: 'l12-v3',
        word: 'Liaison',
        ipa: '/liˈeɪ.zɒn/',
        syllables: ['li', 'ai', 'son'],
        stressedSyllableIndex: 1,
        simplifiedPhonetic: 'lee-AY-zon',
        nepaliPhoneticHint: 'लि-ए-जन्',
        ruleTitle: 'Vowel Glide ("li-ai-") + Voiced "S" (/z/)',
        ruleExplanationNepali:
          'पहिलो खण्ड "लि" (/li/) बाट दोस्रो जोड दिइएको खण्ड "ए" (/eɪ/) मा बग्नुहोस् र अन्त्यमा "जन्" भन्नुहोस्।',
        commonMispronunciation: 'Lay-zon (dropping first syllable)',
      },
      {
        id: 'l12-p4',
        wordId: 'l12-v4',
        word: 'Bourgeois',
        ipa: '/ˈbʊə.ʒwɑː/',
        syllables: ['bour', 'geois'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'BOOR-zhwaa',
        nepaliPhoneticHint: 'बुर्-ज्वा',
        ruleTitle: 'French "-ois" Ending Pronounced /wɑː/ ("waa")',
        ruleExplanationNepali:
          'फ्रेन्च शब्दहरूमा "oi" स्वर समूहको उच्चारण "वा" (/wɑː/) हुन्छ र अन्तिम "s" उच्चारण हुँदैन।',
        commonMispronunciation: 'Bour-joys',
      },
      {
        id: 'l12-p5',
        wordId: 'l12-v5',
        word: 'Sovereign',
        ipa: '/ˈsɒv.rɪn/',
        syllables: ['sov', 'reign'],
        stressedSyllableIndex: 0,
        simplifiedPhonetic: 'SOV-rin',
        nepaliPhoneticHint: 'सभ्-रिन्',
        ruleTitle: 'Silent "G" in "-reign" (Sovereign, Reign, Foreign)',
        ruleExplanationNepali:
          'बीचको "e" र अन्त्यको "g" दुवै उच्चारणमा हराउँछन्; संज्ञा बन्दा "Sovereignty" (/ˈsɒv.rən.ti/ — सार्वभौमसत्ता) हुन्छ।',
        commonMispronunciation: 'Sov-er-eyn',
      },
    ],
    moduleC_spelling: {
      ruleTitle: 'Irregular Greek & Latin Academic Plurals (Criterion → Criteria, Analysis → Analyses)',
      nepaliRuleTitle: 'प्राज्ञिक लेखनमा प्रयोग हुने ग्रीक र ल्याटिन बहुवचन नियमहरू (Criteria, Phenomena, Analyses)',
      formula:
        '-ON → -A (criterion → criteria, phenomenon → phenomena) | -IS → -ES (analysis → analyses, crisis → crises)',
      nepaliExplanation:
        'उच्च तहको प्राज्ञिक र औपचारिक अङ्ग्रेजीमा ग्रीक तथा ल्याटिन मूलका शब्दहरूको बहुवचन बनाउँदा "-s" थपिँदैन। धेरै मानिसले बहुवचन रूपलाई एकवचन ठानेर गल्ती गर्छन्:\n१. **"-ON" बाट "-A" मा बदलिने (Singular -on → Plural -a):**\n• **One criterion** (एउटा मापदण्ड) → **Many criteria** (धेरै मापदण्डहरू — कहिल्यै "criterias" हुँदैन!)\n• **One phenomenon** (एउटा घटना/परिघटना) → **Many phenomena** (धेरै परिघटनाहरू)\n२. **"-IS" बाट "-ES" मा बदलिने (Singular -is /ɪs/ → Plural -es /iːz/):**\n• **One analysis** (एउटा विश्लेषण) → **Two analyses** (दुई विश्लेषणहरू)\n• **One crisis** (एउटा सङ्कट) → **Several crises** (धेरै सङ्कटहरू)\n• **One thesis / hypothesis** → **Multiple theses / hypotheses**\n३. **"-UM" बाट "-A" मा बदलिने:**\n• **Datum → Data**, **Curriculum → Curricula** (वा curriculums), **Bacterium → Bacteria**।',
      examples: [
        {
          baseWord: 'criterion (Singular: 1 standard)',
          transformation: 'change -on to -a for plural',
          resultWord: 'criteria (Plural: multiple standards)',
          wrongSpelling: 'criterias / a criteria',
        },
        {
          baseWord: 'phenomenon (Singular: 1 event)',
          transformation: 'change -on to -a for plural',
          resultWord: 'phenomena (Plural: multiple events)',
          wrongSpelling: 'phenomenons / a phenomena',
        },
        {
          baseWord: 'analysis / crisis (Singular: -is)',
          transformation: 'change -is to -es for plural',
          resultWord: 'analyses / crises',
          wrongSpelling: 'analysises / crisises',
        },
        {
          baseWord: 'liaison / entrepreneur (French orthography)',
          transformation: 'keep l-i-a-i-s-o-n and e-n-t-r-e-p-r-e-n-e-u-r',
          resultWord: 'liaison / entrepreneur',
          wrongSpelling: 'liason / enterpreneur',
        },
      ],
      exceptions: [
        'Rendezvous → एकवचन र बहुवचन दुवैमा हिज्जे एउटै "rendezvous" रहन्छ!',
        'Series र Species → एकवचन र बहुवचन दुवैमा एउटै हिज्जे रहन्छ (a television series / many series)।',
        'Index → साधारण लेखनमा "indexes" र गणित/अर्थशास्त्रमा "indices" दुवै चल्छ।',
      ],
      quizzes: [
        {
          id: 'l12-q1',
          type: 'multiple-choice',
          prompt: 'Choose the correct singular and plural forms: "What is the main ______ for selecting candidates, and what are the secondary ______?"',
          nepaliHint: 'पहिलो खाली ठाउँमा एकवचन ("is" सँग -on) र दोस्रोमा बहुवचन ("are" सँग -a) छान्नुहोस्:',
          options: [
            'criterion / criteria',
            'criteria / criterions',
            'criteria / criterias',
            'criterion / criterias',
          ],
          correctAnswer: 'criterion / criteria',
          explanationNepali:
            'एकवचनमा "criterion" (main criterion) र बहुवचनमा "criteria" (secondary criteria) प्रयोग हुन्छ।',
        },
        {
          id: 'l12-q2',
          type: 'fill-blank',
          prompt: 'Our financial ____ (analysis - plural) helped the ministry manage two economic ____ (crisis - plural).',
          nepaliHint: '"-is" मा टुङ्गिने एकवचन शब्दलाई बहुवचन बनाउँदा "-es" मा बदल्नुहोस्:',
          options: [
            'analyses / crises',
            'analysises / crisises',
            'analyses / crisises',
            'analysis / crises',
          ],
          correctAnswer: 'analyses / crises',
          explanationNepali:
            '"Analysis" को बहुवचन "analyses" र "crisis" को बहुवचन "crises" हुन्छ।',
        },
        {
          id: 'l12-q3',
          type: 'multiple-choice',
          prompt: 'Which C1 sentence has 100% accurate spelling of French and diplomatic loanwords?',
          nepaliHint: 'Entrepreneur, liaison, rendezvous र sovereign को हिज्जे जाँच्नुहोस्:',
          options: [
            'The entrepreneur acted as a liaison during the diplomatic rendezvous in the sovereign state.',
            'The enterpreneur acted as a liason during the diplomatic rendevous in the soverign state.',
            'The entrepreneur acted as a liason during the diplomatic rendezvous in the sovereign state.',
            'The enterpreneur acted as a liaison during the diplomatic rendezvous in the sovreign state.',
          ],
          correctAnswer: 'The entrepreneur acted as a liaison during the diplomatic rendezvous in the sovereign state.',
          explanationNepali:
            '"Entrepreneur", "liaison" (दुइटा i), "rendezvous" (-zvous), र "sovereign" (-reign) सबैको हिज्जे अचुक छ।',
        },
        {
          id: 'l12-q4',
          type: 'fill-blank',
          prompt: 'This rare atmospheric ____ (phenomenon - singular) was observed by several researchers.',
          nepaliHint: '"This ... was" सँग एकवचन रूप छान्नुहोस्:',
          options: [
            'phenomenon',
            'phenomena',
            'phenomenas',
            'phenomina',
          ],
          correctAnswer: 'phenomenon',
          explanationNepali:
            '"This" र एकवचन क्रिया "was" सँग एकवचन नाम "phenomenon" प्रयोग हुन्छ ("phenomena" बहुवचन हो)।',
        },
      ],
    },
    moduleD_grammar: {
      topicTitle: 'C1 Emphatic Negative Inversion ("Never have I...", "Not only did...")',
      nepaliTopicTitle: 'उच्च तहको जोडदार वाक्य संरचना: Negative Inversion र नेपाली निपात ("नै / समेत") सँग तुलना',
      explanationNepali:
        'नेपालीमा कुनै कुरामा विशेष जोड (Emphasis) दिनुपर्दा हामी शब्दको पछाडि **"नै", "समेत", "कहिल्यै पनि"** जस्ता निपातहरू थप्छौँ (जस्तै: "मैले यस्तो अद्भुत परिघटना कहिल्यै देखेको थिइनँ")।\nऔपचारिक र C1 तहको अङ्ग्रेजीमा वाक्यलाई प्रभावशाली बनाउन **Negative Adverbial (Never, Rarely, Seldom, Not only, Little, Under no circumstances)** लाई वाक्यको सुरुमा राखिन्छ र कर्ताभन्दा अगाडि सहायक क्रिया ल्याइन्छ (**Auxiliary + Subject + Main Verb — प्रश्नको जस्तै क्रम!**):\n• साधारण वाक्य: "I have **never** seen such a phenomenon."\n• **Negative Inversion (C1 Emphatic):** "**Never have I** seen such a phenomenon."\n• **Not only ... but also सुत्र:** "**Not only did the entrepreneur** create jobs, **but she also** supported local schools."',
      keyTakeawaysNepali: [
        'सुत्र: Negative Word (Never / Rarely / Seldom / Not only / Under no circumstances) + Auxiliary Verb (have/had/did/will/can) + Subject + Main Verb!',
        'यदि साधारण वाक्यमा सहायक क्रिया छैन (Past Simple V2 वा Present Simple) भने Inversion मा "did / do / does" थप्नुपर्छ (उदा: Rarely did he complain)।',
        '"Not only" वाक्यको सुरुमा आउँदा पहिलो भागमा मात्र Inversion हुन्छ ("Not only did she win..."), दोस्रो भाग साधारण क्रममा रहन्छ ("...but she also broke the record")।',
      ],
      syntaxComparisons: [
        {
          id: 'l12-syn-1',
          structureType: 'Negative Inversion with Present Perfect (Never + have/has + Subject + V3)',
          englishSentence: 'Never have we witnessed such a remarkable natural phenomenon.',
          nepaliSentence: 'हामीले यस्तो अद्भुत प्राकृतिक परिघटना कहिल्यै देखेका छैनौँ।',
          comparisonNoteNepali:
            'वाक्यको सुरुमा "Never" राखिएको हुनाले "we have" उल्टिएर "have we" (Auxiliary + Subject) बनेको छ।',
          tokens: [
            {
              role: 'Modifier',
              englishText: 'Never',
              nepaliText: 'कहिल्यै पनि',
              nepaliRoleLabel: 'नकारात्मक जोड (Fronted)',
            },
            {
              role: 'Verb',
              englishText: 'have (aux) ... witnessed (V3)',
              nepaliText: 'देखेका छैनौँ',
              nepaliRoleLabel: 'उल्टिएको सहायक क्रिया + V3',
            },
            {
              role: 'Subject',
              englishText: 'we',
              nepaliText: 'हामीले',
              nepaliRoleLabel: 'कर्ता (Auxiliary पछि)',
            },
            {
              role: 'Object',
              englishText: 'such a remarkable natural phenomenon.',
              nepaliText: 'यस्तो अद्भुत प्राकृतिक परिघटना।',
              nepaliRoleLabel: 'कर्म',
            },
          ],
        },
        {
          id: 'l12-syn-2',
          structureType: 'Correlative Inversion (Not only + did + Subject + V1, but ... also)',
          englishSentence: 'Not only did the liaison resolve the crisis, but she also strengthened trust.',
          nepaliSentence: 'सम्पर्क अधिकारीले सङ्कट मात्र समाधान गरिनन्, उनले विश्वाससमेत बलियो बनाइन्।',
          comparisonNoteNepali:
            '"Not only" बाट वाक्य सुरु हुँदा भूतकालको क्रियालाई "did + Subject + V1 (resolve)" बनाइन्छ।',
          tokens: [
            {
              role: 'Modifier',
              englishText: 'Not only',
              nepaliText: '... मात्र होइन',
              nepaliRoleLabel: 'सुरुको जोडदार संयोजक',
            },
            {
              role: 'Verb',
              englishText: 'did ... resolve',
              nepaliText: 'समाधान गरिन्',
              nepaliRoleLabel: 'Inversion (did + Subject + V1)',
            },
            {
              role: 'Subject',
              englishText: 'the liaison',
              nepaliText: 'सम्पर्क अधिकारीले',
              nepaliRoleLabel: 'कर्ता',
            },
            {
              role: 'Object',
              englishText: 'the crisis, but she also strengthened trust.',
              nepaliText: 'सङ्कट, साथै उनले विश्वाससमेत बलियो बनाइन्।',
              nepaliRoleLabel: 'दोस्रो उपवाक्य',
            },
          ],
        },
      ],
      capstoneExercises: [
        {
          id: 'l12-cap-1',
          questionPrompt:
            'Rewrite with C1 Negative Inversion: "The sovereign nation has rarely faced such complex economic crises."',
          nepaliContext: '"Rarely" लाई वाक्यको सुरुमा ल्याउँदा सहायक क्रिया "has" कर्ताभन्दा अगाडि आउँछ:',
          options: [
            'Rarely has the sovereign nation faced such complex economic crises.',
            'Rarely the sovereign nation has faced such complex economic crises.',
            'Rarely did the sovereign nation faced such complex economic crises.',
            'Rarely has the sovereign nation face such complex economic crisises.',
          ],
          correctAnswer: 'Rarely has the sovereign nation faced such complex economic crises.',
          explanationNepali:
            'Inversion सुत्र अनुसार "Rarely + has (Auxiliary) + the sovereign nation (Subject) + faced (V3)" हुन्छ।',
        },
        {
          id: 'l12-cap-2',
          questionPrompt:
            'Complete the formal sentence: "Not only ______ all the selection criteria, but the entrepreneur also exceeded expectations."',
          nepaliContext: 'Past Simple मा "Not only" पछि "did + Subject + V1" प्रयोग हुन्छ:',
          options: [
            'did the proposal meet',
            'the proposal met',
            'did the proposal met',
            'was the proposal meet',
          ],
          correctAnswer: 'did the proposal meet',
          explanationNepali:
            '"Not only" बाट सुरु हुने Past Simple उपवाक्यमा "did + Subject (the proposal) + Base Verb V1 (meet)" प्रयोग गरिन्छ।',
        },
        {
          id: 'l12-cap-3',
          questionPrompt:
            'Which executive-level sentence is 100% accurate in both academic plural usage and C1 grammar?',
          nepaliContext: '"Under no circumstances" को Inversion र "criteria / analyses" को बहुवचन जाँच्नुहोस्:',
          options: [
            'Under no circumstances should these safety criteria be ignored during our laboratory analyses.',
            'Under no circumstances these safety criteria should be ignored during our laboratory analyses.',
            'Under no circumstances should this safety criteria be ignored during our laboratory analysises.',
            'Under no circumstances should these safety criterias be ignored during our laboratory analyses.',
          ],
          correctAnswer: 'Under no circumstances should these safety criteria be ignored during our laboratory analyses.',
          explanationNepali:
            'यसमा "Under no circumstances + should (Auxiliary) + these safety criteria (Plural Subject) + be ignored" र बहुवचन "analyses" पूर्ण रूपमा सही छन्।',
        },
      ],
    },
  },
];
