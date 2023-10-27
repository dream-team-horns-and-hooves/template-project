import { VideoStorageUnits } from './VideoStorageUnits';

/*
    TODO: make decorator
*/
export function singleton<T extends new (...args: any[]) => any>(constructor: T): T {
    let instance: T;

    return class {
        constructor(...args: any[]) {
            if (instance) {
                console.error('You cannot instantiate a singleton twice!');
                return instance;
            }

            // @ts-ignore
            instance = new constructor(...args);
            return instance;
        }
    } as T;
}

export class Store {
    private static instance: Store | null = null;

    videoStorage: VideoStorageUnits;

    constructor() {
        if (Store.instance) {
            return Store.instance;
        }

        this.videoStorage = new VideoStorageUnits();

        Store.instance = this;
    }

    static getInstance(): Store {
        if (Store.instance == null) {
            Store.instance = new Store();
        }

        return Store.instance;
    }
}
