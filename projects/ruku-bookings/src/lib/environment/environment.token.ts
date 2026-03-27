import { InjectionToken } from '@angular/core';

export interface LibEnvironment {
  production: boolean;
  apiBaseUrl: string;
  googleClientId: string;
  githubClientId: string;
  githubRedirectUri: string;
}

export const LIB_ENVIRONMENT = new InjectionToken<LibEnvironment>('LIB_ENVIRONMENT');
