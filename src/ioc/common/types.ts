export type DIToken<T> = symbol & { __type: T };

export interface DIContainer {
  register<T>(token: DIToken<T>, value: T): DIContainer;
  resolve<T>(token: DIToken<T>): T;
  resolveAll(): unknown;
}

export interface DIManager {
  getContainer(key?: string): DIContainer;
  registerContainer(container: DIContainer, key?: string): DIManager;
  setDefaultContainer(key: string): DIManager;
}
