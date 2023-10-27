import React, {FC} from 'preact/compat';
import styles from './styles.module.css';
export const AppLayout: FC = ({children}) => (
  <>
    <div className={styles.AppHeader}>
      <div className={styles.AppLogo}>ClipCraft</div>
    </div>
    <div className={styles.AppMain}>
      {children}
    </div>
  </>
)