import { registerFileHandlers } from './fileHandlers'
import { registerImageHandlers } from './imageHandlers'

export function registerIpcHandlers(): void {
  registerFileHandlers()
  registerImageHandlers()
}
