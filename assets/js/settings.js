/* settings.js
   Frontend interactions for setting.php
   - Loads members via AJAX
   - Adds/edits members without page reload
   - Assign vendors to managers
   - Toggles permissions
   - Uses backend at https://backend-gestion-de-stock.onrender.com/
*/

(function($){
  'use strict';

  // sanity logs to verify script and jQuery load
  try{
    if(typeof window !== 'undefined' && window.console){
      console.log('[settings.js] loaded');
      if(typeof jQuery === 'undefined') console.log('[settings.js] jQuery: MISSING');
      else console.log('[settings.js] jQuery version', jQuery && jQuery.fn && jQuery.fn.jquery);
    }
  }catch(e){}

  const API_BASE = 'https://backend-gestion-de-stock.onrender.com';

  // show small badge indicating active API base
  function showApiBadge(){
    try{
      $('#apiBaseBadge').remove();
      const $badge = $(`<div id="apiBaseBadge" class="position-fixed top-0 start-50 translate-middle-x mt-3" style="z-index:1200">
        <span class="badge bg-info text-dark">API: ${API_BASE}</span>
      </div>`);
      $('body').append($badge);
    }catch(e){ /* noop */ }
  }

  showApiBadge();

  // Load current user from token (if any)
  function loadCurrentUserFromToken(){
    const token = getToken();
    CURRENT_USER = token ? decodeJwt(token) : null;
    return CURRENT_USER;
  }

  // Fetch full user profile from API (preferred) and populate UI
  async function fetchCurrentUserFromAPI(){
    // Always fetch from API if token exists (to get fresh photoUrl from Cloudinary)
    const token = getToken();
    if(!token){
      // No token — try localStorage as fallback
      try{
        const stored = localStorage.getItem('user');
        if(stored){
          const u = JSON.parse(stored);
          CURRENT_USER = u;
          populateUserUI(u);
          return u;
        }
      }catch(e){ /* ignore */ }
      return null;
    }

    // Have token — decode to get id and fetch fresh profile from API
    const payload = decodeJwt(token);
    const id = payload?.id || payload?._id || payload?.userId || payload?.sub;
    if(!id) return null;

    try{
      const res = await fetch(API_BASE + '/api/protected/profile/' + id, { headers: Object.assign({'Content-Type':'application/json'}, authHeaders()) });
      if(!res.ok) return null;
      const data = await res.json();
      CURRENT_USER = data;
      try{ localStorage.setItem('user', JSON.stringify(data)); }catch(e){}
      console.log('[fetchCurrentUserFromAPI] fetched user from API, photoUrl:', data.photoUrl);
      populateUserUI(data);
      return data;
    }catch(err){
      console.error('fetchCurrentUserFromAPI error', err);
      return null;
    }
  }

  function populateUserUI(user){
    try{
      // fill small header
      $('#currentUserName').text(user.nom || user.name || user.email || 'Utilisateur');
      $('#currentUserRole').text(user.role ? (user.role.charAt(0).toUpperCase()+user.role.slice(1)) : '');

      // fill profile form fields (support both separate prenom/nom or legacy full-name in user.nom)
      if(user.prenom && user.nom){
        $('#prenom').val(user.prenom);
        $('#nom').val(user.nom);
      } else if(user.prenom){
        $('#prenom').val(user.prenom);
        $('#nom').val(user.nom || '');
      } else if(user.nom){
        const parts = user.nom.split(' ').filter(p=>p.trim());
        if(parts.length > 1){
          $('#prenom').val(parts[0]);
          $('#nom').val(parts.slice(1).join(' '));
        } else {
          // single token in user.nom — prefer showing it as last name to satisfy UI expectations
          $('#prenom').val('');
          $('#nom').val(user.nom);
        }
      }
       if(user.email) $('#email').val(user.email);
       if(user.telephone) $('#telephone').val(user.telephone);

       // set header avatar to user's photo if available (fallback to user_prof.svg)
       try{
         const topImg = user.photoUrl || 'assets/img/team/user_prof.svg';
         console.log('[populateUserUI] user object:', user);
         console.log('[populateUserUI] user.photoUrl:', user.photoUrl);
         console.log('[populateUserUI] setting #topProfileImage.src to:', topImg);
         $('#topProfileImage').attr('src', topImg);
         console.log('[populateUserUI] #topProfileImage.src after update:', $('#topProfileImage').attr('src'));
       }catch(e){ console.error('[populateUserUI] error setting image:', e); }

       // permissions UI handled by loadAccountSettings
    }catch(e){ console.warn('populateUserUI', e); }
  }

  // Load account settings for current user and populate the checkboxes
  async function loadAccountSettings(){
    const user = loadCurrentUserFromToken();
    if(!user){
      // hide/disable inputs
      $('#accountSettingsSave').prop('disabled', true);
      return;
    }
    try{
      const res = await fetch(API_BASE + '/api/protected/profile/' + user.id, { headers: Object.assign({'Content-Type':'application/json'}, authHeaders()) });
      if(!res.ok) return;
      const data = await res.json();
      // populate
      $('#permPassword').prop('checked', !!data.canEditPasswords);
      $('#permPhoto').prop('checked', !!data.canEditPhoto);
      $('#permCanAssignVendors').prop('checked', !!data.canAssignVendors);
      $('#permCanAssignManagers').prop('checked', !!data.canAssignManagers);
      $('#permCanDeleteMembers').prop('checked', !!data.canDeleteMembers);
      $('#permCanEditProfileFields').prop('checked', !!data.canEditProfileFields);

      // If current user is not admin, disable permission toggles
      const role = data.role || user.role;
      const isAdmin = role === 'admin';
      $('#accountSettingsSave').prop('disabled', !isAdmin);
      $('#accountSettings .form-check-input').each(function(){
        // allow basic toggles (like canEditPhoto) but we keep them disabled for non-admin to avoid confusion
        $(this).prop('disabled', !isAdmin);
      });
    }catch(err){
      console.error('loadAccountSettings error', err);
    }
  }

  // decode JWT payload (no validation) to read role/id/nom
  function decodeJwt(token){
    try{
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g,'+').replace(/_/g,'/'));
      return JSON.parse(decodeURIComponent(escape(decoded)));
    }catch(e){
      return null;
    }
  }
  let CURRENT_USER = null;

  // token detection: try common keys
  function getToken(){
    const keys = ['token','authToken','jwt','accessToken','userToken'];
    for(const k of keys){
      const v = localStorage.getItem(k);
      if(v) return v;
    }
    return null;
  }

  function authHeaders(){
    const t = getToken();
    return t ? { 'Authorization': 'Bearer ' + t } : {};
  }

  function showToast(message, type='info'){
    const $toast = $(`<div class="alert alert-${type} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`);
    $('#toastContainer').append($toast);
    setTimeout(()=>{$toast.alert('close');}, 5000);
  }

  // Overlay spinner for beforeLoad
  function showOverlay(msg='Chargement...'){
    if($('#pageOverlay').length) return;
    const $ov = $(`<div id="pageOverlay" style="position:fixed;inset:0;background:rgba(255,255,255,0.7);z-index:2000;display:flex;align-items:center;justify-content:center;">`+
      `<div class="text-center"><div class="spinner-border text-primary" role="status"></div><div class="mt-2">${msg}</div></div></div>`);
    $('body').append($ov);
  }
  function hideOverlay(){ $('#pageOverlay').remove(); }

  function spinnerHtml(){
    return `<div class="d-flex justify-content-center align-items-center p-4" id="membersSpinner"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;
  }

  function memberCard(member){
    const img = member.photoUrl || 'assets/img/team/user_prof.svg';
    return `
      <div class="col-6 col-md-4 col-lg-3 col-xxl-2 mb-1 member-card" data-id="${member._id}">
        <div class="bg-white dark__bg-1100 p-3 h-100 cursor-pointer card-member" style="cursor:pointer;">
          <img class="img-thumbnail img-fluid rounded-circle mb-3 shadow-sm" src="${img}" alt="" width="100" />
          <h6 class="mb-1"><a href="#" class="member-name">${member.nom || member.name || 'Utilisateur'}</a></h6>
          <p class="fs--2 mb-1"><a class="text-700 member-role" href="#">${member.role || ''}</a></p>
        </div>
      </div>
    `;
  }

  async function loadMembers(){
    const $list = $('#memberList');
    $list.html(spinnerHtml());
    try{
      const res = await fetch(API_BASE + '/api/protected/members', { headers: Object.assign({'Content-Type':'application/json'}, authHeaders()) });
      if(res.status === 401 || res.status === 403){
        $list.html('<div class="p-3">Accès non autorisé. Connectez-vous.</div>');
        return;
      }
      const data = await res.json();
      if(!Array.isArray(data)){
        $list.html('<div class="p-3">Aucun membre trouvé</div>');
        return;
      }
      const html = data.map(memberCard).join('\n');
      $list.html(`<div class="row g-0 text-center fs--1">${html}</div>`);
      $('#memberCount').text(data.length);
      // wire role-based UI
      const token = getToken();
      CURRENT_USER = token ? decodeJwt(token) : null;
      const role = CURRENT_USER?.role;
      if(role !== 'admin'){
        $('#addMemberBtn').hide();
        $('#dangerZoneCard').hide();
      } else {
        $('#addMemberBtn').show();
        $('#dangerZoneCard').show();
      }
    }catch(err){
      console.error('loadMembers error', err);
      $list.html('<div class="p-3">Erreur de chargement</div>');
    }
  }

  // Add member
  async function submitAddMember(form){
    // support both new split fields and legacy single full-name field
    const prenomField = $('#memberPrenom');
    const nomField = $('#memberNom');
    let prenom = '';
    let nom = '';
    if(prenomField.length && nomField.length){
      prenom = prenomField.val();
      nom = nomField.val();
    } else {
      // fallback to legacy single field
      const full = $('#memberName').val() || '';
      const parts = full.split(' ').filter(p=>p.trim());
      if(parts.length > 1){ prenom = parts[0]; nom = parts.slice(1).join(' '); }
      else { prenom = ''; nom = full; }
    }
    const email = $('#memberEmail').val();
    const role = $('#memberRole').val();
    const telephone = $('#memberTelephone').val();
    const password = $('#memberPassword').val();
    const passwordConfirm = $('#memberPasswordConfirm').val();
    const photoInput = document.getElementById('memberPhoto');

    if(!nom || !email || !role || !password || !passwordConfirm) return showToast('Remplissez tous les champs requis','warning');
    if(password !== passwordConfirm) return showToast('Les mots de passe ne correspondent pas','warning');

    try{
      let res, json;
      // If a photo file was selected, send multipart/form-data
      if(photoInput && photoInput.files && photoInput.files.length){
        const fd = new FormData();
        if(prenom) fd.append('prenom', prenom);
        fd.append('nom', nom);
        fd.append('email', email);
        fd.append('role', role);
        if(telephone) fd.append('telephone', telephone);
        fd.append('password', password);
        fd.append('passwordConfirm', passwordConfirm);
        fd.append('photo', photoInput.files[0]);

        const headers = authHeaders(); // do not set Content-Type, browser will set it
        res = await fetch(API_BASE + '/api/auth/register', {
          method: 'POST',
          headers: headers,
          body: fd
        });
        try{ json = await res.json(); }catch(e){ json = {}; }
      } else {
        // fallback to JSON
        const payload = { prenom, nom, email, role, telephone, password, passwordConfirm };
        res = await fetch(API_BASE + '/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type':'application/json', ...authHeaders() },
          body: JSON.stringify(payload)
        });
        json = await res.json();
      }

      if(res.status === 201 || res.ok){
        $('#addMemberModal').modal('hide');
        showToast('Membre ajouté','success');
        // clear form
        $('#addMemberForm')[0].reset();
        loadMembers();
      } else {
        console.error('add member failed', json);
        showToast(json.message || 'Erreur ajout membre','danger');
      }
    }catch(err){
      console.error(err);
      showToast('Erreur réseau','danger');
    }
  }

  // Open member modal (view/edit)
  async function openMemberModal(id){
    $('#memberModalBody').html(spinnerHtml());
    $('#memberModal').modal('show');
    try{
      const res = await fetch(API_BASE + '/api/protected/profile/' + id, { headers: Object.assign({'Content-Type':'application/json'}, authHeaders()) });
      if(!res.ok){
        $('#memberModalBody').html('<div class="p-3">Erreur lors de la récupération du profil</div>');
        return;
      }
      const user = await res.json();

      // fetch potential managers and unassigned vendors
      let managers = [], unassignedVendors = [], assignedVendors = [];
      try{
        const all = await fetch(API_BASE + '/api/protected/members', { headers: Object.assign({'Content-Type':'application/json'}, authHeaders()) });
        const list = await all.json();
        managers = Array.isArray(list) ? list.filter(u => ['superviseur','admin'].includes(u.role)) : [];
        unassignedVendors = Array.isArray(list) ? list.filter(u => u.role==='vendeur' && !u.assignedTo) : [];
        assignedVendors = Array.isArray(list) ? list.filter(u => u.role==='vendeur' && u.assignedTo && u.assignedTo.toString()===user._id) : [];
      }catch(e){ managers = []; unassignedVendors = []; assignedVendors = []; }

      // build modal content
      const img = user.photoUrl || 'assets/img/team/2.jpg';
      const avatarHtml = `
        <div class="text-center pt-2 pb-2">
          <div style="position:relative;display:inline-block;">
            <img id="profileImagePreview" src="${img}" class="rounded-circle mb-2" style="width:140px;height:140px;object-fit:cover;border:1px solid rgba(0,0,0,0.08);" alt="Photo Profil" />
            <button type="button" id="profile-image-overlay-modal" class="btn btn-sm btn-secondary" style="position:absolute;right:0;bottom:0;border-radius:50%;padding:6px 8px;"> <i class="fas fa-camera"></i> </button>
          </div>
          <input id="profile-image-modal" type="file" accept="image/*" style="display:none" />
        </div>`;

      const infoHtml = `
        <div class="row mb-3">
          <div class="col-md-6 mb-2">
            <label class="form-label">Prénom</label>
            <input class="form-control" id="editMemberPrenom" value="${user.prenom || ''}" />
          </div>
          <div class="col-md-6 mb-2">
            <label class="form-label">Nom</label>
            <input class="form-control" id="editMemberNom" value="${user.nom || ''}" />
          </div>
          <div class="col-md-6 mb-2">
            <label class="form-label">Email</label>
            <input class="form-control" id="editMemberEmail" value="${user.email || ''}" />
          </div>
          <div class="col-md-6 mb-2">
            <label class="form-label">Téléphone</label>
            <input class="form-control" id="editMemberTel" value="${user.telephone || ''}" />
          </div>
          <div class="col-md-6 mb-2">
            <label class="form-label">Rôle</label>
            <select class="form-select" id="editMemberRole">
              <option value="admin" ${user.role==='admin'?'selected':''}>Admin</option>
              <option value="superviseur" ${user.role==='superviseur'?'selected':''}>Superviseur</option>
              <option value="vendeur" ${user.role==='vendeur'?'selected':''}>Vendeur</option>
            </select>
          </div>
        </div>`;

      // Section mot de passe (sans bouton)
      const passwordHtml = `
        <div class="row mb-3">
          <div class="col-md-6 mb-2">
            <label class="form-label" for="new-member-password">Nouveau mot de passe</label>
            <input class="form-control" id="new-member-password" type="password" />
          </div>
          <div class="col-md-6 mb-2">
            <label class="form-label" for="confirm-member-password">Confirmer mot de passe</label>
            <input class="form-control" id="confirm-member-password" type="password" />
          </div>
        </div>`;

      // Section assigner vendeurs (si superviseur)
      let assignVendorsHtml = '';
      if(user.role === 'superviseur'){
        assignVendorsHtml = `<div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Assigner des vendeurs</h6>
            <button type="button" id="showAssignVendorsBtn" class="btn btn-outline-primary btn-sm">Assigner rôle</button>
          </div>
          <div class="card-body bg-light">
            <div id="assignVendorsSection" style="display:none;">
              <h6 class="mb-2">Vendeurs disponibles</h6>
              <div class="table-responsive"><table class="table table-sm"><thead><tr><th>Nom</th><th>Email</th><th>Action</th></tr></thead><tbody>`;
        unassignedVendors.forEach(v => {
          assignVendorsHtml += `<tr><td>${v.nom || ''}</td><td>${v.email || ''}</td><td><button type="button" class="btn btn-success btn-sm assignVendorBtn" data-vendorid="${v._id}">Assigner</button></td></tr>`;
        });
        assignVendorsHtml += `</tbody></table></div>
            </div>
            <h6 class="mt-3">Vendeurs assignés</h6>
            <div class="table-responsive"><table class="table table-sm"><thead><tr><th>Nom</th><th>Email</th><th>Action</th></tr></thead><tbody>`;
        assignedVendors.forEach(v => {
          assignVendorsHtml += `<tr><td>${v.nom || ''}</td><td>${v.email || ''}</td><td><button type="button" class="btn btn-danger btn-sm unassignVendorBtn" data-vendorid="${v._id}">Désassigner</button></td></tr>`;
        });
        assignVendorsHtml += `</tbody></table></div>
          </div>
        </div>`;
      }

      // Section assigner vendeur (si admin et vendeur)
      let assignHtml = '';
      const currentRole = CURRENT_USER?.role;
      if(currentRole === 'admin' && user.role === 'vendeur'){
        assignHtml = `<div class="card mb-3">
          <div class="card-header"><h6 class="mb-0">Assigner ce vendeur à un gestionnaire</h6></div>
          <div class="card-body bg-light">
            <select class="form-select mb-2" id="assignManagerSelect"><option value="">--Choisir gestionnaire--</option>`;
        managers.forEach(m => assignHtml += `<option value="${m._id}" ${user.assignedTo && user.assignedTo.toString()===m._id?'selected':''}>${m.nom || m.email || m._id}</option>`);
        assignHtml += `</select>
            <button id="assignVendeurBtn" class="btn btn-outline-primary" type="button">Assigner</button>
          </div>
        </div>`;
      }

      // Permissions toggles (admin only)
      let permsHtml = '';
      if(currentRole === 'admin'){
        permsHtml = `<div class="card mb-3">
          <div class="card-header"><h6 class="mb-0">Permissions</h6></div>
          <div class="card-body bg-light">
            <div class="form-check form-switch mb-2"><input class="form-check-input" type="checkbox" id="modal_perm_edit_passwords" ${user.canEditPasswords ? 'checked' : ''} /><label class="form-check-label" for="modal_perm_edit_passwords">Peut modifier mot de passe</label></div>
            <div class="form-check form-switch mb-2"><input class="form-check-input" type="checkbox" id="modal_perm_assign_vendors" ${user.canAssignVendors ? 'checked' : ''} /><label class="form-check-label" for="modal_perm_assign_vendors">Peut assigner vendeurs</label></div>
            <div class="form-check form-switch mb-2"><input class="form-check-input" type="checkbox" id="modal_perm_assign_managers" ${user.canAssignManagers ? 'checked' : ''} /><label class="form-check-label" for="modal_perm_assign_managers">Peut assigner gestionnaires</label></div>
            <div class="form-check form-switch mb-2"><input class="form-check-input" type="checkbox" id="modal_perm_delete_members" ${user.canDeleteMembers ? 'checked' : ''} /><label class="form-check-label" for="modal_perm_delete_members">Peut supprimer des membres</label></div>
            <div class="form-check form-switch mb-2"><input class="form-check-input" type="checkbox" id="modal_perm_edit_profile_fields" ${user.canEditProfileFields ? 'checked' : ''} /><label class="form-check-label" for="modal_perm_edit_profile_fields">Peut modifier tous les champs du profil</label></div>
          </div>
        </div>`;
      }

      // Build modal as 3 rows:
      // Row 1: avatar (left) + info (right)
      // Row 2: password fields
      // Row 3: permissions + assign sections
      const modalBodyHtml = `
        <form id="editMemberForm" data-original-role="${user.role || ''}" data-original-canedit="${user.canEditPasswords?1:0}">
          <input type="hidden" id="editMemberId" value="${user._id}" />
          <div class="row align-items-start">
            <div class="col-md-3">
              ${avatarHtml}
            </div>
            <div class="col-md-9">
              ${infoHtml}
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              ${passwordHtml}
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              ${permsHtml}
              ${assignHtml}
              ${assignVendorsHtml}
            </div>
          </div>

          <div class="d-flex justify-content-end mt-4">
            <button type="button" id="deactivateMemberBtn" class="btn btn-danger me-auto">Désactiver le compte</button>
            <button class="btn btn-primary" type="submit">Enregistrer</button>
            <button class="btn btn-secondary ms-2" type="button" data-bs-dismiss="modal">Fermer</button>
          </div>
        </form>`;

      // Insert assembled modal
      $('#memberModalBody').html(`<div class="container-fluid">${modalBodyHtml}</div>`);

      // add password-eye toggles for modal password fields (if present)
      setTimeout(()=>{
        if($('#new-member-password').length && $('#new-member-password').next('.toggle-password').length===0){
          $('<button type="button" class="btn btn-outline-secondary toggle-password" data-target="new-member-password"><i class="fas fa-eye"></i></button>').insertAfter($('#new-member-password'));
        }
        if($('#confirm-member-password').length && $('#confirm-member-password').next('.toggle-password').length===0){
          $('<button type="button" class="btn btn-outline-secondary toggle-password" data-target="confirm-member-password"><i class="fas fa-eye"></i></button>').insertAfter($('#confirm-member-password'));
        }
      },50);

      // small helpers: overlay click -> open modal file input, preview selected image
      $(document).off('click', '#profile-image-overlay-modal').on('click', '#profile-image-overlay-modal', function(){
        $('#profile-image-modal').trigger('click');
      });
      $(document).off('change', '#profile-image-modal').on('change', '#profile-image-modal', function(e){
        const f = this.files && this.files[0];
        if(!f) return;
        // preview
        const reader = new FileReader();
        reader.onload = function(ev){
          $('#profileImagePreview').attr('src', ev.target.result);
        };
        reader.readAsDataURL(f);
      });

      // assign vendors logic (superviseur)
      $(document).off('click', '#showAssignVendorsBtn').on('click', '#showAssignVendorsBtn', function(){
        $('#assignVendorsSection').toggle();
      });
      $(document).off('click', '.assignVendorBtn').on('click', '.assignVendorBtn', function(){
        const vendorId = $(this).data('vendorid');
        showOverlay('Assignation en cours...');
        fetch(API_BASE + '/api/protected/assign-vendeur', {
          method: 'PUT',
          headers: Object.assign({'Content-Type':'application/json'}, authHeaders()),
          body: JSON.stringify({ vendeurId: vendorId, gestionnaireId: user._id })
        }).then(r => r.json()).then(json => {
          showToast('Vendeur assigné','success');
          openMemberModal(user._id);
        }).catch(()=>showToast('Erreur réseau','danger')).finally(hideOverlay);
      });
      $(document).off('click', '.unassignVendorBtn').on('click', '.unassignVendorBtn', function(){
        const vendorId = $(this).data('vendorid');
        showOverlay('Désassignation en cours...');
        fetch(API_BASE + '/api/protected/assign-vendeur', {
          method: 'PUT',
          headers: Object.assign({'Content-Type':'application/json'}, authHeaders()),
          body: JSON.stringify({ vendeurId: vendorId, gestionnaireId: null })
        }).then(r => r.json()).then(json => {
          showToast('Vendeur désassigné','success');
          openMemberModal(user._id);
        }).catch(()=>showToast('Erreur réseau','danger')).finally(hideOverlay);
      });

      // attach assign button handler (admin -> vendeur)
      $(document).off('click', '#assignVendeurBtn').on('click', '#assignVendeurBtn', function(){
        const vendeurId = user._id;
        const gestionnaireId = $('#assignManagerSelect').val();
        if(!gestionnaireId) return showToast('Choisissez un gestionnaire','warning');
        showOverlay('Assignation en cours...');
        assignVendeur(vendeurId, gestionnaireId).finally(()=>hideOverlay());
      });

      // attach change password handler
      $(document).off('submit', '#changeMemberPasswordForm').on('submit', '#changeMemberPasswordForm', async function(e){
        e.preventDefault();
        const newPass = $('#new-member-password').val();
        const confirmPass = $('#confirm-member-password').val();
        if(!newPass || !confirmPass) return showToast('Remplissez les deux champs','warning');
        if(newPass !== confirmPass) return showToast('Les mots de passe ne correspondent pas','warning');
        showOverlay('Modification du mot de passe...');
        try{
          const res = await fetch(API_BASE + '/api/protected/profile/' + user._id, {
            method: 'PUT',
            headers: Object.assign({'Content-Type':'application/json'}, authHeaders()),
            body: JSON.stringify({ password: newPass })
          });
          const json = await res.json();
          if(res.ok){
            showToast('Mot de passe modifié','success');
            $('#new-member-password').val('');
            $('#confirm-member-password').val('');
          }else{
            showToast(json.message || 'Erreur modification','danger');
          }
        }catch(err){
          showToast('Erreur réseau','danger');
        }finally{ hideOverlay(); }
      });

      // TODO: handle avatar upload (profile-image input)

    }catch(err){
      console.error('openMemberModal error', err);
      $('#memberModalBody').html('<div class="p-3">Erreur réseau</div>');
    }
  }

  // Submit edits from editMemberForm (single Save)
  async function submitEditMember(e){
    if(e && e.preventDefault) e.preventDefault();
    const id = $('#editMemberId').val();
    if(!id) return showToast('Identifiant manquant','danger');
    const prenom = $('#editMemberPrenom').val();
    const nom = $('#editMemberNom').val();
    const email = $('#editMemberEmail').val();
    const telephone = $('#editMemberTel').val();
    const role = $('#editMemberRole').val();
    const newPass = $('#new-member-password').val();
    const confirmPass = $('#confirm-member-password').val();
    if((newPass || confirmPass) && newPass !== confirmPass) return showToast('Les mots de passe ne correspondent pas','warning');
    const cur = loadCurrentUserFromToken() || CURRENT_USER; const isAdmin = cur && cur.role === 'admin';
    const payload = { prenom, nom, email, telephone, role };
    if(newPass) payload.password = newPass;
    if(isAdmin){
      // read modal-scoped permission checkboxes (to avoid collisions with page-level controls)
      payload.canEditPasswords = $('#modal_perm_edit_passwords').is(':checked');
      payload.canAssignVendors = $('#modal_perm_assign_vendors').is(':checked');
      payload.canAssignManagers = $('#modal_perm_assign_managers').is(':checked');
      payload.canDeleteMembers = $('#modal_perm_delete_members').is(':checked');
      payload.canEditProfileFields = $('#modal_perm_edit_profile_fields').is(':checked');
    }

    showOverlay('Enregistrement des modifications...');
    try{
      // prefer modal-scoped file input when editing from modal
      const photoInput = document.getElementById('profile-image-modal') || document.getElementById('profile-image'); let res, json;
      if(photoInput && photoInput.files && photoInput.files.length){
        const fd = new FormData();
        if(payload.prenom) fd.append('prenom', payload.prenom);
        fd.append('nom', payload.nom || '');
        fd.append('email', payload.email || '');
        if(payload.telephone) fd.append('telephone', payload.telephone);
        if(payload.role) fd.append('role', payload.role);
        if(payload.password) fd.append('password', payload.password);
        if(isAdmin){ fd.append('canEditPasswords', payload.canEditPasswords ? '1' : '0'); fd.append('canAssignVendors', payload.canAssignVendors ? '1' : '0'); fd.append('canAssignManagers', payload.canAssignManagers ? '1' : '0'); fd.append('canDeleteMembers', payload.canDeleteMembers ? '1' : '0'); fd.append('canEditProfileFields', payload.canEditProfileFields ? '1' : '0'); }
        fd.append('photo', photoInput.files[0]);
        // ensure we don't set a fixed Content-Type header when sending FormData
        const headersObj = Object.assign({}, authHeaders()); if(headersObj['Content-Type']) delete headersObj['Content-Type'];
        res = await fetch(API_BASE + '/api/protected/profile/' + id, { method: 'PUT', headers: headersObj, body: fd });
        try{ json = await res.json(); }catch(e){ json = {}; }
      } else {
        res = await fetch(API_BASE + '/api/protected/profile/' + id, { method: 'PUT', headers: Object.assign({'Content-Type':'application/json'}, authHeaders()), body: JSON.stringify(payload) });
        json = await res.json();
      }
      if(res.ok){ showToast('Modifications enregistrées','success'); openMemberModal(id); loadMembers(); fetchCurrentUserFromAPI().then(()=> loadAccountSettings()); }
      else { showToast(json.message || 'Erreur lors de la sauvegarde','danger'); }
    }catch(err){ console.error('submitEditMember error', err); showToast('Erreur réseau','danger'); }
    finally{ hideOverlay(); }
  }

  async function loadMembers(){
    const $list = $('#memberList');
    $list.html(spinnerHtml());
    try{
      const res = await fetch(API_BASE + '/api/protected/members', { headers: Object.assign({'Content-Type':'application/json'}, authHeaders()) });
      if(res.status === 401 || res.status === 403){
        $list.html('<div class="p-3">Accès non autorisé. Connectez-vous.</div>');
        return;
      }
      const data = await res.json();
      if(!Array.isArray(data)){
        $list.html('<div class="p-3">Aucun membre trouvé</div>');
        return;
      }
      // Si superviseur connecté, n'afficher que les vendeurs qui lui sont assignés
      const token = getToken();
      CURRENT_USER = token ? decodeJwt(token) : null;
      const role = CURRENT_USER?.role;
      let filtered = data;
      if(role === 'superviseur'){
        filtered = data.filter(u => u.role==='vendeur' && u.assignedTo && u.assignedTo.toString()===CURRENT_USER.id);
      }
      const html = filtered.map(memberCard).join('\n');
      $list.html(`<div class="row g-0 text-center fs--1">${html}</div>`);
      $('#memberCount').text(filtered.length);
      if(role !== 'admin'){
        $('#addMemberBtn').hide();
        $('#dangerZoneCard').hide();
      } else {
        $('#addMemberBtn').show();
        $('#dangerZoneCard').show();
      }
    }catch(err){
      console.error('loadMembers error', err);
      $list.html('<div class="p-3">Erreur de chargement</div>');
    }
  }
// ...existing code...
// Correction : la fonction submitEditMember doit être fermée correctement ici
// ...existing code...

  // Assign vendeur to gestionnaire
  async function assignVendeur(vendeurId, gestionnaireId){
    try{
      const res = await fetch(API_BASE + '/api/protected/assign-vendeur', {
        method: 'PUT',
        headers: Object.assign({'Content-Type':'application/json'}, authHeaders()),
        body: JSON.stringify({ vendeurId, gestionnaireId })
      });
      const json = await res.json();
      if(res.ok) {
        showToast('Assignation réussie','success');
        loadMembers();
      } else showToast(json.message || 'Erreur assignation','danger');
    }catch(err){
      console.error(err);
      showToast('Erreur réseau','danger');
    }
  }

  // Init listeners
  function init(){
    // load members on page ready
    loadMembers();
    // load account settings
    // ensure we have full user info from API, then load settings
    loadCurrentUserFromToken();
    fetchCurrentUserFromAPI().then(()=> loadAccountSettings());

    // Ensure Add Member modal has a photo upload UI (preview + hidden file input)
    if($('#addMemberForm').length){
      if($('#memberPhoto').length === 0){
        const addPhotoHtml = `
          <div class="mb-3 text-center" id="addMemberPhotoBlock">
            <div style="position:relative;display:inline-block;">
              <img id="memberPhotoPreview" src="assets/img/team/user_prof.svg" class="rounded-circle mb-2" style="width:120px;height:120px;object-fit:cover;border:1px solid rgba(0,0,0,0.08);" alt="Photo Membre" />
              <button type="button" id="member-photo-overlay" class="btn btn-sm btn-secondary" style="position:absolute;right:0;bottom:0;border-radius:50%;padding:6px 8px;"><i class="fas fa-camera"></i></button>
            </div>
            <input id="memberPhoto" name="photo" type="file" accept="image/*" style="display:none" />
          </div>`;
        // prepend photo block to the form so it's visible to user
        $('#addMemberForm').prepend(addPhotoHtml);
      }

      // wire events for add-member photo upload
      $(document).off('click', '#member-photo-overlay').on('click', '#member-photo-overlay', function(){
        $('#memberPhoto').trigger('click');
      });
      $(document).off('change', '#memberPhoto').on('change', '#memberPhoto', function(){
        const f = this.files && this.files[0];
        if(!f) return;
        const reader = new FileReader();
        reader.onload = function(ev){ $('#memberPhotoPreview').attr('src', ev.target.result); };
        reader.readAsDataURL(f);
      });
    }

    // add member
    $('#addMemberForm').on('submit', function(e){
      e.preventDefault();
      submitAddMember(this);
    });

    // Page-level profile image: preview on select, upload on demand via Save button
    $(document).off('change', '#profile-image').on('change', '#profile-image', function(e){
      const f = this.files && this.files[0];
      if(!f) return;
      // immediate preview
      try{
        const url = URL.createObjectURL(f);
        $('#topProfileImage').attr('src', url).data('objectUrl', url);
      }catch(e){ /* ignore */ }
      // enable save button so user can confirm upload
      $('#profileImageSaveBtn').prop('disabled', false);
    });

    // Click handler to upload selected profile image
    $(document).off('click', '#profileImageSaveBtn').on('click', '#profileImageSaveBtn', async function(){
      const input = document.getElementById('profile-image');
      const f = input && input.files && input.files[0];
      if(!f) return showToast('Aucune photo sélectionnée','warning');
      const user = CURRENT_USER || loadCurrentUserFromToken();
      if(!user) return showToast('Utilisateur non trouvé','danger');
      showOverlay('Téléversement de la photo...');
      try{
        const fd = new FormData(); fd.append('photo', f);
        const headersObj = Object.assign({}, authHeaders()); if(headersObj['Content-Type']) delete headersObj['Content-Type'];
        const res = await fetch(API_BASE + '/api/protected/profile/' + (user.id || user._id), { method: 'PUT', headers: headersObj, body: fd });
        const json = await res.json().catch(()=>({}));
        if(res.ok){
          const finalUrl = json.photoUrl || URL.createObjectURL(f);
          $('#topProfileImage').attr('src', finalUrl);
          showToast('Photo mise à jour','success');
          $('#profileImageSaveBtn').prop('disabled', true);
          // revoke temporary object URL if set
          const prev = $('#topProfileImage').data('objectUrl');
          if(prev) { try{ URL.revokeObjectURL(prev); }catch(e){} $('#topProfileImage').removeData('objectUrl'); }
          fetchCurrentUserFromAPI().then(()=> loadAccountSettings());
        } else showToast(json.message || 'Erreur téléversement','danger');
      }catch(err){ console.error(err); showToast('Erreur réseau','danger'); }
      finally{ hideOverlay(); }
    });

    // Toggle password visibility for inputs using .toggle-password buttons
    $(document).on('click', '.toggle-password', function(){
      const target = $(this).data('target');
      if(!target) return;
      const $inp = $('#' + target);
      if(!$inp.length) return;
      const t = $inp.attr('type') === 'password' ? 'text' : 'password';
      $inp.attr('type', t);
      $(this).find('i').toggleClass('fa-eye fa-eye-slash');
    });

    // profile form submit (update current user's profile)
    $(document).on('submit', '#profileForm', async function(e){
      e.preventDefault();
      console.log('[debug] profileForm submit triggered');
      const user = CURRENT_USER || loadCurrentUserFromToken();
      if(!user) return showToast('Connectez-vous pour modifier le profil','warning');
      const prenom = $('#prenom').val();
      const nom = $('#nom').val();
      const email = $('#email').val();
      const telephone = $('#telephone').val();
      const payload = { prenom, nom, email, telephone };
      showOverlay('Enregistrement profil...');
      try{
        const res = await fetch(API_BASE + '/api/protected/profile/' + (user.id || user._id), {
          method: 'PUT',
          headers: Object.assign({'Content-Type':'application/json'}, authHeaders()),
          body: JSON.stringify(payload)
        });
        console.log('[debug] profile payload', payload);
        const json = await res.json();
        if(res.ok){ showToast('Profil mis à jour','success'); fetchCurrentUserFromAPI().then(()=> loadAccountSettings()); }
        else showToast(json.message || 'Erreur mise à jour','danger');
      }catch(err){ console.error(err); showToast('Erreur réseau','danger'); }
      finally{ hideOverlay(); }
    });

    // click handlers for profile/save buttons (ensure no page reload if submit binding missed)
    $(document).on('click', '#profileSaveBtn', function(e){
      e.preventDefault();
      console.log('[debug] profileSaveBtn clicked');
      $('#profileForm').trigger('submit');
    });

    $(document).on('click', '#changePasswordSaveBtn', function(e){
      e.preventDefault();
      console.log('[debug] changePasswordSaveBtn clicked');
      $('#changePasswordForm').trigger('submit');
    });

    // change password form on page
    $(document).on('submit', '#changePasswordForm', async function(e){
      e.preventDefault();
      console.log('[debug] changePasswordForm submit triggered');
      const oldPass = $('#old-password').val();
      const newPass = $('#new-password').val();
      const confirmPass = $('#confirm-password').val();
      if(!oldPass || !newPass || !confirmPass) return showToast('Remplissez tous les champs','warning');
      if(newPass !== confirmPass) return showToast('Les mots de passe ne correspondent pas','warning');
      const user = CURRENT_USER || loadCurrentUserFromToken();
      if(!user) return showToast('Connectez-vous pour modifier le mot de passe','warning');
      showOverlay('Modification mot de passe...');
      try{
        const res = await fetch(API_BASE + '/api/protected/profile/' + (user.id || user._id), {
          method: 'PUT',
          headers: Object.assign({'Content-Type':'application/json'}, authHeaders()),
          body: JSON.stringify({ oldPassword: oldPass, password: newPass })
        });
        console.log('[debug] change-password payload', { oldPassword: oldPass, password: newPass });
        const json = await res.json();
        if(res.ok){ showToast('Mot de passe mis à jour','success'); $('#old-password,#new-password,#confirm-password').val(''); }
        else showToast(json.message || 'Erreur mise à jour','danger');
      }catch(err){ console.error(err); showToast('Erreur réseau','danger'); }
      finally{ hideOverlay(); }
    });

    // deactivate account (page-level)
    $(document).on('click', '#deactivateAccountBtn', async function(){
      if(!confirm('Confirmez-vous la désactivation de votre compte ?')) return;
      const user = CURRENT_USER || loadCurrentUserFromToken();
      if(!user) return showToast('Utilisateur non trouvé','danger');
      showOverlay('Désactivation en cours...');
      try{
        const res = await fetch(API_BASE + '/api/protected/profile/' + (user.id || user._id), { method: 'DELETE', headers: authHeaders() });
        if(res.ok){ showToast('Compte désactivé','success'); // perform logout
          try{ localStorage.clear(); }catch(e){}
          setTimeout(()=>window.location.href='login.php',800);
        } else { const json = await res.json(); showToast(json.message || 'Erreur désactivation','danger'); }
      }catch(err){ console.error(err); showToast('Erreur réseau','danger'); }
      finally{ hideOverlay(); }
    });

    // delegate click on member card
    $('#memberList').on('click', '.member-card, .card-member', function(e){
      const id = $(this).closest('.member-card').data('id');
      if(!id) return;
      openMemberModal(id);
    });

    // submit edit member
    $(document).on('submit', '#editMemberForm', submitEditMember);

    // deactivate member from modal
    $(document).on('click', '#deactivateMemberBtn', async function(){
      const id = $('#editMemberId').val();
      if(!id) return showToast('Identifiant manquant','danger');
      if(!confirm('Confirmez-vous la désactivation de ce compte ?')) return;
      showOverlay('Désactivation...');
      try{
        const res = await fetch(API_BASE + '/api/protected/profile/' + id, { method: 'DELETE', headers: authHeaders() });
        if(res.ok){ showToast('Membre désactivé','success'); $('#memberModal').modal('hide'); loadMembers(); }
        else { const json = await res.json(); showToast(json.message || 'Erreur désactivation','danger'); }
      }catch(err){ console.error(err); showToast('Erreur réseau','danger'); }
      finally{ hideOverlay(); }
    });

    // account settings save
    $(document).on('click', '#accountSettingsSave', async function(e){
      e.preventDefault();
      const user = CURRENT_USER || loadCurrentUserFromToken();
      if(!user) return showToast('Connectez-vous pour modifier les paramètres','warning');
      if(user.role !== 'admin'){
        return showToast('Seuls les administrateurs peuvent modifier ces permissions','warning');
      }
      const payload = {
        gestionnaireId: user.id || user._id,
        role: user.role,
        canEditPasswords: $('#permPassword').is(':checked'),
        canEditPhoto: $('#permPhoto').is(':checked'),
        canAssignVendors: $('#permCanAssignVendors').is(':checked'),
        canAssignManagers: $('#permCanAssignManagers').is(':checked'),
        canDeleteMembers: $('#permCanDeleteMembers').is(':checked'),
        canEditProfileFields: $('#permCanEditProfileFields').is(':checked')
      };
      try{
        showOverlay('Enregistrement...');
        const res = await fetch(API_BASE + '/api/protected/modifier-role', {
          method: 'PUT',
          headers: Object.assign({'Content-Type':'application/json'}, authHeaders()),
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if(res.ok){
          showToast('Permissions mises à jour','success');
          loadMembers();
          loadAccountSettings();
        } else {
          showToast(json.message || 'Erreur mise à jour','danger');
        }
      }catch(err){
        console.error(err);
        showToast('Erreur réseau','danger');
      }finally{ hideOverlay(); }
    });

    // logout handler
    $(document).on('click', '#logoutBtn', function(){
      // clear auth-related localStorage keys
      const keys = ['token','authToken','jwt','accessToken','userToken','user','nom','role'];
      keys.forEach(k => { try{ localStorage.removeItem(k); }catch(e){} });
      // redirect to login page
      window.location.href = 'login.php';
    });

    // basic before-load spinner for whole page actions can be added as needed
  }

  $(document).ready(init);

})(jQuery);
