import cn from 'classnames';
import { useSignal } from '@preact/signals';
import { stubFilters, filters } from './stub';

import styles from './styles.module.css';
import React from 'preact/compat';

export const Filters = () => {
    const chosen = useSignal<number>(0);

    return (
        <div className={styles.wrapper}>
            <span className={styles.title}>Фильтры</span>
            <div className={styles.filters}>
                {filters.map(({ label, value, filter }, idx) => (
                    <div
                        key={idx}
                        style={{ background: 'while', filter }}
                        className={cn(styles.item, { [styles.checked]: chosen.value === idx + 1 })}
                        onClick={() => (chosen.value = idx + 1)}
                    >{label}</div>
                ))}
            </div>
        </div>
    );
};
