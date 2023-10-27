import { EventEmitter } from '@/core/emitter';

import type { VideoDecoderOptions, DecodedFramesResult, GettingSamplesStatus } from '@/core/types/decoder';
import { Demuxer } from '@/core/demuxer';

type Events = {
    'demuxing-complete': void;
    'decoded-complete': void;
};

type Status = 'pending' | 'ready-to-initialize' | 'initialized';

const DEFAULT_OUTPUT_FRAMES_SIZE = 100;

/**
 * Абстрактный базовый класс для декодирования медиа-треков (аудио или видео).
 *
 * @abstract
 * @template T - Тип данных, представляющий декодированные кадры
 */
export abstract class AbstractMediaTrackDecoder<T> {
    /**
     * Ссылка на объект Demuxer, который используется для разбора медиа-данных.
     *
     * @protected
     * */

    protected demuxer: Demuxer;
    /**
     * Экземпляр EventEmitter, используемый для создания и управления событиями в классе.
     *
     * @protected
     */
    protected emitter: EventEmitter<Events>;

    /**
     * Статус компонента. Помогает запускать или не запускать те или иные действия по обработке медиа.
     *
     * @default 'pending'
     * @protected
     */
    protected status: Status = 'pending';

    /**
     * Размер выходной очереди фреймов. Определяет, сколько фреймов должно быть в очереди перед отправкой.
     *
     * @protected
     */
    protected outputFramesSize: number;

    /**
     * Счетчик общего количества samples (кадров) в медиа-дорожке.
     *
     * @protected
     */
    protected samplesCount: number = 0;

    /**
     * Счетчик количества декодированных фреймов
     *
     * @protected
     */
    protected decodedFramesCount: number = 0;

    /**
     * Массив для хранения декодированных фреймов
     *
     * @protected
     */
    protected frames: T[] = [];

    /**
     * callback-функция, используемая для отправки декодированных фреймов.
     * @protected
     */
    // protected _sendFramesCallback: (result: DecodedFramesResult<T>) => void;
    protected _sendFramesCallback: (frame: any) => void;

    /**
     * Создает экземпляр AbstractMediaTrackDecoder.
     *
     * @param {Demuxer} demuxer - Demuxer, предоставляющий данные медиа-трека.
     * @param {VideoDecoderOptions} options - Опции декодера видео.
     */
    constructor(demuxer: Demuxer, options: VideoDecoderOptions = {}) {
        this.emitter = new EventEmitter();

        const { outputFramesSize } = options;

        this.demuxer = demuxer;
        this.outputFramesSize = outputFramesSize ?? DEFAULT_OUTPUT_FRAMES_SIZE;

        this.emitter.once('demuxing-complete', () => this.onDemuxComplete());
        this.emitter.once('decoded-complete', () => this.onDecodeComplete());
    }

    /**
     * Инициализирует декодер медиа-трека.
     *
     * @abstract
     * @returns {Promise<void>} Promise, который разрешается после успешной инициализации.
     */
    abstract initializeDecoder(): Promise<void>;

    /**
     * Получает информацию о медиа-треке (аудио или видео).
     * @abstract
     */
    abstract getTrackInfo(): void;

    /**
     * !!!! Избавиться от any
     *
     * Получает и обрабатывает готовые для декодирования выборки медиа-трека.
     * Например, создание EncodedVideoChunk или EncodedAudioChunk. Вызов decode-метода.
     *
     * @abstract
     * @returns {Promise<GettingSamplesStatus>} Promise, который разрешается после успешной обработки выборок.
     */
    abstract getReadySamples(): Promise<any>;

    /**
     * Обработчик завершения демультиплексирования медиа-трека.
     *
     * @abstract
     */
    protected abstract onDemuxComplete(): Promise<void>;

    /**
     * Устанавливает callback для отправки декодированных кадров.
     *
     * @param {(result: DecodedFramesResult<T>) => void} callback - callback для отправки декодированных кадров.
     */
    public onFrames(callback: (result: DecodedFramesResult<T>) => void) {
        console.log('SUB');
        this._sendFramesCallback = callback;
    }

    /**
     * Отправляет декодированные кадры по мере накопления или по завершении декодирования.
     *
     * @protected
     */
    // protected sendFrames() {
    //     if (this._sendFramesCallback == null) return;

    //     if (this.isFrameOutputIntervalReached || (this.isDecodingComplete && this.frames.length > 0)) {
    //         this._sendFramesCallback({ value: this.frames, done: false });
    //         this.frames.length = 0;
    //     }
    // }
    protected sendFrames(frame: any) {
        if (this._sendFramesCallback == null) return;

        this._sendFramesCallback(frame);

        // if (this.isFrameOutputIntervalReached || (this.isDecodingComplete && this.frames.length > 0)) {

        //     this.frames.length = 0;
        // }
    }

    /**
     * Обработчик завершения декодирования медиа-трека.
     *
     * @protected
     */
    protected onDecodeComplete() {
        if (this.frames.length > 0) this.frames.length = 0;
        if (this._sendFramesCallback) {
            this._sendFramesCallback({ done: true });
        }
    }

    /**
     * Проверяет, завершено ли декодирование всех samples медиа-трека.
     *
     * @protected
     * @returns {boolean} `true`, если декодирование завершено, иначе `false`.
     */
    protected get isDecodingComplete(): boolean {
        return this.decodedFramesCount === this.samplesCount;
    }

    /**
     * Проверяет, достигнут ли интервал вывода кадров.
     *
     * @protected
     * @returns {boolean} `true`, если интервал достигнут, иначе `false`.
     */
    protected get isFrameOutputIntervalReached(): boolean {
        return this.decodedFramesCount % this.outputFramesSize === 0;
    }

    /**
     * Устанавливает статус компонента-decoder-a.
     *
     * @param {Status} updatedStatus - Новый статус, который следует установить.
     * @protected
     */
    protected setStatus(updatedStatus: Status) {
        this.status = updatedStatus;
    }
}
