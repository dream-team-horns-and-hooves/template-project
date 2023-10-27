import { type ImageFilter, MultimediaController} from "@/core";

export function playCallback(media: MultimediaController) {
  media.play();
}

export function pauseCallback(media: MultimediaController) {
  media.pause();
}

export function exportCallback(media: MultimediaController, quality: '1080р' | '720р' | '480р') {
  media.export(quality);
}

export const updatePosition = (times: [string, number][]) => {
  times.forEach((time) => {
    const [videoId, startTime] = time;

    const elements: NodeListOf<HTMLElement> = document.querySelectorAll(`[id="${videoId}"]`);

    elements.forEach((elem) => {
      const shiftSize = ((startTime / 1000 / 60) * 100).toFixed(1)
      elem.style.marginLeft = `${shiftSize}%`;
    });
  });
}

export function applyFilter(media: MultimediaController, id: string, filter: ImageFilter) {
  media.applyFilter({videoId: id, filter});
}