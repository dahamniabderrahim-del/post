import React, { useEffect, useRef } from 'react'
import './FeaturePopup.css'

function FeaturePopup({ feature, onClose, map }) {
  const popupRef = useRef(null)
  const clickPositionRef = useRef(null)

  useEffect(() => {
    if (!popupRef.current || !feature || !map) return

    // Obtenir la coordonnée géographique de la feature
    const geometry = feature.getGeometry()
    if (!geometry) return

    const extent = geometry.getExtent()
    const centerCoordinate = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2]
    const featureCoordinateRef = { current: centerCoordinate }

    let isMoving = false
    let animationFrameId = null

    const updatePopupPosition = () => {
      if (!popupRef.current || !featureCoordinateRef.current) return

      const pixel = map.getPixelFromCoordinate(featureCoordinateRef.current)
      if (pixel) {
        const popup = popupRef.current
        const mapElement = map.getTargetElement()
        const mapRect = mapElement.getBoundingClientRect()
        
        // Position relative au conteneur de la carte (statique par rapport à la carte)
        popup.style.left = `${pixel[0] + 15}px`
        popup.style.top = `${pixel[1] + 15}px`
        
        // Ajouter un léger effet dynamique lors du mouvement
        if (isMoving) {
          popup.classList.add('popup-moving')
        } else {
          popup.classList.remove('popup-moving')
        }

        // Ajuster si le popup sort de l'écran
        setTimeout(() => {
          const rect = popup.getBoundingClientRect()

          // Vérifier les bords par rapport au conteneur de la carte
          if (rect.right > mapRect.right) {
            popup.style.left = `${pixel[0] - rect.width - 15}px`
          }
          if (rect.bottom > mapRect.bottom) {
            popup.style.top = `${pixel[1] - rect.height - 15}px`
          }
          if (rect.left < mapRect.left) {
            popup.style.left = '10px'
          }
          if (rect.top < mapRect.top) {
            popup.style.top = '10px'
          }
        }, 0)
      }
    }

    // Fonction pour mettre à jour en continu pendant le pan
    const updateDuringPan = () => {
      if (isMoving) {
        updatePopupPosition()
        animationFrameId = requestAnimationFrame(updateDuringPan)
      }
    }

    // Position initiale
    updatePopupPosition()

    // Écouter le début du mouvement
    map.on('movestart', () => {
      isMoving = true
      updateDuringPan()
    })

    // Écouter la fin du mouvement
    map.on('moveend', () => {
      isMoving = false
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      updatePopupPosition()
    })

    // Mettre à jour lors du zoom
    const view = map.getView()
    view.on('change:resolution', updatePopupPosition)

    return () => {
      map.un('moveend', updatePopupPosition)
      view.un('change:resolution', updatePopupPosition)
    }
  }, [feature, map])

  if (!feature) return null

  const properties = feature.getProperties()
  const geometry = feature.getGeometry()
  const geometryType = geometry ? geometry.getType() : 'N/A'
  const layerName = feature.get('_layerName') || 'Couche inconnue'

  // Exclure les propriétés internes d'OpenLayers
  const displayProperties = Object.keys(properties)
    .filter(key => !key.startsWith('_') && key !== 'geometry')
    .reduce((obj, key) => {
      obj[key] = properties[key]
      return obj
    }, {})

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'number') {
      // Formater les nombres avec séparateurs
      return value.toLocaleString('fr-FR')
    }
    return String(value)
  }

  const getValueType = (value) => {
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) return 'date'
    return 'text'
  }

  return (
    <div ref={popupRef} className="feature-popup">
      <div className="popup-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div className="header-text">
            <span className="popup-title">Informations de l'entité</span>
            <span className="popup-subtitle">{geometryType} • {layerName}</span>
          </div>
        </div>
        <button className="close-button" onClick={onClose} aria-label="Fermer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className="popup-content">
        {Object.keys(displayProperties).length > 0 ? (
          <div className="attributes-container">
            <div className="attributes-header">
              <span className="attributes-count">{Object.keys(displayProperties).length} propriété{Object.keys(displayProperties).length > 1 ? 's' : ''}</span>
            </div>
            <div className="attributes-list">
              {Object.entries(displayProperties).map(([key, value], index) => (
                <div key={key} className="attribute-row" style={{ animationDelay: `${index * 0.03}s` }}>
                  <div className="attribute-label">
                    <span className="label-icon">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5"></path>
                        <path d="M2 12l10 5 10-5"></path>
                      </svg>
                    </span>
                    <span className="label-text">{key}</span>
                  </div>
                  <div className={`attribute-value value-${getValueType(value)}`}>
                    {formatValue(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-attributes">
            <div className="no-attributes-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <p>Aucune propriété disponible</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FeaturePopup

