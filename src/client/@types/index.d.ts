declare module '*.css' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module '*.scss' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module "*.svg" {
  export const content: FunctionComponent<React.SVGProps<SVGSVGElement>>;

  const src: string;
  export default src;
}
