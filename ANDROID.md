# Piano Alimentare su Android

Due modi per usare l'app sul telefono.

## 1. Installazione dal browser (nessun APK, funziona subito)

1. Apri l'app pubblicata in Chrome su Android.
2. Menu (⋮) → **Installa app** / **Aggiungi a schermata Home**.
3. L'app si apre a schermo intero con la sua icona, senza barra del browser.

Nota: l'app richiede connessione (i dati del piano restano salvati sul dispositivo).

## 2. Generare un vero file .apk (build in locale)

La compilazione Android non può girare su Lovable: serve Android Studio sul tuo
computer. Il progetto contiene già `capacitor.config.ts` pronto all'uso.

### Prerequisiti

- Node.js 20+
- Android Studio + Android SDK (API 34+)
- JDK 17

### Passi

```bash
# 1. Esporta il progetto su GitHub da Lovable e clonalo
git clone <url-del-tuo-repo> && cd <repo>
npm install

# 2. Installa Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 3. Verifica l'URL pubblicato in capacitor.config.ts (campo server.url)

# 4. Aggiungi la piattaforma Android
npx cap add android
npx cap sync android

# 5. Apri in Android Studio
npx cap open android
```

### Build dell'APK

Da terminale, nella cartella `android/`:

```bash
# APK di debug (installabile subito su un telefono in modalità sviluppatore)
./gradlew assembleDebug
# output: android/app/build/outputs/apk/debug/app-debug.apk

# APK di release (richiede una firma)
./gradlew assembleRelease
```

Per la release serve un keystore:

```bash
keytool -genkey -v -keystore piano-alimentare.keystore \
  -alias piano -keyalg RSA -keysize 2048 -validity 10000
```

Poi configura la firma in `android/app/build.gradle` (blocco `signingConfigs`)
oppure usa **Build → Generate Signed Bundle / APK** in Android Studio.

### Icona dell'app

Le icone sono in `public/icon-512.png`. In Android Studio: click destro su
`res` → **New → Image Asset** e usa quel file come sorgente.

## 3. Google Play

Per pubblicare sul Play Store serve un **AAB** invece dell'APK:

```bash
./gradlew bundleRelease
# output: android/app/build/outputs/bundle/release/app-release.aab
```
