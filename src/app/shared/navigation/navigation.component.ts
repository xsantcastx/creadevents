import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { SeasonalThemeService } from '../../services/seasonal-theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navigation',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationComponent implements OnInit, OnDestroy {
  private seasonalThemeService = inject(SeasonalThemeService);
  private router = inject(Router);
  protected authService = inject(AuthService);

  isMobileMenuOpen = false;
  isScrolled = false;

  ngOnInit(): void {
    this.addScrollListener();
  }

  ngOnDestroy(): void {
    this.removeScrollListener();
  }

  private addScrollListener(): void {
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  private removeScrollListener(): void {
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  private onScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.signOut();
    this.closeMobileMenu();
  }
}
