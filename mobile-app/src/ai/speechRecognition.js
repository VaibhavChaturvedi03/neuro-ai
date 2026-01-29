import { RunAnywhere } from "@runanywhere/core";
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system';
import runtimeManager from "./runtime";

class SpeechRecognitionService {
    constructor() {
        this.recording = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

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
        console.log("Speech recognition initialized");
    }

    async startRecording() {
        await this.initialize();

        try {
            const recording = new Audio.Recording();
            
            // Configure to record as WAV for Whisper compatibility
            await recording.prepareToRecordAsync({
                android: {
                    extension: '.wav',
                    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
                    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.wav',
                    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
            });

            await recording.startAsync();
            this.recording = recording;
            console.log("Recording started");
            return recording;
        } catch (error) {
            console.error("Failed to start recording:", error);
            throw error;
        }
    }

    async stopRecordingAndTranscribe() {
        if (!this.recording) {
            throw new Error("No active recording");
        }

        try {
            await this.recording.stopAndUnloadAsync();
            const uri = this.recording.getURI();
            console.log("Recording stopped, transcribing...");
            console.log("Audio URI:", uri);

            // Check if file exists
            const fileInfo = await FileSystem.getInfoAsync(uri);
            console.log("File info:", fileInfo);

            if (!fileInfo.exists) {
                throw new Error("Recording file does not exist");
            }

            // Transcribe using RunAnywhere
            const result = await RunAnywhere.transcribeFile(uri, {
                language: "en",
            });

            console.log("Transcription result:", result.text);
            console.log("Confidence:", result.confidence);

            this.recording = null;
            return result.text.toLowerCase().trim();
        } catch (error) {
            console.error("Failed to transcribe:", error);
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
                console.error("Error cleaning up recording:", error);
            }
        }
    }
}

export default new SpeechRecognitionService();
