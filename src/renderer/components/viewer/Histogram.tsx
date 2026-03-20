import { useEffect, useRef } from 'react'
import type { HistogramData } from '../../../../preload/types'

interface HistogramProps {
  data: HistogramData
}

const CHANNELS: Array<{ key: keyof HistogramData; color: string }> = [
  { key: 'luma', color: 'rgba(255,255,255,0.6)' },
  { key: 'r',    color: 'rgba(255,80,80,0.5)' },
  { key: 'g',    color: 'rgba(80,220,80,0.5)' },
  { key: 'b',    color: 'rgba(80,130,255,0.5)' },
]

export function Histogram({ data }: HistogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // Find global max for normalisation across all channels
    let globalMax = 1
    for (const { key } of CHANNELS) {
      const max = Math.max(...data[key])
      if (max > globalMax) globalMax = max
    }

    for (const { key, color } of CHANNELS) {
      const buckets = data[key]
      ctx.beginPath()
      ctx.moveTo(0, H)
      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * W
        const y = H - (buckets[i] / globalMax) * H
        ctx.lineTo(x, y)
      }
      ctx.lineTo(W, H)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
    }
  }, [data])

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={80}
      style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        width: 200,
        height: 80,
        borderRadius: 6,
        background: 'rgba(0,0,0,0.55)',
        pointerEvents: 'none',
      }}
    />
  )
}
