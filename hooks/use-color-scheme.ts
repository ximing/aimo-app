import { useColorScheme as useRNColorScheme, ColorSchemeName } from 'react-native';

/**
 * Normalize ColorSchemeName to 'light' | 'dark'
 * Handles 'unspecified' value from newer React Native versions
 */
function normalizeColorScheme(scheme: ColorSchemeName): 'light' | 'dark' {
  if (scheme === 'unspecified' || scheme === null || scheme === undefined) {
    return 'light';
  }
  return scheme;
}

/**
 * Get the current color scheme, normalized to 'light' | 'dark'
 * This handles the 'unspecified' value from newer React Native versions
 */
export function useColorScheme(): 'light' | 'dark' {
  return normalizeColorScheme(useRNColorScheme());
}
