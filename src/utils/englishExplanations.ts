// Clean English explanations for Vocabulary tips, Pronunciation rules, Spelling rules, Quiz feedback, and Grammar lessons

export const ENGLISH_USAGE_TIPS: Record<string, string> = {
  'l1-v1': '"Knight" and "Night" are homophones—both are pronounced /naɪt/. The initial "K" and middle "gh" are completely silent.',
  'l1-v2': 'Many learners pronounce the "b", but in "subtle" the "b" is completely silent. Pronounce it smoothly as "SUH-tl" (/ˈsʌt.əl/).',
  'l1-v3': 'In words starting with "wr-" (wrist, write, wrong, wrap), the "w" is always silent. Start directly with the "r" sound.',
  'l1-v4': 'In both "doubt" and "debt", the letter "b" is written for Latin etymology but never pronounced.',
  'l1-v5': 'In "calm", "palm", and "almond", the "l" before "m" is silent, lengthening the vowel to a smooth /ɑː/ ("kaam").',

  'l2-v1': 'Although "queue" has five letters, it is pronounced identically to the single letter "Q" (/kjuː/)—the trailing "ueue" is silent.',
  'l2-v2': 'In natural speech, the middle "d" and first "e" disappear. Pronounce it in 2 syllables as "WENZ-day", not "Wed-nes-day".',
  'l2-v3': 'Unlike "recipe" (3 syllables with a spoken p), "receipt" has a silent "p" and is pronounced "ri-SEET" (/rɪˈsiːt/).',
  'l2-v4': 'Because the initial "H" is silent, "honest" starts with a vowel sound (/ɒ/). Always use "an honest person", never "a honest person".',
  'l2-v5': 'Do not drop the first "r" when spelling "Feb-ru-ary". Even if casual speech softens it, formal writing requires both "r"s.',

  'l3-v1': 'In "science", "scene", "muscle", and "fascinate", the "c" after "s" is silent—together "sc" makes a single /s/ sound.',
  'l3-v2': 'When a word ends in "-mn" (column, autumn, solemn), the final "n" is silent. Pronounce it "KOL-uhm".',
  'l3-v3': 'The final "n" is silent in the noun "autumn", but wakes up and is pronounced when you add "-al" to form the adjective "autumnal".',
  'l3-v4': 'In "-gn" endings (foreign, sign, design, campaign), the "g" is always silent before the final "n".',
  'l3-v5': 'In "guard", "guess", "guide", and "guitar", the "u" is silent—it only serves to keep the "g" hard (/ɡ/) instead of soft (/dʒ/).',

  'l4-v1': 'One of English’s most famous irregular words: despite being spelled "c-o-l-o-n-e-l" with no "r", it is pronounced "KER-nuhl" (/ˈkɜː.nəl/).',
  'l4-v2': 'The middle "t" is silent, and the unstressed "-age" ending sounds like "-ij" (/ɡɪdʒ/): "MOR-gij".',
  'l4-v3': 'In Greek-origin words starting with "ps-", the "p" is silent, and the middle "ch" is pronounced as a hard /k/ ("sai-KOL-uh-jee").',
  'l4-v4': 'In both "island" and "aisle", the "s" is completely silent. Pronounce it "AI-luhnd" (/ˈaɪ.lənd/).',
  'l4-v5': 'Even though you hear a single /k/ and /m/ sound, spelling "accommodate" requires both double "cc" and double "mm".',

  'l5-v1': 'Although it looks like 4 syllables, natural English compresses the middle "or", pronouncing it in 3 syllables: "KUMF-tuh-buhl".',
  'l5-v2': 'Fast speakers often slur the "n" before "-ment", leading to the common typo "enviroment". Remember the root word: "environ + ment".',
  'l5-v3': 'Formed from the verb "govern" + "-ment". Never drop the "n" before "-ment" in writing.',
  'l5-v4': 'While "know" has a long /əʊ/ vowel, adding "-ledge" shortens the vowel to /ɒ/ ("NOL-ij") with a silent "k", "w", and "d".',
  'l5-v5': 'Formed from "hand + kerchief", but in speech the "d" disappears and the "n" shifts to an /ŋ/ sound before "k": "HANG-kuh-chif".',

  'l6-v1': '"Conscious" is an adjective meaning aware. The "sci" blends into a single "sh" (/ʃ/) sound: "KON-shuhs".',
  'l6-v2': 'Spelling trick: "con + science". However, never pronounce it "con-science"—it is pronounced in 2 syllables as "KON-shuhns".',
  'l6-v3': '"Rhythm" has no traditional vowel letters (a, e, i, o, u)—only "y"—and includes two "h"s (rh- at the start and -th- in the middle).',
  'l6-v4': 'While most "wh-" words (what, where) pronounce the "w", words with "who-" (who, whole, wholesome) silence the "w" and pronounce the "h".',
  'l6-v5': 'Derived from the Greek word for lung ("pneumon"), the initial "p" before "n" is completely silent: "nyoo-MOH-nee-uh".',

  'l7-v1': 'In "-mb" words (plumber, climb, thumb, comb), the "b" after "m" is completely silent—even when you add "-er". Pronounce it "PLUM-er".',
  'l7-v2': 'In words ending in "-stle" (castle, whistle, wrestle, hustle), the middle "t" is always silent.',
  'l7-v3': 'Both the "h" after "w" and the "t" before "le" are silent. Pronounce it smoothly as "WIS-uhl" (/ˈwɪs.əl/).',
  'l7-v4': 'Never pronounce the final "b" at the end of "-mb" words (thumb, lamb, bomb, crumb). End cleanly on the /m/ sound.',
  'l7-v5': 'Although "fast" pronounces the "t", adding "-en" to form "fasten" (just like "listen" and "soften") makes the "t" completely silent.',

  'l8-v1': 'Despite the spelling "s-a-l-m-o-n", the middle "l" is completely silent in English. Pronounce it "SAM-uhn" (/ˈsæm.ən/).',
  'l8-v2': 'Just like "calm" and "palm", the "l" before "m" in "almond" is silent: "AA-muhnd" (/ˈɑː.mənd/).',
  'l8-v3': 'Borrowed from French, the final "t" in "buffet" is silent and "-et" is pronounced with a long /eɪ/ sound: "BOO-fay".',
  'l8-v4': 'Another French culinary loanword where the final "t" is silent and "-et" sounds like "ay": "GOR-may" (/ˈɡɔː.meɪ/).',
  'l8-v5': 'The letter "u" after "c" is silent—never pronounce it "bis-koot". In English it is two crisp syllables: "BIS-kit" (/ˈbɪs.kɪt/).',

  'l9-v1': 'The "b" in "debt" was inserted by Renaissance scholars to reflect the Latin root "debitum", but it is completely silent: "DET" (/det/).',
  'l9-v2': 'In the legal term "subpoena", both the "b" and the "o" are silent. Pronounce the middle syllable like "pee": "suh-PEE-nuh".',
  'l9-v3': 'In "-gn" endings (campaign, foreign, sign, reign), the "g" before final "n" is silent: "kam-PAYN".',
  'l9-v4': 'In "resign", the "s" sounds like /z/ and the "g" is silent ("ri-ZAIN"), though the "g" wakes up in the noun "resignation" (/ˌrez.ɪɡˈneɪ.ʃən/).',
  'l9-v5': 'Initial "sc-" makes a single /s/ sound (silent "c"), while the middle "-ss-" is voiced like /z/: "SIZ-uhz". Remember it is always plural!',

  'l10-v1': 'Although formed from "cup + board", everyday speech drops the "p" and compresses the second half: "KUB-uhd" (/ˈkʌb.əd/).',
  'l10-v2': 'In "raspberry", the "p" is silent and the "s" before "b" becomes a voiced /z/ sound: "RAAZ-buh-ree".',
  'l10-v3': 'In "-gue" endings (dialogue, colleague, catalogue, league), the final "ue" is silent and keeps the preceding "g" hard (/ɡ/).',
  'l10-v4': 'Do not confuse "colleague" (/ˈkɒl.iːɡ/ — coworker, 2 syllables ending in hard /ɡ/) with "college" (/ˈkɒl.ɪdʒ/ — school).',
  'l10-v5': 'The "u" after initial "g" is silent and simply marks a hard /ɡ/ sound. Place primary stress on the final "-tee": "ga-ruhn-TEE".',

  'l11-v1': 'In Greek-derived "rh-" words (rhetoric, rhythm, rhino), the "h" after "r" is always silent: "RET-uh-rik".',
  'l11-v2': 'Spelled "hi-er-ar-chy", the Greek "-archy" (rule) suffix pronounces "ch" as a hard /k/ sound: "HAI-uh-raa-kee".',
  'l11-v3': 'Never pronounce "chaos" with a "ch" as in "chair"—Greek "ch" represents a hard /k/ sound: "KAY-os" (/ˈkeɪ.ɒs/).',
  'l11-v4': 'Borrowed from French, the final "s" in "debris" is silent: "DEB-ree" (/ˈdeb.riː/). It is an uncountable noun.',
  'l11-v5': 'Formed from "subtle + ty", the "b" remains completely silent in the noun form as well: "SUT-uhl-tee".',

  'l12-v1': 'In the French loanword "rendezvous", both the middle "z" and final "s" are silent: "RON-day-voo" (/ˈrɒn.deɪ.vuː/).',
  'l12-v2': 'Pronounce the French initial "en-" like "on" (/ɒn/) and stress the final syllable: "on-truh-pruh-NUR".',
  'l12-v3': 'Remember the symmetrical vowel pattern "l-i-a-i-s-o-n" (an "i" on both sides of "a"): "lee-AY-zon".',
  'l12-v4': 'In French "-geois", the "g" is a soft /ʒ/ (as in "measure"), "oi" sounds like "waa" (/wɑː/), and the final "s" is silent: "BOOR-zhwaa".',
  'l12-v5': 'Just like "foreign", the "g" before "n" is silent and the middle "e" compresses in natural speech: "SOV-rin" (/ˈsɒv.rɪn/).',
};

export const ENGLISH_PRONUNCIATION_RULES: Record<string, string> = {
  'l1-p1': 'In Old English, the "k" in "kn-" was spoken, but in modern English initial "kn-" (know, knee, knife, knight) always drops the "k" sound. Post-vowel "gh" is also silent.',
  'l1-p2': 'In Latin-derived words with "-bt" (subtle, doubt, debt), your tongue skips the "b" entirely and moves straight to the "t" sound.',
  'l1-p3': 'Whenever a word begins with "wr-" (wrist, write, wrestle, wrinkle), do not round your lips for a "w"—start cleanly on the "r".',
  'l1-p4': 'The vowel pair "ou" produces the /aʊ/ diphthong (as in "out" and "cloud"). Skip the "b" and finish directly on /t/.',
  'l1-p5': 'An "l" following "a" and preceding "m", "f", or "k" (calm, half, talk, walk) is silent and lengthens the preceding vowel.',

  'l2-p1': 'In this French loanword, everything after "qu" simply signals the long /juː/ sound. Say the letter "Q"—just one syllable.',
  'l2-p2': 'Due to syncope (dropping unstressed middle vowels in everyday speech), "Wed-nes-day" compresses into two syllables: "WENZ-day".',
  'l2-p3': 'The "p" in "receipt" was added in the 16th century to match the Latin root "recepta", but it has never been pronounced in English.',
  'l2-p4': 'While most English "h" words are voiced, four key word families—hour, honest, honour, and heir—have a completely silent initial "h".',
  'l2-p5': 'When two "r" sounds appear close together, speakers often soften the first to /j/ ("FEB-yoo-uh-ree"), though "FEB-roo-uh-ree" helps you remember the spelling.',

  'l3-p1': 'When "sc" is followed by "e" or "i" (science, scene, fascinate, discipline), the "c" is silent and the cluster produces a single /s/ sound.',
  'l3-p2': 'At the end of a base word, the cluster "-mn" (column, autumn, solemn, condemn) always silences the final "n".',
  'l3-p3': 'The digraph "au" in English (autumn, August, author, cause) represents a single smooth /ɔː/ vowel, not an "a-u" glide.',
  'l3-p4': 'In final "-gn" patterns (foreign, sign, align, assign, reign), the "g" is silent and the word ends cleanly on /n/.',
  'l3-p5': 'In "gu-" words before "a", "e", or "i" (guard, guest, guide), the "u" is silent and marks that the "g" is pronounced as a hard /ɡ/.',

  'l4-p1': 'English borrowed the French pronunciation "coronel" (with an R sound) earlier than the Italian spelling "colonnello" (with an L), leaving us with "KER-nuhl".',
  'l4-p2': 'The French "t" in "mort" (dead) + "gage" (pledge) is silent, and unstressed "-age" endings reduce to /ɪdʒ/ (just like village and luggage).',
  'l4-p3': 'In Greek academic roots, initial "ps-" reduces to /s/, and "ch" represents a hard /k/ sound (psychology, chemistry, architect).',
  'l4-p4': 'Pronounce the first syllable as /aɪ/ ("eye") and go directly to "-luhnd", ignoring the silent "s".',
  'l4-p5': 'Start with a relaxed unstressed schwa /ə/ ("uh") and place primary stress on the second syllable: "uh-KOM-uh-dayt".',

  'l5-p1': 'English is a stress-timed language: unstressed syllables shrink to a quick schwa (/ə/). Thus "-table" in "comfortable" sounds like "-tuh-buhl", not "tay-bul".',
  'l5-p2': 'Place primary stress on the second syllable ("VAI") and reduce the "-ment" suffix to a quick unstressed "-muhnt" (/mənt/).',
  'l5-p3': 'Stress the first syllable ("GUV") and glide smoothly through the unstressed middle and final syllables.',
  'l5-p4': 'Adding "-ledge" to "know" shortens the vowel from /əʊ/ to /ɒ/ ("NOL-ij"), and "-dge" makes a single /dʒ/ sound.',
  'l5-p5': 'The "d" between "n" and "k" drops out (elision), and the "n" assimilates into an /ŋ/ ("ng") sound before the /k/: "HANG-kuh-chif".',

  'l6-p1': 'In both "conscious" and "conscience", the letters "sci" palatalize into a single "sh" (/ʃ/) sound. "-ous" makes it an adjective ("KON-shuhs").',
  'l6-p2': 'Even though "science" is visible inside the spelling, never say "con-science"—pronounce it in two syllables as "KON-shuhns".',
  'l6-p3': 'The middle "th" is voiced (/ð/, as in "this" and "mother"), followed by a syllabic "m" ("RITH-uhm").',
  'l6-p4': 'Whenever "wh" is followed by the letter "o" (who, whom, whose, whole, wholesome), the "w" is silent and the "h" is spoken.',
  'l6-p5': 'In Greek medical terms starting with "pn-" (pneumonia, pneumatic), the initial "p" is silent and pronunciation begins on /n/.',

  'l7-p1': 'In "-mb" clusters at the end of a root word (climb, thumb, plumb → plumber), the "b" is silent even when a vowel suffix like "-er" or "-ing" is added.',
  'l7-p2': 'In "-stle" words (castle, whistle, bristle, bustle), the tongue glides straight from /s/ to /l/ without stopping for a /t/ sound.',
  'l7-p3': 'Initial "wh-" is pronounced as a clean /w/, and the "-stle" ending drops the "t" sound completely ("WIS-uhl").',
  'l7-p4': 'Start with an unvoiced dental fricative /θ/ ("th" as in "think") and close your lips on /m/, ignoring the final "b".',
  'l7-p5': 'In "-sten" verbs (fasten, listen, glisten, moisten), the "t" after "s" is silent, reducing the second syllable to "-suhn" (/sən/).',

  'l8-p1': 'The "l" before "m" in "salmon" is completely silent, and the first vowel is a short /æ/ (as in "cat"): "SAM-uhn".',
  'l8-p2': 'Dropping the "l" before "m" lengthens the initial "a" into a smooth open /ɑː/ vowel: "AA-muhnd".',
  'l8-p3': 'In French culinary and artistic borrowings ending in "-et" (buffet, gourmet, ballet, sorbet, bouquet), the "t" is silent and "-et" is pronounced /eɪ/ ("ay").',
  'l8-p4': 'Stress the first syllable ("GOR") and finish on a clean long /eɪ/ vowel ("may") without pronouncing the final "t".',
  'l8-p5': 'In "-cuit" (biscuit, circuit), the "u" is silent and the second syllable is pronounced simply as "-kit" (/kɪt/).',

  'l9-p1': '"Debt" rhymes with "bet" and "set". Never pronounce the middle "b" in "debt" or "debtor".',
  'l9-p2': 'In this Latin legal word ("sub + poena"), both the "b" in "sub-" and the "o" in "poe-" are silent: "suh-PEE-nuh".',
  'l9-p3': 'The ending "-aign" in "campaign" and "champagne" is pronounced identically to "pain" (/peɪn/), with a silent "g".',
  'l9-p4': 'An "s" between two vowels often becomes voiced (/z/). Here, "re-sign" has a /z/ sound and a silent "g": "ri-ZAIN".',
  'l9-p5': 'Start with a clean /s/ for "sc-" and use a voiced /z/ sound for the middle "-ss-": "SIZ-uhz".',

  'l10-p1': 'When /p/ and /b/ meet inside a compound word ("cup + board", "rasp + berry"), the /p/ assimilates into the /b/, leaving a single /b/ sound ("KUB-uhd").',
  'l10-p2': 'Drop the "p" completely and voice the "s" as /z/ before "b": "RAAZ-buh-ree".',
  'l10-p3': 'In "-gue" words (dialogue, colleague, catalogue), the "ue" is silent and signals that the "g" is a hard /ɡ/ rather than /dʒ/.',
  'l10-p4': 'Keep the second vowel long (/iː/ — "eeg") so "colleague" (/ˈkɒl.iːɡ/) stays clearly distinct from "college" (/ˈkɒl.ɪdʒ/).',
  'l10-p5': 'Suffix "-ee" (guarantee, employee, trainee, interviewee) attracts primary stress onto the final syllable ("ga-ruhn-TEE").',

  'l11-p1': 'Notice the stress shift: the noun "RHE-to-ric" stresses the first syllable, whereas the adjective "rhe-TOR-i-cal" stresses the second syllable.',
  'l11-p2': 'In Greek roots with "ch" (hierarchy, monarchy, architect, archive), "ch" is always pronounced as a hard /k/.',
  'l11-p3': 'Pronounce "ch" as /k/, followed by two distinct vowels across two syllables: "KAY-os" (/ˈkeɪ.ɒs/).',
  'l11-p4': 'In "debris", the final "s" is silent and the second syllable has a long /iː/ vowel: "DEB-ree".',
  'l11-p5': 'Keep the "b" silent across the entire word family: subtle (/ˈsʌt.əl/), subtly (/ˈsʌt.li/), and subtlety (/ˈsʌt.əl.ti/).',

  'l12-p1': 'In French "-ez", the "z" is silent and produces /eɪ/ ("day"); in "-vous", the "s" is silent and produces /vuː/ ("voo"): "RON-day-voo".',
  'l12-p2': 'French agent nouns ending in "-eur" (entrepreneur, connoisseur, chauffeur) place primary stress on the final syllable.',
  'l12-p3': 'Pronounce both vowels separately at the start—/li/ ("lee") gliding into stressed /eɪ/ ("ay")—followed by "-zon": "lee-AY-zon".',
  'l12-p4': 'In French loanwords, "ge" before "o" produces a soft /ʒ/ sound and "-ois" is pronounced /wɑː/ ("waa") with a silent "s".',
  'l12-p5': 'The unstressed middle "e" drops out by syncope and the "g" before "n" is silent, giving two crisp syllables: "SOV-rin".',
};

export const ENGLISH_SPELLING_EXPLANATIONS: Record<string, string> = {
  'lecture-1-silent-consonants':
    'When a base word ends in a silent "-e":\n1. DROP the "-e" when adding a suffix that begins with a vowel (-ing, -ed, -able, -ous): write + ing → writing, subtle + ty → subtlety.\n2. KEEP the "-e" when adding a suffix that begins with a consonant (-ly, -ful, -less, -ment): care + ful → careful, calm + ly → calmly (with key exceptions like truly and argument).',
  'lecture-2-deceptive-vowels':
    'When spelling words with the long /iː/ ("ee") sound:\n1. Write "i" before "e" in most words: believe, achieve, piece, field.\n2. Write "e" before "i" directly after the letter "c": receive, receipt, ceiling, deceive.\n3. Write "e" before "i" when the vowel sound is /eɪ/ ("ay"): neighbor, weight, eight.',
  'lecture-3-consonant-doubling':
    'When adding a vowel suffix (-ed, -ing, -er) to a word ending in Consonant-Vowel-Consonant (CVC):\n1. One-syllable CVC words always double the final consonant: stop → stopped, plan → planning.\n2. Multi-syllable CVC words double the final consonant ONLY if the final syllable is stressed: be·GIN → beginning, oc·CUR → occurred, pre·FER → preferred.\n3. If the first syllable is stressed, do NOT double: VIS·it → visited, HAP·pen → happened.',
  'lecture-4-loanwords-politeness':
    'High-frequency workplace words with double consonants often come from Latin prefix assimilation. Use these classic memory aids:\n• Accommodate: Large enough to hold 2 "C"ots and 2 "M"attresses (a-cc-o-mm-odate).\n• Necessary: A shirt has 1 "C"ollar and 2 "S"leeves (ne-c-e-ss-ary).\n• Recommend: Re + commend = 1 "C" and 2 "M"s (re-c-o-mm-end).',
  'lecture-5-schwa-relative-clauses':
    '1. Root Preservation with "-ment": Adding "-ment" never drops a consonant from the root word: environ + ment → environment, govern + ment → government.\n2. "-able" vs. "-ible": Use "-able" when the base part is a complete English word on its own (comfort → comfortable, depend → dependable). Use "-ible" mainly on bound Latin roots (vis- → visible, aud- → audible).\n3. Remember that "independent" has only "e"s in its second half (in-de-pend-ent)—never an "a".',
  'lecture-6-confusables-conditionals':
    'Master these four high-stakes confusable pairs in professional writing:\n1. Affect vs. Effect: Affect is usually a verb meaning to influence (A = Action); Effect is usually a noun meaning the result (E = End result).\n2. Principle vs. Principal: Principle (-le like "rule") means a fundamental truth or rule; Principal (-pal) means the head of a school or "main/primary".\n3. Compliment vs. Complement: Compliment (with "i") means praise; Complement (with "e" like "complete") means something that completes or pairs well.\n4. Conscious vs. Conscience: Conscious (-ous) is an adjective ("aware"); Conscience (-ence) is a noun ("inner moral sense").',
  'lecture-7-silent-mb-stl-causatives':
    '1. Words Ending in "-Y":\n• Consonant + Y → change "y" to "i" and add "-es" or "-ed" (city → cities, family → families, carry → carried).\n• Vowel + Y → keep the "y" and simply add "-s" or "-ed" (journey → journeys, delay → delays).\n2. Plurals of "-F" and "-FE" Nouns:\n• Most nouns ending in "-f" or "-fe" change to "-ves" in the plural (knife → knives, shelf → shelves, leaf → leaves, life → lives), with notable exceptions like roof → roofs, chief → chiefs, and belief → beliefs.',
  'lecture-8-culinary-loanwords-quantifiers':
    'In many English word pairs, a single letter ("c" vs. "s") distinguishes the Noun from the Verb:\n1. "-CE" = Noun (/s/ sound — think "C" as in "iCe"):\n• advice (noun: a helpful suggestion)\n• device (noun: a piece of equipment)\n• practice (noun: regular training)\n2. "-SE" = Verb (/z/ sound — action):\n• advise (verb: to give advice)\n• devise (verb: to invent or plan)\n• practise (verb in British/Commonwealth English)',
  'lecture-9-business-silent-passive':
    'Stop guessing between "-sede", "-ceed", and "-cede" with this 3-part rule:\n1. ONLY ONE word in English ends in "-sede": supersede.\n2. ONLY THREE words end in "-ceed": proceed, exceed, and succeed (Note: when adding "-ure" to "proceed", the double "ee" becomes a single "e": procedure!).\n3. ALL OTHER words with this sound end in "-cede": precede, concede, recede, intercede, secede.',
  'lecture-10-prefixes-reported-speech':
    'When adding a negative prefix (un-, dis-, mis-, in-, im-, il-, ir-) to a base word, NEVER drop a letter from the prefix or the root word:\n1. Single Consonant: If the prefix and base word have different letters at the boundary, only one consonant appears: dis + appear → disappear (only one "s"!), dis + appoint → disappoint.\n2. Double Consonant: If the prefix ends with the same letter that starts the base word, keep BOTH letters: dis + satisfy → dissatisfy (ss), mis + spell → misspell (ss), un + necessary → unnecessary (nn), ir + responsible → irresponsible (rr), il + legal → illegal (ll).',
  'lecture-11-academic-ch-connectors':
    'Both "-cious" and "-tious" are pronounced identically as /ʃəs/ ("shuhs"). Use the root noun to choose the right spelling:\n1. Use "-CIOUS" when the related root word ends in "-ce" or contains "c":\n• space → spacious, grace → gracious, malice → malicious, conscience → conscious, suspicion → suspicious.\n2. Use "-TIOUS" when the related root noun ends in "-tion":\n• ambition → ambitious, caution → cautious, nutrition → nutritious, infection → infectious.',
  'lecture-12-diplomatic-french-inversion':
    'Academic and executive English preserves Classical Greek and Latin plural forms instead of adding "-s":\n1. "-ON" → "-A": one criterion (singular) → many criteria (plural); one phenomenon (singular) → many phenomena (plural). Never write "a criteria" or "criterias"!\n2. "-IS" → "-ES" (/iːz/): one analysis → two analyses; one crisis → several crises; one hypothesis → multiple hypotheses.\n3. "-UM" → "-A": datum → data, curriculum → curricula.',
};

export const ENGLISH_QUIZ_EXPLANATIONS: Record<string, string> = {
  'l1-q1': '"Write" has a long vowel sound (/aɪ/), so the "t" is not doubled, and the final silent "-e" drops before "-ing" to form "writing".',
  'l1-q2': 'Even though the "b" is silent in speech, the root spelling "doubt" keeps the "b" before "-ful": "doubtful".',
  'l1-q3': 'The "b" before "t" is silent, so it is always spelled "s-u-b-t-l-e".',
  'l1-q4': '"Argument" is an important exception to the Consonant Suffix rule: "argue + ment" drops the silent "-e" to become "argument".',

  'l2-q1': 'Following "I before E, except after C", the letters "ei" follow "c", and the historical silent "p" is kept: "receipt".',
  'l2-q2': 'Although spoken in two syllables as "Wenz-day", the written form retains all three parts: "Wed-nes-day".',
  'l2-q3': '"Receive" uses "ei" after "c", and "February" retains both "r"s (Feb-ru-ary).',
  'l2-q4': '"Queue" is spelled q-u-e-u-e, and "believe" uses "ie" because it does not follow "c".',

  'l3-q1': '"Occur" already has double "cc", and because stress falls on the final syllable (oc-CUR), the final "r" also doubles before "-ed": "occurred".',
  'l3-q2': 'In "be-GIN", the second syllable is stressed and ends in CVC (i-n), so the final "n" doubles to "beginning" (the "g" never doubles).',
  'l3-q3': '"Foreign" uses "eign", "VIS-it" has first-syllable stress so the "t" does not double ("visited"), and "autumn" ends in a silent "n".',
  'l3-q4': '"Fascinates" requires "sc", and "column" ends with a silent "n" after "m".',

  'l4-q1': 'Use the "1 Collar, 2 Sleeves" rule: one "c" and two "s"s → "ne-c-e-ss-ary".',
  'l4-q2': '"Accommodate" requires both double "cc" and double "mm" (a-cc-o-mm-odate).',
  'l4-q3': '"Recommend" has 1 "c" and 2 "m"s (re-commend), while "psychology" starts with a silent "p".',
  'l4-q4': '"Colonel" is spelled with "l-o", "mortgage" has a silent "t", and "island" has a silent "s".',

  'l5-q1': 'Keep the full root word "environ" when adding "-ment" → "environment" (never drop the "n" before "m").',
  'l5-q2': '"Independent" is spelled with "-ent" at the end—every vowel after the initial "i" is an "e" (in-de-pend-ent).',
  'l5-q3': '"Government" preserves the "n" from "govern", and "knowledge" retains the silent "d" before "ge".',
  'l5-q4': '"Handkerchief" keeps the "d" from "hand", and the complete root word "comfort" takes "-able".',

  'l6-q1': 'After modal "can" we need the verb "affect" (Action), and after "a negative" we need the noun "effect" (End result).',
  'l6-q2': '"Rhythm" has two "h"s (rh- at the start and -th- in the middle) and uses "y" as its only vowel.',
  'l6-q3': '"Conscious" (-ous) is the adjective meaning aware, "principles" (-le) means moral rules, and "conscience" is the noun meaning inner moral sense.',
  'l6-q4': '"Complements" (with "e") means completes/enhances, "wholesome" starts with a silent "w", and "pneumonia" starts with a silent "p".',

  'l7-q1': '"Shelf" changes "-f" to "-ves" ("shelves"), and "family" ends in Consonant + Y so it becomes "families".',
  'l7-q2': '"Plumber" retains its silent "b", and "roof" is a classic exception that simply takes "-s" ("roofs").',
  'l7-q3': '"Carry" (Consonant + Y) becomes "carried", while "journey" (Vowel + Y) keeps the "y" to become "journeys".',
  'l7-q4': '"Fasten" keeps its silent "t", and "knife" changes "-fe" to "-ves" ("knives").',

  'l8-q1': 'After "great" we need the noun "advice" (-ce), and for the action we need the verb "advised" (-sed).',
  'l8-q2': 'After "to" we need the verb "devise" (-se, meaning invent), and after "a smart" we need the noun "device" (-ce, meaning gadget).',
  'l8-q3': '"Buffet" (silent t), "salmon" (silent l), "almond" (silent l), and "biscuits" (silent u) are all spelled accurately.',
  'l8-q4': 'The verb form is "advised" (-sed), and the French culinary modifier is spelled "gourmet" (-met).',

  'l9-q1': '"Supersede" is the only word in the English language spelled with "-sede".',
  'l9-q2': 'The verb "proceed" has double "ee", but the noun "procedure" drops one "e" before "-ure".',
  'l9-q3': '"Precede" (come before) uses the standard "-cede", while "exceed" is one of the three "-ceed" verbs (proceed, exceed, succeed).',
  'l9-q4': '"Debt" keeps its silent "b", and "resign" keeps its silent "g" before "n".',

  'l10-q1': '"Dis + appear" has only one "s" ("disappear"), whereas "mis + spell" has two "s"s ("misspell").',
  'l10-q2': '"Ir + responsible" keeps both "r"s ("irresponsible"), and "un + necessary" keeps both "n"s ("unnecessary").',
  'l10-q3': '"Colleague" (-gue), "dissatisfied" (dis + satisfied = ss), "dialogue" (-gue), and "guarantee" (gua-) are all spelled properly.',
  'l10-q4': 'Both "raspberry" and "cupboard" retain their silent "p" in writing.',

  'l11-q1': '"Ambition" (-tion) forms "ambitious" (-tious), while "space" (-ce) forms "spacious" (-cious).',
  'l11-q2': 'Both "nutrition" and "caution" end in "-tion", so their adjectives take "-tious" ("nutritious", "cautious").',
  'l11-q3': '"Rhetoric" (rh-), "hierarchy" (h-i-e-r-a-r-c-h-y), and "chaos" (ch-) are all spelled accurately.',
  'l11-q4': '"Grace" (-ce) becomes "gracious" (-cious), and "subtle + ty" forms the noun "subtlety".',

  'l12-q1': 'With singular "is", use singular "criterion" (-on); with plural "are", use plural "criteria" (-a).',
  'l12-q2': 'Greek/Latin words ending in "-is" form their plural by changing "-is" to "-es": "analyses" and "crises".',
  'l12-q3': '"Entrepreneur", "liaison" (i-a-i), "rendezvous" (-zvous), and "sovereign" (-reign) are all spelled accurately.',
  'l12-q4': '"This ... was" requires the singular form "phenomenon" ("phenomena" is plural).',
};

export const ENGLISH_GRAMMAR_CONTENT: Record<
  string,
  {
    explanationEnglish: string;
    keyTakeawaysEnglish: string[];
    comparisonNotesEnglish: Record<string, string>;
    exerciseExplanationsEnglish: Record<string, string>;
  }
> = {
  'lecture-1-silent-consonants': {
    explanationEnglish:
      'English uses strict Subject + Verb + Object (SVO) word order, whereas Nepali uses Subject + Object + Verb (SOV). In English, the verb comes immediately after the subject, and the object follows the verb. Additionally, adverbs of manner (words telling "how" an action happened, like "calmly" or "subtly") are placed AFTER the direct object—never between the verb and its object.',
    keyTakeawaysEnglish: [
      'Place the Verb immediately after the Subject, and put the Object after the Verb (Subject + Verb + Object).',
      'Never separate a transitive verb from its direct object with a manner adverb (❌ He bandaged calmly his wrist → ✅ He bandaged his wrist calmly).',
      'Sentence adverbs like "Without a doubt" can be placed cleanly at the start or end of a clause.',
    ],
    comparisonNotesEnglish: {
      'l1-syn-1':
        'Notice how the action verb "protected" comes right after the subject in English (2nd position), whereas in Nepali it sits at the very end of the sentence.',
      'l1-syn-2':
        'In English, "wrapped" and its object "her injured wrist" stay tightly linked together, so the manner adverb "calmly" moves to the end.',
    },
    exerciseExplanationsEnglish: {
      'l1-cap-1':
        'English follows Subject (The teacher) + Verb (gave) + Object (a subtle hint).',
      'l1-cap-2':
        'Keep the verb ("answered") and direct object ("every doubt") together, placing the manner adverb ("calmly") at the end.',
      'l1-cap-3':
        '"Doubt" retains its silent "b", and "write + ing" drops the final silent "-e" to become "writing".',
    },
  },
  'lecture-2-deceptive-vowels': {
    explanationEnglish:
      '1. Sound-Based Articles (A vs. An): Choose "a" or "an" based on the FIRST SPOKEN SOUND of the following word, not its first written letter. Because "honest" and "hour" have a silent "h", they start with a vowel sound (/ɒ/, /aʊ/) and require "an" ("an honest person", "an hour"). Conversely, "queue" and "university" start with a consonant sound (/k/, /j/) and take "a".\n2. Prepositions of Time (On, In, At): Where Nepali often uses a single postposition ("-मा"), English divides time by precision: use "ON" for days and dates (on Wednesday), "IN" for months, seasons, and years (in February), and "AT" for exact clock times (at 10:00 AM).',
    keyTakeawaysEnglish: [
      'Use "an" before silent-"h" words that start with a vowel sound: an honest answer, an hour.',
      'Use ON for days of the week and specific dates (on Wednesday, on May 5th).',
      'Use IN for months, seasons, and years (in February, in autumn, in 2026).',
      'Use AT for precise clock times (at 9:00 AM, at noon).',
    ],
    comparisonNotesEnglish: {
      'l2-syn-1':
        'English distinguishes days ("on Wednesday"), months ("in February"), and clock times ("at 10 AM") with three different prepositions.',
      'l2-syn-2':
        'Silent "h" gives "honest" an initial vowel sound ("an honest cashier"), while "receipt" (/r/) and "queue" (/kjuː/) start with consonant sounds ("a").',
    },
    exerciseExplanationsEnglish: {
      'l2-cap-1':
        '"Hour" and "honest" begin with a vowel sound (silent "h") and take "an", while "long queue" starts with a consonant sound (/l/) and takes "a".',
      'l2-cap-2':
        'Use "at" for clock times (at 9:00 AM), "on" for days (on Wednesday), and "in" for months (in February).',
      'l2-cap-3':
        '"Received" and "receipt" both follow the "ei after c" rule, and days of the week take the preposition "on" ("on Wednesday").',
    },
  },
  'lecture-3-consonant-doubling': {
    explanationEnglish:
      'Understanding when to use the Present Perfect (have/has + V3) versus the Simple Past (V2) is essential for natural English:\n1. Present Perfect (have/has + V3): Use for life experiences at an unspecified time in the past ("She has studied two foreign languages") or past actions with a direct result in the present ("An error has occurred").\n2. Simple Past (V2): Use whenever the sentence names a FINISHED past time (such as "yesterday", "last autumn", "in 2023", or "two days ago"). Never use "have/has" with a finished past time marker!',
    keyTakeawaysEnglish: [
      'If a sentence includes a finished past time marker (yesterday, last autumn, in 2022, ago), always use Simple Past V2 (✅ We visited last autumn, never ❌ We have visited last autumn).',
      'Use Present Perfect (have/has + V3) for life experiences or recent events when no finished past time is stated.',
    ],
    comparisonNotesEnglish: {
      'l3-syn-1':
        'Because no specific past date is mentioned and the experience matters right now, English uses Present Perfect ("has studied").',
      'l3-syn-2':
        'Because "last autumn" is a finished time period in the past, English requires the Simple Past ("visited").',
    },
    exerciseExplanationsEnglish: {
      'l3-cap-1':
        'The word "yesterday" marks a finished past time, requiring Simple Past ("occurred" with double "r").',
      'l3-cap-2':
        'To express life experience without a specific past date, use Present Perfect: "have + V3 (written)".',
      'l3-cap-3':
        'After "have always", use the past participle V3 ("fascinated"), and spell "foreign" with "-eign".',
    },
  },
  'lecture-4-loanwords-politeness': {
    explanationEnglish:
      'While Nepali builds politeness directly into verb endings (honorifics), English creates workplace politeness using modal frames ("Could you tell me...", "Do you know...", "Would you mind...").\nCRITICAL WORD ORDER RULE: When you embed a question inside a polite frame like "Could you tell me...", the second part is no longer a direct question! You must drop "do/does/did" and keep normal statement word order: Subject + Verb ("Could you tell me where the colonel lives?", NOT "where does the colonel live?").',
    keyTakeawaysEnglish: [
      'Direct Question: "Where IS the island?" (Verb before Subject).',
      'Polite Indirect Question: "Could you tell me where the island IS?" (Subject before Verb!).',
      'After "Would you mind...", always use the "-ing" verb form (gerund): "Would you mind explaining...?"',
    ],
    comparisonNotesEnglish: {
      'l4-syn-1':
        'In an indirect question after "Could you tell me", drop "does" and keep Subject + Verb order ("where the colonel lives").',
      'l4-syn-2':
        'The polite frame "Would you mind" is always followed by a gerund (V-ing: "explaining").',
    },
    exerciseExplanationsEnglish: {
      'l4-cap-1':
        'In an indirect question, remove "does" and keep Subject ("this mortgage") + Verb ("costs") order.',
      'l4-cap-2':
        '"Would you mind" requires the "-ing" form, and "accommodating" keeps double "cc", double "mm", and drops the final "-e" before "-ing".',
      'l4-cap-3':
        '"Necessary" has 1 "c" and 2 "s"s, and "island" has a silent "s".',
    },
  },
  'lecture-5-schwa-relative-clauses': {
    explanationEnglish:
      'In Nepali, descriptive clauses come BEFORE the noun they describe (pre-nominal modifiers, e.g., "the government-created policy"). In English, relative clauses MUST come IMMEDIATELY AFTER the noun they modify, introduced by a relative pronoun:\n• Use "who" or "that" for people ("an independent consultant who has practical knowledge").\n• Use "which" or "that" for things, policies, or concepts ("the policy that the government introduced").\n• Use "whose" to show possession ("the scientist whose research...").',
    keyTakeawaysEnglish: [
      'Place the head noun first, followed immediately by the relative clause (who / which / that).',
      'Never repeat the object pronoun inside a relative clause (❌ The chair that I bought it → ✅ The chair that I bought).',
      'Use "whose" before a noun to express possession for both people and organizations.',
    ],
    comparisonNotesEnglish: {
      'l5-syn-1':
        'English places the head noun ("The policy") first and attaches the relative clause ("that the government introduced") right after it.',
      'l5-syn-2':
        'To describe a person with a multi-word clause, put the noun first ("an independent consultant") followed by "who has practical knowledge".',
    },
    exerciseExplanationsEnglish: {
      'l5-cap-1':
        'Put the head noun ("The comfortable chair") first, followed by the relative clause ("that I bought yesterday") without repeating "it".',
      'l5-cap-2':
        'Use the possessive relative pronoun "whose" before the noun "research" ("whose research").',
      'l5-cap-3':
        '"Independent" (-ent), "committee" (mm, tt, ee), "government" (n before m), and "environment" (n before m) are all spelled accurately.',
    },
  },
  'lecture-6-confusables-conditionals': {
    explanationEnglish:
      'Conditional sentences express hypothetical situations and their consequences. The golden rule in English is: NEVER put "would" inside the "If" clause!\n1. Second Conditional (Unreal/Hypothetical Present or Future): If + Simple Past (V2 / were), ... would + V1.\nExample: "If I knew the rhythm, I would join the dance." (I don’t know it right now).\n2. Third Conditional (Unreal/Counterfactual Past — imagining a different past): If + Past Perfect (had + V3), ... would have + V3.\nExample: "If I had been conscious of the trap, I would have avoided the mistake."',
    keyTakeawaysEnglish: [
      'Golden Rule: Keep "would" and "would have" out of the "If-clause" (❌ If I would have known → ✅ If I had known).',
      'Second Conditional (Present Unreal): If + V2/were, ... would + V1 (use subjunctive "If I were you").',
      'Third Conditional (Past Regret/Hypothetical): If + had + V3, ... would have + V3.',
    ],
    comparisonNotesEnglish: {
      'l6-syn-1':
        'To talk about an imaginary past outcome (Third Conditional), use "If + had + V3" in the condition and "would have + V3" in the result.',
      'l6-syn-2':
        'For hypothetical present advice (Second Conditional), formal English uses subjunctive "were" ("If I were you") + "would + V1".',
    },
    exerciseExplanationsEnglish: {
      'l6-cap-1':
        'Third Conditional requires "had + V3" ("had received") in the if-clause and "would not have + V3" ("would not have become") in the main clause.',
      'l6-cap-2':
        'Never use "would" in the if-clause! Use Simple Past ("If I knew") in the if-clause and "would + V1" ("would join") in the result clause.',
      'l6-cap-3':
        'Uses Second Conditional ("If we were... would remain") and correctly distinguishes "conscious" (adjective), "principles" (rules), and "conscience" (moral sense).',
    },
  },
  'lecture-7-silent-mb-stl-causatives': {
    explanationEnglish:
      'When you arrange for a professional (like a plumber, mechanic, or hairdresser) to do a service for you rather than doing it with your own hands, English uses the Causative Structure:\n1. Passive Causative (Focus on the service): Subject + have / get + Object + Past Participle (V3).\nExample: "We had the leaking pipe fixed." (Compare: "I cut my hair" means you cut it yourself; "I had my hair cut" means a barber cut it for you).\n2. Active Causative (Naming the person): Subject + have / make + Person + Base Verb (V1).\nExample: "We had the plumber fix the pipe."',
    keyTakeawaysEnglish: [
      'Service done for you: have / get + Object + Past Participle V3 ("We had the roof repaired").',
      'Assigning a person: have / make + Person + Base Verb V1 without "to" ("We had the plumber replace the pipe").',
      'With "get + Person", use "to + V1" ("We got the plumber to replace the pipe").',
    ],
    comparisonNotesEnglish: {
      'l7-syn-1':
        'Place the object ("the leaking pipe") between "had" and the past participle V3 ("fixed").',
      'l7-syn-2':
        'After "made/had + person ("the visitors")", use the bare infinitive V1 ("fasten") without "to".',
    },
    exerciseExplanationsEnglish: {
      'l7-cap-1':
        'Use the causative pattern "had + Object (the old castle roof) + V3 (repaired)" to show you hired specialists to do the work.',
      'l7-cap-2':
        'In "have + Person + Verb", always use the base verb V1 ("replace") without "to".',
      'l7-cap-3':
        'Correctly spells the plurals "shelves" and "knives" and uses the causative structure "had + new wooden shelves + installed (V3)".',
    },
  },
  'lecture-8-culinary-loanwords-quantifiers': {
    explanationEnglish:
      'Several everyday nouns that can be pluralized in other languages are strictly UNCOUNTABLE in English: advice, information, furniture, equipment, luggage, baggage, bread, research, and knowledge.\nRules for Uncountable Nouns:\n1. Never add "-s" (never write "advices", "informations", or "equipments").\n2. Never use "a / an" directly before them (never say "an advice").\n3. Always use a singular verb ("The kitchen equipment IS modern").\n4. To count individual items, use a unit phrase like "a piece of advice" or "two pieces of information", and use "much / a lot of / some" instead of "many".',
    keyTakeawaysEnglish: [
      'Never add "-s" or "a/an" to advice, information, equipment, furniture, or luggage.',
      'Use "a piece of advice / information / furniture" when referring to a single unit.',
      'Use "much / little" with uncountable nouns ("how much luggage") and "many / few" with countable plural nouns ("how many biscuits").',
    ],
    comparisonNotesEnglish: {
      'l8-syn-1':
        'Because "advice" is uncountable, English uses the unit phrase "a useful piece of advice" instead of "an advice".',
      'l8-syn-2':
        'Even when referring to multiple machines, "equipment" is uncountable and takes the singular verb "is".',
    },
    exerciseExplanationsEnglish: {
      'l8-cap-1':
        '"Advice" and "information" never take "-s"; use "some valuable advice" and "two pieces of information".',
      'l8-cap-2':
        '"Luggage" is uncountable ("how much luggage"), while "biscuits" is countable plural ("how many biscuits").',
      'l8-cap-3':
        'Uses the verb "advise" (-se) after subject "I" and keeps "equipment" singular with the verb "is".',
    },
  },
  'lecture-9-business-silent-passive': {
    explanationEnglish:
      'In business reports, legal documents, and formal announcements, the action itself is often more important than who performed it. English expresses this with the Passive Voice:\n• Formula: Object (as Subject) + form of "be" (is/are, was/were, has been, will be) + Past Participle (V3) [+ by Agent].\n• Active: "The court issued a subpoena." → Passive: "A subpoena was issued by the court."\n• Plural Pair Nouns: Words for two-part tools like "scissors", "trousers", and "glasses" are always plural ("These scissors ARE sharp", unless preceded by "A pair of scissors IS...").',
    keyTakeawaysEnglish: [
      'Every Passive verb requires a form of "be" + Past Participle V3 (was cleared, has been superseded, will be launched).',
      'Omit "by people / by someone" when the doer is obvious or unknown.',
      '"Scissors" is always plural and takes plural verbs ("are / were").',
    ],
    comparisonNotesEnglish: {
      'l9-syn-1':
        'Promotes the receiver of the action ("The entire bank debt") to the subject slot followed by "was cleared" (be + V3).',
      'l9-syn-2':
        'Uses Present Perfect Passive ("has been superseded") to highlight a recent policy change with present relevance.',
    },
    exerciseExplanationsEnglish: {
      'l9-cap-1':
        'Simple Past passive uses "was/were + V3": "A subpoena was issued...".',
      'l9-cap-2':
        '"Scissors" is plural ("are made"), and future passive uses "will be + V3" ("will be launched").',
      'l9-cap-3':
        'Accurately spells "exceeded" (-ceed), "procedure" (single "e"), and "superseded" (-sede) in passive voice.',
    },
  },
  'lecture-10-prefixes-reported-speech': {
    explanationEnglish:
      'When reporting what someone said using a past reporting verb ("said", "told", "asked"), English shifts the embedded verb one step back into the past (Tense Backshift):\n• Present Simple (am/is/work) → Past Simple (was/worked)\n• Present Perfect (have finished) / Past Simple → Past Perfect (had finished)\n• Will / Can → Would / Could\nCRITICAL USAGE RULES:\n1. "Say" vs. "Tell": "Told" MUST be followed immediately by a person object without "to" (✅ She told me that..., NEVER ❌ She told to me or ❌ She said me).\n2. Reported Questions: Use "asked + if/whether" (or a Wh-word) + Subject + Verb order (no "did" and no question mark!).',
    keyTakeawaysEnglish: [
      'Backshift tenses after past reporting verbs: will → would, is → was, have done → had done.',
      'Use "told + person" without "to" (She told us) or "said (that)" without a person object.',
      'Keep normal Subject + Verb statement order inside reported questions ("He asked where the file had disappeared").',
    ],
    comparisonNotesEnglish: {
      'l10-syn-1':
        'Because "told" is in the past tense, "will guarantee" shifts back to "would guarantee".',
      'l10-syn-2':
        'In a reported yes/no question, use "asked whether/if" + Subject ("the raspberry jam") + Past Verb ("was").',
    },
    exerciseExplanationsEnglish: {
      'l10-cap-1':
        'After past reporting verb "said", Present Perfect ("have finished") backshifts to Past Perfect ("had finished").',
      'l10-cap-2':
        '"Told" takes the indirect object "us" directly (no "to"), "unnecessary" has double "nn", and "will" shifts to "would".',
      'l10-cap-3':
        'Drop "did", keep Subject + Verb order ("where the file had disappeared"), and spell "disappeared" with a single "s".',
    },
  },
  'lecture-11-academic-ch-connectors': {
    explanationEnglish:
      'To express contrast in academic and professional writing, choose between "Although / Even though" and "Despite / In spite of" based on the grammatical structure that follows:\n1. Although / Even though / Though + FULL CLAUSE (Subject + Verb):\n• Example: "Although the landslide left heavy debris, the highway reopened."\n2. Despite / In spite of + NOUN PHRASE or GERUND (V-ing):\n• Example: "Despite the heavy debris, the highway reopened."\n• Watch Out: NEVER write "Despite of..." (either write "Despite..." or "In spite of..."), and NEVER add "but" in the second half of an "Although" sentence!',
    keyTakeawaysEnglish: [
      'Use "Although / Even though" before a Subject + Verb clause.',
      'Use "Despite / In spite of" before a Noun Phrase or "-ing" Gerund.',
      'Never write "Despite of", and never pair "Although" with "but" in the same sentence.',
    ],
    comparisonNotesEnglish: {
      'l11-syn-1':
        '"Although" introduces a complete clause with Subject ("the landslide") + Verb ("left"), and the main clause follows without "but".',
      'l11-syn-2':
        '"Despite" is followed directly by the noun phrase "the strict hierarchy" (without "of" and without a verb).',
    },
    exerciseExplanationsEnglish: {
      'l11-cap-1':
        '"The initial chaos at the venue" is a noun phrase with no verb, so it requires "Despite" (never "Despite of").',
      'l11-cap-2':
        'Do not use "but" in the main clause when the sentence already begins with "Although".',
      'l11-cap-3':
        'Uses "In spite of + being (V-ing)" and accurately spells "cautious" (-tious), "ambitious" (-tious), and "debris".',
    },
  },
  'lecture-12-diplomatic-french-inversion': {
    explanationEnglish:
      'In advanced (C1) formal writing and speeches, placing a negative or restrictive expression at the very beginning of a sentence triggers Negative Inversion—the auxiliary verb moves BEFORE the subject, just like in a question:\n• Formula: Negative Adverbial (Never / Rarely / Seldom / Not only / Under no circumstances) + Auxiliary Verb (have / had / did / should / will) + Subject + Main Verb.\n• Standard: "We have never witnessed such a phenomenon."\n• Inverted (C1 Emphatic): "Never HAVE WE witnessed such a phenomenon."\n• Past Simple with "Not only": "Not only DID THE PROPOSAL MEET all criteria, but it also..."',
    keyTakeawaysEnglish: [
      'Fronted negative expressions require Auxiliary + Subject + Verb inversion ("Never have I...", "Rarely has the nation...").',
      'If the original sentence is in the Simple Present or Simple Past without an auxiliary, insert "do / does / did" + Base Verb V1 ("Not only did she succeed...").',
      'Remember that "criteria", "phenomena", and "analyses" are plural and require plural determiners ("these criteria") and plural verbs.',
    ],
    comparisonNotesEnglish: {
      'l12-syn-1':
        'Placing "Never" at the start of the sentence inverts the subject and auxiliary from "we have" to "have we".',
      'l12-syn-2':
        'Starting with "Not only" in the past tense triggers "did + Subject (the liaison) + base verb V1 (resolve)".',
    },
    exerciseExplanationsEnglish: {
      'l12-cap-1':
        'Fronting "Rarely" inverts "the sovereign nation has" to "Rarely has the sovereign nation faced...".',
      'l12-cap-2':
        'In the Simple Past, "Not only" requires "did + Subject (the proposal) + Base Verb V1 (meet)".',
      'l12-cap-3':
        'Inverts "should these safety criteria be ignored" after "Under no circumstances" and uses the plural forms "criteria" and "analyses".',
    },
  },
};

