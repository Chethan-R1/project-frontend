import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  userName: string = ' ';
  dropdownOpen: any;
  isLoggedIn: boolean = false;

   constructor(private userService: UserService,
    private router: Router,
    private eRef: ElementRef
   ) {}

ngOnInit() {
  const userId = localStorage.getItem('userId');
  const fallbackName = localStorage.getItem('userName') || ' ';
  console.log('userId from localStorage:', userId);
  this.isLoggedIn = !!userId;

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
    this.userName = '  ';
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

