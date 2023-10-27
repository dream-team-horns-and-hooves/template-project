import {ButtonProps} from "./types";
import cn from "classnames";

import styles from './styles.module.css'
import React from "preact/compat";

export const Button = ({title, icon, onClick, className, size = '27px', disabled, alt}: ButtonProps) => (
  <div
    role='button'
    className={cn(className, styles.button, {[styles.disabled]: disabled})}
    onClick={onClick}
  >
    {icon && <img src={icon} alt={alt} width={size} height={size}/>}
    {title}
  </div>
)