import { IUrlLoaderEngine } from '@/core/types/loader';
// import axios from 'axios';
import { readVideoFileAsBuffer } from '@/libs/readVideoFileAsBuffer';

/**
 * UrlLoader
 *
 */
export class URLLoader implements IUrlLoaderEngine {
    ready: boolean;
    file: any;
    url: string;
    constructor(url: string) {
        this.ready = false;
        this.url = url;
    }

    async fetchData() {
        try {
            //CORS blocks request
            this.file = await fetch(this.url);
            this.ready = true;
        } catch (e) {
            console.log(e);
        }
    }

    async load() {
        await this.fetchData();
        if (this.ready) {
            return await readVideoFileAsBuffer(this.file);
        }

        console.warn('URLLoader is not ready');
    }
}
