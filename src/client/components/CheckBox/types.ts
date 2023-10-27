import { HTMLAttributes } from "preact/compat";

export interface CheckBoxProps extends HTMLAttributes<HTMLInputElement>{
  checked?: boolean;
  id: string;
};
