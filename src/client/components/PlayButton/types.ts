import {ButtonProps} from "@client/components/Button/types";

export interface PlayButtonProps extends Pick<ButtonProps, 'className' | 'onClick'>{
  active: boolean
  hide: boolean
}