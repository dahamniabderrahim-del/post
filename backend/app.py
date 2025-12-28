from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import json
import os
from urllib.parse import urlparse
import base64
import io
try:
    from PIL import Image
    import numpy as np
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("⚠️ PIL/Pillow non disponible. Les rasters ne pourront pas être convertis en images.")

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
# Supporte DATABASE_URL (format URL) ou variables individuelles
def get_db_config():
    """Récupère la configuration de la base de données depuis les variables d'environnement"""
    database_url = os.getenv('DATABASE_URL')
    
    if database_url:
        # Format: postgresql://user:password@host:port/database
        result = urlparse(database_url)
        return {
            'host': result.hostname,
            'port': result.port or 5432,
            'database': result.path[1:],  # Enlever le '/' initial
            'user': result.username,
            'password': result.password
        }
    else:
        # Utiliser des variables individuelles ou valeurs par défaut pour développement
        return {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 5432)),
            'database': os.getenv('DB_NAME', 'pos'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', 'Admin123')
        }

DB_CONFIG = get_db_config()

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
    """Récupère la liste de toutes les tables/couches géospatiales (vectorielles et raster)"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Impossible de se connecter à la base de données'}), 500
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        # Récupère toutes les tables avec des colonnes géométriques (vectorielles)
        vector_query = """
        SELECT 
            f.table_name as name,
            f.table_schema as schema,
            'vector' as type
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
        """
        
        # Récupère toutes les tables avec des colonnes raster
        raster_query = """
        SELECT 
            f.table_name as name,
            f.table_schema as schema,
            'raster' as type
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
                AND (c.data_type LIKE '%raster%' OR c.udt_name = 'raster')
            )
        """
        
        # Exécuter les deux requêtes
        cursor.execute(vector_query)
        vector_layers = cursor.fetchall()
        
        cursor.execute(raster_query)
        raster_layers = cursor.fetchall()
        
        # Combiner les résultats
        all_layers = [dict(layer) for layer in vector_layers] + [dict(layer) for layer in raster_layers]
        
        # Trier par nom
        all_layers.sort(key=lambda x: x['name'])
        
        print(f"📋 {len(all_layers)} couche(s) trouvée(s) ({len(vector_layers)} vectorielle(s), {len(raster_layers)} raster(s))")
        return jsonify(all_layers)
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

@app.route('/', methods=['GET'])
def root():
    """Route racine pour vérifier que le serveur fonctionne"""
    return jsonify({
        'status': 'ok',
        'message': 'API backend is running',
        'endpoints': {
            'layers': '/api/layers',
            'health': '/api/health',
            'layer_geojson': '/api/layers/<layer_name>/geojson',
            'layer_bounds': '/api/layers/<layer_name>/bounds',
            'layer_raster': '/api/layers/<layer_name>/raster',
            'raster_bounds': '/api/layers/<layer_name>/raster/bounds'
        }
    }), 200

@app.route('/api/layers/<layer_name>/raster', methods=['GET'])
def get_layer_raster(layer_name):
    """Récupère une image raster PostGIS pour une étendue donnée"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Impossible de se connecter à la base de données'}), 500
    
    try:
        # Récupérer les paramètres de l'étendue (bbox)
        bbox = request.args.get('bbox')
        width = int(request.args.get('width', 256))
        height = int(request.args.get('height', 256))
        
        cursor = conn.cursor()
        
        # Vérifier que la table existe
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
            return jsonify({'error': f'Table "{layer_name}" n\'existe pas'}), 404
        
        # Trouver la colonne raster
        find_raster_query = f"""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = '{layer_name}' 
        AND (data_type LIKE '%raster%' OR udt_name = 'raster')
        LIMIT 1;
        """
        cursor.execute(find_raster_query)
        raster_result = cursor.fetchone()
        
        if not raster_result:
            return jsonify({'error': f'Aucune colonne raster trouvée pour "{layer_name}"'}), 404
        
        raster_column = raster_result[0]
        print(f"✅ Raster {layer_name}: Colonne raster trouvée: {raster_column}")
        
        # Détecter le SRID du raster
        srid_query = f"""
        SELECT ST_SRID({raster_column}) as srid
        FROM "{layer_name}"
        LIMIT 1;
        """
        cursor.execute(srid_query)
        srid_result = cursor.fetchone()
        raster_srid = srid_result[0] if srid_result else 4326
        print(f"🗺️ Raster {layer_name}: SRID détecté: {raster_srid}")
        
        # Si bbox est fourni, utiliser ST_Clip, sinon utiliser toute l'étendue
        if bbox:
            # bbox format: minx,miny,maxx,maxy (toujours en WGS84/4326 depuis le frontend)
            bbox_parts = bbox.split(',')
            if len(bbox_parts) != 4:
                return jsonify({'error': 'Format bbox invalide. Utilisez: minx,miny,maxx,maxy'}), 400
            
            minx_wgs84, miny_wgs84, maxx_wgs84, maxy_wgs84 = map(float, bbox_parts)
            print(f"🖼️ Raster {layer_name}: bbox WGS84={bbox}, width={width}, height={height}")
            
            # Limiter la taille pour éviter les problèmes de décodage (max 2048x2048)
            safe_width = min(width, 2048)
            safe_height = min(height, 2048)
            
            # Si le SRID du raster est différent de 4326, convertir le bbox
            if raster_srid != 4326:
                # Convertir le bbox WGS84 vers le SRID du raster
                transform_query = f"""
                SELECT 
                    ST_XMin(ST_Transform(ST_MakeEnvelope(%s, %s, %s, %s, 4326), {raster_srid})) as minx,
                    ST_YMin(ST_Transform(ST_MakeEnvelope(%s, %s, %s, %s, 4326), {raster_srid})) as miny,
                    ST_XMax(ST_Transform(ST_MakeEnvelope(%s, %s, %s, %s, 4326), {raster_srid})) as maxx,
                    ST_YMax(ST_Transform(ST_MakeEnvelope(%s, %s, %s, %s, 4326), {raster_srid})) as maxy
                """
                cursor.execute(transform_query, (minx_wgs84, miny_wgs84, maxx_wgs84, maxy_wgs84, 
                                                minx_wgs84, miny_wgs84, maxx_wgs84, maxy_wgs84,
                                                minx_wgs84, miny_wgs84, maxx_wgs84, maxy_wgs84,
                                                minx_wgs84, miny_wgs84, maxx_wgs84, maxy_wgs84))
                bbox_transformed = cursor.fetchone()
                minx, miny, maxx, maxy = bbox_transformed
                print(f"🔄 Raster {layer_name}: bbox transformé vers SRID {raster_srid}: {minx}, {miny}, {maxx}, {maxy}")
            else:
                minx, miny, maxx, maxy = minx_wgs84, miny_wgs84, maxx_wgs84, maxy_wgs84
            
            # Récupérer le raster et le convertir en image
            # GDAL est disponible, utiliser ST_AsGDALRaster avec des options explicites
            # Essayer d'abord JPEG, puis PNG si JPEG échoue
            try:
                raster_query = f"""
                SELECT ST_AsGDALRaster(
                    ST_Reclass(
                        ST_Resize(
                            ST_Union(
                                ST_Clip({raster_column}, ST_MakeEnvelope(%s, %s, %s, %s, {raster_srid}))
                            ),
                            %s, %s
                        ),
                        1,
                        '-1000000-1000000:0-255',
                        '8BUI',
                        0
                    ),
                    'JPEG',
                    ARRAY['QUALITY=85']
                ) as image_data
                FROM "{layer_name}"
                WHERE ST_Intersects(
                    ST_Envelope({raster_column}),
                    ST_MakeEnvelope(%s, %s, %s, %s, {raster_srid})
                )
                LIMIT 1;
                """
                cursor.execute(raster_query, (minx, miny, maxx, maxy, safe_width, safe_height, minx, miny, maxx, maxy))
                image_format = 'JPEG'
                mimetype = 'image/jpeg'
                print(f"✅ Raster {layer_name}: Utilisation du format JPEG")
            except Exception as jpeg_error:
                error_msg = str(jpeg_error)
                print(f"⚠️ Raster {layer_name}: JPEG échoué, essai PNG. Erreur: {error_msg}")
                try:
                    # Essayer PNG si JPEG échoue
                    raster_query = f"""
                    SELECT ST_AsGDALRaster(
                        ST_Reclass(
                            ST_Resize(
                                ST_Union(
                                    ST_Clip({raster_column}, ST_MakeEnvelope(%s, %s, %s, %s, {raster_srid}))
                                ),
                                %s, %s
                            ),
                            1,
                            '-1000000-1000000:0-255',
                            '8BUI',
                            0
                        ),
                        'PNG'
                    ) as image_data
                    FROM "{layer_name}"
                    WHERE ST_Intersects(
                        ST_Envelope({raster_column}),
                        ST_MakeEnvelope(%s, %s, %s, %s, {raster_srid})
                    )
                    LIMIT 1;
                    """
                    cursor.execute(raster_query, (minx, miny, maxx, maxy, safe_width, safe_height, minx, miny, maxx, maxy))
                    image_format = 'PNG'
                    mimetype = 'image/png'
                    print(f"✅ Raster {layer_name}: Utilisation du format PNG")
                except Exception as png_error:
                    error_msg = str(png_error)
                    print(f"❌ Raster {layer_name}: PNG aussi échoué. Erreur: {error_msg}")
                    return jsonify({
                        'error': 'Impossible de générer l\'image raster',
                        'details': 'Les pilotes JPEG et PNG ne sont pas disponibles dans GDAL. Vérifiez les pilotes disponibles avec: SELECT * FROM ST_GDALDrivers();',
                        'jpeg_error': str(jpeg_error),
                        'png_error': error_msg
                    }), 500
        else:
            # Récupérer toute l'étendue du raster
            print(f"🖼️ Raster {layer_name}: pas de bbox, utilisation de toute l'étendue")
            # Limiter la taille pour éviter les problèmes de décodage (max 2048x2048)
            safe_width = min(width, 2048)
            safe_height = min(height, 2048)
            
            # Essayer JPEG d'abord, puis PNG
            try:
                raster_query = f"""
                SELECT ST_AsGDALRaster(
                    ST_Reclass(
                        ST_Resize(
                            ST_Union({raster_column}),
                            %s, %s
                        ),
                        1,
                        '-1000000-1000000:0-255',
                        '8BUI',
                        0
                    ),
                    'JPEG',
                    ARRAY['QUALITY=85']
                ) as image_data
                FROM "{layer_name}"
                LIMIT 1;
                """
                cursor.execute(raster_query, (safe_width, safe_height))
                image_format = 'JPEG'
                mimetype = 'image/jpeg'
            except Exception as jpeg_error:
                try:
                    raster_query = f"""
                    SELECT ST_AsGDALRaster(
                        ST_Reclass(
                            ST_Resize(
                                ST_Union({raster_column}),
                                %s, %s
                            ),
                            1,
                            '-1000000-1000000:0-255',
                            '8BUI',
                            0
                        ),
                        'PNG'
                    ) as image_data
                    FROM "{layer_name}"
                    LIMIT 1;
                    """
                    cursor.execute(raster_query, (safe_width, safe_height))
                    image_format = 'PNG'
                    mimetype = 'image/png'
                except Exception as png_error:
                    print(f"❌ Raster {layer_name}: JPEG et PNG ont échoué")
                    return jsonify({
                        'error': 'Impossible de générer l\'image raster',
                        'details': 'Les pilotes JPEG et PNG ne sont pas disponibles. Vérifiez les pilotes avec: SELECT * FROM ST_GDALDrivers();'
                    }), 500
        
        result = cursor.fetchone()
        
        if not result or not result[0]:
            print(f"❌ Raster {layer_name}: Aucune donnée retournée")
            return jsonify({'error': 'Impossible de générer l\'image raster'}), 500
        
        image_data = result[0]
        
        if not image_data:
            print(f"❌ Raster {layer_name}: Données image vides")
            return jsonify({'error': 'Impossible de générer l\'image raster (données vides)'}), 500
        
        # Convertir les données en bytes si nécessaire
        # PostgreSQL retourne parfois les données comme memoryview ou bytes
        if isinstance(image_data, memoryview):
            image_data = image_data.tobytes()
        elif isinstance(image_data, str):
            # Si c'est une chaîne, essayer de la décoder
            try:
                image_data = image_data.encode('latin-1')
            except:
                image_data = bytes(image_data, 'latin-1')
        elif not isinstance(image_data, bytes):
            # Essayer de convertir en bytes
            try:
                image_data = bytes(image_data)
            except:
                print(f"❌ Raster {layer_name}: Impossible de convertir les données en bytes")
                return jsonify({'error': 'Format de données invalide'}), 500
        
        # Vérifier le header selon le format
        if image_format == 'JPEG':
            if len(image_data) < 3 or image_data[0:3] != b'\xff\xd8\xff':
                print(f"⚠️ Raster {layer_name}: Les données ne semblent pas être un JPEG valide (header: {image_data[0:3].hex() if len(image_data) >= 3 else 'trop court'})")
        elif image_format == 'PNG':
            if len(image_data) < 8 or image_data[0:8] != b'\x89PNG\r\n\x1a\n':
                print(f"⚠️ Raster {layer_name}: Les données ne semblent pas être un PNG valide (header: {image_data[0:8] if len(image_data) >= 8 else 'trop court'})")
        
        print(f"✅ Raster {layer_name}: Image {image_format} générée ({len(image_data)} bytes)")
        
        # Retourner l'image avec les bons en-têtes
        response = Response(image_data, mimetype=mimetype)
        response.headers['Content-Type'] = mimetype
        response.headers['Content-Length'] = str(len(image_data))
        response.headers['Cache-Control'] = 'no-cache'
        return response
        
    except Exception as e:
        print(f"❌ Erreur dans get_layer_raster: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/layers/<layer_name>/raster/bounds', methods=['GET'])
def get_raster_bounds(layer_name):
    """Récupère les limites (bounding box) d'une couche raster"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Impossible de se connecter à la base de données'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Vérifier que la table existe
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
            return jsonify({'error': f'Table "{layer_name}" n\'existe pas'}), 404
        
        # Trouver la colonne raster
        find_raster_query = f"""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = '{layer_name}' 
        AND (data_type LIKE '%raster%' OR udt_name = 'raster')
        LIMIT 1;
        """
        cursor.execute(find_raster_query)
        raster_result = cursor.fetchone()
        
        if not raster_result:
            print(f"❌ Raster bounds {layer_name}: Aucune colonne raster trouvée")
            return jsonify({'error': f'Aucune colonne raster trouvée pour "{layer_name}"'}), 404
        
        raster_column = raster_result[0]
        print(f"✅ Raster bounds {layer_name}: Colonne raster trouvée: {raster_column}")
        
        # Détecter le SRID du raster
        srid_query = f"""
        SELECT ST_SRID({raster_column}) as srid
        FROM "{layer_name}"
        LIMIT 1;
        """
        cursor.execute(srid_query)
        srid_result = cursor.fetchone()
        raster_srid = srid_result[0] if srid_result else 4326
        print(f"🗺️ Raster bounds {layer_name}: SRID détecté: {raster_srid}")
        
        # Récupérer les limites du raster dans son SRID natif
        bounds_query = f"""
        SELECT 
            ST_XMin(ST_Envelope(ST_Union({raster_column}))) as minx,
            ST_YMin(ST_Envelope(ST_Union({raster_column}))) as miny,
            ST_XMax(ST_Envelope(ST_Union({raster_column}))) as maxx,
            ST_YMax(ST_Envelope(ST_Union({raster_column}))) as maxy
        FROM "{layer_name}";
        """
        
        print(f"📐 Raster bounds {layer_name}: Exécution de la requête...")
        cursor.execute(bounds_query)
        bounds = cursor.fetchone()
        
        if bounds and all(bounds):
            minx, miny, maxx, maxy = bounds[0], bounds[1], bounds[2], bounds[3]
            print(f"✅ Raster bounds {layer_name} (SRID {raster_srid}): {minx}, {miny}, {maxx}, {maxy}")
            
            # Si le SRID n'est pas 4326, convertir vers WGS84 pour le frontend
            if raster_srid != 4326:
                transform_query = f"""
                SELECT 
                    ST_XMin(ST_Transform(ST_MakeEnvelope(%s, %s, %s, %s, {raster_srid}), 4326)) as minx,
                    ST_YMin(ST_Transform(ST_MakeEnvelope(%s, %s, %s, %s, {raster_srid}), 4326)) as miny,
                    ST_XMax(ST_Transform(ST_MakeEnvelope(%s, %s, %s, %s, {raster_srid}), 4326)) as maxx,
                    ST_YMax(ST_Transform(ST_MakeEnvelope(%s, %s, %s, %s, {raster_srid}), 4326)) as maxy
                """
                cursor.execute(transform_query, (minx, miny, maxx, maxy, minx, miny, maxx, maxy, 
                                                minx, miny, maxx, maxy, minx, miny, maxx, maxy))
                bounds_wgs84 = cursor.fetchone()
                minx, miny, maxx, maxy = bounds_wgs84[0], bounds_wgs84[1], bounds_wgs84[2], bounds_wgs84[3]
                print(f"🔄 Raster bounds {layer_name}: Converti vers WGS84: {minx}, {miny}, {maxx}, {maxy}")
            
            return jsonify({
                'minx': minx,
                'miny': miny,
                'maxx': maxx,
                'maxy': maxy
            })
        else:
            print(f"❌ Raster bounds {layer_name}: Impossible de calculer les limites")
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
