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
      clearPrevisionsDisplay();
      return;
    }

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
    const quantiteUnit = document.getElementById('uniteReceptionLabel')?.textContent || 'unités';
    
    document.getElementById('prevQuantite').textContent = commande.quantiteCommandee || '-';
    document.getElementById('prevQuantiteUnit').textContent = quantiteUnit;
    document.getElementById('prevDelai').textContent = commande.delaiLivraisonPrevu || '-';
    document.getElementById('prevEtat').textContent = commande.etatPrevu || '-';

    // ✅ AFFICHER LA SECTION RÉALITÉ & COMPARAISON POUR LES COMMANDES
    const sectionRealite = document.getElementById('sectionRealiteComparaison');
    if (sectionRealite) {
      sectionRealite.style.display = 'block';
      
      // Déterminer le type de produit (simple ou LOT)
      const produitId = document.getElementById('produitReception').value;
      const produit = window.PRODUITS_RECEPTION?.find(p => p._id === produitId);
      
      if (produit) {
        // Vérifier si c'est un produit LOT (typeProduitId.typeStockage === 'lot')
        const isLot = produit.typeProduitId?.typeStockage === 'lot';
        
        // Afficher les champs appropriés
        const realiteSimple = document.getElementById('realiteSimple');
        const realieLot = document.getElementById('realieLot');
        
        if (isLot) {
          realiteSimple.style.display = 'none';
          realieLot.style.display = 'block';
          // Pré-remplir les prévisions du LOT
          document.getElementById('prevPiecesVal').textContent = commande.quantiteCommandee || '-';
        } else {
          realiteSimple.style.display = 'block';
          realieLot.style.display = 'none';
          // Pré-remplir les prévisions simples
          document.getElementById('prevQuantiteVal').textContent = commande.quantiteCommandee || '-';
          document.getElementById('uniteRealReception').textContent = quantiteUnit;
        }
        
        // Pré-remplir les dates et états
        if (commande.dateEcheance) {
          const dateEcheance = new Date(commande.dateEcheance).toISOString().split('T')[0];
          document.getElementById('prevDateVal').textContent = dateEcheance;
        }
        
        document.getElementById('prevEtatVal').textContent = commande.etatPrevu || '-';
      }
    }
  }

  // Réinitialiser l'affichage des prévisions
  function clearPrevisionsDisplay() {
    document.getElementById('prevQuantite').textContent = '-';
    document.getElementById('prevDelai').textContent = '-';
    document.getElementById('prevEtat').textContent = '-';
    
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
    'dateReceptionReelle',
    'etatReel',
    'problemesIdentifies'
  ];

  fieldsToWatch.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('change', () => {
        calculateScore();
        updateComparaisons();
      });
      field.addEventListener('input', updateComparaisons);
    }
  });

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
      const piecesPrevues = selectedCommande.quantiteCommandee || 0;
      const ecart = piecesReelles - piecesPrevues;
      const ecartPourcent = piecesPrevues > 0 ? Math.round((ecart / piecesPrevues) * 100) : 0;
      
      const ecartPiecesEl = document.getElementById('ecartPiecesVal');
      if (ecartPiecesEl) {
        ecartPiecesEl.textContent = 
          `${ecart >= 0 ? '+' : ''}${ecart} (${ecartPourcent >= 0 ? '+' : ''}${ecartPourcent}%)`;
        ecartPiecesEl.style.color = ecart >= 0 ? 'green' : 'red';
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
  }

  // Calculer le score fournisseur
  function calculateScore() {
    if (!selectedCommande) {
      document.getElementById('sectionScoreFournisseur').style.display = 'none';
      return;
    }

    // Récupérer les valeurs réelles
    const quantiteReelle = parseFloat(document.getElementById('quantiteReception').value) || 0;
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
    if (quantiteReelle > 0) {
      const quantitePrevue = selectedCommande.quantiteCommandee || 0;
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

})(); // Fin du module
