import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor wrapper for the Android build.
 *
 * The app is a server-rendered web app, so the Android shell loads the
 * published Lovable URL instead of a static bundle. Replace `server.url`
 * with your published domain before building the APK.
 */
const config: CapacitorConfig = {
  appId: "app.lovable.pianoalimentare",
  appName: "Piano Alimentare",
  webDir: "android-shell",
  server: {
    url: "https://pianonutrizionale.lovable.app",
    cleartext: false,
  },
  android: {
    backgroundColor: "#faf7ef",
  },
};

export default config;
