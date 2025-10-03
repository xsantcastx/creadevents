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
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .navbar.scrolled {
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      gap: 40px;
    }

    .brand {
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      transition: transform 0.2s ease;
    }

    .brand:hover {
      transform: translateY(-1px);
    }

    .brand-mark {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #1a202c;
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-top: 2px;
      color: #718096;
      font-weight: 500;
    }

    .mobile-toggle {
      display: none;
      flex-direction: column;
      gap: 4px;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 8px;
    }

    .mobile-toggle:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .mobile-toggle span {
      display: block;
      width: 20px;
      height: 2px;
      background: #2d3748;
      border-radius: 1px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .mobile-toggle[aria-expanded="true"] span:nth-child(1) {
      transform: rotate(45deg) translate(6px, 6px);
    }

    .mobile-toggle[aria-expanded="true"] span:nth-child(2) {
      opacity: 0;
    }

    .mobile-toggle[aria-expanded="true"] span:nth-child(3) {
      transform: rotate(-45deg) translate(6px, -6px);
    }

    .nav-menu {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      gap: 40px;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 32px;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item a,
    .nav-item button {
      position: relative;
      font-size: 15px;
      font-weight: 500;
      color: #4a5568;
      text-decoration: none;
      letter-spacing: -0.01em;
      padding: 8px 12px;
      border-radius: 6px;
      transition: all 0.2s ease;
      border: none;
      background: transparent;
      cursor: pointer;
      font-family: inherit;
      white-space: nowrap;
    }

    .nav-item a:hover,
    .nav-item button:hover {
      color: #2d3748;
      background: rgba(0, 0, 0, 0.04);
    }

    .nav-item a.active {
      color: #2b6cb0;
      background: rgba(43, 108, 176, 0.1);
    }

    .nav-item.mobile-only {
      display: none;
    }

    .nav-cta {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .cta-link {
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      color: #718096;
      padding: 8px 12px;
      border-radius: 6px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .cta-link:hover {
      color: #4a5568;
      background: rgba(0, 0, 0, 0.04);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s ease;
      border: none;
      cursor: pointer;
      white-space: nowrap;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    /* Mobile Styles */
    @media (max-width: 960px) {
      .mobile-toggle {
        display: flex;
      }

      .nav-menu {
        position: fixed;
        inset: 72px 0 0 0;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        flex-direction: column;
        align-items: stretch;
        padding: 32px 24px;
        gap: 32px;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-left: 1px solid rgba(0, 0, 0, 0.05);
      }

      .nav-menu.open {
        transform: translateX(0);
      }

      .nav-links {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      .nav-item a,
      .nav-item button {
        font-size: 16px;
        padding: 16px 0;
        text-align: left;
        border-radius: 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }

      .nav-item:last-child a,
      .nav-item:last-child button {
        border-bottom: none;
      }

      .nav-item.mobile-only {
        display: block;
      }

      .nav-cta {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
        padding-top: 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
      }

      .nav-cta .btn {
        width: 100%;
        padding: 16px;
        font-size: 16px;
      }

      .cta-link {
        padding: 12px 0;
        text-align: center;
      }
    }

    @media (max-width: 480px) {
      .nav-container {
        height: 64px;
        padding: 0 16px;
        gap: 16px;
      }

      .brand-mark {
        font-size: 20px;
      }

      .brand-subtitle {
        font-size: 10px;
        letter-spacing: 0.08em;
      }

      .nav-menu {
        inset: 64px 0 0 0;
        padding: 24px 16px;
      }
    }

    /* Authentication Styles */
    .logout-btn {
      text-align: left;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (max-width: 960px) {
      .logout-btn {
        max-width: none;
        overflow: visible;
        text-overflow: clip;
      }
    }

    /* Focus styles for accessibility */
    .nav-item a:focus,
    .nav-item button:focus,
    .btn:focus,
    .mobile-toggle:focus {
      outline: 2px solid #667eea;
      outline-offset: 2px;
    }

    /* Smooth scrolling body offset */
    :host {
      display: block;
      margin-bottom: 72px;
    }

    @media (max-width: 480px) {
      :host {
        margin-bottom: 64px;
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
