(function(){
  // Minimal client-side manager for entreprise.php
  // - Loads companies list
  // - Selects company and renders details
  // - Creates company and magasin via AJAX

  const apiBase = 'https://backend-gestion-de-stock.onrender.com';

  function getToken(){
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt') || localStorage.getItem('accessToken') || localStorage.getItem('userToken') || null;
    console.log('[getToken] Looking for token in localStorage:', {
      token: !!localStorage.getItem('token'),
      authToken: !!localStorage.getItem('authToken'),
      jwt: !!localStorage.getItem('jwt'),
      accessToken: !!localStorage.getItem('accessToken'),
      userToken: !!localStorage.getItem('userToken'),
      found: !!token
    });
    return token;
  }

  function authHeaders(){
    const token = getToken();
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
    console.log('[authHeaders] Token present:', !!token, 'Headers:', headers);
    return headers;
  }

  async function fetchJson(url, opts={}){
    opts.headers = Object.assign({}, opts.headers || {}, { 'Accept': 'application/json', 'Content-Type': 'application/json' }, authHeaders());
    opts.mode = 'cors';
    const res = await fetch(url, opts);
    if(!res.ok){
      const text = await res.text();
      throw new Error(res.status + ' ' + text);
    }
    return res.json();
  }

  function formatCurrency(amount, devise){ try{ return (devise||'USD') + ' ' + Number(amount).toLocaleString(); }catch(e){ return amount; } }

  function escapeHtml(str){ if(!str && str !== 0) return ''; return String(str).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }

  function budgetSmallCheck(b){ return false; }

  // Initialize company overview card with spinner and message when no company is selected
  function initializeCompanyOverview() {
    const companyOverview = document.getElementById('companyOverview');
    if(companyOverview) {
      const cardBody = companyOverview.querySelector('.card-body');
      if(cardBody) {
        cardBody.innerHTML = `
          <div class="d-flex align-items-center justify-content-center" style="height: 300px;">
            <div class="text-center">
              <div class="spinner-border spinner-border-lg text-primary mb-3" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
              <p class="text-muted">Veuillez sélectionner une entreprise dans la liste</p>
            </div>
          </div>
        `;
      }
    }
  }
  
  // Restore the company overview card to its default skeleton (no spinner)
  function resetCompanyOverviewToDefault() {
    const companyOverview = document.getElementById('companyOverview');
    if(!companyOverview) return;
    const cardBody = companyOverview.querySelector('.card-body');
    if(!cardBody) return;
    cardBody.innerHTML = `
      <div class="d-flex align-items-center">
        <div class="me-3">
          <div class="avatar avatar-xxl rounded-circle bg-soft-secondary">
            <img id="companyLogo" class="rounded-circle" src="assets/img/elearning/avatar/student.png" alt="logo" width="96" height="96" />
          </div>
        </div>
        <div class="flex-fill">
          <div class="d-flex align-items-start justify-content-between">
            <div>
              <h5 id="companyName" class="mb-1">Aucune entreprise sélectionnée</h5>
              <p id="companyInfo" class="text-600 mb-1">Sélectionnez une entreprise dans la liste pour voir son état.</p>
              <div id="companyStatus" class="d-flex flex-wrap gap-2 align-items-center mt-1">
                <a href="#" id="statusLink" class="text-600 text-decoration-none me-2">Statut inconnu</a>
                <span id="statusBadge" class="badge rounded-pill badge-soft-secondary d-none d-md-inline-block">—</span>
                <span id="guichetsLight" class="badge rounded-pill bg-secondary">Guichets: 0</span>
                <span id="vendeursLight" class="badge rounded-pill bg-secondary">Vendeurs: 0</span>
              </div>
            </div>
            <div class="text-end">
              <div class="btn-group" role="group">
                <button id="btnEditCompany" class="btn btn-outline-secondary btn-sm" type="button"><span class="fas fa-edit me-1"></span></button>
                <button id="btnViewAffectations" class="btn btn-outline-primary btn-sm" disabled type="button"><span class="fas fa-eye me-1"></span>Affectations</button>
              </div>
              <div class="mt-2">
                <button id="btnBackToList" class="btn btn-outline-secondary btn-sm d-none" type="button"><span class="fas fa-list me-1"></span>Retour à la liste</button>
              </div>
              <div class="mt-2"><small class="text-500">Dernière mise à jour: <span id="companyUpdatedAt">—</span></small></div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-3 g-3">
        <div class="col-sm-4">
          <div class="card h-100">
            <div class="card-body text-center">
              <h6 class="mb-1">Budget</h6>
              <div class="fs-2 text-700" id="companyBudget">-</div>
              <div class="text-500 small mt-1" id="companyDevise">-</div>
            </div>
          </div>
        </div>
        <div class="col-sm-4">
          <div class="card h-100">
            <div class="card-body text-center">
              <h6 class="mb-1">Chiffre d'affaires</h6>
              <div class="fs-5 text-700" id="companyCA">-</div>
              <div class="text-500 small mt-1">Période: <span id="caPeriod">mois</span></div>
            </div>
          </div>
        </div>
        <div class="col-sm-4">
          <div class="card h-100">
            <div class="card-body text-center">
              <h6 class="mb-1">Magasins</h6>
              <div class="fs-5 text-700" id="companyStoresCount">0</div>
              <div class="text-500 small mt-1">Guichets: <span id="companyCountersGuichets">0</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card-body border-top">
        <div class="row g-3 align-items-center">
          <div class="col-md-8">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-1">Spendings</h6>
                <div class="fs-3 fw-bold" id="companySpendings">$0.00</div>
                <div class="mt-1"><span id="companySpendingsDelta" class="badge rounded-pill badge-soft-danger">—</span></div>
              </div>
              <div class="text-muted small text-end">
                <div>Budget utilisé</div>
                <div class="progress mt-1" style="height:8px;width:140px;">
                  <div id="budgetUsageBar" class="progress-bar bg-primary" role="progressbar" style="width:0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row mt-3">
          <div class="col-12">
              <div class="card">
              <div class="card-header pb-0"><h6 class="mb-0">Informations</h6></div>
              <div class="card-body">
                <table class="table table-borderless fs--1 fw-medium mb-0">
                  <tbody id="companyDetailsTable">
                    <tr><td class="p-1" style="width:35%">Budget:</td><td class="p-1 text-600" id="companyBudget">-</td></tr>
                    <tr><td class="p-1">Devise:</td><td class="p-1 text-600" id="companyDevise">-</td></tr>
                    <tr><td class="p-1">Email:</td><td class="p-1 text-600" id="companyEmail">-</td></tr>
                    <tr><td class="p-1">Téléphone:</td><td class="p-1 text-600" id="companyTelephone">-</td></tr>
                    <tr><td class="p-1">Adresse:</td><td class="p-1 text-600" id="companyAddress">-</td></tr>
                    <tr><td class="p-1">RCCM:</td><td class="p-1 text-600" id="companyRCCM">-</td></tr>
                    <tr><td class="p-1">ID Nat:</td><td class="p-1 text-600" id="companyIDNat">-</td></tr>
                    <tr><td class="p-1">Site Web:</td><td class="p-1 text-600" id="companySiteWeb">-</td></tr>
                    <tr><td class="p-1">Forme Juridique:</td><td class="p-1 text-600" id="companyFormeJuridique">-</td></tr>
                    <tr><td class="p-1">Capital Social:</td><td class="p-1 text-600" id="companyCapitalSocial">-</td></tr>
                    <tr><td class="p-1">Siège Social:</td><td class="p-1 text-600" id="companySiegeSocial">-</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  function showAlert(message, type = 'info', duration = 3000) {
    const alertId = 'alert-' + Date.now();
    const alertHTML = `
      <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show position-fixed" style="top: 20px; right: 20px; z-index: 1050; max-width: 400px;" role="alert">
        <span>${escapeHtml(message)}</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', alertHTML);
    if (duration > 0) {
      setTimeout(() => {
        const el = document.getElementById(alertId);
        if (el) el.remove();
      }, duration);
    }
  }

  async function loadCompanies(){
    const list = document.getElementById('companiesList');
    const countEl = document.getElementById('companiesCount');
    if(list) list.innerHTML = '<div class="p-3 text-center"><div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Chargement...</span></div></div>';
    try{
      console.log('[loadCompanies] apiBase:', apiBase, 'full URL:', apiBase + '/api/business');
      const businesses = await fetchJson(apiBase + '/api/business');
      // After loading companies, ensure the company overview is reset to default if no company selected
      if(!window.CURRENT_BUSINESS){
        try{ resetCompanyOverviewToDefault(); }catch(e){ console.warn('reset overview', e); }
      }
      if(!Array.isArray(businesses) || businesses.length === 0){
        if(list) list.innerHTML = '<div class="p-3 text-center text-500">Aucune entreprise</div>';
        if(countEl) countEl.textContent = '0';
        return [];
      }
      if(list) list.innerHTML = '';
      for(const b of businesses){
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        a.dataset.id = b._id;
                a.innerHTML = `<div class="d-flex align-items-center"><div class="me-2" style="width:44px;height:44px;flex-shrink:0;"><img src="${escapeHtml(b.logoUrl || b.photoUrl || 'assets/img/elearning/avatar/student.png')}" alt="logo" class="rounded-circle" style="width:100%;height:100%;object-fit:cover;" /></div><div><strong>${escapeHtml(b.nomEntreprise || b.nom || 'Sans nom')}</strong><div class="text-500 small">${escapeHtml(b.adresse || '')}</div></div></div><span class="badge bg-primary">${formatCurrency(b.budget||0,b.devise||'USD')}</span>`;
        a.addEventListener('click', (ev)=>{ ev.preventDefault(); selectCompany(b._id); });
        list.appendChild(a);
      }
      if(countEl) countEl.textContent = String(businesses.length);
      showAlert('Entreprises chargées avec succès', 'success', 2000);
      return businesses;
    }catch(err){
      console.error('loadCompanies', err);
      if(list) list.innerHTML = '<div class="p-3 text-center text-danger"><i class="fas fa-exclamation-triangle me-2"></i>Erreur de chargement</div>';
      if(countEl) countEl.textContent = '—';
      showAlert('Erreur lors du chargement des entreprises', 'danger', 4000);
      return [];
    }
  }

  function renderCompany(b){
    try{
      const nameEl = document.getElementById('companyName');
      if(nameEl){
        // If the business provides an icon class (fontawesome), show it before the name
        if(b.icon){
          nameEl.innerHTML = `<span class="me-2"><i class="${escapeHtml(b.icon)}"></i></span>${escapeHtml(b.nomEntreprise || b.nom || 'Untitled')}`;
        }else{
          nameEl.textContent = b.nomEntreprise || b.nom || 'Untitled';
        }
      }
      const infoEl = document.getElementById('companyInfo'); if(infoEl) infoEl.textContent = b.description || '';
      const budgetEl = document.getElementById('companyBudget'); if(budgetEl) budgetEl.textContent = formatCurrency(b.budget||0, b.devise || 'USD');
      const devEl = document.getElementById('companyDevise'); if(devEl) devEl.textContent = b.devise || 'USD';
      const emailEl = document.getElementById('companyEmail'); if(emailEl) emailEl.textContent = b.email || '-';
      const telEl = document.getElementById('companyTelephone'); if(telEl) telEl.textContent = b.telephone || '-';
      const spendEl = document.getElementById('companySpendings'); if(spendEl) spendEl.textContent = formatCurrency(b.chiffre_affaires||0, b.devise || 'USD');
      const logo = document.getElementById('companyLogo'); if(logo) logo.src = b.logoUrl || b.photoUrl || 'assets/img/elearning/avatar/student.png';
      const siteEl = document.getElementById('companySiteWeb'); if(siteEl) siteEl.textContent = b.siteWeb || '-';
      const formeEl = document.getElementById('companyFormeJuridique'); if(formeEl) formeEl.textContent = b.formeJuridique || '-';
      const capitalEl = document.getElementById('companyCapitalSocial'); if(capitalEl) capitalEl.textContent = b.capitalSocial ? formatCurrency(b.capitalSocial, b.devise||'USD') : '-';
      const siegeEl = document.getElementById('companySiegeSocial'); if(siegeEl) siegeEl.textContent = b.siegeSocial || '-';
      const addrEl = document.getElementById('companyAddress'); if(addrEl) addrEl.textContent = b.adresse || '-';
      const rccmEl = document.getElementById('companyRCCM'); if(rccmEl) rccmEl.textContent = b.rccm || '-';
      const idNatEl = document.getElementById('companyIDNat'); if(idNatEl) idNatEl.textContent = b.idNat || '-';
      const assEl = document.getElementById('assignmentScore'); if(assEl) assEl.textContent = b.assignmentScore || '—';

      const statusLink = document.getElementById('statusLink');
      const statusBadge = document.getElementById('statusBadge');
      const budgetLight = document.getElementById('budgetLight');
      const remaining = (Number(b.budget)||0) - (Number(b.chiffre_affaires)||0);

      if(statusLink) statusLink.href = b.email ? ('mailto:' + b.email) : '#';

      if(b.status === 0 || b.status === '0'){
        if(statusLink) statusLink.textContent = 'Inactif';
        if(statusBadge){ statusBadge.className = 'badge rounded-pill badge-soft-danger d-none d-md-inline-block ms-0'; statusBadge.innerHTML = 'Inactif'; }
      }else{
        if(remaining < 0){
          if(statusLink) statusLink.textContent = 'À découvert';
          if(statusBadge){ statusBadge.className = 'badge rounded-pill badge-soft-danger d-none d-md-inline-block ms-0'; statusBadge.innerHTML = 'Découvert'; }
        }else if((Number(b.budget)||0) > 0 && remaining < (Number(b.budget)||0) * 0.2){
          if(statusLink) statusLink.textContent = 'Budget faible';
          if(statusBadge){ statusBadge.className = 'badge rounded-pill badge-soft-warning d-none d-md-inline-block ms-0'; statusBadge.innerHTML = 'Budget faible'; }
        }else{
          if(statusLink) statusLink.textContent = 'Opérationnel';
          if(statusBadge){ statusBadge.className = 'badge rounded-pill badge-soft-success d-none d-md-inline-block ms-0'; statusBadge.innerHTML = '<span>Verified</span> <span class="fas fa-check ms-1" data-fa-transform="shrink-4"></span>'; }
        }
      }
      if(budgetLight) budgetLight.textContent = 'Budget: ' + formatCurrency(b.budget||0, b.devise||'USD');
      const guEl = document.getElementById('guichetsLight'); if(guEl) guEl.textContent = 'Guichets: —';
      const vEl = document.getElementById('vendeursLight'); if(vEl) vEl.textContent = 'Vendeurs: —';
    }catch(e){
      console.warn('renderCompany', e);
    }
  }

  async function loadMagasins(businessId){
    const container = document.getElementById('magasinsList');
    // If no businessId provided, show spinner + message asking to select a company
    if(!businessId){
      if(container) container.innerHTML = '<div class="p-3 text-center"><div class="spinner-border spinner-border-sm text-primary mb-2" role="status"><span class="visually-hidden">Chargement des magasins...</span></div><p class="text-muted small mt-2">Veuillez sélectionner une entreprise...</p></div>';
      return [];
    }
    if(container) container.innerHTML = '<div class="p-3 text-center"><div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Chargement des magasins...</span></div></div>';
    try{
      const magasins = await fetchJson(apiBase + '/api/business/magasin/' + businessId);
      // Update magasins count badge
      const badge = document.getElementById('magasinsCountBadge');
      if(badge) badge.textContent = Array.isArray(magasins) ? magasins.length : 0;
      
      if(!Array.isArray(magasins) || magasins.length === 0){ if(container) container.innerHTML = '<div class="p-3 text-center text-500">Aucun magasin ni guichet enregistré</div>'; return []; }
      if(container) container.innerHTML = '';
      for(const m of magasins){
        const div = document.createElement('div');
        div.className = 'p-3 border-bottom d-flex flex-column';
        div.innerHTML = `
          <div class="d-flex justify-content-between align-items-start">
            <div class="d-flex align-items-start">
              <span class="drag-handle me-2" style="cursor:grab"><i class="fas fa-grip-vertical"></i></span>
              <div>
                <strong>${escapeHtml(m.nom_magasin)}</strong>
                <div class="small text-500">${escapeHtml(m.adresse||'')}</div>
              </div>
            </div>
            <div><button class="btn btn-sm btn-link" data-magasin-id="${m._id}">Voir guichets</button></div>
          </div>
          <div class="mt-2" id="guichets-${m._id}"></div>
        `;
        container.appendChild(div);
        // load guichets for display (does not block)
        loadGuichets(m._id).catch(()=>{});
      }
      return magasins;
    }catch(err){ console.error('loadMagasins', err); if(container) container.innerHTML = '<div class="p-3 text-center text-danger"><i class="fas fa-exclamation-triangle me-2"></i>Erreur</div>'; showAlert('Erreur lors du chargement des magasins', 'danger', 4000); return []; }
  }

  async function loadGuichets(magasinId){
    try{
      const guichets = await fetchJson(apiBase + '/api/business/guichet/' + magasinId);
      const holder = document.getElementById('guichets-' + magasinId);
      if(!holder) return guichets || [];
      if(!Array.isArray(guichets) || guichets.length === 0){ holder.innerHTML = '<div class="small text-500">Aucun guichet</div>'; return []; }
      holder.innerHTML = '<div class="d-flex flex-column gap-2">' + guichets.map(g=>`<div class="small"><strong>${escapeHtml(g.nom_guichet)}</strong> <span class="text-500">(${g.status==1?'actif':'inactif'})</span></div>`).join('') + '</div>';
      return guichets;
    }catch(err){ console.error('loadGuichets', err); return []; }
  }

  // Create business handler
  async function submitCreateBusiness(){
    const form = document.getElementById('formCreateBusiness');
    try{
      const btn = document.getElementById('submitCreateBusiness');
      if(btn) btn.disabled = true;
      // Ensure we have a token to send
      const token = getToken();
      console.log('[submitCreateBusiness] token:', token);
      if(!token){
        alert('Action non autorisée — veuillez vous connecter.');
        return;
      }
      // Extract form fields and build payload; if a logo file is present, send multipart FormData
      const formData = new FormData(form);
      const logoFile = form.querySelector('input[name="logo"]') ? form.querySelector('input[name="logo"]').files[0] : null;
      let res;

      if (logoFile) {
        // Send as multipart/form-data so backend multer can process the image
        const fd = new FormData();
        fd.append('logo', logoFile);
        fd.append('nomEntreprise', formData.get('nomEntreprise') || '');
        fd.append('adresse', formData.get('adresse') || '');
        if (formData.get('budget')) fd.append('budget', formData.get('budget'));
        fd.append('devise', formData.get('devise') || 'USD');
        fd.append('email', formData.get('email') || '');
        fd.append('description', formData.get('description') || '');
        fd.append('telephone', formData.get('telephone') || '');
        // extended fields
        fd.append('rccm', formData.get('rccm') || '');
        fd.append('idNat', formData.get('idNat') || '');
        fd.append('siteWeb', formData.get('siteWeb') || '');
        fd.append('icon', formData.get('icon') || '');
        fd.append('formeJuridique', formData.get('formeJuridique') || '');
        if (formData.get('capitalSocial')) fd.append('capitalSocial', formData.get('capitalSocial'));
        fd.append('siegeSocial', formData.get('siegeSocial') || '');

        console.log('[submitCreateBusiness] sending multipart payload with logo to:', apiBase + '/api/business');
        res = await fetch(apiBase + '/api/business', { 
          method: 'POST', 
          body: fd,
          headers: { 'Authorization': 'Bearer ' + token }
        });
      } else {
        const payload = {
          nomEntreprise: formData.get('nomEntreprise') || '',
          adresse: formData.get('adresse') || '',
          budget: formData.get('budget') ? Number(formData.get('budget')) : 0,
          devise: formData.get('devise') || 'USD',
          email: formData.get('email') || '',
          description: formData.get('description') || '',
          telephone: formData.get('telephone') || ''
        };
        // extended fields
        if(formData.get('rccm')) payload.rccm = formData.get('rccm');
        if(formData.get('idNat')) payload.idNat = formData.get('idNat');
        if(formData.get('siteWeb')) payload.siteWeb = formData.get('siteWeb');
        if(formData.get('icon')) payload.icon = formData.get('icon');
        if(formData.get('formeJuridique')) payload.formeJuridique = formData.get('formeJuridique');
        if(formData.get('capitalSocial')) payload.capitalSocial = Number(formData.get('capitalSocial'));
        if(formData.get('siegeSocial')) payload.siegeSocial = formData.get('siegeSocial');

        const headers = {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        };

        console.log('[submitCreateBusiness] sending JSON payload:', payload);
        console.log('[submitCreateBusiness] sending to:', apiBase + '/api/business');

        res = await fetch(apiBase + '/api/business', { 
          method: 'POST', 
          body: JSON.stringify(payload), 
          headers: headers
        });
      }
      
      console.log('[submitCreateBusiness] response status:', res.status);
      
      if(!res.ok){ 
        const txt = await res.text(); 
        console.error('[submitCreateBusiness] error response:', txt);
        throw new Error(txt); 
      }
      
      const data = await res.json();
      const modal = (typeof bootstrap !== 'undefined') ? bootstrap.Modal.getInstance(document.getElementById('modalCreateBusiness')) : null;
      if(modal) modal.hide();
      showAlert('Entreprise créée avec succès!', 'success', 3000);
      form.reset();
      // Clear logo preview
      const preview = document.getElementById('createLogoPreview');
      if(preview) preview.style.display = 'none';
      await loadCompanies();
      if(data.business && data.business._id) selectCompany(data.business._id);
    }catch(err){ 
      console.error('submitCreateBusiness', err); 
      showAlert('Erreur création entreprise: ' + (err.message||err), 'danger', 4000);
    }finally{ 
      const btn = document.getElementById('submitCreateBusiness'); 
      if(btn) btn.disabled = false; 
    }
  }

  async function submitCreateMagasin(){
    const form = document.getElementById('formCreateMagasin');
    try{
      const btn = document.getElementById('submitCreateMagasin');
      if(btn) btn.disabled = true;
      // Ensure we have a token to send
      const token = getToken();
      console.log('[submitCreateMagasin] token:', token);
      if(!token){
        alert('Action non autorisée — veuillez vous connecter.');
        return;
      }
      
      // Extract form fields and build JSON payload
      const formData = new FormData(form);
      const businessId = formData.get('businessId') || '';
      const payload = {
        businessId: businessId,
        nom_magasin: formData.get('nom_magasin') || '',
        adresse: formData.get('adresse') || '',
        telephone: formData.get('telephone') || '',
        email: formData.get('email') || ''
      };
      
      const headers = {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      };
      
      console.log('[submitCreateMagasin] sending JSON payload:', payload);
      console.log('[submitCreateMagasin] sending to:', apiBase + '/api/business/magasin');
      
      const res = await fetch(apiBase + '/api/business/magasin', { 
        method: 'POST', 
        body: JSON.stringify(payload), 
        headers: headers
      });
      
      console.log('[submitCreateMagasin] response status:', res.status);
      
      if(!res.ok){ 
        const txt = await res.text(); 
        console.error('[submitCreateMagasin] error response:', txt);
        throw new Error(txt); 
      }
      
      const data = await res.json();
      const modal = (typeof bootstrap !== 'undefined') ? bootstrap.Modal.getInstance(document.getElementById('modalCreateMagasin')) : null;
      if(modal) modal.hide();
      showAlert('Magasin créé avec succès!', 'success', 3000);
      form.reset();
      if(businessId) {
        await loadMagasins(businessId);
      }
    }catch(err){ 
      console.error('submitCreateMagasin', err); 
      showAlert('Erreur création magasin: ' + (err.message||err), 'danger', 4000);
    }finally{ 
      const btn = document.getElementById('submitCreateMagasin'); 
      if(btn) btn.disabled = false; 
    }
  }

  // Update existing business (supports optional logo upload via FormData)
  async function submitUpdateBusiness(businessId){
    const form = document.getElementById('formEditBusiness') || document.getElementById('formCreateBusiness');
    if(!form) return;
    try{
      const btn = document.getElementById('submitUpdateBusiness');
      if(btn) btn.disabled = true;
      const token = getToken();
      if(!token){ alert('Action non autorisée — veuillez vous connecter.'); return; }

      const formData = new FormData(form);
      const logoFile = form.querySelector('input[name="logo"]') ? form.querySelector('input[name="logo"]').files[0] : null;
      let res;

      if(logoFile){
        const fd = new FormData();
        fd.append('logo', logoFile);
        // append fields that might be updated
        ['nomEntreprise','adresse','budget','devise','email','description','telephone','status'].forEach(k => { if(formData.get(k)!==null) fd.append(k, formData.get(k)); });
        // extended fields
        ['rccm','idNat','siteWeb','icon','formeJuridique','siegeSocial'].forEach(k => { if(formData.get(k)!==null) fd.append(k, formData.get(k)); });
        if(formData.get('capitalSocial')) fd.append('capitalSocial', formData.get('capitalSocial'));
        res = await fetch(apiBase + '/api/business/' + businessId, { method: 'PUT', body: fd, headers: { 'Authorization': 'Bearer ' + token } });
      } else {
        const payload = {};
        ['nomEntreprise','adresse','budget','devise','email','description','telephone','status'].forEach(k => { if(formData.get(k)!==null) payload[k] = (k==='budget' || k==='status') ? Number(formData.get(k)) : formData.get(k); });
        // extended fields
        if(formData.get('rccm')!==null) payload.rccm = formData.get('rccm');
        if(formData.get('idNat')!==null) payload.idNat = formData.get('idNat');
        if(formData.get('siteWeb')!==null) payload.siteWeb = formData.get('siteWeb');
        if(formData.get('icon')!==null) payload.icon = formData.get('icon');
        if(formData.get('formeJuridique')!==null) payload.formeJuridique = formData.get('formeJuridique');
        if(formData.get('siegeSocial')!==null) payload.siegeSocial = formData.get('siegeSocial');
        if(formData.get('capitalSocial')) payload.capitalSocial = Number(formData.get('capitalSocial'));
        res = await fetch(apiBase + '/api/business/' + businessId, { method: 'PUT', body: JSON.stringify(payload), headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } });
      }

      if(!res.ok){ const txt = await res.text(); throw new Error(txt); }
      const data = await res.json();
      showAlert('Entreprise mise à jour avec succès', 'success', 3000);
      if(typeof loadCompanies === 'function') loadCompanies();
      if(data.business && data.business._id) selectCompany(data.business._id);
    }catch(err){ console.error('submitUpdateBusiness', err); showAlert('Erreur mise à jour: ' + (err.message||err), 'danger', 4000); }
    finally{ const btn = document.getElementById('submitUpdateBusiness'); if(btn) btn.disabled = false; }
  }

  async function selectCompany(id){
    if(!id) return;
    try{
      const business = await fetchJson(apiBase + '/api/business/' + id);
      // store current business for edit population
      window.CURRENT_BUSINESS = business;
      renderCompany(business);
      // Hide the companies list pane for a cleaner single-item view
      // This improves design by focusing on the selected company's details
      try{
        const leftPane = document.getElementById('leftPane');
        if(leftPane) leftPane.style.display = 'none';
      }catch(e){ /* noop */ }
      const btnMag = document.getElementById('btnAddMagasin'); if(btnMag) btnMag.disabled = false;
      // show back-to-list button
      const backBtn = document.getElementById('btnBackToList'); if(backBtn){ backBtn.classList.remove('d-none'); }
      // set edit button dataset id
      const editBtn = document.getElementById('btnEditCompany'); if(editBtn) editBtn.dataset.businessId = id;
      const mb = document.getElementById('magasinBusinessId'); if(mb) mb.value = id;
      const magasins = await loadMagasins(id);

      // compute guichets count
      try{
        let totalGuichets = 0;
        if(Array.isArray(magasins)){
          for(const m of magasins){
            const gu = await loadGuichets(m._id);
            if(Array.isArray(gu)) totalGuichets += gu.length;
          }
        }
        const guichetsEl = document.getElementById('guichetsLight'); if(guichetsEl) guichetsEl.textContent = 'Guichets: ' + totalGuichets;
      }catch(e){ console.warn('count guichets', e); }

      // sellers count via affectations (best-effort)
      try{
        const affs = await fetchJson(apiBase + '/api/protected/affectations?entrepriseId=' + id);
        const sellers = new Set((affs||[]).map(a=>a.vendeurId || a.vendeur || a.userId).filter(Boolean));
        const vendEl = document.getElementById('vendeursLight'); if(vendEl) vendEl.textContent = 'Vendeurs: ' + sellers.size;
      }catch(e){ /* ignore */ }

      // try richer rapport
      try{
        const rpt = await fetchJson(apiBase + '/api/protected/affectations/rapport?entrepriseId=' + id);
        if(rpt && rpt.spendings){
          const sp = rpt.spendings;
          const spendEl = document.getElementById('companySpendings');
          const spDelta = document.getElementById('companySpendingsDelta');
          if(spendEl && typeof sp.total !== 'undefined') spendEl.textContent = formatCurrency(sp.total, sp.devise || (document.getElementById('companyDevise') && document.getElementById('companyDevise').textContent) || 'USD');
          if(spDelta && typeof sp.deltaPct !== 'undefined') spDelta.textContent = (sp.deltaPct>0? '+'+sp.deltaPct+'%':' '+sp.deltaPct+'%');
        }
        if(rpt && rpt.assignmentBreakdown){
          const d = rpt.assignmentBreakdown;
          const mapSet = (id, value)=>{ const el = document.getElementById(id); if(el) el.textContent = value; };
          mapSet('assignTopCount', d.top || '—'); mapSet('assignTopDelta', (d.topDelta||'—'));
          mapSet('assignMidCount', d.mid || '—'); mapSet('assignMidDelta', (d.midDelta||'—'));
          mapSet('assignLowCount', d.low || '—'); mapSet('assignLowDelta', (d.lowDelta||'—'));
          mapSet('assignBottomCount', d.bottom || '—'); mapSet('assignBottomDelta', (d.bottomDelta||'—'));
        }
        if(rpt && Array.isArray(rpt.recent) && rpt.recent.length>0){
          const timeline = document.querySelector('.timeline-simple');
          if(timeline){ timeline.innerHTML = ''; for(const item of rpt.recent){ const when = escapeHtml(item.time || item.when || 'now'); const title = escapeHtml(item.title || item.action || 'Activity'); const desc = escapeHtml(item.desc || item.description || ''); const icon = item.icon || 'fas fa-info-circle'; const node = `<div class="timeline-item position-relative"><div class="row g-0 align-items-center"><div class="col-auto d-flex align-items-center"><h6 class="timeline-item-date fs--2 text-500 text-truncate mb-0 me-1">${when}</h6><div class="position-relative"><div class="icon-item icon-item-md rounded-7 shadow-none bg-200"><span class="text-primary ${icon}"></span></div></div></div><div class="col ps-3 fs--1 text-500"><div class="py-x1"><h5 class="fs--1">${title}</h5><p class="mb-0">${desc}</p></div><hr class="text-200 my-0" /></div></div></div>`; timeline.insertAdjacentHTML('beforeend', node); } }
        }
      }catch(e){ console.warn('rapport fetch failed', e); }

      // Update Chart.js sales chart if available using report data
      try{
        if(window.companySalesChartInstance){
          const chart = window.companySalesChartInstance;
          if(rpt && Array.isArray(rpt.sales) && rpt.sales.length){
            const labels = (rpt.salesLabels && Array.isArray(rpt.salesLabels)) ? rpt.salesLabels : rpt.sales.map((_,i)=>'J-'+(rpt.sales.length-1-i));
            chart.data.labels = labels;
            chart.data.datasets[0].data = rpt.sales.slice(-labels.length);
            chart.update();
          } else if(rpt && rpt.spendings && Array.isArray(rpt.spendings.trend)){
            const trend = rpt.spendings.trend.slice(-7);
            chart.data.labels = trend.map((_,i)=>'J-'+(trend.length-1-i));
            chart.data.datasets[0].data = trend;
            chart.update();
          } else {
            // fallback demo
            chart.data.datasets[0].data = [5,12,9,20,16,22,18];
            chart.update();
          }
        }
      }catch(e){ console.warn('chart update failed', e); }

    }catch(err){
      console.error('selectCompany', err);
      alert('Impossible de charger l\'entreprise');
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    // Initialize company overview with spinner/message on load
    initializeCompanyOverview();
    
    const toggleBtn = document.getElementById('btnToggleCompanies'); if(toggleBtn) toggleBtn.addEventListener('click', ()=>{ const left = document.getElementById('leftPane'); left.style.display = left.style.display === 'none' ? 'block' : 'none'; });
    const refreshBtn = document.getElementById('refreshCompanies'); if(refreshBtn) refreshBtn.addEventListener('click', loadCompanies);
    const submitBiz = document.getElementById('submitCreateBusiness'); if(submitBiz) submitBiz.addEventListener('click', submitCreateBusiness);
    const submitMag = document.getElementById('submitCreateMagasin'); if(submitMag) submitMag.addEventListener('click', submitCreateMagasin);
    const submitUpdate = document.getElementById('submitUpdateBusiness'); if(submitUpdate) submitUpdate.addEventListener('click', ()=>{ const id = submitUpdate.dataset.businessId || (document.getElementById('magasinBusinessId') && document.getElementById('magasinBusinessId').value); if(id) submitUpdateBusiness(id); else alert('Aucun ID d\'entreprise spécifié'); });
    // Delegated handlers for Back to list and Edit buttons (survives innerHTML replacements)
    document.addEventListener('click', (ev)=>{
      const back = ev.target.closest && ev.target.closest('#btnBackToList');
      if(back){
        const left = document.getElementById('leftPane');
        if(left) left.style.display = 'block';
        back.classList.add('d-none');
        return;
      }

      const edit = ev.target.closest && ev.target.closest('#btnEditCompany');
      if(edit){
        const id = edit.dataset.businessId || (document.getElementById('magasinBusinessId') && document.getElementById('magasinBusinessId').value);
        if(!id){ showAlert ? showAlert('Aucune entreprise sélectionnée','warning',3000) : alert('Aucune entreprise sélectionnée'); return; }
        const business = window.CURRENT_BUSINESS || null;
        try{
          if(business){
            const n = document.getElementById('edit_nomEntreprise'); if(n) n.value = business.nomEntreprise || business.nom || '';
            const a = document.getElementById('edit_adresse'); if(a) a.value = business.adresse || '';
            const bd = document.getElementById('edit_budget'); if(bd) bd.value = business.budget || 0;
            const dv = document.getElementById('edit_devise'); if(dv) dv.value = business.devise || 'USD';
            const em = document.getElementById('edit_email'); if(em) em.value = business.email || '';
            const preview = document.getElementById('editLogoPreview'); if(preview) preview.src = business.logoUrl || business.photoUrl || 'assets/img/elearning/avatar/student.png';
            const rccm = document.getElementById('edit_rccm'); if(rccm) rccm.value = business.rccm || '';
            const idnat = document.getElementById('edit_idNat'); if(idnat) idnat.value = business.idNat || '';
            const site = document.getElementById('edit_siteWeb'); if(site) site.value = business.siteWeb || '';
            const ic = document.getElementById('edit_icon'); if(ic) ic.value = business.icon || '';
            const forme = document.getElementById('edit_formeJuridique'); if(forme) forme.value = business.formeJuridique || '';
            const cap = document.getElementById('edit_capitalSocial'); if(cap) cap.value = business.capitalSocial || 0;
            const siege = document.getElementById('edit_siegeSocial'); if(siege) siege.value = business.siegeSocial || '';
            const submitUpdateBtn = document.getElementById('submitUpdateBusiness'); if(submitUpdateBtn) submitUpdateBtn.dataset.businessId = id;
          }
        }catch(e){ console.warn('populate edit form', e); }
        const modalEl = document.getElementById('modalEditBusiness'); if(modalEl){ const m = bootstrap.Modal.getOrCreateInstance(modalEl); m.show(); }
        return;
      }
    });
    // Logo preview handlers
    const createLogoInput = document.getElementById('createLogoInput'); if(createLogoInput) createLogoInput.addEventListener('change', (ev)=>{ const f = ev.target.files && ev.target.files[0]; const img = document.getElementById('createLogoPreview'); if(f && img){ img.src = URL.createObjectURL(f); img.style.display = 'block'; } else if(img){ img.style.display = 'none'; } });
    const editLogoInput = document.getElementById('editLogoInput'); if(editLogoInput) editLogoInput.addEventListener('change', (ev)=>{ const f = ev.target.files && ev.target.files[0]; const img = document.getElementById('editLogoPreview'); if(f && img){ img.src = URL.createObjectURL(f); } });
    // Initialize Sortable for magasinsList if available
    try{
      const magasinsEl = document.getElementById('magasinsList');
      if(window.Sortable && magasinsEl){
        new Sortable(magasinsEl, { animation: 150, handle: '.drag-handle' });
      }
    }catch(e){ console.warn('sortable init failed', e); }

    // Initialize a lightweight Chart.js line for companySalesChart
    try{
      const ctx = document.getElementById('companySalesChart');
      if(ctx && window.Chart){
        window.companySalesChartInstance = new Chart(ctx.getContext('2d'), {
          type: 'line',
          data: { labels: ['J-6','J-5','J-4','J-3','J-2','J-1','Aujourd\'hui'], datasets: [{ label: 'Ventes', data: [0,0,0,0,0,0,0], borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.08)', tension: 0.4, fill: true }] },
          options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: true }, y: { display: true } } }
        });
      }
    }catch(e){ console.warn('chart init failed', e); }

    // initial load
    loadCompanies();
  });

})();
