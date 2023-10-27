import type { MP4Info, MP4Track, MP4Sample, Trak } from 'mp4box';

export interface IMP4BoxFile {
    getFileInfo(): MP4Info | undefined;
    getTrackById(trackId: number): Trak;
    releaseMemoryUpToSample(trackId: number, sampleNumber: number): void;
    start(track: number, callback: DemultiplexCallback): void;
    stop(): void;
}

export interface VideoTrackInfo {
    id: number;
    duration: number;
    durationInMilliseconds: number;
    framerate: number;
    bitrate: number;
    timescale: number;
    codec: string;
    extradata: Uint8Array;
    totalSamples: number;
    originalWidth: number;
    originalHeight: number;
}

export interface AudioTrackInfo {
    id: number;
    duration: number;
    durationInMilliseconds: number;
    codec: string;
    channelCount: number;
    sampleRate: number;
    bitrate: number;
    timescale: number;
    totalSamples: number;
}

export interface DemultiplexCallback {
    (samples: MP4Sample[]): void;
}
