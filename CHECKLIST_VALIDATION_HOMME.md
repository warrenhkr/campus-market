# Checklist de validation manuel — Campus Market

## Objet
Cette checklist sert à valider le projet avant le push final et avant toute activation du mode live FedaPay. Elle couvre les parcours acheteur, vendeur, admin, pages légales, conformité et sécurité.

Important :
- La validation vendeur et la validation produit ne sont pas des barrières obligatoires.
- La protection repose sur la modération, les règles de contenu, les signalements et les sanctions admin.
- Le mode live FedaPay reste désactivé tant que la configuration de production n’a pas été validée.

---

## 1. Authentification et comptes

### 1.1 Inscription / connexion
- [ ] Créer un compte utilisateur classique
- [ ] Vérifier l’arrivée sur le dashboard / compte
- [ ] Se connecter avec le bon compte
- [ ] Se déconnecter
- [ ] Vérifier la redirection après déconnexion
- [ ] Tester l’accès avec un compte non connecté sur une page protégée
- [ ] Vérifier le comportement si l’utilisateur n’est pas authentifié

### 1.2 Rôle vendeur
- [ ] Devenir vendeur depuis le flux candidat
- [ ] Vérifier la création de la boutique / seller profile
- [ ] Vérifier qu’aucune validation obligatoire n’empêche la publication
- [ ] Vérifier la visibilité du dashboard vendeur

### 1.3 Rôle admin
- [ ] Se connecter avec un compte admin
- [ ] Vérifier l’accès au panneau admin
- [ ] Vérifier l’accès refusé à un compte non admin

---

## 2. Parcours acheteur

### 2.1 Accueil et navigation
- [ ] Ouvrir la page d’accueil
- [ ] Vérifier les catégories / produits visibles
- [ ] Tester la recherche par mot-clé
- [ ] Vérifier la navigation principale
- [ ] Vérifier le footer et les liens légaux

### 2.2 Produit
- [ ] Ouvrir une fiche produit
- [ ] Vérifier le nom, le prix, la description, l’image, la galerie
- [ ] Vérifier les variantes / stock / disponibilité
- [ ] Vérifier le bouton CTA / ajout au panier
- [ ] Vérifier les informations vendeur et boutique

### 2.3 Panier / checkout
- [ ] Ajouter un produit au panier
- [ ] Vérifier le panier
- [ ] Modifier quantité / retirer produit
- [ ] Valider le checkout
- [ ] Vérifier le mode sandbox actif
- [ ] Simuler le paiement
- [ ] Vérifier le retour vers la page de succès / échec

### 2.4 Commande
- [ ] Vérifier le statut de la commande dans le compte utilisateur
- [ ] Vérifier le détail de la commande
- [ ] Vérifier la liste des commandes
- [ ] Vérifier la bonne récupération des informations de paiement

---

## 3. Parcours vendeur

### 3.1 Dashboard vendeur
- [ ] Ouvrir le dashboard vendeur
- [ ] Vérifier l’affichage des sections clés
- [ ] Vérifier la navigation dans le seller nav
- [ ] Vérifier le mode mobile et le menu “Plus”
- [ ] Vérifier le bon affichage des boutons / cartes / composants

### 3.2 Boutique
- [ ] Créer / modifier une boutique
- [ ] Vérifier le slug et le nom
- [ ] Vérifier l’édition des infos de la boutique
- [ ] Vérifier le stockage de la boutique et ses paramètres

### 3.3 Produits
- [ ] Créer un produit
- [ ] Vérifier qu’il est publié sans validation obligatoire
- [ ] Vérifier le produit côté front office
- [ ] Modifier le produit
- [ ] Vérifier la mise à jour
- [ ] Supprimer / désactiver le produit si besoin
- [ ] Vérifier les cas où le produit est indisponible

### 3.4 Retraits
- [ ] Ouvrir la page de retrait
- [ ] Demander un retrait
- [ ] Vérifier que le retrait est bien créé en statut PENDING
- [ ] Vérifier l’historique
- [ ] Vérifier que le retrait ne dépend pas d’une validation KYC obligatoire

### 3.5 Centre d’aide vendeur
- [ ] Ouvrir /seller/help
- [ ] Vérifier les FAQ
- [ ] Vérifier les coordonnées de support
- [ ] Vérifier les liens vers les règles / légales

---

## 4. Parcours admin

### 4.1 Modération
- [ ] Ouvrir /admin/reports
- [ ] Vérifier le tableau de signalements
- [ ] Vérifier les colonnes importantes : raison, vendeur, produit, signalant, date
- [ ] Passer un signalement en INVESTIGATING
- [ ] Passer un signalement en RESOLVED
- [ ] Passer un signalement en DISMISSED
- [ ] Vérifier que le statut est bien affiché dans l’UI

### 4.2 Paiements / FedaPay
- [ ] Ouvrir /admin/payments
- [ ] Vérifier le mode actuel : sandbox
- [ ] Vérifier le message si les clés live sont manquantes
- [ ] Tester la tentative d’activation live sans clés
- [ ] Vérifier que le mode ne passe pas en live sans configuration complète
- [ ] Vérifier le rafraîchissement de la page

### 4.3 Règles et conflits
- [ ] Vérifier qu’aucune validation obligatoire n’est imposée sur les vendeurs
- [ ] Vérifier qu’aucune validation produit obligatoire n’est imposée
- [ ] Vérifier que la modération admin reste la vraie protection

---

## 5. Modération / sécurité / conformité

### 5.1 Contenus interdits
- [ ] Vérifier que les règles de contenu sont visibles et claires
- [ ] Vérifier qu’un produit douteux peut être signalé
- [ ] Vérifier qu’un admin peut traiter le signalement rapidement
- [ ] Vérifier qu’un compte / boutique douteux peut être suspendu ou sanctionné
- [ ] Vérifier la politique sur les contenus illégaux, dangereux, obscènes, contrefaits, frauduleux

### 5.2 Signalements
- [ ] Tester un signalement sur un produit
- [ ] Tester un signalement sur une boutique
- [ ] Vérifier le stockage côté base / API
- [ ] Vérifier l’état après traitement admin

### 5.3 Conformité
- [ ] Vérifier les pages de règles publiques
- [ ] Vérifier les mentions légales / confidentialité
- [ ] Vérifier l’absence de contradictions entre la politique et les règles fonctionnelles

---

## 6. Pages légales et support

### 6.1 Pages publiques
- [ ] Ouvrir /legal
- [ ] Ouvrir /legal/confidentialite
- [ ] Ouvrir /legal/conditions
- [ ] Ouvrir /legal/vendeur
- [ ] Vérifier le texte et le sens des règles
- [ ] Vérifier les liens de navigation

### 6.2 Aide / FAQ
- [ ] Ouvrir /help
- [ ] Vérifier le FAQ public
- [ ] Ouvrir /seller/help
- [ ] Vérifier le FAQ vendeur
- [ ] Vérifier les liens vers les règles et le support

### 6.3 Footer
- [ ] Vérifier le footer sur les pages principales
- [ ] Vérifier les liens Aide / Mentions / Confidentialité / CGU / Règles vendeur

---

## 7. Qualité UX / stabilité

- [ ] Vérifier les messages d’erreur pour les cas non autorisés
- [ ] Vérifier les états vides (aucun produit, aucune commande, aucun signalement)
- [ ] Vérifier les chargements et spinners lorsque nécessaire
- [ ] Vérifier les tailles et alignements sur mobile et desktop
- [ ] Vérifier les éléments sur différents écrans / résolutions
- [ ] Vérifier la cohérence du design et des couleurs
- [ ] Vérifier le comportement si le backend retourne une erreur

---

## 8. Sécurité de base

- [ ] Vérifier que les routes admin refusent les comptes non admins
- [ ] Vérifier que les pages protégées redirigent correctement
- [ ] Vérifier que le mode live reste désactivé sans validation admin
- [ ] Vérifier qu’aucune donnée sensible n’est exposée en clair
- [ ] Vérifier qu’aucune clé de production est activée dans la base / code visible
- [ ] Vérifier les logs serveur pour erreurs graves

---

## 9. Critères de validation pour push final

Le projet est prêt à être pushé si :
- [ ] tous les parcours acheteur et vendeur sont fonctionnels
- [ ] les pages légales et l’aide sont visibles et cohérentes
- [ ] l’admin peut modérer les signalements
- [ ] le mode live reste verrouillé et ne s’active pas sans configuration
- [ ] les règles de contenu interdit sont clairement posées
- [ ] il n’y a plus de blocage obligatoire de validation produit / compte vendeur
- [ ] il n’y a pas d’erreur bloquante en compilation / runtime

---

## 10. Préparation du push final

Avant le push final :
- [ ] vérifier le git status
- [ ] valider les fichiers modifiés
- [ ] faire un commit propre par sujet si nécessaire
- [ ] pousser la branche de travail
- [ ] éventuellement merger la branche principale selon votre workflow
- [ ] garder le mode live désactivé jusqu’à validation finale explicitement demandée

---

## 11. Étape finale recommandée

Une fois les tests ci-dessus validés :
- [ ] préparer le mode live avec la vraie configuration FedaPay
- [ ] faire la validation finale du live
- [ ] activer le mode live sous supervision
- [ ] passer en mode production uniquement lorsque tout est validé
