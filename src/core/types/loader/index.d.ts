export interface ILoaderEngine {
  /**
   * If file downloaded then ready state = True
   */
  ready?: boolean;
  load(): Promise<unknown>;
}
export interface ISourceLoader {
  /**
   * Base loader method
   * @returns ArrayBuffer
   */
  load: () => Promise<unknown>;
}

export interface IFileLoaderEngine extends LoaderEngine {
  /**
   * Default ChangeEvent handler. Accepts Events and save file.
   * @param event Event
   */
  getData(event: Event): Promise<void>;
}
export interface IUrlLoaderEngine extends LoaderEngine {
  /**
   * Default ChangeEvent handler. Accepts Events and save file.
   * @param event Event
   */
  fetchData(url: string): Promise<unknown>;
}
