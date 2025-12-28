# Plan d'Implémentation des Fonctionnalités Manquantes

Basé sur `GUIDE_FONCTIONNALITES.md`, voici les fonctionnalités à implémenter.

## ✅ Fonctionnalités Déjà Implémentées

1. ✅ Visualisation de couches géospatiales
2. ✅ Personnalisation des couleurs
3. ✅ Zoom sur couche
4. ✅ Outil de mesure de distance
5. ✅ Outil de mesure de surface
6. ✅ Effacement des mesures
7. ✅ Consultation des attributs d'entité (FeaturePopup)
8. ✅ Gestion de base de données

## ❌ Fonctionnalités à Implémenter

### 1. 🗺️ Fond de Carte Interchangeable (OSM ↔ Satellite)

**Statut :** ❌ Non implémenté  
**Priorité :** Haute  
**Complexité :** Faible

**Description :** Permettre de basculer entre OpenStreetMap et imagerie satellite (ArcGIS World Imagery).

**Fichiers à modifier :**
- `frontend/src/components/Map.jsx` - Ajouter le basculement de couche
- `frontend/src/components/Map.jsx` - Ajouter un bouton de contrôle

**Étapes d'implémentation :**

1. **Ajouter la source satellite dans Map.jsx :**
```javascript
import XYZ from 'ol/source/XYZ'

// Source satellite ArcGIS World Imagery
const satelliteSource = new XYZ({
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attributions: '© Esri'
})
```

2. **Créer un état pour le type de fond :**
```javascript
const [baseMapType, setBaseMapType] = useState('osm') // 'osm' ou 'satellite'
```

3. **Créer les deux couches de fond :**
```javascript
const osmLayer = new TileLayer({
  source: new OSM()
})

const satelliteLayer = new TileLayer({
  source: satelliteSource
})
```

4. **Ajouter une fonction de basculement :**
```javascript
const toggleBaseMap = () => {
  const map = mapInstanceRef.current
  if (!map) return
  
  const currentBaseLayer = map.getLayers().getArray().find(
    layer => layer instanceof TileLayer && 
    (layer.getSource() instanceof OSM || layer.getSource() instanceof XYZ)
  )
  
  if (currentBaseLayer) {
    map.removeLayer(currentBaseLayer)
  }
  
  if (baseMapType === 'osm') {
    map.getLayers().insertAt(0, satelliteLayer)
    setBaseMapType('satellite')
  } else {
    map.getLayers().insertAt(0, osmLayer)
    setBaseMapType('osm')
  }
}
```

5. **Ajouter un bouton dans le JSX :**
```javascript
<div className="map-controls">
  <button 
    className="base-map-toggle"
    onClick={toggleBaseMap}
    title={`Basculer vers ${baseMapType === 'osm' ? 'Satellite' : 'OSM'}`}
  >
    {baseMapType === 'osm' ? '🛰️' : '🗺️'}
  </button>
</div>
```

---

### 2. 🔎 Filtrage des Entités

**Statut :** ❌ Non implémenté  
**Priorité :** Haute  
**Complexité :** Moyenne

**Description :** Permettre de filtrer les entités d'une couche selon des critères sur les attributs.

**Fichiers à créer :**
- `frontend/src/components/FilterPanel.jsx` - Nouveau composant
- `frontend/src/components/FilterPanel.css` - Styles

**Fichiers à modifier :**
- `frontend/src/App.jsx` - Ajouter le FilterPanel
- `frontend/src/components/Map.jsx` - Appliquer les filtres lors du chargement
- `backend/app.py` - Support des paramètres de filtre dans `/api/layers/<name>/geojson`

**Étapes d'implémentation :**

#### Backend (app.py)

1. **Modifier `/api/layers/<layer_name>/geojson` pour accepter des filtres :**
```python
@app.route('/api/layers/<layer_name>/geojson', methods=['GET'])
def get_layer_geojson(layer_name):
    # Récupérer les paramètres de filtre
    filter_column = request.args.get('column')
    filter_operator = request.args.get('operator')
    filter_value = request.args.get('value')
    
    # Construire la clause WHERE si des filtres sont fournis
    where_clause = f"WHERE {geom_column} IS NOT NULL"
    
    if filter_column and filter_operator and filter_value:
        # Valider que la colonne existe
        # Construire la clause WHERE avec le filtre
        if filter_operator == 'LIKE' or filter_operator == 'NOT LIKE':
            where_clause += f" AND \"{filter_column}\" {filter_operator} '%{filter_value}%'"
        elif filter_operator == '=':
            where_clause += f" AND \"{filter_column}\" = '{filter_value}'"
        # ... autres opérateurs
```

#### Frontend

1. **Créer FilterPanel.jsx :**
```javascript
import React, { useState, useEffect } from 'react'
import './FilterPanel.css'

function FilterPanel({ layers, selectedLayers, onFilterApply, onFilterClear }) {
  const [selectedLayer, setSelectedLayer] = useState('')
  const [columns, setColumns] = useState([])
  const [selectedColumn, setSelectedColumn] = useState('')
  const [operator, setOperator] = useState('=')
  const [value, setValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Charger les colonnes quand une couche est sélectionnée
  useEffect(() => {
    if (selectedLayer) {
      // Appeler l'API pour obtenir les colonnes
      fetch(`${API_URL}/api/layers/${selectedLayer}/columns`)
        .then(res => res.json())
        .then(data => setColumns(data))
    }
  }, [selectedLayer])

  const handleApply = () => {
    if (selectedLayer && selectedColumn && value) {
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
      >
        🔍 Filtre
      </button>
      
      {isOpen && (
        <div className="filter-content">
          <select 
            value={selectedLayer}
            onChange={(e) => setSelectedLayer(e.target.value)}
          >
            <option value="">Sélectionner une couche</option>
            {selectedLayers.map(layer => (
              <option key={layer} value={layer}>{layer}</option>
            ))}
          </select>
          
          {selectedLayer && (
            <>
              <select 
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                <option value="">Sélectionner une colonne</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              
              <select 
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
              >
                <option value="=">=</option>
                <option value="!=">≠</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value=">=">≥</option>
                <option value="<=">≤</option>
                <option value="LIKE">Contient</option>
                <option value="NOT LIKE">Ne contient pas</option>
              </select>
              
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Valeur"
              />
              
              <div className="filter-actions">
                <button onClick={handleApply}>Appliquer</button>
                <button onClick={handleClear}>Effacer</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default FilterPanel
```

2. **Ajouter un endpoint pour les colonnes dans backend/app.py :**
```python
@app.route('/api/layers/<layer_name>/columns', methods=['GET'])
def get_layer_columns(layer_name):
    """Récupère la liste des colonnes d'une couche"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Impossible de se connecter à la base de données'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = %s
        AND data_type NOT LIKE '%geometry%'
        AND udt_name != 'geometry'
        ORDER BY column_name;
        """
        cursor.execute(query, (layer_name,))
        columns = [row[0] for row in cursor.fetchall()]
        return jsonify(columns)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
```

3. **Modifier Map.jsx pour appliquer les filtres :**
```javascript
const [filters, setFilters] = useState({})

// Dans loadLayerData, ajouter les paramètres de filtre
const loadLayerData = async (layerName, filter = null) => {
  let url = `${API_URL}/api/layers/${layerName}/geojson`
  if (filter) {
    url += `?column=${filter.column}&operator=${filter.operator}&value=${filter.value}`
  }
  const response = await axios.get(url)
  // ... reste du code
}
```

4. **Ajouter FilterPanel dans App.jsx :**
```javascript
import FilterPanel from './components/FilterPanel'

// Dans le JSX
<FilterPanel
  layers={layers}
  selectedLayers={selectedLayers}
  onFilterApply={handleFilterApply}
  onFilterClear={handleFilterClear}
/>
```

---

## 📋 Checklist d'Implémentation

### Fonctionnalité 1 : Fond de Carte Interchangeable

- [ ] Ajouter la source satellite (XYZ)
- [ ] Créer l'état pour le type de fond
- [ ] Implémenter la fonction toggleBaseMap
- [ ] Ajouter le bouton de basculement
- [ ] Ajouter les styles CSS
- [ ] Tester le basculement OSM ↔ Satellite

### Fonctionnalité 2 : Filtrage des Entités

- [ ] Créer FilterPanel.jsx
- [ ] Créer FilterPanel.css
- [ ] Ajouter endpoint `/api/layers/<name>/columns` dans backend
- [ ] Modifier `/api/layers/<name>/geojson` pour supporter les filtres
- [ ] Modifier Map.jsx pour appliquer les filtres
- [ ] Ajouter FilterPanel dans App.jsx
- [ ] Tester le filtrage avec différents opérateurs

---

## 🎯 Ordre d'Implémentation Recommandé

1. **Commencer par le fond de carte** (plus simple, résultat visible immédiatement)
2. **Ensuite le filtrage** (plus complexe, nécessite backend + frontend)

---

## 💡 Notes Techniques

### Fond de Carte
- Utiliser ArcGIS World Imagery (gratuit, pas besoin de clé API)
- Alternative : Google Satellite (nécessite clé API)
- Alternative : Bing Maps (nécessite clé API)

### Filtrage
- **Sécurité importante :** Valider et échapper toutes les valeurs de filtre pour éviter les injections SQL
- **Performance :** Les filtres sont appliqués côté serveur (SQL) pour optimiser les performances
- **UX :** Afficher un indicateur visuel (clignotement jaune) pour les entités filtrées

---

Souhaitez-vous que je commence par implémenter une de ces fonctionnalités ?







