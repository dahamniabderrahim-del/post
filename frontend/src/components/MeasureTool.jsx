import React, { useState, useEffect, useRef } from 'react'
import { Draw } from 'ol/interaction'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Stroke, Fill, Circle, Text } from 'ol/style'
import { LineString, Polygon } from 'ol/geom'
import { getLength, getArea } from 'ol/sphere'
import { transform } from 'ol/proj'
import './MeasureTool.css'

function MeasureTool({ map }) {
  const [activeTool, setActiveTool] = useState(null) // 'distance' | 'area' | null
  const [measureResult, setMeasureResult] = useState(null)
  const drawRef = useRef(null)
  const measureLayerRef = useRef(null)
  const measureSourceRef = useRef(null)

  useEffect(() => {
    if (!map) return

    // Créer une couche pour les mesures
    const measureSource = new VectorSource()
    const measureLayer = new VectorLayer({
      source: measureSource,
      style: new Style({
        stroke: new Stroke({
          color: '#ff0000',
          width: 3
        }),
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.2)'
        }),
        image: new Circle({
          radius: 6,
          fill: new Fill({ color: '#ff0000' }),
          stroke: new Stroke({ color: '#ffffff', width: 2 })
        })
      }),
      zIndex: 1000
    })

    measureSourceRef.current = measureSource
    measureLayerRef.current = measureLayer
    map.addLayer(measureLayer)

    return () => {
      if (measureLayerRef.current) {
        map.removeLayer(measureLayerRef.current)
      }
      if (drawRef.current) {
        map.removeInteraction(drawRef.current)
      }
    }
  }, [map])

  const formatLength = (line) => {
    // Cloner la géométrie et la transformer en EPSG:4326 pour le calcul géodésique
    const line4326 = line.clone()
    line4326.transform('EPSG:3857', 'EPSG:4326')
    const length = getLength(line4326)
    let output
    if (length > 1000) {
      output = (length / 1000).toFixed(2) + ' km'
    } else {
      output = length.toFixed(2) + ' m'
    }
    return output
  }

  const formatArea = (polygon) => {
    // Cloner la géométrie et la transformer en EPSG:4326 pour le calcul géodésique
    const polygon4326 = polygon.clone()
    polygon4326.transform('EPSG:3857', 'EPSG:4326')
    const area = getArea(polygon4326)
    let output
    if (area > 10000) {
      output = (area / 1000000).toFixed(2) + ' km²'
    } else {
      output = area.toFixed(2) + ' m²'
    }
    return output
  }

  const startMeasure = (type) => {
    if (!map) return

    // Arrêter l'outil actuel s'il y en a un
    stopMeasure()

    // Créer l'interaction de dessin
    const geometryType = type === 'distance' ? 'LineString' : 'Polygon'
    const draw = new Draw({
      source: measureSourceRef.current,
      type: geometryType,
      style: new Style({
        stroke: new Stroke({
          color: '#ff0000',
          width: 3,
          lineDash: [5, 5]
        }),
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.1)'
        }),
        image: new Circle({
          radius: 6,
          fill: new Fill({ color: '#ff0000' }),
          stroke: new Stroke({ color: '#ffffff', width: 2 })
        })
      })
    })

    // Écouter les événements de dessin
    let sketch
    draw.on('drawstart', (e) => {
      sketch = e.feature
    })

    // Mettre à jour la mesure pendant le dessin
    draw.on('drawend', (e) => {
      const feature = e.feature
      const geometry = feature.getGeometry()

      let measureValue
      if (type === 'distance' && geometry instanceof LineString) {
        measureValue = formatLength(geometry)
        setMeasureResult({ type: 'distance', value: measureValue })
      } else if (type === 'area' && geometry instanceof Polygon) {
        measureValue = formatArea(geometry)
        setMeasureResult({ type: 'area', value: measureValue })
      }

      // Ajouter un style avec le texte de mesure
      if (measureValue) {
        const style = new Style({
          stroke: new Stroke({
            color: '#ff0000',
            width: 3
          }),
          fill: new Fill({
            color: 'rgba(255, 0, 0, 0.2)'
          }),
          text: new Text({
            font: '14px Arial',
            fill: new Fill({ color: '#000000' }),
            stroke: new Stroke({ color: '#ffffff', width: 3 }),
            text: measureValue,
            placement: type === 'distance' ? 'line' : 'point',
            offsetY: type === 'distance' ? -10 : 0
          })
        })
        feature.setStyle(style)
      }
    })

    map.addInteraction(draw)
    drawRef.current = draw
    setActiveTool(type)
    setMeasureResult(null)
  }

  const stopMeasure = () => {
    if (drawRef.current && map) {
      map.removeInteraction(drawRef.current)
      drawRef.current = null
    }
    if (measureSourceRef.current) {
      measureSourceRef.current.clear()
    }
    setActiveTool(null)
    setMeasureResult(null)
  }

  const clearMeasurements = () => {
    if (measureSourceRef.current) {
      measureSourceRef.current.clear()
    }
    setMeasureResult(null)
  }

  if (!map) return null

  return (
    <div className="measure-tool">
      <div className="measure-buttons">
        <button
          className={`measure-button ${activeTool === 'distance' ? 'active' : ''}`}
          onClick={() => activeTool === 'distance' ? stopMeasure() : startMeasure('distance')}
          title="Mesurer la distance"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <path d="M12 3v18"></path>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
          <span>Distance</span>
        </button>
        <button
          className={`measure-button ${activeTool === 'area' ? 'active' : ''}`}
          onClick={() => activeTool === 'area' ? stopMeasure() : startMeasure('area')}
          title="Mesurer la surface"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <path d="M3 9h18"></path>
            <path d="M9 3v18"></path>
          </svg>
          <span>Surface</span>
        </button>
        {measureSourceRef.current && measureSourceRef.current.getFeatures().length > 0 && (
          <button
            className="measure-button clear-button"
            onClick={clearMeasurements}
            title="Effacer les mesures"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Effacer</span>
          </button>
        )}
      </div>
      {measureResult && (
        <div className="measure-result">
          <span className="measure-label">
            {measureResult.type === 'distance' ? 'Distance:' : 'Surface:'}
          </span>
          <span className="measure-value">{measureResult.value}</span>
        </div>
      )}
    </div>
  )
}

export default MeasureTool

