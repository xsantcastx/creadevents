import { Component, HostListener, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BrandConfigService } from '../../services/brand-config.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private translate = inject(TranslateService);
  private brandConfig = inject(BrandConfigService);
  scrolled = false;
  mobileMenuOpen = false;
  private destroy$ = new Subject<void>();
  readonly brandName = this.brandConfig.siteName;
  readonly headerLinks = this.brandConfig.nav.header;
  readonly exactMatchOption = { exact: true };
  readonly partialMatchOption = { exact: false };

  constructor() {}

  ngOnInit() {
    // Removed legacy ceramic tile product loading
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.scrolled = window.pageYOffset > 50;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
