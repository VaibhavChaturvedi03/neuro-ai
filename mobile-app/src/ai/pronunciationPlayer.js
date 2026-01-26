import { TextToSpeech } from '@runanywhere/onnx';
import { Audio } from 'expo-av';
import Speech from 'expo-speech';

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
      // Wait until another caller finishes init
      while (!this.initialized) {
        await new Promise(r => setTimeout(r, 50));
      }
      return;
    }

    this.initializing = true;
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      this.tts = new TextToSpeech({
        voice: 'en-US-neural', // Clear American English
        speed: 0.85, // Slightly slower for clarity
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

  async playWord(word) {
    try {
      await this.initialize();

      // Stop any currently playing sound
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
      }

      // Generate speech
      const audioData = await this.tts.speak(word);

      // Convert to playable format
      const { sound } = await Audio.Sound.createAsync(
        { uri: this.arrayBufferToBase64(audioData) },
        { shouldPlay: true }
      );

      this.currentSound = sound;

      // Cleanup after playback
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          this.currentSound = null;
        }
      });

      console.log('Playing pronunciation:', word);
    } catch (error) {
      console.error('Failed to play pronunciation:', error);
      // Fallback: use device TTS if available
      this.playWithDeviceTTS(word);
    }
  }

  playWithDeviceTTS(word) {
    // Fallback to Expo Speech API
    try {
      Speech.speak(word, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.75,
      });
      console.log('Playing with fallback TTS:', word);
    } catch (error) {
      console.error('Fallback TTS also failed:', error);
    }
  }

  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return `data:audio/wav;base64,${btoa(binary)}`;
  }

  async cleanup() {
    if (this.currentSound) {
      try {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      } catch (error) {
        console.error('Error cleaning up sound:', error);
      }
    }
  }
}

export default new PronunciationPlayerService();
