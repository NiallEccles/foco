import { useEffect, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Thumbnail } from './Thumbnail'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useSettingsStore } from '../../stores/settingsStore'

const ITEM_SIZE = 84 // 80px thumbnail + 4px gap
const PADDING = 8

export function FilmStrip() {
  const { images, deletedImages, currentIndex, deletedIndex, setCurrentIndex, setDeletedIndex, folderPath, viewMode } = useWorkspaceStore()
  const { filmStripOrientation } = useSettingsStore()
  const viewportRef = useRef<HTMLDivElement>(null)
  const isHorizontal = filmStripOrientation === 'bottom'

  const activeImages = viewMode === 'deleted' ? deletedImages : images
  const activeIndex = viewMode === 'deleted' ? deletedIndex : currentIndex
  const setActiveIndex = viewMode === 'deleted' ? setDeletedIndex : setCurrentIndex

  const virtualizer = useVirtualizer({
    count: activeImages.length,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => ITEM_SIZE,
    horizontal: isHorizontal,
    overscan: 5,
    paddingStart: PADDING,
    paddingEnd: PADDING
  })

  useEffect(() => {
    if (activeImages.length > 0) {
      virtualizer.scrollToIndex(activeIndex, { behavior: 'smooth', align: 'center' })
    }
  }, [activeIndex])

  if (activeImages.length === 0 || !folderPath) return null

  const borderStyle = isHorizontal
    ? { borderTop: '1px solid var(--mantine-color-default-border)' }
    : filmStripOrientation === 'left'
      ? { borderRight: '1px solid var(--mantine-color-default-border)' }
      : { borderLeft: '1px solid var(--mantine-color-default-border)' }

  const viewportStyle = isHorizontal
    ? { height: 100, overflowX: 'auto' as const, overflowY: 'hidden' as const, ...borderStyle }
    : { width: 100, height: '100%', overflowY: 'auto' as const, overflowX: 'hidden' as const, flexShrink: 0, ...borderStyle }

  const innerStyle = isHorizontal
    ? { width: virtualizer.getTotalSize(), height: '100%', position: 'relative' as const }
    : { height: virtualizer.getTotalSize(), width: '100%', position: 'relative' as const }

  return (
    <div key={filmStripOrientation} ref={viewportRef} style={viewportStyle}>
      <div style={innerStyle}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const image = activeImages[virtualItem.index]
          return (
            <div
              key={image.path}
              style={
                isHorizontal
                  ? {
                      position: 'absolute',
                      left: virtualItem.start,
                      top: 0,
                      width: 80,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center'
                    }
                  : {
                      position: 'absolute',
                      top: virtualItem.start,
                      left: 0,
                      width: '100%',
                      height: 80,
                      display: 'flex',
                      justifyContent: 'center'
                    }
              }
            >
              <Thumbnail
                image={image}
                isSelected={virtualItem.index === activeIndex}
                index={virtualItem.index}
                folderPath={folderPath}
                onClick={setActiveIndex}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
