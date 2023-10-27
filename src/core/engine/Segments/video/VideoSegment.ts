import { ImageFilter } from '@/core/multimedia-controller/types';

export class VideoSegment {
    id: number;
    start: number;
    end: number;
    duration: number;
    timescale: number;
    totalSamples: number;

    isVisible: boolean = true;

    lastKeyFrameIdx: number = 0;
    lastFrameIdx: number = 0;
    endFrameIdx: number = 0;

    position: number = null;

    filter: ImageFilter | null = null;

    status: 'full' | 'slice';

    constructor(opts: any, position: number) {
        this.position = position;

        this.id = opts.id;
        this.start = opts.start;
        this.end = opts.end;
        this.duration = opts.duration;
        this.timescale = opts.timescale;
        this.totalSamples = opts.countChunks;

        this.endFrameIdx = this.totalSamples - 1;

        this.status = 'full';
    }

    war(status: 'full' | 'slice') {
        this.status = status;
    }

    setNew(keyIdx: number, idx: number) {
        this.lastKeyFrameIdx = keyIdx;
        this.lastFrameIdx = idx;
    }

    reset() {
        this.lastKeyFrameIdx = 0;
        this.lastFrameIdx = 0;
    }

    watchingMovement(type: 'key' | 'delta', idx: number) {
        if (type === 'key') {
            this.lastKeyFrameIdx = idx;
        }

        this.lastFrameIdx = idx;
    }

    whereIsStart() {
        return {
            currentFrame: this.lastFrameIdx,
            start: this.lastKeyFrameIdx,
            end: this.endFrameIdx,
        };
    }

    setStatus(idx: number) {
        console.log('KEY IDX', this.lastKeyFrameIdx);
        console.log('PAUSE WITH ', idx);

        this.lastFrameIdx = idx;
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
    }

    setTime(start: number, end: number) {
        this.start = start;
        this.end = end;
    }

    applyFilter(filter: ImageFilter) {
        this.filter = filter;
    }
}
