import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsService, Notification } from '../../services/cms.service';

@Component({
  standalone: true,
  selector: 'app-notifications',
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      @for (notification of cmsService.notifications(); track notification.id) {
        <div 
          class="notification"
          [class]="'notification--' + notification.level"
          [@slideIn]>
          <div class="notification__content">
            <span class="notification__message">{{ notification.message }}</span>
            <button 
              class="notification__close"
              (click)="cmsService.dismissNotification(notification.id)"
              aria-label="Dismiss notification">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="notification__progress"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 10001;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
      pointer-events: none;
    }
    
    .notification {
      pointer-events: auto;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(0, 0, 0, 0.1);
      animation: slideIn 0.4s ease-out;
      position: relative;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
    
    .notification__content {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1rem;
      gap: 0.75rem;
    }
    
    .notification__message {
      flex: 1;
      font-size: 0.9rem;
      line-height: 1.4;
      color: #1f2937;
    }
    
    .notification__close {
      flex-shrink: 0;
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 6px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .notification__close:hover {
      background: rgba(0, 0, 0, 0.1);
      color: #374151;
    }
    
    .notification__progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: currentColor;
      width: 100%;
      animation: progress 5s linear;
      opacity: 0.3;
    }
    
    @keyframes progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }
    
    /* Notification level styles */
    .notification--success {
      border-color: rgba(34, 197, 94, 0.3);
      color: #16a34a;
    }
    
    .notification--success .notification__progress {
      background: #16a34a;
    }
    
    .notification--error {
      border-color: rgba(239, 68, 68, 0.3);
      color: #dc2626;
    }
    
    .notification--error .notification__progress {
      background: #dc2626;
    }
    
    .notification--warning {
      border-color: rgba(245, 158, 11, 0.3);
      color: #d97706;
    }
    
    .notification--warning .notification__progress {
      background: #d97706;
    }
    
    .notification--info {
      border-color: rgba(59, 130, 246, 0.3);
      color: #2563eb;
    }
    
    .notification--info .notification__progress {
      background: #2563eb;
    }
    
    @media (max-width: 768px) {
      .notifications-container {
        top: 16px;
        right: 16px;
        left: 16px;
        max-width: none;
      }
      
      .notification__content {
        padding: 0.875rem;
      }
      
      .notification__message {
        font-size: 0.85rem;
      }
    }
  `]
})
export class NotificationsComponent {
  cmsService = inject(CmsService);
}