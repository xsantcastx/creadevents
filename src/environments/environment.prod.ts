import { sharedEnvironment } from './environment.base';

export const environment = {
  ...sharedEnvironment,
  production: true,
  useEmulators: false
};
