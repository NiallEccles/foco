import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('exifr', () => ({
  default: {
    parse: vi.fn(),
    gps: vi.fn(),
  },
}))

import exifr from 'exifr'
import { getExifData } from './exifService'

const mockParse = vi.mocked(exifr.parse)
const mockGps = vi.mocked(exifr.gps)

beforeEach(() => {
  vi.clearAllMocks()
  mockGps.mockResolvedValue(null)
})

describe('getExifData', () => {
  it('returns null when exifr.parse returns null', async () => {
    mockParse.mockResolvedValue(null)
    const result = await getExifData('/some/image.jpg')
    expect(result).toBeNull()
  })

  it('returns null when parsed object is empty (no matching fields)', async () => {
    mockParse.mockResolvedValue({})
    const result = await getExifData('/some/image.jpg')
    expect(result).toBeNull()
  })

  it('maps Make and Model fields, trimming whitespace', async () => {
    mockParse.mockResolvedValue({ Make: ' Canon ', Model: ' EOS R5 ' })
    const result = await getExifData('/some/image.jpg')
    expect(result?.make).toBe('Canon')
    expect(result?.model).toBe('EOS R5')
  })

  it('maps ISO, FNumber, ExposureTime, FocalLength', async () => {
    mockParse.mockResolvedValue({
      ISO: 400,
      FNumber: 2.8,
      ExposureTime: 0.002,
      FocalLength: 85,
    })
    const result = await getExifData('/some/image.jpg')
    expect(result?.iso).toBe(400)
    expect(result?.fNumber).toBe(2.8)
    expect(result?.exposureTime).toBe(0.002)
    expect(result?.focalLength).toBe(85)
  })

  it('maps LensModel field', async () => {
    mockParse.mockResolvedValue({ LensModel: 'EF 85mm f/1.4L IS USM' })
    const result = await getExifData('/some/image.jpg')
    expect(result?.lensModel).toBe('EF 85mm f/1.4L IS USM')
  })

  it('converts Date object DateTimeOriginal to ISO string', async () => {
    const date = new Date('2024-06-15T10:30:00Z')
    mockParse.mockResolvedValue({ DateTimeOriginal: date })
    const result = await getExifData('/some/image.jpg')
    expect(result?.dateTimeOriginal).toBe(date.toISOString())
  })

  it('keeps string DateTimeOriginal as-is', async () => {
    mockParse.mockResolvedValue({ DateTimeOriginal: '2024:06:15 10:30:00' })
    const result = await getExifData('/some/image.jpg')
    expect(result?.dateTimeOriginal).toBe('2024:06:15 10:30:00')
  })

  it('extracts GPS coordinates when present', async () => {
    mockParse.mockResolvedValue({ Make: 'Sony' })
    mockGps.mockResolvedValue({ latitude: 48.8566, longitude: 2.3522 })
    const result = await getExifData('/some/image.jpg')
    expect(result?.gpsLatitude).toBeCloseTo(48.8566)
    expect(result?.gpsLongitude).toBeCloseTo(2.3522)
  })

  it('omits GPS fields when no GPS data', async () => {
    mockParse.mockResolvedValue({ ISO: 100 })
    mockGps.mockResolvedValue(null)
    const result = await getExifData('/some/image.jpg')
    expect(result?.gpsLatitude).toBeUndefined()
    expect(result?.gpsLongitude).toBeUndefined()
  })

  it('returns null when exifr.parse throws', async () => {
    mockParse.mockRejectedValue(new Error('Corrupt file'))
    const result = await getExifData('/some/corrupt.jpg')
    expect(result).toBeNull()
  })

  it('omits GPS when exifr.gps throws', async () => {
    mockParse.mockResolvedValue({ ISO: 200 })
    mockGps.mockRejectedValue(new Error('No GPS'))
    const result = await getExifData('/some/image.jpg')
    expect(result?.iso).toBe(200)
    expect(result?.gpsLatitude).toBeUndefined()
  })
})
