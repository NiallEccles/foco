import { AppShell as MantineAppShell } from '@mantine/core'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'
import { ImageViewer } from '../viewer/ImageViewer'
import { ViewerToolbar } from '../viewer/ViewerToolbar'
import { FilmStrip } from '../gallery/FilmStrip'
import { EmptyState } from '../gallery/EmptyState'
import { EditorCanvas } from '../editor/EditorCanvas'
import { useImages } from '../../hooks/useImages'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { useEditorStore } from '../../stores/editorStore'

export function AppLayout() {
  const { currentImage, folderPath } = useImages()
  const { isEditing } = useEditorStore()
  useKeyboardShortcuts()

  return (
    <MantineAppShell
      navbar={{ width: 220, breakpoint: 'sm' }}
      style={{ height: '100vh' }}
    >
      <MantineAppShell.Navbar>
        <Sidebar />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          paddingTop: 0
        }}
      >
        {!folderPath ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState />
          </div>
        ) : isEditing && currentImage ? (
          // Editor mode: no film strip, no viewer toolbar
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <EditorCanvas image={currentImage} />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-hidden">
              <ImageViewer image={currentImage} />
            </div>
            <ViewerToolbar currentImage={currentImage} />
            <FilmStrip />
            <StatusBar />
          </>
        )}
      </MantineAppShell.Main>
    </MantineAppShell>
  )
}
