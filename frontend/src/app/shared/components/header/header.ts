import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private authService = inject(AuthService);

  isLoggedIn = computed(() => this.authService.user() !== null);
  isSeller = computed(() => this.authService.user()?.role === 'SELLER');

  logout(): void {
    this.authService.logout();
  }
}