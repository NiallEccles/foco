import { app, BrowserWindow, shell, protocol } from 'electron'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { electronApp, is } from '@electron-toolkit/utils'
import { registerIpcHandlers } from './ipc'

// Must be called before app.whenReady
protocol.registerSchemesAsPrivileged([
  { scheme: 'safe-file', privileges: { secure: true, standard: true, supportFetchAPI: true, bypassCSP: true } }
])

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 10 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.foco')

  // Serve local image files via safe-file:// to bypass same-origin restrictions in dev
  protocol.handle('safe-file', async (request) => {
    try {
      const url = new URL(request.url)
      // With standard:true, "safe-file:///Users/foo/bar" is parsed as host="users", pathname="/foo/bar"
      // Reconstruct the full absolute path by prepending "/" + host
      const filePath = decodeURIComponent('/' + url.hostname + url.pathname)
      const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
      const mime: Record<string, string> = {
        jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
        webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp',
        tiff: 'image/tiff', tif: 'image/tiff', avif: 'image/avif'
      }
      const data = await readFile(filePath)
      return new Response(data, { headers: { 'Content-Type': mime[ext] ?? 'application/octet-stream' } })
    } catch (err) {
      return new Response('Not found', { status: 404 })
    }
  })

  registerIpcHandlers()
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
