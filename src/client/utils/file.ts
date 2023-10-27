import { Signal } from "@preact/signals";
import {MultimediaController} from "@/core";
import {readVideoFileAsBuffer} from "@/libs";

Object.defineProperty(File, "copy_name", {
  writable: true,
  value: function (originalFile: File, newName: string) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  },
});

export const onImportFile = (files: Signal<File[]>, media: Signal<MultimediaController>, focusedVideoId: Signal<string | null>, exclude?: string[] ) => (e: Event) => {
  const element = e.currentTarget as HTMLInputElement;
  let fileList: FileList | null = element.files;

  if (fileList.length === 0) return;

  if (exclude && exclude.includes(fileList[0].type )) return;

  void readFile(element.files[0], focusedVideoId, media.value)

  files.value = [...files.value, ...Array.from(fileList)];
};

export const onDeleteFile = (files: Signal<File[]>, ids: Signal<string[]>) => () => {
  files.value = files.value.filter((val) => !ids.value.includes(val.name));
  ids.value = [];
};

export const onCopyFile = (files: Signal<File[]>, ids: Signal<string[]>) => () => {
  const filesCopy: File[] = [];
  const copyCount = ids.value.reduce((acc, item) => {
    return acc + files.value.filter((val) => val.name.includes(item)).length
  }, 0)

  files.value.forEach((val) => {
    if (ids.value.includes(val.name)) {
      filesCopy.push({...val, name: `Copy ${copyCount} ${val.name}`} as File);
    }
  });

  files.value = [...files.value, ...filesCopy];
};

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
