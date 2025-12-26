import React from 'react'
import ColorPicker from './ColorPicker'
import './LayerPanel.css'

function LayerPanel({ layers, selectedLayers, onLayerToggle, onLayerZoom, layerColors, onColorChange, databaseName = 'pos' }) {
  return (
    <div className="layer-panel">
      <div className="database-header">
        <div className="database-icon">🗄️</div>
        <div className="database-info">
          <h2 className="database-name">{databaseName}</h2>
          <span className="database-label">Base de données</span>
        </div>
      </div>
      
      <div className="layers-section">
        <h3 className="layers-title">
          <span className="layers-icon-stack">
            <span className="stack-layer layer-1"></span>
            <span className="stack-layer layer-2"></span>
            <span className="stack-layer layer-3"></span>
          </span>
          Couches
        </h3>
        {layers.length === 0 ? (
          <div className="loading">Chargement des couches...</div>
        ) : (
          <div className="layer-list">
            {layers.map((layer) => (
              <div key={layer.name} className="layer-item">
                <label className="layer-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedLayers.includes(layer.name)}
                    onChange={() => onLayerToggle(layer.name)}
                  />
                  <span className="layer-name">{layer.name}</span>
                </label>
                <div className="layer-actions">
                  <ColorPicker
                    currentColor={layerColors[layer.name] || '#ff0000'}
                    onColorChange={(color) => onColorChange(layer.name, color)}
                  />
                  <button
                    className="zoom-button"
                    onClick={() => onLayerZoom(layer.name)}
                    title="Zoomer sur cette couche"
                  >
                    🔍
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LayerPanel

