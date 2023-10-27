import {MultimediaController} from "@/core";
import {Signal} from "@preact/signals";

export interface readFileProps {
  fileArray: File,
  focusedVideoId: Signal<number | null>,
  media: MultimediaController
}