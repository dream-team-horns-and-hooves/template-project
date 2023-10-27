import React from "preact/compat";
import cn from "classnames";

import {ButtonProps} from "./types";
import styles from './styles.module.css'

export const Button = ({title, icon, onClick, className, size = '27px', disabled, alt, id}: ButtonProps) => (
  <div
    id={id}
    role='button'
    className={cn(className, styles.button, {[styles.disabled]: disabled})}
    onClick={onClick}
  >
    {icon && <img src={icon} alt={alt} width={size} height={size}/>}
    {title}
  </div>
)