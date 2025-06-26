import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';

  constructor(private userService: UserService, private router: Router) {}

  onSignup() {
    if (this.name && this.email && this.password) {
      this.userService.signup({ name: this.name, email: this.email, password: this.password }).subscribe({
        next: (user) => {
          localStorage.setItem('userId', user.id || '');
          localStorage.setItem('userName', user.name);
          this.router.navigate(['/planning-table']);
        },
        error: (err) => {
          console.error('Signup error:', err);
          alert('Signup failed.');
        }
      });
    }
  }
}
