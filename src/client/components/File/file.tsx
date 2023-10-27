import React from "preact/compat";
import cn from "classnames";
import {FileProps} from "@client/components/File/types";
import buttonStyle from "@client/components/Button/styles.module.css";

import styles from "@client/components/Button/styles.module.css";

export const File = ({title, icon, onClick, className, size = '27px', alt, disabled}: FileProps) => (
  <label className={cn(className, buttonStyle.button, {[styles.disabled]: disabled})}>
    {icon && <img src={icon} alt={alt} width={size} height={size}/>}
    <input type="file" id="import-file" onChange={onClick}/>
    {title}
  </label>
)