import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "barber" | "admin";
}

export interface AuthResponse {
  token: string;
  user: User;
}

export class AuthService {
  private static TOKEN_KEY = "smartcut_token";
  private static USER_KEY = "smartcut_user";

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  static hasRole(role: "customer" | "barber" | "admin"): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await response.json();
    
    this.setToken(data.token);
    this.setUser(data.user);
    
    return data;
  }

  static async register(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: "customer" | "barber";
  }): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    const data = await response.json();
    
    this.setToken(data.token);
    this.setUser(data.user);
    
    return data;
  }

  static async logout(): Promise<void> {
    this.clearAuth();
    window.location.href = "/";
  }

  static getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Add auth headers to all requests
const originalApiRequest = apiRequest;
export const apiRequestWithAuth = async (
  method: string,
  url: string,
  data?: unknown
): Promise<Response> => {
  const headers = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...AuthService.getAuthHeaders(),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (res.status === 401) {
    AuthService.clearAuth();
    window.location.href = "/login";
  }

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
};
