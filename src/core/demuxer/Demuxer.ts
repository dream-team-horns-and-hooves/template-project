import mp4box from 'mp4box';
import type { MP4VideoTrack, MP4AudioTrack } from 'mp4box';
import type { IMP4BoxFile, DemultiplexCallback, VideoTrackInfo, AudioTrackInfo } from '@/core/types/demuxer';

import { MP4BoxFile } from './MP4BoxFile';

/*
    * Demuxer (от английского "demultiplexer") - это компонент или программа, которая выполняет процесс демультиплексирования.
    * Демультиплексирование - это процесс разбора и извлечения различных компонентов (или потоков) из многоканального или многокомпонентного источника данных.

    Demuxer выполняет следующие основные функции:
        * Разбор данных: Demuxer разбирает входные данные и определяет, какие компоненты данных
            (например, аудио, видео, текстовые данные) содержатся в исходном потоке.

        * Извлечение потоков: После разбора данных Demuxer извлекает отдельные потоки данных для каждой компоненты.
            Например, в случае видеофайла Demuxer извлечет видеопоток и аудио-поток.

        * Передача потоков декодерам: Эти извлеченные потоки данных затем передаются соответствующим декодерам (например, видео-декодерам и аудио-декодерам),
            которые декодируют данные и делают их доступными для воспроизведения или дальнейшей обработки.
*/

export class Demuxer {
    private source: IMP4BoxFile;

    private videoTrack: MP4VideoTrack | null = null;
    private audioTrack: MP4AudioTrack | null = null;

    /**
     * Создает экземпляр класса Demuxer и инициализирует его.
     *
     * @param {ArrayBuffer} buffer - ArrayBuffer, содержащий данные MP4-файла.
     */
    constructor(buffer: ArrayBuffer) {
        this.source = new MP4BoxFile(buffer);
        this.parseMediaMetadata();
    }

    /**
     * Получает информацию о видео-треке, если он есть.
     *
     * @returns {VideoTrackInfo | null} Информация о видео-треке, такая как длительность, частота кадров, кодек и прочее.
     */
    getVideoTrackInfo(): VideoTrackInfo | null {
        if (this.videoTrack == null) return null;

        const { id, duration, timescale, codec, bitrate, nb_samples, track_width, track_height } = this.videoTrack;

        const durationInMilliseconds = (duration / timescale) * 1000;
        const framerate = Math.round(1000 / (durationInMilliseconds / nb_samples));

        return {
            id,
            duration,
            durationInMilliseconds,
            framerate,
            bitrate,
            timescale,
            codec,
            extradata: this.getVideoDescription(this.videoTrack),
            totalSamples: nb_samples,
            originalWidth: track_width,
            originalHeight: track_height,
        };
    }

    /**
     * Получает информацию о аудио-треке, если он есть.
     *
     * @returns {AudioTrackInfo | null} Информация о аудио-треке, такая как длительность, битрейт, кодек и прочее.
     */
    getAudioTrackInfo(): AudioTrackInfo | null {
        if (this.audioTrack == null) return null;

        const { id, duration, audio, timescale, codec, bitrate, nb_samples } = this.audioTrack;

        const durationInMilliseconds = (duration / timescale) * 1000;

        return {
            id,
            duration,
            durationInMilliseconds,
            timescale,
            codec,
            bitrate,
            channelCount: audio.channel_count,
            sampleRate: audio.sample_rate,
            totalSamples: nb_samples,
        };
    }

    /**
     * Освобождает память, выделенную для использованных samples (как для видео, так и для аудио).
     *
     * @param {number} trackId - Идентификатор трека, для которого освобождается память.
     * @param {number} countSamples - Количество использованных samples, для которых освобождается память.
     */
    deleteUsedVideoSamples(trackId: number, countSamples: number) {
        this.source.releaseMemoryUpToSample(trackId, countSamples);
    }

    /**
     * Начинает демультиплексирование видео-трека и передает данные через функцию обратного вызова.
     *
     * @param {number} trackId - ID трека, для которого начинается обработка.
     * @param {DemultiplexCallback} cb - Функция обратного вызова для получения данных (samples) для видео или аудио.
     */
    demultiplex(trackId: number, cb: DemultiplexCallback) {
        this.source.start(trackId, cb);
    }

    /**
     * Извлекает информацию о видео и аудио из метаданных медиа.
     *
     * @private
     */
    private parseMediaMetadata() {
        let info = this.source.getFileInfo();

        if (info.videoTracks.length > 0) this.videoTrack = info.videoTracks[0];
        else this.videoTrack = null;

        if (info.audioTracks.length > 0) this.audioTrack = info.audioTracks[0];
        else this.audioTrack = null;
    }

    /**
     * Внутренний метод для получения заголовка видео из трека.
     *
     * @param {MP4VideoTrack} videoTrack - Видео-трек для извлечения заголовка.
     * @returns {Uint8Array} Заголовок видео.
     * @throws {Error} Если не найден avcC, hvcC, vpcC или av1C box.
     * @private
     */
    private getVideoDescription(videoTrack: MP4VideoTrack): Uint8Array {
        const trak = this.source.getTrackById(videoTrack.id);

        for (const entry of trak.mdia.minf.stbl.stsd.entries) {
            const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;

            if (box) {
                const stream = new mp4box.DataStream(undefined, 0, mp4box.DataStream.BIG_ENDIAN);
                box.write(stream);

                return new Uint8Array(stream.buffer, 8);
            }
        }

        throw new Error('avcC, hvcC, vpcC, or av1C box not found');
    }
}
