import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service'; // 👈 import it


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  registerForm: FormGroup;
  serverMessage = '';
  loading = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService, private router: Router) {
    // initialize form
    this.registerForm = this.fb.group({
      fullname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      role: ['user'],
      phone: ['']
    });
  }

  // 🧠 This runs when you click the Register button
  onSubmit() {
    if (this.registerForm.invalid) {
      this.serverMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.loading = true;

    // 💥 here’s your POST request
    this.authService.register(this.registerForm.value)
      .subscribe({
        next: (res: any) => {
          this.serverMessage = res.message || 'User registered successfully!';
          this.loading = false;
        },
        error: (err) => {
          console.error('Registration error:', err);
          this.serverMessage = err.error?.error || 'Registration failed!';
          this.loading = false;
        }
      });
  }
}