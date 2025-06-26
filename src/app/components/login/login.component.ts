import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  guestName: string = '';

  showLoginForm: boolean = false;
  showSignupForm: boolean = false;

  loginEmail: string = '';
  loginPassword: string = '';

  signupName: string = '';
  signupEmail: string = '';
  signupPassword: string = '';

  constructor(private router: Router, private userService: UserService) {}

  onGuestLogin() {
    if (this.guestName.trim()) {
      this.userService.getOrCreateUser(this.guestName).subscribe({
        next: (user) => {
          localStorage.setItem('userId', user.id || '');
          localStorage.setItem('userName', user.name);

          const redirectUrl = localStorage.getItem('redirectAfterLogin');
          localStorage.removeItem('redirectAfterLogin');
          this.router.navigateByUrl(redirectUrl || '/planning-table');
        },
        error: (err) => {
          alert('Error during guest login');
          console.error(err);
        }
      });
    }
  }

  toggleLoginForm() {
    this.showLoginForm = true;
    this.showSignupForm = false;
  }

  switchToSignup(event: Event) {
    event.preventDefault();
    this.showLoginForm = false;
    this.showSignupForm = true;
  }

  switchToLogin(event: Event) {
    event.preventDefault();
    this.showLoginForm = true;
    this.showSignupForm = false;
  }

  onLogin() {
    console.log('Login:', this.loginEmail, this.loginPassword);
    alert('Login successful (mock)');
    this.router.navigate(['/planning-table']);
  }

  onSignup() {
    const newUser = {
      name: this.signupName,
      email: this.signupEmail,
      password: this.signupPassword
    };

    this.userService.create(newUser).subscribe({
      next: (user) => {
        localStorage.setItem('userId', user.id || '');
        localStorage.setItem('userName', user.name);
        this.router.navigate(['/planning-table']);
      },
      error: (err) => {
        alert('Error during signup');
        console.error(err);
      }
    });
  }
}
