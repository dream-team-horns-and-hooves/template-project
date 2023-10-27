import { IFileLoaderEngine } from '@/core/types/loader';
import { readVideoFileAsBuffer } from '@/libs/readVideoFileAsBuffer';

/**
 * FileLoader
 *
 */
export class FileLoader implements IFileLoaderEngine {
    file: File;
    ready: boolean;
    constructor() {
        this.ready = false;
    }

    async getData(event: Event) {
        try {
            this.file = (event.target as HTMLInputElement).files[0];
            this.ready = true;
        } catch (e) {
            console.log(e);
        }
    }

    async load() {
        if (this.ready) {
            return await readVideoFileAsBuffer(this.file);
        }

        console.warn('FileLoader is not ready');
    }
}
