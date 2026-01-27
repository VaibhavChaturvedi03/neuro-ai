import { RunAnywhere, SDKEnvironment } from "@runanywhere/core";

class RuntimeManager {
    constructor() {
        this.initialized = false;
        this.initializing = false;
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

            // Initialize RunAnywhere SDK
            await RunAnywhere.initialize({
                environment: SDKEnvironment.Development,
            });

            await new Promise((r) => setTimeout(r, 1000));
            this.initialized = true;
            console.log("RunAnywhere SDK initialized successfully");
        } catch (error) {
            console.error("Failed to initialize RunAnywhere SDK:", error);
            this.initializing = false;
            throw error;
        }
    }
}

export default new RuntimeManager();
