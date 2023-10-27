import cn from "classnames";
import {useEffect, useState} from "preact/compat";
import {Button} from "@client/components";
import show from '@client/assets/show.svg';
import hide from '@client/assets/hide.svg';

import {TimelineProps} from "./types";
import styles from './styles.module.css'
import React from "preact/compat";
import {useCoreContext} from "@client/store";

export const Timeline = ({ data, isShow }: TimelineProps) => {
  const { focusedVideoId, media, sizes, videoPlayed,} = useCoreContext();
  const toggleTimeline = () => {
    media.value.switchVisibility(data.id);
  }
  const getPreview = (event: React.JSX.TargetedMouseEvent<HTMLDivElement>) => {
    focusedVideoId.value = data.id;
    const element = document.getElementById(data.id);
    const rect = element.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    const timestamp = (clickX / rect.width) * data.duration;

    videoPlayed.value = false;

    media.value.preview({
      videoId: data.id,
      timestamp,
    });
  }

  const width = ((data.duration / data.timescale / 60) * 100).toFixed(1);
  const shiftSize = ((data.start / 1000 / 60) * 100).toFixed(1);

  sizes.value[data.id] = {
    w: `${width}`,
    s: `${shiftSize}`,
  };

  const style = {
    width: `${width}%`,
    height: '41px',
    marginLeft: `${shiftSize}%`,
  }

  return (
    <>
      <div className={styles.timelineWrapper}>
        <Button className={cn(styles.toggle, {[styles.hide]: !isShow})} alt='toggle' icon={!isShow ? hide : show} onClick={toggleTimeline}/>
        <div className={cn(styles.timeline, {[styles.hide]: !isShow})}>
          <div id={data.id} style={style} className={cn(styles.element)} onClick={(event) => getPreview(event)}></div>
        </div>
      </div>
    </>
  )
}