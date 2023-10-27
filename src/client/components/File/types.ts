import {ButtonProps} from "@client/components/Button/types";

export interface FileProps extends Omit<ButtonProps, 'disabled'> {}