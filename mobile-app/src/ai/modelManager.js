import { ModelManager } from '@runanywhere/core';

class AppModelManager {
  constructor() {
    this.manager = null;
    this.modelsReady = false;
this.initializing = false;
  }
  async ensureInitialized() {
    if (this.manager) return;

    if (this.initializing) {
      // wait until another caller finishes init
      while (!this.manager) {
        await new Promise(r => setTimeout(r, 50));
      }
      return;
    }
    this.initializing = true;
    this.manager = new ModelManager();
    this.initializing = false;
  }

  async initializeModels(onProgress) {
    await this.ensureInitialized();
    if (this.modelsReady) return;

    try {
      console.log('Downloading AI models...');

      // Download smallest models for optimal performance
      const models = [
        { name: 'whisper-tiny-en', size: '~75MB' },
        { name: 'smollm-135m-instruct', size: '~135MB' },
        { name: 'en-US-neural-tts', size: '~50MB' },
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

        await this.manager.download(model.name);
        console.log(`Downloaded: ${model.name}`);
      }

      this.modelsReady = true;
      console.log('All models ready!');
    } catch (error) {
      console.error('Failed to download models:', error);
      throw error;
    }
  }

  async checkModelsStatus() {
    // Check if models are already cached
    await this.ensureInitialized()
    const cached = await this.manager.listCached();
    return {
      whisper: cached.includes('whisper-tiny-en'),
      llm: cached.includes('smollm-135m-instruct'),
      tts: cached.includes('en-US-neural-tts'),
    };
  }

  async clearCache() {
    await this.ensureInitialized();
    await this.manager.clearCache();
    this.modelsReady = false;
  }
}

export default new AppModelManager();
