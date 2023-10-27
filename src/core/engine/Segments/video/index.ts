import { ImageFilter } from '@/core/multimedia-controller/types';
import { VideoSegment } from './VideoSegment';
import { EventEmitter } from '@/core/emitter';

interface SetSegmentOptions {
    id: number;
    duration: number;
    timescale: number;
    countChunks: number;
}

type Events = {
    'changed-order': void;
    'added-video': void;
};

// const baseInfo = await storage.addVideoToStorage(payload.buffer);

export class VideoSegments {
    segments: Map<number, VideoSegment> = new Map();
    order: number[] = [];
    queue: number[] = [];

    position: number = 0;

    dd: Map<number, boolean> = new Map();

    constructor() {
        const e = new EventEmitter<Events>();
    }

    setSegment(opts: SetSegmentOptions) {
        console.group();

        const lastItem = this.getLastItem();

        const end = (opts.duration / opts.timescale) * 1_000;

        const startTime = lastItem != null ? lastItem.end : 0;
        const endTime = lastItem != null ? end + lastItem.end : end;

        const unit = {
            id: opts.id,
            start: startTime,
            end: endTime,
            duration: opts.duration,
            timescale: opts.timescale,
            countChunks: opts.countChunks,
        };

        const segment = new VideoSegment(unit, this.position);

        this.segments.set(segment.id, segment);
        this.order.push(segment.id);
        this.queue.push(segment.id);

        this.dd.set(this.position, true);

        this.position += 1;

        return unit;
    }

    recalculate() {
        const order = this.getOrder();

        let idx = 0;

        order.forEach(id => {
            const lastIdx = idx - 1;

            const last = this.getItemById(order[lastIdx]);
            const current = this.getItemById(id);

            const end = (current.duration / current.timescale) * 1_000;

            const startTime = last != null ? last.end : 0;
            const endTime = last != null ? end + last.end : end;

            current.setTime(startTime, endTime);

            idx += 1;
        });
    }

    applyFilterToSegment(videoId: number, filter: ImageFilter) {
        const segment = this.getItemById(videoId);
        segment.applyFilter(filter);
    }

    switchVisibility(videoId: number) {
        const segment = this.getItemById(videoId);
        const isVisible = segment.isVisible;

        if (isVisible) {
            console.log('order', this.order);
            this.removeFromOrder(segment.position);
        } else {
            this.restoreToOrder(segment.position);
        }

        segment.toggleVisibility();
        this.recalculate();
    }

    removeFromOrder(position: number) {
        this.dd.set(position, false);
    }

    restoreToOrder(position: number) {
        this.dd.set(position, true);
    }

    getLastItem(): VideoSegment | null {
        const lastId = this.queue.at(-1);
        return this.getItemById(lastId);
    }

    getItemById(id: number): VideoSegment | null {
        if (this.segments.has(id)) return this.segments.get(id);
        return null;
    }

    size() {
        return this.segments.size;
    }

    getOrder() {
        return [...this.dd.entries()].filter(([key, value]) => value === true).map(([key, value]) => this.order[key]);
    }

    log() {
        console.log({
            segments: this.segments,
            order: this.order,
        });
    }
}
