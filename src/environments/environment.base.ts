import type { GeneratedEnvironment } from './environment.types';
import { generatedEnvironment } from './environment.generated';

const fallback: GeneratedEnvironment = {
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  },
  stripe: {
    publishableKey: ''
  },
  recaptcha: {
    siteKey: '',
    enabled: false
  },
  appCheck: {
    provider: 'recaptcha',
    siteKey: ''
  },
  analytics: {
    gaMeasurementId: '',
    gtmContainerId: ''
  },
  app: {
    name: 'Template Commerce',
    url: 'http://localhost:4200',
    brandKey: 'default'
  },
  useEmulators: true
};

const merge = <T extends Record<string, any>>(base: T, override?: Partial<T>): T => ({
  ...base,
  ...(override || {})
});

export const sharedEnvironment = {
  ...fallback,
  ...generatedEnvironment,
  firebase: merge(fallback.firebase, generatedEnvironment.firebase),
  stripe: merge(fallback.stripe, generatedEnvironment.stripe),
  recaptcha: merge(fallback.recaptcha, generatedEnvironment.recaptcha),
  appCheck: merge(fallback.appCheck ?? {}, generatedEnvironment.appCheck),
  analytics: merge(fallback.analytics ?? {}, generatedEnvironment.analytics),
  app: merge(fallback.app, generatedEnvironment.app)
};
