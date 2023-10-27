export const filters = [
    { label: 'Без фильтра', value: 'none', filter: 'none' },
    { label: 'Грусть', value: 'grayscale', filter: 'grayscale(100%)' },
    { label: 'Ностальгия', value: 'sepia', filter: 'sepia(100%)' },
    { label: 'Безумие', value: 'invert', filter: 'invert(100%)' },
    { label: 'Полдень', value: 'brightness', filter: 'brightness(150%)' },
    { label: 'Сумерки', value: 'darken', filter: 'brightness(50%)' },
];

export const stubFilters = new Array(10)
    .fill(0)
    .map(
        () =>
            `rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(
                Math.random() * 255
            )}, 0.4)`
    );
