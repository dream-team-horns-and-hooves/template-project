import {ReactNode} from "react";

export interface ModalProps {
  text: string
  onShow: boolean
  onClose?: () => void
}