import { Audio } from "expo-av";
import Speech from "expo-speech";
import runtimeManager from "./runtime";

class PronunciationPlayerService {
    constructor() {
        this.initialized = false;
        this.currentSound = null;
    }

    async initialize() {
        if (this.initialized) return;

        await runtimeManager.initialize();

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
        });

        this.initialized = true;
        console.log("TTS initialized");
    }

    async playWord(word) {
        try {
            await this.initialize();

            // Use Expo Speech as TTS (RunAnywhere TTS setup not shown in docs)
            Speech.speak(word, {
                language: "en-US",
                pitch: 1.0,
                rate: 0.75,
            });

            console.log("Playing pronunciation:", word);
        } catch (error) {
            console.error("Failed to play pronunciation:", error);
        }
    }

    async cleanup() {
        if (this.currentSound) {
            try {
                await this.currentSound.stopAsync();
                await this.currentSound.unloadAsync();
                this.currentSound = null;
            } catch (error) {
                console.error("Error cleaning up sound:", error);
            }
        }
    }
}

export default new PronunciationPlayerService();
