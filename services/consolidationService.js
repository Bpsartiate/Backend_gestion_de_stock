const StockRayon = require('../models/stockRayon');
const TypeProduit = require('../models/typeProduit');
const Rayon = require('../models/rayon');

/**
 * PHASE 1 v2 - Service de gestion intelligente des emplacements
 * 
 * Logique:
 * - Type SIMPLE: Cherche emplacement compatible, consolide si possible
 * - Type LOT: Crée TOUJOURS nouvel emplacement (jamais consolider)
 */

/**
 * Fonction principale: Cherche ou crée un StockRayon
 * 
 * @param {Object} params
 * @param {ObjectId} params.produitId - ID du produit
 * @param {ObjectId} params.rayonId - ID du rayon de destination
 * @param {Number} params.quantiteAjouter - Quantité à ajouter
 * @param {ObjectId} params.typeProduitId - ID du type produit
 * @param {ObjectId} params.receptionId - ID de la réception
 * @param {ObjectId} params.magasinId - ID du magasin
 * 
 * @returns {Promise<Object>} { sr: StockRayon, isNew: boolean, actionType: "CREATE"|"CONSOLIDATE" }
 */
async function findOrCreateStockRayon(params) {
  const {
    produitId,
    rayonId,
    quantiteAjouter,
    typeProduitId,
    receptionId,
    magasinId
  } = params;

  try {
    // 1. RÉCUPÉRER LE TYPE PRODUIT
    const typeProduit = await TypeProduit.findById(typeProduitId);
    if (!typeProduit) {
      throw new Error(`TypeProduit ${typeProduitId} non trouvé`);
    }

    // 2. VALIDATION DE BASE
    const validation = await validateStockRayonCreation({
      rayonId,
      typeProduitId,
      quantite: quantiteAjouter
    });

    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // 3. LOGIQUE TYPE-AWARE

    // ❌ TYPE LOT: TOUJOURS créer nouvel emplacement
    if (typeProduit.typeStockage === 'lot') {
      return await createNewStockRayon({
        produitId,
        rayonId,
        quantiteAjouter,
        typeProduitId,
        receptionId,
        magasinId,
        typeStockage: 'lot'
      });
    }

    // ✅ TYPE SIMPLE: Chercher compatible, consolider si possible
    if (typeProduit.typeStockage === 'simple') {
      const existingRayon = await findCompatibleStockRayon({
        produitId,
        rayonId,
        quantiteAjouter,
        typeProduitId
      });

      if (existingRayon) {
        // Consolider dans emplacement existant
        return await consolidateIntoExisting({
          existingRayon,
          quantiteAjouter,
          receptionId
        });
      }

      // Aucun compatible trouvé: créer nouveau
      return await createNewStockRayon({
        produitId,
        rayonId,
        quantiteAjouter,
        typeProduitId,
        receptionId,
        magasinId,
        typeStockage: 'simple'
      });
    }

    throw new Error(`Type de stockage inconnu: ${typeProduit.typeStockage}`);

  } catch (error) {
    console.error('❌ Erreur consolidationService.findOrCreateStockRayon:', error.message);
    throw error;
  }
}

/**
 * Cherche un emplacement compatible pour consolidation (Type SIMPLE)
 * 
 * @param {Object} params
 * @returns {Promise<Object|null>} StockRayon compatible ou null
 */
async function findCompatibleStockRayon(params) {
  const { produitId, rayonId, quantiteAjouter, typeProduitId } = params;

  try {
    // Récupérer la capacité max du type
    const typeProduit = await TypeProduit.findById(typeProduitId);
    const capaciteMax = typeProduit.capaciteMax || 1000; // Default 1000

    // Chercher emplacements existants:
    // - Même produit
    // - Même rayon
    // - Non fermé
    // - Avec espace disponible
    const existingRayons = await StockRayon.find({
      produitId,
      rayonId,
      statut: { $ne: 'FERMÉ' } // Exclure fermés
    }).sort({ quantiteDisponible: -1 }); // Les plus remplis en premier

    for (const rayon of existingRayons) {
      const espaceDisponible = capaciteMax - rayon.quantiteDisponible;

      // Si la réception rentre dans l'espace disponible
      if (quantiteAjouter <= espaceDisponible) {
        return rayon; // Compatible!
      }
    }

    return null; // Aucun compatible

  } catch (error) {
    console.error('❌ Erreur findCompatibleStockRayon:', error.message);
    throw error;
  }
}

/**
 * Consolide quantité dans emplacement existant
 * 
 * @param {Object} params
 * @param {Object} params.existingRayon - L'emplacement existant
 * @param {Number} params.quantiteAjouter - Quantité à ajouter
 * @param {ObjectId} params.receptionId - ID réception
 * 
 * @returns {Promise<Object>} { sr: StockRayon, isNew: false, actionType: "CONSOLIDATE" }
 */
async function consolidateIntoExisting(params) {
  const { existingRayon, quantiteAjouter, receptionId } = params;

  try {
    // Ajouter la réception à l'historique
    existingRayon.réceptions.push({
      receptionId,
      quantite: quantiteAjouter,
      dateReception: new Date()
    });

    // Augmenter la quantité disponible
    existingRayon.quantiteDisponible += quantiteAjouter;

    // Sauvegarder
    await existingRayon.save();

    console.log(`✅ Consolidation: sr ${existingRayon._id} +${quantiteAjouter}kg`);

    return {
      sr: existingRayon,
      isNew: false,
      actionType: 'CONSOLIDATE',
      receptionsFusionnées: existingRayon.réceptions.length
    };

  } catch (error) {
    console.error('❌ Erreur consolidateIntoExisting:', error.message);
    throw error;
  }
}

/**
 * Crée un nouvel emplacement
 * 
 * @param {Object} params
 * @returns {Promise<Object>} { sr: StockRayon, isNew: true, actionType: "CREATE" }
 */
async function createNewStockRayon(params) {
  const {
    produitId,
    rayonId,
    quantiteAjouter,
    typeProduitId,
    receptionId,
    magasinId,
    typeStockage
  } = params;

  try {
    // Créer nouvel enregistrement
    const newStockRayon = new StockRayon({
      produitId,
      rayonId,
      magasinId,
      quantiteDisponible: quantiteAjouter,
      quantiteRéservée: 0,
      quantiteDamaged: 0,
      réceptions: [
        {
          receptionId,
          quantite: quantiteAjouter,
          dateReception: new Date()
        }
      ],
      dateCreation: new Date(),
      statut: 'EN_STOCK'
    });

    // Ajouter champs spécifiques pour LOT
    if (typeStockage === 'lot') {
      newStockRayon.typeStockage = 'lot';
      newStockRayon.numeroLot = generateNumeroLot(produitId);
    } else {
      newStockRayon.typeStockage = 'simple';
    }

    await newStockRayon.save();

    console.log(`✅ Création: sr ${newStockRayon._id} (${typeStockage}) ${quantiteAjouter}kg`);

    return {
      sr: newStockRayon,
      isNew: true,
      actionType: 'CREATE',
      typeStockage
    };

  } catch (error) {
    console.error('❌ Erreur createNewStockRayon:', error.message);
    throw error;
  }
}

/**
 * Valide avant de créer/consolider
 * 
 * @param {Object} params
 * @returns {Promise<Object>} { valid: boolean, message: string }
 */
async function validateStockRayonCreation(params) {
  const { rayonId, typeProduitId, quantite } = params;

  try {
    // 1. Rayon existe?
    const rayon = await Rayon.findById(rayonId);
    if (!rayon) {
      return { valid: false, message: `Rayon ${rayonId} non trouvé` };
    }

    // 2. TypeProduit existe?
    const typeProduit = await TypeProduit.findById(typeProduitId);
    if (!typeProduit) {
      return { valid: false, message: `TypeProduit ${typeProduitId} non trouvé` };
    }

    // 3. Quantité positive?
    if (quantite <= 0) {
      return { valid: false, message: `Quantité doit être > 0, reçu: ${quantite}` };
    }

    // 4. Quantité <= capacité max?
    if (quantite > typeProduit.capaciteMax) {
      return {
        valid: false,
        message: `Quantité ${quantite} > capacité max ${typeProduit.capaciteMax}`
      };
    }

    // 5. Rayon accepte ce type?
    if (rayon.typesAutorisés && !rayon.typesAutorisés.includes(typeProduitId.toString())) {
      return {
        valid: false,
        message: `Type ${typeProduit.nom} non autorisé dans rayon ${rayon.nom}`
      };
    }

    return { valid: true, message: 'OK' };

  } catch (error) {
    console.error('❌ Erreur validateStockRayonCreation:', error.message);
    throw error;
  }
}

/**
 * Met à jour quantité après mouvement (vente, déchet, etc)
 * 
 * @param {ObjectId} stockRayonId - ID du StockRayon
 * @param {Number} quantiteEnlevee - Quantité à enlever
 * @param {String} motif - Motif du mouvement (VENTE, DECHET, etc)
 * 
 * @returns {Promise<Object>} StockRayon mis à jour
 */
async function updateStockQuantityOnMovement(stockRayonId, quantiteEnlevee, motif) {
  try {
    const sr = await StockRayon.findById(stockRayonId);
    if (!sr) {
      throw new Error(`StockRayon ${stockRayonId} non trouvé`);
    }

    // Vérifier stock suffisant
    if (quantiteEnlevee > sr.quantiteDisponible) {
      throw new Error(
        `Stock insuffisant: ${sr.quantiteDisponible} disponible, ${quantiteEnlevee} demandé`
      );
    }

    // Enlever du stock
    sr.quantiteDisponible -= quantiteEnlevee;

    // Mettre à jour statut
    if (sr.quantiteDisponible === 0) {
      sr.statut = sr.typeStockage === 'lot' ? 'FERMÉ' : 'VIDE';
      sr.dateFermeture = new Date();
    } else if (sr.quantiteDisponible < sr.quantiteInitiale || sr.quantiteDisponible < 100) {
      sr.statut = 'PARTIELLEMENT_VENDU';
      if (!sr.dateOuverture) {
        sr.dateOuverture = new Date(); // 1er mouvement
      }
    }

    await sr.save();

    console.log(`✅ Mouvement: sr ${stockRayonId} -${quantiteEnlevee}kg (${motif})`);

    return sr;

  } catch (error) {
    console.error('❌ Erreur updateStockQuantityOnMovement:', error.message);
    throw error;
  }
}

/**
 * Génère numéro LOT unique
 * Format: "LOT_<PRODUIT>_<TIMESTAMP>"
 * 
 * @param {ObjectId} produitId
 * @returns {String} Numéro LOT
 */
function generateNumeroLot(produitId) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LOT_${produitId.toString().substring(0, 6)}_${random}`;
}

/**
 * Récupère statistiques pour un rayon
 * 
 * @param {ObjectId} rayonId
 * @returns {Promise<Object>}
 */
async function getRayonStatistics(rayonId) {
  try {
    const rayons = await StockRayon.find({ rayonId });

    return {
      totalEmplacements: rayons.length,
      totalQuantite: rayons.reduce((sum, r) => sum + r.quantiteDisponible, 0),
      emplacementsActifs: rayons.filter(r => r.statut === 'EN_STOCK').length,
      typesSimple: rayons.filter(r => r.typeStockage === 'simple').length,
      typesLot: rayons.filter(r => r.typeStockage === 'lot').length
    };

  } catch (error) {
    console.error('❌ Erreur getRayonStatistics:', error.message);
    throw error;
  }
}

module.exports = {
  findOrCreateStockRayon,
  findCompatibleStockRayon,
  consolidateIntoExisting,
  createNewStockRayon,
  validateStockRayonCreation,
  updateStockQuantityOnMovement,
  getRayonStatistics
};
