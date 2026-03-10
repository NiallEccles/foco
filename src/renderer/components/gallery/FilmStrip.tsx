import { useEffect, useRef } from 'react'
import { Group, ScrollArea } from '@mantine/core'
import { Thumbnail } from './Thumbnail'
import { useWorkspaceStore } from '../../stores/workspaceStore'

export function FilmStrip() {
  const { images, currentIndex, setCurrentIndex } = useWorkspaceStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [currentIndex])

  if (images.length === 0) return null

  return (
    <ScrollArea
      style={{
        height: 100,
        borderTop: '1px solid var(--mantine-color-default-border)'
      }}
      viewportRef={scrollRef}
    >
      <Group gap={4} wrap="nowrap" p="xs">
        {images.map((image, index) => (
          <div key={image.path} ref={index === currentIndex ? selectedRef : null}>
            <Thumbnail
              image={image}
              isSelected={index === currentIndex}
              index={index}
              onClick={setCurrentIndex}
            />
          </div>
        ))}
      </Group>
    </ScrollArea>
  )
}
