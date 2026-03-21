import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useImageNavigation } from './useImageNavigation'
import { useWorkspaceStore } from '../stores/workspaceStore'

const IMG_A = { name: 'a.jpg', path: '/a.jpg', size: 1, mtime: '' }
const IMG_B = { name: 'b.jpg', path: '/b.jpg', size: 1, mtime: '' }
const IMG_C = { name: 'c.jpg', path: '/c.jpg', size: 1, mtime: '' }

beforeEach(() => {
  useWorkspaceStore.setState({
    images: [],
    deletedImages: [],
    currentIndex: 0,
    deletedIndex: 0,
    viewMode: 'browse',
    folderPath: null,
    isLoading: false,
  })
})

describe('browse mode', () => {
  it('returns correct total and currentIndex', () => {
    useWorkspaceStore.setState({ images: [IMG_A, IMG_B, IMG_C], currentIndex: 1 })
    const { result } = renderHook(() => useImageNavigation())
    expect(result.current.total).toBe(3)
    expect(result.current.currentIndex).toBe(1)
  })

  it('hasNext is true when not at last image', () => {
    useWorkspaceStore.setState({ images: [IMG_A, IMG_B], currentIndex: 0 })
    const { result } = renderHook(() => useImageNavigation())
    expect(result.current.hasNext).toBe(true)
  })

  it('hasNext is false at last image', () => {
    useWorkspaceStore.setState({ images: [IMG_A, IMG_B], currentIndex: 1 })
    const { result } = renderHook(() => useImageNavigation())
    expect(result.current.hasNext).toBe(false)
  })

  it('hasPrev is false at first image', () => {
    useWorkspaceStore.setState({ images: [IMG_A, IMG_B], currentIndex: 0 })
    const { result } = renderHook(() => useImageNavigation())
    expect(result.current.hasPrev).toBe(false)
  })

  it('hasPrev is true after moving forward', () => {
    useWorkspaceStore.setState({ images: [IMG_A, IMG_B], currentIndex: 1 })
    const { result } = renderHook(() => useImageNavigation())
    expect(result.current.hasPrev).toBe(true)
  })

  it('nextImage advances the store currentIndex', () => {
    useWorkspaceStore.setState({ images: [IMG_A, IMG_B], currentIndex: 0 })
    const { result } = renderHook(() => useImageNavigation())
    act(() => { result.current.nextImage() })
    expect(useWorkspaceStore.getState().currentIndex).toBe(1)
  })

  it('prevImage decrements the store currentIndex', () => {
    useWorkspaceStore.setState({ images: [IMG_A, IMG_B], currentIndex: 1 })
    const { result } = renderHook(() => useImageNavigation())
    act(() => { result.current.prevImage() })
    expect(useWorkspaceStore.getState().currentIndex).toBe(0)
  })

  it('goTo sets index directly', () => {
    useWorkspaceStore.setState({ images: [IMG_A, IMG_B, IMG_C], currentIndex: 0 })
    const { result } = renderHook(() => useImageNavigation())
    act(() => { result.current.goTo(2) })
    expect(useWorkspaceStore.getState().currentIndex).toBe(2)
  })

  it('empty list: total is 0 and hasNext/hasPrev are false', () => {
    const { result } = renderHook(() => useImageNavigation())
    expect(result.current.total).toBe(0)
    expect(result.current.hasNext).toBe(false)
    expect(result.current.hasPrev).toBe(false)
  })
})

describe('deleted mode', () => {
  it('returns deletedImages and deletedIndex', () => {
    useWorkspaceStore.setState({
      viewMode: 'deleted',
      deletedImages: [IMG_A, IMG_B],
      deletedIndex: 0,
    })
    const { result } = renderHook(() => useImageNavigation())
    expect(result.current.total).toBe(2)
    expect(result.current.currentIndex).toBe(0)
  })

  it('nextImage/prevImage operate on deletedIndex in deleted mode', () => {
    useWorkspaceStore.setState({
      viewMode: 'deleted',
      deletedImages: [IMG_A, IMG_B],
      deletedIndex: 0,
    })
    const { result } = renderHook(() => useImageNavigation())
    act(() => { result.current.nextImage() })
    expect(useWorkspaceStore.getState().deletedIndex).toBe(1)
  })
})
