import React from 'react'
import ColorPicker from './ColorPicker'
import './LayerPanel.css'

function LayerPanel({ layers, selectedLayers, onLayerToggle, onLayerZoom, layerColors, onColorChange, onShowAttributeTable, databaseName = 'pos' }) {
  return (
    <div className="layer-panel">
      <div className="database-header">
        <button className="database-button">
          <div className="database-icon-stack">
            <span className="db-icon-layer layer-1"></span>
            <span className="db-icon-layer layer-2"></span>
          </div>
          <div className="database-info">
            <h2 className="database-name">{databaseName.toUpperCase()}</h2>
            <span className="database-label">Base de données</span>
          </div>
        </button>
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
                    className="table-button"
                    onClick={() => onShowAttributeTable(layer.name)}
                    title="Afficher la table attributaire"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="3" y1="9" x2="21" y2="9"/>
                      <line x1="9" y1="3" x2="9" y2="21"/>
                      <line x1="3" y1="15" x2="21" y2="15"/>
                      <line x1="15" y1="3" x2="15" y2="21"/>
                    </svg>
                  </button>
                  <button
                    className="zoom-button"
                    onClick={() => onLayerZoom(layer.name)}
                    title="Zoomer sur cette couche"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
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

