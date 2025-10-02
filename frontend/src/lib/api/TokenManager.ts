'use client';

const TOKEN_KEYS = {
  AUTH_TOKEN: 'auth_token',
  TOKEN_EXPIRY: 'token_expiry',
};

const TOKEN_EXPIRATION_TIME = 4 * 60 * 60 * 1000;
let tokenExpirationTimeout: number | undefined;

export class TokenManager {
  static storeTokens(token: string): void {
    if (typeof window === 'undefined') return;    
    localStorage.setItem(TOKEN_KEYS.AUTH_TOKEN, token);    
    const expiryTime = Date.now() + TOKEN_EXPIRATION_TIME;
    localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());
    this.setupTokenExpiration();
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;    
    if (this.isTokenExpired()) {
      this.clearTokens();
      return null;
    }
    
    return localStorage.getItem(TOKEN_KEYS.AUTH_TOKEN);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEYS.AUTH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRY);    
    if (tokenExpirationTimeout) {
      clearTimeout(tokenExpirationTimeout);
      tokenExpirationTimeout = undefined;
    }
  }

  static updateToken(token: string): void {
    if (typeof window === 'undefined') return;    
    localStorage.setItem(TOKEN_KEYS.AUTH_TOKEN, token);    
    const expiryTime = Date.now() + TOKEN_EXPIRATION_TIME;
    localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());    
    this.setupTokenExpiration();
  }
  
  static isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true;
    
    const expiryTimeStr = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
    if (!expiryTimeStr) return true;
    
    const expiryTime = parseInt(expiryTimeStr, 10);
    return Date.now() >= expiryTime;
  }
  
  static setupTokenExpiration(): void {
    if (typeof window === 'undefined') return;    
    if (tokenExpirationTimeout) {
      clearTimeout(tokenExpirationTimeout);
    }
    
    const expiryTimeStr = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
    if (!expiryTimeStr) return;
    
    const expiryTime = parseInt(expiryTimeStr, 10);
    const timeRemaining = Math.max(0, expiryTime - Date.now());    
    tokenExpirationTimeout = window.setTimeout(() => {
      this.clearTokens();
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }, timeRemaining);
  }
  
  static initTokenExpirationCheck(): void {
    if (typeof window === 'undefined') return;    
    if (localStorage.getItem(TOKEN_KEYS.AUTH_TOKEN)) {
      this.setupTokenExpiration();
    }
  }
} 