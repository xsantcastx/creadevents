import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { SeasonalThemeService } from '../../services/seasonal-theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navigation',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled">
      <div class="nav-container">
        <a routerLink="/" class="brand" (click)="closeMobileMenu()">
          <span class="brand-mark">CreaDEvents</span>
          <span class="brand-subtitle">Floral studio & event design</span>
        </a>

        <button
          class="mobile-toggle"
          type="button"
          (click)="toggleMobileMenu()"
          [attr.aria-expanded]="isMobileMenuOpen"
          aria-controls="primary-navigation"
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div class="nav-menu" [class.open]="isMobileMenuOpen" id="primary-navigation">
          <ul class="nav-links">
            <li class="nav-item">
              <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeMobileMenu()">
                Home
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/services" routerLinkActive="active" (click)="closeMobileMenu()">
                Services
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/portfolio" routerLinkActive="active" (click)="closeMobileMenu()">
                Portfolio
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/season/spring" routerLinkActive="active" (click)="closeMobileMenu()">
                Seasonal Looks
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/testimonials" routerLinkActive="active" (click)="closeMobileMenu()">
                Client Stories
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/about" routerLinkActive="active" (click)="closeMobileMenu()">
                About
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/blog" routerLinkActive="active" (click)="closeMobileMenu()">
                Journal
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/search" routerLinkActive="active" (click)="closeMobileMenu()">
                Search
              </a>
            </li>
            <li class="nav-item mobile-only">
              <a routerLink="/contact" routerLinkActive="active" (click)="closeMobileMenu()">
                Contact
              </a>
            </li>
            
            <!-- Authentication Links -->
            @if (authService.isAuthenticated()) {
              @if (authService.canManageContent()) {
                <li class="nav-item">
                  <a routerLink="/admin" routerLinkActive="active" (click)="closeMobileMenu()">
                    Admin Dashboard
                  </a>
                </li>
              }
              <li class="nav-item">
                <button type="button" (click)="logout()" class="auth-link logout-btn">
                  Logout ({{ authService.currentUser()?.email }})
                </button>
              </li>
            } @else {
              <li class="nav-item">
                <a routerLink="/auth/login" routerLinkActive="active" (click)="closeMobileMenu()">
                  Sign In
                </a>
              </li>
            }
          </ul>

          <div class="nav-cta">
            <a href="tel:7863562958" class="cta-link" (click)="closeMobileMenu()">
              Call (786) 356-2958
            </a>
            <a routerLink="/contact" class="btn btn-primary" (click)="closeMobileMenu()">
              Plan Your Event
            </a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: rgba(252, 250, 248, 0.9);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(34, 48, 45, 0.08);
      transition: box-shadow 0.3s ease, background-color 0.3s ease;
    }

    .navbar.scrolled {
      background: rgba(252, 250, 248, 0.96);
      box-shadow: 0 18px 36px rgba(14, 20, 18, 0.08);
    }

    .nav-container {
      width: min(1100px, 92vw);
      margin: 0 auto;
      height: 90px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .brand {
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .brand-mark {
      font-size: 1.35rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: var(--theme-text, #22302d);
    }

    .brand-subtitle {
      font-size: 0.72rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-top: 0.25rem;
      color: rgba(34, 48, 45, 0.55);
    }

    .mobile-toggle {
      display: none;
      flex-direction: column;
      gap: 0.35rem;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(34, 48, 45, 0.12);
      background: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .mobile-toggle span {
      display: block;
      width: 18px;
      height: 2px;
      background: var(--theme-text, #22302d);
      border-radius: 999px;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }

    .nav-menu {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      gap: 3rem;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.75rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item a {
      position: relative;
      font-size: 0.95rem;
      font-weight: 500;
      color: rgba(34, 48, 45, 0.75);
      text-decoration: none;
      letter-spacing: 0.02em;
      padding: 0.25rem 0;
      transition: color 0.2s ease;
    }

    .nav-item a::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -6px;
      width: 100%;
      height: 2px;
      background: var(--theme-primary, #5e8a75);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.2s ease;
    }

    .nav-item a:hover,
    .nav-item a.active {
      color: var(--theme-text, #22302d);
    }

    .nav-item a:hover::after,
    .nav-item a.active::after {
      transform: scaleX(1);
    }

    .nav-item.mobile-only {
      display: none;
    }

    .nav-cta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .cta-link {
      font-size: 0.9rem;
      text-decoration: none;
      color: rgba(34, 48, 45, 0.65);
      transition: color 0.2s ease;
    }

    .cta-link:hover {
      color: var(--theme-text, #22302d);
    }

    @media (max-width: 960px) {
      .mobile-toggle {
        display: flex;
      }

      .nav-menu {
        position: fixed;
        inset: 90px 0 0 0;
        background: rgba(252, 250, 248, 0.97);
        flex-direction: column;
        align-items: flex-start;
        padding: 2.5rem min(8vw, 2.5rem);
        gap: 2.5rem;
        transform: translateY(-4%);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .nav-menu.open {
        opacity: 1;
        pointer-events: auto;
      }

      .nav-links {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.25rem;
      }

      .nav-item a {
        font-size: 1.1rem;
      }

      .nav-item.mobile-only {
        display: block;
      }

      .nav-cta {
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .nav-cta .btn {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .nav-container {
        height: 80px;
        gap: 1rem;
      }

      .brand-mark {
        font-size: 1.1rem;
      }

      .brand-subtitle {
        letter-spacing: 0.16em;
      }
    }

    /* Authentication Styles */
    .auth-link {
      border: none;
      background: transparent;
      color: inherit;
      font-family: inherit;
      font-size: inherit;
      cursor: pointer;
      text-decoration: none;
      padding: 0;
      transition: color 0.3s ease;
    }

    .auth-link:hover {
      color: var(--theme-primary, #7FB069);
    }

    .logout-btn {
      display: block;
      width: 100%;
      text-align: left;
      padding: 0.5rem 0;
      font-size: 0.9rem;
    }

    @media (min-width: 769px) {
      .logout-btn {
        font-size: 0.85rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
      }
    }
  `]
})
export class NavigationComponent implements OnInit, OnDestroy {
  private seasonalThemeService = inject(SeasonalThemeService);
  private router = inject(Router);
  protected authService = inject(AuthService);

  isMobileMenuOpen = false;
  isScrolled = false;

  private readonly scrollHandler = () => this.onScroll();

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
    }

    this.seasonalThemeService.applyThemeToDocument();

    this.router.events.subscribe(() => {
      this.closeMobileMenu();
    });
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  onScroll(): void {
    if (typeof window !== 'undefined') {
      this.isScrolled = window.scrollY > 40;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  async logout(): Promise<void> {
    try {
      await this.authService.signOut();
      this.closeMobileMenu();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}
