import { EventEmitter } from '@/core/emitter';
import { ImageFilter, ImagePosition } from '@/core/multimedia-controller/types';
import type { Storage } from '@/core/storage';
import type { MediaStorage } from '@/core/storage/units/MediaStorage';
import { DecodedVideoFramesResultFn, DecodedAudioFramesResultFn } from '@/core/types/decoder';
import { VideoTrackInfo, AudioTrackInfo } from '@/core/types/demuxer';
import { generateId } from '@/libs/generateId';

type Events = {
    'video-has-been-added': VideoSegmentInfo;
    'image-has-been-added': ImageId;
    'order-has-been-changed': string[];
    'image-position-has-been-changed': void;
    'filter-has-been-changed': void;
    'time-position-updated': [string, number][];
};

type VideoId = string;
type ImageId = string;

interface VideoSegmentConstructor {
    id: string;
    media: MediaStorage;
    positionAtCreated: number;
}

interface AudioSegmentsConstructor {
    id: string;
    media: MediaStorage;
}

export interface VideoSegmentInfo {
    id: string;
    start: number;
    duration: number;
    timescale: number;
    totalChunks: number;
}

interface ImageSegmentConstructor {
    id: string;
    image: ImageBitmap;
}

export interface SegmentEngine {
    decoder: VideoDecoder;
    chunksWorker: ChunksWorker;
    frameChannel: any;
}

type VideoSegmentStatus = 'fulled' | 'sliced';

class ChunksWorker {
    constructor(private videoChunks: EncodedVideoChunk[]) {}

    get chunks() {
        return this.videoChunks;
    }

    get firstChunk() {
        return this.videoChunks[0];
    }

    get lastChunk() {
        return this.videoChunks.at(-1);
    }

    slice(start: number, end: number = 0) {
        return this.chunks.slice(start, end);
    }

    findKeyChunkByIndex(idx: number) {
        const chunk = this.chunks[idx];

        if (chunk && chunk.type === 'key') return idx;

        let counter = idx - 1;

        while (true) {
            if (counter === 0) return 0;

            const chunk = this.chunks[counter];

            if (chunk && chunk.type === 'key') {
                return counter;
            }

            counter -= 1;
        }
    }

    findClosestFrameIdxByTimestamp(timestamp: number) {
        let closestFrame = null;
        let closestDiff = Infinity;
        let closestIdx = 0;
        let idx = 0;

        for (const chunk of this.chunks) {
            const timeDiff = Math.abs(timestamp - chunk.timestamp);

            if (timeDiff < closestDiff) {
                closestDiff = timeDiff;
                closestFrame = chunk;
                closestIdx = idx;
            }

            idx += 1;
        }

        return closestIdx;
    }
}

export class VideoSegment {
    private readonly media: MediaStorage;
    private originalInfo: VideoTrackInfo;

    private chunksWorker: ChunksWorker;
    private decoder: VideoDecoder;
    private frameChannel: (callback: DecodedVideoFramesResultFn) => void;

    readonly id: string;
    private positionAtCreated: number;

    private startTime: number = 0;
    private endTime: number;
    private endTimePosition: number;

    private isVisibility: boolean = true;

    constructor({ id, media, positionAtCreated }: VideoSegmentConstructor) {
        this.id = id;
        this.media = media;
        this.positionAtCreated = positionAtCreated;

        this.decoder = this.media.videoDecoder;
        this.frameChannel = this.media.onVideoFrames.bind(this.media);

        this.originalInfo = this.media.videoInfo;
        this.endTime = (this.originalInfo.duration / this.originalInfo.timescale) * 1_000;
        this.endTimePosition = this.endTime;
    }

    /**/
    async startProcessGettingChunks() {
        const chunks = await this.media.retrieveVideoChunks();
        this.chunksWorker = new ChunksWorker(chunks);

        return this;
    }

    /**/
    getPositionOfCreationTime() {
        return this.positionAtCreated;
    }

    /**/
    getTimePosition() {
        return { start: this.startTime, end: this.endTime, endPosition: this.endTimePosition };
    }

    updateTimePosition(start: number, end: number) {
        this.startTime = start;
        this.endTimePosition = end;
    }

    /**/
    getSegmentInfo() {
        return {
            id: this.id,
            start: this.startTime,
            duration: this.originalInfo.duration,
            timescale: this.originalInfo.timescale,
            totalChunks: this.originalInfo.totalSamples,
        };
    }

    /**/
    getEngine() {
        return {
            decoder: this.decoder,
            chunksWorker: this.chunksWorker,
            frameChannel: this.frameChannel.bind(this),
        };
    }

    getVisibilityState() {
        return this.isVisibility;
    }

    /**/
    changeVisibilityState() {
        this.isVisibility = !this.isVisibility;
    }
}

export class VideoSegments {
    private segments: Map<string, VideoSegment> = new Map();

    private orderOfInsertionByVisibilityState: Map<number, { id: string; visibility: boolean }> = new Map();
    private numberOfTrackedVideoSegmentPosition: number = 0;

    async create(media: MediaStorage) {
        const id = generateId();
        const videoSegment = await new VideoSegment({
            id,
            media,
            positionAtCreated: this.numberOfTrackedVideoSegmentPosition,
        }).startProcessGettingChunks();

        const positionTime = this.updateVideoSegmentPosition(this.lastSegments, videoSegment);
        videoSegment.updateTimePosition(positionTime.start, positionTime.end);

        this.segments.set(id, videoSegment);
        this.orderOfInsertionByVisibilityState.set(this.numberOfTrackedVideoSegmentPosition, { id, visibility: true });

        this.numberOfTrackedVideoSegmentPosition += 1;

        return videoSegment.getSegmentInfo();
    }

    get lastSegments() {
        const values = Array.from(this.segments.values());

        if (values.length === 0) return null;
        return values.at(-1);
    }

    getSegmentById(id: string) {
        return this.segments.get(id);
    }

    updateVisibilityStateAndGetUpdatedOrder(videoId: string) {
        const currentSegment = this.getSegmentById(videoId);
        const visibilityState = currentSegment.getVisibilityState();
        const position = currentSegment.getPositionOfCreationTime();

        if (visibilityState) {
            this.disableVisibilityState(position);
        } else {
            this.enableVisibilityStateFromOrder(position);
        }

        currentSegment.changeVisibilityState();

        const updatedOrder = this.getUpdatedOrder();
        const updatedTimePositions = this.recalculateVideoPositions(updatedOrder);

        return { order: updatedOrder, timePositions: updatedTimePositions };
    }

    private enableVisibilityStateFromOrder(position: number) {
        const stateByPosition = this.orderOfInsertionByVisibilityState.get(position);

        stateByPosition.visibility = true;
        this.orderOfInsertionByVisibilityState.set(position, stateByPosition);
    }

    private disableVisibilityState(position: number) {
        const stateByPosition = this.orderOfInsertionByVisibilityState.get(position);

        stateByPosition.visibility = false;
        this.orderOfInsertionByVisibilityState.set(position, stateByPosition);
    }

    private getUpdatedOrder() {
        const values = Array.from(this.orderOfInsertionByVisibilityState.values());
        return values.filter(value => value.visibility === true).map(value => value.id);
    }

    private recalculateVideoPositions(order: VideoId[]) {
        let idx = 0;
        const result: [string, number][] = [];

        for (const id of order) {
            const lastIdx = idx - 1;

            const currentSegment = this.getSegmentById(id);
            const lastSegment = this.getSegmentById(order[lastIdx]);

            const positionTime = this.updateVideoSegmentPosition(lastSegment, currentSegment);
            currentSegment.updateTimePosition(positionTime.start, positionTime.end);

            result.push([id, currentSegment.getTimePosition().start]);

            idx += 1;
        }

        return result;
    }

    private updateVideoSegmentPosition(lastVideoSegment: VideoSegment | null, currentVideoSegment: VideoSegment) {
        const currentTime = currentVideoSegment.getTimePosition();

        if (lastVideoSegment) {
            const lastTime = lastVideoSegment.getTimePosition();

            const startTime = lastTime.endPosition;
            const endTime = currentTime.end + lastTime.endPosition;

            return { start: startTime, end: endTime };
        }

        return { start: 0, end: currentTime.end };
    }
}

export class ImageSegment {
    private id: string;
    private image: ImageBitmap;
    private position: ImagePosition;

    constructor(id: string, image: ImageBitmap) {
        this.id = id;
        this.image = image;
        this.position = 'center';
    }

    changePosition(newPosition: ImagePosition) {
        // console.log()
        this.position = newPosition;
        return newPosition;
    }

    getInfo() {
        return {
            image: this.image,
            position: this.position,
        };
    }
}

class ImageSegments {
    private segments: Map<string, ImageSegment> = new Map();
    private segmentsByVideo: Map<string, string[]> = new Map();

    createImageSegment(relatedVideoId: string, image: ImageBitmap) {
        const id = generateId();
        const imageSegment = new ImageSegment(id, image);

        this.segments.set(id, imageSegment);
        this.createLinkWithVideo(relatedVideoId, id);

        return id;
    }

    createLinkWithVideo(relatedVideoId: string, imageId: string) {
        const hasVideoId = this.segmentsByVideo.has(relatedVideoId);

        if (hasVideoId === false) {
            this.segmentsByVideo.set(relatedVideoId, []);
        }

        const imageIds = this.segmentsByVideo.get(relatedVideoId);
        imageIds.push(imageId);
    }

    changePosition(imageId: string, newPosition: ImagePosition) {
        const segment = this.getImageSegmentById(imageId);
        segment.changePosition(newPosition);
    }

    getImageSegmentById(imageId: string) {
        return this.segments.get(imageId);
    }

    getImagesByVideoId(videoId: string) {
        const segmentIds = this.segmentsByVideo.get(videoId);

        if (segmentIds == null) return [];

        return segmentIds.map(segmentId => {
            const segment = this.segments.get(segmentId);
            return segment.getInfo();
        });
    }
}

class FilterSegments {
    filtersByVideoId: Map<string, ImageFilter> = new Map();

    setDefaultFilter(videoId: string) {
        this.filtersByVideoId.set(videoId, 'none');
    }

    setFilter(videoId: string, newFilter: ImageFilter) {
        this.filtersByVideoId.set(videoId, newFilter);
    }

    getFilterByVideoId(videoId: string) {
        return this.filtersByVideoId.get(videoId);
    }
}

class AudioSegment {
    private readonly media: MediaStorage;
    private originalInfo: AudioTrackInfo;

    readonly id: string;

    private chunksWorker: ChunksWorker;
    private decoder: AudioDecoder;
    private frameChannel: (callback: DecodedAudioFramesResultFn) => void;

    constructor({ id, media }: AudioSegmentsConstructor) {
        this.id = id;
        this.media = media;

        this.decoder = this.media.audioDecoder;
        this.frameChannel = this.media.onAudioFrames.bind(this.media);

        this.originalInfo = this.media.audioInfo;
    }

    async startProcessGettingChunks() {
        const chunks = await this.media.retrieveAudioChunks();
        this.chunksWorker = new ChunksWorker(chunks);

        return this;
    }

    getInfo() {
        return this.originalInfo;
    }

    getEngine() {
        return {
            decoder: this.decoder,
            chunksWorker: this.chunksWorker,
            frameChannel: this.frameChannel.bind(this),
        };
    }
}

class AudioSegments {
    segmentsByVideoId: Map<string, AudioSegment> = new Map();

    async create(videoId: string, media: MediaStorage) {
        const id = generateId();
        const audioSegment = await new AudioSegment({
            id,
            media,
        }).startProcessGettingChunks();

        this.segmentsByVideoId.set(videoId, audioSegment);
    }

    getAudioSegmentByVideoId(videoId: string) {
        return this.segmentsByVideoId.get(videoId);
    }
}

export class Segments {
    private storage: Storage;
    private emitter: EventEmitter<Events>;

    private videoSegments: VideoSegments;
    private audioSegments: AudioSegments;

    private imageSegments: ImageSegments;
    private filterSegments: FilterSegments;

    private displayOrder: VideoId[] = [];

    constructor(storage: Storage) {
        this.storage = storage;
        this.emitter = new EventEmitter();

        this.videoSegments = new VideoSegments();
        this.audioSegments = new AudioSegments();

        this.imageSegments = new ImageSegments();
        this.filterSegments = new FilterSegments();
    }

    async parseMediaSegment(mediaBuffer: ArrayBuffer) {
        const createdMedia = await this.storage.addMediaToStorage(mediaBuffer);

        const videoSegmentId = await this.createVideoSegment(createdMedia);
        await this.createAudioSegment(videoSegmentId, createdMedia);

        this.increasingOrderSizeAfterAddingVideo(videoSegmentId);
    }

    private async createVideoSegment(media: MediaStorage) {
        const videoSegmentInfo = await this.videoSegments.create(media);

        this.filterSegments.setDefaultFilter(videoSegmentInfo.id);
        this.emitter.emit('video-has-been-added', videoSegmentInfo);

        return videoSegmentInfo.id;
    }

    /**/
    private async createAudioSegment(videoId: string, media: MediaStorage) {
        await this.audioSegments.create(videoId, media);
    }

    /**/
    async createImageSegment(relatedVideoId: string, imageBlob: Blob) {
        const createdImage = await this.storage.addImageToStorage(imageBlob);
        const imageId = this.imageSegments.createImageSegment(relatedVideoId, createdImage.image);

        this.emitter.emit('image-has-been-added', imageId);
    }

    /**/
    createFilterSegment(videoId: string) {
        this.filterSegments.setDefaultFilter(videoId);
    }

    /*
        Причина: изменение видимости состояния одного из сегментов
    */
    changeDisplayOrder(videoId: string) {
        const { order, timePositions } = this.videoSegments.updateVisibilityStateAndGetUpdatedOrder(videoId);

        this.displayOrder = order;

        this.emitter.emit('order-has-been-changed', this.displayOrder);
        this.emitter.emit('time-position-updated', timePositions);
    }

    increasingOrderSizeAfterAddingVideo(videoId: string) {
        this.displayOrder.push(videoId);
        this.emitter.emit('order-has-been-changed', this.displayOrder);
    }

    /*
     */
    changeImagePosition(imageId: string, newPosition: ImagePosition) {
        this.imageSegments.changePosition(imageId, newPosition);
        this.emitter.emit('image-position-has-been-changed');
    }

    changeVideoSegmentFilter(videoId: string, newFilter: ImageFilter) {
        this.filterSegments.setFilter(videoId, newFilter);
        this.emitter.emit('filter-has-been-changed');
    }

    getDisplayOrder() {
        return this.displayOrder;
    }

    getVideoSegmentById(videoId: string) {
        return this.videoSegments.getSegmentById(videoId);
    }

    getAudioSegmentById(videoId: string) {
        return this.audioSegments.getAudioSegmentByVideoId(videoId);
    }

    getImageSegmentsByVideoId(videoId: string) {
        return this.imageSegments.getImagesByVideoId(videoId);
    }

    getFilterByVideoId(videoId: string) {
        return this.filterSegments.getFilterByVideoId(videoId);
    }

    /**/
    onVideoAdded(callback: (data: VideoSegmentInfo) => void) {
        this.emitter.on('video-has-been-added', callback);
    }

    onImageAdded(callback: (data: ImageId) => void) {
        this.emitter.on('image-has-been-added', callback);
    }

    onOrderChanged(callback: (data: string[]) => void) {
        this.emitter.on('order-has-been-changed', callback);
    }

    onImagePositionChange(callback: () => void) {
        this.emitter.on('image-position-has-been-changed', callback);
    }

    onFilterChange(callback: () => void) {
        this.emitter.on('filter-has-been-changed', callback);
    }

    onTimePositionUpdated(callback: (timePositions: [string, number][]) => void) {
        this.emitter.on('time-position-updated', callback);
    }
}
