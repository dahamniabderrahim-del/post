import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config'
import './AttributeTable.css'

function AttributeTable({ layerName, isOpen, onClose }) {
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    if (isOpen && layerName) {
      loadAttributeData()
    } else {
      // Réinitialiser quand fermé
      setData([])
      setColumns([])
      setSearchTerm('')
      setError(null)
    }
  }, [isOpen, layerName])

  const loadAttributeData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.get(`${API_URL}/api/layers/${layerName}/geojson`)
      const geojsonData = response.data
      
      if (geojsonData.error) {
        setError(geojsonData.error)
        setLoading(false)
        return
      }
      
      if (!geojsonData?.features || geojsonData.features.length === 0) {
        setError('Aucune donnée disponible pour cette couche')
        setLoading(false)
        return
      }
      
      // Extraire les propriétés de toutes les features
      const features = geojsonData.features
      const propertiesArray = features.map((feature, index) => ({
        id: index + 1,
        ...feature.properties
      }))
      
      // Extraire toutes les colonnes uniques
      const allColumns = new Set()
      propertiesArray.forEach(item => {
        Object.keys(item).forEach(key => {
          if (key !== 'id') {
            allColumns.add(key)
          }
        })
      })
      
      setColumns(Array.from(allColumns).sort())
      setData(propertiesArray)
      setLoading(false)
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err)
      setError(err.response?.data?.error || 'Erreur lors du chargement des données')
      setLoading(false)
    }
  }

  // Filtrer les données selon la recherche avec support multi-termes séparés par "/"
  const filteredData = data.filter(item => {
    if (!searchTerm) return true
    
    // Diviser le terme de recherche par "/" pour obtenir plusieurs critères
    const searchTerms = searchTerm.split('/').map(term => term.trim()).filter(term => term.length > 0)
    
    if (searchTerms.length === 0) return true
    
    // Si un seul terme, chercher dans toutes les colonnes (comportement original)
    if (searchTerms.length === 1) {
      const searchLower = searchTerms[0].toLowerCase()
      return Object.values(item).some(value => 
        value !== null && value.toString().toLowerCase().includes(searchLower)
      )
    }
    
    // Si plusieurs termes, chaque terme doit correspondre à au moins une colonne
    // Plus il y a de termes, plus le filtre est précis
    const itemValues = Object.values(item).map(value => 
      value !== null ? value.toString().toLowerCase() : ''
    )
    
    // Vérifier que chaque terme de recherche correspond à au moins une valeur
    return searchTerms.every(term => {
      const termLower = term.toLowerCase()
      return itemValues.some(value => value.includes(termLower))
    })
  })

  // Afficher toutes les données avec scroll (pas de pagination)

  if (!isOpen) return null

  return (
    <div className={`attribute-table-container ${isMinimized ? 'minimized' : ''}`}>
        <div className="attribute-table-header">
          <div className="attribute-table-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
              <line x1="15" y1="3" x2="15" y2="21"/>
            </svg>
            <h2>Table attributaire: {layerName}</h2>
          </div>
          <div className="attribute-table-header-actions">
            <button 
              className="attribute-table-minimize" 
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? "Agrandir" : "Réduire"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMinimized ? (
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                ) : (
                  <path d="M8 3v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V3m0 18v-3a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3M3 12h18"/>
                )}
              </svg>
            </button>
            <button className="attribute-table-close" onClick={onClose} title="Fermer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {!isMinimized && (
        <div className="attribute-table-content">
          {loading && (
            <div className="attribute-table-loading">
              <div className="spinner"></div>
              <p>Chargement des données...</p>
            </div>
          )}

          {error && (
            <div className="attribute-table-error">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="attribute-table-toolbar">
                <div className="attribute-table-search">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Rechercher (utiliser / pour séparer les termes: terme1/terme2/terme3)..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                    }}
                  />
                </div>
                <div className="attribute-table-info">
                  <span>{filteredData.length} enregistrement(s)</span>
                  {searchTerm && (
                    <>
                      <span className="filtered-badge">filtré(s)</span>
                      {searchTerm.includes('/') && (
                        <span className="filtered-badge" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                          {searchTerm.split('/').filter(t => t.trim().length > 0).length} terme(s)
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {columns.length === 0 ? (
                <div className="attribute-table-empty">
                  <p>Aucune colonne attributaire disponible</p>
                </div>
              ) : (
                <>
                  <div className="attribute-table-wrapper">
                    <table className="attribute-table">
                      <thead>
                        <tr>
                          <th className="row-number">#</th>
                          {columns.map(col => (
                            <th key={col}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length === 0 ? (
                          <tr>
                            <td colSpan={columns.length + 1} className="no-results">
                              Aucun résultat trouvé
                            </td>
                          </tr>
                        ) : (
                          filteredData.map((item, rowIndex) => (
                            <tr key={item.id || rowIndex}>
                              <td className="row-number">{rowIndex + 1}</td>
                              {columns.map(col => (
                                <td key={col}>
                                  {item[col] !== null && item[col] !== undefined
                                    ? String(item[col])
                                    : <span className="null-value">—</span>}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
        )}
    </div>
  )
}

export default AttributeTable

