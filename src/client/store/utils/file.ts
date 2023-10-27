import { Signal } from "@preact/signals";

Object.defineProperty(File, "copy_name", {
  writable: true,
  value: function (originalFile: File, newName: string) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  },
});

export const onImportFile = (files: Signal<File[]>) => (e: Event) => {
  const element = e.currentTarget as HTMLInputElement;
  let fileList: FileList | null = element.files;
  if (!fileList) return;

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