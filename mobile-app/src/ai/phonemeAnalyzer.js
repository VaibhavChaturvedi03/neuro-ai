import { LlamaCpp } from '@runanywhere/llamacpp';

class PhonemeAnalyzerService {
  constructor() {
    this.llm = null;
    this.initialized = false;
    this.initializing = false;
  }

  async initialize() {
    if (this.initialized) return;

    if (this.initializing) {
      // Wait until another caller finishes init
      while (!this.initialized) {
        await new Promise(r => setTimeout(r, 50));
      }
      return;
    }

    this.initializing = true;
    try {
      // Use smallest model for real-time analysis
      this.llm = new LlamaCpp({
        model: 'smollm-135m-instruct', // ~135MB, very fast
        temperature: 0.3, // Low temperature for consistent analysis
        maxTokens: 150,
      });

      this.initialized = true;
      console.log('Phoneme analyzer initialized');
    } catch (error) {
      console.error('Failed to initialize phoneme analyzer:', error);
      this.initializing = false;
      throw error;
    }
    this.initializing = false;
  }

  // Simple phoneme comparison without LLM (faster, no model needed)
  calculateSimpleAccuracy(transcription, expectedWord) {
    if (!transcription || !expectedWord) return 0;

    const trans = transcription.toLowerCase().trim();
    const expected = expectedWord.toLowerCase().trim();

    // Exact match
    if (trans === expected) return 100;

    // Levenshtein distance based accuracy
    const distance = this.levenshteinDistance(trans, expected);
    const maxLen = Math.max(trans.length, expected.length);
    const accuracy = Math.max(0, ((maxLen - distance) / maxLen) * 100);

    return Math.round(accuracy);
  }

  // Advanced phoneme analysis using LLM
  async analyzePhonemes(transcription, expectedWord, targetPhonemes) {
    try {
      await this.initialize();

      const prompt = `You are a speech therapist analyzing a child's pronunciation.

Expected word: "${expectedWord}"
What they said: "${transcription}"
Target phonemes to evaluate: ${targetPhonemes.join(', ')}

Provide:
1. Accuracy percentage (0-100)
2. Specific phoneme errors detected
3. One simple tip for improvement

Keep response under 50 words, child-friendly.`;

      const response = await this.llm.generate(prompt);

      // Parse response
      const accuracyMatch = response.match(/(\d+)%/);
      const accuracy = accuracyMatch ? parseInt(accuracyMatch[1]) :
                      this.calculateSimpleAccuracy(transcription, expectedWord);

      return {
        accuracy,
        transcription,
        expectedWord,
        feedback: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('LLM analysis failed, using simple comparison:', error);

      // Fallback to simple analysis
      return {
        accuracy: this.calculateSimpleAccuracy(transcription, expectedWord),
        transcription,
        expectedWord,
        feedback: this.generateSimpleFeedback(transcription, expectedWord),
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Fallback feedback without LLM
  generateSimpleFeedback(transcription, expectedWord) {
    const accuracy = this.calculateSimpleAccuracy(transcription, expectedWord);

    if (accuracy >= 90) {
      return `Excellent! You pronounced "${expectedWord}" very clearly. Keep it up! 🎉`;
    } else if (accuracy >= 70) {
      return `Good try! "${transcription}" is close to "${expectedWord}". Practice the sound more slowly. 👍`;
    } else if (accuracy >= 50) {
      return `You're getting there! Try breaking "${expectedWord}" into syllables and say each part slowly. 💪`;
    } else {
      return `Let's practice "${expectedWord}" together. Listen carefully and repeat after the example. 🎯`;
    }
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
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

    return matrix[str2.length][str1.length];
  }
}

export default new PhonemeAnalyzerService();
