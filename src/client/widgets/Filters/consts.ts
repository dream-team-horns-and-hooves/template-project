import {Filters} from "./types";

export const filters: Filters[] = [
    { label: 'Без фильтра', value: 'none', filter: 'none' },
    { label: 'Грусть', value: 'grayscale', filter: 'grayscale(100%)' },
    { label: 'Ностальгия', value: 'sepia', filter: 'sepia(100%)' },
    { label: 'Безумие', value: 'invert', filter: 'invert(100%)' },
    { label: 'Полдень', value: 'brightness', filter: 'brightness(150%)' },
    { label: 'Сумерки', value: 'darken', filter: 'brightness(50%)' },
];