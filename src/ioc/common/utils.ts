import { DIContainer, DIManager, DIToken } from './types';

export function createDIToken<T>(desc: string): DIToken<T> {
  return Symbol(desc) as DIToken<T>;
}

export function buildContainer(): DIContainer {
  const containerState: Record<DIToken<unknown>, unknown> = {};

  const diContainer: DIContainer = {
    register<T>(token: DIToken<T>, value: T): DIContainer {
      containerState[token] = value;
      return diContainer;
    },
    resolve<T>(token: DIToken<T>): T {
      if (!(token in containerState))
        throw new Error(`Token Symbol(${token.description}) not found`);
      return containerState[token] as T;
    },
    resolveAll(): unknown {
      return containerState;
    },
  };

  return diContainer;
}

export function buildManager(): DIManager {
  const containers: Record<string, DIContainer> = {};
  let defaultContainer = 'default';

  const diManager: DIManager = {
    getContainer(key: string | undefined): DIContainer {
      if (!containers[key ?? defaultContainer])
        throw new Error('Container not found');
      return containers[key ?? defaultContainer];
    },
    registerContainer(container: DIContainer, key: string = 'default') {
      if (containers[key]) throw new Error(`Container ${key} already exists`);
      containers[key] = container;
      return diManager;
    },
    setDefaultContainer(key: string) {
      if (!(key in containers)) {
        throw new Error(`Container ${key} not found`);
      }
      defaultContainer = key;
      return diManager;
    },
  };

  return diManager;
}
