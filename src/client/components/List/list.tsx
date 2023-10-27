// import {Checkbox} from "@client/components";
import React from "preact/compat";
import {ListProps} from "./types";

import styles from "./styles.module.css";

export const List = ({resources, chosen, onChoose}: ListProps) => {
  return (
    <ul className={styles.wrapper}>
      {resources.value.map((res, idx) => (
        <li className={styles.item} key={`${res.name}_${idx}`}>
          {res.type === 'video/mp4' ? (
            <video src={URL.createObjectURL(res)} controls={false} alt=""/>
          ) : (
            <div className={styles.img} style={{backgroundImage: `url(${URL.createObjectURL(res)})`, backgroundSize: 'contain', content: ''}}></div>
          )}
          <span className={styles.text}>{res.name}</span>
          {/* ToDo: maybe functional */}
          {/*<Checkbox id={res.name} checked={chosen.value.includes(res.name)} onChange={onChoose}/>*/}
        </li>
      ))}
    </ul>
  )
}