$(function() {
  // Initialisation de List.js avec la colonne id cachée
  const receptionsList = new List('tableReceptions', {
    valueNames: ["id", "reference", "designation", "categorie", "quantite", "emplacement", "etat", "dateEntree", "actions"],
    page: 5,
    pagination: true,
    item: `<tr>
      <td class="id" style="display:none;"></td>
      <td class="reference"></td>
      <td class="designation"></td>
      <td class="categorie"></td>
      <td class="quantite"></td>
      <td class="emplacement"></td>
      <td class="etat"></td>
      <td class="dateEntree"></td>
      <td class="actions"></td>
    </tr>`
  });

  const produitsData = {};
  let count = 1;

  function showToast(message, type = 'primary', delay = 3000) {
    const $toast = $('#mainToast');
    $toast.removeClass().addClass(`toast align-items-center text-bg-${type} border-0`);
    $('#mainToastBody').text(message);
    const toast = new bootstrap.Toast($toast[0], { delay });
    toast.show();
  }

  function resetForm() {
    $('#formProduit')[0].reset();
    $('#formProduit').removeClass('was-validated');
    $('#produitId').val('');
    $('#modalProduitLabel').text('Ajouter un produit');
  }

  function addOrUpdateProduit(produit) {
    if (produit.id && produitsData[produit.id]) {
      produitsData[produit.id] = produit;
      receptionsList.update('id', produit.id, {
        id: produit.id,
        reference: produit.reference || '',
        designation: produit.designation || '',
        categorie: produit.categorie || '',
        quantite: produit.quantite || '',
        emplacement: produit.emplacement || '',
        etat: produit.etat || '',
        dateEntree: produit.dateEntree || '',
        actions: `
          <button class="btn btn-sm btn-warning btnEdit" data-id="${produit.id}" title="Modifier"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger btnDelete" data-id="${produit.id}" title="Supprimer"><i class="fas fa-trash"></i></button>
        `
      });
    } else {
      produit.id = count.toString();
      produitsData[produit.id] = produit;

      receptionsList.add({
        id: produit.id,
        reference: produit.reference || '',
        designation: produit.designation || '',
        categorie: produit.categorie || '',
        quantite: produit.quantite || '',
        emplacement: produit.emplacement || '',
        etat: produit.etat || '',
        dateEntree: produit.dateEntree || '',
        actions: `
          <button class="btn btn-sm btn-warning btnEdit" data-id="${produit.id}" title="Modifier"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger btnDelete" data-id="${produit.id}" title="Supprimer"><i class="fas fa-trash"></i></button>
        `
      });
      count++;
    }
  }

  $('#formProduit').on('submit', function(e) {
    e.preventDefault();
    const form = this;
    if (!form.checkValidity()) {
      $(form).addClass('was-validated');
      showToast('Veuillez remplir correctement tous les champs obligatoires.', 'danger');
      return;
    }

    const produit = {
      id: $('#produitId').val(),
      reference: $('#reference').val(),
      designation: $('#designation').val(),
      categorie: $('#categorie').val(),
      quantite: $('#quantite').val(),
      emplacement: $('#emplacement').val(),
      etat: $('#etat').val(),
      dateEntree: $('#dateEntree').val()
    };

    addOrUpdateProduit(produit);
    resetForm();
    bootstrap.Modal.getInstance(document.getElementById('modalProduit')).hide();
    showToast('Produit enregistré avec succès !', 'success');
  });

  $('body').on('click', '.btnEdit', function() {
    const id = $(this).data('id');
    const produit = produitsData[id];
    if (!produit) {
      showToast('Produit introuvable en mémoire.', 'danger');
      return;
    }

    $('#produitId').val(produit.id);
    $('#reference').val(produit.reference);
    $('#designation').val(produit.designation);
    $('#categorie').val(produit.categorie);
    $('#quantite').val(produit.quantite);
    $('#emplacement').val(produit.emplacement);
    $('#etat').val(produit.etat);
    $('#dateEntree').val(produit.dateEntree);

    $('#modalProduitLabel').text('Modifier un produit');
    const modal = new bootstrap.Modal(document.getElementById('modalProduit'));
    modal.show();
  });

  $('body').on('click', '.btnDelete', function() {
    const id = $(this).data('id');
    if (!id) return;
    if (!confirm('Confirmer la suppression de ce produit ?')) return;

    delete produitsData[id];
    receptionsList.remove('id', id);
    showToast('Produit supprimé.', 'warning');
  });
});
