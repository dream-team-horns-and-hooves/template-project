export interface TimelineProps {
  data: TimelineData
}
export interface TimelineData {
  id: number,
  start: number,
  end: number,
  duration: number,
  timescale: number,
  countChunks: number
}