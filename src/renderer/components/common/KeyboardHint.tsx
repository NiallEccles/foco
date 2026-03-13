import { Kbd } from '@mantine/core'

interface KeyboardHintProps {
  keys: string[]
}

export function KeyboardHint({ keys }: KeyboardHintProps) {
  return (
    <span className="flex gap-1 items-center">
      {keys.map((key) => (
        <Kbd
          key={key}
          size="xs"
          variant="outline"
          color="gray"
          style={{ fontFamily: 'monospace', textTransform: 'none', minWidth: 20 }}
          className='ml-2'
        >
          {key}
        </Kbd>
      ))}
    </span>
  )
}
