<?php
// modals/magasins-guichets-modals.php
// Modals ultra-modernes avec validation, preview, drag-drop, animations
?>

<!-- ====================================================== -->
<!-- MODAL CRÉER MAGASIN (Glassmorphism + Animations) -->
<!-- ====================================================== -->
<div class="modal fade" id="modalCreateMagasin" tabindex="-1" data-bs-backdrop="static">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-xl overflow-hidden" style="backdrop-filter: blur(20px); background: rgba(255,255,255,0.95);">
            <div class="modal-header border-0 bg-gradient-primary text-white position-relative">
                <div class="position-absolute start-0 top-50 translate-middle-y ms-4">
                    <div class="avatar avatar-xl">
                        <div class="avatar-initial rounded-circle bg-white bg-opacity-20 fs-2">
                            <i class="fas fa-store"></i>
                        </div>
                    </div>
                </div>
                <h4 class="modal-title fw-bold mb-0 ms-5">
                    <i class="fas fa-plus-circle me-2"></i>Nouveau Magasin
                </h4>
                <button type="button" class="btn-close btn-close-black" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="container-fluid">
                     <form id="formCreateMagasin">
                <div class="modal-body p-4">
                    <!-- ETAPE 1: Infos Principales -->
                    <div id="magasinStep1">
                        <div class="row g-3 mb-4">
                            <div class="col-12">
                                <label class="form-label fw-semibold">Nom du magasin <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light">
                                        <i class="fas fa-store text-primary"></i>
                                    </span>
                                    <input type="text" class="form-control fw-semibold fs-1" name="nom_magasin" required 
                                           placeholder="Ex: Magasin Central Goma">
                                    <span class="invalid-feedback"></span>
                                </div>
                            </div>
                            <input type="hidden" name="businessId" id="magasinBusinessId">
                            <div class="col-12">
                                <label class="form-label">Gestionnaire (obligatoire)</label>
                                <select name="managerId" id="magasinManagerId" class="form-select" required>
                                    <option value="">Chargement des gestionnaires…</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Adresse complète</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-map-marker-alt"></i></span>
                                    <input type="text" class="form-control" name="adresse" placeholder="Av. des Volcans, Goma">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Téléphone</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-phone"></i></span>
                                    <input type="tel" class="form-control" name="telephone" placeholder="+243 99X XXX XXX">
                                </div>
                            </div>
                        </div>

                        <!-- Coordonnées GPS (Optionnel) -->
                        <div class="row g-3 mb-4">
                            <div class="col-md-6">
                                <label class="form-label">Latitude</label>
                                <input type="number" step="any" class="form-control" name="latitude" placeholder="0.000000">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Longitude</label>
                                <input type="number" step="any" class="form-control" name="longitude" placeholder="0.000000">
                            </div>
                        </div>

                        <!-- Photo Magasin (drag & drop + preview) -->
                        <div class="mb-4">
                            <label class="form-label">Photo du magasin (optionnel)</label>
                            <div id="magasinPhotoDropArea" class="border rounded-3 p-3 text-center bg-light" style="position:relative; cursor: pointer;">
                                <input type="file" class="form-control d-none" id="magasinPhotoInput" name="photo" accept="image/*">
                                
                                <!-- Zone d'upload (texte + bouton) -->
                                <div id="magasinPhotoUploadZone" class="d-flex flex-column align-items-center justify-content-center py-3" style="min-height:120px; display:flex;">
                                    <i class="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
                                    <div class="small text-muted">Glisser-déposer l'image ici ou</div>
                                    <label for="magasinPhotoInput" class="btn btn-outline-primary rounded-pill px-4 mt-2">
                                        <i class="fas fa-camera me-2"></i>Choisir une photo
                                    </label>
                                    <div class="small text-500 mt-2 text-muted">PNG, JPG — max 5MB</div>
                                </div>
                                
                                <!-- Preview image -->
                                <div id="magasinPhotoPreview" style="display:none;">
                                    <div class="position-relative">
                                        <img src="" alt="Preview" 
                                             class="rounded-4 shadow-sm" style="max-height: 220px; width: 100%; object-fit: cover;">
                                        <button type="button" id="magasinPhotoRemove" class="btn btn-sm btn-danger position-absolute" 
                                                style="top:8px; right:8px; z-index: 10;">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer border-0 bg-light px-4 py-3">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-2"></i>Annuler
                    </button>
                    <button type="submit" class="btn btn-primary px-4">
                        <i class="fas fa-save me-2"></i>Créer Magasin
                        <span class="spinner-border spinner-border-sm ms-2 d-none" id="submitSpinner1"></span>
                    </button>
                </div>
            </form>
                </div>
            </div>

           
        </div>
    </div>
</div>

<!-- ====================================================== -->
<!-- MODAL CRÉER GUICHET (Compact + Stats intégrées) -->
<!-- ====================================================== -->
<div class="modal fade" id="modalCreateGuichet" tabindex="-1" data-bs-backdrop="static">
    <div class="modal-dialog modal-md modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
            <div class="modal-header border-0 bg-gradient-success text-white rounded-top-3">
                <h5 class="modal-title mb-0">
                    <i class="fas fa-cash-register me-2"></i>Nouveau Guichet
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>

            <form id="formCreateGuichet">
                <div class="modal-body p-4">
                    <input type="hidden" name="magasinId" id="guichetMagasinId">
                    
                    <div class="mb-4">
                        <label class="form-label fw-semibold">Nom du guichet <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="fas fa-hashtag text-success"></i>
                            </span>
                            <input type="text" class="form-control fw-semibold" name="nomGuichet" required 
                                   placeholder="Ex: Guichet 001">
                        </div>
                    </div>

                    <div class="row g-3 mb-4">
                        <div class="col-6">
                            <label class="form-label">Code court</label>
                            <input type="text" class="form-control text-center fw-bold fs-5 text-primary" 
                                   name="codeGuichet" maxlength="6" placeholder="G001">
                        </div>
                        <div class="col-6">
                            <label class="form-label">Statut</label>
                            <select class="form-select" name="status">
                                <option value="1">🟢 Actif</option>
                                <option value="0">🔴 Inactif</option>
                            </select>
                        </div>
                    </div>

                    <!-- Vendeurs pré-assignés -->
                    <div class="mb-4">
                        <label class="form-label">Vendeur principal (optionnel)</label>
                        <select class="form-select" name="vendeurPrincipal">
                            <option value="">Sélectionner...</option>
                            <!-- Dynamique via JS -->
                        </select>
                    </div>

                    <!-- Objectifs CA -->
                    <div class="row g-3">
                        <div class="col-6">
                            <label class="form-label">Objectif journalier</label>
                            <div class="input-group">
                                <span class="input-group-text">CDF</span>
                                <input type="number" class="form-control" name="objectifJournalier" value="50000">
                            </div>
                        </div>
                        <div class="col-6">
                            <label class="form-label">Limite stock max</label>
                            <input type="number" class="form-control" name="stockMax" value="1000">
                        </div>
                    </div>
                </div>

                <div class="modal-footer border-0 bg-light px-4 py-3 rounded-bottom-3">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="submit" class="btn btn-success px-4">
                        <i class="fas fa-check me-2"></i>Créer Guichet
                        <span class="spinner-border spinner-border-sm ms-2 d-none" id="submitSpinner2"></span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- ====================================================== -->
<!-- MODAL ÉDITER MAGASIN (Avancé avec historique) -->
<!-- ====================================================== -->
<div class="modal fade" id="modalEditMagasin" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content border-0 shadow-2xl">
            <div class="modal-header bg-gradient-warning text-white">
                <h5 class="modal-title">
                    <i class="fas fa-edit me-2"></i>Modifier <span id="editMagasinName"></span>
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form id="formEditMagasin">
                <div class="modal-body p-4">
                    <input type="hidden" name="magasinId" id="editMagasinId">
                    
                    <!-- TABS: Infos | Stats | Historique -->
                    <ul class="nav nav-tabs border-bottom-0 mb-4" id="editMagasinTabs">
                        <li class="nav-item">
                            <a class="nav-link active" data-bs-toggle="tab" href="#editInfos">
                                <i class="fas fa-info-circle me-1"></i>Infos
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-bs-toggle="tab" href="#editStats">
                                <i class="fas fa-chart-bar me-1"></i>Stats
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-bs-toggle="tab" href="#editHistory">
                                <i class="fas fa-history me-1"></i>Historique
                            </a>
                        </li>
                    </ul>

                    <div class="tab-content">
                        <!-- TAB 1: Infos (champs éditables) -->
                        <div class="tab-pane fade show active" id="editInfos">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Nom</label>
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="fas fa-store text-primary"></i>
                                        </span>
                                        <input type="text" class="form-control" id="editMagasinNom" name="nomMagasin" required placeholder="Nom du magasin">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Gestionnaire</label>
                                    <select class="form-select" id="editMagasinManagerId" name="managerId">
                                        <option value="">Chargement des gestionnaires…</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Adresse</label>
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="fas fa-map-marker-alt"></i>
                                        </span>
                                        <input type="text" class="form-control" id="editMagasinAdresse" name="adresse" placeholder="Adresse complète">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Téléphone</label>
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="fas fa-phone"></i>
                                        </span>
                                        <input type="tel" class="form-control" id="editMagasinTelephone" name="telephone" placeholder="+243 99X XXX XXX">
                                    </div>
                                </div>
                                <div class="col-12">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" id="editMagasinDescription" name="description" rows="3" placeholder="Description du magasin..."></textarea>
                                </div>
                                <div class="col-12">
                                    <label class="form-label">Photo</label>
                                    <input type="file" class="form-control d-none" id="editMagasinPhotoInput" name="photo" accept="image/*">
                                    <div class="d-flex align-items-center gap-3">
                                        <label for="editMagasinPhotoInput" class="btn btn-outline-secondary btn-sm">
                                            <i class="fas fa-camera me-2"></i>Remplacer photo
                                        </label>
                                        <div id="editMagasinPhotoPreview" style="width:100px;height:100px;overflow:hidden;border-radius:8px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;">
                                            <img src="assets/img/placeholders/photo-placeholder.jpg" alt="preview" style="width:100%;height:100%;object-fit:cover;" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- TAB 2: Stats -->
                        <div class="tab-pane fade" id="editStats">
                            <div class="row g-4 mb-4">
                                <div class="col-md-3 text-center p-3 bg-light rounded-3">
                                    <h4 class="text-primary mb-1" id="editCaTotal">0</h4>
                                    <small class="text-muted">CA Total</small>
                                </div>
                                <!-- Autres métriques -->
                            </div>
                        </div>

                        <!-- TAB 3: Historique -->
                        <div class="tab-pane fade" id="editHistory">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Date</th>
                                            <th>Action</th>
                                            <th>Utilisateur</th>
                                            <th>Détails</th>
                                        </tr>
                                    </thead>
                                    <tbody id="magasinHistory">
                                        <!-- Dynamique -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <div class="modal-footer border-top">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Fermer</button>
                <button type="button" class="btn btn-warning" id="btnArchiveMagasin">
                    <i class="fas fa-archive me-2"></i>Archiver
                </button>
                <button type="button" class="btn btn-primary" id="btnUpdateMagasin">
                    <i class="fas fa-save me-2"></i>Enregistrer
                </button>
            </div>
        </div>
    </div>
</div>

<!-- ====================================================== -->
<!-- MODAL CONFIRMATION SUPPRESSION (Animation slide-up) -->
<!-- ====================================================== -->
<div class="modal fade" id="modalDeleteConfirm" tabindex="-1">
    <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content border-0 text-center p-5">
            <div class="avatar avatar-4xl mb-4 mx-auto">
                <div class="avatar-initial bg-danger rounded-circle">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                </div>
            </div>
            <h5 class="mb-3 fw-bold" id="deleteTitle">Confirmer suppression</h5>
            <p class="text-muted mb-4" id="deleteMessage">
                Êtes-vous sûr de vouloir supprimer ce magasin ? Cette action est irréversible.
            </p>
            <input type="hidden" id="deleteItemId">
            <input type="hidden" id="deleteItemType">
            
            <div class="d-flex gap-2 justify-content-center">
                <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">
                    <i class="fas fa-times me-2"></i>Annuler
                </button>
                <button type="button" class="btn btn-danger px-4" id="confirmDelete">
                    <i class="fas fa-trash me-2"></i>Supprimer
                    <span class="spinner-border spinner-border-sm ms-2 d-none"></span>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- ====================================================== -->
<!-- TOAST NOTIFICATIONS (Intégrées) -->
<!-- ====================================================== -->
<div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1099;">
    <div id="liveToast" class="toast align-items-center text-white bg-success border-0" role="alert">
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-check-circle me-2"></i>
                <span id="toastMessage"></span>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>


<script>
// JAVASCRIPT INTÉGRÉ POUR MODALS (même méthode que entreprise.php)
$(document).ready(function() {
    // Photo upload - même pattern que entreprise.php
    const magasinPhotoInput = document.getElementById('magasinPhotoInput');
    if(magasinPhotoInput) {
        magasinPhotoInput.addEventListener('change', (ev) => {
            const file = ev.target.files && ev.target.files[0];
            const uploadZone = document.getElementById('magasinPhotoUploadZone');
            const photoPreview = document.getElementById('magasinPhotoPreview');
            
            if(file && photoPreview && uploadZone) {
                const img = photoPreview.querySelector('img');
                if(img) {
                    img.src = URL.createObjectURL(file);
                    uploadZone.style.display = 'none';
                    photoPreview.style.display = 'block';
                }
            }
        });
    }

    // Remove button
    const photoRemoveBtn = document.getElementById('magasinPhotoRemove');
    if(photoRemoveBtn) {
        photoRemoveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const photoInput = document.getElementById('magasinPhotoInput');
            const uploadZone = document.getElementById('magasinPhotoUploadZone');
            const photoPreview = document.getElementById('magasinPhotoPreview');
            
            if(photoInput) photoInput.value = '';
            if(photoPreview) {
                photoPreview.style.display = 'none';
                const img = photoPreview.querySelector('img');
                if(img) img.src = '';
            }
            if(uploadZone) uploadZone.style.display = 'flex';
        });
    }

    // Drag & drop
    const dropArea = document.getElementById('magasinPhotoDropArea');
    if(dropArea) {
        ['dragover', 'dragenter'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropArea.classList.add('border-primary');
            });
        });

        ['dragleave', 'dragend'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropArea.classList.remove('border-primary');
            });
        });

        dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('border-primary');
            
            const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if(file && file.type && file.type.startsWith('image/')) {
                const photoInput = document.getElementById('magasinPhotoInput');
                const uploadZone = document.getElementById('magasinPhotoUploadZone');
                const photoPreview = document.getElementById('magasinPhotoPreview');
                
                // Display preview
                if(photoPreview) {
                    const img = photoPreview.querySelector('img');
                    if(img) {
                        img.src = URL.createObjectURL(file);
                        if(uploadZone) uploadZone.style.display = 'none';
                        photoPreview.style.display = 'block';
                    }
                }
                
                // Add file to input
                if(photoInput) {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    photoInput.files = dt.files;
                }
            } else {
                showToast('Fichier non supporté', 'danger');
            }
        });
    }

    // Populate manager select when modal opens
    $('#modalCreateMagasin').on('show.bs.modal', async function(e){
        const managerSelect = document.getElementById('magasinManagerId');
        const mb = document.getElementById('magasinBusinessId');
        // Prefill businessId from current context if available
        if(mb && (!mb.value || mb.value.trim()==='')){
            if(window.CURRENT_BUSINESS && (window.CURRENT_BUSINESS._id || window.CURRENT_BUSINESS.id)){
                mb.value = window.CURRENT_BUSINESS._id || window.CURRENT_BUSINESS.id;
            }
        }

        if(!managerSelect) return;
        managerSelect.innerHTML = '<option value="">Chargement des gestionnaires…</option>';
        try{
                // Resolve token from any known localStorage keys or helper
                const token = (typeof getToken === 'function') ? getToken() : (localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt') || localStorage.getItem('accessToken') || null);
                const base = (typeof API_BASE !== 'undefined') ? API_BASE : ((typeof apiBase !== 'undefined') ? apiBase : '');
                // Use AbortController to avoid hanging fetches
                const controller = new AbortController();
                const timeoutMs = 8000; // 8s
                const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
                let members = [];
                try{
                    const res = await fetch(base + '/api/protected/members', { headers: token ? { 'Authorization': 'Bearer ' + token } : {}, signal: controller.signal });
                    clearTimeout(timeoutId);
                    if(!res.ok) throw new Error('Erreur chargement gestionnaires: ' + res.status);
                    members = await res.json();
                }catch(fetchErr){
                    clearTimeout(timeoutId);
                    console.error('load managers fetch error', fetchErr);
                    managerSelect.innerHTML = '<option value="">Erreur chargement</option>';
                    return;
                }
            const managers = (members||[]).filter(m=>m.role === 'superviseur');
            if(managers.length===0){ managerSelect.innerHTML = '<option value="">Aucun gestionnaire trouvé</option>'; return; }
            managerSelect.innerHTML = '<option value="">Sélectionner un gestionnaire</option>' + managers.map(m=>`<option value="${m._id}">${(m.prenom||'').trim()} ${(m.nom||'').trim()} ${m.email? '('+m.email+')':''}</option>`).join('');
        }catch(err){ console.error('load managers', err); managerSelect.innerHTML = '<option value="">Erreur chargement</option>'; }
    });

    // Soumission forms avec validation
    $('#formCreateMagasin').on('submit', async function(e) {
        e.preventDefault();
        const $btn = $(this).find('button[type="submit"]');
        const spinner = document.getElementById('submitSpinner1');
        try{
            if($btn && $btn.length) $btn.prop('disabled', true);
            if(spinner) spinner.classList.remove('d-none');
            // Build FormData
            const formEl = document.getElementById('formCreateMagasin');
            const fd = new FormData(formEl);
            // Send to API
            const token = localStorage.getItem('token') || localStorage.getItem('authToken') || null;
            const res = await fetch((typeof API_BASE!=='undefined'?API_BASE:'') + '/api/protected/magasins', {
                method: 'POST',
                body: fd,
                headers: token ? { 'Authorization': 'Bearer ' + token } : {}
            });
            if(!res.ok) {
                const txt = await res.text(); throw new Error(txt || 'Erreur serveur');
            }
            const data = await res.json();
            // Record activity client-side so the Recent Activities UI updates immediately
            try{
                const desc = `Magasin '${data.magasin.nom_magasin || data.magasin.nom}' créé. Gestionnaire assigné.`;
                if(typeof window !== 'undefined' && typeof window.recordActivity === 'function'){
                    window.recordActivity('Magasin créé', desc, 'fas fa-store');
                }
            }catch(e){ console.warn('recordActivity failed', e); }

            showToast('Magasin créé avec succès ! ✅', 'success');
            // hide modal (use bootstrap API or jQuery fallback)
            try{
                const modalEl = document.getElementById('modalCreateMagasin');
                if(window.bootstrap && modalEl){
                    bootstrap.Modal.getOrCreateInstance(modalEl).hide();
                } else if(typeof $ === 'function'){
                    $('#modalCreateMagasin').modal('hide');
                }
            }catch(e){ console.warn('hide modal failed', e); }

            // Notify the page that a magasin was created so listeners can refresh UI
            try{
                const bizInput = document.getElementById('magasinBusinessId');
                const businessId = (bizInput && bizInput.value) ? bizInput.value : (window.CURRENT_BUSINESS && (window.CURRENT_BUSINESS._id || window.CURRENT_BUSINESS.id));
                const eventDetail = { businessId: businessId || null, magasin: data.magasin || null };
                // Dispatch a custom event for any listeners on the window
                window.dispatchEvent(new CustomEvent('magasin.created', { detail: eventDetail }));

                // Backward-compatible: attempt direct call if functions are global
                if(eventDetail.businessId){
                    if(typeof window.loadMagasins === 'function'){
                        await window.loadMagasins(eventDetail.businessId);
                    } else if(typeof window.selectCompany === 'function'){
                        await window.selectCompany(eventDetail.businessId);
                    }
                }
            }catch(refreshErr){ console.warn('refresh magasins after create failed', refreshErr); }
        }catch(err){ console.error('create magasin', err); showToast('Erreur création magasin: '+(err.message||err), 'danger'); }
        finally{ if($btn && $btn.length) $btn.prop('disabled', false); if(spinner) spinner.classList.add('d-none'); }
    });

    // Auto-remplissage guichet
    $('#modalCreateGuichet').on('show.bs.modal', function() {
        $('#guichetMagasinId').val(CURRENT_MAGASIN_ID);
    });
});

function showToast(message, type = 'success') {
    const toast = new bootstrap.Toast(document.getElementById('liveToast'));
    $('#toastMessage').html(message);
    $('#liveToast').removeClass('bg-success bg-danger bg-warning')
                  .addClass(`bg-${type}`);
    toast.show();
}
</script>
