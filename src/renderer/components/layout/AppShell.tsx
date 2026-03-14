import { AppShell as MantineAppShell } from '@mantine/core'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'
import { TitleBar } from './TitleBar'
import { ImageViewer } from '../viewer/ImageViewer'
import { ViewerToolbar } from '../viewer/ViewerToolbar'
import { FilmStrip } from '../gallery/FilmStrip'
import { EmptyState } from '../gallery/EmptyState'
import { EditorCanvas } from '../editor/EditorCanvas'
import { ExifPanel } from '../viewer/ExifPanel'
import { useImages } from '../../hooks/useImages'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { useEditorStore } from '../../stores/editorStore'
import { useSettingsStore } from '../../stores/settingsStore'

export function AppLayout() {
  const { currentImage, folderPath, viewMode } = useImages()
  const { isEditing } = useEditorStore()
  const { filmStripOrientation, exifPanelOpen } = useSettingsStore()
  useKeyboardShortcuts()

  const showExifPanel = exifPanelOpen && !isEditing && !!currentImage

  return (
    <MantineAppShell
      header={{ height: 38 }}
      navbar={{ width: 220, breakpoint: 'sm' }}
      aside={showExifPanel ? { width: 260, breakpoint: 'sm' } : undefined}
      style={{ height: '100vh' }}
    >
      <MantineAppShell.Header style={{ padding: 0, border: 'none' }}>
        <TitleBar />
      </MantineAppShell.Header>

      <MantineAppShell.Navbar>
        <Sidebar />
      </MantineAppShell.Navbar>

      {showExifPanel && (
        <MantineAppShell.Aside>
          <ExifPanel />
        </MantineAppShell.Aside>
      )}

      <MantineAppShell.Main
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - var(--app-shell-header-height, 38px))',
          paddingTop: 0
        }}
      >
        {!folderPath ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState />
          </div>
        ) : isEditing && currentImage && viewMode !== 'deleted' ? (
          // Editor mode: no film strip, no viewer toolbar
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <EditorCanvas image={currentImage} />
          </div>
        ) : filmStripOrientation === 'bottom' ? (
          <>
            <div className="flex-1 overflow-hidden">
              <ImageViewer image={currentImage} />
            </div>
            <ViewerToolbar currentImage={currentImage} />
            <FilmStrip />
            <StatusBar />
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'row', flex: 1, overflow: 'hidden' }}>
            {filmStripOrientation === 'left' && <FilmStrip />}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div className="flex-1 overflow-hidden">
                <ImageViewer image={currentImage} />
              </div>
              <ViewerToolbar currentImage={currentImage} />
              <StatusBar />
            </div>
            {filmStripOrientation === 'right' && <FilmStrip />}
          </div>
        )}
      </MantineAppShell.Main>
    </MantineAppShell>
  )
}
