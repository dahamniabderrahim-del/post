import React, { useState, useRef, useEffect } from 'react'
import './ColorPicker.css'

const COLORS = [
  '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#ff8800', '#8800ff', '#00ff88', '#ff0088', '#0088ff', '#88ff00',
  '#ff3333', '#33ff33', '#3333ff', '#ffcc00', '#cc00ff', '#00ccff',
  '#ff6600', '#6600ff', '#00ff66', '#ff0066', '#0066ff', '#66ff00'
]

function ColorPicker({ currentColor, onColorChange, onClose }) {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false)
        if (onClose) onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleColorSelect = (color) => {
    onColorChange(color)
    setIsOpen(false)
    if (onClose) onClose()
  }

  return (
    <div className="color-picker-container" ref={pickerRef}>
      <button
        className="color-picker-button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Couleur actuelle: ${currentColor}`}
        style={{ 
          backgroundColor: currentColor,
          backgroundImage: 'none'
        }}
      >
        <span className="color-indicator" style={{ backgroundColor: currentColor }}></span>
        <span className="palette-icon">🎨</span>
      </button>
      {isOpen && (
        <div className="color-picker-popup">
          <div className="color-grid">
            {COLORS.map((color) => (
              <button
                key={color}
                className="color-option"
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                title={color}
              />
            ))}
          </div>
          <div className="color-picker-custom">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="color-input"
            />
            <span>Couleur personnalisée</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ColorPicker

