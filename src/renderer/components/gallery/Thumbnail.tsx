import { Image, Box } from '@mantine/core'
import type { ImageFile } from '../../types/image'

interface ThumbnailProps {
  image: ImageFile
  isSelected: boolean
  index: number
  onClick: (index: number) => void
}

export function Thumbnail({ image, isSelected, index, onClick }: ThumbnailProps) {
  return (
    <Box
      onClick={() => onClick(index)}
      className="cursor-pointer flex-shrink-0"
      style={{
        width: 80,
        height: 80,
        border: isSelected ? '2px solid var(--mantine-color-blue-6)' : '2px solid transparent',
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'border-color 0.1s'
      }}
    >
      <Image
        src={`safe-file://${image.path}`}
        alt={image.name}
        w={76}
        h={76}
        fit="cover"
        style={{ display: 'block' }}
      />
    </Box>
  )
}
