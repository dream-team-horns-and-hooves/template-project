import React from 'preact/compat';
import cn from 'classnames';

import {ImageFilter} from "@/core";
import {useCoreContext} from "@client/store";
import {useSignal} from "@preact/signals";
import {applyFilter} from "@client/utils";

import {filters} from './consts';
import styles from './styles.module.css';

export const Filters = () => {
  const {focusedVideoId, media} = useCoreContext()
  const chosen = useSignal<number>(0);

  const setFilter = (idx: number, value: ImageFilter) => {
    chosen.value = idx + 1
    applyFilter(media.value, focusedVideoId.value, value)
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>Фильтры</span>
      <div className={styles.filters}>
        {filters.map(({label, value, filter}, idx) => (
          <div
            key={idx}
            style={{background: 'while', filter}}
            className={cn(styles.item, {[styles.checked]: chosen.value === idx + 1})}
            onClick={() => setFilter(idx, value)}
          >{label}</div>
        ))}
      </div>
    </div>
  );
};
