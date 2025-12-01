(function(){
  // Minimal client-side manager for entreprise.php
  // - Loads companies list
  // - Selects company and renders details
  // - Creates company and magasin via AJAX

  const apiBase = '/api';

  function getToken(){
    return localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt') || localStorage.getItem('accessToken') || localStorage.getItem('userToken') || null;
  }

  function authHeaders(){
    const token = getToken();
    return token ? { 'Authorization': 'Bearer ' + token } : {};
  }

  async function fetchJson(url, opts={}){
    opts.headers = Object.assign({}, opts.headers || {}, { 'Accept': 'application/json' }, authHeaders());
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
      const businesses = await fetchJson(apiBase + '/business');
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
      const magasins = await fetchJson(apiBase + '/business/magasin/' + businessId);
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
      const guichets = await fetchJson(apiBase + '/business/guichet/' + magasinId);
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
    const fd = new FormData(form);
    try{
      const btn = document.getElementById('submitCreateBusiness');
      if(btn) btn.disabled = true;
      const res = await fetch(apiBase + '/business', { method: 'POST', body: fd, headers: authHeaders() });
      if(!res.ok){ const txt = await res.text(); throw new Error(txt); }
      const data = await res.json();
      const modal = (typeof bootstrap !== 'undefined') ? bootstrap.Modal.getInstance(document.getElementById('modalCreateBusiness')) : null;
      if(modal) modal.hide();
      await loadCompanies();
      if(data.business && data.business._id) selectCompany(data.business._id);
    }catch(err){ console.error('submitCreateBusiness', err); alert('Erreur création entreprise: ' + (err.message||err)); }finally{ const btn = document.getElementById('submitCreateBusiness'); if(btn) btn.disabled = false; }
  }

  async function submitCreateMagasin(){
    const form = document.getElementById('formCreateMagasin');
    const fd = new FormData(form);
    try{
      const btn = document.getElementById('submitCreateMagasin');
      if(btn) btn.disabled = true;
      const res = await fetch(apiBase + '/business/magasin', { method: 'POST', body: fd, headers: authHeaders() });
      if(!res.ok){ const txt = await res.text(); throw new Error(txt); }
      const data = await res.json();
      const modal = (typeof bootstrap !== 'undefined') ? bootstrap.Modal.getInstance(document.getElementById('modalCreateMagasin')) : null;
      if(modal) modal.hide();
      if(fd.get('businessId')) loadMagasins(fd.get('businessId'));
    }catch(err){ console.error('submitCreateMagasin', err); alert('Erreur création magasin: ' + (err.message||err)); }finally{ const btn = document.getElementById('submitCreateMagasin'); if(btn) btn.disabled = false; }
  }

  async function selectCompany(id){
    if(!id) return;
    try{
      const business = await fetchJson(apiBase + '/business/' + id);
      renderCompany(business);
      const btnMag = document.getElementById('btnAddMagasin'); if(btnMag) btnMag.disabled = false;
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
        const affs = await fetchJson(apiBase + '/protected/affectations?entrepriseId=' + id);
        const sellers = new Set((affs||[]).map(a=>a.vendeurId || a.vendeur || a.userId).filter(Boolean));
        const vendEl = document.getElementById('vendeursLight'); if(vendEl) vendEl.textContent = 'Vendeurs: ' + sellers.size;
      }catch(e){ /* ignore */ }

      // try richer rapport
      try{
        const rpt = await fetchJson(apiBase + '/protected/affectations/rapport?entrepriseId=' + id);
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
    // initial load
    loadCompanies();
  });

})();
