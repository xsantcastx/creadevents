import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminModeService } from '../../services/admin-mode.service';

@Component({
  standalone: true,
  selector: 'app-admin-toolbar',
  imports: [CommonModule, RouterLink],
  template: `
  @if (svc.authed()) {
    <div class="admin-toolbar" [@slideIn]>
      <div class="toolbar-content">
        <!-- Status indicator -->
        <div class="status-indicator" [class.active]="svc.on()">
          <div class="status-dot"></div>
          <span class="status-text">{{ svc.on() ? 'Admin Mode' : 'View Mode' }}</span>
        </div>
        
        <!-- Toggle button -->
        <button 
          class="mode-toggle" 
          [class.active]="svc.on()"
          (click)="svc.toggle()"
          [attr.aria-label]="svc.on() ? 'Disable admin mode' : 'Enable admin mode'">
          @if (!svc.on()) {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1v6m0 6v6m6-12h-6m6 6h-6M6 7h6m-6 6h6"/>
            </svg>
          } @else {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          }
          {{ svc.on() ? 'Exit' : 'Edit' }}
        </button>
        
        <!-- Quick links when admin mode is on -->
        @if (svc.on()) {
          <div class="quick-links">
            <a routerLink="/admin" class="quick-link" title="Admin Dashboard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="9" x2="9" y2="15"/>
                <line x1="15" y1="9" x2="15" y2="15"/>
              </svg>
            </a>
            <a routerLink="/admin/slots" class="quick-link" title="Manage Slots">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="12" cy="12" r="1"/>
              </svg>
            </a>
            <a routerLink="/admin/images" class="quick-link" title="Manage Images">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
            </a>
          </div>
        }
        
        <!-- Help text -->
        @if (!svc.on()) {
          <div class="help-text">
            Add <code>?admin=1</code> to URL or click Edit to enable admin mode
          </div>
        }
      </div>
    </div>
  }
  `,
  styles: [`
    .admin-toolbar {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      max-width: 320px;
      animation: slideIn 0.4s ease-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .toolbar-content {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(94, 138, 117, 0.2);
      border-radius: 16px;
      padding: 1rem;
      box-shadow: 0 20px 60px rgba(94, 138, 117, 0.15);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-width: 280px;
    }
    
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: rgba(94, 138, 117, 0.1);
      border-radius: 12px;
      transition: all 0.3s ease;
    }
    
    .status-indicator.active {
      background: rgba(94, 138, 117, 0.15);
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #94a3b8;
      transition: all 0.3s ease;
    }
    
    .status-indicator.active .status-dot {
      background: #5e8a75;
      box-shadow: 0 0 8px rgba(94, 138, 117, 0.4);
    }
    
    .status-text {
      font-size: 0.85rem;
      font-weight: 500;
      color: #475569;
    }
    
    .status-indicator.active .status-text {
      color: #5e8a75;
    }
    
    .mode-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: #5e8a75;
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(94, 138, 117, 0.3);
    }
    
    .mode-toggle:hover {
      background: #4a6b56;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(94, 138, 117, 0.4);
    }
    
    .mode-toggle.active {
      background: #dc2626;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    }
    
    .mode-toggle.active:hover {
      background: #b91c1c;
      box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
    }
    
    .quick-links {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }
    
    .quick-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: rgba(94, 138, 117, 0.1);
      border-radius: 10px;
      color: #5e8a75;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    
    .quick-link:hover {
      background: rgba(94, 138, 117, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(94, 138, 117, 0.2);
    }
    
    .help-text {
      font-size: 0.75rem;
      color: #64748b;
      text-align: center;
      line-height: 1.4;
      padding: 0.5rem;
      background: rgba(94, 138, 117, 0.05);
      border-radius: 8px;
    }
    
    .help-text code {
      background: rgba(94, 138, 117, 0.15);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.7rem;
      color: #5e8a75;
      font-weight: 500;
    }
    
    @media (max-width: 768px) {
      .admin-toolbar {
        bottom: 16px;
        right: 16px;
        left: 16px;
        max-width: none;
      }
      
      .toolbar-content {
        min-width: auto;
      }
      
      .help-text {
        font-size: 0.7rem;
      }
    }
  `]
})
export class AdminToolbarComponent {
  constructor(public svc: AdminModeService) {}
}