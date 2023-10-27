import { VideoResource } from './VideoResource';
import { generateId } from '@/libs/generateId';

type VideoId = string;

interface VideoStorageUnit {
    id: VideoId;
    video: VideoResource;
}

/**
 * Класс VideoStorageUnits представляет хранилище обработанных видео.
 */
export class VideoStorageUnits {
    videos: Map<VideoId, VideoResource> = new Map();

    constructor() {}

    /**
     * Добавляет обработанное в хранилище на основе переданного буфера данных.
     *
     * @param {ArrayBuffer} buffer - ArrayBuffer с данными видео.
     * @returns {VideoStorageUnit} Объект, содержащий идентификатор и само обработанное видео.
     */
    addVideoToStorage(buffer: ArrayBuffer): VideoStorageUnit {
        const videoResource = new VideoResource(buffer);
        const videoId = generateId();

        this.videos.set(videoId, videoResource);

        return {
            id: videoId,
            video: videoResource,
        };
    }

    /**
     * Удаляет обработанное видео из хранилища по его идентификатору.
     *
     * @param {VideoId} id - Идентификатор видео для удаления.
     */
    removeVideoFromStorage(id: VideoId) {
        this.videos.delete(id);
    }
}
