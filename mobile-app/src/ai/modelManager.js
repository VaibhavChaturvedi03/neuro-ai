import { ModelCategory, RunAnywhere } from "@runanywhere/core";
import { LlamaCPP } from "@runanywhere/llamacpp";
import { ModelArtifactType, ONNX } from "@runanywhere/onnx";
import runtimeManager from "./runtime";

class AppModelManager {
    constructor() {
        this.modelsReady = false;
        this.modelsAdded = false;
        this.initializing = false;
    }

    async addModels() {
        if (this.modelsAdded) return;

        await runtimeManager.initialize();

        try {
            console.log("Adding models...");

            // Add LLM model
            await LlamaCPP.addModel({
                id: "smollm-135m-instruct",
                name: "SmolLM 135M Instruct",
                url: "https://huggingface.co/prithivMLmods/SmolLM2-135M-Instruct-GGUF/resolve/main/smollm2-135m-instruct-q8_0.gguf",
                memoryRequirement: 150_000_000,
            });

            // Add Whisper STT model
            await ONNX.addModel({
                id: "whisper-tiny-en",
                name: "Whisper Tiny English",
                url: "https://github.com/RunanywhereAI/sherpa-onnx/releases/download/runanywhere-models-v1/sherpa-onnx-whisper-tiny.en.tar.gz",
                modality: ModelCategory.SpeechRecognition,
                artifactType: ModelArtifactType.TarGzArchive,
                memoryRequirement: 75_000_000,
            });

            // Add TTS model (if available)
            // await ONNX.addModel({
            //   id: 'en-US-neural-tts',
            //   name: 'English Neural TTS',
            //   url: 'https://...',
            //   modality: ModelCategory.TextToSpeech,
            //   memoryRequirement: 50_000_000,
            // });

            this.modelsAdded = true;
            console.log("Models added successfully");
        } catch (error) {
            console.error("Failed to add models:", error);
            throw error;
        }
    }

    async initializeModels(onProgress) {
        await this.addModels();

        if (this.modelsReady) return;

        if (this.initializing) {
            while (!this.modelsReady) {
                await new Promise((r) => setTimeout(r, 50));
            }
            return;
        }

        this.initializing = true;
        try {
            console.log("Downloading AI models...");

            const models = [
                { id: "whisper-tiny-en", name: "Whisper Tiny", size: "~75MB" },
                {
                    id: "smollm-135m-instruct",
                    name: "SmolLM 135M",
                    size: "~135MB",
                },
            ];

            for (let i = 0; i < models.length; i++) {
                const model = models[i];

                if (onProgress) {
                    onProgress({
                        current: i + 1,
                        total: models.length,
                        modelName: model.name,
                        size: model.size,
                    });
                }

                // Download model with progress callback
                await RunAnywhere.downloadModel(model.id, (progress) => {
                    if (progress.state === "downloading") {
                        const percent = (progress.progress * 100).toFixed(1);
                        console.log(`Downloading ${model.name}: ${percent}%`);
                    }
                });

                console.log(`Downloaded: ${model.name}`);

                // Load model into memory
                const modelInfo = await RunAnywhere.getModelInfo(model.id);
                if (modelInfo?.localPath) {
                    if (model.id === "whisper-tiny-en") {
                        await RunAnywhere.loadSTTModel(
                            modelInfo.localPath,
                            "whisper",
                        );
                    } else if (model.id === "smollm-135m-instruct") {
                        await RunAnywhere.loadModel(modelInfo.localPath);
                    }
                    console.log(`Loaded: ${model.name}`);
                }
            }

            this.modelsReady = true;
            console.log("All models ready!");
        } catch (error) {
            console.error("Failed to download models:", error);
            this.initializing = false;
            throw error;
        }
    }

    async checkModelsStatus() {
        await runtimeManager.initialize();
        await this.addModels();

        try {
            const whisperInfo =
                await RunAnywhere.getModelInfo("whisper-tiny-en");
            const llmInfo = await RunAnywhere.getModelInfo(
                "smollm-135m-instruct",
            );

            return {
                whisper: !!whisperInfo?.localPath,
                llm: !!llmInfo?.localPath,
                tts: false,
            };
        } catch (error) {
            console.error("Failed to check model status:", error);
            return {
                whisper: false,
                llm: false,
                tts: false,
            };
        }
    }

    async ensureModelsLoaded() {
        try {
            await runtimeManager.initialize();
            await this.addModels();

            console.log('Loading cached models into memory...');

            const whisperInfo = await RunAnywhere.getModelInfo("whisper-tiny-en");
            const llmInfo = await RunAnywhere.getModelInfo("smollm-135m-instruct");

            if (whisperInfo?.localPath) {
                await RunAnywhere.loadSTTModel(whisperInfo.localPath, "whisper");
                console.log('Whisper model loaded');
            }

            if (llmInfo?.localPath) {
                await RunAnywhere.loadModel(llmInfo.localPath);
                console.log('LLM model loaded');
            }

            this.modelsReady = true;
            console.log('All cached models loaded successfully');
        } catch (error) {
            console.error('Failed to load cached models:', error);
            throw error;
        }
    }

    async clearCache() {
        // RunAnywhere doesn't expose clearCache in the docs
        // Models are managed through getModelInfo/downloadModel
        this.modelsReady = false;
        console.log("Cache cleared");
    }
}

export default new AppModelManager();
