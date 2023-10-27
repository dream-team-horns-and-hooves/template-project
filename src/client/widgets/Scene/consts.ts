export const Positions = ["top", "right", "bottom", "left", "center"]

export enum Quality {
  FullHD = '1080р',
  HD = '720р',
  ED = '480р',
}

export const Text = {
  placeholderLabel: 'Выберите в каком качестве хотите сохранить видео',
  placeholderFullHD: Quality.FullHD,
  placeholderHD: Quality.HD,
  placeholderED: Quality.ED,
}