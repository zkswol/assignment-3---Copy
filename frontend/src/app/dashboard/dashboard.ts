import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private ds = inject(DashboardService);

  user = this.auth.currentUser;     // signal
  stats = this.ds.stats;            // signal
  loading = this.ds.loading;
  error = this.ds.error;

  welcome = computed(() =>
    this.user()?.fullname ? `Welcome, ${this.user()!.fullname}` : 'Welcome'
  );

  // Only chefs can manage recipes
  isChef = computed(() => this.user()?.role === 'chef');

  ngOnInit()  { this.ds.startPolling(30000); }
  ngOnDestroy(){ this.ds.stopPolling(); }

  refreshNow() { this.ds.fetchOnce(); } // manual refresh after actions

  logout() {
    this.auth.logout();
  }
}
