import { RuntimeProvider, RuntimeType } from './types';

export class RuntimeManager {
  private providers: Map<RuntimeType, RuntimeProvider> = new Map();

  registerProvider(provider: RuntimeProvider) {
    this.providers.set(provider.name, provider);
  }

  getProvider(type: RuntimeType): RuntimeProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Runtime provider ${type} not registered`);
    }
    return provider;
  }
}
