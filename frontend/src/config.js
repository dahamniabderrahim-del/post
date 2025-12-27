// Configuration de l'API
// En développement, utilise localhost:5000
// En production, utilise la variable d'environnement VITE_API_URL
// Si VITE_API_URL n'est pas définie, essaie de détecter automatiquement l'URL du backend
const getApiUrl = () => {
  // Si VITE_API_URL est définie, l'utiliser
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // En développement (localhost), utiliser localhost:5000
  if (import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000'
  }
  
  // En production, construire l'URL du backend à partir de l'URL actuelle
  // Si le frontend est sur sig-frontend.onrender.com, le backend devrait être sur sig-backend.onrender.com
  const hostname = window.location.hostname
  if (hostname.includes('render.com')) {
    // URL du backend spécifique : post-aypc.onrender.com
    if (hostname.includes('sig-frontend') || hostname.includes('frontend')) {
      // Si le frontend est sur sig-frontend.onrender.com, utiliser post-aypc.onrender.com
      return 'https://post-aypc.onrender.com'
    }
    // Essayer de remplacer 'frontend' par 'backend' dans l'URL
    if (hostname.includes('frontend')) {
      const backendUrl = hostname.replace('frontend', 'backend')
      return `https://${backendUrl}`
    }
    // Si le nom ne contient pas 'frontend', essayer d'ajouter '-backend' avant '.onrender.com'
    // Par exemple: sig.onrender.com -> sig-backend.onrender.com
    if (hostname.endsWith('.onrender.com')) {
      const baseName = hostname.replace('.onrender.com', '')
      // Si le nom se termine par '-frontend', le remplacer par '-backend'
      if (baseName.endsWith('-frontend')) {
        const backendName = baseName.replace('-frontend', '-backend')
        return `https://${backendName}.onrender.com`
      }
      // Sinon, utiliser post-aypc.onrender.com par défaut pour les services Render
      return 'https://post-aypc.onrender.com'
    }
  }
  
  // Fallback: utiliser le même hostname avec le port 5000
  return `${window.location.protocol}//${window.location.hostname}:5000`
}

export const API_URL = getApiUrl()

