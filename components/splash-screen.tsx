import { useEffect, useState } from "react";
import { Appearance, ColorSchemeName, View, Text, StyleSheet, Image } from "react-native";

/**
 * Normalize ColorSchemeName to 'light' | 'dark'
 * Handles 'unspecified' value from newer React Native versions
 */
function normalizeColorScheme(scheme: ColorSchemeName | null | undefined): 'light' | 'dark' {
  if (scheme === 'unspecified' || scheme === null || scheme === undefined) {
    return 'light';
  }
  return scheme;
}
import { useColorScheme } from "@/hooks/use-color-scheme";

export function SplashScreen() {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(
    normalizeColorScheme(Appearance.getColorScheme())
  );

  useEffect(() => {
    // 监听系统主题变化
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(normalizeColorScheme(colorScheme));
    });
    return () => subscription.remove();
  }, []);

  const isDark = colorScheme === "dark";
  const backgroundColor = isDark ? "#000000" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";
  const secondaryTextColor = isDark ? "#9ca3af" : "#6b7280";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.logoContainer}>
        <Image
          source={
            isDark
              ? require("@/assets/logo-dark.png")
              : require("@/assets/logo.png")
          }
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.appName, { color: textColor }]}>AIMO</Text>
        <Text style={[styles.tagline, { color: secondaryTextColor }]}>
          Capture every moment
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 160,
    height: 160,
  },
  textContainer: {
    alignItems: "center",
    marginTop: -20,
  },
  appName: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: 8,
  },
  tagline: {
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 1,
  },
});
