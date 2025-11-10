export interface GeneratedEnvironment {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  stripe: {
    publishableKey: string;
  };
  recaptcha: {
    siteKey: string;
    enabled?: boolean;
  };
  appCheck?: {
    provider: string;
    siteKey?: string;
  };
  analytics?: {
    gaMeasurementId?: string;
    gtmContainerId?: string;
  };
  app: {
    name: string;
    url: string;
    brandKey: string;
  };
  useEmulators?: boolean;
}
