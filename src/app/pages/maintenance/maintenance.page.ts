import { Component, OnInit, inject, PLATFORM_ID, Optional, Inject } from '@angular/core';
import { CommonModule, isPlatformServer } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { RESPONSE } from './maintenance.tokens';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maintenance.page.html',
  styleUrls: ['./maintenance.page.scss']
})
export class MaintenancePage implements OnInit {
  private meta = inject(Meta);
  private title = inject(Title);
  private platformId = inject(PLATFORM_ID);
  
  // Expected return time (in hours from now)
  expectedReturnTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  retryAfterSeconds = 7200; // 2 hours in seconds

  constructor(
    @Optional() @Inject(RESPONSE) private response: any
  ) {}

  ngOnInit() {
    // Set page title
    this.title.setTitle('Site Maintenance - TheLuxMining');
    
    // Add noindex meta tag to prevent indexing during maintenance
    this.meta.addTags([
      { name: 'robots', content: 'noindex, nofollow' },
      { name: 'description', content: 'TheLuxMining is currently undergoing scheduled maintenance. We will be back online shortly.' }
    ]);

    // Set 503 status code for server-side rendering
    if (isPlatformServer(this.platformId) && this.response) {
      try {
        this.response.status(503);
        this.response.setHeader('Retry-After', this.retryAfterSeconds.toString());
        this.response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } catch (error) {
        console.error('Error setting response headers:', error);
      }
    }
  }

  get formattedReturnTime(): string {
    return this.expectedReturnTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }
}
