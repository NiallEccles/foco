import exifr from 'exifr'

export interface ExifData {
  make?: string
  model?: string
  lensModel?: string
  iso?: number
  fNumber?: number
  exposureTime?: number
  focalLength?: number
  dateTimeOriginal?: string
  gpsLatitude?: number
  gpsLongitude?: number
}

export async function getExifData(imagePath: string): Promise<ExifData | null> {
  try {
    const parsed = await exifr.parse(imagePath, {
      pick: [
        'Make', 'Model', 'LensModel',
        'ISO', 'FNumber', 'ExposureTime', 'FocalLength',
        'DateTimeOriginal'
      ],
      translateValues: false
    })

    if (!parsed) return null

    const data: ExifData = {}

    if (parsed.Make) data.make = parsed.Make.trim()
    if (parsed.Model) data.model = parsed.Model.trim()
    if (parsed.LensModel) data.lensModel = parsed.LensModel.trim()
    if (parsed.ISO != null) data.iso = parsed.ISO
    if (parsed.FNumber != null) data.fNumber = parsed.FNumber
    if (parsed.ExposureTime != null) data.exposureTime = parsed.ExposureTime
    if (parsed.FocalLength != null) data.focalLength = parsed.FocalLength
    if (parsed.DateTimeOriginal) {
      data.dateTimeOriginal = parsed.DateTimeOriginal instanceof Date
        ? parsed.DateTimeOriginal.toISOString()
        : String(parsed.DateTimeOriginal)
    }
    try {
      const gps = await exifr.gps(imagePath)
      if (gps?.latitude != null && gps?.longitude != null) {
        data.gpsLatitude = gps.latitude
        data.gpsLongitude = gps.longitude
      }
    } catch {
      // no GPS data
    }

    return Object.keys(data).length > 0 ? data : null
  } catch {
    return null
  }
}
