(function(){
  // Auth Protection & User Info Manager
  // Include this in all pages to protect them and manage user info

  const apiBase = 'https://backend-gestion-de-stock.onrender.com';

  // Check if user is logged in (has valid token)
  function checkAuth(){
    const token = getToken();
    if(!token){
      console.log('[auth-protection] No token found, redirecting to login');
      redirectToLogin();
      return false;
    }
    return true;
  }

  function getToken(){
    return localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt') || localStorage.getItem('accessToken') || localStorage.getItem('userToken') || null;
  }

  function redirectToLogin(){
    // Determine the login URL with robust fallbacks
    let loginUrl = '/backend_Stock/login.php';
    
    if(window.BASE_URL && window.BASE_URL.trim() && window.BASE_URL !== '/'){
      loginUrl = window.BASE_URL + '/login.php';
    }
    
    console.log('[auth-protection] Redirecting to:', loginUrl);
    window.location.href = loginUrl;
  }

  // Fetch and display user info
  async function loadUserInfo(){
    const token = getToken();
    const userId = localStorage.getItem('userId') || localStorage.getItem('id');
    
    // Update elements that use simple localStorage (for fallback)
    updateUserInfoElements();

    // Try to fetch from API if we have token and userId
    if(token && userId){
      try{
        const res = await fetch(apiBase + '/api/protected/profile/' + userId, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
          }
        });

        if(res.ok){
          const user = await res.json();
          updateUserInfoElements(user);
          console.log('[auth-protection] User info loaded from API');
        }
      }catch(err){
        console.warn('[auth-protection] API fetch failed, using localStorage:', err);
      }
    }
  }

  function updateUserInfoElements(user){
    user = user || {};
    
    // Get values from user object or fallback to localStorage
    const nom = user.nom || localStorage.getItem('nom') || 'User';
    const prenom = user.prenom || localStorage.getItem('prenom') || '';
    const role = user.role || localStorage.getItem('role') || 'User';
    const photoUrl = user.photoUrl || localStorage.getItem('photoUrl') || null;
    const fullName = (prenom + ' ' + nom).trim() || 'User';

    // Update old-style user info bar (from setting.php)
    const nameEl = document.getElementById('currentUserName');
    if(nameEl) nameEl.textContent = fullName;

    const roleEl = document.getElementById('currentUserRole');
    if(roleEl) roleEl.textContent = role;

    // Update new-style user dropdown (from topbar.php)
    const dropdownNameEl = document.getElementById('userNameDisplay');
    if(dropdownNameEl) dropdownNameEl.textContent = fullName;

    const dropdownRoleEl = document.getElementById('userRoleDisplay');
    if(dropdownRoleEl) dropdownRoleEl.textContent = role;

    // Update role badge
    const badgeEl = document.getElementById('userRoleBadge');
    if(badgeEl){
      badgeEl.textContent = role.charAt(0).toUpperCase() + role.slice(1);
      const roleLC = role.toLowerCase();
      if(roleLC === 'admin') badgeEl.style.backgroundColor = '#28a745';
      else if(roleLC === 'superviseur') badgeEl.style.backgroundColor = '#007bff';
      else if(roleLC === 'vendeur') badgeEl.style.backgroundColor = '#ffc107';
      else badgeEl.style.backgroundColor = '#6c757d';
    }

    // Update avatar images
    if(photoUrl){
      const avatarImg = document.getElementById('userAvatarImg');
      if(avatarImg) avatarImg.src = photoUrl;

      const profileImg = document.getElementById('topProfileImage');
      if(profileImg) profileImg.src = photoUrl;
    }
  }

  function setupLogout(){
    // Handle old logout button from setting.php
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn){
      logoutBtn.addEventListener('click', doLogout);
    }

    // Handle new logout button from topbar.php
    const navLogoutBtn = document.getElementById('nav-logout');
    if(navLogoutBtn){
      navLogoutBtn.addEventListener('click', doLogout);
    }
  }

  function doLogout(e){
    if(e && e.preventDefault) e.preventDefault();
    if(e && e.stopPropagation) e.stopPropagation();
    
    console.log('[auth-protection] Logging out...');
    
    // Clear all auth keys
    const keysToRemove = [
      'token', 'authToken', 'jwt', 'accessToken', 'userToken',
      'id', 'userId', 'nom', 'prenom', 'role', 'photoUrl',
      'userNom', 'userPrenom', 'userRole', 'userPhotoUrl',
      'email', 'businessId', 'guichetId'
    ];
    
    keysToRemove.forEach(key => {
      try{ localStorage.removeItem(key); }catch(e){}
    });
    
    console.log('[auth-protection] localStorage cleared');
    
    // Redirect to login
    setTimeout(() => {
      redirectToLogin();
    }, 100);
  }

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function(){
    // Check if user is authenticated
    if(!checkAuth()){
      return; // User will be redirected
    }
    
    // Load user info
    loadUserInfo();
    
    // Setup logout handlers
    setupLogout();
  });

  // Export functions for external use if needed
  window.AuthProtection = {
    getToken: getToken,
    loadUserInfo: loadUserInfo,
    logout: doLogout,
    redirectToLogin: redirectToLogin
  };
})();
