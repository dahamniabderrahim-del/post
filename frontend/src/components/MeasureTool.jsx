import React, { useState, useEffect, useRef } from 'react'
import { Draw, Select } from 'ol/interaction'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Stroke, Fill, Circle, Text } from 'ol/style'
import { LineString, Polygon } from 'ol/geom'
import { getLength, getArea } from 'ol/sphere'
import { toLonLat } from 'ol/proj'
import './MeasureTool.css'

// Fonction pour calculer la distance géodésique entre deux points (formule de Haversine)
const haversineDistance = (lon1, lat1, lon2, lat2) => {
  const R = 6371000 // Rayon de la Terre en mètres
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Méthode 1: Calcul de surface géodésique utilisant la formule de l'excès sphérique
const calculateGeodesicAreaMethod1 = (coordinates) => {
  const R = 6371000 // Rayon de la Terre en mètres (WGS84)
  const R2 = R * R
  
  if (!coordinates || coordinates.length < 3) return 0
  
  let coords = [...coordinates]
  const first = coords[0]
  const last = coords[coords.length - 1]
  
  if (Math.abs(first[0] - last[0]) > 0.0001 || Math.abs(first[1] - last[1]) > 0.0001) {
    coords.push([first[0], first[1]])
  }
  
  const coordsRad = coords.map(coord => [
    coord[0] * Math.PI / 180,
    coord[1] * Math.PI / 180
  ])
  
  let area = 0
  for (let i = 0; i < coordsRad.length - 1; i++) {
    const lon1 = coordsRad[i][0]
    const lat1 = coordsRad[i][1]
    const lon2 = coordsRad[i + 1][0]
    const lat2 = coordsRad[i + 1][1]
    
    let dLon = lon2 - lon1
    while (dLon > Math.PI) dLon -= 2 * Math.PI
    while (dLon < -Math.PI) dLon += 2 * Math.PI
    
    area += dLon * (Math.sin(lat1) + Math.sin(lat2))
  }
  
  return Math.abs(area * R2 / 2)
}

// Méthode 2: Calcul utilisant la formule de l'excès sphérique de Girard (plus précise)
const calculateGeodesicAreaMethod2 = (coordinates) => {
  const R = 6371000 // Rayon de la Terre en mètres
  const R2 = R * R
  
  if (!coordinates || coordinates.length < 3) return 0
  
  let coords = [...coordinates]
  const first = coords[0]
  const last = coords[coords.length - 1]
  
  if (Math.abs(first[0] - last[0]) > 0.0001 || Math.abs(first[1] - last[1]) > 0.0001) {
    coords.push([first[0], first[1]])
  }
  
  // Convertir en radians
  const coordsRad = coords.map(coord => [
    coord[0] * Math.PI / 180,
    coord[1] * Math.PI / 180
  ])
  
  // Calculer l'aire en utilisant la formule de l'excès sphérique
  let sumAngles = 0
  const n = coordsRad.length - 1
  
  for (let i = 0; i < n; i++) {
    const prev = coordsRad[(i - 1 + n) % n]
    const curr = coordsRad[i]
    const next = coordsRad[(i + 1) % n]
    
    // Calculer l'angle sphérique au point courant
    const a = Math.acos(
      Math.sin(prev[1]) * Math.sin(curr[1]) + 
      Math.cos(prev[1]) * Math.cos(curr[1]) * Math.cos(prev[0] - curr[0])
    )
    const b = Math.acos(
      Math.sin(curr[1]) * Math.sin(next[1]) + 
      Math.cos(curr[1]) * Math.cos(next[1]) * Math.cos(curr[0] - next[0])
    )
    const c = Math.acos(
      Math.sin(prev[1]) * Math.sin(next[1]) + 
      Math.cos(prev[1]) * Math.cos(next[1]) * Math.cos(prev[0] - next[0])
    )
    
    // Angle sphérique au sommet
    const angle = Math.acos((Math.cos(a) - Math.cos(b) * Math.cos(c)) / (Math.sin(b) * Math.sin(c)))
    sumAngles += angle
  }
  
  // Excès sphérique
  const sphericalExcess = sumAngles - (n - 2) * Math.PI
  return Math.abs(sphericalExcess * R2)
}

// Méthode 3: Calcul utilisant la méthode des trapèzes sur la sphère
const calculateGeodesicAreaMethod3 = (coordinates) => {
  const R = 6371000 // Rayon de la Terre
  const R2 = R * R
  
  if (!coordinates || coordinates.length < 3) return 0
  
  let coords = [...coordinates]
  const first = coords[0]
  const last = coords[coords.length - 1]
  
  if (Math.abs(first[0] - last[0]) > 0.0001 || Math.abs(first[1] - last[1]) > 0.0001) {
    coords.push([first[0], first[1]])
  }
  
  // Convertir en radians
  const coordsRad = coords.map(coord => [
    coord[0] * Math.PI / 180,
    coord[1] * Math.PI / 180
  ])
  
  // Méthode des trapèzes pour l'intégration sur la sphère
  let area = 0
  for (let i = 0; i < coordsRad.length - 1; i++) {
    const lon1 = coordsRad[i][0]
    const lat1 = coordsRad[i][1]
    const lon2 = coordsRad[i + 1][0]
    const lat2 = coordsRad[i + 1][1]
    
    let dLon = lon2 - lon1
    while (dLon > Math.PI) dLon -= 2 * Math.PI
    while (dLon < -Math.PI) dLon += 2 * Math.PI
    
    // Intégration: ∫ sin(φ) dλ dφ
    area += dLon * (Math.sin(lat1) + Math.sin(lat2)) / 2
  }
  
  return Math.abs(area * R2)
}

// Fonction principale qui essaie plusieurs méthodes et retourne la meilleure
const calculateGeodesicArea = (coordinates) => {
  if (!coordinates || coordinates.length < 3) {
    return 0
  }
  
  // Essayer les trois méthodes
  const result1 = calculateGeodesicAreaMethod1(coordinates)
  const result2 = calculateGeodesicAreaMethod2(coordinates)
  const result3 = calculateGeodesicAreaMethod3(coordinates)
  
  // Prendre la moyenne des méthodes valides
  const validResults = [result1, result2, result3].filter(r => 
    isFinite(r) && !isNaN(r) && r > 0
  )
  
  if (validResults.length === 0) {
    return 0
  }
  
  // Calculer la moyenne (ou prendre la médiane pour plus de robustesse)
  const sorted = validResults.sort((a, b) => a - b)
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)]
  
  const average = validResults.reduce((sum, r) => sum + r, 0) / validResults.length
  
  // Utiliser la moyenne, mais si les résultats sont très différents, utiliser la médiane
  const maxDiff = Math.max(...validResults) - Math.min(...validResults)
  const avgValue = validResults[0]
  const relativeDiff = maxDiff / avgValue
  
  return relativeDiff > 0.1 ? median : average
}

function MeasureTool({ map, mapRef }) {
  const [activeTool, setActiveTool] = useState(null) // 'distance' | 'area' | null
  const [measureResult, setMeasureResult] = useState(null)
  const drawRef = useRef(null)
  const measureLayerRef = useRef(null)
  const measureSourceRef = useRef(null)
  const sketchRef = useRef(null)

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
    // Donner un nom à la couche pour qu'elle soit exclue de la sélection
    measureLayer.set('name', 'measure-layer')

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
    try {
      // Vérifier que la géométrie est valide
      if (!line || typeof line.getCoordinates !== 'function') {
        return '0 m'
      }

      const coords = line.getCoordinates()
      if (!coords || coords.length < 2) {
        return '0 m'
      }

      // Obtenir la projection de la carte (normalement EPSG:3857)
      const mapProjection = map.getView().getProjection().getCode()
      
      // Transformer les coordonnées en EPSG:4326 (lon, lat)
      const lonLatCoords = coords.map(coord => toLonLat(coord, mapProjection))
      
      // Calculer la distance totale en utilisant la formule de Haversine
      let totalLength = 0
      for (let i = 0; i < lonLatCoords.length - 1; i++) {
        const [lon1, lat1] = lonLatCoords[i]
        const [lon2, lat2] = lonLatCoords[i + 1]
        totalLength += haversineDistance(lon1, lat1, lon2, lat2)
      }
      
      // Vérifier que le résultat est valide
      if (!isFinite(totalLength) || totalLength < 0 || isNaN(totalLength)) {
        return '0 m'
      }
      
      let formatted
      if (totalLength >= 1000) {
        formatted = (totalLength / 1000).toFixed(2) + ' km'
      } else if (totalLength >= 1) {
        formatted = totalLength.toFixed(2) + ' m'
      } else {
        formatted = (totalLength * 100).toFixed(2) + ' cm'
      }
      return formatted
    } catch (error) {
      console.error('Erreur dans formatLength:', error)
      return 'Erreur'
    }
  }

  const formatArea = (polygon) => {
    try {
      // Vérifier que la géométrie est valide
      if (!polygon || typeof polygon.getCoordinates !== 'function') {
        return '0 m²'
      }

      // Vérifier que la géométrie est bien un polygone
      if (!(polygon instanceof Polygon)) {
        return '0 m²'
      }

      const coords = polygon.getCoordinates()
      if (!coords || coords.length === 0 || !coords[0] || coords[0].length < 3) {
        return '0 m²'
      }

      // Obtenir la projection de la carte (normalement EPSG:3857)
      const mapProjection = map.getView().getProjection().getCode()
      
      // Cloner la géométrie et la transformer en EPSG:4326
      const polygon4326 = polygon.clone()
      try {
        polygon4326.transform(mapProjection, 'EPSG:4326')
      } catch (transformError) {
        console.error('Erreur lors de la transformation:', transformError)
        return 'Erreur'
      }
      
      // Obtenir les coordonnées transformées
      const transformedCoords = polygon4326.getCoordinates()
      if (!transformedCoords || transformedCoords.length === 0 || !transformedCoords[0] || transformedCoords[0].length < 3) {
        return '0 m²'
      }
      
      // Extraire les coordonnées du ring extérieur et s'assurer qu'elles sont fermées
      let lonLatCoords = transformedCoords[0].map(coord => [coord[0], coord[1]])
      
      // S'assurer que le polygone est fermé
      const first = lonLatCoords[0]
      const last = lonLatCoords[lonLatCoords.length - 1]
      if (Math.abs(first[0] - last[0]) > 0.0001 || Math.abs(first[1] - last[1]) > 0.0001) {
        lonLatCoords.push([first[0], first[1]])
      }
      
      // S'assurer que le polygone est fermé dans la géométrie pour getArea
      const originalRing = transformedCoords[0]
      const firstPoint = originalRing[0]
      const lastPoint = originalRing[originalRing.length - 1]
      
      const isAlreadyClosed = Math.abs(firstPoint[0] - lastPoint[0]) < 1e-10 && 
                              Math.abs(firstPoint[1] - lastPoint[1]) < 1e-10
      
      if (!isAlreadyClosed) {
        const closedRing = [...originalRing, [firstPoint[0], firstPoint[1]]]
        polygon4326.setCoordinates([closedRing])
      }
      
      // Méthode 1: Utiliser getArea de ol/sphere (méthode OpenLayers)
      let areaValue1 = getArea(polygon4326)
      
      // Méthode 2: Calcul géodésique manuel (combine plusieurs sous-méthodes)
      const areaValue2 = calculateGeodesicArea(lonLatCoords)
      
      // Choisir la meilleure valeur
      let areaValue = 0
      
      // Si les deux méthodes donnent des résultats valides
      const valid1 = isFinite(areaValue1) && !isNaN(areaValue1) && areaValue1 > 0
      const valid2 = isFinite(areaValue2) && !isNaN(areaValue2) && areaValue2 > 0
      
      if (valid1 && valid2) {
        // Si les deux sont valides, prendre la moyenne si elles sont proches
        const diff = Math.abs(areaValue1 - areaValue2)
        const maxValue = Math.max(areaValue1, areaValue2)
        const relativeDiff = diff / maxValue
        
        if (relativeDiff < 0.1) {
          // Si la différence est < 10%, prendre la moyenne
          areaValue = (areaValue1 + areaValue2) / 2
        } else {
          // Sinon, prendre la plus grande (généralement plus fiable pour les grandes surfaces)
          areaValue = maxValue
        }
      } else if (valid1) {
        areaValue = areaValue1
      } else if (valid2) {
        areaValue = areaValue2
      } else {
        return 'Erreur'
      }
      
      // Vérification finale
      if (!isFinite(areaValue) || isNaN(areaValue) || areaValue <= 0) {
        return 'Erreur'
      }
      
      // Formater le résultat
      let output
      if (areaValue >= 1000000) {
        output = (areaValue / 1000000).toFixed(2) + ' km²'
      } else if (areaValue >= 10000) {
        output = (areaValue / 10000).toFixed(2) + ' ha'
      } else if (areaValue >= 1) {
        output = areaValue.toFixed(2) + ' m²'
      } else {
        output = (areaValue * 10000).toFixed(2) + ' cm²'
      }
      return output
    } catch (error) {
      console.error('Erreur dans le calcul de surface:', error)
      return 'Erreur'
    }
  }

  const startMeasure = (type) => {
    if (!map) return

    // Arrêter l'outil actuel s'il y en a un
    stopMeasure()

    // Désactiver l'interaction de sélection pour permettre la mesure
    if (mapRef && mapRef.current && mapRef.current.setSelectInteractionActive) {
      mapRef.current.setSelectInteractionActive(false)
    }

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
    
    // Ajouter l'interaction Draw après un court délai pour s'assurer que Select est bien supprimée
    setTimeout(() => {
      if (map && !drawRef.current) {
        map.addInteraction(draw)
        drawRef.current = draw
        setActiveTool(type)
        setMeasureResult(null)
      }
    }, 100)

    // Fonction pour mettre à jour la mesure
    const updateMeasure = (geometry) => {
      if (!geometry) return

      let measureValue = null
      if (type === 'distance' && geometry instanceof LineString) {
        const coords = geometry.getCoordinates()
        if (coords.length >= 2) {
          measureValue = formatLength(geometry)
          setMeasureResult({ type: 'distance', value: measureValue })
        }
      } else if (type === 'area' && geometry instanceof Polygon) {
        const coords = geometry.getCoordinates()
        if (coords.length > 0 && coords[0].length >= 3) {
          measureValue = formatArea(geometry)
          setMeasureResult({ type: 'area', value: measureValue })
        }
      }
      return measureValue
    }

    // Écouter les événements de dessin
    draw.on('drawstart', (e) => {
      sketchRef.current = e.feature
      setMeasureResult(null)
      
      // Écouter les changements de géométrie pendant le dessin
      const geometry = e.feature.getGeometry()
      if (geometry) {
        const geometryListener = () => {
          updateMeasure(geometry)
        }
        geometry.on('change', geometryListener)
        
        // Stocker le listener pour le nettoyer plus tard
        e.feature.set('_geometryListener', geometryListener)
      }
    })

    // Mettre à jour la mesure à la fin du dessin
    draw.on('drawend', (e) => {
      const feature = e.feature
      const geometry = feature.getGeometry()

      // Nettoyer le listener de géométrie
      const listener = feature.get('_geometryListener')
      if (listener && geometry) {
        geometry.un('change', listener)
        feature.unset('_geometryListener')
      }

      const measureValue = updateMeasure(geometry)

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
            font: 'bold 14px Arial',
            fill: new Fill({ color: '#000000' }),
            stroke: new Stroke({ color: '#ffffff', width: 3 }),
            text: measureValue,
            placement: type === 'distance' ? 'line' : 'point',
            offsetY: type === 'distance' ? -15 : 0,
            overflow: true
          })
        })
        feature.setStyle(style)
      }
      
      sketchRef.current = null
      
      // Ne pas réactiver l'interaction de sélection ici
      // Elle sera réactivée seulement quand l'utilisateur arrête explicitement la mesure
    })

    // Nettoyer en cas d'annulation
    draw.on('drawabort', (e) => {
      if (sketchRef.current) {
        const geometry = sketchRef.current.getGeometry()
        const listener = sketchRef.current.get('_geometryListener')
        if (listener && geometry) {
          geometry.un('change', listener)
        }
      }
      sketchRef.current = null
      setMeasureResult(null)
      
      // Ne pas réactiver l'interaction de sélection ici
      // L'utilisateur peut vouloir continuer à mesurer
    })
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
    
    // Réactiver l'interaction de sélection après un court délai
    setTimeout(() => {
      if (mapRef && mapRef.current && mapRef.current.setSelectInteractionActive) {
        mapRef.current.setSelectInteractionActive(true)
      }
    }, 100)
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <path d="M3 9h18"></path>
            <path d="M9 3v18"></path>
          </svg>
          <span>Surface</span>
        </button>
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
