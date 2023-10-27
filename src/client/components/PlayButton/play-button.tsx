import React from "preact/compat";
import cn from "classnames";

import play from "@client/assets/play.svg";
import pause from "@client/assets/pause.svg";

import {PlayButtonProps} from "./types";
import styles from './styles.module.css'

export const PlayButton = ({onClick, hide, active, className}: PlayButtonProps) => (
  <div
    role='button'
    className={cn(className, styles.playButton, {[styles.hidden]: hide})}
    onClick={onClick}
  >
    {active ? (
      <img src={pause} alt='pause' width='27px' height='27px'/>
    ) : (
      <img src={play} alt='play' width='34px' height='27px'/>
    )}
  </div>
)