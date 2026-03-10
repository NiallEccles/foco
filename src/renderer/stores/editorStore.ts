import { create } from 'zustand'
import type { EditorTool, CropRect, ResizeDimensions } from '../types/editor'

interface EditorState {
  isEditing: boolean
  activeTool: EditorTool | null
  cropRect: CropRect | null
  resizeDimensions: ResizeDimensions | null
  isDirty: boolean
  originalWidth: number
  originalHeight: number

  enterEditMode: (tool: EditorTool) => void
  exitEditMode: () => void
  setTool: (tool: EditorTool) => void
  setCropRect: (rect: CropRect | null) => void
  setResizeDimensions: (dims: ResizeDimensions) => void
  setOriginalDimensions: (width: number, height: number) => void
  setDirty: (dirty: boolean) => void
  reset: () => void
}

const defaultResize: ResizeDimensions = {
  width: 0,
  height: 0,
  keepAspectRatio: true,
  mode: 'pixels'
}

export const useEditorStore = create<EditorState>((set) => ({
  isEditing: false,
  activeTool: null,
  cropRect: null,
  resizeDimensions: null,
  isDirty: false,
  originalWidth: 0,
  originalHeight: 0,

  enterEditMode: (tool) => set({ isEditing: true, activeTool: tool, isDirty: false }),
  exitEditMode: () => set({ isEditing: false, activeTool: null, cropRect: null, resizeDimensions: null, isDirty: false }),
  setTool: (tool) => set({ activeTool: tool, cropRect: null }),
  setCropRect: (rect) => set({ cropRect: rect, isDirty: rect !== null }),
  setResizeDimensions: (dims) => set({ resizeDimensions: dims, isDirty: true }),
  setOriginalDimensions: (width, height) =>
    set({
      originalWidth: width,
      originalHeight: height,
      resizeDimensions: { ...defaultResize, width, height }
    }),
  setDirty: (dirty) => set({ isDirty: dirty }),
  reset: () =>
    set({
      isEditing: false,
      activeTool: null,
      cropRect: null,
      resizeDimensions: null,
      isDirty: false
    })
}))
