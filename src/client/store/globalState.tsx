import { ReadonlySignal, Signal, computed, signal } from "@preact/signals";
import React from "preact/compat";
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { MultimediaController, type RenderVideoFragmentEventPayload } from "@core/multimedia-controller";

type GlobalState = {
  resources: Signal<File[]>;
  isAnyFileLoaded: ReadonlySignal<boolean>;
  media: Signal<MultimediaController>;
  focusedVideoId: Signal<number | null>;
  segmentData: Signal<RenderVideoFragmentEventPayload>;
  sizes: Signal<any>;
  fragments: Signal<Array<any>>;
};

const GlobalContext = createContext({} as GlobalState);

type Props = {
  children: preact.ComponentChildren;
};
function createAppState() {
  const resources = signal([]);
  const media = signal(new MultimediaController());
  const focusedVideoId = signal(null);
  const isAnyFileLoaded = computed(() => !!resources.value[0]);
  const segmentData = signal(null);
  const sizes = signal({});
  const fragments = signal([]);

  return { resources, isAnyFileLoaded, media, focusedVideoId, segmentData, sizes, fragments };
}

export const GlobalState = ({ children }: Props) => {
  return <GlobalContext.Provider value={createAppState()}>{children}</GlobalContext.Provider>;
};

export const useCoreContext = () => useContext(GlobalContext);
