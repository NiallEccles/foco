import { useEffect, useRef, useState } from 'react'
import { Box, Skeleton } from '@mantine/core'
import type { ImageFile } from '../../types/image'
import { useThumbnailStore } from '../../stores/thumbnailStore'

interface ThumbnailProps {
  image: ImageFile
  isSelected: boolean
  index: number
  folderPath: string
  onClick: (index: number) => void
}

export function Thumbnail({ image, isSelected, index, folderPath, onClick }: ThumbnailProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const cache = useThumbnailStore((s) => s.cache)
  const requestThumbnail = useThumbnailStore((s) => s.requestThumbnail)
  const thumbnailUrl = cache.get(image.path)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (inView && !thumbnailUrl) {
      requestThumbnail(image.path, folderPath)
    }
  }, [inView, thumbnailUrl, image.path, folderPath, requestThumbnail])

  return (
    <Box
      ref={ref}
      onClick={() => onClick(index)}
      className="cursor-pointer"
      style={{
        width: 80,
        height: 80,
        flexShrink: 0,
        border: isSelected ? '2px solid var(--mantine-color-blue-6)' : '2px solid transparent',
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'border-color 0.1s'
      }}
    >
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={image.name}
          style={{ width: 76, height: 76, objectFit: 'cover', display: 'block' }}
          draggable={false}
        />
      ) : (
        <Skeleton width={76} height={76} radius={0} animate={inView} />
      )}
    </Box>
  )
}
