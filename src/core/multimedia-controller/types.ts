const WorkerEvent = {
    INITIALIZATION: 'INITIALIZATION',
    ADD_VIDEO: 'ADD_VIDEO',
    ADD_IMAGE: 'ADD_IMAGE',
    APPLY_FILTER_TO_VIDEO: 'APPLY_FILTER_TO_VIDEO',
    PLAY: 'PLAY',
    PAUSE: 'PAUSE',
    SWITCH_VISIBILITY_STATE: 'SWITCH_VISIBILITY_STATE',
    GET_PREVIEW_FRAME_FROM_SELECTED_VIDEO: 'GET_PREVIEW_FRAME_FROM_SELECTED_VIDEO',
    CHANGE_IMAGE_POSITION: 'CHANGE_IMAGE_POSITION',
    EXPORT: 'EXPORT',
} as const;

export type Quality = '1080р' | '720р' | '480р';

export type ImageFilter = 'grayscale' | 'sepia' | 'none';

export type ImagePosition = 'top' | 'right' | 'bottom' | 'left' | 'center';

export type WorkerEventTypes = keyof typeof WorkerEvent;

/*
    Интерфейс общего события
*/
interface CustomEvent<E extends string, P = unknown> {
    type: E;
    payload: P;
}

/*
    События To Worker
*/

/**/
interface InitializationEventPayload {
    canvas: OffscreenCanvas;
}

export type InitializationEvent = CustomEvent<(typeof WorkerEvent)['INITIALIZATION'], InitializationEventPayload>;

/**/
interface AddVideoEventPayload {
    buffer: ArrayBuffer;
}

export type AddVideoEvent = CustomEvent<(typeof WorkerEvent)['ADD_VIDEO'], AddVideoEventPayload>;

/**/
interface AddImageEventPayload {
    videoId: string;
    position?: ImagePosition;
    blob: Blob;
}

export type AddImageEvent = CustomEvent<(typeof WorkerEvent)['ADD_IMAGE'], AddImageEventPayload>;

/**/
interface ImagePositionEventPayload {
    imageId: string;
    position: ImagePosition;
}

export type ImagePositionEvent = CustomEvent<(typeof WorkerEvent)['CHANGE_IMAGE_POSITION'], ImagePositionEventPayload>;

/**/
export type PlayEvent = CustomEvent<(typeof WorkerEvent)['PLAY']>;

/**/
export type PauseEvent = CustomEvent<(typeof WorkerEvent)['PAUSE']>;

/**/
interface ExportEventPayload {
    quality: Quality;
}

export type ExportEvent = CustomEvent<(typeof WorkerEvent)['EXPORT'], ExportEventPayload>;

/**/
export interface PreviewEventPayload {
    videoId: string;
    timestamp: number;
}

export type PreviewEvent = CustomEvent<
    (typeof WorkerEvent)['GET_PREVIEW_FRAME_FROM_SELECTED_VIDEO'],
    PreviewEventPayload
>;

/**/
export interface FilterEventPayload {
    videoId: string;
    filter: ImageFilter;
}

export type FilterEvent = CustomEvent<(typeof WorkerEvent)['APPLY_FILTER_TO_VIDEO'], FilterEventPayload>;

/**/
export interface VisibilityEventPayload {
    videoId: string;
}

export type VisibilityEvent = CustomEvent<(typeof WorkerEvent)['SWITCH_VISIBILITY_STATE'], VisibilityEventPayload>;

/**/
export type WorkerEvents =
    | InitializationEvent
    | AddVideoEvent
    | AddImageEvent
    | PlayEvent
    | PauseEvent
    | PreviewEvent
    | FilterEvent
    | ExportEvent
    | VisibilityEvent
    | ImagePositionEvent;

/*
    События To Client
*/

const ClientEvent = {
    RENDER_VIDEO_FRAGMENT: 'RENDER_VIDEO_FRAGMENT',
    RENDER_IMAGE_FRAGMENT: 'RENDER_IMAGE_FRAGMENT',
    RECALCULATE_TIME: 'RECALCULATE_TIME',
    PLAYBACK_TIME: 'PLAYBACK_TIME',
    FINISH: 'FINISH',
} as const;

export type ClientEventTypes = keyof typeof ClientEvent;

/**/
export interface RenderVideoFragmentEventPayload {
    id: number;
    duration: number;
    timescale: number;
    start: number;
}

export type RenderVideoFragmentEvent = CustomEvent<
    (typeof ClientEvent)['RENDER_VIDEO_FRAGMENT'],
    RenderVideoFragmentEventPayload
>;

/**/
interface RenderImageFragmentEventPayload {
    id: string;
}

export type RenderImageFragmentEvent = CustomEvent<
    (typeof ClientEvent)['RENDER_IMAGE_FRAGMENT'],
    RenderImageFragmentEventPayload
>;

/**/
export interface RecalculateTimeEventPayload {
    times: [number, number][];
}

export type RecalculateTimeEvent = CustomEvent<(typeof ClientEvent)['RECALCULATE_TIME'], RecalculateTimeEventPayload>;

export interface PlaybackTimeEventPayload {
    videoId: string;
    timestamp: number;
}

export type PlaybackTimeEvent = CustomEvent<(typeof ClientEvent)['PLAYBACK_TIME'], PlaybackTimeEventPayload>;

/**/
export interface FinishEventPayload {
    buffer: ArrayBuffer;
}

export type FinishTimeEvent = CustomEvent<(typeof ClientEvent)['FINISH'], FinishEventPayload>;

/**/
export type ClientEvents = RenderVideoFragmentEvent | RecalculateTimeEvent | RenderImageFragmentEvent | FinishTimeEvent;
