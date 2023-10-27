import React, {forwardRef} from "preact/compat";
import {type CheckBoxProps} from "./types";
import IconDefault from "@client/assets/check-icon.svg";

import styles from "./styles.module.css";

export const Checkbox = forwardRef<HTMLInputElement, CheckBoxProps>(
  ({
     checked,
     id,
     disabled,
     ...props
   }, ref) => {
    return (
      <label className={styles.container}>
        <input
          type='checkbox'
          checked={checked}
          id={id}
          ref={ref}
          {...props}
        />
        <span className={styles.checkmark}>
          {checked && <img src={IconDefault} alt='checkbox'/>}
        </span>
      </label>
    );
  }
);
