// Simple Auth helper to centralize token and user storage
(function(window){
  'use strict';
  const keyToken = 'token';
  const keyNom = 'nom';
  const keyRole = 'role';

  const Auth = {
    setToken(token){
      try{ if(token) localStorage.setItem(keyToken, token); }
      catch(e){ console.warn('Auth.setToken failed', e); }
    },
    getToken(){
      try{ return localStorage.getItem(keyToken); }catch(e){ return null; }
    },
    removeToken(){
      try{ localStorage.removeItem(keyToken); }catch(e){}
    },
    setUser(user){
      try{
        if(!user) return;
        if(typeof user === 'string'){
          localStorage.setItem(keyNom, user);
        } else {
          if(user.nom) localStorage.setItem(keyNom, user.nom);
          if(user.role) localStorage.setItem(keyRole, user.role);
        }
      }catch(e){ console.warn('Auth.setUser failed', e); }
    },
    getUser(){
      try{
        return { nom: localStorage.getItem(keyNom), role: localStorage.getItem(keyRole) };
      }catch(e){ return {nom:null, role:null}; }
    },
    clear(){
      try{ localStorage.removeItem(keyToken); localStorage.removeItem(keyNom); localStorage.removeItem(keyRole); }
      catch(e){}
    },
    isAuthenticated(){
      try{ return !!localStorage.getItem(keyToken); }catch(e){ return false; }
    },
    authHeader(){
      const t = Auth.getToken();
      return t ? { Authorization: 'Bearer ' + t } : {};
    }
  };

  // Return best display name using available sources (Auth storage, localStorage, or JWT payload)
  Auth.getDisplayName = function(){
    try{
      // 1. Auth.getUser()
      if(Auth.getUser){
        var u = Auth.getUser();
        if(u){
          var n = u.nom || u.name || u.fullName || u.username;
          if(n) return n;
        }
      }
      // 2. common localStorage keys
      var keys = ['nom','name','fullName','username'];
      for(var i=0;i<keys.length;i++){
        var v = localStorage.getItem(keys[i]);
        if(v) return v;
      }
      // 3. try JSON user object
      var userStr = localStorage.getItem('user') || localStorage.getItem('currentUser');
      if(userStr){
        try{
          var uj = JSON.parse(userStr);
          if(uj){
            return uj.nom || uj.name || uj.fullName || uj.username || (uj.user && (uj.user.nom || uj.user.name));
          }
        }catch(e){}
      }
      // 4. try token payload
      var t = Auth.getToken();
      if(t){
        try{
          var payload = t.split('.')[1];
          if(payload){
            var decoded = JSON.parse(decodeURIComponent(escape(window.atob(payload))));
            return decoded.nom || decoded.name || decoded.fullName || decoded.username || null;
          }
        }catch(e){}
      }
    }catch(e){}
    return null;
  };

  window.Auth = Auth;
})(window);

// If jQuery is present, automatically attach Authorization header to AJAX requests.
(function(window){
  'use strict';
  function attachAjax($){
    if(!$ || !$.ajaxPrefilter) return;
    // Use prefilter so header is added before each request is sent
    $.ajaxPrefilter(function(options, originalOptions, jqXHR){
      try{
        var t = window.Auth && window.Auth.getToken && window.Auth.getToken();
        if(t){
          jqXHR.setRequestHeader('Authorization', 'Bearer ' + t);
        }
      }catch(e){
        // ignore
      }
    });
  }

  // Expose attach function
  if(window.Auth) window.Auth.attachAjax = attachAjax;

  // Auto attach if jQuery is already loaded
  if(window.jQuery){
    attachAjax(window.jQuery);
  }
})(window);
