// src/app/auth/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, Routes } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<{ fullname: string; userId?: string; email?: string; role?: string } | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  register(data: any) {
    return this.http.post('http://localhost:8080/register-34475338', data);
  }

  login(data: any) {
    return this.http.post<any>('http://localhost:8080/login-34475338', data);
  }

  // call this after login if backend doesn't return user
  fetchMe(userId: string) {
    return this.http.get<any>(`http://localhost:8080/me-34475338?userId=${userId}`);
  }

  setUser(user: any) {
    this.currentUser.set(user);
  }

  getUserId() {
    return this.currentUser() ? this.currentUser()!.userId : null;
  }

  logout() {
    this.currentUser.set(null);
    // Navigate to login without userId param
    this.router.navigate(['/login-34475338']);
  }

  readUserIdFromUrl(): string | null {
    const sp = new URL(window.location.href).searchParams;
    return sp.get('userId');
  }

  // Navigate with userId preserved in URL
  navigateWithUserId(route: string[], userId: string) {
    this.router.navigate(route, { queryParams: { userId } });
  }

  // Check if user is authenticated (has userId in URL or currentUser)
  isAuthenticated(): boolean {
    const urlUserId = this.readUserIdFromUrl();
    const currentUserId = this.getUserId();
    return !!(urlUserId || currentUserId);
  }

  // Initialize user from URL on app start
  async initializeFromUrl(): Promise<boolean> {
    const userId = this.readUserIdFromUrl();
    if (!userId) {
      return false;
    }

    try {
      const response = await this.fetchMe(userId).toPromise();
      if (response && response.user) {
        this.setUser(response.user);
        return true;
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
    return false;
  }

  // Check if a route requires authentication
  shouldCheckAuth(url: string): boolean {
    // Define routes that should skip auth check (public routes + 404)
    const publicRoutes = [
      '/login-34475338',
      '/register-34475338'
    ];
    
    // If it's a public route, don't check auth
    if (publicRoutes.includes(url)) {
      return false;
    }
    
    // If it's an invalid route (404), don't check auth
    if (!this.isValidRoute(url)) {
      return false;
    }
    
    // For all other routes, check auth
    return true;
  }

  // Check if a route is valid (exists in our routing configuration)
  isValidRoute(url: string): boolean {
    // Define all valid routes from our routing configuration
    const validRoutes = [
      '/login-34475338',
      '/register-34475338',
      '/dashboard-34475338',
      '/list-recipes-34475338',
      '/recipes/new',
      '/inventory',
      '/inventory/new'
    ];
    
    // Check exact matches
    if (validRoutes.includes(url)) {
      return true;
    }
    
    // Check dynamic routes with regex patterns
    const dynamicPatterns = [
      /^\/recipes\/[^\/]+\/detail$/,  // /recipes/:id/detail
      /^\/recipes\/[^\/]+\/edit$/,    // /recipes/:id/edit
      /^\/inventory\/[^\/]+\/edit$/   // /inventory/:id/edit
    ];
    
    return dynamicPatterns.some(pattern => pattern.test(url));
  }

  // Initialize authentication check for valid routes only
  async initializeAuthForValidRoutes(): Promise<boolean> {
    const currentUrl = window.location.pathname;
    
    // Only check authentication for routes that require it
    if (!this.shouldCheckAuth(currentUrl)) {
      console.log(`Route ${currentUrl} does not require auth check`);
      return true; // Allow the route to load
    }
    
    // For routes that require auth, check if user is authenticated
    const userInitialized = await this.initializeFromUrl();
    
    if (!userInitialized) {
      console.log('No valid userId found, redirecting to login');
      this.router.navigateByUrl('/login-34475338');
      return false;
    } else {
      console.log('User initialized from URL');
      return true;
    }
  }
}
