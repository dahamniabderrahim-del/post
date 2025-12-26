"""
Script de test pour vérifier que l'API Flask fonctionne correctement
"""
import requests
import json

BASE_URL = "http://localhost:5000"

def test_health():
    """Test l'endpoint health"""
    print("🔍 Test de l'endpoint /api/health...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return False

def test_layers():
    """Test l'endpoint layers"""
    print("\n🔍 Test de l'endpoint /api/layers...")
    try:
        response = requests.get(f"{BASE_URL}/api/layers")
        print(f"   Status: {response.status_code}")
        data = response.json()
        print(f"   Nombre de couches: {len(data) if isinstance(data, list) else 'N/A'}")
        if isinstance(data, list) and len(data) > 0:
            print(f"   Couches trouvées:")
            for layer in data:
                print(f"     - {layer.get('name', 'N/A')}")
        return response.status_code == 200 and isinstance(data, list)
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return False

def test_layer_geojson(layer_name):
    """Test l'endpoint geojson pour une couche"""
    print(f"\n🔍 Test de l'endpoint /api/layers/{layer_name}/geojson...")
    try:
        response = requests.get(f"{BASE_URL}/api/layers/{layer_name}/geojson")
        print(f"   Status: {response.status_code}")
        data = response.json()
        
        if 'error' in data:
            print(f"   ❌ Erreur: {data['error']}")
            return False
        
        if 'features' in data:
            feature_count = len(data['features'])
            print(f"   ✅ {feature_count} features trouvées")
            if feature_count > 0:
                first_feature = data['features'][0]
                geom_type = first_feature.get('geometry', {}).get('type', 'N/A')
                print(f"   Type de géométrie: {geom_type}")
                print(f"   Exemple de coordonnées: {str(first_feature.get('geometry', {}).get('coordinates', 'N/A'))[:100]}")
            return True
        else:
            print(f"   ⚠ Pas de features dans la réponse")
            return False
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("TEST DE L'API FLASK")
    print("=" * 60)
    
    # Test health
    if not test_health():
        print("\n❌ Le serveur Flask ne répond pas correctement!")
        exit(1)
    
    # Test layers
    if not test_layers():
        print("\n❌ Impossible de récupérer la liste des couches!")
        exit(1)
    
    # Récupérer la liste des couches
    try:
        response = requests.get(f"{BASE_URL}/api/layers")
        layers = response.json()
        
        if isinstance(layers, list) and len(layers) > 0:
            # Tester la première couche
            first_layer = layers[0]['name']
            print(f"\n📋 Test de la couche: {first_layer}")
            test_layer_geojson(first_layer)
        else:
            print("\n⚠ Aucune couche trouvée dans la base de données")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
    
    print("\n" + "=" * 60)
    print("TESTS TERMINÉS")
    print("=" * 60)

