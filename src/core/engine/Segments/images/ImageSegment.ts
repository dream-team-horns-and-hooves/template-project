import { ImagePosition } from '@/core/multimedia-controller/types';

interface CreateProps {
    videoId: number;
    initialPosition: ImagePosition;
    blob: Blob;
}

export interface ImageSegmentData {
    id: number;
    position: ImagePosition;
    image: ImageBitmap;
}

export class ImageSegment {
    id: number;
    image: ImageBitmap;

    relatedVideoId: number;
    position: ImagePosition = 'center';

    constructor(id: number) {
        this.id = id;
    }

    async create(opts: CreateProps) {
        this.relatedVideoId = opts.videoId;
        this.position = opts.initialPosition || 'center';

        const image = await createImageBitmap(opts.blob);

        return {
            id: this.id,
            position: this.position,
            image,
        };
    }

    changePosition(newPosition: ImagePosition) {
        this.position = newPosition;
        return newPosition;
    }
}
