from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import json
import os

app = Flask(__name__)

# Configuration CORS pour autoriser le frontend déployé
# En production, autoriser toutes les origines Render
# En développement, autoriser localhost
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://sig-frontend.onrender.com",
]

# Ajouter toutes les origines Render possibles
# Note: En production, vous pouvez aussi utiliser CORS(app) pour autoriser toutes les origines
CORS(app, resources={
    r"/api/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": False
    }
}, allow_origin_regex=r"https://.*\.onrender\.com")

# Configuration de la base de données PostgreSQL
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'pos',
    'user': 'postgres',
    'password': 'Admin123'
}

def get_db_connection():
    """Établit une connexion à la base de données PostgreSQL"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Erreur de connexion à la base de données: {e}")
        return None

@app.route('/api/layers', methods=['GET'])
def get_layers():
    """Récupère la liste de toutes les tables/couches géospatiales"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Impossible de se connecter à la base de données'}), 500
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        # Récupère toutes les tables avec des colonnes géométriques
        query = """
        SELECT 
            f.table_name as name,
            f.table_schema as schema
        FROM 
            information_schema.tables f
        WHERE 
            f.table_schema = 'public'
            AND f.table_type = 'BASE TABLE'
            AND EXISTS (
                SELECT 1 
                FROM information_schema.columns c
                WHERE c.table_schema = f.table_schema
                AND c.table_name = f.table_name
                AND (c.data_type LIKE '%geometry%' OR c.udt_name = 'geometry')
            )
        ORDER BY f.table_name;
        """
        cursor.execute(query)
        layers = cursor.fetchall()
        layer_list = [dict(layer) for layer in layers]
        print(f"📋 {len(layer_list)} couche(s) trouvée(s)")
        return jsonify(layer_list)
    except Exception as e:
        print(f"❌ Erreur dans get_layers: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/layers/<layer_name>/geojson', methods=['GET'])
def get_layer_geojson(layer_name):
    """Récupère les données d'une couche au format GeoJSON"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Impossible de se connecter à la base de données'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Vérifier d'abord que la table existe
        check_table_query = f"""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '{layer_name}'
        );
        """
        cursor.execute(check_table_query)
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            print(f"❌ Table {layer_name} n'existe pas")
            return jsonify({'error': f'Table "{layer_name}" n\'existe pas'}), 404
        
        # Trouve la colonne géométrique (sans paramètres pour éviter les erreurs)
        find_geom_query = f"""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = '{layer_name}' 
        AND (data_type LIKE '%geometry%' OR udt_name = 'geometry')
        LIMIT 1;
        """
        
        try:
            cursor.execute(find_geom_query)
            geom_result = cursor.fetchone()
            
            if not geom_result or len(geom_result) == 0:
                print(f"❌ Aucune colonne géométrique trouvée pour {layer_name}")
                return jsonify({'error': 'Aucune colonne géométrique trouvée'}), 404
            
            geom_column = geom_result[0]
            print(f"✓ Colonne géométrique trouvée: {geom_column}")
        except Exception as e:
            print(f"❌ Erreur lors de la recherche de colonne géométrique: {e}")
            return jsonify({'error': f'Erreur lors de la recherche de colonne géométrique: {str(e)}'}), 500
        
        # Trouve le SRID de manière séparée (plus robuste)
        try:
            srid_query = f"""
            SELECT ST_SRID({geom_column}) 
            FROM "{layer_name}" 
            WHERE {geom_column} IS NOT NULL 
            LIMIT 1;
            """
            cursor.execute(srid_query)
            srid_result = cursor.fetchone()
            geom_srid = srid_result[0] if srid_result and srid_result[0] else 4326
        except Exception as e:
            # Si on ne peut pas déterminer le SRID, on assume 4326
            print(f"⚠ Impossible de déterminer le SRID, utilisation de 4326 par défaut: {e}")
            geom_srid = 4326
        
        print(f"✓ SRID détecté: {geom_srid}")
        
        # Récupère toutes les colonnes non-géométriques
        columns_query = f"""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = '{layer_name}' 
        AND column_name != '{geom_column}'
        AND data_type NOT LIKE '%geometry%'
        AND udt_name != 'geometry';
        """
        try:
            cursor.execute(columns_query)
            other_columns = [row[0] for row in cursor.fetchall()]
            print(f"✓ {len(other_columns)} colonne(s) non-géométrique(s) trouvée(s)")
        except Exception as e:
            print(f"⚠ Erreur lors de la récupération des colonnes: {e}")
            other_columns = []
        
        # Récupérer les paramètres de filtre
        filter_column = request.args.get('column')
        filter_operator = request.args.get('operator', '=')
        filter_value = request.args.get('value')
        
        # Construire la clause WHERE pour le filtre (avec protection SQL injection)
        filter_where = ""
        if filter_column and filter_value and filter_column in other_columns:
            # Échapper les apostrophes pour éviter SQL injection
            escaped_value = filter_value.replace("'", "''")
            if filter_operator.upper() == 'LIKE':
                filter_where = f' AND "{filter_column}"::text LIKE \'%{escaped_value}%\''
            elif filter_operator.upper() == 'NOT LIKE':
                filter_where = f' AND "{filter_column}"::text NOT LIKE \'%{escaped_value}%\''
            elif filter_operator == '!=':
                filter_where = f' AND "{filter_column}"::text != \'{escaped_value}\''
            elif filter_operator in ['>', '<', '>=', '<=']:
                filter_where = f' AND "{filter_column}" {filter_operator} \'{escaped_value}\''
            else:  # =
                filter_where = f' AND "{filter_column}"::text = \'{escaped_value}\''
            print(f"🔍 Filtre appliqué: {filter_column} {filter_operator} {filter_value}")
        
        # Construit la requête GeoJSON de manière plus simple et robuste
        # Utilise ST_Transform pour convertir en 4326 si nécessaire
        if geom_srid != 4326:
            geom_expr = f"ST_Transform({geom_column}, 4326)"
        else:
            geom_expr = geom_column
        
        # Construit les properties de manière simple
        if other_columns:
            # Construit json_build_object directement
            props_list = []
            for col in other_columns:
                props_list.append(f"'{col}'")
                props_list.append(f'"{col}"')
            props_str = ', '.join(props_list)
            properties_expr = f"json_build_object({props_str})"
        else:
            properties_expr = "'{}'::json"
        
        # Vérifier d'abord qu'il y a des données
        count_query = f'SELECT COUNT(*) FROM "{layer_name}" WHERE {geom_column} IS NOT NULL{filter_where};'
        cursor.execute(count_query)
        row_count = cursor.fetchone()[0]
        print(f"📊 Table {layer_name}: {row_count} lignes avec géométrie (SRID: {geom_srid})")
        if filter_where:
            print(f"🔍 Filtre appliqué: {filter_column} {filter_operator} {filter_value}")
        
        if row_count == 0:
            print(f"⚠ Table {layer_name} est vide ou aucun résultat avec le filtre")
            return jsonify({'type': 'FeatureCollection', 'features': []})
        
        # Requête SQL simplifiée - approche directe
        geojson_query = f"""
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', COALESCE(
                json_agg(
                    json_build_object(
                        'type', 'Feature',
                        'geometry', ST_AsGeoJSON({geom_expr})::json,
                        'properties', {properties_expr}
                    )
                ),
                '[]'::json
            )
        ) as geojson
        FROM "{layer_name}"
        WHERE {geom_column} IS NOT NULL{filter_where}
        LIMIT 10000;
        """
        
        print(f"🔍 Exécution de la requête pour {layer_name}...")
        cursor.execute(geojson_query)
        result = cursor.fetchone()
        
        if result and result[0]:
            geojson_data = result[0]
            if isinstance(geojson_data, dict) and 'features' in geojson_data:
                feature_count = len(geojson_data.get('features', []))
                print(f"✅ GeoJSON généré pour {layer_name}: {feature_count} features")
                # Vérifier le premier feature pour déboguer
                if feature_count > 0:
                    first_feature = geojson_data['features'][0]
                    print(f"   Exemple feature: type={first_feature.get('geometry', {}).get('type', 'N/A')}")
                return jsonify(geojson_data)
            else:
                print(f"⚠ GeoJSON invalide pour {layer_name} (pas de clé 'features')")
                print(f"   Type de données: {type(geojson_data)}")
                return jsonify({'type': 'FeatureCollection', 'features': []})
        else:
            print(f"⚠ Aucun résultat retourné pour {layer_name}")
            return jsonify({'type': 'FeatureCollection', 'features': []})
            
    except Exception as e:
        import traceback
        error_msg = str(e)
        print(f"❌ Erreur dans get_layer_geojson pour {layer_name}: {error_msg}")
        traceback.print_exc()
        return jsonify({'error': error_msg}), 500
    finally:
        conn.close()

@app.route('/api/layers/<layer_name>/bounds', methods=['GET'])
def get_layer_bounds(layer_name):
    """Récupère les limites (bounding box) d'une couche"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Impossible de se connecter à la base de données'}), 500
    
    try:
        cursor = conn.cursor()
        # Trouve la colonne géométrique
        find_geom_query = """
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = %s 
        AND (data_type LIKE '%geometry%' OR udt_name = 'geometry')
        LIMIT 1;
        """
        cursor.execute(find_geom_query, (layer_name,))
        geom_col = cursor.fetchone()
        
        if not geom_col:
            return jsonify({'error': 'Aucune colonne géométrique trouvée'}), 404
        
        geom_column = geom_col[0]
        
        # Récupère les limites
        bounds_query = f"""
        SELECT 
            ST_XMin(ST_Extent({geom_column})) as minx,
            ST_YMin(ST_Extent({geom_column})) as miny,
            ST_XMax(ST_Extent({geom_column})) as maxx,
            ST_YMax(ST_Extent({geom_column})) as maxy
        FROM "{layer_name}";
        """
        
        cursor.execute(bounds_query)
        bounds = cursor.fetchone()
        
        if bounds and all(bounds):
            return jsonify({
                'minx': bounds[0],
                'miny': bounds[1],
                'maxx': bounds[2],
                'maxy': bounds[3]
            })
        else:
            return jsonify({'error': 'Impossible de calculer les limites'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérifie la santé de l'API et de la connexion à la base de données"""
    conn = get_db_connection()
    if conn:
        conn.close()
        return jsonify({'status': 'healthy', 'database': 'connected'})
    else:
        return jsonify({'status': 'unhealthy', 'database': 'disconnected'}), 500

@app.route('/api/test/<layer_name>', methods=['GET'])
def test_layer(layer_name):
    """Endpoint de test pour déboguer une couche"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Impossible de se connecter à la base de données'}), 500
    
    try:
        cursor = conn.cursor()
        # Vérifie si la table existe
        check_table = """
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = %s
        );
        """
        cursor.execute(check_table, (layer_name,))
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            return jsonify({'error': f'Table "{layer_name}" n\'existe pas'}), 404
        
        # Compte les lignes
        count_query = f'SELECT COUNT(*) FROM "{layer_name}";'
        cursor.execute(count_query)
        count = cursor.fetchone()[0]
        
        # Trouve la colonne géométrique
        find_geom_query = """
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = %s 
        AND (data_type LIKE '%geometry%' OR udt_name = 'geometry')
        LIMIT 1;
        """
        cursor.execute(find_geom_query, (layer_name,))
        geom_col = cursor.fetchone()
        
        result = {
            'table_exists': table_exists,
            'row_count': count,
            'geometry_column': geom_col[0] if geom_col else None
        }
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
