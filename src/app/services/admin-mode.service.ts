import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminModeService {
  private platformId = inject(PLATFORM_ID);
  private app = getApps().length ? getApp() : initializeApp(environment.firebase);
  private auth = getAuth(this.app);

  readonly on = signal<boolean>(false);
  readonly authed = signal<boolean>(false);

  readonly canEdit = computed(() => this.on() && this.authed());

  constructor() {
    // Only access browser APIs if we're in the browser
    if (isPlatformBrowser(this.platformId)) {
      // seed from URL (?admin=1) or localStorage
      const params = new URLSearchParams(window.location.search);
      const q = params.get('admin');
      if (q === '1') localStorage.setItem('adminMode', '1');
      if (q === '0') localStorage.removeItem('adminMode');

      this.on.set(localStorage.getItem('adminMode') === '1');
    }

    onAuthStateChanged(this.auth, (u) => this.authed.set(!!u));
  }

  toggle() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const next = !this.on();
    this.on.set(next);
    if (next) localStorage.setItem('adminMode', '1'); else localStorage.removeItem('adminMode');
  }
}