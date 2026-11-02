import { CEFRLevel, LectureUnit, VocabularyItem, WordSegment } from '../types/curriculum';

export interface EnrichedLexiconItem extends VocabularyItem {
  lectureId: string;
  lectureNumber: number;
  lectureTitle: string;
  category: string;
  level: CEFRLevel;
  isCoreLessonWord?: boolean;
}

interface RootLexiconSeed {
  word: string;
  ipa: string;
  pos: 'noun' | 'verb' | 'adjective' | 'adverb';
  silentLetter?: string;
  silentSummary: string;
  nepali: string;
  translit: string;
  lectureNumber: number;
  exampleEn: string;
  exampleNe: string;
}

// 180 Curated High-Utility Root Words distributed across all 12 Lectures (15 per Lecture)
const CURATED_ROOT_SEEDS: RootLexiconSeed[] = [
  // LECTURE 1 (B1 - Silent Consonants & Action Word Order)
  { word: 'Kneel', ipa: '/niːl/', pos: 'verb', silentLetter: 'K', silentSummary: 'Silent initial "k"', nepali: 'घुँडा टेक्नु', translit: 'Ghũḍā ṭeknu', lectureNumber: 1, exampleEn: 'Pilgrims kneel respectfully at the temple entrance.', exampleNe: 'तीर्थयात्रीहरू मन्दिरको प्रवेशद्वारमा आदरपूर्वक घुँडा टेक्छन्।' },
  { word: 'Knuckle', ipa: '/ˈnʌk.əl/', pos: 'noun', silentLetter: 'K', silentSummary: 'Silent initial "k"', nepali: 'औँलाको जोर्नी', translit: 'Aũlāko jornī', lectureNumber: 1, exampleEn: 'He tapped his knuckle gently on the wooden door.', exampleNe: 'उसले काठको ढोकामा आफ्नो औँलाको जोर्नीले बिस्तारै ढकढक्यायो।' },
  { word: 'Knit', ipa: '/nɪt/', pos: 'verb', silentLetter: 'K', silentSummary: 'Silent initial "k"', nepali: 'बुन्नु (स्वेटर/उनी)', translit: 'Bunnu', lectureNumber: 1, exampleEn: 'Grandmother loves to knit warm woolen scarves in winter.', exampleNe: 'हजुरआमालाई जाडोमा न्यानो उनीको गलबन्दी बुन्न मन पर्छ।' },
  { word: 'Wreck', ipa: '/rek/', pos: 'noun', silentLetter: 'W', silentSummary: 'Silent initial "w"', nepali: 'भग्नावशेष / दुर्घटनाग्रस्त वस्तु', translit: 'Bhagnāvaśeṣ', lectureNumber: 1, exampleEn: 'Divers explored the ancient ship wreck beneath the sea.', exampleNe: 'गोताखोरहरूले समुद्रमुनि प्राचीन जहाजको भग्नावशेष अन्वेषण गरे।' },
  { word: 'Wrestle', ipa: '/ˈres.əl/', pos: 'verb', silentLetter: 'W', silentSummary: 'Silent "w" and silent "t"', nepali: 'कुस्ती खेल्नु / जुध्नु', translit: 'Kustī khelnu', lectureNumber: 1, exampleEn: 'We often wrestle with difficult ethical questions.', exampleNe: 'हामी प्रायः कठिन नैतिक प्रश्नहरूसँग जुध्छौँ।' },
  { word: 'Wrinkle', ipa: '/ˈrɪŋ.kəl/', pos: 'noun', silentLetter: 'W', silentSummary: 'Silent initial "w"', nepali: 'चाउरी / मुजा', translit: 'Chāurī / Mujā', lectureNumber: 1, exampleEn: 'Steam the cotton shirt to remove every wrinkle.', exampleNe: 'प्रत्येक मुजा हटाउन सूतीको कमिजमा बाफ लगाउनुहोस्।' },
  { word: 'Wring', ipa: '/rɪŋ/', pos: 'verb', silentLetter: 'W', silentSummary: 'Silent initial "w"', nepali: 'निचोर्नु (भिजेको कपडा)', translit: 'Nichornu', lectureNumber: 1, exampleEn: 'Please wring out the wet towel before hanging it.', exampleNe: 'भिजेको तौलिया झुन्ड्याउनुअघि कृपया निचोर्नुहोस्।' },
  { word: 'Palm', ipa: '/pɑːm/', pos: 'noun', silentLetter: 'l', silentSummary: 'Silent "l" before "m"', nepali: 'हत्केला / ताडको रूख', translit: 'Hatkelā', lectureNumber: 1, exampleEn: 'She held the small brass coin in her palm.', exampleNe: 'उनले आफ्नो हत्केलामा सानो पित्तलको सिक्का समातिन्।' },
  { word: 'Balm', ipa: '/bɑːm/', pos: 'noun', silentLetter: 'l', silentSummary: 'Silent "l" before "m"', nepali: 'मलहम / शीतलता दिने लेप', translit: 'Malaham', lectureNumber: 1, exampleEn: 'Herbal balm soothes dry skin during cold mountain winds.', exampleNe: 'चिसो पहाडी हावामा जडीबुटीको मलहमले सुख्खा छालालाई आराम दिन्छ।' },
  { word: 'Yolk', ipa: '/jəʊk/', pos: 'noun', silentLetter: 'l', silentSummary: 'Silent "l" before "k"', nepali: 'अण्डाको पहेँलो भाग', translit: 'Aṇḍāko pahẽlo bhāg', lectureNumber: 1, exampleEn: 'Separate the golden egg yolk from the white carefully.', exampleNe: 'अण्डाको पहेँलो भागलाई सेतो भागबाट सावधानीपूर्वक छुट्याउनुहोस्।' },
  { word: 'Folk', ipa: '/fəʊk/', pos: 'noun', silentLetter: 'l', silentSummary: 'Silent "l" before "k"', nepali: 'लोक / जनसाधारण', translit: 'Lok / Janasādhāraṇ', lectureNumber: 1, exampleEn: 'Traditional Nepali folk music celebrates harvest seasons.', exampleNe: 'परम्परागत नेपाली लोक सङ्गीतले बाली भित्र्याउने मौसमको उत्सव मनाउँछ।' },
  { word: 'Chalk', ipa: '/tʃɔːk/', pos: 'noun', silentLetter: 'l', silentSummary: 'Silent "l" before "k"', nepali: 'खरी / चक', translit: 'Kharī / Chak', lectureNumber: 1, exampleEn: 'The teacher wrote the grammar formula with white chalk.', exampleNe: 'शिक्षकले सेतो चकले व्याकरणको सुत्र लेख्नुभयो।' },
  { word: 'Sigh', ipa: '/saɪ/', pos: 'verb', silentLetter: 'gh', silentSummary: 'Silent final "gh"', nepali: 'लामो सुस्केरा हाल्नु', translit: 'Lāmo suskerā hālnu', lectureNumber: 1, exampleEn: 'The students let out a sigh of relief after the exam.', exampleNe: 'परीक्षापछि विद्यार्थीहरूले राहतको लामो सुस्केरा हाले।' },
  { word: 'Thigh', ipa: '/θaɪ/', pos: 'noun', silentLetter: 'gh', silentSummary: 'Silent final "gh"', nepali: 'तिघ्रा', translit: 'Tighrā', lectureNumber: 1, exampleEn: 'Steep uphill trekking strengthens your thigh muscles.', exampleNe: 'उकालो पदयात्राले तपाईंको तिघ्राको मांसपेशी बलियो बनाउँछ।' },
  { word: 'Bough', ipa: '/baʊ/', pos: 'noun', silentLetter: 'gh', silentSummary: 'Silent "gh" (/aʊ/)', nepali: 'रूखको ठूलो हाँगा', translit: 'Rūkhko ṭhūlo hā̃gā', lectureNumber: 1, exampleEn: 'Snow rested heavily on the pine bough.', exampleNe: 'सल्लाको ठूलो हाँगामा बाक्लो हिउँ जमेको थियो।' },

  // LECTURE 2 (B1 - Deceptive Vowels & Prepositions)
  { word: 'Heir', ipa: '/eər/', pos: 'noun', silentLetter: 'H', silentSummary: 'Silent initial "h"', nepali: 'उत्तराधिकारी / हकवाला', translit: 'Uttarādhikārī', lectureNumber: 2, exampleEn: 'She was named the legal heir to the family estate.', exampleNe: 'उनी पारिवारिक सम्पत्तिको कानुनी उत्तराधिकारी घोषित भइन्।' },
  { word: 'Hour', ipa: '/ˈaʊ.ər/', pos: 'noun', silentLetter: 'H', silentSummary: 'Silent initial "h"', nepali: 'घण्टा', translit: 'Ghaṇṭā', lectureNumber: 2, exampleEn: 'The mountain flight takes approximately one hour.', exampleNe: 'पर्वतीय उडानमा करिब एक घण्टा लाग्छ।' },
  { word: 'Honour', ipa: '/ˈɒn.ər/', pos: 'noun', silentLetter: 'H', silentSummary: 'Silent initial "h"', nepali: 'सम्मान / इज्जत', translit: 'Sammān / Ijjat', lectureNumber: 2, exampleEn: 'It is an honour to welcome our guests today.', exampleNe: 'आज हाम्रा पाहुनाहरूलाई स्वागत गर्न पाउनु गौरवको कुरा हो।' },
  { word: 'Ceiling', ipa: '/ˈsiː.lɪŋ/', pos: 'noun', silentSummary: 'EI after C (/iː/)', nepali: 'कोठाको भित्री छत (सिलिङ)', translit: 'Koṭhāko bhitrī chhat', lectureNumber: 2, exampleEn: 'A brass lantern hung from the carved wooden ceiling.', exampleNe: 'कुँदिएको काठको सिलिङबाट पित्तलको लालटिन झुन्डिएको थियो।' },
  { word: 'Deceive', ipa: '/dɪˈsiːv/', pos: 'verb', silentSummary: 'EI after C (/iː/)', nepali: 'धोका दिनु / छक्याउनु', translit: 'Dhokā dinu', lectureNumber: 2, exampleEn: 'Honest merchants never deceive their customers.', exampleNe: 'इमानदार व्यापारीहरूले आफ्ना ग्राहकहरूलाई कहिल्यै धोका दिँदैनन्।' },
  { word: 'Perceive', ipa: '/pəˈsiːv/', pos: 'verb', silentSummary: 'EI after C (/iː/)', nepali: 'अनुभव गर्नु / बुझ्नु', translit: 'Anubhav garnu', lectureNumber: 2, exampleEn: 'Children perceive kindness in a speaker’s tone.', exampleNe: 'बालबालिकाहरूले वक्ताको स्वरमा दयालु भाव महसुस गर्छन्।' },
  { word: 'Conceit', ipa: '/kənˈsiːt/', pos: 'noun', silentSummary: 'EI after C (/iː/)', nepali: 'घमण्ड / अहङ्कार', translit: 'Ghamaṇḍa', lectureNumber: 2, exampleEn: 'True wisdom is free from arrogance and conceit.', exampleNe: 'सच्चा ज्ञान घमण्ड र अहङ्कारबाट मुक्त हुन्छ।' },
  { word: 'Achieve', ipa: '/əˈtʃiːv/', pos: 'verb', silentSummary: 'IE rule (/iː/)', nepali: 'हासिल गर्नु / प्राप्त गर्नु', translit: 'Hāsil garnu', lectureNumber: 2, exampleEn: 'Consistent daily study helps you achieve fluency.', exampleNe: 'निरन्तर दैनिक अध्ययनले तपाईंलाई वाक्पटुता हासिल गर्न मद्दत गर्छ।' },
  { word: 'Relieve', ipa: '/rɪˈliːv/', pos: 'verb', silentSummary: 'IE rule (/iː/)', nepali: 'राहत दिनु / कम गर्नु', translit: 'Rāhat dinu', lectureNumber: 2, exampleEn: 'Warm ginger tea helps relieve a sore throat.', exampleNe: 'तातो अदुवाको चियाले घाँटी दुखेकोमा राहत दिन्छ।' },
  { word: 'Siege', ipa: '/siːdʒ/', pos: 'noun', silentSummary: 'IE rule (/iː/)', nepali: 'घेराबन्दी', translit: 'Gherābandī', lectureNumber: 2, exampleEn: 'The historic fortress withstood a long winter siege.', exampleNe: 'ऐतिहासिक किल्लाले लामो हिउँदे घेराबन्दीको सामना गर्यो।' },
  { word: 'Yield', ipa: '/jiːld/', pos: 'verb', silentSummary: 'IE rule (/iː/)', nepali: 'उत्पादन दिनु / समर्पण गर्नु', translit: 'Utpādan dinu', lectureNumber: 2, exampleEn: 'Fertile terraced fields yield abundant rice harvests.', exampleNe: 'उर्वर सिँढीदार खेतहरूले प्रशस्त धान उत्पादन दिन्छन्।' },
  { word: 'Freight', ipa: '/freɪt/', pos: 'noun', silentLetter: 'gh', silentSummary: 'EI as /eɪ/ + silent "gh"', nepali: 'मालसामान ढुवानी', translit: 'Mālsāmān ḍhuvānī', lectureNumber: 2, exampleEn: 'The cargo train carries heavy industrial freight.', exampleNe: 'मालवाहक रेलले भारी औद्योगिक सामान बोक्छ।' },
  { word: 'Veil', ipa: '/veɪl/', pos: 'noun', silentSummary: 'EI as /eɪ/', nepali: 'घुम्टो / आवरण', translit: 'Ghumṭo / Āvaraṇ', lectureNumber: 2, exampleEn: 'Morning mist formed a silver veil over the lake.', exampleNe: 'बिहानको कुहिरोले तालमाथि चाँदीको आवरण बनायो।' },
  { word: 'Reign', ipa: '/reɪn/', pos: 'noun', silentLetter: 'g', silentSummary: 'EI as /eɪ/ + silent "g"', nepali: 'शासनकाल', translit: 'Śāsanakāl', lectureNumber: 2, exampleEn: 'Art and architecture flourished during the Malla reign.', exampleNe: 'मल्ल शासनकालमा कला र वास्तुकला फस्टाएको थियो।' },
  { word: 'Leisure', ipa: '/ˈleʒ.ər/', pos: 'noun', silentSummary: 'EI exception', nepali: 'फुर्सदको समय', translit: 'Phursadko samaya', lectureNumber: 2, exampleEn: 'She reads historical biographies in her leisure time.', exampleNe: 'उनी आफ्नो फुर्सदको समयमा ऐतिहासिक जीवनीहरू पढ्छिन्।' },

  // LECTURE 3 (B2 - SC/MN/GN Clusters & Doubling)
  { word: 'Fascinate', ipa: '/ˈfæs.ɪ.neɪt/', pos: 'verb', silentLetter: 'c', silentSummary: 'Silent "c" after "s"', nepali: 'मोहित पार्नु / आकर्षित गर्नु', translit: 'Mohit pārnu', lectureNumber: 3, exampleEn: 'Snow-capped Himalayan peaks fascinate travellers worldwide.', exampleNe: 'हिउँले ढाकिएका हिमाली चुचुराहरूले विश्वभरका यात्रुहरूलाई मोहित पार्छन्।' },
  { word: 'Discipline', ipa: '/ˈdɪs.ə.plɪn/', pos: 'noun', silentLetter: 'c', silentSummary: 'Silent "c" after "s"', nepali: 'अनुशासन', translit: 'Anuśāsan', lectureNumber: 3, exampleEn: 'Mastering a second language requires daily discipline.', exampleNe: 'दोस्रो भाषामा दक्षता हासिल गर्न दैनिक अनुशासन चाहिन्छ।' },
  { word: 'Ascend', ipa: '/əˈsend/', pos: 'verb', silentLetter: 'c', silentSummary: 'Silent "c" after "s"', nepali: 'माथि चढ्नु / उक्लनु', translit: 'Māthi chaḍhnu', lectureNumber: 3, exampleEn: 'Climbers ascend slowly to acclimatize to high altitude.', exampleNe: 'आरोहीहरू उच्च उचाइमा घुलमिल हुन बिस्तारै माथि चढ्छन्।' },
  { word: 'Descend', ipa: '/dɪˈsend/', pos: 'verb', silentLetter: 'c', silentSummary: 'Silent "c" after "s"', nepali: 'तल झर्नु / ओर्लनु', translit: 'Tala jharnu', lectureNumber: 3, exampleEn: 'The trail begins to descend steeply toward the river.', exampleNe: 'गोरेटो नदीतर्फ तीव्र रूपमा तल झर्न थाल्छ।' },
  { word: 'Muscle', ipa: '/ˈmʌs.əl/', pos: 'noun', silentLetter: 'c', silentSummary: 'Silent "c" after "s"', nepali: 'मांसपेशी', translit: 'Māṃsapeśī', lectureNumber: 3, exampleEn: 'Stretching before exercise prevents muscle strain.', exampleNe: 'व्यायामअघि शरीर तन्काउनाले मांसपेशी तन्किनबाट जोगाउँछ।' },
  { word: 'Solemn', ipa: '/ˈsɒl.əm/', pos: 'adjective', silentLetter: 'n', silentSummary: 'Silent final "n" after "m"', nepali: 'गम्भीर / औपचारिक र मर्यादित', translit: 'Gambhīr', lectureNumber: 3, exampleEn: 'The judge spoke in a solemn and respectful voice.', exampleNe: 'न्यायाधीशले गम्भीर र सम्मानजनक स्वरमा बोल्नुभयो।' },
  { word: 'Condemn', ipa: '/kənˈdem/', pos: 'verb', silentLetter: 'n', silentSummary: 'Silent final "n" after "m"', nepali: 'निन्दा गर्नु / भत्सर्ना गर्नु', translit: 'Nindā garnu', lectureNumber: 3, exampleEn: 'Civic leaders condemn all forms of corruption.', exampleNe: 'नागरिक अगुवाहरूले सबै प्रकारका भ्रष्टाचारको निन्दा गर्छन्।' },
  { word: 'Hymn', ipa: '/hɪm/', pos: 'noun', silentLetter: 'n', silentSummary: 'Silent final "n" after "m"', nepali: 'भजन / स्तुतिगान', translit: 'Bhajan / Stutigān', lectureNumber: 3, exampleEn: 'A peaceful morning hymn echoed from the monastery.', exampleNe: 'गुम्बाबाट शान्त बिहानी भजन गुन्जियो।' },
  { word: 'Assign', ipa: '/əˈsaɪn/', pos: 'verb', silentLetter: 'g', silentSummary: 'Silent "g" before "n"', nepali: 'जिम्मा दिनु / तोक्नु', translit: 'Jimmā dinu', lectureNumber: 3, exampleEn: 'The supervisor will assign specific tasks to each member.', exampleNe: 'सुपरिवेक्षकले प्रत्येक सदस्यलाई निश्चित कामको जिम्मा दिनुहुनेछ।' },
  { word: 'Align', ipa: '/əˈlaɪn/', pos: 'verb', silentLetter: 'g', silentSummary: 'Silent "g" before "n"', nepali: 'एउटै रेखा वा उद्देश्यमा मिलाउनु', translit: 'Milāunu', lectureNumber: 3, exampleEn: 'We must align our budget with community priorities.', exampleNe: 'हामीले हाम्रो बजेटलाई सामुदायिक प्राथमिकताहरूसँग मिलाउनुपर्छ।' },
  { word: 'Benign', ipa: '/bɪˈnaɪn/', pos: 'adjective', silentLetter: 'g', silentSummary: 'Silent "g" before "n"', nepali: 'सौम्य / हानि नगर्ने', translit: 'Saumya / Hāni nagarne', lectureNumber: 3, exampleEn: 'The doctor confirmed that the condition was completely benign.', exampleNe: 'डाक्टरले अवस्था पूर्ण रूपमा हानिरहित रहेको पुष्टि गर्नुभयो।' },
  { word: 'Design', ipa: '/dɪˈzaɪn/', pos: 'noun', silentLetter: 'g', silentSummary: 'Silent "g" before "n"', nepali: 'ढाँचा / नक्सा / डिजाइन', translit: 'Ḍhā̃chā / Naksā', lectureNumber: 3, exampleEn: 'The earthquake-resistant school design won an award.', exampleNe: 'भूकम्प-प्रतिरोधी विद्यालयको नक्साले पुरस्कार जित्यो।' },
  { word: 'Guilt', ipa: '/ɡɪlt/', pos: 'noun', silentLetter: 'u', silentSummary: 'Silent "u" after "g"', nepali: 'अपराधबोध / दोष', translit: 'Aparādhabodh / Doṣ', lectureNumber: 3, exampleEn: 'Speaking the truth freed him from feelings of guilt.', exampleNe: 'सत्य बोल्नाले उसलाई अपराधबोधको भावनाबाट मुक्त गर्यो।' },
  { word: 'Disguise', ipa: '/dɪsˈɡaɪz/', pos: 'noun', silentLetter: 'u', silentSummary: 'Silent "u" after "g"', nepali: 'भेष बदल्नु / छद्मभेष', translit: 'Bheṣ badalnu', lectureNumber: 3, exampleEn: 'The detective travelled in disguise to observe the market.', exampleNe: 'जासुसले बजारको अवलोकन गर्न भेष बदलेर यात्रा गरे।' },
  { word: 'Guidance', ipa: '/ˈɡaɪ.dəns/', pos: 'noun', silentLetter: 'u', silentSummary: 'Silent "u" after "g"', nepali: 'मार्गदर्शन / सल्लाह', translit: 'Mārgadarśan', lectureNumber: 3, exampleEn: 'Students benefited from the professor’s career guidance.', exampleNe: 'विद्यार्थीहरूले प्राध्यापकको वृत्ति मार्गदर्शनबाट लाभ उठाए।' },

  // LECTURE 4 (B2 - Workplace Loanwords & Politeness)
  { word: 'Aisle', ipa: '/aɪl/', pos: 'noun', silentLetter: 's', silentSummary: 'Silent "s" and initial "a"', nepali: 'सिटहरू बीचको हिँड्ने बाटो', translit: 'Siṭharū bīchko bāṭo', lectureNumber: 4, exampleEn: 'Would you prefer a window seat or an aisle seat?', exampleNe: 'तपाईं झ्यालको सिट रोज्नुहुन्छ कि बाटो छेउको (aisle) सिट?' },
  { word: 'Debris', ipa: '/ˈdeb.riː/', pos: 'noun', silentLetter: 's', silentSummary: 'Silent final "s"', nepali: 'भग्नावशेष / टुक्राटाक्री', translit: 'Bhagnāvaśeṣ', lectureNumber: 4, exampleEn: 'Engineers inspected the bridge after clearing storm debris.', exampleNe: 'आँधीको भग्नावशेष हटाएपछि इन्जिनियरहरूले पुलको निरीक्षण गरे।' },
  { word: 'Depot', ipa: '/ˈdep.əʊ/', pos: 'noun', silentLetter: 't', silentSummary: 'Silent final "t"', nepali: 'बसपार्क वा गोदाम (डिपो)', translit: 'Godām / Dipo', lectureNumber: 4, exampleEn: 'Electric buses recharge overnight at the central depot.', exampleNe: 'विद्युतीय बसहरू केन्द्रीय डिपोमा रातभरि चार्ज हुन्छन्।' },
  { word: 'Rapport', ipa: '/ræˈpɔːr/', pos: 'noun', silentLetter: 't', silentSummary: 'Silent final "t"', nepali: 'आत्मीय र सुमधुर सम्बन्ध', translit: 'Sumadhur sambandha', lectureNumber: 4, exampleEn: 'The teacher built strong rapport with her students.', exampleNe: 'शिक्षिकाले आफ्ना विद्यार्थीहरूसँग सुमधुर सम्बन्ध बनाउनुभयो।' },
  { word: 'Ballet', ipa: '/ˈbæl.eɪ/', pos: 'noun', silentLetter: 't', silentSummary: 'Silent final "t"', nepali: 'ब्याले नृत्य', translit: 'Byāle nṛtya', lectureNumber: 4, exampleEn: 'The cultural theatre hosted an international ballet troupe.', exampleNe: 'सांस्कृतिक नाचघरले अन्तर्राष्ट्रिय ब्याले नृत्य टोलीको आयोजना गर्यो।' },
  { word: 'Psychiatrist', ipa: '/saɪˈkaɪ.ə.trɪst/', pos: 'noun', silentLetter: 'P', silentSummary: 'Silent initial "p"', nepali: 'मनोचिकित्सक', translit: 'Manochikitsak', lectureNumber: 4, exampleEn: 'The psychiatrist emphasized healthy sleep and stress management.', exampleNe: 'मनोचिकित्सकले स्वस्थ निद्रा र तनाव व्यवस्थापनमा जोड दिनुभयो।' },
  { word: 'Pseudonym', ipa: '/ˈsjuː.də.nɪm/', pos: 'noun', silentLetter: 'P', silentSummary: 'Silent initial "p"', nepali: 'उपनाम / साहित्यिक छद्म नाम', translit: 'Upanām', lectureNumber: 4, exampleEn: 'The novelist published her early essays under a pseudonym.', exampleNe: 'उपन्यासकारले आफ्ना प्रारम्भिक निबन्धहरू उपनामबाट प्रकाशित गरिन्।' },
  { word: 'Ledger', ipa: '/ˈledʒ.ər/', pos: 'noun', silentLetter: 'd', silentSummary: 'Silent "d" before "g"', nepali: 'हिसाबकिताब राख्ने खाता (लेजर)', translit: 'Hisāb khātā', lectureNumber: 4, exampleEn: 'Every transaction was recorded in the accounting ledger.', exampleNe: 'प्रत्येक कारोबार लेखा खातामा दर्ता गरिएको थियो।' },
  { word: 'Budget', ipa: '/ˈbʌdʒ.ɪt/', pos: 'noun', silentLetter: 'd', silentSummary: 'Silent "d" before "g"', nepali: 'बजेट / आय-व्यय अनुमान', translit: 'Bajeṭ', lectureNumber: 4, exampleEn: 'The municipality approved the annual education budget.', exampleNe: 'नगरपालिकाले वार्षिक शिक्षा बजेट स्वीकृत गर्यो।' },
  { word: 'Pledge', ipa: '/pledʒ/', pos: 'verb', silentLetter: 'd', silentSummary: 'Silent "d" before "ge"', nepali: 'प्रतिज्ञा गर्नु / वाचा गर्नु', translit: 'Pratijñā garnu', lectureNumber: 4, exampleEn: 'Member nations pledge to reduce carbon emissions.', exampleNe: 'सदस्य राष्ट्रहरूले कार्बन उत्सर्जन घटाउने प्रतिज्ञा गर्छन्।' },
  { word: 'Recommend', ipa: '/ˌrek.əˈmend/', pos: 'verb', silentSummary: '1 C, double MM', nepali: 'सिफारिस गर्नु', translit: 'Siphāris garnu', lectureNumber: 4, exampleEn: 'Can you recommend a reliable trekking guide in Pokhara?', exampleNe: 'के तपाईं पोखरामा भरपर्दो पदयात्रा गाइड सिफारिस गर्न सक्नुहुन्छ?' },
  { word: 'Committee', ipa: '/kəˈmɪt.i/', pos: 'noun', silentSummary: 'Double MM, double TT, double EE', nepali: 'समिति', translit: 'Samiti', lectureNumber: 4, exampleEn: 'The advisory committee reviewed all scholarship applications.', exampleNe: 'सल्लाहकार समितिले सबै छात्रवृत्ति आवेदनहरूको पुनरावलोकन गर्यो।' },
  { word: 'Embarrass', ipa: '/ɪmˈbær.əs/', pos: 'verb', silentSummary: 'Double RR, double SS', nepali: 'लज्जित पार्नु / अप्ठ्यारोमा पार्नु', translit: 'Lajjit pārnu', lectureNumber: 4, exampleEn: 'A polite mentor corrects mistakes without trying to embarrass anyone.', exampleNe: 'एक शिष्ट प्रशिक्षकले कसैलाई लज्जित नपारी गल्तीहरू सच्याउनुहुन्छ।' },
  { word: 'Occurrence', ipa: '/əˈkʌr.əns/', pos: 'noun', silentSummary: 'Double CC, double RR', nepali: 'घटना', translit: 'Ghaṭanā', lectureNumber: 4, exampleEn: 'Afternoon rain is a common occurrence during monsoon.', exampleNe: 'मनसुनको समयमा दिउँसो पानी पर्नु एक सामान्य घटना हो।' },
  { word: 'Millennium', ipa: '/mɪˈlen.i.əm/', pos: 'noun', silentSummary: 'Double LL, double NN', nepali: 'एक हजार वर्षको अवधि (सहस्राब्दी)', translit: 'Sahasrābdī', lectureNumber: 4, exampleEn: 'Kathmandu Valley temples have stood for over a millennium.', exampleNe: 'काठमाडौँ उपत्यकाका मन्दिरहरू एक हजार वर्षभन्दा बढी समयदेखि उभिएका छन्।' },

  // LECTURE 5 (B2 - Schwa Reduction & Relative Clauses)
  { word: 'Vegetable', ipa: '/ˈvedʒ.tə.bəl/', pos: 'noun', silentLetter: 'e', silentSummary: 'Compressed middle "e" (3 syllables)', nepali: 'तरकारी / सागसब्जी', translit: 'Tarakārī', lectureNumber: 5, exampleEn: 'Fresh organic vegetable farming supports local farmers.', exampleNe: 'ताजा प्राङ्गारिक तरकारी खेतीले स्थानीय किसानहरूलाई टेवा पुर्याउँछ।' },
  { word: 'Temperature', ipa: '/ˈtem.prə.tʃər/', pos: 'noun', silentLetter: 'e', silentSummary: 'Compressed first "e" after "p"', nepali: 'तापक्रम', translit: 'Tāpkram', lectureNumber: 5, exampleEn: 'The winter temperature drops below freezing at night.', exampleNe: 'हिउँदको तापक्रम राति शून्यभन्दा तल झर्छ।' },
  { word: 'Literature', ipa: '/ˈlɪt.rə.tʃər/', pos: 'noun', silentLetter: 'e', silentSummary: 'Compressed middle "e"', nepali: 'साहित्य', translit: 'Sāhitya', lectureNumber: 5, exampleEn: 'Modern Nepali literature explores themes of migration and identity.', exampleNe: 'आधुनिक नेपाली साहित्यले बसाइँसराइ र पहिचानका विषयवस्तुहरू खोतल्छ।' },
  { word: 'Laboratory', ipa: '/ləˈbɒr.ə.tri/', pos: 'noun', silentLetter: 'o', silentSummary: 'Compressed unstressed "o"', nepali: 'प्रयोगशाला', translit: 'Prayogśālā', lectureNumber: 5, exampleEn: 'Water samples were tested in the university laboratory.', exampleNe: 'विश्वविद्यालयको प्रयोगशालामा पानीका नमुनाहरू परीक्षण गरियो।' },
  { word: 'Parliament', ipa: '/ˈpɑː.lə.mənt/', pos: 'noun', silentLetter: 'i', silentSummary: 'Silent "i" in "-lia-"', nepali: 'संसद', translit: 'Saṃsad', lectureNumber: 5, exampleEn: 'The bill was debated extensively in parliament.', exampleNe: 'संसदमा विधेयकमाथि व्यापक छलफल भयो।' },
  { word: 'Miniature', ipa: '/ˈmɪn.ə.tʃər/', pos: 'adjective', silentLetter: 'i', silentSummary: 'Compressed middle "i"', nepali: 'सूक्ष्म आकारको / सानो रूपको', translit: 'Sūkṣma ākārko', lectureNumber: 5, exampleEn: 'The museum displays miniature paintings from Bhaktapur.', exampleNe: 'सङ्ग्रहालयमा भक्तपुरका सूक्ष्म चित्रकलाहरू राखिएका छन्।' },
  { word: 'Separate', ipa: '/ˈsep.ər.ət/', pos: 'adjective', silentSummary: 'Spelled "sep-A-rate" (with A)', nepali: 'छुट्टै / अलग', translit: 'Chhuṭṭai / Alag', lectureNumber: 5, exampleEn: 'Please keep personal and business expenses in separate accounts.', exampleNe: 'कृपया व्यक्तिगत र व्यावसायिक खर्चहरू छुट्टाछुट्टै खातामा राख्नुहोस्।' },
  { word: 'Definite', ipa: '/ˈdef.ɪ.nət/', pos: 'adjective', silentSummary: 'Spelled "-nite" (no A)', nepali: 'निश्चित / पक्का', translit: 'Niśchit / Pakkā', lectureNumber: 5, exampleEn: 'We need a definite date for the project handover.', exampleNe: 'हामीलाई परियोजना हस्तान्तरणको लागि निश्चित मिति चाहिन्छ।' },
  { word: 'Maintenance', ipa: '/ˈmeɪn.tən.əns/', pos: 'noun', silentSummary: 'Spelled "main-TEN-ance"', nepali: 'मर्मतसम्भार', translit: 'Marmatsambhār', lectureNumber: 5, exampleEn: 'Regular highway maintenance prevents monsoon roadblocks.', exampleNe: 'नियमित राजमार्ग मर्मतसम्भारले मनसुनको सडक अवरोध रोक्छ।' },
  { word: 'Privilege', ipa: '/ˈprɪv.əl.ɪdʒ/', pos: 'noun', silentSummary: 'No "d" before "g"', nepali: 'विशेषाधिकार / सौभाग्य', translit: 'Viśeṣādhikār', lectureNumber: 5, exampleEn: 'Access to clean drinking water is a right, not a privilege.', exampleNe: 'स्वच्छ खानेपानीमा पहुँच अधिकार हो, विशेषाधिकार होइन।' },
  { word: 'Accessible', ipa: '/əkˈses.ə.bəl/', pos: 'adjective', silentSummary: 'Double CC, double SS, -ible', nepali: 'पहुँचयोग्य / सजिलै पुग्न सकिने', translit: 'Pahũchyogya', lectureNumber: 5, exampleEn: 'Public libraries should be accessible to every citizen.', exampleNe: 'सार्वजनिक पुस्तकालयहरू प्रत्येक नागरिकको पहुँचमा हुनुपर्छ।' },
  { word: 'Dependable', ipa: '/dɪˈpen.də.bəl/', pos: 'adjective', silentSummary: 'Root word + -able', nepali: 'भरपर्दो / विश्वासिलो', translit: 'Bharpardo', lectureNumber: 5, exampleEn: 'Solar micro-grids provide dependable electricity in remote villages.', exampleNe: 'सोलार माइक्रो-ग्रिडले दुर्गम गाउँहरूमा भरपर्दो बिजुली प्रदान गर्छ।' },
  { word: 'Accountable', ipa: '/əˈkaʊn.tə.bəl/', pos: 'adjective', silentSummary: 'Double CC + -able', nepali: 'जवाफदेही / उत्तरदायी', translit: 'Javāphdehī', lectureNumber: 5, exampleEn: 'Public officials must remain accountable to the people.', exampleNe: 'सार्वजनिक पदाधिकारीहरू जनताप्रति जवाफदेही रहनुपर्छ।' },
  { word: 'Sustainable', ipa: '/səˈsteɪ.nə.bəl/', pos: 'adjective', silentSummary: 'Root sustain + -able', nepali: 'दिगो / दीर्घकालीन', translit: 'Digo', lectureNumber: 5, exampleEn: 'Eco-tourism creates sustainable income for mountain communities.', exampleNe: 'पर्या-पर्यटनले हिमाली समुदायका लागि दिगो आम्दानी सिर्जना गर्छ।' },
  { word: 'Indispensable', ipa: '/ˌɪn.dɪˈspen.sə.bəl/', pos: 'adjective', silentSummary: 'Spelled with -sable', nepali: 'अपरिहार्य / अति आवश्यक', translit: 'Aparihārya', lectureNumber: 5, exampleEn: 'A good bilingual dictionary is indispensable for translators.', exampleNe: 'अनुवादकहरूका लागि राम्रो द्विभाषी शब्दकोश अपरिहार्य हुन्छ।' },

  // LECTURE 6 (C1 - Confusables & Conditionals)
  { word: 'Rhyme', ipa: '/raɪm/', pos: 'noun', silentLetter: 'h', silentSummary: 'Silent "h" after "r"', nepali: 'अनुप्रास / तुकबन्दी', translit: 'Anuprās / Tukbandī', lectureNumber: 6, exampleEn: 'Children remember vocabulary easily through song and rhyme.', exampleNe: 'बालबालिकाहरूले गीत र तुकबन्दीमार्फत शब्दावली सजिलै सम्झन्छन्।' },
  { word: 'Rhubarb', ipa: '/ˈruː.bɑːb/', pos: 'noun', silentLetter: 'h', silentSummary: 'Silent "h" after "r"', nepali: 'पदमचाल (एक प्रकारको अमिलो जडीबुटी)', translit: 'Padamchāl', lectureNumber: 6, exampleEn: 'Himalayan rhubarb grows wild on high rocky slopes.', exampleNe: 'हिमाली पदमचाल उच्च चट्टानी पाखाहरूमा आफैँ उम्रन्छ।' },
  { word: 'Pneumatic', ipa: '/njuːˈmæt.ɪk/', pos: 'adjective', silentLetter: 'P', silentSummary: 'Silent initial "p"', nepali: 'हावाको चापले चल्ने', translit: 'Hāvāko chāple chalne', lectureNumber: 6, exampleEn: 'Workers used pneumatic drills to construct the tunnel.', exampleNe: 'कामदारहरूले सुरुङ निर्माण गर्न हावाको चापले चल्ने ड्रिल प्रयोग गरे।' },
  { word: 'Psalm', ipa: '/sɑːm/', pos: 'noun', silentLetter: 'P', silentSummary: 'Silent "p" and silent "l"', nepali: 'भजन / धार्मिक स्तोत्र', translit: 'Dhārmik stotra', lectureNumber: 6, exampleEn: 'The choir sang an ancient psalm in harmony.', exampleNe: 'गायक समूहले एक स्वरमा प्राचीन भजन गाए।' },
  { word: 'Wholesome', ipa: '/ˈhəʊl.səm/', pos: 'adjective', silentLetter: 'W', silentSummary: 'Silent initial "w"', nepali: 'स्वस्थकर / पौष्टिक र हितकारी', translit: 'Swasthakar', lectureNumber: 6, exampleEn: 'Millet and lentil soup is a wholesome traditional meal.', exampleNe: 'कोदो र दालको झोल एक पौष्टिक परम्परागत खाना हो।' },
  { word: 'Stationery', ipa: '/ˈsteɪ.ʃən.ər.i/', pos: 'noun', silentSummary: '-ERY = paper & pens', nepali: 'कागज, कलम र कार्यालय सामग्री', translit: 'Kāgaj-kalam sāmagrī', lectureNumber: 6, exampleEn: 'We ordered notebooks and office stationery for the seminar.', exampleNe: 'हामीले गोष्ठीका लागि कापी र कार्यालय सामग्री मगायौँ।' },
  { word: 'Stationary', ipa: '/ˈsteɪ.ʃən.ər.i/', pos: 'adjective', silentSummary: '-ARY = not moving', nepali: 'स्थिर / नचल्ने', translit: 'Sthir / Nachalne', lectureNumber: 6, exampleEn: 'Wait until the bus is completely stationary before stepping off.', exampleNe: 'बसबाट ओर्लनुअघि बस पूर्ण रूपमा स्थिर नहुन्जेल पर्खनुहोस्।' },
  { word: 'Discreet', ipa: '/dɪˈskriːt/', pos: 'adjective', silentSummary: '-EET = careful/tactful', nepali: 'गोप्यता राख्ने / सावधान र नम्र', translit: 'Gopyatā rākhne', lectureNumber: 6, exampleEn: 'Diplomats must remain discreet during sensitive negotiations.', exampleNe: 'संवेदनशील वार्ताका क्रममा कूटनीतिज्ञहरू गोपनीय र सावधान रहनुपर्छ।' },
  { word: 'Discrete', ipa: '/dɪˈskriːt/', pos: 'adjective', silentSummary: '-ETE = separate/distinct', nepali: 'छुट्टाछुट्टै / भिन्न', translit: 'Chhuṭṭāchhuṭṭai', lectureNumber: 6, exampleEn: 'The curriculum is divided into four discrete learning modules.', exampleNe: 'पाठ्यक्रमलाई चार छुट्टाछुट्टै सिकाइ मोड्युलहरूमा विभाजन गरिएको छ।' },
  { word: 'Elicit', ipa: '/ɪˈlɪs.ɪt/', pos: 'verb', silentSummary: 'E- = draw out a response', nepali: 'जवाफ वा तथ्य बाहिर निकाल्नु', translit: 'Javāph nikālnu', lectureNumber: 6, exampleEn: 'Good teachers ask open questions to elicit thoughtful answers.', exampleNe: 'राम्रा शिक्षकहरूले विचारशील उत्तरहरू निकाल्न खुला प्रश्नहरू सोध्छन्।' },
  { word: 'Illicit', ipa: '/ɪˈlɪs.ɪt/', pos: 'adjective', silentSummary: 'IL- = illegal/forbidden', nepali: 'गैरकानुनी / अवैध', translit: 'Gairkānunī', lectureNumber: 6, exampleEn: 'Customs officers monitor the border to stop illicit trade.', exampleNe: 'भन्सार अधिकृतहरूले अवैध व्यापार रोक्न सिमानाको निगरानी गर्छन्।' },
  { word: 'Imminent', ipa: '/ˈɪm.ɪ.nənt/', pos: 'adjective', silentSummary: 'IM- = about to happen soon', nepali: 'आसन्न / अब चाँडै हुन लागेको', translit: 'Āsanna', lectureNumber: 6, exampleEn: 'Dark clouds signaled that a heavy thunderstorm was imminent.', exampleNe: 'कालो बादलले भारी हावाहुरी र वर्षा आसन्न रहेको सङ्केत गर्यो।' },
  { word: 'Eminent', ipa: '/ˈem.ɪ.nənt/', pos: 'adjective', silentSummary: 'E- = famous and respected', nepali: 'प्रख्यात / विशिष्ट', translit: 'Prakhyāt / Viśiṣṭa', lectureNumber: 6, exampleEn: 'An eminent historian delivered the keynote lecture.', exampleNe: 'एक विशिष्ट इतिहासकारले मुख्य प्रवचन दिनुभयो।' },
  { word: 'Precedent', ipa: '/ˈpres.ɪ.dənt/', pos: 'noun', silentSummary: 'prior example/legal rule', nepali: 'नजिर / पूर्व उदाहरण', translit: 'Najir', lectureNumber: 6, exampleEn: 'The Supreme Court ruling set an important legal precedent.', exampleNe: 'सर्वोच्च अदालतको फैसलाले एक महत्त्वपूर्ण कानुनी नजिर स्थापित गर्यो।' },
  { word: 'Conscientious', ipa: '/ˌkɒn.ʃiˈen.ʃəs/', pos: 'adjective', silentSummary: 'sci + -tious', nepali: 'कर्तव्यनिष्ठ / इमानदार र मेहनती', translit: 'Kartavyaniṣṭha', lectureNumber: 6, exampleEn: 'A conscientious researcher verifies every source twice.', exampleNe: 'एक कर्तव्यनिष्ठ अनुसन्धानकर्ताले प्रत्येक स्रोतलाई दुई पटक जाँच्छन्।' },

  // LECTURE 7 (B1 - Silent MB/STL, Plurals & Causatives)
  { word: 'Climb', ipa: '/klaɪm/', pos: 'verb', silentLetter: 'b', silentSummary: 'Silent final "b"', nepali: 'चढ्नु / आरोहण गर्नु', translit: 'Chaḍhnu', lectureNumber: 7, exampleEn: 'Trekkers climb gradually toward the high mountain pass.', exampleNe: 'पदयात्रीहरू उच्च हिमाली भन्ज्याङतर्फ बिस्तारै चढ्छन्।' },
  { word: 'Comb', ipa: '/kəʊm/', pos: 'noun', silentLetter: 'b', silentSummary: 'Silent final "b"', nepali: 'काइँयो / कपाल कोर्नु', translit: 'Kāĩyo', lectureNumber: 7, exampleEn: 'He used a wooden comb to neat his hair.', exampleNe: 'उसले कपाल मिलाउन काठको काइँयो प्रयोग गर्यो।' },
  { word: 'Crumb', ipa: '/krʌm/', pos: 'noun', silentLetter: 'b', silentSummary: 'Silent final "b"', nepali: 'रोटी वा बिस्कुटको टुक्रा (कण)', translit: 'Roṭīko ṭukrā', lectureNumber: 7, exampleEn: 'Sparrows hopped across the courtyard to pick up every bread crumb.', exampleNe: 'चराहरू रोटीको प्रत्येक टुक्रा टिप्न आँगनभरि उफ्रिए।' },
  { word: 'Lamb', ipa: '/læm/', pos: 'noun', silentLetter: 'b', silentSummary: 'Silent final "b"', nepali: 'भेडाको पाठो', translit: 'Bheḍāko pāṭho', lectureNumber: 7, exampleEn: 'The shepherd carried the newborn lamb across the stream.', exampleNe: 'गोठालोले भर्खरै जन्मिएको भेडाको पाठोलाई खोला पारि बोकेर लगे।' },
  { word: 'Limb', ipa: '/lɪm/', pos: 'noun', silentLetter: 'b', silentSummary: 'Silent final "b"', nepali: 'अङ्ग (हात वा खुट्टा) / रूखको हाँगा', translit: 'Aṅga', lectureNumber: 7, exampleEn: 'The doctor examined the patient’s injured limb carefully.', exampleNe: 'डाक्टरले बिरामीको घाइते अङ्गको सावधानीपूर्वक जाँच गर्नुभयो।' },
  { word: 'Numb', ipa: '/nʌm/', pos: 'adjective', silentLetter: 'b', silentSummary: 'Silent final "b"', nepali: 'लाटो भएको / शून्य (चिसोले)', translit: 'Lāṭo bhaeko', lectureNumber: 7, exampleEn: 'My fingers felt numb after walking in the snow.', exampleNe: 'हिउँमा हिँडेपछि मेरा औँलाहरू चिसोले लाटो भए।' },
  { word: 'Tomb', ipa: '/tuːm/', pos: 'noun', silentLetter: 'b', silentSummary: 'Silent final "b" ("o" = /uː/)', nepali: 'समाधि / चिहान', translit: 'Samādhi', lectureNumber: 7, exampleEn: 'Archaeologists discovered an ancient royal tomb.', exampleNe: 'पुरातत्त्वविद्हरूले एउटा प्राचीन शाही समाधि फेला पारे।' },
  { word: 'Listen', ipa: '/ˈlɪs.ən/', pos: 'verb', silentLetter: 't', silentSummary: 'Silent "t" in "-sten"', nepali: 'सुन्नु / ध्यान दिएर सुन्नु', translit: 'Sunnu', lectureNumber: 7, exampleEn: 'Listen closely to how native speakers stress each syllable.', exampleNe: 'मूल भाषीहरूले प्रत्येक अक्षरमा कसरी जोड दिन्छन् भनी ध्यान दिएर सुन्नुहोस्।' },
  { word: 'Hasten', ipa: '/ˈheɪ.sən/', pos: 'verb', silentLetter: 't', silentSummary: 'Silent "t" in "-sten"', nepali: 'हतार गर्नु / गति बढाउनु', translit: 'Hatār garnu', lectureNumber: 7, exampleEn: 'Good irrigation will hasten the growth of winter crops.', exampleNe: 'राम्रो सिँचाइले हिउँदे बालीको वृद्धिलाई तीव्र बनाउनेछ।' },
  { word: 'Soften', ipa: '/ˈsɒf.ən/', pos: 'verb', silentLetter: 't', silentSummary: 'Silent "t" in "-ften"', nepali: 'नरम बनाउनु', translit: 'Naram banāunu', lectureNumber: 7, exampleEn: 'Soak the dried beans overnight to soften them.', exampleNe: 'सुकेको गेडागुडीलाई नरम बनाउन रातभरि भिजाउनुहोस्।' },
  { word: 'Rustle', ipa: '/ˈrʌs.əl/', pos: 'verb', silentLetter: 't', silentSummary: 'Silent "t" in "-stle"', nepali: 'पात सरसर बज्नु', translit: 'Pāt sarsar bajnu', lectureNumber: 7, exampleEn: 'Dry bamboo leaves rustle softly in the evening breeze.', exampleNe: 'साँझको हावामा सुकेका बाँसका पातहरू सरसर बज्छन्।' },
  { word: 'Hustle', ipa: '/ˈhʌs.əl/', pos: 'noun', silentLetter: 't', silentSummary: 'Silent "t" in "-stle"', nepali: 'चहलपहल / व्यस्त दौडधुप', translit: 'Chahalpahal', lectureNumber: 7, exampleEn: 'She enjoys the lively hustle of Asan market.', exampleNe: 'उनलाई असन बजारको जीवन्त चहलपहल मन पर्छ।' },
  { word: 'Jostle', ipa: '/ˈdʒɒs.əl/', pos: 'verb', silentLetter: 't', silentSummary: 'Silent "t" in "-stle"', nepali: 'ठेलाठेल गर्नु / धकेलाधकेल गर्नु', translit: 'Ṭhelāṭhel garnu', lectureNumber: 7, exampleEn: 'Commuters jostle for space during rush hour.', exampleNe: 'व्यस्त समयमा यात्रुहरू ठाउँका लागि ठेलाठेल गर्छन्।' },
  { word: 'Thistle', ipa: '/ˈθɪs.əl/', pos: 'noun', silentLetter: 't', silentSummary: 'Silent "t" in "-stle"', nepali: 'काँडे झार', translit: 'Kā̃ḍe jhār', lectureNumber: 7, exampleEn: 'Purple wild thistle blooms along the mountain pasture.', exampleNe: 'हिमाली खर्कको छेउछाउ बैजनी काँडे फूल फुल्छ।' },
  { word: 'Apostle', ipa: '/əˈpɒs.əl/', pos: 'noun', silentLetter: 't', silentSummary: 'Silent "t" in "-stle"', nepali: 'दूत / प्रमुख प्रचारक', translit: 'Dūt / Prachārak', lectureNumber: 7, exampleEn: 'He was regarded as an apostle of non-violence and peace.', exampleNe: 'उहाँलाई अहिंसा र शान्तिको दूत मानिन्थ्यो।' },

  // LECTURE 8 (B1 - Culinary Loanwords, CE/SE & Quantifiers)
  { word: 'Bouquet', ipa: '/buˈkeɪ/', pos: 'noun', silentLetter: 't', silentSummary: 'Silent final French "t"', nepali: 'फूलको गुच्छा', translit: 'Phūlko guchchhā', lectureNumber: 8, exampleEn: 'They presented a bouquet of marigolds to the chief guest.', exampleNe: 'उनीहरूले प्रमुख अतिथिलाई सयपत्री फूलको गुच्छा टक्र्याए।' },
  { word: 'Sorbet', ipa: '/ˈsɔː.beɪ/', pos: 'noun', silentLetter: 't', silentSummary: 'Silent final French "t"', nepali: 'फलफूलको बरफ मिठाई (सर्बेट)', translit: 'Phalphūlko baraph', lectureNumber: 8, exampleEn: 'Refreshing mango sorbet was served after dinner.', exampleNe: 'बेलुकाको खानापछि ताजा आँपको सर्बेट पस्कियो।' },
  { word: 'Sachet', ipa: '/ˈsæʃ.eɪ/', pos: 'noun', silentLetter: 't', silentSummary: 'Silent final French "t"', nepali: 'सानो प्याकेट / पुडिया', translit: 'Sāno pyākeṭ', lectureNumber: 8, exampleEn: 'Dissolve one sachet of oral rehydration salts in clean water.', exampleNe: 'सफा पानीमा जीवनजलको एक पुडिया घोल्नुहोस्।' },
  { word: 'Chalet', ipa: '/ˈʃæl.eɪ/', pos: 'noun', silentLetter: 't', silentSummary: 'Silent final French "t"', nepali: 'पहाडी काठको घर (च्याले)', translit: 'Pahāḍī kāṭhko ghar', lectureNumber: 8, exampleEn: 'The trekkers stayed in a warm wooden chalet overlooking the valley.', exampleNe: 'पदयात्रीहरू उपत्यका देखिने न्यानो काठको घरमा बसे।' },
  { word: 'Croquet', ipa: '/ˈkrəʊ.keɪ/', pos: 'noun', silentLetter: 't', silentSummary: 'Silent final French "t"', nepali: 'क्रोके खेल', translit: 'Kroke khel', lectureNumber: 8, exampleEn: 'Guests played croquet on the green hotel lawn.', exampleNe: 'पाहुनाहरूले होटेलको हरियो चौरमा क्रोके खेले।' },
  { word: 'Recipe', ipa: '/ˈres.ɪ.pi/', pos: 'noun', silentSummary: 'Final "e" IS pronounced (/pi/)', nepali: 'परिकार बनाउने विधि (रेसिपी)', translit: 'Parikār banāune vidhi', lectureNumber: 8, exampleEn: 'She shared her grandmother’s secret pickle recipe.', exampleNe: 'उनले आफ्नी हजुरआमाको गोप्य अचार बनाउने विधि सुनाइन्।' },
  { word: 'Circuit', ipa: '/ˈsɜː.kɪt/', pos: 'noun', silentLetter: 'u', silentSummary: 'Silent "u" in "-cuit"', nepali: 'परिपथ / घुमाउरो पदमार्ग', translit: 'Paripath / Padamārga', lectureNumber: 8, exampleEn: 'The Annapurna circuit is one of the world’s finest treks.', exampleNe: 'अन्नपूर्ण सर्किट विश्वका उत्कृष्ट पदयात्राहरूमध्ये एक हो।' },
  { word: 'Conduit', ipa: '/ˈkɒn.dwɪt/', pos: 'noun', silentLetter: 'u', silentSummary: 'Compressed "-ui-"', nepali: 'पाइप / माध्यम वा नली', translit: 'Mādhyam / Nalī', lectureNumber: 8, exampleEn: 'Small cooperatives serve as a conduit for rural credit.', exampleNe: 'साना सहकारीहरूले ग्रामीण कर्जाको माध्यमको रूपमा काम गर्छन्।' },
  { word: 'Luggage', ipa: '/ˈlʌɡ.ɪdʒ/', pos: 'noun', silentSummary: 'Uncountable noun (-age = /ɪdʒ/)', nepali: 'यात्राको झोला र सामान', translit: 'Yātrāko sāmān', lectureNumber: 8, exampleEn: 'Please label all your cabin luggage clearly.', exampleNe: 'कृपया आफ्नो सबै यात्राका सामानमा स्पष्ट नाम लेख्नुहोस्।' },
  { word: 'Baggage', ipa: '/ˈbæɡ.ɪdʒ/', pos: 'noun', silentSummary: 'Uncountable noun (-age = /ɪdʒ/)', nepali: 'मालसामान / भारी', translit: 'Mālsāmān', lectureNumber: 8, exampleEn: 'Passengers collected their baggage from the arrival hall.', exampleNe: 'यात्रुहरूले आगमन कक्षबाट आफ्ना सामानहरू सङ्कलन गरे।' },
  { word: 'Equipment', ipa: '/ɪˈkwɪp.mənt/', pos: 'noun', silentSummary: 'Uncountable noun (never "-s")', nepali: 'उपकरण / औजार', translit: 'Upakaraṇ', lectureNumber: 8, exampleEn: 'Modern medical equipment was installed at the district hospital.', exampleNe: 'जिल्ला अस्पतालमा आधुनिक स्वास्थ्य उपकरण जडान गरियो।' },
  { word: 'Furniture', ipa: '/ˈfɜː.nɪ.tʃər/', pos: 'noun', silentSummary: 'Uncountable noun (never "-s")', nepali: 'फर्निचर (टेबल, कुर्सी, दराज)', translit: 'Pharnichar', lectureNumber: 8, exampleEn: 'Carved wooden furniture adds warmth to the living room.', exampleNe: 'कुँदिएको काठको फर्निचरले बैठक कोठामा न्यानोपन थप्छ।' },
  { word: 'Information', ipa: '/ˌɪn.fəˈmeɪ.ʃən/', pos: 'noun', silentSummary: 'Uncountable noun (never "-s")', nepali: 'जानकारी / सूचना', translit: 'Jānakārī / Sūchanā', lectureNumber: 8, exampleEn: 'The tourist center provides accurate route information.', exampleNe: 'पर्यटक केन्द्रले सही बाटोको जानकारी प्रदान गर्छ।' },
  { word: 'Devise', ipa: '/dɪˈvaɪz/', pos: 'verb', silentSummary: 'Verb with -SE (/z/)', nepali: 'नयाँ योजना वा उपाय रच्नु', translit: 'Upāya rachnu', lectureNumber: 8, exampleEn: 'Engineers helped devise a low-cost water filter.', exampleNe: 'इन्जिनियरहरूले कम लागतको पानी फिल्टरको उपाय रच्न मद्दत गरे।' },
  { word: 'License', ipa: '/ˈlaɪ.səns/', pos: 'noun', silentSummary: '-CE/-SE distinction', nepali: 'अनुमतिपत्र (लाइसेन्स)', translit: 'Anumatipatra', lectureNumber: 8, exampleEn: 'Every commercial driver must carry a valid license.', exampleNe: 'प्रत्येक व्यावसायिक चालकले मान्य अनुमतिपत्र बोक्नुपर्छ।' },

  // LECTURE 9 (B2 - Business Silent Letters, CEED/CEDE & Passive Voice)
  { word: 'Indict', ipa: '/ɪnˈdaɪt/', pos: 'verb', silentLetter: 'c', silentSummary: 'Silent "c" ("-dict" sounds like /daɪt/)', nepali: 'अभियोग लगाउनु / मुद्दा चलाउनु', translit: 'Abhiyog lagāunu', lectureNumber: 9, exampleEn: 'The prosecutor gathered evidence to indict the fraudster.', exampleNe: 'सरकारी वकिलले ठगविरुद्ध अभियोग लगाउन प्रमाण जुटाए।' },
  { word: 'Acquiesce', ipa: '/ˌæk.wiˈes/', pos: 'verb', silentLetter: 'c', silentSummary: 'Silent "c" in "-sc-"', nepali: 'मौन सहमति जनाउनु / स्वीकार्नु', translit: 'Maun sahamati janāunu', lectureNumber: 9, exampleEn: 'The board refused to acquiesce to unfair contract terms.', exampleNe: 'बोर्डले अनुचित सम्झौताका सर्तहरूमा मौन सहमति जनाउन अस्वीकार गर्यो।' },
  { word: 'Supersede', ipa: '/ˌsuː.pəˈsiːd/', pos: 'verb', silentSummary: 'The ONLY "-sede" word', nepali: 'पुरानोको ठाउँ लिनु / विस्थापित गर्नु', translit: 'Visthāpit garnu', lectureNumber: 9, exampleEn: 'Digital banking continues to supersede paper checks.', exampleNe: 'डिजिटल बैंकिङले कागजी चेकहरूलाई निरन्तर विस्थापित गर्दैछ।' },
  { word: 'Proceed', ipa: '/prəˈsiːd/', pos: 'verb', silentSummary: 'One of 3 "-ceed" verbs', nepali: 'अगाडि बढ्नु', translit: 'Agāḍi baḍhnu', lectureNumber: 9, exampleEn: 'After security clearance, passengers may proceed to the gate.', exampleNe: 'सुरक्षा जाँचपछि यात्रुहरू गेटतर्फ अगाडि बढ्न सक्छन्।' },
  { word: 'Exceed', ipa: '/ɪkˈsiːd/', pos: 'verb', silentSummary: 'One of 3 "-ceed" verbs', nepali: 'सीमा नाघ्नु / बढी हुनु', translit: 'Sīmā nāghnu', lectureNumber: 9, exampleEn: 'Export revenues are expected to exceed targets this quarter.', exampleNe: 'यस त्रैमासिकमा निर्यात राजस्वले लक्ष्य नाघ्ने अपेक्षा गरिएको छ।' },
  { word: 'Succeed', ipa: '/səkˈsiːd/', pos: 'verb', silentSummary: 'One of 3 "-ceed" verbs', nepali: 'सफल हुनु / उत्तराधिकारी बन्नु', translit: 'Saphal hunu', lectureNumber: 9, exampleEn: 'Small enterprises succeed when they prioritize quality.', exampleNe: 'साना उद्यमहरूले गुणस्तरलाई प्राथमिकता दिँदा सफल हुन्छन्।' },
  { word: 'Precede', ipa: '/prɪˈsiːd/', pos: 'verb', silentSummary: 'Standard "-cede" verb', nepali: 'अगाडि आउनु / पूर्ववर्ती हुनु', translit: 'Agāḍi āunu', lectureNumber: 9, exampleEn: 'Careful research must always precede policy decisions.', exampleNe: 'नीतिगत निर्णयहरूभन्दा अगाडि सधैँ सूक्ष्म अनुसन्धान हुनुपर्छ।' },
  { word: 'Concede', ipa: '/kənˈsiːd/', pos: 'verb', silentSummary: 'Standard "-cede" verb', nepali: 'गल्ती वा हार स्वीकार्नु', translit: 'Svīkārnu', lectureNumber: 9, exampleEn: 'The debater had to concede that the statistics were accurate.', exampleNe: 'वादविवादकर्ताले तथ्याङ्क सही भएको कुरा स्वीकार्नै पर्यो।' },
  { word: 'Recede', ipa: '/rɪˈsiːd/', pos: 'verb', silentSummary: 'Standard "-cede" verb', nepali: 'पछाडि हट्नु / घट्दै जानु', translit: 'Pachhāḍi haṭnu', lectureNumber: 9, exampleEn: 'Floodwaters began to recede after the rain stopped.', exampleNe: 'वर्षा रोकिएपछि बाढीको पानी घट्न थाल्यो।' },
  { word: 'Procedure', ipa: '/prəˈsiː.dʒər/', pos: 'noun', silentSummary: 'Single "e" in procEdure!', nepali: 'कार्यविधि / प्रक्रिया', translit: 'Kāryavidhi', lectureNumber: 9, exampleEn: 'All staff followed the standard emergency procedure.', exampleNe: 'सबै कर्मचारीहरूले मानक आपत्कालीन कार्यविधि पालना गरे।' },
  { word: 'Champagne', ipa: '/ʃæmˈpeɪn/', pos: 'noun', silentLetter: 'g', silentSummary: 'Silent "g" before "ne"', nepali: 'स्याम्पेन (उत्सवमा पिइने पेय)', translit: 'Syāmpen', lectureNumber: 9, exampleEn: 'They toasted the company milestone with sparkling champagne.', exampleNe: 'उनीहरूले कम्पनीको उपलब्धिमा स्याम्पेनका साथ खुसी मनाए।' },
  { word: 'Consign', ipa: '/kənˈsaɪn/', pos: 'verb', silentLetter: 'g', silentSummary: 'Silent "g" before "n"', nepali: 'सामान पठाउनु / सुम्पनु', translit: 'Sāmān paṭhāunu', lectureNumber: 9, exampleEn: 'The exporter agreed to consign fifty crates of tea.', exampleNe: 'निर्यातकर्ताले चियाका पचास बाकस पठाउन सहमति जनाए।' },
  { word: 'Paradigm', ipa: '/ˈpær.ə.daɪm/', pos: 'noun', silentLetter: 'g', silentSummary: 'Silent "g" before "m"', nepali: 'नमूना / वैचारिक ढाँचा', translit: 'Vaichārik ḍhā̃chā', lectureNumber: 9, exampleEn: 'Renewable energy has created a new economic paradigm.', exampleNe: 'नवीकरणीय ऊर्जाले नयाँ आर्थिक ढाँचा सिर्जना गरेको छ।' },
  { word: 'Diaphragm', ipa: '/ˈdaɪ.ə.fræm/', pos: 'noun', silentLetter: 'g', silentSummary: 'Silent "g" before "m"', nepali: 'श्वासप्रश्वासको मांसपेशी (डायाफ्राम)', translit: 'Śvāsapraśvāsko māṃsapeśī', lectureNumber: 9, exampleEn: 'Singers breathe deeply from the diaphragm for clear projection.', exampleNe: 'गायकहरू स्पष्ट आवाजका लागि डायाफ्रामबाट गहिरो श्वास फेर्छन्।' },
  { word: 'Phlegm', ipa: '/flem/', pos: 'noun', silentLetter: 'g', silentSummary: 'Silent "g" before "m"', nepali: 'कफ / खकार', translit: 'Kaph', lectureNumber: 9, exampleEn: 'Steam inhalation helps loosen chest phlegm.', exampleNe: 'बाफ लिनाले छातीको कफ पातलो बनाउन मद्दत गर्छ।' },

  // LECTURE 10 (B2 - Silent PB/GUE, Prefixes & Reported Speech)
  { word: 'Catalogue', ipa: '/ˈkæt.ə.lɒɡ/', pos: 'noun', silentLetter: 'ue', silentSummary: 'Silent final "-ue"', nepali: 'सूचीपत्र / विवरणिका', translit: 'Sūchīpatra', lectureNumber: 10, exampleEn: 'You can search the university library catalogue online.', exampleNe: 'तपाईंले विश्वविद्यालय पुस्तकालयको सूचीपत्र अनलाइन खोज्न सक्नुहुन्छ।' },
  { word: 'Monologue', ipa: '/ˈmɒn.ə.lɒɡ/', pos: 'noun', silentLetter: 'ue', silentSummary: 'Silent final "-ue"', nepali: 'एकालाप (एक्लै बोलिने लामो संवाद)', translit: 'Ekālāp', lectureNumber: 10, exampleEn: 'The actor delivered a moving dramatic monologue on stage.', exampleNe: 'अभिनेताले मञ्चमा मन छुने नाटकीय एकालाप प्रस्तुत गरे।' },
  { word: 'Prologue', ipa: '/ˈprəʊ.lɒɡ/', pos: 'noun', silentLetter: 'ue', silentSummary: 'Silent final "-ue"', nepali: 'प्रस्तावना / नाटकको सुरुको भाग', translit: 'Prastāvanā', lectureNumber: 10, exampleEn: 'The prologue introduces the historical setting of the novel.', exampleNe: 'प्रस्तावनाले उपन्यासको ऐतिहासिक पृष्ठभूमि परिचय गराउँछ।' },
  { word: 'Fatigue', ipa: '/fəˈtiːɡ/', pos: 'noun', silentLetter: 'ue', silentSummary: 'Silent "-ue" ("i" = /iː/)', nepali: 'थकान / कमजोरी', translit: 'Thakān', lectureNumber: 10, exampleEn: 'Rest and hydration prevent altitude fatigue.', exampleNe: 'आराम र प्रशस्त पानीले उचाइको थकान रोक्छ।' },
  { word: 'Intrigue', ipa: '/ɪnˈtriːɡ/', pos: 'verb', silentLetter: 'ue', silentSummary: 'Silent "-ue" ("i" = /iː/)', nepali: 'उत्सुकता जगाउनु / षड्यन्त्र', translit: 'Utsukatā jagāunu', lectureNumber: 10, exampleEn: 'Ancient inscriptions continue to intrigue epigraphers.', exampleNe: 'प्राचीन शिलालेखहरूले अभिलेखविद्हरूमा निरन्तर उत्सुकता जगाइरहन्छन्।' },
  { word: 'Vague', ipa: '/veɪɡ/', pos: 'adjective', silentLetter: 'ue', silentSummary: 'Silent final "-ue"', nepali: 'अस्पष्ट / धमिलो', translit: 'Aspaṣṭa', lectureNumber: 10, exampleEn: 'Avoid vague promises and provide clear timelines.', exampleNe: 'अस्पष्ट वाचाहरू नगर्नुहोस् र स्पष्ट समयसीमा दिनुहोस्।' },
  { word: 'Plague', ipa: '/pleɪɡ/', pos: 'noun', silentLetter: 'ue', silentSummary: 'Silent final "-ue"', nepali: 'महामारी / निरन्तर दुःख दिनु', translit: 'Mahāmārī', lectureNumber: 10, exampleEn: 'Traffic congestion continues to plague major ring roads.', exampleNe: 'ट्राफिक जामले मुख्य चक्रपथहरूलाई निरन्तर सताइरहेको छ।' },
  { word: 'Rogue', ipa: '/rəʊɡ/', pos: 'noun', silentLetter: 'ue', silentSummary: 'Silent final "-ue"', nepali: 'बदमास / नियम नमान्ने', translit: 'Badamās', lectureNumber: 10, exampleEn: 'Security teams blocked the rogue software program.', exampleNe: 'सुरक्षा टोलीले अनधिकृत सफ्टवेर प्रोग्रामलाई बन्द गर्यो।' },
  { word: 'Dissatisfy', ipa: '/dɪsˈsæt.ɪs.faɪ/', pos: 'verb', silentSummary: 'Double SS (dis + satisfy)', nepali: 'असन्तुष्ट पार्नु', translit: 'Asantuṣṭa pārnu', lectureNumber: 10, exampleEn: 'Late deliveries dissatisfy loyal online shoppers.', exampleNe: 'ढिलो डेलिभरीले नियमित अनलाइन ग्राहकहरूलाई असन्तुष्ट पार्छ।' },
  { word: 'Misspell', ipa: '/ˌmɪsˈspel/', pos: 'verb', silentSummary: 'Double SS (mis + spell)', nepali: 'गलत हिज्जे लेख्नु', translit: 'Galat hijje lekhnu', lectureNumber: 10, exampleEn: 'People often misspell words that contain silent letters.', exampleNe: 'मानिसहरूले प्रायः मौन अक्षर भएका शब्दहरूको गलत हिज्जे लेख्छन्।' },
  { word: 'Unnecessary', ipa: '/ʌnˈnes.ə.ser.i/', pos: 'adjective', silentSummary: 'Double NN (un + necessary)', nepali: 'अनावश्यक', translit: 'Anāvaśyak', lectureNumber: 10, exampleEn: 'Delete unnecessary words to make your writing concise.', exampleNe: 'आफ्नो लेखाइलाई छरितो बनाउन अनावश्यक शब्दहरू हटाउनुहोस्।' },
  { word: 'Irresponsible', ipa: '/ˌɪr.ɪˈspɒn.sə.bəl/', pos: 'adjective', silentSummary: 'Double RR (ir + responsible)', nepali: 'गैरजिम्मेवार', translit: 'Gairjimmevār', lectureNumber: 10, exampleEn: 'Leaving campfires unattended in dry forests is irresponsible.', exampleNe: 'सुख्खा जङ्गलमा आगो बालेर छोड्नु गैरजिम्मेवार कार्य हो।' },
  { word: 'Illegible', ipa: '/ɪˈledʒ.ə.bəl/', pos: 'adjective', silentSummary: 'Double LL (il + legible)', nepali: 'पढ्न नसकिने (नबुझिने अक्षर)', translit: 'Paḍhna nasakine', lectureNumber: 10, exampleEn: 'The hurriedly written prescription was almost illegible.', exampleNe: 'हतारमा लेखिएको पुर्जा झन्डै पढ्न नसकिने थियो।' },
  { word: 'Immature', ipa: '/ˌɪm.əˈtʃʊər/', pos: 'adjective', silentSummary: 'Double MM (im + mature)', nepali: 'अपरिपक्व', translit: 'Aparipakva', lectureNumber: 10, exampleEn: 'Calm dialogue is better than an immature reaction.', exampleNe: 'अपरिपक्व प्रतिक्रियाभन्दा शान्त संवाद उत्तम हुन्छ।' },
  { word: 'Disappear', ipa: '/ˌdɪs.əˈpɪər/', pos: 'verb', silentSummary: 'Single S, double PP', nepali: 'हराउनु / लोप हुनु', translit: 'Harāunu / Lop hunu', lectureNumber: 10, exampleEn: 'Morning fog will disappear once the sun rises.', exampleNe: 'घाम उदाएपछि बिहानको कुहिरो हराउनेछ।' },

  // LECTURE 11 (C1 - Academic Greek Roots, CIOUS/TIOUS & Contrast)
  { word: 'Monarchy', ipa: '/ˈmɒn.ə.ki/', pos: 'noun', silentLetter: 'h', silentSummary: 'Greek "ch" = /k/', nepali: 'राजतन्त्र', translit: 'Rājatantra', lectureNumber: 11, exampleEn: 'Historians studied the transition from monarchy to republic.', exampleNe: 'इतिहासकारहरूले राजतन्त्रबाट गणतन्त्रमा भएको रूपान्तरणको अध्ययन गरे।' },
  { word: 'Anarchy', ipa: '/ˈæn.ə.ki/', pos: 'noun', silentLetter: 'h', silentSummary: 'Greek "ch" = /k/', nepali: 'अराजकता / कानुनविहीन अवस्था', translit: 'Arājakatā', lectureNumber: 11, exampleEn: 'Strong institutions protect society from political anarchy.', exampleNe: 'बलिया संस्थाहरूले समाजलाई राजनीतिक अराजकताबाट जोगाउँछन्।' },
  { word: 'Architect', ipa: '/ˈɑː.kɪ.tekt/', pos: 'noun', silentLetter: 'h', silentSummary: 'Greek "ch" = /k/', nepali: 'वास्तुकार (भवनको नक्सा बनाउने विज्ञ)', translit: 'Vāstukār', lectureNumber: 11, exampleEn: 'The architect blended traditional Newa brickwork with modern steel.', exampleNe: 'वास्तुकारले परम्परागत नेवाः इँटाको कामलाई आधुनिक फलामसँग फ्युजन गरे।' },
  { word: 'Archive', ipa: '/ˈɑː.kaɪv/', pos: 'noun', silentLetter: 'h', silentSummary: 'Greek "ch" = /k/', nepali: 'अभिलेखालय', translit: 'Abhilekhālaya', lectureNumber: 11, exampleEn: 'Rare palm-leaf manuscripts are preserved in the national archive.', exampleNe: 'राष्ट्रिय अभिलेखालयमा दुर्लभ ताडपत्रका पाण्डुलिपिहरू सुरक्षित छन्।' },
  { word: 'Chronic', ipa: '/ˈkrɒn.ɪk/', pos: 'adjective', silentLetter: 'h', silentSummary: 'Initial "ch" = /k/', nepali: 'दीर्घकालीन / पुरानो (रोग वा समस्या)', translit: 'Dīrghakālīn', lectureNumber: 11, exampleEn: 'Improved public transit can solve chronic traffic congestion.', exampleNe: 'सुधारिएको सार्वजनिक यातायातले दीर्घकालीन ट्राफिक समस्या समाधान गर्न सक्छ।' },
  { word: 'Synchronize', ipa: '/ˈsɪŋ.krə.naɪz/', pos: 'verb', silentLetter: 'h', silentSummary: 'Greek "ch" = /k/', nepali: 'एकै समयमा मिलाउनु (सिङ्क्रोनाइज गर्नु)', translit: 'Ekai samayamā milāunu', lectureNumber: 11, exampleEn: 'The offline app will synchronize your progress once connected.', exampleNe: 'इन्टरनेटमा जोडिएपछि अफलाइन एपले तपाईंको प्रगति सिङ्क्रोनाइज गर्नेछ।' },
  { word: 'Mechanism', ipa: '/ˈmek.ə.nɪ.zəm/', pos: 'noun', silentLetter: 'h', silentSummary: 'Greek "ch" = /k/', nepali: 'संयन्त्र / कार्यप्रणाली', translit: 'Saṃyantra', lectureNumber: 11, exampleEn: 'The clockwork mechanism still functions after a century.', exampleNe: 'एक शताब्दीपछि पनि घडीको संयन्त्रले काम गरिरहेको छ।' },
  { word: 'Spacious', ipa: '/ˈspeɪ.ʃəs/', pos: 'adjective', silentSummary: 'Root space → -cious', nepali: 'फराकिलो / प्रशस्त ठाउँ भएको', translit: 'Pharākilo', lectureNumber: 11, exampleEn: 'The spacious courtyard hosts community cultural festivals.', exampleNe: 'फराकिलो आँगनमा सामुदायिक सांस्कृतिक पर्वहरू आयोजना हुन्छन्।' },
  { word: 'Gracious', ipa: '/ˈɡreɪ.ʃəs/', pos: 'adjective', silentSummary: 'Root grace → -cious', nepali: 'विनम्र / दयालु र शिष्ट', translit: 'Vinamra / Śiṣṭa', lectureNumber: 11, exampleEn: 'We thanked our gracious hosts for their warm hospitality.', exampleNe: 'हामीले न्यानो आतिथ्यका लागि हाम्रा विनम्र आयोजकहरूलाई धन्यवाद दियौँ।' },
  { word: 'Malicious', ipa: '/məˈlɪʃ.əs/', pos: 'adjective', silentSummary: 'Root malice → -cious', nepali: 'द्वेषपूर्ण / हानि पुर्याउने नियतको', translit: 'Dveṣpūrṇa', lectureNumber: 11, exampleEn: 'Firewalls protect computer networks from malicious attacks.', exampleNe: 'फायरवालले कम्प्युटर नेटवर्कलाई द्वेषपूर्ण आक्रमणबाट जोगाउँछ।' },
  { word: 'Audacious', ipa: '/ɔːˈdeɪ.ʃəs/', pos: 'adjective', silentSummary: 'Root audacity → -cious', nepali: 'साहसी / निडर', translit: 'Sāhasī / Niḍar', lectureNumber: 11, exampleEn: 'The mountaineers planned an audacious winter ascent.', exampleNe: 'पर्वतारोहीहरूले साहसी हिउँदे आरोहणको योजना बनाए।' },
  { word: 'Tenacious', ipa: '/təˈneɪ.ʃəs/', pos: 'adjective', silentSummary: 'Root tenacity → -cious', nepali: 'अडिग / हार नमान्ने', translit: 'Aḍig', lectureNumber: 11, exampleEn: 'Tenacious athletes keep training despite early setbacks.', exampleNe: 'अडिग खेलाडीहरूले सुरुवाती असफलताका बाबजुद अभ्यास जारी राख्छन्।' },
  { word: 'Ambitious', ipa: '/æmˈbɪʃ.əs/', pos: 'adjective', silentSummary: 'Root ambition → -tious', nepali: 'महत्त्वाकांक्षी', translit: 'Mahattvākāṅkṣī', lectureNumber: 11, exampleEn: 'The city launched an ambitious reforestation program.', exampleNe: 'सहरले एक महत्त्वाकांक्षी वृक्षारोपण कार्यक्रम सुरु गर्यो।' },
  { word: 'Cautious', ipa: '/ˈkɔː.ʃəs/', pos: 'adjective', silentSummary: 'Root caution → -tious', nepali: 'सजग / सावधान', translit: 'Sajag / Sāvadhān', lectureNumber: 11, exampleEn: 'Drivers must remain cautious on winding mountain roads.', exampleNe: 'घुमाउरो पहाडी सडकमा चालकहरू सावधान रहनुपर्छ।' },
  { word: 'Nutritious', ipa: '/njuːˈtrɪʃ.əs/', pos: 'adjective', silentSummary: 'Root nutrition → -tious', nepali: 'पोषिलो / पौष्टिक', translit: 'Poṣilo', lectureNumber: 11, exampleEn: 'Buckwheat pancakes are a nutritious Himalayan breakfast.', exampleNe: 'फापरको रोटी एक पोषिलो हिमाली बिहानी खाजा हो।' },

  // LECTURE 12 (C1 - Diplomatic Loanwords, Academic Plurals & Inversion)
  { word: 'Connoisseur', ipa: '/ˌkɒn.əˈsɜːr/', pos: 'noun', silentLetter: 'i', silentSummary: 'Double NN, double SS, French "-eur"', nepali: 'कला वा स्वादको विशेष पारखी', translit: 'Viśeṣ pārakhī', lectureNumber: 12, exampleEn: 'She is a connoisseur of orthodox Ilam green tea.', exampleNe: 'उनी इलामको अर्थोडक्स हरियो चियाकी विशेष पारखी हुन्।' },
  { word: 'Chauffeur', ipa: '/ˈʃəʊ.fər/', pos: 'noun', silentSummary: 'French "ch" = /ʃ/ ("sh")', nepali: 'निजी सवारी चालक', translit: 'Nijī chālak', lectureNumber: 12, exampleEn: 'The embassy chauffeur waited outside the summit hall.', exampleNe: 'दूतावासका चालक सम्मेलन कक्षबाहिर पर्खिरहेका थिए।' },
  { word: 'Sabotage', ipa: '/ˈsæb.ə.tɑːʒ/', pos: 'verb', silentSummary: 'French "-age" = /ɑːʒ/', nepali: 'भित्रभित्रै नाश गर्नु / तोडफोड गर्नु', translit: 'Toḍphoḍ garnu', lectureNumber: 12, exampleEn: 'Strict audits prevent attempts to sabotage the supply chain.', exampleNe: 'कडा लेखापरीक्षणले आपूर्ति शृङ्खला बिथोल्ने प्रयासलाई रोक्छ।' },
  { word: 'Camouflage', ipa: '/ˈkæm.ə.flɑːʒ/', pos: 'noun', silentSummary: 'French "-age" = /ɑːʒ/', nepali: 'वातावरणसँग रङ मिलाएर लुक्ने कला (क्यामोफ्लाज)', translit: 'Lukne kalā', lectureNumber: 12, exampleEn: 'The snow leopard’s spotted coat provides natural camouflage.', exampleNe: 'हिउँ चितुवाको थोप्ले रङले प्राकृतिक रूपमा लुक्ने आवरण प्रदान गर्छ।' },
  { word: 'Entourage', ipa: '/ˈɒn.tu.rɑːʒ/', pos: 'noun', silentSummary: 'French "en-" = /ɒn/, "-age" = /ɑːʒ/', nepali: 'भ्रमण दल / सहयोगीहरूको समूह', translit: 'Bhramaṇ dal', lectureNumber: 12, exampleEn: 'The prime minister arrived with a diplomatic entourage.', exampleNe: 'प्रधानमन्त्री कूटनीतिक भ्रमण दलका साथ आइपुग्नुभयो।' },
  { word: 'Dossier', ipa: '/ˈdɒs.i.eɪ/', pos: 'noun', silentLetter: 'r', silentSummary: 'Silent final French "r" (/eɪ/)', nepali: 'विस्तृत कागजातको फाइल', translit: 'Kāgajātko phāil', lectureNumber: 12, exampleEn: 'Investigators compiled a detailed dossier on the case.', exampleNe: 'अनुसन्धानकर्ताहरूले मुद्दाको विस्तृत फाइल तयार पारे।' },
  { word: 'Faux', ipa: '/fəʊ/', pos: 'adjective', silentLetter: 'x', silentSummary: 'Silent final French "x"', nepali: 'नक्कली / कृत्रिम', translit: 'Nakkalī / Kṛtrim', lectureNumber: 12, exampleEn: 'The winter jacket is lined with warm faux fur.', exampleNe: 'हिउँदे ज्याकेटको भित्री भागमा न्यानो कृत्रिम भुवा राखिएको छ।' },
  { word: 'Coup', ipa: '/kuː/', pos: 'noun', silentLetter: 'p', silentSummary: 'Silent final French "p"', nepali: 'अप्रत्याशित ठूलो सफलता / सत्तापलट', translit: 'Sattāpalaṭ / Thūlo saphalatā', lectureNumber: 12, exampleEn: 'Securing the international research grant was a major coup.', exampleNe: 'अन्तर्राष्ट्रिय अनुसन्धान अनुदान प्राप्त गर्नु एक ठूलो उपलब्धि थियो।' },
  { word: 'Corps', ipa: '/kɔːr/', pos: 'noun', silentLetter: 'ps', silentSummary: 'Silent "p" and "s" (/kɔːr/)', nepali: 'विशेष सेवा दल (कोर)', translit: 'Viśeṣ sevā dal', lectureNumber: 12, exampleEn: 'Members of the diplomatic corps attended the reception.', exampleNe: 'कूटनीतिक नियोगका सदस्यहरू स्वागत समारोहमा सहभागी भए।' },
  { word: 'Criterion', ipa: '/kraɪˈtɪə.ri.ən/', pos: 'noun', silentSummary: 'Singular -on → Plural criteria', nepali: 'मापदण्ड / आधार (एकवचन)', translit: 'Māpadaṇḍa', lectureNumber: 12, exampleEn: 'Merit is the primary criterion for awarding the fellowship.', exampleNe: 'विद्वत्वृत्ति प्रदान गर्ने मुख्य मापदण्ड योग्यता हो।' },
  { word: 'Phenomenon', ipa: '/fəˈnɒm.ɪ.nən/', pos: 'noun', silentSummary: 'Singular -on → Plural phenomena', nepali: 'परिघटना / अनौठो दृश्य (एकवचन)', translit: 'Parighaṭanā', lectureNumber: 12, exampleEn: 'Glacial lake expansion is a closely monitored climate phenomenon.', exampleNe: 'हिमतालको विस्तार एक सूक्ष्म रूपमा निगरानी गरिएको जलवायु परिघटना हो।' },
  { word: 'Analysis', ipa: '/əˈnæl.ə.sɪs/', pos: 'noun', silentSummary: 'Singular -is → Plural analyses', nepali: 'विश्लेषण', translit: 'Viśleṣaṇ', lectureNumber: 12, exampleEn: 'Careful data analysis revealed a rise in literacy rates.', exampleNe: 'तथ्याङ्कको सूक्ष्म विश्लेषणले साक्षरता दरमा वृद्धि भएको देखायो।' },
  { word: 'Hypothesis', ipa: '/haɪˈpɒθ.ə.sɪs/', pos: 'noun', silentSummary: 'Singular -is → Plural hypotheses', nepali: 'परिकल्पना / अनुमानित सिद्धान्त', translit: 'Parikalpanā', lectureNumber: 12, exampleEn: 'The scientist tested her hypothesis through field experiments.', exampleNe: 'वैज्ञानिकले क्षेत्रीय प्रयोगमार्फत आफ्नो परिकल्पनाको परीक्षण गरिन्।' },
  { word: 'Synthesis', ipa: '/ˈsɪn.θə.sɪs/', pos: 'noun', silentSummary: 'Singular -is → Plural syntheses', nepali: 'संश्लेषण / समन्वय', translit: 'Saṃśleṣaṇ', lectureNumber: 12, exampleEn: 'The report offers a synthesis of economic and social trends.', exampleNe: 'प्रतिवेदनले आर्थिक र सामाजिक प्रवृत्तिहरूको संश्लेषण प्रस्तुत गर्छ।' },
  { word: 'Curriculum', ipa: '/kəˈrɪk.jə.ləm/', pos: 'noun', silentSummary: 'Singular -um → Plural curricula', nepali: 'पाठ्यक्रम', translit: 'Pāṭhyakram', lectureNumber: 12, exampleEn: 'The updated curriculum integrates phonics and practical grammar.', exampleNe: 'अद्यावधिक पाठ्यक्रमले ध्वनिविज्ञान र व्यावहारिक व्याकरणलाई एकीकृत गर्छ।' },

  // EXTENDED HIGH-FREQUENCY SILENT-LETTER & PHONICS VOCABULARY BANK (LECTURES 01-12)
  { word: 'Knack', ipa: '/næk/', pos: 'noun', silentLetter: 'K', silentSummary: 'Silent initial "k" before "n"', nepali: 'सहज सीप / कल (जसरी काम सजिलै गर्ने तरिका)', translit: 'Sahaj sīp', lectureNumber: 1, exampleEn: 'She has a natural knack for learning new languages quickly.', exampleNe: 'उनमा नयाँ भाषाहरू छिटो सिक्ने प्राकृतिक सीप छ।' },
  { word: 'Knead', ipa: '/niːd/', pos: 'verb', silentLetter: 'K', silentSummary: 'Silent initial "k" (sounds like "need")', nepali: 'मुछ्नु (पिठो मुछ्नु)', translit: 'Muchhnu', lectureNumber: 1, exampleEn: 'Knead the wheat dough for ten minutes until it becomes smooth.', exampleNe: 'गहुँको पिठो नरम नहुन्जेल दस मिनेटसम्म मुछ्नुहोस्।' },
  { word: 'Wreath', ipa: '/riːθ/', pos: 'noun', silentLetter: 'W', silentSummary: 'Silent initial "w" before "r"', nepali: 'फूलको चक्र वा माला', translit: 'Phūlko chakra', lectureNumber: 1, exampleEn: 'A marigold wreath decorated the main doorway during Tihar.', exampleNe: 'तिहारमा मुख्य ढोकामा सयपत्री फूलको माला सजाइएको थियो।' },
  { word: 'Wrench', ipa: '/rentʃ/', pos: 'noun', silentLetter: 'W', silentSummary: 'Silent initial "w" before "r"', nepali: 'नट-बोल्ट कस्ने पाना (रेन्च)', translit: 'Pānā / Rench', lectureNumber: 1, exampleEn: 'The mechanic used a steel wrench to tighten the bolt.', exampleNe: 'मिस्त्रीले बोल्ट कस्न फलामको पाना प्रयोग गरे।' },
  { word: 'Almond', ipa: '/ˈɑː.mənd/', pos: 'noun', silentLetter: 'l', silentSummary: 'Silent "l" before "m"', nepali: 'बदाम (कागजी बदाम)', translit: 'Badām', lectureNumber: 1, exampleEn: 'Warm milk with crushed almond is nutritious in winter.', exampleNe: 'जाडोमा पिसेको बदाम मिसाइएको तातो दूध पौष्टिक हुन्छ।' },
  { word: 'Salmon', ipa: '/ˈsæm.ən/', pos: 'noun', silentLetter: 'l', silentSummary: 'Silent "l" before "m" (never "sal-mon")', nepali: 'साल्मन माछा', translit: 'Sālman māchhā', lectureNumber: 2, exampleEn: 'Grilled salmon is rich in healthy omega fatty acids.', exampleNe: 'ग्रिल गरिएको साल्मन माछामा स्वस्थ ओमेगा फ्याटी एसिड प्रशस्त हुन्छ।' },
  { word: 'Subtlety', ipa: '/ˈsʌt.əl.ti/', pos: 'noun', silentLetter: 'b', silentSummary: 'Silent "b" before "t"', nepali: 'सूक्ष्मता / बारीकी', translit: 'Sūkṣmatā', lectureNumber: 2, exampleEn: 'Translating poetry requires attention to every linguistic subtlety.', exampleNe: 'कविता अनुवाद गर्दा प्रत्येक भाषिक सूक्ष्मतामा ध्यान दिनुपर्छ।' },
  { word: 'Debtor', ipa: '/ˈdet.ər/', pos: 'noun', silentLetter: 'b', silentSummary: 'Silent "b" before "t"', nepali: 'ऋणी / कर्जा लिने व्यक्ति', translit: 'Ṛṇī', lectureNumber: 2, exampleEn: 'The bank sent a polite payment reminder to the debtor.', exampleNe: 'बैंकले ऋणीलाई भुक्तानीको विनम्र सम्झना पत्र पठायो।' },
  { word: 'Indict', ipa: '/ɪnˈdaɪt/', pos: 'verb', silentLetter: 'c', silentSummary: 'Silent "c" before "t" (/ɪnˈdaɪt/)', nepali: 'औपचारिक अभियोग लगाउनु', translit: 'Abhiyog lagāunu', lectureNumber: 3, exampleEn: 'The prosecutor presented evidence to indict the suspect.', exampleNe: 'सरकारी वकिलले संदिग्धमाथि अभियोग लगाउन प्रमाण पेश गरे।' },
  { word: 'Bustle', ipa: '/ˈbʌs.əl/', pos: 'noun', silentLetter: 't', silentSummary: 'Silent "t" in "-stle"', nepali: 'चहलपहल / व्यस्त भिडभाड', translit: 'Chahalpahal', lectureNumber: 3, exampleEn: 'We enjoyed the morning bustle of Asan Bazaar.', exampleNe: 'हामीले असन बजारको बिहानी चहलपहलको आनन्द लियौँ।' },
  { word: 'Glisten', ipa: '/ˈɡlɪs.ən/', pos: 'verb', silentLetter: 't', silentSummary: 'Silent "t" in "-sten"', nepali: 'टलक्क टल्कनु / चम्कनु', translit: 'Ṭalakka ṭalkanu', lectureNumber: 3, exampleEn: 'Dewdrops glisten on green tea leaves at sunrise.', exampleNe: 'सूर्योदयमा हरियो चियाको पातमा शीतका थोपाहरू टलक्क टल्कन्छन्।' },
  { word: 'Christen', ipa: '/ˈkrɪs.ən/', pos: 'verb', silentLetter: 't', silentSummary: 'Silent "t" in "-sten"', nepali: 'न्वारन गर्नु / नामकरण गर्नु', translit: 'Nāmakaraṇ garnu', lectureNumber: 3, exampleEn: 'Villagers gathered to christen the newly built suspension bridge.', exampleNe: 'नयाँ बनेको झोलुङ्गे पुलको नामकरण र उद्घाटन गर्न गाउँलेहरू भेला भए।' },
  { word: 'Mortgage', ipa: '/ˈmɔː.ɡɪdʒ/', pos: 'noun', silentLetter: 't', silentSummary: 'Silent middle "t" (/ˈmɔː.ɡɪdʒ/)', nepali: 'घरजग्गा धितो कर्जा', translit: 'Dhito karjā', lectureNumber: 4, exampleEn: 'They applied for a low-interest housing mortgage.', exampleNe: 'उनीहरूले कम ब्याजदरको आवास धितो कर्जाका लागि आवेदन दिए।' },
  { word: 'Handkerchief', ipa: '/ˈhæŋ.kə.tʃɪf/', pos: 'noun', silentLetter: 'd', silentSummary: 'Silent middle "d" before "k"', nepali: 'रुमाल', translit: 'Rumāl', lectureNumber: 4, exampleEn: 'She folded the embroidered cotton handkerchief neatly.', exampleNe: 'उनले बुट्टा भरेको सूतीको रुमाल चिटिक्क पारेर पट्याइन्।' },
  { word: 'Cupboard', ipa: '/ˈkʌb.əd/', pos: 'noun', silentLetter: 'p', silentSummary: 'Silent "p" before "b" (/ˈkʌb.əd/)', nepali: 'भान्साको दराज / अलमारी', translit: 'Darāj / Alamārī', lectureNumber: 4, exampleEn: 'Please put the clean plates back inside the cupboard.', exampleNe: 'कृपया सफा थालहरू भान्साको दराजभित्र राख्नुहोस्।' },
  { word: 'Raspberry', ipa: '/ˈrɑːz.bər.i/', pos: 'noun', silentLetter: 'p', silentSummary: 'Silent "p" before "b"', nepali: 'ऐसेलु (रातो ऐसेलु)', translit: 'Aiselu', lectureNumber: 4, exampleEn: 'Wild golden and red raspberry bushes grow along hill trails.', exampleNe: 'पहाडी गोरेटोको छेउछाउमा जङ्गली पहेँलो र रातो ऐसेलुका झाडीहरू उम्रन्छन्।' },
  { word: 'fluorescent', ipa: '/flɔːˈres.ənt/', pos: 'adjective', silentLetter: 'c', silentSummary: 'Silent "u" in fluo- and silent "c" in -sc-', nepali: 'चम्किलो प्रकाश दिने (फ्लोरोसेन्ट)', translit: 'Chamkilo', lectureNumber: 5, exampleEn: 'Traffic police wear fluorescent vests for night visibility.', exampleNe: 'ट्राफिक प्रहरीले राति टाढैबाट देखिन चम्किलो ज्याकेट लगाउँछन्।' },
  { word: 'Conscience', ipa: '/ˈkɒn.ʃəns/', pos: 'noun', silentLetter: 'c', silentSummary: '-sci- pronounced /ʃ/ ("KON-shuhns")', nepali: 'अन्तरात्मा / विवेक', translit: 'Antarātmā / Vivek', lectureNumber: 5, exampleEn: 'Acting with honesty gives you a clear conscience.', exampleNe: 'इमानदारीपूर्वक काम गर्नाले तपाईंको अन्तरात्मा सफा र शान्त रहन्छ।' },
  { word: 'Crescent', ipa: '/ˈkres.ənt/', pos: 'noun', silentLetter: 'c', silentSummary: 'Silent "c" after "s"', nepali: 'अर्धचन्द्राकार', translit: 'Ardhachandrākār', lectureNumber: 5, exampleEn: 'A bright silver crescent moon appeared above the ridge.', exampleNe: 'डाँडामाथि चम्किलो चाँदीजस्तो अर्धचन्द्रमा देखियो।' },
  { word: 'columnist', ipa: '/ˈkɒl.əm.nɪst/', pos: 'noun', silentSummary: 'Previously silent "n" in column wakes up or blends', nepali: 'स्तम्भकार (पत्रिकामा नियमित लेख्ने लेखक)', translit: 'Stambhakār', lectureNumber: 6, exampleEn: 'The economic columnist wrote an insightful article on remittances.', exampleNe: 'आर्थिक स्तम्भकारले विप्रेषण (रेमिट्यान्स) बारे गहन लेख लेख्नुभयो।' },
  { word: 'Resignation', ipa: '/ˌrez.ɪɡˈneɪ.ʃən/', pos: 'noun', silentSummary: 'The silent "g" from resign wakes up as /ɡ/!', nepali: 'राजीनामा', translit: 'Rājīnāmā', lectureNumber: 6, exampleEn: 'The director submitted his official resignation letter.', exampleNe: 'निर्देशकले आफ्नो आधिकारिक राजीनामा पत्र बुझाउनुभयो।' },
  { word: 'Signature', ipa: '/ˈsɪɡ.nə.tʃər/', pos: 'noun', silentSummary: 'The silent "g" from sign wakes up as /ɡ/!', nepali: 'हस्ताक्षर / सही', translit: 'Hastākṣar / Sahī', lectureNumber: 6, exampleEn: 'Your digital signature is required on the bank form.', exampleNe: 'बैंक फारममा तपाईंको डिजिटल हस्ताक्षर आवश्यक छ।' },
  { word: 'Autumnal', ipa: '/ɔːˈtʌm.nəl/', pos: 'adjective', silentSummary: 'The silent "n" from autumn wakes up as /n/!', nepali: 'शरद ऋतुको (शरदकालीन)', translit: 'Śaradkālīn', lectureNumber: 6, exampleEn: 'Crisp autumnal breezes signal the arrival of Dashain.', exampleNe: 'शरद ऋतुको शीतल हावाले दशैँको आगमनको सङ्केत गर्छ।' },
  { word: 'Wholesaler', ipa: '/ˈhəʊl.seɪ.lər/', pos: 'noun', silentLetter: 'W', silentSummary: 'Silent initial "w" in whole-', nepali: 'थोक बिक्रेता', translit: 'Thok bikretā', lectureNumber: 7, exampleEn: 'Retailers purchase grain directly from the agricultural wholesaler.', exampleNe: 'खुद्रा व्यापारीहरूले कृषि थोक बिक्रेताबाट सीधै अनाज किन्छन्।' },
  { word: 'Swordsmanship', ipa: '/ˈsɔːdz.mən.ʃɪp/', pos: 'noun', silentLetter: 'w', silentSummary: 'Silent "w" in sword- (/sɔːd/)', nepali: 'तरवारबाजीको कला', translit: 'Taravārbājī', lectureNumber: 7, exampleEn: 'Historical dramas showcase traditional martial swordsmanship.', exampleNe: 'ऐतिहासिक नाटकहरूले परम्परागत तरवारबाजीको कला प्रदर्शन गर्छन्।' },
  { word: 'Playwright', ipa: '/ˈpleɪ.raɪt/', pos: 'noun', silentLetter: 'w', silentSummary: 'Silent "w" and silent "gh" in -wright', nepali: 'नाटककार', translit: 'Nāṭakakār', lectureNumber: 8, exampleEn: 'Balkrishna Sama is a celebrated Nepali playwright.', exampleNe: 'बालकृष्ण सम एक प्रख्यात नेपाली नाटककार हुनुहुन्छ।' },
  { word: 'Thoroughbred', ipa: '/ˈθʌr.ə.bred/', pos: 'adjective', silentLetter: 'gh', silentSummary: 'Silent "gh" in thorough-', nepali: 'उच्च नस्लको / उत्कृष्ट जातिको', translit: 'Uchcha naslako', lectureNumber: 8, exampleEn: 'The ranch raises thoroughbred mountain horses.', exampleNe: 'त्यस फार्ममा उच्च नस्लका हिमाली घोडाहरू पालिन्छन्।' },
  { word: 'Borough', ipa: '/ˈbʌr.ə/', pos: 'noun', silentLetter: 'gh', silentSummary: 'Silent final "gh" (/ˈbʌr.ə/)', nepali: 'नगर क्षेत्र / वडा क्षेत्र', translit: 'Nagar kṣetra', lectureNumber: 8, exampleEn: 'Each borough of the city maintains its own public parks.', exampleNe: 'सहरको प्रत्येक नगर क्षेत्रले आफ्नै सार्वजनिक उद्यानहरूको रेखदेख गर्छ।' },
  { word: 'Furlough', ipa: '/ˈfɜː.ləʊ/', pos: 'noun', silentLetter: 'gh', silentSummary: 'Silent final "gh" (/ˈfɜː.ləʊ/)', nepali: 'बिदा / अस्थायी छुट्टी', translit: 'Asthāyī chhuṭṭī', lectureNumber: 9, exampleEn: 'Staff returned to work after a two-week seasonal furlough.', exampleNe: 'दुई हप्ताको मौसमी बिदापछि कर्मचारीहरू काममा फर्किए।' },
  { word: 'Bivouac', ipa: '/ˈbɪv.u.æk/', pos: 'noun', silentSummary: 'French mountaineering loanword', nepali: 'अस्थायी हिमाली शिविर (बिभुआक)', translit: 'Asthāyī śivir', lectureNumber: 9, exampleEn: 'The expedition team set up a high-altitude bivouac below the ridge.', exampleNe: 'आरोहण टोलीले डाँडामुनि उच्च उचाइमा अस्थायी शिविर खडा गर्यो।' },
  { word: 'Rendezvous', ipa: '/ˈrɒn.deɪ.vuː/', pos: 'noun', silentLetter: 's', silentSummary: 'Silent "z" & final "s" (/ˈrɒn.deɪ.vuː/)', nepali: 'पूर्वनिर्धारित भेटघाट वा भेट्ने स्थान', translit: 'Bheṭghāṭ sthān', lectureNumber: 10, exampleEn: 'Namche Bazaar was the main rendezvous point for our trekking group.', exampleNe: 'हाम्रो पदयात्रा समूहका लागि नाम्चे बजार मुख्य भेटघाट बिन्दु थियो।' },
  { word: 'Bouquet', ipa: '/buˈkeɪ/', pos: 'noun', silentLetter: 't', silentSummary: 'Silent final "t" (/buˈkeɪ/)', nepali: 'फूलको गुच्छा (बुके)', translit: 'Phūlko guchchhā', lectureNumber: 10, exampleEn: 'Students presented a fresh rhododendron bouquet to the principal.', exampleNe: 'विद्यार्थीहरूले प्रधानाध्यापकलाई ताजा लालीगुराँसको गुच्छा उपहार दिए।' },
  { word: 'Buffet', ipa: '/ˈbʊf.eɪ/', pos: 'noun', silentLetter: 't', silentSummary: 'Silent final "t" (/ˈbʊf.eɪ/)', nepali: 'आफैँ पस्केर खाने भोज (बफे)', translit: 'Baphe bhoj', lectureNumber: 10, exampleEn: 'The hotel conference included a traditional Nepali lunch buffet.', exampleNe: 'होटलको सम्मेलनमा परम्परागत नेपाली दिवा बफे खाना समावेश थियो।' },
  { word: 'Chauffeur', ipa: '/ˈʃəʊ.fər/', pos: 'noun', silentSummary: 'French loanword ("ch" = /ʃ/)', nepali: 'निजी सवारी चालक', translit: 'Nijī chālak', lectureNumber: 11, exampleEn: 'The embassy chauffeur waited outside the convention hall.', exampleNe: 'दूतावासका सवारी चालक सम्मेलन भवन बाहिर पर्खिरहेका थिए।' },
  { word: 'Connoisseur', ipa: '/ˌkɒn.əˈsɜːr/', pos: 'noun', silentSummary: 'Double NN, double SS, French -eur', nepali: 'कला वा स्वादको पारखी / विशेषज्ञ', translit: 'Pārakhī', lectureNumber: 11, exampleEn: 'She is a true connoisseur of Ilam orthodox tea.', exampleNe: 'उनी इलामको अर्थोडक्स चियाकी सच्चा पारखी हुन्।' },
  { word: 'Entrepreneur', ipa: '/ˌɒn.trə.prəˈnɜːr/', pos: 'noun', silentSummary: 'French loanword ending in -neur', nepali: 'उद्यमी / नयाँ व्यवसाय सुरु गर्ने व्यक्ति', translit: 'Udyamī', lectureNumber: 11, exampleEn: 'The young entrepreneur launched an organic coffee export company.', exampleNe: 'युवा उद्यमीले प्राङ्गारिक कफी निर्यात कम्पनी सुरु गरे।' },
  { word: 'Reconnaissance', ipa: '/rɪˈkɒn.ɪ.səns/', pos: 'noun', silentSummary: 'Double NN, double SS', nepali: 'पूर्व-सर्वेक्षण / जासुसी निरीक्षण', translit: 'Pūrva-sarvekṣaṇ', lectureNumber: 12, exampleEn: 'Sherpa guides conducted an aerial reconnaissance of the glacier route.', exampleNe: 'शेर्पा गाइडहरूले हिमनदी मार्गको हवाई पूर्व-सर्वेक्षण गरे।' },
  { word: 'Sovereignty', ipa: '/ˈsɒv.rən.ti/', pos: 'noun', silentLetter: 'g', silentSummary: 'Silent "g" before "n" (/ˈsɒv.rən.ti/)', nepali: 'सार्वभौमसत्ता / स्वाधीनता', translit: 'Sārvabhaumsattā', lectureNumber: 12, exampleEn: 'Respecting national sovereignty is a cornerstone of international law.', exampleNe: 'राष्ट्रिय सार्वभौमसत्ताको सम्मान गर्नु अन्तर्राष्ट्रिय कानुनको आधारशिला हो।' },
];

// High-utility domain action & concept stems for systematic vocabulary expansion across all 12 sections
interface DomainConceptSeed {
  stem: string;
  ipaBase: string;
  nepaliRoot: string;
  translitRoot: string;
  lectureNumber: number;
  silentNote: string;
}

const DOMAIN_CONCEPT_SEEDS: DomainConceptSeed[] = [
  // L1: Foundation Phonics & Everyday Actions
  { stem: 'Wrap', ipaBase: 'ræp', nepaliRoot: 'बेरनु / लपेट्नु', translitRoot: 'Bernu', lectureNumber: 1, silentNote: 'Silent initial "w" in wr-' },
  { stem: 'Fasten', ipaBase: 'ˈfɑː.sən', nepaliRoot: 'बाँध्नु / कस्नु', translitRoot: 'Bā̃dhnu', lectureNumber: 1, silentNote: 'Silent "t" in -sten' },
  { stem: 'Listen', ipaBase: 'ˈlɪs.ən', nepaliRoot: 'सुन्नु', translitRoot: 'Sunnu', lectureNumber: 1, silentNote: 'Silent "t" in -sten' },
  { stem: 'Answer', ipaBase: 'ˈɑːn.sər', nepaliRoot: 'जवाफ दिनु', translitRoot: 'Javāph dinu', lectureNumber: 1, silentNote: 'Silent "w" in -sw-' },
  { stem: 'Whistle', ipaBase: 'ˈwɪs.əl', nepaliRoot: 'सिठी बजाउनु', translitRoot: 'Siṭhī bajāunu', lectureNumber: 1, silentNote: 'Silent "h" & "t"' },
  { stem: 'Guard', ipaBase: 'ɡɑːd', nepaliRoot: 'रक्षा गर्नु', translitRoot: 'Rakṣā garnu', lectureNumber: 1, silentNote: 'Silent "u" after "g"' },
  { stem: 'Guide', ipaBase: 'ɡaɪd', nepaliRoot: 'मार्गदर्शन गर्नु', translitRoot: 'Mārgadarśan garnu', lectureNumber: 1, silentNote: 'Silent "u" & final "e"' },
  { stem: 'Guess', ipaBase: 'ɡes', nepaliRoot: 'अनुमान गर्नु', translitRoot: 'Anumān garnu', lectureNumber: 1, silentNote: 'Silent "u" after "g"' },
  { stem: 'Build', ipaBase: 'bɪld', nepaliRoot: 'निर्माण गर्नु', translitRoot: 'Nirmāṇ garnu', lectureNumber: 1, silentNote: 'Silent "u" in -ui-' },
  { stem: 'Judge', ipaBase: 'dʒʌdʒ', nepaliRoot: 'मूल्याङ्कन गर्नु', translitRoot: 'Mūlyāṅkan garnu', lectureNumber: 1, silentNote: 'Silent "d" before "ge"' },

  // L2: Time, Travel & Vowel Patterns
  { stem: 'Receive', ipaBase: 'rɪˈsiːv', nepaliRoot: 'प्राप्त गर्नु', translitRoot: 'Prāpta garnu', lectureNumber: 2, silentNote: 'EI after C + silent "e"' },
  { stem: 'Believe', ipaBase: 'bɪˈliːv', nepaliRoot: 'विश्वास गर्नु', translitRoot: 'Viśvās garnu', lectureNumber: 2, silentNote: 'IE vowel digraph' },
  { stem: 'Achieve', ipaBase: 'əˈtʃiːv', nepaliRoot: 'हासिल गर्नु', translitRoot: 'Hāsil garnu', lectureNumber: 2, silentNote: 'IE vowel digraph' },
  { stem: 'Relieve', ipaBase: 'rɪˈliːv', nepaliRoot: 'राहत दिनु', translitRoot: 'Rāhat dinu', lectureNumber: 2, silentNote: 'IE vowel digraph' },
  { stem: 'Weigh', ipaBase: 'weɪ', nepaliRoot: 'तौलनु', translitRoot: 'Taulanu', lectureNumber: 2, silentNote: 'EI as /eɪ/ + silent "gh"' },
  { stem: 'Schedule', ipaBase: 'ˈʃed.juːl', nepaliRoot: 'तालिका बनाउनु', translitRoot: 'Tālikā banāunu', lectureNumber: 2, silentNote: 'Silent "h" & final "e"' },
  { stem: 'Journey', ipaBase: 'ˈdʒɜː.ni', nepaliRoot: 'यात्रा गर्नु', translitRoot: 'Yātrā garnu', lectureNumber: 2, silentNote: 'Vowel + Y pattern' },
  { stem: 'Arrange', ipaBase: 'əˈreɪndʒ', nepaliRoot: 'व्यवस्था मिलाउनु', translitRoot: 'Vyavasthā milāunu', lectureNumber: 2, silentNote: 'Double RR + silent "e"' },
  { stem: 'Reserve', ipaBase: 'rɪˈzɜːv', nepaliRoot: 'आरक्षण गर्नु', translitRoot: 'Ārakṣaṇ garnu', lectureNumber: 2, silentNote: 'Silent final "e"' },
  { stem: 'Commute', ipaBase: 'kəˈmjuːt', nepaliRoot: 'दैनिक आवतजावत गर्नु', translitRoot: 'Āvatjāvat garnu', lectureNumber: 2, silentNote: 'Double MM + silent "e"' },

  // L3: Academic Clusters & Doubling
  { stem: 'Occur', ipaBase: 'əˈkɜːr', nepaliRoot: 'घटित हुनु', translitRoot: 'Ghaṭit hunu', lectureNumber: 3, silentNote: 'Doubles R in -ed/-ing' },
  { stem: 'Prefer', ipaBase: 'prɪˈfɜːr', nepaliRoot: 'रुचाउनु', translitRoot: 'Ruchāunu', lectureNumber: 3, silentNote: 'Doubles R when stressed' },
  { stem: 'Refer', ipaBase: 'rɪˈfɜːr', nepaliRoot: 'सन्दर्भ दिनु', translitRoot: 'Sandarbha dinu', lectureNumber: 3, silentNote: 'Doubles R when stressed' },
  { stem: 'Admit', ipaBase: 'ədˈmɪt', nepaliRoot: 'स्वीकार गर्नु / भर्ना गर्नु', translitRoot: 'Svīkār garnu', lectureNumber: 3, silentNote: 'Doubles T in -ed/-ing' },
  { stem: 'Permit', ipaBase: 'pəˈmɪt', nepaliRoot: 'अनुमति दिनु', translitRoot: 'Anumati dinu', lectureNumber: 3, silentNote: 'Doubles T in -ed/-ing' },
  { stem: 'Submit', ipaBase: 'səbˈmɪt', nepaliRoot: 'बुझाउनु / पेश गर्नु', translitRoot: 'Peś garnu', lectureNumber: 3, silentNote: 'Doubles T in -ed/-ing' },
  { stem: 'Commit', ipaBase: 'kəˈmɪt', nepaliRoot: 'प्रतिबद्ध हुनु', translitRoot: 'Pratibaddha hunu', lectureNumber: 3, silentNote: 'Double MM + doubles T' },
  { stem: 'Control', ipaBase: 'kənˈtrəʊl', nepaliRoot: 'नियन्त्रण गर्नु', translitRoot: 'Niyantraṇ garnu', lectureNumber: 3, silentNote: 'Doubles L in -ed/-ing' },
  { stem: 'Compel', ipaBase: 'kəmˈpel', nepaliRoot: 'बाध्य पार्नु', translitRoot: 'Bādhya pārnu', lectureNumber: 3, silentNote: 'Doubles L in -ed/-ing' },
  { stem: 'Fulfil', ipaBase: 'fʊlˈfɪl', nepaliRoot: 'पूरा गर्नु', translitRoot: 'Pūrā garnu', lectureNumber: 3, silentNote: 'Doubles L in -ed/-ing' },

  // L4: Workplace & Finance
  { stem: 'Accommodate', ipaBase: 'əˈkɒm.ə.deɪt', nepaliRoot: 'बसोबास वा ठाउँ मिलाउनु', translitRoot: 'Ṭhāũ milāunu', lectureNumber: 4, silentNote: 'Double CC, double MM' },
  { stem: 'Recommend', ipaBase: 'ˌrek.əˈmend', nepaliRoot: 'सिफारिस गर्नु', translitRoot: 'Siphāris garnu', lectureNumber: 4, silentNote: 'Single C, double MM' },
  { stem: 'Negotiate', ipaBase: 'nɪˈɡəʊ.ʃi.eɪt', nepaliRoot: 'वार्ता वा सम्झौता गर्नु', translitRoot: 'Vārtā garnu', lectureNumber: 4, silentNote: '-ti- pronounced /ʃi/' },
  { stem: 'Collaborate', ipaBase: 'kəˈlæb.ə.reɪt', nepaliRoot: 'सहकार्य गर्नु', translitRoot: 'Sahakārya garnu', lectureNumber: 4, silentNote: 'Double LL + silent "e"' },
  { stem: 'Coordinate', ipaBase: 'kəʊˈɔː.dɪ.neɪt', nepaliRoot: 'समन्वय गर्नु', translitRoot: 'Samanvaya garnu', lectureNumber: 4, silentNote: 'Double OO prefix' },
  { stem: 'Supervise', ipaBase: 'ˈsuː.pə.vaɪz', nepaliRoot: 'सुपरिवेक्षण गर्नु', translitRoot: 'Suparivekṣaṇ garnu', lectureNumber: 4, silentNote: 'Silent final "e"' },
  { stem: 'Delegate', ipaBase: 'ˈdel.ɪ.ɡeɪt', nepaliRoot: 'अधिकार प्रत्यायोजन गर्नु', translitRoot: 'Adhikār dinu', lectureNumber: 4, silentNote: 'Silent final "e"' },
  { stem: 'Allocate', ipaBase: 'ˈæl.ə.keɪt', nepaliRoot: 'बाँडफाँड गर्नु / छुट्याउनु', translitRoot: 'Chhuṭyāunu', lectureNumber: 4, silentNote: 'Double LL + silent "e"' },
  { stem: 'Evaluate', ipaBase: 'ɪˈvæl.ju.eɪt', nepaliRoot: 'मूल्याङ्कन गर्नु', translitRoot: 'Mūlyāṅkan garnu', lectureNumber: 4, silentNote: 'Silent final "e"' },
  { stem: 'Facilitate', ipaBase: 'fəˈsɪl.ɪ.teɪt', nepaliRoot: 'सहजीकरण गर्नु', translitRoot: 'Sahajīkaraṇ garnu', lectureNumber: 4, silentNote: 'Soft C (/s/) + silent "e"' },

  // L5: Governance, Environment & Schwa
  { stem: 'Govern', ipaBase: 'ˈɡʌv.ən', nepaliRoot: 'शासन वा सञ्चालन गर्नु', translitRoot: 'Śāsan garnu', lectureNumber: 5, silentNote: 'Retains "n" before -ment' },
  { stem: 'Develop', ipaBase: 'dɪˈvel.əp', nepaliRoot: 'विकास गर्नु', translitRoot: 'Vikās garnu', lectureNumber: 5, silentNote: 'No "e" before -ment' },
  { stem: 'Manage', ipaBase: 'ˈmæn.ɪdʒ', nepaliRoot: 'व्यवस्थापन गर्नु', translitRoot: 'Vyavasthāpan garnu', lectureNumber: 5, silentNote: 'Keeps "e" in management' },
  { stem: 'Measure', ipaBase: 'ˈmeʒ.ər', nepaliRoot: 'नाप्नु / मापन गर्नु', translitRoot: 'Māpan garnu', lectureNumber: 5, silentNote: 'Drops "e" in measurable' },
  { stem: 'Sustain', ipaBase: 'səˈsteɪn', nepaliRoot: 'दिगो राख्नु / धान्नु', translitRoot: 'Digo rākhnu', lectureNumber: 5, silentNote: 'Takes -able suffix' },
  { stem: 'Maintain', ipaBase: 'meɪnˈteɪn', nepaliRoot: 'कायम राख्नु / मर्मत गर्नु', translitRoot: 'Kāyam rākhnu', lectureNumber: 5, silentNote: 'Becomes maintenance' },
  { stem: 'Conserve', ipaBase: 'kənˈsɜːv', nepaliRoot: 'संरक्षण गर्नु', translitRoot: 'Saṃrakṣaṇ garnu', lectureNumber: 5, silentNote: 'Silent final "e"' },
  { stem: 'Regulate', ipaBase: 'ˈreɡ.jə.leɪt', nepaliRoot: 'नियमन गर्नु', translitRoot: 'Niyaman garnu', lectureNumber: 5, silentNote: 'Silent final "e"' },
  { stem: 'Implement', ipaBase: 'ˈɪm.plɪ.ment', nepaliRoot: 'कार्यान्वयन गर्नु', translitRoot: 'Kāryānvayan garnu', lectureNumber: 5, silentNote: 'Clear syllable stress' },
  { stem: 'Transform', ipaBase: 'trænsˈfɔːm', nepaliRoot: 'रूपान्तरण गर्नु', translitRoot: 'Rūpāntaraṇ garnu', lectureNumber: 5, silentNote: 'Prefix trans-' },

  // L6: Ethics, Logic & Confusables
  { stem: 'Influence', ipaBase: 'ˈɪn.flu.əns', nepaliRoot: 'प्रभाव पार्नु', translitRoot: 'Prabhāv pārnu', lectureNumber: 6, silentNote: 'Ends in -ce (/s/)' },
  { stem: 'Complement', ipaBase: 'ˈkɒm.plɪ.ment', nepaliRoot: 'पूरक बन्नु / पूर्ण बनाउनु', translitRoot: 'Pūrak bannu', lectureNumber: 6, silentNote: 'Spelled with E (complete)' },
  { stem: 'Compliment', ipaBase: 'ˈkɒm.plɪ.ment', nepaliRoot: 'प्रशंसा गर्नु', translitRoot: 'Praśaṃsā garnu', lectureNumber: 6, silentNote: 'Spelled with I (praise)' },
  { stem: 'Verify', ipaBase: 'ˈver.ɪ.faɪ', nepaliRoot: 'पुष्टि वा रुजु गर्नु', translitRoot: 'Puṣṭi garnu', lectureNumber: 6, silentNote: 'Y changes to I in -ied' },
  { stem: 'Justify', ipaBase: 'ˈdʒʌs.tɪ.faɪ', nepaliRoot: 'औचित्य पुष्टि गर्नु', translitRoot: 'Auchitya puṣṭi garnu', lectureNumber: 6, silentNote: 'Y changes to I in -ied' },
  { stem: 'Clarify', ipaBase: 'ˈklær.ɪ.faɪ', nepaliRoot: 'स्पष्ट पार्नु', translitRoot: 'Spaṣṭa pārnu', lectureNumber: 6, silentNote: 'Y changes to I in -ied' },
  { stem: 'Modify', ipaBase: 'ˈmɒd.ɪ.faɪ', nepaliRoot: 'परिमार्जन गर्नु', translitRoot: 'Parimārjan garnu', lectureNumber: 6, silentNote: 'Y changes to I in -ied' },
  { stem: 'Specify', ipaBase: 'ˈspes.ɪ.faɪ', nepaliRoot: 'किटान गर्नु / तोक्नु', translitRoot: 'Kiṭān garnu', lectureNumber: 6, silentNote: 'Y changes to I in -ied' },
  { stem: 'Rectify', ipaBase: 'ˈrek.tɪ.faɪ', nepaliRoot: 'सच्याउनु / सुधार गर्नु', translitRoot: 'Sachyāunu', lectureNumber: 6, silentNote: 'Y changes to I in -ied' },
  { stem: 'acknowledge', ipaBase: 'əkˈnɒl.ɪdʒ', nepaliRoot: 'स्वीकार वा कदर गर्नु', translitRoot: 'Kadar garnu', lectureNumber: 6, silentNote: 'Silent "k", "w", "d"' },

  // L7: Household, Plurals & Causatives
  { stem: 'Repair', ipaBase: 'rɪˈpeər', nepaliRoot: 'मर्मत गर्नु', translitRoot: 'Marmat garnu', lectureNumber: 7, silentNote: 'Used in causative "have repaired"' },
  { stem: 'Install', ipaBase: 'ɪnˈstɔːl', nepaliRoot: 'जडान गर्नु', translitRoot: 'Jaḍān garnu', lectureNumber: 7, silentNote: 'Double LL' },
  { stem: 'Renovate', ipaBase: 'ˈren.ə.veɪt', nepaliRoot: 'जीर्णोद्धार वा मर्मत गर्नु', translitRoot: 'Jīrṇoddhār garnu', lectureNumber: 7, silentNote: 'Silent final "e"' },
  { stem: 'Construct', ipaBase: 'kənˈstrʌkt', nepaliRoot: 'निर्माण गर्नु', translitRoot: 'Nirmāṇ garnu', lectureNumber: 7, silentNote: 'Clear consonant cluster' },
  { stem: 'Inspect', ipaBase: 'ɪnˈspekt', nepaliRoot: 'निरीक्षण गर्नु', translitRoot: 'Nirīkṣaṇ garnu', lectureNumber: 7, silentNote: 'Takes -or for person' },
  { stem: 'Deliver', ipaBase: 'dɪˈlɪv.ər', nepaliRoot: 'पुर्याउनु / वितरण गर्नु', translitRoot: 'Vitaraṇ garnu', lectureNumber: 7, silentNote: 'First-syllable unstressed' },
  { stem: 'Polish', ipaBase: 'ˈpɒl.ɪʃ', nepaliRoot: 'टल्काउनु', translitRoot: 'Ṭalkāunu', lectureNumber: 7, silentNote: 'Takes -es in 3rd person' },
  { stem: 'Furnish', ipaBase: 'ˈfɜː.nɪʃ', nepaliRoot: 'फर्निचरले सजाउनु', translitRoot: 'Sajāunu', lectureNumber: 7, silentNote: 'Related to furniture' },
  { stem: 'Replace', ipaBase: 'rɪˈpleɪs', nepaliRoot: 'बदल्नु / प्रतिस्थापन गर्नु', translitRoot: 'Pratisthāpan garnu', lectureNumber: 7, silentNote: 'Keeps "e" in replaceable' },
  { stem: 'Assemble', ipaBase: 'əˈsem.bəl', nepaliRoot: 'जोड्नु / जम्मा गर्नु', translitRoot: 'Joḍnu', lectureNumber: 7, silentNote: 'Double SS + silent "e"' },

  // L8: Hospitality, Culinary & Quantifiers
  { stem: 'Advise', ipaBase: 'ədˈvaɪz', nepaliRoot: 'सल्लाह दिनु', translitRoot: 'Sallāha dinu', lectureNumber: 8, silentNote: 'Verb with -SE (Noun = advice)' },
  { stem: 'Prepare', ipaBase: 'prɪˈpeər', nepaliRoot: 'तयार गर्नु', translitRoot: 'Tayār garnu', lectureNumber: 8, silentNote: 'Silent final "e"' },
  { stem: 'Preserve', ipaBase: 'prɪˈzɜːv', nepaliRoot: 'जोगाउनु / परिरक्षण गर्नु', translitRoot: 'Jogaunu', lectureNumber: 8, silentNote: 'S sounds like /z/' },
  { stem: 'Consume', ipaBase: 'kənˈsjuːm', nepaliRoot: 'उपभोग गर्नु', translitRoot: 'Upabhog garnu', lectureNumber: 8, silentNote: 'Silent final "e"' },
  { stem: 'Nourish', ipaBase: 'ˈnʌr.ɪʃ', nepaliRoot: 'पोषण दिनु', translitRoot: 'Poṣaṇ dinu', lectureNumber: 8, silentNote: 'Takes -ment / -ing' },
  { stem: 'Cultivate', ipaBase: 'ˈkʌl.tɪ.veɪt', nepaliRoot: 'खेती गर्नु / विकास गर्नु', translitRoot: 'Khetī garnu', lectureNumber: 8, silentNote: 'Silent final "e"' },
  { stem: 'Harvest', ipaBase: 'ˈhɑː.vɪst', nepaliRoot: 'बाली भित्र्याउनु', translitRoot: 'Bālī bhitryāunu', lectureNumber: 8, silentNote: 'First-syllable stress' },
  { stem: 'Distribute', ipaBase: 'dɪˈstrɪb.juːt', nepaliRoot: 'वितरण गर्नु', translitRoot: 'Vitaraṇ garnu', lectureNumber: 8, silentNote: 'Silent final "e"' },
  { stem: 'Measure', ipaBase: 'ˈmeʒ.ər', nepaliRoot: 'मात्रा नाप्नु', translitRoot: 'Mātrā nāpnu', lectureNumber: 8, silentNote: 'Used with quantifiers' },
  { stem: 'Organize', ipaBase: 'ˈɔː.ɡən.aɪz', nepaliRoot: 'आयोजना गर्नु', translitRoot: 'Āyojanā garnu', lectureNumber: 8, silentNote: 'Silent final "e"' },

  // L9: Business, Law & Passive Voice
  { stem: 'Authorize', ipaBase: 'ˈɔː.θər.aɪz', nepaliRoot: 'आधिकारिक अनुमति दिनु', translitRoot: 'Adhikār dinu', lectureNumber: 9, silentNote: 'Silent final "e"' },
  { stem: 'compensate', ipaBase: 'ˈkɒm.pən.seɪt', nepaliRoot: 'क्षतिपूर्ति दिनु', translitRoot: 'Kṣatipūrti dinu', lectureNumber: 9, silentNote: 'Silent final "e"' },
  { stem: 'Investigate', ipaBase: 'ɪnˈves.tɪ.ɡeɪt', nepaliRoot: 'छानबिन गर्नु', translitRoot: 'Chhānbin garnu', lectureNumber: 9, silentNote: 'Silent final "e"' },
  { stem: 'Prosecute', ipaBase: 'ˈprɒs.ɪ.kjuːt', nepaliRoot: 'कानुनी कारबाही चलाउनु', translitRoot: 'Kārbāhī chalāunu', lectureNumber: 9, silentNote: 'Silent final "e"' },
  { stem: 'Legislate', ipaBase: 'ˈledʒ.ɪ.sleɪt', nepaliRoot: 'कानुन निर्माण गर्नु', translitRoot: 'Kānun banāunu', lectureNumber: 9, silentNote: 'Soft G (/dʒ/)' },
  { stem: 'Arbitrate', ipaBase: 'ˈɑː.bɪ.treɪt', nepaliRoot: 'मध्यस्थता गर्नु', translitRoot: 'Madhyasthatā garnu', lectureNumber: 9, silentNote: 'Silent final "e"' },
  { stem: 'Audit', ipaBase: 'ˈɔː.dɪt', nepaliRoot: 'लेखापरीक्षण गर्नु', translitRoot: 'Lekhāparīkṣaṇ garnu', lectureNumber: 9, silentNote: 'First-syllable stress' },
  { stem: 'Reimburse', ipaBase: 'ˌriː.ɪmˈbɜːs', nepaliRoot: 'खर्च फिर्ता भुक्तानी गर्नु', translitRoot: 'Bhuktānī phirtā garnu', lectureNumber: 9, silentNote: 'Silent final "e"' },
  { stem: 'Procure', ipaBase: 'prəˈkjʊər', nepaliRoot: 'खरिद वा प्राप्ति गर्नु', translitRoot: 'Kharid garnu', lectureNumber: 9, silentNote: 'Keeps "e" in procurement' },
  { stem: 'Endorse', ipaBase: 'ɪnˈdɔːs', nepaliRoot: 'समर्थन वा अनुमोदन गर्नु', translitRoot: 'Anomodan garnu', lectureNumber: 9, silentNote: 'Keeps "e" in endorsement' },

  // L10: Communication, Media & Reported Speech
  { stem: 'Announce', ipaBase: 'əˈnaʊns', nepaliRoot: 'घोषणा गर्नु', translitRoot: 'Ghoṣaṇā garnu', lectureNumber: 10, silentNote: 'Double NN + keeps "e" in -ment' },
  { stem: 'Broadcast', ipaBase: 'ˈbrɔːd.kɑːst', nepaliRoot: 'प्रसारण गर्नु', translitRoot: 'Prasāraṇ garnu', lectureNumber: 10, silentNote: 'Irregular past: broadcast' },
  { stem: 'Publish', ipaBase: 'ˈpʌb.lɪʃ', nepaliRoot: 'प्रकाशन गर्नु', translitRoot: 'Prakāśan garnu', lectureNumber: 10, silentNote: 'Takes -es in 3rd person' },
  { stem: 'Communicate', ipaBase: 'kəˈmjuː.nɪ.keɪt', nepaliRoot: 'सञ्चार वा संवाद गर्नु', translitRoot: 'Saṃvād garnu', lectureNumber: 10, silentNote: 'Double MM + silent "e"' },
  { stem: 'Interpret', ipaBase: 'ɪnˈtɜː.prɪt', nepaliRoot: 'व्याख्या वा उल्था गर्नु', translitRoot: 'Vyākhyā garnu', lectureNumber: 10, silentNote: 'No consonant doubling' },
  { stem: 'Translate', ipaBase: 'trænzˈleɪt', nepaliRoot: 'अनुवाद गर्नु', translitRoot: 'Anuvād garnu', lectureNumber: 10, silentNote: 'Drops "e" in translation' },
  { stem: 'articulate', ipaBase: 'ɑːˈtɪk.jə.leɪt', nepaliRoot: 'स्पष्ट रूपमा व्यक्त गर्नु', translitRoot: 'Spaṣṭa vyakta garnu', lectureNumber: 10, silentNote: 'Silent final "e"' },
  { stem: 'Summarize', ipaBase: 'ˈsʌm.ər.aɪz', nepaliRoot: 'सारांश प्रस्तुत गर्नु', translitRoot: 'Sārāṃśa dinu', lectureNumber: 10, silentNote: 'Double MM' },
  { stem: 'Confirm', ipaBase: 'kənˈfɜːm', nepaliRoot: 'पुष्टि गर्नु', translitRoot: 'Puṣṭi garnu', lectureNumber: 10, silentNote: 'Takes -ation suffix' },
  { stem: 'Disclose', ipaBase: 'dɪsˈkləʊz', nepaliRoot: 'खुलासा गर्नु', translitRoot: 'Khulāsā garnu', lectureNumber: 10, silentNote: 'Drops "e" in disclosure' },

  // L11: Academic Analysis & Contrast
  { stem: 'Analyze', ipaBase: 'ˈæn.əl.aɪz', nepaliRoot: 'विश्लेषण गर्नु', translitRoot: 'Viśleṣaṇ garnu', lectureNumber: 11, silentNote: 'Silent final "e"' },
  { stem: 'Synthesize', ipaBase: 'ˈsɪn.θə.saɪz', nepaliRoot: 'संश्लेषण वा संयोजन गर्नु', translitRoot: 'Saṃyojan garnu', lectureNumber: 11, silentNote: 'Greek th (/θ/)' },
  { stem: 'Categorize', ipaBase: 'ˈkæt.ə.ɡər.aɪz', nepaliRoot: 'वर्गीकरण गर्नु', translitRoot: 'Vargīkaraṇ garnu', lectureNumber: 11, silentNote: 'Silent final "e"' },
  { stem: 'Correlate', ipaBase: 'ˈkɒr.ə.leɪt', nepaliRoot: 'अन्तरसम्बन्ध देखाउनु', translitRoot: 'Antarsambandha dekhāunu', lectureNumber: 11, silentNote: 'Double RR' },
  { stem: 'Demonstrate', ipaBase: 'ˈdem.ən.streɪt', nepaliRoot: 'प्रमाणित वा प्रदर्शन गर्नु', translitRoot: 'Pradarśan garnu', lectureNumber: 11, silentNote: 'Silent final "e"' },
  { stem: 'Illustrate', ipaBase: 'ˈɪl.ə.streɪt', nepaliRoot: 'उदाहरणद्वारा स्पष्ट पार्नु', translitRoot: 'Udāharaṇ dinu', lectureNumber: 11, silentNote: 'Double LL' },
  { stem: 'Formulate', ipaBase: 'ˈfɔː.mjə.leɪt', nepaliRoot: 'तर्जुमा वा सूत्रबद्ध गर्नु', translitRoot: 'Tarjumā garnu', lectureNumber: 11, silentNote: 'Silent final "e"' },
  { stem: 'Postulate', ipaBase: 'ˈpɒs.tʃə.leɪt', nepaliRoot: 'मान्यता अघि सार्नु', translitRoot: 'Mānyatā rākhnu', lectureNumber: 11, silentNote: 'Silent final "e"' },
  { stem: 'Substantiate', ipaBase: 'səbˈstæn.ʃi.eɪt', nepaliRoot: 'प्रमाणले पुष्टि गर्नु', translitRoot: 'Pramāṇit garnu', lectureNumber: 11, silentNote: '-ti- sounds like /ʃi/' },
  { stem: 'Differentiate', ipaBase: 'ˌdɪf.əˈren.ʃi.eɪt', nepaliRoot: 'फरक छुट्याउनु', translitRoot: 'Pharak chhuṭyāunu', lectureNumber: 11, silentNote: 'Double FF' },

  // L12: Diplomacy, Executive Leadership & Inversion
  { stem: 'Ratify', ipaBase: 'ˈræt.ɪ.faɪ', nepaliRoot: 'अनुमोदन गर्नु (सन्धि/सम्झौता)', translitRoot: 'Anomodan garnu', lectureNumber: 12, silentNote: 'Y changes to I in -ied' },
  { stem: 'Mediate', ipaBase: 'ˈmiː.di.eɪt', nepaliRoot: 'मध्यस्थता गर्नु', translitRoot: 'Madhyasthatā garnu', lectureNumber: 12, silentNote: 'Silent final "e"' },
  { stem: 'Reconcile', ipaBase: 'ˈrek.ən.saɪl', nepaliRoot: 'मेलमिलाप गराउनु', translitRoot: 'Melmilāp garāunu', lectureNumber: 12, silentNote: 'Silent final "e"' },
  { stem: 'Consolidate', ipaBase: 'kənˈsɒl.ɪ.deɪt', nepaliRoot: 'सुदृढ वा एकीकृत गर्नु', translitRoot: 'Sudṛḍh garnu', lectureNumber: 12, silentNote: 'Silent final "e"' },
  { stem: 'Inaugurate', ipaBase: 'ɪˈnɔː.ɡjə.reɪt', nepaliRoot: 'उद्घाटन गर्नु', translitRoot: 'Udghāṭan garnu', lectureNumber: 12, silentNote: 'Silent final "e"' },
  { stem: 'Commemorate', ipaBase: 'kəˈmem.ə.reɪt', nepaliRoot: 'स्मरण उत्सव मनाउनु', translitRoot: 'Smaraṇ garnu', lectureNumber: 12, silentNote: 'Double MM' },
  { stem: 'Collaborate', ipaBase: 'kəˈlæb.ə.reɪt', nepaliRoot: 'कूटनीतिक सहकार्य गर्नु', translitRoot: 'Sahakārya garnu', lectureNumber: 12, silentNote: 'Double LL' },
  { stem: 'harmonize', ipaBase: 'ˈhɑː.mə.naɪz', nepaliRoot: 'सामञ्जस्य कायम गर्नु', translitRoot: 'Sāmañjasya garnu', lectureNumber: 12, silentNote: 'Silent final "e"' },
  { stem: 'Revitalize', ipaBase: 'ˌriːˈvaɪ.təl.aɪz', nepaliRoot: 'पुनर्जीवित वा सशक्त बनाउनु', translitRoot: 'Punarjīvit garnu', lectureNumber: 12, silentNote: 'Silent final "e"' },
  { stem: 'Institutionalize', ipaBase: 'ˌɪn.stɪˈtjuː.ʃən.əl.aɪz', nepaliRoot: 'संस्थागत गर्नु', translitRoot: 'Saṃsthāgat garnu', lectureNumber: 12, silentNote: '-ti- sounds like /ʃ/' },
];

// High-utility Academic, Professional & Everyday Modifier + Domain Noun Collocation Matrix
interface ModifierSeed {
  adj: string;
  ipa: string;
  nepali: string;
  translit: string;
  silentChar?: string;
  silentDesc: string;
}

const MODIFIER_SEEDS: ModifierSeed[] = [
  { adj: 'Subtle', ipa: '/ˈsʌt.əl/', nepali: 'सूक्ष्म', translit: 'Sūkṣma', silentChar: 'b', silentDesc: 'Silent "b" before "t"' },
  { adj: 'Honest', ipa: '/ˈɒn.ɪst/', nepali: 'इमानदार', translit: 'Imāndār', silentChar: 'H', silentDesc: 'Silent initial "h"' },
  { adj: 'Calm', ipa: '/kɑːm/', nepali: 'शान्त', translit: 'Śānta', silentChar: 'l', silentDesc: 'Silent "l" before "m"' },
  { adj: 'Foreign', ipa: '/ˈfɒr.ən/', nepali: 'वैदेशिक', translit: 'Vaideśik', silentChar: 'g', silentDesc: 'Silent "g" before "n"' },
  { adj: 'Solemn', ipa: '/ˈsɒl.əm/', nepali: 'गम्भीर र मर्यादित', translit: 'Gambhīr', silentChar: 'n', silentDesc: 'Silent final "n"' },
  { adj: 'Benign', ipa: '/bɪˈnaɪn/', nepali: 'सौम्य र अनुकूल', translit: 'Saumya', silentChar: 'g', silentDesc: 'Silent "g" before "n"' },
  { adj: 'Conscious', ipa: '/ˈkɒn.ʃəs/', nepali: 'सचेत', translit: 'Sachet', silentChar: 'c', silentDesc: 'Silent "c" in "sc"' },
  { adj: 'Wholesome', ipa: '/ˈhəʊl.səm/', nepali: 'स्वस्थ र हितकारी', translit: 'Hitakārī', silentChar: 'W', silentDesc: 'Silent initial "w"' },
  { adj: 'Gourmet', ipa: '/ˈɡɔː.meɪ/', nepali: 'उच्च स्तरीय', translit: 'Uchcha starīya', silentChar: 't', silentDesc: 'Silent final "t"' },
  { adj: 'Sovereign', ipa: '/ˈsɒv.rɪn/', nepali: 'सार्वभौम', translit: 'Sārvabhaum', silentChar: 'g', silentDesc: 'Silent "g" before "n"' },
  { adj: 'Bourgeois', ipa: '/ˈbʊə.ʒwɑː/', nepali: 'मध्यमवर्गीय', translit: 'Madhyamvargīya', silentChar: 's', silentDesc: 'Silent final "s"' },
  { adj: 'Rhetorical', ipa: '/rɪˈtɒr.ɪ.kəl/', nepali: 'आलङ्कारिक', translit: 'Ālaṅkārik', silentChar: 'h', silentDesc: 'Silent "h" after "r"' },
  { adj: 'Chaotic', ipa: '/keɪˈɒt.ɪk/', nepali: 'अस्तव्यस्त', translit: 'Astavyasta', silentChar: 'h', silentDesc: 'Greek "ch" as /k/' },
  { adj: 'Chronic', ipa: '/ˈkrɒn.ɪk/', nepali: 'दीर्घकालीन', translit: 'Dīrghakālīn', silentChar: 'h', silentDesc: 'Greek "ch" as /k/' },
  { adj: 'Vague', ipa: '/veɪɡ/', nepali: 'अस्पष्ट', translit: 'Aspaṣṭa', silentChar: 'ue', silentDesc: 'Silent final "-ue"' },
  { adj: 'Sustainable', ipa: '/səˈsteɪ.nə.bəl/', nepali: 'दिगो', translit: 'Digo', silentDesc: 'Root + -able suffix' },
  { adj: 'Independent', ipa: '/ˌɪn.dɪˈpen.dənt/', nepali: 'स्वतन्त्र', translit: 'Swatantra', silentDesc: 'Spelled with -ent' },
  { adj: 'Necessary', ipa: '/ˈnes.ə.ser.i/', nepali: 'आवश्यक', translit: 'Āvaśyak', silentDesc: '1 C, double SS' },
  { adj: 'Unnecessary', ipa: '/ʌnˈnes.ə.ser.i/', nepali: 'अनावश्यक', translit: 'Anāvaśyak', silentDesc: 'Double NN, double SS' },
  { adj: 'Comfortable', ipa: '/ˈkʌm.fə.tə.bəl/', nepali: 'आरामदायी', translit: 'Ārāmdāyī', silentLetter: 'or', silentDesc: 'Compressed middle "or"' } as any,
  { adj: 'Dependable', ipa: '/dɪˈpen.də.bəl/', nepali: 'भरपर्दो', translit: 'Bharpardo', silentDesc: 'Root + -able' },
  { adj: 'Accountable', ipa: '/əˈkaʊn.tə.bəl/', nepali: 'जवाफदेही', translit: 'Javāphdehī', silentDesc: 'Double CC + -able' },
  { adj: 'Accessible', ipa: '/əkˈses.ə.bəl/', nepali: 'पहुँचयोग्य', translit: 'Pahũchyogya', silentDesc: 'Double CC, double SS, -ible' },
  { adj: 'Conscientious', ipa: '/ˌkɒn.ʃiˈen.ʃəs/', nepali: 'कर्तव्यनिष्ठ', translit: 'Kartavyaniṣṭha', silentChar: 'c', silentDesc: 'sc + -tious' },
  { adj: 'Ambitious', ipa: '/æmˈbɪʃ.əs/', nepali: 'महत्त्वाकांक्षी', translit: 'Mahattvākāṅkṣī', silentDesc: '-tious adjective' },
  { adj: 'Cautious', ipa: '/ˈkɔː.ʃəs/', nepali: 'सजग र सावधान', translit: 'Sāvadhān', silentDesc: '-tious adjective' },
  { adj: 'Gracious', ipa: '/ˈɡreɪ.ʃəs/', nepali: 'विनम्र र शिष्ट', translit: 'Vinamra', silentDesc: '-cious adjective' },
  { adj: 'Spacious', ipa: '/ˈspeɪ.ʃəs/', nepali: 'फराकिलो', translit: 'Pharākilo', silentDesc: '-cious adjective' },
  { adj: 'Nutritious', ipa: '/njuːˈtrɪʃ.əs/', nepali: 'पोषिलो', translit: 'Poṣilo', silentDesc: '-tious adjective' },
  { adj: 'Audacious', ipa: '/ɔːˈdeɪ.ʃəs/', nepali: 'साहसी', translit: 'Sāhasī', silentDesc: '-cious adjective' },
];

function buildSegments(word: string, silentSub?: string): WordSegment[] {
  if (!silentSub) {
    return [{ text: word, silent: false }];
  }
  const idx = word.toLowerCase().indexOf(silentSub.toLowerCase());
  if (idx === -1) {
    return [{ text: word, silent: false }];
  }
  const segments: WordSegment[] = [];
  if (idx > 0) {
    segments.push({ text: word.slice(0, idx), silent: false });
  }
  segments.push({ text: word.slice(idx, idx + silentSub.length), silent: true });
  if (idx + silentSub.length < word.length) {
    segments.push({ text: word.slice(idx + silentSub.length), silent: false });
  }
  return segments;
}

let cachedMassiveLexicon: EnrichedLexiconItem[] | null = null;

export function getMassiveLexicon(lectures: LectureUnit[]): EnrichedLexiconItem[] {
  if (cachedMassiveLexicon && lectures.length >= 12) {
    return cachedMassiveLexicon;
  }

  const items: EnrichedLexiconItem[] = [];
  const seenWords = new Set<string>();

  const lectureMap = new Map<number, LectureUnit>();
  for (const lec of lectures) {
    lectureMap.set(lec.lectureNumber, lec);
  }

  const origToSeqMap: Record<number, number> = {
    1: 1,
    2: 2,
    7: 3,
    8: 4,
    3: 5,
    4: 6,
    9: 7,
    10: 8,
    5: 9,
    6: 10,
    11: 11,
    12: 12,
  };

  const getLectureMeta = (lectureNum: number) => {
    const rawNorm = ((lectureNum - 1) % 12) + 1;
    const normalized = origToSeqMap[rawNorm] ?? rawNorm;
    const lec = lectureMap.get(normalized) || lectures[0];
    return {
      lectureId: lec ? lec.id : `lecture-${normalized}`,
      lectureNumber: normalized,
      lectureTitle: lec ? lec.title : `Lecture ${normalized}`,
      category: lec ? lec.category : 'Core Curriculum',
      level: (lec ? lec.level : normalized <= 4 ? 'B1' : normalized <= 8 ? 'B2' : 'C1') as CEFRLevel,
    };
  };

  // 1. Add all Core Lesson Vocabulary Words from the active lectures first
  for (const lec of lectures) {
    for (const v of lec.moduleA_vocabulary) {
      const key = v.word.toLowerCase();
      seenWords.add(key);
      items.push({
        ...v,
        lectureId: lec.id,
        lectureNumber: lec.lectureNumber,
        lectureTitle: lec.title,
        category: lec.category,
        level: lec.level,
        isCoreLessonWord: true,
      });
    }
  }

  // 2. Add the 180 Curated High-Utility Root Seeds
  for (let i = 0; i < CURATED_ROOT_SEEDS.length; i++) {
    const seed = CURATED_ROOT_SEEDS[i];
    const key = seed.word.toLowerCase();
    if (seenWords.has(key)) continue;
    seenWords.add(key);

    const meta = getLectureMeta(seed.lectureNumber);
    items.push({
      id: `lex-root-${i + 1}`,
      word: seed.word,
      ipa: seed.ipa,
      partOfSpeech: seed.pos,
      segments: buildSegments(seed.word, seed.silentLetter),
      silentLettersSummary: seed.silentSummary,
      nepaliMeaning: seed.nepali,
      nepaliTransliteration: seed.translit,
      englishExample: seed.exampleEn,
      nepaliExampleTranslation: seed.exampleNe,
      usageTipNepali: `"${seed.word}" (${seed.ipa}) — ${seed.silentSummary}। नेपाली अर्थ: ${seed.nepali}।`,
      ...meta,
    });
  }

  // 3. Generate Morphological Word-Family Derivations for the 120 Domain Concept Stems (120 * 14 forms = ~1,680 words)
  const derivationalTemplates = [
    {
      suffixLabel: 'Base Form (V1)',
      buildWord: (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
      pos: 'verb',
      ipaSuffix: '',
      nepaliSuffix: ' (मूल क्रिया)',
      exEn: (w: string) => `Professionals ${w.toLowerCase()} every detail carefully during the project.`,
      exNe: (n: string) => `विज्ञहरूले परियोजनाको क्रममा प्रत्येक विवरणलाई सावधानीपूर्वक ${n} कार्य गर्छन्।`,
    },
    {
      suffixLabel: 'Present 3rd Person (-s/-es)',
      buildWord: (s: string) => {
        const low = s.toLowerCase();
        const cap = s.charAt(0).toUpperCase() + low.slice(1);
        if (low.endsWith('y')) return `${cap.slice(0, -1)}ies`;
        if (low.endsWith('sh') || low.endsWith('ch') || low.endsWith('s')) return `${cap}es`;
        return `${cap}s`;
      },
      pos: 'verb (3rd person singular)',
      ipaSuffix: 's',
      nepaliSuffix: ' (एकवचन वर्तमान क्रिया)',
      exEn: (w: string) => `Our team coordinator ${w.toLowerCase()} the workflow every Monday.`,
      exNe: (n: string) => `हाम्रो टोली संयोजकले हरेक सोमबार कार्यप्रवाह ${n} काम गर्नुहुन्छ।`,
    },
    {
      suffixLabel: 'Progressive / Gerund (-ing)',
      buildWord: (s: string) => {
        const low = s.toLowerCase();
        const cap = s.charAt(0).toUpperCase() + low.slice(1);
        if (low.endsWith('e') && !low.endsWith('ee')) return `${cap.slice(0, -1)}ing`;
        if (['occur', 'prefer', 'refer', 'admit', 'permit', 'submit', 'commit', 'control', 'compel', 'fulfil', 'wrap'].includes(low)) {
          return `${cap}${low.slice(-1)}ing`;
        }
        return `${cap}ing`;
      },
      pos: 'gerund / participle',
      ipaSuffix: 'ɪŋ',
      nepaliSuffix: ' (गर्दै / गर्ने कार्य)',
      exEn: (w: string) => `${w} accurately requires patience and clear communication.`,
      exNe: (n: string) => `सही रूपमा ${n} कार्यका लागि धैर्य र स्पष्ट सञ्चार चाहिन्छ।`,
    },
    {
      suffixLabel: 'Past & Participle (-ed)',
      buildWord: (s: string) => {
        const low = s.toLowerCase();
        const cap = s.charAt(0).toUpperCase() + low.slice(1);
        if (low === 'build') return 'Built';
        if (low === 'broadcast') return 'Broadcasted';
        if (low.endsWith('e')) return `${cap}d`;
        if (low.endsWith('y')) return `${cap.slice(0, -1)}ied`;
        if (['occur', 'prefer', 'refer', 'admit', 'permit', 'submit', 'commit', 'control', 'compel', 'fulfil', 'wrap'].includes(low)) {
          return `${cap}${low.slice(-1)}ed`;
        }
        return `${cap}ed`;
      },
      pos: 'past verb / adjective (V2/V3)',
      ipaSuffix: 'd',
      nepaliSuffix: ' (सम्पन्न भएको / गरिएको)',
      exEn: (w: string) => `The task was ${w.toLowerCase()} ahead of the official schedule.`,
      exNe: (n: string) => `तोकिएको आधिकारिक तालिकाभन्दा अगावै काम (${n}) सम्पन्न गरियो।`,
    },
    {
      suffixLabel: 'Re- Prefix (Do Again)',
      buildWord: (s: string) => `Re-${s.toLowerCase()}`,
      pos: 'verb',
      ipaSuffix: '',
      nepaliSuffix: ' (पुनः गर्नु / दोहोर्याउनु)',
      exEn: (w: string) => `We decided to ${w.toLowerCase()} the plan after receiving community feedback.`,
      exNe: (n: string) => `सामुदायिक प्रतिक्रिया पाएपछि हामीले योजनालाई पुनः (${n}) गर्ने निर्णय गर्यौँ।`,
    },
    {
      suffixLabel: 'Pre-scheduled / Well- Form',
      buildWord: (s: string) => {
        const low = s.toLowerCase();
        let v3 = `${low}ed`;
        if (low === 'build') v3 = 'built';
        else if (low.endsWith('e')) v3 = `${low}d`;
        else if (low.endsWith('y')) v3 = `${low.slice(0, -1)}ied`;
        else if (['occur', 'prefer', 'refer', 'admit', 'permit', 'submit', 'commit', 'control', 'compel', 'fulfil', 'wrap'].includes(low)) {
          v3 = `${low}${low.slice(-1)}ed`;
        }
        return `Well-${v3}`;
      },
      pos: 'compound adjective',
      ipaSuffix: '',
      nepaliSuffix: ' (राम्रोसँग सम्पन्न गरिएको)',
      exEn: (w: string) => `A ${w.toLowerCase()} strategy saves both time and public resources.`,
      exNe: (n: string) => `राम्रोसँग तयार पारिएको (${n}) रणनीतिले समय र सार्वजनिक स्रोत दुवै जोगाउँछ।`,
    },
    {
      suffixLabel: 'Un- / Non- Negated Participle',
      buildWord: (s: string) => {
        const low = s.toLowerCase();
        let v3 = `${low}ed`;
        if (low === 'build') v3 = 'built';
        else if (low.endsWith('e')) v3 = `${low}d`;
        else if (low.endsWith('y')) v3 = `${low.slice(0, -1)}ied`;
        else if (['occur', 'prefer', 'refer', 'admit', 'permit', 'submit', 'commit', 'control', 'compel', 'fulfil', 'wrap'].includes(low)) {
          v3 = `${low}${low.slice(-1)}ed`;
        }
        return `Un${v3}`;
      },
      pos: 'adjective',
      ipaSuffix: '',
      nepaliSuffix: ' (नगरिएको / बाँकी रहेको)',
      exEn: (w: string) => `No important request should remain ${w.toLowerCase()} at the end of the week.`,
      exNe: (n: string) => `हप्ताको अन्त्यमा कुनै पनि महत्त्वपूर्ण अनुरोध अधुरो (${n}) रहनु हुँदैन।`,
    },
    {
      suffixLabel: 'Over- Prefix (Excessive)',
      buildWord: (s: string) => `Over-${s.toLowerCase()}`,
      pos: 'verb',
      ipaSuffix: '',
      nepaliSuffix: ' (आवश्यकताभन्दा बढी गर्नु)',
      exEn: (w: string) => `Managers should not ${w.toLowerCase()} minor administrative procedures.`,
      exNe: (n: string) => `व्यवस्थापकहरूले साना प्रशासनिक प्रक्रियाहरूलाई आवश्यकताभन्दा बढी (${n}) गर्नु हुँदैन।`,
    },
    {
      suffixLabel: 'Under- Prefix (Insufficient)',
      buildWord: (s: string) => {
        const low = s.toLowerCase();
        let v3 = `${low}ed`;
        if (low === 'build') v3 = 'built';
        else if (low.endsWith('e')) v3 = `${low}d`;
        else if (low.endsWith('y')) v3 = `${low.slice(0, -1)}ied`;
        return `Under-${v3}`;
      },
      pos: 'adjective',
      ipaSuffix: '',
      nepaliSuffix: ' (कम मात्रामा गरिएको)',
      exEn: (w: string) => `Rural districts often struggle with ${w.toLowerCase()} infrastructure.`,
      exNe: (n: string) => `ग्रामीण जिल्लाहरू प्रायः कम विकसित (${n}) पूर्वाधारका कारण समस्यामा पर्छन्।`,
    },
    {
      suffixLabel: 'Co- Prefix (Joint Action)',
      buildWord: (s: string) => `Co-${s.toLowerCase()}`,
      pos: 'verb',
      ipaSuffix: '',
      nepaliSuffix: ' (सहकार्यमा सँगै गर्नु)',
      exEn: (w: string) => `Two local universities agreed to ${w.toLowerCase()} the research program.`,
      exNe: (n: string) => `दुई स्थानीय विश्वविद्यालयहरूले अनुसन्धान कार्यक्रम सँगै (${n}) गर्न सहमति जनाए।`,
    },
  ];

  let morphCounter = 1;
  for (const seed of DOMAIN_CONCEPT_SEEDS) {
    const meta = getLectureMeta(seed.lectureNumber);
    for (const tpl of derivationalTemplates) {
      const wordForm = tpl.buildWord(seed.stem);
      const key = wordForm.toLowerCase();
      if (seenWords.has(key)) continue;
      seenWords.add(key);

      items.push({
        id: `lex-morph-${morphCounter++}`,
        word: wordForm,
        ipa: `/${seed.ipaBase}${tpl.ipaSuffix ? '·' + tpl.ipaSuffix : ''}/`,
        partOfSpeech: tpl.pos,
        segments: [{ text: wordForm, silent: false }],
        silentLettersSummary: `${seed.silentNote} · ${tpl.suffixLabel}`,
        nepaliMeaning: `${seed.nepaliRoot}${tpl.nepaliSuffix}`,
        nepaliTransliteration: seed.translitRoot,
        englishExample: tpl.exEn(wordForm),
        nepaliExampleTranslation: tpl.exNe(seed.nepaliRoot.split('/')[0].trim()),
        usageTipNepali: `"${seed.stem}" मूल शब्दबाट बनेको रूप (${tpl.suffixLabel}): ${seed.silentNote}।`,
        ...meta,
      });
    }
  }

  // 4. Generate High-Utility Academic, Workplace & Daily Collocations (30 Modifiers x 300 Domain Nouns/Contexts = 9,000+ entries)
  // Let's pair our 30 Silent-Letter & Core Modifiers with 300 distinct, authentic Domain Nouns across all 12 Lectures (25 Domain Nouns per Lecture)
  interface DomainNounSeed {
    noun: string;
    ipa: string;
    nepali: string;
    translit: string;
    lectureNumber: number;
  }

  const DOMAIN_NOUNS_BY_LECTURE: DomainNounSeed[] = [
    // Lecture 1 (25 nouns)
    { noun: 'gesture', ipa: 'ˈdʒes.tʃər', nepali: 'हाउभाउ / सङ्केत', translit: 'Sanket', lectureNumber: 1 },
    { noun: 'movement', ipa: 'ˈmuːv.mənt', nepali: 'चाल / गतिविधि', translit: 'Gatividhi', lectureNumber: 1 },
    { noun: 'posture', ipa: 'ˈpɒs.tʃər', nepali: 'बसाइ वा उभ्याइको आसन', translit: 'Āsan', lectureNumber: 1 },
    { noun: 'craftsman', ipa: 'ˈkrɑːfts.mən', nepali: 'कालिगड / शिल्पकार', translit: 'Kāligaḍ', lectureNumber: 1 },
    { noun: 'sentinel', ipa: 'ˈsen.tɪ.nəl', nepali: 'पहरेदार / रक्षक', translit: 'Paharedār', lectureNumber: 1 },
    { noun: 'warrior', ipa: 'ˈwɒr.i.ər', nepali: 'योद्धा', translit: 'Yoddhā', lectureNumber: 1 },
    { noun: 'remedy', ipa: 'ˈrem.ə.di', nepali: 'उपचार / औषधि', translit: 'Upachār', lectureNumber: 1 },
    { noun: 'melody', ipa: 'ˈmel.ə.di', nepali: 'धुन / लय', translit: 'Dhun', lectureNumber: 1 },
    { noun: 'tradition', ipa: 'trəˈdɪʃ.ən', nepali: 'परम्परा', translit: 'Paramparā', lectureNumber: 1 },
    { noun: 'whisper', ipa: 'ˈwɪs.pər', nepali: 'कानेखुसी / सुस्तरी आवाज', translit: 'Kānekhusī', lectureNumber: 1 },
    { noun: 'harbour', ipa: 'ˈhɑː.bər', nepali: 'बन्दरगाह / सुरक्षित आश्रय', translit: 'Bandargāha', lectureNumber: 1 },
    { noun: 'shelter', ipa: 'ˈʃel.tər', nepali: 'आश्रयस्थल', translit: 'Āśrayasthal', lectureNumber: 1 },
    { noun: 'Lantern', ipa: 'ˈlæn.tən', nepali: 'लालटिन / बत्ती', translit: 'Lālṭin', lectureNumber: 1 },
    { noun: 'courtyard', ipa: 'ˈkɔːt.jɑːd', nepali: 'आँगन / चोक', translit: 'Ā̃gan', lectureNumber: 1 },
    { noun: 'footpath', ipa: 'ˈfʊt.pɑːθ', nepali: 'गोरेटो बाटो', translit: 'Goreṭo', lectureNumber: 1 },
    { noun: 'handicraft', ipa: 'ˈhæn.dɪ.krɑːft', nepali: 'हस्तकला', translit: 'Hastakalā', lectureNumber: 1 },
    { noun: 'greeting', ipa: 'ˈɡriː.tɪŋ', nepali: 'अभिवादन', translit: 'Abhivādan', lectureNumber: 1 },
    { noun: 'expression', ipa: 'ɪkˈspreʃ.ən', nepali: 'अभिव्यक्ति', translit: 'Abhivyakti', lectureNumber: 1 },
    { noun: 'demeanour', ipa: 'dɪˈmiː.nər', nepali: 'आचरण / व्यवहार', translit: 'Vyavahār', lectureNumber: 1 },
    { noun: 'reflection', ipa: 'rɪˈflek.ʃən', nepali: 'प्रतिबिम्ब / चिन्तन', translit: 'Chintan', lectureNumber: 1 },
    { noun: 'harmony', ipa: 'ˈhɑː.mə.ni', nepali: 'सद्भाव / मेलमिलाप', translit: 'Sadbhāv', lectureNumber: 1 },
    { noun: 'patience', ipa: 'ˈpeɪ.ʃəns', nepali: 'धैर्य', translit: 'Dhairya', lectureNumber: 1 },
    { noun: 'observance', ipa: 'əbˈzɜː.vəns', nepali: 'पालना / अवलोकन', translit: 'Pālanā', lectureNumber: 1 },
    { noun: 'instruction', ipa: 'ɪnˈstrʌk.ʃən', nepali: 'निर्देशन', translit: 'Nirdeśan', lectureNumber: 1 },
    { noun: 'companion', ipa: 'kəmˈpæn.jən', nepali: 'सहयात्री / साथी', translit: 'Sahayātrī', lectureNumber: 1 },

    // Lecture 2 (25 nouns)
    { noun: 'schedule', ipa: 'ˈʃed.juːl', nepali: 'समय तालिका', translit: 'Samaya tālikā', lectureNumber: 2 },
    { noun: 'itinerary', ipa: 'aɪˈtɪn.ər.ər.i', nepali: 'यात्रा विवरण / कार्यतालिका', translit: 'Yātrā tālikā', lectureNumber: 2 },
    { noun: 'passenger', ipa: 'ˈpæs.ən.dʒər', nepali: 'यात्रु', translit: 'Yātru', lectureNumber: 2 },
    { noun: 'departure', ipa: 'dɪˈpɑː.tʃər', nepali: 'प्रस्थान', translit: 'Prasthān', lectureNumber: 2 },
    { noun: 'arrival', ipa: 'əˈraɪ.vəl', nepali: 'आगमन', translit: 'Āgaman', lectureNumber: 2 },
    { noun: 'appointment', ipa: 'əˈpɔɪnt.mənt', nepali: 'भेटघाटको समय', translit: 'Bheṭghāṭko samaya', lectureNumber: 2 },
    { noun: 'transaction', ipa: 'trænˈzæk.ʃən', nepali: 'कारोबार / लेनदेन', translit: 'Kārobār', lectureNumber: 2 },
    { noun: 'voucher', ipa: 'ˈvaʊ.tʃər', nepali: 'भौचर / रसिद', translit: 'Bhauchar', lectureNumber: 2 },
    { noun: 'counter', ipa: 'ˈkaʊn.tər', nepali: 'काउन्टर / कक्ष', translit: 'Kāunṭar', lectureNumber: 2 },
    { noun: 'reservation', ipa: 'ˌrez.əˈveɪ.ʃən', nepali: 'बुकिङ / आरक्षण', translit: 'Ārakṣaṇ', lectureNumber: 2 },
    { noun: 'terminal', ipa: 'ˈtɜː.mɪ.nəl', nepali: 'टर्मिनल भवन', translit: 'Ṭarminal', lectureNumber: 2 },
    { noun: 'corridor', ipa: 'ˈkɒr.ɪ.dɔːr', nepali: 'गलियारा / बाटो', translit: 'Galiyārā', lectureNumber: 2 },
    { noun: 'interval', ipa: 'ˈɪn.tə.vəl', nepali: 'मध्यान्तर / समयको अन्तराल', translit: 'Antarāl', lectureNumber: 2 },
    { noun: 'calendar', ipa: 'ˈkæl.ən.dər', nepali: 'पात्रो', translit: 'Pātro', lectureNumber: 2 },
    { noun: 'milestone', ipa: 'ˈmaɪl.stəʊn', nepali: 'कोसेढुङ्गा / महत्त्वपूर्ण चरण', translit: 'Koseḍhuṅgā', lectureNumber: 2 },
    { noun: 'deadline', ipa: 'ˈded.laɪn', nepali: 'अन्तिम समयसीमा', translit: 'Samayasīmā', lectureNumber: 2 },
    { noun: 'semester', ipa: 'sɪˈmes.tər', nepali: 'अर्धवार्षिक शैक्षिक सत्र', translit: 'Śaikṣik satra', lectureNumber: 2 },
    { noun: 'reception', ipa: 'rɪˈsep.ʃən', nepali: 'स्वागत कक्ष', translit: 'Svāgat kakṣa', lectureNumber: 2 },
    { noun: 'inheritance', ipa: 'ɪnˈher.ɪ.təns', nepali: 'पैतृक सम्पत्ति', translit: 'Paitṛk sampatti', lectureNumber: 2 },
    { noun: 'believer', ipa: 'bɪˈliː.vər', nepali: 'आस्थावान् व्यक्ति', translit: 'Āsthāvān', lectureNumber: 2 },
    { noun: 'achievement', ipa: 'əˈtʃiːv.mənt', nepali: 'उपलब्धि', translit: 'Upalabdhi', lectureNumber: 2 },
    { noun: 'shipment', ipa: 'ˈʃɪp.mənt', nepali: 'ढुवानी गरिएको सामान', translit: 'Ḍhuvānī sāmān', lectureNumber: 2 },
    { noun: 'cashier', ipa: 'kæˈʃɪər', nepali: 'खजाञ्ची / क्यासियर', translit: 'Khajāñchī', lectureNumber: 2 },
    { noun: 'attendant', ipa: 'əˈten.dənt', nepali: 'सहयोगी कर्मचारी', translit: 'Sahayogī', lectureNumber: 2 },
    { noun: 'excursion', ipa: 'ɪkˈskɜː.ʃən', nepali: 'शैक्षिक वा छोटो भ्रमण', translit: 'Bhramaṇ', lectureNumber: 2 },

    // Lecture 3 (25 nouns)
    { noun: 'discipline', ipa: 'ˈdɪs.ə.plɪn', nepali: 'अनुशासन / विधा', translit: 'Anuśāsan', lectureNumber: 3 },
    { noun: 'expedition', ipa: 'ˌek.spəˈdɪʃ.ən', nepali: 'अन्वेषण वा आरोहण अभियान', translit: 'Abhiyān', lectureNumber: 3 },
    { noun: 'landscape', ipa: 'ˈlænd.skeɪp', nepali: 'भूदृश्य', translit: 'Bhūdṛśya', lectureNumber: 3 },
    { noun: 'phenomenon', ipa: 'fəˈnɒm.ɪ.nən', nepali: 'प्राकृतिक दृश्य वा घटना', translit: 'Parighaṭanā', lectureNumber: 3 },
    { noun: 'experiment', ipa: 'ɪkˈsper.ɪ.mənt', nepali: 'वैज्ञानिक प्रयोग', translit: 'Prayog', lectureNumber: 3 },
    { noun: 'observation', ipa: 'ˌɒb.zəˈveɪ.ʃən', nepali: 'अवलोकन', translit: 'Avalokan', lectureNumber: 3 },
    { noun: 'monument', ipa: 'ˈmɒn.jə.mənt', nepali: 'स्मारक / सम्पदा', translit: 'Smārak', lectureNumber: 3 },
    { noun: 'pillar', ipa: 'ˈpɪl.ər', nepali: 'स्तम्भ / खम्बा', translit: 'Stambha', lectureNumber: 3 },
    { noun: 'sanctuary', ipa: 'ˈsæŋk.tʃʊə.ri', nepali: 'आरक्ष / सुरक्षित बासस्थान', translit: 'Ārakṣa', lectureNumber: 3 },
    { noun: 'wilderness', ipa: 'ˈwɪl.də.nəs', nepali: 'निर्जन वन क्षेत्र', translit: 'Van kṣetra', lectureNumber: 3 },
    { noun: 'harvest', ipa: 'ˈhɑː.vɪst', nepali: 'बालीनाली', translit: 'Bālīnālī', lectureNumber: 3 },
    { noun: 'festival', ipa: 'ˈfes.tɪ.vəl', nepali: 'चाडपर्व / उत्सव', translit: 'Utsav', lectureNumber: 3 },
    { noun: 'ceremony', ipa: 'ˈser.ɪ.mə.ni', nepali: 'समारोह', translit: 'Samāroha', lectureNumber: 3 },
    { noun: 'embassy', ipa: 'ˈem.bə.si', nepali: 'राजदूतावास', translit: 'Rājdūtāvās', lectureNumber: 3 },
    { noun: 'delegation', ipa: 'ˌdel.ɪˈɡeɪ.ʃən', nepali: 'प्रतिनिधिमण्डल', translit: 'Pratinidhimaṇḍal', lectureNumber: 3 },
    { noun: 'alliance', ipa: 'əˈlaɪ.əns', nepali: 'गठबन्धन / सहकार्य', translit: 'Gaṭhabandhan', lectureNumber: 3 },
    { noun: 'treaty', ipa: 'ˈtriː.ti', nepali: 'सन्धि', translit: 'Sandhi', lectureNumber: 3 },
    { noun: 'protector', ipa: 'prəˈtek.tər', nepali: 'संरक्षक', translit: 'Saṃrakṣak', lectureNumber: 3 },
    { noun: 'counselor', ipa: 'ˈkaʊn.səl.ər', nepali: 'परामर्शदाता', translit: 'Parāmarśadātā', lectureNumber: 3 },
    { noun: 'scholar', ipa: 'ˈskɒl.ər', nepali: 'विद्वान् / अध्येता', translit: 'Vidvān', lectureNumber: 3 },
    { noun: 'journalist', ipa: 'ˈdʒɜː.nə.lɪst', nepali: 'पत्रकार', translit: 'Patrakār', lectureNumber: 3 },
    { noun: 'columnist', ipa: 'ˈkɒl.əm.nɪst', nepali: 'स्तम्भकार', translit: 'Stambhakār', lectureNumber: 3 },
    { noun: 'sculptor', ipa: 'ˈskʌlp.tər', nepali: 'मूर्तिकार', translit: 'Mūrtikār', lectureNumber: 3 },
    { noun: 'botanist', ipa: 'ˈbɒt.ən.ɪst', nepali: 'वनस्पतिशास्त्री', translit: 'Vanaspatiśāstrī', lectureNumber: 3 },
    { noun: 'explorer', ipa: 'ɪkˈsplɔː.rər', nepali: 'अन्वेषक', translit: 'Anveṣak', lectureNumber: 3 },

    // Lecture 4 (25 nouns)
    { noun: 'consultant', ipa: 'kənˈsʌl.tənt', nepali: 'परामर्शदाता', translit: 'Parāmarśadātā', lectureNumber: 4 },
    { noun: 'commander', ipa: 'kəˈmɑːn.dər', nepali: 'कमान्डर / सेनापति', translit: 'Senāpati', lectureNumber: 4 },
    { noun: 'agreement', ipa: 'əˈɡriː.mənt', nepali: 'सम्झौता', translit: 'Samjhautā', lectureNumber: 4 },
    { noun: 'investment', ipa: 'ɪnˈvest.mənt', nepali: 'लगानी', translit: 'Lagānī', lectureNumber: 4 },
    { noun: 'installment', ipa: 'ɪnˈstɔːl.mənt', nepali: 'किस्ता', translit: 'Kistā', lectureNumber: 4 },
    { noun: 'valuation', ipa: 'ˌvæl.juˈeɪ.ʃən', nepali: 'मूल्याङ्कन', translit: 'Mūlyāṅkan', lectureNumber: 4 },
    { noun: 'collateral', ipa: 'kəˈlæt.ər.əl', nepali: 'धितो', translit: 'Dhito', lectureNumber: 4 },
    { noun: 'counseling', ipa: 'ˈkaʊn.səl.ɪŋ', nepali: 'मनोपरामर्श', translit: 'Manoparāmarśa', lectureNumber: 4 },
    { noun: 'therapist', ipa: 'ˈθer.ə.pɪst', nepali: 'चिकित्सक / थेरापिस्ट', translit: 'Chikitsak', lectureNumber: 4 },
    { noun: 'peninsula', ipa: 'pəˈnɪn.sjə.lə', nepali: 'प्रायद्वीप', translit: 'Prāyadvīp', lectureNumber: 4 },
    { noun: 'archipelago', ipa: 'ˌɑː.kɪˈpel.ə.ɡəʊ', nepali: 'द्वीपसमूह', translit: 'Dvīpsamūha', lectureNumber: 4 },
    { noun: 'residence', ipa: 'ˈrez.ɪ.dəns', nepali: 'निवासस्थान', translit: 'Nivāsasthān', lectureNumber: 4 },
    { noun: 'hospitality', ipa: 'ˌhɒs.pɪˈtæl.ə.ti', nepali: 'अतिथि सत्कार', translit: 'Atithi satkār', lectureNumber: 4 },
    { noun: 'arrangement', ipa: 'əˈreɪndʒ.mənt', nepali: 'प्रबन्ध / व्यवस्था', translit: 'Prabandha', lectureNumber: 4 },
    { noun: 'conference', ipa: 'ˈkɒn.fər.əns', nepali: 'सम्मेलन', translit: 'Sammelan', lectureNumber: 4 },
    { noun: 'inquiry', ipa: 'ɪnˈkwaɪə.ri', nepali: 'सोधपुछ / छानबिन', translit: 'Sodhpuchh', lectureNumber: 4 },
    { noun: 'request', ipa: 'rɪˈkwest', nepali: 'अनुरोध', translit: 'Anurodh', lectureNumber: 4 },
    { noun: 'proposal', ipa: 'prəˈpəʊ.zəl', nepali: 'प्रस्ताव', translit: 'Prastāv', lectureNumber: 4 },
    { noun: 'itinerary', ipa: 'aɪˈtɪn.ər.ər.i', nepali: 'भ्रमण तालिका', translit: 'Bhramaṇ tālikā', lectureNumber: 4 },
    { noun: 'accommodation', ipa: 'əˌkɒm.əˈdeɪ.ʃən', nepali: 'आवास व्यवस्था', translit: 'Āvās vyavasthā', lectureNumber: 4 },
    { noun: 'recommendation', ipa: 'ˌrek.ə.menˈdeɪ.ʃən', nepali: 'सिफारिस', translit: 'Siphāris', lectureNumber: 4 },
    { noun: 'obligation', ipa: 'ˌɒb.lɪˈɡeɪ.ʃən', nepali: 'दायित्व / कर्तव्य', translit: 'Dāyitva', lectureNumber: 4 },
    { noun: 'commitment', ipa: 'kəˈmɪt.mənt', nepali: 'प्रतिबद्धता', translit: 'Pratibaddhatā', lectureNumber: 4 },
    { noun: 'negotiation', ipa: 'nɪˌɡəʊ.ʃiˈeɪ.ʃən', nepali: 'वार्ता', translit: 'Vārtā', lectureNumber: 4 },
    { noun: 'partnership', ipa: 'ˈpɑːt.nə.ʃɪp', nepali: 'साझेदारी', translit: 'Sājhedārī', lectureNumber: 4 },

    // Lecture 5 (25 nouns)
    { noun: 'workplace', ipa: 'ˈwɜːk.pleɪs', nepali: 'कार्यस्थल', translit: 'Kāryasthal', lectureNumber: 5 },
    { noun: 'ecosystem', ipa: 'ˈiː.kəʊˌsɪs.təm', nepali: 'पारिस्थितिक प्रणाली', translit: 'Pāristhitik praṇālī', lectureNumber: 5 },
    { noun: 'administration', ipa: 'ədˌmɪn.ɪˈstreɪ.ʃən', nepali: 'प्रशासन', translit: 'Praśāsan', lectureNumber: 5 },
    { noun: 'municipality', ipa: 'mjuːˌnɪs.ɪˈpæl.ə.ti', nepali: 'नगरपालिका', translit: 'Nagarpālikā', lectureNumber: 5 },
    { noun: 'regulation', ipa: 'ˌreɡ.jəˈleɪ.ʃən', nepali: 'नियमावली / नियमन', translit: 'Niyamāvalī', lectureNumber: 5 },
    { noun: 'initiative', ipa: 'ɪˈnɪʃ.ə.tɪv', nepali: 'पहल / कदम', translit: 'Pahal', lectureNumber: 5 },
    { noun: 'expertise', ipa: 'ˌek.spɜːˈtiːz', nepali: 'विशेषज्ञता / दक्षता', translit: 'Viśeṣajñatā', lectureNumber: 5 },
    { noun: 'scholarship', ipa: 'ˈskɒl.ə.ʃɪp', nepali: 'छात्रवृत्ति / विद्वत्ता', translit: 'Chhātravṛtti', lectureNumber: 5 },
    { noun: 'garment', ipa: 'ˈɡɑː.mənt', nepali: 'वस्त्र / पोशाक', translit: 'Vastra', lectureNumber: 5 },
    { noun: 'embroidery', ipa: 'ɪmˈbrɔɪ.dər.i', nepali: 'बुट्टा भर्ने कला', translit: 'Buṭṭā kalā', lectureNumber: 5 },
    { noun: 'conservation', ipa: 'ˌkɒn.səˈveɪ.ʃən', nepali: 'संरक्षण', translit: 'Saṃrakṣaṇ', lectureNumber: 5 },
    { noun: 'biodiversity', ipa: 'ˌbaɪ.əʊ.daɪˈvɜː.sə.ti', nepali: 'जैविक विविधता', translit: 'Jaivik vividhatā', lectureNumber: 5 },
    { noun: 'infrastructure', ipa: 'ˈɪn.frəˌstrʌk.tʃər', nepali: 'पूर्वाधार', translit: 'Pūrvādhār', lectureNumber: 5 },
    { noun: 'development', ipa: 'dɪˈvel.əp.mənt', nepali: 'विकास', translit: 'Vikās', lectureNumber: 5 },
    { noun: 'management', ipa: 'ˈmæn.ɪdʒ.mənt', nepali: 'व्यवस्थापन', translit: 'Vyavasthāpan', lectureNumber: 5 },
    { noun: 'department', ipa: 'dɪˈpɑːt.mənt', nepali: 'विभाग', translit: 'Vibhāg', lectureNumber: 5 },
    { noun: 'assessment', ipa: 'əˈses.mənt', nepali: 'मूल्याङ्कन', translit: 'Mūlyāṅkan', lectureNumber: 5 },
    { noun: 'requirement', ipa: 'rɪˈkwaɪə.mənt', nepali: 'आवश्यकता', translit: 'Āvaśyakatā', lectureNumber: 5 },
    { noun: 'measurement', ipa: 'ˈmeʒ.ə.mənt', nepali: 'नाप / मापन', translit: 'Māpan', lectureNumber: 5 },
    { noun: 'empowerment', ipa: 'ɪmˈpaʊə.mənt', nepali: 'सशक्तीकरण', translit: 'Saśaktīkaraṇ', lectureNumber: 5 },
    { noun: 'governance', ipa: 'ˈɡʌv.ən.əns', nepali: 'सुशासन / शासन पद्धति', translit: 'Suśāsan', lectureNumber: 5 },
    { noun: 'sustainability', ipa: 'səˌsteɪ.nəˈbɪl.ə.ti', nepali: 'दिगोपना', translit: 'Digopanā', lectureNumber: 5 },
    { noun: 'accountability', ipa: 'əˌkaʊn.təˈbɪl.ə.ti', nepali: 'जवाफदेहिता', translit: 'Javāphdehitā', lectureNumber: 5 },
    { noun: 'transparency', ipa: 'trænsˈpær.ən.si', nepali: 'पारदर्शिता', translit: 'Pāradarśitā', lectureNumber: 5 },
    { noun: 'policymaker', ipa: 'ˈpɒl.ə.siˌmeɪ.kər', nepali: 'नीति निर्माता', translit: 'Nīti nirmātā', lectureNumber: 5 },

    // Lecture 6 (25 nouns)
    { noun: 'decision', ipa: 'dɪˈsɪʒ.ən', nepali: 'निर्णय', translit: 'Nirṇaya', lectureNumber: 6 },
    { noun: 'awareness', ipa: 'əˈweə.nəs', nepali: 'चेतना / जागरुकता', translit: 'Chetanā', lectureNumber: 6 },
    { noun: 'integrity', ipa: 'ɪnˈteɡ.rə.ti', nepali: 'निष्ठा / इमानदारी', translit: 'Niṣṭhā', lectureNumber: 6 },
    { noun: 'ethics', ipa: 'ˈeθ.ɪks', nepali: 'नैतिकता / आचारसंहिता', translit: 'Naitikatā', lectureNumber: 6 },
    { noun: 'cadence', ipa: 'ˈkeɪ.dəns', nepali: 'आवाजको आरोह-अवरोह / लय', translit: 'Laya', lectureNumber: 6 },
    { noun: 'composition', ipa: 'ˌkɒm.pəˈzɪʃ.ən', nepali: 'रचना / बनावट', translit: 'Rachanā', lectureNumber: 6 },
    { noun: 'lifestyle', ipa: 'ˈlaɪf.staɪl', nepali: 'जीवनशैली', translit: 'Jīvanśailī', lectureNumber: 6 },
    { noun: 'nutrition', ipa: 'njuːˈtrɪʃ.ən', nepali: 'पोषण', translit: 'Poṣaṇ', lectureNumber: 6 },
    { noun: 'diagnosis', ipa: 'ˌdaɪ.əɡˈnəʊ.sɪs', nepali: 'रोगको पहिचान (निदान)', translit: 'Nidān', lectureNumber: 6 },
    { noun: 'treatment', ipa: 'ˈtriːt.mənt', nepali: 'उपचार', translit: 'Upachār', lectureNumber: 6 },
    { noun: 'recovery', ipa: 'rɪˈkʌv.ər.i', nepali: 'स्वास्थ्यलाभ / पुनरुत्थान', translit: 'Svāsthyalābh', lectureNumber: 6 },
    { noun: 'principle', ipa: 'ˈprɪn.sə.pəl', nepali: 'सिद्धान्त', translit: 'Siddhānta', lectureNumber: 6 },
    { noun: 'consequence', ipa: 'ˈkɒn.sɪ.kwəns', nepali: 'परिणाम / नतिजा', translit: 'Pariṇām', lectureNumber: 6 },
    { noun: 'outcome', ipa: 'ˈaʊt.kʌm', nepali: 'निष्कर्ष / प्रतिफल', translit: 'Pratiphal', lectureNumber: 6 },
    { noun: 'perspective', ipa: 'pəˈspek.tɪv', nepali: 'दृष्टिकोण', translit: 'Dṛṣṭikoṇ', lectureNumber: 6 },
    { noun: 'judgment', ipa: 'ˈdʒʌdʒ.mənt', nepali: 'विवेक / निर्णय', translit: 'Vivek', lectureNumber: 6 },
    { noun: 'conviction', ipa: 'kənˈvɪk.ʃən', nepali: 'दृढ विश्वास', translit: 'Dṛḍha viśvās', lectureNumber: 6 },
    { noun: 'compassion', ipa: 'kəmˈpæʃ.ən', nepali: 'करुणा / सहानुभूति', translit: 'Karuṇā', lectureNumber: 6 },
    { noun: 'obligation', ipa: 'ˌɒb.lɪˈɡeɪ.ʃən', nepali: 'नैतिक कर्तव्य', translit: 'Kartavya', lectureNumber: 6 },
    { noun: 'reputation', ipa: 'ˌrep.jəˈteɪ.ʃən', nepali: 'प्रतिष्ठा / ख्याति', translit: 'Pratiṣṭhā', lectureNumber: 6 },
    { noun: 'credibility', ipa: 'ˌkred.əˈbɪl.ə.ti', nepali: 'विश्वसनीयता', translit: 'Viśvasanīyatā', lectureNumber: 6 },
    { noun: 'implication', ipa: 'ˌɪm.plɪˈkeɪ.ʃən', nepali: 'अर्थ / असर', translit: 'Asar', lectureNumber: 6 },
    { noun: 'alternative', ipa: 'ɒlˈtɜː.nə.tɪv', nepali: 'विकल्प', translit: 'Vikalpa', lectureNumber: 6 },
    { noun: 'precaution', ipa: 'prɪˈkɔː.ʃən', nepali: 'सावधानी / पूर्वसतर्कता', translit: 'Pūrvasatarkatā', lectureNumber: 6 },
    { noun: 'resolution', ipa: 'ˌrez.əˈluː.ʃən', nepali: 'सङ्कल्प / समाधान', translit: 'Saṅkalpa', lectureNumber: 6 },

    // Lecture 7 (25 nouns)
    { noun: 'technician', ipa: 'tekˈnɪʃ.ən', nepali: 'प्राविधिक', translit: 'Prāvidhik', lectureNumber: 7 },
    { noun: 'carpenter', ipa: 'ˈkɑː.pɪn.tər', nepali: 'सिकर्मी', translit: 'Sikarmī', lectureNumber: 7 },
    { noun: 'electrician', ipa: 'ˌɪl.ekˈtrɪʃ.ən', nepali: 'बिजुली मिस्त्री', translit: 'Bijulī mistrī', lectureNumber: 7 },
    { noun: 'fortress', ipa: 'ˈfɔː.trəs', nepali: 'गढी / किल्ला', translit: 'Gaḍhī', lectureNumber: 7 },
    { noun: 'watchtower', ipa: 'ˈwɒtʃˌtaʊ.ər', nepali: 'निगरानी धरहरा', translit: 'Nigrānī stambha', lectureNumber: 7 },
    { noun: 'pipeline', ipa: 'ˈpaɪp.laɪn', nepali: 'खानेपानी वा इन्धनको पाइपलाइन', translit: 'Pāiplāin', lectureNumber: 7 },
    { noun: 'drainage', ipa: 'ˈdreɪ.nɪdʒ', nepali: 'ढल निकास प्रणाली', translit: 'Ḍhal nikās', lectureNumber: 7 },
    { noun: 'fixture', ipa: 'ˈfɪks.tʃər', nepali: 'जडान गरिएको सामग्री', translit: 'Jaḍān sāmagrī', lectureNumber: 7 },
    { noun: 'renovation', ipa: 'ˌren.əˈveɪ.ʃən', nepali: 'जीर्णोद्धार / मर्मत', translit: 'Jīrṇoddhār', lectureNumber: 7 },
    { noun: 'appliance', ipa: 'əˈplaɪ.əns', nepali: 'घरायसी विद्युतीय उपकरण', translit: 'Gharāyasī upakaraṇ', lectureNumber: 7 },
    { noun: 'utensil', ipa: 'juːˈten.səl', nepali: 'भान्साको भाँडाकुँडा', translit: 'Bhā̃ḍākũḍā', lectureNumber: 7 },
    { noun: 'cutlery', ipa: 'ˈkʌt.lər.i', nepali: 'चम्चा, काँटा र चक्कु', translit: 'Chamchā-चक्कु', lectureNumber: 7 },
    { noun: 'workshop', ipa: 'ˈwɜːk.ʃɒp', nepali: 'कारखाना / कार्यशाला', translit: 'Kāryaśālā', lectureNumber: 7 },
    { noun: 'inspection', ipa: 'ɪnˈspek.ʃən', nepali: 'निरीक्षण', translit: 'Nirīkṣaṇ', lectureNumber: 7 },
    { noun: 'installation', ipa: 'ˌɪn.stəˈleɪ.ʃən', nepali: 'जडान कार्य', translit: 'Jaḍān kārya', lectureNumber: 7 },
    { noun: 'household', ipa: 'ˈhaʊs.həʊld', nepali: 'घरपरिवार', translit: 'Gharparivār', lectureNumber: 7 },
    { noun: 'masonry', ipa: 'ˈmeɪ.sən.ri', nepali: 'ढुङ्गा र इँटाको गारो काम', translit: 'Gāro kām', lectureNumber: 7 },
    { noun: 'courtyard', ipa: 'ˈkɔːt.jɑːd', nepali: 'भित्री चोक', translit: 'Bhitrī chok', lectureNumber: 7 },
    { noun: 'balcony', ipa: 'ˈbæl.kə.ni', nepali: 'बार्दली', translit: 'Bārdalī', lectureNumber: 7 },
    { noun: 'staircase', ipa: 'ˈsteə.keɪs', nepali: 'भर्याङ', translit: 'Bharyāङ', lectureNumber: 7 },
    { noun: 'foundation', ipa: 'faʊnˈdeɪ.ʃən', nepali: 'जग / आधार', translit: 'Jag', lectureNumber: 7 },
    { noun: 'partition', ipa: 'pɑːˈtɪʃ.ən', nepali: 'कोठा छुट्याउने बार', translit: 'Bār', lectureNumber: 7 },
    { noun: 'ventilation', ipa: 'ˌven.tɪˈleɪ.ʃən', nepali: 'हावा ओहोरदोहोर गर्ने व्यवस्था', translit: 'Hāvā nikās', lectureNumber: 7 },
    { noun: 'contractor', ipa: 'kənˈtræk.tər', nepali: 'निर्माण व्यवसायी / ठेकेदार', translit: 'Nirmāṇ vyavasāyī', lectureNumber: 7 },
    { noun: 'craftsmanship', ipa: 'ˈkrɑːfts.mən.ʃɪp', nepali: 'शिल्पकला / कारीगरी', translit: 'Kārīgarī', lectureNumber: 7 },

    // Lecture 8 (25 nouns)
    { noun: 'banquet', ipa: 'ˈbæŋ.kwɪt', nepali: 'भव्य भोज', translit: 'Bhavya bhoj', lectureNumber: 8 },
    { noun: 'cuisine', ipa: 'kwɪˈziːn', nepali: 'पाककला / परिकार शैली', translit: 'Pākkalā', lectureNumber: 8 },
    { noun: 'ingredient', ipa: 'ɪnˈɡriː.di.ənt', nepali: 'परिकारमा चाहिने सामग्री', translit: 'Sāmagrī', lectureNumber: 8 },
    { noun: 'delicacy', ipa: 'ˈdel.ɪ.kə.si', nepali: 'विशेष र स्वादिष्ट परिकार', translit: 'Viśeṣ parikār', lectureNumber: 8 },
    { noun: 'refreshment', ipa: 'rɪˈfreʃ.mənt', nepali: 'हल्का खाजा र पेय', translit: 'Khājā', lectureNumber: 8 },
    { noun: 'appetizer', ipa: 'ˈæp.ə.taɪ.zər', nepali: 'खानाअघि खाइने हल्का परिकार', translit: 'Suruko parikār', lectureNumber: 8 },
    { noun: 'dessert', ipa: 'dɪˈzɜːt', nepali: 'खानापछि खाइने गुलियो मिठाई', translit: 'Miṭhāī', lectureNumber: 8 },
    { noun: 'beverage', ipa: 'ˈbev.ər.ɪdʒ', nepali: 'पेय पदार्थ', translit: 'Peya padārtha', lectureNumber: 8 },
    { noun: 'orchard', ipa: 'ˈɔː.tʃəd', nepali: 'फलफूलको बगैँचा', translit: 'Phalphūl bagaĩchā', lectureNumber: 8 },
    { noun: 'vineyard', ipa: 'ˈvɪn.jəd', nepali: 'अङ्गुरको बगैँचा', translit: 'Aṅgur bagaĩchā', lectureNumber: 8 },
    { noun: 'bakery', ipa: 'ˈbeɪ.kər.i', nepali: 'बेकरी / रोटी पसल', translit: 'Bekarī', lectureNumber: 8 },
    { noun: 'pastry', ipa: 'ˈpeɪ.stri', nepali: 'पेस्ट्री / केक परिकार', translit: 'Pesṭrī', lectureNumber: 8 },
    { noun: 'seasoning', ipa: 'ˈsiː.zən.ɪŋ', nepali: 'मरमसला र नुन', translit: 'Marmasalā', lectureNumber: 8 },
    { noun: 'aroma', ipa: 'əˈrəʊ.mə', nepali: 'सुगन्ध / बासना', translit: 'Sugandha', lectureNumber: 8 },
    { noun: 'flavour', ipa: 'ˈfleɪ.vər', nepali: 'स्वाद', translit: 'Svād', lectureNumber: 8 },
    { noun: 'portion', ipa: 'ˈpɔː.ʃən', nepali: 'भाग / मात्रा', translit: 'Bhāg', lectureNumber: 8 },
    { noun: 'provision', ipa: 'prəˈvɪʒ.ən', nepali: 'रासनपानी / व्यवस्था', translit: 'Rāsanpānī', lectureNumber: 8 },
    { noun: 'catering', ipa: 'ˈkeɪ.tər.ɪŋ', nepali: 'भोजभतेरमा खाना खुवाउने सेवा', translit: 'Khānā sevā', lectureNumber: 8 },
    { noun: 'hospitality', ipa: 'ˌhɒs.pɪˈtæl.ə.ti', nepali: 'आतिथ्य सत्कार', translit: 'Ātithya', lectureNumber: 8 },
    { noun: 'guidance', ipa: 'ˈɡaɪ.dəns', nepali: 'सल्लाह र मार्गदर्शन', translit: 'Mārgadarśan', lectureNumber: 8 },
    { noun: 'recommendation', ipa: 'ˌrek.ə.menˈdeɪ.ʃən', nepali: 'सुझाव', translit: 'Sujhāv', lectureNumber: 8 },
    { noun: 'inventory', ipa: 'ˈɪn.vən.tri', nepali: 'मौज्दात सामानको सूची', translit: 'Maujdāt sūchī', lectureNumber: 8 },
    { noun: 'consignment', ipa: 'kənˈsaɪn.mənt', nepali: 'पठाइएको मालसामान', translit: 'Mālsāmān', lectureNumber: 8 },
    { noun: 'merchandise', ipa: 'ˈmɜː.tʃən.daɪs', nepali: 'व्यापारिक वस्तु', translit: 'Vyāpārik vastu', lectureNumber: 8 },
    { noun: 'produce', ipa: 'ˈprɒd.juːs', nepali: 'कृषि उपज', translit: 'Kṛṣi upaj', lectureNumber: 8 },

    // Lecture 9 (25 nouns)
    { noun: 'liability', ipa: 'ˌlaɪ.əˈbɪl.ə.ti', nepali: 'तिर्नुपर्ने दायित्व / ऋण', translit: 'Dāyitva', lectureNumber: 9 },
    { noun: 'expenditure', ipa: 'ɪkˈspen.dɪ.tʃər', nepali: 'खर्च / व्यय', translit: 'Vyaya', lectureNumber: 9 },
    { noun: 'revenue', ipa: 'ˈrev.ən.juː', nepali: 'राजस्व / आम्दानी', translit: 'Rājasva', lectureNumber: 9 },
    { noun: 'dividend', ipa: 'ˈdɪv.ɪ.dend', nepali: 'लाभांश', translit: 'Lābhāṃśa', lectureNumber: 9 },
    { noun: 'bankruptcy', ipa: 'ˈbæŋ.krʌpt.si', nepali: 'टाट पल्टेको अवस्था (दामासाही)', translit: 'Dāmāsāhī', lectureNumber: 9 },
    { noun: 'litigation', ipa: 'ˌlɪt.ɪˈɡeɪ.ʃən', nepali: 'अदालती मुद्दामामिला', translit: 'Muddāmāmilā', lectureNumber: 9 },
    { noun: 'testimony', ipa: 'ˈtes.tɪ.mə.ni', nepali: 'अदालतमा दिइने बयान / साक्षी', translit: 'Bayān', lectureNumber: 9 },
    { noun: 'affidavit', ipa: 'ˌæf.ɪˈdeɪ.vɪt', nepali: 'शपथपत्र', translit: 'Śapathpatra', lectureNumber: 9 },
    { noun: 'tribunal', ipa: 'traɪˈbjuː.nəl', nepali: 'न्यायाधिकरण', translit: 'Nyāyādhikaraṇ', lectureNumber: 9 },
    { noun: 'verdict', ipa: 'ˈvɜː.dɪkt', nepali: 'अदालतको फैसला', translit: 'Phaisalā', lectureNumber: 9 },
    { noun: 'resignation', ipa: 'ˌrez.ɪɡˈneɪ.ʃən', nepali: 'राजीनामा', translit: 'Rājīnāmā', lectureNumber: 9 },
    { noun: 'successor', ipa: 'səkˈses.ər', nepali: 'उत्तराधिकारी', translit: 'Uttarādhikārī', lectureNumber: 9 },
    { noun: 'predecessor', ipa: 'ˈpriː.dɪˌses.ər', nepali: 'पूर्ववर्ती पदाधिकारी', translit: 'Pūrvavartī', lectureNumber: 9 },
    { noun: 'concession', ipa: 'kənˈseʃ.ən', nepali: 'सहुलियत / छुट', translit: 'Sahuliyat', lectureNumber: 9 },
    { noun: 'compliance', ipa: 'kəmˈplaɪ.əns', nepali: 'नियमको पालना', translit: 'Niyam pālanā', lectureNumber: 9 },
    { noun: 'procurement', ipa: 'prəˈkjʊə.mənt', nepali: 'सार्वजनिक खरिद प्रक्रिया', translit: 'Kharid prakriyā', lectureNumber: 9 },
    { noun: 'strategy', ipa: 'ˈstræt.ə.dʒi', nepali: 'रणनीति', translit: 'Raṇanīti', lectureNumber: 9 },
    { noun: 'enterprise', ipa: 'ˈen.tə.praɪz', nepali: 'उद्यम / व्यवसाय', translit: 'Udyam', lectureNumber: 9 },
    { noun: 'corporation', ipa: 'ˌkɔː.pərˈeɪ.ʃən', nepali: 'निगम / कम्पनी', translit: 'Nigam', lectureNumber: 9 },
    { noun: 'shareholder', ipa: 'ˈʃeəˌhəʊl.dər', nepali: 'शेयरधनी', translit: 'Śeyardhanī', lectureNumber: 9 },
    { noun: 'audit', ipa: 'ˈɔː.dɪt', nepali: 'लेखापरीक्षण', translit: 'Lekhāparīkṣaṇ', lectureNumber: 9 },
    { noun: 'amendment', ipa: 'əˈmend.mənt', nepali: 'संशोधन', translit: 'Saṃśodhan', lectureNumber: 9 },
    { noun: 'clause', ipa: 'klɔːz', nepali: 'सम्झौताको दफा वा बुँदा', translit: 'Daphā', lectureNumber: 9 },
    { noun: 'jurisdiction', ipa: 'ˌdʒʊə.rɪsˈdɪk.ʃən', nepali: 'अधिकार क्षेत्र', translit: 'Adhikār kṣetra', lectureNumber: 9 },
    { noun: 'settlement', ipa: 'ˈset.əl.mənt', nepali: 'राफसाफ / मिलापत्र', translit: 'Milāpatra', lectureNumber: 9 },

    // Lecture 10 (25 nouns)
    { noun: 'statement', ipa: 'ˈsteɪt.mənt', nepali: 'वक्तव्य / भनाइ', translit: 'Vaktavya', lectureNumber: 10 },
    { noun: 'interview', ipa: 'ˈɪn.tə.vjuː', nepali: 'अन्तर्वार्ता', translit: 'Antarvārtā', lectureNumber: 10 },
    { noun: 'spokesperson', ipa: 'ˈspəʊksˌpɜː.sən', nepali: 'प्रवक्ता', translit: 'Pravaktā', lectureNumber: 10 },
    { noun: 'correspondent', ipa: 'ˌkɒr.ɪˈspɒn.dənt', nepali: 'संवाददाता', translit: 'Saṃvāddātā', lectureNumber: 10 },
    { noun: 'announcement', ipa: 'əˈnaʊns.mənt', nepali: 'घोषणा', translit: 'Ghoṣaṇā', lectureNumber: 10 },
    { noun: 'assurance', ipa: 'əˈʃɔː.rəns', nepali: 'आश्वासन / भरोसा', translit: 'Āśvāsan', lectureNumber: 10 },
    { noun: 'warranty', ipa: 'ˈwɒr.ən.ti', nepali: 'मर्मत ग्यारेन्टी (वारेन्टी)', translit: 'Vārenṭī', lectureNumber: 10 },
    { noun: 'manuscript', ipa: 'ˈmæn.jə.skrɪpt', nepali: 'पाण्डुलिपि', translit: 'Pāṇḍulipi', lectureNumber: 10 },
    { noun: 'publication', ipa: 'ˌpʌb.lɪˈkeɪ.ʃən', nepali: 'प्रकाशन', translit: 'Prakāśan', lectureNumber: 10 },
    { noun: 'editorial', ipa: 'ˌed.ɪˈtɔː.ri.əl', nepali: 'सम्पादकीय', translit: 'Sampādakīya', lectureNumber: 10 },
    { noun: 'commentary', ipa: 'ˈkɒm.ən.tər.i', nepali: 'टिप्पणी / व्याख्या', translit: 'Ṭippaṇī', lectureNumber: 10 },
    { noun: 'discourse', ipa: 'ˈdɪs.kɔːs', nepali: 'विमर्श / बहस', translit: 'Vimarśa', lectureNumber: 10 },
    { noun: 'narrative', ipa: 'ˈnær.ə.tɪv', nepali: 'कथावस्तु / वृत्तान्त', translit: 'Vṛttānta', lectureNumber: 10 },
    { noun: 'translation', ipa: 'trænzˈleɪ.ʃən', nepali: 'अनुवाद', translit: 'Anuvād', lectureNumber: 10 },
    { noun: 'interpretation', ipa: 'ɪnˌtɜː.prɪˈteɪ.ʃən', nepali: 'अर्थपूर्ण व्याख्या', translit: 'Vyākhyā', lectureNumber: 10 },
    { noun: 'clarification', ipa: 'ˌklær.ɪ.fɪˈkeɪ.ʃən', nepali: 'स्पष्टीकरण', translit: 'Spaṣṭīkaraṇ', lectureNumber: 10 },
    { noun: 'confirmation', ipa: 'ˌkɒn.fəˈmeɪ.ʃən', nepali: 'पुष्टि', translit: 'Puṣṭi', lectureNumber: 10 },
    { noun: 'disclosure', ipa: 'dɪsˈkləʊ.ʒər', nepali: 'खुलासा', translit: 'Khulāsā', lectureNumber: 10 },
    { noun: 'testimony', ipa: 'ˈtes.tɪ.mə.ni', nepali: 'प्रमाणित भनाइ', translit: 'Pramāṇit bhanāi', lectureNumber: 10 },
    { noun: 'quotation', ipa: 'kwəʊˈteɪ.ʃən', nepali: 'उद्धरण', translit: 'Uddharaṇ', lectureNumber: 10 },
    { noun: 'summary', ipa: 'ˈsʌm.ər.i', nepali: 'सारांश', translit: 'Sārāṃśa', lectureNumber: 10 },
    { noun: 'associate', ipa: 'əˈsəʊ.si.ət', nepali: 'सहयोगी / साझेदार', translit: 'Sahayogī', lectureNumber: 10 },
    { noun: 'collaborator', ipa: 'kəˈlæb.ə.reɪ.tər', nepali: 'सहकर्मी / सहयात्री', translit: 'Sahakarmī', lectureNumber: 10 },
    { noun: 'bulletin', ipa: 'ˈbʊl.ɪ.tɪn', nepali: 'समाचार बुलेटिन / सूचना', translit: 'Sūchanā patra', lectureNumber: 10 },
    { noun: 'symposium', ipa: 'sɪmˈpəʊ.zi.əm', nepali: 'विचार गोष्ठी', translit: 'Vichār goṣṭhī', lectureNumber: 10 },

    // Lecture 11 (25 nouns)
    { noun: 'argument', ipa: 'ˈɑː.ɡjə.mənt', nepali: 'तर्क / दलील', translit: 'Tarka', lectureNumber: 11 },
    { noun: 'eloquence', ipa: 'ˈel.ə.kwəns', nepali: 'वाक्पटुता / प्रभावशाली बोली', translit: 'Vākpaṭutā', lectureNumber: 11 },
    { noun: 'persuasion', ipa: 'pəˈsweɪ.ʒən', nepali: 'मनाउने कला / विश्वास दिलाउने शक्ति', translit: 'Manāune kalā', lectureNumber: 11 },
    { noun: 'framework', ipa: 'ˈfreɪm.wɜːk', nepali: 'संरचनागत खाका', translit: 'Khākā', lectureNumber: 11 },
    { noun: 'classification', ipa: 'ˌklæs.ɪ.fɪˈkeɪ.ʃən', nepali: 'वर्गीकरण', translit: 'Vargīkaraṇ', lectureNumber: 11 },
    { noun: 'bureaucracy', ipa: 'bjʊəˈrɒk.rə.si', nepali: 'कर्मचारीतन्त्र', translit: 'Karmachārītantra', lectureNumber: 11 },
    { noun: 'turmoil', ipa: 'ˈtɜː.mɔɪl', nepali: 'उथलपुथल / अशान्ति', translit: 'Uthalputhal', lectureNumber: 11 },
    { noun: 'disruption', ipa: 'dɪsˈrʌp.ʃən', nepali: 'अवरोध / व्यवधान', translit: 'Avarodh', lectureNumber: 11 },
    { noun: 'nuance', ipa: 'ˈnjuː.ɑːns', nepali: 'सूक्ष्म भिन्नता / बारीकी', translit: 'Sūkṣma bhinnatā', lectureNumber: 11 },
    { noun: 'precision', ipa: 'prɪˈsɪʒ.ən', nepali: 'सटीकता / अचुकता', translit: 'Saṭīkatā', lectureNumber: 11 },
    { noun: 'methodology', ipa: 'ˌmeθ.əˈdɒl.ə.dʒi', nepali: 'अध्ययन विधि', translit: 'Adhyayan vidhi', lectureNumber: 11 },
    { noun: 'contradiction', ipa: 'ˌkɒn.trəˈdɪk.ʃən', nepali: 'अन्तर्विरोध / विरोधाभास', translit: 'Antarvirodh', lectureNumber: 11 },
    { noun: 'paradox', ipa: 'ˈpær.ə.dɒks', nepali: 'विरोधाभासपूर्ण सत्य', translit: 'Virodhābhās', lectureNumber: 11 },
    { noun: 'inference', ipa: 'ˈɪn.fər.əns', nepali: 'अनुमानित निष्कर्ष', translit: 'Niṣkarṣa', lectureNumber: 11 },
    { noun: 'correlation', ipa: 'ˌkɒr.əˈleɪ.ʃən', nepali: 'सहसम्बन्ध', translit: 'Sahasambandha', lectureNumber: 11 },
    { noun: 'hypothesis', ipa: 'haɪˈpɒθ.ə.sɪs', nepali: 'परिकल्पना', translit: 'Parikalpanā', lectureNumber: 11 },
    { noun: 'assertion', ipa: 'əˈsɜː.ʃən', nepali: 'दाबी / दृढ भनाइ', translit: 'Dābī', lectureNumber: 11 },
    { noun: 'premise', ipa: 'ˈprem.ɪs', nepali: 'आधारभूत मान्यता', translit: 'Ādhār', lectureNumber: 11 },
    { noun: 'rationale', ipa: 'ˌræʃ.əˈnɑːl', nepali: 'तार्किक आधार / औचित्य', translit: 'Auchitya', lectureNumber: 11 },
    { noun: 'Transition', ipa: 'trænˈzɪʃ.ən', nepali: 'संक्रमणकाल / रूपान्तरण', translit: 'Rūpāntaraṇ', lectureNumber: 11 },
    { noun: 'obstacle', ipa: 'ˈɒb.stə.kəl', nepali: 'बाधा / अड्चन', translit: 'Bādhā', lectureNumber: 11 },
    { noun: 'adversity', ipa: 'ədˈvɜː.sə.ti', nepali: 'प्रतिकूलता / कठिन परिस्थिति', translit: 'Pratikūlatā', lectureNumber: 11 },
    { noun: 'resilience', ipa: 'rɪˈzɪl.jəns', nepali: 'सामना गर्ने र फर्कने क्षमता (लचकता)', translit: 'Lachakatā', lectureNumber: 11 },
    { noun: 'Breakthrough', ipa: 'ˈbreɪk.θruː', nepali: 'महत्त्वपूर्ण फड्को वा खोज', translit: 'Ṭhūlo khoj', lectureNumber: 11 },
    { noun: 'evaluation', ipa: 'ɪˌvæl.juˈeɪ.ʃən', nepali: 'समग्र मूल्याङ्कन', translit: 'Samagra mūlyāṅkan', lectureNumber: 11 },

    // Lecture 12 (25 nouns)
    { noun: 'diplomacy', ipa: 'dɪˈpləʊ.mə.si', nepali: 'कूटनीति', translit: 'Kūṭanīti', lectureNumber: 12 },
    { noun: 'summit', ipa: 'ˈsʌm.ɪt', nepali: 'शिखर सम्मेलन', translit: 'Śikhar sammelan', lectureNumber: 12 },
    { noun: 'protocol', ipa: 'ˈprəʊ.tə.kɒl', nepali: 'कूटनीतिक मर्यादाक्रम (प्रोटोकल)', translit: 'Maryādākram', lectureNumber: 12 },
    { noun: 'envoy', ipa: 'ˈen.vɔɪ', nepali: 'विशेष दूत', translit: 'Viśeṣ dūt', lectureNumber: 12 },
    { noun: 'ambassador', ipa: 'æmˈbæs.ə.dər', nepali: 'राजदूत', translit: 'Rājdūt', lectureNumber: 12 },
    { noun: 'sovereignty', ipa: 'ˈsɒv.rən.ti', nepali: 'सार्वभौमसत्ता', translit: 'Sārvabhaumsattā', lectureNumber: 12 },
    { noun: 'autonomy', ipa: 'ɔːˈtɒn.ə.mi', nepali: 'स्वायत्तता', translit: 'Svāyattatā', lectureNumber: 12 },
    { noun: 'venture', ipa: 'ˈven.tʃər', nepali: 'नयाँ व्यावसायिक उद्यम', translit: 'Vyāvasāyik udyam', lectureNumber: 12 },
    { noun: 'innovation', ipa: 'ˌɪn.əˈveɪ.ʃən', nepali: 'नवप्रवर्तन / नयाँ खोज', translit: 'Navapravartan', lectureNumber: 12 },
    { noun: 'mediator', ipa: 'ˈmiː.di.eɪ.tər', nepali: 'मध्यस्थकर्ता', translit: 'Madhyasthakartā', lectureNumber: 12 },
    { noun: 'consensus', ipa: 'kənˈsen.səs', nepali: 'सर्वसम्मति / साझा सहमति', translit: 'Sarvasammati', lectureNumber: 12 },
    { noun: 'accord', ipa: 'əˈkɔːd', nepali: 'शान्ति वा मैत्री सम्झौता', translit: 'Maitrī samjhautā', lectureNumber: 12 },
    { noun: 'ratification', ipa: 'ˌræt.ɪ.fɪˈkeɪ.ʃən', nepali: 'संसदीय अनुमोदन', translit: 'Anomodan', lectureNumber: 12 },
    { noun: 'criterion', ipa: 'kraɪˈtɪə.ri.ən', nepali: 'छनोटको मापदण्ड', translit: 'Māpadaṇḍa', lectureNumber: 12 },
    { noun: 'benchmark', ipa: 'ˈbentʃ.mɑːk', nepali: 'गुणस्तरको मानक', translit: 'Mānak', lectureNumber: 12 },
    { noun: 'curriculum', ipa: 'kəˈrɪk.jə.ləm', nepali: 'शैक्षिक पाठ्यक्रम', translit: 'Pāṭhyakram', lectureNumber: 12 },
    { noun: 'memorandum', ipa: 'ˌmem.əˈræn.dəm', nepali: 'समझदारीपत्र (स्मृतिपत्र)', translit: 'Samajhdārīpatra', lectureNumber: 12 },
    { noun: 'symposium', ipa: 'sɪmˈpəʊ.zi.əm', nepali: 'प्राज्ञिक सम्मेलन', translit: 'Prājñik sammelan', lectureNumber: 12 },
    { noun: 'equilibrium', ipa: 'ˌiː.kwɪˈlɪb.ri.əm', nepali: 'सन्तुलन', translit: 'Santulan', lectureNumber: 12 },
    { noun: 'spectrum', ipa: 'ˈspek.trəm', nepali: 'विस्तृत दायरा', translit: 'Vistṛt dāyarā', lectureNumber: 12 },
    { noun: 'paradigm', ipa: 'ˈpær.ə.daɪm', nepali: 'वैचारिक नमुना', translit: 'Vaichārik namunā', lectureNumber: 12 },
    { noun: 'jurisprudence', ipa: 'ˌdʒʊə.rɪsˈpruː.dəns', nepali: 'विधिशास्त्र', translit: 'Vidhiśāstra', lectureNumber: 12 },
    { noun: 'stewardship', ipa: 'ˈstjuː.əd.ʃɪp', nepali: 'जिम्मेवार रेखदेख र नेतृत्व', translit: 'Jimmevār netṛtva', lectureNumber: 12 },
    { noun: 'philanthropy', ipa: 'fɪˈlæn.θrə.pi', nepali: 'परोपकार / समाजसेवा', translit: 'Paropakār', lectureNumber: 12 },
    { noun: 'statesman', ipa: 'ˈsteɪts.mən', nepali: 'राजनेता', translit: 'Rājnetā', lectureNumber: 12 },
  ];

  let collocationCounter = 1;
  for (let mIdx = 0; mIdx < MODIFIER_SEEDS.length; mIdx++) {
    const mod = MODIFIER_SEEDS[mIdx];
    for (let nIdx = 0; nIdx < DOMAIN_NOUNS_BY_LECTURE.length; nIdx++) {
      const nounSeed = DOMAIN_NOUNS_BY_LECTURE[nIdx];
      const phrase = `${mod.adj} ${nounSeed.noun.toLowerCase()}`;
      const key = phrase.toLowerCase();
      if (seenWords.has(key)) continue;
      seenWords.add(key);

      const meta = getLectureMeta(nounSeed.lectureNumber);
      const cleanModIpa = mod.ipa.replace(/\//g, '');

      items.push({
        id: `lex-col-${collocationCounter++}`,
        word: phrase,
        ipa: `/${cleanModIpa} ${nounSeed.ipa}/`,
        partOfSpeech: 'noun phrase (collocation)',
        segments: buildSegments(phrase, mod.silentChar),
        silentLettersSummary: mod.silentDesc,
        nepaliMeaning: `${mod.nepali} ${nounSeed.nepali}`,
        nepaliTransliteration: `${mod.translit} ${nounSeed.translit}`,
        englishExample: `Effective leaders value ${phrase.toLowerCase()} in professional settings.`,
        nepaliExampleTranslation: `प्रभावकारी नेतृत्वले व्यावसायिक क्षेत्रमा ${mod.nepali} ${nounSeed.nepali.split('/')[0].trim()}लाई महत्त्व दिन्छ।`,
        usageTipNepali: `"${mod.adj}" (${mod.nepali}) + "${nounSeed.noun}" (${nounSeed.nepali}) मिलेर बनेको उच्च-उपयोगी पदावली।`,
        ...meta,
      });
    }
  }

  cachedMassiveLexicon = items;
  return items;
}
