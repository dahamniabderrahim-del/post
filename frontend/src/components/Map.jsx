import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import { Map as OlMap, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import { fromLonLat, transformExtent, toLonLat } from 'ol/proj'
import { Style, Stroke, Fill, Circle } from 'ol/style'
import GeoJSON from 'ol/format/GeoJSON'
import { click } from 'ol/events/condition'
import { Select } from 'ol/interaction'
import 'ol/ol.css'
import axios from 'axios'
import FeaturePopup from './FeaturePopup'
import MeasureTool from './MeasureTool'

const Map = forwardRef(({ selectedLayers, layerColors = {} }, ref) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const vectorLayersRef = useRef({})
  const layerColorsRef = useRef({})
  const [selectedFeature, setSelectedFeature] = useState(null)
  const selectInteractionRef = useRef(null)

  useImperativeHandle(ref, () => ({
    getMap: () => mapInstanceRef.current,
    updateLayerColor: (layerName, color) => {
      if (!mapInstanceRef.current) return
      
      const layer = vectorLayersRef.current[layerName]
      if (!layer) return
      
      // Stocker la couleur
      layerColorsRef.current[layerName] = color
      
      // Créer une nouvelle fonction de style avec la couleur
      const createStyleFunction = (layerColor) => {
        return (feature) => {
          const geometry = feature.getGeometry()
          if (!geometry) {
            return new Style({
              stroke: new Stroke({ color: layerColor, width: 3 }),
              fill: new Fill({ color: layerColor + '4D' }),
              image: new Circle({
                radius: 8,
                fill: new Fill({ color: layerColor }),
                stroke: new Stroke({ color: '#ffffff', width: 2 })
              })
            })
          }
          
          const geometryType = geometry.getType()
          
          // Convertir hex en rgba pour le fill
          const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16)
            const g = parseInt(hex.slice(3, 5), 16)
            const b = parseInt(hex.slice(5, 7), 16)
            return `rgba(${r}, ${g}, ${b}, ${alpha})`
          }
          
          if (geometryType === 'Point' || geometryType === 'MultiPoint') {
            return new Style({
              image: new Circle({
                radius: 12,
                fill: new Fill({ color: layerColor }),
                stroke: new Stroke({ color: '#ffffff', width: 3 })
              })
            })
          } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
            return new Style({
              stroke: new Stroke({ 
                color: layerColor, 
                width: 5 
              })
            })
          } else {
            return new Style({
              stroke: new Stroke({ 
                color: layerColor, 
                width: 4 
              }),
              fill: new Fill({ 
                color: hexToRgba(layerColor, 0.4)
              })
            })
          }
        }
      }
      
      layer.setStyle(createStyleFunction(color))
      layer.changed()
    },
    zoomToLayer: (layerName) => {
      if (!mapInstanceRef.current) return
      
      const map = mapInstanceRef.current
      const layer = vectorLayersRef.current[layerName]
      
      if (!layer) {
        console.warn(`[${layerName}] Couche non trouvée pour zoom`)
        return
      }
      
      const source = layer.getSource()
      if (!source) {
        console.warn(`[${layerName}] Source non trouvée`)
        return
      }
      
      const extent = source.getExtent()
      if (extent && 
          isFinite(extent[0]) && isFinite(extent[1]) && 
          isFinite(extent[2]) && isFinite(extent[3]) &&
          extent[0] !== extent[2] && extent[1] !== extent[3]) {
        console.log(`[${layerName}] Zoom sur extent:`, extent)
        map.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000,
          maxZoom: 18
        })
      } else {
        // Fallback: utiliser bounds
        axios.get(`http://localhost:5000/api/layers/${layerName}/bounds`)
          .then(boundsResponse => {
            const bounds = boundsResponse.data
            if (bounds?.minx && bounds?.miny && bounds?.maxx && bounds?.maxy) {
              const extent = transformExtent(
                [bounds.minx, bounds.miny, bounds.maxx, bounds.maxy],
                'EPSG:4326',
                'EPSG:3857'
              )
              map.getView().fit(extent, {
                padding: [50, 50, 50, 50],
                duration: 1000,
                maxZoom: 18
              })
            }
          })
          .catch(err => console.error(`[${layerName}] Erreur bounds:`, err))
      }
    }
  }))

  useEffect(() => {
    // Initialisation de la carte OpenLayers centrée sur l'Algérie
    // Extent de l'Algérie: Longitude -8.7° à 11.9°E, Latitude 19.0°N à 37.1°N
    const algeriaExtent = transformExtent(
      [-8.7, 19.0, 11.9, 37.1], // [minx, miny, maxx, maxy] en EPSG:4326
      'EPSG:4326',
      'EPSG:3857'
    )

    const map = new OlMap({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([3.0, 28.0]), // Centre de l'Algérie
        zoom: 6
      })
    })

    mapInstanceRef.current = map

    // Ajouter l'interaction de sélection pour les clics
    const selectInteraction = new Select({
      condition: click,
      layers: (layer) => {
        // Permettre la sélection uniquement sur les couches vectorielles
        return layer instanceof VectorLayer
      }
    })

    selectInteraction.on('select', (e) => {
      if (e.selected.length > 0) {
        // Prendre la première feature sélectionnée
        const feature = e.selected[0]
        // Stocker la coordonnée géographique de la feature pour un positionnement relatif à la carte
        const geometry = feature.getGeometry()
        if (geometry) {
          const extent = geometry.getExtent()
          const centerCoordinate = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2]
          feature.set('_featureCoordinate', centerCoordinate)
        }
        setSelectedFeature(feature)
      } else {
        setSelectedFeature(null)
      }
    })

    map.addInteraction(selectInteraction)
    selectInteractionRef.current = selectInteraction

    // Ajuster la vue pour couvrir tout le pays après un court délai
    setTimeout(() => {
      map.getView().fit(algeriaExtent, {
        padding: [20, 20, 20, 20],
        duration: 500
      })
    }, 100)

    return () => {
      if (selectInteractionRef.current) {
        map.removeInteraction(selectInteractionRef.current)
      }
      map.setTarget(undefined)
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current

    // Supprimer les couches qui ne sont plus sélectionnées
    Object.keys(vectorLayersRef.current).forEach(layerName => {
      if (!selectedLayers.includes(layerName)) {
        const layer = vectorLayersRef.current[layerName]
        map.removeLayer(layer)
        delete vectorLayersRef.current[layerName]
      }
    })

    // Ajouter les nouvelles couches sélectionnées
    selectedLayers.forEach(layerName => {
      if (!vectorLayersRef.current[layerName]) {
        // Créer le format GeoJSON
        const geojsonFormat = new GeoJSON({
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        })

        // Créer la source vectorielle
        const vectorSource = new VectorSource()

        // Obtenir la couleur de la couche ou utiliser la couleur par défaut
        const layerColor = layerColors[layerName] || '#ff0000'
        layerColorsRef.current[layerName] = layerColor
        
        // Fonction pour convertir hex en rgba
        const hexToRgba = (hex, alpha) => {
          const r = parseInt(hex.slice(1, 3), 16)
          const g = parseInt(hex.slice(3, 5), 16)
          const b = parseInt(hex.slice(5, 7), 16)
          return `rgba(${r}, ${g}, ${b}, ${alpha})`
        }
        
        const styleFunction = (feature) => {
          const geometry = feature.getGeometry()
          if (!geometry) {
            return new Style({
              stroke: new Stroke({ color: layerColor, width: 3 }),
              fill: new Fill({ color: hexToRgba(layerColor, 0.3) }),
              image: new Circle({
                radius: 8,
                fill: new Fill({ color: layerColor }),
                stroke: new Stroke({ color: '#ffffff', width: 2 })
              })
            })
          }
          
          const geometryType = geometry.getType()
          
          if (geometryType === 'Point' || geometryType === 'MultiPoint') {
            return new Style({
              image: new Circle({
                radius: 12,
                fill: new Fill({ color: layerColor }),
                stroke: new Stroke({ color: '#ffffff', width: 3 })
              })
            })
          } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
            return new Style({
              stroke: new Stroke({ 
                color: layerColor, 
                width: 5 
              })
            })
          } else {
            // Polygon ou MultiPolygon
            return new Style({
              stroke: new Stroke({ 
                color: layerColor, 
                width: 4 
              }),
              fill: new Fill({ 
                color: hexToRgba(layerColor, 0.4)
              })
            })
          }
        }

        const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: styleFunction,
          opacity: 1.0,
          visible: true,
          zIndex: 10
        })

        vectorLayersRef.current[layerName] = vectorLayer
        map.addLayer(vectorLayer)

        // Charger les données GeoJSON avec une approche simplifiée
        const loadLayerData = async () => {
          try {
            const response = await axios.get(`http://localhost:5000/api/layers/${layerName}/geojson`)
            const geojsonData = response.data
            
            console.log(`[${layerName}] Données reçues, features:`, geojsonData?.features?.length || 0)
            
            if (geojsonData.error) {
              console.error(`[${layerName}] Erreur:`, geojsonData.error)
              return
            }
            
            if (!geojsonData?.features || geojsonData.features.length === 0) {
              console.warn(`[${layerName}] Aucune feature dans la réponse`)
              return
            }
            
            // Lire les features avec le bon format
            const features = geojsonFormat.readFeatures(geojsonData, {
              featureProjection: 'EPSG:3857',
              dataProjection: 'EPSG:4326'
            })
            
            console.log(`[${layerName}] ${features.length} features parsées`)
            
            if (features.length === 0) {
              console.warn(`[${layerName}] Aucune feature parsée`)
              return
            }
            
            // Vérifier que les features ont des géométries valides
            const validFeatures = features.filter(f => {
              const geom = f.getGeometry()
              if (!geom) {
                console.warn(`[${layerName}] Feature sans géométrie ignorée`)
                return false
              }
              return true
            })
            
            console.log(`[${layerName}] ${validFeatures.length} features valides sur ${features.length}`)
            
            if (validFeatures.length === 0) {
              console.error(`[${layerName}] Aucune feature valide à afficher`)
              return
            }
            
            // Stocker le nom de la couche dans chaque feature
            validFeatures.forEach(feature => {
              feature.set('_layerName', layerName)
            })
            
            // Ajouter toutes les features valides à la source
            vectorSource.clear()
            vectorSource.addFeatures(validFeatures)
            
            console.log(`[${layerName}] ✅ ${validFeatures.length} features ajoutées à la source`)
            console.log(`[${layerName}] Source extent:`, vectorSource.getExtent())
            
            // Forcer le rafraîchissement multiple fois pour s'assurer
            vectorLayer.changed()
            vectorSource.changed()
            map.updateSize()
            map.render()
            
            // Ne plus ajuster automatiquement la vue - le zoom se fait via le bouton
            
          } catch (err) {
            console.error(`[${layerName}] Erreur:`, err)
            if (err.response) {
              console.error(`[${layerName}] Status:`, err.response.status, 'Data:', err.response.data)
            }
          }
        }
        
        loadLayerData()
      }
    })
  }, [selectedLayers])

  // Mettre à jour les couleurs quand layerColors change
  useEffect(() => {
    if (!mapInstanceRef.current) return

    Object.keys(layerColors).forEach(layerName => {
      const layer = vectorLayersRef.current[layerName]
      if (layer && layerColors[layerName]) {
        const color = layerColors[layerName]
        layerColorsRef.current[layerName] = color
        
        // Créer une nouvelle fonction de style
        const hexToRgba = (hex, alpha) => {
          const r = parseInt(hex.slice(1, 3), 16)
          const g = parseInt(hex.slice(3, 5), 16)
          const b = parseInt(hex.slice(5, 7), 16)
          return `rgba(${r}, ${g}, ${b}, ${alpha})`
        }
        
        const styleFunction = (feature) => {
          const geometry = feature.getGeometry()
          if (!geometry) {
            return new Style({
              stroke: new Stroke({ color: color, width: 3 }),
              fill: new Fill({ color: hexToRgba(color, 0.3) }),
              image: new Circle({
                radius: 8,
                fill: new Fill({ color: color }),
                stroke: new Stroke({ color: '#ffffff', width: 2 })
              })
            })
          }
          
          const geometryType = geometry.getType()
          
          if (geometryType === 'Point' || geometryType === 'MultiPoint') {
            return new Style({
              image: new Circle({
                radius: 12,
                fill: new Fill({ color: color }),
                stroke: new Stroke({ color: '#ffffff', width: 3 })
              })
            })
          } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
            return new Style({
              stroke: new Stroke({ color: color, width: 5 })
            })
          } else {
            return new Style({
              stroke: new Stroke({ color: color, width: 4 }),
              fill: new Fill({ color: hexToRgba(color, 0.4) })
            })
          }
        }
        
        layer.setStyle(styleFunction)
        layer.changed()
      }
    })
  }, [layerColors])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} className="ol-map" />
      {mapInstanceRef.current && (
        <MeasureTool map={mapInstanceRef.current} />
      )}
      {selectedFeature && mapInstanceRef.current && (
        <FeaturePopup 
          feature={selectedFeature} 
          map={mapInstanceRef.current}
          onClose={() => setSelectedFeature(null)} 
        />
      )}
    </div>
  )
})

Map.displayName = 'Map'

export default Map

