import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from './editorStore'

const initialState = {
  isEditing: false,
  activeTool: null,
  cropRect: null,
  resizeDimensions: null,
  isDirty: false,
  originalWidth: 0,
  originalHeight: 0,
}

beforeEach(() => {
  useEditorStore.setState(initialState)
})

describe('initial state', () => {
  it('is not editing', () => {
    expect(useEditorStore.getState().isEditing).toBe(false)
  })

  it('has no active tool', () => {
    expect(useEditorStore.getState().activeTool).toBeNull()
  })

  it('is not dirty', () => {
    expect(useEditorStore.getState().isDirty).toBe(false)
  })
})

describe('enterEditMode', () => {
  it('sets isEditing to true and sets active tool', () => {
    useEditorStore.getState().enterEditMode('crop')
    const { isEditing, activeTool } = useEditorStore.getState()
    expect(isEditing).toBe(true)
    expect(activeTool).toBe('crop')
  })

  it('resets isDirty when entering edit mode', () => {
    useEditorStore.setState({ isDirty: true })
    useEditorStore.getState().enterEditMode('resize')
    expect(useEditorStore.getState().isDirty).toBe(false)
  })
})

describe('exitEditMode', () => {
  it('clears all edit state', () => {
    useEditorStore.setState({
      isEditing: true,
      activeTool: 'crop',
      cropRect: { x: 10, y: 10, width: 50, height: 50 },
      isDirty: true,
    })
    useEditorStore.getState().exitEditMode()
    const state = useEditorStore.getState()
    expect(state.isEditing).toBe(false)
    expect(state.activeTool).toBeNull()
    expect(state.cropRect).toBeNull()
    expect(state.isDirty).toBe(false)
  })
})

describe('setTool', () => {
  it('updates activeTool and clears cropRect', () => {
    useEditorStore.setState({
      activeTool: 'crop',
      cropRect: { x: 5, y: 5, width: 20, height: 20 },
    })
    useEditorStore.getState().setTool('resize')
    const { activeTool, cropRect } = useEditorStore.getState()
    expect(activeTool).toBe('resize')
    expect(cropRect).toBeNull()
  })
})

describe('setCropRect', () => {
  it('sets cropRect and marks dirty when rect is not null', () => {
    const rect = { x: 0, y: 0, width: 100, height: 100 }
    useEditorStore.getState().setCropRect(rect)
    expect(useEditorStore.getState().cropRect).toEqual(rect)
    expect(useEditorStore.getState().isDirty).toBe(true)
  })

  it('sets isDirty to false when rect is null', () => {
    useEditorStore.setState({ isDirty: true })
    useEditorStore.getState().setCropRect(null)
    expect(useEditorStore.getState().isDirty).toBe(false)
  })
})

describe('setResizeDimensions', () => {
  it('updates resizeDimensions and marks dirty', () => {
    const dims = { width: 800, height: 600, keepAspectRatio: true, mode: 'pixels' as const }
    useEditorStore.getState().setResizeDimensions(dims)
    expect(useEditorStore.getState().resizeDimensions).toEqual(dims)
    expect(useEditorStore.getState().isDirty).toBe(true)
  })
})

describe('setOriginalDimensions', () => {
  it('stores original dimensions and initialises resizeDimensions to match', () => {
    useEditorStore.getState().setOriginalDimensions(1920, 1080)
    const { originalWidth, originalHeight, resizeDimensions } = useEditorStore.getState()
    expect(originalWidth).toBe(1920)
    expect(originalHeight).toBe(1080)
    expect(resizeDimensions?.width).toBe(1920)
    expect(resizeDimensions?.height).toBe(1080)
    expect(resizeDimensions?.keepAspectRatio).toBe(true)
  })
})

describe('reset', () => {
  it('restores all fields to initial values', () => {
    useEditorStore.setState({
      isEditing: true,
      activeTool: 'crop',
      cropRect: { x: 1, y: 1, width: 10, height: 10 },
      isDirty: true,
    })
    useEditorStore.getState().reset()
    const state = useEditorStore.getState()
    expect(state.isEditing).toBe(false)
    expect(state.activeTool).toBeNull()
    expect(state.cropRect).toBeNull()
    expect(state.isDirty).toBe(false)
  })
})
