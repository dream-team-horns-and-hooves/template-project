import { ImagePosition } from '@/core/multimedia-controller/types';
import { ImageSegment, ImageSegmentData } from './ImageSegment';

type VideoId = number;
type ImageId = number;

function generateId() {
    return Date.now();
}

export class ImageSegments {
    segmentInstances: Map<ImageId, ImageSegment> = new Map();
    segments: Map<VideoId, ImageSegmentData[]> = new Map();
    positions: Map<number, ImagePosition> = new Map();

    constructor() {}

    async add(payload: any) {
        const videoId = payload.videoId;

        const id = generateId();
        const segment = new ImageSegment(id);
        const segmentData = await segment.create(payload);

        if (!this.segments.has(videoId)) {
            this.segments.set(videoId, []);
        }

        const segmentValue = this.segments.get(videoId);
        segmentValue.push(segmentData);

        this.segmentInstances.set(id, segment);
        this.positions.set(id, payload.position);

        return id;
    }

    changePositionForImage(imageId: number, position: ImagePosition) {
        const imageSegment = this.segmentInstances.get(imageId);
        const newPosition = imageSegment.changePosition(position);

        this.positions.set(imageId, newPosition);
    }

    getImagesByVideoId(videoId: number) {
        return this.segments.get(videoId);
    }
}
