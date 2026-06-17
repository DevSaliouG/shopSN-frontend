// src/app/shared/components/header/header.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../features/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  protected authService = inject(AuthService);
  private router = inject(Router);

  dropdownOpen = signal(false);
  mobileMenuOpen = signal(false);
  searchQuery = signal('');

  toggleDropdown() {
    this.dropdownOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  logout() {
    this.authService.logout();
  }

  onSearch() {
    const query = this.searchQuery().trim();
    if (query) {
      this.router.navigate(['/recherche'], { queryParams: { q: query } });
    }
  }
}