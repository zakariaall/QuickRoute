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
