import React, { useState, useEffect } from 'react'
import './FilterPanel.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function FilterPanel({ selectedLayers, onFilterApply, onFilterClear }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState('')
  const [columns, setColumns] = useState([])
  const [selectedColumn, setSelectedColumn] = useState('')
  const [operator, setOperator] = useState('=')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  // Charger les colonnes quand une couche est sélectionnée
  useEffect(() => {
    if (selectedLayer) {
      setLoading(true)
      fetch(`${API_URL}/api/layers/${selectedLayer}/columns`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          return res.json()
        })
        .then(data => {
          if (Array.isArray(data)) {
            setColumns(data)
          } else {
            setColumns([])
          }
        })
        .catch(err => {
          console.error('Erreur lors du chargement des colonnes:', err)
          setColumns([])
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setColumns([])
      setSelectedColumn('')
    }
  }, [selectedLayer])

  const handleApply = () => {
    if (selectedLayer && selectedColumn && value !== '') {
      onFilterApply({
        layer: selectedLayer,
        column: selectedColumn,
        operator: operator,
        value: value
      })
    }
  }

  const handleClear = () => {
    setSelectedLayer('')
    setSelectedColumn('')
    setOperator('=')
    setValue('')
    onFilterClear()
  }

  return (
    <div className="filter-panel">
      <button 
        className="filter-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Ouvrir/Fermer le panneau de filtrage"
      >
        🔍 Filtre
      </button>
      
      {isOpen && (
        <div className="filter-content">
          <h3 className="filter-title">Filtrer les entités</h3>
          
          <div className="filter-field">
            <label>Couche :</label>
            <select 
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              className="filter-select"
            >
              <option value="">Sélectionner une couche</option>
              {selectedLayers.map(layer => (
                <option key={layer} value={layer}>{layer}</option>
              ))}
            </select>
          </div>
          
          {selectedLayer && (
            <>
              <div className="filter-field">
                <label>Colonne :</label>
                {loading ? (
                  <div className="loading">Chargement...</div>
                ) : (
                  <select 
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Sélectionner une colonne</option>
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                )}
              </div>
              
              {selectedColumn && (
                <>
                  <div className="filter-field">
                    <label>Opérateur :</label>
                    <select 
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                      className="filter-select"
                    >
                      <option value="=">= (Égal à)</option>
                      <option value="!=">≠ (Différent de)</option>
                      <option value=">">&gt; (Supérieur à)</option>
                      <option value="<">&lt; (Inférieur à)</option>
                      <option value=">=">≥ (Supérieur ou égal)</option>
                      <option value="<=">≤ (Inférieur ou égal)</option>
                      <option value="LIKE">Contient</option>
                      <option value="NOT LIKE">Ne contient pas</option>
                    </select>
                  </div>
                  
                  <div className="filter-field">
                    <label>Valeur :</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Entrez la valeur"
                      className="filter-input"
                    />
                  </div>
                  
                  <div className="filter-actions">
                    <button 
                      onClick={handleApply}
                      className="filter-button apply"
                      disabled={!selectedLayer || !selectedColumn || value === ''}
                    >
                      Appliquer
                    </button>
                    <button 
                      onClick={handleClear}
                      className="filter-button clear"
                    >
                      Effacer
                    </button>
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

export default FilterPanel

