import { LlamaCpp } from '@runanywhere/llamacpp';
import runtimeManager from './runtime';

class PhonemeAnalyzerService {
  constructor() {
    this.llm = null;
    this.initialized = false;
    this.initializing = false;
  }

  async initialize() {
    if (this.initialized) return;

    if (this.initializing) {
      while (!this.initialized) {
        await new Promise(r => setTimeout(r, 50));
      }
      return;
    }

    this.initializing = true;
    try {
      // Initialize Runtime FIRST
      await runtimeManager.initialize();

      this.llm = new LlamaCpp({
        model: 'smollm-135m-instruct',
        temperature: 0.3,
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

  // ... rest stays the same (all the other methods)
}

export default new PhonemeAnalyzerService();
