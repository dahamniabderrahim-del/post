import React, { useEffect, useRef, useState } from 'react'
import Map from './components/Map'
import LayerPanel from './components/LayerPanel'
import './App.css'

function App() {
  const [layers, setLayers] = useState([])
  const [selectedLayers, setSelectedLayers] = useState([])
  const [layerColors, setLayerColors] = useState({})
  const [filter, setFilter] = useState(null)
  const mapRef = useRef(null)

  useEffect(() => {
    // Charger la liste des couches disponibles
    fetch('http://localhost:5000/api/layers')
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

  // Palette de couleurs professionnelles par défaut pour les couches
  const defaultColors = [
    '#0ea5e9', // Bleu ciel professionnel
    '#0284c7', // Bleu professionnel
    '#0369a1', // Bleu foncé professionnel
    '#1e293b', // Slate foncé
    '#334155', // Slate moyen
    '#475569', // Slate clair
    '#64748b', // Slate gris
    '#10b981', // Vert émeraude
    '#059669', // Vert foncé
    '#047857', // Vert très foncé
    '#f59e0b', // Ambre
    '#d97706', // Ambre foncé
    '#ef4444', // Rouge
    '#dc2626', // Rouge foncé
    '#8b5cf6', // Violet
    '#7c3aed', // Violet foncé
    '#ec4899', // Rose
    '#db2777', // Rose foncé
    '#14b8a6', // Teal
    '#0d9488'  // Teal foncé
  ]

  // Assigner automatiquement des couleurs différentes aux nouvelles couches
  useEffect(() => {
    const newColors = { ...layerColors }
    let hasChanges = false

    selectedLayers.forEach((layerName, index) => {
      // Si la couche n'a pas encore de couleur, lui assigner une couleur par défaut
      if (!newColors[layerName]) {
        // Trouver le premier index disponible dans selectedLayers pour cette couche
        const colorIndex = selectedLayers.indexOf(layerName) % defaultColors.length
        newColors[layerName] = defaultColors[colorIndex]
        hasChanges = true
      }
    })

    // NE PAS supprimer les couleurs des couches désélectionnées
    // Cela permet de conserver les couleurs personnalisées même quand la couche est désélectionnée
    // Les couleurs seront réutilisées quand la couche sera re-sélectionnée

    if (hasChanges) {
      setLayerColors(newColors)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLayers])

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
            filter={filter}
            layers={layers}
            onFilterChange={setFilter}
          />
        </main>
      </div>
    </div>
  )
}

export default App

