import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { AppLayout } from './components/layout/AppShell'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './assets/styles/global.css'

const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'sm'
})

export default function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="bottom-right" />
      <AppLayout />
    </MantineProvider>
  )
}
