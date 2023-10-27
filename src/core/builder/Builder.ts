import { Encoder } from '@/core/encoder';
import { EventEmitter } from '../emitter';

import type { Segments } from '../engine';
import type { Quality } from '../multimedia-controller';

import { Scene } from './Scene';

interface ConfigItem {
    width: number;
    height: number;
    bitrate: number;
}

type Events = {
    'build-finish': ArrayBuffer;
};

const config: Record<Quality, ConfigItem> = {
    '1080р': {
        width: 1920,
        height: 1080,
        bitrate: 30e6,
    },
    '720р': {
        width: 1280,
        height: 720,
        bitrate: 15e6,
    },
    '480р': {
        width: 852,
        height: 480,
        bitrate: 6e6,
    },
};

export class Builder {
    private encoder: Encoder;
    private segments: Segments;
    private emitter: EventEmitter<Events>;

    private scene: Scene;
    private config: ConfigItem;

    private order: string[];

    private position: number = 0;
    private finalPosition: number = 0;
    private frameCounter: number = 0;
    private totalCount: number = 0;

    private currentVideoId: string | null = null;

    constructor(segments: Segments) {
        this.segments = segments;

        this.scene = new Scene();
        this.encoder = new Encoder();

        this.emitter = new EventEmitter();
    }

    async configure(quality: Quality = '720р') {
        this.config = config[quality];

        this.order = this.segments.getDisplayOrder();

        if (this.order.length === 0) {
            this.finishWithoutResult();
            return;
        }

        await this.encoder.initialize(this.config);

        this.scene.createScene(this.config.width, this.config.height);
        this.finalPosition = this.order.length;

        this.build();
    }

    build() {
        if (this.position === this.finalPosition) {
            this.finish();
            return;
        }

        this.currentVideoId = this.order[this.position];
        this.position += 1;

        this.process();
    }

    async process() {
        const videoSegment = this.segments.getVideoSegmentById(this.currentVideoId);
        const { totalChunks } = videoSegment.getSegmentInfo();

        this.totalCount += totalChunks;

        const engine = videoSegment.getEngine();
        const chunks = engine.chunksWorker.chunks;

        engine.frameChannel((frame: VideoFrame) => {
            this.createFrame(frame);
            frame.close();
        });

        for (const chunk of chunks) {
            engine.decoder.decode(chunk);
        }

        await engine.decoder.flush();
        this.build();
    }

    createFrame(frame: VideoFrame) {
        const images = this.segments.getImageSegmentsByVideoId(this.currentVideoId);
        const filter = this.segments.getFilterByVideoId(this.currentVideoId);

        const scene = this.scene.drawOnScene({ frame, images, appliedFilter: filter });

        const createdFrame = new VideoFrame(scene, {
            timestamp: (this.frameCounter * 1e6) / 30,
        });

        let needsKeyFrame = this.frameCounter % 300 === 0;

        this.encoder.encodeVideoFrame(createdFrame, {
            keyFrame: needsKeyFrame,
        });

        this.frameCounter += 1;
        createdFrame.close();
    }

    finishWithoutResult() {
        console.log('finishWithoutResult');
    }

    async finish() {
        const buffer = await this.encoder.finish();

        this.emitter.emit('build-finish', buffer);
    }

    onFinish(callback: (buffer: ArrayBuffer) => void) {
        this.emitter.on('build-finish', callback);
    }
}
