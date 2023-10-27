import React, {useEffect, useRef, useState} from "preact/compat";
import {useCoreContext} from "@client//store/globalState";
import addImage from '@client/assets/add-image.svg';
import crop from '@client/assets/crop.svg';
import trim from '@client/assets/trim.svg';
import addText from '@client/assets/add-text.svg';
import deleteLine from '@client/assets/delete.svg';
import save from '@client/assets/export.svg';
import {Button, PlayButton, Timeline} from "@client/components";
import {createVideoBlock, downloadBlob, exportCallback, pauseCallback, playCallback} from "@client/utils";
import {onImportFile} from "@client/store";

import styles from "./styles.module.css";

const videoData = {
  id: 16131,
  start: 0,
  end: 37280,
  duration: 932000,
  timescale: 25000,
  countChunks: 932
}
export const Scene = () => {
  const {
    resources,
    media,
    focusedVideoId,
    segmentData,
    fragments,
  } = useCoreContext();
  const initial = useRef(false);
  const ref = useRef<HTMLCanvasElement | null>(null);

  const [active, setActive] = useState(false)
  const togglePlayer = () => {
    if (!active) {
      playCallback(media.value)
      setActive(true)
    } else {
      pauseCallback(media.value)
      setActive(false)
    }
  }

  useEffect(() => {
    if (!initial.current && ref.current) {
      const canvas = ref.current.transferControlToOffscreen();
      media.value.initialization(canvas);
    }
    if (media.value) {
      media.value = media.value;
    }
  }, [media, ref, resources])

  useEffect(() => {
    media.value.onRenderVideoSegment(segment => {
      segmentData.value = segment
      // createVideoBlock(segment);
    });
  }, [media, resources]);

  media.value.onPlaybackTime(data => console.log('onPlaybackTime', data));


  media.value.onFinish(data => {
    const blob = new Blob([data.buffer]);
    downloadBlob(blob);
  });

  console.log(fragments.value)

  return (
    <div className={styles.scene}>
      <div className={styles.previewWrapper}>
        <canvas ref={ref} width={800} height={450} className={styles.preview} id="preview-canvas"/>
        <PlayButton className={styles.play} active={active} hide={resources.value.length === 0} onClick={togglePlayer}/>
      </div>
      <div className={styles.timelineWrapper}>
        <Timeline data={videoData}/>
      </div>
      <div className={styles.actions}>
        <Button
          alt='add image'
          icon={addImage}
          onClick={onImportFile(resources, media, focusedVideoId, ['video/mp4'])}
          disabled={focusedVideoId.value === null}
        />
        <Button alt='crop' icon={crop} disabled onClick={() => console.log('1')}/>
        <Button alt='trim' icon={trim} disabled onClick={() => console.log('1')}/>
        <Button alt='add text' icon={addText} disabled onClick={() => console.log('1')}/>
        <Button alt='delete line' icon={deleteLine} disabled onClick={() => console.log('1')}/>
        <Button
          alt='preview'
          icon={save}
          onClick={() => exportCallback(media.value)}
          disabled={resources.value.length === 0}
        />
      </div>
    </div>
  );
}
