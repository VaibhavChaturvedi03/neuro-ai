import { RunAnywhere } from "@runanywhere/core";
import { 
  AudioRecorder,
  AndroidAudioEncoder,
  AndroidOutputFormat,
  IOSAudioQuality,
  IOSOutputFormat,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import runtimeManager from "./runtime";

class SpeechRecognitionService {
    constructor() {
        this.recording = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        console.log('Initializing speech recognition service...');
        await runtimeManager.initialize();

        this.initialized = true;
        console.log("✅ Speech recognition initialized");
    }

    async startRecording() {
        await this.initialize();

        try {
            console.log('Starting recording with expo-audio...');
            
            // Request permissions
            const { granted } = await AudioRecorder.requestPermissionsAsync();
            if (!granted) {
                throw new Error('Microphone permission not granted');
            }

            // Create recorder with high quality settings
            const recording = new AudioRecorder({
                android: {
                    extension: '.wav',
                    outputFormat: AndroidOutputFormat.DEFAULT,
                    audioEncoder: AndroidAudioEncoder.DEFAULT,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.wav',
                    audioQuality: IOSAudioQuality.HIGH,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 128000,
                },
            });

            await recording.prepareAsync();
            await recording.startAsync();
            
            this.recording = recording;
            console.log("✅ Recording started successfully");
            return recording;
        } catch (error) {
            console.error("❌ Failed to start recording:", error);
            throw error;
        }
    }

    async stopRecordingAndTranscribe() {
        if (!this.recording) {
            throw new Error("No active recording");
        }

        try {
            console.log('Stopping recording...');
            
            await this.recording.stopAsync();
            const uri = await this.recording.getURI();
            
            console.log("Audio URI:", uri);

            // Check if file exists
            const fileInfo = await FileSystem.getInfoAsync(uri);
            console.log("File info:", fileInfo);

            if (!fileInfo.exists) {
                throw new Error("Recording file does not exist");
            }

            if (fileInfo.size === 0 || fileInfo.size < 1000) {
                throw new Error("Recording file is too small or empty");
            }

            console.log("Transcribing file:", uri);
            console.log("File size:", fileInfo.size, "bytes");

            // Transcribe using RunAnywhere
            const result = await RunAnywhere.transcribeFile(uri, {
                language: "en",
            });

            console.log("✅ Transcription result:", result.text);
            console.log("Confidence:", result.confidence || 'N/A');

            this.recording = null;
            
            const cleanedText = result.text.toLowerCase().trim();
            return cleanedText;
        } catch (error) {
            console.error("❌ Failed to transcribe:", error);
            console.error("Error type:", error.constructor.name);
            console.error("Error message:", error.message);
            this.recording = null;
            throw error;
        }
    }

    cleanup() {
        if (this.recording) {
            try {
                this.recording.stopAsync();
                this.recording = null;
                console.log('Recording cleaned up');
            } catch (error) {
                console.error("Error cleaning up recording:", error);
            }
        }
    }
}



export default new SpeechRecognitionService();
