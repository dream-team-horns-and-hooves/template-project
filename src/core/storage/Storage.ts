import { generateId } from '@/libs/generateId';

import { MediaStorage } from './units/MediaStorage';

class ImageStorage {
    private imageBlob: Blob;
    private imageBitmap: ImageBitmap;

    constructor(blob: Blob) {
        this.imageBlob = blob;
    }

    async create() {
        this.imageBitmap = await createImageBitmap(this.imageBlob);
        return this;
    }

    get image() {
        return this.imageBitmap;
    }
}

export class Storage {
    media: Map<string, MediaStorage> = new Map();
    images: Map<string, ImageStorage> = new Map();

    async addMediaToStorage(mediaBuffer: ArrayBuffer) {
        const media = await new MediaStorage(mediaBuffer).initialization();

        this.media.set(generateId(), media);

        return media;
    }

    async addImageToStorage(blob: Blob) {
        const imageStorage = await new ImageStorage(blob).create();

        this.images.set(generateId(), imageStorage);

        return imageStorage;
    }
}
