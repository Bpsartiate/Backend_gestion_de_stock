/**
 * Gestion intégration système de notation fournisseur dans la réception
 * Charge les prévisions de commande et calcule automatiquement le score
 */

(function() {
  // Fonction utilitaire pour récupérer le token d'authentification
  function getAuthToken() {
    let token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      token = sessionStorage.getItem('token') || sessionStorage.getItem('authToken');
    }
    if (!token) {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token' || name === 'authToken') {
          token = decodeURIComponent(value);
          break;
        }
      }
    }
    return token || '';
  }

  // Cache pour stocker la commande sélectionnée
  let selectedCommande = null;
  let commandesList = {};

  // Événement: sélection produit
  document.getElementById('produitReception')?.addEventListener('change', async function() {
    const produitId = this.value;
    selectedCommande = null;
    
    if (!produitId) {
      document.getElementById('sectionPrevisions').style.display = 'none';
      document.getElementById('sectionRealiteComparaison').style.display = 'none';
      clearPrevisionsDisplay();
      return;
    }

    // 🔍 Récupérer le produit pour vérifier son status
    const produit = PRODUITS_RECEPTION?.find(p => p._id === produitId);
    console.log('📦 Produit sélectionné - etat:', produit?.etat);
    
    // ✅ Vérifier si le produit est EN_COMMANDE
    const isEnCommande = produit?.etat === 'EN_COMMANDE';
    console.log(`🎯 Est EN_COMMANDE? ${isEnCommande}`);
    
    // Si le produit n'est pas EN_COMMANDE, cacher les sections EN_COMMANDE
    if (!isEnCommande) {
      console.log('ℹ️ Produit STOCKÉ - masquage sections EN_COMMANDE');
      document.getElementById('sectionPrevisions').style.display = 'none';
      document.getElementById('sectionRealiteComparaison').style.display = 'none';
      clearPrevisionsDisplay();
      return;
    }

    // 📦 Produit EN_COMMANDE - montrer les sections
    document.getElementById('sectionRealiteComparaison').style.display = 'block';

    try {
      // Charger la commande liée au produit
      const apiBase = window.API_BASE || 'https://backend-gestion-de-stock.onrender.com';
      const response = await fetch(`${apiBase}/api/protected/commandes/produit/${produitId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        const commande = await response.json();
        selectedCommande = commande;
        commandesList[produitId] = commande;
        
        // Afficher les prévisions
        displayPrevisions(commande);
        document.getElementById('sectionPrevisions').style.display = 'block';
      } else if (response.status === 404) {
        // Pas de commande pour ce produit - c'est normal
        console.log('ℹ️ Aucune commande trouvée pour ce produit');
        document.getElementById('sectionPrevisions').style.display = 'none';
        clearPrevisionsDisplay();
      } else {
        console.error('❌ Erreur API:', response.status, response.statusText);
        document.getElementById('sectionPrevisions').style.display = 'none';
        clearPrevisionsDisplay();
      }
    } catch (error) {
      console.error('❌ Erreur chargement commande:', error);
      document.getElementById('sectionPrevisions').style.display = 'none';
    }
  });

  // Afficher les prévisions
  function displayPrevisions(commande) {
    console.log('📋 Commande reçue:', commande);
    
    const quantiteUnit = document.getElementById('uniteReceptionLabel')?.textContent || 'unités';
    
    // Vérifier si c'est un produit LOT (basé sur les champs nombrePieces dans la commande)
    // Une commande LOT a TOUJOURS nombrePieces ET quantiteParPiece (même si 0)
    const hasLotData = 'nombrePieces' in commande && 'quantiteParPiece' in commande && 'uniteDetail' in commande;
    const isLot = hasLotData && (commande.nombrePieces !== null && commande.quantiteParPiece !== null);
    
    console.log('🎁 Est un LOT?', isLot, { 
      hasLotData, 
      nombrePieces: commande.nombrePieces, 
      quantiteParPiece: commande.quantiteParPiece, 
      uniteDetail: commande.uniteDetail 
    });
    
    const prevSimpleSection = document.getElementById('prevSimpleSection');
    const prevLotSection = document.getElementById('prevLotSection');
    
    if (isLot) {
      // 🎁 AFFICHER LES DONNÉES LOT
      console.log('✅ Affichage section LOT');
      if (prevSimpleSection) prevSimpleSection.style.display = 'none';
      if (prevLotSection) prevLotSection.style.display = 'block';
      
      // Remplir les champs LOT
      const nombrePieces = commande.nombrePieces || 0;
      const quantiteParPiece = commande.quantiteParPiece || 0;
      const uniteDetail = commande.uniteDetail || '-';
      const marque = commande.marque || '-';
      
      document.getElementById('prevNombrePieces').textContent = nombrePieces;
      document.getElementById('prevQuantiteParPiece').textContent = quantiteParPiece;
      document.getElementById('prevUniteDetail').textContent = uniteDetail;
      document.getElementById('prevMarqueLot').textContent = marque;
      
      // Calculer le total: nombrePieces × quantiteParPiece
      const total = (nombrePieces && quantiteParPiece) 
        ? (nombrePieces * quantiteParPiece).toFixed(2)
        : '0';
      document.getElementById('prevTotalLot').textContent = total;
      document.getElementById('prevTotalLotUnit').textContent = ` ${uniteDetail}`;
      
      // Délai et état
      document.getElementById('prevDelaiLot').textContent = commande.delaiLivraisonPrevu || '-';
      document.getElementById('prevEtatLot').textContent = commande.etatPrevu || '-';
      
      console.log('✅ Données LOT affichées:', { 
        nombrePieces, 
        quantiteParPiece, 
        total, 
        uniteDetail, 
        marque 
      });
      
      // Pré-remplir les prévisions dans la section réalité
      if (document.getElementById('prevPiecesVal')) {
        document.getElementById('prevPiecesVal').textContent = nombrePieces || '-';
      }
      
      // Pré-remplir la quantité par pièce prévue
      if (document.getElementById('prevQtyParPieceVal')) {
        document.getElementById('prevQtyParPieceVal').textContent = quantiteParPiece || '-';
      }
      
      // Pré-remplir le total prévu et l'unité
      if (document.getElementById('prevTotalVal')) {
        const totalPrevu = (nombrePieces && quantiteParPiece) 
          ? (nombrePieces * quantiteParPiece).toFixed(2)
          : '-';
        document.getElementById('prevTotalVal').textContent = totalPrevu;
      }
      
      // Mettre à jour les unités dans la section réalité
      if (document.getElementById('uniteParPieceReelle')) {
        document.getElementById('uniteParPieceReelle').textContent = uniteDetail;
      }
      if (document.getElementById('uniteTotalReception')) {
        document.getElementById('uniteTotalReception').textContent = uniteDetail;
      }
      
      // Pré-remplir la marque prévue et le champ marque reçue
      if (document.getElementById('prevMarqueVal')) {
        document.getElementById('prevMarqueVal').textContent = marque;
      }
      if (document.getElementById('marqueReelle')) {
        document.getElementById('marqueReelle').value = marque; // Pré-remplir avec la marque prévue
      }
    } else {
      // 📦 AFFICHER LES DONNÉES SIMPLES (CLASSIQUE)
      console.log('✅ Affichage section SIMPLE');
      if (prevSimpleSection) prevSimpleSection.style.display = 'block';
      if (prevLotSection) prevLotSection.style.display = 'none';
      
      document.getElementById('prevQuantite').textContent = commande.quantiteCommandee || '-';
      document.getElementById('prevQuantiteUnit').textContent = quantiteUnit;
      document.getElementById('prevMarque').textContent = commande.marque || '-';
      document.getElementById('prevDelai').textContent = commande.delaiLivraisonPrevu || '-';
      document.getElementById('prevEtat').textContent = commande.etatPrevu || '-';
      
      console.log('✅ Données SIMPLE affichées:', { 
        quantiteCommandee: commande.quantiteCommandee, 
        marque: commande.marque 
      });
      
      // Pré-remplir les prévisions dans la section réalité
      if (document.getElementById('prevQuantiteVal')) {
        document.getElementById('prevQuantiteVal').textContent = commande.quantiteCommandee || '-';
        document.getElementById('uniteRealReception').textContent = quantiteUnit;
      }

      // ✅ PRÉ-REMPLIR LA QUANTITÉ REÇUE POUR SIMPLES
      if (document.getElementById('quantiteRealReception')) {
        document.getElementById('quantiteRealReception').value = commande.quantiteCommandee || '';
        console.log(`✅ Quantité Reçue pré-remplie: ${commande.quantiteCommandee}`);
      }
      
      // Pré-remplir la marque prévue et le champ marque reçue pour les simples aussi
      if (document.getElementById('prevMarqueVal')) {
        document.getElementById('prevMarqueVal').textContent = commande.marque || '-';
      }
      if (document.getElementById('marqueReelle')) {
        document.getElementById('marqueReelle').value = commande.marque || ''; // Pré-remplir avec la marque prévue
      }
    }

    // ✅ AFFICHER LA SECTION RÉALITÉ & COMPARAISON POUR LES COMMANDES
    const sectionRealite = document.getElementById('sectionRealiteComparaison');
    if (sectionRealite) {
      sectionRealite.style.display = 'block';
      
      // Pré-remplir les dates et états
      if (commande.dateEcheance) {
        const dateEcheance = new Date(commande.dateEcheance).toISOString().split('T')[0];
        if (document.getElementById('prevDateVal')) {
          document.getElementById('prevDateVal').textContent = dateEcheance;
        }
      }
      
      if (document.getElementById('prevEtatVal')) {
        document.getElementById('prevEtatVal').textContent = commande.etatPrevu || '-';
      }
      
      // Afficher les champs appropriés
      const realiteSimple = document.getElementById('realiteSimple');
      const realieLot = document.getElementById('realieLot');
      
      if (isLot) {
        if (realiteSimple) realiteSimple.style.display = 'none';
        if (realieLot) realieLot.style.display = 'block';
      } else {
        if (realiteSimple) realiteSimple.style.display = 'block';
        if (realieLot) realieLot.style.display = 'none';
      }
    }
  }

  // Réinitialiser l'affichage des prévisions
  function clearPrevisionsDisplay() {
    // Réinitialiser les prévisions simples
    document.getElementById('prevQuantite').textContent = '-';
    document.getElementById('prevDelai').textContent = '-';
    document.getElementById('prevEtat').textContent = '-';
    document.getElementById('prevMarque').textContent = '-';
    
    // Réinitialiser les prévisions LOT
    document.getElementById('prevNombrePieces').textContent = '-';
    document.getElementById('prevQuantiteParPiece').textContent = '-';
    document.getElementById('prevUniteDetail').textContent = '-';
    document.getElementById('prevMarqueLot').textContent = '-';
    document.getElementById('prevTotalLot').textContent = '-';
    document.getElementById('prevDelaiLot').textContent = '-';
    document.getElementById('prevEtatLot').textContent = '-';
    document.getElementById('prevQtyParPieceVal').textContent = '-';
    document.getElementById('prevTotalVal').textContent = '-';
    document.getElementById('prevMarqueVal').textContent = '-';
    
    // Réinitialiser le champ marque reçue
    const marqueReelleInput = document.getElementById('marqueReelle');
    if (marqueReelleInput) {
      marqueReelleInput.value = '';
    }
    
    // Réinitialiser la comparaison marque
    const conformMarqueEl = document.getElementById('conformeMarque');
    if (conformMarqueEl) {
      conformMarqueEl.textContent = '✓';
      conformMarqueEl.style.color = 'green';
    }
    
    // ✅ MASQUER LA SECTION RÉALITÉ & COMPARAISON QUAND PAS DE COMMANDE
    const sectionRealite = document.getElementById('sectionRealiteComparaison');
    if (sectionRealite) {
      sectionRealite.style.display = 'none';
    }
  }

  // Calculer le score quand on change les champs de réalité
  const fieldsToWatch = [
    'quantiteReception',
    'quantiteRealReception',
    'nombrePiecesReelles',
    'quantiteParPieceReelle',
    'totalReceptionsLot',
    'marqueReelle',
    'dateReceptionReelle',
    'etatReel',
    'problemesIdentifies'
  ];

  fieldsToWatch.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('change', () => {
        // Ordre important: d'abord calculer les totaux LOT, PUIS le score
        calculateLotTotals();
        updateComparaisons();
        calculateScore();
      });
      field.addEventListener('input', () => {
        // Sur input: mise à jour temps réel
        calculateLotTotals();
        updateComparaisons();
      });
    }
  });

  // 🎁 CALCULER LES TOTAUX DU LOT EN TEMPS RÉEL
  function calculateLotTotals() {
    if (!selectedCommande || !selectedCommande.nombrePieces) return;

    const piecesReelles = parseFloat(document.getElementById('nombrePiecesReelles')?.value) || 0;
    const qtyParPieceReelle = parseFloat(document.getElementById('quantiteParPieceReelle')?.value) || 0;

    // Calculer le total reçu
    const totalRecu = piecesReelles && qtyParPieceReelle ? (piecesReelles * qtyParPieceReelle).toFixed(2) : 0;
    const totalPrevuInput = document.getElementById('totalReceptionsLot');
    if (totalPrevuInput) {
      totalPrevuInput.value = totalRecu;
    }

    // Calculer l'écart avec le prévu
    const nombrePiecesPrevues = selectedCommande.nombrePieces || 0;
    const qtyParPiecePrevue = selectedCommande.quantiteParPiece || 0;
    const totalPrevu = nombrePiecesPrevues * qtyParPiecePrevue;

    if (totalRecu && totalPrevu) {
      const ecart = totalRecu - totalPrevu;
      const ecartPourcent = Math.round((ecart / totalPrevu) * 100);
      
      const ecartInput = document.getElementById('ecartTotalLot');
      if (ecartInput) {
        ecartInput.value = `${ecart >= 0 ? '+' : ''}${ecart.toFixed(2)} (${ecartPourcent >= 0 ? '+' : ''}${ecartPourcent}%)`;
        ecartInput.style.color = ecart >= 0 ? 'green' : 'red';
      }

      console.log(`🎁 Total LOT - Prévu: ${totalPrevu}, Reçu: ${totalRecu}, Écart: ${ecart} (${ecartPourcent}%)`);
    }
  }

  // 📊 CALCULER LES ÉCARTS EN TEMPS RÉEL
  function updateComparaisons() {
    if (!selectedCommande) return;

    // Écart quantité (produit simple)
    const quantiteRealInput = document.getElementById('quantiteRealReception');
    if (quantiteRealInput && quantiteRealInput.value) {
      const quantiteReelle = parseFloat(quantiteRealInput.value) || 0;
      const quantitePrevue = selectedCommande.quantiteCommandee || 0;
      const ecart = quantiteReelle - quantitePrevue;
      const ecartPourcent = quantitePrevue > 0 ? Math.round((ecart / quantitePrevue) * 100) : 0;
      
      const ecartQtyEl = document.getElementById('ecartQuantiteVal');
      if (ecartQtyEl) {
        ecartQtyEl.textContent = 
          `${ecart >= 0 ? '+' : ''}${ecart.toFixed(2)} (${ecartPourcent >= 0 ? '+' : ''}${ecartPourcent}%)`;
        ecartQtyEl.style.color = ecart >= 0 ? 'green' : 'red';
      }
    }

    // Écart pièces (produit LOT)
    const piecesRealInput = document.getElementById('nombrePiecesReelles');
    if (piecesRealInput && piecesRealInput.value) {
      const piecesReelles = parseInt(piecesRealInput.value) || 0;
      const piecesPrevues = selectedCommande.nombrePieces || 0;
      const ecart = piecesReelles - piecesPrevues;
      const ecartPourcent = piecesPrevues > 0 ? Math.round((ecart / piecesPrevues) * 100) : 0;
      
      const ecartPiecesEl = document.getElementById('ecartPiecesVal');
      if (ecartPiecesEl) {
        ecartPiecesEl.textContent = 
          `${ecart >= 0 ? '+' : ''}${ecart} (${ecartPourcent >= 0 ? '+' : ''}${ecartPourcent}%)`;
        ecartPiecesEl.style.color = ecart >= 0 ? 'green' : 'red';
      }
    }

    // Écart quantité par pièce (produit LOT)
    const qtyParPieceRealInput = document.getElementById('quantiteParPieceReelle');
    if (qtyParPieceRealInput && qtyParPieceRealInput.value) {
      const qtyParPieceReelle = parseFloat(qtyParPieceRealInput.value) || 0;
      const qtyParPiecePrevue = selectedCommande.quantiteParPiece || 0;
      const ecart = qtyParPieceReelle - qtyParPiecePrevue;
      const ecartPourcent = qtyParPiecePrevue > 0 ? Math.round((ecart / qtyParPiecePrevue) * 100) : 0;
      
      const ecartQtyParPieceEl = document.getElementById('ecartQtyParPieceVal');
      if (ecartQtyParPieceEl) {
        ecartQtyParPieceEl.textContent = 
          `${ecart >= 0 ? '+' : ''}${ecart.toFixed(2)} (${ecartPourcent >= 0 ? '+' : ''}${ecartPourcent}%)`;
        ecartQtyParPieceEl.style.color = ecart >= 0 ? 'green' : 'red';
      }
    }

    // Comparaison délai (date)
    const dateReelleInput = document.getElementById('dateReceptionReelle');
    if (dateReelleInput && dateReelleInput.value) {
      const dateReelle = new Date(dateReelleInput.value);
      const dateEcheance = new Date(selectedCommande.dateEcheance);
      const delaiReelJours = Math.round((dateEcheance - dateReelle) / (1000 * 60 * 60 * 24));
      
      const delaiReel = delaiReelJours >= 0 ? `À temps (${delaiReelJours}j avant)` : `${Math.abs(delaiReelJours)}j en retard`;
      const delaiEl = document.getElementById('delaiReel');
      if (delaiEl) {
        delaiEl.textContent = delaiReel;
        delaiEl.style.color = delaiReelJours >= 0 ? 'green' : 'red';
      }
    }

    // Comparaison état
    const etatRealSelect = document.getElementById('etatReel');
    if (etatRealSelect && etatRealSelect.value) {
      const etatReel = etatRealSelect.value;
      const etatPrvu = selectedCommande.etatPrevu || 'Neuf';
      const conform = etatReel === etatPrvu;
      
      const conformEl = document.getElementById('conformeEtat');
      if (conformEl) {
        conformEl.textContent = conform ? '✓ Oui' : '✗ Non';
        conformEl.style.color = conform ? 'green' : 'red';
      }
    }

    // Comparaison marque
    const marqueRealInput = document.getElementById('marqueReelle');
    if (marqueRealInput && marqueRealInput.value) {
      const marqueReelle = marqueRealInput.value.trim().toLowerCase();
      const marquePrevu = (selectedCommande.marque || 'Non spécifiée').trim().toLowerCase();
      const conform = marqueReelle === marquePrevu;
      
      const conformMarqueEl = document.getElementById('conformeMarque');
      if (conformMarqueEl) {
        conformMarqueEl.textContent = conform ? '✓ Conforme' : '✗ Différente';
        conformMarqueEl.style.color = conform ? 'green' : 'orange';
      }
      
      console.log(`🏷️ Comparaison marque - Prévue: "${marquePrevu}", Reçue: "${marqueReelle}", Conforme: ${conform}`);
    }
  }

  // Calculer le score fournisseur
  function calculateScore() {
    if (!selectedCommande) {
      document.getElementById('sectionScoreFournisseur').style.display = 'none';
      return;
    }

    // Déterminer si c'est un produit LOT
    const isLot = 'nombrePieces' in selectedCommande && 'quantiteParPiece' in selectedCommande && 'uniteDetail' in selectedCommande;
    
    // Récupérer les valeurs réelles selon le type
    let quantiteReelle = 0;
    let quantitePrevue = 0;
    
    if (isLot) {
      // Pour LOT: comparer totalReceptionsLot vs (nombrePieces × quantiteParPiece)
      quantiteReelle = parseFloat(document.getElementById('totalReceptionsLot')?.value) || 0;
      const nombrePiecesPrevu = selectedCommande.nombrePieces || 0;
      const qtyParPiecePrevu = selectedCommande.quantiteParPiece || 0;
      quantitePrevue = nombrePiecesPrevu * qtyParPiecePrevu;
      console.log(`📊 Score LOT - Quantité réelle: ${quantiteReelle}, Quantité prévue: ${quantitePrevue}`);
    } else {
      // Pour SIMPLE: comparer quantiteRealReception vs quantiteCommandee
      quantiteReelle = parseFloat(document.getElementById('quantiteRealReception')?.value) || 0;
      quantitePrevue = selectedCommande.quantiteCommandee || 0;
      console.log(`📊 Score SIMPLE - Quantité réelle: ${quantiteReelle}, Quantité prévue: ${quantitePrevue}`);
    }
    
    const dateReelleStr = document.getElementById('dateReceptionReelle').value;
    const etatReel = document.getElementById('etatReel').value;
    const problemes = document.getElementById('problemesIdentifies').value;

    // Au moins un champ doit être rempli
    if (!quantiteReelle && !dateReelleStr && !etatReel && !problemes) {
      document.getElementById('sectionScoreFournisseur').style.display = 'none';
      return;
    }

    // Montrer la section score
    document.getElementById('sectionScoreFournisseur').style.display = 'block';

    // Calcul du score selon l'algorithme (30+25+25+20 = 100)
    let scoreQuantite = 0;
    let scoreDelai = 0;
    let scoreQualite = 0;
    let scoreConformite = 0;

    // 1. Score Quantité (30 points) - Comparer quantité réelle vs prévue
    if (quantiteReelle > 0 && quantitePrevue > 0) {
      const ratioQualite = (quantiteReelle / quantitePrevue) * 100;
      
      if (ratioQualite >= 95) {
        scoreQuantite = 30; // Excellent
      } else if (ratioQualite >= 85) {
        scoreQuantite = 24; // Bon
      } else if (ratioQualite >= 75) {
        scoreQuantite = 18; // Acceptable
      } else if (ratioQualite >= 60) {
        scoreQuantite = 12; // Médiocre
      } else {
        scoreQuantite = 6; // Mauvais
      }
      console.log(`✅ Score Quantité calculé: ${scoreQuantite} (ratio: ${ratioQualite.toFixed(1)}%)`);
    }

    // 2. Score Délai (25 points) - Comparer dates
    if (dateReelleStr) {
      const datePrevu = new Date(selectedCommande.dateCommande);
      datePrevu.setDate(datePrevu.getDate() + (selectedCommande.delaiLivraisonPrevu || 7));
      
      const dateReelle = new Date(dateReelleStr);
      const ecartJours = Math.floor((dateReelle - datePrevu) / (1000 * 60 * 60 * 24));
      
      if (ecartJours <= 0) {
        scoreDelai = 25; // À l'heure ou en avance
      } else if (ecartJours <= 2) {
        scoreDelai = 20; // Retard ≤ 2j
      } else if (ecartJours <= 5) {
        scoreDelai = 15; // Retard ≤ 5j
      } else if (ecartJours <= 10) {
        scoreDelai = 10; // Retard ≤ 10j
      } else {
        scoreDelai = 5; // Retard > 10j
      }

      // Afficher la comparaison
      document.getElementById('comparaisonDelai').textContent = 
        `Retard: ${ecartJours >= 0 ? ecartJours + ' jours' : 'En avance de ' + Math.abs(ecartJours) + ' jours'}`;
    }

    // 3. Score Qualité (25 points) - État reçu
    if (etatReel) {
      const etatPrevu = selectedCommande.etatPrevu || 'Neuf';
      
      if (etatReel === etatPrevu) {
        scoreQualite = 25; // État conforme
      } else if (etatPrevu === 'Neuf' && etatReel === 'Bon état') {
        scoreQualite = 20; // Léger écart
      } else if (etatReel === 'Usagé') {
        scoreQualite = 10; // Écart significatif
      } else if (etatReel === 'Endommagé') {
        scoreQualite = 5; // État inacceptable
      }

      // Afficher la comparaison
      const iconPrevu = etatPrevu === etatReel ? '✓' : '✗';
      document.getElementById('comparaisonEtat').textContent = 
        `Comparaison: Prévu="${etatPrevu}" Reçu="${etatReel}" ${iconPrevu}`;
    }

    // 4. Score Conformité (20 points) - Problèmes
    if (problemes) {
      scoreConformite = 10; // Problèmes identifiés = -50%
    } else {
      scoreConformite = 20; // Aucun problème = 100%
    }

    // Total
    const scoreTotal = scoreQuantite + scoreDelai + scoreQualite + scoreConformite;

    // Déterminer le niveau d'évaluation
    let level = 'Mauvais';
    let levelColor = 'danger';
    let recommendation = 'Arrêter';

    if (scoreTotal >= 90) {
      level = 'Excellent';
      levelColor = 'success';
      recommendation = 'Continuer';
    } else if (scoreTotal >= 75) {
      level = 'Bon';
      levelColor = 'info';
      recommendation = 'Continuer';
    } else if (scoreTotal >= 60) {
      level = 'Acceptable';
      levelColor = 'warning';
      recommendation = 'Surveiller';
    } else if (scoreTotal >= 40) {
      level = 'Médiocre';
      levelColor = 'danger';
      recommendation = 'Améliorer';
    }

    // Afficher les scores
    document.getElementById('scoreQuantite').textContent = scoreQuantite;
    document.getElementById('scoreDelai').textContent = scoreDelai;
    document.getElementById('scoreQualite').textContent = scoreQualite;
    document.getElementById('scoreConformite').textContent = scoreConformite;
    document.getElementById('scoreTotal').textContent = scoreTotal + ' / 100';
    document.getElementById('scoreLevelText').innerHTML = 
      `Évaluation: <span class="badge bg-${levelColor}">${level}</span> | Recommandation: <strong>${recommendation}</strong>`;

    // Sauvegarder le score pour la soumission
    window.lastCalculatedScore = {
      scoreQuantite,
      scoreDelai,
      scoreQualite,
      scoreConformite,
      scoreTotal,
      level,
      recommendation
    };
  }

  // Wrapper pour soumission du formulaire (quand disponible)
  window.appendScoreToReceptionForm = function(formData) {
    if (window.lastCalculatedScore && selectedCommande) {
      formData.commandeId = selectedCommande._id;
      formData.scoreData = window.lastCalculatedScore;
    }
    return formData;
  };

  // ===== AUTO-PRÉ-REMPLISSAGE: Détails du LOT → Réalité Reçue =====
  
  /**
   * Quand on remplit les champs de "Détails du LOT" (prévisions),
   * ils pré-remplissent automatiquement les champs de "Réalité Reçue"
   * et calculent les totaux
   */
  
  // Listener sur nombrePieces - pré-remplit nombrePiecesReelles
  document.getElementById('nombrePieces')?.addEventListener('input', function() {
    const nombrePieces = this.value ? parseFloat(this.value) : '';
    if (nombrePieces !== '') {
      document.getElementById('nombrePiecesReelles').value = nombrePieces;
      calculateLotReceptionTotal(); // Recalculer le total
      updateLotComparisons(); // Mettre à jour les comparaisons
    }
  });

  // Listener sur quantiteParPiece - pré-remplit quantiteParPieceReelle
  document.getElementById('quantiteParPiece')?.addEventListener('input', function() {
    const quantiteParPiece = this.value ? parseFloat(this.value) : '';
    if (quantiteParPiece !== '') {
      document.getElementById('quantiteParPieceReelle').value = quantiteParPiece;
      calculateLotReceptionTotal(); // Recalculer le total
      updateLotComparisons(); // Mettre à jour les comparaisons
    }
  });

  // Listener sur uniteDetail - met à jour l'affichage de l'unité en Réalité
  document.getElementById('uniteDetail')?.addEventListener('change', function() {
    const uniteDetail = this.value;
    if (uniteDetail) {
      // Mettre à jour les unités affichées dans la section Réalité
      const uniteParPieceReelle = document.getElementById('uniteParPieceReelle');
      const uniteTotalReception = document.getElementById('uniteTotalReception');
      if (uniteParPieceReelle) uniteParPieceReelle.textContent = uniteDetail;
      if (uniteTotalReception) uniteTotalReception.textContent = uniteDetail;
    }
  });

  // Listener sur marqueReception - pré-remplit marqueReelle
  document.getElementById('marqueReception')?.addEventListener('input', function() {
    const marque = this.value.trim();
    if (marque) {
      document.getElementById('marqueReelle').value = marque;
      updateLotComparisons(); // Mettre à jour la comparaison marque
    }
  });

  // ===== AUTO-PRÉ-REMPLISSAGE: Quantité SIMPLE → Réalité Reçue =====
  
  /**
   * Quand on remplit les champs de "Quantité + Unité" pour SIMPLES (prévisions),
   * ils pré-remplissent automatiquement les champs de "Réalité Reçue"
   * et calculent les comparaisons
   */
  
  // Listener sur quantiteReception (SIMPLE) - pré-remplit quantiteRealReception
  document.getElementById('quantiteReception')?.addEventListener('input', function() {
    const quantiteReception = this.value ? parseFloat(this.value) : '';
    if (quantiteReception !== '') {
      document.getElementById('quantiteRealReception').value = quantiteReception;
      console.log(`✅ Quantité SIMPLE pré-remplie - Prévue: ${quantiteReception}`);
      updateComparaisons(); // Mettre à jour les comparaisons
      calculateScore(); // Recalculer le score
    }
  });

  // Pré-remplir dateReceptionReelle avec la date d'aujourd'hui
  document.addEventListener('DOMContentLoaded', function() {
    const dateReceptionInput = document.getElementById('dateReceptionReelle');
    if (dateReceptionInput && !dateReceptionInput.value) {
      const today = new Date().toISOString().split('T')[0];
      dateReceptionInput.value = today;
    }
  });

  // Auto-remplissement au chargement si le formulaire existe déjà
  (function() {
    const dateReceptionInput = document.getElementById('dateReceptionReelle');
    if (dateReceptionInput && !dateReceptionInput.value) {
      const today = new Date().toISOString().split('T')[0];
      dateReceptionInput.value = today;
    }
  })();

  /**
   * Calculer le total réception pour produits LOT
   * Formule: nombrePiecesReelles × quantiteParPieceReelle
   */
  function calculateLotReceptionTotal() {
    const nombrePiecesReelles = parseFloat(document.getElementById('nombrePiecesReelles')?.value) || 0;
    const quantiteParPieceReelle = parseFloat(document.getElementById('quantiteParPieceReelle')?.value) || 0;
    
    const totalRecu = nombrePiecesReelles * quantiteParPieceReelle;
    
    const totalInput = document.getElementById('totalReceptionsLot');
    if (totalInput) {
      totalInput.value = totalRecu > 0 ? totalRecu.toFixed(2) : '0';
    }
    
    console.log(`🎁 Total LOT Réception - Pièces: ${nombrePiecesReelles}, Qté/pièce: ${quantiteParPieceReelle}, Total: ${totalRecu.toFixed(2)}`);
  }

  /**
   * Mettre à jour toutes les comparaisons pour produits LOT
   */
  function updateLotComparisons() {
    if (!selectedCommande) return;
    
    // Comparaison nombre de pièces
    const nombrePiecesReelles = parseFloat(document.getElementById('nombrePiecesReelles')?.value) || 0;
    const nombrePiecesPrevu = selectedCommande.nombrePieces || 0;
    const ecartPieces = nombrePiecesReelles - nombrePiecesPrevu;
    
    const ecartPiecesEl = document.getElementById('ecartPiecesVal');
    if (ecartPiecesEl) {
      ecartPiecesEl.textContent = ecartPieces >= 0 ? `+${ecartPieces}` : ecartPieces;
      ecartPiecesEl.style.color = ecartPieces === 0 ? 'green' : (ecartPieces > 0 ? 'orange' : 'red');
    }
    
    // Comparaison quantité par pièce
    const quantiteParPieceReelle = parseFloat(document.getElementById('quantiteParPieceReelle')?.value) || 0;
    const quantiteParPiecePrevu = selectedCommande.quantiteParPiece || 0;
    const ecartQtyParPiece = quantiteParPieceReelle - quantiteParPiecePrevu;
    
    const ecartQtyParPieceEl = document.getElementById('ecartQtyParPieceVal');
    if (ecartQtyParPieceEl) {
      ecartQtyParPieceEl.textContent = ecartQtyParPiece >= 0 ? `+${ecartQtyParPiece.toFixed(2)}` : ecartQtyParPiece.toFixed(2);
      ecartQtyParPieceEl.style.color = ecartQtyParPiece === 0 ? 'green' : (ecartQtyParPiece > 0 ? 'orange' : 'red');
    }
    
    // Comparaison total
    const totalRecu = nombrePiecesReelles * quantiteParPieceReelle;
    const totalPrevu = nombrePiecesPrevu * quantiteParPiecePrevu;
    const ecartTotal = totalRecu - totalPrevu;
    const pourcentageEcart = totalPrevu > 0 ? ((ecartTotal / totalPrevu) * 100).toFixed(1) : 0;
    
    const ecartTotalEl = document.getElementById('ecartTotalLot');
    if (ecartTotalEl) {
      const signe = ecartTotal >= 0 ? '+' : '';
      ecartTotalEl.value = `${signe}${ecartTotal.toFixed(2)} (${signe}${pourcentageEcart}%)`;
      ecartTotalEl.style.backgroundColor = ecartTotal === 0 ? '#d4edda' : (ecartTotal > 0 ? '#fff3cd' : '#f8d7da');
    }
    
    // Comparaison marque
    const marqueReelle = (document.getElementById('marqueReelle')?.value || '').trim().toLowerCase();
    const marquePrevu = (selectedCommande.marque || 'Non spécifiée').trim().toLowerCase();
    const marqueConforme = marqueReelle === marquePrevu;
    
    const conformeMarqueEl = document.getElementById('conformeMarque');
    if (conformeMarqueEl && marqueReelle) {
      conformeMarqueEl.textContent = marqueConforme ? '✓ Conforme' : '✗ Différente';
      conformeMarqueEl.style.color = marqueConforme ? 'green' : 'orange';
    }
    
    console.log(`📊 Comparaisons LOT mis à jour - Pièces: ${ecartPieces}, Qté/pièce: ${ecartQtyParPiece}, Total: ${ecartTotal} (${pourcentageEcart}%), Marque: ${marqueConforme}`);
  }

  // Ajouter des listeners sur les champs Réalité pour recalculer les totaux et comparaisons
  document.getElementById('nombrePiecesReelles')?.addEventListener('input', function() {
    calculateLotReceptionTotal();
    updateLotComparisons();
  });

  document.getElementById('quantiteParPieceReelle')?.addEventListener('input', function() {
    calculateLotReceptionTotal();
    updateLotComparisons();
  });

  document.getElementById('marqueReelle')?.addEventListener('input', function() {
    updateLotComparisons();
  });

})(); // Fin du module
