export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'http://localhost:8084/ws/tracking',
  keycloak: {
    issuer: 'http://localhost:9091/realms/quickroute',
    clientId: 'quickroute-frontend'
  }
};
