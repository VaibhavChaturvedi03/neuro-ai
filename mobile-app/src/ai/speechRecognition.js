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

        console.log('Initializing speech recognition service...');
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
            console.log('Preparing audio recording...');
            const recording = new Audio.Recording();
            
            // Configure to record as WAV (16kHz, mono) for Whisper compatibility
            const recordingOptions = {
                android: {
                    extension: '.wav',
                    outputFormat: Audio.AndroidOutputFormat.DEFAULT,
                    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.wav',
                    audioQuality: Audio.IOSAudioQuality.HIGH,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
                web: {
                    mimeType: 'audio/wav',
                    bitsPerSecond: 128000,
                },
            };

            await recording.prepareToRecordAsync(recordingOptions);
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
            await this.recording.stopAndUnloadAsync();
            const uri = this.recording.getURI();
            
            console.log("Audio URI:", uri);

            // Check if file exists
            const fileInfo = await FileSystem.getInfoAsync(uri);
            console.log("File info:", fileInfo);

            if (!fileInfo.exists) {
                throw new Error("Recording file does not exist");
            }

            if (fileInfo.size === 0) {
                throw new Error("Recording file is empty");
            }

            // Convert URI to proper path format
            let filePath = uri;
            if (Platform.OS === 'android') {
                // Android needs absolute path without file:// prefix
                filePath = uri.replace('file://', '');
            }

            console.log("Transcribing file:", filePath);
            console.log("File size:", fileInfo.size, "bytes");

            // Transcribe using RunAnywhere
            const result = await RunAnywhere.transcribeFile(filePath, {
                language: "en",
            });

            console.log("✅ Transcription result:", result.text);
            console.log("Confidence:", result.confidence);

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
                this.recording.stopAndUnloadAsync();
                this.recording = null;
                console.log('Recording cleaned up');
            } catch (error) {
                console.error("Error cleaning up recording:", error);
            }
        }
    }
}

export default new SpeechRecognitionService();
