import { Runtime } from '@runanywhere/core';

class RuntimeManager {
  constructor() {
    this.runtime = null;
    this.initialized = false;
    this.initializing = false;
  }

  async initialize() {
    if (this.initialized) return this.runtime;

    if (this.initializing) {
      // Wait for initialization to complete
      while (!this.initialized) {
        await new Promise(r => setTimeout(r, 50));
      }
      return this.runtime;
    }

    this.initializing = true;
    try {
      console.log('Initializing RunAnywhere Runtime...');

      // Create the Runtime instance
      this.runtime = await Runtime.create();

      console.log('Runtime initialized successfully');
      this.initialized = true;
      return this.runtime;
    } catch (error) {
      console.error('Failed to initialize Runtime:', error);
      this.initializing = false;
      throw error;
    }
  }

  getRuntime() {
    if (!this.initialized) {
      throw new Error('Runtime not initialized. Call initialize() first.');
    }
    return this.runtime;
  }
}

export default new RuntimeManager();
