import mp4box from 'mp4box';
import type { MP4File, MP4Info, MP4ArrayBuffer, MP4Sample, Trak } from 'mp4box';
import type { DemultiplexCallback, IMP4BoxFile } from '@/core/types/demuxer';

/*
    TODO: добавить возможность добавления buffer с помощью стрима
*/

/**
 * Представляет класс для работы с MP4-файлами с использованием библиотеки MP4Box.
 */
export class MP4BoxFile implements IMP4BoxFile {
    private file: MP4File;
    private info: MP4Info;

    private _onChunk: DemultiplexCallback;

    /**
     * Создает экземпляр класса MP4BoxFile.
     *
     * @param {ArrayBuffer} buffer - ArrayBuffer, содержащий данные MP4-файла.
     */
    constructor(buffer: ArrayBuffer) {
        this.file = mp4box.createFile();

        this.file.onError = console.error.bind(console);

        this.file.onReady = this.onReady.bind(this);
        this.file.onSamples = this.onSamples.bind(this);

        this.initializeBuffer(buffer);
    }

    /**
     * Инициализирует буфер данных.
     *
     * @param {ArrayBuffer} buffer - ArrayBuffer, содержащий данные MP4-файла.
     * @private
     */
    private initializeBuffer(buffer: ArrayBuffer) {
        const mp4Buffer = buffer as MP4ArrayBuffer;
        mp4Buffer.fileStart = 0;

        this.file.appendBuffer(mp4Buffer);
        this.file.flush();
    }

    /**
     * Обработчик события "onReady".
     *
     * @param {MP4Info} info - Информация о MP4-файле.
     * @private
     */
    private onReady(info: MP4Info) {
        this.info = info;
    }

    /**
     * Обработчик события "onSamples".
     *
     * @param {number} _track_id - Идентификатор трека.
     * @param {unknown} _ref - Пользовательский объект (не используется).
     * @param {MP4Sample[]} samples - Samples.
     * @private
     */
    private onSamples(_track_id: number, _ref: unknown, samples: MP4Sample[]) {
        this._onChunk(samples);
    }

    /**
     * Выбирает трек для обработки по его ID.
     *
     * @param {number} trackId - ID трека.
     * @private
     */
    private selectTrack(trackId: number) {
        this.file.setExtractionOptions(trackId, null, { nbSamples: 500 });
    }

    /**
     * Получает информацию о MP4-файле.
     *
     * @returns {MP4Info} Информация о MP4-файле.
     */
    getFileInfo(): MP4Info {
        return this.info;
    }

    /**
     * Получает трек по его идентификатору.
     *
     * @param {number} trackId - Идентификатор трека для получения.
     * @returns {Trak | null} Трек с указанным идентификатором или null, если не найден.
     */
    getTrackById(trackId: number): Trak | null {
        return this.file.getTrackById(trackId);
    }

    /**
     * Освобождает память, выделенную для данных samples для указанного трека до указанного номера sample (исключая этот номер).
     *
     * @param {number} trackId - Идентификатор трека, для которого будут получены samples.
     * @param {number} sampleNumber - Номер sample, до которого следует освободить память (исключая этот номер).
     */
    releaseMemoryUpToSample(trackId: number, sampleNumber: number) {
        this.file.releaseUsedSamples(trackId, sampleNumber);
    }

    /**
     * Начинает обработку MP4-файла для указанного трека (по его ID).
     *
     * @param {number} trackId - ID трека, для которого начинается обработка.
     * @param {DemultiplexCallback} callback - Функция обратного вызова для получения данных samples.
     */
    start(trackId: number, callback: DemultiplexCallback) {
        this._onChunk = callback;

        this.selectTrack(trackId);
        this.file.start();
    }

    /**
     * Останавливает обработку MP4-файла.
     */
    stop() {
        this.file.stop();
    }
}
