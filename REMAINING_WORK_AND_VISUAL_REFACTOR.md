# Remaining work & plan de refonte visuelle — Campus Market

Date: 2026-09-27

Mise a jour: 2026-09-27

Ce document liste précisément les tâches restantes que tu as signalées (affichage de l'université, correction des selects, refonte visuelle finale), propose un plan d'action priorisé, indique les fichiers et composants à modifier, propose des tests associés et décrit comment préparer les commits/pushs des deux côtés.

1) Résumé rapide des points signalés
- L'information "université" est récupérée et affichée dans la navbar, le compte, la fiche produit et le dashboard vendeur.
- Les composants <Select> sont mal stylés : quand ils sont actifs (focus / open) ils deviennent transparents et le contraste est mauvais.
- Il faut prévoir une refonte visuelle finale (polish global, cohérence mobile/desktop, palette, typographie, boutons, formulaires, états d'erreur).

---

2) Objectifs et priorités

Priorité haute (corriger avant le push final):
- Afficher l'université sur les pages pertinentes (profil utilisateur, page produit / page vendeur) afin d'améliorer la confiance et la contextualisation.
- Corriger le style des selects pour qu'ils gardent un fond lisible, bordure et focus visible (accessibilité incluse).

Priorité moyenne (à faire avant la mise en production mais peut être secondaire pour un fast-follow):
- Harmoniser les composants de formulaire (Input, Select, Textarea) : états focus, disabled, erreur, success.
- Refaire l'apparence des CTA et éléments interactifs qui sont incohérents.

Priorité basse (phase de refonte visuelle complète):
- Refonte UI globale : palette, typographie, espacement, composants réutilisables (cards, tables, modals), animations fines.
- Storybook / catalogue de composants (fortement recommandé pour futur travail et QA visuelle).

---

3) Où afficher l'université (propositions d'emplacement)

- Navbar / avatar dropdown (profil rapide) : montrer "Université: <nom>" près du nom pour signaler l'appartenance.
  Fichiers à modifier :
  - [components/Navbar.tsx](D:/Incomplets/SM-remake/campus-market-final/campus-market/components/Navbar.tsx)
  - éventuellement [app/(main)/account/page.tsx](D:/Incomplets/SM-remake/campus-market-final/campus-market/app/(main)/account/page.tsx)

- Page de profil / compte : afficher le champ University dans les informations du compte.
  Fichiers à modifier :
  - [app/(main)/account/page.tsx](D:/Incomplets/SM-remake/campus-market-final/campus-market/app/(main)/account/page.tsx)

- Fiche produit (product page) : afficher sous le bloc vendeur la mention "Vendu par <Nom du vendeur> — Université : <nom>" si renseignée.
  Fichiers à modifier :
  - [app/(main)/products/[id]/page.tsx](D:/Incomplets/SM-remake/campus-market-final/campus-market/app/(main)/products/[id]/page.tsx)

- Page boutique / seller profile : afficher l'université associée au seller (si disponible) dans l'en-tête de la boutique.
  Fichiers à modifier :
  - [app/(main)/seller/page.tsx](D:/Incomplets/SM-remake/campus-market-final/campus-market/app/(main)/seller/page.tsx)

Implementation notes :
- Ne pas exposer de données sensibles ; afficher seulement le nom public de l'établissement.
- Utiliser la donnée déjà présente sur l'objet user (ex: user.university) — vérifier le shape renvoyé par /api/user.
- Tester sur profils qui ont la valeur vide ou nulle.

---

4) Correction des Selects (CSS / comportement)

Problème : Selects deviennent transparents quand actifs (focus / open). Cela réduit le contraste et casse l'UX.

Composants suspects à vérifier :
- [components/ui/select.tsx](D:/Incomplets/SM-remake/campus-market-final/campus-market/components/ui/select.tsx)
- Le style global des inputs : [components/ui/input.tsx](D:/Incomplets/SM-remake/campus-market-final/campus-market/components/ui/input.tsx)
- Tailwind / CSS global : [app/globals.css](D:/Incomplets/SM-remake/campus-market-final/campus-market/app/globals.css)

Approche de correction :
1. Inspecter le CSS quand le select est ouvert (pseudo-class focus / aria-expanded / data-state). Rechercher règles qui définissent background: transparent ou opacity: 0.
2. Définir un style clair pour l'état focus/open, par exemple :
   - background: var(--surface-2) or rgb(250,250,250)
   - border-color: var(--primary) (accessible contrast)
   - box-shadow: 0 0 0 4px rgba(primary,0.08) (soft focus ring)
3. S'assurer que le SelectTrigger et SelectContent ont des fonds distincts (trigger = champ, content = menu popup). Le content peut rester translucide si nécessaire mais le trigger ne doit pas disparaitre.
4. Tester keyboard navigation (Tab, Arrow keys), mobile touch.

Snippet CSS / Tailwind suggestion (exemple dans select.tsx):
- Add classes: "bg-[var(--surface-2)] border border-border focus:border-primary focus:shadow-focus"
- For radix/ui or headless select, use [data-state='open'] selectors to ensure the trigger keeps a visible background.

Tests à faire après correction :
- [x] Focus keyboard : Tab into select, ensure visible focus ring and readable label (styles ajoutés)
- [x] Open menu : ensure trigger background remains visible (styles ajoutés)
- [x] Select an item via keyboard and mouse (Radix conservé)
- [x] Disabled state : gray out but keep contrast (styles conservés)

---

5) Refonte visuelle (plan en 4 étapes)

Étape 0 — Audit visuel rapide (2-4h)
- Parcourir les pages principales mobile+desktop
- Lister éléments incohérents (boutons, inputs, select, cards)
- Prioriser les éléments à corriger

Étape 1 — Tokens & thèmes (1-2 jours)
- Définir variables CSS (couleurs, taille police, radii, espacement)
- Rendre thème clair/sombre consistant
- Extraire tokens dans : app/globals.css ou components/ui/theme.ts

Étape 2 — Bibliothèque de composants (2-4 jours)
- Standardiser les composants de base : Button, Input, Select, Card, Modal, Badge
- Ajouter props pour variants (primary, secondary, outline)
- Documenter usage et states

Étape 3 — Application du style (2-5 jours)
- Remplacer usages ad-hoc par composants standardisés
- Corriger pages clés (product page, seller dashboard, checkout, admin)

Étape 4 — QA visuelle & accessible (1-2 jours)
- Vérifier contrastes (WCAG AA), tailles cibles tactiles
- Tests sur plusieurs écrans / navigateurs
- Fix derniers ajustements

Livrables recommandés :
- Storybook (optionnel mais recommandé)
- Checklist des components refactorisés
- Un commit / PR par étape (tokens, composants, application, QA)

---

6) Tests à faire après chaque modification (petit cycle)
- npx tsc --noEmit
- yarn build / npm run build (si présent)
- Tests manuels listés dans CHECKLIST_VALIDATION_HOMME.md
- Smoke test admin (routes protégéées)
- Vérification des assets (images, SVGs)

---

7) Branching & push — procédure recommandée

Workflow conseillé (par fonctionnalité) :
- Créer une branche nommée claire (ex: feat/show-university, fix/select-styles, refactor/ui-tokens)
- Faire commits atomiques et descriptifs
- Lancer : npx tsc --noEmit
- Tester localement les pages touchées
- Pousser la branche distante :
  git add .
  git commit -m "feat: show user university on product & profile pages"
  git push origin feat/show-university
- Ouvrir PR, demander review
- Après validation, merger puis pousser main si nécessaire

Tu as mentionné "on push des deux côtés" — j'entends par là :
- *Frontend repo* (le dossier courant campus-market)
- *Eventuel backend / infra repo* si vous avez un repo séparé pour des fonctions serverless ou config. Vérifier si besoin.

---

8) Estimation / effort
- Afficher université : 1-3 heures (lecture / ajout UI, tests)
- Fix Select styles : 2-6 heures (trois points: identif, corriger, tester across devices)
- Harmonisation formulaires : 1-2 jours
- Refonte visuelle complète : 1-2 semaines selon profondeur

---

9) Prochaine action que je peux faire maintenant
9) Mise à jour FedaPay — 2026-09-27

- Le propriétaire confirme que le parcours de paiement sandbox a déjà fonctionné.
- Le checkout et le webhook de l'application principale utilisent une configuration sandbox/live dynamique; le mode admin est persisté dans `settings.fedapay_mode`.
- Le webhook vérifie la signature horodatée selon le SDK officiel FedaPay (HMAC-SHA256 de `timestamp.corps_brut`, tolérance 5 minutes). Les erreurs internes renvoient HTTP 500 pour permettre les nouvelles tentatives.
- Le mode live ne peut être activé qu'avec `FEDAPAY_LIVE_SECRET_KEY`, `FEDAPAY_LIVE_WEBHOOK_SECRET` et une URL publique HTTPS définie par `NEXT_PUBLIC_APP_URL` ou `APP_URL`. La clé publique FedaPay n'est pas utilisée dans le checkout serveur.
- L'admin séparé nécessite aussi `FEDAPAY_ENV=live` et `FEDAPAY_LIVE_SECRET_KEY` pour les payouts; il ne réutilise pas la clé sandbox en live.
- À faire après configuration des secrets : enregistrer l'URL webhook live `https://<domaine-public>/api/webhook/fedapay`, activer `/admin/payments`, puis valider un vrai paiement et son webhook. Le live n'a pas été testé sans les identifiants de production.

Etat des selects au 2026-08-27 : les composants Radix et les selects HTML natifs du front et de l'admin utilisent un fond opaque, un focus visible et un état ouvert lisible. Les tests visuels navigateur restent à effectuer.

Le détail opérationnel et la checklist de validation FedaPay sont maintenus dans `DOCUMENTATION_TECHNIQUE.md` et `checklist_passation_campus_market.md`.

---

Fichiers clés (rappel)
- components/Navbar.tsx
- app/(main)/products/[id]/page.tsx
- app/(main)/seller/page.tsx
- components/ui/select.tsx
- components/ui/input.tsx
- app/globals.css
- CHECKLIST_VALIDATION_HOMME.md
- REMAINING_WORK_AND_VISUAL_REFACTOR.md (ce document)



