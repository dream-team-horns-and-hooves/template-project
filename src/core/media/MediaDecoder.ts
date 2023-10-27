import { Decoder } from '@/core/decoder';
import type { MediaInfo, DecodedVideoFramesResultFn, DecodedAudioFramesResultFn } from '@/core/types/decoder';

/**
 * Представляет собой декодер мультимедийных данных для обработки видео- и аудио-потоков.
 */
export class MediaDecoder {
    private decoder: Decoder;

    /**
     * Устанавливает функцию обратного вызова для получения декодированных видео-frames.
     * Видео-frames доставляются до потребителя кусками.
     *
     * @param {DecodedVideoFramesResultFn} callback - Функция, вызываемая при готовности видео-frames.
     * @public
     */
    public onReadyVideoFrames: (callback: DecodedVideoFramesResultFn) => void;

    /**
     * Устанавливает функцию обратного вызова для получения декодированных аудио-frames.
     * Аудио-frames доставляются до потребителя кусками.
     *
     * @param {DecodedAudioFramesResultFn} callback - Функция, вызываемая при готовности аудио-frames.
     * @public
     */
    public onReadyAudioFrames: (callback: DecodedAudioFramesResultFn) => void;

    /**
     * Создает новый экземпляр MediaDecoder.
     *
     * @param {Object} options - Конфигурационные параметры для декодера мультимедиа.
     * @param {ArrayBuffer} options.target - Мультимедийные данные в форме ArrayBuffer.
     */
    constructor({ target }: { target: ArrayBuffer }) {
        this.decoder = new Decoder(target);

        this.onReadyVideoFrames = this.decoder.onVideoFrames.bind(this.decoder);
        this.onReadyAudioFrames = this.decoder.onAudioFrames.bind(this.decoder);
    }

    /**
     * Получает информацию о мультимедийных данных и выполняет настройку.
     *
     * @returns {Promise<MediaInfo>} Promise, разрешающийся с информацией о мультимедийных данных.
     * @public
     */
    public async getMediaInfo(): Promise<MediaInfo> {
        return await this.decoder.setupMedia();
    }

    /**
     * Запускает процесс декодирования
     *
     * @public
     */
    public async processMedia() {
        // return await this.decoder.startDecode();
    }

    public async getChunks() {
        return Promise.resolve();
        // return await this.decoder.getChunks();
    }

    public getDecoder() {
        return this.decoder.getVideoDecoder();
    }
}
