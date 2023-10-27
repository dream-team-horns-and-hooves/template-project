import cn from "classnames";
import {useSignal} from "@preact/signals";
import {stubFilters} from "./stub";

import styles from "./styles.module.css";
import React from "preact/compat";

export const Filters = () => {
  const chosen = useSignal<number>(0);

  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>Фильтры</span>
      <div className={styles.filters}>
        {stubFilters.map((i, idx) => (
          <div
            key={idx}
            style={{backgroundColor: i}}
            className={cn(styles.item, { [styles.checked]: chosen.value === (idx + 1) })}
            onClick={() => chosen.value = idx + 1}
          ></div>
        ))}
      </div>
    </div>
  );
};
