import { Demuxer } from '@/core/demuxer';

import { VideoTrackDecoder } from './VideoTrackDecoder';
import { AudioTrackDecoder } from './AudioTrackDecoder';

import type {
    DecoderOptions,
    MediaInfo,
    DecodedVideoFramesResultFn,
    DecodedAudioFramesResultFn,
} from '../types/decoder';

/**
 * Класс, представляющий декодер медиа-данных.
 */
export class Decoder {
    private demuxer: Demuxer;

    private videoDecoder: VideoTrackDecoder;
    private audioDecoder: AudioTrackDecoder;

    buffer: any;

    /**
     * Создает новый экземпляр класса Decoder.
     *
     * @param {ArrayBuffer} target - Целевые медиа-данные для декодирования.
     * @param {DecoderOptions} options - Опции для декодера.
     */
    constructor(target: ArrayBuffer, options: DecoderOptions = {}) {
        const { outputVideoFramesSize, outputAudioFramesSize } = options;

        this.demuxer = new Demuxer(target);

        this.buffer = target;

        this.videoDecoder = new VideoTrackDecoder(this.demuxer, { outputFramesSize: outputVideoFramesSize });
        this.audioDecoder = new AudioTrackDecoder(this.demuxer, { outputFramesSize: outputAudioFramesSize });
    }

    /**
     * Выполняет настройку медиа-данных для декодирования
     *
     * @returns {Promise<MediaInfo>} Объект, представляющий информацию о медиа.
     * @public
     */
    public async setupMedia(): Promise<MediaInfo> {
        const videoTrackInfo = this.videoDecoder.getTrackInfo();
        const audioTrackInfo = this.audioDecoder.getTrackInfo();

        try {
            await Promise.all([this.videoDecoder.initializeDecoder(), this.audioDecoder.initializeDecoder()]);
        } catch (error) {
            throw error;
        }

        return {
            video: videoTrackInfo,
            audio: audioTrackInfo,
        };
    }

    /**
     * Регистрирует обработчик для декодированных видео-кадров.
     *
     * @param {DecodedVideoFramesResultFn} callback - Функция обратного вызова для видео-кадров.
     * @public
     */
    onVideoFrames(callback: DecodedVideoFramesResultFn) {
        this.videoDecoder.onFrames(callback);
    }

    /**
     * Регистрирует обработчик для декодированных аудио-фреймов.
     *
     * @param {DecodedAudioFramesResultFn} callback - Функция обратного вызова для аудио-фреймов.
     * @public
     */
    onAudioFrames(callback: DecodedAudioFramesResultFn) {
        this.audioDecoder.onFrames(callback);
    }

    /**
     * Получить видео-decoder
     * @public
     */
    getVideoDecoder() {
        return this.videoDecoder.getDecoder();
    }

    /**
     * Получить аудио-decoder
     * @public
     */
    getAudioDecoder() {
        return this.audioDecoder.getDecoder();
    }

    /**
     * Начинает процесс декодирования видео-данных и возвращает результат
     * @public
     */
    async getReadyVideoChunks() {
        return await this.videoDecoder.getReadySamples();
    }

    /**
     * Начинает процесс декодирования аудио-данных и возвращает результат
     * @public
     */
    async getReadyAudioChunks() {
        return await this.audioDecoder.getReadySamples();
    }
}
