import {readVideoFileAsBuffer} from "@/libs";
import {Signal} from "@preact/signals";
import {MultimediaController} from "@/core";

export const readFile = async (file: File, focusedVideoId: Signal<string | null>, media: MultimediaController) => {
  if (file.type === 'image/png' || file.type === 'image/jpeg') {
    if (focusedVideoId.value) {
      const blob = new Blob([file], {type: file.type});

      media.addImage({videoId: focusedVideoId.value.toString(), blob});
    }
    return;
  }

  if (file.type === 'video/mp4') {
    const buffer = await readVideoFileAsBuffer(file);
    media.addVideo(buffer);
  }
}

export function playCallback(media: MultimediaController) {
  media.play();
}

export function pauseCallback(media: MultimediaController) {
  media.pause();
}

export function exportCallback(media: MultimediaController, quality: '1080р' | '720р' | '480р') {
  media.export(quality);
}

export function downloadBlob(blob: Blob) {
  let url = window.URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'craft.mp4';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
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