"""
Script de test pour vérifier la connexion à PostgreSQL et les données
"""
import psycopg2

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'pos',
    'user': 'postgres',
    'password': 'Admin123'
}

try:
    print("🔌 Connexion à la base de données...")
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    print("✓ Connexion réussie!\n")
    
    # Vérifier PostGIS
    print("📦 Vérification de PostGIS...")
    cursor.execute("SELECT PostGIS_version();")
    version = cursor.fetchone()
    print(f"✓ PostGIS version: {version[0]}\n")
    
    # Lister les tables avec géométries
    print("🗺️ Recherche des tables avec colonnes géométriques...")
    query = """
    SELECT 
        f.table_name as name,
        (SELECT column_name 
         FROM information_schema.columns 
         WHERE table_schema = 'public'
         AND table_name = f.table_name
         AND (data_type LIKE '%geometry%' OR udt_name = 'geometry')
         LIMIT 1) as geom_column,
        (SELECT COUNT(*) 
         FROM information_schema.columns 
         WHERE table_schema = 'public'
         AND table_name = f.table_name) as total_columns
    FROM information_schema.tables f
    WHERE f.table_schema = 'public'
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
    tables = cursor.fetchall()
    
    if tables:
        print(f"✓ {len(tables)} table(s) trouvée(s):\n")
        for table in tables:
            table_name, geom_col, total_cols = table
            print(f"  📋 {table_name}")
            print(f"     - Colonne géométrique: {geom_col}")
            print(f"     - Nombre de colonnes: {total_cols}")
            
            # Compter les lignes
            cursor.execute(f'SELECT COUNT(*) FROM "{table_name}";')
            count = cursor.fetchone()[0]
            print(f"     - Nombre de lignes: {count}")
            
            # Vérifier le SRID
            cursor.execute(f"""
                SELECT ST_SRID({geom_col}) 
                FROM "{table_name}" 
                WHERE {geom_col} IS NOT NULL 
                LIMIT 1;
            """)
            srid_result = cursor.fetchone()
            if srid_result and srid_result[0]:
                print(f"     - SRID: {srid_result[0]}")
            
            # Vérifier un exemple de géométrie
            cursor.execute(f"""
                SELECT ST_AsText({geom_col}), ST_GeometryType({geom_col})
                FROM "{table_name}" 
                WHERE {geom_col} IS NOT NULL 
                LIMIT 1;
            """)
            geom_example = cursor.fetchone()
            if geom_example:
                print(f"     - Type: {geom_example[1]}")
                print(f"     - Exemple: {geom_example[0][:50]}...")
            print()
    else:
        print("⚠ Aucune table avec colonnes géométriques trouvée!")
        print("\n💡 Vérifiez que:")
        print("   - PostGIS est installé et activé")
        print("   - Vos tables contiennent des colonnes de type geometry")
    
    conn.close()
    print("✅ Test terminé!")
    
except psycopg2.Error as e:
    print(f"❌ Erreur PostgreSQL: {e}")
except Exception as e:
    print(f"❌ Erreur: {e}")

