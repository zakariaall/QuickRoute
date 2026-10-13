# QuickRoute

Plateforme de livraison du dernier kilomètre basée sur une architecture microservices (Spring Boot, Angular, Kafka).

## Structure du projet (Monorepo)
* \`api-gateway\` : Point d'entrée unique (Spring Cloud Gateway)
* \`catalog-restaurant-service\` : Gestion du catalogue (PostgreSQL, Redis)
* \`delivery-tracking-service\` : Suivi GPS et assignation des livreurs (MongoDB, WebSockets)
* \`infrastructure\` : Environnement local Docker (Bases de données, Keycloak, Kafka)
* \`notification-service\` : Envoi asynchrone des notifications via événements Kafka
* \`order-service\` : Gestion des commandes (Architecture Hexagonale, Saga Pattern)
* \`payment-service\` : Traitement des paiements
* \`quickroute-frontend\` : Application Web Angular

## Démarrage local

L’instance d’authentification QuickRoute utilise le port `9091` et importe le realm défini dans `infrastructure/keycloak/quickroute-realm.json`. Avant de démarrer, définis localement `POSTGRES_PASSWORD`, `PGADMIN_DEFAULT_PASSWORD`, `MONGO_INITDB_ROOT_PASSWORD` et `KEYCLOAK_ADMIN_PASSWORD`. Ne les ajoute pas au dépôt.

```powershell
docker compose -f infrastructure/docker-compose.yml up -d keycloak-auth
cd quickroute-frontend
npm start
```

Définis aussi `POSTGRES_PASSWORD` et `MONGO_INITDB_ROOT_PASSWORD` dans l’environnement des services Spring lancés hors de Docker. Le realm ne contient aucun compte préconfiguré : crée les comptes depuis l’écran d’inscription ou l’administration locale de Keycloak.

Depuis `/register`, les clients peuvent créer un compte via Keycloak. Les restaurants et les livreurs déposent une demande professionnelle, visible dans « Mes demandes », puis l’équipe l’approuve ou la refuse dans `/admin/applications` avec un compte administrateur Keycloak local. Après approbation, le restaurateur peut utiliser `/restaurant/manage` pour créer sa fiche, gérer ses catégories et ses plats, ouvrir/fermer son établissement et faire avancer les commandes reçues.

Les tarifs de commande sont recalculés depuis le catalogue côté serveur. Les changements de menu et d’état des commandes sont limités au propriétaire du restaurant ou à l’administration. L’application livreur et le paiement en ligne restent à réaliser.
