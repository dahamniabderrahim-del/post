import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './FilterPanel.css'

function FilterPanel({ layers, selectedLayers, onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState('')
  const [columns, setColumns] = useState([])
  const [selectedColumn, setSelectedColumn] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const [filterOperator, setFilterOperator] = useState('=')
  const [loadingColumns, setLoadingColumns] = useState(false)

  // Charger les colonnes quand une couche est sélectionnée
  useEffect(() => {
    if (selectedLayer && selectedLayers.includes(selectedLayer)) {
      loadColumns(selectedLayer)
    } else {
      setColumns([])
      setSelectedColumn('')
    }
  }, [selectedLayer, selectedLayers])

  const loadColumns = async (layerName) => {
    setLoadingColumns(true)
    try {
      // Récupérer un exemple de feature pour obtenir les colonnes
      const response = await axios.get(`http://localhost:5000/api/layers/${layerName}/geojson?limit=1`)
      const geojsonData = response.data
      
      if (geojsonData?.features && geojsonData.features.length > 0) {
        const firstFeature = geojsonData.features[0]
        const properties = firstFeature.properties || {}
        
        // Extraire les noms des colonnes (propriétés)
        const columnNames = Object.keys(properties).filter(key => 
          key !== 'geometry' && !key.startsWith('_')
        )
        
        setColumns(columnNames)
      } else {
        setColumns([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des colonnes:', error)
      setColumns([])
    } finally {
      setLoadingColumns(false)
    }
  }

  const handleApplyFilter = () => {
    if (!selectedLayer || !selectedColumn || !filterValue.trim()) {
      return
    }

    const filter = {
      layer: selectedLayer,
      column: selectedColumn,
      operator: filterOperator,
      value: filterValue.trim()
    }

    onFilterChange(filter)
  }

  const handleClearFilter = () => {
    setSelectedLayer('')
    setSelectedColumn('')
    setFilterValue('')
    setFilterOperator('=')
    setColumns([])
    onFilterChange(null)
  }

  const availableLayers = layers.filter(layer => selectedLayers.includes(layer.name))

  return (
    <div className="filter-panel">
      <button
        className={`filter-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Filtrer les entités"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        <span>Filtre</span>
      </button>

      {isOpen && (
        <div className="filter-content">
          <div className="filter-header">
            <h3>Filtrer les entités</h3>
            <button className="filter-close" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="filter-body">
            <div className="filter-group">
              <label>Couche</label>
              <select
                value={selectedLayer}
                onChange={(e) => {
                  setSelectedLayer(e.target.value)
                  setSelectedColumn('')
                  setFilterValue('')
                }}
                className="filter-select"
              >
                <option value="">Sélectionner une couche</option>
                {availableLayers.map(layer => (
                  <option key={layer.name} value={layer.name}>
                    {layer.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedLayer && (
              <div className="filter-group">
                <label>Colonne</label>
                {loadingColumns ? (
                  <div className="loading-columns">Chargement...</div>
                ) : (
                  <select
                    value={selectedColumn}
                    onChange={(e) => {
                      setSelectedColumn(e.target.value)
                      setFilterValue('')
                    }}
                    className="filter-select"
                  >
                    <option value="">Sélectionner une colonne</option>
                    {columns.map(column => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {selectedColumn && (
              <>
                <div className="filter-group">
                  <label>Opérateur</label>
                  <select
                    value={filterOperator}
                    onChange={(e) => setFilterOperator(e.target.value)}
                    className="filter-select"
                  >
                    <option value="=">= (Égal)</option>
                    <option value="!=">≠ (Différent)</option>
                    <option value=">">&gt; (Supérieur)</option>
                    <option value="<">&lt; (Inférieur)</option>
                    <option value=">=">≥ (Supérieur ou égal)</option>
                    <option value="<=">≤ (Inférieur ou égal)</option>
                    <option value="LIKE">Contient</option>
                    <option value="NOT LIKE">Ne contient pas</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Valeur</label>
                  <input
                    type="text"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    placeholder="Entrer la valeur..."
                    className="filter-input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleApplyFilter()
                      }
                    }}
                  />
                </div>
              </>
            )}

            <div className="filter-actions">
              <button
                className="filter-button apply"
                onClick={handleApplyFilter}
                disabled={!selectedLayer || !selectedColumn || !filterValue.trim()}
              >
                Appliquer
              </button>
              <button
                className="filter-button clear"
                onClick={handleClearFilter}
              >
                Effacer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterPanel
