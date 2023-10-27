export const getAllAudio = () => [...document.querySelectorAll('audio')];

export const deleteAllAudio = () => getAllAudio().map(item => item.remove());

export const createAudioNode = (file: File) => {
  let audio= document.createElement('audio');
  audio.id = `${file.name}`;
  document.getElementById('app')?.appendChild(audio)
}

export const playAudio = (file: File) => {
  const player = getAllAudio().filter(item => item.id === file.name)[0]
  player.src = URL.createObjectURL(file);

  return player;
}