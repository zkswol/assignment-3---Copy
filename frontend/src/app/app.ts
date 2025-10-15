import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html'
})

export class App implements OnInit {
  
  private auth = inject(AuthService);
  private router = inject(Router);

  async ngOnInit() {
    console.log('App component initialized');
    
    // Use AuthService to handle route validation and authentication
    await this.auth.initializeAuthForValidRoutes();
  }
}
