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
