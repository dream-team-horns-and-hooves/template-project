import {Checkbox} from "@client/components";
import {ListProps} from "./types";

import styles from "./styles.module.css";
import React from "preact/compat";

export const List = ({resources, chosen, onChoose}: ListProps) => {
  return (
    <ul className={styles.wrapper}>
      {resources.value.map((res, idx) => (
        <li className={styles.item} key={`${res.name}_${idx}`}>
          <span className={styles.text}>{res.name}</span>
          <Checkbox id={res.name} checked={chosen.value.includes(res.name)} onChange={onChoose}/>
        </li>
      ))}
    </ul>
  )
}