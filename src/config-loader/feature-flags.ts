import features from './generated/features.json';
import type { FeatureFlags } from './types';

export const featureFlags = features as FeatureFlags;
