import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-user.component.html',
  styleUrls: ['./login-user.component.css']
})
export class LoginUserComponent {
  email = '';
  password = '';

  constructor(private userService: UserService, private router: Router) {}

  onLogin() {
    if (this.email && this.password) {
      this.userService.login({ email: this.email, password: this.password }).subscribe({
        next: (user) => {
          localStorage.setItem('userId', user.id || '');
          localStorage.setItem('userName', user.name);
          this.router.navigate(['/planning-table']);
        },
        error: (err) => {
          console.error('Login error:', err);
          alert('Login failed.');
        }
      });
    }
  }
}
