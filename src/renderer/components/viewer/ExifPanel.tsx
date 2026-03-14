import { Stack, Text, Divider, Skeleton, ScrollArea, Group, CopyButton, ActionIcon, Tooltip } from '@mantine/core'
import { Copy, Check } from 'lucide-react'
import { useImages } from '../../hooks/useImages'
import { useExif } from '../../hooks/useExif'

function formatShutter(exposureTime: number): string {
  if (exposureTime >= 1) return `${exposureTime}s`
  const denom = Math.round(1 / exposureTime)
  return `1/${denom}s`
}

function formatGps(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lonDir = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

interface RowProps {
  label: string
  value: string
}

function Row({ label, value }: RowProps) {
  return (
    <Group justify="space-between" gap="xs" wrap="nowrap">
      <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Text size="xs" ta="right" style={{ wordBreak: 'break-word' }}>
        {value}
      </Text>
    </Group>
  )
}

export function ExifPanel() {
  const { currentImage } = useImages()
  const { exif, loading } = useExif(currentImage?.path ?? null)

  const cameraName = [exif?.make, exif?.model]
    .filter(Boolean)
    .join(' ')
    .replace(/^(\S+)\s+\1\s+/, '$1 ') // deduplicate if make is repeated in model

  const gpsString = exif?.gpsLatitude != null && exif?.gpsLongitude != null
    ? formatGps(exif.gpsLatitude, exif.gpsLongitude)
    : null

  return (
    <ScrollArea h="100%" style={{ borderLeft: '1px solid var(--mantine-color-default-border)' }}>
      <Stack p="sm" gap="xs">
        <Text size="xs" fw={600} tt="uppercase" c="dimmed">
          Image Info
        </Text>
        <Divider />

        {loading ? (
          <Stack gap="xs">
            <Skeleton height={12} radius="sm" />
            <Skeleton height={12} radius="sm" width="80%" />
            <Skeleton height={12} radius="sm" width="60%" />
          </Stack>
        ) : !exif ? (
          <Text size="xs" c="dimmed">
            No EXIF data available
          </Text>
        ) : (
          <Stack gap={6}>
            {cameraName && (
              <>
                <Text size="xs" fw={600}>Camera</Text>
                <Row label="Body" value={cameraName} />
                {exif.lensModel && <Row label="Lens" value={exif.lensModel} />}
                <Divider />
              </>
            )}

            {(exif.iso != null || exif.fNumber != null || exif.exposureTime != null || exif.focalLength != null) && (
              <>
                <Text size="xs" fw={600}>Exposure</Text>
                {exif.iso != null && <Row label="ISO" value={String(exif.iso)} />}
                {exif.fNumber != null && <Row label="Aperture" value={`f/${exif.fNumber}`} />}
                {exif.exposureTime != null && <Row label="Shutter" value={formatShutter(exif.exposureTime)} />}
                {exif.focalLength != null && <Row label="Focal length" value={`${exif.focalLength}mm`} />}
                <Divider />
              </>
            )}

            {exif.dateTimeOriginal && (
              <>
                <Text size="xs" fw={600}>Date</Text>
                <Row label="Taken" value={formatDate(exif.dateTimeOriginal)} />
                <Divider />
              </>
            )}

            {gpsString && (
              <>
                <Text size="xs" fw={600}>Location</Text>
                <Group justify="space-between" gap="xs" wrap="nowrap">
                  <Text size="xs" style={{ wordBreak: 'break-all' }}>
                    {gpsString}
                  </Text>
                  <CopyButton value={gpsString} timeout={1500}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow>
                        <ActionIcon size="xs" variant="subtle" onClick={copy}>
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </>
            )}
          </Stack>
        )}
      </Stack>
    </ScrollArea>
  )
}
