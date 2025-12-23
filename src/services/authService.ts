import Keycloak from 'keycloak-js';

class AuthService {
  private keycloak: Keycloak;
  
  constructor() {
    this.keycloak = new Keycloak({
      url: import.meta.env.VITE_KEYCLOAK_URL,
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT
    });
  }
  
  async init(): Promise<boolean> {
    try {
      console.log('Initializing Keycloak...', this.keycloak);
      const authenticated = await this.keycloak.init({
        onLoad: 'login-required',
        pkceMethod: 'S256'
      });
      
      // Set up token refresh
      this.keycloak.onTokenExpired = () => {
        console.log('Token expired, refreshing...');
        this.keycloak.updateToken(30).catch(() => {
          console.error('Failed to refresh token, redirecting to login');
          this.keycloak.login();
        });
      };
      
      return authenticated;
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error);
      return false;
    }
  }

  login(): void {
    this.keycloak.login();
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  isAuthenticated(): boolean {
    return !!this.keycloak.authenticated;
  }

  hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role);
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  getUsername(): string | undefined {
    return this.keycloak.tokenParsed?.preferred_username;
  }
}

export const authService = new AuthService();
export default authService;
