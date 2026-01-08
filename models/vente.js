const mongoose = require('mongoose');

/**
 * Schema Vente
 * 
 * 🎯 LOGIQUE DES RÔLES:
 * ─────────────────────────────────────────────────────────────
 * 
 * - ADMIN = [ADMIN, VENDEUR] → Peut vendre via n'importe quel guichet
 * - SUPERVISEUR = [SUPERVISEUR, VENDEUR] → Peut vendre via n'importe quel guichet
 * - VENDEUR = [VENDEUR] → Vend normalement via son guichet assigné
 * 
 * Quand une vente est créée:
 * 1. utilisateurId = L'ID de l'utilisateur connecté (via JWT) - LA VRAIE PERSONNE QUI A VENDU
 * 2. guichetId = Le guichet où la vente s'est passée (sélectionné en frontend)
 * 3. guichet.vendeurPrincipal = Le vendeur normalement assigné au guichet (pour audit)
 * 
 * ⚠️ Cas Exception:
 * Si utilisateurId.role = "SUPERVISEUR" ou "ADMIN" et utilisateurId.id ≠ guichet.vendeurPrincipal.id
 * → Un SUPERVISEUR/ADMIN a vendu via le guichet d'un autre vendeur (temporaire ou couverture)
 * 
 * 🔍 Traçabilité:
 * - utilisateurId → Qui a vraiment créé la vente (responsabilité)
 * - guichetId.vendeurPrincipal → Qui gère le guichet (assignation)
 * - guichetId → Quel point de caisse (localisation)
 * 
 * ─────────────────────────────────────────────────────────────
 * Une vente = 1 document avec panier complet + N mouvements de stock SORTIE liés
 */
const venteSchema = new mongoose.Schema({
    // Infos vente
    dateVente: {
        type: Date,
        default: Date.now,
        index: true
    },
    
    // Références
    magasinId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Magasin',
        required: true,
        index: true,
        description: '✅ Magasin où la vente s\'est passée'
    },
    
    utilisateurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true,
        description: '👤 L\'utilisateur qui a VRAIMENT créé la vente (JWT user)\n  - Peut être ADMIN, SUPERVISEUR ou VENDEUR\n  - C\'est la responsabilité de cette personne'
    },
    
    // Guichet du magasin - 🪟 Logique des guichets
    guichetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guichet',
        default: null,
        description: '🪟 Guichet (point de caisse) où la vente s\'est passée\n  - Chaque guichet a un vendeurPrincipal assigné\n  - utilisateurId peut être différent de vendeurPrincipal si superviseur/admin vend\n  - Utilisé pour la traçabilité du point de vente'
    },
    
    // Client
    client: {
        type: String,
        default: null // Optionnel
    },
    
    // Articles du panier
    articles: [{
        produitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Produit',
            required: true
        },
        rayonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Rayon'
        },
        nomProduit: String,
        quantite: {
            type: Number,
            required: true,
            min: 1
        },
        prixUnitaire: {
            type: Number,
            required: true
        },
        montantUSD: {
            type: Number,
            required: true
        },
        mouvementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StockMovement'
        },
        observations: String
    }],
    
    // Totaux
    montantTotalUSD: {
        type: Number,
        required: true,
        default: 0
    },
    
    // Conversion FC (optionnel)
    tauxFC: {
        type: Number,
        default: null
    },
    
    montantTotalFC: {
        type: Number,
        default: null
    },
    
    // Paiement
    modePaiement: {
        type: String,
        enum: ['CASH', 'CARD', 'CREDIT', 'CHEQUE'],
        default: 'CASH'
    },
    
    // Statut
    statut: {
        type: String,
        enum: ['VALIDÉE', 'ANNULÉE', 'REMBOURSÉE'],
        default: 'VALIDÉE',
        index: true
    },
    
    // Observations
    observations: String,
    
    // Audit
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    },
    
    annuleeLe: {
        type: Date,
        default: null
    },
    
    motifAnnulation: String
    
}, {
    timestamps: true,
    collection: 'ventes'
});

/**
 * Indexes
 */
venteSchema.index({ dateVente: -1, magasinId: 1 });
venteSchema.index({ utilisateurId: 1, dateVente: -1 });
venteSchema.index({ client: 1 });
venteSchema.index({ statut: 1, dateVente: -1 });

/**
 * Pré-hooks
 */
venteSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

/**
 * Méthodes statiques
 */

/**
 * Créer une vente avec articles
 */
venteSchema.statics.createVente = async function(data) {
    const vente = new this(data);
    return await vente.save();
};

/**
 * Obtenir les ventes du jour par magasin
 */
venteSchema.statics.ventesJourParMagasin = async function(magasinId, statut = 'VALIDÉE') {
    const debut = new Date();
    debut.setHours(0, 0, 0, 0);
    
    const fin = new Date();
    fin.setHours(23, 59, 59, 999);
    
    return await this.find({
        magasinId,
        statut,
        dateVente: { $gte: debut, $lte: fin }
    })
    .populate('utilisateurId', 'nom prenom email')
    .populate('articles.produitId', 'nomProduit')
    .sort({ dateVente: -1 });
};

/**
 * Stats du jour
 */
venteSchema.statics.statsJour = async function(magasinId) {
    const debut = new Date();
    debut.setHours(0, 0, 0, 0);
    
    const fin = new Date();
    fin.setHours(23, 59, 59, 999);
    
    const stats = await this.aggregate([
        {
            $match: {
                magasinId: mongoose.Types.ObjectId(magasinId),
                dateVente: { $gte: debut, $lte: fin },
                statut: 'VALIDÉE'
            }
        },
        {
            $group: {
                _id: null,
                totalVentes: { $sum: 1 },
                montantTotalUSD: { $sum: '$montantTotalUSD' },
                montantTotalFC: { $sum: '$montantTotalFC' },
                quantiteTotale: { $sum: { $sum: '$articles.quantite' } },
                montantMoyen: { $avg: '$montantTotalUSD' }
            }
        }
    ]);
    
    return stats.length > 0 ? stats[0] : {
        totalVentes: 0,
        montantTotalUSD: 0,
        montantTotalFC: 0,
        quantiteTotale: 0,
        montantMoyen: 0
    };
};

/**
 * Annuler une vente
 */
venteSchema.methods.annuler = async function(motif = 'Annulation manuelle') {
    this.statut = 'ANNULÉE';
    this.annuleeLe = new Date();
    this.motifAnnulation = motif;
    return await this.save();
};

/**
 * Formater pour affichage
 */
venteSchema.methods.format = function() {
    return {
        _id: this._id,
        dateVente: this.dateVente,
        magasinId: this.magasinId,
        utilisateur: this.utilisateurId?.nom,
        client: this.client,
        articles: this.articles.length,
        montantUSD: this.montantTotalUSD.toFixed(2),
        montantFC: this.montantTotalFC ? this.montantTotalFC.toFixed(0) : '-',
        modePaiement: this.modePaiement,
        statut: this.statut
    };
};

module.exports = mongoose.model('Vente', venteSchema);
