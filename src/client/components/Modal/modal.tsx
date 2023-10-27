import {FC} from "preact/compat";
import cn from "classnames";

import {ModalProps} from "./types";
import styles from "./styles.module.css";
import React from "preact/compat";

export const Modal: FC<ModalProps> = ({children, text, onShow, onClose }) => {
  const onCloseHandler = (e: any) => {
    const wrapper = document.getElementById('modal-id');
    if (e.target === wrapper) {
      onClose();
    }
  }
  return (
    <div className={cn(styles.modal, { [styles.hidden]: !onShow })}>
      <div id='modal-id' className={styles.wrapper} onClick={(e) => onCloseHandler(e)}>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}