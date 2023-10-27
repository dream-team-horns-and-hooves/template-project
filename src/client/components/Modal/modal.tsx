import {FC} from "preact/compat";
import cn from "classnames";

import {ModalProps} from "./types";
import styles from "./styles.module.css";
import React from "preact/compat";

export const Modal: FC<ModalProps> = ({children, text, onShow }) => {
  return (
    <div className={cn(styles.modal, { [styles.hidden]: !onShow })}>
      <div className={styles.wrapper}>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}