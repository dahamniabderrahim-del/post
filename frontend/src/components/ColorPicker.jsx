import React, { useState, useRef, useEffect } from 'react'
import './ColorPicker.css'

const COLORS = [
  // Noir et blanc
  '#000000', '#ffffff', '#808080', '#404040', '#c0c0c0',
  // Rouges
  '#ff0000', '#cc0000', '#990000', '#ff3333', '#ff6666', '#ff9999', '#ffcccc',
  '#ff4400', '#ff6600', '#ff8800', '#ffaa00', '#ffcc00',
  // Oranges
  '#ff8800', '#ff9900', '#ffaa00', '#ffbb00', '#ffcc00', '#ffdd00',
  // Jaunes
  '#ffff00', '#ffcc00', '#ffaa00', '#ffee00', '#ffdd00', '#cccc00',
  // Verts
  '#00ff00', '#00cc00', '#009900', '#33ff33', '#66ff66', '#99ff99', '#ccffcc',
  '#00ff88', '#00ff66', '#00ff44', '#00ff22', '#00ff11',
  '#00ffaa', '#00ff99', '#00ff88', '#00ff77', '#00ff66',
  // Cyans
  '#00ffff', '#00cccc', '#009999', '#33ffff', '#66ffff', '#99ffff', '#ccffff',
  // Bleus
  '#0000ff', '#0000cc', '#000099', '#3333ff', '#6666ff', '#9999ff', '#ccccff',
  '#0044ff', '#0066ff', '#0088ff', '#00aaff', '#00ccff',
  '#0000ee', '#0000dd', '#0000cc', '#0000bb', '#0000aa',
  // Violets
  '#ff00ff', '#cc00cc', '#990099', '#ff33ff', '#ff66ff', '#ff99ff', '#ffccff',
  '#8800ff', '#9900ff', '#aa00ff', '#bb00ff', '#cc00ff',
  '#4400ff', '#5500ff', '#6600ff', '#7700ff', '#8800ff',
  // Roses
  '#ff0088', '#ff0099', '#ff00aa', '#ff00bb', '#ff00cc',
  '#ff4488', '#ff5599', '#ff66aa', '#ff77bb', '#ff88cc',
  // Marrons
  '#8b4513', '#a0522d', '#cd853f', '#d2691e', '#b8860b',
  '#654321', '#704214', '#7a5230', '#8b6f47', '#9c7a5a'
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" fill="white" opacity="0.9"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1" fill="white" opacity="0.7"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1" fill="white" opacity="0.5"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1" fill="white" opacity="0.8"></rect>
        </svg>
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

