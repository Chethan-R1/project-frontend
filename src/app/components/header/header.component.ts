import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  isLoggedIn: boolean = false;
  dropdownOpen: boolean = false;
  isDarkMode: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private eRef: ElementRef
  ) {}

  ngOnInit() {
    const userId = localStorage.getItem('userId');
    const fallbackName = localStorage.getItem('userName') || 'Guest';

    const theme = localStorage.getItem('theme') || 'light';
    this.isDarkMode = theme === 'dark';
    document.body.classList.toggle('dark-mode', this.isDarkMode);

    this.isLoggedIn = !!userId;
    this.userName = fallbackName;

    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          this.userName = user.name || fallbackName;
        },
        error: (err) => {
          console.error('Error fetching user', err);
          this.userName = fallbackName;
        }
      });
    }
  }

  toggleTheme() {
  this.isDarkMode = !this.isDarkMode;
  localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  document.body.classList.toggle('dark-mode', this.isDarkMode);
}

  toggleDropdown() {
    if (this.isLoggedIn) {
      this.dropdownOpen = !this.dropdownOpen;
    }
  }

  navigateTo(path: string) {
    this.dropdownOpen = false;
    this.router.navigate([`/${path}`]);
  }

  logout() {
    localStorage.clear();
    this.isLoggedIn = false;
    this.userName = 'Guest';
    this.dropdownOpen = false;
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }
}
