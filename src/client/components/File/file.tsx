import cn from "classnames";
import {FileProps} from "@client/components/File/types";
import buttonStyle from "@client/components/Button/styles.module.css";

import fileStyle from "./styles.module.css";
import React from "preact/compat";

export const File = ({title, icon, onClick, className, size = '27px', alt}: FileProps) => (
  <label className={cn(className, buttonStyle.button, fileStyle.file)}>
    {icon && <img src={icon} alt={alt} width={size} height={size}/>}
    <input type="file" id="import-file" onChange={onClick}/>
    {title}
  </label>
)