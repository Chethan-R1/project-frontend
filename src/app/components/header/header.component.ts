import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  userName: string = 'Guest';

   constructor(private userService: UserService) {}

ngOnInit() {
  const userId = localStorage.getItem('userId');
  const fallbackName = localStorage.getItem('userName') || 'Guest';
  console.log('userId from localStorage:', userId);

  if (userId) {
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.userName = user.name || fallbackName;
      },
        error: err => {
          console.error('Error fetching user', err);
          this.userName = fallbackName;
        }
      });
    } else {
    this.userName = fallbackName;
  }
  }
}
