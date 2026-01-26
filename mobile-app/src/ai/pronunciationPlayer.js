import { TextToSpeech } from '@runanywhere/onnx';
import { Audio } from 'expo-av';
import runtimeManager from './runtime';

class PronunciationPlayerService {
  constructor() {
    this.tts = null;
    this.initialized = false;
    this.initializing = false;
    this.currentSound = null;
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

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      this.tts = new TextToSpeech({
        voice: 'en-US-neural',
        speed: 0.85,
      });

      this.initialized = true;
      console.log('TTS initialized');
    } catch (error) {
      console.error('Failed to initialize TTS:', error);
      this.initializing = false;
      throw error;
    }
    this.initializing = false;
  }

  // ... rest stays the same
}

export default new PronunciationPlayerService();
