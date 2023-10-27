import {Signal} from "@preact/signals";

export interface ListProps {
  resources: Signal<File[] >
  chosen: Signal<string[]>
  onChoose: (e: Event) => void
}