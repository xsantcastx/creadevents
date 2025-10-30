import { InjectionToken } from '@angular/core';

// Custom token for Express Response (used in SSR)
export const RESPONSE = new InjectionToken<any>('RESPONSE');
