import { produce } from "immer";
import {
  DIContainer,
  DIContainerState,
  DIManager,
  DIManagerState,
  DIToken,
} from "./types";

export function createDIToken<T>(desc: string): DIToken<T> {
  return Symbol(desc) as DIToken<T>;
}

export function buildContainer(
  containerState: DIContainerState = {},
): DIContainer {
  const diContainer: DIContainer = {
    register<T>(token: DIToken<T>, value: T): DIContainer {
      const newState = produce(containerState, (draft) => {
        draft[token] = value;
        return draft;
      });

      return buildContainer(newState);
    },
    resolve(...args: [any, ...any[]]): any {
      if (args.length === 1) {
        const token = args[0];
        if (!(token in containerState))
          throw new Error(`Token Symbol(${token.description}) not found`);
        return containerState[token];
      }

      return args.map((token) => {
        if (!(token in containerState))
          throw new Error(`Token Symbol(${token.description}) not found`);
        return containerState[token];
      });
    },
    resolveAll(): DIContainerState {
      return containerState;
    },
  };

  return diContainer;
}

export function buildManager(
  containerManagerState: DIManagerState = {
    containers: {},
    currentContainer: "default",
  },
): DIManager {
  const { containers, currentContainer } = containerManagerState;

  const diManager: DIManager = {
    getContainer(key: string | undefined): DIContainer {
      if (!containers[key ?? currentContainer])
        throw new Error("Container not found");
      return buildContainer(containers[key ?? currentContainer]);
    },
    registerContainer(container: DIContainer, key: string = "default") {
      if (containers[key]) throw new Error(`Container ${key} already exists`);
      const newContainersState = produce(containers, (draft) => {
        draft[key] = container.resolveAll();
        return draft;
      });
      return buildManager({ containers: newContainersState, currentContainer });
    },
    setDefaultContainer(key: string) {
      if (!(key in containers)) {
        throw new Error(`Container ${key} not found`);
      }

      return buildManager({ ...containerManagerState, currentContainer: key });
    },
  };

  return diManager;
}
