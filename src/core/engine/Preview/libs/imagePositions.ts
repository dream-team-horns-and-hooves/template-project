import type { ImagePosition } from '@/core/multimedia-controller/types';

export function getCoordinatesByPosition(
    position: ImagePosition,
    width: number,
    height: number,
    canvasWidth: number,
    canvasHeight: number,
) {
    switch (position) {
        case 'top':
            return [0, 0];
        case 'right': {
            return [canvasWidth - width, 0];
        }
        case 'bottom': {
            return [0, canvasHeight - height];
        }
        case 'left': {
            return [0, 0];
        }
        case 'center': {
            return [(canvasWidth - width) / 2, (canvasHeight - height) / 2];
        }
        default:
            break;
    }
}
