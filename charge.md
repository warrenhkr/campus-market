# Archive historique — charge.md

> Ce document n'est plus utilisé comme référence de statut. Il garde uniquement un historique d'architecture et de planification sans valeur opérationnelle pour le dépôt actuel.

## Objet

Ce fichier a servi à documenter la passation initiale du projet et les réflexions de conception du lancement.

## Note de mise à jour

Le dépôt actuel a évolué et la source de vérité est désormais :
- README.md
- DOCUMENTATION_TECHNIQUE.md
- checklist_passation_campus_market.md

Les éléments détaillés précédemment sont conservés à titre d'historique, mais ils ne doivent plus être considérés comme documents actifs ni comme checklist en cours.

7. Réponse vendeur aux avis + signalement + modération
8. Décision business payout vendeur, puis développement associé
9. Vérification policy DELETE sur `users`

### Sprint production
10. `/seller/analytics`, `/seller/earnings` détaillé
11. Tests automatisés (priorité : flux paiement et auth)
12. Job cron expiration abonnement vendeur
13. SEO, `/categories/[slug]`, `/help-center`, `/faq`

---

## Consignes pour l'assistant qui reprend

Le projet a deux apps Next.js séparées partageant la même base Supabase. Style frontend : dark premium vert lime `#A3E635`. Style admin : dark premium violet `#8B5CF6`. Fond commun `#0A0A0A`, surfaces `#111111`/`#1A1A1A`.

Règles strictes : Prisma 5.22.0 uniquement, enums snake_case côté PostgreSQL, `proxy.ts` (pas `middleware.ts`) pour Next.js 16, Server Actions renvoient `{ success, error }` sans `redirect()` direct depuis un Client Component, `router.push() + setTimeout(refresh, 100)` après login, toasts via `sonner`, animations via Framer Motion, panier en `localStorage` (pas de table DB pour l'instant).

Avant tout nouveau développement vendeur lié à l'argent (`payouts`, `earnings`), vérifier d'abord si la décision business a été tranchée — elle ne l'était pas à la fin de cette session.