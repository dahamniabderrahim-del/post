import React, { useState, useEffect, useRef } from 'react'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import XYZ from 'ol/source/XYZ'
import './BaseLayerSwitcher.css'

const BaseLayerSwitcher = ({ map }) => {
  const [baseLayerType, setBaseLayerType] = useState('osm') // 'osm' ou 'satellite'
  const baseLayerRef = useRef(null)
  const [satelliteThumbnail, setSatelliteThumbnail] = useState(null)

  useEffect(() => {
    if (!map) return

    // Créer les sources de tuiles
    const osmSource = new OSM()
    const satelliteSource = new XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attributions: '© Esri'
    })

    // Créer la couche de base initiale (OSM)
    const initialLayer = new TileLayer({
      source: osmSource,
      zIndex: 0
    })

    map.getLayers().insertAt(0, initialLayer)
    baseLayerRef.current = initialLayer

    return () => {
      if (baseLayerRef.current) {
        map.removeLayer(baseLayerRef.current)
      }
    }
  }, [map])

  const toggleBaseLayer = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!map || !baseLayerRef.current) return

    const newType = baseLayerType === 'osm' ? 'satellite' : 'osm'
    
    // Créer la nouvelle source
    const newSource = newType === 'osm' 
      ? new OSM()
      : new XYZ({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attributions: '© Esri'
        })

    // Remplacer la source de la couche existante
    baseLayerRef.current.setSource(newSource)
    setBaseLayerType(newType)
    
    // Si on passe en mode satellite, générer une miniature
    if (newType === 'satellite' && map) {
      const view = map.getView()
      const center = view.getCenter()
      const zoom = Math.floor(view.getZoom() || 10)
      
      // Convertir les coordonnées en coordonnées de tuile
      const lon = center[0]
      const lat = center[1]
      const n = Math.pow(2, zoom)
      const x = Math.floor((lon + 20037508.34) / 40075016.68 * n)
      const y = Math.floor((20037508.34 - lat) / 40075016.68 * n)
      
      // Générer l'URL de la tuile satellite pour la miniature
      const tileUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`
      setSatelliteThumbnail(tileUrl)
    }
  }

  if (!map) return null

  return (
    <div className="base-layer-switcher">
      <button
        className={`base-layer-button ${baseLayerType === 'osm' ? 'active' : ''}`}
        onClick={toggleBaseLayer}
        title={baseLayerType === 'osm' ? 'Passer à l\'imagerie satellite' : 'Passer à OSM'}
      >
        {/* Icône de couches superposées */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="16" height="16" rx="1" fill="currentColor" opacity="0.1"></rect>
          <rect x="4" y="4" width="16" height="16" rx="1" fill="currentColor" opacity="0.15"></rect>
          <rect x="6" y="6" width="16" height="16" rx="1" fill="currentColor" opacity="0.2"></rect>
          <rect x="2" y="2" width="16" height="16" rx="1" stroke="currentColor"></rect>
          <rect x="4" y="4" width="16" height="16" rx="1" stroke="currentColor"></rect>
          <rect x="6" y="6" width="16" height="16" rx="1" stroke="currentColor"></rect>
        </svg>
      </button>
    </div>
  )
}

export default BaseLayerSwitcher

