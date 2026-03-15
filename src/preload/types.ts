export interface ImageFile {
  name: string
  path: string
  size: number
  mtime: string
}

export interface OpenFolderResult {
  folderPath: string
  images: ImageFile[]
}

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

export interface CropOperation {
  type: 'crop'
  rect: CropRect
}

export interface ResizeOperation {
  type: 'resize'
  width: number
  height: number
}

export type ImageOperation = CropOperation | ResizeOperation

export interface ImageMetadata {
  width: number
  height: number
}

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

export interface FocoAPI {
  windowMinimize: () => void
  windowMaximize: () => void
  windowClose: () => void
  getPlatform: () => string
  openFolder: () => Promise<OpenFolderResult | null>
  listImages: (folderPath: string) => Promise<ImageFile[]>
  softDelete: (imagePath: string, folderPath: string) => Promise<void>
  restoreImage: (deletedPath: string, folderPath: string) => Promise<string>
  listDeleted: (folderPath: string) => Promise<ImageFile[]>
  saveImage: (sourcePath: string, operations: ImageOperation[]) => Promise<void>
  saveImageAs: (sourcePath: string, operations: ImageOperation[]) => Promise<string | null>
  getImageMetadata: (imagePath: string) => Promise<ImageMetadata>
  getThumbnail: (imagePath: string, folderPath: string) => Promise<string>
  getExifData: (imagePath: string) => Promise<ExifData | null>
  openExternal: (url: string) => void
}
