import { Minus, Square, X } from 'lucide-react'

const isMac = window.api.getPlatform() === 'darwin'

export function TitleBar() {
  return (
    <div
      style={{
        height: 38,
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        backgroundColor: 'var(--mantine-color-dark-7)',
        borderBottom: '1px solid var(--mantine-color-dark-5)',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        WebkitAppRegion: 'drag' as any,
        userSelect: 'none',
        position: 'relative'
      }}
    >
      {/* macOS traffic light spacer */}
      {isMac && <div style={{ width: 72, flexShrink: 0 }} />}

      {/* App title */}
      <span
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--mantine-color-dark-1)',
          letterSpacing: 0.2,
          pointerEvents: 'none'
        }}
      >
        Foco
      </span>

      {/* Windows / Linux window controls */}
      {!isMac && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            WebkitAppRegion: 'no-drag' as any
          }}
        >
          <WindowButton onClick={() => window.api.windowMinimize()} label="Minimize">
            <Minus size={12} />
          </WindowButton>
          <WindowButton onClick={() => window.api.windowMaximize()} label="Maximize">
            <Square size={11} />
          </WindowButton>
          <WindowButton onClick={() => window.api.windowClose()} label="Close" isClose>
            <X size={12} />
          </WindowButton>
        </div>
      )}
    </div>
  )
}

function WindowButton({
  children,
  onClick,
  label,
  isClose = false
}: {
  children: React.ReactNode
  onClick: () => void
  label: string
  isClose?: boolean
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      style={{
        width: 46,
        height: 38,
        border: 'none',
        background: 'transparent',
        color: 'var(--mantine-color-dark-1)',
        cursor: 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.1s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isClose
          ? '#c42b1c'
          : 'var(--mantine-color-dark-5)'
        if (isClose) e.currentTarget.style.color = '#fff'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'var(--mantine-color-dark-1)'
      }}
    >
      {children}
    </button>
  )
}
