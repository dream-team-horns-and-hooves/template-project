import { type MP4Sample } from 'mp4box';
import { type AudioTrackInfo, type VideoTrackInfo } from '@/core/demuxer';

export interface MediaInfo {
    video: VideoTrackInfo;
    audio: AudioTrackInfo;
}

export interface DecodedVideoFrame {
    duration: number;
    timestamp: number;
    image: ImageBitmap;
}

export type DecodedAudioFrame = AudioData;

export type VideoSample = MP4Sample;
export type AudioSample = MP4Sample;

export interface DecodedFramesResult<T> {
    value?: T[];
    done: boolean;
}

export type DecodedVideoFramesResult = DecodedFramesResult<DecodedVideoFrame>;
export type DecodedAudioFramesResult = DecodedFramesResult<DecodedAudioFrame>;

export type DecodedVideoFramesResultFn = (result: DecodedVideoFramesResult) => void;
export type DecodedAudioFramesResultFn = (result: DecodedAudioFramesResult) => void;

export interface DecoderOptions {
    outputVideoFramesSize?: number;
    outputAudioFramesSize?: number;
}

export interface VideoDecoderOptions {
    outputFramesSize?: DecoderOptions['outputVideoFramesSize'];
}

export interface AudioDecoderOptions {
    outputFramesSize?: DecoderOptions['outputAudioFramesSize'];
}

export interface GettingSamplesStatus {
    status: 'ok' | 'wrong';
    message?: string;
}
