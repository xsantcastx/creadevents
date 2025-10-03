import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminModeService } from '../../services/admin-mode.service';

@Component({
  selector: 'app-site-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.css']
})
export class SiteHeaderComponent {
  open = signal(false);
  
  constructor(public admin: AdminModeService) {}
  
  toggle() { 
    this.open.set(!this.open()); 
  }
  
  close() { 
    this.open.set(false); 
  }
}