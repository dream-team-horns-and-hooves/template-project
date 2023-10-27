import React from "preact/compat";
import cn from "classnames";

import {useCoreContext} from "@client/store";

import {ImageProps} from "./types";
import styles from './styles.module.css'

export const Image = ({ id, image }: ImageProps) => {
  const {  sizes, videoVisibility} = useCoreContext();

  const { w, s } = sizes.value[id];

  const style = {
    width: `${w}%`,
    height: '41px',
    marginLeft: `${s}%`,
  }

  return (
    <>
      <div className={styles.imageWrapper}>
        <div></div>
        <div className={cn(styles.image, {[styles.hide]: !videoVisibility.value.get(id)})}>
          <div id={id} style={style} className={cn(styles.element)}></div>
        </div>
      </div>
    </>
  )
}