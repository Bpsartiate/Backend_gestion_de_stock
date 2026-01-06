/**
 * Service d'Audit Log
 * Centralise la création des logs d'audit pour toutes les actions
 */

const AuditLog = require('../models/auditLog');

class AuditService {
  /**
   * Créer un log d'audit
   * @param {Object} options
   * @param {string} options.action - Action effectuée (ex: DELETE_PRODUIT)
   * @param {Object} options.utilisateur - Utilisateur qui a fait l'action {id, nom, email}
   * @param {Object} options.magasin - Magasin concerné (optionnel) {id, nom}
   * @param {string} options.entityType - Type d'entité (Produit, Reception, etc.)
   * @param {string} options.entityId - ID de l'entité
   * @param {string} options.entityName - Nom de l'entité (ex: "Viande")
   * @param {string} options.description - Description lisible
   * @param {string} options.raison - Raison (optionnel, pour suppression)
   * @param {Object} options.changes - Changements {before, after}
   * @param {string} options.ipAddress - Adresse IP (optionnel)
   * @param {string} options.userAgent - User agent (optionnel)
   * @param {string} options.statut - SUCCESS ou FAILED
   * @param {string} options.erreur - Message d'erreur si FAILED
   */
  static async log(options) {
    try {
      const auditLog = new AuditLog({
        action: options.action,
        utilisateurId: options.utilisateur?.id,
        utilisateurNom: options.utilisateur?.nom,
        utilisateurEmail: options.utilisateur?.email,
        magasinId: options.magasin?.id,
        magasinNom: options.magasin?.nom,
        entityType: options.entityType,
        entityId: options.entityId,
        entityName: options.entityName,
        description: options.description,
        raison: options.raison,
        changes: options.changes,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        statut: options.statut || 'SUCCESS',
        erreur: options.erreur
      });

      await auditLog.save();
      console.log(`✅ AuditLog créé: ${options.action} - ${options.entityName}`);
      return auditLog;
    } catch (err) {
      console.error('❌ Erreur création AuditLog:', err);
      // Ne pas lever l'erreur - l'audit log ne doit pas bloquer l'action
      return null;
    }
  }

  /**
   * Récupérer l'historique d'audit
   */
  static async getHistory(filters = {}, limit = 50, skip = 0) {
    try {
      const query = {};
      
      if (filters.utilisateurId) query.utilisateurId = filters.utilisateurId;
      if (filters.magasinId) query.magasinId = filters.magasinId;
      if (filters.entityType) query.entityType = filters.entityType;
      if (filters.entityId) query.entityId = filters.entityId;
      if (filters.action) query.action = filters.action;
      
      if (filters.dateDebut || filters.dateFin) {
        query.createdAt = {};
        if (filters.dateDebut) query.createdAt.$gte = new Date(filters.dateDebut);
        if (filters.dateFin) query.createdAt.$lte = new Date(filters.dateFin);
      }

      const logs = await AuditLog.find(query)
        .populate('utilisateurId', 'nom email')
        .populate('magasinId', 'nom')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await AuditLog.countDocuments(query);

      return {
        logs,
        total,
        count: logs.length,
        page: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(total / limit)
      };
    } catch (err) {
      console.error('❌ Erreur récupération AuditLog:', err);
      throw err;
    }
  }

  /**
   * Supprimer les logs d'audit anciens (optionnel - TTL index le fait automatiquement)
   */
  static async cleanOldLogs(daysOld = 90) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - daysOld);
      
      const result = await AuditLog.deleteMany({ createdAt: { $lt: date } });
      console.log(`✅ ${result.deletedCount} anciens AuditLogs supprimés`);
      return result;
    } catch (err) {
      console.error('❌ Erreur suppression AuditLogs:', err);
      throw err;
    }
  }
}

module.exports = AuditService;
