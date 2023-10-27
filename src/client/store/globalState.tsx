import { ReadonlySignal, Signal, computed, signal } from "@preact/signals";
import React from "preact/compat";
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { MultimediaController, type RenderVideoFragmentEventPayload } from "@core/multimedia-controller";

type GlobalState = {
  resources: Signal<File[]>;
  isAnyFileLoaded: ReadonlySignal<boolean>;
  media: Signal<MultimediaController>;
  focusedVideoId: Signal<string | null>;
  segmentData: Signal<RenderVideoFragmentEventPayload>;
  sizes: Signal<any>;
  fragments: Signal<Array<any>>;
  videoVisibility: Signal<Map<string, boolean>>;
  videoPlayed: Signal<boolean>;
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
  const videoVisibility = signal(new Map());
  const videoPlayed = signal(false);

  return { resources, isAnyFileLoaded, media, focusedVideoId, segmentData, sizes, fragments, videoVisibility, videoPlayed };
}

export const GlobalState = ({ children }: Props) => {
  return <GlobalContext.Provider value={createAppState()}>{children}</GlobalContext.Provider>;
};

export const useCoreContext = () => useContext(GlobalContext);
