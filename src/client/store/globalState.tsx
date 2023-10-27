import { ReadonlySignal, Signal, computed, signal } from "@preact/signals";
import React from "preact/compat";
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { MultimediaController } from "@core/multimedia-controller";

type GlobalState = {
  resources: Signal<File[]>;
  isAnyFileLoaded: ReadonlySignal<boolean>;
  media: MultimediaController;
};

const GlobalContext = createContext({} as GlobalState);

type Props = {
  children: preact.ComponentChildren;
};
function createAppState() {
  const resources = signal([]);

  const media = new MultimediaController();

  const isAnyFileLoaded = computed(() => !!resources.value[0]);

  return { resources, isAnyFileLoaded, media };
}

export const GlobalState = ({ children }: Props) => {
  return <GlobalContext.Provider value={createAppState()}>{children}</GlobalContext.Provider>;
};

export const useCoreContext = () => useContext(GlobalContext);
