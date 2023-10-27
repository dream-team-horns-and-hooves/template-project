import React, {FC} from "preact/compat";
import cn from "classnames";

import {ModalProps} from "./types";
import styles from "./styles.module.css";

export const Modal: FC<ModalProps> = ({children, classNames,  text, onShow, onClose }) => {
  const onCloseHandler = (e: any) => {
    const wrapper = document.getElementById('modal-id');
    if (e.target === wrapper && onClose) {
      onClose();
    }
  }
  return (
    <div className={cn(classNames, styles.modal, { [styles.hidden]: !onShow })}>
      <div id='modal-id' className={styles.wrapper} onClick={(e) => onCloseHandler(e)}>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}