import { SpeechToText } from '@runanywhere/onnx';
import { Audio } from 'expo-av';

class SpeechRecognitionService {
  constructor() {
    this.stt = null;
    this.recording = null;
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
      // Request microphone permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission not granted');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Initialize Whisper model (smallest for mobile)
      this.stt = new SpeechToText({
        model: 'whisper-tiny-en', // ~75MB, fastest
        language: 'en',
      });

      this.initialized = true;
      console.log('Speech recognition initialized');
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      this.initializing = false;
      throw error;
    }
    this.initializing = false;
  }

  async startRecording() {
    await this.initialize();

    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();

      this.recording = recording;
      console.log('Recording started');
      return recording;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecordingAndTranscribe() {
    if (!this.recording) {
      throw new Error('No active recording');
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      console.log('Recording stopped, transcribing...');

      // Convert audio file to format Whisper expects
      const audioBuffer = await this.loadAudioFile(uri);

      // Transcribe using Whisper
      const transcription = await this.stt.transcribe(audioBuffer);

      console.log('Transcription:', transcription.text);

      this.recording = null;
      return transcription.text.toLowerCase().trim();
    } catch (error) {
      console.error('Failed to transcribe:', error);
      this.recording = null;
      throw error;
    }
  }

  async loadAudioFile(uri) {
    try {
      // Load audio file as ArrayBuffer
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.error('Failed to load audio file:', error);
      throw error;
    }
  }

  cleanup() {
    if (this.recording) {
      try {
        this.recording.stopAndUnloadAsync();
        this.recording = null;
      } catch (error) {
        console.error('Error cleaning up recording:', error);
      }
    }
  }
}

export default new SpeechRecognitionService();
