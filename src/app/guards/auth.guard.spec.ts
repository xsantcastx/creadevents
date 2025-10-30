import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { firstValueFrom, isObservable, Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { authGuard } from './auth.guard';
import { AuthService, UserProfile } from '../services/auth.service';
import { AppSettings, SettingsService } from '../services/settings.service';

describe('authGuard', () => {
  let router: Router;
  let mockAuth: any;
  let mockSettingsService: jasmine.SpyObj<SettingsService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const createState = (url: string) => ({ url } as any);
  const loginUrl = '/client/login';

  const resolveGuard = async (guardResult: any): Promise<boolean | UrlTree> => {
    if (isObservable(guardResult)) {
      return firstValueFrom(guardResult as Observable<boolean | UrlTree>);
    }
    if (guardResult instanceof Promise) {
      return guardResult;
    }
    return guardResult;
  };

  beforeEach(() => {
    mockAuth = {
      currentUser: null as any,
      authStateReady: jasmine.createSpy('authStateReady').and.returnValue(Promise.resolve())
    };

    mockSettingsService = jasmine.createSpyObj<SettingsService>('SettingsService', ['getSettings']);
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['getUserProfile', 'signOutUser']);
    mockAuthService.signOutUser.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    router = TestBed.inject(Router);
  });

  const setAuthenticatedUser = (overrides: Partial<UserProfile> = {}) => {
    mockAuth.currentUser = {
      uid: 'test-user',
      email: 'test@example.com'
    };

    const profile: UserProfile = {
      uid: 'test-user',
      email: 'test@example.com',
      role: 'client',
      createdAt: new Date(),
      ...overrides
    };

    mockSettingsService.getSettings.and.returnValue(Promise.resolve({ sessionTimeout: 120 } as AppSettings));
    mockAuthService.getUserProfile.and.returnValue(Promise.resolve(profile));
  };

  it('allows navigation when user session is valid', async () => {
    setAuthenticatedUser({ lastLogin: new Date() });

    const guard$ = TestBed.runInInjectionContext(() =>
      authGuard({} as any, createState('/secure'))
    );
    const result = await resolveGuard(guard$);

    expect(result).toBeTrue();
    expect(mockAuthService.signOutUser).not.toHaveBeenCalled();
  });

  it('redirects to login when no user is present', async () => {
    mockAuth.currentUser = null;

    const guard$ = TestBed.runInInjectionContext(() =>
      authGuard({} as any, createState('/secure'))
    );
    const result = await resolveGuard(guard$);

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toContain(loginUrl);
  });

  it('redirects to login with sessionExpired flag when session timed out', async () => {
    const staleLogin = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
    setAuthenticatedUser({ lastLogin: staleLogin });
    mockSettingsService.getSettings.and.returnValue(Promise.resolve({ sessionTimeout: 60 } as AppSettings));

    const guard$ = TestBed.runInInjectionContext(() =>
      authGuard({} as any, createState('/secure'))
    );
    const result = await resolveGuard(guard$);

    expect(mockAuthService.signOutUser).toHaveBeenCalled();
    expect(result instanceof UrlTree).toBeTrue();
    const serialized = router.serializeUrl(result as UrlTree);
    expect(serialized).toContain(loginUrl);
    expect(serialized).toContain('sessionExpired=true');
  });

  it('forces logout when profile is missing', async () => {
    mockAuth.currentUser = { uid: 'ghost' };
    mockSettingsService.getSettings.and.returnValue(Promise.resolve({ sessionTimeout: 0 } as AppSettings));
    mockAuthService.getUserProfile.and.returnValue(Promise.resolve(null));

    const guard$ = TestBed.runInInjectionContext(() =>
      authGuard({} as any, createState('/secure'))
    );
    const result = await resolveGuard(guard$);

    expect(mockAuthService.signOutUser).toHaveBeenCalled();
    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toContain(loginUrl);
  });
});
