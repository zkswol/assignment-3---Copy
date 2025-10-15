import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Stats = { users: number; recipes: number; inventory: number };

@Injectable({ providedIn: 'root' })
export class DashboardService {
  api = '';
  stats = signal<Stats | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  private timerId: any = null;

  constructor(private http: HttpClient) {}

  fetchOnce() {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Stats>(`${this.api}/stats-34475338`).subscribe({
      next: (s) => { this.stats.set(s); this.loading.set(false); },
      error: () => { this.error.set('Failed to load stats'); this.loading.set(false); }
    });
  }

  startPolling(ms = 30000) {
    if (this.timerId) return;      // already polling
    this.fetchOnce();              // initial load immediately
    this.timerId = setInterval(() => this.fetchOnce(), ms);
  }

  stopPolling() {
    if (this.timerId) { clearInterval(this.timerId); this.timerId = null; }
  }
}
