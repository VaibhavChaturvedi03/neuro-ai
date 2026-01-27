import { RunAnywhere } from "@runanywhere/core";
import { Audio } from "expo-av";
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
        });

        this.initialized = true;
        console.log("Speech recognition initialized");
    }

    async startRecording() {
        await this.initialize();

        try {
            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY,
            );
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

            // Use RunAnywhere.transcribeFile() directly
            const result = await RunAnywhere.transcribeFile(uri, {
                language: "en",
            });

            console.log("Transcription:", result.text);
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
