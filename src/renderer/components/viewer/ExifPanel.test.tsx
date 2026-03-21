import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../../test/helpers/testUtils'
import { ExifPanel } from './ExifPanel'
import { useWorkspaceStore } from '../../stores/workspaceStore'

// Mock useExif to avoid the module-level cache and async API calls in component tests
vi.mock('../../hooks/useExif', () => ({
  useExif: vi.fn(),
}))

// Mock GpsMap to avoid leaflet dependency
vi.mock('./GpsMap', () => ({
  GpsMap: () => <div data-testid="gps-map" />,
}))

import { useExif } from '../../hooks/useExif'
const mockUseExif = vi.mocked(useExif)

const IMAGE = { name: 'photo.jpg', path: '/folder/photo.jpg', size: 1000, mtime: '' }

beforeEach(() => {
  useWorkspaceStore.setState({
    images: [IMAGE],
    deletedImages: [],
    currentIndex: 0,
    isLoading: false,
    viewMode: 'browse',
    folderPath: '/folder',
    deletedIndex: 0,
  })
  vi.clearAllMocks()
})

describe('ExifPanel', () => {
  it('renders "No EXIF data available" when exif is null', () => {
    mockUseExif.mockReturnValue({ exif: null, loading: false })
    renderWithProviders(<ExifPanel />)
    expect(screen.getByText(/no exif data/i)).toBeInTheDocument()
  })

  it('shows loading state while fetching', () => {
    mockUseExif.mockReturnValue({ exif: null, loading: true })
    renderWithProviders(<ExifPanel />)
    expect(screen.queryByText(/no exif data/i)).not.toBeInTheDocument()
    // Mantine Skeleton is rendered while loading
    expect(screen.queryByText('Camera')).not.toBeInTheDocument()
  })

  it('renders Make and Model under Camera section', () => {
    mockUseExif.mockReturnValue({
      exif: { make: 'Canon', model: 'EOS R5' },
      loading: false,
    })
    renderWithProviders(<ExifPanel />)
    expect(screen.getByText('Camera')).toBeInTheDocument()
    expect(screen.getByText(/canon eos r5/i)).toBeInTheDocument()
  })

  it('renders ISO, aperture, shutter speed, focal length', () => {
    mockUseExif.mockReturnValue({
      exif: { iso: 400, fNumber: 2.8, exposureTime: 0.002, focalLength: 85 },
      loading: false,
    })
    renderWithProviders(<ExifPanel />)
    expect(screen.getByText('400')).toBeInTheDocument()
    expect(screen.getByText('f/2.8')).toBeInTheDocument()
    expect(screen.getByText('1/500s')).toBeInTheDocument()
    expect(screen.getByText('85mm')).toBeInTheDocument()
  })

  it('renders GPS section with map when coordinates are present', () => {
    mockUseExif.mockReturnValue({
      exif: { gpsLatitude: 48.8566, gpsLongitude: 2.3522 },
      loading: false,
    })
    renderWithProviders(<ExifPanel />)
    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByTestId('gps-map')).toBeInTheDocument()
  })

  it('renders lens model when present', () => {
    mockUseExif.mockReturnValue({
      exif: { make: 'Sony', model: 'A7 IV', lensModel: 'FE 24-70mm F2.8 GM' },
      loading: false,
    })
    renderWithProviders(<ExifPanel />)
    expect(screen.getByText('FE 24-70mm F2.8 GM')).toBeInTheDocument()
  })
})
