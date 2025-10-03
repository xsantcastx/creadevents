import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth-debug',
  imports: [CommonModule],
  template: `
    <div class="auth-debug" style="padding: 20px; background: #f5f5f5; margin: 20px; border-radius: 8px;">
      <h3>🔍 Authentication Debug Info</h3>
      
      <div class="debug-section">
        <h4>Authentication State:</h4>
        <p><strong>Is Authenticated:</strong> {{ authService.isAuthenticated() ? '✅ Yes' : '❌ No' }}</p>
        <p><strong>Is Loading:</strong> {{ authService.isLoading() ? 'Yes' : 'No' }}</p>
        <p><strong>Auth Error:</strong> {{ authService.authError() || 'None' }}</p>
      </div>

      <div class="debug-section" *ngIf="authService.isAuthenticated()">
        <h4>Current User:</h4>
        <p><strong>UID:</strong> {{ authService.currentUser()?.uid }}</p>
        <p><strong>Email:</strong> {{ authService.currentUser()?.email }}</p>
        <p><strong>Display Name:</strong> {{ authService.currentUser()?.displayName }}</p>
        <p><strong>Role:</strong> {{ authService.currentUser()?.role }}</p>
      </div>

      <div class="debug-section" *ngIf="authService.isAuthenticated()">
        <h4>Role Checks:</h4>
        <p><strong>Is Admin:</strong> {{ authService.isAdmin() ? '✅ Yes' : '❌ No' }}</p>
        <p><strong>Is Editor:</strong> {{ authService.isEditor() ? '✅ Yes' : '❌ No' }}</p>
        <p><strong>Can Access Admin Panel:</strong> {{ authService.canAccessAdminPanel() ? '✅ Yes' : '❌ No' }}</p>
      </div>

      <div class="debug-section" *ngIf="authService.isAuthenticated()">
        <h4>Permissions:</h4>
        <div *ngIf="authService.currentUser()?.permissions">
          <p><strong>Can Manage Content:</strong> {{ authService.currentUser()?.permissions?.canManageContent ? '✅' : '❌' }}</p>
          <p><strong>Can Manage Users:</strong> {{ authService.currentUser()?.permissions?.canManageUsers ? '✅' : '❌' }}</p>
          <p><strong>Can Access Admin Panel:</strong> {{ authService.currentUser()?.permissions?.canAccessAdminPanel ? '✅' : '❌' }}</p>
          <p><strong>Can Manage Files:</strong> {{ authService.currentUser()?.permissions?.canManageFiles ? '✅' : '❌' }}</p>
        </div>
      </div>

      <div class="debug-section">
        <h4>Actions:</h4>
        <button (click)="refreshAuth()" style="margin-right: 10px; padding: 8px 16px;">
          🔄 Refresh Auth State
        </button>
        <button (click)="logout()" style="padding: 8px 16px;">
          🚪 Logout
        </button>
      </div>

      <div class="debug-section">
        <h4>Troubleshooting:</h4>
        <div *ngIf="!authService.isAuthenticated()">
          <p>❌ You are not authenticated. Please <a href="/auth/login">login</a> first.</p>
        </div>
        <div *ngIf="authService.isAuthenticated() && !authService.isAdmin()">
          <p>⚠️ You are authenticated but not an admin.</p>
          <p>Your role: <strong>{{ authService.currentUser()?.role }}</strong></p>
          <p>If you should be an admin, your Firestore user document needs to be updated.</p>
        </div>
        <div *ngIf="authService.isAdmin()">
          <p>✅ You have admin access! If you're still getting permission errors, try refreshing the page.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .debug-section {
      margin-bottom: 20px;
      padding: 15px;
      background: white;
      border-radius: 4px;
      border-left: 4px solid #007bff;
    }
    
    .debug-section h4 {
      margin-top: 0;
      color: #333;
    }
    
    .debug-section p {
      margin: 8px 0;
      font-family: monospace;
    }
    
    button {
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button:hover {
      background: #0056b3;
    }
  `]
})
export class AuthDebugComponent {
  authService = inject(AuthService);

  refreshAuth() {
    window.location.reload();
  }

  logout() {
    this.authService.signOut();
  }
}