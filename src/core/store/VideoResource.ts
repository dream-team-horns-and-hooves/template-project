import { MediaDecoder } from '@/core/media/MediaDecoder';

export class VideoResource {
    mediaProcessor: MediaDecoder;

    /**
     * Создает экземпляр класса VideoResource для обработки видео.
     *
     * @param {ArrayBuffer} videoBuffer - ArrayBuffer, содержащий данные видео.
     */
    constructor(videoBuffer: ArrayBuffer) {
        this.mediaProcessor = new MediaDecoder({
            target: videoBuffer,
        });

        this.process();
    }

    private async process() {
        const info = await this.mediaProcessor.getMediaInfo();

        console.log('info', info);

        this.mediaProcessor.onReadyAudioFrames(result => console.log('audio', result));
        this.mediaProcessor.onReadyVideoFrames(result => console.log('video', result));

        this.mediaProcessor.processMedia();
    }
}
