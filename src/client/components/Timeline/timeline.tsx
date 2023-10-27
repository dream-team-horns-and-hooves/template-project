import cn from "classnames";
import {useState} from "preact/compat";
import {Button} from "@client/components";
import show from '@client/assets/show.svg';
import hide from '@client/assets/hide.svg';

import {TimelineProps} from "./types";
import styles from './styles.module.css'
import React from "preact/compat";

export const Timeline = ({ data }: TimelineProps) => {
  const [isShow, setIsShow] = useState(true);
  const toggleTimeline = () => {
    setIsShow(prev => !prev);
  }

  return (
    <>
      <div className={styles.timelineWrapper}>
      <Button className={cn(styles.toggle, {[styles.hide]: isShow})} alt='toggle' icon={isShow ? hide : show} onClick={toggleTimeline}/>
        <div className={styles.timeline}>
          timeline
        </div>
      </div>
    </>
  )
}