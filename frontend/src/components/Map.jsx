import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import { Map as OlMap, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import ImageLayer from 'ol/layer/Image'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import ImageStatic from 'ol/source/ImageStatic'
import { fromLonLat, transformExtent, toLonLat, get as getProjection } from 'ol/proj'
import { Style, Stroke, Fill, Circle } from 'ol/style'
import GeoJSON from 'ol/format/GeoJSON'
import { click } from 'ol/events/condition'
import { Select } from 'ol/interaction'
import { getCenter } from 'ol/extent'
import 'ol/ol.css'
import axios from 'axios'
import { API_URL } from '../config'
import FeaturePopup from './FeaturePopup'
import MeasureTool from './MeasureTool'
import FilterPanel from './FilterPanel'
import BaseLayerSwitcher from './BaseLayerSwitcher'

const Map = forwardRef(({ selectedLayers, layerColors = {}, filter = null, layers = [], onFilterChange }, ref) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const vectorLayersRef = useRef({})
  const rasterLayersRef = useRef({})
  const layerColorsRef = useRef({})
  const layerTypesRef = useRef({}) // Stocker le type de chaque couche (vector/raster)
  const rasterErrorCountRef = useRef({}) // Compter les erreurs pour chaque raster
  const [selectedFeature, setSelectedFeature] = useState(null)
  const selectInteractionRef = useRef(null)
  const blinkAnimationRef = useRef({})

  useImperativeHandle(ref, () => ({
    getMap: () => mapInstanceRef.current,
    setSelectInteractionActive: (active) => {
      if (!mapInstanceRef.current || !selectInteractionRef.current) return
      if (active) {
        mapInstanceRef.current.addInteraction(selectInteractionRef.current)
      } else {
        mapInstanceRef.current.removeInteraction(selectInteractionRef.current)
        setSelectedFeature(null) // Fermer le popup si ouvert
      }
    },
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
      const layerType = layerTypesRef.current[layerName]
      
      // Vérifier si c'est une couche raster
      if (layerType === 'raster') {
        // Pour les rasters, utiliser l'endpoint bounds
        axios.get(`${API_URL}/api/layers/${layerName}/raster/bounds`)
          .then(boundsResponse => {
            const bounds = boundsResponse.data
            if (bounds?.minx && bounds?.miny && bounds?.maxx && bounds?.maxy) {
              const extent = transformExtent(
                [bounds.minx, bounds.miny, bounds.maxx, bounds.maxy],
                'EPSG:4326',
                'EPSG:3857'
              )
              console.log(`[${layerName}] Zoom sur raster extent:`, extent)
              map.getView().fit(extent, {
                padding: [50, 50, 50, 50],
                duration: 1000,
                maxZoom: 18
              })
            }
          })
          .catch(err => {
            console.error(`[${layerName}] Erreur bounds raster:`, err)
            // Fallback vers l'endpoint bounds standard
            axios.get(`${API_URL}/api/layers/${layerName}/bounds`)
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
              .catch(err2 => console.error(`[${layerName}] Erreur bounds:`, err2))
          })
        return
      }
      
      // Pour les couches vectorielles
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
        axios.get(`${API_URL}/api/layers/${layerName}/bounds`)
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
      layers: [], // Les couches de base seront ajoutées par BaseLayerSwitcher
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
        // Exclure la couche de mesure
        const layerName = layer.get('name')
        if (layerName === 'measure-layer') return false
        return layer instanceof VectorLayer
      },
      // Exclure également les features de mesure directement
      filter: (feature) => {
        const layerName = feature.get('_layerName')
        return layerName && layerName !== 'measure-layer'
      }
    })

    selectInteraction.on('select', (e) => {
      if (e.selected.length > 0) {
        // Prendre la première feature sélectionnée
        const feature = e.selected[0]
        
        // Vérifier que la feature a un nom de couche valide
        const layerName = feature.get('_layerName')
        if (!layerName || layerName === 'measure-layer') {
          // Ignorer les features sans nom de couche ou de la couche de mesure
          setSelectedFeature(null)
          return
        }
        
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

    // Construire un map des types de couches depuis la prop layers
    const layerTypeMap = {}
    if (layers && Array.isArray(layers)) {
      layers.forEach(layer => {
        if (layer.name && layer.type) {
          layerTypeMap[layer.name] = layer.type
          layerTypesRef.current[layer.name] = layer.type
          if (layer.type === 'raster') {
            console.log(`🗺️ Couche raster détectée: ${layer.name}`)
          }
        }
      })
      console.log(`📋 Total couches: ${layers.length}, Types:`, layers.map(l => `${l.name}(${l.type || 'vector'})`).join(', '))
    }

    // Supprimer les couches qui ne sont plus sélectionnées (vectorielles et raster)
    Object.keys(vectorLayersRef.current).forEach(layerName => {
      if (!selectedLayers.includes(layerName)) {
        const layer = vectorLayersRef.current[layerName]
        map.removeLayer(layer)
        delete vectorLayersRef.current[layerName]
      }
    })
    Object.keys(rasterLayersRef.current).forEach(layerName => {
      if (!selectedLayers.includes(layerName)) {
        const layer = rasterLayersRef.current[layerName]
        map.removeLayer(layer)
        delete rasterLayersRef.current[layerName]
      }
    })

    // Recharger les couches si le filtre a changé (même si elles existent déjà)
    const shouldReload = (layerName) => {
      const layerType = layerTypeMap[layerName] || layerTypesRef.current[layerName] || 'vector'
      
      // Pour les rasters, on ne supporte pas les filtres pour l'instant
      if (layerType === 'raster') {
        return !rasterLayersRef.current[layerName]
      }
      
      // Pour les couches vectorielles
      // Si la couche n'existe pas, il faut la créer
      if (!vectorLayersRef.current[layerName]) {
        return true
      }
      // Si un filtre est actif pour cette couche, il faut recharger
      if (filter && filter.layer === layerName && filter.column && filter.value) {
        return true
      }
      // Si le filtre a été supprimé mais qu'il y avait un filtre avant, recharger
      if (!filter && vectorLayersRef.current[layerName]) {
        return true
      }
      return false
    }

    // Fonction pour obtenir la couleur d'une couche (utilise celle de layerColors si disponible)
    const getLayerColor = (layerName) => {
      // Utiliser la couleur de layerColors si elle existe
      if (layerColors[layerName]) {
        return layerColors[layerName]
      }
      // Sinon, utiliser la couleur stockée dans la ref
      if (layerColorsRef.current[layerName]) {
        return layerColorsRef.current[layerName]
      }
      // Fallback: rouge par défaut (ne devrait pas arriver car App.jsx initialise les couleurs)
      return '#ff0000'
    }

    // Ajouter les nouvelles couches sélectionnées ou recharger si nécessaire
    selectedLayers.forEach(layerName => {
      if (shouldReload(layerName)) {
        const layerType = layerTypeMap[layerName] || layerTypesRef.current[layerName] || 'vector'
        
        // Supprimer la couche existante si elle existe pour la recréer
        if (vectorLayersRef.current[layerName]) {
          const existingLayer = vectorLayersRef.current[layerName]
          map.removeLayer(existingLayer)
          delete vectorLayersRef.current[layerName]
        }
        if (rasterLayersRef.current[layerName]) {
          const existingLayer = rasterLayersRef.current[layerName]
          map.removeLayer(existingLayer)
          delete rasterLayersRef.current[layerName]
          // Réinitialiser le compteur d'erreur quand on supprime la couche
          delete rasterErrorCountRef.current[layerName]
        }
        
        // Arrêter l'animation si elle existe
        if (blinkAnimationRef.current[layerName]) {
          clearInterval(blinkAnimationRef.current[layerName])
          delete blinkAnimationRef.current[layerName]
        }
        
        // Créer la nouvelle couche selon son type
        if (layerType === 'raster') {
          console.log(`[${layerName}] 🖼️ Création d'une couche raster`)
          // Créer une couche raster
          const loadRasterLayer = async () => {
            try {
              console.log(`[${layerName}] 📡 Récupération des limites du raster...`)
              // Récupérer les limites du raster
              const boundsResponse = await axios.get(`${API_URL}/api/layers/${layerName}/raster/bounds`)
              const bounds = boundsResponse.data
              console.log(`[${layerName}] 📦 Limites reçues:`, bounds)
              
              if (!bounds || !bounds.minx || !bounds.miny || !bounds.maxx || !bounds.maxy) {
                console.error(`[${layerName}] ❌ Impossible de récupérer les limites pour le raster`)
                return
              }
              
              // Créer une source d'image statique pour le raster
              // Charger l'image complète du raster
              const imageExtent = transformExtent(
                [bounds.minx, bounds.miny, bounds.maxx, bounds.maxy],
                'EPSG:4326',
                'EPSG:3857'
              )
              console.log(`[${layerName}] 🗺️ Extent transformé:`, imageExtent)
              
              // Créer une fonction pour charger l'image dynamiquement
              const loadRasterImage = () => {
                const view = map.getView()
                const extent = view.calculateExtent(map.getSize())
                const size = map.getSize()
                
                if (!extent || !size || extent.length !== 4) {
                  console.warn(`[${layerName}] ⚠️ Extent ou size non disponible`)
                  return
                }
                
                // Convertir l'étendue en coordonnées WGS84
                const wgs84Extent = transformExtent(extent, 'EPSG:3857', 'EPSG:4326')
                
                // Construire l'URL avec les paramètres bbox
                const bbox = `${wgs84Extent[0]},${wgs84Extent[1]},${wgs84Extent[2]},${wgs84Extent[3]}`
                const width = size[0]
                const height = size[1]
                
                // Limiter la taille pour éviter les problèmes de décodage (max 2048x2048)
                const safeWidth = Math.min(width, 2048)
                const safeHeight = Math.min(height, 2048)
                
                const url = `${API_URL}/api/layers/${layerName}/raster?bbox=${bbox}&width=${safeWidth}&height=${safeHeight}`
                console.log(`[${layerName}] 🔗 URL raster:`, url)
                
                // Créer une nouvelle source d'image avec l'URL dynamique
                const imageSource = new ImageStatic({
                  url: url,
                  imageExtent: extent,
                  projection: getProjection('EPSG:3857'),
                  imageLoadFunction: (image, src) => {
                    const img = new Image()
                    img.crossOrigin = 'anonymous'
                    img.onload = () => {
                      image.getImage().src = img.src
                    }
                    img.onerror = (error) => {
                      // Incrémenter le compteur d'erreur
                      if (!rasterErrorCountRef.current[layerName]) {
                        rasterErrorCountRef.current[layerName] = 0
                      }
                      rasterErrorCountRef.current[layerName]++
                      
                      const errorCount = rasterErrorCountRef.current[layerName]
                      
                      if (errorCount === 1) {
                        // Première erreur: essayer de récupérer le message d'erreur depuis le serveur
                        fetch(src, { method: 'GET' })
                          .then(response => {
                            if (!response.ok) {
                              return response.json().catch(() => null)
                            }
                            return null
                          })
                          .then(errorData => {
                            if (errorData?.error || errorData?.details) {
                              console.error(`[${layerName}] ❌ Erreur serveur:`, errorData.error || errorData.details)
                              if (errorData.details?.includes('GDAL') || errorData.details?.includes('pilote')) {
                                console.warn(`[${layerName}] ⚠️ Les pilotes GDAL ne sont pas disponibles. La couche raster ne peut pas être affichée.`)
                                // Désactiver la couche après 2 erreurs
                                if (errorCount >= 2 && rasterLayersRef.current[layerName]) {
                                  rasterLayersRef.current[layerName].setVisible(false)
                                }
                              }
                            } else {
                              console.error(`[${layerName}] ❌ Erreur de chargement de l'image raster (erreur ${errorCount})`)
                            }
                          })
                          .catch(() => {
                            console.error(`[${layerName}] ❌ Erreur de chargement de l'image raster (erreur ${errorCount})`)
                          })
                      } else if (errorCount >= 3) {
                        console.warn(`[${layerName}] ⚠️ Trop d'erreurs (${errorCount}). Arrêt des tentatives de chargement.`)
                        // Désactiver la couche si elle existe
                        if (rasterLayersRef.current[layerName]) {
                          rasterLayersRef.current[layerName].setVisible(false)
                        }
                      } else {
                        console.error(`[${layerName}] ❌ Erreur de chargement de l'image raster (erreur ${errorCount}/3)`)
                      }
                      console.error(`[${layerName}] URL:`, src)
                    }
                    img.src = src
                  }
                })
                
                // Mettre à jour la source de la couche
                if (rasterLayersRef.current[layerName]) {
                  console.log(`[${layerName}] 🔄 Mise à jour de la source raster`)
                  rasterLayersRef.current[layerName].setSource(imageSource)
                }
              }
              
              // Créer la couche raster avec une source initiale
              // Pour l'image initiale, utiliser l'étendue complète du raster
              const view = map.getView()
              const currentExtent = view.calculateExtent(map.getSize())
              const size = map.getSize()
              
              let initialUrl
              if (currentExtent && size) {
                const wgs84Extent = transformExtent(currentExtent, 'EPSG:3857', 'EPSG:4326')
                const bbox = `${wgs84Extent[0]},${wgs84Extent[1]},${wgs84Extent[2]},${wgs84Extent[3]}`
                // Limiter la taille pour éviter les problèmes de décodage
                const safeWidth = Math.min(size[0], 2048)
                const safeHeight = Math.min(size[1], 2048)
                initialUrl = `${API_URL}/api/layers/${layerName}/raster?bbox=${bbox}&width=${safeWidth}&height=${safeHeight}`
              } else {
                // Fallback: utiliser l'étendue complète du raster
                const bbox = `${bounds.minx},${bounds.miny},${bounds.maxx},${bounds.maxy}`
                initialUrl = `${API_URL}/api/layers/${layerName}/raster?bbox=${bbox}&width=1024&height=1024`
              }
              
              console.log(`[${layerName}] 🖼️ URL initiale:`, initialUrl)
              
              const initialImageSource = new ImageStatic({
                url: initialUrl,
                imageExtent: imageExtent,
                projection: getProjection('EPSG:3857'),
                imageLoadFunction: (image, src) => {
                  const img = new Image()
                  img.crossOrigin = 'anonymous'
                  img.onload = () => {
                    console.log(`[${layerName}] ✅ Image raster chargée avec succès`)
                    image.getImage().src = img.src
                  }
                  img.onerror = (error) => {
                    // Incrémenter le compteur d'erreur
                    if (!rasterErrorCountRef.current[layerName]) {
                      rasterErrorCountRef.current[layerName] = 0
                    }
                    rasterErrorCountRef.current[layerName]++
                    
                    const errorCount = rasterErrorCountRef.current[layerName]
                    
                    if (errorCount === 1) {
                      // Première erreur: essayer de récupérer le message d'erreur depuis le serveur
                      fetch(src, { method: 'GET' })
                        .then(response => {
                          if (!response.ok) {
                            return response.json().catch(() => null)
                          }
                          return null
                        })
                        .then(errorData => {
                          if (errorData?.error || errorData?.details) {
                            console.error(`[${layerName}] ❌ Erreur serveur:`, errorData.error || errorData.details)
                            if (errorData.details?.includes('GDAL') || errorData.details?.includes('pilote')) {
                              console.warn(`[${layerName}] ⚠️ Les pilotes GDAL ne sont pas disponibles. La couche raster ne peut pas être affichée.`)
                            }
                          } else {
                            console.error(`[${layerName}] ❌ Erreur de chargement de l'image raster (erreur ${errorCount})`)
                          }
                        })
                        .catch(() => {
                          console.error(`[${layerName}] ❌ Erreur de chargement de l'image raster (erreur ${errorCount})`)
                        })
                    } else if (errorCount >= 3) {
                      console.warn(`[${layerName}] ⚠️ Trop d'erreurs (${errorCount}). Arrêt des tentatives de chargement.`)
                      // Désactiver la couche si elle existe
                      if (rasterLayersRef.current[layerName]) {
                        rasterLayersRef.current[layerName].setVisible(false)
                      }
                    } else {
                      console.error(`[${layerName}] ❌ Erreur de chargement de l'image raster (erreur ${errorCount}/3)`)
                    }
                    console.error(`[${layerName}] URL:`, src)
                  }
                  img.src = src
                }
              })
              
              const rasterLayer = new ImageLayer({
                source: initialImageSource,
                opacity: 1.0,
                visible: true,
                zIndex: 10
              })
              
              rasterLayersRef.current[layerName] = rasterLayer
              map.addLayer(rasterLayer)
              console.log(`[${layerName}] ✅ Couche raster ajoutée à la carte`)
              
              // Mettre à jour le raster quand la vue change (avec debounce)
              let updateTimeout = null
              const updateRaster = () => {
                if (updateTimeout) clearTimeout(updateTimeout)
                updateTimeout = setTimeout(() => {
                  loadRasterImage()
                }, 300) // Attendre 300ms après le dernier changement
              }
              
              map.getView().on('change:center', updateRaster)
              map.getView().on('change:resolution', updateRaster)
              
            } catch (error) {
              console.error(`[${layerName}] ❌ Erreur lors du chargement du raster:`, error)
              if (error.response) {
                console.error(`[${layerName}] Status:`, error.response.status, 'Data:', error.response.data)
                // Vérifier si c'est une erreur GDAL
                if (error.response.data?.details?.includes('GDAL') || error.response.data?.details?.includes('pilote')) {
                  console.warn(`[${layerName}] ⚠️ Les pilotes GDAL ne sont pas disponibles. La couche raster ne peut pas être affichée.`)
                }
              }
            }
          }
          
          loadRasterLayer()
          return // Passer à la couche suivante
        }
        
        // Créer la nouvelle couche vectorielle
        // Créer le format GeoJSON
        const geojsonFormat = new GeoJSON({
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        })

        // Créer la source vectorielle
        const vectorSource = new VectorSource()

        // Obtenir la couleur de la couche (déjà initialisée par App.jsx)
        const layerColor = getLayerColor(layerName)
        layerColorsRef.current[layerName] = layerColor
        
        // Fonction pour convertir hex ou rgb en rgba
        const colorToRgba = (color, alpha) => {
          // Si c'est déjà en format rgb(...)
          if (color.startsWith('rgb(')) {
            const rgb = color.match(/\d+/g)
            if (rgb && rgb.length >= 3) {
              return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`
            }
          }
          // Si c'est en format hex (#rrggbb)
          if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16)
            const g = parseInt(color.slice(3, 5), 16)
            const b = parseInt(color.slice(5, 7), 16)
          return `rgba(${r}, ${g}, ${b}, ${alpha})`
          }
          // Fallback
          return `rgba(255, 255, 0, ${alpha})`
        }
        
        // Alias pour compatibilité
        const hexToRgba = colorToRgba
        
        // Vérifier si un filtre est actif pour cette couche
        const isFiltered = filter && filter.layer === layerName && filter.column && filter.value
        
        // Fonction pour obtenir la couleur (avec clignotement si filtré)
        const getBlinkingColor = () => {
          if (!isFiltered) return layerColor
          
          // Calculer la phase du clignotement (0 à 1)
          const time = Date.now()
          const phase = (Math.sin(time / 500) + 1) / 2 // 500ms pour un cycle complet
          
          // Couleur clignotante (jaune vif uniquement, sans aucune trace de la couleur originale)
          // Varier l'intensité du jaune pour créer l'effet de clignotement
          const intensity = 0.8 + (phase * 0.2) // Entre 0.8 et 1.0 pour un jaune plus vif
          const r = Math.round(255 * intensity)
          const g = Math.round(255 * intensity)
          const b = 0
          
          // Retourner uniquement du jaune pur, aucune couleur noire ou autre
          return `rgb(${r}, ${g}, ${b})`
        }
        
        const styleFunction = (feature) => {
          const geometry = feature.getGeometry()
          if (!geometry) {
                      const currentColor = getBlinkingColor()
                      const fillOpacity = isFiltered ? 0.85 : 0.3 // Opacité très élevée pour les entités filtrées (jaune bien visible)
            return new Style({
                        stroke: new Stroke({ color: currentColor, width: 3 }),
                        fill: new Fill({ color: colorToRgba(currentColor, fillOpacity) }),
              image: new Circle({
                radius: 8,
                          fill: new Fill({ color: currentColor }),
                stroke: new Stroke({ color: '#ffffff', width: 2 })
              })
            })
          }
          
          const geometryType = geometry.getType()
          const currentColor = getBlinkingColor()
          
          if (geometryType === 'Point' || geometryType === 'MultiPoint') {
            return new Style({
              image: new Circle({
                radius: 12,
                fill: new Fill({ color: currentColor }),
                stroke: new Stroke({ color: '#ffffff', width: 3 })
              })
            })
          } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
            return new Style({
              stroke: new Stroke({ 
                color: currentColor, 
                width: 5 
              })
            })
          } else {
            // Polygon ou MultiPolygon
            const fillOpacity = isFiltered ? 0.85 : 0.4 // Opacité très élevée pour les entités filtrées (jaune bien visible)
            return new Style({
              stroke: new Stroke({ 
                color: currentColor, 
                width: 4 
              }),
              fill: new Fill({ 
                color: colorToRgba(currentColor, fillOpacity)
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
            // Construire l'URL avec les paramètres de filtre si applicable
            let url = `${API_URL}/api/layers/${layerName}/geojson`
            if (filter && filter.layer === layerName && filter.column && filter.value) {
              const params = new URLSearchParams({
                column: filter.column,
                operator: filter.operator,
                value: filter.value
              })
              url += `?${params.toString()}`
            }
            
            const response = await axios.get(url)
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
            
            // Démarrer l'animation de clignotement si un filtre est actif
            if (isFiltered) {
              // Arrêter l'animation précédente si elle existe pour cette couche
              if (blinkAnimationRef.current[layerName]) {
                clearInterval(blinkAnimationRef.current[layerName])
              }
              
              // Démarrer l'animation de clignotement
              blinkAnimationRef.current[layerName] = setInterval(() => {
                if (vectorLayer && map) {
                  // Mettre à jour le style de la couche pour forcer le recalcul
                  vectorLayer.setStyle((feature) => {
                    const geometry = feature.getGeometry()
                    if (!geometry) {
                      const currentColor = getBlinkingColor()
                      const fillOpacity = 0.85 // Opacité très élevée pour les entités filtrées (jaune bien visible)
                      return new Style({
                        stroke: new Stroke({ color: currentColor, width: 3 }),
                        fill: new Fill({ color: colorToRgba(currentColor, fillOpacity) }),
                        image: new Circle({
                          radius: 8,
                          fill: new Fill({ color: currentColor }),
                          stroke: new Stroke({ color: '#ffffff', width: 2 })
                        })
                      })
                    }
                    
                    const geometryType = geometry.getType()
                    const currentColor = getBlinkingColor()
                    
                    if (geometryType === 'Point' || geometryType === 'MultiPoint') {
                      return new Style({
                        image: new Circle({
                          radius: 12,
                          fill: new Fill({ color: currentColor }),
                          stroke: new Stroke({ color: '#ffffff', width: 3 })
                        })
                      })
                    } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
                      return new Style({
                        stroke: new Stroke({ 
                          color: currentColor, 
                          width: 5 
                        })
                      })
                    } else {
                      // Polygon ou MultiPolygon - opacité très élevée pour le clignotement
                      const fillOpacity = 0.85 // Opacité très élevée pour les entités filtrées (jaune bien visible)
                      return new Style({
                        stroke: new Stroke({ 
                          color: currentColor, 
                          width: 4 
                        }),
                        fill: new Fill({ 
                          color: colorToRgba(currentColor, fillOpacity)
                        })
                      })
                    }
                  })
                  vectorLayer.changed()
                }
              }, 50) // Mise à jour toutes les 50ms pour un clignotement fluide
            } else {
              // Arrêter l'animation si le filtre n'est plus actif
              if (blinkAnimationRef.current[layerName]) {
                clearInterval(blinkAnimationRef.current[layerName])
                delete blinkAnimationRef.current[layerName]
              }
            }
            
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
    
    // Nettoyer les animations lors du démontage
    return () => {
      Object.values(blinkAnimationRef.current).forEach(intervalId => {
        if (intervalId) clearInterval(intervalId)
      })
      blinkAnimationRef.current = {}
    }
  }, [selectedLayers, filter])

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
        <>
          <BaseLayerSwitcher map={mapInstanceRef.current} />
          <MeasureTool map={mapInstanceRef.current} mapRef={ref} />
          <FilterPanel
            layers={layers}
            selectedLayers={selectedLayers}
            onFilterChange={onFilterChange}
          />
        </>
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
