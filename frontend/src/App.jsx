import React, { useEffect, useRef, useState } from 'react'
import Map from './components/Map'
import LayerPanel from './components/LayerPanel'
import './App.css'

function App() {
  const [layers, setLayers] = useState([])
  const [selectedLayers, setSelectedLayers] = useState([])
  const [layerColors, setLayerColors] = useState({})
  const mapRef = useRef(null)

  useEffect(() => {
    // Charger la liste des couches disponibles
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    fetch(`${apiUrl}/api/layers`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) {
          setLayers(data)
        } else {
          setLayers([])
        }
      })
      .catch(err => {
        setLayers([])
      })
  }, [])

  const handleLayerToggle = (layerName) => {
    setSelectedLayers(prev => {
      if (prev.includes(layerName)) {
        return prev.filter(name => name !== layerName)
      } else {
        return [...prev, layerName]
      }
    })
  }

  const handleLayerZoom = (layerName) => {
    if (mapRef.current && mapRef.current.zoomToLayer) {
      mapRef.current.zoomToLayer(layerName)
    }
  }

  const handleColorChange = (layerName, color) => {
    setLayerColors(prev => ({
      ...prev,
      [layerName]: color
    }))
    // Mettre à jour la couleur de la couche sur la carte
    if (mapRef.current && mapRef.current.updateLayerColor) {
      mapRef.current.updateLayerColor(layerName, color)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌍 Système d'Information Géographique</h1>
        <p>Visualisation des couches géospatiales PostgreSQL</p>
      </header>
      <div className="app-container">
        <aside className="sidebar">
          <LayerPanel
            layers={layers}
            selectedLayers={selectedLayers}
            onLayerToggle={handleLayerToggle}
            onLayerZoom={handleLayerZoom}
            layerColors={layerColors}
            onColorChange={handleColorChange}
            databaseName="pos"
          />
        </aside>
        <main className="map-container">
          <Map
            ref={mapRef}
            selectedLayers={selectedLayers}
            layerColors={layerColors}
          />
        </main>
      </div>
    </div>
  )
}

export default App

