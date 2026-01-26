import { ModelManager } from '@runanywhere/core';
import runtimeManager from './runtime';

class AppModelManager {
  constructor() {
    this.manager = null;
    this.modelsReady = false;
    this.initializing = false;
  }

  async ensureInitialized() {
    if (this.manager) return;

    if (this.initializing) {
      while (!this.manager) {
        await new Promise(r => setTimeout(r, 50));
      }
      return;
    }

    this.initializing = true;
    try {
      // Initialize Runtime FIRST
      await runtimeManager.initialize();

      // Now create ModelManager
      this.manager = new ModelManager();
      console.log('ModelManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ModelManager:', error);
      this.initializing = false;
      throw error;
    }
    this.initializing = false;
  }

  async initializeModels(onProgress) {
    await this.ensureInitialized();
    if (this.modelsReady) return;

    try {
      console.log('Downloading AI models...');

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
    await this.ensureInitialized();

    try {
      const cached = await this.manager.listCached();
      return {
        whisper: cached.includes('whisper-tiny-en'),
        llm: cached.includes('smollm-135m-instruct'),
        tts: cached.includes('en-US-neural-tts'),
      };
    } catch (error) {
      console.error('Failed to check model status:', error);
      return {
        whisper: false,
        llm: false,
        tts: false,
      };
    }
  }

  async clearCache() {
    await this.ensureInitialized();

    try {
      await this.manager.clearCache();
      this.modelsReady = false;
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }
}

export default new AppModelManager();
