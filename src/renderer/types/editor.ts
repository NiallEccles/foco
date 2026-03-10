export type EditorTool = 'crop' | 'resize'

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

export interface ResizeDimensions {
  width: number
  height: number
  keepAspectRatio: boolean
  mode: 'pixels' | 'percent'
}
