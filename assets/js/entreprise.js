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

  async function loadCompanies(){
    const list = document.getElementById('companiesList');
    const countEl = document.getElementById('companiesCount');
    if(list) list.innerHTML = '<div class="p-3 text-center text-500">Chargement...</div>';
    try{
      console.log('[loadCompanies] apiBase:', apiBase, 'full URL:', apiBase + '/api/business');
      const businesses = await fetchJson(apiBase + '/api/business');
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
        a.innerHTML = `<div><strong>${escapeHtml(b.nomEntreprise || b.nom || 'Sans nom')}</strong><div class="text-500 small">${escapeHtml(b.adresse || '')}</div></div><span class="badge bg-primary">${formatCurrency(b.budget||0,b.devise||'USD')}</span>`;
        a.addEventListener('click', (ev)=>{ ev.preventDefault(); selectCompany(b._id); });
        list.appendChild(a);
      }
      if(countEl) countEl.textContent = String(businesses.length);
      return businesses;
    }catch(err){
      console.error('loadCompanies', err);
      if(list) list.innerHTML = '<div class="p-3 text-center text-danger">Erreur de chargement</div>';
      if(countEl) countEl.textContent = '—';
      return [];
    }
  }

  function renderCompany(b){
    try{
      const nameEl = document.getElementById('companyName');
      if(nameEl) nameEl.textContent = b.nomEntreprise || b.nom || 'Untitled';
      const infoEl = document.getElementById('companyInfo'); if(infoEl) infoEl.textContent = b.description || '';
      const budgetEl = document.getElementById('companyBudget'); if(budgetEl) budgetEl.textContent = formatCurrency(b.budget||0, b.devise || 'USD');
      const devEl = document.getElementById('companyDevise'); if(devEl) devEl.textContent = b.devise || 'USD';
      const emailEl = document.getElementById('companyEmail'); if(emailEl) emailEl.textContent = b.email || '-';
      const telEl = document.getElementById('companyTelephone'); if(telEl) telEl.textContent = b.telephone || '-';
      const spendEl = document.getElementById('companySpendings'); if(spendEl) spendEl.textContent = formatCurrency(b.chiffre_affaires||0, b.devise || 'USD');
      const logo = document.getElementById('companyLogo'); if(logo) logo.src = b.logoUrl || b.photoUrl || 'assets/img/elearning/avatar/student.png';
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
    if(container) container.innerHTML = '<div class="p-3 text-center text-500">Chargement des magasins...</div>';
    try{
      const magasins = await fetchJson(apiBase + '/api/business/magasin/' + businessId);
      if(!Array.isArray(magasins) || magasins.length === 0){ if(container) container.innerHTML = '<div class="p-3 text-center text-500">Aucun magasin</div>'; return []; }
      if(container) container.innerHTML = '';
      for(const m of magasins){
        const div = document.createElement('div');
        div.className = 'p-3 border-bottom';
        div.innerHTML = `<div class="d-flex justify-content-between align-items-start"><div><strong>${escapeHtml(m.nom_magasin)}</strong><div class="small text-500">${escapeHtml(m.adresse||'')}</div></div><div><button class="btn btn-sm btn-link" data-magasin-id="${m._id}">Voir guichets</button></div></div><div class="mt-2" id="guichets-${m._id}"></div>`;
        container.appendChild(div);
        // load guichets for display (does not block)
        loadGuichets(m._id).catch(()=>{});
      }
      return magasins;
    }catch(err){ console.error('loadMagasins', err); if(container) container.innerHTML = '<div class="p-3 text-center text-danger">Erreur</div>'; return []; }
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
      alert('Entreprise créée avec succès!');
      form.reset();
      await loadCompanies();
      if(data.business && data.business._id) selectCompany(data.business._id);
    }catch(err){ 
      console.error('submitCreateBusiness', err); 
      alert('Erreur création entreprise: ' + (err.message||err)); 
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
      alert('Magasin créé avec succès!');
      form.reset();
      if(businessId) loadMagasins(businessId);
    }catch(err){ 
      console.error('submitCreateMagasin', err); 
      alert('Erreur création magasin: ' + (err.message||err)); 
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
        res = await fetch(apiBase + '/api/business/' + businessId, { method: 'PUT', body: fd, headers: { 'Authorization': 'Bearer ' + token } });
      } else {
        const payload = {};
        ['nomEntreprise','adresse','budget','devise','email','description','telephone','status'].forEach(k => { if(formData.get(k)!==null) payload[k] = (k==='budget' || k==='status') ? Number(formData.get(k)) : formData.get(k); });
        res = await fetch(apiBase + '/api/business/' + businessId, { method: 'PUT', body: JSON.stringify(payload), headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } });
      }

      if(!res.ok){ const txt = await res.text(); throw new Error(txt); }
      const data = await res.json();
      alert('Entreprise mise à jour avec succès');
      if(typeof loadCompanies === 'function') loadCompanies();
      if(data.business && data.business._id) selectCompany(data.business._id);
    }catch(err){ console.error('submitUpdateBusiness', err); alert('Erreur mise à jour: ' + (err.message||err)); }
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

    }catch(err){
      console.error('selectCompany', err);
      alert('Impossible de charger l\'entreprise');
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const toggleBtn = document.getElementById('btnToggleCompanies'); if(toggleBtn) toggleBtn.addEventListener('click', ()=>{ const left = document.getElementById('leftPane'); left.style.display = left.style.display === 'none' ? 'block' : 'none'; });
    const refreshBtn = document.getElementById('refreshCompanies'); if(refreshBtn) refreshBtn.addEventListener('click', loadCompanies);
    const submitBiz = document.getElementById('submitCreateBusiness'); if(submitBiz) submitBiz.addEventListener('click', submitCreateBusiness);
    const submitMag = document.getElementById('submitCreateMagasin'); if(submitMag) submitMag.addEventListener('click', submitCreateMagasin);
    const submitUpdate = document.getElementById('submitUpdateBusiness'); if(submitUpdate) submitUpdate.addEventListener('click', ()=>{ const id = submitUpdate.dataset.businessId || (document.getElementById('magasinBusinessId') && document.getElementById('magasinBusinessId').value); if(id) submitUpdateBusiness(id); else alert('Aucun ID d\'entreprise spécifié'); });
    // Back to list button
    const backBtn = document.getElementById('btnBackToList'); if(backBtn) backBtn.addEventListener('click', ()=>{ const left = document.getElementById('leftPane'); if(left) left.style.display = 'block'; backBtn.classList.add('d-none'); });
    // Edit company button opens modal and populates form
    const editBtn = document.getElementById('btnEditCompany'); if(editBtn) editBtn.addEventListener('click', ()=>{
      const id = editBtn.dataset.businessId || (document.getElementById('magasinBusinessId') && document.getElementById('magasinBusinessId').value);
      if(!id){ alert('Aucune entreprise sélectionnée'); return; }
      const business = window.CURRENT_BUSINESS || null;
      // populate edit form
      try{
        if(business){
          document.getElementById('edit_nomEntreprise').value = business.nomEntreprise || business.nom || '';
          document.getElementById('edit_adresse').value = business.adresse || '';
          document.getElementById('edit_budget').value = business.budget || 0;
          document.getElementById('edit_devise').value = business.devise || 'USD';
          document.getElementById('edit_email').value = business.email || '';
          const preview = document.getElementById('editLogoPreview'); if(preview) preview.src = business.logoUrl || business.photoUrl || 'assets/img/elearning/avatar/student.png';
          const submitUpdateBtn = document.getElementById('submitUpdateBusiness'); if(submitUpdateBtn) submitUpdateBtn.dataset.businessId = id;
        }
      }catch(e){ console.warn('populate edit form', e); }
      const modalEl = document.getElementById('modalEditBusiness'); if(modalEl){ const m = bootstrap.Modal.getOrCreateInstance(modalEl); m.show(); }
    });
    // Logo preview handlers
    const createLogoInput = document.getElementById('createLogoInput'); if(createLogoInput) createLogoInput.addEventListener('change', (ev)=>{ const f = ev.target.files && ev.target.files[0]; const img = document.getElementById('createLogoPreview'); if(f && img){ img.src = URL.createObjectURL(f); img.style.display = 'block'; } else if(img){ img.style.display = 'none'; } });
    const editLogoInput = document.getElementById('editLogoInput'); if(editLogoInput) editLogoInput.addEventListener('change', (ev)=>{ const f = ev.target.files && ev.target.files[0]; const img = document.getElementById('editLogoPreview'); if(f && img){ img.src = URL.createObjectURL(f); } });
    // initial load
    loadCompanies();
  });

})();
