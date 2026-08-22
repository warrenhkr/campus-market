# Politique de confidentialité et règles vendeur

## 1. Objet

Cette documentation fixe les règles de base applicables à la plateforme Campus Market avant le lancement public. Elle sert de base de discussion avec les équipes produit, juridique, sécurité et support pour finaliser la version de production.

## 2. Politique de confidentialité

### 2.1 Données collectées

La plateforme collecte et traite les données suivantes, selon le contexte d’usage :

- identifiants de compte (nom, prénom, email, mot de passe hashé ou authentification fournisseur)
- données de profil étudiant ou vendeur (université, filière, établissement, contact)
- données de boutique (nom, description, contacts, réseaux sociaux, logo, bannière, images)
- contenu commercial (produits, prix, descriptions, variantes, FAQ, médias)
- données de commande (articles, montant, adresse de livraison, téléphone, statut de commande)
- données de paiement (identifiant provider, montant, devise, statut, référence transaction)
- données de vérification (KYC) lorsque le vendeur demande un retrait ou valide sa boutique
- données techniques (logs, erreurs, cookies techniques nécessaires au fonctionnement de l’application)

### 2.2 Finalités

Les données sont utilisées pour :

- créer et sécuriser un compte utilisateur
- gérer la boutique, les produits et les commandes
- lancer et suivre les paiements
- traiter les retraits et les remboursements
- assurer la modération et la conformité du marketplace
- améliorer la qualité du service, les statistiques et la sécurité

### 2.3 Protection des données

- Les informations sensibles comme les clés de paiement ne doivent jamais être exposées côté client.
- Les données de paiement doivent passer par le provider dédié (Fedapay) et les webhooks sécurisés.
- Les fichiers KYC doivent être stockés dans un système de médias sécurisés avec accès limité.
- Les accès administrateurs doivent être restreints et journalisés.

### 2.4 Durée de conservation

- les comptes et profils sont conservés tant que l’utilisateur active son compte ou tant que la plateforme est légalement tenue de conserver les données
- les commandes et paiements sont conservés pour les besoins comptables, de litige et de conformité
- les éléments de modération et les signalements sont conservés pendant la période juridique requise

### 2.5 Droits des utilisateurs

Les utilisateurs doivent pouvoir :

- consulter leurs données
- les corriger
- demander leur suppression, dans le cadre de la législation locale
- contester un traitement
- demander des informations sur l’usage des données

## 3. Règles vendeur

### 3.1 Conditions d’inscription

Pour ouvrir une boutique, le vendeur doit :

- fournir des informations identitaires et de contact valides
- accepter les conditions générales d’utilisation
- confirmer qu’il est autorisé à vendre les produits proposés
- respecter les conditions du marché cible et de la plateforme

### 3.2 Produits autorisés / interdits

Les produits interdits comprennent, sans exhaustivité :

- contrefaçons, produits illégaux ou non conformes
- fraude, arnaque, contenus trompeurs
- objets interdits par la législation locale
- contenus sexuels, violents, ou illégaux
- produits susceptibles de porter atteinte à la sécurité ou à la santé publique

### 3.3 Responsabilités vendeur

Le vendeur doit :

- fournir des descriptions honnêtes, des prix exacts et des images conformes
- accepter les commandes dans les délais annoncés
- assurer le suivi de livraison et la communication client
- respecter les règles de remboursement et de service client
- signaler immédiatement les incidents ou erreurs de stock

### 3.4 Frais et commissions

- La plateforme peut appliquer une commission sur les ventes.
- Les frais doivent être affichés de manière claire avant validation de commande.
- Les montants et méthodes de paiement doivent être documentés dans les conditions d’utilisation.

## 4. Politique de retrait

- Les retraits sont soumis à l’identité vérifiée du vendeur et à la validation des conditions de compte.
- Un seuil minimum peut être appliqué selon les règles de la plateforme.
- Les demandes de retrait doivent être enregistrées avec le statut, le montant et la méthode de paiement.
- Les demandes peuvent être refusées ou suspendues en cas de risque de fraude, de litige ou de document KYC incomplet.

## 5. Politique de remboursement et litiges

- Le vendeur et l’acheteur doivent être informés des conditions de remboursement avant la commande.
- Les remboursements sont traités selon le statut du paiement, le type de produit, et la validité du motif.
- Les disputes doivent être documentées et suivies avec un historique de décisions.
- La plateforme agit comme médiateur et peut intervenir pour vérifier la conformité au règlement.

## 6. Politique de modération

- Les signalements peuvent être soumis par les utilisateurs sur une boutique ou un produit.
- Les signalements sont classés, triés et examinés par l’équipe support/admin.
- Des mesures peuvent inclure : avertissement, suspension temporaire, blocage de vente, suppression de produit ou clôture de boutique.
- Le vendeur a la possibilité de répondre ou de corriger la situation avant fermeture définitive, selon le cas.

## 7. Conformité locale et sécurité

- Vérifier la conformité avec les règles du pays d’exploitation, notamment sur la protection des données et le commerce électronique.
- Vérifier les obligations fiscales, la facturation et la fiscalité locale lorsque la plateforme opère à l’échelle du pays.
- Les paiements doivent être effectués via des intégrations sécurisées et vérifiés avant toute activation en production.

## 8. À finaliser avant lancement live

- afficher les conditions générales d’utilisation et la politique de confidentialité dans le front office
- mettre à disposition une page d’aide / FAQ vendeur
- ajouter un règlement de service client et de médiation des litiges
- finaliser la procédure de paiement vers les vendeurs et le mode live admin
- préparer le switch de paiement FedaPay live via un panneau admin de configuration sécurisée
- activer la modération et les signalements pour les contenus interdits (sexualité explicite, arnaque, contenus dangereux, contrefaçons, etc.)

### 8.1 Vérification vendeur / produit : mode désactivé

La plateforme ne bloque plus l’accès aux vendeurs ou la publication des produits à cause d’une vérification manuelle obligatoire. Cette vérification reste facultative et peut être utilisée comme signal de confiance, mais elle n’est pas un prérequis pour démarrer.

La protection contre les contenus interdits repose plutôt sur :

- la politique de contenu publique
- les signalements utilisateurs
- l’outil de modération admin
- les règles de bannissement des produits interdits
- les restrictions de paiement et de comptabilité

## 9. Position actuelle du projet

La plateforme a déjà les éléments de base pour :

- activer la vente avec un accès sans vérification obligatoire
- mettre en place les demandes de retrait
- gérer les signalements
- enregistrer les paiements et les ordres
- préparer la mise en production FedaPay avec un contrôle admin explicite

Il reste à finaliser la mise en place d’un mode de paiement configurable depuis l’admin, la documentation publique, la modération active et la validation QA finale avant le lancement.
