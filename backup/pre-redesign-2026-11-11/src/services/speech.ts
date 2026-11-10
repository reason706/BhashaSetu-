// Web Speech API Service for Text-to-Speech (TTS) & Live Microphone Speech Recognition
import confetti from 'canvas-confetti';

export interface PronunciationResult {
  transcript: string;
  score: number;
  passed: boolean;
  feedbackEnglish: string;
  feedbackNepali: string;
  feedback?: string;
  wordDiagnostics?: { word: string; matched: boolean }[];
}

export interface DialogueCalibrationSettings {
  dialogueRate: number;
  speakerAPitch: number;
  speakerBPitch: number;
  turnPauseMs: number;
}

const DEFAULT_DIALOGUE_CALIBRATION: DialogueCalibrationSettings = {
  dialogueRate: 0.85,
  speakerAPitch: 0.93,
  speakerBPitch: 1.09,
  turnPauseMs: 380,
};

const DIALOGUE_CALIBRATION_STORAGE_KEY = 'bhashasetu_dialogue_calibration_v1';

class SpeechService {
  private synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (this.synth) {
      this.loadVoices();
      if (typeof this.synth.onvoiceschanged !== 'undefined') {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private preferredVoiceURI: string | null =
    typeof window !== 'undefined' ? window.localStorage.getItem('bhashasetu_preferred_voice_uri') : null;

  public getDialogueCalibration(): DialogueCalibrationSettings {
    if (typeof window === 'undefined') return DEFAULT_DIALOGUE_CALIBRATION;
    try {
      const raw = window.localStorage.getItem(DIALOGUE_CALIBRATION_STORAGE_KEY);
      if (!raw) return DEFAULT_DIALOGUE_CALIBRATION;
      const parsed = JSON.parse(raw) as Partial<DialogueCalibrationSettings>;
      const validRate: number =
        typeof parsed.dialogueRate === 'number' && !Number.isNaN(parsed.dialogueRate)
          ? Math.max(0.5, Math.min(1.25, Number(parsed.dialogueRate.toFixed(2))))
          : DEFAULT_DIALOGUE_CALIBRATION.dialogueRate;
      return {
        dialogueRate: validRate,
        speakerAPitch:
          typeof parsed.speakerAPitch === 'number'
            ? Math.max(0.6, Math.min(1.4, parsed.speakerAPitch))
            : DEFAULT_DIALOGUE_CALIBRATION.speakerAPitch,
        speakerBPitch:
          typeof parsed.speakerBPitch === 'number'
            ? Math.max(0.6, Math.min(1.4, parsed.speakerBPitch))
            : DEFAULT_DIALOGUE_CALIBRATION.speakerBPitch,
        turnPauseMs:
          typeof parsed.turnPauseMs === 'number'
            ? Math.max(150, Math.min(1000, parsed.turnPauseMs))
            : DEFAULT_DIALOGUE_CALIBRATION.turnPauseMs,
      };
    } catch {
      return DEFAULT_DIALOGUE_CALIBRATION;
    }
  }

  public setDialogueCalibration(next: Partial<DialogueCalibrationSettings>): DialogueCalibrationSettings {
    const updated: DialogueCalibrationSettings = {
      ...this.getDialogueCalibration(),
      ...next,
    };
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(DIALOGUE_CALIBRATION_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage quota issues
      }
    }
    return updated;
  }

  public saveDialogueCalibration(next: Partial<DialogueCalibrationSettings>): DialogueCalibrationSettings {
    return this.setDialogueCalibration(next);
  }

  public speakWord(word: string, options?: number | { rate?: number; pitch?: number }): void {
    this.speak(word, options);
  }

  public speakSentence(sentence: string, options?: number | { rate?: number; pitch?: number }): void {
    this.speak(sentence, options);
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getAvailableEnglishVoices(): SpeechSynthesisVoice[] {
    if (!this.voices.length && this.synth) {
      this.voices = this.synth.getVoices();
    }
    return this.voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  }

  public getPreferredVoiceURI(): string | null {
    return this.preferredVoiceURI;
  }

  public setPreferredVoiceURI(voiceURI: string | null): void {
    this.preferredVoiceURI = voiceURI;
    if (typeof window !== 'undefined') {
      if (voiceURI) {
        window.localStorage.setItem('bhashasetu_preferred_voice_uri', voiceURI);
      } else {
        window.localStorage.removeItem('bhashasetu_preferred_voice_uri');
      }
    }
  }

  private getBestEnglishVoice(speakerIndex?: 0 | 1): SpeechSynthesisVoice | null {
    const englishVoices = this.getAvailableEnglishVoices();
    if (!englishVoices.length) return null;

    if (this.preferredVoiceURI) {
      const userChosen = englishVoices.find((v) => v.voiceURI === this.preferredVoiceURI);
      if (userChosen) {
        if (speakerIndex === 1 && englishVoices.length > 1) {
          const alternate =
            englishVoices.find(
              (v) =>
                v.voiceURI !== userChosen.voiceURI &&
                (v.name.includes('Natural') ||
                  v.name.includes('Google') ||
                  v.name.includes('Samantha') ||
                  v.name.includes('Victoria') ||
                  v.name.includes('Karen') ||
                  v.name.includes('Zira'))
            ) || englishVoices.find((v) => v.voiceURI !== userChosen.voiceURI);
          return alternate || userChosen;
        }
        return userChosen;
      }
    }

    const primaryVoice =
      englishVoices.find(
        (v) =>
          (v.lang === 'en-US' || v.lang === 'en-GB') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Daniel') ||
            v.name.includes('David') ||
            v.name.includes('Alex'))
      ) ||
      englishVoices.find(
        (v) =>
          (v.lang === 'en-US' || v.lang === 'en-GB') &&
          (v.name.includes('Samantha') || v.name.includes('Google'))
      ) ||
      englishVoices[0];

    if (speakerIndex === 1 && englishVoices.length > 1) {
      const partnerVoice =
        englishVoices.find(
          (v) =>
            v.voiceURI !== primaryVoice.voiceURI &&
            (v.name.includes('Samantha') ||
              v.name.includes('Google UK English Female') ||
              v.name.includes('Google US English') ||
              v.name.includes('Victoria') ||
              v.name.includes('Zira') ||
              v.name.includes('Natural'))
        ) || englishVoices.find((v) => v.voiceURI !== primaryVoice.voiceURI);
      if (partnerVoice) return partnerVoice;
    }

    return primaryVoice;
  }

  public isTTSSupported(): boolean {
    return !!this.synth;
  }

  private hapticEnabled: boolean =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('bhashasetu_haptic_enabled_v1') !== 'false'
      : true;

  public getHapticFeedbackEnabled(): boolean {
    return this.hapticEnabled;
  }

  public setHapticFeedbackEnabled(enabled: boolean): void {
    this.hapticEnabled = enabled;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('bhashasetu_haptic_enabled_v1', enabled ? 'true' : 'false');
      } catch {
        // Ignore storage errors
      }
    }
    if (enabled) {
      this.triggerHaptic('light');
    }
  }

  /**
   * Triggers device vibration / haptic pulse when enabled in Settings.
   */
  public triggerHaptic(type: 'light' | 'success' | 'error' | 'celebration' = 'light'): void {
    if (!this.hapticEnabled || typeof window === 'undefined') return;
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        if (type === 'light') {
          navigator.vibrate(10);
        } else if (type === 'success') {
          navigator.vibrate([15, 35, 25]);
        } else if (type === 'error') {
          navigator.vibrate([40, 45, 40]);
        } else if (type === 'celebration') {
          navigator.vibrate([20, 40, 20, 40, 55]);
        }
      }
    } catch {
      // Ignore if vibration API is blocked
    }
  }

  /**
   * Launches a celebratory canvas-confetti burst in BhashaSetu brand colors
   * when unlocking achievements or completing course track milestones.
   */
  public triggerConfetti(mode: 'achievement' | 'milestone' = 'achievement'): void {
    if (typeof window === 'undefined') return;
    try {
      const brandColors = ['#9E2A2B', '#2E6F4E', '#D97706', '#1F5C3D', '#E5DEC9'];
      if (mode === 'milestone') {
        confetti({
          particleCount: 95,
          spread: 80,
          origin: { x: 0.25, y: 0.62 },
          colors: brandColors,
          disableForReducedMotion: true,
        });
        window.setTimeout(() => {
          confetti({
            particleCount: 95,
            spread: 80,
            origin: { x: 0.75, y: 0.62 },
            colors: brandColors,
            disableForReducedMotion: true,
          });
        }, 180);
      } else {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.65 },
          colors: brandColors,
          disableForReducedMotion: true,
        });
      }
    } catch {
      // Ignore if canvas-confetti cannot run in current context
    }
  }

  public playCelebrationChime(mode: 'achievement' | 'milestone' = 'achievement'): void {
    this.triggerHaptic('celebration');
    this.triggerConfetti(mode);
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.3);
      });
    } catch {
      // Ignore if AudioContext is blocked
    }
  }

  /**
   * Pleasant ascending two-note chime when a user answers a question or drill correctly.
   */
  public playCorrectTone(): void {
    this.triggerHaptic('success');
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [587.33, 880.0]; // D5 -> A5 crisp fifth
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const startTime = ctx.currentTime + idx * 0.075;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.09, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.24);
      });
    } catch {
      // Ignore if AudioContext is blocked
    }
  }

  /**
   * Gentle descending two-note tone when a user selects an incorrect answer.
   */
  public playWrongTone(): void {
    this.triggerHaptic('error');
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [311.13, 233.08]; // D#4 -> A#3 soft low alert
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const startTime = ctx.currentTime + idx * 0.095;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.085, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.24);
      });
    } catch {
      // Ignore if AudioContext is blocked
    }
  }

  public speak(
    text: string,
    options?:
      | number
      | {
          rate?: number;
          pitch?: number;
          speakerIndex?: 0 | 1;
          useDialogueCalibrationRate?: boolean;
          onStart?: () => void;
          onEnd?: () => void;
        }
  ): void {
    const opts = typeof options === 'number' ? { rate: options } : options;
    if (!this.synth) {
      opts?.onEnd?.();
      return;
    }

    this.synth.cancel();

    const calibration = this.getDialogueCalibration();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.getBestEnglishVoice(opts?.speakerIndex);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = voice?.lang || 'en-US';

    const baseRate = opts?.useDialogueCalibrationRate
      ? calibration.dialogueRate
      : opts?.rate ?? calibration.dialogueRate ?? 0.95;

    if (opts?.speakerIndex === 0) {
      utterance.rate = Math.max(0.45, Math.min(1.3, baseRate));
      utterance.pitch = opts?.pitch ?? calibration.speakerAPitch;
    } else if (opts?.speakerIndex === 1) {
      utterance.rate = Math.max(0.45, Math.min(1.3, baseRate));
      utterance.pitch = opts?.pitch ?? calibration.speakerBPitch;
    } else {
      utterance.rate = Math.max(0.45, Math.min(1.3, baseRate));
      utterance.pitch = opts?.pitch ?? calibration.speakerAPitch ?? 1.0;
    }

    utterance.onstart = () => {
      opts?.onStart?.();
    };
    utterance.onend = () => {
      opts?.onEnd?.();
    };
    utterance.onerror = () => {
      opts?.onEnd?.();
    };

    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  public evaluateTextSimilarity(targetText: string, spokenTranscript: string): PronunciationResult {
    const cleanTarget = targetText.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    const cleanSpoken = spokenTranscript.toLowerCase().replace(/[^a-z\s]/g, '').trim();

    const targetTokens = cleanTarget.split(/\s+/).filter(Boolean);
    const spokenTokens = cleanSpoken.split(/\s+/).filter(Boolean);

    const wordDiagnostics = targetTokens.map((tWord) => {
      const matched = spokenTokens.some((sWord) => calculateSimilarity(tWord, sWord) >= 0.78);
      return { word: tWord, matched };
    });

    const sim = calculateSimilarity(
      cleanTarget.replace(/\s+/g, ''),
      cleanSpoken.replace(/\s+/g, '')
    );
    const scorePercent = Math.round(sim * 100);
    const passed = scorePercent >= 75;

    if (scorePercent >= 92) {
      return {
        transcript: spokenTranscript,
        score: scorePercent,
        passed: true,
        feedbackEnglish: `Excellent articulation! Your phoneme clarity and rhythm matched "${targetText}" accurately.`,
        feedbackNepali: `अत्यन्तै स्पष्ट उच्चारण! तपाईंको आवाज र लय "${targetText}" सँग ठ्याक्कै मिल्यो।`,
        wordDiagnostics,
      };
    }
    if (passed) {
      return {
        transcript: spokenTranscript,
        score: scorePercent,
        passed: true,
        feedbackEnglish: `Good pronunciation ("${spokenTranscript}"). Focus on crisp vowel length and stressed syllables for 100% clarity.`,
        feedbackNepali: `राम्रो प्रयास ("${spokenTranscript}")! १००% स्पष्टताका लागि जोड दिइने अक्षर (stressed syllable) मा अझ ध्यान दिनुहोस्।`,
        wordDiagnostics,
      };
    }
    return {
      transcript: spokenTranscript,
      score: scorePercent,
      passed: false,
      feedbackEnglish: `Heard "${spokenTranscript || 'unclear audio'}". Listen at 0.5x or 0.75x speed first and avoid pronouncing silent letters.`,
      feedbackNepali: `तपाईंको आवाज "${spokenTranscript || 'अस्पष्ट'}" सुनियो। पहिले ०.५x वा ०.७५x गतिमा ध्यानपूर्वक सुन्नुहोस् र मौन अक्षर (silent letters) उच्चारण नगर्नुहोस्।`,
      wordDiagnostics,
    };
  }

  public evaluatePronunciation(
    targetWord: string,
    onListeningChange?: (listening: boolean) => void
  ): Promise<PronunciationResult> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Browser environment required.'));
        return;
      }

      const win = window as unknown as {
        SpeechRecognition?: new () => any;
        webkitSpeechRecognition?: new () => any;
      };
      const RecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (!RecognitionConstructor) {
        reject(new Error('Speech recognition is not supported in this browser. Try Chrome or Edge.'));
        return;
      }

      const recognition = new RecognitionConstructor();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      let settled = false;

      recognition.onstart = () => {
        onListeningChange?.(true);
      };

      recognition.onend = () => {
        onListeningChange?.(false);
        if (!settled) {
          settled = true;
          resolve({
            transcript: '',
            score: 0,
            passed: false,
            feedbackEnglish: 'No speech detected. Please tap the microphone and speak clearly.',
            feedbackNepali: 'आवाज सुनिएन। कृपया माइक्रोफोन थिचेर स्पष्टसँग शब्द उच्चारण गर्नुहोस्।',
          });
        }
      };

      recognition.onerror = (event: { error?: string }) => {
        onListeningChange?.(false);
        if (!settled) {
          settled = true;
          const errCode = event?.error || 'unknown';
          if (errCode === 'not-allowed') {
            reject(new Error('Microphone permission was denied. Please allow microphone access in your browser.'));
          } else {
            resolve({
              transcript: '',
              score: 0,
              passed: false,
              feedbackEnglish: 'Could not capture audio clearly. Please try again.',
              feedbackNepali: 'आवाज स्पष्ट रूपमा टिप्न सकिएन। कृपया फेरि प्रयास गर्नुहोस्।',
            });
          }
        }
      };

      recognition.onresult = (event: any) => {
        if (settled) return;
        settled = true;
        onListeningChange?.(false);

        const cleanTarget = targetWord.toLowerCase().replace(/[^a-z]/g, '');
        const alternatives: string[] = [];

        if (event.results && event.results[0]) {
          for (let i = 0; i < event.results[0].length; i++) {
            alternatives.push(String(event.results[0][i].transcript || '').trim());
          }
        }

        const primaryTranscript = alternatives[0] || '';
        let bestScore = -1;
        let matchedTranscript = primaryTranscript;

        for (const alt of alternatives) {
          const cleanAlt = alt.toLowerCase().replace(/[^a-z]/g, '');
          const sim = calculateSimilarity(cleanTarget, cleanAlt);
          if (sim > bestScore) {
            bestScore = sim;
            matchedTranscript = alt;
          }
        }

        resolve(this.evaluateTextSimilarity(targetWord, matchedTranscript));
      };

      try {
        recognition.start();
      } catch (e) {
        onListeningChange?.(false);
        reject(e);
      }
    });
  }

  public listenAndEvaluate(
    targetWord: string,
    callback: (result: PronunciationResult) => void,
    onListeningChange?: (listening: boolean) => void
  ): Promise<PronunciationResult> {
    return this.evaluatePronunciation(targetWord, onListeningChange).then((res) => {
      callback(res);
      return res;
    });
  }
}

function calculateSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (b.includes(a) || a.includes(b)) return 0.9;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLen = Math.max(a.length, b.length);
  return Math.max(0, (maxLen - distance) / maxLen);
}

export const speechService = new SpeechService();
