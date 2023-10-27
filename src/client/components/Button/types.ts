export interface ButtonProps{
  title?: string
  icon?: string
  className?: string
  size?: string
  disabled?: boolean
  alt: string
  onClick: (e: Event) => void
}