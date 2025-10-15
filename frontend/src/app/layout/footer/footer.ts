import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer {
  private authService = inject(AuthService);
  
  user = this.authService.currentUser;
  currentYear = new Date().getFullYear();
  
  // Application information
  appInfo = {
    name: 'CloudKitchen Pro',
    version: '1.0.0',
    description: 'Professional kitchen management system for chefs and food service professionals'
  };

  // Quick links
  quickLinks = [
    { label: 'Dashboard', route: '/dashboard-34475338' },
    { label: 'Recipes', route: '/list-recipes-34475338' },
    { label: 'Inventory', route: '/inventory' },
    { label: 'Add Recipe', route: '/recipes/new' },
    { label: 'Add Inventory', route: '/inventory/new' }
  ];

  // Contact information
  contactInfo = {
    student: 'Khor Zhi Kun',
    studentId: '34475338',
    course: 'FIT2095 - Full Stack Development'
  };

}
