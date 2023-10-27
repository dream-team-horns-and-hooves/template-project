import React from "react";
import cn from "classnames";

import {ImagePositionProps} from "./types";
import styles from './styles.module.css';

export const ImagePosition = ({positions, classNames, isShow, onChange}: ImagePositionProps) => {
  return (
    <div className={cn(classNames, {[styles.hidden]: !isShow})}>
      {positions.map(pos => (
        <div key={pos} className={cn(styles.imageDot, styles[pos])} onClick={() => onChange(pos)}></div>
      ))}
    </div>
  )
}