import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  getDocs,
  query,
  QueryDocumentSnapshot,
  Firestore 
} from 'firebase/firestore';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

// Use environment configuration
const firebaseConfig = environment.firebase;

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  role: 'admin' | 'editor' | 'user';
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
  permissions: {
    // Content Management
    canManageContent: boolean;
    canManageProjects: boolean;
    canManageServices: boolean;
    canManageBlog: boolean;
    canManageTestimonials: boolean;
    
    // User Management
    canManageUsers: boolean;
    canViewUsers: boolean;
    
    // System Access
    canViewAnalytics: boolean;
    canUploadFiles: boolean;
    canManageFiles: boolean;
    
    // Advanced Features
    canManageSeasonalThemes: boolean;
    canAccessAdminPanel: boolean;
    canExportData: boolean;
  };
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'editor' | 'user';
  permissions: UserProfile['permissions'];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private app = initializeApp(firebaseConfig);
  private auth: Auth = getAuth(this.app);
  private firestore: Firestore = getFirestore(this.app);
  private googleProvider = new GoogleAuthProvider();

  // Auth state signals
  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  currentUser = signal<AuthUser | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());
  isLoading = signal(true);
  authError = signal<string | null>(null);

  // User permissions - General
  canManageContent = computed(() => 
    this.currentUser()?.permissions.canManageContent ?? false
  );
  canManageUsers = computed(() => 
    this.currentUser()?.permissions.canManageUsers ?? false
  );
  canViewAnalytics = computed(() => 
    this.currentUser()?.permissions.canViewAnalytics ?? false
  );
  canUploadFiles = computed(() => 
    this.currentUser()?.permissions.canUploadFiles ?? false
  );

  // Content-specific permissions
  canManageProjects = computed(() => 
    this.currentUser()?.permissions.canManageProjects ?? false
  );
  canManageServices = computed(() => 
    this.currentUser()?.permissions.canManageServices ?? false
  );
  canManageBlog = computed(() => 
    this.currentUser()?.permissions.canManageBlog ?? false
  );
  canManageTestimonials = computed(() => 
    this.currentUser()?.permissions.canManageTestimonials ?? false
  );

  // Advanced permissions
  canViewUsers = computed(() => 
    this.currentUser()?.permissions.canViewUsers ?? false
  );
  canManageFiles = computed(() => 
    this.currentUser()?.permissions.canManageFiles ?? false
  );
  canManageSeasonalThemes = computed(() => 
    this.currentUser()?.permissions.canManageSeasonalThemes ?? false
  );
  canAccessAdminPanel = computed(() => 
    this.currentUser()?.permissions.canAccessAdminPanel ?? false
  );
  canExportData = computed(() => 
    this.currentUser()?.permissions.canExportData ?? false
  );

  // Role checks
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  isEditor = computed(() => this.currentUser()?.role === 'editor');

  constructor() {
    this.initializeAuthListener();
  }

  private initializeAuthListener(): void {
    onAuthStateChanged(this.auth, async (user: User | null) => {
      this.isLoading.set(true);
      
      if (user) {
        try {
          const userProfile = await this.getUserProfile(user.uid);
          const authUser: AuthUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: userProfile?.role || 'user',
            permissions: userProfile?.permissions || this.getDefaultPermissions('user')
          };
          
          this.currentUser.set(authUser);
          this.userSubject.next(authUser);
          
          // Update last login time
          if (userProfile) {
            await this.updateLastLogin(user.uid);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          this.currentUser.set(null);
          this.userSubject.next(null);
        }
      } else {
        this.currentUser.set(null);
        this.userSubject.next(null);
      }
      
      this.isLoading.set(false);
    });
  }

  // Email/Password Authentication
  async signInWithEmail(email: string, password: string): Promise<void> {
    try {
      this.authError.set(null);
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      
      // Check if user profile exists, create one if not
      const userProfile = await this.getUserProfile(userCredential.user.uid);
      if (!userProfile) {
        await this.createUserProfile(userCredential.user, 'user');
      }
    } catch (error: any) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async signUpWithEmail(email: string, password: string, displayName: string): Promise<void> {
    try {
      this.authError.set(null);
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Update display name
      await updateProfile(userCredential.user, { displayName });
      
      // Create user profile
      await this.createUserProfile(userCredential.user, 'user', displayName);
    } catch (error: any) {
      this.handleAuthError(error);
      throw error;
    }
  }

  // Google Authentication
  async signInWithGoogle(): Promise<void> {
    try {
      this.authError.set(null);
      const userCredential = await signInWithPopup(this.auth, this.googleProvider);
      
      // Check if user profile exists, create one if not
      const userProfile = await this.getUserProfile(userCredential.user.uid);
      if (!userProfile) {
        await this.createUserProfile(userCredential.user, 'user');
      }
    } catch (error: any) {
      this.handleAuthError(error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Password reset
  async resetPassword(email: string): Promise<void> {
    try {
      this.authError.set(null);
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      this.handleAuthError(error);
      throw error;
    }
  }

  // User profile management
  private async createUserProfile(
    user: User, 
    role: 'admin' | 'editor' | 'user',
    displayName?: string
  ): Promise<void> {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: displayName || user.displayName || '',
      photoURL: user.photoURL || null,
      role,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true,
      permissions: this.getDefaultPermissions(role)
    };

    await setDoc(doc(this.firestore, 'users', user.uid), userProfile);
  }

  private async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(this.firestore, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data['createdAt'].toDate(),
          lastLoginAt: data['lastLoginAt'].toDate()
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'users', uid);
      await updateDoc(docRef, {
        lastLoginAt: new Date()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  // Permission management
  private getDefaultPermissions(role: 'admin' | 'editor' | 'user'): UserProfile['permissions'] {
    switch (role) {
      case 'admin':
        return {
          // Content Management - Full Access
          canManageContent: true,
          canManageProjects: true,
          canManageServices: true,
          canManageBlog: true,
          canManageTestimonials: true,
          
          // User Management - Full Access
          canManageUsers: true,
          canViewUsers: true,
          
          // System Access - Full Access
          canViewAnalytics: true,
          canUploadFiles: true,
          canManageFiles: true,
          
          // Advanced Features - Full Access
          canManageSeasonalThemes: true,
          canAccessAdminPanel: true,
          canExportData: true
        };
      case 'editor':
        return {
          // Content Management - Full Access
          canManageContent: true,
          canManageProjects: true,
          canManageServices: true,
          canManageBlog: true,
          canManageTestimonials: true,
          
          // User Management - View Only
          canManageUsers: false,
          canViewUsers: true,
          
          // System Access - Limited
          canViewAnalytics: true,
          canUploadFiles: true,
          canManageFiles: false,
          
          // Advanced Features - Limited
          canManageSeasonalThemes: false,
          canAccessAdminPanel: true,
          canExportData: false
        };
      case 'user':
      default:
        return {
          // Content Management - No Access
          canManageContent: false,
          canManageProjects: false,
          canManageServices: false,
          canManageBlog: false,
          canManageTestimonials: false,
          
          // User Management - No Access
          canManageUsers: false,
          canViewUsers: false,
          
          // System Access - No Access
          canViewAnalytics: false,
          canUploadFiles: false,
          canManageFiles: false,
          
          // Advanced Features - No Access
          canManageSeasonalThemes: false,
          canAccessAdminPanel: false,
          canExportData: false
        };
    }
  }

  // Admin functions
  async updateUserRole(uid: string, role: 'admin' | 'editor' | 'user'): Promise<void> {
    if (!this.isAdmin()) {
      throw new Error('Insufficient permissions');
    }

    try {
      const docRef = doc(this.firestore, 'users', uid);
      await updateDoc(docRef, {
        role,
        permissions: this.getDefaultPermissions(role)
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<UserProfile[]> {
    if (!this.canManageUsers()) {
      throw new Error('Insufficient permissions');
    }

    try {
      const usersRef = collection(this.firestore, 'users');
      const querySnapshot = await getDocs(usersRef);
      const users: UserProfile[] = [];
      
      querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        users.push({
          ...data,
          createdAt: data['createdAt'].toDate(),
          lastLoginAt: data['lastLoginAt'].toDate()
        } as UserProfile);
      });
      
      return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Route guards
  canActivateAdmin(): boolean {
    return this.isAdmin();
  }

  canActivateEditor(): boolean {
    return this.isAdmin() || this.isEditor();
  }

  canActivateUser(): boolean {
    return this.isAuthenticated();
  }

  // Error handling
  private handleAuthError(error: any): void {
    let errorMessage = 'An error occurred during authentication';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in popup was closed';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }
    
    this.authError.set(errorMessage);
  }

  // Observable streams for components that need them
  get user$(): Observable<AuthUser | null> {
    return this.userSubject.asObservable();
  }

  // Utility methods
  getCurrentUser(): AuthUser | null {
    return this.currentUser();
  }

  getUserId(): string | null {
    return this.currentUser()?.uid || null;
  }

  getUserEmail(): string | null {
    return this.currentUser()?.email || null;
  }

  getUserRole(): string | null {
    return this.currentUser()?.role || null;
  }

  // Admin setup utility - Use in browser console: window.makeAdmin()
  async makeCurrentUserAdmin(): Promise<void> {
    const user = this.currentUser();
    if (!user) {
      throw new Error('No user is currently logged in');
    }

    try {
      const docRef = doc(this.firestore, 'users', user.uid);
      await updateDoc(docRef, {
        role: 'admin',
        permissions: this.getDefaultPermissions('admin'),
        updatedAt: new Date()
      });
      
      // Refresh user data
      await this.refreshUserData();
      console.log('✅ Successfully promoted to admin!');
    } catch (error) {
      console.error('❌ Error promoting to admin:', error);
      throw error;
    }
  }

  // Utility to refresh current user data
  private async refreshUserData(): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      const userProfile = await this.getUserProfile(user.uid);
      if (userProfile) {
        this.currentUser.set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: userProfile.role,
          permissions: userProfile.permissions
        });
      }
    }
  }
}