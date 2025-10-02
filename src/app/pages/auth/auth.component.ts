import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <!-- Auth Header -->
        <div class="auth-header">
          <h1>Creation Design & Events</h1>
          <p class="auth-subtitle">{{ getAuthTitle() }}</p>
        </div>

        <!-- Auth Tabs -->
        <div class="auth-tabs">
          <button 
            (click)="setActiveTab('login')"
            [class.active]="activeTab() === 'login'"
            class="tab-button">
            Sign In
          </button>
          <button 
            (click)="setActiveTab('register')"
            [class.active]="activeTab() === 'register'"
            class="tab-button">
            Sign Up
          </button>
        </div>

        <!-- Loading State -->
        @if (authService.isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Authenticating...</p>
          </div>
        } @else {
          <!-- Error Message -->
          @if (authService.authError()) {
            <div class="error-message">
              <span class="error-icon">⚠️</span>
              {{ authService.authError() }}
            </div>
          }

          <!-- Success Message -->
          @if (successMessage()) {
            <div class="success-message">
              <span class="success-icon">✅</span>
              {{ successMessage() }}
            </div>
          }

          <!-- Login Form -->
          @if (activeTab() === 'login') {
            <form [formGroup]="loginForm" (ngSubmit)="signIn()" class="auth-form">
              <div class="form-group">
                <label for="loginEmail">Email Address</label>
                <input 
                  id="loginEmail"
                  type="email" 
                  formControlName="email"
                  placeholder="Enter your email"
                  [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                  <span class="field-error">Please enter a valid email address</span>
                }
              </div>

              <div class="form-group">
                <label for="loginPassword">Password</label>
                <div class="password-field">
                  <input 
                    id="loginPassword"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="Enter your password"
                    [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                  <button 
                    type="button"
                    (click)="togglePassword()"
                    class="password-toggle">
                    {{ showPassword() ? '👁️' : '👁️‍🗨️' }}
                  </button>
                </div>
                @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                  <span class="field-error">Password is required</span>
                }
              </div>

              <div class="form-actions">
                <button 
                  type="submit" 
                  [disabled]="loginForm.invalid || isLoading()"
                  class="btn btn-primary">
                  @if (isLoading()) {
                    <span class="btn-spinner"></span>
                    Signing In...
                  } @else {
                    Sign In
                  }
                </button>
              </div>

              <div class="auth-divider">
                <span>or</span>
              </div>

              <button 
                type="button"
                (click)="signInWithGoogle()"
                [disabled]="isLoading()"
                class="btn btn-google">
                <span class="google-icon">🔍</span>
                Continue with Google
              </button>

              <div class="auth-links">
                <button 
                  type="button"
                  (click)="setActiveTab('forgot')"
                  class="link-button">
                  Forgot your password?
                </button>
              </div>
            </form>
          }

          <!-- Registration Form -->
          @if (activeTab() === 'register') {
            <form [formGroup]="registerForm" (ngSubmit)="signUp()" class="auth-form">
              <div class="form-group">
                <label for="registerName">Full Name</label>
                <input 
                  id="registerName"
                  type="text" 
                  formControlName="displayName"
                  placeholder="Enter your full name"
                  [class.error]="registerForm.get('displayName')?.invalid && registerForm.get('displayName')?.touched">
                @if (registerForm.get('displayName')?.invalid && registerForm.get('displayName')?.touched) {
                  <span class="field-error">Full name is required</span>
                }
              </div>

              <div class="form-group">
                <label for="registerEmail">Email Address</label>
                <input 
                  id="registerEmail"
                  type="email" 
                  formControlName="email"
                  placeholder="Enter your email"
                  [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                  <span class="field-error">Please enter a valid email address</span>
                }
              </div>

              <div class="form-group">
                <label for="registerPassword">Password</label>
                <div class="password-field">
                  <input 
                    id="registerPassword"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="Create a password (min 6 characters)"
                    [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                  <button 
                    type="button"
                    (click)="togglePassword()"
                    class="password-toggle">
                    {{ showPassword() ? '👁️' : '👁️‍🗨️' }}
                  </button>
                </div>
                @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                  <span class="field-error">Password must be at least 6 characters</span>
                }
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input 
                  id="confirmPassword"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  placeholder="Confirm your password"
                  [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
                @if (registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched) {
                  <span class="field-error">Passwords must match</span>
                }
              </div>

              <div class="form-actions">
                <button 
                  type="submit" 
                  [disabled]="registerForm.invalid || isLoading()"
                  class="btn btn-primary">
                  @if (isLoading()) {
                    <span class="btn-spinner"></span>
                    Creating Account...
                  } @else {
                    Create Account
                  }
                </button>
              </div>

              <div class="auth-divider">
                <span>or</span>
              </div>

              <button 
                type="button"
                (click)="signInWithGoogle()"
                [disabled]="isLoading()"
                class="btn btn-google">
                <span class="google-icon">🔍</span>
                Sign up with Google
              </button>
            </form>
          }

          <!-- Forgot Password Form -->
          @if (activeTab() === 'forgot') {
            <form [formGroup]="forgotForm" (ngSubmit)="resetPassword()" class="auth-form">
              <div class="forgot-instructions">
                <p>Enter your email address and we'll send you a link to reset your password.</p>
              </div>

              <div class="form-group">
                <label for="forgotEmail">Email Address</label>
                <input 
                  id="forgotEmail"
                  type="email" 
                  formControlName="email"
                  placeholder="Enter your email"
                  [class.error]="forgotForm.get('email')?.invalid && forgotForm.get('email')?.touched">
                @if (forgotForm.get('email')?.invalid && forgotForm.get('email')?.touched) {
                  <span class="field-error">Please enter a valid email address</span>
                }
              </div>

              <div class="form-actions">
                <button 
                  type="submit" 
                  [disabled]="forgotForm.invalid || isLoading()"
                  class="btn btn-primary">
                  @if (isLoading()) {
                    <span class="btn-spinner"></span>
                    Sending Reset Link...
                  } @else {
                    Send Reset Link
                  }
                </button>
              </div>

              <div class="auth-links">
                <button 
                  type="button"
                  (click)="setActiveTab('login')"
                  class="link-button">
                  Back to Sign In
                </button>
              </div>
            </form>
          }
        }

        <!-- Demo Credentials -->
        @if (activeTab() === 'login') {
          <div class="demo-section">
            <h4>Demo Account</h4>
            <p>Use these credentials to test the admin dashboard:</p>
            <div class="demo-credentials">
              <p><strong>Email:</strong> admin@creadevents.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
            <button 
              type="button"
              (click)="fillDemoCredentials()"
              class="btn btn-outline btn-small">
              Use Demo Credentials
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--theme-primary, #7FB069) 0%, var(--theme-secondary, #F7E9E3) 100%);
      padding: 2rem;
    }

    .auth-card {
      background: white;
      padding: 3rem;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      width: 100%;
      max-width: 450px;
      animation: slideUp 0.6s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-header h1 {
      color: var(--theme-primary, #7FB069);
      margin: 0 0 0.5rem 0;
      font-size: 1.8rem;
      font-weight: 700;
    }

    .auth-subtitle {
      color: var(--theme-text-secondary, #636E72);
      margin: 0;
      font-size: 1rem;
    }

    .auth-tabs {
      display: flex;
      margin-bottom: 2rem;
      border-bottom: 1px solid #E9ECEF;
    }

    .tab-button {
      flex: 1;
      padding: 1rem;
      border: none;
      background: transparent;
      cursor: pointer;
      font-weight: 500;
      color: var(--theme-text-secondary, #636E72);
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .tab-button.active {
      color: var(--theme-primary, #7FB069);
      border-bottom-color: var(--theme-primary, #7FB069);
    }

    .tab-button:hover {
      color: var(--theme-primary, #7FB069);
    }

    .loading-state {
      text-align: center;
      padding: 3rem 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid var(--theme-primary, #7FB069);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message, .success-message {
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .error-message {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      color: #B91C1C;
    }

    .success-message {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      color: #166534;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 500;
      color: var(--theme-text, #2D3436);
    }

    .form-group input {
      padding: 0.875rem;
      border: 1.5px solid #E9ECEF;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--theme-primary, #7FB069);
      box-shadow: 0 0 0 3px rgba(127, 176, 105, 0.1);
    }

    .form-group input.error {
      border-color: #DC3545;
    }

    .password-field {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 1.2rem;
    }

    .field-error {
      color: #DC3545;
      font-size: 0.85rem;
    }

    .form-actions {
      margin-top: 0.5rem;
    }

    .btn {
      width: 100%;
      padding: 0.875rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #6FA055;
      transform: translateY(-1px);
    }

    .btn-google {
      background: white;
      color: #333;
      border: 1.5px solid #E9ECEF;
    }

    .btn-google:hover:not(:disabled) {
      background: #F8F9FA;
      border-color: #DDD;
    }

    .btn-outline {
      background: transparent;
      color: var(--theme-primary, #7FB069);
      border: 1.5px solid var(--theme-primary, #7FB069);
    }

    .btn-outline:hover:not(:disabled) {
      background: var(--theme-primary, #7FB069);
      color: white;
    }

    .btn-small {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .google-icon {
      font-size: 1.2rem;
    }

    .auth-divider {
      text-align: center;
      position: relative;
      margin: 1rem 0;
    }

    .auth-divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #E9ECEF;
    }

    .auth-divider span {
      background: white;
      padding: 0 1rem;
      color: var(--theme-text-secondary, #636E72);
      font-size: 0.9rem;
    }

    .auth-links {
      text-align: center;
      margin-top: 1rem;
    }

    .link-button {
      border: none;
      background: transparent;
      color: var(--theme-primary, #7FB069);
      cursor: pointer;
      text-decoration: underline;
      font-size: 0.9rem;
    }

    .link-button:hover {
      color: #6FA055;
    }

    .forgot-instructions {
      text-align: center;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #F8F9FA;
      border-radius: 8px;
    }

    .forgot-instructions p {
      margin: 0;
      color: var(--theme-text-secondary, #636E72);
    }

    .demo-section {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #F8F9FA;
      border-radius: 12px;
      text-align: center;
    }

    .demo-section h4 {
      margin: 0 0 0.5rem 0;
      color: var(--theme-text, #2D3436);
    }

    .demo-section p {
      margin: 0 0 1rem 0;
      color: var(--theme-text-secondary, #636E72);
      font-size: 0.9rem;
    }

    .demo-credentials {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .demo-credentials p {
      margin: 0.25rem 0;
      font-family: monospace;
      font-size: 0.85rem;
    }

    @media (max-width: 480px) {
      .auth-container {
        padding: 1rem;
      }

      .auth-card {
        padding: 2rem;
      }

      .auth-header h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class AuthComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected authService = inject(AuthService);

  // Component state
  activeTab = signal<'login' | 'register' | 'forgot'>('login');
  isLoading = signal(false);
  showPassword = signal(false);
  successMessage = signal<string | null>(null);
  returnUrl = signal<string>('/');

  // Forms
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  forgotForm!: FormGroup;

  // Computed properties
  getAuthTitle = computed(() => {
    switch (this.activeTab()) {
      case 'login': return 'Welcome back! Sign in to your account';
      case 'register': return 'Create your account to get started';
      case 'forgot': return 'Reset your password';
      default: return '';
    }
  });

  constructor() {
    this.initializeForms();
  }

  ngOnInit(): void {
    // Get return URL from query params
    this.returnUrl.set(this.route.snapshot.queryParams['returnUrl'] || '/');

    // If user is already authenticated, redirect
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl()]);
    }
  }

  private initializeForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
    }
    return null;
  }

  setActiveTab(tab: 'login' | 'register' | 'forgot'): void {
    this.activeTab.set(tab);
    this.successMessage.set(null);
    this.authService.authError.set(null);
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  async signIn(): Promise<void> {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      try {
        const { email, password } = this.loginForm.value;
        await this.authService.signInWithEmail(email, password);
        this.router.navigate([this.returnUrl()]);
      } catch (error) {
        console.error('Sign in error:', error);
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  async signUp(): Promise<void> {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      try {
        const { email, password, displayName } = this.registerForm.value;
        await this.authService.signUpWithEmail(email, password, displayName);
        this.successMessage.set('Account created successfully! You can now sign in.');
        this.setActiveTab('login');
        this.loginForm.patchValue({ email });
      } catch (error) {
        console.error('Sign up error:', error);
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  async signInWithGoogle(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.authService.signInWithGoogle();
      this.router.navigate([this.returnUrl()]);
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async resetPassword(): Promise<void> {
    if (this.forgotForm.valid) {
      this.isLoading.set(true);
      try {
        const { email } = this.forgotForm.value;
        await this.authService.resetPassword(email);
        this.successMessage.set('Password reset link sent to your email!');
        this.setActiveTab('login');
      } catch (error) {
        console.error('Password reset error:', error);
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  fillDemoCredentials(): void {
    this.loginForm.patchValue({
      email: 'admin@creadevents.com',
      password: 'admin123'
    });
  }
}