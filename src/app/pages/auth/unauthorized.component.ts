import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  imports: [CommonModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <div class="error-illustration">
          <div class="lock-icon">🔒</div>
          <div class="error-code">403</div>
        </div>
        
        <div class="error-message">
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page. Contact your administrator if you believe this is an error.</p>
        </div>
        
        <div class="error-actions">
          <button (click)="goHome()" class="btn btn-primary">
            Go to Homepage
          </button>
          <button (click)="goBack()" class="btn btn-outline">
            Go Back
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem;
    }

    .unauthorized-content {
      text-align: center;
      max-width: 500px;
      background: white;
      padding: 3rem;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
    }

    .error-illustration {
      margin-bottom: 2rem;
    }

    .lock-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.7;
    }

    .error-code {
      font-size: 6rem;
      font-weight: bold;
      color: #dc3545;
      line-height: 1;
      margin-bottom: 1rem;
    }

    .error-message h1 {
      color: #2d3436;
      margin: 0 0 1rem 0;
      font-size: 2rem;
    }

    .error-message p {
      color: #636e72;
      margin: 0 0 2rem 0;
      line-height: 1.6;
    }

    .error-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.875rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .btn-primary:hover {
      background: #6FA055;
      transform: translateY(-1px);
    }

    .btn-outline {
      background: transparent;
      color: var(--theme-primary, #7FB069);
      border: 2px solid var(--theme-primary, #7FB069);
    }

    .btn-outline:hover {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    @media (max-width: 480px) {
      .unauthorized-container {
        padding: 1rem;
      }

      .unauthorized-content {
        padding: 2rem;
      }

      .error-code {
        font-size: 4rem;
      }

      .error-message h1 {
        font-size: 1.5rem;
      }

      .error-actions {
        flex-direction: column;
      }
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }
}