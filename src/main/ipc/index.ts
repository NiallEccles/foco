import { registerFileHandlers } from './fileHandlers'
import { registerImageHandlers } from './imageHandlers'
import { registerWindowHandlers } from './windowHandlers'

export function registerIpcHandlers(): void {
  registerFileHandlers()
  registerImageHandlers()
  registerWindowHandlers()
}
