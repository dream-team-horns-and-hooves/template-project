import cn from "classnames";
import {useState} from "preact/compat";
import {Button} from "@client/components";
import show from '@client/assets/show.svg';
import hide from '@client/assets/hide.svg';

import {TimelineProps} from "./types";
import styles from './styles.module.css'
import React from "preact/compat";
import {useCoreContext} from "@client/store";
import {createVideoBlock} from "@client/utils";

export const Timeline = ({ data }: TimelineProps) => {
  const {segmentData, focusedVideoId, media, fragments, sizes} = useCoreContext();


  const [isShow, setIsShow] = useState(!!segmentData.value);
  const toggleTimeline = () => {
    setIsShow(prev => !prev);
    media.value.switchVisibility(segmentData.value.id);
  }

  // if (segmentData.value) {
  //   createVideoBlock(segmentData.value, sizes.value, focusedVideoId.value, media.value, fragments.value)
  // }

  console.log(segmentData.value)
  return (
    <>
      <div className={styles.timelineWrapper}>
      <Button id='timeline_btn' className={cn(styles.toggle, {[styles.hide]: isShow})} alt='toggle' icon={isShow ? hide : show} onClick={toggleTimeline}/>
        <div id='timeline_parent' className={cn(styles.timeline, {[styles.hide]: isShow})}>
        </div>
      </div>
    </>
  )
}