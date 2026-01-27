import { RunAnywhere, SDKEnvironment } from "@runanywhere/core";
import { LlamaCPP } from "@runanywhere/llamacpp";
import { ONNX } from "@runanywhere/onnx";

class RuntimeManager {
    constructor() {
        this.initialized = false;
        this.initializing = false;
        this.backendsReady = false;
    }

    async initialize() {
        if (this.initialized) return;

        if (this.initializing) {
            while (!this.initialized) {
                await new Promise((r) => setTimeout(r, 50));
            }
            return;
        }

        this.initializing = true;
        try {
            console.log("Initializing RunAnywhere SDK...");

            // 1. Initialize SDK
            await RunAnywhere.initialize({
                environment: SDKEnvironment.Development,
            });

            // 2. Register backends
            await LlamaCPP.register();
            await ONNX.register();

            // 3. Verify backends are ready
            await this.verifyBackends();

            this.backendsReady = true;
            console.log("Backends registered successfully");

            this.initialized = true;
            console.log("RunAnywhere SDK initialized successfully");
        } catch (error) {
            console.error("Failed to initialize RunAnywhere SDK:", error);
            this.initializing = false;
            this.initialized = false;
            this.backendsReady = false;
            throw error;
        }
    }

    async verifyBackends() {
        // Give backends time to register
        await new Promise((r) => setTimeout(r, 500));
        
        // Verify RunAnywhere has required methods
        if (typeof RunAnywhere.generate !== 'function') {
            throw new Error('LlamaCPP backend not properly registered - generate() not available');
        }
        
        if (typeof RunAnywhere.transcribeFile !== 'function') {
            throw new Error('ONNX backend not properly registered - transcribeFile() not available');
        }
        
        console.log('Backend verification passed');
    }

    isReady() {
        return this.initialized && this.backendsReady;
    }
}

export default new RuntimeManager();
