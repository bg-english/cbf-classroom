import { useRef, useState, useEffect, useCallback } from 'react'

/**
 * Whiteboard — full canvas drawing tool for the teacher.
 *
 * Features:
 *  - Freehand pen drawing (multiple colors & sizes)
 *  - Eraser mode
 *  - Clear canvas
 *  - Undo last stroke
 *  - Fullscreen overlay mode
 */

const COLORS = [
  { id: 'black', value: '#1e2a3a', label: 'Negro' },
  { id: 'blue', value: '#2563eb', label: 'Azul' },
  { id: 'red', value: '#dc2626', label: 'Rojo' },
  { id: 'green', value: '#16a34a', label: 'Verde' },
  { id: 'orange', value: '#d97706', label: 'Naranja' },
  { id: 'purple', value: '#7c3aed', label: 'Morado' },
]

const SIZES = [
  { id: 'thin', value: 2, label: 'Fino' },
  { id: 'medium', value: 4, label: 'Medio' },
  { id: 'thick', value: 8, label: 'Grueso' },
  { id: 'marker', value: 14, label: 'Marcador' },
]

export default function Whiteboard({ onClose }) {
  const canvasRef = useRef(null)
  const contextRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState(COLORS[0].value)
  const [size, setSize] = useState(SIZES[1].value)
  const [tool, setTool] = useState('pen') // pen | eraser
  const [strokes, setStrokes] = useState([]) // history for undo
  const currentStroke = useRef([])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = canvas.parentElement

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'

      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      contextRef.current = ctx

      // Redraw all strokes after resize
      redrawAll(ctx, strokes)
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // Redraw when strokes change (for undo)
  useEffect(() => {
    if (!contextRef.current) return
    redrawAll(contextRef.current, strokes)
  }, [strokes])

  function redrawAll(ctx, strokeList) {
    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)

    for (const stroke of strokeList) {
      ctx.beginPath()
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.size
      ctx.globalCompositeOperation = stroke.eraser ? 'destination-out' : 'source-over'

      for (let i = 0; i < stroke.points.length; i++) {
        const p = stroke.points[i]
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }
    ctx.globalCompositeOperation = 'source-over'
  }

  function getPosition(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  function startDrawing(e) {
    e.preventDefault()
    const pos = getPosition(e)
    const ctx = contextRef.current

    ctx.beginPath()
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    ctx.lineWidth = tool === 'eraser' ? size * 4 : size
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.moveTo(pos.x, pos.y)

    currentStroke.current = [pos]
    setIsDrawing(true)
  }

  function draw(e) {
    if (!isDrawing) return
    e.preventDefault()
    const pos = getPosition(e)
    const ctx = contextRef.current

    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    currentStroke.current.push(pos)
  }

  function stopDrawing(e) {
    if (!isDrawing) return
    if (e) e.preventDefault()

    const ctx = contextRef.current
    ctx.closePath()
    ctx.globalCompositeOperation = 'source-over'

    if (currentStroke.current.length > 0) {
      setStrokes(prev => [...prev, {
        points: currentStroke.current,
        color: tool === 'eraser' ? '#ffffff' : color,
        size: tool === 'eraser' ? size * 4 : size,
        eraser: tool === 'eraser',
      }])
    }
    currentStroke.current = []
    setIsDrawing(false)
  }

  function undo() {
    setStrokes(prev => prev.slice(0, -1))
  }

  function clearAll() {
    setStrokes([])
  }

  return (
    <div className="wb-overlay">
      {/* Toolbar */}
      <div className="wb-toolbar">
        <div className="wb-toolbar-section">
          <button
            className={`wb-tool-btn ${tool === 'pen' ? 'wb-tool-active' : ''}`}
            onClick={() => setTool('pen')}
            title="Lápiz"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            </svg>
          </button>
          <button
            className={`wb-tool-btn ${tool === 'eraser' ? 'wb-tool-active' : ''}`}
            onClick={() => setTool('eraser')}
            title="Borrador"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/>
              <path d="M22 21H7"/>
              <path d="m5 11 9 9"/>
            </svg>
          </button>
        </div>

        <div className="wb-toolbar-divider" />

        {/* Colors */}
        <div className="wb-toolbar-section wb-colors">
          {COLORS.map(c => (
            <button
              key={c.id}
              className={`wb-color-btn ${color === c.value && tool === 'pen' ? 'wb-color-active' : ''}`}
              style={{ '--swatch': c.value }}
              onClick={() => { setColor(c.value); setTool('pen') }}
              title={c.label}
            />
          ))}
        </div>

        <div className="wb-toolbar-divider" />

        {/* Sizes */}
        <div className="wb-toolbar-section wb-sizes">
          {SIZES.map(s => (
            <button
              key={s.id}
              className={`wb-size-btn ${size === s.value ? 'wb-size-active' : ''}`}
              onClick={() => setSize(s.value)}
              title={s.label}
            >
              <span className="wb-size-dot" style={{ width: s.value + 4, height: s.value + 4 }} />
            </button>
          ))}
        </div>

        <div className="wb-toolbar-divider" />

        {/* Actions */}
        <div className="wb-toolbar-section">
          <button className="wb-action-btn" onClick={undo} disabled={strokes.length === 0} title="Deshacer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
            </svg>
          </button>
          <button className="wb-action-btn wb-action-danger" onClick={clearAll} disabled={strokes.length === 0} title="Limpiar todo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        </div>

        {/* Close */}
        <div className="wb-toolbar-right">
          <button className="wb-close-btn" onClick={onClose}>
            Cerrar Pizarra
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="wb-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="wb-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  )
}
