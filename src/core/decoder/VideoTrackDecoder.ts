import { Demuxer } from '@/core/demuxer';
import { AbstractMediaTrackDecoder } from './AbstractMediaTrackDecoder';

import type { VideoSample, DecodedVideoFrame, VideoDecoderOptions, GettingSamplesStatus } from '@/core/types/decoder';
import type { VideoTrackInfo } from '@/core/types/demuxer';

const sleep = async (ms: number) => await new Promise(res => setTimeout(res, ms));

// const Convert = () =>

// const frameIndex = Math.round(timestamp / 35) % frames.length;

/**
 * Класс `VideoTrackDecoder` представляет собой декодер видео-треков.
 * Он наследует абстрактный класс `AbstractMediaTrackDecoder`.
 */
export class VideoTrackDecoder extends AbstractMediaTrackDecoder<DecodedVideoFrame> {
    private decoder: VideoDecoder;
    private trackInfo: VideoTrackInfo;

    chunks: EncodedVideoChunk[] = [];

    /**
     * Создает экземпляр класса `VideoTrackDecoder`.
     *
     * @param {Demuxer} demuxer - Объект demuxer, предоставляющий доступ к данным видео-трека.
     * @param {VideoDecoderOptions} options - Дополнительные опции для настройки декодера видео.
     */
    constructor(demuxer: Demuxer, options: VideoDecoderOptions = {}) {
        super(demuxer, options);

        this.trackInfo = this.demuxer.getVideoTrackInfo();
    }

    /**
     * Инициализирует декодер видео.
     *
     * @returns {Promise<void>} Promise, разрешающийся после инициализации декодера.
     * @public
     */
    public async initializeDecoder(): Promise<void> {
        this.decoder = new VideoDecoder({
            output: videoFrame => {
                this.saveFrame(videoFrame);
            },
            error: e => {
                console.log('Video Decode Error: ', e);
                console.dir(e);
            },
        });

        /*
            TODO: Заменить на

            const { supported } = await VideoDecoder.isConfigSupported(config);
            if (supported) {
                const decoder = new VideoDecoder(init);
                decoder.configure(config);
            } else {
                Try another config.
            }
        */

        const config: VideoDecoderConfig = {
            codec: this.trackInfo.codec,
            description: this.trackInfo.extradata,
            hardwareAcceleration: 'prefer-hardware',
            optimizeForLatency: true,
        };

        const isConfigSupported = await VideoDecoder.isConfigSupported(config);

        if (isConfigSupported.supported === false) {
            throw new Error('Incorrect video decoder configuration');
        }

        this.decoder.configure(config);
    }

    /**
     * @returns {VideoTrackInfo} Информация о видео-треке.
     * @public
     */
    public getTrackInfo(): VideoTrackInfo {
        return this.demuxer.getVideoTrackInfo();
    }

    public getDecoder() {
        return this.decoder;
    }

    public async getReadySamples(): Promise<EncodedVideoChunk[]> {
        return new Promise(resolve => {
            this.demuxer.demultiplex(this.trackInfo.id, samples => {
                this.samplesCount += samples.length;

                samples.forEach(sample => {
                    const chunk = this.makeChunk(sample);
                    this.chunks.push(chunk);
                });

                resolve(this.chunks);
            });
        });
    }

    /**
     * Сохраняет декодированный фрейм, создает и отправляет фреймы по мере накопления.
     *
     * @param {VideoFrame} frame - Декодированный видео-фрейм.
     * @private
     */
    private async saveFrame(frame: VideoFrame) {
        this.sendFrames(frame);
    }

    /**
     * Создает видео-chunk для декодированного видео-sample-a.
     *
     * @param {VideoSample} sample - Видео-sample для создания видео-chunk-a.
     * @returns {EncodedVideoChunk} - Созданный видео-chunk.
     * @private
     */
    private makeChunk(sample: VideoSample): EncodedVideoChunk {
        const type = sample.is_sync ? 'key' : 'delta';

        return new EncodedVideoChunk({
            type: type,
            timestamp: sample.dts,
            duration: sample.duration,
            data: sample.data,
        });
    }

    /**
     * @protected
     */
    protected async onDemuxComplete() {
        console.log('VIDEO onDemuxComplete');

        try {
            await this.decoder.flush();
            // this.demuxer.deleteUsedVideoSamples(this.trackInfo.id, this.trackInfo.totalSamples);
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * @protected
     */
    protected async onDecodeComplete() {
        console.log('VIDEO onDecodeComplete');
        // super.onDecodeComplete();

        // try {
        //     await this.decoder.flush();
        //     this.decoder.close();
        // } catch(e) {
        //     console.log(e)
        // }
    }
}
