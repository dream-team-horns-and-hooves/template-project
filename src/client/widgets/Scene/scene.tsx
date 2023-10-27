import React, {useEffect, useRef, useState} from "preact/compat";

import addImage from '@client/assets/add-image.svg';
import crop from '@client/assets/crop.svg';
import trim from '@client/assets/trim.svg';
import addText from '@client/assets/add-text.svg';
import deleteLine from '@client/assets/delete.svg';
import save from '@client/assets/export.svg';
import {useCoreContext} from "@client/store/globalState";
import {Button, File, Image, Modal, PlayButton, Timeline, ImagePosition} from "@client/components";
import {downloadBlob, exportCallback, pauseCallback, playCallback, updatePosition} from "@client/utils";
import {onImportFile} from "@client/store";

import {Text, Positions, Quality} from "./consts";

import styles from "./styles.module.css";
import {PositionAlias} from "@client/widgets/Scene/types";
import cn from "classnames";

export const Scene = () => {
  const {
    resources,
    media,
    focusedVideoId,
    segmentData,
    videoVisibility,
    videoPlayed,
  } = useCoreContext();
  const initial = useRef(false);
  const ref = useRef<HTMLCanvasElement | null>(null);

  const [video, setVideo] = useState([])
  const [showImagePosition, setShowImagePosition] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [image, setImage] = useState<Array<{ id: string, image: string }>>([])

  const toggleHandler = (action: React.SetStateAction<boolean>) => action(prev => !prev);

  const togglePlayer = () => {
    if (!videoPlayed.value) {
      playCallback(media.value)
      videoPlayed.value = true
    } else {
      pauseCallback(media.value)
      videoPlayed.value = false
    }
  }

  const toggleImagePosition = (position: PositionAlias) => {
    let focusedImage = image.filter(item => item.id === focusedVideoId.value)

    if (focusedImage[0].image) {
      media.value.changeImagePosition({imageId: focusedImage[0].image, position: position});
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
      setVideo(prev => [...prev, segment])
      videoVisibility.value.set(segment.id, true);
    });

    media.value.onRenderImageSegment(({id}) => {
      setImage(prev => [...prev, {id: focusedVideoId.value, image: id}])
    });

    media.value.onRecalculateTimeAfterChangeVisibility(({times}) => {
      updatePosition(times);
      const videoIds = Array.from(videoVisibility.value.keys())
      const visibleIds = times.map(item => item[0])

      const tempMap = new Map()
      videoIds.forEach(id => {
        let state = visibleIds.includes(id);
        tempMap.set(id, state);
      })

      videoVisibility.value = tempMap
    });
  }, [media, resources, segmentData]);

  media.value.onPlaybackTime(data => console.log('onPlaybackTime', data));

  media.value.onFinish(data => {
    if (data) {
      setShowQualityModal(false)
    }
    const blob = new Blob([data.buffer]);
    downloadBlob(blob);
  });

  return (
    <>
      <div className={styles.scene}>
        <div className={styles.previewWrapper}>
          <canvas ref={ref} width={800} height={450} className={styles.preview} id="preview-canvas"/>
          <ImagePosition
            positions={Positions}
            classNames={styles.imagePreview}
            isShow={showImagePosition}
            onChange={toggleImagePosition}
          />
          <PlayButton
            className={styles.play}
            active={videoPlayed.value}
            hide={resources.value.length === 0}
            onClick={togglePlayer}
          />
        </div>
        <div id='timelines' className={cn(styles.timelineWrapper, {[styles.empty]: video.length === 0})}>
          {video.length === 0 && <span className={styles.emptyLabel}>Список таймлайнов</span>}
          {video.map(item => <Timeline key={item.id} data={item} isShow={videoVisibility.value.get(item.id)}/>)}
          {image.map(item => <Image key={item.image} id={item.id} image={item.image}/>)}
        </div>
        <div className={styles.actions}>
          <File
            icon={addImage}
            alt='add image'
            disabled={focusedVideoId.value === null}
            onClick={onImportFile(resources, media, focusedVideoId, ['video/mp4'])}
          />
          <Button
            alt='select image position'
            icon={crop}
            disabled={focusedVideoId.value === null || image.length === 0}
            onClick={() => toggleHandler(setShowImagePosition)}
          />
          <Button alt='trim' icon={trim} disabled onClick={() => {}}/>
          <Button alt='add text' icon={addText} disabled onClick={() => {}}/>
          <Button alt='delete line' icon={deleteLine} disabled onClick={() => {}}/>
          <Button
            alt='preview'
            icon={save}
            onClick={() => toggleHandler(setShowQualityModal)}
            disabled={resources.value.length === 0}
          />
        </div>
      </div>
      <Modal onShow={showQualityModal} onClose={() => toggleHandler(setShowQualityModal)} text={Text.placeholderLabel}>
        <div className={styles.modalContent}>
          <span className={styles.modalTitle}>{Text.placeholderLabel}</span>
          <div className={styles.buttonBlock}>
            <Button
              className={styles.modalButton}
              alt='full hd'
              icon={save}
              title={Text.placeholderFullHD}
              onClick={() => exportCallback(media.value, Quality.FullHD)}
              size='30px'
            />
            <Button
              className={styles.modalButton}
              alt='hd'
              icon={save}
              title={Text.placeholderHD}
              onClick={() => exportCallback(media.value, Quality.HD)}
              size='30px'
            />
            <Button
              className={styles.modalButton}
              alt='ed'
              icon={save}
              title={Text.placeholderED}
              onClick={() => exportCallback(media.value, Quality.ED)}
              size='30px'
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
