// ================================
// ⚙️ CONFIGURATION API GLOBALE
// ================================
// Fichier à inclure dans TOUS les pages HTML avant les autres scripts

const API_CONFIG = {
  // URL de base de l'API hébergée
  BASE_URL: 'https://backend-gestion-de-stock.onrender.com',
  
  // Endpoints principaux
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    
    // Protected
    MAGASINS: '/api/protected/magasins',
    GUICHETS: '/api/protected/guichets',
    RAYONS: '/api/protected/magasins/:magasinId/rayons',
    TYPES_PRODUITS: '/api/protected/magasins/:magasinId/types-produits',
    STOCK_CONFIG: '/api/protected/magasins/:magasinId/stock-config',
    
    // Produits
    PRODUITS: '/api/protected/magasins/:magasinId/produits',
    PRODUIT: '/api/protected/produits/:produitId',
    PRODUIT_MOUVEMENTS: '/api/protected/produits/:produitId/mouvements',
    
    // Lots (FIFO/LIFO)
    LOTS: '/api/protected/magasins/:magasinId/lots',
    
    // Alertes
    ALERTES: '/api/protected/magasins/:magasinId/alertes',
    ALERTE: '/api/protected/alertes/:alerteId',
    
    // Rapports inventaire
    INVENTAIRES: '/api/protected/magasins/:magasinId/inventaires',
    INVENTAIRE: '/api/protected/inventaires/:rapportId',
    INVENTAIRE_LIGNES: '/api/protected/inventaires/:rapportId/lignes',
    INVENTAIRE_VALIDER: '/api/protected/inventaires/:rapportId/valider',
    
    // Mouvements de stock
    STOCK_MOVEMENTS: '/api/protected/magasins/:magasinId/stock-movements',
    
    // Activités
    ACTIVITIES: '/api/protected/activites',
    
    // Stats
    STATS: '/api/protected/stats/magasins-guichets'
  },

  /**
   * Construire une URL complète avec les paramètres
   * @param {string} endpoint - Clé de l'endpoint ou URL complète
   * @param {object} params - Paramètres à remplacer dans l'URL
   * @returns {string} URL complète
   */
  buildUrl(endpoint, params = {}) {
    let url = this.ENDPOINTS[endpoint] || endpoint;
    
    // Remplacer les paramètres :id par les valeurs
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
    
    return this.BASE_URL + url;
  },

  /**
   * Récupérer les headers d'authentification
   * @returns {object} Headers avec Authorization Bearer Token
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  },

  /**
   * Faire une requête fetch avec gestion d'erreurs
   * @param {string} endpoint - Clé endpoint ou URL
   * @param {object} options - Options fetch (method, body, etc.)
   * @param {object} params - Paramètres pour buildUrl
   * @returns {Promise} Réponse JSON
   */
  async fetch(endpoint, options = {}, params = {}) {
    const url = this.buildUrl(endpoint, params);
    
    const fetchOptions = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    };

    if (options.body && typeof options.body === 'object') {
      fetchOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expiré
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          window.location.href = '/login.php';
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      // Si c'est une suppression (204 No Content), retourner null
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ Erreur API (${endpoint}):`, error);
      throw error;
    }
  },

  /**
   * Appels GET
   */
  async get(endpoint, params = {}) {
    return this.fetch(endpoint, { method: 'GET' }, params);
  },

  /**
   * Appels POST
   */
  async post(endpoint, body = {}, params = {}) {
    return this.fetch(endpoint, { method: 'POST', body }, params);
  },

  /**
   * Appels PUT
   */
  async put(endpoint, body = {}, params = {}) {
    return this.fetch(endpoint, { method: 'PUT', body }, params);
  },

  /**
   * Appels DELETE
   */
  async delete(endpoint, params = {}) {
    return this.fetch(endpoint, { method: 'DELETE' }, params);
  }
};

// Alias pour compatibilité avec les anciens scripts
window.API_BASE = API_CONFIG.BASE_URL;
