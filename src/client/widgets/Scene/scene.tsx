import {useEffect, useRef, useState} from "preact/compat";
import {useCoreContext} from "@client//store/globalState";
import addImage from '@client/assets/add-image.svg';
import crop from '@client/assets/crop.svg';
import trim from '@client/assets/trim.svg';
import addText from '@client/assets/add-text.svg';
import deleteLine from '@client/assets/delete.svg';
import preview from '@client/assets/preview.svg';
import {PlayButton, Timeline, Button} from "@client/components";

import styles from "./styles.module.css";
import React from "preact/compat";
import {logDOM} from "@testing-library/react";

const videoData = {
  id: 16131,
  start: 0,
  end: 37280,
  duration: 932000,
  timescale: 25000,
  countChunks: 932
}
export const Scene = () => {
  const {resources, media} = useCoreContext();
  const initial = useRef(false);
  const ref = useRef<HTMLCanvasElement | null>(null);

  const [active, setActive] = useState(false)
  const togglePlayer = () => setActive(prev => !prev)

  useEffect(() => {
    if (!initial.current && ref.current) {
      const canvas = ref.current.transferControlToOffscreen();
      media.initialization(canvas);
    }
  }, [])

  console.log(resources.value)

  return (
      <div className={styles.scene}>
        <div className={styles.previewWrapper}>
          <canvas ref={ref} width={800} height={450} className={styles.preview} id="preview-canvas"/>
          <PlayButton className={styles.play} active={active} hide={false} onClick={togglePlayer}/>
        </div>
        <div className={styles.timelineWrapper}>
          <Timeline data={videoData} />
        </div>
        <div className={styles.actions}>
          <Button alt='add image' icon={addImage} onClick={() => console.log('1')}/>
          <Button alt='crop' icon={crop} disabled onClick={() => console.log('1')}/>
          <Button alt='trim' icon={trim} disabled onClick={() => console.log('1')}/>
          <Button alt='add text' icon={addText} disabled onClick={() => console.log('1')}/>
          <Button alt='delete line' icon={deleteLine} disabled onClick={() => console.log('1')}/>
          <Button alt='preview' icon={preview} onClick={() => console.log('1')}/>
        </div>
      </div>
  );
}
