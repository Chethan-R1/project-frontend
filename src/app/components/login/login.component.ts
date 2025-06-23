import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-login',
  imports:[CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
 guestName: string = '';

  constructor(private router: Router, private userService: UserService) {}

onGuestLogin() {
  if (this.guestName.trim()) {
    this.userService.getOrCreateUser(this.guestName).subscribe({
      next: (user) => {
        localStorage.setItem('userId', user.id || '');
        localStorage.setItem('userName', user.name);
        this.router.navigate(['/planning-table']);
      },
      error: (err) => {
        alert('Error during login');
        console.error(err);
      }
    });
  }
}


}