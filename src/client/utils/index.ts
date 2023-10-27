import {readVideoFileAsBuffer} from "@/libs";
import {Signal} from "@preact/signals";
import {MultimediaController, type RenderVideoFragmentEventPayload} from "@/core";

export const readFile = async(file: File, focusedVideoId: Signal<number | null>, media: MultimediaController) => {
  if (file.type === 'image/png' || file.type === 'image/jpeg') {
    if (focusedVideoId.value) {
      const blob = new Blob([file], { type: file.type });

      media.addImage({ videoId: focusedVideoId.value.toString(), blob });
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

export function exportCallback(media: MultimediaController) {
  media.export('720р');
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

export function createVideoBlock(
  segmentData: RenderVideoFragmentEventPayload,
  sizes: any,
  focusedVideoId: number | null,
  media: MultimediaController,
  fragments: any[]
) {
  const parent = document.getElementById('timeline_parent');

  const wrapper = document.createElement('div');
  const element = document.createElement('div');
  const button = document.createElement('button');

  wrapper.classList.add('wrapper-video-block');

  const width = (segmentData.duration / segmentData.timescale / 60) * 100;
  const shiftSize = (segmentData.start / 1000 / 60) * 100;

  element.style.width = `${width.toFixed(1)}%`;
  element.style.height = `${32}px`;
  element.style.marginLeft = `${shiftSize.toFixed(1)}%`;
  element.style.backgroundColor = '#289df2';

  element.classList.add('video-block');

  sizes[segmentData.id] = {
    w: `${width.toFixed(1)}%`,
    s: `${shiftSize.toFixed(1)}%`,
  };

  element.addEventListener('click', event => {
    focusedVideoId = segmentData.id;

    const rect = element.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    const timestamp = (clickX / rect.width) * segmentData.duration;

    media.preview({
      videoId: String(segmentData.id),
      timestamp,
    });
  });

  wrapper.dataset.videoId = String(segmentData.id);

  button.addEventListener('click', () => {
    media.switchVisibility(segmentData.id);
    // wrapper.classList.toggle('hidden');

    const elements = document.querySelectorAll(`[data-video-id="${segmentData.id}"]`) as any;

    elements.forEach((e: any) => {
      e.classList.toggle('hidden');
    });
  });

  const text = `${(segmentData.duration / segmentData.timescale).toFixed(1)}s`;

  element.textContent = text;
  button.textContent = text;

  fragments.push(wrapper);

  // $visibility.append(button);
  wrapper.append(element);
  parent.append(wrapper);
}