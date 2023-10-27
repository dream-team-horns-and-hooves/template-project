import { Demuxer } from '@/core/demuxer';
import { AbstractMediaTrackDecoder } from './AbstractMediaTrackDecoder';

import type { AudioDecoderOptions, AudioSample, DecodedAudioFrame, GettingSamplesStatus } from '@/core/types/decoder';
import type { AudioTrackInfo } from '@/core/types/demuxer';

/**
 * Класс `AudioTrackDecoder` представляет собой декодер аудио-треков.
 * Он наследует абстрактный класс `AbstractMediaTrackDecoder`.
 */
export class AudioTrackDecoder extends AbstractMediaTrackDecoder<DecodedAudioFrame> {
    private decoder: AudioDecoder;
    private trackInfo: AudioTrackInfo | null;

    private chunks: EncodedAudioChunk[] = [];

    /**
     * Создает экземпляр класса `AudioTrackDecoder`.
     *
     * @param {Demuxer} demuxer - Объект Demuxer, предоставляющий доступ к данным аудио-трека.
     * @param {AudioDecoderOptions} options - Дополнительные опции для настройки декодера аудио.
     */
    constructor(demuxer: Demuxer, options: AudioDecoderOptions = {}) {
        super(demuxer, options);

        this.trackInfo = this.demuxer.getAudioTrackInfo();

        if (this.trackInfo) {
            this.setStatus('ready-to-initialize');
        }
    }

    /**
     * Инициализирует декодер аудио.
     *
     * @returns {Promise<void>} Promise, разрешающийся после инициализации декодера.
     * @public
     */
    public async initializeDecoder(): Promise<void> {
        if (this.status !== 'ready-to-initialize') return;

        this.decoder = new AudioDecoder({
            output: audioFrame => {
                this.saveFrame(audioFrame);
            },
            error: err => {
                console.error('Audio Decoder error : ', err);
            },
        });

        const config = {
            codec: this.trackInfo.codec,
            sampleRate: this.trackInfo.sampleRate,
            numberOfChannels: this.trackInfo.channelCount,
        };

        const isConfigSupported = await AudioEncoder.isConfigSupported(config);

        if (isConfigSupported.supported === false) {
            throw new Error('Incorrect audio decoder configuration');
        }

        this.decoder.configure(config);
        this.setStatus('initialized');
    }

    /**
     * Получает информацию о аудио-треке.
     *
     * @returns {AudioTrackInfo | null} Информация о аудио-треке и null, если информация отсутствует
     * @public
     */
    public getTrackInfo(): AudioTrackInfo | null {
        return this.trackInfo;
    }

    /**
     * Получает готовые аудио-samples для декодирования.
     *
     * @returns {Promise<GettingSamplesStatus>} Promise, разрешающийся после получения samples.
     * @public
     */
    public async getReadySamples(): Promise<EncodedAudioChunk[] | null> {
        if (this.status !== 'initialized') return Promise.resolve(null);

        return new Promise(resolve => {
            this.demuxer.demultiplex(this.trackInfo.id, samples => {
                this.samplesCount += samples.length;

                samples.forEach(sample => {
                    const chunk = this.makeChunk(sample);
                    this.chunks.push(chunk);
                });

                if (this.samplesCount === this.trackInfo.totalSamples) {
                    this.emitter.emit('demuxing-complete');
                    resolve(this.chunks);
                }
            });
        });
    }

    /**
     * Создает аудио-chunk для декодированного аудио-sample.
     *
     * @param {AudioSample} sample - Аудио-sample для создания аудио-chunk.
     * @returns {EncodedAudioChunk} - Созданный аудио-chunk.
     * @private
     */
    private makeChunk(sample: AudioSample): EncodedAudioChunk {
        const type = sample.is_sync ? 'key' : 'delta';

        return new EncodedAudioChunk({
            type,
            timestamp: sample.cts,
            duration: sample.duration,
            data: sample.data,
        });
    }

    /**
     * Сохраняет декодированный аудио-фрейм и отправляет его по мере накопления.
     *
     * @param {AudioData} frame - Декодированный аудио-фрейм.
     * @private
     */
    private saveFrame(frame: AudioData) {
        this.frames.push(frame);
        this.decodedFramesCount += 1;

        // this.sendFrames();

        if (this.isDecodingComplete) {
            this.emitter.emit('decoded-complete');
        }
    }

    /**
     * @protected
     */
    protected async onDemuxComplete() {
        console.log('AUDIO onDemuxComplete');
        await this.decoder.flush();
        this.demuxer.deleteUsedVideoSamples(this.trackInfo.id, this.trackInfo.totalSamples);
    }

    /**
     * @protected
     */
    protected async onDecodeComplete() {
        console.log('AUDIO onDecodeComplete');
        super.onDecodeComplete();

        await this.decoder.flush();
        this.decoder.close();
    }
}
