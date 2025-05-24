export type DIToken<T> = symbol & { __type: T };

export type DIContainerState = Record<DIToken<unknown>, unknown>;
export type DIManagerState = {
  containers: Record<string, DIContainerState>;
  currentContainer: string;
};

export interface DIContainer {
  register<T>(token: DIToken<T>, value: T): DIContainer;
  resolve<T>(token: DIToken<T>): T;
  resolveAll(): DIContainerState;
}

export interface DIManager {
  getContainer(key?: string): DIContainer;
  registerContainer(container: DIContainer, key?: string): DIManager;
  setDefaultContainer(key: string): DIManager;
}
