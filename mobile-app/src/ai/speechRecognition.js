import { RunAnywhere } from "@runanywhere/core";
import { Audio } from "expo-av";
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

        console.log('Initializing speech recognition...');
        await runtimeManager.initialize();

        const { status } = await Audio.requestPermissionsAsync();
        if (status !== "granted") {
            throw new Error("Microphone permission not granted");
        }

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
        });

        this.initialized = true;
        console.log("✅ Speech recognition initialized");
    }

    async startRecording() {
        await this.initialize();

        try {
            const recording = new Audio.Recording();
            
            // Use HIGH_QUALITY preset - simpler and more reliable
            await recording.prepareToRecordAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            
            await recording.startAsync();
            this.recording = recording;
            console.log("✅ Recording started");
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
            await this.recording.stopAndUnloadAsync();
            const uri = this.recording.getURI();

            console.log("Recording URI:", uri);

            // Convert URI to absolute path for Android
            let audioPath = uri;
            if (Platform.OS === 'android') {
                // Remove file:// prefix for Android
                audioPath = uri.replace('file://', '');
            }

            console.log("Audio path for transcription:", audioPath);

            // Transcribe using RunAnywhere with simple options
            const result = await RunAnywhere.transcribeFile(audioPath, {
                language: 'en',
            });

            console.log("✅ Transcription:", result.text);
            console.log("Confidence:", result.confidence);
            console.log("Duration:", result.duration, "seconds");

            this.recording = null;
            return result.text.toLowerCase().trim();
        } catch (error) {
            console.error("❌ Transcription failed:", error);
            console.error("Error details:", error.message);
            this.recording = null;
            throw error;
        }
    }

    cleanup() {
        if (this.recording) {
            try {
                this.recording.stopAndUnloadAsync();
                this.recording = null;
            } catch (error) {
                console.error("Error cleaning up:", error);
            }
        }
    }
}



export default new SpeechRecognitionService();
