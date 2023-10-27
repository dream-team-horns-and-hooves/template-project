import type { ImageFilter } from '@/core/multimedia-controller/types';

/*
    filter: grayscale(100%);
*/
function grayscale(imageData: ImageData) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = brightness;
        data[i + 1] = brightness;
        data[i + 2] = brightness;
    }

    return imageData;
}

/*
     filter: ;
*/
function sepia(imageData: ImageData) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        data[i] = r * 0.393 + g * 0.769 + b * 0.189;
        data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
        data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
    }

    return imageData;
}

/*
    filter: ;
*/
function invert(imageData: ImageData) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }

    return imageData;
}

/*
    filter: ; (Фильтр Яркости)
*/
function brightness(imageData: ImageData, factor: number = 1.5) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * factor);
        data[i + 1] = Math.min(255, data[i + 1] * factor);
        data[i + 2] = Math.min(255, data[i + 2] * factor);
    }

    return imageData;
}

/*
     filter: brightness(50%);
*/
function darken(imageData: ImageData, factor: number = 0.5) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * factor;
        data[i + 1] = data[i + 1] * factor;
        data[i + 2] = data[i + 2] * factor;
    }

    return imageData;
}

function none(imageData: ImageData) {
    return imageData;
}

const filterDictionary: Record<ImageFilter, (imageData: ImageData) => ImageData> = {
    grayscale,
    sepia,
    invert,
    brightness,
    darken,
    none,
};

export function getImageFilterFn(filterType: ImageFilter) {
    return filterDictionary[filterType];
}
