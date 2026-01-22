<!-- MODAL RÉCEPTION MULTI-RAYON -->
<div class="modal fade" id="modalReceptionDistribution" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg">
      
      <div class="modal-header bg-gradient text-white border-0">
        <div>
          <h5 class="modal-title fw-bold mb-1">
            <i class="fas fa-arrow-down-to-box me-2"></i>Distribution de Réception
          </h5>
          <small class="text-white-50">Distribuer la quantité sur les rayons</small>
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>

      <div class="modal-body p-4">
        
        <!-- INFO RÉCEPTION -->
        <div class="alert alert-info mb-4 border-0">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="mb-2">
                <small class="text-muted d-block">Produit</small>
                <strong id="receptionProduitNom">--</strong>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-2">
                <small class="text-muted d-block">Quantité totale</small>
                <strong><span id="receptionQuantiteTotale">0</span> <span id="receptionUnite">kg</span></strong>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-2">
                <small class="text-muted d-block">Fournisseur</small>
                <strong id="receptionFournisseur">--</strong>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-2">
                <small class="text-muted d-block">Date</small>
                <strong id="receptionDate">--</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- SÉLECTION RAYONS ET QUANTITÉS -->
        <div class="mb-4">
          <h6 class="fw-bold mb-3">
            <i class="fas fa-layer-group me-2"></i>Distribution par rayon
          </h6>

          <div id="distributionsContainer" class="space-y-3">
            <!-- Dynamiquement ajouté -->
          </div>

          <!-- BOUTON AJOUTER RAYON -->
          <button type="button" class="btn btn-sm btn-outline-primary mt-3 w-100"
                  onclick="ajouterRayonDistribution()">
            <i class="fas fa-plus me-1"></i>Ajouter un rayon
          </button>
        </div>

        <!-- RÉSUMÉ DISTRIBUTION -->
        <div class="card bg-light border-0">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span>Distribué:</span>
              <strong><span id="totalDistribue">0</span> / <span id="totalADistribuer">0</span> <span id="totalUnite">kg</span></strong>
            </div>
            <div class="progress" role="progressbar" style="height: 8px;">
              <div id="progressDistribution" class="progress-bar" style="width: 0%;"></div>
            </div>
            <small class="text-muted d-block mt-2" id="messageDistribution"></small>
          </div>
        </div>
      </div>

      <div class="modal-footer border-0 pt-0">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
        <button type="button" class="btn btn-primary fw-bold" onclick="sauvegarderReceptionDistribution()"
                id="btnSauvegarderDistribution" disabled>
          <i class="fas fa-check me-1"></i>Confirmer Distribution
        </button>
      </div>
    </div>
  </div>
</div>

<!-- TEMPLATE ROW DISTRIBUTION -->
<template id="templateDistributionRow">
  <div class="row g-3 align-items-end distribution-row">
    <div class="col-md-6">
      <label class="form-label small fw-bold">Rayon</label>
      <select class="form-select form-select-sm rayon-select" onchange="updateDistributionPreview()">
        <option value="">-- Sélectionner --</option>
      </select>
      <small class="text-muted d-block mt-1">
        <span class="rayon-capacite"></span>
      </small>
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-bold">Quantité</label>
      <input type="number" class="form-control form-control-sm quantite-input" 
             min="0" step="0.01" placeholder="0" onchange="updateDistributionPreview()">
    </div>
    <div class="col-md-2">
      <button type="button" class="btn btn-sm btn-danger w-100" onclick="supprimerDistributionRow(this)">
        <i class="fas fa-trash"></i>
      </button>
    </div>
    <div class="col-12">
      <small class="text-danger d-none erreur-capacite"></small>
    </div>
  </div>
</template>

<style>
.space-y-3 > div {
  margin-bottom: 1rem;
}

.distribution-row {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border-left: 3px solid #0d6efd;
}

.distribution-row:hover {
  background: #e9ecef;
}
</style>

<script>
let currentReception = null;
let rayonsData = [];

/**
 * Ouvrir le modal de distribution
 */
function openReceptionDistributionModal(receptionData) {
  currentReception = receptionData;
  
  // Remplir les infos
  document.getElementById('receptionProduitNom').textContent = receptionData.produit?.designation || '--';
  document.getElementById('receptionQuantiteTotale').textContent = receptionData.quantite;
  document.getElementById('receptionUnite').textContent = receptionData.unite || 'kg';
  document.getElementById('receptionFournisseur').textContent = receptionData.fournisseur || '--';
  document.getElementById('receptionDate').textContent = new Date(receptionData.dateReception).toLocaleDateString('fr-FR');
  
  document.getElementById('totalADistribuer').textContent = receptionData.quantite;
  document.getElementById('totalUnite').textContent = receptionData.unite || 'kg';
  
  // Charger les rayons
  loadRayonsForDistribution(receptionData.magasinId);
  
  // Réinitialiser le formulaire
  document.getElementById('distributionsContainer').innerHTML = '';
  ajouterRayonDistribution();
  
  // Afficher le modal
  const modal = new bootstrap.Modal(document.getElementById('modalReceptionDistribution'));
  modal.show();
}

/**
 * Charger les rayons disponibles
 */
async function loadRayonsForDistribution(magasinId) {
  try {
    const response = await fetch(`/api/protected/rayons?magasinId=${magasinId}`);
    const data = await response.json();
    rayonsData = data.rayons || [];
    
    // Mettre à jour les select
    document.querySelectorAll('.rayon-select').forEach(select => {
      const currentValue = select.value;
      select.innerHTML = '<option value="">-- Sélectionner --</option>';
      rayonsData.forEach(rayon => {
        select.innerHTML += `<option value="${rayon._id}" data-capacite="${rayon.capaciteMax}" data-actuelle="${rayon.quantiteActuelle}">${rayon.nomRayon} (${rayon.quantiteActuelle}/${rayon.capaciteMax})</option>`;
      });
      select.value = currentValue;
    });
  } catch (err) {
    console.error('❌ Erreur chargement rayons:', err);
  }
}

/**
 * Ajouter une ligne de distribution
 */
function ajouterRayonDistribution() {
  const container = document.getElementById('distributionsContainer');
  const template = document.getElementById('templateDistributionRow');
  const row = template.content.cloneNode(true);
  
  // Remplir le select des rayons
  const select = row.querySelector('.rayon-select');
  select.innerHTML = '<option value="">-- Sélectionner --</option>';
  rayonsData.forEach(rayon => {
    select.innerHTML += `<option value="${rayon._id}" data-capacite="${rayon.capaciteMax}" data-actuelle="${rayon.quantiteActuelle}">${rayon.nomRayon}</option>`;
  });
  
  container.appendChild(row);
  updateDistributionPreview();
}

/**
 * Supprimer une ligne de distribution
 */
function supprimerDistributionRow(btn) {
  btn.closest('.distribution-row').remove();
  updateDistributionPreview();
}

/**
 * Mettre à jour l'aperçu de distribution
 */
function updateDistributionPreview() {
  const rows = document.querySelectorAll('.distribution-row');
  let totalDistribue = 0;
  
  rows.forEach(row => {
    const select = row.querySelector('.rayon-select');
    const input = row.querySelector('.quantite-input');
    const capaciteMsg = row.querySelector('.rayon-capacite');
    const erreurMsg = row.querySelector('.erreur-capacite');
    
    const quantite = parseFloat(input.value) || 0;
    totalDistribue += quantite;
    
    if (select.value) {
      const option = select.options[select.selectedIndex];
      const capaciteMax = parseInt(option.dataset.capacite || 0);
      const quantiteActuelle = parseInt(option.dataset.actuelle || 0);
      const libre = capaciteMax - quantiteActuelle;
      
      capaciteMsg.textContent = `Libre: ${libre} / ${capaciteMax}`;
      
      // Vérifier la capacité
      if (quantite > libre) {
        erreurMsg.textContent = `⚠️ Dépasse la capacité de ${quantite - libre}`;
        erreurMsg.classList.remove('d-none');
      } else {
        erreurMsg.classList.add('d-none');
      }
    }
  });
  
  const totalADistribuer = parseFloat(document.getElementById('totalADistribuer').textContent) || 0;
  const pourcentage = Math.min(100, (totalDistribue / totalADistribuer) * 100);
  
  document.getElementById('totalDistribue').textContent = totalDistribue.toFixed(2);
  document.getElementById('progressDistribution').style.width = pourcentage + '%';
  
  if (totalDistribue === totalADistribuer && totalDistribue > 0) {
    document.getElementById('messageDistribution').textContent = '✅ Distribution complète';
    document.getElementById('btnSauvegarderDistribution').disabled = false;
  } else if (totalDistribue > totalADistribuer) {
    document.getElementById('messageDistribution').textContent = `❌ Dépasse de ${(totalDistribue - totalADistribuer).toFixed(2)}`;
    document.getElementById('btnSauvegarderDistribution').disabled = true;
  } else {
    document.getElementById('messageDistribution').textContent = `📦 Reste ${(totalADistribuer - totalDistribue).toFixed(2)} à distribuer`;
    document.getElementById('btnSauvegarderDistribution').disabled = true;
  }
}

/**
 * Sauvegarder la distribution
 */
async function sauvegarderReceptionDistribution() {
  const rows = document.querySelectorAll('.distribution-row');
  const distributions = [];
  
  rows.forEach(row => {
    const rayonId = row.querySelector('.rayon-select').value;
    const quantite = parseFloat(row.querySelector('.quantite-input').value) || 0;
    
    if (rayonId && quantite > 0) {
      distributions.push({ rayonId, quantite });
    }
  });
  
  if (distributions.length === 0) {
    alert('❌ Aucune distribution valide');
    return;
  }
  
  try {
    console.log('📤 Envoi distribution:', distributions);
    
    const response = await fetch('/api/protected/receptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...currentReception,
        distributions
      })
    });
    
    if (!response.ok) throw new Error(await response.text());
    
    const result = await response.json();
    console.log('✅ Distribution sauvegardée:', result);
    
    // Fermer le modal
    bootstrap.Modal.getInstance(document.getElementById('modalReceptionDistribution')).hide();
    
    // Recharger les données
    location.reload();
  } catch (err) {
    console.error('❌ Erreur:', err);
    alert('Erreur lors de la sauvegarde: ' + err.message);
  }
}
</script>
