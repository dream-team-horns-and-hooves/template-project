import {Resources, Scene, Filters} from "@client/widgets";
import {useCoreContext} from "@client/store/globalState";
import {Text} from "@client/widgets/Scene/consts";
import {File, Modal} from "@client/components";
import {onImportFile} from "@client/store/utils";
import importFile from "@client/assets/add-file.svg";

import styles from "./styles.module.css";
import React from "preact/compat";

export const Home = () => {
  const {resources, isAnyFileLoaded, media, focusedVideoId} = useCoreContext();

  return (
    <>
      <Resources/>
      <Scene/>
      <Filters/>
      <Modal onShow={false} text={Text.placeholderLabel}>
        <div className={styles.modalContent}>
          <span className={styles.modalTitle}>{Text.placeholderLabel}</span>
          <File
            className={styles.modalButton}
            alt="import"
            onClick={onImportFile(resources, media, focusedVideoId)}
            icon={importFile}
            title={Text.placeholderButton}
            size='55px'
          />
        </div>
      </Modal>
    </>
  )
}