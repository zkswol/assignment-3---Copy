import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service'; // 👈 import it


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'] // <- plural!
})
export class Login {
  form: FormGroup;
  loading = false;
  serverMessage = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router, private authService: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.serverMessage = 'Please enter a valid email and password.';
      return;
    }
    this.loading = true;
    this.serverMessage = '';

    this.authService.login(this.form.value)
      .subscribe({
        next: (res: any) => {
                if (res.user) {
                // if backend returns user data directly
                this.authService.setUser(res.user);
              } else {
                // else call the /api/me endpoint to get user details
                this.authService.fetchMe(res.userId).subscribe(me => this.authService.setUser(me));
              }
          this.serverMessage = res?.message || 'Login successful';
          this.loading = false;
          // navigate to your app's start page after login
          console.log('Navigating to dashboard with userId:', res.user?.userId || res.userId);
          this.authService.navigateWithUserId(['/dashboard-34475338'], res.user.userId);
        },
        error: (err) => {
          // backend sends 401 with { error: 'Invalid credentials' }
          this.serverMessage = err?.error?.error || 'Login failed';
          this.loading = false;
        }
      });
  }
}
