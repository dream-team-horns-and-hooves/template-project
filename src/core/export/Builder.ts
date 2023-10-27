import { Encoder } from '@/core/encoder';

export class Builder {
    items: any;
    storage: any;
    images: any;

    encoder: Encoder;

    canvas: any;
    ctx: any;

    count: number = -1;

    frameCounter: number = 0;

    totalCount: number = null;

    currentVideoId: number = 0;

    __resolver: any;

    constructor() {
        this.canvas = new OffscreenCanvas(1280, 720);
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

        this.encoder = new Encoder();
        this.encoder.initialize({}, {});
    }

    init(videoSegments: any, imageSegments: any, storage: any) {
        this.items = videoSegments;
        this.images = imageSegments;
        this.storage = storage;
    }

    start(): Promise<ArrayBuffer> {
        return new Promise(resolve => {
            this.__resolver = resolve;
            this.process();
        });
    }

    iWantGetVideoForDecoding() {
        this.count += 1;

        const videoId = this.items.order[this.count];

        if (videoId == null) return null;

        this.currentVideoId = videoId;

        const videoStorage = this.storage.getVideoInstanceById(videoId);

        this.totalCount += videoStorage.video.totalSamples;

        return videoStorage;
    }

    async process() {
        const v = this.iWantGetVideoForDecoding();

        if (v === null || this.frameCounter === this.totalCount) {
            this.answer();
            return;
        }

        console.log('--->>', v);

        v.callback((frame: VideoFrame) => {
            this.draw(frame);
            frame.close();
        });

        const decoder = v.getDecoder();

        for (const chunk of v.videoChunks) {
            decoder.decode(chunk);
        }

        await decoder.flush();

        this.process();
    }

    draw(decodedFrame: VideoFrame) {
        this.ctx.drawImage(decodedFrame, 0, 0, 1280, 720);

        const imageSegments = this.images.getImagesByVideoId(this.currentVideoId);
        const positions = this.images.positions;

        if (imageSegments && Array.isArray(imageSegments)) {
            const imgs = imageSegments.map(segment => {
                return { image: segment.image, position: positions.get(segment.id) };
            });

            imgs.forEach(({ image, position }) => {
                const { width, height } = image;

                switch (position) {
                    case 'top':
                        this.ctx.drawImage(image, 0, 0, width, height);
                        break;
                    case 'right':
                        this.ctx.drawImage(image, this.canvas.width - width, 0, width, height);
                        break;
                    case 'bottom':
                        this.ctx.drawImage(image, 0, this.canvas.height - height, width, height);
                        break;
                    case 'left':
                        this.ctx.drawImage(image, 0, 0, width, height);
                        break;
                    case 'center':
                        this.ctx.drawImage(
                            image,
                            (this.canvas.width - width) / 2,
                            (this.canvas.height - height) / 2,
                            width,
                            height,
                        );
                        break;
                    default: {
                        return;
                    }
                }
            });
        }

        const videoSegment = this.items.getItemById(this.currentVideoId);
        const filter = videoSegment.filter;

        if (filter === 'grayscale') {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = brightness;
                data[i + 1] = brightness;
                data[i + 2] = brightness;
            }

            this.ctx.putImageData(imageData, 0, 0);
        }

        /*
            Рисуй что хочешь
        */

        // if (this.currentVideoId === 2) {
        //     const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        //     const data = imageData.data;

        //     for (let i = 0; i < data.length; i += 4) {
        //         const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        //         data[i] = brightness;
        //         data[i + 1] = brightness;
        //         data[i + 2] = brightness;
        //     }

        //     this.ctx.putImageData(imageData, 0, 0);
        // }

        /*
            Это для фильтров

            const imageData = context.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);

            --> фильтры (код) <--

            const imageData = context.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = brightness;
                data[i + 1] = brightness;
                data[i + 2] = brightness;
            }

            context.putImageData(imageData, 0, 0);
        */

        const frame = new VideoFrame(this.canvas, {
            timestamp: (this.frameCounter * 1e6) / 30,
        });

        let needsKeyFrame = this.frameCounter % 300 === 0;

        this.encoder.encode(frame, {
            keyFrame: needsKeyFrame,
        });

        this.frameCounter += 1;

        frame.close();
    }

    async answer() {
        const buffer = await this.encoder.finish();
        this.__resolver(buffer);
    }
}
