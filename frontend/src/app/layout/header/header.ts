import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.currentUser;

  // Computed properties
  isLoggedIn = computed(() => !!this.user());
  userName = computed(() => this.user()?.fullname || 'User');
  userRole = computed(() => this.user()?.role || '');

  // Navigation items
  navItems = [
    { label: 'Dashboard', route: '/dashboard-34475338', icon: '🏠' },
    { label: 'Recipes', route: '/list-recipes-34475338', icon: '👨‍🍳' },
    { label: 'Inventory', route: '/inventory', icon: '📦' }
  ];

  logout() {
    this.authService.logout();
  }

  navigateTo(route: string) {
    const userId = this.authService.getUserId();
    if (userId) {
      this.router.navigate([route], { queryParams: { userId } });
    } else {
      this.router.navigate([route]);
    }
  }
}
