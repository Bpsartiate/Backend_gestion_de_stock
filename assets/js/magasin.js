(function(){
  const apiBase = 'https://backend-gestion-de-stock.onrender.com';

  function showAlert(message, type='info', duration=3000){
    const id = 'alert-'+Date.now();
    const html = `<div id="${id}" class="alert alert-${type} position-fixed" style="top:20px;right:20px;z-index:1050">${message}</div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    setTimeout(()=>{ const el = document.getElementById(id); if(el) el.remove(); }, duration);
  }

  function renderPlaceholderList(){
    const holder = document.getElementById('magasinsPageList');
    if(!holder) return;
    holder.innerHTML = '';
    // sample placeholders
    for(let i=1;i<=3;i++){
      const node = document.createElement('div');
      node.className = 'list-group-item d-flex justify-content-between align-items-center';
      node.innerHTML = `<div><strong>Magasin ${i}</strong><div class="small text-500">Adresse exemple</div></div><div><button class="btn btn-sm btn-outline-primary">Voir</button></div>`;
      holder.appendChild(node);
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    // simulate loading then render placeholder
    setTimeout(()=>{
      renderPlaceholderList();
      showAlert('Interface Magasins prête (front-end)', 'success', 2000);
    }, 700);

    const submitBtn = document.getElementById('submitCreateMagasinPage');
    if(submitBtn) submitBtn.addEventListener('click', ()=>{
      const form = document.getElementById('formCreateMagasinPage');
      if(!form) return;
      // read values (front-only for now)
      const fd = new FormData(form);
      const nom = fd.get('nom_magasin') || 'Nouveau magasin';
      // close modal
      const modalEl = document.getElementById('modalCreateMagasinPage'); if(modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
      showAlert(`Magasin créé: ${nom} (front only)`, 'success', 2500);
      // append sample to list
      const holder = document.getElementById('magasinsPageList'); if(holder){ const node = document.createElement('div'); node.className='list-group-item d-flex justify-content-between align-items-center'; node.innerHTML=`<div><strong>${nom}</strong><div class="small text-500">(créé localement)</div></div><div><button class="btn btn-sm btn-outline-primary">Voir</button></div>`; holder.insertAdjacentElement('afterbegin', node); }
      form.reset();
    });
  });
})();