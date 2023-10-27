import React from "preact/compat";
import {useCoreContext} from "@client/store/globalState";
import {List, Button, File} from "@client/components";
import {useSignal} from "@preact/signals";
import cn from "classnames";
import deleteFile from '@client/assets/delete.svg'
import copyFile from '@client/assets/copy.svg'
import importFile from '@client/assets/add-file.svg'
import {
  deleteAllAudio,
  getAllAudio,
  createAudioNode,
  playAudio,
  onDeleteFile,
  onCopyFile,
  onImportFile
} from "@client/store/utils";

import styles from "./styles.module.css";

export const Resources = () => {
  const {resources, isAnyFileLoaded, media, focusedVideoId} = useCoreContext();
  const chosen = useSignal<string[]>([]);
  const createAudio = () => resources.value.forEach((file) => createAudioNode(file))

  if (resources.value.length) {
    deleteAllAudio();
    createAudio();
    console.log('getAllAudio', getAllAudio())
  }

  const onChooseItem = (e: Event) => {
    const el = e.target as HTMLInputElement;
    const {id} = el;

    chosen.value = chosen.value.includes(id) ? chosen.value.filter((el) => el !== id) : [...chosen.value, id];
  };

  const disabledBtn = chosen.value.length === 0;

  console.log(media.value)
  return (
    <div className={styles.wrapper}>
      {!isAnyFileLoaded.value && (
        <span className={styles.title}>Ресурсы</span>
      )}
      <List resources={resources} chosen={chosen} onChoose={onChooseItem}/>
      <div className={cn(styles.actions)}>
        <File
          onClick={onImportFile(resources, media, focusedVideoId, ['image/png', 'image/jpeg'])}
          icon={importFile} alt='import'
        />
        <Button disabled={disabledBtn} onClick={onDeleteFile(resources, chosen)} icon={deleteFile} alt='delete'/>
        <Button disabled={true} onClick={onCopyFile(resources, chosen)} icon={copyFile} alt='copy'/>
      </div>
    </div>
  );
};
